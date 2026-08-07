import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Image as ImageIcon, Copy, Trash2, Check, X, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

export default function MediaLibrary({ onSelect, isModal = false, onClose }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedUrl, setCopiedUrl] = useState('');
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media.php');
      const data = await res.json();
      if (Array.isArray(data)) {
        setFiles(data);
      }
    } catch (err) {
      toast({ title: 'Hata', description: 'Medyalar yüklenemedi.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleUpload = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    
    // Yükleme sırasında geçici yükleme durumu gösterebiliriz ama şimdilik sırayla yükleyeceğiz
    let uploadedCount = 0;
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file.type.startsWith('image/')) {
        toast({ title: 'Hata', description: `${file.name} geçerli bir resim değil.`, variant: 'destructive' });
        continue;
      }
      
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const res = await fetch('/api/media.php', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        
        if (data.success) {
          uploadedCount++;
          // Yeni resmi listeye ekle
          setFiles(prev => [{
            name: data.name,
            url: data.url,
            size: file.size,
            date: Date.now() / 1000
          }, ...prev]);
        } else {
          toast({ title: 'Hata', description: data.error || `${file.name} yüklenemedi.`, variant: 'destructive' });
        }
      } catch (err) {
        toast({ title: 'Hata', description: 'Bağlantı hatası.', variant: 'destructive' });
      }
    }
    
    setUploading(false);
    if (uploadedCount > 0) {
      toast({ title: 'Başarılı', description: `${uploadedCount} resim başarıyla yüklendi.` });
    }
  };

  const handleDelete = async (fileName, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Bu resmi silmek istediğinize emin misiniz?')) return;
    
    try {
      const res = await fetch('/api/media.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fileName })
      });
      const data = await res.json();
      if (data.success) {
        setFiles(prev => prev.filter(f => f.name !== fileName));
        toast({ title: 'Silindi', description: 'Resim başarıyla silindi.' });
      } else {
        toast({ title: 'Hata', description: data.error || 'Silinemedi.', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Hata', description: 'Bağlantı hatası.', variant: 'destructive' });
    }
  };

  const copyToClipboard = (url, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast({ title: 'Kopyalandı', description: 'Resim linki panoya kopyalandı.' });
    setTimeout(() => setCopiedUrl(''), 2000);
  };

  // Drag and Drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files);
    }
  };
  
  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-card ${isModal ? '' : 'rounded-xl shadow-sm border border-gray-100 dark:border-border p-6'}`}>
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-yellow-500" />
            Medya Kütüphanesi
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Ürün fotoğraflarınızı tek bir yerden yönetin.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input 
              placeholder="Dosya ara..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-gray-50 dark:bg-background border-gray-200 dark:border-border"
            />
          </div>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={(e) => handleUpload(e.target.files)}
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-yellow-500 hover:bg-yellow-600 text-black whitespace-nowrap"
          >
            {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
            Yeni Yükle
          </Button>
          {isModal && (
            <Button variant="outline" onClick={onClose} size="icon">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Drag & Drop Zone (Only show if empty or actively dragging) */}
      {(files.length === 0 || dragActive) && !loading && (
        <div 
          className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl transition-colors ${
            dragActive ? 'border-yellow-500 bg-yellow-50/50' : 'border-gray-200 dark:border-border bg-gray-50 dark:bg-background'
          } ${files.length > 0 ? 'absolute inset-0 z-50 bg-white/90 m-6' : 'mb-6'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <UploadCloud className={`w-16 h-16 mb-4 ${dragActive ? 'text-yellow-500' : 'text-gray-400'}`} />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Resimleri Buraya Sürükleyin</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center max-w-sm">
            veya cihazınızdan seçmek için <strong>Yeni Yükle</strong> butonunu kullanın. Jpg, png, webp formatları desteklenir.
          </p>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
        </div>
      ) : (
        <div 
          className="flex-1 overflow-y-auto pr-2"
          onDragEnter={handleDrag}
        >
          {filteredFiles.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              <AnimatePresence>
                {filteredFiles.map((file) => (
                  <motion.div
                    key={file.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 dark:border-border cursor-pointer"
                    onClick={() => {
                      if (isModal && onSelect) onSelect(file.url);
                    }}
                  >
                    <img 
                      src={file.url} 
                      alt={file.name} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="h-7 w-7 bg-white/90 hover:bg-white dark:bg-card text-gray-700 dark:text-gray-300"
                          title="URL'yi Kopyala"
                          onClick={(e) => copyToClipboard(file.url, e)}
                        >
                          {copiedUrl === file.url ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="h-7 w-7 bg-red-500/90 hover:bg-red-600"
                          title="Sil"
                          onClick={(e) => handleDelete(file.name, e)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      
                      <div className="text-white">
                        <p className="text-xs truncate font-medium" title={file.name}>{file.name}</p>
                        <p className="text-[10px] text-gray-300">{(file.size / 1024).toFixed(0)} KB</p>
                      </div>
                    </div>

                    {isModal && (
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none flex items-center justify-center bg-black/20 transition-opacity">
                         <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">Seç</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            !dragActive && files.length > 0 && (
              <div className="flex flex-col items-center justify-center p-12 text-gray-500 dark:text-gray-400">
                <Search className="w-12 h-12 mb-3 text-gray-300" />
                <p>"{searchTerm}" ile eşleşen resim bulunamadı.</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
