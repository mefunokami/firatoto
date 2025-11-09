import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SABIT_MARKALAR = [
  "OPEL", "CHEVROLET", "BMW", "MERCEDES-BENZ", "VOLKSWAGEN", "AUDİ", "TESLA", "SEAT", "SKODA", "PEUGEOT", "CİTROEN", "FORD",
  "GENEL MARKALAR"
];

const ModelManagementPage = () => {
  const [selectedBrand, setSelectedBrand] = useState('');
  const [models, setModels] = useState([]);
  const [newModel, setNewModel] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedBrand) {
      setLoading(true);
      fetch(`/api/brand_models.php?brand=${encodeURIComponent(selectedBrand)}`)
        .then(res => res.json())
        .then(data => setModels(data.map(m => ({ id: m.id, model: m.model, image_url: m.image_url }))))
        .catch(() => setModels([]))
        .finally(() => setLoading(false));
    } else {
      setModels([]);
    }
  }, [selectedBrand]);

  const handleAddModel = async (e) => {
    e.preventDefault();
    if (!selectedBrand || !newModel) {
      toast({ title: 'Hata', description: 'Marka ve model seçmelisiniz.', variant: 'destructive' });
      return;
    }
    setIsAdding(true);
    try {
      const res = await fetch('/api/brand_models.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand: selectedBrand, model: newModel, image_url: newImageUrl })
      });
      if (res.ok) {
        toast({ title: 'Model Eklendi', description: `${selectedBrand} markasına ${newModel} modeli eklendi.` });
        setNewModel('');
        setNewImageUrl('');
        // Yeniden yükle
        const data = await fetch(`/api/brand_models.php?brand=${encodeURIComponent(selectedBrand)}`).then(r => r.json());
        setModels(data.map(m => ({ id: m.id, model: m.model, image_url: m.image_url })));
      } else {
        const data = await res.json();
        toast({ title: 'Hata', description: data.error || 'Model eklenemedi.', variant: 'destructive' });
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteModel = async (id) => {
    if (!window.confirm('Bu modeli silmek istediğinizden emin misiniz?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/brand_models.php?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'Model Silindi' });
        setModels(models.filter(m => m.id !== id));
      } else {
        const data = await res.json();
        toast({ title: 'Hata', description: data.error || 'Model silinemedi.', variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary">
      <Helmet>
        <title>Model Yönetimi - Fırat Oto</title>
      </Helmet>
      <div className="container mx-auto py-8">
        <div className="mb-6 flex justify-start">
          <Button variant="outline" onClick={() => navigate('/admin')} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Yönetim Paneline Dön
          </Button>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="bg-card shadow-lg border max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground">Model Yönetimi</CardTitle>
              <CardDescription>Yeni bir model ekleyin veya mevcut modelleri yönetin.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-6 justify-center">
                {SABIT_MARKALAR.map(brand => (
                  <Button
                    key={brand}
                    variant={selectedBrand === brand ? 'default' : 'outline'}
                    className={selectedBrand === brand ? 'bg-primary text-white' : ''}
                    onClick={() => setSelectedBrand(brand)}
                  >
                    {brand}
                  </Button>
                ))}
              </div>
              {selectedBrand && (
                <>
                  <form onSubmit={handleAddModel} className="flex gap-2 mb-6 justify-center">
                    <Input
                      value={newModel}
                      onChange={e => setNewModel(e.target.value)}
                      placeholder="Yeni model adı"
                      disabled={isAdding}
                      className="w-64"
                    />
                    <Input
                      value={newImageUrl}
                      onChange={e => setNewImageUrl(e.target.value)}
                      placeholder="Resim URL'si (opsiyonel)"
                      disabled={isAdding}
                      className="w-64"
                      type="url"
                    />
                    <Button type="submit" size="icon" disabled={!newModel || isAdding}>
                      <Plus className="h-5 w-5" />
                    </Button>
                  </form>
                  <div className="space-y-2">
                    {loading ? (
                      <div className="text-center text-muted-foreground">Yükleniyor...</div>
                    ) : models.length > 0 ? (
                      models.map(m => (
                        <div key={m.id} className="flex justify-between items-center p-2 rounded-md bg-white shadow-sm">
                          <div className="flex items-center gap-2">
                            {m.image_url && (
                              <img src={m.image_url} alt={m.model} className="w-12 h-8 object-contain rounded border" style={{maxWidth:'48px',maxHeight:'32px'}} />
                            )}
                            <span className="font-medium text-foreground">{m.model}</span>
                          </div>
                          <Button variant="ghost" size="icon" className="text-destructive/70 hover:text-destructive" onClick={() => handleDeleteModel(m.id)}>
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground">Bu markaya ait model yok.</div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ModelManagementPage; 