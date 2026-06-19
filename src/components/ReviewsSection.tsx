/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Star, CheckCircle2, MessageSquare, Plus, ChevronDown, Sparkles } from 'lucide-react';
import { Review } from '../types.ts';

interface ReviewsSectionProps {
  productId: number;
  reviews: Review[];
  hasPurchased: boolean;
  onAddReview: (userName: string, rating: number, comment: string) => void;
}

export default function ReviewsSection({
  productId,
  reviews,
  hasPurchased,
  onAddReview,
}: ReviewsSectionProps) {
  // Form state
  const [userName, setUserName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!comment.trim()) {
      setErrorMessage('Please type a short description of your product feedback!');
      return;
    }
    if (rating < 1 || rating > 5) {
      setErrorMessage('Please select a star rating between 1 and 5.');
      return;
    }

    onAddReview(userName, rating, comment);
    // Reset form
    setUserName('');
    setRating(5);
    setComment('');
    setShowForm(false);
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 'New';

  return (
    <div id={`reviews-section-${productId}`} className="mt-5 space-y-5">
      {/* Overview Card */}
      <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-300/30 flex flex-col items-center justify-center shrink-0">
            <span className="text-sm font-black text-amber-700 leading-none">{averageRating}</span>
            <span className="text-[8px] font-bold text-amber-600 uppercase tracking-widest mt-0.5">Rating</span>
          </div>
          <div>
            <h5 className="text-xs font-black text-neutral-850">Customer Satisfaction Hub</h5>
            <p className="text-[10px] text-neutral-400 mt-0.5">Calculated from {reviews.length} authentic verified submittals</p>
          </div>
        </div>

        {hasPurchased ? (
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="w-full sm:w-auto py-2 px-3.5 bg-neutral-900 hover:bg-sky-700 text-white font-extrabold rounded-xl text-[11px] uppercase tracking-wide transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write a review</span>
          </button>
        ) : (
          <div className="text-[10px] font-bold text-sky-750 bg-sky-50 border border-sky-100/60 px-3 py-2 rounded-xl text-center sm:text-left self-stretch sm:self-auto">
            ⚡ Purchased this? <span className="font-extrabold text-neutral-800">Verify past order log</span> to leave ratings.
          </div>
        )}
      </div>

      {/* Form Submission Block */}
      {showForm && hasPurchased && (
        <form onSubmit={handleSubmit} className="border border-neutral-100/90 rounded-2xl p-4 bg-amber-50/20 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-1.5">
            <span className="text-[11px] uppercase font-black text-neutral-800 tracking-wide flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-spin" />
              <span>Submit Verified Feedback</span>
            </span>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-[10px] font-bold text-neutral-400 hover:text-neutral-600 uppercase"
            >
              Cancel
            </button>
          </div>

          {/* Star selector */}
          <div className="space-y-1">
            <label className="block text-[11px] font-extrabold text-neutral-600">Your Rating Star Scale:</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="focus:outline-none transition active:scale-90"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= (hoverRating ?? rating)
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-neutral-200'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-extrabold ml-1.5 text-neutral-600">
                {rating === 5 && '🔥 Outstanding!'}
                {rating === 4 && '✨ Very Good'}
                {rating === 3 && '👍 Good / Average'}
                {rating === 2 && '⚠️ Below Expectations'}
                {rating === 1 && '👎 Poor Experience'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* User Name input */}
            <div className="space-y-1">
              <label htmlFor="review-name" className="block text-[11px] font-extrabold text-neutral-600">Full Name (Optional):</label>
              <input
                id="review-name"
                type="text"
                placeholder="e.g. Al-Sayyid Al-Saeed"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 placeholder-neutral-400 font-medium text-neutral-800"
              />
            </div>
          </div>

          {/* Comment description */}
          <div className="space-y-1">
            <label htmlFor="review-comment" className="block text-[11px] font-extrabold text-neutral-600">Your Comment / Feedback Description:</label>
            <textarea
              id="review-comment"
              rows={3}
              placeholder="What do you think about the performance, battery life, design finish?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 placeholder-neutral-400 font-medium text-neutral-800 resize-none"
            ></textarea>
          </div>

          {/* Validation Error Message */}
          {errorMessage && (
            <div className="text-[10px] font-bold text-red-650 bg-red-50 p-2.5 rounded-lg border border-red-200/40">
              ⚠️ {errorMessage}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all duration-200 uppercase tracking-widest cursor-pointer shadow-xs"
          >
            Publish Verified Review
          </button>
        </form>
      )}

      {/* Warning if they can't review yet */}
      {!hasPurchased && (
        <div className="p-3 bg-amber-500/10 border border-amber-300/35 rounded-xl space-y-1">
          <p className="text-[10px] text-amber-800 font-black flex items-center gap-1.5 leading-none">
            🔒 Reviews restrictions enabled
          </p>
          <p className="text-[10px] text-amber-700 leading-relaxed font-semibold">
            To prevent counterfeit feedback, BuyOman only permits reviews from confirmed buyers. Add products to your cart, fill out checkout info for Oman Governorates shipping, and complete a test checkout. You will then be able to submit ratings!
          </p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-2.5 max-h-[300px] overflow-y-auto scrollbar-none pr-1">
        {reviews.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-neutral-200 rounded-2xl bg-neutral-50/40">
            <MessageSquare className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-neutral-500">No customer reviews published yet.</p>
            <p className="text-[10px] text-neutral-400 mt-1">Be the first to submit feedback after buying!</p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white border border-neutral-100 rounded-xl p-3 space-y-1.5 hover:border-neutral-200/80 transition shadow-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black text-neutral-800">{rev.userName}</span>
                  {rev.isVerifiedPurchase && (
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100/50 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 fill-emerald-50" />
                      <span>Verified Purchaser</span>
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-bold text-neutral-400 font-mono">{rev.date}</span>
              </div>

              {/* Stars list */}
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < rev.rating ? 'text-amber-500 fill-amber-500' : 'text-neutral-200'
                    }`}
                  />
                ))}
              </div>

              <p className="text-[11px] text-neutral-600 leading-relaxed font-medium">
                {rev.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
