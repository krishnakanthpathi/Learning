// 1. Import Dependencies
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config(); // Loads .env variables

// 2. Initialize App
const app = express();
const PORT = process.env.PORT || 3000;

// 3. Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// 4. Passport Configuration
app.use(passport.initialize());
app.use(passport.session());

// passport.serializeUser: Saves user's ID to the session
passport.serializeUser((user, done) => {
  console.log('Serializing user:', user);
  done(null, user); // 'user.id' is the Google profile ID
});

// // passport.deserializeUser: Retrieves user data from session using the ID
passport.deserializeUser((user, done) => {
  // In a real app, you'd find the user in your database here
  // For this example, we'll just pass the user object we stored
  // This is where you'd query: User.findById(id, (err, user) => done(err, user));
  // Since we don't have a database, we'll just pass a minimal user object
  // (In a real app, you would deserialize from a database based on the 'id')
  // This example is simplified and might not find the user on subsequent requests
  // A better serializeUser would store the whole 'user' object or more details
  // Let's adjust serialize/deserialize for this example to work correctly
  done(null, user); // Simplified: just pass back the id
});

// 5. Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    // This is the "verify" function
    // 'profile' contains the user's Google profile information
    console.log('Google Profile:', profile);

    // In a real application, you would:
    // 1. Check if the user (profile.id) already exists in your database.
    // 2. If yes, fetch that user and pass it to `done()`.
    // 3. If no, create a new user in your database and pass the new user to `done()`.

    // For this example, we'll just pass the profile directly
    // The 'user' object passed to 'done' is what gets attached to req.user
    return done(null, profile);
  }
));

// 6. Define Routes

// Helper middleware to check if user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Root route - simple welcome page or login link
app.get('/', (req, res) => {
  res.send('<h1>Home Page</h1><a href="/auth/google">Login with Google</a>');
});

// Login page (if you want a dedicated one)
app.get('/login', (req, res) => {
  res.send('<h1>Login Page</h1><a href="/auth/google">Login with Google</a>');
});

// --- Google Auth Routes ---

// 7. Route to Start Google Sign-in
// This route kicks off the authentication process
app.get('/auth/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'] // Request profile and email
  })
);

// 8. Google Callback Route
// This is the URL we specified in the Google Cloud Console
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication!
    // req.user is populated by Passport
    res.redirect('/profile');
  }
);

// --- Protected Route ---

// 9. Profile Page (Protected)
// isLoggedIn middleware checks if user is authenticated
app.get('/profile', isLoggedIn, (req, res) => {
  // req.user is available here thanks to Passport
  res.send(`<h1>Hello, ${req.user.displayName}</h1>
            <p>Email: ${req.user.emails[0].value}</p>
            <a href="/logout">Logout</a>`);
});

// --- Logout Route ---

// 10. Logout
app.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});


// 11. Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});