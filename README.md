# HTML5游戏聚合平台

一个响应式、SEO优化的HTML5游戏聚合平台，基于现代设计，提供多种游戏类型的在线体验。

## 功能特点

- **游戏聚合**: 收集并整合多种HTML5游戏，提供一站式游戏体验
- **响应式设计**: 完全适配桌面端、平板和移动设备
- **游戏分类系统**: 按类型、标签和热门程度对游戏进行分类
- **用户互动**: 包括收藏、评分和分享功能
- **现代UI**: 干净、简洁的设计风格，流畅的动画效果
- **SEO优化**: 适当的元标签、语义化HTML和规范URL
- **性能优先**: 快速加载时间和优化的资源

## 技术栈

- HTML5 / CSS3
- Tailwind CSS 用于样式设计
- 原生JavaScript实现交互功能
- JSON格式管理游戏数据

## 项目结构

```
html5游戏聚合平台/
├── index.html            # 主页
├── games.html            # 游戏列表页
├── game.html             # 单个游戏详情页
├── styles.css            # 自定义样式（Tailwind之外的）
├── js/
│   ├── app.js            # 通用JavaScript功能
│   ├── games-list.js     # 游戏列表页面的功能
│   └── game-detail.js    # 游戏详情页面的功能
├── data/
│   └── games.json        # JSON格式的游戏数据
└── assets/
    └── images/           # 图片资源
```

## 开始使用

1. 克隆此仓库
2. 在浏览器中打开`index.html`查看网站
3. 对于开发环境，推荐使用VS Code的Live Server扩展实现实时刷新

## 游戏数据结构

游戏数据存储在`data/games.json`文件中，格式如下：

```json
{
  "id": "game-id",
  "name": "游戏名称",
  "description": "游戏描述...",
  "url": "游戏URL",
  "thumbnail": "缩略图路径",
  "category": ["分类1", "分类2"],
  "tags": ["标签1", "标签2"],
  "rating": {
    "score": 4.5,
    "count": 100
  },
  "addedDate": "2023-01-01",
  "popularity": 85,
  "features": ["特点1", "特点2"],
  "instructions": {
    "movement": "WASD或方向键",
    "action": "空格键"
  },
  "author": "作者",
  "recommended": true
}
```

## 游戏集成

游戏通过iframe集成到网站中：

```html
<iframe src="游戏URL" 
        class="w-full h-[600px]" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
</iframe>
```

## SEO特性

- 适当的元标签和标题
- 语义化HTML5结构
- 移动友好的响应式设计
- 规范URL实现
- 快速加载时间

## 自定义

- 编辑`games.json`添加或修改游戏数据
- 在`styles.css`中修改样式或直接在HTML中使用Tailwind类
- 通过JavaScript文件扩展功能

## 浏览器支持

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

## 未来增强

- 用户账户系统
- 更完善的游戏评论系统
- 社交分享功能
- 游戏排行榜
- 更多HTML5游戏资源

## 许可证

版权所有，保留一切权利。

## 联系方式

HTML5游戏聚合平台团队
邮箱: contact@example.com