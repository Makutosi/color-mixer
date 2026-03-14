// color mixer / 11.3.2026

document.addEventListener('DOMContentLoaded', () => {
  const colorInputs = [
    document.getElementById('color1'),
    document.getElementById('color2'),
    document.getElementById('color3')
  ];
  const fillModeSelect = document.getElementById('fill-mode');
  const shadingStyleSelect = document.getElementById('shading-style');
  const gradVariantSelect = document.getElementById('grad-variant');
  const patternStyleSelect = document.getElementById('pattern-style');
  const gradientArea = document.getElementById('gradient-area');
  const patternArea = document.getElementById('pattern-area');
  const previewBox = document.getElementById('preview-box');
  const mixedValue = document.getElementById('mixed-color-value');
  const gradientCss = document.getElementById('gradient-css');
  const headerDot = document.getElementById('header-dot');
  const themeBtn = document.getElementById('theme-btn');
  const themeIcon = document.getElementById('theme-icon');
  const randomBtn = document.getElementById('random-btn');
  const toast = document.getElementById('toast');

  let activeColorCount = 2;

  const variantsData = {
    'horizontal': [{ name: 'Top to Bottom', value: 'to bottom' }, { name: 'Bottom to Top', value: 'to top' }, { name: 'From Middle', value: 'middle-h' }],
    'vertical': [{ name: 'Left to Right', value: 'to right' }, { name: 'Right to Left', value: 'to left' }, { name: 'From Middle', value: 'middle-v' }],
    'diagonal-up': [{ name: 'Bottom-Left to Top-Right', value: '45deg' }, { name: 'Top-Right to Bottom-Left', value: '225deg' }],
    'diagonal-down': [{ name: 'Top-Left to Bottom-Right', value: '135deg' }, { name: 'Bottom-Right to Top-Left', value: '315deg' }],
    'from-corner': [{ name: 'Top-Left', value: 'at 0% 0%' }, { name: 'Top-Right', value: 'at 100% 0%' }, { name: 'Bottom-Left', value: 'at 0% 100%' }, { name: 'Bottom-Right', value: 'at 100% 100%' }],
    'from-center': [{ name: 'Center Out', value: 'at 50% 50%' }]
  };

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

  function updateUI() {
    const colors = colorInputs.slice(0, activeColorCount).map(i => i.value);
    const mode = fillModeSelect.value;
    let finalStyle = "";
    let bgSize = "auto";

    if (mode === 'gradient') {
      gradientArea.style.display = 'flex';
      patternArea.style.display = 'none';
      const variant = gradVariantSelect.value;
      if (variant === 'middle-h') finalStyle = `linear-gradient(to bottom, ${colors[0]}, ${colors[1]}, ${colors[0]})`;
      else if (variant === 'middle-v') finalStyle = `linear-gradient(to right, ${colors[0]}, ${colors[1]}, ${colors[0]})`;
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
        case "diagonal-stripes": finalStyle = `repeating-linear-gradient(-45deg, ${fg}, ${fg} 4px, ${bg} 4px, ${bg} 12px)`; break;
        case "waves": finalStyle = `radial-gradient(circle at 50% 0, transparent 40%, ${fg} 41%, ${fg} 49%, transparent 50%), ${bg}`; bgSize = "25px 15px"; break;
      }
    }

    previewBox.style.background = finalStyle;
    previewBox.style.backgroundSize = bgSize;
    gradientCss.textContent = `background: ${finalStyle};${bgSize !== 'auto' ? ` background-size: ${bgSize};` : ''}`;

    const r = colors.reduce((acc, c) => acc + parseInt(c.slice(1,3), 16), 0) / colors.length;
    const g = colors.reduce((acc, c) => acc + parseInt(c.slice(3,5), 16), 0) / colors.length;
    const b = colors.reduce((acc, c) => acc + parseInt(c.slice(5,7), 16), 0) / colors.length;
    const hex = `#${Math.round(r).toString(16).padStart(2,'0')}${Math.round(g).toString(16).padStart(2,'0')}${Math.round(b).toString(16).padStart(2,'0')}`.toUpperCase();
    mixedValue.textContent = hex; 
    mixedValue.style.color = hex;
    headerDot.style.backgroundColor = hex;
    colorInputs.forEach((input, i) => {
      const label = document.getElementById(`label${i+1}`);
      if(label) label.textContent = input.value.toUpperCase();
    });
  }

  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    themeIcon.textContent = document.body.classList.contains('dark-mode') ? '🌙' : '☀️';
  });

  randomBtn.addEventListener('click', () => {
    colorInputs.forEach(i => {
      i.value = "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    });
    updateUI();
  });

  function setupCopy(btnId, valueId) {
    const btn = document.getElementById(btnId);
    btn.addEventListener('click', () => {
      const text = document.getElementById(valueId).textContent;
      navigator.clipboard.writeText(text).then(() => {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
      });
    });
  }
  setupCopy('mixed-color-btn', 'mixed-color-value');
  setupCopy('gradient-css-btn', 'gradient-css');

  fillModeSelect.addEventListener('change', updateUI);
  shadingStyleSelect.addEventListener('change', populateVariants);
  gradVariantSelect.addEventListener('change', updateUI);
  patternStyleSelect.addEventListener('change', updateUI);
  colorInputs.forEach(i => i.addEventListener('input', updateUI));

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelector('.tab-btn.active').classList.remove('active');
      e.target.classList.add('active');
      activeColorCount = parseInt(e.target.dataset.count);
      document.getElementById('wrapper3').style.display = (activeColorCount === 3) ? 'flex' : 'none';
      updateUI();
    });
  });

  populateVariants();
});