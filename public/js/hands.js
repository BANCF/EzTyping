// Virtual Hands Guide - Siêu gọn gàng, hiển thị liền sát bàn phím trên cùng 1 màn hình

const FINGER_DESCRIPTIONS = {
  'l-pinky': { name: 'Ngón Út', hand: 'Tay Trái', color: '#FF4757' },
  'l-ring': { name: 'Ngón Áp Út', hand: 'Tay Trái', color: '#FFA502' },
  'l-middle': { name: 'Ngón Giữa', hand: 'Tay Trái', color: '#F1C40F' },
  'l-index': { name: 'Ngón Trỏ', hand: 'Tay Trái', color: '#2ED573' },
  'thumbs': { name: 'Ngón Cái', hand: 'Phím Cách', color: '#1E90FF' },
  'r-index': { name: 'Ngón Trỏ', hand: 'Tay Phải', color: '#70A1FF' },
  'r-middle': { name: 'Ngón Giữa', hand: 'Tay Phải', color: '#9C88FF' },
  'r-ring': { name: 'Ngón Áp Út', hand: 'Tay Phải', color: '#ED4C67' },
  'r-pinky': { name: 'Ngón Út', hand: 'Tay Phải', color: '#8854D0' }
};

class VirtualHands {
  constructor(containerId, tipGuideId) {
    this.container = document.getElementById(containerId);
    this.tipGuide = document.getElementById(tipGuideId);
    this.activeFinger = null;
    this.init();
  }

  init() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="hands-unified-bar">
        <!-- BÀN TAY TRÁI -->
        <div class="hand-mini-unit left-hand-unit">
          <span class="hand-title-tag">🖐️ TAY TRÁI</span>
          <svg class="hand-mini-svg" viewBox="0 0 220 125" xmlns="http://www.w3.org/2000/svg">
            <!-- Cổ tay & Lòng bàn tay siêu gọn -->
            <path class="palm-compact" d="M 40 70 C 40 50, 65 42, 110 42 C 160 42, 175 55, 175 95 C 170 120, 150 124, 110 124 C 65 124, 40 115, 40 70 Z" />
            
            <!-- Ngón út trái -->
            <g class="finger-group finger-l-pinky" id="finger-l-pinky" data-finger="l-pinky">
              <path class="finger-body" d="M 36 65 C 33 36, 35 18, 46 18 C 56 18, 56 36, 54 65 Z" />
              <circle class="finger-tip-dot" cx="46" cy="22" r="7" fill="#FF4757" />
              <text x="46" y="9" class="finger-text">Út</text>
            </g>

            <!-- Ngón áp út trái -->
            <g class="finger-group finger-l-ring" id="finger-l-ring" data-finger="l-ring">
              <path class="finger-body" d="M 62 52 C 60 22, 64 6, 76 6 C 88 6, 88 22, 85 52 Z" />
              <circle class="finger-tip-dot" cx="76" cy="11" r="7.5" fill="#FFA502" />
              <text x="76" y="-1" class="finger-text">Áp</text>
            </g>

            <!-- Ngón giữa trái -->
            <g class="finger-group finger-l-middle" id="finger-l-middle" data-finger="l-middle">
              <path class="finger-body" d="M 94 45 C 94 15, 98 2, 110 2 C 122 2, 124 15, 122 45 Z" />
              <circle class="finger-tip-dot" cx="110" cy="7" r="8" fill="#F1C40F" />
              <text x="110" y="-4" class="finger-text">Giữa</text>
            </g>

            <!-- Ngón trỏ trái -->
            <g class="finger-group finger-l-index" id="finger-l-index" data-finger="l-index">
              <path class="finger-body" d="M 130 50 C 130 20, 134 8, 146 8 C 158 8, 158 20, 155 50 Z" />
              <circle class="finger-tip-dot" cx="146" cy="13" r="7.5" fill="#2ED573" />
              <text x="146" y="1" class="finger-text">Trỏ</text>
            </g>

            <!-- Ngón cái trái -->
            <g class="finger-group finger-thumbs" id="finger-l-thumb" data-finger="thumbs">
              <path class="finger-body" d="M 160 80 C 180 70, 198 62, 204 72 C 210 84, 190 102, 168 102 Z" />
              <circle class="finger-tip-dot" cx="196" cy="74" r="7.5" fill="#1E90FF" />
              <text x="196" y="60" class="finger-text">Cái</text>
            </g>
          </svg>
        </div>

        <!-- HƯỚNG DẪN TRUNG TÂM -->
        <div class="hand-center-guide" id="handCenterGuidance">
          <div class="guide-lead-text">🎯 HƯỚNG DẪN ĐẶT TAY:</div>
          <div class="guide-active-pill" id="guideActivePill">
            Đặt 10 ngón tay lên hàng cơ sở (A S D F - J K L ;)
          </div>
        </div>

        <!-- BÀN TAY PHẢI -->
        <div class="hand-mini-unit right-hand-unit">
          <span class="hand-title-tag">🖐️ TAY PHẢI</span>
          <svg class="hand-mini-svg" viewBox="0 0 220 125" xmlns="http://www.w3.org/2000/svg">
            <!-- Cổ tay & Lòng bàn tay siêu gọn -->
            <path class="palm-compact" d="M 180 70 C 180 50, 155 42, 110 42 C 60 42, 45 55, 45 95 C 50 120, 70 124, 110 124 C 155 124, 180 115, 180 70 Z" />

            <!-- Ngón cái phải -->
            <g class="finger-group finger-thumbs" id="finger-r-thumb" data-finger="thumbs">
              <path class="finger-body" d="M 60 80 C 40 70, 22 62, 16 72 C 10 84, 30 102, 52 102 Z" />
              <circle class="finger-tip-dot" cx="24" cy="74" r="7.5" fill="#1E90FF" />
              <text x="24" y="60" class="finger-text">Cái</text>
            </g>

            <!-- Ngón trỏ phải -->
            <g class="finger-group finger-r-index" id="finger-r-index" data-finger="r-index">
              <path class="finger-body" d="M 65 50 C 62 20, 62 8, 74 8 C 86 8, 88 20, 90 50 Z" />
              <circle class="finger-tip-dot" cx="74" cy="13" r="7.5" fill="#70A1FF" />
              <text x="74" y="1" class="finger-text">Trỏ</text>
            </g>

            <!-- Ngón giữa phải -->
            <g class="finger-group finger-r-middle" id="finger-r-middle" data-finger="r-middle">
              <path class="finger-body" d="M 98 45 C 96 15, 98 2, 110 2 C 122 2, 124 15, 126 45 Z" />
              <circle class="finger-tip-dot" cx="110" cy="7" r="8" fill="#9C88FF" />
              <text x="110" y="-4" class="finger-text">Giữa</text>
            </g>

            <!-- Ngón áp út phải -->
            <g class="finger-group finger-r-ring" id="finger-r-ring" data-finger="r-ring">
              <path class="finger-body" d="M 135 52 C 132 22, 134 6, 144 6 C 156 6, 158 22, 158 52 Z" />
              <circle class="finger-tip-dot" cx="144" cy="11" r="7.5" fill="#ED4C67" />
              <text x="144" y="-1" class="finger-text">Áp</text>
            </g>

            <!-- Ngón út phải -->
            <g class="finger-group finger-r-pinky" id="finger-r-pinky" data-finger="r-pinky">
              <path class="finger-body" d="M 166 65 C 164 36, 166 18, 174 18 C 184 18, 187 36, 184 65 Z" />
              <circle class="finger-tip-dot" cx="174" cy="22" r="7" fill="#8854D0" />
              <text x="174" y="9" class="finger-text">Út</text>
            </g>
          </svg>
        </div>
      </div>
    `;
  }

  highlightFinger(fingerCode, char) {
    document.querySelectorAll('.finger-group.is-active-finger').forEach(el => {
      el.classList.remove('is-active-finger');
    });

    const pillEl = document.getElementById('guideActivePill');

    if (!fingerCode) {
      if (pillEl) pillEl.innerHTML = '👉 Đặt sẵn 10 ngón tay lên hàng cơ sở (A S D F - J K L ;)';
      return;
    }

    if (fingerCode === 'thumbs') {
      const leftThumb = document.getElementById('finger-l-thumb');
      const rightThumb = document.getElementById('finger-r-thumb');
      if (leftThumb) leftThumb.classList.add('is-active-finger');
      if (rightThumb) rightThumb.classList.add('is-active-finger');
    } else {
      const fingerEl = document.getElementById(`finger-${fingerCode}`);
      if (fingerEl) fingerEl.classList.add('is-active-finger');
    }

    const info = FINGER_DESCRIPTIONS[fingerCode];
    if (info && pillEl) {
      const charDisplay = char === ' ' ? '␣ PHÍM CÁCH' : `Phím "${char.toUpperCase()}"`;
      pillEl.innerHTML = `
        <span style="color: ${info.color}; font-weight: 800;">
          Dùng <b>${info.name} (${info.hand})</b> để gõ <b>${charDisplay}</b>
        </span>
      `;
    }
  }

  clear() {
    document.querySelectorAll('.finger-group.is-active-finger').forEach(el => {
      el.classList.remove('is-active-finger');
    });
    const pillEl = document.getElementById('guideActivePill');
    if (pillEl) {
      pillEl.innerHTML = '👉 Đặt sẵn 10 ngón tay lên hàng cơ sở (A S D F - J K L ;)';
    }
  }
}
