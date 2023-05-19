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

//importing helper functions
const { urlsForUser, generateRandomString, getUserByEmail } = require('./helpers');


// users object in the format
// const users = {"userRandomID": {
//     id: "userRandomID",
//     email: "user@example.com",
//     password: "purple-monkey-dinosaur"
//   },
//}
const users = {};


//url database in the format
// const urlDatabase = {
//   b6UTxQ: {
//     longURL: "https://www.tsn.ca",
//     userID: "aJ48lW",
// }
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
    const error = "You can only shorten urls if you are logged in";
    return res.status(403).render("urls_errors", { user: user, error });
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
  const currentUserURLs = urlsForUser(req.session.user_id, urlDatabase);
  if (!currentUserURLs[req.params.shortURL]) {
    const error = "This short URL does not exist";
    return res.status(403).render("urls_errors", { user: users[req.session.user_id], error });
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: currentUserURLs[req.params.shortURL].longURL,
    user: users[req.session.user_id],
    currentUserURLs
  };
  return res.render("urls_show", templateVars);
});

//redirect from short url to actual long url website
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    const error = 'This short URL does not exist.';
    return res.status(404).render('urls_errors', { user: users[req.session.user_id], error });
  }
});


//Register get route
app.get('/register', (req, res) => {
  if (!req.session.user_id) {
    const templateVars = { user: users[req.session.user_id] };
    return res.render('urls_register', templateVars);
  }
  return res.redirect('/urls');
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
      const error = 'This email has already been registered.';
      return res.status(400).render('urls_errors', { user: users[req.session.user_id], error });
    }
  } else {
    const error = 'Email and/or Password fields cannot be empty.';
    return res.status(400).render('urls_errors', { user: users[req.session.user_id], error });
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
  const error = 'You have entered invalid credentials.';
  return res.status(403).render('urls_errors', { user: users[req.session.user_id], error });
});

//Logout route for user
app.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.clearCookie('session.sig');
  return res.redirect('/login');
});


//Editing a URL for user
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user = getUserByEmail(users[req.session.user_id].email, users);
  if (!user) {
    const error = 'You cannot edit a URL that you do not own.';
    return res.status(403).render('urls_errors', { user: users[req.session.user_id], error });
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
  const error = 'You are not allowed to delete a URL that you do not own.';
  return res.status(403).render('urls_errors', { user: users[req.session.user_id], error });
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});