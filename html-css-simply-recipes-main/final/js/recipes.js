const hardcodedRecipes = [
    {
      _id: "static1",
      name: "Carne Asada",
      image: "./assets/recipes/recipe-1.jpeg",
    },
    {
      _id: "static2",
      name: "Greek Ribs",
      image: "./assets/recipes/recipe-2.jpeg",
    },
    {
      _id: "static3",
      name: "Vegetable Soup",
      image: "./assets/recipes/recipe-3.jpeg",
    },
    {
      _id: "static4",
      name: "Banana Pancakes",
      image: "./assets/recipes/recipe-4.jpeg",
    }
  ];
  

  async function loadRecipes() {
    const recipesContainer = document.querySelector(".recipes-list");
    recipesContainer.innerHTML = ""; // Clear any static HTML
  
    // Step 1: Render hardcoded recipes
    hardcodedRecipes.forEach(recipe => {
      const recipeElement = document.createElement("a");
      recipeElement.href = `single-recipe.html?id=${recipe._id}`;
      recipeElement.classList.add("recipe");
      recipeElement.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.name}" class="img recipe-img" />
        <h5>${recipe.name}</h5>
        <p>Prep : 15min | Cook : 5min</p>
      `;
      recipesContainer.appendChild(recipeElement);
    });
  
    // Step 2: Fetch and render MongoDB recipes
    try {
      const res = await fetch('http://localhost:5000/api/recipes');
      const dbRecipes = await res.json();
  
      dbRecipes.forEach(recipe => {
        const recipeElement = document.createElement("a");
        recipeElement.href = `single-recipe.html?id=${recipe._id}`;
        recipeElement.classList.add("recipe");
        recipeElement.innerHTML = `
          <img src="${recipe.image || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${recipe.name}" class="img recipe-img" />
          <h5>${recipe.name}</h5>
          <p>Prep : 15min | Cook : 5min</p>
          <button class="delete-btn" data-id="${recipe._id}">Delete</button>
        `;
        recipesContainer.appendChild(recipeElement);
      });
  
      // Delete button handling
      recipesContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
          e.preventDefault();
          const id = e.target.dataset.id;
          if (confirm('Are you sure you want to delete this recipe?')) {
            await fetch(`http://localhost:5000/api/recipes/${id}`, {
              method: 'DELETE',
              headers: {
                'x-auth-token': localStorage.getItem('token'),
              }
            });
            loadRecipes(); // Reload after delete
          }
        }
      });
  
    } catch (err) {
      console.error("Failed to load MongoDB recipes", err);
    }
  }
  
  window.addEventListener('DOMContentLoaded', loadRecipes);
  
  