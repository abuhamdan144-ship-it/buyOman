/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShoppingBag, Heart, Search, Menu, X, User, BadgeAlert } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  onCartClick: () => void;
  onWishlistClick: () => void;
  onSearchToggle: () => void;
  onMobileMenuToggle: () => void;
  mobileMenuOpen: boolean;
  searchOpen: boolean;
  onCategoryFilter: (cat: string) => void;
  onAdvisorClick: () => void;
}

export default function Navbar({
  cartCount,
  wishlistCount,
  onCartClick,
  onWishlistClick,
  onSearchToggle,
  onMobileMenuToggle,
  mobileMenuOpen,
  searchOpen,
  onCategoryFilter,
  onAdvisorClick,
}: NavbarProps) {
  return (
    <>
      {/* Top Banner */}
      <div className="bg-neutral-900 text-white text-center py-2 px-4 text-xs font-medium tracking-wide flex justify-center items-center gap-2">
        <span>🇴🇲 FREE DELIVERY ON ORDERS OVER OMR 20 | EXPRESS OMAN governorates SHIPPING</span>
        <button 
          onClick={onAdvisorClick} 
          className="bg-sky-600 hover:bg-sky-500 text-[10px] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse transition ml-2 hidden sm:inline-block"
        >
          Ask AI Advisor
        </button>
      </div>

      {/* Main Navbar */}
      <nav id="navbar" className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-100 transition-all h-20 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-4 lg:px-8 flex justify-between items-center">
          
          {/* Logo */}
          <a 
            href="#" 
            onClick={() => onCategoryFilter('all')}
            className="flex items-center gap-1.5 focus:outline-none select-none"
          >
            <span className="text-2xl font-extrabold tracking-tight text-neutral-900 bg-gradient-to-r from-sky-600 to-sky-400 bg-clip-text text-transparent hover:opacity-90 transition">
              BuyOman
            </span>
            <span className="text-[10px] px-1.5 py-0.5 bg-sky-100 text-sky-700 rounded-sm font-bold tracking-wider">STORE</span>
          </a>

          {/* Desktop Categories */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-neutral-600">
            <button onClick={() => onCategoryFilter('all')} className="hover:text-sky-600 transition focus:outline-none cursor-pointer">Explore All</button>
            <button onClick={() => onCategoryFilter('mobile')} className="hover:text-sky-600 transition focus:outline-none cursor-pointer">Mobiles</button>
            <button onClick={() => onCategoryFilter('laptop')} className="hover:text-sky-600 transition focus:outline-none cursor-pointer">Laptops</button>
            <button onClick={() => onCategoryFilter('tv')} className="hover:text-sky-600 transition focus:outline-none cursor-pointer">TV & Audio</button>
            <button onClick={() => onCategoryFilter('appliance')} className="hover:text-sky-600 transition focus:outline-none cursor-pointer">Smart Appliances</button>
            <button onClick={() => onCategoryFilter('accessory')} className="hover:text-sky-600 transition focus:outline-none cursor-pointer">Accessories</button>
          </div>

          {/* Icons & Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Search Toggle button */}
            <button 
              id="search-toggle-btn"
              onClick={onSearchToggle}
              className={`p-2.5 rounded-full hover:bg-neutral-50 transition relative ${searchOpen ? 'text-sky-600 bg-sky-50' : 'text-neutral-700'}`}
              title="Search catalog"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* AI Advisor Badge on mobile link */}
            <button 
              onClick={onAdvisorClick}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200 transition"
              title="Talk to Shopping AI"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              AI Advisor
            </button>

            {/* Wishlist */}
            <button 
              id="wishlist-btn"
              onClick={onWishlistClick}
              className="p-2.5 rounded-full hover:bg-neutral-50 transition relative text-neutral-700"
              title="Your Wishlist"
            >
              <Heart className="w-5 h-5 hover:text-red-500 hover:fill-red-500 transition" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-neutral-900 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Cart button */}
            <button 
              id="cart-btn"
              onClick={onCartClick}
              className="p-2.5 rounded-full hover:bg-neutral-50 transition relative text-neutral-700"
              title="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5 hover:text-sky-600 transition" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-sky-600 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Hamburger (Mobile) */}
            <button 
              onClick={onMobileMenuToggle} 
              className="md:hidden p-2.5 rounded-full text-neutral-800 hover:bg-neutral-100 transition"
              title="Menu"
            >
              {mobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile Drop Down Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-neutral-100 py-4 px-6 animate-fade-in divide-y divide-neutral-50 shadow-xl relative z-40">
          <div className="flex flex-col space-y-3 pb-4">
            <button 
              onClick={() => { onCategoryFilter('all'); onMobileMenuToggle(); }}
              className="text-left py-1 text-sm font-semibold text-neutral-800 hover:text-sky-600 transition"
            >
              All Categories
            </button>
            <button 
              onClick={() => { onCategoryFilter('mobile'); onMobileMenuToggle(); }}
              className="text-left py-1 text-sm font-semibold text-neutral-800 hover:text-sky-600 transition"
            >
              Mobiles & Tablets
            </button>
            <button 
              onClick={() => { onCategoryFilter('laptop'); onMobileMenuToggle(); }}
              className="text-left py-1 text-sm font-semibold text-neutral-800 hover:text-sky-600 transition"
            >
              Laptops & Computers
            </button>
            <button 
              onClick={() => { onCategoryFilter('tv'); onMobileMenuToggle(); }}
              className="text-left py-1 text-sm font-semibold text-neutral-800 hover:text-sky-600 transition"
            >
              TV & Audio Displays
            </button>
            <button 
              onClick={() => { onCategoryFilter('appliance'); onMobileMenuToggle(); }}
              className="text-left py-1 text-sm font-semibold text-neutral-800 hover:text-sky-600 transition"
            >
              Smart ACs & Large Appliances
            </button>
            <button 
              onClick={() => { onCategoryFilter('accessory'); onMobileMenuToggle(); }}
              className="text-left py-1 text-sm font-semibold text-neutral-800 hover:text-sky-600 transition"
            >
              Accessories & Audio Gear
            </button>
          </div>
          <div className="pt-4 flex flex-col space-y-3">
            <button 
              onClick={() => { onAdvisorClick(); onMobileMenuToggle(); }}
              className="w-full text-center py-2 px-4 bg-emerald-600 text-white rounded-md font-bold text-xs shadow-md shadow-emerald-100 flex items-center justify-center gap-1.5"
            >
              💬 Open AI Shopping Advisor
            </button>
          </div>
        </div>
      )}
    </>
  );
}
