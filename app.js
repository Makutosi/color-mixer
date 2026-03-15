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
  const toastTop = document.getElementById('toast-top');
  const toastBottom = document.getElementById('toast-bottom');

  let activeColorCount = 2;
  let colorFormat = 'HEX'; 

  // グラデーションのバリエーションデータ
  const variantsData = {
    'horizontal': [{ name: 'Top to Bottom', value: 'to bottom' }, { name: 'Bottom to Top', value: 'to top' }, { name: 'From Middle', value: 'middle-h' }],
    'vertical': [{ name: 'Left to Right', value: 'to right' }, { name: 'Right to Left', value: 'to left' }, { name: 'From Middle', value: 'middle-v' }],
    'diagonal-up': [{ name: 'Bottom-Left to Top-Right', value: '45deg' }, { name: 'Top-Right to Bottom-Left', value: '225deg' }, { name: 'From Middle', value: 'middle-diag-up' }],
    'diagonal-down': [{ name: 'Top-Left to Bottom-Right', value: '135deg' }, { name: 'Bottom-Right to Top-Left', value: '315deg' }, { name: 'From Middle', value: 'middle-diag-down' }],
    'from-corner': [{ name: 'Top-Left', value: 'at 0% 0%' }, { name: 'Top-Right', value: 'at 100% 0%' }, { name: 'Bottom-Left', value: 'at 0% 100%' }, { name: 'Bottom-Right', value: 'at 100% 100%' }],
    'from-center': [{ name: 'Center Out', value: 'excel-center' }]
  };

  // HEXをRGB文字列に変換するヘルパー
  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
  }

  // メインの表示更新処理
  function updateUI() {
    const currentPickers = [...container.querySelectorAll('.color-picker')].filter(el => el.style.display !== 'none');
    const colors = currentPickers.map(p => p.querySelector('input').value);
    const mode = fillModeSelect.value;
    let finalStyle = "";
    let bgSize = "auto";

    // 1. 塗りつぶしモードの判定
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

    // 2. プレビューとCSSテキストの更新
    previewBox.style.background = finalStyle;
    previewBox.style.backgroundSize = bgSize;
    gradientCss.textContent = `background: ${finalStyle};${bgSize !== 'auto' ? ` background-size: ${bgSize};` : ''}`;

    // 3. 平均色の計算と表示
    const avg = colors.reduce((acc, c) => {
      acc.r += parseInt(c.slice(1,3), 16); acc.g += parseInt(c.slice(3,5), 16); acc.b += parseInt(c.slice(5,7), 16);
      return acc;
    }, {r:0, g:0, b:0});
    const hex = `#${Math.round(avg.r/colors.length).toString(16).padStart(2,'0')}${Math.round(avg.g/colors.length).toString(16).padStart(2,'0')}${Math.round(avg.b/colors.length).toString(16).padStart(2,'0')}`.toUpperCase();
    mixedValue.textContent = hex; 
    headerDot.style.backgroundColor = hex;

    // 4. 各ピッカーのラベル更新
    currentPickers.forEach(p => {
      const hexVal = p.querySelector('input').value.toUpperCase();
      p.querySelector('.code-label').textContent = (colorFormat === 'HEX') ? hexVal : hexToRgb(hexVal);
    });
  }

  // カラーフォーマットの切り替え
  formatToggleBtn.addEventListener('click', () => {
    colorFormat = (colorFormat === 'HEX') ? 'RGB' : 'HEX';
    formatToggleBtn.textContent = colorFormat;
    updateUI();
  });

  // ドラッグ＆ドロップ処理
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
    if (!afterElement) container.appendChild(draggedItem);
    else container.insertBefore(draggedItem, afterElement);
  });

  // トースト表示機能付きコピー関数
  function copyWithToast(text, isTop) {
    navigator.clipboard.writeText(text).then(() => {
      const targetToast = isTop ? toastTop : toastBottom;
      // すでに表示されている場合は一度消す
      targetToast.classList.remove('show');
      void targetToast.offsetWidth; // リフローを強制
      targetToast.classList.add('show');
      setTimeout(() => targetToast.classList.remove('show'), 2000);
    });
  }

  // クリックイベントの一括管理
  document.addEventListener('click', e => {
    const target = e.target;
    
    // 1. 個別のカラーラベル（上トースト）
    if (target.classList.contains('code-label')) {
      copyWithToast(target.textContent, true);
    }
    
    // 2. Mixed Result（上トースト：カラーコードなので）
    if (target.closest('#mixed-color-btn')) {
      copyWithToast(mixedValue.textContent, true);
    }
    
    // 3. CSS Property（下トースト）
    if (target.closest('#gradient-css-btn')) {
      copyWithToast(gradientCss.textContent, false);
    }
  });

  // ダークモード切り替え
  document.getElementById('theme-btn').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    document.getElementById('theme-icon').textContent = document.body.classList.contains('dark-mode') ? '🌙' : '☀️';
  });

  // ランダムカラー
  document.getElementById('random-btn').addEventListener('click', () => {
    container.querySelectorAll('input[type="color"]').forEach(i => {
      i.value = "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    });
    updateUI();
  });

  // タブ切り替え（2色 / 3色）
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      document.querySelector('.tab-btn.active').classList.remove('active');
      e.target.classList.add('active');
      activeColorCount = parseInt(e.target.dataset.count);
      
      const wrapper3 = document.getElementById('wrapper3');
      if (activeColorCount === 3) {
        wrapper3.style.display = 'flex';
      } else {
        wrapper3.style.display = 'none';
      }
      updateUI();
    });
  });

  // シェーディングスタイルに合わせたバリエーションの生成
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

  // イベントリスナーの登録
  [fillModeSelect, shadingStyleSelect, gradVariantSelect, patternStyleSelect].forEach(el => {
    el.addEventListener('change', updateUI);
  });
  
  shadingStyleSelect.addEventListener('change', populateVariants);
  
  container.querySelectorAll('input').forEach(i => {
    i.addEventListener('input', updateUI);
  });

  // 初期化
  populateVariants();
});