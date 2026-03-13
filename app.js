// color mixer / 11.3.2026

const colorInputs = [
  document.getElementById('color1'),
  document.getElementById('color2'),
  document.getElementById('color3')
];
const gradTypeSelect = document.getElementById('grad-type');
const previewBox = document.getElementById('preview-box');
const mixedValue = document.getElementById('mixed-color-value');
const gradientCss = document.getElementById('gradient-css');
const headerDot = document.getElementById('header-dot');
const toast = document.getElementById('toast');
const randomBtn = document.getElementById('random-btn');
const themeBtn = document.getElementById('theme-btn');
const themeIcon = document.getElementById('theme-icon');

let activeColorCount = 2;

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('');
}

function generateRandomHex() {
  return "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
}

function updateUI() {
  const colors = colorInputs.slice(0, activeColorCount).map(input => input.value);
  const type = gradTypeSelect.value;
  const colorList = colors.join(', ');

  let gradString = "";
  switch(type) {
    case "linear-135": gradString = `linear-gradient(135deg, ${colorList})`; break;
    case "linear-to-right": gradString = `linear-gradient(to right, ${colorList})`; break;
    case "radial": gradString = `radial-gradient(circle, ${colorList})`; break;
    case "conic": gradString = `conic-gradient(${colors[0]}, ${colorList}, ${colors[0]})`; break;
  }

  const rgbs = colors.map(hexToRgb);
  const avg = rgbs.reduce((acc, cur) => ({r: acc.r+cur.r, g: acc.g+cur.g, b: acc.b+cur.b}), {r:0, g:0, b:0});
  const mixedHex = rgbToHex(avg.r/activeColorCount, avg.g/activeColorCount, avg.b/activeColorCount).toUpperCase();

  previewBox.style.background = gradString;
  mixedValue.textContent = mixedHex;
  mixedValue.style.color = mixedHex;
  gradientCss.textContent = `background: ${gradString};`;
  headerDot.style.backgroundColor = mixedHex;

  colorInputs.forEach((input, i) => {
    document.getElementById(`label${i+1}`).textContent = input.value.toUpperCase();
  });
}

themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  themeIcon.textContent = document.body.classList.contains('dark-mode') ? '🌙' : '☀️';
});

randomBtn.addEventListener('click', () => {
  colorInputs.forEach(input => {
    input.value = generateRandomHex();
  });
  updateUI();
});

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelector('.tab-btn.active').classList.remove('active');
    e.target.classList.add('active');
    activeColorCount = parseInt(e.target.dataset.count);
    // display: flex にすることで、並び順を維持します
    document.getElementById('wrapper3').style.display = (activeColorCount === 3) ? 'flex' : 'none';
    updateUI();
  });
});

function setupCopy(id, textFunc) {
  document.getElementById(id).addEventListener('click', () => {
    navigator.clipboard.writeText(textFunc()).then(() => {
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2000);
    });
  });
}

setupCopy('mixed-color-btn', () => mixedValue.textContent);
setupCopy('gradient-css-btn', () => gradientCss.textContent);

colorInputs.forEach(input => input.addEventListener('input', updateUI));
gradTypeSelect.addEventListener('change', updateUI);

updateUI();