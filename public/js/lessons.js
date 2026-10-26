// Ngân hàng bài tập luyện gõ phím 10 ngón đa dạng
// Dành cho học sinh Tiểu học và người mới bắt đầu (Chữ tiếng Anh & tiếng Việt không dấu)

const LESSONS = [
  // ================= CẤP ĐỘ 1: HÀNG PHÍM CƠ SỞ (HOME ROW) =================
  {
    id: 'c1_1',
    level: 'Cơ bản',
    category: 'Hàng cơ sở',
    title: 'Bài 1.1: Hai phím xuất phát F và J',
    desc: 'Đặt hai ngón trỏ vào phím F và J (có gờ nổi định vị)',
    badge: 'Ngón Trỏ Chuẩn Xác',
    duration: 60,
    text: 'f j f j ff jj f f j j fj jf ff jj fj jf ff jj'
  },
  {
    id: 'c1_2',
    level: 'Cơ bản',
    category: 'Hàng cơ sở',
    title: 'Bài 1.2: Bàn tay trái (A S D F)',
    desc: 'Luyện 4 ngón tay trái trên hàng cơ sở',
    badge: 'Tay Trái Khéo Léo',
    duration: 60,
    text: 'a s d f as df fd sa asdf fdas aa ss dd ff asdf'
  },
  {
    id: 'c1_3',
    level: 'Cơ bản',
    category: 'Hàng cơ sở',
    title: 'Bài 1.3: Bàn tay phải (J K L ;)',
    desc: 'Luyện 4 ngón tay phải trên hàng cơ sở',
    badge: 'Tay Phải Nhanh Nhẹn',
    duration: 60,
    text: 'j k l ; jk l; ;l kj jkl; jj kk ll ;; jk l; klj;'
  },
  {
    id: 'c1_4',
    level: 'Cơ bản',
    category: 'Hàng cơ sở',
    title: 'Bài 1.4: Thêm hai phím giữa G và H',
    desc: 'Ngón trỏ vươn sang gõ phím G và phím H',
    badge: 'Bàn Tay Cơ Sở',
    duration: 90,
    text: 'f g j h fg jh gf hj asdfg ;lkjh fghj asdfg hjkl;'
  },
  {
    id: 'c1_5',
    level: 'Cơ bản',
    category: 'Hàng cơ sở',
    title: 'Bài 1.5: Tổng hợp hàng phím cơ sở',
    desc: 'Phối hợp nhịp nhàng cả hai bàn tay',
    badge: 'Hiệp Sĩ Hàng Cơ Sở',
    duration: 90,
    text: 'a s d f g h j k l da fa ga ha ja ka la fall glad dash flash'
  },

  // ================= CẤP ĐỘ 2: HÀNG PHÍM TRÊN (TOP ROW) =================
  {
    id: 'c2_1',
    level: 'Cơ bản',
    category: 'Hàng phím trên',
    title: 'Bài 2.1: Các phím E và I',
    desc: 'Dùng hai ngón giữa vươn lên hàng trên',
    badge: 'Ngón Giữa Chuẩn Xác',
    duration: 60,
    text: 'd e k i de ki ed ik ded kik eee iii de ki fide like'
  },
  {
    id: 'c2_2',
    level: 'Cơ bản',
    category: 'Hàng phím trên',
    title: 'Bài 2.2: Các phím R và U',
    desc: 'Dùng hai ngón trỏ vươn lên hàng trên',
    badge: 'Ngón Trỏ Vươn Cao',
    duration: 60,
    text: 'f r j u fr ju rf uj frr juu fru urf rrr uuu fur jug'
  },
  {
    id: 'c2_3',
    level: 'Cơ bản',
    category: 'Hàng phím trên',
    title: 'Bài 2.3: Các phím T và Y',
    desc: 'Ngón trỏ vươn chéo sang phím T và Y',
    badge: 'Bé Linh Hoạt',
    duration: 90,
    text: 'f t j y ft jy tf yj r t y u ty ru try out guy yet'
  },
  {
    id: 'c2_4',
    level: 'Cơ bản',
    category: 'Hàng phím trên',
    title: 'Bài 2.4: Các phím O và P',
    desc: 'Dùng ngón áp út và ngón út tay phải',
    badge: 'Tay Phải Điêu Luyện',
    duration: 90,
    text: 'l o ; p lo ;p ol p; loop pool pop top hope open'
  },
  {
    id: 'c2_5',
    level: 'Cơ bản',
    category: 'Hàng phím trên',
    title: 'Bài 2.5: Các phím Q và W',
    desc: 'Dùng ngón út và ngón áp út tay trái',
    badge: 'Chinh Phục Hàng Trên',
    duration: 90,
    text: 'a q s w aq sw qa ws quiet wow row saw wrap quick'
  },

  // ================= CẤP ĐỘ 3: HÀNG PHÍM DƯỚI (BOTTOM ROW) =================
  {
    id: 'c3_1',
    level: 'Cơ bản',
    category: 'Hàng phím dưới',
    title: 'Bài 3.1: Các phím V và M',
    desc: 'Dùng hai ngón trỏ đưa xuống hàng dưới',
    badge: 'Ngón Trỏ Đa Năng',
    duration: 60,
    text: 'f v j m fv jm vf mj vvv mmm vam vem move vim map'
  },
  {
    id: 'c3_2',
    level: 'Cơ bản',
    category: 'Hàng phím dưới',
    title: 'Bài 3.2: Các phím C và N',
    desc: 'Ngón giữa trái gõ C, ngón trỏ phải vươn gõ N',
    badge: 'Chăm Chỉ Luyện Phím',
    duration: 60,
    text: 'd c j n dc jn cd nj can con nam nun cat corn'
  },
  {
    id: 'c3_3',
    level: 'Cơ bản',
    category: 'Hàng phím dưới',
    title: 'Bài 3.3: Các phím X và B',
    desc: 'Ngón áp út trái gõ X, ngón trỏ trái gõ B',
    badge: 'Tay Trái Khỏe Khoắn',
    duration: 90,
    text: 's x f b sx fb xs bf box boy bat big bus bay box'
  },
  {
    id: 'c3_4',
    level: 'Cơ bản',
    category: 'Hàng phím dưới',
    title: 'Bài 3.4: Phím Z và Ký tự chấm phẩy',
    desc: 'Ngón út gõ Z, ngón áp út và giữa gõ dấu chấm, phẩy',
    badge: 'Bậc Thầy Bàn Phím Nhí',
    duration: 90,
    text: 'a z az za zoo zip zap v, m. c, n. x, z. ban, but.'
  },

  // ================= CẤP ĐỘ 4: HÀNG PHÍM SỐ & DẤU CƠ BẢN =================
  {
    id: 'c4_1',
    level: 'Trung bình',
    category: 'Phím số & Ký tự',
    title: 'Bài 4.1: Các số tay trái (1 2 3 4 5)',
    desc: 'Luyện 4 ngón tay trái vươn lên hàng số',
    badge: 'Chiến Binh Chữ Số',
    duration: 90,
    text: '1 2 3 4 5 12 34 45 54 321 12345 54321 135 242'
  },
  {
    id: 'c4_2',
    level: 'Trung bình',
    category: 'Phím số & Ký tự',
    title: 'Bài 4.2: Các số tay phải (6 7 8 9 0)',
    desc: 'Luyện 4 ngón tay phải vươn lên hàng số',
    badge: 'Cao Thủ Hàng Số',
    duration: 90,
    text: '6 7 8 9 0 67 89 90 09 876 67890 09876 680 790'
  },
  {
    id: 'c4_3',
    level: 'Trung bình',
    category: 'Phím số & Ký tự',
    title: 'Bài 4.3: Dãy số và phép tính đơn giản',
    desc: 'Phối hợp gõ số và dấu cộng trừ bằng',
    badge: 'Nhà Toán Học Nhí',
    duration: 90,
    text: '10 20 30 40 50 60 70 80 90 100 12 + 34 = 46 90 - 20 = 70'
  },

  // ================= CẤP ĐỘ 5: TỪ VỰNG TIẾNG VIỆT & TIẾNG ANH =================
  {
    id: 'c5_1',
    level: 'Trung bình',
    category: 'Ghép từ',
    title: 'Bài 5.1: Từ tiếng Việt 2-3 chữ cái',
    desc: 'Các từ quen thuộc gần gũi hàng ngày',
    badge: 'Ghép Từ Nhanh Nhẹn',
    duration: 90,
    text: 'ba me bo be ca ga la ve co ban but hop nha hoa con xe di'
  },
  {
    id: 'c5_2',
    level: 'Trung bình',
    category: 'Ghép từ',
    title: 'Bài 5.2: Từ tiếng Anh thông dụng',
    desc: 'Các từ vựng tiếng Anh vui nhộn',
    badge: 'Bé Giỏi Tiếng Anh',
    duration: 90,
    text: 'cat dog sun pig run fly hat pen red blue green sky star bird tree'
  },
  {
    id: 'c5_3',
    level: 'Trung bình',
    category: 'Ghép từ',
    title: 'Bài 5.3: Cụm từ và từ ghép',
    desc: 'Rèn luyện phản xạ gõ phím cách (Space) đều đặn',
    badge: 'Đôi Bàn Tay Vàng',
    duration: 120,
    text: 'hoa sen ban mai con ga hoc tap vui ve yeu me cham chi dung gio nghe loi thay co'
  },

  // ================= CẤP ĐỘ 6: ĐOẠN VĂN LUYỆN TẬP DÀI =================
  {
    id: 'c6_1',
    level: 'Nâng cao',
    category: 'Đoạn văn',
    title: 'Bài 6.1: Truyện ngụ ngôn Rùa và Thỏ (Bản không dấu)',
    desc: 'Luyện gõ một đoạn truyện ngụ ngôn ý nghĩa',
    badge: 'Nhà Kể Chuyện Nhí',
    duration: 180,
    text: 'ngay xua trong khu rung xanh tho luon tu hao minh chay rat nhanh. mot ngay rua den thach tho chay thi. tho chu quan nam ngu duoi goc cay con rua cu kien tri bo tung buoc mot. cuoi cung rua da ve dich truoc tho.'
  },
  {
    id: 'c6_2',
    level: 'Nâng cao',
    category: 'Đoạn văn',
    title: 'Bài 6.2: Em yêu trường em',
    desc: 'Đoạn văn miêu tả trường lớp thân yêu',
    badge: 'Bút Măng Non',
    duration: 180,
    text: 'moi buoi sang khi mat troi toa nang am em cung cac ban vui ve den truong. ngoi truong cua em co nhieu cay xanh va hoa dep. thay co day bao chung em nhung dieu hay le phai de mai sau tro thanh nguoi co ich.'
  },
  {
    id: 'c6_3',
    level: 'Nâng cao',
    category: 'Đoạn văn',
    title: 'Bài 6.3: Đôi bàn tay và tư thế gõ phím',
    desc: 'Luyện gõ kiến thức về tư thế ngồi học máy tính',
    badge: 'Chuyên Gia Công Thái Học',
    duration: 200,
    text: 'khi ngoi hoc may tinh em luon giu lung thang mat cach man hinh mot khoang vua phai. hai ban tay dat nhe nhang len hang phim co so. cac ngon tay cong tu nhien va luon tro ve vi tri cu sau moi lan an phim.'
  },

  // ================= CẤP ĐỘ 7: CÁC BÀI KIỂM TRA ĐÁNH GIÁ (TESTS) =================
  {
    id: 'test_quick_2m',
    level: 'Kiểm tra',
    category: 'Kiểm tra đánh giá',
    isTest: true,
    title: 'Kiểm Tra Nhanh (2 Phút)',
    desc: 'Đo tốc độ phản xạ và độ chính xác trong 2 phút',
    badge: 'Tia Chớp Bàn Phím',
    duration: 120,
    text: 'f j a s d f g h j k l ba me ca ga ban but con nha hoa ve vui be xe me bo di hoc bai cham chi hoa sen ban mai mat troi toa nang'
  },
  {
    id: 'test_standard_5m',
    level: 'Kiểm tra',
    category: 'Kiểm tra đánh giá',
    isTest: true,
    title: 'Kiểm Tra Tiêu Chuẩn (5 Phút)',
    desc: 'Bài kiểm tra 5 phút đánh giá năng lực gõ câu hoàn chỉnh',
    badge: 'Chiến Binh Bàn Phím',
    duration: 300,
    text: 'mua xuan da ve tren que huong em. muon hoa dua no khoe sac tham. chu chim hót vang tren canh cay xanh. moi buoi sang em thuc day som tap the duc roi chuan bi sach vo den truong. em rat yeu gio hoc tin hoc vi em duoc hoc cach go ban phim bang muoi ngon tay. go ban phim dung cach giup em lam bai nhanh hon va bao ve doi tay khoe manh.'
  },
  {
    id: 'test_comprehensive_10m',
    level: 'Kiểm tra',
    category: 'Kiểm tra đánh giá',
    isTest: true,
    title: 'Kiểm Tra Toàn Diện (10 Phút)',
    desc: 'Đánh giá chuyên sâu 10 phút: Tốc độ WPM, CPM, Độ chính xác & Biểu đồ lỗi',
    badge: 'Quán Quân Đánh Máy 10 Phút',
    duration: 600,
    text: 'hoc tap la mot con duong dai doi hoi su kien tri va no luc khong ngung. doi voi mon tin hoc viec lam quen va su dung thanh thao ban phim may tinh la mot ky nang rat quan trong. khi em biet go ban phim bang muoi ngon tay em se tiet kiem duoc rat nhieu thoi gian va cong suc. hang phim co so gom co cac phim a s d f va j k l la noi ma cac ngon tay luon nghi ngoi. hai ngon tro dat len phim f va phim j luon cam nhan duoc hai vach go noi de dinh vi vi tri. tu hang co so cac ngon tay se vuon len hang tren de go cac chu cai nhu q w e r t y u i o p va dua xuong hang duoi de go z x c v b n m. ngon cai luon san sang de nhan phim cach rong rai o ben duoi. moi ngay chi can danh ra muoi lam phut luyen tap em se thay doi tay cua minh tro nen nhanh nhen va uyen chuyen hon rat nhieu. khi go phim em can nho giu lung thang va khong nhin xuong ban phim ma hay nhin vao man hinh. thanh qua se den voi nhung ai kien tri va cham chi. chuc tat ca cac ban hoc sinh hoan thanh that tot bai kiem tra muoi phut nay va dat duoc ket qua xuat sac.'
  },
  {
    id: 'test_advanced_10m',
    level: 'Kiểm tra',
    category: 'Kiểm tra đánh giá',
    isTest: true,
    title: 'Kiểm Tra Nâng Cao Song Ngữ (10 Phút)',
    desc: 'Bài thi thử thách 10 phút kết hợp Tiếng Việt và Tiếng Anh',
    badge: 'Bậc Thầy Bàn Phím Toàn Năng',
    duration: 600,
    text: 'welcome to the comprehensive typing assessment. typing with all ten fingers is an essential skill in our modern digital world. practice makes perfect. every day you can improve your typing speed and accuracy. be cham ngoan hoc gioi vang loi cha me va thay co. mua xuan sang cay coi dam choi nay loc. chim hót liu lo don chao mot ngay moi. learning computers helps us discover many new things. we can read books learn science and connect with friends around the world. hay luon giu doi ban tay sach se va ngoi hoc dung tu the de giu cho doi mat va cot song luon khoe manh. chuc mung ban da kien tri luyen tap va hoan thanh tron ven bai thi.'
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LESSONS;
}
