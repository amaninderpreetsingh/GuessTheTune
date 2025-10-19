/**
 * Middleware to verify Spotify authentication
 * Checks for valid auth cookie and extracts access token
 */
function verifySpotifyAuth(req, res, next) {
  try {
    const authCookie = req.cookies.spotify_auth;

    if (!authCookie) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const authData = JSON.parse(authCookie);

    if (!authData.access_token) {
      return res.status(401).json({ error: 'Invalid authentication data' });
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
