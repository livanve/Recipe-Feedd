// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth'); // Import the auth routes (registration & login)
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static(__dirname + '/html-css-simply-recipes-main/final')); // Serves static files like HTML, CSS, JS
app.use(cors()); // Enable CORS

// MongoDB connection
const uri = 'mongodb+srv://livanve98:Jfp2ZLEwLa2QngEk@cluster0.yf3cooj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(uri)
  .then(() => {
    console.log('Connected to MongoDB');
    // Start the server after MongoDB connection is successful
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => console.log('Error connecting to MongoDB:', err));

// Use the authentication routes
app.use('/api/auth', authRoutes); // Add this line to use the authentication routes

// Define a Recipe model
const Recipe = mongoose.model('Recipe', {
  name: String,
  ingredients: [String],
  instructions: String,
  image: String,
});

// Route to get all recipes
app.get('/api/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (err) {
    res.status(500).send('Error retrieving recipes');
  }
});

// Route to add a new recipe
app.post('/api/recipes', async (req, res) => {
  try {
    const newRecipe = new Recipe(req.body);
    await newRecipe.save();
    res.status(201).send('Recipe added');
  } catch (err) {
    res.status(500).send('Error adding recipe');
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
