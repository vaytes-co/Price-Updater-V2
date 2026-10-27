import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { createRoot } from 'react-dom/client';
import { Activity, ArrowRight, Check, CheckCircle2, Clipboard, RotateCcw, Package, RefreshCw, Sparkles, TrendingUp, AlertCircle, Calculator, Info } from 'lucide-react';
import './styles.css';

const rupiah = (n, decimals = 0) => n == null || !Number.isFinite(n) ? '—' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: decimals, minimumFractionDigits: 0 }).format(n);
const numberText = n => n == null || !Number.isFinite(n) ? '—' : new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(n);
const parseNum = value => { const cleaned = String(value ?? '').replace(/[^\d]/g, ''); const n = Number(cleaned); return Number.isFinite(n) ? n : 0; };
const formatInput = value => { const digits = String(value ?? '').replace(/\D/g, ''); return digits ? new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(Number(digits)) : ''; };
// Satuan pembulatan ditentukan oleh modal.baru sesuai flowchart, bukan nilai hasil jual.
const roundPrice = (value, modalBaru) => {
  const unit = modalBaru < 1000 ? 10 : modalBaru < 100000 ? 100 : 1000;
  // Pembulatan konvensional: tepat 0,5 dibulatkan ke atas.
  return Math.round(value / unit) * unit;
};
const emptySamples = () => Array.from({ length: 3 }, () => ({ buy: '', sell: '' }));
function Field({ label, value, onChange, placeholder = 'Masukkan nominal', hint, error, prefix = 'Rp', id }) {
  return <div className="field"><label htmlFor={id}>{label}</label><div className={`input-wrap ${error ? 'has-error' : ''}`}><span className="prefix">{prefix}</span><input id={id} type="text" inputMode="decimal" autoComplete="off" value={value} onChange={e => onChange(formatInput(e.target.value))} placeholder={placeholder} aria-invalid={!!error}/></div>{hint && !error && <small className="hint">{hint}</small>}{error && <small className="error"><AlertCircle size={13}/>{error}</small>}</div>;
}
function CardTitle({ icon: Icon, number, title, description }) { return <div className="card-title"><div className="step-icon">{Icon ? <Icon size={19}/> : number}</div><div><h2>{title}</h2><p>{description}</p></div></div>; }

function App() {
  const [mode, setMode] = useState('lama');
  const [loading, setLoading] = useState(true);
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const artY = useTransform(scrollY, [0, 500], [0, reduceMotion ? 0 : 85]);
  const artRotate = useTransform(scrollY, [0, 500], [0, reduceMotion ? 0 : -7]);
  useEffect(() => { const id = window.setTimeout(() => setLoading(false), 650); return () => window.clearTimeout(id); }, []);
  const [old, setOld] = useState({ newBuy: '', increase: '', oldSell: '' });
  const [newProduct, setNewProduct] = useState({ buy: '' });
  const [samplesByMode, setSamplesByMode] = useState({ lama: emptySamples(), baru: emptySamples() });
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const samples = samplesByMode[mode];
  const updateSample = (i, key, value) => setSamplesByMode(prev => ({ ...prev, [mode]: prev[mode].map((s, idx) => idx === i ? { ...s, [key]: value } : s) }));
  const sampleStats = samples.map((s, i) => { const buy = parseNum(s.buy), sell = parseNum(s.sell); return { buy, sell, profit: buy > 0 && sell > 0 ? (sell - buy) / buy : null, valid: buy > 0 && sell > 0 }; });
  const allSamplesValid = sampleStats.every(s => s.valid);
  const avgProfit = allSamplesValid ? sampleStats.reduce((sum, s) => sum + s.profit, 0) / 3 : null;
  const result = useMemo(() => {
    if (mode === 'lama') {
      const modalBaru = parseNum(old.newBuy), kenaikan = parseNum(old.increase), jualLama = parseNum(old.oldSell);
      if (!old.newBuy.trim() || modalBaru <= 0 || !old.increase.trim() || kenaikan < 0) return { status: 'incomplete', message: 'Isi harga modal baru dan jumlah kenaikan untuk memulai perhitungan.' };
      const modalLama = modalBaru - kenaikan;
      if (modalLama <= 0) return { status: 'invalid', message: 'Kenaikan harga harus lebih kecil dari harga modal baru.' };
      if (!old.oldSell.trim() || jualLama <= 0) return { status: 'incomplete', modalLama, message: 'Masukkan harga jual lama untuk menghitung profit produk.' };
      const profit = (jualLama - modalLama) / modalLama;
      const toleransi = 0.02 * modalLama;
      // Mengikuti keputusan pada flowchart: basis profit < 20% langsung dihitung ulang.
      if (profit < 0.20) {
        const raw = (1 + profit) * modalBaru;
        return { status: 'ready', price: roundPrice(raw, modalBaru), raw, modalLama, profit, toleransi, kenaikan, rule: '', formula: '', unchanged: false };
      }
      if (kenaikan > toleransi) {
        const raw = (1 + profit) * modalBaru;
        return { status: 'ready', price: roundPrice(raw, modalBaru), raw, modalLama, profit, toleransi, kenaikan, rule: '', formula: '', unchanged: false };
      }
      return { status: 'ready', price: jualLama, raw: jualLama, modalLama, profit, toleransi, kenaikan, rule: '', formula: '', unchanged: true };
    }
    const modal = parseNum(newProduct.buy);
    if (!newProduct.buy.trim() || modal <= 0) return { status: 'incomplete', message: 'Masukkan harga modal produk baru.' };
    if (!allSamplesValid || avgProfit == null) return { status: 'incomplete', message: 'Lengkapi harga modal dan harga jual ketiga produk sejenis.' };
    let min, med, max, rule, formula;
    if (avgProfit < 0.20) {
      // Cabang YES pada flowchart: avg profit < 20%.
      med = (1 + avgProfit) * modal;
      min = med * 0.98;
      max = med * 1.02;
      rule = '';
      formula = 'Median = (1 + rata-rata profit) × modal; minimum = median × 0,98; maksimum = median × 1,02';
    } else {
      // Cabang NO pada flowchart: avg profit 20% atau lebih.
      min = modal * 1.2;
      max = (1 + avgProfit) * modal;
      med = (min + max) / 2;
      rule = '';
      formula = 'Minimum = modal × 1,2; maksimum = (1 + rata-rata profit) × modal; median = (minimum + maksimum) / 2';
    }
    return { status: 'ready', price: roundPrice(med, modal), modal, avgProfit, min: roundPrice(min, modal), med: roundPrice(med, modal), max: roundPrice(max, modal), rule, formula, samples: sampleStats };
  }, [mode, old, newProduct, allSamplesValid, avgProfit, sampleStats]);
  const reset = () => { setOld({ newBuy: '', increase: '', oldSell: '' }); setNewProduct({ buy: '' }); setSamplesByMode({ lama: emptySamples(), baru: emptySamples() }); setCopied(false); };
  const copyPrice = async () => { if (result.status !== 'ready') return; try { await navigator.clipboard.writeText(String(result.price)); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { window.prompt('Salin nominal berikut:', String(result.price)); } };
  const isReady = result.status === 'ready';
  if (loading) return <div className="app-shell loading-shell"><main className="container skeleton-container"><div className="skeleton-topbar shimmer"/><div className="skeleton-title shimmer"/><div className="skeleton-subtitle shimmer"/><div className="skeleton-modes"><div className="skeleton-card shimmer"/><div className="skeleton-card shimmer"/></div><div className="skeleton-workspace"><div className="skeleton-panel shimmer"/><div className="skeleton-panel result-skeleton shimmer"/></div></main></div>;
  return <div className="app-shell"><div className="ambient ambient-one"/><div className="ambient ambient-two"/><motion.main className="container page-enter" initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>
    <section className="blue-stage">
    <header className="topbar"><a className="brand" href="#top" aria-label="Pasifik Teknik"><span className="brand-logo-wrap"><img className="brand-logo" src="/Logo-Vaytes.png" alt="Logo Pasifik Teknik" /></span><span className="brand-divider"/><span className="brand-caption"><strong>PASIFIK TEKNIK</strong><small>PRICE UPDATER</small></span></a></header>
    <section className="hero compact-hero" id="top"><div className="hero-copy"><div className="eyebrow"><Sparkles size={14}/> PRICE UPDATER / PASIFIK TEKNIK</div><h1>Hitung harga.<br/><span className="headline-sticker">Produk<span className="hero-period">.</span></span></h1><p className="hero-subline"></p><div className="hero-bottomline"><span className="hero-index">01 / 02</span><span className="hero-rule"/><span className="hero-caption">PILIH MODE UNTUK MEMULAI <ArrowRight size={14}/></span></div></div><div className="hero-mark" aria-hidden="true"><span className="hash-mark">#</span><span className="hero-mark-text">PRICE<br/>UPDATE</span><span className="hero-mark-arrow">↗</span></div></section>
    <section className="mode-switch" aria-label="Pilih jenis produk"><button className={mode === 'lama' ? 'mode-option active' : 'mode-option'} onClick={() => { setMode('lama'); setCopied(false); }}><span className="mode-symbol"><RefreshCw size={19}/></span><span className="mode-copy"><strong>Produk Lama</strong><small>Perbarui harga yang sudah ada</small></span>{mode === 'lama' && <span className="mode-check"><Check size={16}/></span>}</button><button className={mode === 'baru' ? 'mode-option active' : 'mode-option'} onClick={() => { setMode('baru'); setCopied(false); }}><span className="mode-symbol yellow"><Package size={20}/></span><span className="mode-copy"><strong>Produk Baru</strong><small>Estimasi harga dari produk sejenis</small></span>{mode === 'baru' && <span className="mode-check"><Check size={16}/></span>}</button></section>
    </section>
    <AnimatePresence mode="wait" initial={false}><motion.div key={mode} className="workspace overlap-workspace" initial={reduceMotion ? false : { opacity: 0, y: 22, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduceMotion ? undefined : { opacity: 0, y: -10, scale: 0.99 }} transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}><section className="panel input-panel"><div className="panel-heading"><div><div className="section-kicker">LANGKAH 01</div><h2>{mode === 'lama' ? 'Data produk lama' : 'Data produk baru'}</h2><p>{mode === 'lama' ? 'Masukkan perubahan modal dan harga jual sebelumnya.' : 'Gunakan tiga produk sejenis sebagai acuan profit.'}</p></div><span className="heading-icon"><Calculator size={20}/></span></div>
      {mode === 'lama' ? <><div className="fields-grid"><Field id="newBuy" label="Harga Modal Baru" value={old.newBuy} onChange={v => setOld(p => ({ ...p, newBuy: v }))} placeholder="Contoh: 125000"/><Field id="increase" label="Jumlah Kenaikan Harga" value={old.increase} onChange={v => setOld(p => ({ ...p, increase: v }))} placeholder="Contoh: 5000" hint="Selisih dari modal lama ke modal baru."/></div>{result.modalLama != null && <div className="derived-value"><span><span className="derived-dot"/> Harga modal lama</span><strong>{rupiah(result.modalLama)}</strong></div>}<div className="field field-spaced"><Field id="oldSell" label="Harga Jual Lama" value={old.oldSell} onChange={v => setOld(p => ({ ...p, oldSell: v }))} placeholder="Contoh: 150000"/></div></> : <><Field id="newProductBuy" label="Harga Modal Produk Baru" value={newProduct.buy} onChange={v => setNewProduct({ buy: v })} placeholder="Masukkan harga modal produk baru"/><div className="samples-heading"><div><h3>Produk sejenis</h3><p>Isi harga modal dan harga jual untuk ketiga sampel.</p></div><span className="sample-count">03 SAMPEL</span></div><div className="samples-grid">{samples.map((sample, i) => <motion.div className="sample-card" key={i} initial={reduceMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduceMotion ? 0 : i * 0.08, duration: 0.35 }}><div className="sample-card-top"><span className="sample-number">0{i + 1}</span><strong>Produk sejenis {i + 1}</strong></div><Field id={`sample-${i}-buy`} label="Harga modal" value={sample.buy} onChange={v => updateSample(i, 'buy', v)} placeholder="Modal produk"/><Field id={`sample-${i}-sell`} label="Harga jual" value={sample.sell} onChange={v => updateSample(i, 'sell', v)} placeholder="Harga jual"/>{sampleStats[i].profit != null && <div className="sample-profit"><span>Basis profit</span><strong className={sampleStats[i].profit < 0 ? 'negative' : ''}>{numberText(sampleStats[i].profit * 100)}%</strong></div>}</motion.div>)}</div>{avgProfit != null && <div className="average-box"><div className="average-icon"><TrendingUp size={18}/></div><div><span>Rata-rata profit sampel</span><strong>{numberText(avgProfit * 100)}%</strong></div><span className="average-note">3 produk dihitung</span></div>}</>}
      <div className="panel-actions"><button className="btn-reset" onClick={reset}><RotateCcw size={16}/> Bersihkan data</button></div>
    </section>
    <aside className="result-column"><section className={`result-panel ${isReady ? 'result-ready' : ''}`}><div className="result-topline"><span className="result-icon"><TrendingUp size={19}/></span><span className="result-status">{isReady ? 'HASIL PERHITUNGAN' : 'MENUNGGU INPUT'}</span></div><p className="result-label">{mode === 'lama' ? 'Harga jual baru' : 'Rekomendasi harga median'}</p><AnimatePresence mode="wait"><motion.div key={isReady ? `${mode}-${result.price}` : `empty-${mode}`} className="result-price" initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduceMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>{isReady ? rupiah(result.price) : '—'}</motion.div></AnimatePresence><p className="result-message">{result.message || (isReady ? result.rule : 'Lengkapi data di sebelah kiri untuk melihat hasil kalkulasi.')}</p><button className="btn-copy" disabled={!isReady} onClick={copyPrice}>{copied ? <motion.span className="success-check" initial={{ scale: 0, rotate: -35 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 480, damping: 15 }}><Check size={17}/></motion.span> : <Clipboard size={17}/>} {copied ? 'Nominal disalin!' : 'Salin nominal'}</button>{isReady && mode === 'lama' && <div className="result-tags"><span className={result.unchanged ? 'tag neutral' : 'tag positive'}>{result.unchanged ? 'Harga dipertahankan' : 'Harga diperbarui'}</span><span className="tag neutral">Profit {numberText(result.profit * 100)}%</span></div>}</section>
      {isReady && mode === 'baru' && <section className="price-range panel"><div className="range-heading"><div><div className="section-kicker">RENTANG HARGA</div><h3>Rekomendasi jual</h3></div><span className="range-badge">3 opsi</span></div><div className="range-row"><span>Minimum</span><strong>{rupiah(result.min)}</strong></div><div className="range-row median"><span><span className="median-dot"/> Median <small>Rekomendasi</small></span><strong>{rupiah(result.med)}</strong></div><div className="range-row"><span>Maksimum</span><strong>{rupiah(result.max)}</strong></div></section>}
      {/* <section className="explain-panel panel"><button className="explain-toggle" onClick={() => setShowDetails(v => !v)}><span className="explain-icon"><Info size={17}/></span><span><strong>Detail perhitungan</strong><small>Transparansi rumus kalkulasi</small></span><span className={`chevron ${showDetails ? 'open' : ''}`}><ArrowRight size={16}/></span></button>{showDetails && <div className="explain-content">{isReady ? <><p>{result.rule}</p><div className="formula-box"><span>RUMUS YANG DIGUNAKAN</span><code>{result.formula}</code></div>{mode === 'lama' && <div className="detail-list"><div><span>Modal lama</span><strong>{rupiah(result.modalLama)}</strong></div><div><span>Profit dasar</span><strong>{numberText(result.profit * 100)}%</strong></div><div><span>Toleransi 2%</span><strong>{rupiah(result.toleransi)}</strong></div><div><span>Kenaikan modal</span><strong>{rupiah(result.kenaikan)}</strong></div></div>}{mode === 'baru' && <div className="detail-list"><div><span>Rata-rata profit</span><strong>{numberText(result.avgProfit * 100)}%</strong></div><div><span>Harga modal</span><strong>{rupiah(result.modal)}</strong></div></div>}</> : <p>Rumus dan rincian hasil akan tampil setelah seluruh data yang diperlukan terisi dengan benar.</p>}</div>}</section> */}
    </aside></motion.div></AnimatePresence>
    <footer className="footer"><div className="footer-brand"><span className="footer-mark"><img src="/Logo-Vaytes.png" alt="" /></span><strong>Pasifik Teknik</strong></div><span>Price Updater <i/> Vaytes.co </span></footer>
  </motion.main></div>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
