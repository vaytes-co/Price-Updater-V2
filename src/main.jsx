import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { createRoot } from 'react-dom/client';
import { ArrowRight, Check, Clipboard, RotateCcw, Package, RefreshCw, TrendingUp, AlertCircle, MessageCircle } from 'lucide-react';
import { calculateNewProductPrices, calculateOldProduct } from './calculations.js';
import { createManagementReviewMessage } from './whatsapp.js';
import './styles.css';

const rupiah = (n, decimals = 0) => n == null || !Number.isFinite(n) ? '—' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: decimals, minimumFractionDigits: 0 }).format(n);
const numberText = n => n == null || !Number.isFinite(n) ? '—' : new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(n);
const parseNum = value => { const cleaned = String(value ?? '').replace(/[^\d]/g, ''); const n = Number(cleaned); return Number.isFinite(n) ? n : 0; };
const formatInput = value => { const digits = String(value ?? '').replace(/\D/g, ''); return digits ? new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(Number(digits)) : ''; };
const emptySamples = () => Array.from({ length: 3 }, () => ({ buy: '', sell: '' }));
function Field({ label, value, onChange, placeholder = 'Masukkan nominal', hint, error, prefix = 'Rp', id }) {
  return <div className="field"><label htmlFor={id}>{label}</label><div className={`input-wrap ${error ? 'has-error' : ''}`}><span className="prefix">{prefix}</span><input id={id} type="text" inputMode="decimal" autoComplete="off" value={value} onChange={e => onChange(formatInput(e.target.value))} placeholder={placeholder} aria-invalid={!!error}/></div>{hint && !error && <small className="hint">{hint}</small>}{error && <small className="error"><AlertCircle size={13}/>{error}</small>}</div>;
}
function App() {
  const [mode, setMode] = useState('lama');
  const reduceMotion = useReducedMotion();
  const [old, setOld] = useState({ newBuy: '', increase: '', oldSell: '' });
  const [newProduct, setNewProduct] = useState({ buy: '' });
  const [samplesByMode, setSamplesByMode] = useState({ lama: emptySamples(), baru: emptySamples() });
  const [copied, setCopied] = useState(false);
  const [productName, setProductName] = useState('');
  const [productBrand, setProductBrand] = useState('');
  const samples = samplesByMode[mode];
  const updateSample = (i, key, value) => setSamplesByMode(prev => ({ ...prev, [mode]: prev[mode].map((s, idx) => idx === i ? { ...s, [key]: value } : s) }));
  const sampleStats = samples.map(s => { const buy = parseNum(s.buy), sell = parseNum(s.sell), profit = buy > 0 && sell > 0 ? (sell - buy) / buy : null; return { buy, sell, profit, valid: buy > 0 && sell > 0 && Number.isFinite(profit) }; });
  const allSamplesValid = sampleStats.every(s => s.valid);
  const avgProfit = allSamplesValid ? sampleStats.reduce((sum, s) => sum + s.profit, 0) / 3 : null;
  const result = useMemo(() => {
    if (mode === 'lama') {
      const modalBaru = parseNum(old.newBuy), kenaikan = parseNum(old.increase), jualLama = parseNum(old.oldSell);
      if (!old.newBuy.trim() || modalBaru <= 0 || !old.increase.trim() || kenaikan < 0) return { status: 'incomplete', message: 'Isi harga modal baru dan jumlah kenaikan untuk memulai perhitungan.' };
      const modalLama = modalBaru - kenaikan;
      if (modalLama <= 0) return { status: 'invalid', message: 'Kenaikan harga harus lebih kecil dari harga modal baru.' };
      if (!old.oldSell.trim() || jualLama <= 0) return { status: 'incomplete', modalLama, message: 'Masukkan harga jual lama untuk menghitung profit produk.' };
      return calculateOldProduct({ modalBaru, kenaikan, jualLama });
    }
    const modal = parseNum(newProduct.buy);
    if (!newProduct.buy.trim() || modal <= 0) return { status: 'incomplete', message: 'Masukkan harga modal produk baru.' };
    if (!allSamplesValid || avgProfit == null) return { status: 'incomplete', message: 'Lengkapi harga modal dan harga jual ketiga produk sejenis.' };
    return calculateNewProductPrices(modal, sampleStats);
  }, [mode, old, newProduct, allSamplesValid, avgProfit, sampleStats]);
  const reset = () => { setOld({ newBuy: '', increase: '', oldSell: '' }); setNewProduct({ buy: '' }); setSamplesByMode({ lama: emptySamples(), baru: emptySamples() }); setProductName(''); setProductBrand(''); setCopied(false); };
  const copyPrice = async () => { if (result.status !== 'ready') return; try { await navigator.clipboard.writeText(String(result.price)); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { window.prompt('Salin nominal berikut:', String(result.price)); } };
  const isReady = result.status === 'ready';
  const requestManagementReview = event => {
    event.preventDefault();
    if (result.status !== 'warning' || !productName.trim() || !productBrand.trim()) return;
    const message = createManagementReviewMessage({
      productName: productName.trim(),
      productBrand: productBrand.trim(),
      modalLama: result.modalLama,
      modalBaru: parseNum(old.newBuy),
      kenaikan: result.kenaikan,
      jualLama: parseNum(old.oldSell),
      profit: result.profit,
    });
    window.open(`${result.whatsappUrl}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };
  return <div className="app-shell"><motion.main className="container page-enter" initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
    <header className="topbar"><a className="brand" href="#top" aria-label="Pasifik Teknik"><span className="brand-logo-wrap"><img className="brand-logo" src="/Logo-Vaytes.png" alt="Logo Pasifik Teknik" /></span><span className="brand-caption"><strong>PASIFIK TEKNIK</strong><small>PRICE UPDATER</small></span></a></header>
    <section className="hero" id="top"><div className="hero-copy"><span className="hero-eyebrow">PRICE UPDATER</span><h1>Hitung harga jual<br/><span>produk lama dan produk baru.</span></h1><p>Perbarui harga produk lama atau tentukan rekomendasi untuk produk baru.</p><a href="#calculator">Mulai hitung <ArrowRight size={15}/></a></div></section>
    <section className="usage-guide" aria-label="Cara menggunakan kalkulator"><span className="usage-title">Cara menggunakan</span><ol><li><span>1</span>Pilih jenis produk</li><li><span>2</span>Masukkan data harga</li><li><span>3</span>Lihat rekomendasi</li></ol></section>
    <section className="calculator-section" id="calculator"><div className="section-heading"><h1>Kalkulator harga</h1></div>
    <section className="mode-switch" aria-label="Pilih jenis produk"><button className={mode === 'lama' ? 'mode-option active' : 'mode-option'} aria-pressed={mode === 'lama'} onClick={() => { setMode('lama'); setCopied(false); }}><span className="mode-symbol"><RefreshCw size={18}/></span><span className="mode-copy"><strong>Produk Lama</strong><small>Perbarui harga yang sudah ada</small></span>{mode === 'lama' && <span className="mode-check"><Check size={15}/></span>}</button><button className={mode === 'baru' ? 'mode-option active' : 'mode-option'} aria-pressed={mode === 'baru'} onClick={() => { setMode('baru'); setCopied(false); }}><span className="mode-symbol"><Package size={19}/></span><span className="mode-copy"><strong>Produk Baru</strong><small>Estimasi dari produk sejenis</small></span>{mode === 'baru' && <span className="mode-check"><Check size={15}/></span>}</button></section>
    <AnimatePresence mode="wait" initial={false}><motion.div key={mode} className="workspace" initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -6 }} transition={{ duration: 0.24 }}><section className="panel input-panel"><div className="panel-heading"><div><h2>{mode === 'lama' ? 'Produk lama' : 'Produk baru'}</h2><p>{mode === 'lama' ? 'Masukkan modal baru, kenaikan, dan harga jual lama.' : 'Masukkan modal produk dan data tiga produk sejenis.'}</p></div></div>
      {mode === 'lama' ? <><div className="fields-grid"><Field id="newBuy" label="Harga Modal Baru" value={old.newBuy} onChange={v => setOld(p => ({ ...p, newBuy: v }))} placeholder="Contoh: 125000"/><Field id="increase" label="Jumlah Kenaikan Harga" value={old.increase} onChange={v => setOld(p => ({ ...p, increase: v }))} placeholder="Contoh: 5000" hint="Selisih dari modal lama ke modal baru."/></div>{result.modalLama != null && <div className="derived-value"><span><span className="derived-dot"/> Harga modal lama</span><strong>{rupiah(result.modalLama)}</strong></div>}<div className="field field-spaced"><Field id="oldSell" label="Harga Jual Lama" value={old.oldSell} onChange={v => setOld(p => ({ ...p, oldSell: v }))} placeholder="Contoh: 150000"/></div></> : <><Field id="newProductBuy" label="Harga Modal Produk Baru" value={newProduct.buy} onChange={v => setNewProduct({ buy: v })} placeholder="Masukkan harga modal produk baru"/><div className="samples-heading"><div><h3>Produk sejenis</h3><p>Isi harga modal dan harga jual untuk ketiga sampel.</p></div><span className="sample-count">03 SAMPEL</span></div><div className="samples-grid">{samples.map((sample, i) => <motion.div className="sample-card" key={i} initial={reduceMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduceMotion ? 0 : i * 0.08, duration: 0.35 }}><div className="sample-card-top"><span className="sample-number">0{i + 1}</span><strong>Produk sejenis {i + 1}</strong></div><Field id={`sample-${i}-buy`} label="Harga modal" value={sample.buy} onChange={v => updateSample(i, 'buy', v)} placeholder="Modal produk"/><Field id={`sample-${i}-sell`} label="Harga jual" value={sample.sell} onChange={v => updateSample(i, 'sell', v)} placeholder="Harga jual"/>{sampleStats[i].profit != null && <div className="sample-profit"><span>Basis profit</span><strong className={sampleStats[i].profit < 0 ? 'negative' : ''}>{numberText(sampleStats[i].profit * 100)}%</strong></div>}</motion.div>)}</div>{avgProfit != null && <div className="average-box"><div className="average-icon"><TrendingUp size={18}/></div><div><span>Rata-rata profit sampel</span><strong>{numberText(avgProfit * 100)}%</strong></div><span className="average-note">3 produk dihitung</span></div>}</>}
      <div className="panel-actions"><button className="btn-reset" onClick={reset}><RotateCcw size={16}/> Bersihkan data</button></div>
    </section>
    <aside className="result-column"><section className={`result-panel ${isReady ? 'result-ready' : ''}`}><div className="result-topline"><span className="result-icon"><TrendingUp size={19}/></span><span className="result-status">{isReady ? 'HASIL PERHITUNGAN' : result.status === 'warning' ? 'PERLU VERIFIKASI' : 'MENUNGGU INPUT'}</span></div><p className="result-label">{result.status === 'warning' ? 'Verifikasi perubahan harga' : mode === 'lama' ? 'Harga jual baru' : 'Rekomendasi harga median'}</p><AnimatePresence mode="wait"><motion.div key={isReady ? `${mode}-${result.price}` : `empty-${mode}`} className="result-price" initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduceMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>{isReady ? rupiah(result.price) : '—'}</motion.div></AnimatePresence><p className="result-message">{result.message || (isReady ? result.rule : 'Lengkapi data di sebelah kiri untuk melihat hasil kalkulasi.')}</p>{result.status === 'warning' && <form className="management-form" onSubmit={requestManagementReview}><div className="management-field"><label htmlFor="review-product-name">Nama produk</label><input id="review-product-name" name="productName" value={productName} onChange={event => setProductName(event.target.value)} autoComplete="off" required/></div><div className="management-field"><label htmlFor="review-product-brand">Merek produk</label><input id="review-product-brand" name="productBrand" value={productBrand} onChange={event => setProductBrand(event.target.value)} autoComplete="off" required/></div><button className="management-link" type="submit" disabled={!productName.trim() || !productBrand.trim()}><MessageCircle size={16}/>Kirim permintaan verifikasi</button></form>}<button className="btn-copy" disabled={!isReady} onClick={copyPrice}>{copied ? <motion.span className="success-check" initial={{ scale: 0, rotate: -35 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 480, damping: 15 }}><Check size={17}/></motion.span> : <Clipboard size={17}/>} {copied ? 'Nominal disalin!' : 'Salin nominal'}</button>{isReady && mode === 'lama' && <div className="result-tags"><span className={result.unchanged ? 'tag neutral' : 'tag positive'}>{result.unchanged ? 'Harga dipertahankan' : 'Harga diperbarui'}</span><span className="tag neutral">Profit {numberText(result.profit * 100)}%</span></div>}</section>
      {isReady && mode === 'baru' && <section className="price-range panel"><div className="range-heading"><div><div className="section-kicker">RENTANG HARGA</div><h3>Rekomendasi jual</h3></div><span className="range-badge">3 opsi</span></div><div className="range-row"><span>Minimum</span><strong>{rupiah(result.min)}</strong></div><div className="range-row median"><span><span className="median-dot"/> Median <small>Rekomendasi</small></span><strong>{rupiah(result.med)}</strong></div><div className="range-row"><span>Maksimum</span><strong>{rupiah(result.max)}</strong></div></section>}
    </aside></motion.div></AnimatePresence>
    </section>
  </motion.main></div>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
