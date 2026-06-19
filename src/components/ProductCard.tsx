/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Heart, Star, Eye, ShoppingCart, Bell, GitCompare } from 'lucide-react';
import { Product } from '../types.ts';

interface ProductCardProps {
  key?: number;
  product: Product;
  isWishlisted: boolean;
  isPriceAlertSubscribed: boolean;
  isComparing: boolean;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onTogglePriceAlert: (product: Product) => void;
  onToggleCompare: (product: Product) => void;
}

export default function ProductCard({
  product,
  isWishlisted,
  isPriceAlertSubscribed,
  isComparing,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  onTogglePriceAlert,
  onToggleCompare,
}: ProductCardProps) {
  const discountPercentage = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  // Render correct color for tags
  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'new':
        return 'bg-emerald-600 text-white';
      case 'sale':
        return 'bg-red-500 text-white';
      case 'hot':
        return 'bg-amber-500 text-white';
      case 'best':
      default:
        return 'bg-sky-600 text-white';
    }
  };

  return (
    <div 
      className="group bg-white border border-neutral-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full relative"
    >
      {/* Badge (New, Sale, Hot, Best) */}
      {product.badge && (
        <span className={`absolute top-4 left-4 z-10 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${getBadgeStyle(product.badge)}`}>
          {product.badge}
        </span>
      )}

      {/* Action buttons list (Wishlist & Price alert) */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className="w-9 h-9 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full shadow-md flex items-center justify-center text-neutral-500 hover:text-red-500 transition active:scale-90"
          title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
        >
          <Heart 
            className={`w-4.5 h-4.5 transition-colors ${
              isWishlisted ? 'text-red-500 fill-red-500' : 'text-neutral-500'
            }`} 
          />
        </button>

        {/* Notify Price Drop Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePriceAlert(product);
          }}
          id={`price-alert-btn-${product.id}`}
          className="w-9 h-9 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full shadow-md flex items-center justify-center text-neutral-500 hover:text-amber-500 transition active:scale-90"
          title={isPriceAlertSubscribed ? "Stop price drop updates for this item" : "Notify me of price drops"}
        >
          <Bell 
            className={`w-4.5 h-4.5 transition-colors ${
              isPriceAlertSubscribed ? 'text-amber-505 fill-amber-400 text-amber-500' : 'text-neutral-500'
            }`} 
          />
        </button>

        {/* Product Comparison Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompare(product);
          }}
          id={`compare-btn-${product.id}`}
          className={`w-9 h-9 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center transition active:scale-90 ${
            isComparing
              ? 'bg-sky-500 text-white hover:bg-sky-650'
              : 'bg-white/80 hover:bg-white text-neutral-500 hover:text-sky-500'
          }`}
          title={isComparing ? "Remove dynamic specifications comparison" : "Add to side-by-side comparison (Max 3)"}
        >
          <GitCompare className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Image Block: Centered high quality Image or Emoji fallback with ambient color */}
      <div className="h-48 bg-neutral-50/70 py-4 px-4 overflow-hidden flex items-center justify-center relative cursor-zoom-in" onClick={() => onQuickView(product)}>
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            loading="lazy"
            className="max-h-40 max-w-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out select-none"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="text-7xl group-hover:scale-110 transition-transform duration-500 select-none pb-4 relative">
            {product.emoji}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-2 bg-black/5 blur-md rounded-full"></div>
          </div>
        )}
        
        {/* Interactive Overlay */}
        <div className="absolute inset-0 bg-neutral-900/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="p-2.5 bg-white text-neutral-800 rounded-full shadow-lg text-xs font-semibold flex items-center gap-1 hover:bg-neutral-100 active:scale-95 transition"
          >
            <Eye className="w-4 h-4 text-sky-600" />
            <span>Specifications</span>
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Stars */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-400">
              {product.brand}
            </span>
            <div className="flex items-center gap-1 py-0.5 px-2 bg-neutral-50 rounded-md">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-neutral-700">{product.rating}</span>
              <span className="text-[10px] text-neutral-400">({product.reviews})</span>
            </div>
          </div>

          <h3 
            onClick={() => onQuickView(product)}
            className="text-sm font-bold text-neutral-800 tracking-tight leading-snug hover:text-sky-600 transition cursor-pointer mb-2 line-clamp-1"
          >
            {product.name}
          </h3>

          <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed mb-4">
            {product.description}
          </p>

          {/* Premium Specs Highlights */}
          <div className="flex flex-wrap gap-1 mb-4">
            {product.specs.slice(0, 2).map((spec, i) => (
              <span key={i} className="text-[9px] font-medium bg-neutral-100 text-neutral-600 py-0.5 px-2 rounded-sm truncate max-w-[130px]">
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing Block & Action */}
        <div className="border-t border-neutral-50 pt-4 flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base font-extrabold text-neutral-900">
                OMR {product.price.toFixed(3)}
              </span>
              {discountPercentage > 0 && (
                <span className="text-[10px] font-bold text-red-500">
                  -{discountPercentage}%
                </span>
              )}
            </div>

            {product.oldPrice && (
              <span className="text-xs text-neutral-400 line-through">
                OMR {product.oldPrice.toFixed(3)}
              </span>
            )}
          </div>

          {/* Quick Buy Slider */}
          <button
            onClick={() => onAddToCart(product)}
            className="p-3 bg-neutral-900 hover:bg-sky-600 active:scale-90 text-white rounded-xl shadow-md transition-all duration-300 flex items-center justify-center flex-shrink-0"
            title="Quick buy - Add to Cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
