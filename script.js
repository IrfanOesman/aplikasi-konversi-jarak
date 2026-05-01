const metersButton = document.getElementById("meters-button");
const metersDropdown = document.getElementById("meters-dropdown");
const dropdownToggle = document.getElementById("dropdown-toggle");
const swapButton = document.getElementById("swap-button");
const fromBlock = document.getElementById("from-block");
const toBlock = document.getElementById("to-block");
const unitSpan = document.getElementById("unit-lable");
const dropdownItems = document.querySelectorAll("#meters-dropdown .dropdown-list");

metersButton.addEventListener("click", () => {
    metersDropdown.classList.toggle("show");
    dropdownToggle.classList.toggle("show")
});

swapButton.addEventListener("click", () => {
  const fromContent = [...fromBlock.children];
  const toContent = [...toBlock.children];

  fromBlock.innerHTML = "";
  toBlock.innerHTML = "";

  toContent.forEach(el => fromBlock.appendChild(el));
  fromContent.forEach(el => toBlock.appendChild(el));
});

dropdownItems.forEach(item => {
  item.addEventListener("click", () => {
    const selectedUnit = item.textContent;
    unitSpan.textContent = selectedUnit;

    const currentActive = document.getElementById("active-unit");
    if (currentActive) {
      currentActive.removeAttribute("id");
    }

    item.setAttribute("id", "active-unit");

    metersDropdown.classList.remove("show");
    dropdownToggle.classList.remove("show");
  });
});

document.addEventListener("click", (e) => {
  if (!metersButton.contains(e.target) && !metersDropdown.contains(e.target)) {
    metersDropdown.classList.remove("show");
    dropdownToggle.classList.remove("show")
  }
});// ── State ──
let inputStr = '';
let fromUnit = 'm';
let toUnit = 'feet';

// Conversion rates relative to meter
const toMeter = {
    m: 1,
    feet: 0.3048,
    km: 1000,
    cm: 0.01,
    inch: 0.0254,
};

// ── Core Logic ──
function convert(value, from, to) {
    const inMeters = value * toMeter[from];
    return inMeters / toMeter[to];
}

function updateDisplay() {
    const inputEl = document.getElementById('inputDisplay');
    const resultEl = document.getElementById('resultDisplay');

    const displayInput = inputStr === '' ? '0' : inputStr;
    inputEl.textContent = displayInput;

    const numVal = parseFloat(inputStr.replace(',', '.'));
    if (!isNaN(numVal) && inputStr !== '') {
        const result = convert(numVal, fromUnit, toUnit);
        resultEl.textContent = formatNumber(result);
    } else {
        resultEl.textContent = '0';
    }
}

function formatNumber(n) {
    if (n === 0) return '0';
    // Show up to 6 significant figures
    const formatted = parseFloat(n.toPrecision(8));
    // Remove trailing zeros
    return String(formatted);
}

// ── Button Handlers ──
function pressNum(char) {
    if (char === ',' || char === '.') {
        // Only one decimal separator
        if (inputStr.includes(',') || inputStr.includes('.')) return;
        if (inputStr === '') { inputStr = '0,'; }
        else inputStr += ',';
    } else {
        // Prevent leading zeros
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
    const resultText = document.getElementById('resultDisplay').textContent;
    navigator.clipboard.writeText(resultText).then(() => {
        showToast();
    }).catch(() => {
        // Fallback
        const el = document.createElement('textarea');
        el.value = resultText;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        showToast();
    });
}

function showToast() {
    const toast = document.getElementById('copyToast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1800);
}

// ── Unit Selector ──
function toggleDropdown() {
    const menu = document.getElementById('dropdownMenu');
    menu.classList.toggle('open');
}

function selectUnit(from, to) {
    fromUnit = from;
    toUnit = to;

    document.getElementById('fromUnit').textContent = from;
    document.getElementById('toUnit').textContent = to;

    // Update active dropdown item
    document.querySelectorAll('.dropdown-item').forEach(el => {
        el.classList.toggle('active',
            el.textContent.trim() === `${from} → ${to}`);
    });

    document.getElementById('dropdownMenu').classList.remove('open');
    inputStr = '';
    updateDisplay();
}

function swapUnits() {
    selectUnit(toUnit, fromUnit);
}

// ── Close dropdown on outside click ──
document.addEventListener('click', function (e) {
    const box = document.querySelector('.unit-box');
    if (box && !box.contains(e.target)) {
        document.getElementById('dropdownMenu').classList.remove('open');
    }
});

// ── Keyboard Support ──
document.addEventListener('keydown', function (e) {
    const key = e.key;
    if (key >= '0' && key <= '9') pressNum(key);
    else if (key === '.' || key === ',') pressNum(',');
    else if (key === 'Backspace') clearEntry();
    else if (key === 'Escape' || key === 'Delete') clearAll();
    else if (key === 'c' || key === 'C') copyResult();
});

// Init
updateDisplay();