const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const express = require("express");
const app = express();

app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  secret: 'the-world-is-an-amazing-place'
}));

app.use(express.urlencoded({ extended: true }));

const { urlsForUser, generateRandomString, getUserByEmail } = require('./helpers');

const users = {};

const urlDatabase = {};

//home page to redirect to /urls or /login based on their login status
app.get('/', (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  } else {
    return res.redirect('/login');
  }
});

//urls get route
app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id, urlDatabase),
  };
  return res.render("urls_index", templateVars);
});

//urls post route to shorten a url
app.post("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(403).send("You can only shorten URLs if you're logged in");
  }
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL: longURL, userID: user.id };
  const templateVars = { shortURL, longURL, user };
  return res.render("urls_show", templateVars);
});

//creating a new url get route
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    const templateVars = { user: users[req.session.user_id] };
    return res.render("urls_new", templateVars);
  } else {
    return res.redirect('/login');
  }
});

//get route showing short and long url
app.get("/urls/:shortURL", (req, res) => {
  const currentUserURL = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: currentUserURL[req.params.shortURL].longURL,
    user: users[req.session.user_id]
  };
  return res.render("urls_show", templateVars);
});

//redirect from short url to actual long url website
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL) {
    return res.redirect(longURL);
  }
  return res.status(404).send("This short URL does not exist.");
});


//Register get route
app.get('/register', (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  return res.render('urls_register', templateVars);
});

//Register post route
app.post('/register', (req, res) => {
  if (req.body.email && req.body.password) {
    if (!getUserByEmail(req.body.email, users)) {
      const userID = generateRandomString();
      users[userID] = {
        id: userID,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
      };
      req.session.user_id = userID;
      return res.redirect('/urls');
    } else {
      return res.status(400).send('This email has already been registered.');
    }
  } else {
    return res.status(400).send('Email and/or Password fields cannot be empty');
  }
});

//Login get route
app.get('/login', (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  return res.render('urls_login', templateVars);
});

//Login post route
app.post('/login', (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    req.session.user_id = user.id;
    return res.redirect('/urls');
  }
  return res.status(403).send('You have entered the wrong password or email.');
});

//Logout route for user
app.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.clearCookie('session.sig');
  res.redirect('/login');
});


//Editing a URL for user
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user = getUserByEmail(users[req.session.user_id].email, users);
  if (!user) {
    return res.status(403).send("You cannot edit a URL that you do not own.");
  }
  urlDatabase[shortURL].longURL = req.body.newURL;
  return res.redirect("/urls");
});

//Deleting a URL for user
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    return res.redirect("/urls");
  }
  return res.status(403).send("You are not allowed to delete a URL that you do not own.");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});