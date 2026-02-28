# 🧩 Puzzle Play — Jigsaw Puzzle Game

A beautiful, mobile-first jigsaw puzzle game built with vanilla HTML, CSS, and JavaScript. No frameworks, no dependencies — just a pure web app you can play on any device.

![Puzzle Play](https://img.shields.io/badge/Puzzle-Play-8b5cf6?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## ✨ Features

- **🎨 6 Procedural Images** — Built-in canvas-generated scenes (sunset, ocean, mountains, abstract, forest, geometric)
- **📱 Mobile-First** — Touch drag-and-drop optimized for phones and tablets
- **📐 Flexible Grid Sizes** — Choose from 2×2 up to 8×8 puzzles
- **📷 Upload Your Own Images** — Use any photo from your device
- **🖼️ Image Gallery** — Save uploaded images for reuse across sessions
- **📊 History Dashboard** — Track completed puzzles with time, moves, and thumbnails
- **🎉 Win Animations** — Confetti celebration when you complete a puzzle
- **🌙 Dark Theme** — Beautiful glassmorphism design with gradient accents
- **💾 Persistent Storage** — Gallery and history saved in localStorage

## 🚀 Getting Started

### Option 1: Open directly
Simply open `index.html` in your browser.

### Option 2: Local server (recommended for mobile testing)
```bash
npx serve .
```
Then open the URL on your phone or browser.

## 🎮 How to Play

1. **Choose an image** — Pick from built-in designs or upload your own
2. **Select grid size** — From 2×2 (easy) to 8×8 (challenging)
3. **Start Puzzle** — Tap to begin
4. **Shuffle** — Randomize the pieces
5. **Drag & drop** — Move pieces to their correct positions
6. **Complete!** — See your time and moves, saved to history

## 📂 Project Structure

```
├── index.html    # App structure and screens
├── style.css     # Design system, animations, responsive styles
└── app.js        # Game engine, touch handling, gallery/history logic
```

## 🛠️ Technology

- **Zero dependencies** — Pure vanilla HTML/CSS/JS
- **Canvas API** — For puzzle piece rendering and image manipulation
- **localStorage** — Persistent gallery and history
- **Touch Events** — Native mobile drag-and-drop
- **CSS Custom Properties** — Themeable design system

## 📱 Screenshots

| Menu | Game | Gallery | History |
|------|------|---------|--------|
| Grid selector, image picker | Drag pieces, timer, moves | Saved images | Past completions |

## 📄 License

MIT License — feel free to use and modify.
