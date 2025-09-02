// [SECTION 1] State & Storage
import { NavIcons, UIIcons, getCategoryIcon, getRecipeIcon } from './icons.js';

const state = {
  currentTab: 'home',
  searchQuery: '',
  activeCategory: 'all',
  quickFilters: {
    'quick-time': false,
    'easy': false,
    'vegan': false
  },
  favorites: [],
  shoppingList: [],
  servings: {}, // recipeId -> currentServings
  detailRecipeId: null
};

// localStorage helpers
const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }
};

// Load saved state
state.currentTab = storage.get('lastTab', 'home');
state.favorites = storage.get('favorites', []);
state.shoppingList = storage.get('shoppingList', []);
state.servings = storage.get('servings', {});

// [SECTION 2] Utils
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const debounce = (fn, delay = 200) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(null, args), delay);
  };
};

const scaleQty = (baseQty, baseServings, currentServings) => {
  const scaled = (baseQty * currentServings) / baseServings;
  return Math.round(scaled * 4) / 4; // Round to nearest 0.25
};

const formatUnit = (qty, unit) => {
  if (qty === 1 && unit === 'pcs') return '1 pc';
  if (qty < 1 && unit === 'cup') return `${qty * 16} tbsp`;
  if (qty < 0.25 && unit === 'tbsp') return `${qty * 3} tsp`;
  return `${qty} ${unit}`;
};

// [SECTION 3] Router
const router = {
  currentRoute: null,
  
  init() {
    window.addEventListener('hashchange', this.handleRoute.bind(this));
    this.handleRoute();
  },
  
  handleRoute() {
    const hash = window.location.hash.slice(1) || 'home';
    const [route, param] = hash.split('/');
    
    this.currentRoute = { route, param };
    
    // Update active tab
    if (['home', 'favorites', 'list', 'profile'].includes(route)) {
      state.currentTab = route;
      storage.set('lastTab', route);
      this.updateActiveTab();
    }
    
    // Handle recipe detail route
    if (route === 'recipe' && param) {
      state.detailRecipeId = parseInt(param);
      this.openRecipeDetail(state.detailRecipeId);
      return;
    }
    
    // Close detail sheet if open
    if (state.detailRecipeId) {
      this.closeRecipeDetail();
    }
    
    // Render appropriate view
    this.renderCurrentView();
  },
  
  updateActiveTab() {
    $$('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.tab === state.currentTab);
    });
  },
  
  navigate(route) {
    window.location.hash = route;
  },
  
  openRecipeDetail(recipeId) {
    state.detailRecipeId = recipeId;
    const overlay = $('#detail-overlay');
    overlay.classList.add('visible');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Render detail content (will be implemented in next section)
    // renderRecipeDetail(recipeId);
  },
  
  closeRecipeDetail() {
    state.detailRecipeId = null;
    const overlay = $('#detail-overlay');
    overlay.classList.remove('visible');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    // Navigate back to current tab
    this.navigate(state.currentTab);
  },
  
  renderCurrentView() {
    const mainContent = $('#main-content');
    
    switch (state.currentTab) {
      case 'home':
        recipeRenderer.currentPage = 1; // Reset pagination
        recipeRenderer.renderRecipeList();
        break;
      case 'favorites':
        recipeRenderer.renderFavorites();
        break;
      case 'list':
        shoppingListManager.renderShoppingList();
        break;
      case 'profile':
        mainContent.innerHTML = `
          <div style="text-align: center; padding: 40px 20px;">
            <div class="empty-icon">${this.renderUserIcon()}</div>
            <h2>Profile</h2>
            <p style="color: var(--muted);">Coming soon...</p>
          </div>
        `;
        break;
    }
  },
  
  renderUserIcon() {
    return `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
  }
};

// [SECTION 4] Render: Home/List  
const recipeRenderer = {
  currentPage: 1,
  itemsPerPage: 6,
  
  filterRecipes(recipes) {
    let filtered = [...recipes];
    
    // Search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(recipe => 
        recipe.title.toLowerCase().includes(query) ||
        recipe.ingredients.some(ing => ing.name.toLowerCase().includes(query))
      );
    }
    
    // Category filter
    if (state.activeCategory !== 'all') {
      filtered = filtered.filter(recipe => {
        if (state.activeCategory === 'quick') {
          return recipe.timeMinutes <= 30;
        }
        return recipe.categories.includes(state.activeCategory) || 
               recipe.tags.includes(state.activeCategory);
      });
    }
    
    // Quick filters
    if (state.quickFilters['quick-time']) {
      filtered = filtered.filter(recipe => recipe.timeMinutes < 30);
    }
    if (state.quickFilters['easy']) {
      filtered = filtered.filter(recipe => recipe.difficulty === 'easy');
    }
    if (state.quickFilters['vegan']) {
      filtered = filtered.filter(recipe => recipe.tags.includes('vegan'));
    }
    
    return filtered;
  },
  
  renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let starsHtml = '';
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        starsHtml += '<span class="star filled">★</span>';
      } else if (i === fullStars && hasHalf) {
        starsHtml += '<span class="star half">★</span>';
      } else {
        starsHtml += '<span class="star empty">☆</span>';
      }
    }
    
    return starsHtml;
  },
  
  renderRecipeCard(recipe) {
    const isFavorited = state.favorites.includes(recipe.id);
    const starsHtml = this.renderStars(recipe.rating);
    
    return `
      <div class="recipe-card" data-recipe-id="${recipe.id}">
        <div class="recipe-thumb">
          <img src="${recipe.imageUrl}" alt="${recipe.title}" class="recipe-image" />
          <button class="heart-btn ${isFavorited ? 'favorited' : ''}" 
                  data-recipe-id="${recipe.id}" 
                  aria-label="${isFavorited ? 'Remove from favorites' : 'Add to favorites'}">
            <div class="heart-icon ${isFavorited ? 'filled' : 'empty'}">${this.renderIcon(NavIcons.Heart)}</div>
          </button>
        </div>
        <div class="recipe-info">
          <h3 class="recipe-title">${recipe.title}</h3>
          <div class="recipe-meta">
            <div class="rating">${starsHtml}</div>
            <div>${recipe.timeMinutes}min • ${recipe.difficulty}</div>
          </div>
        </div>
      </div>
    `;
  },
  
  renderIcon(IconComponent) {
    // Create a temporary container to render the React component as HTML
    const iconContainer = document.createElement('div');
    iconContainer.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></svg>`;
    return iconContainer.innerHTML;
  },
  
  renderRecipeList() {
    const mainContent = $('#main-content');
    
    // Import recipes from data.js
    import('./data.js').then(({ recipes }) => {
      const filtered = this.filterRecipes(recipes);
      const totalItems = filtered.length;
      const itemsToShow = this.currentPage * this.itemsPerPage;
      const visibleRecipes = filtered.slice(0, itemsToShow);
      
      if (filtered.length === 0) {
        mainContent.innerHTML = `
          <div style="text-align: center; padding: 40px 20px;">
            <div class="empty-icon">${this.renderSearchIcon()}</div>
            <h2>No recipes found</h2>
            <p style="color: var(--muted);">Try adjusting your search or filters</p>
          </div>
        `;
        return;
      }
      
      const cardsHtml = visibleRecipes.map(recipe => this.renderRecipeCard(recipe)).join('');
      const showLoadMore = itemsToShow < totalItems;
      
      mainContent.innerHTML = `
        <div class="recipe-grid">
          ${cardsHtml}
        </div>
        ${showLoadMore ? `
          <div style="text-align: center; padding: 20px;">
            <button class="btn-primary" id="load-more">
              Load More (${totalItems - itemsToShow} remaining)
            </button>
          </div>
        ` : ''}
      `;
      
      // Bind load more
      const loadMoreBtn = $('#load-more');
      if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
          this.currentPage++;
          this.renderRecipeList();
        });
      }
    });
  },
  
  renderFavorites() {
    const mainContent = $('#main-content');
    
    if (state.favorites.length === 0) {
      mainContent.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <div class="empty-icon">${this.renderHeartIcon()}</div>
          <h2>No favorites yet</h2>
          <p style="color: var(--muted);">Heart some recipes to see them here</p>
        </div>
      `;
      return;
    }
    
    import('./data.js').then(({ recipes }) => {
      const favoriteRecipes = recipes.filter(recipe => state.favorites.includes(recipe.id));
      const cardsHtml = favoriteRecipes.map(recipe => this.renderRecipeCard(recipe)).join('');
      
      mainContent.innerHTML = `
        <div class="recipe-grid">
          ${cardsHtml}
        </div>
      `;
    });
  },
  
  renderSearchIcon() {
    return `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`;
  },
  
  renderHeartIcon() {
    return `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
  }
};

// [SECTION 5] Render: Detail Sheet
const detailRenderer = {
  renderRecipeDetail(recipeId) {
    import('./data.js').then(({ recipes }) => {
      const recipe = recipes.find(r => r.id === recipeId);
      if (!recipe) return;
      
      const currentServings = state.servings[recipeId] || recipe.servingsBase;
      const isFavorited = state.favorites.includes(recipeId);
      const starsHtml = recipeRenderer.renderStars(recipe.rating);
      
      const detailContent = $('#detail-content');
      detailContent.innerHTML = `
        <div class="detail-header">
          <button class="close-btn" aria-label="Close recipe details">
            ${this.renderCloseIcon()}
          </button>
          <div class="detail-thumb">
            <img src="${recipe.imageUrl}" alt="${recipe.title}" class="detail-image" />
          </div>
          <h2 class="detail-title">${recipe.title}</h2>
          <div class="detail-meta">
            <div class="rating">${starsHtml}</div>
            <div>${recipe.timeMinutes}min • ${recipe.difficulty}</div>
            <div>${recipe.calories} cal</div>
          </div>
        </div>
        
        <div class="detail-body">
          <div class="servings-section">
            <h3>Servings</h3>
            <div class="servings-stepper">
              <button class="stepper-btn" data-action="decrease" ${currentServings <= 1 ? 'disabled' : ''}>
                ${this.renderMinusIcon()}
              </button>
              <span class="servings-count">${currentServings}</span>
              <button class="stepper-btn" data-action="increase" ${currentServings >= 12 ? 'disabled' : ''}>
                ${this.renderPlusIcon()}
              </button>
            </div>
          </div>
          
          <div class="ingredients-section">
            <h3>Ingredients</h3>
            <ul class="ingredients-list">
              ${this.renderScaledIngredients(recipe, currentServings)}
            </ul>
          </div>
          
          <div class="steps-section">
            <h3>Instructions</h3>
            <ol class="steps-list">
              ${recipe.steps.map(step => `<li>${step}</li>`).join('')}
            </ol>
          </div>
          
          <div class="detail-actions">
            <button class="btn-secondary" id="add-to-list-btn">
              ${this.renderListIcon()} Add all to Shopping List
            </button>
            <button class="btn-primary ${isFavorited ? 'favorited' : ''}" id="favorite-btn">
              ${this.renderHeartIcon()} ${isFavorited ? 'Favorited' : 'Favorite'}
            </button>
          </div>
        </div>
      `;
      
      this.bindDetailEvents(recipeId);
    });
  },
  
  renderCloseIcon() {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  },
  
  renderRecipeIcon(IconComponent) {
    return `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>`;
  },
  
  renderMinusIcon() {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
  },
  
  renderPlusIcon() {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
  },
  
  renderListIcon() {
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`;
  },
  
  renderHeartIcon() {
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
  },
  
  renderScaledIngredients(recipe, currentServings) {
    return recipe.ingredients.map(ingredient => {
      const scaledQty = scaleQty(ingredient.quantityBase, recipe.servingsBase, currentServings);
      const formattedUnit = formatUnit(scaledQty, ingredient.unit);
      return `<li>${formattedUnit} ${ingredient.name}</li>`;
    }).join('');
  },
  
  bindDetailEvents(recipeId) {
    // Close button
    const closeBtn = $('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => router.closeRecipeDetail());
    }
    
    // Servings stepper
    const stepperBtns = $$('.stepper-btn');
    stepperBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        this.updateServings(recipeId, action);
      });
    });
    
    // Favorite button
    const favoriteBtn = $('#favorite-btn');
    if (favoriteBtn) {
      favoriteBtn.addEventListener('click', () => {
        eventHandlers.toggleFavorite(recipeId);
        this.renderRecipeDetail(recipeId); // Re-render to update button
      });
    }
    
    // Add to shopping list button
    const addToListBtn = $('#add-to-list-btn');
    if (addToListBtn) {
      addToListBtn.addEventListener('click', () => {
        shoppingListManager.addRecipeToList(recipeId);
      });
    }
  },
  
  updateServings(recipeId, action) {
    import('./data.js').then(({ recipes }) => {
      const recipe = recipes.find(r => r.id === recipeId);
      if (!recipe) return;
      
      const currentServings = state.servings[recipeId] || recipe.servingsBase;
      let newServings = currentServings;
      
      if (action === 'increase' && currentServings < 12) {
        newServings = currentServings + 1;
      } else if (action === 'decrease' && currentServings > 1) {
        newServings = currentServings - 1;
      }
      
      if (newServings !== currentServings) {
        state.servings[recipeId] = newServings;
        storage.set('servings', state.servings);
        
        // Update servings display and ingredients
        const servingsCount = $('.servings-count');
        const ingredientsList = $('.ingredients-list');
        const decreaseBtn = $('.stepper-btn[data-action="decrease"]');
        const increaseBtn = $('.stepper-btn[data-action="increase"]');
        
        if (servingsCount) servingsCount.textContent = newServings;
        if (ingredientsList) ingredientsList.innerHTML = this.renderScaledIngredients(recipe, newServings);
        if (decreaseBtn) decreaseBtn.disabled = newServings <= 1;
        if (increaseBtn) increaseBtn.disabled = newServings >= 12;
      }
    });
  }
};

// Update router to use detailRenderer
router.openRecipeDetail = function(recipeId) {
  state.detailRecipeId = recipeId;
  const overlay = $('#detail-overlay');
  overlay.classList.add('visible');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  
  detailRenderer.renderRecipeDetail(recipeId);
};

// [SECTION 6] Favorites & Shopping List
const favoritesManager = {
  toggleFavorite(recipeId) {
    const index = state.favorites.indexOf(recipeId);
    if (index === -1) {
      state.favorites.push(recipeId);
    } else {
      state.favorites.splice(index, 1);
    }
    
    storage.set('favorites', state.favorites);
    
    // Update UI immediately
    this.updateFavoriteButtons(recipeId);
    
    // Re-render current view if needed
    if (state.currentTab === 'favorites') {
      recipeRenderer.renderFavorites();
    }
  },
  
  updateFavoriteButtons(recipeId) {
    const isFavorited = state.favorites.includes(recipeId);
    
    // Update heart buttons in recipe cards
    const heartBtns = $$(`[data-recipe-id="${recipeId}"].heart-btn`);
    heartBtns.forEach(btn => {
      btn.classList.toggle('favorited', isFavorited);
      const heartIcon = btn.querySelector('.heart-icon');
      if (heartIcon) {
        heartIcon.classList.toggle('filled', isFavorited);
        heartIcon.classList.toggle('empty', !isFavorited);
      }
      btn.setAttribute('aria-label', isFavorited ? 'Remove from favorites' : 'Add to favorites');
    });
    
    // Update favorite button in detail sheet
    const detailFavoriteBtn = $('#favorite-btn');
    if (detailFavoriteBtn) {
      detailFavoriteBtn.classList.toggle('favorited', isFavorited);
      detailFavoriteBtn.innerHTML = `${detailRenderer.renderHeartIcon()} ${isFavorited ? 'Favorited' : 'Favorite'}`;
    }
  }
};

const shoppingListManager = {
  addRecipeToList(recipeId) {
    import('./data.js').then(({ recipes }) => {
      const recipe = recipes.find(r => r.id === recipeId);
      if (!recipe) return;
      
      const currentServings = state.servings[recipeId] || recipe.servingsBase;
      
      recipe.ingredients.forEach(ingredient => {
        const scaledQty = scaleQty(ingredient.quantityBase, recipe.servingsBase, currentServings);
        this.addIngredientToList(ingredient.name, scaledQty, ingredient.unit);
      });
      
      storage.set('shoppingList', state.shoppingList);
      
      // Show feedback
      this.showAddedFeedback();
    });
  },
  
  addIngredientToList(name, quantity, unit) {
    const existingIndex = state.shoppingList.findIndex(item => 
      item.name.toLowerCase() === name.toLowerCase() && item.unit === unit
    );
    
    if (existingIndex !== -1) {
      // Merge quantities
      state.shoppingList[existingIndex].quantity += quantity;
    } else {
      // Add new item
      state.shoppingList.push({
        id: Date.now() + Math.random(),
        name,
        quantity,
        unit,
        checked: false
      });
    }
  },
  
  toggleItemCheck(itemId) {
    const item = state.shoppingList.find(item => item.id === itemId);
    if (item) {
      item.checked = !item.checked;
      storage.set('shoppingList', state.shoppingList);
      this.renderShoppingList();
    }
  },
  
  clearCheckedItems() {
    state.shoppingList = state.shoppingList.filter(item => !item.checked);
    storage.set('shoppingList', state.shoppingList);
    this.renderShoppingList();
  },
  
  clearAllItems() {
    state.shoppingList = [];
    storage.set('shoppingList', state.shoppingList);
    this.renderShoppingList();
  },
  
  renderShoppingList() {
    const mainContent = $('#main-content');
    
    if (state.shoppingList.length === 0) {
      mainContent.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <div class="empty-icon">${this.renderListIconLarge()}</div>
          <h2>Shopping List Empty</h2>
          <p style="color: var(--muted);">Add ingredients from recipes to get started</p>
        </div>
      `;
      return;
    }
    
    const checkedCount = state.shoppingList.filter(item => item.checked).length;
    const totalCount = state.shoppingList.length;
    
    const itemsHtml = state.shoppingList.map(item => `
      <div class="shopping-item ${item.checked ? 'checked' : ''}" data-item-id="${item.id}">
        <button class="check-btn" aria-label="${item.checked ? 'Uncheck' : 'Check'} ${item.name}">
          ${item.checked ? this.renderCheckIcon() : this.renderCircleIcon()}
        </button>
        <div class="item-info">
          <span class="item-name">${item.name}</span>
          <span class="item-quantity">${formatUnit(item.quantity, item.unit)}</span>
        </div>
      </div>
    `).join('');
    
    mainContent.innerHTML = `
      <div class="shopping-header">
        <h2>Shopping List</h2>
        <div class="shopping-progress">
          ${checkedCount} of ${totalCount} items
        </div>
      </div>
      
      <div class="shopping-actions">
        <button class="btn-secondary" id="clear-checked-btn" ${checkedCount === 0 ? 'disabled' : ''}>
          Clear Checked (${checkedCount})
        </button>
        <button class="btn-danger" id="clear-all-btn">
          Clear All
        </button>
      </div>
      
      <div class="shopping-list">
        ${itemsHtml}
      </div>
    `;
    
    this.bindShoppingListEvents();
  },
  
  bindShoppingListEvents() {
    // Check/uncheck items
    const checkBtns = $$('.check-btn');
    checkBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = parseInt(e.target.closest('.shopping-item').dataset.itemId);
        this.toggleItemCheck(itemId);
      });
    });
    
    // Clear buttons
    const clearCheckedBtn = $('#clear-checked-btn');
    if (clearCheckedBtn) {
      clearCheckedBtn.addEventListener('click', () => this.clearCheckedItems());
    }
    
    const clearAllBtn = $('#clear-all-btn');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        if (confirm('Clear all items from shopping list?')) {
          this.clearAllItems();
        }
      });
    }
  },
  
  renderListIconLarge() {
    return `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`;
  },
  
  renderCheckIcon() {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>`;
  },
  
  renderCircleIcon() {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`;
  },
  
  showAddedFeedback() {
    // Simple feedback - could be enhanced with toast notification
    const addToListBtn = $('#add-to-list-btn');
    if (addToListBtn) {
      const originalText = addToListBtn.innerHTML;
      addToListBtn.innerHTML = '✅ Added to List!';
      addToListBtn.disabled = true;
      
      setTimeout(() => {
        addToListBtn.innerHTML = originalText;
        addToListBtn.disabled = false;
      }, 2000);
    }
  }
};
// [SECTION 7] Events & Init
const eventHandlers = {
  init() {
    this.bindSearch();
    this.bindCategoryChips();
    this.bindQuickFilters();
    this.bindBottomNav();
    this.bindRecipeCards();
    this.bindDetailOverlay();
    this.initializeIcons();
    this.loadSavedState();
    
    // Initialize router
    router.init();
  },
  
  bindSearch() {
    const searchInput = $('#search');
    if (searchInput) {
      const debouncedSearch = debounce((query) => {
        state.searchQuery = query;
        recipeRenderer.currentPage = 1;
        if (state.currentTab === 'home') {
          recipeRenderer.renderRecipeList();
        }
      });
      
      searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value.trim());
      });
    }
  },
  
  bindCategoryChips() {
    const chips = $$('.chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        // Update active chip
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        
        // Update state
        state.activeCategory = chip.dataset.category;
        recipeRenderer.currentPage = 1;
        
        if (state.currentTab === 'home') {
          recipeRenderer.renderRecipeList();
        }
      });
    });
  },
  
  bindQuickFilters() {
    const filters = $$('.filter-toggle');
    filters.forEach(filter => {
      filter.addEventListener('click', () => {
        const filterType = filter.dataset.filter;
        state.quickFilters[filterType] = !state.quickFilters[filterType];
        filter.classList.toggle('active', state.quickFilters[filterType]);
        
        recipeRenderer.currentPage = 1;
        if (state.currentTab === 'home') {
          recipeRenderer.renderRecipeList();
        }
      });
    });
  },
  
  bindBottomNav() {
    const navItems = $$('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const tab = item.dataset.tab;
        router.navigate(tab);
      });
    });
  },
  
  bindRecipeCards() {
    // Use event delegation for dynamically created cards
    const mainContent = $('#main-content');
    
    mainContent.addEventListener('click', (e) => {
      // Handle recipe card clicks
      const recipeCard = e.target.closest('.recipe-card');
      if (recipeCard && !e.target.closest('.heart-btn')) {
        const recipeId = parseInt(recipeCard.dataset.recipeId);
        router.navigate(`recipe/${recipeId}`);
        return;
      }
      
      // Handle favorite button clicks
      const heartBtn = e.target.closest('.heart-btn');
      if (heartBtn) {
        e.stopPropagation();
        const recipeId = parseInt(heartBtn.dataset.recipeId);
        this.toggleFavorite(recipeId);
        return;
      }
    });
  },
  
  bindDetailOverlay() {
    const overlay = $('#detail-overlay');
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        router.closeRecipeDetail();
      }
    });
    
    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.detailRecipeId) {
        router.closeRecipeDetail();
      }
    });
  },
  
  toggleFavorite(recipeId) {
    favoritesManager.toggleFavorite(recipeId);
  },
  
  loadSavedState() {
    // State is already loaded in the state initialization
    // Just need to update UI to reflect saved filters
    const activeChip = $(`.chip[data-category="${state.activeCategory}"]`);
    if (activeChip) {
      $$('.chip').forEach(c => c.classList.remove('active'));
      activeChip.classList.add('active');
    }
    
    // Update quick filter UI
    Object.entries(state.quickFilters).forEach(([filter, active]) => {
      const filterEl = $(`.filter-toggle[data-filter="${filter}"]`);
      if (filterEl) {
        filterEl.classList.toggle('active', active);
      }
    });
  },
  
  initializeIcons() {
    // Initialize navigation icons
    const navIcons = {
      home: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>`,
      heart: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
      list: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
      user: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
    };
    
    const filterIcons = {
      clock: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>`,
      check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>`,
      leaf: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`
    };
    
    // Replace navigation icons
    $$('.nav-icon').forEach(icon => {
      const iconType = icon.dataset.icon;
      if (navIcons[iconType]) {
        icon.innerHTML = navIcons[iconType];
      }
    });
    
    // Replace filter icons
    $$('.filter-icon').forEach(icon => {
      const iconType = icon.dataset.icon;
      if (filterIcons[iconType]) {
        icon.innerHTML = filterIcons[iconType];
      }
    });
  }
};

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => eventHandlers.init());
} else {
  eventHandlers.init();
}
// TODO: Implement event bindings and initialization