import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import Select from 'react-select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import MediaLibrary from '@/components/MediaLibrary';
import { ImageIcon, Search, Wrench } from 'lucide-react';

const SABIT_MARKALAR = [
  { value: "BMW", label: "BMW" },
  { value: "MERCEDES-BENZ", label: "MERCEDES-BENZ" },
  { value: "VOLKSWAGEN", label: "VOLKSWAGEN" },
  { value: "AUDİ", label: "AUDİ" },
  { value: "SEAT", label: "SEAT" },
  { value: "SKODA", label: "SKODA" },
  { value: "PORSCHE", label: "PORSCHE" },
  { value: "MİNİ COOPER", label: "MİNİ COOPER" },
  { value: "TESLA", label: "TESLA" },
  { value: "PEUGEOT", label: "PEUGEOT" },
  { value: "CİTROEN", label: "CİTROEN" },
  { value: "FORD", label: "FORD" },
  { value: "OPEL", label: "OPEL" },
  { value: "CHEVROLET", label: "CHEVROLET" },
  { value: "GENEL MARKALAR", label: "GENEL MARKALAR" }
];

const ProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '', brand: '', model: '', year: '', price: '', stock: '', description: '', category: '', partNumber: '', imageUrl: '', imageUrl1: '', imageUrl2: '', trendyolUrl: '', is_weekly_deal: false, seoTitle: '', seoDescription: '', seoKeywords: '', product_condition: 'Sıfır'
  });
  const [categories, setCategories] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [productBrandOptions, setProductBrandOptions] = useState([]);
  const [mediaSelectorOpen, setMediaSelectorOpen] = useState(false);
  const [currentMediaField, setCurrentMediaField] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({ ...product, is_weekly_deal: product.is_weekly_deal == 1 || product.is_weekly_deal === "1" });
    } else {
      setFormData({
        name: '', brand: '', model: '', year: '', price: '', stock: '', description: '', category: '', partNumber: '', imageUrl: '', imageUrl1: '', imageUrl2: '', trendyolUrl: '', is_weekly_deal: false, seoTitle: '', seoDescription: '', seoKeywords: '', product_condition: 'Sıfır'
      });
    }
  }, [product]);

  useEffect(() => {
    if (formData.brand) {
      fetch(`/api/brand_models.php?brand=${encodeURIComponent(formData.brand)}`)
        .then(res => res.json())
        .then(data => setModelOptions(data.map(m => ({ value: m.model, label: m.model }))))
        .catch(() => setModelOptions([]));
    } else {
      setModelOptions([]);
    }
  }, [formData.brand]);

  useEffect(() => {
    fetch('/api/categories.php')
      .then(res => res.json())
      .then(data => setCategoryOptions(data.map(cat => ({ value: cat.name, label: cat.name }))));
  }, []);

  useEffect(() => {
    fetch('/api/productbrands.php')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProductBrandOptions(data.map(b => ({ value: b.name, label: b.name })));
        } else {
          setProductBrandOptions([]);
        }
      })
      .catch(() => setProductBrandOptions([]));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      console.log('Form submit edildi!');
      console.log('Form data:', formData); // Debug için eklendi
      if (!formData.name || !formData.brand || !formData.imageUrl) {
        toast({ title: "Hata!", description: "Lütfen zorunlu alanları doldurun (Ürün Adı, Marka ve Ana Fotoğraf).", variant: "destructive" });
        return;
      }
      if (/^\d+$/.test(formData.description.trim())) {
        toast({ title: "Hata!", description: "Açıklama alanı sadece rakamlardan oluşamaz. Lütfen detaylı bir açıklama girin.", variant: "destructive" });
        return;
      }
      let productData = {
        ...formData,
        description: typeof formData.description === 'string' ? formData.description : '',
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock) || 0,
        is_weekly_deal: formData.is_weekly_deal ? 1 : 0, // Boolean'ı 0/1'e çevir
        createdAt: product?.createdAt || new Date().toISOString()
      };
      console.log('Gönderilecek product data:', productData); // Debug için eklendi
      if (product && product.id) {
        productData.id = product.id;
      }
      onSave(productData);
      toast({ title: "Başarılı!", description: product ? "Ürün güncellendi." : "Ürün eklendi." });
      if (!product) {
          setFormData({ name: '', brand: '', model: '', year: '', price: '', stock: '', description: '', category: '', partNumber: '', imageUrl: '', imageUrl1: '', imageUrl2: '', trendyolUrl: '', is_weekly_deal: false });
      }
    } catch (err) {
      console.error('Form submit sırasında hata:', err);
      toast({ title: "Hata!", description: "Form gönderilirken bir hata oluştu.", variant: "destructive" });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData({ ...formData, [name]: newValue });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="bg-card shadow-lg border max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">{product ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}</CardTitle>
          <CardDescription>Yeni bir yedek parça eklemek veya mevcut bir ürünü düzenlemek için formu doldurun.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 md:gap-x-6 gap-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Ürün Adı *</label>
                <Input name="name" value={formData.name} onChange={handleChange} className="bg-background" placeholder="Örn: Ön Fren Balatası Seti" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Marka *</label>
                <Select
                  options={SABIT_MARKALAR}
                  value={SABIT_MARKALAR.find(opt => opt.value === formData.brand) || null}
                  onChange={opt => setFormData(f => ({ ...f, brand: opt ? opt.value : '' }))}
                  placeholder="Marka seçin"
                  isClearable
                  className="mb-4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Model</label>
                <Select
                  name="model"
                  options={modelOptions}
                  value={modelOptions.find(opt => opt.value === formData.model) || null}
                  onChange={opt => setFormData({ ...formData, model: opt ? opt.value : '' })}
                  placeholder={formData.brand ? "Model seçin" : "Önce marka seçin"}
                  isClearable
                  isDisabled={!formData.brand}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Yıl</label>
                <Input name="year" value={formData.year} onChange={handleChange} className="bg-background" placeholder="Örn: 2015-2020" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Fiyat (₺) <span className="text-xs text-gray-400">(opsiyonel)</span></label>
                <Input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} className="bg-background" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Stok Adedi</label>
                <Input name="stock" type="number" value={formData.stock} onChange={handleChange} className="bg-background" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Kategori</label>
                <Select
                  name="category"
                  options={categoryOptions}
                  value={categoryOptions.find(opt => opt.value === formData.category) || null}
                  onChange={opt => setFormData({ ...formData, category: opt ? opt.value : '' })}
                  placeholder="Kategori seçin"
                  isClearable
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Ürün Markası</label>
                <Select
                  options={productBrandOptions}
                  value={productBrandOptions.find(opt => opt.value === formData.product_brand) || null}
                  onChange={opt => setFormData(f => ({ ...f, product_brand: opt ? opt.value : '' }))}
                  placeholder="Ürün markası seçin"
                  isClearable
                  className="mb-4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Durum (Sıfır / Çıkma)</label>
                <Select
                  options={[
                    { value: 'Sıfır', label: 'Sıfır (Yeni)' },
                    { value: 'Çıkma', label: 'Çıkma (İkinci El)' }
                  ]}
                  value={[{ value: 'Sıfır', label: 'Sıfır (Yeni)' }, { value: 'Çıkma', label: 'Çıkma (İkinci El)' }].find(opt => opt.value === formData.product_condition) || { value: 'Sıfır', label: 'Sıfır (Yeni)' }}
                  onChange={opt => setFormData(f => ({ ...f, product_condition: opt ? opt.value : 'Sıfır' }))}
                  placeholder="Durum seçin"
                  className="mb-4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Parça Numarası</label>
                <Input name="partNumber" value={formData.partNumber} onChange={handleChange} className="bg-background" placeholder="Örn: 0 986 424 797" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-muted-foreground mb-1">Ürün Açıklaması</label>
                <Textarea name="description" value={formData.description} onChange={handleChange} className="bg-background min-h-[100px]" placeholder="Ürün uyumluluğu, özellikleri ve diğer detaylar..." />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-muted-foreground mb-1">Ana Ürün Fotoğrafı URL *</label>
                <div className="flex gap-2">
                  <Input name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="bg-background flex-1" placeholder="https://example.com/resim.jpg" required />
                  <Button type="button" variant="secondary" onClick={() => { setCurrentMediaField('imageUrl'); setMediaSelectorOpen(true); }}><ImageIcon className="w-4 h-4 mr-2" /> Seç</Button>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-muted-foreground mb-1">İkinci Ürün Fotoğrafı URL (Opsiyonel)</label>
                <div className="flex gap-2">
                  <Input name="imageUrl1" value={formData.imageUrl1} onChange={handleChange} className="bg-background flex-1" placeholder="https://example.com/resim1.jpg" />
                  <Button type="button" variant="secondary" onClick={() => { setCurrentMediaField('imageUrl1'); setMediaSelectorOpen(true); }}><ImageIcon className="w-4 h-4 mr-2" /> Seç</Button>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-muted-foreground mb-1">Üçüncü Ürün Fotoğrafı URL (Opsiyonel)</label>
                <div className="flex gap-2">
                  <Input name="imageUrl2" value={formData.imageUrl2} onChange={handleChange} className="bg-background flex-1" placeholder="https://example.com/resim2.jpg" />
                  <Button type="button" variant="secondary" onClick={() => { setCurrentMediaField('imageUrl2'); setMediaSelectorOpen(true); }}><ImageIcon className="w-4 h-4 mr-2" /> Seç</Button>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-muted-foreground mb-1">Trendyol Satın Alma Linki</label>
                <Input name="trendyolUrl" value={formData.trendyolUrl} onChange={handleChange} className="bg-background" placeholder="https://www.trendyol.com/..." />
              </div>
              <div className="md:col-span-2 flex items-center gap-3 pt-2 pb-4">
                <input
                  type="checkbox"
                  id="is_weekly_deal"
                  name="is_weekly_deal"
                  checked={formData.is_weekly_deal == 1 || formData.is_weekly_deal === "1" || formData.is_weekly_deal === true}
                  onChange={handleChange}
                  className="accent-yellow-500 w-5 h-5"
                />
                <label htmlFor="is_weekly_deal" className="text-sm font-medium text-yellow-700 select-none cursor-pointer">
                  Haftanın Fırsatı olarak işaretle
                </label>
              </div>

              {/* SEO Alanı */}
              <div className="md:col-span-2 pt-6 border-t border-gray-100 dark:border-border">
                <h3 className="text-lg font-bold text-gray-900 dark:text-foreground flex items-center gap-2 mb-4">
                  <Search className="w-5 h-5 text-blue-500" />
                  SEO Ayarları (Google)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Inputs */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-muted-foreground">SEO Başlığı (Meta Title)</label>
                        <span className={`text-xs ${(formData.seoTitle?.length || 0) > 60 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                          {formData.seoTitle?.length || 0}/60
                        </span>
                      </div>
                      <Input name="seoTitle" value={formData.seoTitle || ''} onChange={handleChange} className="bg-background" placeholder="Google'da görünecek başlık" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-muted-foreground">SEO Açıklaması (Meta Description)</label>
                        <span className={`text-xs ${(formData.seoDescription?.length || 0) > 160 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                          {formData.seoDescription?.length || 0}/160
                        </span>
                      </div>
                      <Textarea name="seoDescription" value={formData.seoDescription || ''} onChange={handleChange} className="bg-background min-h-[80px]" placeholder="Google'da başlığın altında görünecek açıklama metni" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Anahtar Kelimeler (Keywords)</label>
                      <Input name="seoKeywords" value={formData.seoKeywords || ''} onChange={handleChange} className="bg-background" placeholder="Örn: bmw f30, fren balatası, ucuz yedek parça" />
                    </div>
                  </div>

                  {/* Google Preview */}
                  <div className="bg-white dark:bg-card p-4 rounded-xl border border-gray-200 dark:border-border shadow-sm flex flex-col justify-center">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Google Önizlemesi</p>
                    <div className="font-sans">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 dark:border-border">
                          <Wrench className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-800 dark:text-gray-200">Fırat Oto Yedek Parça</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">https://www.firatotoyedekparca.com › urunler</span>
                        </div>
                      </div>
                      <h3 className="text-[20px] text-[#1a0dab] hover:underline cursor-pointer truncate max-w-full">
                        {formData.seoTitle || formData.name || 'Ürün Başlığı'}
                      </h3>
                      <p className="text-sm text-[#4d5156] mt-1 line-clamp-2">
                        {formData.seoDescription || formData.description?.substring(0, 150) || 'Ürün açıklaması burada görünecek. Google arama sonuçlarında müşterilerin ilgisini çekecek detayları buraya yazın.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            <div className="flex gap-4 pt-4">
              <Button type="submit" size="lg" className="flex-1 font-bold">{product ? 'Değişiklikleri Kaydet' : 'Ürünü Ekle'}</Button>
              {onCancel && (<Button type="button" variant="outline" size="lg" onClick={onCancel} className="flex-1">İptal</Button>)}
            </div>
          </form>
        </CardContent>
      </Card>
      
      <Dialog open={mediaSelectorOpen} onOpenChange={setMediaSelectorOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden">
          <MediaLibrary 
            isModal={true} 
            onClose={() => setMediaSelectorOpen(false)}
            onSelect={(url) => {
              setFormData({ ...formData, [currentMediaField]: url });
              setMediaSelectorOpen(false);
            }} 
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ProductForm;