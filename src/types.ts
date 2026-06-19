/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: number;
  name: string;
  brand: string;
  emoji: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  badge?: 'new' | 'sale' | 'hot' | 'best';
  category: 'mobile' | 'laptop' | 'tv' | 'appliance' | 'accessory';
  description: string;
  specs: string[];
  image?: string; // High quality uploaded image (Base64 string)
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface BillingInfo {
  fullName: string;
  phone: string;
  email: string;
  governorate: string;
  city: string;
  addressLines: string;
  paymentMethod: 'cod' | 'card';
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  billingInfo: BillingInfo;
  date: string;
  status: 'pending' | 'preparing' | 'shipped' | 'delivered';
  trackingStep: number; // 0: Pending, 1: Preparing, 2: Shipped, 3: Delivered
  estimatedDelivery: string;
}

export interface Message {
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: Date;
}

export interface Review {
  id: string;
  productId: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  isVerifiedPurchase: boolean;
}

