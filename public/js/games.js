// Mini Games Engine with Expanded Viewports and Large Visuals
// Chiều cao canvas 260px to rõ, chữ và vật thể lớn, hiệu ứng bắt mắt

class TypingGames {
  constructor(typingApp) {
    this.app = typingApp;
    this.currentGame = null;
    this.gameLoopId = null;
    this.currentLevel = 1;

    // Balloon Game State
    this.balloonState = {
      score: 0,
      lives: 3,
      balloons: [],
      speed: 1.0,
      spawnTimer: 0,
      spawnInterval: 110,
      isGameOver: false,
      activeTarget: null
    };

    // Racer Game State
    this.racerState = {
      words: [],
      currentWordIndex: 0,
      charIndex: 0,
      playerProgress: 0,
      botProgress: 0,
      botSpeed: 0.08,
      isFinished: false,
      winner: null
    };

    // Meteor Game State
    this.meteorState = {
      score: 0,
      lives: 3,
      meteors: [],
      lasers: [],
      spawnTimer: 0,
      speed: 0.85,
      isGameOver: false,
      activeTarget: null
    };

    // Apple Game State
    this.appleState = {
      score: 0,
      lives: 3,
      apples: [],
      basketX: 0.5,
      spawnTimer: 0,
      speed: 0.9,
      isGameOver: false,
      activeTarget: null
    };

    this.canvas = null;
    this.container = null;
  }

  setLevel(lvl) {
    this.currentLevel = parseInt(lvl, 10) || 1;
    if (this.currentGame === 'balloon') this.initBalloonData();
    else if (this.currentGame === 'racer') this.initRacerData();
    else if (this.currentGame === 'meteor') this.initMeteorData();
    else if (this.currentGame === 'apple') this.initAppleData();
  }

  // ==========================================================
  // 1. GAME: BÓNG BAY RƠI (BALLOON POP) - KHUNG TO RÕ 260PX
  // ==========================================================
  startBalloonGame(canvasEl) {
    this.currentGame = 'balloon';
    this.canvas = canvasEl;
    const ctx = canvasEl.getContext('2d');
    canvasEl.width = canvasEl.parentElement.clientWidth || 1300;
    canvasEl.height = 260; // Tăng lên 260px

    this.initBalloonData();

    const loop = () => {
      if (this.currentGame !== 'balloon') return;
      this.updateBalloonGame(ctx);
      this.gameLoopId = requestAnimationFrame(loop);
    };

    cancelAnimationFrame(this.gameLoopId);
    this.gameLoopId = requestAnimationFrame(loop);
  }

  initBalloonData() {
    let pool = ['f', 'j', 'd', 'k', 's', 'l', 'a', 'g', 'h'];
    let speed = 0.9;

    if (this.currentLevel === 2) {
      pool = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'z', 'x', 'c', 'v', 'b', 'n', 'm'];
      speed = 1.2;
    } else if (this.currentLevel >= 3) {
      pool = ['cat', 'dog', 'sun', 'sky', 'ban', 'mai', 'hoa', 'con', 'me', 'bo', 'ca', 'ga', 'xe', 'di'];
      speed = 1.45;
    }

    this.balloonPool = pool;
    this.balloonState = {
      score: 0,
      lives: 3,
      balloons: [],
      speed,
      spawnTimer: 0,
      spawnInterval: Math.max(70, 120 - this.currentLevel * 15),
      isGameOver: false,
      activeTarget: null
    };

    this.updateStatsUI('balloonScore', 'balloonLives', this.balloonState.score, this.balloonState.lives);
    this.spawnBalloon();
  }

  spawnBalloon() {
    const text = this.balloonPool[Math.floor(Math.random() * this.balloonPool.length)];
    const colors = ['#FF4757', '#FFA502', '#2ED573', '#1E90FF', '#9C88FF', '#ED4C67', '#00D2D3'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const radius = text.length > 2 ? 46 : 38; // Quả bóng to rõ

    const margin = 100;
    const x = margin + Math.random() * (this.canvas.width - margin * 2);

    this.balloonState.balloons.push({
      x,
      y: -radius,
      radius,
      text,
      color,
      speed: this.balloonState.speed * (0.85 + Math.random() * 0.3),
      popping: false,
      popScale: 1
    });

    this.updateTargetBalloon();
  }

  updateTargetBalloon() {
    const active = this.balloonState.balloons
      .filter(b => !b.popping)
      .sort((a, b) => b.y - a.y)[0];

    this.balloonState.activeTarget = active || null;

    if (active && this.app) {
      const nextChar = active.text[0];
      const finger = this.app.keyboard.highlightTarget(nextChar);
      this.app.hands.highlightFinger(finger, nextChar);
    }
  }

  updateBalloonGame(ctx) {
    const width = this.canvas.width;
    const height = this.canvas.height;
    ctx.clearRect(0, 0, width, height);

    if (this.balloonState.isGameOver) {
      this.drawGameOver(ctx, width, height, 'BÓNG BAY NỔ HẾT! 🎈', this.balloonState.score);
      return;
    }

    this.balloonState.spawnTimer++;
    if (this.balloonState.spawnTimer >= this.balloonState.spawnInterval) {
      this.balloonState.spawnTimer = 0;
      if (this.balloonState.balloons.length < 7) this.spawnBalloon();
    }

    for (let i = this.balloonState.balloons.length - 1; i >= 0; i--) {
      const b = this.balloonState.balloons[i];

      if (b.popping) {
        b.popScale += 0.15;
        b.opacity = (b.opacity || 1) - 0.1;
        if (b.opacity <= 0) {
          this.balloonState.balloons.splice(i, 1);
          this.updateTargetBalloon();
          continue;
        }
      } else {
        b.y += b.speed;
        if (b.y - b.radius > height) {
          this.balloonState.balloons.splice(i, 1);
          this.balloonState.lives--;
          this.updateStatsUI('balloonScore', 'balloonLives', this.balloonState.score, this.balloonState.lives);
          if (this.balloonState.lives <= 0) this.balloonState.isGameOver = true;
          this.updateTargetBalloon();
          continue;
        }
      }

      ctx.save();
      ctx.globalAlpha = b.opacity || 1;
      ctx.translate(b.x, b.y);
      ctx.scale(b.popScale, b.popScale);

      const isTarget = (b === this.balloonState.activeTarget);

      if (isTarget) {
        ctx.strokeStyle = '#FFD32A';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, 0, b.radius + 8, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, b.radius, b.radius * 1.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dây bóng bay
      ctx.beginPath();
      ctx.moveTo(0, b.radius * 1.2);
      ctx.lineTo(0, b.radius * 1.2 + 18);
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Chữ to rõ trong bóng
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${b.text.length > 2 ? 22 : 28}px Quicksand, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = 5;
      ctx.fillText(b.text.toUpperCase(), 0, -2);

      ctx.restore();
    }
  }

  handleBalloonKey(key) {
    if (this.balloonState.isGameOver) return;
    const target = this.balloonState.activeTarget;
    if (!target) return;

    if (key.toLowerCase() === target.text[0].toLowerCase()) {
      target.text = target.text.slice(1);
      this.app.keyboard.flashKey(key, true);

      if (target.text.length === 0) {
        target.popping = true;
        this.balloonState.score += 10 * this.currentLevel;
        this.updateStatsUI('balloonScore', 'balloonLives', this.balloonState.score, this.balloonState.lives);
        this.app.confetti.trigger(30);
      } else {
        this.updateTargetBalloon();
      }
    } else {
      this.app.keyboard.flashKey(key, false);
    }
  }

  // ==========================================================
  // 2. GAME: ĐUA TÀU VŨ TRỤ (SPACE RACER) - KHUNG TO RÕ 260PX
  // ==========================================================
  startRacerGame(containerEl) {
    this.currentGame = 'racer';
    this.container = containerEl;

    this.initRacerData();

    const loop = () => {
      if (this.currentGame !== 'racer' || this.racerState.isFinished) return;
      this.updateRacerBot();
      this.gameLoopId = requestAnimationFrame(loop);
    };

    cancelAnimationFrame(this.gameLoopId);
    this.gameLoopId = requestAnimationFrame(loop);
  }

  initRacerData() {
    let pool = ['cat', 'dog', 'sun', 'sky', 'car', 'star', 'hoa', 'con', 'tau', 'vui'];
    let count = 6;
    let botSpeed = 0.08;

    if (this.currentLevel === 2) {
      pool = ['happy', 'apple', 'school', 'flower', 'ban mai', 'hoa sen', 'hoc tap', 'cham chi'];
      count = 9;
      botSpeed = 0.13;
    } else if (this.currentLevel >= 3) {
      pool = ['may tinh', 'ban phim', 'tieng viet', 'nhanh nhen', 'kheo leo', 'chinh xac', 'chien thang'];
      count = 12;
      botSpeed = 0.18;
    }

    const shuffled = pool.sort(() => 0.5 - Math.random()).slice(0, count);

    this.racerState = {
      words: shuffled,
      currentWordIndex: 0,
      charIndex: 0,
      playerProgress: 0,
      botProgress: 0,
      botSpeed,
      isFinished: false,
      winner: null
    };

    this.renderRacerUI();
    this.updateRacerTarget();
  }

  renderRacerUI() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="racer-track-card">
        <div class="game-top-bar" style="position: relative; margin-bottom: 4px;">
          <span style="font-weight: 800; font-size: 1.05rem; color: #38bdf8;">🏁 ĐUA TỐC ĐỘ PHẢN XẠ - CẤP ĐỘ ${this.currentLevel}</span>
          <div class="game-levels-group">
            <button type="button" class="btn-game-lvl ${this.currentLevel === 1 ? 'is-active' : ''}" data-lvl="1">Cấp 1 (Dễ)</button>
            <button type="button" class="btn-game-lvl ${this.currentLevel === 2 ? 'is-active' : ''}" data-lvl="2">Cấp 2 (Vừa)</button>
            <button type="button" class="btn-game-lvl ${this.currentLevel === 3 ? 'is-active' : ''}" data-lvl="3">Cấp 3 (Khó)</button>
          </div>
        </div>

        <div class="race-lane player-lane">
          <div class="lane-label">🚀 BẠN:</div>
          <div class="lane-track">
            <div class="racer-avatar" id="playerRacer" style="left: 0%;">🚀</div>
            <div class="finish-line">🏁</div>
          </div>
          <div class="lane-percent" id="playerPercent">0%</div>
        </div>

        <div class="race-lane bot-lane">
          <div class="lane-label">🛸 ROBOT:</div>
          <div class="lane-track">
            <div class="racer-avatar" id="botRacer" style="left: 0%;">🛸</div>
            <div class="finish-line">🏁</div>
          </div>
          <div class="lane-percent" id="botPercent">0%</div>
        </div>

        <div class="racer-target-display" id="racerWordsDisplay"></div>
      </div>
    `;

    this.container.querySelectorAll('.btn-game-lvl').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setLevel(e.target.getAttribute('data-lvl'));
      });
    });

    this.renderRacerWords();
  }

  renderRacerWords() {
    const el = document.getElementById('racerWordsDisplay');
    if (!el) return;
    const s = this.racerState;
    let html = '';

    s.words.forEach((w, wIdx) => {
      if (wIdx < s.currentWordIndex) {
        html += `<span class="r-word done">${w}</span> `;
      } else if (wIdx === s.currentWordIndex) {
        html += `<span class="r-word current">`;
        for (let i = 0; i < w.length; i++) {
          if (i < s.charIndex) html += `<span class="r-char correct">${w[i]}</span>`;
          else if (i === s.charIndex) html += `<span class="r-char active">${w[i]}</span>`;
          else html += `<span class="r-char pending">${w[i]}</span>`;
        }
        html += `</span> `;
      } else {
        html += `<span class="r-word upcoming">${w}</span> `;
      }
    });

    el.innerHTML = html;
  }

  updateRacerTarget() {
    const s = this.racerState;
    if (s.currentWordIndex >= s.words.length) {
      this.finishRacer(true);
      return;
    }

    const currentWord = s.words[s.currentWordIndex];
    const targetChar = currentWord[s.charIndex];

    if (this.app) {
      const finger = this.app.keyboard.highlightTarget(targetChar);
      this.app.hands.highlightFinger(finger, targetChar);
    }
  }

  handleRacerKey(key) {
    if (this.racerState.isFinished) return;
    const s = this.racerState;
    const currentWord = s.words[s.currentWordIndex];
    const targetChar = currentWord[s.charIndex];

    const isMatch = (key.toLowerCase() === targetChar.toLowerCase()) || (targetChar === ' ' && key === ' ');

    if (isMatch) {
      this.app.keyboard.flashKey(key, true);
      s.charIndex++;

      if (s.charIndex >= currentWord.length) {
        s.currentWordIndex++;
        s.charIndex = 0;
      }

      const totalChars = s.words.reduce((acc, w) => acc + w.length, 0);
      let typedChars = 0;
      for (let i = 0; i < s.currentWordIndex; i++) typedChars += s.words[i].length;
      typedChars += s.charIndex;

      s.playerProgress = Math.min(100, Math.round((typedChars / totalChars) * 100));

      const pAvatar = document.getElementById('playerRacer');
      const pPercent = document.getElementById('playerPercent');
      if (pAvatar) pAvatar.style.left = `${Math.min(93, s.playerProgress * 0.93)}%`;
      if (pPercent) pPercent.textContent = `${s.playerProgress}%`;

      this.renderRacerWords();
      this.updateRacerTarget();

      if (s.playerProgress >= 100) this.finishRacer(true);
    } else {
      this.app.keyboard.flashKey(key, false);
    }
  }

  updateRacerBot() {
    const s = this.racerState;
    if (s.isFinished) return;

    s.botProgress += s.botSpeed;
    const bAvatar = document.getElementById('botRacer');
    const bPercent = document.getElementById('botPercent');
    if (bAvatar) bAvatar.style.left = `${Math.min(93, s.botProgress * 0.93)}%`;
    if (bPercent) bPercent.textContent = `${Math.min(100, Math.round(s.botProgress))}%`;

    if (s.botProgress >= 100) this.finishRacer(false);
  }

  finishRacer(playerWon) {
    this.racerState.isFinished = true;
    const wordsEl = document.getElementById('racerWordsDisplay');
    if (wordsEl) {
      if (playerWon) {
        wordsEl.innerHTML = `<div class="racer-winner-banner">🏆 CHÚC MỪNG BẠN ĐÃ CHIẾN THẮNG CUỘC ĐUA CẤP ${this.currentLevel}! 🚀</div>`;
        this.app.confetti.trigger(150);
      } else {
        wordsEl.innerHTML = `<div class="racer-loser-banner">🤖 ROBOT ĐÃ VỀ ĐÍCH TRƯỚC! HÃY THỬ LẠI NHÉ! 🏁</div>`;
      }
    }
  }

  // ==========================================================
  // 3. GAME: BẮN THIÊN THẠCH (METEOR DEFENDER) - KHUNG TO RÕ 260PX
  // ==========================================================
  startMeteorGame(canvasEl) {
    this.currentGame = 'meteor';
    this.canvas = canvasEl;
    const ctx = canvasEl.getContext('2d');
    canvasEl.width = canvasEl.parentElement.clientWidth || 1300;
    canvasEl.height = 260; // Tăng lên 260px

    this.initMeteorData();

    const loop = () => {
      if (this.currentGame !== 'meteor') return;
      this.updateMeteorGame(ctx);
      this.gameLoopId = requestAnimationFrame(loop);
    };

    cancelAnimationFrame(this.gameLoopId);
    this.gameLoopId = requestAnimationFrame(loop);
  }

  initMeteorData() {
    let pool = ['f', 'j', 'd', 'k', 's', 'l', 'a', 'g', 'h'];
    let speed = 0.85;

    if (this.currentLevel === 2) {
      pool = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
      speed = 1.15;
    } else if (this.currentLevel >= 3) {
      pool = ['lua', 'sao', 'bay', 'dan', 'tau', 'phao', 'bom', 'boc', 'lua'];
      speed = 1.45;
    }

    this.meteorPool = pool;
    this.meteorState = {
      score: 0,
      lives: 3,
      meteors: [],
      lasers: [],
      speed,
      spawnTimer: 0,
      spawnInterval: Math.max(65, 120 - this.currentLevel * 15),
      isGameOver: false,
      activeTarget: null
    };

    this.updateStatsUI('meteorScore', 'meteorLives', this.meteorState.score, this.meteorState.lives);
    this.spawnMeteor();
  }

  spawnMeteor() {
    const text = this.meteorPool[Math.floor(Math.random() * this.meteorPool.length)];
    const margin = 110;
    const x = margin + Math.random() * (this.canvas.width - margin * 2);

    this.meteorState.meteors.push({
      x,
      y: -30,
      radius: text.length > 2 ? 44 : 36, // Thiên thạch to rõ
      text,
      speed: this.meteorState.speed * (0.85 + Math.random() * 0.3),
      exploding: false,
      explodeTimer: 0
    });

    this.updateTargetMeteor();
  }

  updateTargetMeteor() {
    const active = this.meteorState.meteors
      .filter(m => !m.exploding)
      .sort((a, b) => b.y - a.y)[0];

    this.meteorState.activeTarget = active || null;

    if (active && this.app) {
      const nextChar = active.text[0];
      const finger = this.app.keyboard.highlightTarget(nextChar);
      this.app.hands.highlightFinger(finger, nextChar);
    }
  }

  updateMeteorGame(ctx) {
    const width = this.canvas.width;
    const height = this.canvas.height;
    ctx.clearRect(0, 0, width, height);

    if (this.meteorState.isGameOver) {
      this.drawGameOver(ctx, width, height, 'CĂN CỨ ĐÃ BỊ PHÁ HỦY! 👾', this.meteorState.score);
      return;
    }

    this.meteorState.spawnTimer++;
    if (this.meteorState.spawnTimer >= this.meteorState.spawnInterval) {
      this.meteorState.spawnTimer = 0;
      if (this.meteorState.meteors.length < 6) this.spawnMeteor();
    }

    // Khẩu đại bác Laser ở đáy màn hình
    const cannonX = width / 2;
    const cannonY = height - 12;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(cannonX, cannonY, 26, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(cannonX - 6, cannonY - 32, 12, 32);

    // Vẽ tia Laser
    for (let i = this.meteorState.lasers.length - 1; i >= 0; i--) {
      const l = this.meteorState.lasers[i];
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cannonX, cannonY - 30);
      ctx.lineTo(l.targetX, l.targetY);
      ctx.stroke();

      l.alpha -= 0.12;
      if (l.alpha <= 0) this.meteorState.lasers.splice(i, 1);
    }

    // Vẽ các Thiên Thạch
    for (let i = this.meteorState.meteors.length - 1; i >= 0; i--) {
      const m = this.meteorState.meteors[i];

      if (m.exploding) {
        m.explodeTimer += 0.12;
        ctx.fillStyle = `rgba(249, 115, 22, ${1 - m.explodeTimer})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius * (1 + m.explodeTimer * 1.5), 0, Math.PI * 2);
        ctx.fill();

        if (m.explodeTimer >= 1) {
          this.meteorState.meteors.splice(i, 1);
          this.updateTargetMeteor();
          continue;
        }
      } else {
        m.y += m.speed;
        if (m.y + m.radius > height) {
          this.meteorState.meteors.splice(i, 1);
          this.meteorState.lives--;
          this.updateStatsUI('meteorScore', 'meteorLives', this.meteorState.score, this.meteorState.lives);
          if (this.meteorState.lives <= 0) this.meteorState.isGameOver = true;
          this.updateTargetMeteor();
          continue;
        }

        const isTarget = (m === this.meteorState.activeTarget);

        ctx.save();
        ctx.translate(m.x, m.y);

        if (isTarget) {
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 4.5;
          ctx.beginPath();
          ctx.arc(0, 0, m.radius + 7, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Thân Thiên Thạch
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(0, 0, m.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Chữ trên Thiên Thạch to rõ
        ctx.fillStyle = '#f8fafc';
        ctx.font = `bold ${m.text.length > 2 ? 20 : 26}px Quicksand, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(m.text.toUpperCase(), 0, 0);

        ctx.restore();
      }
    }
  }

  handleMeteorKey(key) {
    if (this.meteorState.isGameOver) return;
    const target = this.meteorState.activeTarget;
    if (!target) return;

    if (key.toLowerCase() === target.text[0].toLowerCase()) {
      target.text = target.text.slice(1);
      this.app.keyboard.flashKey(key, true);

      // Bắn laser
      this.meteorState.lasers.push({
        targetX: target.x,
        targetY: target.y,
        alpha: 1
      });

      if (target.text.length === 0) {
        target.exploding = true;
        this.meteorState.score += 15 * this.currentLevel;
        this.updateStatsUI('meteorScore', 'meteorLives', this.meteorState.score, this.meteorState.lives);
        this.app.confetti.trigger(30);
      } else {
        this.updateTargetMeteor();
      }
    } else {
      this.app.keyboard.flashKey(key, false);
    }
  }

  // ==========================================================
  // 4. GAME: HÁI TÁO VÀNG (APPLE CATCHER) - KHUNG TO RÕ 260PX
  // ==========================================================
  startAppleGame(canvasEl) {
    this.currentGame = 'apple';
    this.canvas = canvasEl;
    const ctx = canvasEl.getContext('2d');
    canvasEl.width = canvasEl.parentElement.clientWidth || 1300;
    canvasEl.height = 260; // Tăng lên 260px

    this.initAppleData();

    const loop = () => {
      if (this.currentGame !== 'apple') return;
      this.updateAppleGame(ctx);
      this.gameLoopId = requestAnimationFrame(loop);
    };

    cancelAnimationFrame(this.gameLoopId);
    this.gameLoopId = requestAnimationFrame(loop);
  }

  initAppleData() {
    let pool = ['f', 'j', 'd', 'k', 's', 'l', 'a', 'g', 'h'];
    let speed = 0.9;

    if (this.currentLevel === 2) {
      pool = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'z', 'x', 'c', 'v', 'b', 'n', 'm'];
      speed = 1.2;
    } else if (this.currentLevel >= 3) {
      pool = ['tao', 'cam', 'nho', 'le', 'dua', 'mit', 'oi', 'mo', 'man'];
      speed = 1.45;
    }

    this.applePool = pool;
    this.appleState = {
      score: 0,
      lives: 3,
      apples: [],
      speed,
      basketX: this.canvas.width / 2,
      targetBasketX: this.canvas.width / 2,
      spawnTimer: 0,
      spawnInterval: Math.max(70, 125 - this.currentLevel * 15),
      isGameOver: false,
      activeTarget: null
    };

    this.updateStatsUI('appleScore', 'appleLives', this.appleState.score, this.appleState.lives);
    this.spawnApple();
  }

  spawnApple() {
    const text = this.applePool[Math.floor(Math.random() * this.applePool.length)];
    const margin = 100;
    const x = margin + Math.random() * (this.canvas.width - margin * 2);

    this.appleState.apples.push({
      x,
      y: -30,
      radius: text.length > 2 ? 40 : 34, // Táo to rõ
      text,
      speed: this.appleState.speed * (0.85 + Math.random() * 0.3),
      caught: false,
      caughtTimer: 0
    });

    this.updateTargetApple();
  }

  updateTargetApple() {
    const active = this.appleState.apples
      .filter(a => !a.caught)
      .sort((a, b) => b.y - a.y)[0];

    this.appleState.activeTarget = active || null;
    if (active) {
      this.appleState.targetBasketX = active.x;
      if (this.app) {
        const nextChar = active.text[0];
        const finger = this.app.keyboard.highlightTarget(nextChar);
        this.app.hands.highlightFinger(finger, nextChar);
      }
    }
  }

  updateAppleGame(ctx) {
    const width = this.canvas.width;
    const height = this.canvas.height;
    ctx.clearRect(0, 0, width, height);

    if (this.appleState.isGameOver) {
      this.drawGameOver(ctx, width, height, 'TÁO RƠI HẾT RỒI! 🍎', this.appleState.score);
      return;
    }

    this.appleState.spawnTimer++;
    if (this.appleState.spawnTimer >= this.appleState.spawnInterval) {
      this.appleState.spawnTimer = 0;
      if (this.appleState.apples.length < 6) this.spawnApple();
    }

    this.appleState.basketX += (this.appleState.targetBasketX - this.appleState.basketX) * 0.15;

    // Giỏ hái to ở đáy
    const bx = this.appleState.basketX;
    const by = height - 16;
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.roundRect(bx - 45, by - 16, 90, 26, 8);
    ctx.fill();
    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 15px Quicksand, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🧺 GIỎ HÁI TÁO', bx, by);

    // Vẽ táo rơi
    for (let i = this.appleState.apples.length - 1; i >= 0; i--) {
      const a = this.appleState.apples[i];

      if (a.caught) {
        a.caughtTimer += 0.15;
        if (a.caughtTimer >= 1) {
          this.appleState.apples.splice(i, 1);
          this.updateTargetApple();
          continue;
        }
      } else {
        a.y += a.speed;
        if (a.y + a.radius > height) {
          this.appleState.apples.splice(i, 1);
          this.appleState.lives--;
          this.updateStatsUI('appleScore', 'appleLives', this.appleState.score, this.appleState.lives);
          if (this.appleState.lives <= 0) this.appleState.isGameOver = true;
          this.updateTargetApple();
          continue;
        }

        const isTarget = (a === this.appleState.activeTarget);

        ctx.save();
        ctx.translate(a.x, a.y);

        if (isTarget) {
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 4.5;
          ctx.beginPath();
          ctx.arc(0, 0, a.radius + 6, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Quả Táo đỏ
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, 0, a.radius, 0, Math.PI * 2);
        ctx.fill();

        // Lá táo
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.ellipse(4, -a.radius - 3, 9, 4, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Chữ to trên quả táo
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${a.text.length > 2 ? 19 : 24}px Quicksand, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(a.text.toUpperCase(), 0, 1);

        ctx.restore();
      }
    }
  }

  handleAppleKey(key) {
    if (this.appleState.isGameOver) return;
    const target = this.appleState.activeTarget;
    if (!target) return;

    if (key.toLowerCase() === target.text[0].toLowerCase()) {
      target.text = target.text.slice(1);
      this.app.keyboard.flashKey(key, true);

      if (target.text.length === 0) {
        target.caught = true;
        this.appleState.score += 10 * this.currentLevel;
        this.updateStatsUI('appleScore', 'appleLives', this.appleState.score, this.appleState.lives);
        this.app.confetti.trigger(25);
      } else {
        this.updateTargetApple();
      }
    } else {
      this.app.keyboard.flashKey(key, false);
    }
  }

  // ==========================================================
  // HELPERS
  // ==========================================================
  updateStatsUI(scoreId, livesId, score, lives) {
    const sEl = document.getElementById(scoreId);
    const lEl = document.getElementById(livesId);
    if (sEl) sEl.textContent = score;
    if (lEl) {
      let hearts = '';
      for (let i = 0; i < 3; i++) hearts += i < lives ? '❤️ ' : '🖤 ';
      lEl.textContent = hearts.trim();
    }
  }

  drawGameOver(ctx, width, height, title, score) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 36px Quicksand, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, width / 2, height / 2 - 15);
    ctx.font = 'bold 22px Quicksand, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Tổng điểm của bạn: ${score} điểm`, width / 2, height / 2 + 25);
  }

  stopAll() {
    this.currentGame = null;
    cancelAnimationFrame(this.gameLoopId);
    if (this.app) {
      this.app.keyboard.clear();
      this.app.hands.clear();
    }
  }
}
