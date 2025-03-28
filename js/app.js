<<<<<<< HEAD
/**
 * HTML5游戏聚合平台 - 通用JavaScript文件
 * 处理网站基本功能如导航、菜单等
 */

// Global state
const appState = {
  gamesData: null,
  currentGame: null,
  userPreferences: {
    theme: 'light',
    favoriteGames: []
  }
};

// DOM Elements
const domElements = {
  gameContainer: document.getElementById('game'),
  mobileMenuButton: document.getElementById('mobile-menu-button'),
  mobileMenu: document.getElementById('mobile-menu')
};

/**
 * Initialize the application
 */
function initApp() {
  // Load game data
  loadGameData();
  
  // Setup event listeners
  setupEventListeners();
  
  // Load user preferences from localStorage
  loadUserPreferences();
  
  // Add smooth scrolling to all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80, // Accounting for fixed header
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Check if we need to load a specific game
  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get('game');
  
  if (gameId) {
    loadSpecificGame(gameId);
  }
}

/**
 * Load game data from JSON file
 */
function loadGameData() {
  fetch('/data/games.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      appState.gamesData = data;
      console.log('Game data loaded successfully', data);
      
      // Set current game to the first game in the list (Monster Survivors)
      appState.currentGame = data[0];
    })
    .catch(error => {
      console.error('Error loading game data:', error);
    });
}

/**
 * Load a specific game by ID
 * @param {string} gameId - The ID of the game to load
 */
function loadSpecificGame(gameId) {
  if (!appState.gamesData) {
    // If game data isn't loaded yet, retry after a delay
    setTimeout(() => loadSpecificGame(gameId), 500);
    return;
  }
  
  const game = appState.gamesData.find(g => g.id === gameId);
  
  if (game) {
    appState.currentGame = game;
    updateGameUI(game);
  } else {
    console.error(`Game with ID "${gameId}" not found`);
  }
}

/**
 * Update the game UI based on the selected game
 * @param {Object} game - The game data
 */
function updateGameUI(game) {
  // Update page title
  document.title = `${game.name} - Play Online for Free`;
  
  // Update game iframe
  const iframe = document.querySelector('#game iframe');
  if (iframe && game.url) {
    iframe.src = game.url;
  }
  
  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.content = game.description;
  }
}

/**
 * Setup event listeners for UI interactions
 */
function setupEventListeners() {
  // Mobile menu toggle
  if (domElements.mobileMenuButton && domElements.mobileMenu) {
    domElements.mobileMenuButton.addEventListener('click', () => {
      domElements.mobileMenu.classList.toggle('hidden');
    });
    
    // Close mobile menu when clicking on a link
    const mobileLinks = domElements.mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        domElements.mobileMenu.classList.add('hidden');
      });
    });
  }
  
  // Handle game rating interactions
  document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('rating-star')) {
      handleRating(e);
    }
  });
}

/**
 * Handle game rating
 * @param {Event} e - Click event
 */
function handleRating(e) {
  const rating = parseInt(e.target.dataset.rating);
  const gameId = e.target.dataset.gameId;
  
  if (rating && gameId) {
    // Save rating (in a real app, this would be sent to a server)
    console.log(`Game ${gameId} rated ${rating} stars`);
    
    // Show confirmation
    alert(`Thanks for rating ${rating} stars!`);
    
    // Store in user preferences
    saveUserRating(gameId, rating);
  }
}

/**
 * Save user rating in preferences
 * @param {string} gameId - The ID of the rated game
 * @param {number} rating - The rating value (1-5)
 */
function saveUserRating(gameId, rating) {
  if (!appState.userPreferences.ratings) {
    appState.userPreferences.ratings = {};
  }
  
  appState.userPreferences.ratings[gameId] = rating;
  
  // Save to localStorage
  localStorage.setItem('userPreferences', JSON.stringify(appState.userPreferences));
}

/**
 * Load user preferences from localStorage
 */
function loadUserPreferences() {
  const savedPreferences = localStorage.getItem('userPreferences');
  
  if (savedPreferences) {
    try {
      appState.userPreferences = JSON.parse(savedPreferences);
    } catch (e) {
      console.error('Error parsing user preferences', e);
    }
  }
}

/**
 * Save game to favorites
 * @param {string} gameId - The ID of the game to favorite
 */
function toggleFavorite(gameId) {
  if (!appState.userPreferences.favoriteGames) {
    appState.userPreferences.favoriteGames = [];
  }
  
  const index = appState.userPreferences.favoriteGames.indexOf(gameId);
  
  if (index === -1) {
    // Add to favorites
    appState.userPreferences.favoriteGames.push(gameId);
  } else {
    // Remove from favorites
    appState.userPreferences.favoriteGames.splice(index, 1);
  }
  
  // Save to localStorage
  localStorage.setItem('userPreferences', JSON.stringify(appState.userPreferences));
  
  // Update UI
  updateFavoritesUI();
}

/**
 * Update favorites UI
 */
function updateFavoritesUI() {
  const favoriteButtons = document.querySelectorAll('.favorite-button');
  
  favoriteButtons.forEach(button => {
    const gameId = button.dataset.gameId;
    const isFavorite = appState.userPreferences.favoriteGames &&
                       appState.userPreferences.favoriteGames.includes(gameId);
    
    if (isFavorite) {
      button.classList.add('favorite-active');
      button.setAttribute('aria-label', 'Remove from favorites');
    } else {
      button.classList.remove('favorite-active');
      button.setAttribute('aria-label', 'Add to favorites');
    }
  });
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);

/**
 * 等待DOM加载完成
 */
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initSmoothScroll();
  initAnimations();
});

/**
 * 初始化移动端菜单
 */
function initMobileMenu() {
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (!mobileMenuButton || !mobileMenu) return;
  
  // 点击菜单按钮切换菜单显示状态
  mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });

  // 点击菜单链接后关闭菜单
  const mobileLinks = mobileMenu.querySelectorAll('a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
    });
  });
  
  // 点击页面其他区域关闭菜单
  document.addEventListener('click', (e) => {
    if (!mobileMenuButton.contains(e.target) && !mobileMenu.contains(e.target) && !mobileMenu.classList.contains('hidden')) {
      mobileMenu.classList.add('hidden');
    }
  });
}

/**
 * 初始化平滑滚动
 */
function initSmoothScroll() {
  // 获取所有锚点链接
  const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
  
  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        // 获取导航栏高度，用于偏移
        const navHeight = document.querySelector('nav').offsetHeight;
        
        window.scrollTo({
          top: targetElement.offsetTop - navHeight,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * 初始化页面动画
 */
function initAnimations() {
  // 当元素进入视口时添加动画类
  const animateOnScroll = () => {
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
      const sectionTop = section.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      
      if (sectionTop < windowHeight * 0.75) {
        section.classList.add('animated');
      }
    });
  };
  
  // 初始运行一次
  animateOnScroll();
  
  // 滚动时运行
  window.addEventListener('scroll', animateOnScroll);
}

/**
 * 处理收藏功能
 * @param {string} gameId - 游戏ID
 * @returns {boolean} - 是否已收藏
 */
function toggleFavorite(gameId) {
  // 从本地存储获取收藏的游戏
  let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  
  // 检查游戏是否已收藏
  const isFavorited = favorites.includes(gameId);
  
  if (isFavorited) {
    // 如果已收藏，移除收藏
    favorites = favorites.filter(id => id !== gameId);
  } else {
    // 如果未收藏，添加收藏
    favorites.push(gameId);
  }
  
  // 更新本地存储
  localStorage.setItem('favorites', JSON.stringify(favorites));
  
  return !isFavorited;
}

/**
 * 检查游戏是否已收藏
 * @param {string} gameId - 游戏ID
 * @returns {boolean} - 是否已收藏
 */
function isFavorited(gameId) {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  return favorites.includes(gameId);
}

/**
 * 获取用户评分
 * @param {string} gameId - 游戏ID
 * @returns {number|null} - 用户评分，未评分返回null
 */
function getUserRating(gameId) {
  const ratings = JSON.parse(localStorage.getItem('ratings') || '{}');
  return ratings[gameId] || null;
}

/**
 * 设置用户评分
 * @param {string} gameId - 游戏ID
 * @param {number} rating - 评分（1-5）
 */
function setUserRating(gameId, rating) {
  const ratings = JSON.parse(localStorage.getItem('ratings') || '{}');
  ratings[gameId] = rating;
  localStorage.setItem('ratings', JSON.stringify(ratings));
} 
=======
/**
 * Monster Survivors - Main Application Logic
 * Handles game data loading, UI interactions, and game integration
 */

// Global state
const appState = {
  gamesData: null,
  currentGame: null,
  userPreferences: {
    theme: 'light',
    favoriteGames: []
  }
};

// DOM Elements
const domElements = {
  gameContainer: document.getElementById('game'),
  mobileMenuButton: document.getElementById('mobile-menu-button'),
  mobileMenu: document.getElementById('mobile-menu')
};

/**
 * Initialize the application
 */
function initApp() {
  // Load game data
  loadGameData();
  
  // Setup event listeners
  setupEventListeners();
  
  // Load user preferences from localStorage
  loadUserPreferences();
  
  // Add smooth scrolling to all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80, // Accounting for fixed header
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Check if we need to load a specific game
  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get('game');
  
  if (gameId) {
    loadSpecificGame(gameId);
  }
}

/**
 * Load game data from JSON file
 */
function loadGameData() {
  fetch('/data/games.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      appState.gamesData = data;
      console.log('Game data loaded successfully', data);
      
      // Set current game to the first game in the list (Monster Survivors)
      appState.currentGame = data[0];
    })
    .catch(error => {
      console.error('Error loading game data:', error);
    });
}

/**
 * Load a specific game by ID
 * @param {string} gameId - The ID of the game to load
 */
function loadSpecificGame(gameId) {
  if (!appState.gamesData) {
    // If game data isn't loaded yet, retry after a delay
    setTimeout(() => loadSpecificGame(gameId), 500);
    return;
  }
  
  const game = appState.gamesData.find(g => g.id === gameId);
  
  if (game) {
    appState.currentGame = game;
    updateGameUI(game);
  } else {
    console.error(`Game with ID "${gameId}" not found`);
  }
}

/**
 * Update the game UI based on the selected game
 * @param {Object} game - The game data
 */
function updateGameUI(game) {
  // Update page title
  document.title = `${game.name} - Play Online for Free`;
  
  // Update game iframe
  const iframe = document.querySelector('#game iframe');
  if (iframe && game.url) {
    iframe.src = game.url;
  }
  
  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.content = game.description;
  }
}

/**
 * Setup event listeners for UI interactions
 */
function setupEventListeners() {
  // Mobile menu toggle
  if (domElements.mobileMenuButton && domElements.mobileMenu) {
    domElements.mobileMenuButton.addEventListener('click', () => {
      domElements.mobileMenu.classList.toggle('hidden');
    });
    
    // Close mobile menu when clicking on a link
    const mobileLinks = domElements.mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        domElements.mobileMenu.classList.add('hidden');
      });
    });
  }
  
  // Handle game rating interactions
  document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('rating-star')) {
      handleRating(e);
    }
  });
}

/**
 * Handle game rating
 * @param {Event} e - Click event
 */
function handleRating(e) {
  const rating = parseInt(e.target.dataset.rating);
  const gameId = e.target.dataset.gameId;
  
  if (rating && gameId) {
    // Save rating (in a real app, this would be sent to a server)
    console.log(`Game ${gameId} rated ${rating} stars`);
    
    // Show confirmation
    alert(`Thanks for rating ${rating} stars!`);
    
    // Store in user preferences
    saveUserRating(gameId, rating);
  }
}

/**
 * Save user rating in preferences
 * @param {string} gameId - The ID of the rated game
 * @param {number} rating - The rating value (1-5)
 */
function saveUserRating(gameId, rating) {
  if (!appState.userPreferences.ratings) {
    appState.userPreferences.ratings = {};
  }
  
  appState.userPreferences.ratings[gameId] = rating;
  
  // Save to localStorage
  localStorage.setItem('userPreferences', JSON.stringify(appState.userPreferences));
}

/**
 * Load user preferences from localStorage
 */
function loadUserPreferences() {
  const savedPreferences = localStorage.getItem('userPreferences');
  
  if (savedPreferences) {
    try {
      appState.userPreferences = JSON.parse(savedPreferences);
    } catch (e) {
      console.error('Error parsing user preferences', e);
    }
  }
}

/**
 * Save game to favorites
 * @param {string} gameId - The ID of the game to favorite
 */
function toggleFavorite(gameId) {
  if (!appState.userPreferences.favoriteGames) {
    appState.userPreferences.favoriteGames = [];
  }
  
  const index = appState.userPreferences.favoriteGames.indexOf(gameId);
  
  if (index === -1) {
    // Add to favorites
    appState.userPreferences.favoriteGames.push(gameId);
  } else {
    // Remove from favorites
    appState.userPreferences.favoriteGames.splice(index, 1);
  }
  
  // Save to localStorage
  localStorage.setItem('userPreferences', JSON.stringify(appState.userPreferences));
  
  // Update UI
  updateFavoritesUI();
}

/**
 * Update favorites UI
 */
function updateFavoritesUI() {
  const favoriteButtons = document.querySelectorAll('.favorite-button');
  
  favoriteButtons.forEach(button => {
    const gameId = button.dataset.gameId;
    const isFavorite = appState.userPreferences.favoriteGames &&
                       appState.userPreferences.favoriteGames.includes(gameId);
    
    if (isFavorite) {
      button.classList.add('favorite-active');
      button.setAttribute('aria-label', 'Remove from favorites');
    } else {
      button.classList.remove('favorite-active');
      button.setAttribute('aria-label', 'Add to favorites');
    }
  });
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp); 
>>>>>>> 626d157b4157301c451b3c83aa5b4b36721d1f1d
