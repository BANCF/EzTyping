const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const os = require('os');
const fs = require('fs');
const cors = require('cors');
const xlsx = require('xlsx');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const RESULTS_FILE = path.join(DATA_DIR, 'results.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(RESULTS_FILE)) {
  fs.writeFileSync(RESULTS_FILE, JSON.stringify([]));
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper: Get local LAN IPv4 address
function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push({ name, address: iface.address });
      }
    }
  }
  return addresses;
}

// In-memory active students
// socketId -> { id, name, className, machineNumber, status, progress, wpm, accuracy, lessonTitle, lastActive }
const activeStudents = new Map();

// Current exam state controlled by teacher
let currentExamState = {
  active: false,
  lessonId: null,
  lessonTitle: '',
  text: '',
  durationSeconds: 60,
  startedAt: null
};

// API: Get server LAN info & current status
app.get('/api/info', (req, res) => {
  res.json({
    port: PORT,
    ipAddresses: getLocalIpAddresses(),
    examState: currentExamState
  });
});

// API: Get all results
app.get('/api/results', (req, res) => {
  try {
    const raw = fs.readFileSync(RESULTS_FILE, 'utf8');
    const results = JSON.parse(raw || '[]');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Không thể đọc kết quả' });
  }
});

// API: Submit result (REST fallback)
app.post('/api/submit', (req, res) => {
  const result = req.body;
  if (!result || !result.studentName) {
    return res.status(400).json({ error: 'Thiếu thông tin kết quả' });
  }

  const saved = saveResult(result);
  io.emit('results:updated', saved);
  res.json({ success: true, message: 'Đã lưu kết quả thành công' });
});

// API: Export to Excel
app.get('/api/export-excel', (req, res) => {
  try {
    const raw = fs.readFileSync(RESULTS_FILE, 'utf8');
    const results = JSON.parse(raw || '[]');

    const classNameFilter = req.query.className;
    let filtered = results;
    if (classNameFilter && classNameFilter !== 'ALL') {
      filtered = results.filter(r => r.className === classNameFilter);
    }

    const excelData = filtered.map((r, index) => ({
      'STT': index + 1,
      'Số máy': r.machineNumber || 'N/A',
      'Họ và tên học sinh': r.studentName,
      'Lớp': r.className,
      'Bài luyện / Bài thi': r.lessonTitle || 'Bài kiểm tra',
      'Chế độ': r.mode === 'test' ? 'Kiểm tra' : 'Luyện tập',
      'Tốc độ (WPM)': r.wpm || 0,
      'Ký tự / phút (CPM)': r.cpm || 0,
      'Độ chính xác (%)': `${r.accuracy || 0}%`,
      'Số lỗi': r.mistakesCount || 0,
      'Thời gian (giây)': r.duration || 0,
      'Xếp loại sao': `${r.stars || 1} Sao`,
      'Huy hiệu đạt được': r.badge || 'Bé kiên trì',
      'Thời điểm nộp': r.timestamp ? new Date(r.timestamp).toLocaleString('vi-VN') : ''
    }));

    const worksheet = xlsx.utils.json_to_sheet(excelData);
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 10 },
      { wch: 25 },
      { wch: 10 },
      { wch: 25 },
      { wch: 14 },
      { wch: 14 },
      { wch: 18 },
      { wch: 16 },
      { wch: 10 },
      { wch: 16 },
      { wch: 14 },
      { wch: 22 },
      { wch: 22 }
    ];

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'KetQuaGoBanPhim');

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const filename = `KetQua_GoBanPhim_${classNameFilter || 'TatCa'}_${new Date().toISOString().slice(0, 10)}.xlsx`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error('Lỗi xuất Excel:', err);
    res.status(500).send('Lỗi khi xuất file Excel');
  }
});

// API: Clear results
app.post('/api/reset-results', (req, res) => {
  try {
    fs.writeFileSync(RESULTS_FILE, JSON.stringify([]));
    io.emit('results:cleared');
    res.json({ success: true, message: 'Đã xóa toàn bộ dữ liệu kết quả cũ' });
  } catch (err) {
    res.status(500).json({ error: 'Không thể xóa kết quả' });
  }
});

// Helper: Save result to JSON
function saveResult(resultData) {
  try {
    const raw = fs.readFileSync(RESULTS_FILE, 'utf8');
    const list = JSON.parse(raw || '[]');
    const newEntry = {
      id: 'res_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      ...resultData
    };
    list.unshift(newEntry);
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(list, null, 2));
    return newEntry;
  } catch (e) {
    console.error('Lỗi ghi kết quả:', e);
  }
}

// Socket.IO Realtime handling
io.on('connection', (socket) => {
  // Student registers
  socket.on('student:register', (data) => {
    activeStudents.set(socket.id, {
      socketId: socket.id,
      name: data.name || 'Học sinh',
      className: data.className || '1A1',
      machineNumber: data.machineNumber || 'Máy ' + socket.id.slice(-3),
      status: 'idle',
      progress: 0,
      wpm: 0,
      accuracy: 100,
      lessonTitle: currentExamState.active ? currentExamState.lessonTitle : 'Tự do',
      lastActive: Date.now()
    });

    io.emit('students:list', Array.from(activeStudents.values()));

    if (currentExamState.active) {
      socket.emit('exam:start', currentExamState);
    }
  });

  // Student progress update (while typing)
  socket.on('student:progress', (data) => {
    const student = activeStudents.get(socket.id);
    if (student) {
      student.status = 'typing';
      student.progress = data.progress || 0;
      student.wpm = data.wpm || 0;
      student.accuracy = data.accuracy || 100;
      student.lessonTitle = data.lessonTitle || student.lessonTitle;
      student.lastActive = Date.now();
      io.emit('students:progress', student);
    }
  });

  // Student finishes test/lesson
  socket.on('student:finish', (data) => {
    const student = activeStudents.get(socket.id);
    if (student) {
      student.status = 'finished';
      student.progress = 100;
      student.wpm = data.wpm || 0;
      student.accuracy = data.accuracy || 0;
      student.lastActive = Date.now();

      const saved = saveResult({
        studentName: student.name,
        className: student.className,
        machineNumber: student.machineNumber,
        ...data
      });

      io.emit('students:finished', { student, result: saved });
      io.emit('students:list', Array.from(activeStudents.values()));
    }
  });

  // Teacher commands: Start class-wide exam
  socket.on('teacher:start-exam', (examData) => {
    currentExamState = {
      active: true,
      lessonId: examData.lessonId,
      lessonTitle: examData.lessonTitle,
      text: examData.text,
      durationSeconds: examData.durationSeconds || 60,
      startedAt: Date.now()
    };

    for (const [id, s] of activeStudents.entries()) {
      s.status = 'ready';
      s.progress = 0;
      s.wpm = 0;
      s.accuracy = 100;
      s.lessonTitle = examData.lessonTitle;
    }
    io.emit('students:list', Array.from(activeStudents.values()));
    io.emit('exam:start', currentExamState);
  });

  // Teacher commands: Stop / End exam
  socket.on('teacher:stop-exam', () => {
    currentExamState.active = false;
    io.emit('exam:stop');
  });

  // Disconnect
  socket.on('disconnect', () => {
    activeStudents.delete(socket.id);
    io.emit('students:list', Array.from(activeStudents.values()));
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIpAddresses();
  console.log('========================================================');
  console.log(`🚀 MÁY CHỦ GIÁO VIÊN ĐÃ SẴN SÀNG TRÊN CỔNG: ${PORT}`);
  console.log('--------------------------------------------------------');
  console.log(`👉 Giáo viên mở quản lý tại: http://localhost:${PORT}/teacher.html`);
  console.log('--------------------------------------------------------');
  console.log('👉 Địa chỉ cho HỌC SINH trong phòng máy (Mạng LAN):');
  if (ips.length > 0) {
    ips.forEach(ip => {
      console.log(`   * http://${ip.address}:${PORT}`);
    });
  } else {
    console.log(`   * http://localhost:${PORT}`);
  }
  console.log('========================================================');
});
