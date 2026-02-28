/* ═══════════════════════════════════════════════
   PUZZLE PLAY — App Engine
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── DOM References ───
  const $ = (sel) => document.querySelector(sel);
  const menuScreen = $('#menu-screen');
  const gameScreen = $('#game-screen');
  const winOverlay = $('#win-overlay');
  const previewOverlay = $('#preview-overlay');
  const galleryScreen = $('#gallery-screen');
  const historyScreen = $('#history-screen');

  const sizeSlider = $('#size-slider');
  const sizeDisplay = $('#size-display');
  const imageGrid = $('#image-grid');
  const imageUpload = $('#image-upload');
  const uploadLabel = $('#upload-label');
  const startBtn = $('#start-btn');
  const backBtn = $('#back-btn');
  const hintBtn = $('#hint-btn');
  const shuffleBtn = $('#shuffle-btn');
  const previewBtn = $('#preview-btn');
  const playAgainBtn = $('#play-again-btn');
  const menuBtn = $('#menu-btn');
  const timerEl = $('#timer');
  const movesEl = $('#moves');
  const winTimeEl = $('#win-time');
  const winMovesEl = $('#win-moves');
  const previewImage = $('#preview-image');

  const galleryGrid = $('#gallery-grid');
  const galleryEmpty = $('#gallery-empty');
  const galleryUpload = $('#gallery-upload');
  const galleryBackBtn = $('#gallery-back-btn');
  const historyList = $('#history-list');
  const historyEmpty = $('#history-empty');
  const historyBackBtn = $('#history-back-btn');
  const clearHistoryBtn = $('#clear-history-btn');

  const canvas = $('#puzzle-canvas');
  const ctx = canvas.getContext('2d');
  const gameArea = $('#game-area');

  const confettiCanvas = $('#confetti-canvas');
  const confettiCtx = confettiCanvas.getContext('2d');

  // ─── State ───
  let gridSize = 4;
  let selectedImageIndex = 0;
  let customImage = null;
  let puzzleImage = null;
  let pieces = [];
  let selectedPiece = null;
  let dragOffset = { x: 0, y: 0 };
  let moveCount = 0;
  let timerInterval = null;
  let elapsedSeconds = 0;
  let pieceW = 0;
  let pieceH = 0;
  let boardX = 0;
  let boardY = 0;
  let boardW = 0;
  let boardH = 0;
  let showingHint = false;
  let solved = false;
  let dpr = 1;
  let currentImageName = 'Sunset';
  const imageNames = ['Sunset', 'Ocean', 'Mountains', 'Abstract', 'Forest', 'Geometric'];

  // ─── Built-in Image Generators ───
  const imageGenerators = [
    // 0: Sunset gradient
    (w, h) => {
      const c = createCanvas(w, h);
      const cx = c.getContext('2d');
      const g = cx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#0f0c29');
      g.addColorStop(0.3, '#302b63');
      g.addColorStop(0.5, '#833ab4');
      g.addColorStop(0.7, '#fd1d1d');
      g.addColorStop(1, '#fcb045');
      cx.fillStyle = g;
      cx.fillRect(0, 0, w, h);
      // Sun
      cx.beginPath();
      cx.arc(w * 0.5, h * 0.65, w * 0.12, 0, Math.PI * 2);
      cx.fillStyle = '#fff3';
      cx.fill();
      cx.beginPath();
      cx.arc(w * 0.5, h * 0.65, w * 0.08, 0, Math.PI * 2);
      cx.fillStyle = '#fff6';
      cx.fill();
      // Stars
      for (let i = 0; i < 60; i++) {
        const sx = Math.random() * w;
        const sy = Math.random() * h * 0.4;
        const sr = Math.random() * 2 + 0.5;
        cx.beginPath();
        cx.arc(sx, sy, sr, 0, Math.PI * 2);
        cx.fillStyle = `rgba(255,255,255,${Math.random() * 0.8 + 0.2})`;
        cx.fill();
      }
      return c;
    },
    // 1: Ocean waves
    (w, h) => {
      const c = createCanvas(w, h);
      const cx = c.getContext('2d');
      const g = cx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#0077b6');
      g.addColorStop(0.5, '#00b4d8');
      g.addColorStop(1, '#90e0ef');
      cx.fillStyle = g;
      cx.fillRect(0, 0, w, h);
      // Waves
      for (let layer = 0; layer < 5; layer++) {
        cx.beginPath();
        const baseY = h * 0.3 + layer * h * 0.14;
        cx.moveTo(0, baseY);
        for (let x = 0; x <= w; x += 4) {
          const y = baseY + Math.sin(x * 0.015 + layer * 2) * (20 + layer * 5)
            + Math.sin(x * 0.008 + layer) * 10;
          cx.lineTo(x, y);
        }
        cx.lineTo(w, h);
        cx.lineTo(0, h);
        cx.closePath();
        cx.fillStyle = `rgba(0,${100 + layer * 30},${180 + layer * 15},${0.3 + layer * 0.1})`;
        cx.fill();
      }
      return c;
    },
    // 2: Mountain landscape
    (w, h) => {
      const c = createCanvas(w, h);
      const cx = c.getContext('2d');
      // Sky
      const g = cx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#1a1a2e');
      g.addColorStop(0.4, '#16213e');
      g.addColorStop(0.7, '#0f3460');
      g.addColorStop(1, '#e94560');
      cx.fillStyle = g;
      cx.fillRect(0, 0, w, h);
      // Mountains
      const drawMountain = (peaks, color) => {
        cx.beginPath();
        cx.moveTo(0, h);
        peaks.forEach(([px, py]) => cx.lineTo(px * w, py * h));
        cx.lineTo(w, h);
        cx.closePath();
        cx.fillStyle = color;
        cx.fill();
      };
      drawMountain([[0, 0.6], [0.15, 0.35], [0.3, 0.5], [0.5, 0.25], [0.7, 0.45], [0.85, 0.3], [1, 0.55]], '#16213ecc');
      drawMountain([[0, 0.7], [0.2, 0.5], [0.4, 0.6], [0.6, 0.4], [0.8, 0.55], [1, 0.65]], '#0f3460aa');
      drawMountain([[0, 0.85], [0.25, 0.65], [0.5, 0.75], [0.75, 0.6], [1, 0.8]], '#1a1a2ecc');
      return c;
    },
    // 3: Abstract circles
    (w, h) => {
      const c = createCanvas(w, h);
      const cx = c.getContext('2d');
      cx.fillStyle = '#0d1117';
      cx.fillRect(0, 0, w, h);
      const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd'];
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = Math.random() * w * 0.15 + 20;
        const col = colors[Math.floor(Math.random() * colors.length)];
        cx.beginPath();
        cx.arc(x, y, r, 0, Math.PI * 2);
        cx.fillStyle = col + '33';
        cx.fill();
        cx.strokeStyle = col + '66';
        cx.lineWidth = 2;
        cx.stroke();
      }
      return c;
    },
    // 4: Forest
    (w, h) => {
      const c = createCanvas(w, h);
      const cx = c.getContext('2d');
      const g = cx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#134e5e');
      g.addColorStop(1, '#71b280');
      cx.fillStyle = g;
      cx.fillRect(0, 0, w, h);
      // Trees
      for (let i = 0; i < 40; i++) {
        const tx = Math.random() * w;
        const th = Math.random() * h * 0.4 + h * 0.2;
        const ty = h - th * 0.4 + Math.random() * h * 0.3;
        const tw = th * 0.25;
        cx.beginPath();
        cx.moveTo(tx, ty - th);
        cx.lineTo(tx + tw, ty);
        cx.lineTo(tx - tw, ty);
        cx.closePath();
        const shade = Math.random() * 40;
        cx.fillStyle = `rgba(${20 + shade},${60 + shade},${30 + shade},0.7)`;
        cx.fill();
      }
      return c;
    },
    // 5: Geometric pattern
    (w, h) => {
      const c = createCanvas(w, h);
      const cx = c.getContext('2d');
      cx.fillStyle = '#1a1a2e';
      cx.fillRect(0, 0, w, h);
      const size = w / 8;
      const colors = ['#e94560', '#0f3460', '#533483', '#16213e'];
      for (let row = 0; row < Math.ceil(h / size); row++) {
        for (let col = 0; col < Math.ceil(w / size); col++) {
          cx.fillStyle = colors[(row + col) % colors.length] + '88';
          if ((row + col) % 2 === 0) {
            cx.fillRect(col * size, row * size, size, size);
          } else {
            cx.beginPath();
            cx.moveTo(col * size + size / 2, row * size);
            cx.lineTo(col * size + size, row * size + size);
            cx.lineTo(col * size, row * size + size);
            cx.closePath();
            cx.fill();
          }
        }
      }
      return c;
    },
  ];

  // ─── Helpers ───
  function createCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  // ─── LocalStorage Helpers ───
  function getGallery() {
    try { return JSON.parse(localStorage.getItem('puzzleplay_gallery') || '[]'); }
    catch { return []; }
  }
  function saveGallery(arr) {
    localStorage.setItem('puzzleplay_gallery', JSON.stringify(arr));
  }
  function getHistory() {
    try { return JSON.parse(localStorage.getItem('puzzleplay_history') || '[]'); }
    catch { return []; }
  }
  function saveHistory(arr) {
    localStorage.setItem('puzzleplay_history', JSON.stringify(arr));
  }

  // ─── Initialize Menu ───
  function initMenu() {
    sizeSlider.addEventListener('input', () => {
      gridSize = parseInt(sizeSlider.value);
      sizeDisplay.textContent = `${gridSize} × ${gridSize}`;
    });

    // Generate image thumbnails
    imageGrid.innerHTML = '';
    imageGenerators.forEach((gen, i) => {
      const div = document.createElement('div');
      div.className = 'image-option' + (i === 0 ? ' selected' : '');
      const thumb = gen(120, 120);
      div.appendChild(thumb);
      const check = document.createElement('span');
      check.className = 'check';
      check.textContent = '✓';
      div.appendChild(check);
      div.addEventListener('click', () => {
        document.querySelectorAll('.image-option').forEach(el => el.classList.remove('selected'));
        div.classList.add('selected');
        selectedImageIndex = i;
        customImage = null;
        currentImageName = imageNames[i];
        uploadLabel.classList.remove('has-file');
        uploadLabel.querySelector('span:last-child').textContent = 'Tap to upload';
      });
      imageGrid.appendChild(div);
    });

    // Upload handler
    imageUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          customImage = img;
          customImage._dataUrl = ev.target.result;
          currentImageName = file.name.replace(/\.[^.]+$/, '').slice(0, 20);
          document.querySelectorAll('.image-option').forEach(el => el.classList.remove('selected'));
          uploadLabel.classList.add('has-file');
          uploadLabel.querySelector('span:last-child').textContent = currentImageName;
          // Also save to gallery
          addToGallery(ev.target.result, file.name);
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });

    startBtn.addEventListener('click', startGame);
    backBtn.addEventListener('click', goToMenu);
    hintBtn.addEventListener('click', toggleHint);
    shuffleBtn.addEventListener('click', shufflePieces);
    previewBtn.addEventListener('click', showPreview);
    playAgainBtn.addEventListener('click', startGame);
    menuBtn.addEventListener('click', goToMenu);

    previewOverlay.addEventListener('click', () => {
      previewOverlay.style.display = 'none';
    });

    // ─── Nav Tabs ───
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.screen;
        if (target === 'gallery-screen') {
          renderGallery();
          showScreen(galleryScreen);
        } else if (target === 'history-screen') {
          renderHistory();
          showScreen(historyScreen);
        } else {
          showScreen(menuScreen);
        }
      });
    });

    // ─── Gallery ───
    galleryBackBtn.addEventListener('click', goToMenu);
    galleryUpload.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          addToGallery(ev.target.result, file.name);
          renderGallery();
        };
        reader.readAsDataURL(file);
      });
      galleryUpload.value = '';
    });

    // ─── History ───
    historyBackBtn.addEventListener('click', goToMenu);
    clearHistoryBtn.addEventListener('click', () => {
      if (confirm('Clear all history?')) {
        saveHistory([]);
        renderHistory();
      }
    });
  }

  // ─── Gallery Functions ───
  function addToGallery(dataUrl, name) {
    const gallery = getGallery();
    // Resize to thumbnail for storage efficiency
    const img = new Image();
    img.onload = () => {
      const thumbSize = 400;
      const c = createCanvas(thumbSize, thumbSize);
      const cx = c.getContext('2d');
      const s = Math.min(img.width, img.height);
      const sx = (img.width - s) / 2;
      const sy = (img.height - s) / 2;
      cx.drawImage(img, sx, sy, s, s, 0, 0, thumbSize, thumbSize);
      gallery.unshift({
        id: Date.now(),
        name: name.replace(/\.[^.]+$/, '').slice(0, 30),
        data: c.toDataURL('image/jpeg', 0.7),
        fullData: dataUrl,
        date: new Date().toISOString(),
      });
      // Keep max 30 images to avoid localStorage limits
      if (gallery.length > 30) gallery.pop();
      saveGallery(gallery);
      renderGallery();
    };
    img.src = dataUrl;
  }

  function renderGallery() {
    const gallery = getGallery();
    galleryGrid.innerHTML = '';
    galleryEmpty.style.display = gallery.length === 0 ? 'flex' : 'none';
    galleryGrid.style.display = gallery.length === 0 ? 'none' : 'grid';

    gallery.forEach((item, i) => {
      const div = document.createElement('div');
      div.className = 'gallery-item';
      div.style.animationDelay = `${i * 0.05}s`;

      const img = document.createElement('img');
      img.src = item.data;
      img.alt = item.name;
      img.loading = 'lazy';
      div.appendChild(img);

      const delBtn = document.createElement('button');
      delBtn.className = 'gallery-delete';
      delBtn.textContent = '✕';
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const g = getGallery().filter(x => x.id !== item.id);
        saveGallery(g);
        renderGallery();
      });
      div.appendChild(delBtn);

      const useLabel = document.createElement('div');
      useLabel.className = 'gallery-use';
      useLabel.textContent = 'Tap to use';
      div.appendChild(useLabel);

      div.addEventListener('click', () => {
        // Use this image for puzzle
        const loadImg = new Image();
        loadImg.onload = () => {
          customImage = loadImg;
          customImage._dataUrl = item.fullData || item.data;
          currentImageName = item.name;
          document.querySelectorAll('.image-option').forEach(el => el.classList.remove('selected'));
          uploadLabel.classList.add('has-file');
          uploadLabel.querySelector('span:last-child').textContent = item.name;
          // Switch to menu
          document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
          document.querySelector('.nav-tab[data-screen="menu-screen"]').classList.add('active');
          showScreen(menuScreen);
        };
        loadImg.src = item.fullData || item.data;
      });

      galleryGrid.appendChild(div);
    });
  }

  // ─── History Functions ───
  function addToHistory(record) {
    const history = getHistory();
    record.id = Date.now();
    history.unshift(record);
    if (history.length > 50) history.pop();
    saveHistory(history);
  }

  function renderHistory() {
    const history = getHistory();
    historyList.innerHTML = '';
    historyEmpty.style.display = history.length === 0 ? 'flex' : 'none';
    historyList.style.display = history.length === 0 ? 'none' : 'flex';

    history.forEach((record, i) => {
      const card = document.createElement('div');
      card.className = 'history-card';
      card.style.animationDelay = `${i * 0.05}s`;

      const thumb = document.createElement('img');
      thumb.className = 'history-thumb';
      thumb.src = record.thumbnail;
      thumb.alt = record.imageName;
      thumb.loading = 'lazy';
      card.appendChild(thumb);

      const info = document.createElement('div');
      info.className = 'history-info';
      info.innerHTML = `
        <div class="history-title">${record.imageName}</div>
        <div class="history-meta">
          <span class="history-meta-item"><span class="history-meta-icon">📐</span>${record.gridSize}×${record.gridSize}</span>
          <span class="history-meta-item"><span class="history-meta-icon">⏱</span>${record.time}</span>
          <span class="history-meta-item"><span class="history-meta-icon">👆</span>${record.moves} moves</span>
        </div>
      `;
      card.appendChild(info);

      const delBtn = document.createElement('button');
      delBtn.className = 'history-delete';
      delBtn.textContent = '\u2715';
      delBtn.title = 'Delete';
      delBtn.addEventListener('click', () => {
        const h = getHistory().filter(x => x.id !== record.id);
        saveHistory(h);
        renderHistory();
      });
      card.appendChild(delBtn);

      historyList.appendChild(card);
    });
  }

  // ─── Screen Navigation ───
  function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
  }

  function goToMenu() {
    clearInterval(timerInterval);
    winOverlay.classList.remove('active');
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.nav-tab[data-screen="menu-screen"]').classList.add('active');
    showScreen(menuScreen);
  }

  // ─── Start Game ───
  function startGame() {
    winOverlay.classList.remove('active');
    showScreen(gameScreen);

    // Generate image
    const imgSize = 800;
    if (customImage) {
      const c = createCanvas(imgSize, imgSize);
      const cx = c.getContext('2d');
      // Crop to square
      const s = Math.min(customImage.width, customImage.height);
      const sx = (customImage.width - s) / 2;
      const sy = (customImage.height - s) / 2;
      cx.drawImage(customImage, sx, sy, s, s, 0, 0, imgSize, imgSize);
      puzzleImage = c;
    } else {
      puzzleImage = imageGenerators[selectedImageIndex](imgSize, imgSize);
    }

    // Set preview
    previewImage.src = puzzleImage.toDataURL();

    // Reset state
    moveCount = 0;
    elapsedSeconds = 0;
    solved = false;
    showingHint = false;
    movesEl.textContent = '0';
    timerEl.textContent = '0:00';

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (!solved) {
        elapsedSeconds++;
        timerEl.textContent = formatTime(elapsedSeconds);
      }
    }, 1000);

    resizeCanvas();
    createPieces();
    shufflePieces();
    draw();

    // Attach events
    setupTouchEvents();
  }

  // ─── Canvas Sizing ───
  function resizeCanvas() {
    dpr = window.devicePixelRatio || 1;
    const rect = gameArea.getBoundingClientRect();
    const padding = 10;
    const availW = rect.width - padding * 2;
    const availH = rect.height - padding * 2;
    const size = Math.min(availW, availH);

    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    boardW = size;
    boardH = size;
    boardX = 0;
    boardY = 0;
    pieceW = boardW / gridSize;
    pieceH = boardH / gridSize;
  }

  // ─── Create Pieces ───
  function createPieces() {
    pieces = [];
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        pieces.push({
          id: row * gridSize + col,
          correctRow: row,
          correctCol: col,
          currentRow: row,
          currentCol: col,
          x: col * pieceW,
          y: row * pieceH,
          dragging: false,
        });
      }
    }
  }

  // ─── Shuffle ───
  function shufflePieces() {
    // Fisher-Yates shuffle on positions
    const positions = pieces.map(p => ({ row: p.currentRow, col: p.currentCol }));
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    pieces.forEach((p, i) => {
      p.currentRow = positions[i].row;
      p.currentCol = positions[i].col;
      p.x = p.currentCol * pieceW;
      p.y = p.currentRow * pieceH;
    });
    solved = false;
    draw();
  }

  // ─── Draw ───
  function draw() {
    const displayW = boardW;
    const displayH = boardH;
    ctx.clearRect(0, 0, displayW, displayH);

    // Background grid
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(0, 0, displayW, displayH);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * pieceW, 0);
      ctx.lineTo(i * pieceW, displayH);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * pieceH);
      ctx.lineTo(displayW, i * pieceH);
      ctx.stroke();
    }

    // Sort: dragged piece on top
    const sortedPieces = [...pieces].sort((a, b) => {
      if (a.dragging) return 1;
      if (b.dragging) return -1;
      return 0;
    });

    sortedPieces.forEach(piece => {
      const srcX = piece.correctCol * (puzzleImage.width / gridSize);
      const srcY = piece.correctRow * (puzzleImage.height / gridSize);
      const srcW = puzzleImage.width / gridSize;
      const srcH = puzzleImage.height / gridSize;

      ctx.save();

      // Shadow for dragged piece
      if (piece.dragging) {
        ctx.shadowColor = 'rgba(139, 92, 246, 0.5)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;
      }

      // Draw piece with rounded corners
      const px = piece.x;
      const py = piece.y;
      const pw = pieceW - 2;
      const ph = pieceH - 2;
      const r = Math.min(pw, ph) * 0.08;

      ctx.beginPath();
      ctx.moveTo(px + r + 1, py + 1);
      ctx.lineTo(px + pw - r + 1, py + 1);
      ctx.quadraticCurveTo(px + pw + 1, py + 1, px + pw + 1, py + r + 1);
      ctx.lineTo(px + pw + 1, py + ph - r + 1);
      ctx.quadraticCurveTo(px + pw + 1, py + ph + 1, px + pw - r + 1, py + ph + 1);
      ctx.lineTo(px + r + 1, py + ph + 1);
      ctx.quadraticCurveTo(px + 1, py + ph + 1, px + 1, py + ph - r + 1);
      ctx.lineTo(px + 1, py + r + 1);
      ctx.quadraticCurveTo(px + 1, py + 1, px + r + 1, py + 1);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(puzzleImage, srcX, srcY, srcW, srcH, px + 1, py + 1, pw, ph);

      // Hint overlay
      if (showingHint) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(px, py, pieceW, pieceH);
        ctx.fillStyle = '#fff';
        ctx.font = `${Math.min(pieceW, pieceH) * 0.3}px Inter`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${piece.correctRow + 1},${piece.correctCol + 1}`, px + pieceW / 2, py + pieceH / 2);
      }

      // Correct position indicator
      if (piece.currentRow === piece.correctRow && piece.currentCol === piece.correctCol && !piece.dragging) {
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.restore();

      // Border
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(px + r + 1, py + 1);
      ctx.lineTo(px + pw - r + 1, py + 1);
      ctx.quadraticCurveTo(px + pw + 1, py + 1, px + pw + 1, py + r + 1);
      ctx.lineTo(px + pw + 1, py + ph - r + 1);
      ctx.quadraticCurveTo(px + pw + 1, py + ph + 1, px + pw - r + 1, py + ph + 1);
      ctx.lineTo(px + r + 1, py + ph + 1);
      ctx.quadraticCurveTo(px + 1, py + ph + 1, px + 1, py + ph - r + 1);
      ctx.lineTo(px + 1, py + r + 1);
      ctx.quadraticCurveTo(px + 1, py + 1, px + r + 1, py + 1);
      ctx.closePath();
      ctx.strokeStyle = piece.dragging ? 'rgba(139,92,246,0.8)' : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = piece.dragging ? 2 : 1;
      ctx.stroke();
      ctx.restore();
    });
  }

  // ─── Touch/Mouse Events ───
  function setupTouchEvents() {
    canvas.onmousedown = canvas.ontouchstart = handleStart;
    canvas.onmousemove = canvas.ontouchmove = handleMove;
    canvas.onmouseup = canvas.ontouchend = handleEnd;
    canvas.onmouseleave = handleEnd;
  }

  function getEventPos(e) {
    const rect = canvas.getBoundingClientRect();
    const ev = e.touches ? e.touches[0] : e;
    if (!ev) return null;
    return {
      x: ev.clientX - rect.left,
      y: ev.clientY - rect.top,
    };
  }

  function handleStart(e) {
    if (solved) return;
    e.preventDefault();
    const pos = getEventPos(e);
    if (!pos) return;

    // Find piece at touch position (reverse order to get top piece)
    for (let i = pieces.length - 1; i >= 0; i--) {
      const p = pieces[i];
      if (pos.x >= p.x && pos.x <= p.x + pieceW &&
        pos.y >= p.y && pos.y <= p.y + pieceH) {
        selectedPiece = p;
        p.dragging = true;
        dragOffset.x = pos.x - p.x;
        dragOffset.y = pos.y - p.y;
        // Move to end of array for z-ordering
        pieces.splice(i, 1);
        pieces.push(p);
        draw();
        break;
      }
    }
  }

  function handleMove(e) {
    if (!selectedPiece || solved) return;
    e.preventDefault();
    const pos = getEventPos(e);
    if (!pos) return;

    selectedPiece.x = pos.x - dragOffset.x;
    selectedPiece.y = pos.y - dragOffset.y;

    // Clamp to canvas
    selectedPiece.x = Math.max(0, Math.min(boardW - pieceW, selectedPiece.x));
    selectedPiece.y = Math.max(0, Math.min(boardH - pieceH, selectedPiece.y));

    draw();
  }

  function handleEnd(e) {
    if (!selectedPiece || solved) return;

    // Calculate target grid cell
    const targetCol = Math.round(selectedPiece.x / pieceW);
    const targetRow = Math.round(selectedPiece.y / pieceH);
    const clampedCol = Math.max(0, Math.min(gridSize - 1, targetCol));
    const clampedRow = Math.max(0, Math.min(gridSize - 1, targetRow));

    // Find piece currently at target position
    const occupant = pieces.find(p =>
      p !== selectedPiece &&
      p.currentRow === clampedRow &&
      p.currentCol === clampedCol
    );

    if (occupant) {
      // Swap positions
      occupant.currentRow = selectedPiece.currentRow;
      occupant.currentCol = selectedPiece.currentCol;
      occupant.x = occupant.currentCol * pieceW;
      occupant.y = occupant.currentRow * pieceH;
    }

    selectedPiece.currentRow = clampedRow;
    selectedPiece.currentCol = clampedCol;
    selectedPiece.x = clampedCol * pieceW;
    selectedPiece.y = clampedRow * pieceH;
    selectedPiece.dragging = false;

    moveCount++;
    movesEl.textContent = moveCount;

    selectedPiece = null;
    draw();

    // Check win
    checkWin();
  }

  // ─── Win Check ───
  function checkWin() {
    const won = pieces.every(p => p.currentRow === p.correctRow && p.currentCol === p.correctCol);
    if (won) {
      solved = true;
      clearInterval(timerInterval);

      // Save to history
      const thumbC = createCanvas(80, 80);
      const thumbCx = thumbC.getContext('2d');
      thumbCx.drawImage(puzzleImage, 0, 0, 80, 80);
      addToHistory({
        imageName: currentImageName,
        gridSize: gridSize,
        time: formatTime(elapsedSeconds),
        timeSeconds: elapsedSeconds,
        moves: moveCount,
        thumbnail: thumbC.toDataURL('image/jpeg', 0.6),
        date: new Date().toISOString(),
      });

      setTimeout(() => {
        winTimeEl.textContent = formatTime(elapsedSeconds);
        winMovesEl.textContent = moveCount;
        winOverlay.classList.add('active');
        startConfetti();
      }, 300);
    }
  }

  // ─── Hint ───
  function toggleHint() {
    showingHint = !showingHint;
    hintBtn.style.color = showingHint ? 'var(--accent-primary)' : 'var(--text-primary)';
    draw();
    if (showingHint) {
      setTimeout(() => {
        showingHint = false;
        hintBtn.style.color = 'var(--text-primary)';
        draw();
      }, 2000);
    }
  }

  // ─── Preview ───
  function showPreview() {
    previewOverlay.style.display = 'flex';
    previewOverlay.classList.add('active');
    setTimeout(() => {
      const close = () => {
        previewOverlay.classList.remove('active');
        setTimeout(() => { previewOverlay.style.display = 'none'; }, 400);
      };
      previewOverlay.onclick = close;
    }, 50);
  }

  // ─── Confetti ───
  function startConfetti() {
    confettiCanvas.width = window.innerWidth * dpr;
    confettiCanvas.height = window.innerHeight * dpr;
    confettiCanvas.style.width = window.innerWidth + 'px';
    confettiCanvas.style.height = window.innerHeight + 'px';
    confettiCtx.scale(dpr, dpr);

    const particles = [];
    const colors = ['#8b5cf6', '#6366f1', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight - window.innerHeight,
        w: Math.random() * 10 + 4,
        h: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
      });
    }

    let frame = 0;
    const maxFrames = 180;

    function animateConfetti() {
      if (frame > maxFrames) {
        confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        return;
      }
      confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.rotation += p.rotationSpeed;
        p.opacity = Math.max(0, 1 - frame / maxFrames);

        confettiCtx.save();
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate((p.rotation * Math.PI) / 180);
        confettiCtx.globalAlpha = p.opacity;
        confettiCtx.fillStyle = p.color;
        confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        confettiCtx.restore();
      });

      frame++;
      requestAnimationFrame(animateConfetti);
    }

    animateConfetti();
  }

  // ─── Window Resize ───
  window.addEventListener('resize', () => {
    if (gameScreen.classList.contains('active') && puzzleImage) {
      resizeCanvas();
      pieces.forEach(p => {
        p.x = p.currentCol * pieceW;
        p.y = p.currentRow * pieceH;
      });
      draw();
    }
  });

  // ─── Init ───
  initMenu();
})();
