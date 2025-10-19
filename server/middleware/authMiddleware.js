const spotifyService = require('../services/spotifyService');

/**
 * Middleware to verify Spotify authentication
 * Checks for valid auth cookie, auto-refreshes expired tokens
 */
async function verifySpotifyAuth(req, res, next) {
  try {
    const authCookie = req.cookies.spotify_auth;

    if (!authCookie) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    let authData = JSON.parse(authCookie);

    if (!authData.access_token || !authData.refresh_token) {
      return res.status(401).json({ error: 'Invalid authentication data' });
    }

    // Check if token is expired (with 5-minute buffer for safety)
    const now = Date.now();
    const issuedAt = authData.issued_at || 0;
    const expiresIn = (authData.expires_in || 3600) * 1000; // Convert to milliseconds
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds

    const isExpired = (now - issuedAt) >= (expiresIn - bufferTime);

    if (isExpired) {
      console.log('Access token expired, refreshing...');

      try {
        // Refresh the token
        const newTokenData = await spotifyService.refreshAccessToken(authData.refresh_token);

        // Add timestamp
        authData = {
          ...newTokenData,
          issued_at: Date.now(),
        };

        // Update the cookie with fresh token
        res.cookie('spotify_auth', JSON.stringify(authData), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 3600000,
          sameSite: 'lax',
        });

        console.log('Token refreshed automatically in middleware');
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        return res.status(401).json({ error: 'Token refresh failed', requiresReauth: true });
      }
    }

    // Attach auth data to request object
    req.spotifyAuth = authData;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
}

module.exports = {
  verifySpotifyAuth,
};
