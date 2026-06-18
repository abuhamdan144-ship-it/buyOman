/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, Percent } from 'lucide-react';
import { SAMPLE_PROMO_SLIDES, PRODUCTS_DATA } from '../data.ts';
import { Product } from '../types.ts';

interface HeroSliderProps {
  onAddToCart: (product: Product) => void;
  onExploreProduct: (product: Product) => void;
}

export default function HeroSlider({ onAddToCart, onExploreProduct }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const slides = SAMPLE_PROMO_SLIDES;

  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 6000);
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    resetTimer();
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    resetTimer();
  };

  const handleDotClick = (idx: number) => {
    setCurrentIndex(idx);
    resetTimer();
  };

  const handleSlideAction = (prodId: number) => {
    const parentProduct = PRODUCTS_DATA.find(p => p.id === prodId);
    if (parentProduct) {
      onAddToCart(parentProduct);
    }
  };

  const handleExploreAction = (prodId: number) => {
    const parentProduct = PRODUCTS_DATA.find(p => p.id === prodId);
    if (parentProduct) {
      onExploreProduct(parentProduct);
    }
  };

  return (
    <div className="relative w-full overflow-hidden select-none" style={{ minHeight: '440px' }}>
      {/* Slides Container */}
      <div className="relative h-[480px] sm:h-[500px] w-full flex transition-all duration-700 ease-out">
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full flex flex-col md:flex-row items-center justify-between px-6 py-8 md:p-16 transition-opacity duration-1000 ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
              style={{
                background: slide.bgColor,
                color: slide.darkTheme ? '#ffffff' : '#1d1d1f'
              }}
            >
              {/* Left Side: Text Information */}
              <div className="flex-1 max-w-xl text-center md:text-left flex flex-col justify-center order-2 md:order-1 mt-6 md:mt-0">
                <span className={`inline-flex items-center gap-1.5 self-center md:self-start px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase mb-4 ${
                  slide.darkTheme ? 'bg-white/10 text-sky-300' : 'bg-neutral-100 text-sky-700'
                }`}>
                  <Sparkles className="w-3.5 h-3.5" />
                  {slide.eyebrow}
                </span>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none mb-3">
                  {slide.title}
                </h1>

                <p className={`text-sm sm:text-base mb-6 font-medium ${
                  slide.darkTheme ? 'text-neutral-300' : 'text-neutral-600'
                }`}>
                  {slide.subtitle}
                </p>

                <div className="text-lg font-bold mb-6 flex items-baseline justify-center md:justify-start gap-2">
                  <span className={slide.darkTheme ? 'text-sky-300' : 'text-sky-600'}>
                    Price from: OMR {slide.price.toFixed(3)}
                  </span>
                  <span className={`text-xs font-normal line-through ${
                    slide.darkTheme ? 'text-neutral-500' : 'text-neutral-400'
                  }`}>
                    OMR {(slide.price * 1.1).toFixed(3)}
                  </span>
                </div>

                <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                  <button
                    onClick={() => handleSlideAction(slide.prodId)}
                    className="px-6 py-3 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-bold text-sm rounded-full shadow-lg transition duration-200"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleExploreAction(slide.prodId)}
                    className={`px-6 py-2.5 font-bold text-sm rounded-full border transition duration-200 ${
                      slide.darkTheme
                        ? 'border-white/30 text-white hover:bg-white/10'
                        : 'border-neutral-300 text-neutral-800 hover:bg-neutral-100'
                    }`}
                  >
                    Quick View Specs
                  </button>
                </div>
              </div>

              {/* Right Side: High Visual Vector/Emoji placeholder with float effect */}
              <div className="flex-1 flex items-center justify-center order-1 md:order-2 h-44 sm:h-56 md:h-auto select-none">
                <div className="relative text-8xl sm:text-9xl md:text-[160px] animate-bounce-slow filter drop-shadow-2xl">
                  {slide.emoji}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-2/3 h-4 bg-black/10 blur-xl rounded-full"></div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Manual Left/Right Nav Buttons */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/20 hover:bg-white/40 active:scale-90 text-white md:text-neutral-800 transition shadow-md md:bg-white/80"
        title="Previous slide"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/20 hover:bg-white/40 active:scale-90 text-white md:text-neutral-800 transition shadow-md md:bg-white/80"
        title="Next slide"
      >
        <ArrowRight className="w-5 h-5" />
      </button>

      {/* Slider indicators (Dots) */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleDotClick(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-6 bg-sky-600' : 'w-2 bg-neutral-300/60 hover:bg-neutral-400'
            }`}
            title={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
