const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  let userExist = users.filter((user) => {
    return user.username === username;
  })

  if(userExist.length > 0)
  {
    return true;
  }
  else
  {
    return false;
  }
}

const CheckUserReview = (username, isbn) => {
  let bookReview = books[isbn].reviews[username];
  if(bookReview > 0)
  {
    return true;
  }
  else
  {
    return false;
  }
}

const authenticatedUser = (username,password)=>{ 
  let checkUser = users.filter((user) => {
    return (user.username === username && user.password === password)
  })
  if(checkUser.length > 0)
  {
    return true;
  }
  else 
  {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if(username && password)
  {
    if(authenticatedUser(username, password))
    {
      let accessToken = jwt.sign({
        data : password
      }, "access", { expiresIn : 60 * 60 });

      req.session.authorization = {
        accessToken, username
      }
      return res.status(200).json({message : "User " + username + " successfully logged in"});
    }
    else
    {
      return res.status(208).json({message : "Invalid login. Check username and password"});
    }
  }
  else 
  {
    return res.status(404).json({message : "Login Failed"})
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization['username'];

  if(!CheckUserReview(username, isbn))
  {
    // Add Review
    books[isbn].reviews[username] = review
    return res.status(200).send(`Review '${review}' added sucessfully!`);
  }
  else
  {
    // Modify Review
    books[isbn].reviews[username] = review;
    return res.status(200).send(`Review '${review}' modified sucessfully!`);
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization['username'];
  
  const reviewToDelete = books[isbn].reviews[username];

  if(reviewToDelete)
  {
    delete books[isbn].reviews[username];;
    return res.status(200).send(`Review of ${username} with isbn ${isbn} has deleted successfully`)
  }
  else
  {
    return res.status(404).json({message : "Data not found"});
  }

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
