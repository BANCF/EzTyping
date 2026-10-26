const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const app = express();
app.use(cors());
app.use(express.json());

// In Vercel serverless environment, use /tmp or memory
const isVercel = process.env.VERCEL || process.env.NOW_REGION;
const DATA_FILE = isVercel 
  ? path.join('/tmp', 'results.json')
  : path.join(__dirname, '..', 'data', 'results.json');

// Initialize sample data
let memoryResults = [
  {
    id: "res_demo_1",
    timestamp: new Date().toISOString(),
    studentName: "Nguyễn Minh An",
    className: "3A",
    machineNumber: "Máy 01",
    lessonId: "test_comprehensive_10m",
    lessonTitle: "Kiểm Tra Toàn Diện (10 Phút)",
    mode: "test",
    wpm: 24,
    cpm: 120,
    accuracy: 98,
    mistakesCount: 3,
    duration: 600,
    stars: 3,
    badge: "Quán Quân Đánh Máy 10 Phút 🌟"
  },
  {
    id: "res_demo_2",
    timestamp: new Date().toISOString(),
    studentName: "Trần Bảo Ngọc",
    className: "4B",
    machineNumber: "Máy 02",
    lessonId: "test_standard_5m",
    lessonTitle: "Kiểm Tra Tiêu Chuẩn (5 Phút)",
    mode: "test",
    wpm: 28,
    cpm: 140,
    accuracy: 100,
    mistakesCount: 0,
    duration: 300,
    stars: 3,
    badge: "Hiệp Sĩ Gõ Đúng 🛡️"
  }
];

function readResults() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(raw || '[]');
    }
  } catch (e) {
    console.error('Lỗi đọc file:', e);
  }
  return memoryResults;
}

function writeResults(list) {
  memoryResults = list;
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
  } catch (e) {
    console.error('Lỗi ghi file /tmp:', e);
  }
}

// Ensure init
if (fs.existsSync(DATA_FILE)) {
  try {
    memoryResults = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '[]');
  } catch (e) {}
}

app.get('/api/info', (req, res) => {
  res.json({
    online: true,
    platform: isVercel ? 'Vercel Cloud' : 'Local Server',
    examState: { active: false }
  });
});

app.get('/api/results', (req, res) => {
  res.json(readResults());
});

app.post('/api/submit', (req, res) => {
  const result = req.body;
  if (!result || !result.studentName) {
    return res.status(400).json({ error: 'Thiếu thông tin kết quả' });
  }

  const list = readResults();
  const newEntry = {
    id: 'res_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    ...result
  };
  list.unshift(newEntry);
  writeResults(list);

  res.json({ success: true, entry: newEntry });
});

app.get('/api/export-excel', (req, res) => {
  try {
    const list = readResults();
    const excelData = list.map((r, index) => ({
      'STT': index + 1,
      'Họ và tên học sinh': r.studentName || 'Học sinh',
      'Bài thi / Bài luyện': r.lessonTitle || 'Bài kiểm tra',
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
      { wch: 25 },
      { wch: 28 },
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
    const filename = `KetQua_GoBanPhim_${new Date().toISOString().slice(0, 10)}.xlsx`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error('Lỗi xuất Excel:', err);
    res.status(500).send('Lỗi khi xuất file Excel');
  }
});

app.post('/api/reset-results', (req, res) => {
  writeResults([]);
  res.json({ success: true, message: 'Đã xóa dữ liệu' });
});

module.exports = app;
