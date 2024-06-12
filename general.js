const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();




// Get the book list available in the shop
// Simulated async function to fetch books directly without artificial delay
async function fetchBooks() {
  // Directly return the books data, assuming it's immediately available
  // In a real scenario, this could be a database query or an external API call
  return books;
}

// Endpoint to get the book list available in the shop using async-await
public_users.get('/', async (req, res) => {
  try {
    const booksList = await fetchBooks();
    res.json(booksList);
  } catch (error) {
    res.status(500).send("Error fetching books");
  }
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn])
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
 const author = req.params.author;
 res.send(books[author])
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
 const title = req.params.title;
 res.send(books[title])
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) { // Check if the book exists
    const bookReviews = books[isbn].reviews; // Access the 'reviews' array
    if (bookReviews.length > 0) {
      res.send(bookReviews); // Send all reviews for the book
    } else {
      res.send('No reviews found for this book'); // Handle case with no reviews
    }
  } else {
    res.status(404).send('Book not found'); // Handle the case where the book does not exist
  }
});
public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (username && password) {
      if (!isValid(username)) { 
        users.push({"username":username,"password":password});
        return res.status(200).json({message: "User successfully registred. Now you can login"});
      } else {
        return res.status(404).json({message: "User already exists!"});    
      }
    } 
    return res.status(404).json({message: "Unable to register user."});
  });


module.exports.general = public_users;