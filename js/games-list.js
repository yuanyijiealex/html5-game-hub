/**
 * HTML5游戏聚合平台 - 游戏列表页面脚本
 * 处理游戏数据加载、筛选、搜索和分页功能
 */

// 游戏列表页面状态
const listState = {
  games: [],           // 所有游戏数据
  filteredGames: [],   // 筛选后的游戏
  currentPage: 1,      // 当前页码
  gamesPerPage: 9,     // 每页显示游戏数
  activeFilters: {     // 当前激活的筛选条件
    category: 'all',
    search: ''
  },
  sortBy: 'popularity' // 排序方式
};

// DOM元素
const listElements = {
  gamesContainer: document.getElementById('games-container'),
  categoryFilter: document.getElementById('category-filter'),
  searchInput: document.getElementById('search-input'),
  sortOption: document.getElementById('sort-option'),
  resultsCount: document.getElementById('count-number'),
  filterTags: document.getElementById('filter-tags'),
  pagination: document.querySelector('.pagination')
};

/**
 * 初始化游戏列表页面
 */
function initGamesList() {
  // 加载游戏数据
  loadGamesData();
  
  // 设置事件监听器
  setupListEventListeners();
  
  // 检查URL参数是否有预设的筛选条件
  checkUrlParams();
}

/**
 * 加载游戏数据
 */
function loadGamesData() {
  fetch('/data/games.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('网络响应异常');
      }
      return response.json();
    })
    .then(data => {
      listState.games = data;
      console.log('游戏数据加载成功', data);
      
      // 应用初始筛选并渲染
      applyFiltersAndSort();
    })
    .catch(error => {
      console.error('加载游戏数据出错:', error);
      // 显示错误信息
      if (listElements.gamesContainer) {
        listElements.gamesContainer.innerHTML = `
          <div class="col-span-full text-center py-8">
            <p class="text-xl text-red-600">加载游戏数据时出错</p>
            <p class="text-gray-600 mt-2">请稍后再试</p>
          </div>
        `;
      }
    });
}

/**
 * 设置事件监听器
 */
function setupListEventListeners() {
  // 分类筛选变化
  if (listElements.categoryFilter) {
    listElements.categoryFilter.addEventListener('change', function() {
      listState.activeFilters.category = this.value;
      listState.currentPage = 1; // 重置到第一页
      applyFiltersAndSort();
      updateFilterTags();
    });
  }
  
  // 搜索输入
  if (listElements.searchInput) {
    listElements.searchInput.addEventListener('input', debounce(function() {
      listState.activeFilters.search = this.value.trim().toLowerCase();
      listState.currentPage = 1; // 重置到第一页
      applyFiltersAndSort();
      updateFilterTags();
    }, 300)); // 300ms防抖
  }
  
  // 排序选项变化
  if (listElements.sortOption) {
    listElements.sortOption.addEventListener('change', function() {
      listState.sortBy = this.value;
      applyFiltersAndSort();
    });
  }
  
  // 监听分页点击
  document.addEventListener('click', function(e) {
    if (e.target.closest('.pagination a')) {
      e.preventDefault();
      const pageLink = e.target.closest('.pagination a');
      
      if (pageLink.textContent === '上一页') {
        if (listState.currentPage > 1) {
          listState.currentPage--;
        }
      } else if (pageLink.textContent === '下一页') {
        const maxPage = Math.ceil(listState.filteredGames.length / listState.gamesPerPage);
        if (listState.currentPage < maxPage) {
          listState.currentPage++;
        }
      } else {
        // 具体页码链接
        listState.currentPage = parseInt(pageLink.textContent);
      }
      
      renderGamesList();
      scrollToTop();
    }
  });
  
  // 监听收藏按钮点击
  document.addEventListener('click', function(e) {
    if (e.target.closest('.favorite-button')) {
      const button = e.target.closest('.favorite-button');
      const gameCard = button.closest('.game-card');
      const gameId = gameCard.dataset.gameId;
      
      if (gameId) {
        toggleFavorite(gameId);
        button.classList.toggle('favorite-active');
      }
    }
  });
  
  // 监听筛选标签删除
  if (listElements.filterTags) {
    listElements.filterTags.addEventListener('click', function(e) {
      if (e.target.closest('.filter-tag')) {
        const tag = e.target.closest('.filter-tag');
        const filterType = tag.dataset.filterType;
        
        if (filterType === 'category') {
          listState.activeFilters.category = 'all';
          if (listElements.categoryFilter) {
            listElements.categoryFilter.value = 'all';
          }
        } else if (filterType === 'search') {
          listState.activeFilters.search = '';
          if (listElements.searchInput) {
            listElements.searchInput.value = '';
          }
        }
        
        listState.currentPage = 1;
        applyFiltersAndSort();
        updateFilterTags();
      }
    });
  }
}

/**
 * 检查URL参数是否包含预设的筛选条件
 */
function checkUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  
  // 检查分类参数
  const category = urlParams.get('category');
  if (category) {
    listState.activeFilters.category = category;
    if (listElements.categoryFilter) {
      listElements.categoryFilter.value = category;
    }
  }
  
  // 检查搜索参数
  const search = urlParams.get('search');
  if (search) {
    listState.activeFilters.search = search.toLowerCase();
    if (listElements.searchInput) {
      listElements.searchInput.value = search;
    }
  }
  
  // 检查排序参数
  const sort = urlParams.get('sort');
  if (sort) {
    listState.sortBy = sort;
    if (listElements.sortOption) {
      listElements.sortOption.value = sort;
    }
  }
  
  // 检查页码参数
  const page = urlParams.get('page');
  if (page) {
    listState.currentPage = parseInt(page);
  }
}

/**
 * 应用筛选条件和排序，然后渲染列表
 */
function applyFiltersAndSort() {
  // 应用分类和搜索筛选
  listState.filteredGames = listState.games.filter(game => {
    // 分类筛选
    const categoryMatch = 
      listState.activeFilters.category === 'all' || 
      (game.category && game.category.includes(listState.activeFilters.category));
    
    // 搜索筛选
    const searchTerm = listState.activeFilters.search.toLowerCase();
    const searchMatch = 
      searchTerm === '' || 
      game.name.toLowerCase().includes(searchTerm) || 
      (game.description && game.description.toLowerCase().includes(searchTerm)) ||
      (game.tags && game.tags.some(tag => tag.toLowerCase().includes(searchTerm)));
    
    return categoryMatch && searchMatch;
  });
  
  // 应用排序
  sortGames();
  
  // 更新结果计数
  if (listElements.resultsCount) {
    listElements.resultsCount.textContent = listState.filteredGames.length;
  }
  
  // 渲染游戏列表
  renderGamesList();
}

/**
 * 根据选择的排序方式对游戏列表排序
 */
function sortGames() {
  listState.filteredGames.sort((a, b) => {
    switch (listState.sortBy) {
      case 'popularity':
        return (b.popularity || 0) - (a.popularity || 0);
      case 'rating':
        const ratingA = a.rating ? a.rating.score : 0;
        const ratingB = b.rating ? b.rating.score : 0;
        return ratingB - ratingA;
      case 'newest':
        return new Date(b.addedDate || '1970-01-01') - new Date(a.addedDate || '1970-01-01');
      default:
        return 0;
    }
  });
}

/**
 * 渲染游戏列表
 */
function renderGamesList() {
  if (!listElements.gamesContainer) return;
  
  // 计算当前页的游戏
  const startIndex = (listState.currentPage - 1) * listState.gamesPerPage;
  const endIndex = startIndex + listState.gamesPerPage;
  const currentPageGames = listState.filteredGames.slice(startIndex, endIndex);
  
  // 如果没有游戏，显示空状态
  if (currentPageGames.length === 0) {
    listElements.gamesContainer.innerHTML = `
      <div class="col-span-full text-center py-16">
        <p class="text-2xl font-semibold mb-2">未找到游戏</p>
        <p class="text-gray-600">尝试调整筛选条件或搜索词</p>
      </div>
    `;
    return;
  }
  
  // 渲染游戏卡片
  let gamesHTML = '';
  currentPageGames.forEach(game => {
    const isFavorite = appState.userPreferences.favoriteGames && 
                      appState.userPreferences.favoriteGames.includes(game.id);
    
    // 游戏标签HTML
    let tagsHTML = '';
    if (game.category && game.category.length > 0) {
      // 生成每个类别的标签，最多显示3个
      const tagColors = [
        { bg: 'bg-blue-100', text: 'text-blue-800' },
        { bg: 'bg-green-100', text: 'text-green-800' },
        { bg: 'bg-purple-100', text: 'text-purple-800' },
        { bg: 'bg-red-100', text: 'text-red-800' },
        { bg: 'bg-yellow-100', text: 'text-yellow-800' },
        { bg: 'bg-pink-100', text: 'text-pink-800' },
        { bg: 'bg-indigo-100', text: 'text-indigo-800' },
        { bg: 'bg-teal-100', text: 'text-teal-800' }
      ];
      
      tagsHTML = game.category.slice(0, 3).map((category, index) => {
        const colorSet = tagColors[index % tagColors.length];
        return `<span class="inline-block px-2 py-1 text-xs font-medium ${colorSet.bg} ${colorSet.text} rounded">${getCategoryName(category)}</span>`;
      }).join('');
    }
    
    // 构建游戏卡片HTML
    gamesHTML += `
      <div class="game-card bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-1" data-game-id="${game.id}">
        <div class="relative pt-[56.25%] bg-gray-200">
          <img src="${game.thumbnail || 'assets/images/placeholder.jpg'}" alt="${game.name}" class="absolute inset-0 w-full h-full object-cover">
          <div class="absolute top-2 right-2">
            <button class="favorite-button bg-white rounded-full p-2 shadow-md ${isFavorite ? 'favorite-active' : ''}" aria-label="${isFavorite ? '取消收藏' : '添加收藏'}">
              <svg class="w-5 h-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'}" ${isFavorite ? 'fill="currentColor"' : 'fill="none"'} stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </button>
          </div>
          ${game.comingSoon ? '<div class="absolute top-0 left-0 bg-yellow-500 text-white px-3 py-1 rounded-br-lg font-medium text-sm">即将推出</div>' : ''}
        </div>
        <div class="p-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-xl font-bold text-apple-black">${game.name}</h3>
            <div class="flex items-center">
              <span class="text-yellow-500 mr-1">${game.rating ? game.rating.score.toFixed(1) : 'N/A'}</span>
              <svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
            </div>
          </div>
          <div class="mb-3 flex flex-wrap gap-2">
            ${tagsHTML}
          </div>
          <p class="text-sm text-gray-600 mb-4 line-clamp-2">${game.description || '暂无描述'}</p>
          ${game.comingSoon ? 
            `<button disabled class="block w-full bg-gray-300 text-gray-600 text-center py-2 rounded-md cursor-not-allowed">即将推出</button>` : 
            `<a href="game.html?id=${game.id}" class="block w-full bg-apple-blue hover:bg-apple-darkblue text-white text-center py-2 rounded-md transition">开始游戏</a>`
          }
        </div>
      </div>
    `;
  });
  
  listElements.gamesContainer.innerHTML = gamesHTML;
  
  // 更新分页
  updatePagination();
}

/**
 * 更新分页控件
 */
function updatePagination() {
  const totalPages = Math.ceil(listState.filteredGames.length / listState.gamesPerPage);
  const paginationElement = document.querySelector('nav.inline-flex');
  
  if (!paginationElement || totalPages <= 1) {
    // 如果只有一页，隐藏分页
    if (paginationElement) {
      paginationElement.classList.add('hidden');
    }
    return;
  }
  
  // 显示分页
  paginationElement.classList.remove('hidden');
  
  // 构建分页HTML
  let paginationHTML = `
    <a href="#" class="py-2 px-4 bg-white rounded-l-md border border-gray-300 text-apple-darkgray hover:bg-gray-50 ${listState.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}">上一页</a>
  `;
  
  // 添加页码
  for (let i = 1; i <= totalPages; i++) {
    // 如果页码太多，使用省略号
    if (totalPages > 5) {
      if (i === 1 || i === totalPages || 
          (i >= listState.currentPage - 1 && i <= listState.currentPage + 1)) {
        paginationHTML += `
          <a href="#" class="py-2 px-4 ${i === listState.currentPage ? 'bg-apple-blue text-white border border-apple-blue hover:bg-apple-darkblue' : 'bg-white border border-gray-300 text-apple-darkgray hover:bg-gray-50'}">${i}</a>
        `;
      } else if (i === listState.currentPage - 2 || i === listState.currentPage + 2) {
        paginationHTML += `
          <span class="py-2 px-4 bg-white border border-gray-300 text-apple-darkgray">...</span>
        `;
      }
    } else {
      // 页码较少，全部显示
      paginationHTML += `
        <a href="#" class="py-2 px-4 ${i === listState.currentPage ? 'bg-apple-blue text-white border border-apple-blue hover:bg-apple-darkblue' : 'bg-white border border-gray-300 text-apple-darkgray hover:bg-gray-50'}">${i}</a>
      `;
    }
  }
  
  paginationHTML += `
    <a href="#" class="py-2 px-4 bg-white rounded-r-md border border-gray-300 text-apple-darkgray hover:bg-gray-50 ${listState.currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}">下一页</a>
  `;
  
  paginationElement.innerHTML = paginationHTML;
}

/**
 * 更新筛选标签
 */
function updateFilterTags() {
  if (!listElements.filterTags) return;
  
  let tagsHTML = '';
  
  // 分类标签
  if (listState.activeFilters.category !== 'all') {
    tagsHTML += `
      <div class="filter-tag bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center text-sm" data-filter-type="category">
        <span class="mr-1">分类: ${getCategoryName(listState.activeFilters.category)}</span>
        <button class="text-blue-800 hover:text-blue-600" aria-label="删除筛选">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    `;
  }
  
  // 搜索标签
  if (listState.activeFilters.search !== '') {
    tagsHTML += `
      <div class="filter-tag bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center text-sm" data-filter-type="search">
        <span class="mr-1">搜索: ${listState.activeFilters.search}</span>
        <button class="text-green-800 hover:text-green-600" aria-label="删除筛选">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    `;
  }
  
  listElements.filterTags.innerHTML = tagsHTML;
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
 * 滚动到页面顶部
 */
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initGamesList); 