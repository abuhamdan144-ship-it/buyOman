/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  FolderPlus, 
  ShieldAlert, 
  Sparkles, 
  RefreshCw, 
  Layers, 
  Truck, 
  MapPin, 
  DollarSign, 
  Tag, 
  Store,
  Upload,
  Image
} from 'lucide-react';
import { Product, Order } from '../types.ts';
import { OMAN_GOVERNORATES } from '../data.ts';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdateProducts: (updated: Product[]) => void;
  orders: Order[];
  onUpdateOrders: (updated: Order[]) => void;
  onAdvanceOrderStatus: (orderId: string) => void;
  onTriggerToast: (msg: string) => void;
}

export default function AdminDashboard({
  isOpen,
  onClose,
  products,
  onUpdateProducts,
  orders,
  onUpdateOrders,
  onAdvanceOrderStatus,
  onTriggerToast,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'inventory' | 'orders'>('analytics');

  // Inventory forms state
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New product input state
  const [newProdName, setNewProdName] = useState('');
  const [newProdBrand, setNewProdBrand] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<'mobile' | 'laptop' | 'tv' | 'appliance' | 'accessory'>('mobile');
  const [newProdEmoji, setNewProdEmoji] = useState('📦');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdOldPrice, setNewProdOldPrice] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdSpecs, setNewProdSpecs] = useState('');
  const [newProdBadge, setNewProdBadge] = useState<'new' | 'sale' | 'hot' | 'best' | ''>('');

  // High quality image upload state representation
  const [newProdImage, setNewProdImage] = useState<string>(''); // Base64 Data URL string
  const [isDragging, setIsDragging] = useState(false);

  // File Upload Handlers (Supports both click and drag & drop for listing high quality images)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processUploadedFile(file, isEdit);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent, isEdit: boolean) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processUploadedFile(file, isEdit);
  };

  const processUploadedFile = (file: File, isEdit: boolean) => {
    if (!file.type.startsWith('image/')) {
      onTriggerToast("❌ Only image files (.jpg, .png, .webp, etc.) are allowed.");
      return;
    }
    // Limit to 4MB to prevent excessive memory burden in local storage
    if (file.size > 4 * 1024 * 1024) {
      onTriggerToast("⚠️ Image size exceeds 4MB. Please compress or choose a lighter high-resolution image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      if (isEdit && editingProduct) {
        setEditingProduct({ ...editingProduct, image: base64Data });
        onTriggerToast("📷 Specifications image updated.");
      } else {
        setNewProdImage(base64Data);
        onTriggerToast("📷 High quality product design uploaded.");
      }
    };
    reader.onerror = () => {
      onTriggerToast("❌ Could not process uploaded image file.");
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  // Analytics helper calculations
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const averageOrderVal = orders.length > 0 ? totalRevenue / orders.length : 0;
  
  // Governorate distribution dictionary
  const governorateStats: Record<string, number> = {};
  orders.forEach(o => {
    const gov = o.billingInfo.governorate;
    governorateStats[gov] = (governorateStats[gov] || 0) + 1;
  });

  // Handle inventory additions
  const handleAddNewProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdBrand || !newProdPrice) {
      onTriggerToast("❌ Product name, brand and price are required files.");
      return;
    }

    const priceNum = parseFloat(newProdPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      onTriggerToast("❌ Please enter a valid number price.");
      return;
    }

    const newProd: Product = {
      id: Date.now(),
      name: newProdName,
      brand: newProdBrand,
      category: newProdCategory,
      emoji: newProdEmoji || '📦',
      price: priceNum,
      oldPrice: newProdOldPrice ? parseFloat(newProdOldPrice) : undefined,
      rating: 5.0,
      reviews: 1,
      description: newProdDesc || `${newProdBrand} flagship device tailored with premium specifications.`,
      specs: newProdSpecs ? newProdSpecs.split(',').map(s => s.trim()) : ["Premium Build", "Custom Operations"],
      badge: newProdBadge ? newProdBadge as any : undefined,
      image: newProdImage || undefined
    };

    onUpdateProducts([newProd, ...products]);
    onTriggerToast(`🎉 ${newProd.name} successfully appended to e-commerce catalog!`);
    
    // Reset forms
    setIsAddingProduct(false);
    resetProductForm();
  };

  // Reset product form helper
  const resetProductForm = () => {
    setNewProdName('');
    setNewProdBrand('');
    setNewProdCategory('mobile');
    setNewProdEmoji('📦');
    setNewProdPrice('');
    setNewProdOldPrice('');
    setNewProdDesc('');
    setNewProdSpecs('');
    setNewProdBadge('');
    setNewProdImage('');
    setIsDragging(false);
  };

  // Handle product deletes
  const handleDeleteProduct = (prodId: number) => {
    const target = products.find(p => p.id === prodId);
    if (!target) return;
    if (window.confirm(`Are you absolutely sure you want to stop carrying ${target.name}?`)) {
      onUpdateProducts(products.filter(p => p.id !== prodId));
      onTriggerToast(`🗑️ ${target.name} removed from inventory.`);
    }
  };

  // Handle product editing saves
  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    onUpdateProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
    setEditingProduct(null);
    onTriggerToast(`✏️ Updated specs for ${editingProduct.name}.`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      <div className="absolute inset-0 overflow-hidden">
        {/* Dark blur backdrop */}
        <div 
          className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        ></div>

        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className="pointer-events-auto w-screen max-w-4xl animate-slide-left">
            <div className="flex h-full flex-col bg-neutral-900 text-white shadow-2xl border-l border-neutral-800">
              
              {/* Header section with admin look */}
              <div className="px-6 py-5 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center animate-spin-slow">
                      <Settings className="w-5 h-5 text-sky-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-black tracking-tight text-white">BuyOman Central Dashboard</h2>
                        <span className="text-[9px] bg-red-600 text-white font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-widest animate-pulse">
                          Live Sandbox Mode
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 font-medium leading-none mt-1">
                        Control inventory status, sales logs, and package logistics pathways
                      </p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-850 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="px-6 bg-neutral-950/40 border-b border-neutral-800 flex items-center justify-start gap-4 text-xs font-bold uppercase tracking-wider">
                <button
                  onClick={() => { setActiveTab('analytics'); setIsAddingProduct(false); setEditingProduct(null); }}
                  className={`py-4 px-2 border-b-2 transition-all ${
                    activeTab === 'analytics' 
                      ? 'border-sky-500 text-sky-400' 
                      : 'border-transparent text-neutral-400 hover:text-white'
                  }`}
                >
                  📈 Sales Analytics ({orders.length})
                </button>
                <button
                  onClick={() => { setActiveTab('inventory'); setIsAddingProduct(false); setEditingProduct(null); }}
                  className={`py-4 px-2 border-b-2 transition-all ${
                    activeTab === 'inventory' 
                      ? 'border-sky-500 text-sky-400' 
                      : 'border-transparent text-neutral-400 hover:text-white'
                  }`}
                >
                  🧊 Inventory Controls ({products.length})
                </button>
                <button
                  onClick={() => { setActiveTab('orders'); setIsAddingProduct(false); setEditingProduct(null); }}
                  className={`py-4 px-2 border-b-2 transition-all ${
                    activeTab === 'orders' 
                      ? 'border-sky-500 text-sky-400' 
                      : 'border-transparent text-neutral-400 hover:text-white'
                  }`}
                >
                  🚚 Customer Logistics ({orders.length} orders)
                </button>
              </div>

              {/* Dashboard Panels Scrollable content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none bg-neutral-900/60">
                
                {/* 1. SALES ANALYTICS TAB */}
                {activeTab === 'analytics' && (
                  <div className="space-y-6 animate-zoom-in">
                    
                    {/* Top Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800/80">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Cumulative Sales Turnover</span>
                          <TrendingUp className="w-4.5 h-4.5 text-emerald-400" />
                        </div>
                        <p className="text-2xl font-black text-white">OMR {totalRevenue.toFixed(3)}</p>
                        <span className="text-[10px] text-neutral-500 font-bold block mt-1.5">Free delivery trigger active</span>
                      </div>

                      <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800/80">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Order Conversion Log</span>
                          <ShoppingBag className="w-4.5 h-4.5 text-sky-400" />
                        </div>
                        <p className="text-2xl font-black text-white">{orders.length} Sales</p>
                        <span className="text-[10px] text-neutral-500 font-bold block mt-1.5">Omnichannel simulator connected</span>
                      </div>

                      <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800/80">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider font-mono">Avg Basket Volume</span>
                          <DollarSign className="w-4.5 h-4.5 text-purple-400" />
                        </div>
                        <p className="text-2xl font-black text-white">OMR {averageOrderVal.toFixed(3)}</p>
                        <span className="text-[10px] text-neutral-500 font-bold block mt-1.5">Omani Governorates target logs</span>
                      </div>

                    </div>

                    {/* Oman Governorate logistics map distribution */}
                    <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800">
                      <h3 className="text-xs uppercase tracking-wider font-extrabold text-neutral-400 mb-4 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-sky-500" />
                        Destination Governorate Distribution
                      </h3>
                      {orders.length === 0 ? (
                        <p className="text-neutral-500 text-xs py-4 text-center">Place mock packages to inspect geography logistics dispersion values in Muscat or Salalah.</p>
                      ) : (
                        <div className="space-y-3.5">
                          {OMAN_GOVERNORATES.map((gov) => {
                            const count = governorateStats[gov] || 0;
                            const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                            return (
                              <div key={gov} className="space-y-1.5 text-xs font-semibold">
                                <div className="flex justify-between">
                                  <span className="text-neutral-300">{gov}</span>
                                  <span className="text-sky-400">{count} {count === 1 ? 'dispatch' : 'dispatches'} ({Math.round(percentage)}%)</span>
                                </div>
                                <div className="h-1.5 bg-neutral-800/80 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-sky-500 rounded-full transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Sales Activity records stream layout */}
                    <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800">
                      <h3 className="text-xs uppercase tracking-wider font-extrabold text-neutral-400 mb-4">Live Sandbox Activity Feed</h3>
                      {orders.length === 0 ? (
                        <div className="text-center py-6 text-neutral-500 text-xs">
                          No past order checkout logs compiled in this session.
                        </div>
                      ) : (
                        <div className="divide-y divide-neutral-800">
                          {orders.map((o, idx) => (
                            <div key={idx} className="py-3 flex justify-between items-center text-xs font-medium">
                              <div>
                                <span className="font-extrabold text-sky-400">{o.id}</span>
                                <span className="text-neutral-400 font-normal ml-2">Shipment dispatched to {o.billingInfo.fullName}</span>
                              </div>
                              <span className="text-white font-extrabold font-mono">OMR {o.total.toFixed(3)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* 2. INVENTORY CONTROL TAB */}
                {activeTab === 'inventory' && (
                  <div className="space-y-6 animate-zoom-in">
                    
                    {/* Add New Product Trigger Button Bar */}
                    <div className="flex justify-between items-center gap-4">
                      <div>
                        <h3 className="text-sm font-extrabold text-sky-400">Manage Store E-commerce Catalog</h3>
                        <p className="text-[11px] text-neutral-500">Edit, delete or append premium smartphones or smart home appliances.</p>
                      </div>
                      <button
                        onClick={() => { setIsAddingProduct(!isAddingProduct); setEditingProduct(null); }}
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition active:scale-95 shrink-0"
                      >
                        {isAddingProduct ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        <span>{isAddingProduct ? 'Cancel Form' : 'Add Custom Product'}</span>
                      </button>
                    </div>

                    {/* Create Product Form Overlay inline */}
                    {isAddingProduct && (
                      <form onSubmit={handleAddNewProductSubmit} className="bg-neutral-950/90 rounded-2xl p-6 border border-sky-500/20 space-y-4 animate-zoom-in text-xs font-semibold text-neutral-300">
                        <div className="border-b border-neutral-800 pb-3 mb-2 flex justify-between items-center">
                          <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                            <FolderPlus className="w-4.5 h-4.5 text-sky-400" />
                            Draft New Stock Product
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block mb-1 text-neutral-400">Product Name *</label>
                            <input
                              type="text"
                              value={newProdName}
                              onChange={e => setNewProdName(e.target.value)}
                              placeholder="e.g. Asus ROG Monitor 32 inch"
                              className="w-full bg-neutral-900 border border-neutral-850 rounded-lg p-2.5 focus:outline-none focus:border-sky-500 text-white font-medium"
                              required
                            />
                          </div>
                          <div>
                            <label className="block mb-1 text-neutral-400">Global Brand *</label>
                            <input
                              type="text"
                              value={newProdBrand}
                              onChange={e => setNewProdBrand(e.target.value)}
                              placeholder="e.g. Apple, Samsung, ASUS"
                              className="w-full bg-neutral-900 border border-neutral-850 rounded-lg p-2.5 focus:outline-none focus:border-sky-500 text-white font-medium"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                          <div>
                            <label className="block mb-1 text-neutral-400">Store Category *</label>
                            <select
                              value={newProdCategory}
                              onChange={e => setNewProdCategory(e.target.value as any)}
                              className="w-full bg-neutral-900 border border-neutral-850 rounded-lg p-2.5 focus:outline-none text-white font-bold"
                            >
                              <option value="mobile">Smartphones</option>
                              <option value="laptop">Laptops</option>
                              <option value="tv">Televisions</option>
                              <option value="appliance">Smart Appliances</option>
                              <option value="accessory">Accessories</option>
                            </select>
                          </div>
                          <div>
                            <label className="block mb-1 text-neutral-400">Emoji Visual *</label>
                            <select
                              value={newProdEmoji}
                              onChange={e => setNewProdEmoji(e.target.value)}
                              className="w-full bg-neutral-900 border border-neutral-850 rounded-lg p-2.5 focus:outline-none text-white font-bold"
                            >
                              <option value="📱">📱 Phone</option>
                              <option value="💻">💻 Laptop</option>
                              <option value="📺">📺 Television</option>
                              <option value="❄️">❄️ AC Unit</option>
                              <option value="🧺">🧺 Washer</option>
                              <option value="🎧">🎧 Audio</option>
                              <option value="🧊">🧊 Refrigerator</option>
                              <option value="🍳">🍳 range OMR</option>
                              <option value="🧹">🧹 Vacuum</option>
                              <option value="🤖">🤖 Robot Cleaner</option>
                              <option value="⌚">⌚ Watch</option>
                            </select>
                          </div>
                          <div>
                            <label className="block mb-1 text-neutral-400">Store Price (OMR) *</label>
                            <input
                              type="number"
                              step="0.001"
                              value={newProdPrice}
                              onChange={e => setNewProdPrice(e.target.value)}
                              placeholder="e.g. 159.00"
                              className="w-full bg-neutral-900 border border-neutral-850 rounded-lg p-2.5 focus:outline-none focus:border-sky-500 text-white font-mono"
                              required
                            />
                          </div>
                          <div>
                            <label className="block mb-1 text-neutral-400">Compare Price (OMR)</label>
                            <input
                              type="number"
                              step="0.001"
                              value={newProdOldPrice}
                              onChange={e => setNewProdOldPrice(e.target.value)}
                              placeholder="e.g. 199.00"
                              className="w-full bg-neutral-900 border border-neutral-850 rounded-lg p-2.5 focus:outline-none focus:border-sky-500 text-white font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block mb-1 text-neutral-400">Specs Highlights (Comma separated list)</label>
                          <input
                            type="text"
                            value={newProdSpecs}
                            onChange={e => setNewProdSpecs(e.target.value)}
                            placeholder="e.g. 4K Ultra OLED, 120Hz refresh, Dolby Smart"
                            className="w-full bg-neutral-900 border border-neutral-850 rounded-lg p-2.5 focus:outline-none focus:border-sky-500 text-white font-medium"
                          />
                        </div>

                        <div>
                          <label className="block mb-1 text-neutral-400">Product Campaign Badge</label>
                          <select
                            value={newProdBadge}
                            onChange={e => setNewProdBadge(e.target.value as any)}
                            className="w-full bg-neutral-900 border border-neutral-850 rounded-lg p-2.5 focus:outline-none text-white font-bold"
                          >
                            <option value="">No Special Badge</option>
                            <option value="new">NEW RELEASE</option>
                            <option value="sale">MEGA SALE</option>
                            <option value="hot">HOT SELLING</option>
                            <option value="best">BEST VALUE</option>
                          </select>
                        </div>

                        {/* High Quality Image Upload Drag & Drop Area */}
                        <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800/80 space-y-2">
                          <label className="block text-xs font-bold text-neutral-300 uppercase tracking-widest flex items-center gap-1.5">
                            <Image className="w-4 h-4 text-sky-400" />
                            <span>High-Resolution Product Picture</span>
                            <span className="text-[9px] bg-sky-500/15 text-sky-400 px-1.5 py-0.5 rounded uppercase font-extrabold tracking-wider">High Quality Optional</span>
                          </label>
                          <p className="text-[10px] text-neutral-400 leading-tight">
                            Enhance your store item card by dropping a pristine photograph. This will override the standard category emoji visual automatically.
                          </p>

                          <div 
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, false)}
                            className={`relative h-28 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition px-4 py-3 text-center cursor-pointer ${
                              isDragging 
                                ? 'border-sky-500 bg-sky-500/10 text-sky-400' 
                                : newProdImage 
                                  ? 'border-emerald-500/55 bg-emerald-500/5' 
                                  : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/40 text-neutral-400'
                            }`}
                          >
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, false)}
                              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                            />
                            
                            {newProdImage ? (
                              <div className="flex items-center gap-4 w-full h-full justify-center relative z-20">
                                <div className="h-20 w-20 rounded-lg bg-neutral-950 p-1 border border-neutral-800 flex items-center justify-center shrink-0">
                                  <img 
                                    src={newProdImage} 
                                    alt="Preview" 
                                    className="max-h-full max-w-full object-contain rounded-sm"
                                  />
                                </div>
                                <div className="text-left">
                                  <span className="text-xs font-bold text-emerald-400 block flex items-center gap-1">✓ Device Photo Loaded</span>
                                  <p className="text-[10px] text-neutral-400 mt-0.5">High definition base64 state is ready.</p>
                                  <button 
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setNewProdImage('');
                                    }}
                                    className="text-[10px] text-red-500 font-extrabold tracking-wider uppercase hover:underline mt-1.5 bg-transparent block relative z-30"
                                  >
                                    Remove Attachment
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <Upload className="w-6 h-6 mb-1 text-sky-450 animate-pulse" />
                                <span className="text-xs font-bold text-white block">Drop high-quality visual, or click to browse</span>
                                <span className="text-[10px] text-neutral-500 block mt-0.5">Supports PNG, WebP, JPEG • max 4MB</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block mb-1 text-neutral-400">Detailed Catalog Description</label>
                          <textarea
                            value={newProdDesc}
                            onChange={e => setNewProdDesc(e.target.value)}
                            placeholder="Provide details about size, battery performance, cooling capacity, compressor, etc."
                            className="w-full bg-neutral-900 border border-neutral-850 rounded-lg p-2.5 focus:outline-none focus:border-sky-500 text-white font-medium h-20 resize-none"
                          />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => { setIsAddingProduct(false); resetProductForm(); }}
                            className="px-4 py-2 bg-neutral-800 text-neutral-300 font-bold rounded-lg hover:bg-neutral-850 transition"
                          >
                            Cancel Draf
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-500 transition shadow-md"
                          >
                            ✓ Append Product
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Inline edit product details if selected */}
                    {editingProduct && (
                      <form onSubmit={handleSaveEditProduct} className="bg-neutral-950/90 rounded-2xl p-6 border border-amber-500/30 space-y-4 animate-zoom-in text-xs font-semibold text-neutral-300">
                        <div className="border-b border-neutral-800 pb-3 mb-2 flex justify-between items-center">
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                            ✏️ Edit Catalog Item: {editingProduct.name}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block mb-1 text-neutral-400">Product Title</label>
                            <input
                              type="text"
                              value={editingProduct.name}
                              onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                              className="w-full bg-neutral-900 border border-neutral-850 rounded-lg p-2.5 focus:outline-none text-white"
                              required
                            />
                          </div>
                          <div>
                            <label className="block mb-1 text-neutral-400">Unit Price (OMR)</label>
                            <input
                              type="number"
                              step="0.001"
                              value={editingProduct.price}
                              onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                              className="w-full bg-neutral-900 border border-neutral-850 rounded-lg p-2.5 focus:outline-none text-white font-mono"
                              required
                            />
                          </div>
                        </div>

                        {/* High Quality Image Upload Edit state */}
                        <div className="bg-neutral-900/60 p-4 rounded-xl border border-neutral-800 space-y-2">
                          <label className="block text-xs font-bold text-neutral-300 uppercase tracking-widest flex items-center gap-1.5">
                            <Image className="w-4 h-4 text-amber-500" />
                            <span>Modify Product Image</span>
                          </label>
                          <p className="text-[10px] text-neutral-400 leading-tight">
                            Replace or add a high-resolution file to override the default category emoji indicator.
                          </p>

                          <div 
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, true)}
                            className={`relative h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition px-4 py-2 text-center cursor-pointer ${
                              isDragging 
                                ? 'border-amber-500 bg-amber-500/10 text-amber-400' 
                                : editingProduct.image 
                                  ? 'border-emerald-500/50 bg-emerald-500/5' 
                                  : 'border-neutral-850 hover:border-neutral-700 bg-neutral-900/40 text-neutral-400'
                            }`}
                          >
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, true)}
                              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                            />
                            
                            {editingProduct.image ? (
                              <div className="flex items-center gap-4 w-full h-full justify-center relative z-20">
                                <div className="h-16 w-16 rounded-lg bg-neutral-950 p-1 border border-neutral-800 flex items-center justify-center shrink-0">
                                  <img 
                                    src={editingProduct.image} 
                                    alt="Preview" 
                                    className="max-h-full max-w-full object-contain rounded-sm"
                                  />
                                </div>
                                <div className="text-left w-full max-w-xs">
                                  <span className="text-[11px] font-bold text-emerald-400 block flex items-center gap-1 flex-wrap">✓ Active Picture Loaded</span>
                                  <button 
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setEditingProduct({ ...editingProduct, image: undefined });
                                    }}
                                    className="text-[10px] text-red-550 hover:text-red-500 font-extrabold tracking-wider uppercase hover:underline mt-1 bg-transparent block relative z-30"
                                  >
                                    Reset to Category Emoji
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <Upload className="w-5 h-5 mb-1 text-amber-500 animate-pulse" />
                                <span className="text-xs font-bold text-white block">Drop replacement visual, or click to browse</span>
                                <span className="text-[9px] text-neutral-500 block mt-0.5">Supports PNG, WebP, JPEG • max 4MB</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setEditingProduct(null)}
                            className="px-4 py-2 bg-neutral-800 text-neutral-300 font-bold rounded-lg"
                          >
                            Close
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition"
                          >
                            Save Specification Changes
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Products Management List Table */}
                    <div className="bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden text-xs">
                      <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
                        <span className="font-extrabold uppercase text-neutral-400 tracking-wider text-[10px]">Active Stock Catalog ({products.length} units)</span>
                      </div>
                      
                      <div className="divide-y divide-neutral-800/60 max-h-[400px] overflow-y-auto scrollbar-none">
                        {products.map((p) => (
                          <div key={p.id} className="p-4 flex items-center justify-between gap-4 hover:bg-neutral-900/50 transition">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center overflow-hidden shrink-0 border border-neutral-700/60 p-0.5">
                                {p.image ? (
                                  <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain select-none" referrerPolicy="no-referrer" />
                                ) : (
                                  <span className="text-2xl select-none">{p.emoji}</span>
                                )}
                              </div>
                              <div>
                                <h4 className="font-bold text-white text-sm">{p.name}</h4>
                                <p className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">{p.brand} • <span className="text-neutral-500">{p.category}</span></p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0 pl-4 text-right">
                              <div>
                                <span className="font-extrabold font-mono text-white text-sm block">OMR {p.price.toFixed(3)}</span>
                                {p.oldPrice && (
                                  <span className="text-[10px] text-neutral-500 line-through">OMR {p.oldPrice.toFixed(3)}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => { setEditingProduct(p); setIsAddingProduct(false); }}
                                  className="p-2 rounded-lg bg-neutral-800 hover:bg-amber-600 hover:text-white transition cursor-pointer"
                                  title="Edit Specs"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-2 rounded-lg bg-neutral-800 hover:bg-red-650 hover:text-white transition cursor-pointer text-red-400"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* 3. LOGISTICS CONTROL TAB */}
                {activeTab === 'orders' && (
                  <div className="space-y-6 animate-zoom-in">
                    
                    <div className="space-y-1">
                      <h3 className="text-sm font-extrabold text-sky-400">Express Delivery Logistics Simulator</h3>
                      <p className="text-[11px] text-neutral-500">Track current shipping phases and manually update delivery structures inside simulated Oman routes.</p>
                    </div>

                    {orders.length === 0 ? (
                      <div className="bg-neutral-950 p-12 rounded-2xl border border-neutral-800 text-center text-xs">
                        <Truck className="w-12 h-12 text-neutral-600 mx-auto mb-3 animate-bounce-slow" />
                        <h4 className="font-bold text-neutral-300">No Orders in Logistics Pipeline</h4>
                        <p className="text-neutral-500 max-w-sm mx-auto mt-1">
                          Items checked out by users via the front-facing modal will compile here instantly with localized addresses.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((o) => {
                          const steps = ["Pending Confirmation", "Spec Packing Muscat", "Dispatched Oman Post", "Delivered Safe"];
                          return (
                            <div key={o.id} className="bg-neutral-950 p-5 rounded-2xl border border-neutral-850 flex flex-col md:flex-row gap-5 justify-between md:items-center text-xs">
                              
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono text-sm font-extrabold text-sky-400 bg-neutral-900 border border-neutral-800 py-0.5 px-2 rounded-sm">{o.id}</span>
                                  <span className="text-[10px] bg-sky-950 border border-sky-850 px-2 py-0.5 font-bold rounded-full text-sky-300">
                                    📍 {o.billingInfo.governorate}
                                  </span>
                                  <span className="text-[10px] text-neutral-400 font-bold">{o.date}</span>
                                </div>
                                <p className="font-bold text-neutral-200 mt-1">{o.billingInfo.fullName} • Tel: {o.billingInfo.phone}</p>
                                <p className="text-neutral-400 text-[11px]">{o.items.length} electronic goods • Grand Total: OMR {o.total.toFixed(3)}</p>
                                
                                <div className="flex gap-1 bg-neutral-900/80 p-2 border border-neutral-800 rounded-lg max-w-md my-2">
                                  <span className="text-neutral-500 shrink-0 uppercase tracking-widest font-black text-[9px]">Items:</span>
                                  <p className="text-neutral-300 truncate font-semibold">
                                    {o.items.map(it => `${it.product.name} (x${it.quantity})`).join(', ')}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-col gap-3 shrink-0 pl-1 border-t md:border-t-0 pt-3 md:pt-0 border-neutral-800">
                                <div className="space-y-1">
                                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Logistics Status</span>
                                  <span className="text-[11px] font-extrabold text-white bg-neutral-800 px-3 py-1 rounded-full border border-neutral-700 block text-center">
                                    ● {steps[o.trackingStep]}
                                  </span>
                                </div>

                                <button
                                  onClick={() => onAdvanceOrderStatus(o.id)}
                                  className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg hover:shadow-lg hover:shadow-emerald-950/20 transition text-center whitespace-nowrap active:scale-95 cursor-pointer"
                                >
                                  ⚡ Advance Logistics Phase
                                </button>
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    )}

                  </div>
                )}

              </div>

              {/* Admin Sticky Bottom Status Footer */}
              <div className="p-6 border-t border-neutral-800 bg-neutral-950 text-[11px] font-semibold text-neutral-500 flex justify-between items-center select-none">
                <div className="flex items-center gap-1.5 p-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                  <p className="text-neutral-400">Sandbox Admin Framework Active</p>
                </div>
                <p className="text-neutral-500 font-bold uppercase tracking-wider text-[10px]">BuyOman E-Commerce Control</p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
