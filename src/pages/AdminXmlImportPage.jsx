import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import {
  Upload, FileText, CheckCircle, XCircle, AlertCircle,
  Loader2, ChevronRight, Table2, FileSpreadsheet,
  Package, Plus, Settings, Wrench, ArrowLeft, Users, Download
} from 'lucide-react';

const COLUMN_MAP = {
  // Şablon sütun isimleri (birincil)
  'ürün adı': 'name', 'ürün adi': 'name', 'urun adi': 'name', 'urun adı': 'name',
  'marka': 'brand',
  'parça numarası': 'partNumber', 'parca numarasi': 'partNumber',
  'parça açıklaması': 'description', 'parca aciklamasi': 'description',
  'parça aciklamasi': 'description', 'parça açiklamasi': 'description',
  'resim url1': 'imageUrl', 'resim url 1': 'imageUrl',
  'resim url 2': 'imageUrl1', 'resim url2': 'imageUrl1',
  'resim url 3': 'imageUrl2', 'resim url3': 'imageUrl2',
  // Alternatif isimler
  'name': 'name', 'urun_adi': 'name', 'urunadi': 'name',
  'ad': 'name', 'baslik': 'name', 'başlık': 'name', 'title': 'name',
  'brand': 'brand',
  'model': 'model',
  'year': 'year', 'yil': 'year', 'yıl': 'year',
  'price': 'price', 'fiyat': 'price', 'satis_fiyati': 'price', 'satış fiyatı': 'price',
  'stock': 'stock', 'stok': 'stock', 'quantity': 'stock', 'miktar': 'stock', 'adet': 'stock',
  'description': 'description', 'aciklama': 'description', 'açıklama': 'description',
  'tanim': 'description', 'tanım': 'description',
  'category': 'category', 'kategori': 'category',
  'partnumber': 'partNumber', 'part_number': 'partNumber', 'parca_no': 'partNumber',
  'parça no': 'partNumber', 'parca no': 'partNumber', 'oem': 'partNumber', 'sku': 'partNumber', 'kod': 'partNumber',
  'imageurl': 'imageUrl', 'image_url': 'imageUrl', 'gorsel': 'imageUrl', 'görsel': 'imageUrl',
  'resim': 'imageUrl', 'foto': 'imageUrl', 'image': 'imageUrl', 'ana resim': 'imageUrl',
  'imageurl1': 'imageUrl1', 'image_url1': 'imageUrl1', 'gorsel2': 'imageUrl1', 'resim2': 'imageUrl1',
  'imageurl2': 'imageUrl2', 'image_url2': 'imageUrl2', 'gorsel3': 'imageUrl2', 'resim3': 'imageUrl2',
  'trendyolurl': 'trendyolUrl', 'trendyol_url': 'trendyolUrl', 'trendyol': 'trendyolUrl',
  'product_brand': 'product_brand', 'urun_markasi': 'product_brand', 'ürün markası': 'product_brand',
};

// Şablon Excel indirme fonksiyonu
function downloadTemplate() {
  const templateHeaders = ['ÜRÜN ADI', 'MARKA', 'PARÇA NUMARASI', 'PARÇA AÇIKLAMASI', 'RESİM URL1', 'RESİM URL 2', 'RESİM URL 3'];
  const sampleRow = {
    'ÜRÜN ADI': 'Örnek Ürün Adı',
    'MARKA': 'BMW',
    'PARÇA NUMARASI': '11427953129',
    'PARÇA AÇIKLAMASI': 'Yağ filtresi',
    'RESİM URL1': 'https://ornek.com/resim1.jpg',
    'RESİM URL 2': 'https://ornek.com/resim2.jpg',
    'RESİM URL 3': 'https://ornek.com/resim3.jpg',
  };
  const ws = XLSX.utils.json_to_sheet([sampleRow], { header: templateHeaders });
  // Sütun genişlikleri
  ws['!cols'] = templateHeaders.map(h => ({ wch: Math.max(h.length + 4, 20) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ürünler');
  XLSX.writeFile(wb, 'firatoto_urun_sablonu.xlsx');
}

function normalizeKey(key) {
  return key
    .replace(/İ/g, 'i').replace(/I/g, 'ı').replace(/Ğ/g, 'ğ').replace(/Ü/g, 'ü')
    .replace(/Ş/g, 'ş').replace(/Ö/g, 'ö').replace(/Ç/g, 'ç')
    .toLowerCase().trim().replace(/_/g, ' ');
}

function mapRow(row) {
  const mapped = {};
  for (const [key, val] of Object.entries(row)) {
    const nk = normalizeKey(key);
    const dbField = COLUMN_MAP[nk] || COLUMN_MAP[nk.replace(/\s+/g, '_')] || COLUMN_MAP[nk.replace(/\s+/g, '')];
    if (dbField) {
      mapped[dbField] = val !== undefined && val !== null ? String(val).trim() : '';
    }
  }
  return mapped;
}

function rowsToXml(rows) {
  const items = rows.map(row => {
    const fields = Object.entries(row)
      .map(([k, v]) => `    <${k}>${String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</${k}>`)
      .join('\n');
    return `  <product>\n${fields}\n  </product>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<products>\n${items.join('\n')}\n</products>`;
}

const STEPS = [
  { id: 1, label: 'Dosya Seç' },
  { id: 2, label: 'Önizleme' },
  { id: 3, label: 'İçe Aktarılıyor' },
  { id: 4, label: 'Tamamlandı' },
];

export default function AdminXmlImportPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [unmapped, setUnmapped] = useState([]);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [previewPage, setPreviewPage] = useState(1);
  const PAGE_SIZE = 50;
  const fileRef = useRef();

  const handleFile = async (f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv', 'xml'].includes(ext)) {
      setError('Desteklenen formatlar: .xlsx, .xls, .csv, .xml');
      return;
    }
    setError('');
    setFile(f);

    if (ext === 'xml') {
      setRows([{ name: '(XML dosyası)' }]);
      setHeaders(['XML dosyası doğrudan yüklenecek']);
      setUnmapped([]);
      setStep(2);
      return;
    }

    const data = await f.arrayBuffer();
    const wb = XLSX.read(data, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(ws, { defval: '' });

    if (json.length === 0) {
      setError('Dosyada veri bulunamadı. İlk sayfanın dolu olduğundan emin olun.');
      return;
    }

    const rawHeaders = Object.keys(json[0]);
    const mapped = json.map(mapRow);

    const noMatch = rawHeaders.filter(h => {
      const nk = normalizeKey(h);
      return !COLUMN_MAP[nk] && !COLUMN_MAP[nk.replace(/\s+/g, '_')] && !COLUMN_MAP[nk.replace(/\s+/g, '')];
    });

    setHeaders(rawHeaders);
    setUnmapped(noMatch);
    setRows(mapped);
    setPreviewPage(1);
    setStep(2);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleImport = async () => {
    setStep(3);
    setError('');
    setProgress(0);

    let xmlBlob;
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'xml') {
      xmlBlob = file;
    } else {
      const xml = rowsToXml(rows);
      xmlBlob = new Blob([xml], { type: 'application/xml' });
    }

    const formData = new FormData();
    formData.append('xml', xmlBlob, 'import.xml');

    let fileId, totalBatches, total;
    try {
      const res = await fetch('/api/xml-import.php?action=upload', {
        method: 'POST', body: formData, credentials: 'include',
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      fileId = data.fileId;
      totalBatches = data.batches;
      total = data.total;
    } catch (err) {
      setError('Yükleme hatası: ' + err.message);
      setStep(2);
      return;
    }

    let totalInserted = 0;
    let totalErrors = 0;
    for (let i = 0; i < totalBatches; i++) {
      try {
        const res = await fetch(`/api/xml-import.php?action=process&file=${fileId}&batch=${i}`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        totalInserted += data.inserted || 0;
        totalErrors += data.errors || 0;
        setProgress(data.percent || Math.round(((i + 1) / totalBatches) * 100));
        if (data.done) break;
      } catch (err) {
        setError('İşlem hatası: ' + err.message);
        setStep(2);
        return;
      }
    }

    setResult({ total, inserted: totalInserted, errors: totalErrors });
    setProgress(100);
    setStep(4);
  };

  const reset = () => {
    setStep(1); setFile(null); setRows([]); setHeaders([]);
    setUnmapped([]); setError(''); setProgress(0); setResult(null); setPreviewPage(1);
  };

  return (
    <div className="min-h-screen bg-secondary">
      {/* Admin Panel Ortak Header */}
      <header className="bg-neutral-900 shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between h-auto md:h-20 gap-4 md:gap-0 py-4 md:py-0">
            <div className="flex items-center gap-4 min-w-[320px]">
              <Link to="/" className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors text-sm md:text-base">
                <ArrowLeft className="h-5 w-5" />
                <span>Siteye Dön</span>
              </Link>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-400 rounded-md flex items-center justify-center ml-2 md:ml-4">
                <Wrench className="h-6 w-6 md:h-7 md:w-7 text-neutral-800" />
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-white leading-tight">Fırat Oto Yönetim</h1>
                <p className="text-xs md:text-sm text-gray-400 leading-tight">Yönetim Paneli</p>
              </div>
            </div>
            <nav className="flex gap-0 md:gap-0 w-full md:w-auto items-center border-t-0 pt-0 mt-0 overflow-x-visible justify-center">
              <button onClick={() => navigate('/admin')} className="px-4 py-2 font-semibold flex items-center gap-2 h-12 border-0 rounded-t-md transition-all duration-150 bg-neutral-800 text-white hover:bg-neutral-700">
                <Package className="h-4 w-4" />Ürün Listesi
              </button>
              <div className="h-8 w-px bg-gray-700 mx-1" />
              <button onClick={() => navigate('/admin')} className="px-4 py-2 font-semibold flex items-center gap-2 h-12 border-0 rounded-t-md transition-all duration-150 bg-neutral-800 text-white hover:bg-neutral-700">
                <Plus className="h-4 w-4" />Yeni Ürün Ekle
              </button>
              <div className="h-8 w-px bg-gray-700 mx-1" />
              <button className="px-4 py-2 font-semibold flex items-center gap-2 h-12 border-0 rounded-t-md transition-all duration-150 bg-yellow-400 text-black shadow">
                <FileSpreadsheet className="h-4 w-4" />Toplu İçe Aktar
              </button>
              <div className="h-8 w-px bg-gray-700 mx-1" />
              <button onClick={() => navigate('/admin/categories')} className="px-4 py-2 font-semibold flex items-center gap-2 h-12 border-0 rounded-t-md transition-all duration-150 bg-neutral-800 text-white hover:bg-neutral-700">
                <Settings className="h-4 w-4" />Kategoriler
              </button>
              <div className="h-8 w-px bg-gray-700 mx-1" />
              <button onClick={() => navigate('/admin/models')} className="px-4 py-2 font-semibold flex items-center gap-2 h-12 border-0 rounded-t-md transition-all duration-150 bg-neutral-800 text-white hover:bg-neutral-700">
                <Wrench className="h-4 w-4" />Model Ekle
              </button>
              <div className="h-8 w-px bg-gray-700 mx-1" />
              <button onClick={() => navigate('/admin/brands')} className="px-4 py-2 font-semibold flex items-center gap-2 h-12 border-0 rounded-t-md transition-all duration-150 bg-neutral-800 text-white hover:bg-neutral-700">
                <Plus className="h-4 w-4" />Markalar
              </button>
              <div className="h-8 w-px bg-gray-700 mx-1" />
              <button onClick={() => navigate('/admin/users')} className="px-4 py-2 font-semibold flex items-center gap-2 h-12 border-0 rounded-t-md transition-all duration-150 bg-neutral-800 text-white hover:bg-neutral-700">
                <Users className="h-4 w-4" />Kullanıcılar
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Ana İçerik */}
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto bg-card border shadow-sm rounded-xl p-6 md:p-8">
          
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">📦 Toplu Ürün İçe Aktarma</h1>
            <p className="text-muted-foreground text-sm">Excel, CSV veya XML dosyanızı doğrudan yükleyin.</p>
          </div>

          <div className="flex items-center gap-1.5 mb-8 flex-wrap">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  step === s.id ? 'bg-primary text-primary-foreground shadow-sm' :
                  step > s.id ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-muted text-muted-foreground border'
                }`}>
                  {step > s.id ? <CheckCircle size={12} /> : <span>{s.id}</span>}
                  {s.label}
                </div>
                {i < STEPS.length - 1 && <ChevronRight size={12} className="text-muted-foreground shrink-0" />}
              </React.Fragment>
            ))}
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 text-red-700">
                <XCircle className="shrink-0 mt-0.5" size={18} />
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {step === 1 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { icon: <FileSpreadsheet size={24} className="text-green-600" />, label: '.xlsx / .xls', desc: 'Excel dosyası' },
                  { icon: <Table2 size={24} className="text-blue-600" />, label: '.csv', desc: 'Virgülle ayrılmış' },
                  { icon: <FileText size={24} className="text-orange-600" />, label: '.xml', desc: 'XML formatı' },
                ].map(f => (
                  <div key={f.label} className="bg-muted/50 border rounded-xl p-4 text-center hover:bg-muted transition-colors">
                    <div className="flex justify-center mb-2">{f.icon}</div>
                    <p className="font-semibold text-sm text-foreground">{f.label}</p>
                    <p className="text-muted-foreground text-xs mt-1">{f.desc}</p>
                  </div>
                ))}
              </div>

              <div className="bg-muted/30 border rounded-xl p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <AlertCircle size={16} className="text-primary" /> Şablon Sütun İsimleri
                  </p>
                  <button
                    onClick={downloadTemplate}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors shadow-sm"
                  >
                    <Download size={14} />
                    Şablon İndir (.xlsx)
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border bg-background mb-3">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-primary/5">
                        {['ÜRÜN ADI', 'MARKA', 'PARÇA NUMARASI', 'PARÇA AÇIKLAMASI', 'RESİM URL1', 'RESİM URL 2', 'RESİM URL 3'].map(h => (
                          <th key={h} className="px-3 py-2.5 text-left font-bold text-primary whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="text-muted-foreground">
                        <td className="px-3 py-2 border-t">Örnek Ürün Adı</td>
                        <td className="px-3 py-2 border-t">BMW</td>
                        <td className="px-3 py-2 border-t">11427953129</td>
                        <td className="px-3 py-2 border-t">Yağ filtresi</td>
                        <td className="px-3 py-2 border-t text-blue-500">https://...</td>
                        <td className="px-3 py-2 border-t text-blue-500">https://...</td>
                        <td className="px-3 py-2 border-t text-blue-500">https://...</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    ['ÜRÜN ADI', 'name', true],
                    ['MARKA', 'brand', true],
                    ['PARÇA NUMARASI', 'partNumber', true],
                    ['PARÇA AÇIKLAMASI', 'description', false],
                    ['RESİM URL1', 'imageUrl (Ana)', true],
                    ['RESİM URL 2', 'imageUrl1', false],
                    ['RESİM URL 3', 'imageUrl2', false],
                  ].map(([header, field, required]) => (
                    <div key={header} className={`flex flex-col rounded-lg px-2.5 py-2 border ${required ? 'bg-primary/5 border-primary/20' : 'bg-background'}`}>
                      <div className="flex items-center gap-1">
                        <code className="text-primary font-mono font-bold text-[11px]">{header}</code>
                        {required && <span className="text-red-500 text-xs font-bold">*</span>}
                      </div>
                      <span className="text-muted-foreground text-[10px] mt-0.5">→ {field}</span>
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground text-xs mt-3">💡 Ek sütunlar: <code className="bg-muted px-1 rounded">MODEL</code>, <code className="bg-muted px-1 rounded">FİYAT</code>, <code className="bg-muted px-1 rounded">STOK</code>, <code className="bg-muted px-1 rounded">KATEGORİ</code> de desteklenir.</p>
              </div>

              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current.click()}
                className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-200 ${
                  dragOver ? 'border-primary bg-primary/5 scale-[1.01]' :
                  'border-muted-foreground/30 hover:border-primary hover:bg-muted/30'
                }`}
              >
                <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.xml" className="hidden"
                  onChange={e => handleFile(e.target.files[0])} />
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Upload className="text-muted-foreground" size={28} />
                </div>
                <p className="text-foreground font-semibold text-lg">Dosyayı buraya sürükleyin</p>
                <p className="text-muted-foreground text-sm mt-1">veya tıklayarak cihazınızdan seçin</p>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-muted/30 border rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4 border-b pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <FileSpreadsheet className="text-green-600" size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{file?.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {rows.length > 1 || file?.name.endsWith('.xml')
                          ? `${rows.length} ürün bulundu`
                          : 'XML dosyası hazır'}
                      </p>
                    </div>
                  </div>
                </div>

                {unmapped.length > 0 && (
                  <div className="mb-5 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="text-yellow-600 mt-0.5 shrink-0" size={18} />
                    <div>
                      <p className="text-sm font-semibold text-yellow-800 mb-1">Şu sütunlar tanınmadı ve atlanacak:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {unmapped.map(u => <code key={u} className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs border border-yellow-200">{u}</code>)}
                      </div>
                    </div>
                  </div>
                )}

                {rows.length > 0 && !file?.name.endsWith('.xml') && (() => {
                  const totalPages = Math.ceil(rows.length / PAGE_SIZE);
                  const pageRows = rows.slice((previewPage - 1) * PAGE_SIZE, previewPage * PAGE_SIZE);
                  return (
                    <div>
                      <div className="overflow-x-auto rounded-xl border bg-background">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-muted/50 text-muted-foreground">
                              <th className="px-4 py-3 text-left font-medium w-12">#</th>
                              {['name', 'brand', 'model', 'partNumber', 'price'].map(h => (
                                <th key={h} className="px-4 py-3 text-left font-medium capitalize">{h === 'price' ? 'Fiyat' : h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {pageRows.map((row, i) => (
                              <tr key={i} className="hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-3 text-muted-foreground font-medium">
                                  {(previewPage - 1) * PAGE_SIZE + i + 1}
                                </td>
                                {['name', 'brand', 'model', 'partNumber', 'price'].map(h => {
                                  let content = row[h];
                                  if (h === 'price') {
                                    if (!content || parseFloat(content) === 0) {
                                      content = <span className="text-orange-600 font-medium text-xs">Fiyatı Sorunuz.</span>;
                                    } else {
                                      content = `${content} ₺`;
                                    }
                                  } else {
                                    content = content || <span className="text-muted-foreground/40">—</span>;
                                  }

                                  return (
                                    <td key={h} className="px-4 py-3 text-foreground max-w-[180px] truncate">
                                      {content}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 px-1">
                          <p className="text-muted-foreground text-sm font-medium">
                            {rows.length} üründen {(previewPage - 1) * PAGE_SIZE + 1} – {Math.min(previewPage * PAGE_SIZE, rows.length)} arası
                          </p>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setPreviewPage(p => Math.max(1, p - 1))}
                              disabled={previewPage === 1}
                              className="px-3 py-2 rounded-lg border bg-background text-sm hover:bg-muted disabled:opacity-50 transition-colors"
                            >Geri</button>

                            <div className="flex gap-1 hidden sm:flex">
                              {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || Math.abs(p - previewPage) <= 1)
                                .reduce((acc, p, idx, arr) => {
                                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                                  acc.push(p);
                                  return acc;
                                }, [])
                                .map((p, idx) =>
                                  p === '...' ? (
                                    <span key={`e${idx}`} className="px-2 py-2 text-muted-foreground text-sm">…</span>
                                  ) : (
                                    <button
                                      key={p}
                                      onClick={() => setPreviewPage(p)}
                                      className={`w-9 py-2 rounded-lg text-sm font-medium transition-all ${
                                        previewPage === p
                                          ? 'bg-primary text-primary-foreground shadow-sm'
                                          : 'bg-background border hover:bg-muted text-foreground'
                                      }`}
                                    >{p}</button>
                                  )
                                )
                              }
                            </div>

                            <button
                              onClick={() => setPreviewPage(p => Math.min(totalPages, p + 1))}
                              disabled={previewPage === totalPages}
                              className="px-3 py-2 rounded-lg border bg-background text-sm hover:bg-muted disabled:opacity-50 transition-colors"
                            >İleri</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="flex gap-3">
                <button onClick={reset}
                  className="px-6 py-3 rounded-xl border bg-background text-foreground hover:bg-muted transition-all font-semibold shadow-sm">
                  İptal Et
                </button>
                <button onClick={handleImport}
                  className="flex-1 px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-bold transition-all shadow-sm flex items-center justify-center gap-2">
                  <Upload size={18} />
                  {rows.length > 0 ? `${rows.length} Ürünü Veritabanına Ekle` : 'İçe Aktarmayı Başlat'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-12">
              <div className="text-center">
                <Loader2 className="mx-auto mb-6 text-primary animate-spin" size={60} />
                <h2 className="text-2xl font-bold mb-2">Ürünler Yükleniyor</h2>
                <p className="text-muted-foreground mb-8">Bu işlem birkaç dakika sürebilir. Lütfen sayfayı kapatmayın.</p>
                
                <div className="max-w-md mx-auto">
                  <div className="w-full bg-muted rounded-full h-4 overflow-hidden mb-4 shadow-inner">
                    <motion.div
                      className="h-full bg-primary rounded-full relative overflow-hidden"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }} />
                    </motion.div>
                  </div>
                  <p className="text-primary font-black text-4xl">{progress}%</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && result && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="text-green-600" size={40} />
                </div>
                <h2 className="text-3xl font-bold mb-8 text-foreground">İşlem Tamamlandı!</h2>
                
                <div className="grid grid-cols-3 gap-4 mb-10 max-w-lg mx-auto">
                  <div className="bg-muted rounded-2xl p-5 border">
                    <p className="text-4xl font-black text-foreground mb-1">{result.total}</p>
                    <p className="text-muted-foreground font-medium text-sm">Okunan</p>
                  </div>
                  <div className="bg-green-50 border-green-200 border rounded-2xl p-5">
                    <p className="text-4xl font-black text-green-600 mb-1">{result.inserted}</p>
                    <p className="text-green-800 font-medium text-sm">Eklenen</p>
                  </div>
                  <div className={`rounded-2xl p-5 border ${result.errors > 0 ? 'bg-red-50 border-red-200' : 'bg-muted'}`}>
                    <p className={`text-4xl font-black mb-1 ${result.errors > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>{result.errors}</p>
                    <p className={`font-medium text-sm ${result.errors > 0 ? 'text-red-800' : 'text-muted-foreground'}`}>Hata</p>
                  </div>
                </div>
                
                <div className="flex gap-4 justify-center max-w-sm mx-auto">
                  <button onClick={reset}
                    className="flex-1 py-3.5 rounded-xl border-2 bg-background text-foreground hover:bg-muted font-bold transition-all">
                    Yeni Dosya
                  </button>
                  <button onClick={() => navigate('/admin')}
                    className="flex-1 py-3.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-bold transition-all shadow-md">
                    Panele Dön
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
}
