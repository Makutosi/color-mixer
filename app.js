// color mixer / 11.3.2026

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('drag-container');
  const fillModeSelect = document.getElementById('fill-mode');
  const shadingStyleSelect = document.getElementById('shading-style');
  const gradVariantSelect = document.getElementById('grad-variant');
  const patternStyleSelect = document.getElementById('pattern-style');
  const previewBox = document.getElementById('preview-box');
  const gradientArea = document.getElementById('gradient-area');
  const patternArea = document.getElementById('pattern-area');
  const mixedValue = document.getElementById('mixed-color-value');
  const gradientCss = document.getElementById('gradient-css');
  const headerDot = document.getElementById('header-dot');
  const formatToggleBtn = document.getElementById('format-toggle-btn');
  const toastMsg = document.getElementById('toast-msg');
  const themeIcon = document.getElementById('theme-icon');
  const favicon = document.getElementById('favicon');
  
  const chaosBtn = document.getElementById('chaos-btn');
  const harmonicBtn = document.getElementById('harmonic-btn');

  let colorFormat = 'HEX';
  let currentRandomMode = 'chaos';

  const variantsData = {
    'horizontal': [{ name: 'Top to Bottom', value: 'to bottom' }, { name: 'Bottom to Top', value: 'to top' }, { name: 'From Middle', value: 'middle-h' }],
    'vertical': [{ name: 'Left to Right', value: 'to right' }, { name: 'Right to Left', value: 'to left' }, { name: 'From Middle', value: 'middle-v' }],
    'diagonal-up': [{ name: 'Bottom-Left to Top-Right', value: '45deg' }, { name: 'Top-Right to Bottom-Left', value: '225deg' }, { name: 'From Middle', value: 'middle-diag-up' }],
    'diagonal-down': [{ name: 'Top-Left to Bottom-Right', value: '135deg' }, { name: 'Bottom-Right to Top-Left', value: '315deg' }, { name: 'From Middle', value: 'middle-diag-down' }],
    'from-corner': [{ name: 'Top-Left', value: 'at 0% 0%' }, { name: 'Top-Right', value: 'at 100% 0%' }, { name: 'Bottom-Left', value: 'at 0% 100%' }, { name: 'Bottom-Right', value: 'at 100% 100%' }],
    'from-center': [{ name: 'Center Out', value: 'excel-center' }]
  };

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
  }

  function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
  }

  function updateUI() {
    const currentPickers = [...container.querySelectorAll('.color-picker')].filter(el => el.style.display !== 'none');
    const colors = currentPickers.map(p => p.querySelector('input').value);
    const mode = fillModeSelect.value;
    let finalStyle = "";
    let bgSize = "auto";

    if (mode === 'gradient') {
      gradientArea.style.display = 'flex';
      patternArea.style.display = 'none';
      const variant = gradVariantSelect.value;
      if (variant === 'middle-h') finalStyle = `linear-gradient(to bottom, ${colors[0]}, ${colors[1]}, ${colors[0]})`;
      else if (variant === 'middle-v') finalStyle = `linear-gradient(to right, ${colors[0]}, ${colors[1]}, ${colors[0]})`;
      else if (variant === 'middle-diag-up') finalStyle = `linear-gradient(45deg, ${colors[0]}, ${colors[1]}, ${colors[0]})`;
      else if (variant === 'middle-diag-down') finalStyle = `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[0]})`;
      else if (variant === 'excel-center') finalStyle = `radial-gradient(circle at center, ${colors.join(', ')})`;
      else if (variant.startsWith('at')) finalStyle = `radial-gradient(circle ${variant}, ${colors.join(', ')})`;
      else finalStyle = `linear-gradient(${variant}, ${colors.join(', ')})`;
    } else {
      gradientArea.style.display = 'none';
      patternArea.style.display = 'flex';
      const pattern = patternStyleSelect.value;
      const bg = colors[0], fg = colors[1];
      switch(pattern) {
        case "dots": finalStyle = `radial-gradient(${fg} 15%, transparent 16%), ${bg}`; bgSize = "12px 12px"; break;
        case "polka": finalStyle = `radial-gradient(${fg} 35%, transparent 36%), ${bg}`; bgSize = "30px 30px"; break;
        case "grid": finalStyle = `linear-gradient(${fg} 1px, transparent 1px), linear-gradient(90deg, ${fg} 1px, transparent 1px), ${bg}`; bgSize = "20px 20px"; break;
        case "checker": finalStyle = `conic-gradient(${fg} 90deg, ${bg} 90deg 180deg, ${fg} 180deg 270deg, ${bg} 270deg)`; bgSize = "20px 20px"; break;
        case "diagonal-lines": finalStyle = `linear-gradient(45deg, ${fg} 10%, transparent 10%, transparent 50%, ${fg} 50%, ${fg} 60%, transparent 60%, transparent), ${bg}`; bgSize = "10px 10px"; break;
        case "waves": finalStyle = `radial-gradient(circle at 50% 0, transparent 40%, ${fg} 41%, ${fg} 49%, transparent 50%), ${bg}`; bgSize = "25px 15px"; break;
      }
    }

    previewBox.style.background = finalStyle;
    previewBox.style.backgroundSize = bgSize;
    gradientCss.textContent = `background: ${finalStyle};${bgSize !== 'auto' ? ` background-size: ${bgSize};` : ''}`;

    const avg = colors.reduce((acc, c) => {
      acc.r += parseInt(c.slice(1,3), 16); acc.g += parseInt(c.slice(3,5), 16); acc.b += parseInt(c.slice(5,7), 16);
      return acc;
    }, {r:0, g:0, b:0});
    const hex = `#${Math.round(avg.r/colors.length).toString(16).padStart(2,'0')}${Math.round(avg.g/colors.length).toString(16).padStart(2,'0')}${Math.round(avg.b/colors.length).toString(16).padStart(2,'0')}`.toUpperCase();
    mixedValue.textContent = hex; 
    headerDot.style.backgroundColor = hex;

    // Favicon 更新
    // app.js の updateUI 関数内
    const encodedHex = hex.replace('#', '%23');
    const svgData = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="${encodedHex}"/></svg>`;
    favicon.setAttribute('href', svgData);

    currentPickers.forEach(p => {
      const hexVal = p.querySelector('input').value.toUpperCase();
      p.querySelector('.code-label').textContent = (colorFormat === 'HEX') ? hexVal : hexToRgb(hexVal);
    });
  }

  // --- Random Logic ---
  function generateRandomColors() {
    const inputs = container.querySelectorAll('input[type="color"]');
    if (currentRandomMode === 'harmonic') {
      const baseHue = Math.floor(Math.random() * 360);
      inputs.forEach((input, index) => {
        const h = (baseHue + (index * 137.5)) % 360;
        input.value = hslToHex(h, 65, 55);
      });
    } else {
      inputs.forEach(i => {
        i.value = "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
      });
    }
    updateUI();
  }

  chaosBtn.addEventListener('click', () => {
    currentRandomMode = 'chaos';
    chaosBtn.classList.add('active');
    harmonicBtn.classList.remove('active');
    generateRandomColors();
  });

  harmonicBtn.addEventListener('click', () => {
    currentRandomMode = 'harmonic';
    harmonicBtn.classList.add('active');
    chaosBtn.classList.remove('active');
    generateRandomColors();
  });

  // --- UI Handlers ---
  formatToggleBtn.addEventListener('click', () => {
    colorFormat = (colorFormat === 'HEX') ? 'RGB' : 'HEX';
    formatToggleBtn.textContent = colorFormat;
    updateUI();
  });

  let draggedItem = null;
  container.querySelectorAll('.color-picker').forEach(picker => {
    picker.addEventListener('dragstart', () => { draggedItem = picker; setTimeout(() => picker.classList.add('dragging'), 0); });
    picker.addEventListener('dragend', () => { picker.classList.remove('dragging'); updateUI(); });
  });

  container.addEventListener('dragover', e => {
    e.preventDefault();
    const draggableElements = [...container.querySelectorAll('.color-picker:not(.dragging)')];
    const afterElement = draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = e.clientX - box.left - box.width / 2;
      if (offset < 0 && offset > closest.offset) return { offset, element: child };
      return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
    if (!afterElement) container.insertBefore(draggedItem, formatToggleBtn);
    else container.insertBefore(draggedItem, afterElement);
  });

  function showMinimalToast(text) {
    navigator.clipboard.writeText(text).then(() => {
      toastMsg.classList.add('show');
      setTimeout(() => toastMsg.classList.remove('show'), 1000);
    });
  }

  document.addEventListener('click', e => {
    const target = e.target;
    if (target.classList.contains('code-label') || target.closest('#mixed-color-btn') || target.closest('#gradient-css-btn')) {
      const copyVal = target.textContent || target.innerText || mixedValue.textContent;
      showMinimalToast(copyVal);
    }
  });

  document.getElementById('theme-btn').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    themeIcon.textContent = document.body.classList.contains('dark-mode') ? '☾' : '☀︎';
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      document.querySelector('.tab-btn.active').classList.remove('active');
      e.target.classList.add('active');
      document.getElementById('wrapper3').style.display = (e.target.dataset.count === "3") ? 'flex' : 'none';
      updateUI();
    });
  });

  function populateVariants() {
    const style = shadingStyleSelect.value;
    gradVariantSelect.innerHTML = '';
    variantsData[style].forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.value; opt.textContent = v.name;
      gradVariantSelect.appendChild(opt);
    });
    updateUI();
  }

  [fillModeSelect, shadingStyleSelect, gradVariantSelect, patternStyleSelect].forEach(el => el.addEventListener('change', updateUI));
  shadingStyleSelect.addEventListener('change', populateVariants);
  container.querySelectorAll('input').forEach(i => i.addEventListener('input', updateUI));
  
  populateVariants();

  updateUI();
});