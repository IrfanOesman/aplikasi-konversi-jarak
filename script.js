// ── Conversion rates (semua dikonversi ke meter dulu) ──
const toMeter = {
  mm:  0.001,
  cm:  0.01,
  dm:  0.1,
  m:   1,
  dam: 10,
  hm:  100,
  km:  1000,
  feet: 0.3048,
  inch: 0.0254,
  yard: 0.9144,
  mile: 1609.344,
};

// ── State ──
let inputStr = '';
let fromUnit = 'm';
let toUnit = 'feet';
let isSwapped = false;

// ── Element references ──
const metersButton    = document.getElementById('meters-button');
const metersDropdown  = document.getElementById('meters-dropdown');
const dropdownToggle  = document.getElementById('dropdown-toggle');
const swapButton      = document.getElementById('swap-button');
const fromBlock       = document.getElementById('from-block');
const toBlock         = document.getElementById('to-block');
const unitLabel       = document.getElementById('unit-lable');
const dropdownItems   = document.querySelectorAll('#meters-dropdown .dropdown-list');
const inputDisplay    = document.getElementById('input-value');
const resultDisplay   = document.getElementById('result-value');
const keypadButtons   = document.querySelectorAll('.keypad button');

// ── Conversion Logic ──
function convert(value, from, to) {
  const inMeters = value * (toMeter[from] || 1);
  return inMeters / (toMeter[to] || 1);
}

function formatNumber(n) {
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e9)   return n.toExponential(4);
  if (abs >= 1)     return parseFloat(n.toPrecision(8)).toLocaleString('id-ID', { maximumFractionDigits: 6 });
  return parseFloat(n.toPrecision(6)).toString().replace('.', ',');
}

function updateDisplay() {
  const display = inputStr === '' ? '0' : inputStr;
  inputDisplay.textContent = display;

  const numVal = parseFloat(inputStr.replace(',', '.'));
  if (!isNaN(numVal) && inputStr !== '') {
    const result = convert(numVal, fromUnit, toUnit);
    resultDisplay.textContent = formatNumber(result);
  } else {
    resultDisplay.textContent = '0';
  }
}

// ── Keypad ──
function pressNum(char) {
  if (char === ',' || char === '.') {
    if (inputStr.includes(',') || inputStr.includes('.')) return;
    inputStr = inputStr === '' ? '0,' : inputStr + ',';
  } else {
    if (inputStr === '0') inputStr = char;
    else inputStr += char;
  }
  updateDisplay();
}

function clearAll() {
  inputStr = '';
  updateDisplay();
}

function clearEntry() {
  inputStr = inputStr.slice(0, -1);
  updateDisplay();
}

function copyResult() {
  const text = resultDisplay.textContent;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(showCopyFeedback).catch(fallbackCopy);
  } else {
    fallbackCopy();
  }
}

function fallbackCopy() {
  const el = document.createElement('textarea');
  el.value = resultDisplay.textContent;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  showCopyFeedback();
}

function showCopyFeedback() {
  const copyBtn = document.querySelector('.copy');
  if (!copyBtn) return;
  copyBtn.classList.add('copied');
  setTimeout(() => copyBtn.classList.remove('copied'), 1500);
}

// ── Wire keypad buttons ──
keypadButtons.forEach(btn => {
  const txt = btn.textContent.trim();
  const img = btn.querySelector('img');

  btn.addEventListener('click', () => {
    if (img && img.id === 'copy-button') { copyResult(); return; }
    if (txt === 'AC')   { clearAll();   return; }
    if (txt === 'CE')   { clearEntry(); return; }
    if (txt === '0' || txt === ',') { pressNum(txt === ',' ? ',' : txt); return; }
    if (txt >= '1' && txt <= '9') { pressNum(txt); return; }
  });
});

// ── Dropdown ──
metersButton.addEventListener('click', (e) => {
  e.stopPropagation();
  metersDropdown.classList.toggle('show');
  dropdownToggle.classList.toggle('show');
});

dropdownItems.forEach(item => {
  item.addEventListener('click', () => {
    const selected = item.textContent.trim();

    // Update unit label
    unitLabel.textContent = selected;

    // Update fromUnit or toUnit depending on swap state
    if (!isSwapped) {
      fromUnit = selected;
    } else {
      toUnit = selected;
    }

    // Update active indicator
    const prev = document.getElementById('active-unit');
    if (prev) prev.removeAttribute('id');
    item.id = 'active-unit';

    metersDropdown.classList.remove('show');
    dropdownToggle.classList.remove('show');

    updateDisplay();
  });
});

document.addEventListener('click', (e) => {
  if (!metersButton.contains(e.target) && !metersDropdown.contains(e.target)) {
    metersDropdown.classList.remove('show');
    dropdownToggle.classList.remove('show');
  }
});

// ── Swap Button ──
swapButton.addEventListener('click', () => {
  isSwapped = !isSwapped;

  // Swap the unit values
  [fromUnit, toUnit] = [toUnit, fromUnit];

  // Swap DOM blocks visually
  const fromChildren = [...fromBlock.children];
  const toChildren   = [...toBlock.children];

  fromBlock.innerHTML = '';
  toBlock.innerHTML   = '';

  toChildren.forEach(el => fromBlock.appendChild(el));
  fromChildren.forEach(el => toBlock.appendChild(el));

  // Update unit label to reflect new fromUnit
  const newLabel = document.getElementById('unit-lable');
  if (newLabel) newLabel.textContent = fromUnit;

  // Animate swap button
  swapButton.style.transform = 'rotate(180deg)';
  setTimeout(() => { swapButton.style.transform = ''; }, 300);

  updateDisplay();
});

// ── Keyboard Support ──
document.addEventListener('keydown', (e) => {
  const k = e.key;
  if (k >= '0' && k <= '9') pressNum(k);
  else if (k === '.' || k === ',') pressNum(',');
  else if (k === 'Backspace') clearEntry();
  else if (k === 'Escape' || k === 'Delete') clearAll();
  else if (k.toLowerCase() === 'c') copyResult();
});

// ── Init ──
updateDisplay();