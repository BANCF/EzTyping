// Student Typing Engine with 4 Mini Games, Level Controls, and Expanded Screen Fit

class TypingApp {
  constructor() {
    this.socket = null;
    this.student = {
      name: localStorage.getItem('student_name') || ''
    };

    this.currentMode = 'typing'; // 'typing' | 'balloon' | 'racer' | 'meteor' | 'apple' | 'exam10m'
    this.currentLesson = LESSONS[0];
    this.text = this.currentLesson.text;
    this.currentIndex = 0;
    this.correctCount = 0;
    this.errorCount = 0;
    this.mistakesMap = {};
    this.startTime = null;
    this.timerInterval = null;
    this.timeLeft = this.currentLesson.duration || 60;
    this.isFinished = false;
    this.isExamMode = false;

    // Components
    this.keyboard = new VirtualKeyboard('keyboardContainer');
    this.hands = new VirtualHands('handsContainer', 'tipGuidance');
    this.confetti = new ConfettiEffect('confettiCanvas');
    this.games = new TypingGames(this);

    // DOM Elements
    this.textDisplay = document.getElementById('textDisplay');
    this.wpmVal = document.getElementById('wpmVal');
    this.accuracyVal = document.getElementById('accuracyVal');
    this.timerVal = document.getElementById('timerVal');
    this.hiddenInput = document.getElementById('hiddenTypingInput');
    this.lessonTitleTag = document.getElementById('lessonTitleTag');
    this.currentLessonNameDisplay = document.getElementById('currentLessonNameDisplay');

    // Views
    this.typingDisplaySection = document.getElementById('typingDisplaySection');
    this.balloonGameContainer = document.getElementById('balloonGameContainer');
    this.racerGameContainer = document.getElementById('racerGameContainer');
    this.meteorGameContainer = document.getElementById('meteorGameContainer');
    this.appleGameContainer = document.getElementById('appleGameContainer');

    // Modals
    this.loginModal = document.getElementById('loginModal');
    this.rewardModal = document.getElementById('rewardModal');
    this.lessonPickerModal = document.getElementById('lessonPickerModal');
    this.countdownOverlay = document.getElementById('countdownOverlay');
    this.countdownNum = document.getElementById('countdownNum');

    this.initSocket();
    this.initLessonPicker();
    this.initGameLevelButtons();
    this.bindEvents();

    if (!this.student.name) {
      this.openLoginModal();
    } else {
      this.updateStudentBadge();
      this.registerSocket();
      this.loadLesson(this.currentLesson);
    }
  }

  initSocket() {
    if (typeof io !== 'undefined') {
      try {
        this.socket = io({ timeout: 5000, reconnectionAttempts: 2 });
        this.socket.on('connect', () => {
          if (this.student.name) this.registerSocket();
        });
        this.socket.on('exam:start', (examData) => this.handleTeacherExamStart(examData));
        this.socket.on('exam:stop', () => {
          if (this.isExamMode && !this.isFinished) this.finishLesson();
        });
      } catch (e) {
        console.log('Chạy chế độ Cloud Standalone');
      }
    }
  }

  registerSocket() {
    if (this.socket && this.socket.connected) {
      this.socket.emit('student:register', this.student);
    }
  }

  initLessonPicker() {
    const grid = document.getElementById('lessonsGridContainer');
    const tabs = document.querySelectorAll('.cat-tab-btn');
    if (!grid) return;

    const renderGrid = (filterCat) => {
      grid.innerHTML = '';
      let list = LESSONS;
      if (filterCat && filterCat !== 'ALL') {
        list = LESSONS.filter(l => (l.category || 'Hàng cơ sở') === filterCat);
      }

      list.forEach(l => {
        const card = document.createElement('div');
        card.className = `lesson-item-card ${l.id === this.currentLesson.id ? 'is-selected' : ''}`;
        const mins = Math.floor(l.duration / 60);
        const secs = l.duration % 60;
        const timeLabel = mins > 0 ? `${mins} phút` : `${secs}s`;

        card.innerHTML = `
          <div>
            <div class="l-item-title">${l.title}</div>
            <div class="l-item-desc">${l.desc}</div>
          </div>
          <div class="l-item-meta">
            <span class="l-item-level">${l.category || l.level}</span>
            <span class="l-item-duration">⏱️ ${timeLabel}</span>
          </div>
        `;

        card.addEventListener('click', () => {
          this.switchMode('typing');
          this.loadLesson(l);
          this.closeLessonPicker();
        });

        grid.appendChild(card);
      });
    };

    renderGrid('ALL');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        renderGrid(tab.getAttribute('data-cat'));
      });
    });
  }

  initGameLevelButtons() {
    // Setup level buttons for each game
    const setupGroup = (groupId) => {
      const container = document.getElementById(groupId);
      if (!container) return;
      container.querySelectorAll('.btn-game-lvl').forEach(btn => {
        btn.addEventListener('click', (e) => {
          container.querySelectorAll('.btn-game-lvl').forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          this.games.setLevel(btn.getAttribute('data-lvl'));
        });
      });
    };

    setupGroup('balloonLevelButtons');
    setupGroup('meteorLevelButtons');
    setupGroup('appleLevelButtons');
  }

  bindEvents() {
    // Prevent stealing focus from buttons/inputs/modals
    document.addEventListener('click', (e) => {
      if (e.target.closest('button, input, select, .lesson-item-card, .modal-card, .lesson-picker-card, .cat-tab-btn, .btn-game-lvl')) {
        return;
      }
      if (!this.loginModal.classList.contains('is-open') && 
          !this.rewardModal.classList.contains('is-open') && 
          !this.lessonPickerModal.classList.contains('is-open')) {
        this.hiddenInput.focus();
      }
    });

    window.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // Mode tabs
    document.querySelectorAll('.mode-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode');
        this.switchMode(mode);
      });
    });

    // Lesson picker button
    document.getElementById('openLessonPickerBtn')?.addEventListener('click', () => {
      this.openLessonPicker();
    });

    document.getElementById('closeLessonPickerBtn')?.addEventListener('click', () => {
      this.closeLessonPicker();
    });

    document.getElementById('resetLessonBtn')?.addEventListener('click', () => {
      if (this.currentMode === 'typing') {
        this.loadLesson(this.currentLesson);
      } else if (this.currentMode === 'balloon') {
        this.games.startBalloonGame(document.getElementById('balloonGameCanvas'));
      } else if (this.currentMode === 'racer') {
        this.games.startRacerGame(this.racerGameContainer);
      } else if (this.currentMode === 'meteor') {
        this.games.startMeteorGame(document.getElementById('meteorGameCanvas'));
      } else if (this.currentMode === 'apple') {
        this.games.startAppleGame(document.getElementById('appleGameCanvas'));
      }
    });

    document.getElementById('changeStudentBtn')?.addEventListener('click', () => {
      this.openLoginModal();
    });

    // Login Form Submit
    document.getElementById('loginForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('inputStudentName');
      const name = nameInput ? nameInput.value.trim() : '';

      if (!name) return;
      this.student.name = name;
      localStorage.setItem('student_name', this.student.name);

      this.updateStudentBadge();
      this.closeLoginModal();
      this.registerSocket();
      this.loadLesson(this.currentLesson);
    });

    document.getElementById('retryBtn')?.addEventListener('click', () => {
      this.closeRewardModal();
      this.loadLesson(this.currentLesson);
    });

    document.getElementById('nextLessonBtn')?.addEventListener('click', () => {
      this.closeRewardModal();
      const currIdx = LESSONS.findIndex(l => l.id === this.currentLesson.id);
      const nextLesson = LESSONS[(currIdx + 1) % LESSONS.length];
      this.loadLesson(nextLesson);
    });
  }

  switchMode(mode) {
    this.currentMode = mode;
    this.games.stopAll();

    document.querySelectorAll('.mode-tab-btn').forEach(b => {
      b.classList.toggle('is-active', b.getAttribute('data-mode') === mode);
    });

    // Hide all view containers
    this.typingDisplaySection.style.display = 'none';
    this.balloonGameContainer.classList.remove('is-active');
    this.racerGameContainer.classList.remove('is-active');
    this.meteorGameContainer.classList.remove('is-active');
    this.appleGameContainer.classList.remove('is-active');

    if (mode === 'typing') {
      this.typingDisplaySection.style.display = 'flex';
      this.loadLesson(this.currentLesson);
    } else if (mode === 'balloon') {
      this.balloonGameContainer.classList.add('is-active');
      this.currentLessonNameDisplay.textContent = 'Trò Chơi: Bóng Bay Rơi Tự Do 🎈';
      this.games.startBalloonGame(document.getElementById('balloonGameCanvas'));
    } else if (mode === 'racer') {
      this.racerGameContainer.classList.add('is-active');
      this.currentLessonNameDisplay.textContent = 'Trò Chơi: Đua Tàu Vũ Trụ 🚀';
      this.games.startRacerGame(this.racerGameContainer);
    } else if (mode === 'meteor') {
      this.meteorGameContainer.classList.add('is-active');
      this.currentLessonNameDisplay.textContent = 'Trò Chơi: Bắn Pháo Laser Thiên Thạch 👾';
      this.games.startMeteorGame(document.getElementById('meteorGameCanvas'));
    } else if (mode === 'apple') {
      this.appleGameContainer.classList.add('is-active');
      this.currentLessonNameDisplay.textContent = 'Trò Chơi: Hái Táo Vàng Vào Giỏ 🍎';
      this.games.startAppleGame(document.getElementById('appleGameCanvas'));
    } else if (mode === 'exam10m') {
      this.typingDisplaySection.style.display = 'flex';
      const exam10m = LESSONS.find(l => l.id === 'test_comprehensive_10m') || LESSONS[0];
      this.loadLesson(exam10m);
    }

    this.hiddenInput.focus();
  }

  openLessonPicker() {
    this.lessonPickerModal.classList.add('is-open');
  }

  closeLessonPicker() {
    this.lessonPickerModal.classList.remove('is-open');
    this.hiddenInput.focus();
  }

  updateStudentBadge() {
    const nameEl = document.getElementById('displayStudentName');
    if (nameEl) nameEl.textContent = this.student.name || 'Học sinh';
  }

  openLoginModal() {
    const inputName = document.getElementById('inputStudentName');
    if (inputName) inputName.value = this.student.name || '';
    this.loginModal.classList.add('is-open');
    setTimeout(() => inputName?.focus(), 100);
  }

  closeLoginModal() {
    this.loginModal.classList.remove('is-open');
    this.hiddenInput.focus();
  }

  openRewardModal(result) {
    const starsContainer = document.getElementById('rewardStars');
    if (starsContainer) {
      starsContainer.innerHTML = '';
      for (let i = 1; i <= 3; i++) {
        const star = document.createElement('span');
        star.className = `star-icon ${i <= result.stars ? 'achieved' : ''}`;
        star.textContent = '★';
        starsContainer.appendChild(star);
      }
    }

    document.getElementById('rewardBadgeText').textContent = `🏅 ${result.badge}`;
    document.getElementById('resWpm').textContent = result.wpm;
    document.getElementById('resAccuracy').textContent = `${result.accuracy}%`;
    document.getElementById('resErrors').textContent = result.mistakesCount;

    this.rewardModal.classList.add('is-open');
    this.confetti.trigger(140);
  }

  closeRewardModal() {
    this.rewardModal.classList.remove('is-open');
    this.hiddenInput.focus();
  }

  loadLesson(lesson) {
    clearInterval(this.timerInterval);
    this.currentLesson = lesson;
    this.text = lesson.text;
    this.currentIndex = 0;
    this.correctCount = 0;
    this.errorCount = 0;
    this.mistakesMap = {};
    this.startTime = null;
    this.timeLeft = lesson.duration || 60;
    this.isFinished = false;

    if (this.lessonTitleTag) this.lessonTitleTag.textContent = lesson.title;
    if (this.currentLessonNameDisplay) this.currentLessonNameDisplay.textContent = lesson.title;

    const mins = Math.floor(this.timeLeft / 60);
    const secs = this.timeLeft % 60;
    if (this.timerVal) this.timerVal.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

    this.renderText();
    this.updateStats();
    this.updateGuide();
    this.hiddenInput.focus();
  }

  renderText() {
    if (!this.textDisplay) return;
    this.textDisplay.innerHTML = '';

    for (let i = 0; i < this.text.length; i++) {
      const span = document.createElement('span');
      span.className = 'char';
      span.id = `char-${i}`;
      const ch = this.text[i];
      span.textContent = ch === ' ' ? ' ' : ch;
      if (i === 0) span.classList.add('current');
      this.textDisplay.appendChild(span);
    }
  }

  updateGuide() {
    if (this.currentIndex < this.text.length) {
      const targetChar = this.text[this.currentIndex];
      const finger = this.keyboard.highlightTarget(targetChar);
      this.hands.highlightFinger(finger, targetChar);
    } else {
      this.keyboard.clear();
      this.hands.clear();
    }
  }

  handleKeyDown(e) {
    if (this.loginModal.classList.contains('is-open') || 
        this.rewardModal.classList.contains('is-open') || 
        this.lessonPickerModal.classList.contains('is-open')) {
      return;
    }

    if (['Alt', 'Control', 'Shift', 'CapsLock', 'Meta', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Escape'].includes(e.key)) {
      return;
    }

    // Route key to mini games if active
    if (this.currentMode === 'balloon') {
      this.games.handleBalloonKey(e.key);
      e.preventDefault();
      return;
    } else if (this.currentMode === 'racer') {
      this.games.handleRacerKey(e.key);
      e.preventDefault();
      return;
    } else if (this.currentMode === 'meteor') {
      this.games.handleMeteorKey(e.key);
      e.preventDefault();
      return;
    } else if (this.currentMode === 'apple') {
      this.games.handleAppleKey(e.key);
      e.preventDefault();
      return;
    }

    // Normal typing mode
    if (this.isFinished) return;

    if (!this.startTime) {
      this.startTime = Date.now();
      this.startTimer();
    }

    const targetChar = this.text[this.currentIndex];
    const currentCharEl = document.getElementById(`char-${this.currentIndex}`);

    if (e.key === 'Backspace') {
      if (this.currentIndex > 0) {
        if (currentCharEl) currentCharEl.classList.remove('current');
        this.currentIndex--;
        const prevEl = document.getElementById(`char-${this.currentIndex}`);
        if (prevEl) {
          prevEl.classList.remove('correct', 'wrong');
          prevEl.classList.add('current');
          prevEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
        this.updateGuide();
      }
      e.preventDefault();
      return;
    }

    const isCorrect = (e.key.toLowerCase() === targetChar.toLowerCase()) || (targetChar === ' ' && e.key === ' ');
    this.keyboard.flashKey(e.key, isCorrect);

    if (currentCharEl) {
      currentCharEl.classList.remove('current');
      if (isCorrect) {
        currentCharEl.classList.add('correct');
        this.correctCount++;
      } else {
        currentCharEl.classList.add('wrong');
        this.errorCount++;
        this.mistakesMap[targetChar] = (this.mistakesMap[targetChar] || 0) + 1;
      }
    }

    this.currentIndex++;

    if (this.currentIndex < this.text.length) {
      const nextCharEl = document.getElementById(`char-${this.currentIndex}`);
      if (nextCharEl) {
        nextCharEl.classList.add('current');
        nextCharEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
      this.updateGuide();
    } else {
      this.finishLesson();
    }

    this.updateStats();
    this.sendProgress();
    e.preventDefault();
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      if (this.timerVal) {
        const mins = Math.floor(this.timeLeft / 60);
        const secs = this.timeLeft % 60;
        this.timerVal.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
      }

      this.updateStats();

      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.finishLesson();
      }
    }, 1000);
  }

  updateStats() {
    const elapsedSecs = this.startTime ? (Date.now() - this.startTime) / 1000 : 0;
    const elapsedMins = elapsedSecs / 60;

    let wpm = 0;
    if (elapsedMins > 0.05 && this.correctCount > 0) {
      wpm = Math.round((this.correctCount / 5) / elapsedMins);
    }

    const totalTyped = this.correctCount + this.errorCount;
    const accuracy = totalTyped > 0 ? Math.round((this.correctCount / totalTyped) * 100) : 100;

    if (this.wpmVal) this.wpmVal.textContent = wpm;
    if (this.accuracyVal) this.accuracyVal.textContent = `${accuracy}%`;

    return { wpm, accuracy, elapsedSecs: Math.round(elapsedSecs) };
  }

  sendProgress() {
    const progress = Math.round((this.currentIndex / this.text.length) * 100);
    const { wpm, accuracy } = this.updateStats();

    if (this.socket && this.socket.connected) {
      this.socket.emit('student:progress', {
        progress,
        wpm,
        accuracy,
        lessonTitle: this.currentLesson.title
      });
    }
  }

  finishLesson() {
    clearInterval(this.timerInterval);
    this.isFinished = true;

    const { wpm, accuracy, elapsedSecs } = this.updateStats();
    const cpm = elapsedSecs > 0 ? Math.round((this.correctCount / elapsedSecs) * 60) : 0;

    let stars = 1;
    if (accuracy >= 92 && wpm >= 15) stars = 3;
    else if (accuracy >= 80) stars = 2;

    let badge = 'Bé Kiên Trì 🐢';
    if (accuracy === 100) badge = 'Hiệp Sĩ Gõ Đúng 🛡️';
    else if (wpm >= 25) badge = 'Tên Lửa Siêu Tốc 🚀';
    else if (accuracy >= 90) badge = 'Bàn Tay Vàng 🌟';

    const result = {
      studentName: this.student.name || 'Học sinh',
      lessonId: this.currentLesson.id,
      lessonTitle: this.currentLesson.title,
      mode: this.isExamMode ? 'test' : 'practice',
      wpm,
      cpm,
      accuracy,
      mistakesCount: this.errorCount,
      duration: elapsedSecs,
      stars,
      badge,
      mistakesMap: this.mistakesMap
    };

    if (this.socket && this.socket.connected) {
      this.socket.emit('student:finish', result);
    }

    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    }).catch(err => console.log('Lưu kết quả REST:', err));

    this.openRewardModal(result);
  }

  handleTeacherExamStart(examData) {
    this.switchMode('typing');
    this.isExamMode = true;
    this.countdownOverlay.classList.add('is-active');

    let count = 3;
    this.countdownNum.textContent = count;

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        this.countdownNum.textContent = count;
      } else if (count === 0) {
        this.countdownNum.textContent = 'BẮT ĐẦU!';
      } else {
        clearInterval(interval);
        this.countdownOverlay.classList.remove('is-active');

        this.loadLesson({
          id: examData.lessonId || 'exam_' + Date.now(),
          title: examData.lessonTitle || 'Bài Kiểm Tra Cả Lớp',
          text: examData.text,
          duration: examData.durationSeconds || 600,
          isTest: true
        });
      }
    }, 1000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.typingApp = new TypingApp();
});
