/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from './types.ts';

export const PRODUCTS_DATA: Product[] = [
  {
    id: 1,
    name: "iPhone 15 Pro Max (256GB)",
    brand: "Apple",
    emoji: "📱",
    price: 459.900,
    oldPrice: 499.900,
    rating: 4.9,
    reviews: 1420,
    badge: "new",
    category: "mobile",
    description: "Forged in aerospace-grade titanium, featuring the revolutionary A17 Pro chip, customizable Action button, and the most powerful iPhone camera system ever with 5x optical zoom.",
    specs: ["Titanium Design", "A17 Pro Bionic Chip", "6.7-inch Super Retina XDR", "48MP Pro Camera System", "USB-C Connector"]
  },
  {
    id: 2,
    name: "Samsung Galaxy S24 Ultra (512GB)",
    brand: "Samsung",
    emoji: "📱",
    price: 389.900,
    oldPrice: 449.900,
    rating: 4.8,
    reviews: 987,
    badge: "hot",
    category: "mobile",
    description: "Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, you can unleash whole new levels of creativity, productivity and possibility, backed by built-in S Pen.",
    specs: ["Built-in S Pen", "Snapdragon 8 Gen 3 for Galaxy", "200MP Quad Telephoto Zoom", "Dynamic AMOLED 2X Display", "5000mAh Battery"]
  },
  {
    id: 3,
    name: "MacBook Pro 14\" M3 (16GB/512GB)",
    brand: "Apple",
    emoji: "💻",
    price: 689.000,
    oldPrice: 749.000,
    rating: 4.9,
    reviews: 654,
    badge: "new",
    category: "laptop",
    description: "The 14-inch MacBook Pro blasts forward with M3, an incredibly advanced chip that brings serious speed and capability for daily productivity, coding, and casual gaming.",
    specs: ["Apple M3 Chip", "16GB Unified Memory", "Liquid Retina XDR Display", "Up to 22 Hours Battery Life", "Space Gray Premium Finish"]
  },
  {
    id: 4,
    name: "Samsung Neo QLED 8K Smart TV 65\"",
    brand: "Samsung",
    emoji: "📺",
    price: 899.000,
    oldPrice: 1099.000,
    rating: 4.7,
    reviews: 210,
    badge: "sale",
    category: "tv",
    description: "Immerse yourself deep inside ultra-sharp 8K resolution, powered by Neo Quantum HDR 8K+ and AI-powered upscaling technology that makes everything look jaw-droppingly vivid.",
    specs: ["Real 8K Resolution", "Quantum Matrix Technology Pro", "Object Tracking Sound+ (OTS+)", "Smart Hub & Gaming Hub", "Anti-Reflection Panel"]
  },
  {
    id: 5,
    name: "Sony WH-1000XM5 ANC Headphones",
    brand: "Sony",
    emoji: "🎧",
    price: 89.900,
    oldPrice: 129.900,
    rating: 4.9,
    reviews: 3120,
    badge: "best",
    category: "accessory",
    description: "With two processors controlling eight microphones, Auto NC Optimizer for automatically optimizing noise canceling, and a specially designed driver unit, experience next-level acoustic bliss.",
    specs: ["Auto NC Optimizer Noise Canceling", "Custom 30mm Driver Unit", "Up to 30-Hour Battery with Quick Charge", "Ultra-comfortable Lightweight Design", "High-Resolution Audio Wireless"]
  },
  {
    id: 6,
    name: "LG DUAL Inverter AC Split 2.0 Ton",
    brand: "LG",
    emoji: "❄️",
    price: 199.000,
    oldPrice: 259.000,
    rating: 4.6,
    reviews: 435,
    badge: "sale",
    category: "air_conditin",
    description: "Combat the Omani summer heat easily with LG’s DUAL Inverter Compressor. Save up to 70% energy while enjoying high-speed cooling and reliable anti-corrosive Gold Fin technology.",
    specs: ["DUAL Inverter Compressor", "Fast Cooling & Energy Saving", "Gold Fin Anti-Corrosion Shield", "Super Silent Operation", "Tropical T3 Compressor Tested"]
  },
  {
    id: 7,
    name: "Xiaomi 14 Ultra 5G (512GB)",
    brand: "Xiaomi",
    emoji: "📱",
    price: 329.900,
    oldPrice: 369.900,
    rating: 4.7,
    reviews: 145,
    badge: "hot",
    category: "mobile",
    description: "Co-engineered with Leica, featuring a legendary quad-camera system with a 1-inch main sensor and infinite variable aperture for professional film-quality photography right on your phone.",
    specs: ["Leica Leica Summilux Optics", "Snapdragon 8 Gen 3", "WQHD+ Dynamic AMOLED", "90W HyperCharge + 80W Wireless", "Xiaomi Guardian Structure Protection"]
  },
  {
    id: 8,
    name: "LG OLED evo C3 Series 55\" 4K TV",
    brand: "LG",
    emoji: "📺",
    price: 489.000,
    oldPrice: 599.000,
    rating: 4.9,
    reviews: 876,
    badge: "best",
    category: "tv",
    description: "The OLED evo C3 is powered by the ultra-powerful Alpha9 Gen6 AI Processor 4K. Experience infinite contrast, perfectly deep blacks, and exceptional brightness for cinema and next-gen gaming.",
    specs: ["Self-Lit OLED Pixels", "Alpha 9 Gen 6 AI Processor 4K", "120Hz Refresh Rate with G-Sync & FreeSync", "Dolby Vision IQ & Dolby Atmos", "LG webOS 23 Smart Platform"]
  },
  {
    id: 9,
    name: "Bosch Serie 6 Front Loader 9kg",
    brand: "Bosch",
    emoji: "🧺",
    price: 169.900,
    oldPrice: 219.900,
    rating: 4.8,
    reviews: 512,
    badge: "sale",
    category: "wasing_machin",
    description: "Bosch washing machine with EcoSilence Drive: enjoy extremely quiet operation and excellent durability. SpeedPerfect decreases cycle duration by up to 65% with optimal clean results.",
    specs: ["9kg Drum Capacity", "EcoSilence Drive Inverter", "SpeedPerfect Speed-up System", "VarioDrum Gentle Fiber Care", "AntiVibration Noise-muffling Sidewalls"]
  },
  {
    id: 10,
    name: "Asus ROG Zephyrus G16 (2024)",
    brand: "Asus",
    emoji: "💻",
    price: 799.000,
    oldPrice: 899.000,
    rating: 4.7,
    reviews: 188,
    badge: "hot",
    category: "laptop",
    description: "A super-slim gaming powerhouse. Features the Intel Core Ultra 9 processor, NVIDIA GeForce RTX 4070 graphics, and a gorgeous ROG Nebula OLED display with G-Sync capabilities.",
    specs: ["Intel Core Ultra 9 Processor", "NVIDIA RTX 4070 8GB GDDR6", "16-inch 2.5K Nebula OLED 240Hz", "32GB LPDDR5X RAM", "ROG Intelligent Cooling Liquid Metal"]
  },
  {
    id: 11,
    name: "Apple Watch Series 10 Titanium",
    brand: "Apple",
    emoji: "⌚",
    price: 189.900,
    oldPrice: 219.900,
    rating: 4.8,
    reviews: 580,
    badge: "new",
    category: "accessory",
    description: "Our thinnest, lightest design yet. Advanced health tracking metrics including ECG, Sleep Apnea notifications, automatic workout detection, and double-tap finger gesture controls.",
    specs: ["Polished Aerospace Titanium Case", "S10 SiP with Dual-Core Processor", "Sleep Apnea & ECG Tracking", "Double Tap Gesture Interface", "Fastest Battery Charging Ever"]
  },
  {
    id: 12,
    name: "Samsung French Door Refrigerator 620L",
    brand: "Samsung",
    emoji: "🧊",
    price: 299.900,
    oldPrice: 359.000,
    rating: 4.7,
    reviews: 195,
    badge: "best",
    category: "fridge",
    description: "Huge capacity smart refrigerator with Twin Cooling Plus technology. Optimizes the temperature and humidity in both fridges and freezers using completely independent cooling circuits.",
    specs: ["620 Litres Raw Capacity", "Twin Cooling Plus Moist Keep", "Smart Conversion 5-in-1 Modes", "Digital Inverter Compressor 20Y Warranty", "Fingerprint Resistant Coat Finish"]
  },
  {
    id: 13,
    name: "Panasonic JetCool Inverter AC 1.5-Ton",
    brand: "Panasonic",
    emoji: "🌬️",
    price: 149.900,
    oldPrice: 179.900,
    rating: 4.7,
    reviews: 215,
    badge: "hot",
    category: "air_conditin",
    description: "Equipped with powerful Nanoe-G air purification and eco-friendly smart inverter. Instantly chills Omani homes with high tropical rating operations.",
    specs: ["1.5-Ton Cooling Capacity", "Super JetCool Rapid Speed", "Nanoe-G Dust & Germ Purifier", "4-Way Auto Swing Comfort", "Blue Fin Tropical Condenser Coat"]
  },
  {
    id: 14,
    name: "Hitachi Multi-Flow Double Door Fridge 450L",
    brand: "Hitachi",
    emoji: "🧊",
    price: 189.900,
    oldPrice: 229.900,
    rating: 4.6,
    reviews: 310,
    badge: "best",
    category: "fridge",
    description: "Advanced multi-air flow distribution ensures constant moisture preservation across the internal 450 Litres storage ecosystem.",
    specs: ["Multi Air Flow Cool Distribution", "450 Litres Net Storage Capacity", "Super Freeze / Fast Chill Dial", "Moisture Balanced Vegetable Crisper", "Eco LED Bright Internal Lighting"]
  },
  {
    id: 15,
    name: "LG SteamDirect Front Load Washer 10kg",
    brand: "LG",
    emoji: "🧼",
    price: 219.900,
    oldPrice: 269.900,
    rating: 4.9,
    reviews: 412,
    badge: "new",
    category: "wasing_machin",
    description: "Premium washer equipped with Direct Drive technology and custom Steam+ cycle designed to completely eliminate allergens and fabric micro-dust.",
    specs: ["6 Motion Direct Drive Motor", "Steam+ Allergy Care Cycle", "AI DD Intelligent Fabric Sensor", "TurboWash 360 Express Clean", "Tempered Heat-Resistant Glass Door"]
  },
  {
    id: 16,
    name: "SuperDry Inverter Condenser Dryer 8kg",
    brand: "Bosch",
    emoji: "👕",
    price: 189.900,
    oldPrice: 219.900,
    rating: 4.8,
    reviews: 140,
    badge: "hot",
    category: "dryer",
    description: "Condenser drying system requiring zero external wall venting. Active moisture mapping prevents any shrinking of your premium fabrics.",
    specs: ["Condenser Drying Tech (No Venting)", "8kg Galvanized Drum Capacity", "SensitiveDrying Wave system", "AutoDry Smart Moisture Monitoring", "AntiVibration Noise-reducing Shield"]
  },
  {
    id: 17,
    name: "SuperChef 5-Burner Gas Range 90x60",
    brand: "LG",
    emoji: "🍳",
    price: 249.900,
    oldPrice: 289.900,
    rating: 4.7,
    reviews: 90,
    badge: "best",
    category: "cooking_rang",
    description: "Full-width cast iron grates and electric convection fan oven. Create premium family banquets in style with rapid heating burners.",
    specs: ["5 Solid Gas Burners with Wok Zone", "90x60cm Full Width Frame", "Dual Fan Convection Electric Oven", "Heavy Duty Cast Iron Pan Supports", "One-Hand Auto Ignitions"]
  },
  {
    id: 18,
    name: "Premium Built-In Convection Oven & Induction Hob Combo",
    brand: "Bosch",
    emoji: "🔥",
    price: 349.900,
    oldPrice: 399.900,
    rating: 4.9,
    reviews: 75,
    badge: "new",
    category: "biltin_coocing_range",
    description: "A gorgeous seamless modular oven combined with a precise induction cooktop. Standard-setting design for clean modern Omani kitchens.",
    specs: ["Built-In 3D HotAir Electric Oven", "4-Zone Touch Induction Hob Combo", "EcoClean Direct Self-cleaning Coating", "Child Safety Automatically Configured", "Sleek Black Aesthetic Premium Glass"]
  },
  {
    id: 19,
    name: "SuperFreez Vertical Deep Freezer 300L",
    brand: "Samsung",
    emoji: "❄️",
    price: 159.900,
    oldPrice: 199.900,
    rating: 4.8,
    reviews: 110,
    badge: "sale",
    category: "freezer",
    description: "Never worry about manual defrosting. Beautiful upright layout with organized storage bays for preserving all of your meat and ingredients safely.",
    specs: ["Auto No Frost Freezing System", "300L Internal Net Volume", "7 Removable Large Drawers", "All-around Cool Air Ducts Distribution", "Internal Digital Tempered Micro-Controller"]
  }
];

export interface SmallAppliance {
  name: string;
  emoji: string;
  brand: string;
  price: number;
  oldPrice: number;
}

export const SMALL_APPLIANCES: SmallAppliance[] = [
  { name: "Philips Essential Airfryer XL", emoji: "🍟", brand: "Philips", price: 39.900, oldPrice: 59.900 },
  { name: "Nespresso Vertuo Pop Coffee Maker", emoji: "☕", brand: "Nespresso", price: 69.900, oldPrice: 89.900 },
  { name: "Dyson V11 Cord-Free Vacuum", emoji: "🧹", brand: "Dyson", price: 179.900, oldPrice: 209.900 },
  { name: "Xiaomi Roborock S8 Robot Cleaner", emoji: "🤖", brand: "Xiaomi", price: 219.900, oldPrice: 259.900 },
  { name: "KitchenAid Artisan Stand Mixer 4.8L", emoji: "🍰", brand: "KitchenAid", price: 149.000, oldPrice: 179.900 },
  { name: "Panasonic Powerful Steam Iron 2400W", emoji: "👕", brand: "Panasonic", price: 19.900, oldPrice: 29.900 }
];

export const OMAN_GOVERNORATES = [
  "Ad Dakhiliyah",
  "Ad Dhahirah",
  "Al Batinah North",
  "Al Batinah South",
  "Al Buraimi",
  "Al Wusta",
  "Ash Sharqiyah North",
  "Ash Sharqiyah South",
  "Muscat (Capital)",
  "Musandam",
  "Dhofar (Salalah)"
];

export const SAMPLE_PROMO_SLIDES = [
  {
    id: 0,
    emoji: "📱",
    eyebrow: "Exclusive Release",
    title: "iPhone 15 Pro Max",
    subtitle: "Forged in titanium. Powered by A17 Pro. Ultimate camera versatility.",
    price: 459.900,
    linkText: "Order Titanium Now",
    bgColor: "linear-gradient(135deg, #0f1016 0%, #1c1x2b 50%, #111424 100%)",
    darkTheme: true,
    prodId: 1
  },
  {
    id: 1,
    emoji: "📺",
    eyebrow: "Samsung Cinema Elite",
    title: "Neo QLED 8K TV",
    subtitle: "8K AI upscaling. Ultra-precise backlight. Immersive object-tracking sound.",
    price: 899.000,
    linkText: "Explore Cinema Display",
    bgColor: "linear-gradient(135deg, #f0f3f8 0%, #dae3f0 100%)",
    darkTheme: false,
    prodId: 4
  },
  {
    id: 2,
    emoji: "❄️",
    eyebrow: "Cooling Masterclass",
    title: "DUAL Inverter Split AC",
    subtitle: "Beat Muscat's highest heat. Save up to 70% electricity with T3 compressor comfort.",
    price: 199.000,
    linkText: "Secure Instant Installation",
    bgColor: "linear-gradient(135deg, #00122e 0%, #033c7c 100%)",
    darkTheme: true,
    prodId: 6
  },
  {
    id: 3,
    emoji: "💻",
    eyebrow: "MacBook Pro M3",
    title: "Liquid Retina Studio",
    subtitle: "High-performance processing. Extended 22-hour battery lifecycle for creators.",
    price: 689.000,
    linkText: "Get Apple Silicon Power",
    bgColor: "linear-gradient(135deg, #fffcf5 0%, #ffe9cf 100%)",
    darkTheme: false,
    prodId: 3
  }
];
