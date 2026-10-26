// Teacher Portal Logic (Giám sát trực tiếp & Xuất Excel - Hỗ trợ cả mạng LAN và Vercel Cloud)

class TeacherDashboard {
  constructor() {
    this.socket = null;
    this.students = [];
    this.results = [];
    this.currentFilterClass = 'ALL';
    this.searchQuery = '';
    this.pollInterval = null;

    // DOM Elements
    this.lanIpDisplay = document.getElementById('lanIpDisplay');
    this.studentGrid = document.getElementById('studentGrid');
    this.onlineCount = document.getElementById('onlineCount');
    this.examLessonSelect = document.getElementById('examLessonSelect');
    this.examDurationSelect = document.getElementById('examDurationSelect');
    this.launchExamBtn = document.getElementById('launchExamBtn');
    this.stopExamBtn = document.getElementById('stopExamBtn');
    this.resultsTableBody = document.getElementById('resultsTableBody');
    this.filterClassSelect = document.getElementById('filterClassSelect');
    this.searchStudentInput = document.getElementById('searchStudentInput');
    this.exportExcelBtn = document.getElementById('exportExcelBtn');
    this.clearResultsBtn = document.getElementById('clearResultsBtn');

    this.initSocket();
    this.fetchServerInfo();
    this.initExamControls();
    this.fetchResults();
    this.bindEvents();

    // Polling every 4 seconds for cloud/Vercel support
    this.pollInterval = setInterval(() => {
      this.fetchResults(true);
    }, 4000);
  }

  initSocket() {
    if (typeof io !== 'undefined') {
      try {
        this.socket = io({ timeout: 5000, reconnectionAttempts: 2 });

        this.socket.on('connect', () => {
          console.log('Giáo viên đã kết nối Socket.IO');
        });

        this.socket.on('students:list', (list) => {
          this.students = list;
          this.renderStudents();
        });

        this.socket.on('students:progress', (updatedStudent) => {
          const idx = this.students.findIndex(s => s.socketId === updatedStudent.socketId);
          if (idx !== -1) {
            this.students[idx] = updatedStudent;
            this.updateStudentCard(updatedStudent);
          }
        });

        this.socket.on('students:finished', () => {
          this.fetchResults();
        });

        this.socket.on('results:cleared', () => {
          this.results = [];
          this.renderResultsTable();
        });
      } catch (e) {
        console.log('Chạy ở chế độ REST Polling (Vercel Cloud)');
      }
    }
  }

  async fetchServerInfo() {
    try {
      const res = await fetch('/api/info');
      const data = await res.json();
      
      const currentHost = window.location.origin;
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        // Online on Vercel or remote
        if (this.lanIpDisplay) {
          this.lanIpDisplay.textContent = currentHost;
        }
      } else if (data.ipAddresses && data.ipAddresses.length > 0) {
        const ip = data.ipAddresses[0].address;
        if (this.lanIpDisplay) {
          this.lanIpDisplay.textContent = `http://${ip}:${data.port || 3000}`;
        }
      } else {
        if (this.lanIpDisplay) this.lanIpDisplay.textContent = currentHost;
      }

      if (data.examState && data.examState.active) {
        this.showExamRunningState(data.examState.lessonTitle);
      }
    } catch (e) {
      if (this.lanIpDisplay) this.lanIpDisplay.textContent = window.location.origin;
    }
  }

  initExamControls() {
    if (this.examLessonSelect && typeof LESSONS !== 'undefined') {
      this.examLessonSelect.innerHTML = '';
      const categories = [...new Set(LESSONS.map(l => l.category || 'Bài Luyện'))];

      categories.forEach(cat => {
        const group = document.createElement('optgroup');
        group.label = `📁 ${cat}`;
        const items = LESSONS.filter(l => (l.category || 'Bài Luyện') === cat);

        items.forEach(l => {
          const opt = document.createElement('option');
          opt.value = l.id;
          opt.textContent = `${l.title} (${Math.round(l.duration / 60)} phút)`;
          if (l.id === 'test_comprehensive_10m') opt.selected = true;
          group.appendChild(opt);
        });

        this.examLessonSelect.appendChild(group);
      });
    }
  }

  bindEvents() {
    this.launchExamBtn?.addEventListener('click', () => {
      const selectedId = this.examLessonSelect.value;
      const lesson = LESSONS.find(l => l.id === selectedId);
      const duration = parseInt(this.examDurationSelect.value, 10) || 600;

      if (!lesson) return;

      if (confirm(`Bạn có chắc muốn BẮT ĐẦU bài kiểm tra "${lesson.title}" (${Math.round(duration/60)} phút) cho học sinh?`)) {
        if (this.socket && this.socket.connected) {
          this.socket.emit('teacher:start-exam', {
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            text: lesson.text,
            durationSeconds: duration
          });
        }
        this.showExamRunningState(lesson.title);
      }
    });

    this.stopExamBtn?.addEventListener('click', () => {
      if (confirm('Dừng bài kiểm tra hiện tại?')) {
        if (this.socket && this.socket.connected) {
          this.socket.emit('teacher:stop-exam');
        }
        this.resetExamControls();
      }
    });

    this.searchStudentInput?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.renderResultsTable();
    });

    this.exportExcelBtn?.addEventListener('click', () => {
      window.location.href = '/api/export-excel';
    });

    this.clearResultsBtn?.addEventListener('click', async () => {
      if (confirm('CẢNH BÁO: Bạn có chắc muốn XÓA TOÀN BỘ kết quả bài thi cũ? Hãy đảm bảo bạn đã tải file Excel về máy.')) {
        try {
          await fetch('/api/reset-results', { method: 'POST' });
          this.results = [];
          this.renderResultsTable();
          alert('Đã xóa dữ liệu kết quả cũ!');
        } catch (e) {
          alert('Lỗi khi xóa kết quả!');
        }
      }
    });
  }

  showExamRunningState(title) {
    if (this.launchExamBtn) this.launchExamBtn.style.display = 'none';
    if (this.stopExamBtn) {
      this.stopExamBtn.style.display = 'inline-flex';
      this.stopExamBtn.textContent = `⏹️ Dừng Bài Thi: ${title}`;
    }
  }

  resetExamControls() {
    if (this.launchExamBtn) this.launchExamBtn.style.display = 'inline-flex';
    if (this.stopExamBtn) this.stopExamBtn.style.display = 'none';
  }

  renderStudents() {
    if (this.onlineCount) {
      this.onlineCount.textContent = `🟢 Học sinh online: ${this.students.length}`;
    }

    if (!this.studentGrid) return;

    if (this.students.length === 0) {
      this.studentGrid.innerHTML = `
        <div class="empty-room-msg" style="grid-column: 1 / -1;">
          🖥️ Chưa có học sinh nào đang kết nối trực tiếp. Học sinh có thể truy cập link phía trên để làm bài và nộp kết quả.
        </div>
      `;
      return;
    }

    this.studentGrid.innerHTML = '';
    this.students.forEach(s => {
      const card = document.createElement('div');
      card.className = 'student-card';
      card.id = `card-${s.socketId}`;

      let statusBadge = '<span class="card-status-badge status-idle">Sẵn sàng</span>';
      if (s.status === 'typing') {
        statusBadge = '<span class="card-status-badge status-typing">Đang gõ...</span>';
      } else if (s.status === 'finished') {
        statusBadge = '<span class="card-status-badge status-finished">Đã hoàn thành</span>';
      }

      card.innerHTML = `
        <div class="student-card-header">
          <span class="card-student-name" style="font-size: 1.15rem; font-weight: 800; color: #2d3748;">👤 ${s.name || 'Học sinh'}</span>
          ${statusBadge}
        </div>
        <div class="card-student-class" style="color: #718096; font-size: 0.9rem; margin-top: 4px;">📖 ${s.lessonTitle || 'Luyện gõ tự do'}</div>

        <div class="card-progress-bar-wrap" style="margin-top: 10px;">
          <div class="card-progress-bar-fill" style="width: ${s.progress || 0}%"></div>
        </div>

        <div class="card-metrics-row">
          <span>⚡ ${s.wpm || 0} WPM</span>
          <span>🎯 Đúng: ${s.accuracy || 100}%</span>
          <span>📊 ${s.progress || 0}%</span>
        </div>
      `;
      this.studentGrid.appendChild(card);
    });
  }

  updateStudentCard(s) {
    const card = document.getElementById(`card-${s.socketId}`);
    if (!card) return;

    const fill = card.querySelector('.card-progress-bar-fill');
    if (fill) fill.style.width = `${s.progress || 0}%`;

    const metrics = card.querySelector('.card-metrics-row');
    if (metrics) {
      metrics.innerHTML = `
        <span>⚡ ${s.wpm || 0} WPM</span>
        <span>🎯 Đúng: ${s.accuracy || 100}%</span>
        <span>📊 ${s.progress || 0}%</span>
      `;
    }

    const badge = card.querySelector('.card-status-badge');
    if (badge) {
      if (s.status === 'typing') {
        badge.className = 'card-status-badge status-typing';
        badge.textContent = 'Đang gõ...';
      } else if (s.status === 'finished') {
        badge.className = 'card-status-badge status-finished';
        badge.textContent = 'Đã hoàn thành';
      }
    }
  }

  async fetchResults(isBackground = false) {
    try {
      const res = await fetch('/api/results');
      const data = await res.json();
      this.results = data;
      this.renderResultsTable();
    } catch (e) {
      if (!isBackground) console.error('Lỗi tải kết quả:', e);
    }
  }

  renderResultsTable() {
    if (!this.resultsTableBody) return;
    this.resultsTableBody.innerHTML = '';

    let filtered = this.results;
    if (this.searchQuery) {
      filtered = filtered.filter(r => (r.studentName || '').toLowerCase().includes(this.searchQuery));
    }

    if (filtered.length === 0) {
      this.resultsTableBody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; color: #a0aec0; padding: 30px;">
            Chưa có bài thi nào nộp trong ca này.
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach((r, idx) => {
      const tr = document.createElement('tr');
      const timeStr = r.timestamp ? new Date(r.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';
      const starsStr = '★'.repeat(r.stars || 1);
      const mins = Math.floor((r.duration || 0) / 60);
      const secs = (r.duration || 0) % 60;
      const durationStr = mins > 0 ? `${mins}p ${secs}s` : `${secs}s`;

      tr.innerHTML = `
        <td><b>${idx + 1}</b></td>
        <td><b style="font-size: 1rem; color: #2b6cb0;">${r.studentName || 'Học sinh'}</b></td>
        <td>${r.lessonTitle || 'Bài kiểm tra'}</td>
        <td><b style="color: #2b8a3e; font-size: 1.05rem;">${r.wpm || 0}</b></td>
        <td><b>${r.accuracy || 0}%</b></td>
        <td style="color: #e53e3e">${r.mistakesCount || 0}</td>
        <td>${durationStr}</td>
        <td><span class="stars-display">${starsStr}</span></td>
        <td><small style="color: #718096">${timeStr}</small></td>
      `;
      this.resultsTableBody.appendChild(tr);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.teacherDashboard = new TeacherDashboard();
});
