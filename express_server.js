const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

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
}

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//urls get route
app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

//urls post route
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const templateVars = { shortURL, longURL };
  res.render("urls_show", templateVars);  
});

//create newURL
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']] };
  res.render("urls_new", templateVars);
});

//get route showing short and long url
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.id], 
    user: users[req.cookies['user_id']] 
  };
  res.render("urls_show", templateVars);
});

//redirect from short url to actual long url website
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});



//Register get route
app.get('/register', (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']] };
  res.render('urls_register', templateVars);
});

//Register post route
app.post('/register', (req, res) => {
  if (req.body.email && req.body.password) {
    const userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie('user_id', userID);
    return res.redirect('/urls');
  }
});

//Login route
app.post("/login", (req, res) => {
  res.cookie('email', req.body.email);
  res.redirect("/urls");
});

//Logout route
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

//Editing
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  //Setting longURL to newURL
  urlDatabase[shortURL] = req.body.newURL;
  res.redirect("/urls");
});

//Deleting
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});