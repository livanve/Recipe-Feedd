const hardcoded = {
    static1: {
      name: "Carne Asada",
      image: "./assets/recipes/recipe-1.jpeg",
      ingredients: ["Flank steak", "Salt", "Lime juice"],
      instructions: "Grill the steak until desired doneness."
    },
    // Add others...
  };
  
  if (hardcoded[recipeId]) {
    const r = hardcoded[recipeId];
    document.getElementById('recipe-name').textContent = r.name;
    document.getElementById('recipe-image').src = r.image;
    document.getElementById('recipe-ingredients').innerHTML = r.ingredients.map(i => `<p>${i}</p>`).join('');
    document.getElementById('recipe-instructions').innerHTML = `<p>${r.instructions}</p>`;
  } else {
    fetchRecipe(); // your existing MongoDB fetch
  }
  

async function fetchRecipe() {
    const id = new URLSearchParams(window.location.search).get("id");
  
    try {
      const response = await fetch(`http://localhost:5000/api/recipes/${id}`);
  
      if (!response.ok) {
        const errorMsg = await response.text();
        console.error("Error loading recipe:", errorMsg);
        alert("Recipe not found or failed to load.");
        return;
      }
  
      const recipe = await response.json();
  
      // Now render safely (based on your model's fields)
      document.getElementById('recipe-name').textContent = recipe.name;
      document.getElementById('recipe-image').src = recipe.image;
  
      if (Array.isArray(recipe.ingredients)) {
        document.getElementById('recipe-ingredients').innerHTML = recipe.ingredients.map(i => `<p>${i}</p>`).join('');
      }
  
      if (typeof recipe.instructions === 'string') {
        document.getElementById('recipe-instructions').innerHTML = `<p>${recipe.instructions}</p>`;
      }
  
    } catch (err) {
      console.error("Error fetching recipe:", err);
    }
  }
  