// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth'); // Import the authentication routes
const authMiddleware = require('./middleware/auth'); // Import the authMiddleware

const app = express();

// Middleware
app.use(bodyParser.json()); // Parse JSON bodies
app.use(express.static(__dirname + '/html-css-simply-recipes-main/final')); // Serve static files like HTML, CSS, JS
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
app.use('/api/auth', authRoutes); // Make sure this is correctly linking the auth.js routes

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

// **Corrected** Route to add a new recipe with authentication
app.post('/api/recipes', authMiddleware, async (req, res) => {
  try {
    const newRecipe = new Recipe(req.body);

    // Save the new recipe to the database
    await newRecipe.save();

    // Respond with the saved recipe or a success message
    res.status(201).json({
      msg: 'Recipe added successfully',
      recipe: newRecipe,  // You can send the created recipe back as part of the response
    });
  } catch (err) {
    res.status(500).send('Error adding recipe');
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
