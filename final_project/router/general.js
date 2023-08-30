const express = require('express');
const axios = require('axios').default;
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const keys = Object.keys(books);


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if(username && password)
  {
    if(!isValid(username))
    {
      users.push({"username" : username, "password" : password});
      return res.status(200).json({message : `User ${username} successfully registered!`});
    }
    else
    {
      return res.status(404).json({message : "User already exist!"});
    }
  }
  else
  {
    return res.status(404).json({message : "Unable to register"});
  }
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  // return res.send(JSON.stringify(books));  
  
  // Using promises
  const myPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      if(books)
      {
        resolve(books);
      }
      else
      {
        reject("Books not found");
      }
    }, 1000);
  })

  myPromise.then((bookinfo) => {
    return res.status(300).json(bookinfo);
  })
  .catch((err) => {
    return res.status(300).json(err);
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  let book = books[parseInt(isbn)];
  return res.send(book);
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  keys.map((key) => {
    let book = books[key].author;
    if(book === author)
    {
      return res.send(books[key]);
    }
  })
  return res.status(404).send("Author not found");
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  keys.map((key) => {
    let book = books[key].title;
    if(book === title)
    {
      return res.send(books[key]);
    }
  })
  // return res.status(404).send("Title not found");
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  return res.send(books[isbn].reviews)
});

module.exports.general = public_users;
