const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    assert.equal(user, testUsers.userRandomID);
  });
  it('should return undefined when the email does not exist in users database', function() {
    const user = getUserByEmail("somemail@example.com", testUsers)
    assert.equal(user, undefined);
  });
});

const Urls = {
  'erqr': {
    longURL: 'http://www.reddit.com',
    userID: 'morgan'
  },
  'jyth': {
    longURL: 'http://www.google.com',
    userID: 'henry'
  },
  'eweq': {
    longURL: 'http://www.leagueoflegends.com',
    userID: 'morgan'
  }
};
describe('#urlsForUser', () => {
  it('should return the corresponding urls for a valid user', () => {
    const userUrls = urlsForUser('morgan', Urls);
    const expectedResult = {
      'erqr': {
        longURL: 'http://www.reddit.com',
        userID: 'morgan'
      },
      'eweq': {
        longURL: 'http://www.leagueoflegends.com',
        userID: 'morgan'
      }
    };

    assert.deepEqual(userUrls, expectedResult);
  });

  it('should return an empty object for a non-existent user', () => {
    const userUrls = urlsForUser('jimmy', Urls);
    assert.deepEqual(userUrls, {});
  });
});