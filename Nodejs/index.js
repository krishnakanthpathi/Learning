const express = require('express');
const session = require('express-session');
const app = express();

// 1. Configure the session middleware
app.use(session({
  secret: 'a-very-secret-key-that-is-hard-to-guess', // Used to "sign" the cookie
  resave: false,               // Don't save session if unmodified
  saveUninitialized: false      // Save a new, empty session
}));

app.get('/', (req, res) => {
  res.send(`<h1>Welcome! ${JSON.stringify(req.session)}</h1>`);

});
// 2. Create the route
app.get('/kk', (req, res) => {
  // 'req.session' is the user's "storage box"
  console.log('Session data:', req.session , req);
  // writing req into a file for inspection
  if (req.session.views) {
    // If we've seen them, increment the counter
    req.session.views++;
    res.send(`<h1>You have visited this page ${req.session.views} times.</h1>`);
  } else {
    // If it's their first time, set the counter to 1
    req.session.views = 1;
    res.send('<h1>Welcome to the site! This is your first visit.</h1>');
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});