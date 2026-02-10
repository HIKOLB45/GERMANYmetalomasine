let speed = 3;
let price = 100;
let isDark = true;
let candles = [];

const priceEl = document.getElementById('price');

/* === MAIN CHART === */
const chart = LightweightCharts.createChart(document.getElementById('chart'), {
  layout: { background: { color: '#0b0f14' }, textColor: '#d1d5db' },
  grid: { vertLines: { color: '#1f2933' }, horzLines: { color: '#1f2933' } },
  timeScale: { timeVisible: true }
});

const candleSeries = chart.addCandlestickSeries({
  upColor: '#22c55e',
  downColor: '#ef4444',
  borderVisible: false,
  wickUpColor: '#22c55e',
  wickDownColor: '#ef4444'
});

const volumeSeries = chart.addHistogramSeries({
  priceFormat: { type: 'volume' },
  priceScaleId: ''
});

volumeSeries.priceScale().applyOptions({
  scaleMargins: { top: 0.8, bottom: 0 }
});

const ma20 = chart.addLineSeries({ color: '#3b82f6', lineWidth: 1 });
const ma50 = chart.addLineSeries({ color: '#f59e0b', lineWidth: 1 });
const ema = chart.addLineSeries({ color: '#a855f7', lineWidth: 1 });

/* === RSI CHART === */
const rsiChart = LightweightCharts.createChart(document.getElementById('rsi'), {
  layout: { background: { color: '#0b0f14' }, textColor: '#9ca3af' },
  timeScale: { visible: false }
});
const rsiSeries = rsiChart.addLineSeries({ color: '#22d3ee' });

/* === INITIAL DATA === */
let time = Math.floor(Date.now() / 1000);
for (let i = 60; i > 0; i--) {
  candles.push({
    time: time - i * 60,
    open: price,
    high: price + 0.2,
    low: price - 0.2,
    close: price,
    volume: Math.random() * 1000
  });
}
candleSeries.setData(candles);

/* === INDICATORS === */
function calcMA(period) {
  return candles.slice(period).map((c, i) => {
    let sum = 0;
    for (let j = i; j < i + period; j++) sum += candles[j].close;
    return { time: c.time, value: sum / period };
  });
}

function calcEMA(period) {
  let k = 2 / (period + 1);
  let emaArr = [];
  let prev = candles[0].close;
  candles.forEach(c => {
    prev = c.close * k + prev * (1 - k);
    emaArr.push({ time: c.time, value: prev });
  });
  return emaArr;
}

function calcRSI(period = 14) {
  let rsis = [];
  for (let i = period; i < candles.length; i++) {
    let gains = 0, losses = 0;
    for (let j = i - period; j < i; j++) {
      let diff = candles[j + 1].close - candles[j].close;
      if (diff > 0) gains += diff;
      else losses -= diff;
    }
    let rs = gains / losses || 0;
    rsis.push({ time: candles[i].time, value: 100 - 100 / (1 + rs) });
  }
  return rsis;
}

function updateIndicators() {
  ma20.setData(calcMA(20));
  ma50.setData(calcMA(50));
  ema.setData(calcEMA(21));
  rsiSeries.setData(calcRSI());
}

/* === TICK === */
setInterval(() => {
  let delta = (Math.random() - 0.5) * 0.3;
  let next = price + delta;
  if (next < 100) next = 100.1;
  if (next > 120) next = 119.9;

  const candle = {
    time: Math.floor(Date.now() / 1000),
    open: price,
    close: next,
    high: Math.max(price, next) + Math.random() * 0.15,
    low: Math.min(price, next) - Math.random() * 0.15,
    volume: Math.random() * 1500
  };

  candles.push(candle);
  candleSeries.update(candle);
  volumeSeries.update({
    time: candle.time,
    value: candle.volume,
    color: candle.close >= candle.open ? '#22c55e' : '#ef4444'
  });

  price = next;
  priceEl.textContent = `$${price.toFixed(2)}`;
  priceEl.style.color = candle.close >= candle.open ? '#22c55e' : '#ef4444';

  updateIndicators();
}, speed * 1000);

/* === UI === */
function setSpeed(v) { speed = v; }

function toggleMA(p) {
  const s = p === 20 ? ma20 : ma50;
  s.applyOptions({ visible: !s.options().visible });
}

function toggleEMA() {
  ema.applyOptions({ visible: !ema.options().visible });
}

function toggleTheme() {
  isDark = !isDark;
  document.body.style.background = isDark ? '#0b0f14' : '#f3f4f6';
}

function toggleFullscreen() {
  !document.fullscreenElement
    ? document.documentElement.requestFullscreen()
    : document.exitFullscreen();
}
