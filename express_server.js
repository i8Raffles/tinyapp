const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session')
const express = require("express");
const app = express();

app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  secret: 'the-world-is-an-amazing-place'
}))

app.use(express.urlencoded({ extended: true }));

const users = {
  // userRandomID: {
  //   id: "userRandomID",
  //   email: "user@example.com",
  //   password: "purple-monkey-dinosaur",
  // },
  // user2RandomID: {
  //   id: "user2RandomID",
  //   email: "user2@example.com",
  //   password: "dishwasher-funk",
  // },
  // aJ48lW: {
  //   id: "aJ48lW",
  //   email: "hello@hello.com",
  //   password: "123",
  // },
};

const urlDatabase = {
  // b6UTxQ: {
  //   longURL: "https://www.tsn.ca",
  //   userID: "aJ48lW",
  // },
  // i3BoGr: {
  //   longURL: "https://www.google.ca",
  //   userID: "aJ48lW",
  // },
};

function urlsForUser(id) {
  userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
}

function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charsLength = characters.length;
  let counter = 0;
  while (counter < 6) {
    result += characters.charAt(Math.floor(Math.random() * charsLength));
    counter += 1;
  }
  return result;
};



function getUserByEmail(email, db) {
  for (const user in db) {
    if (db[user].email === email) {
      return db[user];
    }
  }
  return null;
};


//urls get route
app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id),
  };
  return res.render("urls_index", templateVars);
});

//urls post route
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

//create newURL
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
  const currentUserURL = urlsForUser(req.session.user_id);
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: currentUserURL[req.params.shortURL].longURL,
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
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
      res.redirect('/urls');
    } else {
      res.status(400).send('This email has already been registered.');
    }
  } else {
    res.status(400).send('Email and/or Password fields cannot be empty');
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

//Logout route
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});


//Editing
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user = getUserByEmail(req.body.email, users);
  if (!user) {
    return res.status(403).send("You cannot edit a URL that you do not own.");
  }
  //Setting longURL to newURL
  urlDatabase[shortURL].longURL = req.body.newURL;
  res.redirect("/urls");
});

//Deleting
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    return res.redirect("/urls");
  }
  res.status(403).send("You are not allowed to delete a URL that you do not own.")
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});