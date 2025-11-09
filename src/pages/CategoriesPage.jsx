import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft, Car, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [newBrand, setNewBrand] = useState('');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [newModel, setNewModel] = useState('');

  const saveCategories = (updatedCategories) => {
    setCategories(updatedCategories);
  };

  const handleAddBrand = (e) => {
    e.preventDefault();
    if (newBrand && !categories.some(cat => cat.brand.toLowerCase() === newBrand.toLowerCase())) {
      const updated = [...categories, { brand: newBrand, models: [] }];
      saveCategories(updated);
      setNewBrand('');
      toast({ title: 'Marka Eklendi', description: `"${newBrand}" markası başarıyla eklendi.` });
    } else {
      toast({ title: 'Hata', description: 'Bu marka zaten mevcut veya geçersiz.', variant: 'destructive' });
    }
  };

  const handleDeleteBrand = (brandToDelete) => {
    if (window.confirm(`"${brandToDelete}" markasını silmek istediğinizden emin misiniz? Bu markaya ait tüm modeller de silinecektir.`)) {
      const updated = categories.filter(cat => cat.brand !== brandToDelete);
      saveCategories(updated);
      setSelectedBrand(null);
      toast({ title: 'Marka Silindi' });
    }
  };

  const handleAddModel = (e) => {
    e.preventDefault();
    if (newModel && selectedBrand) {
      const updated = categories.map(cat => {
        if (cat.brand === selectedBrand.brand) {
          if (cat.models.some(m => m.toLowerCase() === newModel.toLowerCase())) {
            toast({ title: 'Hata', description: 'Bu model zaten mevcut.', variant: 'destructive' });
            return cat;
          }
          return { ...cat, models: [...cat.models, newModel].sort() };
        }
        return cat;
      });
      saveCategories(updated);
      setSelectedBrand(updated.find(cat => cat.brand === selectedBrand.brand));
      setNewModel('');
      toast({ title: 'Model Eklendi' });
    }
  };

  const handleDeleteModel = (modelToDelete) => {
    if (window.confirm(`"${modelToDelete}" modelini silmek istediğinizden emin misiniz?`)) {
      const updated = categories.map(cat => {
        if (cat.brand === selectedBrand.brand) {
          return { ...cat, models: cat.models.filter(m => m !== modelToDelete) };
        }
        return cat;
      });
      saveCategories(updated);
      setSelectedBrand(updated.find(cat => cat.brand === selectedBrand.brand));
      toast({ title: 'Model Silindi' });
    }
  };

  return (
    <>
      <Helmet>
        <title>Marka Yönetimi - Fırat Oto</title>
      </Helmet>
      <div className="min-h-screen bg-secondary">
        <header className="bg-neutral-800 shadow-lg sticky top-0 z-40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center gap-4">
                <Link to="/admin" className="flex items-center gap-2 text-white hover:text-primary transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                  <span>Panele Dön</span>
                </Link>
                <div className="w-12 h-12 bg-primary rounded-md flex items-center justify-center ml-4">
                  <Car className="h-7 w-7 text-neutral-800" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Marka Yönetimi</h1>
                  <p className="text-sm text-gray-400">Marka ve model ekleyip silin</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Markalar</CardTitle>
                  <CardDescription>Yeni marka ekleyin veya mevcutları yönetin.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddBrand} className="flex gap-2 mb-4">
                    <Input
                      value={newBrand}
                      onChange={(e) => setNewBrand(e.target.value)}
                      placeholder="Yeni Marka Adı"
                    />
                    <Button type="submit" size="icon"><Plus className="h-4 w-4" /></Button>
                  </form>
                  <div className="space-y-2">
                    {categories.sort((a, b) => a.brand.localeCompare(b.brand)).map(cat => (
                      <div key={cat.brand} onClick={() => setSelectedBrand(cat)} className={`flex justify-between items-center p-2 rounded-md cursor-pointer ${selectedBrand?.brand === cat.brand ? 'bg-primary/20' : 'hover:bg-secondary'}`}>
                        <span className="font-medium">{cat.brand}</span>
                        <Button variant="ghost" size="icon" className="text-destructive/70 hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteBrand(cat.brand); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Modeller</CardTitle>
                  <CardDescription>{selectedBrand ? `"${selectedBrand.brand}" markası için modeller.` : 'Modelleri görmek için bir marka seçin.'}</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedBrand ? (
                    <>
                      <form onSubmit={handleAddModel} className="flex gap-2 mb-4">
                        <Input
                          value={newModel}
                          onChange={(e) => setNewModel(e.target.value)}
                          placeholder="Yeni Model Adı"
                        />
                        <Button type="submit" size="icon"><Plus className="h-4 w-4" /></Button>
                      </form>
                      <div className="space-y-2">
                        {selectedBrand.models.map(model => (
                          <div key={model} className="flex justify-between items-center p-2 rounded-md hover:bg-secondary">
                            <span className="font-medium">{model}</span>
                            <Button variant="ghost" size="icon" className="text-destructive/70 hover:text-destructive" onClick={() => handleDeleteModel(model)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        {selectedBrand.models.length === 0 && <p className="text-muted-foreground text-center py-4">Bu markaya ait model bulunmuyor.</p>}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-16">
                      <Car className="mx-auto h-16 w-16 text-muted-foreground" />
                      <p className="mt-4 text-muted-foreground">Lütfen soldaki listeden bir marka seçin.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default CategoriesPage;