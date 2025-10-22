const express = require('express');
const router = express.Router();
const spotifyService = require('../services/spotifyService');

/**
 * Initiates Spotify OAuth flow
 * Redirects user to Spotify authorization page
 */
router.get('/login', (req, res) => {
  const scopes = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-read-playback-state',
    'user-modify-playback-state',
    'playlist-read-private',
    'playlist-read-collaborative',
  ];

  const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: scopes.join(' '),
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    show_dialog: true,
  })}`;

  res.redirect(authUrl);
});

/**
 * Spotify OAuth callback
 * Exchanges authorization code for access and refresh tokens
 */
router.get('/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    console.error('Spotify auth error:', error);
    return res.redirect(`${process.env.CLIENT_URL}/?error=auth_failed`);
  }

  if (!code) {
    return res.redirect(`${process.env.CLIENT_URL}/?error=no_code`);
  }

  try {
    const tokenData = await spotifyService.exchangeCodeForTokens(code);

    // Add timestamp for expiration tracking
    const tokenDataWithTimestamp = {
      ...tokenData,
      issued_at: Date.now(),
    };

    // Store tokens in httpOnly cookie for security (backward compatibility)
    res.cookie('spotify_auth', JSON.stringify(tokenDataWithTimestamp), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000, // 1 hour
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    console.log('Tokens stored with expiration tracking');

    // Also send tokens in URL for mobile Safari compatibility (it blocks cross-origin cookies)
    const authParams = new URLSearchParams({
      access_token: tokenDataWithTimestamp.access_token,
      refresh_token: tokenDataWithTimestamp.refresh_token,
      expires_in: tokenDataWithTimestamp.expires_in.toString(),
      token_type: tokenDataWithTimestamp.token_type,
    });

    // Redirect back to client with success and token data
    res.redirect(`${process.env.CLIENT_URL}/lobby?host=true&${authParams.toString()}`);
  } catch (error) {
    console.error('Token exchange error:', error);
    res.redirect(`${process.env.CLIENT_URL}/?error=token_exchange_failed`);
  }
});

/**
 * Refreshes the access token using the refresh token
 */
router.post('/refresh', async (req, res) => {
  try {
    const authCookie = req.cookies.spotify_auth;

    if (!authCookie) {
      return res.status(401).json({ error: 'No auth cookie found' });
    }

    const { refresh_token } = JSON.parse(authCookie);

    if (!refresh_token) {
      return res.status(401).json({ error: 'No refresh token found' });
    }

    const tokenData = await spotifyService.refreshAccessToken(refresh_token);

    // Add timestamp for expiration tracking
    const tokenDataWithTimestamp = {
      ...tokenData,
      issued_at: Date.now(),
    };

    // Update cookie with new token data
    res.cookie('spotify_auth', JSON.stringify(tokenDataWithTimestamp), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    console.log('Token refreshed with new expiration timestamp');
    res.json({ success: true });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

/**
 * Logs out the user by clearing the auth cookie
 */
router.post('/logout', (req, res) => {
  res.clearCookie('spotify_auth');
  res.json({ success: true });
});

module.exports = router;
