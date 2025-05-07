const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const authMiddleware = require('./middleware/auth'); // Ensure this is correctly imported


const getElement = (selector) => {
  const element = document.querySelector(selector);
  if (element) return element;
  throw Error(`Please double check your class names, there is no ${selector} class`);
}

// Check if the page has the nav-btn and nav-links (avoid error on login page)
if (document.body.classList.contains('navbar-page')) {
  const links = getElement('.nav-links');
  const navBtnDOM = getElement('.nav-btn');

  // Add the event listener only if nav-btn exists
  if (navBtnDOM) {
    navBtnDOM.addEventListener('click', () => {
      links.classList.toggle('show-links');  // Toggle the menu on click
    });
  }
}

// Toggle between login and sign-up forms
function toggleForm() {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  if (loginForm.style.display === 'none') {
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
  } else {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
  }
}

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  console.log('Login Response:', data); // Debugging line

  if (response.ok) {
    localStorage.setItem('token', data.token);  // Store JWT token in localStorage
    console.log('Token stored:', data.token);  // Debugging line
    window.location.href = '/recipes.html';  // Redirect to recipes page
  } else {
    alert(data.msg);  // Show error message from backend
  }
});

// Handle sign-up form submission
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('signupUsername').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await response.json();
  console.log('Sign-up Response:', data); // Debugging line

  if (response.ok) {
    alert('Sign up successful');
    toggleForm();  // Show login form after successful sign-up
  } else {
    alert(data.msg);  // Show error message from backend
  }
});

const date = getElement('#date');
const currentYear = new Date().getFullYear();
date.textContent = currentYear;

// Define the Recipe model
const Recipe = mongoose.model('Recipe', {
  name: String,
  ingredients: [String],
  instructions: String,
  image: String,
});

const app = express();

// Middleware
app.use(bodyParser.json()); // To parse JSON request bodies
app.use(cors()); // To enable CORS (Cross-Origin Resource Sharing)

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

  app.post('/api/recipes', authMiddleware, async (req, res) => {
    try {
      // Destructure the recipe data from the request body
      const { name, ingredients, instructions, image } = req.body;
  
      // Create a new recipe instance
      const newRecipe = new Recipe({
        name,
        ingredients,
        instructions,
        image,
      });
  
      // Save the recipe to the database
      await newRecipe.save();
  
      // Return a success response with the new recipe
      res.status(201).json({
        msg: 'Recipe added successfully',
        recipe: newRecipe,  // You can send the created recipe back as part of the response
      });
    } catch (err) {
      res.status(500).send('Error adding recipe');
    }
  });

//  const PORT = process.env.PORT || 5000;
//  app.listen(PORT, () => {
//    console.log(`Server is running on port ${PORT}`);
//  });
  
// Handle recipe submission (on the new recipe page)
document.getElementById('newRecipeForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('recipeName').value;
  const ingredients = document.getElementById('recipeIngredients').value.split(','); // Split by commas if needed
  const instructions = document.getElementById('recipeInstructions').value;
  const image = document.getElementById('recipeImage').value;

  const response = await fetch('http://localhost:5000/api/recipes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': localStorage.getItem('token'), // Add the token if logged in
    },
    body: JSON.stringify({ name, ingredients, instructions, image }),
  });

  const data = await response.json();
  if (response.ok) {
    // Show the added recipe on the page or redirect to the recipe details page
    alert('Recipe added successfully!');
    displayRecipe(data.recipe); // Call the function to display the new recipe
  } else {
    alert(data.msg); // Show error message from backend
  }
});

// Function to display the new recipe (on the same page or a different page)
function displayRecipe(recipe) {
  const recipeDisplay = document.getElementById('recipeDisplay'); // Assuming you have a div to display the recipe
  recipeDisplay.innerHTML = `
    <h2>${recipe.name}</h2>
    <p><strong>Ingredients:</strong> ${recipe.ingredients.join(', ')}</p>
    <p><strong>Instructions:</strong> ${recipe.instructions}</p>
    <img src="${recipe.image}" alt="${recipe.name}" />
  `;
}

// Get the recipe ID from the URL query string
const urlParams = new URLSearchParams(window.location.search);
const recipeId = urlParams.get('id');  // This fetches the 'id' parameter from the URL

// Fetch the recipe details using the ID
async function fetchRecipe() {
  const response = await fetch(`http://localhost:5000/api/recipes/${recipeId}`);
  const recipe = await response.json();

  if (response.ok) {
    // Dynamically insert the recipe data into the page
    document.getElementById('recipe-name').textContent = recipe.name;
    document.getElementById('recipe-description').textContent = recipe.description;
    document.getElementById('prep-time').textContent = recipe.prepTime;
    document.getElementById('cook-time').textContent = recipe.cookTime;
    document.getElementById('serving-size').textContent = recipe.servingSize;
    document.getElementById('recipe-tags').textContent = `Tags: ${recipe.tags.join(', ')}`;
    document.getElementById('recipe-image').src = recipe.image;

    // Add ingredients
    const ingredientsList = recipe.ingredients.map(ingredient => `<p>${ingredient}</p>`).join('');
    document.getElementById('recipe-ingredients').innerHTML = ingredientsList;

    // Add instructions
    const instructionsList = recipe.instructions.map((step, index) => `
      <div class="single-instruction">
        <header>
          <p>Step ${index + 1}: ${step.title}</p>
          <div></div>
        </header>
        <p>${step.description}</p>
      </div>
    `).join('');
    document.getElementById('recipe-instructions').innerHTML = `<p>${recipe.instructions}</p>`;

    // Add tools (if any)
    const toolsList = recipe.tools.map(tool => `<p class="single-tool">${tool}</p>`).join('');
    document.getElementById('recipe-tools').innerHTML = `<p>No tools listed</p>`;
  } else {
    alert('Recipe not found');
  }
}

// Call the fetch function when the page loads
fetchRecipe();


// Example recipe data (usually fetched from backend)
const recipes = [
  { _id: "recipe1_id", name: "Carne Asada", image: "./assets/recipes/recipe-1.jpeg" },
  { _id: "recipe2_id", name: "Greek Ribs", image: "./assets/recipes/recipe-2.jpeg" },
  { _id: "recipe3_id", name: "Vegetable Soup", image: "./assets/recipes/recipe-3.jpeg" },
  { _id: "recipe4_id", name: "Banana Pancakes", image: "./assets/recipes/recipe-4.jpeg" }
];

// Get the container where you want to display the recipes
const recipesContainer = document.querySelector(".recipes-list");

// Loop through the recipes and create links dynamically
recipes.forEach(recipe => {
  const recipeElement = document.createElement("a");
  recipeElement.href = `single-recipe.html?id=${recipe._id}`;  // Add the recipe ID in the URL
  recipeElement.classList.add("recipe");
  recipeElement.innerHTML = `
    <img src="${recipe.image}" alt="${recipe.name}" class="img recipe-img" />
    <h5>${recipe.name}</h5>
    <p>Prep : 15min | Cook : 5min</p>
  `;
  recipesContainer.appendChild(recipeElement);  // Append to the container
});

app.get('/api/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ msg: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});


