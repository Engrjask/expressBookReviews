const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // Check if the username is not an empty string
    if (username.trim() === '') {
        return false;
    }

    // Check if the username contains spaces
    if (username.includes(' ')) {
        return false;
    }

    // Check if the username is unique (not case-sensitive)
    const usernameLower = username.toLowerCase();
    for (const user of users) {
        if (user.username.toLowerCase() === usernameLower) {
            return false;
        }
    }

    return true;
};

const authenticatedUser = (username, password) => {
    // Check if the username and password match the ones in the users array
    return users.some(user => user.username === username && user.password === password);
};

const auth_users = require("./auth_users.js");


// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
  
    if (authenticatedUser(username, password)) {
      // Generate a JWT token for the authenticated user
      const token = jwt.sign({ username }, 'your_jwt_secret', { expiresIn: '1h' });
  
      req.session.token = token; // Store the token in the session
      res.status(200).json({ token });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  });


// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;
    const username = req.user.username;
  
    const book = books[isbn];

  
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    const userReview = book.reviews.find(r => r.username === username);
  
    if (userReview) {
      userReview.review = review;
    } else {
      book.reviews.push({ username, review });
    }
  
    res.status(200).json({ message: "Review added/updated successfully" });
  });
  

// ...


/// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const username = req.user.username;

    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Find the index of the review with the given username
    const reviewIndex = book.reviews.findIndex(r => r.username === username);

    // Check if the user has a review for the book
    if (reviewIndex === -1) {
        return res.status(404).json({ message: "Review not found" });
    }

    // Delete the review
    book.reviews.splice(reviewIndex, 1);

    res.status(200).json({ message: "Review deleted successfully" });
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
