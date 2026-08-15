// ---------- Persian digit helpers ----------
const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';

function toEnglishDigits(str) {
  if (!str) return str;
  return str.replace(/[۰-۹]/g, d => FA_DIGITS.indexOf(d))
             .replace(/[٠-٩]/g, d => AR_DIGITS.indexOf(d));
}

function toFaDigits(str) {
  return String(str).replace(/[0-9]/g, d => FA_DIGITS[d]);
}

function parseNumber(raw) {
  if (raw == null) return NaN;
  const cleaned = toEnglishDigits(String(raw)).replace(/[,٬\s]/g, '');
  if (cleaned === '' || cleaned === '.') return NaN;
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

function formatInt(n) {
  const rounded = Math.round(n);
  return toFaDigits(rounded.toLocaleString('en-US'));
}

// ---------- Elements ----------
const els = {
  price: document.getElementById('price'),
  weight: document.getElementById('weight'),
  wage: document.getElementById('wage'),
  profit: document.getElementById('profit'),
  vat: document.getElementById('vat'),
  rowBase: document.getElementById('row-base'),
  rowWage: document.getElementById('row-wage'),
  rowProfit: document.getElementById('row-profit'),
  rowVat: document.getElementById('row-vat'),
  total: document.getElementById('total-amount'),
};

function setStep(input, delta) {
  const cur = parseNumber(input.value) || 0;
  const next = Math.max(0, cur + delta);
  input.value = toFaDigits(next);
  calculate();
}

document.querySelectorAll('[data-step]').forEach(btn => {
  const targetId = btn.getAttribute('data-target');
  const delta = parseFloat(btn.getAttribute('data-step'));
  btn.addEventListener('click', () => setStep(document.getElementById(targetId), delta));
});

function calculate() {
  const price = parseNumber(els.price.value) || 0;
  const weight = parseNumber(els.weight.value) || 0;
  const wagePct = parseNumber(els.wage.value) || 0;
  const profitPct = parseNumber(els.profit.value) || 0;
  const vatPct = parseNumber(els.vat.value) || 0;

  const base = price * weight;
  const wage = base * (wagePct / 100);
  const profit = (base + wage) * (profitPct / 100);
  const vat = (wage + profit) * (vatPct / 100);
  const total = base + wage + profit + vat;

  els.rowBase.textContent = formatInt(base);
  els.rowWage.textContent = formatInt(wage);
  els.rowProfit.textContent = formatInt(profit);
  els.rowVat.textContent = formatInt(vat);
  els.total.textContent = formatInt(total);
}

// live-format inputs with Persian digits + thousands separators as the user types
function attachLiveFormat(input, { decimals = false } = {}) {
  input.addEventListener('input', () => {
    const caretFromEnd = input.value.length - input.selectionStart;
    let raw = toEnglishDigits(input.value).replace(/[^0-9.]/g, '');
    if (decimals) {
      const parts = raw.split('.');
      raw = parts.shift() + (parts.length ? '.' + parts.join('') : '');
    } else {
      raw = raw.replace(/\./g, '');
    }
    if (raw === '') {
      input.value = '';
      calculate();
      return;
    }
    const [intPart, decPart] = raw.split('.');
    const intFormatted = intPart === '' ? '' : parseInt(intPart, 10).toLocaleString('en-US');
    const formatted = decPart !== undefined ? `${intFormatted}.${decPart}` : intFormatted;
    input.value = toFaDigits(formatted);
    const newPos = Math.max(0, input.value.length - caretFromEnd);
    input.setSelectionRange(newPos, newPos);
    calculate();
  });
}

attachLiveFormat(els.price);
attachLiveFormat(els.weight, { decimals: true });
attachLiveFormat(els.wage, { decimals: true });
attachLiveFormat(els.profit, { decimals: true });
attachLiveFormat(els.vat, { decimals: true });

calculate();

// ---------- PWA install prompt ----------
let deferredPrompt = null;
const installBtn = document.getElementById('install-hint');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.classList.add('show');
});

installBtn?.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.classList.remove('show');
});

window.addEventListener('appinstalled', () => {
  installBtn.classList.remove('show');
});

// ---------- Service worker ----------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  });
}
