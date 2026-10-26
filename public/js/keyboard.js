// Virtual Keyboard Logic & Layout Mapping
// Color coding per finger:
// l-pinky: #FF4757 (Hồng)
// l-ring:   #FFA502 (Cam)
// l-middle: #F1C40F (Vàng tươi)
// l-index:  #2ED573 (Xanh lá)
// thumbs:   #1E90FF (Xanh dương)
// r-index:  #70A1FF (Xanh lơ)
// r-middle: #9C88FF (Tím hoa cà)
// r-ring:   #ED4C67 (Hồng đào)
// r-pinky:  #8854D0 (Tím)

const KEYBOARD_LAYOUT = [
  // Hàng số
  [
    { key: '`', label: '` ~', finger: 'l-pinky', width: 'key-1' },
    { key: '1', label: '1', finger: 'l-pinky', width: 'key-1' },
    { key: '2', label: '2', finger: 'l-ring', width: 'key-1' },
    { key: '3', label: '3', finger: 'l-middle', width: 'key-1' },
    { key: '4', label: '4', finger: 'l-index', width: 'key-1' },
    { key: '5', label: '5', finger: 'l-index', width: 'key-1' },
    { key: '6', label: '6', finger: 'r-index', width: 'key-1' },
    { key: '7', label: '7', finger: 'r-index', width: 'key-1' },
    { key: '8', label: '8', finger: 'r-middle', width: 'key-1' },
    { key: '9', label: '9', finger: 'r-ring', width: 'key-1' },
    { key: '0', label: '0', finger: 'r-pinky', width: 'key-1' },
    { key: '-', label: '-', finger: 'r-pinky', width: 'key-1' },
    { key: '=', label: '=', finger: 'r-pinky', width: 'key-1' },
    { key: 'Backspace', label: '⌫ Xóa', finger: 'r-pinky', width: 'key-1-5', special: true }
  ],
  // Hàng trên (QWERTY)
  [
    { key: 'Tab', label: 'Tab', finger: 'l-pinky', width: 'key-1-5', special: true },
    { key: 'q', label: 'Q', finger: 'l-pinky', width: 'key-1' },
    { key: 'w', label: 'W', finger: 'l-ring', width: 'key-1' },
    { key: 'e', label: 'E', finger: 'l-middle', width: 'key-1' },
    { key: 'r', label: 'R', finger: 'l-index', width: 'key-1' },
    { key: 't', label: 'T', finger: 'l-index', width: 'key-1' },
    { key: 'y', label: 'Y', finger: 'r-index', width: 'key-1' },
    { key: 'u', label: 'U', finger: 'r-index', width: 'key-1' },
    { key: 'i', label: 'I', finger: 'r-middle', width: 'key-1' },
    { key: 'o', label: 'O', finger: 'r-ring', width: 'key-1' },
    { key: 'p', label: 'P', finger: 'r-pinky', width: 'key-1' },
    { key: '[', label: '[', finger: 'r-pinky', width: 'key-1' },
    { key: ']', label: ']', finger: 'r-pinky', width: 'key-1' },
    { key: '\\', label: '\\', finger: 'r-pinky', width: 'key-1' }
  ],
  // Hàng cơ sở (Home row - ASDF JKL;)
  [
    { key: 'CapsLock', label: 'Caps', finger: 'l-pinky', width: 'key-1-75', special: true },
    { key: 'a', label: 'A', finger: 'l-pinky', width: 'key-1' },
    { key: 's', label: 'S', finger: 'l-ring', width: 'key-1' },
    { key: 'd', label: 'D', finger: 'l-middle', width: 'key-1' },
    { key: 'f', label: 'F', finger: 'l-index', width: 'key-1', bump: true },
    { key: 'g', label: 'G', finger: 'l-index', width: 'key-1' },
    { key: 'h', label: 'H', finger: 'r-index', width: 'key-1' },
    { key: 'j', label: 'J', finger: 'r-index', width: 'key-1', bump: true },
    { key: 'k', label: 'K', finger: 'r-middle', width: 'key-1' },
    { key: 'l', label: 'L', finger: 'r-ring', width: 'key-1' },
    { key: ';', label: ';', finger: 'r-pinky', width: 'key-1' },
    { key: "'", label: "'", finger: 'r-pinky', width: 'key-1' },
    { key: 'Enter', label: '⏎ Nhập', finger: 'r-pinky', width: 'key-2-25', special: true }
  ],
  // Hàng dưới (ZXCV BNM)
  [
    { key: 'ShiftLeft', label: '⇧ Shift', finger: 'l-pinky', width: 'key-2-25', special: true },
    { key: 'z', label: 'Z', finger: 'l-pinky', width: 'key-1' },
    { key: 'x', label: 'X', finger: 'l-ring', width: 'key-1' },
    { key: 'c', label: 'C', finger: 'l-middle', width: 'key-1' },
    { key: 'v', label: 'V', finger: 'l-index', width: 'key-1' },
    { key: 'b', label: 'B', finger: 'l-index', width: 'key-1' },
    { key: 'n', label: 'N', finger: 'r-index', width: 'key-1' },
    { key: 'm', label: 'M', finger: 'r-index', width: 'key-1' },
    { key: ',', label: ',', finger: 'r-middle', width: 'key-1' },
    { key: '.', label: '.', finger: 'r-ring', width: 'key-1' },
    { key: '/', label: '/', finger: 'r-pinky', width: 'key-1' },
    { key: 'ShiftRight', label: '⇧ Shift', finger: 'r-pinky', width: 'key-2-75', special: true }
  ],
  // Hàng cách (Space)
  [
    { key: 'ControlLeft', label: 'Ctrl', finger: 'l-pinky', width: 'key-1-5', special: true },
    { key: 'AltLeft', label: 'Alt', finger: 'thumbs', width: 'key-1-5', special: true },
    { key: ' ', label: '␣ PHÍM CÁCH (DÙNG NGÓN CÁI)', finger: 'thumbs', width: 'key-space' },
    { key: 'AltRight', label: 'Alt', finger: 'thumbs', width: 'key-1-5', special: true },
    { key: 'ControlRight', label: 'Ctrl', finger: 'r-pinky', width: 'key-1-5', special: true }
  ]
];

// Helper: map a character to key element id
function getNormalizedKey(char) {
  if (!char) return '';
  if (char === ' ') return ' ';
  return char.toLowerCase();
}

class VirtualKeyboard {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.keyElements = new Map();
    this.activeKey = null;
    this.init();
  }

  init() {
    if (!this.container) return;
    this.container.innerHTML = '';
    
    KEYBOARD_LAYOUT.forEach((row, rowIndex) => {
      const rowDiv = document.createElement('div');
      rowDiv.className = `kb-row kb-row-${rowIndex}`;

      row.forEach(item => {
        const keyBtn = document.createElement('div');
        keyBtn.className = `kb-key ${item.width} finger-${item.finger}`;
        if (item.bump) keyBtn.classList.add('has-bump');
        if (item.special) keyBtn.classList.add('is-special');

        keyBtn.setAttribute('data-key', item.key);
        keyBtn.setAttribute('data-finger', item.finger);
        keyBtn.innerHTML = `<span>${item.label}</span>${item.bump ? '<span class="bump-bar"></span>' : ''}`;

        this.keyElements.set(item.key.toLowerCase(), keyBtn);
        rowDiv.appendChild(keyBtn);
      });

      this.container.appendChild(rowDiv);
    });
  }

  // Highlight the key the student is supposed to type
  highlightTarget(char) {
    // Clear previous
    if (this.activeKey) {
      this.activeKey.classList.remove('is-target');
    }

    const normKey = getNormalizedKey(char);
    const keyEl = this.keyElements.get(normKey);
    if (keyEl) {
      keyEl.classList.add('is-target');
      this.activeKey = keyEl;
      return keyEl.getAttribute('data-finger');
    }
    return null;
  }

  // Visual feedback when student presses a key
  flashKey(key, isCorrect) {
    const normKey = getNormalizedKey(key);
    const keyEl = this.keyElements.get(normKey);
    if (!keyEl) return;

    const flashClass = isCorrect ? 'is-correct-flash' : 'is-error-flash';
    keyEl.classList.add(flashClass);
    keyEl.classList.add('is-pressed');

    setTimeout(() => {
      keyEl.classList.remove(flashClass);
      keyEl.classList.remove('is-pressed');
    }, 200);
  }

  clear() {
    if (this.activeKey) {
      this.activeKey.classList.remove('is-target');
      this.activeKey = null;
    }
  }
}
