//takes in a user ID and a user object and returns an object containing the urls of the respective user
const urlsForUser = function(id, database) {
  const userURLs = {};
  for (const shortURL in database) {
    if (database[shortURL].userID === id) {
      userURLs[shortURL] = database[shortURL];
    }
  }
  return userURLs;
};

//generates a random 6 letter string when called
const generateRandomString = function() {
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


//takes in a user email and url database object to return a specific user
const getUserByEmail = function(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
};

module.exports = { urlsForUser, generateRandomString, getUserByEmail };