const spotifyService = require('../services/spotifyService');

/**
 * Middleware to verify Spotify authentication
 * Checks for Authorization header (preferred) or auth cookie (fallback)
 * Auto-refreshes expired tokens
 */
async function verifySpotifyAuth(req, res, next) {
  try {
    let authData = null;

    // First, try to get token from Authorization header (works on mobile Safari)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      try {
        // Token from header is expected to be the full auth data JSON
        authData = JSON.parse(decodeURIComponent(token));
      } catch (e) {
        // If parsing fails, treat it as just the access_token
        authData = { access_token: token };
      }
    }

    // Fallback to cookie-based auth (backward compatibility)
    if (!authData) {
      const authCookie = req.cookies.spotify_auth;
      if (!authCookie) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      authData = JSON.parse(authCookie);
    }

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
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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
