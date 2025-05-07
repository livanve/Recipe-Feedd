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

// ✅ GET all recipes
app.get('/api/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ msg: 'Error retrieving recipes' });
  }
});


// Get a single recipe by ID
app.get('/api/recipes/:id', async (req, res) => {
  const { id } = req.params;

  // Step 1: Validate the format of the ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ msg: 'Invalid recipe ID format' });
  }

  try {
    // Step 2: Fetch recipe from database
    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({ msg: 'Recipe not found' });
    }

    // Step 3: Send recipe as response
    res.json(recipe);
  } catch (err) {
    console.error('Server error while fetching recipe:', err);
    res.status(500).json({ msg: 'Server error' });
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

app.delete('/api/recipes/:id', authMiddleware, async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) {
      return res.status(404).json({ msg: 'Recipe not found' });
    }
    res.json({ msg: 'Recipe deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});
