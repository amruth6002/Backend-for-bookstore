const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60*60 });

    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(401).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.post("/auth/reviews/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.query;
  const username = req.session.authorization.username;

  if (!isbn || !review || !username) {
      return res.status(400).json({ message: "Missing ISBN, review, or username" });
  }

  if (!books[isbn].reviews) {
      books[isbn].reviews = [];
  }

  const userReviewIndex =  books[isbn].reviews.findIndex(r => r.username === username);

  if (userReviewIndex !== -1) {
      // Update existing review
      books[isbn].reviews[userReviewIndex].review = review;
      return res.status(200).json({ message: "Review updated successfully" });
  } else {
      // Add new review
     books[isbn].reviews.push({ username, review });
      return res.status(200).json({ message: "Review added successfully" });
  }
});
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).send("Book not found");
  }

  const username = req.session.authorization.username;
  const initialReviewCount = books[isbn].reviews.length;//Before attempting to delete a review, it stores the initial number of reviews for the book.
  books[isbn].reviews = books[isbn].reviews.filter(review => review.username !== username);//This updates the reviews array for the book by filtering out the review(s) made by the current user. It keeps only those reviews where the username does not match the current user's username.

  if (books[isbn].reviews.length === initialReviewCount) {
    return res.status(404).send("Review not found for the user");
  } else {
    return res.status(200).send("Review deleted successfully");
  }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;