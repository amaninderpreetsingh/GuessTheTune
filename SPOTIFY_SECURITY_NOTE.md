# Important: Spotify Redirect URI Security Requirements

## Why 127.0.0.1 Instead of localhost?

Spotify has strict security requirements for redirect URIs. According to their documentation:

### Requirements:
1. ✅ **Use HTTPS** for redirect URIs (unless using loopback address)
2. ✅ **For loopback addresses**, use explicit IPv4 (`127.0.0.1`) or IPv6 (`[::1]`)
3. ❌ **localhost is NOT allowed** as a redirect URI

### What This Means for GuessTheTune

**In Your Spotify App Settings:**
- ✅ Correct: `http://127.0.0.1:8080/auth/callback`
- ❌ Wrong: `http://localhost:8080/auth/callback`

**In Your .env Files:**
```env
# Server .env
SPOTIFY_REDIRECT_URI=http://127.0.0.1:8080/auth/callback
CLIENT_URL=http://127.0.0.1:3000

# Client .env
REACT_APP_SERVER_URL=http://127.0.0.1:8080
```

### Accessing the App

When you run the app, you can access it using either:
- `http://127.0.0.1:3000` ✅ (preferred, matches Spotify config)
- `http://localhost:3000` ✅ (also works in browsers)

Both resolve to the same local server, but Spotify's OAuth flow requires the explicit IP address.

### Why This Security Measure?

Spotify enforces this to:
1. **Prevent DNS hijacking** - localhost can be manipulated via hosts file
2. **Ensure explicit loopback** - 127.0.0.1 is guaranteed to be the local machine
3. **Security best practice** - More secure for OAuth flows

### Production Deployment

For production, you'll use HTTPS:
```env
SPOTIFY_REDIRECT_URI=https://yourdomain.com/auth/callback
```

HTTPS is required for non-loopback addresses.

## Reference

For more information, see:
- [Spotify Web API Authorization Guide](https://developer.spotify.com/documentation/web-api/concepts/authorization)
- Spotify Developer Dashboard: https://developer.spotify.com/dashboard

## Quick Checklist

Before running GuessTheTune:

- [ ] Spotify app created at https://developer.spotify.com/dashboard
- [ ] Redirect URI set to `http://127.0.0.1:8080/auth/callback`
- [ ] Client ID and Secret copied to `server/.env`
- [ ] `SPOTIFY_REDIRECT_URI=http://127.0.0.1:8080/auth/callback` in server/.env
- [ ] `REACT_APP_SERVER_URL=http://127.0.0.1:8080` in client/.env
- [ ] Both server and client running

You're all set! 🎵
