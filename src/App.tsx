/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  ShoppingCart,
  Heart, 
  Trash2, 
  Plus, 
  Minus, 
  Check, 
  Truck, 
  Sparkles, 
  MessageSquare, 
  Star, 
  Search, 
  X, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  ChevronRight, 
  CreditCard, 
  MapPin, 
  Send,
  Sparkle,
  Bell,
  GitCompare
} from 'lucide-react';
import { PRODUCTS_DATA, SMALL_APPLIANCES, OMAN_GOVERNORATES } from './data.ts';
import { Product, CartItem, BillingInfo, Order, Message, Review } from './types.ts';
import Navbar from './components/Navbar.tsx';
import HeroSlider from './components/HeroSlider.tsx';
import ProductCard from './components/ProductCard.tsx';
import OrderHistory from './components/OrderHistory.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import ReviewsSection from './components/ReviewsSection.tsx';

// Persistent storage keys
const CART_STORAGE_KEY = 'buyoman_cart_data';
const WISHLIST_STORAGE_KEY = 'buyoman_wishlist_data';
const ORDERS_STORAGE_KEY = 'buyoman_orders_data';
const PRODUCTS_STORAGE_KEY = 'buyoman_products_data';

// Helper function to extract relevant key hardware specifications dynamically for comparison layout
const getSpecDetail = (product: Product, type: 'performance' | 'display' | 'battery' | 'camera_audio' | 'extra') => {
  const specs = product.specs || [];
  let kw: string[] = [];
  if (type === 'performance') {
    kw = ['chip', 'processor', 'snapdragon', 'bionic', 'm3', 'intel', 'ryzen', 'memory', 'ram', 'inverter', 'gb'];
  } else if (type === 'display') {
    kw = ['inch', 'screen', 'display', 'retina', 'amoled', 'oled', 'hz', 'led', 'resolution', 'px', 'panel'];
  } else if (type === 'battery') {
    kw = ['battery', 'mah', 'hours', 'hour', 'charge', 'power', 'cooling', 'saving', 'energy'];
  } else if (type === 'camera_audio') {
    kw = ['camera', 'mp', 'lens', 'sensor', 'zoom', 'audio', 'sound', 'microphone', 'optical', 'leica'];
  } else if (type === 'extra') {
    kw = ['design', 'titanium', 's pen', 'waterproof', 'port', 'finish', 'hub', 'anti-reflection', 'compressor', 'shield', 'structure', 'tested', 'refresh', 'dolby'];
  }

  // Find first spec mapping any keyword
  const matched = specs.find(spec => kw.some(k => spec.toLowerCase().includes(k.toLowerCase())));
  if (matched) return matched;

  // Fallback: search description for these keywords or grab generic item
  if (type === 'performance') {
    const fromDesc = product.description.split('.').find(s => ['chip', 'processor', 'inverter', 'snapdragon'].some(k => s.toLowerCase().includes(k.toLowerCase())));
    if (fromDesc) return fromDesc.trim();
  } else if (type === 'battery') {
    const fromDesc = product.description.split('.').find(s => ['battery', 'charge', 'energy', 'save'].some(k => s.toLowerCase().includes(k.toLowerCase())));
    if (fromDesc) return fromDesc.trim();
  }

  // Default fallback index
  if (type === 'performance' && specs[1]) return specs[1];
  if (type === 'display' && specs[2]) return specs[2];
  if (type === 'battery' && specs[3]) return specs[3];
  if (type === 'camera_audio' && specs[4]) return specs[4];
  return specs[0] || "Standard Specification Verified";
};

const DEFAULT_REVIEWS: Review[] = [
  {
    id: "rev-1",
    productId: 1,
    userName: "Ahmed Al-Masrouri",
    rating: 5,
    comment: "Excellent phone. The titanium structure makes it feel much lighter than my previous 13 Pro Max. Camera zoom is spectacular, perfect for snapping photos in Muscat!",
    date: "2026-06-01",
    isVerifiedPurchase: true
  },
  {
    id: "rev-2",
    productId: 1,
    userName: "Fatma Al-Lawati",
    rating: 4,
    comment: "Great quality and beautiful display. Battery life easily lasts 1.5 days. Highly recommend for any power user in Oman. The only issue is the price is slightly steep, but worth it.",
    date: "2026-06-10",
    isVerifiedPurchase: true
  },
  {
    id: "rev-3",
    productId: 2,
    userName: "Mazin Al-Busaidi",
    rating: 5,
    comment: "The built-in S pen and new AI live translate are game-changers for my business meetings! S24 Ultra screen has almost zero glare in our bright Omani sunshine.",
    date: "2026-05-28",
    isVerifiedPurchase: true
  },
  {
    id: "rev-4",
    productId: 3,
    userName: "Said Al-Harthy",
    rating: 5,
    comment: "Incredible battery life (22 hours matches the specs!) and the speed of compilation on Apple Silicon is unmatched. Essential tool for software developers.",
    date: "2026-06-15",
    isVerifiedPurchase: true
  }
];

export default function App() {
  // Navigation & Category States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'low-to-high' | 'high-to-low' | 'newest'>('newest');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Cart & Wishlist & Order States
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Reviews & Rating System State
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem('buyoman_reviews_data');
      return saved ? JSON.parse(saved) : DEFAULT_REVIEWS;
    } catch {
      return DEFAULT_REVIEWS;
    }
  });

  // Keep reviews synced to localStorage
  useEffect(() => {
    localStorage.setItem('buyoman_reviews_data', JSON.stringify(reviews));
  }, [reviews]);

  // Tab State for Quick View Details Modal
  const [quickViewTab, setQuickViewTab] = useState<'specs' | 'reviews'>('specs');

  // Price Drop alerts tracking lists
  const [priceAlertSubscriptions, setPriceAlertSubscriptions] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('priceAlertSubscriptions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const prevPricesRef = useRef<Record<number, number>>({});
  
  // Dialog Overlays
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [wishlistOpen, setWishlistOpen] = useState<boolean>(false);
  const [ordersOpen, setOrdersOpen] = useState<boolean>(false);
  const [adminOpen, setAdminOpen] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState<boolean>(false);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);

  // Recently Viewed State
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('buyoman_recently_viewed_products');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Keep recentlyViewedIds synced to localStorage
  useEffect(() => {
    localStorage.setItem('buyoman_recently_viewed_products', JSON.stringify(recentlyViewedIds));
  }, [recentlyViewedIds]);

  // Track product views
  useEffect(() => {
    if (quickViewProduct) {
      setRecentlyViewedIds((prev) => {
        const filtered = prev.filter(id => id !== quickViewProduct.id);
        return [quickViewProduct.id, ...filtered].slice(0, 5);
      });
    }
  }, [quickViewProduct]);

  // Derived state for Recently Viewed products
  const recentlyViewedProducts = recentlyViewedIds
    .map(id => products.find(p => p.id === id))
    .filter((p): p is Product => !!p);

  // Product Comparison States
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState<boolean>(false);

  // AI Advisor Chat Drawer State
  const [advisorOpen, setAdvisorOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: 'Marhaba! 👋 Welcome to BuyOman. I am your specialized AI Shopping Advisor.\n\nLooking for an energy-efficient Split AC to handle the Omani summer heat? Or the latest titanium iPhone/Galaxy? Tell me what you need, your budget, or your family size, and I will recommend the perfect setup!',
      timestamp: new Date()
    }
  ]);
  const [userInput, setUserInput] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Countdown timer state
  const [hours, setHours] = useState('08');
  const [minutes, setMinutes] = useState('34');
  const [seconds, setSeconds] = useState('59');

  // Checkout Form State
  const [billing, setBilling] = useState<BillingInfo>({
    fullName: '',
    phone: '',
    email: '',
    governorate: OMAN_GOVERNORATES[8], // default to Muscat
    city: '',
    addressLines: '',
    paymentMethod: 'cod'
  });

  // Global Toast Alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load persistence data on boot
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

      const savedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (savedOrders) {
        const parsed: Order[] = JSON.parse(savedOrders);
        setOrders(parsed);
        // Default active tracking order if exists
        if (parsed.length > 0) {
          setActiveTrackingOrder(parsed[parsed.length - 1]);
        }
      }

      const savedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      } else {
        setProducts(PRODUCTS_DATA);
      }
    } catch (e) {
      console.error("Error loading localStorage state:", e);
      setProducts(PRODUCTS_DATA);
    }
  }, []);

  // Monitor url and hash changes for secret admin login access
  useEffect(() => {
    const checkAdminRoute = () => {
      const hasAdminQuery = window.location.search.includes('admin=true');
      const hasAdminHash = window.location.hash === '#admin';
      if (hasAdminQuery || hasAdminHash) {
        setAdminOpen(true);
        triggerToast("🔑 Secret Admin Dashboard Opened via secure hash parameter link!");
      }
    };
    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    return () => window.removeEventListener('hashchange', checkAdminRoute);
  }, []);

  // Sync products to localstorage
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    }
  }, [products]);

  // Sync price alert subscriptions to localStorage
  useEffect(() => {
    localStorage.setItem('priceAlertSubscriptions', JSON.stringify(priceAlertSubscriptions));
  }, [priceAlertSubscriptions]);

  // Monitor price drops whenever products or subscriptions change
  useEffect(() => {
    const currentPrices: Record<number, number> = {};
    products.forEach((p) => {
      currentPrices[p.id] = p.price;
    });

    if (Object.keys(prevPricesRef.current).length > 0) {
      products.forEach((p) => {
        const prevPrice = prevPricesRef.current[p.id];
        if (prevPrice !== undefined && p.price < prevPrice) {
          // Check if user is subscribed
          if (priceAlertSubscriptions.includes(p.id)) {
            triggerToast(`🔔 Price Drop Alert: "${p.name}" dropped to OMR ${p.price.toFixed(3)} (was OMR ${prevPrice.toFixed(3)})!`);
          }
        }
      });
    }

    prevPricesRef.current = currentPrices;
  }, [products, priceAlertSubscriptions]);

  // Toggle Price Drop alert subscription code block
  const handleTogglePriceAlert = (product: Product) => {
    setPriceAlertSubscriptions((prev) => {
      const isSubscribed = prev.includes(product.id);
      if (isSubscribed) {
        triggerToast(`🔔 Unsubscribed from price drops for: ${product.name}`);
        return prev.filter(id => id !== product.id);
      } else {
        triggerToast(`🔔 Subscribed! We will notify you of any price drops for: ${product.name}`);
        return [...prev, product.id];
      }
    });
  };

  // Toggle dynamic comparison slot of specific product asset
  const handleToggleCompare = (product: Product) => {
    setCompareIds((prev) => {
      const isComparing = prev.includes(product.id);
      if (isComparing) {
        triggerToast(`⚖️ Removed "${product.name}" from comparison list.`);
        return prev.filter(id => id !== product.id);
      } else {
        if (prev.length >= 3) {
          triggerToast("⚠️ High Contrast limit: You can only compare up to 3 products simultaneously.");
          return prev;
        }
        triggerToast(`⚖️ Added "${product.name}" to comparison list. See the tray below!`);
        return [...prev, product.id];
      }
    });
  };

  // Sync to localstorage
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  // Deal countdown timer loop
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();

      if (diff <= 0) {
        setHours('00');
        setMinutes('00');
        setSeconds('00');
      } else {
        const hrs = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);

        setHours(String(hrs).padStart(2, '0'));
        setMinutes(String(mins).padStart(2, '0'));
        setSeconds(String(secs).padStart(2, '0'));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Trigger temporary floating Toast message
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Reviews and Verification Handlers
  const hasPurchasedProduct = (productId: number) => {
    return orders.some(o => o.items.some(item => item.product.id === productId));
  };

  const handleAddReview = (productId: number, userName: string, rating: number, comment: string) => {
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      productId,
      userName: userName.trim() || 'Verified Customer',
      rating,
      comment: comment.trim(),
      date: new Date().toISOString().split('T')[0],
      isVerifiedPurchase: true
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);

    // Recalculate average rating
    const productReviews = updatedReviews.filter(r => r.productId === productId);
    const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
    const roundedRating = Math.round(avgRating * 10) / 10;

    // Update products state & product list persistence
    setProducts(prevProducts => {
      const updated = prevProducts.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            rating: roundedRating,
            reviews: productReviews.length
          };
        }
        return p;
      });
      localStorage.setItem('buyoman_products_data', JSON.stringify(updated));
      return updated;
    });

    // Also update current active quick view if open
    setQuickViewProduct(prev => {
      if (prev && prev.id === productId) {
        return {
          ...prev,
          rating: roundedRating,
          reviews: productReviews.length
        };
      }
      return prev;
    });
  };

  // Cart Management
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    triggerToast(`🛒 ${product.name} added to your cart!`);
  };

  const handleRemoveFromCart = (productId: number) => {
    const target = cart.find(item => item.product.id === productId);
    setCart(prev => prev.filter(item => item.product.id !== productId));
    if (target) {
      triggerToast(`Removed ${target.product.name} from your cart.`);
    }
  };

  const handleChangeQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  // Wishlist Handling
  const handleToggleWishlist = (product: Product) => {
    const exists = wishlist.some(i => i.id === product.id);
    if (exists) {
      setWishlist(prev => prev.filter(i => i.id !== product.id));
      triggerToast(`Removed ${product.name} from wishlist.`);
    } else {
      setWishlist(prev => [...prev, product]);
      triggerToast(`❤️ ${product.name} saved to your wishlist!`);
    }
  };

  // Cart Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  // Free delivery above OMR 20, else OMR 1.500
  const deliveryFee = cartSubtotal > 20 ? 0 : (cart.length > 0 ? 1.500 : 0);
  const cartTotal = cartSubtotal + deliveryFee;

  // Handle Search Filtering & Sorting
  const filteredProducts = products
    .filter((prod) => {
      const matchesCategory = selectedCategory === 'all' || prod.category === selectedCategory;
      const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            prod.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            prod.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'low-to-high') {
        return a.price - b.price;
      } else if (sortBy === 'high-to-low') {
        return b.price - a.price;
      } else if (sortBy === 'newest') {
        return b.id - a.id;
      }
      return 0;
    });

  // Handle Placing Simulated Order
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      triggerToast("❌ Your cart is empty.");
      return;
    }
    if (!billing.fullName || !billing.phone || !billing.city || !billing.addressLines) {
      triggerToast("❌ Please fill in all required delivery details.");
      return;
    }

    // Prepare simulated Order object
    const deliveryDays = billing.governorate.includes('Dhofar') || billing.governorate.includes('Musandam') ? 3 : 1;
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + deliveryDays);

    const newOrder: Order = {
      id: 'OM-' + Math.floor(Math.random() * 90000 + 10000),
      items: [...cart],
      subtotal: cartSubtotal,
      deliveryFee: deliveryFee,
      total: cartTotal,
      billingInfo: { ...billing },
      date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: 'pending',
      trackingStep: 0,
      estimatedDelivery: estDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })
    };

    setOrders(prev => [...prev, newOrder]);
    setActiveTrackingOrder(newOrder);
    setCart([]); // Reset Cart
    setCheckoutOpen(false);
    setCartOpen(false);
    triggerToast(`🎉 Order ${newOrder.id} successfully placed! Track your package below.`);

    // Scroll to tracking section
    setTimeout(() => {
      const trackingSec = document.getElementById('tracking-sandbox');
      if (trackingSec) {
        trackingSec.scrollIntoView({ behavior: 'smooth' });
      }
    }, 400);
  };

  // Automated/Interactive Action: Simulate step advancing for deliveries so users can test how easily their packages ship
  const handleAdvanceShipment = (orderId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const nextStep = (order.trackingStep + 1) % 4;
        const statusMap: ('pending' | 'preparing' | 'shipped' | 'delivered')[] = ['pending', 'preparing', 'shipped', 'delivered'];
        const updated = {
          ...order,
          trackingStep: nextStep,
          status: statusMap[nextStep]
        };
        // Also update local view if current
        if (activeTrackingOrder?.id === orderId) {
          setActiveTrackingOrder(updated);
        }
        
        let notificationMsg = "";
        if (nextStep === 1) notificationMsg = "📦 Warehouse team is active! Appreciating components & packaging.";
        if (nextStep === 2) notificationMsg = "🚚 Order handed over to Oman post & local logistics! Dispatching out.";
        if (nextStep === 3) notificationMsg = "🏡 Package delivered safely to destination address!";
        if (nextStep === 0) notificationMsg = "🔄 Delivery status reset to pending for test mode.";
        
        triggerToast(notificationMsg);
        return updated;
      }
      return order;
    }));
  };

  // Send query to Server-Side AI Recommendation API
  const handleSendAiMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim()) return;

    const userText = userInput;
    setUserInput('');
    
    // Add user message to state
    const newUserMessage: Message = { sender: 'user', text: userText, timestamp: new Date() };
    const currentMessages = [...chatMessages, newUserMessage];
    setChatMessages(currentMessages);
    setAiLoading(true);

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: currentMessages.slice(-5) // Send some context history
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date()
        }
      ]);

      if (data.notice) {
        console.info("AI Service Info Notice:", data.notice);
      }

    } catch (err: any) {
      console.error("AI Advisor network issue:", err);
      // Hardcoded fallback response in case server has communication limits
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: "I am having a moment's delay connecting to my central brain, but our BuyOman catalog features the top products! Try asking about 'AC units' or 'iphones' for helpful Omani summer advice.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // Helper pre-defined assistant prompt tags to let the user clickable-ask
  const QUICK_QUESTIONS = [
    "AC recommendations for high heat?",
    "Suggest a good smartphone on budget",
    "Show smart kitchen appliances & coffee",
    "What are washing machines under OMR 200?"
  ];

  return (
    <div id="app-viewport" className="min-h-screen bg-neutral-50/50 flex flex-col font-sans select-none antialiased">
      
      {/* Secret Admin Banner Trigger */}
      {(window.location.search.includes('admin=true') || window.location.hash === '#admin') && (
        <div id="admin-secret-header" className="bg-gradient-to-r from-rose-950 via-neutral-950 to-rose-950 border-b border-rose-500/30 text-white text-[11px] font-extrabold px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span>🔑 ACTIVE SANDBOX ADMIN URL DETECTED: Control live warehouse dispatches or manage the OMR pricing catalog</span>
          </div>
          <button 
            onClick={() => setAdminOpen(true)}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-md uppercase tracking-wider text-[10px] transition shadow-md cursor-pointer flex items-center gap-1"
          >
            <span>Launch Admin Workspace</span>
            <span>➡️</span>
          </button>
        </div>
      )}

      {/* Top Static Alert Bar */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-neutral-800 text-white text-xs font-bold px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-3 animate-slide-up">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-neutral-400 hover:text-white transition">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Primary Navigation bar */}
      <Navbar
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.length}
        ordersCount={orders.length}
        onCartClick={() => { setCartOpen(true); setWishlistOpen(false); setOrdersOpen(false); }}
        onWishlistClick={() => { setWishlistOpen(true); setCartOpen(false); setOrdersOpen(false); }}
        onOrdersClick={() => { setOrdersOpen(true); setCartOpen(false); setWishlistOpen(false); }}
        onSearchToggle={() => setSearchOpen(!searchOpen)}
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        mobileMenuOpen={mobileMenuOpen}
        searchOpen={searchOpen}
        onCategoryFilter={(cat) => { setSelectedCategory(cat); setSearchQuery(''); }}
        onAdvisorClick={() => setAdvisorOpen(true)}
      />

      {/* Global Search Overlay Panel */}
      {searchOpen && (
        <div className="bg-white border-b border-neutral-200 py-6 px-4 animate-fade-in shadow-md relative z-30">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                id="search-input-field"
                type="text"
                placeholder="Search by brands, products, specs (e.g., 'Apple', '9kg', 'Inverter Split AC')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-base py-3 pl-12 pr-4 bg-neutral-50 rounded-full border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium text-neutral-800"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button 
              onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
              className="px-5 py-3 text-sm font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full transition"
            >
              Cancel
            </button>
          </div>
          {searchQuery && (
            <div className="max-w-4xl mx-auto mt-2 text-xs text-neutral-500 pl-4">
              Found {filteredProducts.length} matched results for "{searchQuery}"
            </div>
          )}
        </div>
      )}

      {/* Interactive Hero Slider */}
      <div id="hero-carousel-block">
        <HeroSlider 
          onAddToCart={handleAddToCart}
          onExploreProduct={(p) => { setQuickViewTab('specs'); setQuickViewProduct(p); }}
        />
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 lg:px-8 py-10 flex-1">
        
        {/* FLASH DEALS COUNTDOWN */}
        <section id="flash-deal-banner" className="mb-12 bg-neutral-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
          {/* Ambient light source decoration */}
          <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
            
            {/* Title and Time */}
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="flex items-center gap-3">
                <span className="text-4xl">⚡</span>
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight">FLASH DEALS OF THE DAY</h3>
                  <p className="text-neutral-400 text-xs font-semibold tracking-wider uppercase">Extremely limited Omani Rial stock pricing</p>
                </div>
              </div>

              {/* Countdown clock blocks */}
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-2.5 rounded-2xl">
                <div className="text-center min-w-12">
                  <span className="block text-xl font-bold font-mono tracking-tight text-sky-400">{hours}</span>
                  <span className="text-[9px] text-neutral-400 uppercase tracking-widest font-bold">Hrs</span>
                </div>
                <span className="text-sm font-bold text-neutral-500 animate-pulse">:</span>
                <div className="text-center min-w-12">
                  <span className="block text-xl font-bold font-mono tracking-tight text-sky-400">{minutes}</span>
                  <span className="text-[9px] text-neutral-400 uppercase tracking-widest font-bold">Min</span>
                </div>
                <span className="text-sm font-bold text-neutral-500 animate-pulse">:</span>
                <div className="text-center min-w-12">
                  <span className="block text-xl font-bold font-mono tracking-tight text-sky-400">{seconds}</span>
                  <span className="text-[9px] text-neutral-400 uppercase tracking-widest font-bold">Sec</span>
                </div>
              </div>
            </div>

            {/* Quick Promo Info */}
            <div className="text-xs text-neutral-300 font-medium flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 py-2 px-4 rounded-full text-emerald-300">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Full T3 Rated Tropical ACs fully tuned for 50°C summer workloads</span>
            </div>

          </div>
        </section>

        {/* Dynamic Category Tabs Selector */}
        <section id="catalog-section" className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-sky-600 tracking-wider uppercase inline-block mb-1">BuyOman Premium Showcase</span>
              <h2 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight">
                {selectedCategory === 'all' ? 'All Electronics & Appliances' : `${selectedCategory.toUpperCase()} COLLECTION`}
              </h2>
            </div>

            {/* Grid Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {[
                { id: 'all', icon: '🌟', label: 'All Store' },
                { id: 'mobile', icon: '📱', label: 'Mobiles' },
                { id: 'laptop', icon: '💻', label: 'Laptops' },
                { id: 'tv', icon: '📺', label: 'TV & Video' },
                { id: 'air_conditin', icon: '🌬️', label: 'Air Conditions' },
                { id: 'fridge', icon: '🧊', label: 'Fridges' },
                { id: 'wasing_machin', icon: '🧺', label: 'Washing Machines' },
                { id: 'dryer', icon: '👕', label: 'Dryers' },
                { id: 'cooking_rang', icon: '🍳', label: 'Cooking Ranges' },
                { id: 'biltin_coocing_range', icon: '🔥', label: 'Built-in Cooking' },
                { id: 'freezer', icon: '🍦', label: 'Freezers' },
                { id: 'appliance', icon: '🔌', label: 'Small Appliances' },
                { id: 'accessory', icon: '🎧', label: 'Accessories' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-4.5 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer select-none active:scale-95 ${
                    selectedCategory === tab.id
                      ? 'bg-neutral-900 text-white shadow-md'
                      : 'bg-white text-neutral-600 border border-neutral-100 hover:bg-neutral-50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sub-bar with total count and Sorting Dropdown Menu */}
          <div id="catalog-controls-bar" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-neutral-100 rounded-3xl px-6 py-4 mb-8">
            <div className="text-xs font-semibold text-neutral-500">
              Showing <span className="text-neutral-900 font-extrabold">{filteredProducts.length}</span> premium products in <span className="text-sky-600 font-bold uppercase tracking-wide text-[11px] bg-sky-50 px-2 py-1 rounded-md">{selectedCategory === 'all' ? 'All categories' : selectedCategory}</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs">
              <label htmlFor="catalog-sort-select" className="font-bold text-neutral-600 whitespace-nowrap">Sort By:</label>
              <select
                id="catalog-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-neutral-50 border border-neutral-200/80 rounded-xl px-4 py-2 text-neutral-850 font-bold focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 cursor-pointer min-w-[170px] transition-all hover:bg-neutral-100/60"
              >
                <option value="newest">🔥 Newest First</option>
                <option value="low-to-high">📈 Price: Low to High</option>
                <option value="high-to-low">📉 Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Product Items Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-neutral-100 rounded-3xl py-16 px-4 text-center">
              <span className="text-5xl block mb-4">🔍</span>
              <h4 className="text-lg font-bold text-neutral-800 mb-1">No products found</h4>
              <p className="text-neutral-500 text-sm max-w-md mx-auto mb-6">
                We couldn't locate any products matching "{searchQuery}" in our {selectedCategory} tab. Let's try another search.
              </p>
              <button
                onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                className="px-6 py-2.5 bg-neutral-900 text-white rounded-full text-xs font-bold hover:bg-sky-600 transition"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  isWishlisted={wishlist.some(i => i.id === prod.id)}
                  isPriceAlertSubscribed={priceAlertSubscriptions.includes(prod.id)}
                  isComparing={compareIds.includes(prod.id)}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  onQuickView={(p) => { setQuickViewTab('specs'); setQuickViewProduct(p); }}
                  onTogglePriceAlert={handleTogglePriceAlert}
                  onToggleCompare={handleToggleCompare}
                />
              ))}
            </div>
          )}
        </section>

        {/* ========================================= */}
        {/* RECENTLY VIEWED PRODUCTS SECTION */}
        {/* ========================================= */}
        {recentlyViewedProducts.length > 0 && (
          <section id="recently-viewed-section" className="my-16 bg-white border border-neutral-200/80 rounded-3xl p-6 md:p-10 shadow-xs animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold text-sky-650 tracking-wider uppercase bg-sky-50 py-1 px-3 rounded-full inline-block mb-3">Your Browsing History</span>
                <h3 className="text-xl md:text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
                  <span>🕒 Recently Viewed Products</span>
                </h3>
                <p className="text-neutral-500 text-xs font-medium mt-1">
                  Revisit hardware specifications of the last 5 items you checked out.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRecentlyViewedIds([]);
                  triggerToast('🕒 Cleared recently viewed history.');
                }}
                className="self-start sm:self-auto text-xs font-bold text-neutral-450 hover:text-red-700 bg-neutral-50 hover:bg-red-50 px-4 py-2 rounded-xl border border-neutral-200/80 transition cursor-pointer"
              >
                Clear History
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {recentlyViewedProducts.map((prod) => (
                <div 
                  key={prod.id}
                  onClick={() => {
                    setQuickViewTab('specs');
                    setQuickViewProduct(prod);
                  }}
                  className="group relative bg-neutral-50/50 hover:bg-white border border-neutral-150 hover:border-sky-305 rounded-2xl p-4 transition-all duration-300 cursor-pointer hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    {/* Badge */}
                    <span className="text-[9px] uppercase font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full inline-block mb-2">
                      {prod.brand}
                    </span>

                    {/* Image / Emoji */}
                    <div className="h-28 w-full bg-white rounded-xl flex items-center justify-center p-2 mb-3 border border-neutral-100 group-hover:scale-105 transition-transform duration-300">
                      {prod.image ? (
                        <img 
                          src={prod.image} 
                          alt={prod.name} 
                          loading="lazy" 
                          referrerPolicy="no-referrer"
                          className="max-h-full max-w-full object-contain" 
                        />
                      ) : (
                        <span className="text-4xl select-none">{prod.emoji}</span>
                      )}
                    </div>

                    {/* Title */}
                    <h4 className="text-xs font-bold text-neutral-800 line-clamp-2 leading-snug group-hover:text-sky-700 transition">
                      {prod.name}
                    </h4>
                  </div>

                  <div className="mt-4 pt-2 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-xs font-black text-neutral-900">
                      OMR {prod.price.toFixed(3)}
                    </span>
                    <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                      ★ {prod.rating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECT: SMALL KITCHEN APPLIANCES FOCUS (Grid of Small helpful gadgets) */}
        <section className="my-16 bg-gradient-to-br from-neutral-50 to-neutral-100/50 rounded-3xl p-6 md:p-10 border border-neutral-100">
          <div className="max-w-3xl mb-10">
            <span className="text-xs font-bold text-amber-600 tracking-wider uppercase bg-amber-50 py-1 px-3 rounded-full inline-block mb-3">Kitchen & Home Comfort Gadgets</span>
            <h3 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight">Small Smart Appliances</h3>
            <p className="text-neutral-600 text-sm mt-1 leading-relaxed">
              Fully stocked essential devices with free warranty setup in your home. Perfect additions for healthy cooking and modern smart cleaning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SMALL_APPLIANCES.map((item, idx) => {
              const oldVal = item.oldPrice;
              const discount = Math.round(((oldVal - item.price) / oldVal) * 100);
              return (
                <div 
                  key={idx}
                  className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm flex items-center justify-between hover:shadow-md transition duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-amber-50/50 rounded-xl flex items-center justify-center text-4xl select-none">
                      {item.emoji}
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-amber-600 tracking-wider uppercase">{item.brand}</span>
                      <h4 className="text-sm font-bold text-neutral-800 leading-snug line-clamp-1">{item.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-extrabold text-neutral-900">OMR {item.price.toFixed(3)}</span>
                        <span className="text-[10px] text-neutral-400 line-through">OMR {item.oldPrice.toFixed(3)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0 pl-3">
                    <span className="text-[9px] font-extrabold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                      -{discount}% OFF
                    </span>
                    <button
                      onClick={() => {
                        // Adapt small appliance payload to normal product schema temporarily
                        const tempProduct: Product = {
                          id: 100 + idx,
                          name: item.name,
                          brand: item.brand,
                          emoji: item.emoji,
                          price: item.price,
                          oldPrice: item.oldPrice,
                          rating: 4.8,
                          reviews: 140,
                          category: 'appliance',
                          description: `Premium essential home accessory by ${item.brand}. Compact design, powerful operations, and durable layout.`,
                          specs: ["High Performance Motor", "2-Year Store Warranty", "Original Manufacturer Box"]
                        };
                        handleAddToCart(tempProduct);
                      }}
                      className="px-3.5 py-1.5 bg-neutral-900 hover:bg-sky-600 text-white rounded-full text-[11px] font-bold transition flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Buy</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ORDER TRACKING SANDBOX SECTION */}
        <section id="tracking-sandbox" className="my-16 bg-white border border-neutral-100 rounded-3xl p-6 md:p-10 shadow-sm relative">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-6 mb-8">
            <div>
              <span className="text-xs font-bold text-sky-600 tracking-wider uppercase block mb-1">Exclusive Delivery Safe Guard</span>
              <h3 className="text-xl md:text-2xl font-black text-neutral-900 tracking-tight">Omani Governorates Delivery Tracker</h3>
              <p className="text-neutral-500 text-xs font-medium">Place an order with us, then watch simulated vans transit across your selected regional hubs.</p>
            </div>
            
            {/* Orders selection picker */}
            {orders.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-500">Select Order to Track:</span>
                <select
                  value={activeTrackingOrder?.id || ''}
                  onChange={(e) => {
                    const found = orders.find(o => o.id === e.target.value);
                    if (found) setActiveTrackingOrder(found);
                  }}
                  className="bg-neutral-50 border border-neutral-200 text-xs font-bold text-neutral-800 rounded-lg p-2 focus:outline-none"
                >
                  {orders.map(o => (
                    <option key={o.id} value={o.id}>Order {o.id} ({o.billingInfo.governorate})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {!activeTrackingOrder ? (
            <div className="py-8 text-center bg-neutral-50/50 rounded-2xl p-6 border border-dashed border-neutral-200">
              <Truck className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-neutral-700 mb-1">No Orders Active for Tracking</h4>
              <p className="text-xs text-neutral-500 max-w-md mx-auto mb-4">
                Place simulated checkout items with your Omani phone and region structure, and the package routing steps will render instantly.
              </p>
              <button 
                onClick={() => {
                  // Add quick dummy product and open checkout to make this easy to test
                  if (cart.length === 0) {
                    handleAddToCart(products[0] || PRODUCTS_DATA[0]);
                  }
                  setCartOpen(true);
                }}
                className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-sky-600 transition"
              >
                Initialize Test Item Order Now
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Order Header */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4.5 bg-neutral-50 rounded-2xl border border-neutral-100 text-xs">
                <div>
                  <span className="text-neutral-400 font-medium block">Order Identifier</span>
                  <span className="font-bold text-neutral-800 text-sm mt-0.5 block">{activeTrackingOrder.id}</span>
                </div>
                <div>
                  <span className="text-neutral-400 font-medium block">Oman Governorate Destination</span>
                  <span className="font-semibold text-neutral-800 mt-0.5 block">📍 {activeTrackingOrder.billingInfo.governorate} ({activeTrackingOrder.billingInfo.city})</span>
                </div>
                <div>
                  <span className="text-neutral-400 font-medium block">Date Checked Out</span>
                  <span className="font-semibold text-neutral-800 mt-0.5 block">{activeTrackingOrder.date}</span>
                </div>
                <div>
                  <span className="text-neutral-400 font-medium block">Est. Delivery Date</span>
                  <span className="font-bold text-emerald-600 mt-0.5 block">🚚 {activeTrackingOrder.estimatedDelivery}</span>
                </div>
              </div>

              {/* Progress Steps Visual Block */}
              <div className="relative pt-8 pb-4">
                {/* Horizontal connection line */}
                <div className="absolute top-[52px] left-[12%] right-[12%] h-1 bg-neutral-100 -z-10 rounded-full hidden sm:block">
                  <div 
                    className="h-full bg-sky-500 rounded-full transition-all duration-500"
                    style={{ width: `${(activeTrackingOrder.trackingStep / 3) * 100}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs relative">
                  
                  {/* Step 0 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition ${
                      activeTrackingOrder.trackingStep >= 0 
                        ? 'bg-neutral-900 border-neutral-900 text-white shadow-md' 
                        : 'bg-white border-neutral-200 text-neutral-400'
                    }`}>
                      01
                    </div>
                    <span className="font-bold text-neutral-800 mt-3 block">Order Lodged</span>
                    <span className="text-[10px] text-neutral-400">Payment approved</span>
                  </div>

                  {/* Step 1 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition ${
                      activeTrackingOrder.trackingStep >= 1 
                        ? 'bg-neutral-900 border-neutral-900 text-white shadow-md' 
                        : 'bg-white border-neutral-200 text-neutral-400'
                    }`}>
                      02
                    </div>
                    <span className="font-bold text-neutral-800 mt-3 block">Preparing Package</span>
                    <span className="text-[10px] text-neutral-400">Muscat Logistics Depot</span>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition ${
                      activeTrackingOrder.trackingStep >= 2 
                        ? 'bg-sky-600 border-sky-600 text-white shadow-md shadow-sky-100' 
                        : 'bg-white border-neutral-200 text-neutral-400'
                    }`}>
                      03
                    </div>
                    <span className="font-bold text-neutral-800 mt-3 block">Out for Delivery</span>
                    <span className="text-[10px] text-neutral-400">Oman logistics post truck</span>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition ${
                      activeTrackingOrder.trackingStep >= 3 
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100 animate-pulse' 
                        : 'bg-white border-neutral-200 text-neutral-400'
                    }`}>
                      04
                    </div>
                    <span className="font-bold text-neutral-800 mt-3 block">Delivered Safely</span>
                    <span className="text-[10px] text-neutral-400">Arrived at destination</span>
                  </div>

                </div>
              </div>

              {/* Action Buttons to manually test package advancing states */}
              <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sky-200/50 rounded-full text-sky-800">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-sky-950 uppercase tracking-wide">Developer Sandbox Delivery Simulator</h5>
                    <p className="text-[11px] text-sky-700 font-medium">Click to advance this order's package status and experience high-fidelity delivery tracker responses!</p>
                  </div>
                </div>

                <button
                  onClick={() => handleAdvanceShipment(activeTrackingOrder.id)}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition whitespace-nowrap self-start sm:self-center"
                >
                  ⚡ Advance Delivery Step
                </button>
              </div>

              {/* List of items inside this active tracked order */}
              <div className="border border-neutral-100 rounded-2xl p-4">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-3">Items included in Order {activeTrackingOrder.id}</span>
                <div className="divide-y divide-neutral-100">
                  {activeTrackingOrder.items.map((it, index) => (
                    <div key={index} className="py-2.5 flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span>{it.product.emoji}</span>
                        <span className="text-neutral-700">{it.product.name}</span>
                        <span className="text-neutral-400 font-normal">x{it.quantity}</span>
                      </div>
                      <span className="text-neutral-900">OMR {(it.product.price * it.quantity).toFixed(3)}</span>
                    </div>
                  ))}
                  <div className="pt-3 flex justify-between font-bold text-neutral-900 text-xs">
                    <span>Grand Total:</span>
                    <span>OMR {activeTrackingOrder.total.toFixed(3)}</span>
                  </div>
                </div>
              </div>

            </div>
          )}
        </section>

        {/* PROMOTION / TRUST BENEFITS SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 my-16">
          <div className="bg-white border border-neutral-100 rounded-3xl p-6 hover:-translate-y-1 transition duration-300">
            <span className="text-3xl block mb-3">🇴🇲</span>
            <h4 className="text-sm font-extrabold text-neutral-800 uppercase tracking-wider mb-2">Muscat & Salalah Express Logistics</h4>
            <p className="text-neutral-500 text-xs leading-relaxed">
              Serving every single corner of the Sultanate of Oman. From Al Buraimi and Al Batinah to Dhofar, our trucks operate 24 hours to secure safe transit of heavy smart goods.
            </p>
          </div>
          <div className="bg-white border border-neutral-100 rounded-3xl p-6 hover:-translate-y-1 transition duration-300">
            <span className="text-3xl block mb-3">🛡️</span>
            <h4 className="text-sm font-extrabold text-neutral-800 uppercase tracking-wider mb-2">Golden 2-Year Core Warranty</h4>
            <p className="text-neutral-500 text-xs leading-relaxed">
              Shop with absolute peace of mind. All large home cooling systems, split tropical T3 AC units, smart refrigerators, and front-loading washers carry a full 2-year warranty index.
            </p>
          </div>
          <div className="bg-white border border-neutral-100 rounded-3xl p-6 hover:-translate-y-1 transition duration-300">
            <span className="text-3xl block mb-3">💬</span>
            <h4 className="text-sm font-extrabold text-neutral-800 uppercase tracking-wider mb-2">Gemini AI Advisor Assistance</h4>
            <p className="text-neutral-500 text-xs leading-relaxed">
              Instantly resolve specifications questions. Check BTU values on heavy air conditioning units, or compare camera configurations on the latest premium smartphones.
            </p>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-neutral-900 text-white mt-auto py-16 px-4 lg:px-8 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-black text-white tracking-tight mb-4">
              BuyOman<span className="text-sky-400 font-normal text-xs ml-1 bg-white/10 px-2 py-0.5 rounded-md">STORE</span>
            </h2>
            <p className="text-neutral-400 text-xs leading-relaxed max-w-sm mb-6">
              Sultanate of Oman's premier digital retailer for premium global consumer technology, home cooling gear, and smart built-in appliances. Over 50,000 verified households serviced.
            </p>
            <div className="flex gap-4">
              <span className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-neutral-300">OM</span>
              <span className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm">🇴🇲</span>
              <span className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm">💳</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-sky-400 tracking-wider uppercase mb-4">Product Catalog</h4>
            <ul className="space-y-2 text-xs text-neutral-400 font-medium">
              <li><button onClick={() => setSelectedCategory('mobile')} className="hover:text-white transition">Mobiles & Tablets</button></li>
              <li><button onClick={() => setSelectedCategory('laptop')} className="hover:text-white transition">High-End Laptops</button></li>
              <li><button onClick={() => setSelectedCategory('tv')} className="hover:text-white transition">Televisions & Theatre</button></li>
              <li><button onClick={() => setSelectedCategory('appliance')} className="hover:text-white transition">Splits & Aircon Cooling</button></li>
              <li><button onClick={() => setSelectedCategory('accessory')} className="hover:text-white transition">Smart Accessories</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-sky-400 tracking-wider uppercase mb-4">Customer Care</h4>
            <ul className="space-y-2 text-xs text-neutral-400 font-medium">
              <li><a href="#tracking-sandbox" className="hover:text-white transition">Track Your Shipment</a></li>
              <li><a href="#" onClick={() => triggerToast("FAQs panel is ready.")} className="hover:text-white transition">Warranty Claims</a></li>
              <li><a href="#" onClick={() => triggerToast("Our Muscat helpline can be reached on 800-BUYOMAN.")} className="hover:text-white transition">Installation Inquiries</a></li>
              <li><a href="#" onClick={() => setAdvisorOpen(true)} className="hover:text-white transition">AI Assistant Chat</a></li>
              <li><a href="#" onClick={() => triggerToast("Muscat Headquarter branch is active.")} className="hover:text-white transition">Store Locations</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-sky-400 tracking-wider uppercase mb-4">Express Delivery Network</h4>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              Regular routes to Muscat, Salala, Sohar, Nizwa, Sur, and Musandam. Same-day logistics options available inside the capital.
            </p>
            <div className="px-3 py-2 border border-emerald-500/20 bg-emerald-500/5 rounded-xl text-[10px] font-bold text-emerald-400 inline-block">
              ● FREE SHIPMENT ABOVE OMR 20
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-neutral-800 text-neutral-500 text-xs text-center flex flex-col md:flex-row md:justify-between items-center gap-4">
          <p>© 2026 BuyOman Electronics LLC. All rights reserved. Trade License No: OM-88921-X. Muscat, Oman.</p>
          <div className="flex gap-4 items-center">
            <a href="#" className="hover:text-neutral-400 transition">Terms of Sale</a>
            <a href="#" className="hover:text-neutral-400 transition">Privacy Directives</a>
            <a href="#" className="hover:text-neutral-400 transition">Cookies Setup</a>
            <span className="text-neutral-700">|</span>
            <button 
              onClick={() => {
                setAdminOpen(true);
                // Set the secure URL state visually so they see it
                window.location.hash = '#admin';
              }} 
              className="text-amber-500 font-extrabold hover:text-amber-400 transition flex items-center gap-1 cursor-pointer text-[11px] uppercase tracking-wider"
              title="Sandbox Inventory Control Gateway"
            >
              🔒 Admin Gateway
            </button>
          </div>
        </div>
      </footer>

      {/* ========================================= */}
      {/* DRAWER: SHOPPING CART SIDEBAR OVERLAY */}
      {/* ========================================= */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            
            {/* Backdrop slide-over */}
            <div className="absolute inset-0 bg-neutral-900/60 transition-opacity backdrop-blur-xs" onClick={() => setCartOpen(false)}></div>
            
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md animate-slide-left">
                <div className="flex h-full flex-col bg-white shadow-2xl">
                  
                  {/* Cart Header */}
                  <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-neutral-800" />
                      <h2 className="text-base font-bold text-neutral-900">Your Shopping Cart</h2>
                    </div>
                    <button 
                      onClick={() => setCartOpen(false)}
                      className="p-1 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Cart Items List */}
                  <div className="flex-1 overflow-y-auto py-6 px-6 divide-y divide-neutral-100 scrollbar-none">
                    {cart.length === 0 ? (
                      <div className="text-center py-20">
                        <span className="text-5xl block mb-4">🛒</span>
                        <h4 className="text-sm font-bold text-neutral-700">Your cart is currently empty</h4>
                        <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
                          Take a look at our iPhone titanium releases, smart split inverter ACs, or premium accessories.
                        </p>
                        <button
                          onClick={() => { setCartOpen(false); setSelectedCategory('all'); }}
                          className="mt-6 px-5 py-2 bg-neutral-900 hover:bg-sky-600 text-white rounded-full text-xs font-bold transition"
                        >
                          Browse our Electronics catalog
                        </button>
                      </div>
                    ) : (
                      cart.map((item) => (
                        <div key={item.product.id} className="py-4 flex items-center gap-4">
                          
                          {/* Image Emoji block */}
                          <div className="w-16 h-16 bg-neutral-50 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-neutral-100 p-1 bg-white">
                            {item.product.image ? (
                              <img src={item.product.image} alt={item.product.name} className="max-h-12 max-w-full object-contain select-none" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-3xl select-none">{item.product.emoji}</span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-neutral-800 truncate">{item.product.name}</h4>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{item.product.brand}</p>
                            <span className="text-xs font-extrabold text-neutral-900 mt-1 block">
                              OMR {item.product.price.toFixed(3)}
                            </span>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 mt-2">
                              <button 
                                onClick={() => handleChangeQuantity(item.product.id, -1)}
                                className="w-6 h-6 rounded-md border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 text-neutral-600 active:scale-95"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-bold text-neutral-800 min-w-6 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => handleChangeQuantity(item.product.id, 1)}
                                className="w-6 h-6 rounded-md border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 text-neutral-600 active:scale-95"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Trash Delete */}
                          <button
                            onClick={() => handleRemoveFromCart(item.product.id)}
                            className="p-1.5 rounded-full hover:bg-red-50 text-neutral-400 hover:text-red-500 transition active:scale-90"
                            title="Remove product"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>

                        </div>
                      ))
                    )}
                  </div>

                  {/* Cart Summary & Order Placement button */}
                  {cart.length > 0 && (
                    <div className="border-t border-neutral-100 px-6 py-6 bg-neutral-50 space-y-4">
                      
                      <div className="space-y-2 text-xs font-semibold">
                        <div className="flex justify-between text-neutral-500">
                          <span>Subtotal Amount:</span>
                          <span className="text-neutral-900">OMR {cartSubtotal.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between text-neutral-500">
                          <span>Oman Shipping delivery:</span>
                          <span className={deliveryFee === 0 ? 'text-emerald-600 font-bold' : 'text-neutral-900'}>
                            {deliveryFee === 0 ? 'FREE DELIVERY' : `OMR ${deliveryFee.toFixed(3)}`}
                          </span>
                        </div>
                        {deliveryFee > 0 && (
                          <div className="text-[10px] text-amber-600">
                            Add OMR {(20 - cartSubtotal).toFixed(3)} more to unlock free express shipping!
                          </div>
                        )}
                        <div className="flex justify-between border-t border-neutral-200 pt-3 text-sm font-bold text-neutral-900">
                          <span>Grand Total (OMR):</span>
                          <span>OMR {cartTotal.toFixed(3)}</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => { setCheckoutOpen(true); setCartOpen(false); }}
                          className="w-full py-3.5 bg-neutral-900 hover:bg-sky-600 text-white font-bold rounded-xl text-xs tracking-wider uppercase shadow-md transition-all flex items-center justify-center gap-2"
                        >
                          <span>Proceed to checkout options</span>
                        </button>
                        <button 
                          onClick={() => setCartOpen(false)}
                          className="w-full text-center text-xs font-semibold text-neutral-500 hover:text-neutral-700 py-2 mt-2"
                        >
                          Continue shopping
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* DRAWER: WISHLIST OVERLAY */}
      {/* ========================================= */}
      {wishlistOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            
            {/* Backdrop slide-over */}
            <div className="absolute inset-0 bg-neutral-900/60 transition-opacity backdrop-blur-xs" onClick={() => setWishlistOpen(false)}></div>
            
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md animate-slide-left">
                <div className="flex h-full flex-col bg-white shadow-2xl">
                  
                  {/* Header */}
                  <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                      <h2 className="text-base font-bold text-neutral-900">Saved Wishlist ({wishlist.length})</h2>
                    </div>
                    <button 
                      onClick={() => setWishlistOpen(false)}
                      className="p-1 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Items List */}
                  <div className="flex-1 overflow-y-auto py-6 px-6 divide-y divide-neutral-100 scrollbar-none">
                    {wishlist.length === 0 ? (
                      <div className="text-center py-20">
                        <span className="text-5xl block mb-4">❤️</span>
                        <h4 className="text-sm font-bold text-neutral-700">Wishlist empty</h4>
                        <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
                          Tap the heart icon on any smartphone or TV screen to preserve it here.
                        </p>
                      </div>
                    ) : (
                      wishlist.map((item) => (
                        <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="w-14 h-14 bg-neutral-50 border border-neutral-100 p-1 bg-white rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="max-h-11 max-w-full object-contain select-none" referrerPolicy="no-referrer" />
                              ) : (
                                <span className="text-2xl select-none">{item.emoji}</span>
                              )}
                            </span>
                            <div>
                              <h4 className="text-xs font-bold text-neutral-800 line-clamp-1">{item.name}</h4>
                              <p className="text-[10px] text-neutral-400 uppercase font-bold">{item.brand}</p>
                              <span className="text-xs font-extrabold text-neutral-900 block mt-0.5">OMR {item.price.toFixed(3)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => {
                                handleAddToCart(item);
                                setWishlistOpen(false);
                              }}
                              className="px-3.5 py-1.5 bg-neutral-900 hover:bg-sky-600 text-white rounded-md text-[10px] font-bold transition flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Cart</span>
                            </button>
                            <button
                              onClick={() => handleToggleWishlist(item)}
                              className="p-1 text-neutral-400 hover:text-red-500 transition"
                              title="Delete from wishlist"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-6 bg-neutral-50 border-t border-neutral-100">
                    <button 
                      onClick={() => setWishlistOpen(false)}
                      className="w-full py-3.5 bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase text-center"
                    >
                      Close Saved List
                    </button>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* DIALOG DIALOG: PRODUCT SPECIFICATION QUICK VIEW */}
      {/* ========================================= */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            
            {/* Background overlay */}
            <div className="fixed inset-0 bg-neutral-900/60 transition-opacity backdrop-blur-xs" onClick={() => setQuickViewProduct(null)}></div>
            
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

            <div className="relative inline-block transform overflow-hidden rounded-3xl bg-white text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle animate-zoom-in">
              
              <div className="bg-white px-6 pt-6 pb-4 sm:p-8">
                
                {/* Close top button */}
                <button 
                  onClick={() => setQuickViewProduct(null)}
                  className="absolute right-4 top-4 p-1 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition"
                >
                  <X className="w-5.5 h-5.5" />
                </button>

                <div className="sm:flex sm:items-start gap-8">
                  
                  {/* Left Side big Image or Emoji graphic */}
                  <div className="w-32 h-32 sm:w-44 sm:h-44 bg-neutral-50 rounded-2xl flex items-center justify-center overflow-hidden p-4 select-none mx-auto border border-neutral-100 shrink-0 mb-6 sm:mb-0 relative shadow-sm bg-white">
                    {quickViewProduct.image ? (
                      <img src={quickViewProduct.image} alt={quickViewProduct.name} className="max-h-full max-w-full object-contain select-none" referrerPolicy="no-referrer" />
                    ) : (
                      <>
                        <span className="text-7xl sm:text-8xl select-none">{quickViewProduct.emoji}</span>
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-black/5 blur-md rounded-full"></div>
                      </>
                    )}
                  </div>

                  {/* Right Side Info */}
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-sky-600 tracking-wider uppercase bg-sky-50 py-0.5 px-2 rounded-sm inline-block mb-1">
                      {quickViewProduct.brand} Premium Range
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight leading-snug">
                      {quickViewProduct.name}
                    </h3>

                    {/* Stars */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${
                              i < Math.floor(quickViewProduct.rating) 
                                ? 'text-amber-500 fill-amber-500' 
                                : 'text-neutral-200'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-neutral-700">{quickViewProduct.rating} Stars</span>
                      <span className="text-xs text-neutral-400">({quickViewProduct.reviews} verified buyer reviews)</span>
                    </div>

                    <p className="text-xs text-neutral-500 leading-relaxed mt-4">
                      {quickViewProduct.description}
                    </p>

                    {/* Pricing */}
                    <div className="bg-neutral-50 rounded-xl p-4 mt-5 flex items-center justify-between border border-neutral-100">
                      <div>
                        <span className="text-xs text-neutral-400 block">Immediate Cash Price</span>
                        <span className="text-lg font-black text-neutral-950">OMR {quickViewProduct.price.toFixed(3)}</span>
                      </div>
                      {quickViewProduct.oldPrice && (
                        <div className="text-right">
                          <span className="text-xs text-neutral-400 block line-through">OMR {quickViewProduct.oldPrice.toFixed(3)}</span>
                          <span className="text-[10px] text-red-500 font-extrabold whitespace-nowrap bg-red-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                            SAVE OMR {(quickViewProduct.oldPrice - quickViewProduct.price).toFixed(3)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Notify me of price drops */}
                    <button
                      type="button"
                      onClick={() => handleTogglePriceAlert(quickViewProduct)}
                      id={`price-alert-modal-${quickViewProduct.id}`}
                      className={`w-full mt-3 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 border cursor-pointer ${
                        priceAlertSubscriptions.includes(quickViewProduct.id)
                          ? 'bg-amber-500/10 border-amber-300 text-amber-700 hover:bg-amber-500/15 animate-pulse'
                          : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950 shadow-xs'
                      }`}
                    >
                      <Bell className={`w-4 h-4 ${priceAlertSubscriptions.includes(quickViewProduct.id) ? 'fill-amber-400 text-amber-500' : ''}`} />
                      <span>
                        {priceAlertSubscriptions.includes(quickViewProduct.id)
                          ? 'Active: Subscribed to Price Drops'
                          : 'Notify Me of Price Drops'}
                      </span>
                    </button>

                    {/* Compare side-by-side specs */}
                    <button
                      type="button"
                      onClick={() => handleToggleCompare(quickViewProduct)}
                      id={`compare-modal-${quickViewProduct.id}`}
                      className={`w-full mt-2.5 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 border cursor-pointer ${
                        compareIds.includes(quickViewProduct.id)
                          ? 'bg-sky-500/10 border-sky-300 text-sky-700 hover:bg-sky-500/15'
                          : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950 shadow-xs'
                      }`}
                    >
                      <GitCompare className={`w-4 h-4 ${compareIds.includes(quickViewProduct.id) ? 'text-sky-500' : ''}`} />
                      <span>
                        {compareIds.includes(quickViewProduct.id)
                          ? 'Active: Subscribed to Side-by-Side Comparison'
                          : 'Compare Side-by-Side (Select up to 3)'}
                      </span>
                    </button>

                    {/* Tabs Segment */}
                    <div className="mt-6 border-b border-neutral-100 flex gap-4">
                      <button
                        type="button"
                        onClick={() => setQuickViewTab('specs')}
                        className={`pb-2 text-xs font-bold tracking-wider uppercase border-b-2 transition cursor-pointer ${
                          quickViewTab === 'specs'
                            ? 'border-sky-600 text-sky-700 font-extrabold'
                            : 'border-transparent text-neutral-400 hover:text-neutral-700'
                        }`}
                      >
                        Specs & Hardware
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickViewTab('reviews')}
                        className={`pb-2 text-xs font-bold tracking-wider uppercase border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                          quickViewTab === 'reviews'
                            ? 'border-sky-600 text-sky-700 font-extrabold'
                            : 'border-transparent text-neutral-400 hover:text-neutral-700'
                        }`}
                      >
                        <span>Verified Reviews</span>
                        <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-[10px] text-neutral-500">
                          {reviews.filter(r => r.productId === quickViewProduct.id).length}
                        </span>
                      </button>
                    </div>

                    {/* Tab 1: Specs */}
                    {quickViewTab === 'specs' && (
                      <div className="mt-5">
                        <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2.5">Detailed Features & Hardware</h4>
                        <ul className="space-y-1.5">
                          {quickViewProduct.specs.map((spec, i) => (
                            <li key={i} className="text-xs font-medium text-neutral-600 flex items-center gap-2">
                              <span className="text-sky-500 text-sm">✓</span>
                              <span>{spec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Tab 2: Reviews */}
                    {quickViewTab === 'reviews' && (
                      <ReviewsSection 
                        productId={quickViewProduct.id}
                        reviews={reviews.filter(r => r.productId === quickViewProduct.id)}
                        hasPurchased={hasPurchasedProduct(quickViewProduct.id)}
                        onAddReview={(userName, rating, comment) => handleAddReview(quickViewProduct.id, userName, rating, comment)}
                      />
                    )}

                  </div>

                </div>

              </div>

              {/* Quick View Actions */}
              <div className="bg-neutral-50 px-6 py-4.5 sm:flex sm:flex-row-reverse sm:px-8 gap-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => {
                    handleAddToCart(quickViewProduct);
                    setQuickViewProduct(null);
                  }}
                  className="inline-flex w-full justify-center rounded-xl bg-neutral-900 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-sky-600 transition sm:ml-3 sm:w-auto"
                >
                  Add to shopping cart
                </button>
                <button
                  type="button"
                  onClick={() => setQuickViewProduct(null)}
                  className="mt-3 inline-flex w-full justify-center rounded-xl bg-white border border-neutral-200 px-5 py-3 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition sm:mt-0 sm:w-auto"
                >
                  Go Back
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* DIALOG DIALOG: SECURE INTERACTIVE CHECKOUT FORM */}
      {/* ========================================= */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            
            <div className="fixed inset-0 bg-neutral-900/60 transition-opacity backdrop-blur-xs" onClick={() => setCheckoutOpen(false)}></div>
            
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

            <div className="relative inline-block transform overflow-hidden rounded-3xl bg-white text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-xl sm:align-middle animate-zoom-in">
              
              <div className="bg-white px-6 pt-6 pb-4 sm:p-8">
                
                <button 
                  onClick={() => setCheckoutOpen(false)}
                  className="absolute right-4 top-4 p-1 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition"
                >
                  <X className="w-5.5 h-5.5" />
                </button>

                <h3 className="text-lg font-black text-neutral-900 tracking-tight flex items-center gap-1.5 mb-2">
                  <MapPin className="w-5 h-5 text-sky-600" />
                  <span>Sultanate of Oman Secure Checkout</span>
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed max-w-sm mb-6">
                  Provide your Omani home delivery address. We offer Cash on Delivery across all 11 Governorates.
                </p>

                <form onSubmit={handlePlaceOrder} className="space-y-4 text-xs font-bold text-neutral-700">
                  
                  {/* Full Name */}
                  <div>
                    <label className="block text-neutral-600 mb-1 font-semibold text-xs">Customer Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Salim Al Harthy"
                      value={billing.fullName}
                      onChange={(e) => setBilling(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full p-3 rounded-lg border border-neutral-200 bg-neutral-50/50 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                    />
                  </div>

                  {/* Phone & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-neutral-600 mb-1 font-semibold text-xs">Omani Mobile Number (GSM) *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +968 9123 4567"
                        value={billing.phone}
                        onChange={(e) => setBilling(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full p-3 rounded-lg border border-neutral-200 bg-neutral-50/50 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-600 mb-1 font-semibold text-xs">Notification Email Address</label>
                      <input
                        type="email"
                        placeholder="e.g. salim@gmail.com"
                        value={billing.email}
                        onChange={(e) => setBilling(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full p-3 rounded-lg border border-neutral-200 bg-neutral-50/50 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                      />
                    </div>
                  </div>

                  {/* Governorate dropdown selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-neutral-600 mb-1 font-semibold text-xs">Oman Governorate *</label>
                      <select
                        value={billing.governorate}
                        onChange={(e) => setBilling(prev => ({ ...prev, governorate: e.target.value }))}
                        className="w-full p-3 rounded-lg border border-neutral-200 bg-neutral-50/50 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                      >
                        {OMAN_GOVERNORATES.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-neutral-600 mb-1 font-semibold text-xs">City or Town / Wilayat *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Muscat / Seeb / Al Khuwair"
                        value={billing.city}
                        onChange={(e) => setBilling(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full p-3 rounded-lg border border-neutral-200 bg-neutral-50/50 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                      />
                    </div>
                  </div>

                  {/* Street address */}
                  <div>
                    <label className="block text-neutral-600 mb-1 font-semibold text-xs">Street / Way Number, House, Block Address *</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="e.g. Way 2901, House 14, Al Ghubrah South, near Sultan Qaboos Grand Mosque"
                      value={billing.addressLines}
                      onChange={(e) => setBilling(prev => ({ ...prev, addressLines: e.target.value }))}
                      className="w-full p-3 rounded-lg border border-neutral-200 bg-neutral-50/50 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                    ></textarea>
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="block text-neutral-600 mb-2 font-semibold text-xs">Payment Guarantee Mode *</label>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      
                      <label className={`p-4 rounded-xl border flex flex-col gap-1 cursor-pointer transition ${
                        billing.paymentMethod === 'cod' 
                          ? 'border-neutral-900 bg-neutral-50' 
                          : 'border-neutral-200 bg-white hover:bg-neutral-50'
                      }`}>
                        <input
                          type="radio"
                          name="payment"
                          value="cod"
                          className="sr-only"
                          checked={billing.paymentMethod === 'cod'}
                          onChange={() => setBilling(prev => ({ ...prev, paymentMethod: 'cod' }))}
                        />
                        <span className="font-extrabold text-neutral-950 block">Cash on Delivery (COD)</span>
                        <span className="text-[10px] text-neutral-400 font-normal">Pay Omani Rials upon delivery</span>
                      </label>

                      <label className={`p-4 rounded-xl border flex flex-col gap-1 cursor-pointer transition ${
                        billing.paymentMethod === 'card' 
                          ? 'border-neutral-900 bg-neutral-50' 
                          : 'border-neutral-200 bg-white hover:bg-neutral-50'
                      }`}>
                        <input
                          type="radio"
                          name="payment"
                          value="card"
                          className="sr-only"
                          checked={billing.paymentMethod === 'card'}
                          onChange={() => setBilling(prev => ({ ...prev, paymentMethod: 'card' }))}
                        />
                        <span className="font-extrabold text-neutral-950 block">Debit / Credit Card (0%)</span>
                        <span className="text-[10px] text-neutral-400 font-normal">Fast, safe bank check-out</span>
                      </label>

                    </div>
                  </div>

                  {/* Summary row */}
                  <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 mt-6 space-y-1.5 font-semibold text-xs">
                    <div className="flex justify-between text-neutral-500">
                      <span>Total OMR items value:</span>
                      <span>OMR {cartSubtotal.toFixed(3)}</span>
                    </div>
                    {deliveryFee > 0 && (
                      <div className="flex justify-between text-neutral-500">
                        <span>Oman postal shipping fee:</span>
                        <span>OMR {deliveryFee.toFixed(3)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-neutral-950 border-t border-neutral-200 pt-2.5">
                      <span>Grand Total OMR Payable:</span>
                      <span>OMR {cartTotal.toFixed(3)}</span>
                    </div>
                  </div>

                  {/* Place simulated order */}
                  <div className="pt-4 flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 py-3.5 bg-neutral-900 text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-sky-600 transition-all text-center flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirm & Book Order Now</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCheckoutOpen(false)}
                      className="px-5 py-3.5 border border-neutral-200 text-neutral-700 font-bold rounded-xl text-xs uppercase hover:bg-neutral-50 transition"
                    >
                      Cancel
                    </button>
                  </div>

                </form>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* DRAWER: PERSISTENT SIDEBAR AI SHOPPING ADVISOR */}
      {/* ========================================= */}
      {advisorOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            
            {/* Backdrop slide-over */}
            <div className="absolute inset-0 bg-neutral-900/60 transition-opacity backdrop-blur-xs" onClick={() => setAdvisorOpen(false)}></div>
            
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md animate-slide-left">
                <div className="flex h-full flex-col bg-white shadow-2xl">
                  
                  {/* AI Header */}
                  <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-950 text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center">
                        <Sparkle className="w-4 h-4 text-emerald-400 animate-spin-slow" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold">BuyOman AI Shopping Advisor</h2>
                        <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">Powered by Gemini 3.5-flash</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setAdvisorOpen(false)}
                      className="p-1 rounded-full text-neutral-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Messages container list */}
                  <div className="flex-1 overflow-y-auto py-6 px-4 space-y-4 bg-neutral-50/70 scrollbar-none">
                    {chatMessages.map((msg, index) => {
                      const isAss = msg.sender === 'assistant';
                      return (
                        <div key={index} className={`flex max-w-[85%] flex-col ${isAss ? 'mr-auto' : 'ml-auto'}`}>
                          
                          <div className={`p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
                            isAss 
                              ? 'bg-white text-neutral-800 border border-neutral-100 rounded-tl-sm' 
                              : 'bg-neutral-900 text-white rounded-tr-sm'
                          }`}>
                            {/* Simple text formatting replacement for premium markdown presentation */}
                            <p className="whitespace-pre-line">
                              {msg.text}
                            </p>
                          </div>

                          <span className={`text-[9px] text-neutral-400 mt-1 pl-1 ${!isAss && 'text-right pr-1'}`}>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>

                        </div>
                      );
                    })}

                    {/* Loader */}
                    {aiLoading && (
                      <div className="flex max-w-[80%] mr-auto items-center gap-2 bg-white border border-neutral-100 p-4 rounded-2xl text-xs text-neutral-500">
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                        </span>
                        <span>AI Advisor is consulting the active BuyOman catalog specs...</span>
                      </div>
                    )}
                  </div>

                  {/* Prompt Action tags */}
                  <div className="p-3 bg-neutral-100/50 border-t border-neutral-100 scrollbar-none overflow-x-auto flex gap-1.5 whitespace-nowrap">
                    {QUICK_QUESTIONS.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setUserInput(q);
                        }}
                        className="px-3 py-1.5 bg-white hover:bg-sky-50 border border-neutral-200 hover:border-sky-300 text-neutral-600 hover:text-sky-800 rounded-full text-[10px] font-bold transition active:scale-95"
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  {/* Chat Input row */}
                  <form onSubmit={handleSendAiMessage} className="p-4 bg-white border-t border-neutral-100">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Compare specs, look up AC sizes, smartphones..."
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        disabled={aiLoading}
                        className="w-full pl-4 pr-12 py-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-900 disabled:opacity-50"
                      />
                      <button
                        type="submit"
                        disabled={!userInput.trim() || aiLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-neutral-900 text-white rounded-lg hover:bg-sky-600 disabled:opacity-30 disabled:hover:bg-neutral-900 transition shrink-0"
                        title="Submit message"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>

                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* DRAWER: PERSISTENT CODES & CUSTOM PAST ORDERS */}
      {/* ========================================= */}
      <OrderHistory
        isOpen={ordersOpen}
        onClose={() => setOrdersOpen(false)}
        orders={orders}
        onTrackOrder={(order) => {
          setActiveTrackingOrder(order);
          setOrdersOpen(false);
          // Scroll smoothly to active tracking sandbox
          setTimeout(() => {
            const trackingSec = document.getElementById('tracking-sandbox');
            if (trackingSec) {
              trackingSec.scrollIntoView({ behavior: 'smooth' });
            }
          }, 300);
        }}
        onAdvanceStatus={handleAdvanceShipment}
        onWriteReview={(p) => {
          setOrdersOpen(false);
          setQuickViewTab('reviews');
          setQuickViewProduct(p);
        }}
      />

      {/* ========================================= */}
      {/* DRAWER: ADMIN OPERATIONS CATALOG CONTROL   */}
      {/* ========================================= */}
      <AdminDashboard
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        products={products}
        onUpdateProducts={setProducts}
        orders={orders}
        onUpdateOrders={setOrders}
        onAdvanceOrderStatus={handleAdvanceShipment}
        onTriggerToast={triggerToast}
      />

      {/* ========================================= */}
      {/* FLOATING ACTION BAR: COMPARISON TRAY */}
      {/* ========================================= */}
      {compareIds.length > 0 && (
        <div 
          id="product-comparison-tray"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-neutral-200/80 p-3.5 flex flex-col sm:flex-row items-center gap-4 justify-between max-w-3xl w-[92%] animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <div className="flex items-center gap-3.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            <span className="text-xs font-black text-neutral-805 flex items-center gap-1.5 shrink-0 bg-neutral-100 px-2.5 py-1.5 rounded-lg border border-neutral-200/50">
              <GitCompare className="w-4 h-4 text-sky-600 animate-pulse bg-white p-0.5 rounded-full" />
              <span>Comparing ({compareIds.length}/3)</span>
            </span>

            <div className="flex items-center gap-2">
              {products.filter(p => compareIds.includes(p.id)).map((p) => (
                <div 
                  key={p.id}
                  className="flex items-center gap-1.5 bg-sky-50 border border-sky-100 rounded-lg py-1 pl-2 pr-1.5 text-xs font-bold text-neutral-800 transition shrink-0"
                >
                  <span className="text-base select-none">{p.emoji}</span>
                  <span className="truncate max-w-[100px] sm:max-w-[140px] text-[11px] font-extrabold text-sky-900">{p.name}</span>
                  <button
                    onClick={() => handleToggleCompare(p)}
                    className="p-0.5 rounded-full text-sky-400 hover:text-sky-700 hover:bg-sky-100 transition cursor-pointer"
                    title="Remove item"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => {
                setCompareIds([]);
                triggerToast('⚖️ Cleared all compare selections.');
              }}
              className="flex-1 sm:flex-initial py-2 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-xl text-xs font-extrabold transition cursor-pointer"
            >
              Clear All
            </button>
            <button
              onClick={() => setCompareModalOpen(true)}
              className="flex-1 sm:flex-initial py-2 px-5 bg-sky-700 hover:bg-sky-850 text-white rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg transition flex items-center gap-1.5 justify-center cursor-pointer animate-brightness"
            >
              <span>Compare side-by-side</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL: COMPARISON SIDE-BY-SIDE MATRIX */}
      {/* ========================================= */}
      {compareModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-6 md:p-10">
            
            {/* Backdrop overlay */}
            <div className="fixed inset-0 bg-neutral-900/60 transition-opacity backdrop-blur-xs" onClick={() => setCompareModalOpen(false)}></div>
            
            {/* Modal Body wrapper */}
            <div className="relative inline-block w-full max-w-5xl transform overflow-hidden rounded-3xl bg-white text-left align-middle shadow-2xl transition-all animate-zoom-in border border-neutral-105 flex flex-col my-8">
              
              {/* Header */}
              <div className="bg-white px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-neutral-900 flex items-center gap-2">
                    <span className="p-1 px-2 bg-sky-50 text-sky-600 font-extrabold rounded-md text-xs">⚖️ Compare</span>
                    <span>Specifications Comparison Matrix</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">Comparing {compareIds.length} premium products. Use our tool to decide features, processors, and hardware side-by-side.</p>
                </div>
                <button
                  onClick={() => setCompareModalOpen(false)}
                  className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition cursor-pointer"
                  title="Close Comparison"
                >
                  <X className="w-5.5 h-5.5" />
                </button>
              </div>

              {/* Table / Grid Content */}
              <div className="px-6 py-6 overflow-x-auto">
                {products.filter(p => compareIds.includes(p.id)).length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-4xl block mb-2">⚖️</span>
                    <h5 className="text-sm font-bold text-neutral-700">No products configured for comparison.</h5>
                    <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">Click the GitCompare circle button on any product card in the catalog to add items side-by-side.</p>
                    <button
                      onClick={() => setCompareModalOpen(false)}
                      className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold"
                    >
                      Browse Catalog
                    </button>
                  </div>
                ) : (
                  <div className="min-w-[650px]">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-100 bg-neutral-50/50">
                          <th className="w-[180px] p-4 text-left text-xs font-bold text-neutral-400 uppercase tracking-widest leading-loose">
                            Product Attributes
                          </th>
                          {products.filter(p => compareIds.includes(p.id)).map((p) => (
                            <th key={p.id} className="p-4 text-left font-bold text-neutral-900 relative">
                              <button
                                onClick={() => handleToggleCompare(p)}
                                className="absolute top-2 right-2 p-1 text-neutral-400 hover:text-red-500 hover:bg-neutral-100 rounded-full transition cursor-pointer"
                                title="Remove from comparison"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                              <div className="flex flex-col items-center text-center pt-2">
                                <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-xs select-none border border-neutral-100 bg-white">
                                  {p.image ? (
                                    <img src={p.image} alt={p.name} className="max-h-12 max-w-full object-contain" />
                                  ) : p.emoji}
                                </div>
                                <span className="text-[10px] uppercase font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full inline-block mb-1">
                                  {p.brand}
                                </span>
                                <h4 className="text-xs font-black text-neutral-900 leading-snug line-clamp-1 max-w-[180px]">
                                  {p.name}
                                </h4>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {/* Rating Row */}
                        <tr className="border-b border-neutral-100 hover:bg-neutral-50/20 transition-colors">
                          <td className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                            Consumer Rating
                          </td>
                          {products.filter(p => compareIds.includes(p.id)).map((p) => (
                            <td key={p.id} className="p-4 text-xs">
                              <div className="flex items-center gap-1.5 font-bold text-neutral-800">
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                <span>{p.rating} / 5.0</span>
                                <span className="text-[10px] text-neutral-400 font-medium">({p.reviews} reviews)</span>
                              </div>
                            </td>
                          ))}
                        </tr>

                        {/* Price point */}
                        <tr className="border-b border-neutral-100 bg-neutral-50/20 hover:bg-neutral-100/20 transition-colors">
                          <td className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                            Price & Saving
                          </td>
                          {products.filter(p => compareIds.includes(p.id)).map((p) => (
                            <td key={p.id} className="p-4 text-xs">
                              <div className="flex flex-col">
                                <span className="text-sm font-extrabold text-neutral-900">
                                  OMR {p.price.toFixed(3)}
                                </span>
                                {p.oldPrice && (
                                  <span className="text-[10px] text-neutral-400 line-through">
                                    OMR {p.oldPrice.toFixed(3)} (Save {Math.round(((p.oldPrice - p.price)/p.oldPrice) * 100)}%)
                                  </span>
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>

                        {/* Category */}
                        <tr className="border-b border-neutral-100 hover:bg-neutral-50/20 transition-colors">
                          <td className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                            Category Tab
                          </td>
                          {products.filter(p => compareIds.includes(p.id)).map((p) => (
                            <td key={p.id} className="p-4 text-xs font-extrabold uppercase text-neutral-600">
                              <span className="bg-neutral-100 px-2 py-1 rounded-md text-[10px]">
                                {p.category}
                              </span>
                            </td>
                          ))}
                        </tr>

                        {/* CPU / Processor / RAM / Memory */}
                        <tr className="border-b border-neutral-100 bg-neutral-50/10 hover:bg-neutral-50/20 transition-colors">
                          <td className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                            Chip & Performance
                          </td>
                          {products.filter(p => compareIds.includes(p.id)).map((p) => (
                            <td key={p.id} className="p-4 text-xs text-neutral-700 font-semibold">
                              <div className="flex items-start gap-1.5">
                                <span className="text-sky-600 text-xs">⚡</span>
                                <span>{getSpecDetail(p, 'performance')}</span>
                              </div>
                            </td>
                          ))}
                        </tr>

                        {/* Screen / Display Spec */}
                        <tr className="border-b border-neutral-100 hover:bg-neutral-50/20 transition-colors">
                          <td className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                            Display / Optics
                          </td>
                          {products.filter(p => compareIds.includes(p.id)).map((p) => (
                            <td key={p.id} className="p-4 text-xs text-neutral-700 font-semibold">
                              <div className="flex items-start gap-1.5">
                                <span className="text-sky-600 text-xs">🖥️</span>
                                <span>{getSpecDetail(p, 'display')}</span>
                              </div>
                            </td>
                          ))}
                        </tr>

                        {/* Battery, cooling / Power */}
                        <tr className="border-b border-neutral-100 bg-neutral-50/10 hover:bg-neutral-50/20 transition-colors">
                          <td className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                            Power, Save & Battery
                          </td>
                          {products.filter(p => compareIds.includes(p.id)).map((p) => (
                            <td key={p.id} className="p-4 text-xs text-neutral-700 font-semibold">
                              <div className="flex items-start gap-1.5">
                                <span className="text-sky-600 text-xs">🔋</span>
                                <span>{getSpecDetail(p, 'battery')}</span>
                              </div>
                            </td>
                          ))}
                        </tr>

                        {/* Camera details */}
                        <tr className="border-b border-neutral-100 hover:bg-neutral-50/20 transition-colors">
                          <td className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                            Camera / Audio
                          </td>
                          {products.filter(p => compareIds.includes(p.id)).map((p) => (
                            <td key={p.id} className="p-4 text-xs text-neutral-700 font-semibold">
                              <div className="flex items-start gap-1.5">
                                <span className="text-sky-600 text-xs">📸</span>
                                <span>{getSpecDetail(p, 'camera_audio')}</span>
                              </div>
                            </td>
                          ))}
                        </tr>

                        {/* Extra features */}
                        <tr className="border-b border-neutral-100 bg-neutral-50/10 hover:bg-neutral-50/20 transition-colors">
                          <td className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                            Hardware & Design
                          </td>
                          {products.filter(p => compareIds.includes(p.id)).map((p) => (
                            <td key={p.id} className="p-4 text-xs text-neutral-700 font-semibold">
                              <div className="flex items-start gap-1.5">
                                <span className="text-sky-600 text-xs">✨</span>
                                <span>{getSpecDetail(p, 'extra')}</span>
                              </div>
                            </td>
                          ))}
                        </tr>

                        {/* Description Summary */}
                        <tr className="border-b border-neutral-100 hover:bg-neutral-50/20 transition-colors">
                          <td className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                            Product Description
                          </td>
                          {products.filter(p => compareIds.includes(p.id)).map((p) => (
                            <td key={p.id} className="p-4 text-xs text-neutral-500 leading-relaxed max-w-[220px]">
                              {p.description}
                            </td>
                          ))}
                        </tr>

                        {/* CTA Order Button */}
                        <tr className="bg-neutral-50/25">
                          <td className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                            Action
                          </td>
                          {products.filter(p => compareIds.includes(p.id)).map((p) => (
                            <td key={p.id} className="p-4">
                              <div className="flex flex-col gap-2">
                                <button
                                  onClick={() => {
                                    handleAddToCart(p);
                                    triggerToast(`🛒 Added ${p.name} directly from specifications comparison!`);
                                  }}
                                  className="w-full py-2.5 px-4 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-extrabold shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <ShoppingCart className="w-3.5 h-3.5" />
                                  <span>Add to Cart</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setQuickViewTab('specs');
                                    setQuickViewProduct(p);
                                    setCompareModalOpen(false);
                                  }}
                                  className="w-full py-2 px-4 bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-700 rounded-xl text-xs font-extrabold transition cursor-pointer"
                                >
                                  Full Specifications
                                </button>
                              </div>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-neutral-50 px-6 py-4.5 sm:flex sm:flex-row-reverse sm:px-8 border-t border-neutral-100 gap-2">
                <button
                  type="button"
                  onClick={() => setCompareModalOpen(false)}
                  className="inline-flex w-full justify-center rounded-xl bg-neutral-900 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-sky-600 transition sm:ml-3 sm:w-auto cursor-pointer"
                >
                  Close Matrix
                </button>
                {products.filter(p => compareIds.includes(p.id)).length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setCompareIds([]);
                      setCompareModalOpen(false);
                      triggerToast('⚖️ Comparison lists reset.');
                    }}
                    className="mt-3 inline-flex w-full justify-center rounded-xl bg-white border border-neutral-200 px-5 py-3 text-xs font-bold text-neutral-500 hover:text-red-650 hover:bg-neutral-50 transition sm:mt-0 sm:w-auto cursor-pointer"
                  >
                    Clear Comparison List
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
