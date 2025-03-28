/**
 * iframe-bridge.js - 用于主站点与嵌入游戏之间的通信
 * 
 * 通过postMessage实现跨域通信，允许:
 * 1. 传递用户信息到游戏
 * 2. 接收游戏进度和成就
 * 3. 同步评分和收藏状态
 */

// 命名空间
const IframeBridge = (function() {
  // 配置
  const config = {
    // 允许通信的域名白名单
    allowedOrigins: [
      window.location.origin,
      "https://您的游戏域名1.com",
      "https://您的游戏域名2.com",
      // 添加更多您的游戏域名...
    ],
    debug: true // 在生产环境中设为false
  };

  // 记录器 - 方便调试
  const logger = {
    log: function(message) {
      if (config.debug) console.log(`[IframeBridge] ${message}`);
    },
    error: function(message) {
      if (config.debug) console.error(`[IframeBridge] ${message}`);
    }
  };

  // 存储当前活动的iframe引用
  let activeIframe = null;

  // 存储消息监听器
  const messageListeners = {};

  // 初始化函数
  function init(iframeId) {
    // 获取iframe引用
    activeIframe = document.getElementById(iframeId);
    
    if (!activeIframe) {
      logger.error(`找不到ID为 ${iframeId} 的iframe`);
      return false;
    }
    
    // 添加消息事件监听器
    window.addEventListener("message", handleMessage, false);
    
    logger.log("初始化完成");
    return true;
  }

  // 处理接收到的消息
  function handleMessage(event) {
    // 安全检查：验证来源是否可信
    if (!isAllowedOrigin(event.origin)) {
      logger.error(`拒绝来自未授权域名的消息: ${event.origin}`);
      return;
    }
    
    const data = event.data;
    
    // 确保消息格式正确
    if (!data || !data.type) {
      logger.error("接收到格式不正确的消息");
      return;
    }
    
    logger.log(`接收到消息: ${data.type}`);
    
    // 触发注册的事件监听器
    if (messageListeners[data.type]) {
      messageListeners[data.type].forEach(callback => {
        try {
          callback(data.payload);
        } catch (err) {
          logger.error(`执行监听器时出错: ${err.message}`);
        }
      });
    }
  }

  // 向iframe发送消息
  function sendMessage(type, payload) {
    if (!activeIframe) {
      logger.error("没有活动的iframe，无法发送消息");
      return false;
    }
    
    try {
      const targetOrigin = activeIframe.src.startsWith("http") 
        ? new URL(activeIframe.src).origin 
        : "*";  // 本地测试使用 "*"
      
      activeIframe.contentWindow.postMessage(
        { type, payload, source: "html5-game-hub" },
        targetOrigin
      );
      
      logger.log(`已发送 ${type} 消息到 ${targetOrigin}`);
      return true;
    } catch (err) {
      logger.error(`发送消息失败: ${err.message}`);
      return false;
    }
  }

  // 添加消息监听器
  function addListener(messageType, callback) {
    if (!messageListeners[messageType]) {
      messageListeners[messageType] = [];
    }
    
    messageListeners[messageType].push(callback);
    logger.log(`已添加 ${messageType} 消息的监听器`);
    
    return function remove() {
      removeListener(messageType, callback);
    };
  }

  // 移除消息监听器
  function removeListener(messageType, callback) {
    if (!messageListeners[messageType]) return;
    
    const index = messageListeners[messageType].indexOf(callback);
    if (index !== -1) {
      messageListeners[messageType].splice(index, 1);
      logger.log(`已移除 ${messageType} 消息的监听器`);
    }
  }

  // 检查消息来源是否在白名单中
  function isAllowedOrigin(origin) {
    return config.allowedOrigins.includes(origin) || 
           config.allowedOrigins.includes("*");
  }

  // 向游戏传递用户信息
  function sendUserInfo(userInfo) {
    return sendMessage("USER_INFO", userInfo);
  }

  // 向游戏传递主题配置
  function sendThemeConfig(theme) {
    return sendMessage("THEME_CONFIG", theme);
  }

  // 向游戏发送开始/暂停指令
  function sendGameControl(action) {
    return sendMessage("GAME_CONTROL", { action });
  }

  // 销毁实例，清理资源
  function destroy() {
    window.removeEventListener("message", handleMessage);
    activeIframe = null;
    Object.keys(messageListeners).forEach(key => {
      messageListeners[key] = [];
    });
    logger.log("资源已清理");
  }

  // 导出公共API
  return {
    init,
    sendMessage,
    addListener,
    removeListener,
    sendUserInfo,
    sendThemeConfig,
    sendGameControl,
    destroy
  };
})();

// 导出为全局变量
window.IframeBridge = IframeBridge;

// 使用示例注释
/*
// 初始化桥接器
IframeBridge.init('game-frame');

// 监听游戏进度
IframeBridge.addListener('GAME_PROGRESS', function(data) {
  console.log('游戏进度:', data.progress);
  // 更新UI或保存进度
});

// 监听游戏成就
IframeBridge.addListener('GAME_ACHIEVEMENT', function(data) {
  console.log('获得成就:', data.achievement);
  // 显示成就通知
});

// 发送用户信息到游戏
IframeBridge.sendUserInfo({
  id: 'user123',
  name: '玩家昵称',
  avatar: 'https://example.com/avatar.jpg',
  preferences: { difficulty: 'normal' }
});

// 游戏控制
document.getElementById('pause-button').addEventListener('click', function() {
  IframeBridge.sendGameControl('pause');
});
*/ 