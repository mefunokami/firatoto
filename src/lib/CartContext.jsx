import React, { createContext, useState } from 'react';

// Örnek başlangıç sepeti
const initialCart = [
  // {
  //   id: 1,
  //   name: 'SNR KB65517 | Renault Megane 2 Tüm Modeller Ön Amortisör Takoz Kiti',
  //   brand: 'SNR',
  //   price: 1355.36,
  //   quantity: 1,
  //   image: 'https://www.onlineyedekparca.com/image/cache/catalog/urunler/snrrenaultamortisor-800x800.jpg',
  // },
];

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(initialCart);

  // Sepete ürün ekle
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        // Eğer ürün zaten sepette varsa, quantity'yi topla
        const newQuantity = existing.quantity + (item.quantity || 1);
        return prev.map(i => i.id === item.id ? { ...i, quantity: newQuantity } : i);
      }
      // Eğer ürün sepette yoksa, quantity'yi kullan veya varsayılan 1
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  };

  // Sepetten ürün çıkar
  const removeFromCart = (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  // Sepeti tamamen temizle
  const clearCart = () => setCart([]);

  // Ürün adedini değiştir
  const updateQuantity = (id, quantity) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
}; 