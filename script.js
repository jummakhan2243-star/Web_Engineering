// State Management
let recipes = JSON.parse(localStorage.getItem('recipes')) || [];

// DOM Elements
const recipeForm = document.getElementById('recipe-form');
const titleInput = document.getElementById('title');
const ingredientsInput = document.getElementById('ingredients');
const instructionsInput = document.getElementById('instructions');
const imageInput = document.getElementById('image');
const recipeIdInput = document.getElementById('recipe-id');
const existingImageUrlInput = document.getElementById('existing-image-url');

const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');

const recipeList = document.getElementById('recipe-list');
const searchInput = document.getElementById('search-input');
const imagePreview = document.getElementById('image-preview');

const modal = document.getElementById('recipe-modal');
const modalDetails = document.getElementById('modal-details');
const closeModalBtn = document.querySelector('.close-btn');

// Default Image Placeholder
const DEFAULT_IMAGE = 'https://via.placeholder.com/300x200?text=No+Image+Available';

// Initial Render
document.addEventListener('DOMContentLoaded', () => {
    renderRecipes(recipes);
});

// Save to LocalStorage
function saveRecipesToStorage() {
    localStorage.setItem('recipes', JSON.stringify(recipes));
}

// Convert Uploaded Image File to Base64 String
function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Client-Side Form Validation
function validateForm() {
    let isValid = true;

    if (!titleInput.value.trim()) {
        document.getElementById('title-error').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('title-error').style.display = 'none';
    }

    if (!ingredientsInput.value.trim()) {
        document.getElementById('ingredients-error').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('ingredients-error').style.display = 'none';
    }

    if (!instructionsInput.value.trim()) {
        document.getElementById('instructions-error').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('instructions-error').style.display = 'none';
    }

    return isValid;
}

// CREATE / UPDATE Recipe
recipeForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    let imageUrl = existingImageUrlInput.value || DEFAULT_IMAGE;
    
    if (imageInput.files.length > 0) {
        imageUrl = await getBase64(imageInput.files[0]);
    }

    const id = recipeIdInput.value;

    if (id) {
        // UPDATE Operation
        recipes = recipes.map(recipe => {
            if (recipe.id === id) {
                return {
                    id,
                    title: titleInput.value.trim(),
                    ingredients: ingredientsInput.value.split(',').map(i => i.trim()).filter(i => i),
                    instructions: instructionsInput.value.trim(),
                    image: imageUrl
                };
            }
            return recipe;
        });
    } else {
        // CREATE Operation
        const newRecipe = {
            id: Date.now().toString(),
            title: titleInput.value.trim(),
            ingredients: ingredientsInput.value.split(',').map(i => i.trim()).filter(i => i),
            instructions: instructionsInput.value.trim(),
            image: imageUrl
        };
        recipes.push(newRecipe);
    }

    saveRecipesToStorage();
    renderRecipes(recipes);
    resetForm();
});

// READ Operation (Render Cards)
function renderRecipes(recipeArray) {
    recipeList.innerHTML = '';

    if (recipeArray.length === 0) {
        recipeList.innerHTML = '<p>No recipes found. Add one to get started!</p>';
        return;
    }

    recipeArray.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}">
            <div class="recipe-card-content">
                <h3>${recipe.title}</h3>
                <p><strong>Ingredients:</strong> ${recipe.ingredients.slice(0, 3).join(', ')}${recipe.ingredients.length > 3 ? '...' : ''}</p>
                <div class="recipe-card-actions">
                    <button class="btn secondary-btn" onclick="viewRecipe('${recipe.id}')">View</button>
                    <button class="btn primary-btn" onclick="editRecipe('${recipe.id}')">Edit</button>
                    <button class="btn danger-btn" onclick="deleteRecipe('${recipe.id}')">Delete</button>
                </div>
            </div>
        `;
        recipeList.appendChild(card);
    });
}

// VIEW Single Recipe Modal
window.viewRecipe = function(id) {
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;

    modalDetails.innerHTML = `
        <h2>${recipe.title}</h2>
        <img src="${recipe.image}" alt="${recipe.title}" style="width:100%; max-height: 250px; object-fit: cover; border-radius: 8px; margin: 15px 0;">
        <h4>Ingredients:</h4>
        <ul>
            ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}
        </ul>
        <h4 style="margin-top: 15px;">Instructions:</h4>
        <p style="white-space: pre-wrap;">${recipe.instructions}</p>
    `;
    modal.style.display = 'flex';
};

closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});

// EDIT Recipe
window.editRecipe = function(id) {
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;

    recipeIdInput.value = recipe.id;
    titleInput.value = recipe.title;
    ingredientsInput.value = recipe.ingredients.join(', ');
    instructionsInput.value = recipe.instructions;
    existingImageUrlInput.value = recipe.image;

    if (recipe.image) {
        imagePreview.innerHTML = `<img src="${recipe.image}" alt="Preview">`;
    }

    formTitle.textContent = 'Edit Recipe';
    submitBtn.textContent = 'Update Recipe';
    cancelBtn.style.display = 'inline-block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// DELETE Operation
window.deleteRecipe = function(id) {
    if (confirm('Are you sure you want to delete this recipe?')) {
        recipes = recipes.filter(recipe => recipe.id !== id);
        saveRecipesToStorage();
        renderRecipes(recipes);
        if (recipeIdInput.value === id) resetForm();
    }
};

// SEARCH Functionality
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filteredRecipes = recipes.filter(recipe => {
        const titleMatch = recipe.title.toLowerCase().includes(query);
        const ingredientMatch = recipe.ingredients.some(ing => ing.toLowerCase().includes(query));
        return titleMatch || ingredientMatch;
    });
    renderRecipes(filteredRecipes);
});

// Reset Form State
function resetForm() {
    recipeForm.reset();
    recipeIdInput.value = '';
    existingImageUrlInput.value = '';
    imagePreview.innerHTML = '';
    formTitle.textContent = 'Add New Recipe';
    submitBtn.textContent = 'Add Recipe';
    cancelBtn.style.display = 'none';
    
    document.querySelectorAll('.error-msg').forEach(el => el.style.display = 'none');
}

cancelBtn.addEventListener('click', resetForm);