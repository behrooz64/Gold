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
  paidTotal: document.getElementById('paidTotal'),
  paidWeight: document.getElementById('paidWeight'),
  perGramResult: document.getElementById('perGramResult'),
  verdictBox: document.getElementById('checkVerdict'),
  verdictText: document.getElementById('verdictText'),
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

function checkPurchase() {
  const paidTotal = parseNumber(els.paidTotal.value) || 0;
  const paidWeight = parseNumber(els.paidWeight.value) || 0;
  const marketPrice = parseNumber(els.price.value) || 0;

  if (paidTotal <= 0 || paidWeight <= 0) {
    els.perGramResult.innerHTML = '۰ <span class="tmn">تومان</span>';
    els.verdictBox.hidden = true;
    return;
  }

  const perGram = paidTotal / paidWeight;
  els.perGramResult.innerHTML = `${formatInt(perGram)} <span class="tmn">تومان</span>`;

  if (marketPrice <= 0) {
    els.verdictBox.hidden = true;
    return;
  }

  const diffPct = ((perGram - marketPrice) / marketPrice) * 100;
  const absDiff = Math.abs(diffPct);
  const diffText = toFaDigits(absDiff.toFixed(1));

  els.verdictBox.hidden = false;
  els.verdictBox.classList.remove('good', 'mid', 'bad');

  if (perGram <= marketPrice) {
    els.verdictBox.classList.add('good');
    els.verdictText.textContent = `عالی؛ قیمت هر گرم شما مساوی یا پایین‌تر از نرخ روز است (٪${diffText}−).`;
  } else if (absDiff <= 3) {
    els.verdictBox.classList.add('good');
    els.verdictText.textContent = `به‌صرفه؛ فقط ٪${diffText} با نرخ روز فاصله دارید.`;
  } else if (absDiff <= 10) {
    els.verdictBox.classList.add('mid');
    els.verdictText.textContent = `متوسط؛ ٪${diffText} بالاتر از نرخ روز پرداخت کرده‌اید.`;
  } else {
    els.verdictBox.classList.add('bad');
    els.verdictText.textContent = `فاصله زیاد؛ ٪${diffText} بالاتر از نرخ روز — اجرت یا سود سنگینی پرداخت شده.`;
  }
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
      checkPurchase();
      return;
    }
    const [intPart, decPart] = raw.split('.');
    const intFormatted = intPart === '' ? '' : parseInt(intPart, 10).toLocaleString('en-US');
    const formatted = decPart !== undefined ? `${intFormatted}.${decPart}` : intFormatted;
    input.value = toFaDigits(formatted);
    const newPos = Math.max(0, input.value.length - caretFromEnd);
    input.setSelectionRange(newPos, newPos);
    calculate();
    checkPurchase();
  });
}

attachLiveFormat(els.price);
attachLiveFormat(els.weight, { decimals: true });
attachLiveFormat(els.wage, { decimals: true });
attachLiveFormat(els.profit, { decimals: true });
attachLiveFormat(els.vat, { decimals: true });
attachLiveFormat(els.paidTotal);
attachLiveFormat(els.paidWeight, { decimals: true });

calculate();
checkPurchase();

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
