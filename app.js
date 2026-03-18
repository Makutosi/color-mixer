// color mixer / 11.3.2026

document.addEventListener('DOMContentLoaded', () => {

  // =====================
  // State
  // =====================
  const state = {
    format: 'HEX',
    randomMode: 'chaos'
  };

  // =====================
  // DOM references
  // =====================
  const DOM = {
    container: document.getElementById('drag-container'),
    shadingStyle: document.getElementById('shading-style'),
    gradVariant: document.getElementById('grad-variant'),
    variantGroup: document.getElementById('variant-group'), // 追加
    patternStyle: document.getElementById('pattern-style'),
    previewBox: document.getElementById('preview-box'),
    gradientArea: document.getElementById('gradient-area'),
    patternArea: document.getElementById('pattern-area'),
    mixedValue: document.getElementById('mixed-color-value'),
    gradientCss: document.getElementById('gradient-css'),
    headerDot: document.getElementById('header-dot'),
    formatToggleBtn: document.getElementById('format-toggle-btn'),
    toastMsg: document.getElementById('toast-msg'),
    themeIcon: document.getElementById('theme-icon'),
    favicon: document.getElementById('favicon'),
    chaosBtn: document.getElementById('chaos-btn'),
    harmonicBtn: document.getElementById('harmonic-btn'),
  };

  // =====================
  // Variant data
  // =====================
  const variantsData = {
    'horizontal': [
      { name: 'Top to Bottom', value: 'to bottom' },
      { name: 'Bottom to Top', value: 'to top' },
      { name: 'From Middle', value: 'middle-h' }
    ],
    'vertical': [
      { name: 'Left to Right', value: 'to right' },
      { name: 'Right to Left', value: 'to left' },
      { name: 'From Middle', value: 'middle-v' }
    ],
    'diagonal-up': [
      { name: 'Bottom-Left to Top-Right', value: '45deg' },
      { name: 'Top-Right to Bottom-Left', value: '225deg' },
      { name: 'From Middle', value: 'middle-diag-up' }
    ],
    'diagonal-down': [
      { name: 'Top-Left to Bottom-Right', value: '135deg' },
      { name: 'Bottom-Right to Top-Left', value: '315deg' },
      { name: 'From Middle', value: 'middle-diag-down' }
    ],
    'from-corner': [
      { name: 'Top-Left', value: 'at 0% 0%' },
      { name: 'Top-Right', value: 'at 100% 0%' },
      { name: 'Bottom-Left', value: 'at 0% 100%' },
      { name: 'Bottom-Right', value: 'at 100% 100%' }
    ],
    'from-center': [
      { name: 'Center Out', value: 'excel-center' }
    ]
  };

  // =====================
  // Utility functions
  // =====================
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const hslToHex = (h, s, l) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
  };

  // =====================
  // Data helpers
  // =====================
  function getCurrentPickers() {
    return [...DOM.container.querySelectorAll('.color-picker')]
      .filter(el => el.style.display !== 'none');
  }

  function getCurrentColors() {
    return getCurrentPickers().map(p => p.querySelector('input').value);
  }

  function getActiveFillMode() {
    return document.querySelector('.mode-tab-btn.active').dataset.mode;
  }

  // =====================
  // Background generator
  // =====================
  function generateBackground(colors) {
    const mode = getActiveFillMode();
    let style = "";
    let size = "auto";

    if (mode === 'gradient') {
      DOM.gradientArea.style.display = 'flex';
      DOM.patternArea.style.display = 'none';

      const variant = DOM.gradVariant.value;

      if (variant === 'middle-h')
        style = `linear-gradient(to bottom, ${colors[0]}, ${colors[1]}, ${colors[0]})`;
      else if (variant === 'middle-v')
        style = `linear-gradient(to right, ${colors[0]}, ${colors[1]}, ${colors[0]})`;
      else if (variant === 'middle-diag-up')
        style = `linear-gradient(45deg, ${colors[0]}, ${colors[1]}, ${colors[0]})`;
      else if (variant === 'middle-diag-down')
        style = `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[0]})`;
      else if (variant === 'excel-center')
        style = `radial-gradient(circle at center, ${colors.join(', ')})`;
      else if (variant.startsWith('at'))
        style = `radial-gradient(circle ${variant}, ${colors.join(', ')})`;
      else
        style = `linear-gradient(${variant}, ${colors.join(', ')})`;

    } else {
      DOM.gradientArea.style.display = 'none';
      DOM.patternArea.style.display = 'flex';

      const pattern = DOM.patternStyle.value;
      const bg = colors[0], fg = colors[1];

      switch(pattern) {
        case "dots": style = `radial-gradient(${fg} 15%, transparent 16%), ${bg}`; size = "12px 12px"; break;
        case "polka": style = `radial-gradient(${fg} 35%, transparent 36%), ${bg}`; size = "30px 30px"; break;
        case "grid": style = `linear-gradient(${fg} 1px, transparent 1px), linear-gradient(90deg, ${fg} 1px, transparent 1px), ${bg}`; size = "20px 20px"; break;
        case "checker": style = `conic-gradient(${fg} 90deg, ${bg} 90deg 180deg, ${fg} 180deg 270deg, ${bg} 270deg)`; size = "20px 20px"; break;
        case "diagonal-lines": style = `linear-gradient(45deg, ${fg} 10%, transparent 10%, transparent 50%, ${fg} 50%, ${fg} 60%, transparent 60%, transparent), ${bg}`; size = "10px 10px"; break;
        case "waves": style = `radial-gradient(circle at 50% 0, transparent 40%, ${fg} 41%, ${fg} 49%, transparent 50%), ${bg}`; size = "25px 15px"; break;
      }
    }

    return { style, size };
  }

  // =====================
  // UI updates
  // =====================
  function applyPreview({ style, size }) {
    DOM.previewBox.style.background = style;
    DOM.previewBox.style.backgroundSize = size;
    DOM.gradientCss.textContent = `background: ${style};${size !== 'auto' ? ` background-size: ${size};` : ''}`;
  }

  function updateUI() {
    const colors = getCurrentColors();
    const bg = generateBackground(colors);
    applyPreview(bg);

    // Calculate mixed color
    const avg = colors.reduce((acc, c) => {
      acc.r += parseInt(c.slice(1,3), 16);
      acc.g += parseInt(c.slice(3,5), 16);
      acc.b += parseInt(c.slice(5,7), 16);
      return acc;
    }, {r:0,g:0,b:0});

    const mixedHex = `#${Math.round(avg.r/colors.length).toString(16).padStart(2,'0')}${Math.round(avg.g/colors.length).toString(16).padStart(2,'0')}${Math.round(avg.b/colors.length).toString(16).padStart(2,'0')}`.toUpperCase();
    
    DOM.mixedValue.textContent = mixedHex;
    DOM.headerDot.style.backgroundColor = mixedHex;

    // Update Favicon
    const encoded = mixedHex.replace('#', '%23');
    DOM.favicon.setAttribute('href', `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="${encoded}"/></svg>`);

    // Update labels
    getCurrentPickers().forEach(p => {
      const hex = p.querySelector('input').value.toUpperCase();
      p.querySelector('.code-label').textContent = state.format === 'HEX' ? hex : hexToRgb(hex);
    });
  }

  // =====================
  // Events
  // =====================

  // Fill Mode Tabs
  document.querySelectorAll('.mode-tab-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      document.querySelector('.mode-tab-btn.active').classList.remove('active');
      e.target.classList.add('active');
      updateUI();
    });
  });

  // Random Mode
  DOM.chaosBtn.addEventListener('click', () => {
    state.randomMode = 'chaos';
    DOM.chaosBtn.classList.add('active');
    DOM.harmonicBtn.classList.remove('active');
    generateRandomColors();
  });

  DOM.harmonicBtn.addEventListener('click', () => {
    state.randomMode = 'harmonic';
    DOM.harmonicBtn.classList.add('active');
    DOM.chaosBtn.classList.remove('active');
    generateRandomColors();
  });

  function generateRandomColors() {
    const inputs = DOM.container.querySelectorAll('input[type="color"]');
    if (state.randomMode === 'harmonic') {
      const baseHue = Math.floor(Math.random() * 360);
      inputs.forEach((input, index) => {
        input.value = hslToHex((baseHue + index * 137.5) % 360, 65, 55);
      });
    } else {
      inputs.forEach(i => i.value = "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'));
    }
    updateUI();
  }

  // Copy functionality
  function showToast(text) {
    navigator.clipboard.writeText(text).then(() => {
      DOM.toastMsg.classList.add('show');
      setTimeout(() => DOM.toastMsg.classList.remove('show'), 1000);
    });
  }

  document.addEventListener('click', e => {
    const target = e.target;
    if (target.classList.contains('code-label')) {
      showToast(target.textContent);
    } else if (target.closest('#mixed-color-btn')) {
      showToast(DOM.mixedValue.textContent);
    } else if (target.closest('#gradient-css-btn')) {
      showToast(DOM.gradientCss.textContent);
    }
  });

  // Init Variant Selector
  function populateVariants() {
    const style = DOM.shadingStyle.value;
    const variants = variantsData[style];
    DOM.gradVariant.innerHTML = '';

    // Hide Variant selector if only 1 option (e.g., From Center)
    DOM.variantGroup.style.display = variants.length <= 1 ? 'none' : 'block';

    variants.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.value; opt.textContent = v.name;
      DOM.gradVariant.appendChild(opt);
    });
    updateUI();
  }

  DOM.shadingStyle.addEventListener('change', populateVariants);
  DOM.gradVariant.addEventListener('change', updateUI);
  DOM.patternStyle.addEventListener('change', updateUI);
// --- この部分を書き換えます ---
  DOM.formatToggleBtn.addEventListener('click', () => {
    // 1. 状態を反転 (HEX ⇄ RGB)
    state.format = state.format === 'HEX' ? 'RGB' : 'HEX';

    // 2. ボタンの表示文字を更新
    DOM.formatToggleBtn.textContent = state.format;

    // 3. ツールチップ (title) を「次」の状態に合わせて更新
    DOM.formatToggleBtn.title = state.format === 'HEX' ? 'Switch to RGB' : 'Switch to HEX';

    // 4. UI全体（ラベルなど）を更新
    updateUI();
  });

  // Color inputs
  document.querySelectorAll('input[type="color"]').forEach(i => i.addEventListener('input', updateUI));

  // 2/3 Color Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      document.querySelector('.tab-btn.active').classList.remove('active');
      e.target.classList.add('active');
      document.getElementById('wrapper3').style.display = (e.target.dataset.count === "3") ? 'flex' : 'none';
      updateUI();
    });
  });

// Theme Toggle (ツールチップ連動版)
  document.getElementById('theme-btn').addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    
    // アイコンの切り替え
    DOM.themeIcon.textContent = isDark ? '☾' : '☀︎';
    
    // ツールチップ（マウスを重ねた時の文字）の切り替え
    const btn = document.getElementById('theme-btn');
    btn.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  });

  // =====================
  // Drag & Drop
  // =====================
  let draggedItem = null;
  DOM.container.querySelectorAll('.color-picker').forEach(picker => {
    picker.addEventListener('dragstart', () => { draggedItem = picker; setTimeout(() => picker.classList.add('dragging'), 0); });
    picker.addEventListener('dragend', () => { picker.classList.remove('dragging'); updateUI(); });
  });

  DOM.container.addEventListener('dragover', e => {
    e.preventDefault();
    const draggableElements = [...DOM.container.querySelectorAll('.color-picker:not(.dragging)')];
    const afterElement = draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = e.clientX - box.left - box.width / 2;
      return (offset < 0 && offset > closest.offset) ? { offset, element: child } : closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;

    if (!afterElement) DOM.container.insertBefore(draggedItem, DOM.formatToggleBtn);
    else DOM.container.insertBefore(draggedItem, afterElement);
  });

  // =====================
  // Init
  // =====================
  populateVariants();
});