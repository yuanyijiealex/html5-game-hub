/**
 * HTML5游戏聚合平台 - 游戏详情页面脚本
 * 处理单个游戏的详细信息加载和交互功能
 */

// 游戏详情页面状态
const detailState = {
  currentGame: null,    // 当前游戏数据
  allGames: [],         // 所有游戏数据（用于相关游戏推荐）
  relatedGames: [],     // 相关游戏推荐列表
  userRating: 0,         // 用户对当前游戏的评分
  favorites: []          // 用户收藏的游戏
};

// DOM元素
const detailElements = {
  // 加载状态
  gameLoading: document.getElementById('game-loading'),
  gameContent: document.getElementById('game-content'),
  
  // 游戏详情元素
  gameTitle: document.getElementById('game-title'),
  gameRating: document.getElementById('game-rating'),
  gameRatingCount: document.getElementById('game-rating-count'),
  gameTags: document.getElementById('game-tags'),
  gameDescription: document.getElementById('game-description'),
  gameFeatures: document.getElementById('game-features'),
  gameInstructions: document.getElementById('game-instructions'),
  gameFrame: document.getElementById('game-frame'),
  
  // 收藏按钮
  favoriteButton: document.getElementById('favorite-button'),
  favoriteIcon: document.getElementById('favorite-icon'),
  favoriteText: document.getElementById('favorite-text'),
  
  // 评分星星
  ratingStars: document.querySelectorAll('.rating-star'),
  ratingMessage: document.getElementById('rating-message'),
  
  // 相关游戏
  relatedGames: document.getElementById('related-games'),
  
  // 特性和说明区域
  featuresSection: document.getElementById('features-section'),
  instructionsSection: document.getElementById('instructions-section')
};

/**
 * 初始化游戏详情页面
 */
function initGameDetail() {
  console.log('初始化游戏详情页...');
  
  // 从URL获取游戏ID
  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get('id');
  
  if (!gameId) {
    showError('游戏未找到', '未指定游戏ID，请从游戏列表选择一个游戏。');
    return;
  }
  
  // 加载用户收藏
  detailState.favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
  
  // 加载游戏数据
  loadGameData(gameId);
  
  // 设置事件监听器
  setupDetailEventListeners();
}

/**
 * 加载游戏数据
 * @param {string} gameId - 要加载的游戏ID
 */
function loadGameData(gameId) {
  fetch('/data/games.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('无法加载游戏数据');
      }
      return response.json();
    })
    .then(data => {
      detailState.allGames = data;
      
      // 查找当前游戏
      const game = data.find(g => g.id === gameId);
      
      if (!game) {
        showError('游戏未找到', `ID为 "${gameId}" 的游戏不存在。`);
        return;
      }
      
      detailState.currentGame = game;
      
      // 找出相关游戏（同类别的其他游戏）
      if (game.category && game.category.length > 0) {
        detailState.relatedGames = data
          .filter(g => g.id !== game.id && 
                 g.category.some(cat => game.category.includes(cat)))
          .sort(() => 0.5 - Math.random()) // 随机排序
          .slice(0, 3); // 最多3个相关游戏
      }
      
      // 获取用户评分
      const userRatings = JSON.parse(localStorage.getItem('userRatings') || '{}');
      detailState.userRating = userRatings[gameId] || 0;
      
      // 显示游戏详情
      displayGameDetail();
      
      // 隐藏加载指示器，显示内容
      detailElements.gameLoading.classList.add('hidden');
      detailElements.gameContent.classList.remove('hidden');
    })
    .catch(error => {
      console.error('加载游戏数据出错:', error);
      showError('数据加载错误', '加载游戏数据时出错，请稍后再试。');
    });
}

/**
 * 显示错误信息
 * @param {string} title - 错误标题
 * @param {string} message - 错误详情
 */
function showError(title, message) {
  // 隐藏加载状态
  if (detailElements.gameLoading) {
    detailElements.gameLoading.style.display = 'none';
  }
  
  // 创建错误显示
  const errorHtml = `
    <div class="container mx-auto px-4 md:px-6 py-16 text-center">
      <svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
      </svg>
      <h2 class="text-2xl font-bold text-red-600 mb-2">${title}</h2>
      <p class="text-gray-600 mb-6">${message}</p>
      <a href="/games.html" class="bg-apple-blue hover:bg-apple-darkblue text-white font-semibold py-2 px-6 rounded-md transition">返回游戏库</a>
    </div>
  `;
  
  // 插入错误信息
  const contentArea = document.querySelector('.flex-grow');
  if (contentArea) {
    contentArea.innerHTML = errorHtml;
  }
}

/**
 * 显示游戏详情
 */
function displayGameDetail() {
  const game = detailState.currentGame;
  
  if (!game) return;
  
  // 更新页面标题
  document.title = `${game.name} - HTML5游戏聚合平台`;
  
  // 更新游戏标题和评分
  detailElements.gameTitle.textContent = game.name;
  detailElements.gameRating.textContent = game.rating.score.toFixed(1);
  detailElements.gameRatingCount.textContent = `(${game.rating.count}人评分)`;
  
  // 更新标签
  detailElements.gameTags.innerHTML = '';
  game.tags.forEach(tag => {
    const tagElement = document.createElement('span');
    tagElement.className = 'bg-gray-200 text-gray-700 px-2 py-1 text-xs rounded';
    tagElement.textContent = tag;
    detailElements.gameTags.appendChild(tagElement);
  });
  
  // 更新游戏描述
  detailElements.gameDescription.textContent = game.description;
  
  // 更新游戏特性
  if (game.features && game.features.length > 0) {
    detailElements.gameFeatures.innerHTML = '';
    game.features.forEach(feature => {
      const li = document.createElement('li');
      li.textContent = feature;
      detailElements.gameFeatures.appendChild(li);
    });
  } else {
    detailElements.featuresSection.classList.add('hidden');
  }
  
  // 更新操作说明
  if (game.instructions && Object.keys(game.instructions).length > 0) {
    detailElements.gameInstructions.innerHTML = '';
    
    for (const [action, control] of Object.entries(game.instructions)) {
      const div = document.createElement('div');
      div.className = 'flex justify-between border-b pb-2';
      
      const actionSpan = document.createElement('span');
      actionSpan.className = 'font-medium';
      actionSpan.textContent = action.charAt(0).toUpperCase() + action.slice(1);
      
      const controlSpan = document.createElement('span');
      controlSpan.className = 'text-gray-600';
      controlSpan.textContent = control;
      
      div.appendChild(actionSpan);
      div.appendChild(controlSpan);
      
      detailElements.gameInstructions.appendChild(div);
    }
  } else {
    detailElements.instructionsSection.classList.add('hidden');
  }
  
  // 加载游戏iframe
  if (game.url && game.url !== '#') {
    detailElements.gameFrame.src = game.url;
    
    // 添加iframe加载事件监听
    detailElements.gameFrame.onload = function() {
      console.log('游戏iframe加载完成');
      
      // 初始化iframe桥接器
      if (window.IframeBridge) {
        IframeBridge.init('game-frame');
        
        // 如果用户已登录，发送用户信息到游戏
        const userInfo = getUserInfo();
        if (userInfo) {
          IframeBridge.sendUserInfo(userInfo);
        }
        
        // 监听游戏成就
        IframeBridge.addListener('GAME_ACHIEVEMENT', handleGameAchievement);
        
        // 监听游戏进度
        IframeBridge.addListener('GAME_PROGRESS', handleGameProgress);
      }
    };
    
    detailElements.gameFrame.onerror = function() {
      console.error('游戏iframe加载失败');
      // 显示错误消息在iframe内
      detailElements.gameFrame.srcdoc = `
        <div style="display:flex;justify-content:center;align-items:center;height:100%;flex-direction:column;font-family:sans-serif;color:#666;">
          <div style="font-size:48px;margin-bottom:20px;">😕</div>
          <h2 style="margin:0 0 10px 0;">游戏加载失败</h2>
          <p>无法加载游戏内容，请稍后再试。</p>
        </div>
      `;
    };
  } else {
    // 如果游戏尚未上线，显示敬请期待
    detailElements.gameFrame.srcdoc = `
      <div style="display:flex;justify-content:center;align-items:center;height:100%;flex-direction:column;font-family:sans-serif;background:linear-gradient(135deg,#ff9500,#ff7801);color:white;">
        <div style="font-size:48px;margin-bottom:20px;">⏳</div>
        <h2 style="margin:0 0 10px 0;">敬请期待</h2>
        <p>该游戏正在开发中，即将上线！</p>
      </div>
    `;
  }
  
  // 显示相关游戏
  displayRelatedGames();
  
  // 更新收藏按钮状态
  updateFavoriteButton();
  
  // 更新评分星星
  updateRatingStars();
}

/**
 * 显示相关游戏
 */
function displayRelatedGames() {
  if (!detailElements.relatedGames) return;
  
  if (detailState.relatedGames.length === 0) {
    detailElements.relatedGames.innerHTML = '<p class="text-apple-darkgray text-center">暂无相关游戏</p>';
    return;
  }
  
  let relatedGamesHTML = '';
  
  detailState.relatedGames.forEach(game => {
    relatedGamesHTML += `
      <a href="game.html?id=${game.id}" class="block bg-apple-gray rounded-lg p-3 hover:bg-gray-200 transition">
        <div class="flex items-center">
          <div class="w-16 h-16 bg-gray-300 rounded overflow-hidden mr-3">
            <img src="${game.thumbnail || 'assets/images/placeholder.jpg'}" alt="${game.name}" class="w-full h-full object-cover">
          </div>
          <div class="flex-1">
            <h3 class="font-medium text-apple-black">${game.name}</h3>
            <div class="flex items-center mt-1">
              <span class="text-yellow-500 text-sm mr-1">${game.rating ? game.rating.score.toFixed(1) : 'N/A'}</span>
              <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              <span class="text-apple-darkgray text-xs ml-2">${game.category ? game.category[0] : ''}</span>
            </div>
          </div>
        </div>
      </a>
    `;
  });
  
  detailElements.relatedGames.innerHTML = relatedGamesHTML;
}

/**
 * 更新收藏按钮状态
 */
function updateFavoriteButton() {
  if (!detailElements.favoriteButton || !detailElements.favoriteIcon || !detailElements.favoriteText) return;
  
  const isFavorite = detailState.favorites.includes(detailState.currentGame.id);
  
  if (isFavorite) {
    detailElements.favoriteIcon.setAttribute('fill', 'currentColor');
    detailElements.favoriteText.textContent = '已收藏';
    detailElements.favoriteButton.classList.add('bg-pink-50', 'text-pink-700', 'border-pink-300');
    detailElements.favoriteButton.classList.remove('bg-white', 'text-gray-700', 'border-gray-300');
  } else {
    detailElements.favoriteIcon.setAttribute('fill', 'none');
    detailElements.favoriteText.textContent = '收藏';
    detailElements.favoriteButton.classList.remove('bg-pink-50', 'text-pink-700', 'border-pink-300');
    detailElements.favoriteButton.classList.add('bg-white', 'text-gray-700', 'border-gray-300');
  }
}

/**
 * 切换收藏状态
 */
function toggleFavoriteState() {
  if (!detailState.currentGame) return;
  
  toggleFavorite(detailState.currentGame.id);
  updateFavoriteButton();
}

/**
 * 检查用户评分
 */
function checkUserRating() {
  if (!detailState.currentGame || !appState.userPreferences.ratings) return;
  
  const gameId = detailState.currentGame.id;
  const userRating = appState.userPreferences.ratings[gameId];
  
  if (userRating) {
    detailState.userRating = userRating;
    updateRatingStars();
    
    if (detailElements.ratingMessage) {
      detailElements.ratingMessage.textContent = `你的评分：${userRating}星`;
    }
  }
}

/**
 * 更新评分星星显示
 */
function updateRatingStars() {
  if (!detailElements.ratingStars) return;
  
  const stars = detailElements.ratingStars;
  
  stars.forEach((star, index) => {
    const starRating = index + 1;
    if (starRating <= detailState.userRating) {
      star.querySelector('svg').classList.remove('text-gray-300');
      star.querySelector('svg').classList.add('text-yellow-500');
    } else {
      star.querySelector('svg').classList.remove('text-yellow-500');
      star.querySelector('svg').classList.add('text-gray-300');
    }
  });
}

/**
 * 设置用户评分
 * @param {number} rating - 评分值（1-5）
 */
function setRating(rating) {
  if (!detailState.currentGame) return;
  
  detailState.userRating = rating;
  
  // 保存评分
  saveUserRating(detailState.currentGame.id, rating);
  
  // 更新显示
  updateRatingStars();
  
  if (detailElements.ratingMessage) {
    detailElements.ratingMessage.textContent = `感谢您的评分！`;
    
    // 2秒后恢复显示
    setTimeout(() => {
      detailElements.ratingMessage.textContent = `你的评分：${rating}星`;
    }, 2000);
  }
}

/**
 * 设置事件监听器
 */
function setupDetailEventListeners() {
  // 收藏按钮点击
  if (detailElements.favoriteButton) {
    detailElements.favoriteButton.addEventListener('click', toggleFavoriteState);
  }
  
  // 分享按钮点击
  const shareButton = document.getElementById('share-button');
  if (shareButton) {
    shareButton.addEventListener('click', () => {
      if (navigator.share) {
        // 使用Web Share API（如果浏览器支持）
        navigator.share({
          title: detailState.currentGame.name,
          text: detailState.currentGame.description,
          url: window.location.href
        })
        .catch(error => console.log('分享失败:', error));
      } else {
        // 回退方案：复制链接到剪贴板
        const dummy = document.createElement('input');
        document.body.appendChild(dummy);
        dummy.value = window.location.href;
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);
        
        alert('链接已复制到剪贴板');
      }
    });
  }
  
  // 评分星星点击
  if (detailElements.ratingStars) {
    detailElements.ratingStars.forEach(star => {
      star.addEventListener('click', function() {
        const rating = parseInt(this.dataset.rating);
        setRating(rating);
      });
      
      // 鼠标悬停效果
      star.addEventListener('mouseenter', function() {
        const rating = parseInt(this.dataset.rating);
        const allStars = detailElements.ratingStars;
        
        allStars.forEach((s, index) => {
          if (index < rating) {
            s.querySelector('svg').classList.remove('text-gray-300');
            s.querySelector('svg').classList.add('text-yellow-500');
          } else {
            s.querySelector('svg').classList.add('text-gray-300');
            s.querySelector('svg').classList.remove('text-yellow-500');
          }
        });
      });
      
      // 鼠标离开恢复当前评分显示
      star.addEventListener('mouseleave', function() {
        updateRatingStars();
      });
    });
  }
}

/**
 * 获取分类中文名称
 * @param {string} categoryKey - 分类英文标识
 * @returns {string} 分类中文名称
 */
function getCategoryName(categoryKey) {
  const categoryMap = {
    'Action': '动作',
    'Survival': '生存',
    'Roguelike': '肉鸡',
    'Battle': '对战',
    'PvP': 'PvP',
    'Strategy': '策略',
    'Dungeon Crawler': '地牢',
    'RPG': '角色扮演',
    'Adventure': '冒险'
  };
  
  return categoryMap[categoryKey] || categoryKey;
}

/**
 * 获取操作说明标签中文名称
 * @param {string} key - 操作标识
 * @returns {string} 操作中文名称
 */
function getInstructionLabel(key) {
  const labelMap = {
    'movement': '移动',
    'attack': '攻击',
    'special': '特殊技能',
    'jump': '跳跃',
    'interact': '交互'
  };
  
  return labelMap[key] || key;
}

// 获取用户信息（如果已登录）
function getUserInfo() {
  // 目前使用localStorage模拟，实际项目中应从用户系统获取
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo) : null;
}

// 处理游戏成就
function handleGameAchievement(data) {
  console.log('获得游戏成就:', data);
  
  // 在这里实现成就通知UI
  // 例如：显示toast通知
  const gameId = detailState.currentGame.id;
  
  // 存储成就到localStorage（实际项目中应存储到服务器）
  let achievements = JSON.parse(localStorage.getItem('userAchievements') || '{}');
  if (!achievements[gameId]) {
    achievements[gameId] = [];
  }
  
  // 检查是否已有此成就
  if (!achievements[gameId].some(a => a.id === data.id)) {
    achievements[gameId].push(data);
    localStorage.setItem('userAchievements', JSON.stringify(achievements));
    
    // 显示成就通知（简单实现，实际项目中可使用更好的UI组件）
    showAchievementNotification(data);
  }
}

// 显示成就通知
function showAchievementNotification(achievement) {
  // 创建通知元素
  const notification = document.createElement('div');
  notification.className = 'fixed top-20 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg shadow-lg z-50 fade-in max-w-xs';
  notification.style.animation = 'fadeInRight 0.5s ease-out forwards';
  
  notification.innerHTML = `
    <div class="flex items-center">
      <div class="mr-3 text-2xl">🏆</div>
      <div>
        <h4 class="font-bold">${achievement.title || '获得成就'}</h4>
        <p class="text-sm opacity-80">${achievement.description || ''}</p>
      </div>
    </div>
  `;
  
  // 添加到页面
  document.body.appendChild(notification);
  
  // 3秒后移除
  setTimeout(() => {
    notification.style.animation = 'fadeOutRight 0.5s ease-in forwards';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 500);
  }, 3000);
}

// 处理游戏进度
function handleGameProgress(data) {
  console.log('游戏进度更新:', data);
  
  // 存储游戏进度
  const gameId = detailState.currentGame.id;
  let gameProgress = JSON.parse(localStorage.getItem('gameProgress') || '{}');
  gameProgress[gameId] = data;
  localStorage.setItem('gameProgress', JSON.stringify(gameProgress));
}

// 清理资源
function cleanupGameDetail() {
  // 如果使用了iframe桥接器，需要销毁它
  if (window.IframeBridge) {
    IframeBridge.destroy();
  }
}

// 当页面离开时清理资源
window.addEventListener('beforeunload', cleanupGameDetail);

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initGameDetail); 