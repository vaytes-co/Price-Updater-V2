import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { createRoot } from 'react-dom/client';
import { Check, Clipboard, RotateCcw, Package, RefreshCw, TrendingUp, AlertCircle, MessageCircle, X } from 'lucide-react';
import { calculateNewProductPrices, calculateOldProduct } from './calculations.js';
import { createManagementReviewMessage, createManagementWhatsAppUrl, createNewProductManagementReviewMessage } from './whatsapp.js';
import './app.css';

const rupiah = (n, decimals = 0) => n == null || !Number.isFinite(n) ? '—' : `Rp ${new Intl.NumberFormat('en-US', { maximumFractionDigits: decimals, minimumFractionDigits: 0 }).format(n)}`;
const numberText = n => n == null || !Number.isFinite(n) ? '—' : new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n);
const parseNum = value => { const cleaned = String(value ?? '').replace(/[^\d]/g, ''); const n = Number(cleaned); return Number.isFinite(n) ? n : 0; };
const formatInput = value => { const digits = String(value ?? '').replace(/\D/g, ''); return digits ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(digits)) : ''; };
const emptySamples = () => Array.from({ length: 3 }, () => ({ buy: '', sell: '' }));
function Field({ label, value, onChange, onBlur, placeholder = 'Masukkan nominal', hint, error, prefix = 'Rp', id }) {
  return <div className="field"><label htmlFor={id}>{label}</label><div className={`input-wrap ${error ? 'has-error' : ''}`}><span className="prefix">{prefix}</span><input id={id} type="text" inputMode="decimal" autoComplete="off" value={value} onChange={e => onChange(formatInput(e.target.value))} onBlur={onBlur} placeholder={placeholder} aria-invalid={!!error}/></div>{hint && !error && <small className="hint">{hint}</small>}{error && <small className="error"><AlertCircle size={13}/>{error}</small>}</div>;
}
function App() {
  const [mode, setMode] = useState('lama');
  const reduceMotion = useReducedMotion();
  const [old, setOld] = useState({ newBuy: '', increase: '', oldSell: '' });
  const [newProduct, setNewProduct] = useState({ buy: '' });
  const [samplesByMode, setSamplesByMode] = useState({ lama: emptySamples(), baru: emptySamples() });
  const [copiedPrice, setCopiedPrice] = useState(null);
  const [oldReviewInfo, setOldReviewInfo] = useState({ productName: '', productCode: '' });
  const [newReviewInfo, setNewReviewInfo] = useState({ productName: '' });
  const productName = oldReviewInfo.productName;
  const productCode = oldReviewInfo.productCode;
  const setProductName = value => setOldReviewInfo(current => ({ ...current, productName: value }));
  const setProductCode = value => setOldReviewInfo(current => ({ ...current, productCode: value }));
  const [proposedPriceType, setProposedPriceType] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const lastReportedError = useRef('');
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
      if (modalLama <= 0) return { status: 'invalid', message: 'Harga modal baru harus lebih besar daripada kenaikan harga agar modal lama tetap di atas Rp 0.' };
      if (!old.oldSell.trim() || jualLama <= 0) return { status: 'incomplete', modalLama, message: 'Masukkan harga jual lama untuk menghitung profit produk.' };
      return calculateOldProduct({ modalBaru, kenaikan, jualLama });
    }
    const modal = parseNum(newProduct.buy);
    if (!newProduct.buy.trim() || modal <= 0) return { status: 'incomplete', message: 'Masukkan harga modal produk baru.' };
    if (!allSamplesValid || avgProfit == null) return { status: 'incomplete', message: 'Lengkapi harga modal dan harga jual ketiga produk sejenis.' };
    return calculateNewProductPrices(modal, sampleStats);
  }, [mode, old, newProduct, allSamplesValid, avgProfit, sampleStats]);
  useEffect(() => {
    if (result.status !== 'invalid') {
      lastReportedError.current = '';
      setValidationMessage(current => current ? '' : current);
    }
  }, [result.status, result.message]);
  const showCalculationError = () => {
    const requiredFieldsComplete = mode === 'lama'
      ? old.newBuy.trim() && old.increase.trim() && old.oldSell.trim()
      : newProduct.buy.trim() && allSamplesValid;

    if (result.status === 'invalid' && requiredFieldsComplete && lastReportedError.current !== result.message) {
      lastReportedError.current = result.message;
      setValidationMessage(result.message);
    }
  };
  const reset = () => { setOld({ newBuy: '', increase: '', oldSell: '' }); setNewProduct({ buy: '' }); setSamplesByMode({ lama: emptySamples(), baru: emptySamples() }); setOldReviewInfo({ productName: '', productCode: '' }); setNewReviewInfo({ productName: '' }); setProposedPriceType(''); setCopiedPrice(null); };
  const copyPrice = async (value, key = 'main') => { try { await navigator.clipboard.writeText(String(value)); setCopiedPrice(key); setTimeout(() => setCopiedPrice(null), 1600); } catch { window.prompt('Salin nominal berikut:', String(value)); } };
  const isReady = result.status === 'ready';
  const isVerificationRequired = mode === 'lama' && result.status === 'warning';
  const isOldProductIdentityComplete = Boolean(oldReviewInfo.productName.trim() && oldReviewInfo.productCode.trim());
  const isNewProductIdentityComplete = Boolean(newReviewInfo.productName.trim());
  const isNewProductReadyToSubmit = isNewProductIdentityComplete && ['min', 'med', 'max'].includes(proposedPriceType);
  const createOldProductReviewMessage = () => createManagementReviewMessage({
    productName: oldReviewInfo.productName.trim(),
    productCode: oldReviewInfo.productCode.trim(),
    modalLama: result.modalLama,
    modalBaru: parseNum(old.newBuy),
    kenaikan: result.kenaikan,
    jualLama: parseNum(old.oldSell),
    hargaRekomendasi: result.price,
    verificationRequired: isVerificationRequired,
  });
  const createNewProductReviewMessage = () => createNewProductManagementReviewMessage({
    productName: newReviewInfo.productName.trim(),
    modalProdukBaru: result.modalProdukBaru,
    hargaMinimum: result.min,
    hargaMedian: result.med,
    hargaMaksimum: result.max,
    hargaDiajukan: result[proposedPriceType],
  });
  const requestManagementReview = event => {
    event.preventDefault();
    if (!isVerificationRequired || !isOldProductIdentityComplete) return;
    window.open(createManagementWhatsAppUrl(createOldProductReviewMessage()), '_blank', 'noopener,noreferrer');
  };
  const requestNewProductReview = event => {
    event.preventDefault();
    if (mode !== 'baru' || result.status !== 'ready' || !isNewProductReadyToSubmit) return;
    window.open(createManagementWhatsAppUrl(createNewProductReviewMessage()), '_blank', 'noopener,noreferrer');
  };
  return <div className="app-shell"><motion.main className="container page-enter" initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
    <header className="topbar" id="top"><a className="brand" href="#top" aria-label="Pasifik Teknik"><span className="brand-logo-wrap"><img className="brand-logo" src="/Logo-Vaytes.png" alt="Logo Pasifik Teknik" /></span><span className="brand-caption"><strong>PASIFIK TEKNIK</strong><small>PRICE UPDATER</small></span></a></header>
    <section className="calculator-section" id="calculator"><div className="section-heading"><h1>Kalkulator harga</h1></div>
    <section className="mode-switch" aria-label="Pilih jenis produk"><button className={mode === 'lama' ? 'mode-option active' : 'mode-option'} aria-pressed={mode === 'lama'} onClick={() => { setMode('lama'); setCopiedPrice(null); }}><span className="mode-symbol"><RefreshCw size={18}/></span><span className="mode-copy"><strong>Produk Lama</strong><small>Perbarui harga yang sudah ada</small></span>{mode === 'lama' && <span className="mode-check"><Check size={15}/></span>}</button><button className={mode === 'baru' ? 'mode-option active' : 'mode-option'} aria-pressed={mode === 'baru'} onClick={() => { setMode('baru'); setCopiedPrice(null); }}><span className="mode-symbol"><Package size={19}/></span><span className="mode-copy"><strong>Produk Baru</strong><small>Estimasi dari produk sejenis</small></span>{mode === 'baru' && <span className="mode-check"><Check size={15}/></span>}</button></section>
    {isVerificationRequired && <section className="management-alert" role="alert"><div className="management-alert-icon"><AlertCircle size={24}/></div><div className="management-alert-copy"><h2>Perlu persetujuan Manajemen</h2><p>Jangan tetapkan harga baru sebelum diverifikasi. Silakan hubungi Manajemen untuk mendapatkan persetujuan perubahan harga.</p></div></section>}
    <AnimatePresence mode="wait" initial={false}><motion.div key={mode} className="workspace" initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -6 }} transition={{ duration: 0.24 }}><section className="panel input-panel"><div className="panel-heading"><div><h2>{mode === 'lama' ? 'Produk lama' : 'Produk baru'}</h2><p>{mode === 'lama' ? 'Masukkan modal baru, kenaikan, dan harga jual lama.' : 'Masukkan modal produk dan data tiga produk sejenis.'}</p></div></div>
      {mode === 'lama' ? <><div className="fields-grid"><Field id="newBuy" label="Harga Modal Baru" value={old.newBuy} onChange={v => setOld(p => ({ ...p, newBuy: v }))} onBlur={showCalculationError} placeholder="Contoh: 125000"/><Field id="increase" label="Jumlah Kenaikan Harga" value={old.increase} onChange={v => setOld(p => ({ ...p, increase: v }))} onBlur={showCalculationError} placeholder="Contoh: 5000" hint="Selisih dari modal lama ke modal baru."/></div>{result.modalLama != null && <div className="derived-value"><span><span className="derived-dot"/> Harga modal lama</span><strong>{rupiah(result.modalLama)}</strong></div>}<div className="field field-spaced"><Field id="oldSell" label="Harga Jual Lama" value={old.oldSell} onChange={v => setOld(p => ({ ...p, oldSell: v }))} onBlur={showCalculationError} placeholder="Contoh: 150000"/></div></> : <><Field id="newProductBuy" label="Harga Modal Produk Baru" value={newProduct.buy} onChange={v => setNewProduct({ buy: v })} onBlur={showCalculationError} placeholder="Masukkan harga modal produk baru"/><div className="samples-heading"><div><h3>Produk sejenis</h3><p>Isi harga modal dan harga jual untuk ketiga sampel.</p></div><span className="sample-count">03 SAMPEL</span></div><div className="samples-grid">{samples.map((sample, i) => <motion.div className="sample-card" key={i} initial={reduceMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduceMotion ? 0 : i * 0.08, duration: 0.35 }}><div className="sample-card-top"><span className="sample-number">0{i + 1}</span><strong>Produk sejenis {i + 1}</strong></div><Field id={`sample-${i}-buy`} label="Harga modal" value={sample.buy} onChange={v => updateSample(i, 'buy', v)} onBlur={showCalculationError} placeholder="Modal produk"/><Field id={`sample-${i}-sell`} label="Harga jual" value={sample.sell} onChange={v => updateSample(i, 'sell', v)} onBlur={showCalculationError} placeholder="Harga jual"/>{sampleStats[i].profit != null && <div className="sample-profit"><span>Basis profit</span><strong className={sampleStats[i].profit < 0 ? 'negative' : ''}>{numberText(sampleStats[i].profit * 100)}%</strong></div>}</motion.div>)}</div>{avgProfit != null && <div className="average-box"><div className="average-icon"><TrendingUp size={18}/></div><div><span>Rata-rata profit sampel</span><strong>{numberText(avgProfit * 100)}%</strong></div><span className="average-note">3 produk dihitung</span></div>}</>}
      <div className="panel-actions"><button className="btn-reset" onClick={reset}><RotateCcw size={16}/> Bersihkan data</button></div>
    </section>
    <aside className={`result-column ${isReady && mode === 'baru' ? 'new-price-recommendations' : ''}`}>
      <section className={`result-panel ${isReady ? 'result-ready' : result.status === 'warning' ? 'result-warning' : ''}`}>
        <div className="result-topline"><span className="result-icon"><TrendingUp size={19}/></span><span className="result-status">{isReady ? 'HASIL PERHITUNGAN' : result.status === 'warning' ? 'PERLU VERIFIKASI' : 'MENUNGGU INPUT'}</span></div>
        <p className="result-label">{result.status === 'warning' ? 'Verifikasi perubahan harga' : mode === 'lama' ? 'Harga jual baru' : 'Rekomendasi harga median'}</p>
        {isVerificationRequired ? <div className="result-price">—</div> : <AnimatePresence mode="wait"><motion.div key={isReady ? `${mode}-${result.price}` : `empty-${mode}`} className="result-price" initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduceMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>{isReady ? rupiah(result.price) : '—'}</motion.div></AnimatePresence>}
        <p className={`result-message ${result.status === 'invalid' ? 'result-validation' : ''}`}>{result.status === 'warning' || result.status === 'invalid' ? result.message : isReady ? result.rule : 'Hasil akan muncul setelah data lengkap.'}</p>
        {isVerificationRequired && <form className="management-form" onSubmit={requestManagementReview}>
          <div className="management-field"><label htmlFor="review-product-name">Nama produk</label><input id="review-product-name" name="productName" value={productName} onChange={event => setProductName(event.target.value)} autoComplete="off" required/></div>
          <div className="management-field"><label htmlFor="review-product-code">Kode produk</label><input id="review-product-code" name="productCode" value={productCode} onChange={event => setProductCode(event.target.value)} autoComplete="off" required/></div>
          <div className="management-actions">
            <button className="management-link" type="submit" disabled={!isOldProductIdentityComplete}>
              <MessageCircle size={16}/>Kirim Pesan WhatsApp
            </button>
            {/* <button className="management-copy" type="button" disabled={!isOldProductIdentityComplete} onClick={() => copyPrice(createOldProductReviewMessage(), 'old-message')}>
              <Clipboard size={16}/>{copiedPrice === 'old-message' ? 'Pesan disalin' : 'Salin pesan'}
            </button> */}
          </div>
        </form>}
        {mode === 'lama' && <button className="btn-copy" disabled={!isReady || isVerificationRequired} onClick={() => copyPrice(result.price)}>{copiedPrice === 'main' ? <motion.span className="success-check" initial={{ scale: 0, rotate: -35 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 480, damping: 15 }}><Check size={17}/></motion.span> : <Clipboard size={17}/>} {copiedPrice === 'main' ? 'Nominal disalin!' : 'Salin nominal'}</button>}
        {isReady && mode === 'lama' && 
          <div className="result-tags">
            {/* <span className={result.unchanged ? 'tag neutral' : 'tag positive'}>{result.unchanged ? 'Harga dipertahankan' : 'Harga diperbarui'}</span> */}
            {/* <span className="tag neutral">Profit {numberText(result.profit * 100)}%</span> */}
          </div>}
      </section>
      {isReady && mode === 'baru' && <section className="price-range panel"><div className="range-heading"><div><div className="section-kicker">REKOMENDASI HARGA</div><h3>Tiga pilihan harga jual</h3></div></div><div className="range-row"><span>Minimum</span><strong>{rupiah(result.min)}</strong></div><div className="range-row median"><span>Median</span><strong>{rupiah(result.med)}</strong></div><div className="range-row"><span>Maksimum</span><strong>{rupiah(result.max)}</strong></div></section>}
      {isReady && mode === 'baru' && <section className="new-product-review panel">
        <div className="range-heading"><div><div className="section-kicker">PERSETUJUAN MANAJEMEN</div><h3>Ajukan harga produk</h3></div></div>
        <p className="review-description">Isi nama produk dan pilih harga yang diajukan melalui WhatsApp.</p>
        <form className="new-product-review-form" onSubmit={requestNewProductReview}>
          <div className="management-field"><label htmlFor="new-review-product-name">Nama produk</label><input id="new-review-product-name" value={newReviewInfo.productName} onChange={event => setNewReviewInfo(current => ({ ...current, productName: event.target.value }))} autoComplete="off" required/></div>
          <div className="management-field"><label htmlFor="new-review-proposed-price">Harga yang diajukan</label><select id="new-review-proposed-price" value={proposedPriceType} onChange={event => setProposedPriceType(event.target.value)} required><option value="" disabled>Pilih harga rekomendasi</option><option value="min">Minimum ({rupiah(result.min)})</option><option value="med">Median ({rupiah(result.med)})</option><option value="max">Maksimum ({rupiah(result.max)})</option></select></div>
          <div className="management-actions">
            <button className="management-link" type="submit" disabled={!isNewProductReadyToSubmit}>
              <MessageCircle size={17}/>Kirim Pesan WhatsApp
            </button>
            {/* <button className="management-copy" type="button" disabled={!isNewProductReadyToSubmit} onClick={() => copyPrice(createNewProductReviewMessage(), 'new-message')}>
              <Clipboard size={16}/>{copiedPrice === 'new-message' ? 'Pesan disalin' : 'Salin pesan'}
            </button> */}
          </div>
        </form>
      </section>}
    </aside></motion.div></AnimatePresence>
    </section>
    <section className="hero" id="how-to-use"><div className="hero-copy"><h1>Cara menggunakan Price Updater</h1><ol className="hero-steps"><li>Pilih produk lama atau produk baru.</li><li>Masukkan modal dan data harga yang diminta.</li><li>Lihat hasil perhitungan dan rekomendasi harga.</li></ol></div></section>
    <footer className="app-footer"><span>Pasifik Teknik <i/> Price Updater</span><span>Versi 2.1</span></footer>
    <AnimatePresence>
      {validationMessage && <motion.aside className="validation-toast" role="alert" aria-live="assertive" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}>
        <span className="validation-popup-icon"><AlertCircle size={21}/></span>
        <div className="validation-toast-copy"><strong>Periksa data perhitungan</strong><p>{validationMessage}</p></div>
        <button className="validation-close-icon" type="button" aria-label="Tutup pesan" onClick={() => setValidationMessage('')}><X size={19}/></button>
      </motion.aside>}
    </AnimatePresence>
  </motion.main></div>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
