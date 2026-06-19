/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Package, 
  MapPin, 
  Clock, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Truck, 
  TrendingUp, 
  CheckCircle2, 
  Copy, 
  CreditCard, 
  Search,
  ExternalLink
} from 'lucide-react';
import { Order, CartItem, Product } from '../types.ts';

interface OrderHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onTrackOrder: (order: Order) => void;
  onAdvanceStatus?: (orderId: string) => void;
}

export default function OrderHistory({
  isOpen,
  onClose,
  orders,
  onTrackOrder,
  onAdvanceStatus
}: OrderHistoryProps) {
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  if (!isOpen) return null;

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleCopyId = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(orderId);
    setCopiedId(orderId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusStyle = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          label: 'Pending Confirmation'
        };
      case 'preparing':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-500',
          label: 'Processing Spec Packing'
        };
      case 'shipped':
        return {
          bg: 'bg-purple-50 text-purple-800 border-purple-200',
          dot: 'bg-purple-500',
          label: 'Dispatched with Oman Post'
        };
      case 'delivered':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'Delivered successfully'
        };
    }
  };

  const getProgressValue = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return { percent: 15, step: 1, color: 'bg-amber-500' };
      case 'preparing':
        return { percent: 45, step: 2, color: 'bg-blue-500' };
      case 'shipped':
        return { percent: 75, step: 3, color: 'bg-purple-500' };
      case 'delivered':
        return { percent: 100, step: 4, color: 'bg-emerald-500' };
      default:
        return { percent: 0, step: 0, color: 'bg-neutral-200' };
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(o => {
    if (filterStatus === 'all') return true;
    return o.status === filterStatus;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      <div className="absolute inset-0 overflow-hidden">
        {/* Backdrop overlay */}
        <div 
          className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity" 
          onClick={onClose}
        ></div>

        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className="pointer-events-auto w-screen max-w-2xl animate-slide-left">
            <div className="flex h-full flex-col bg-white shadow-2xl">
              
              {/* Header section with Stats summary */}
              <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-950 text-white flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-400/30 flex items-center justify-center">
                      <Package className="w-4.5 h-4.5 text-sky-400" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold tracking-tight">Oman Delivery Logs</h2>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none">
                        Order history & persistent shipping records
                      </p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                  title="Close panel"
                >
                  <X className="w-5.5 h-5.5" />
                </button>
              </div>

              {/* Status breakdown controls */}
              {orders.length > 0 && (
                <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none text-xs">
                  <span className="font-extrabold text-neutral-500 uppercase tracking-wider text-[10px] shrink-0">Filter:</span>
                  <div className="flex items-center gap-1.5">
                    {['all', 'pending', 'preparing', 'shipped', 'delivered'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize transition border ${
                          filterStatus === s 
                            ? 'bg-neutral-900 text-white border-neutral-900' 
                            : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        {s} ({s === 'all' ? orders.length : orders.filter(o => o.status === s).length})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Content body scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none">
                {orders.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-full flex items-center justify-center mb-4">
                      <Package className="w-8 h-8 text-neutral-400" />
                    </div>
                    <h3 className="text-base font-extrabold text-neutral-800">No Past Orders Found</h3>
                    <p className="text-xs text-neutral-500 mt-2 max-w-sm leading-relaxed">
                      You have not completed any order checkout during this session. Browse our premium store items to book Oman governorates shipping!
                    </p>
                    <button
                      onClick={onClose}
                      className="mt-6 px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-neutral-500 text-xs font-medium">No orders matching search filter "{filterStatus}".</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => {
                      const expanded = expandedOrders[order.id];
                      const style = getStatusStyle(order.status);
                      const totalItemsCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

                      return (
                        <div 
                          key={order.id} 
                          className="bg-white border border-neutral-100 rounded-2xl shadow-xs overflow-hidden hover:border-neutral-200 transition"
                        >
                          {/* Top order summary header row */}
                          <div 
                            onClick={() => toggleOrderExpand(order.id)}
                            className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-neutral-50/50 transition select-none"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono font-extrabold text-neutral-900 text-sm tracking-tight flex items-center gap-1 bg-neutral-100 px-2 py-0.5 rounded-sm">
                                  {order.id}
                                  <button 
                                    onClick={(e) => handleCopyId(order.id, e)}
                                    className="text-neutral-400 hover:text-sky-600 transition"
                                    title="Copy transaction code"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </span>
                                {copiedId === order.id && (
                                  <span className="text-[10px] text-emerald-600 font-extrabold animate-fade-in">Copied!</span>
                                )}
                                <span className={`px-2.5 py-0.5 border text-[10px] font-bold rounded-full flex items-center gap-1 ${style.bg}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                                  {style.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-neutral-400 text-[11px] font-bold">
                                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {order.date}</span>
                                <span>•</span>
                                <span>{totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} loaded</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-neutral-50">
                              <div className="text-right">
                                <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider block">Grand Total</span>
                                <span className="text-sm font-extrabold text-neutral-950">OMR {order.total.toFixed(3)}</span>
                              </div>
                              <div className="text-neutral-400 hover:text-neutral-600 transition">
                                {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                              </div>
                            </div>
                          </div>

                          {/* Shipping Status Progress Bar & Stepper Checklist */}
                          <div className="px-4 md:px-5 pb-4 pt-1 border-t border-neutral-50/50 bg-neutral-50/10">
                            <div className="flex items-center justify-between text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-2">
                              <span className="flex items-center gap-1 text-neutral-500 font-extrabold">
                                <Truck className="w-3.5 h-3.5 text-neutral-400" />
                                <span>Shipment Lifecycle Tracker</span>
                              </span>
                              <span className="text-sky-600 font-extrabold tracking-tight">Step {getProgressValue(order.status).step} of 4 • {getProgressValue(order.status).percent}% Completed</span>
                            </div>

                            {/* Timeline Bar Track */}
                            <div className="relative h-2 bg-neutral-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-700 ease-out rounded-full ${getProgressValue(order.status).color} ${
                                  order.status === 'pending' ? 'animate-pulse' : ''
                                }`}
                                style={{ width: `${getProgressValue(order.status).percent}%` }}
                              />
                            </div>

                            {/* Stepper Node Labels */}
                            <div className="grid grid-cols-4 gap-1 mt-2.5 text-[9px] font-black text-center uppercase tracking-tight">
                              <div className="flex flex-col items-center">
                                <span className={getProgressValue(order.status).step >= 1 ? 'text-emerald-700 font-black' : 'text-neutral-300'}>
                                  1. Placed
                                </span>
                              </div>
                              <div className="flex flex-col items-center">
                                <span className={getProgressValue(order.status).step >= 2 ? 'text-emerald-700 font-black' : getProgressValue(order.status).step === 1 ? 'text-amber-600 animate-pulse' : 'text-neutral-300'}>
                                  2. Packing
                                </span>
                              </div>
                              <div className="flex flex-col items-center">
                                <span className={getProgressValue(order.status).step >= 3 ? 'text-emerald-700 font-black' : getProgressValue(order.status).step === 2 ? 'text-blue-600 animate-pulse' : 'text-neutral-300'}>
                                  3. Shipped
                                </span>
                              </div>
                              <div className="flex flex-col items-center">
                                <span className={getProgressValue(order.status).step >= 4 ? 'text-emerald-700 font-black' : getProgressValue(order.status).step === 3 ? 'text-purple-600 animate-pulse' : 'text-neutral-300'}>
                                  4. Delivered
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Collapsible expanded detail block */}
                          {expanded && (
                            <div className="border-t border-neutral-100 bg-neutral-50/40 p-4 md:p-5 space-y-5 animate-zoom-in">
                              
                              {/* Order items list */}
                              <div>
                                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-2.5">Purchased Electronics & Appliances</span>
                                <div className="space-y-2">
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-xl border border-neutral-100 hover:border-neutral-200 transition">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center overflow-hidden shrink-0 p-0.5 bg-white">
                                          {item.product.image ? (
                                            <img src={item.product.image} alt={item.product.name} className="max-h-full max-w-full object-contain select-none" referrerPolicy="no-referrer" />
                                          ) : (
                                            <span className="text-xl select-none">{item.product.emoji}</span>
                                          )}
                                        </div>
                                        <div>
                                          <h4 className="text-xs font-bold text-neutral-800 line-clamp-1">{item.product.name}</h4>
                                          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{item.product.brand}</p>
                                        </div>
                                      </div>
                                      <div className="text-right text-xs shrink-0 pl-4">
                                        <span className="text-neutral-500 font-medium font-mono">{item.quantity}x</span>
                                        <span className="text-neutral-900 font-extrabold ml-2.5">OMR {(item.product.price * item.quantity).toFixed(3)}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Delivery info & cost summary */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                
                                <div className="bg-white p-3.5 rounded-xl border border-neutral-100 space-y-1.5 text-xs">
                                  <div className="flex items-center gap-1 text-neutral-400 font-bold uppercase tracking-wider text-[9px] mb-1">
                                    <MapPin className="w-3.5 h-3.5 text-sky-600" />
                                    <span>Shipping Destination</span>
                                  </div>
                                  <p className="font-bold text-neutral-800">{order.billingInfo.fullName}</p>
                                  <p className="text-neutral-600 leading-tight">
                                    {order.billingInfo.addressLines}, {order.billingInfo.city}, {order.billingInfo.governorate}
                                  </p>
                                  <p className="text-[10px] font-bold text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded-sm inline-block">
                                    GSM: {order.billingInfo.phone}
                                  </p>
                                </div>

                                <div className="bg-white p-3.5 rounded-xl border border-neutral-100 space-y-1.5 text-xs">
                                  <div className="flex items-center gap-1 text-neutral-400 font-bold uppercase tracking-wider text-[9px] mb-1">
                                    <CreditCard className="w-3.5 h-3.5 text-sky-600" />
                                    <span>Price Breakdown & Method</span>
                                  </div>
                                  <div className="flex justify-between text-neutral-500">
                                    <span>Subtotal:</span>
                                    <span>OMR {order.subtotal.toFixed(3)}</span>
                                  </div>
                                  <div className="flex justify-between text-neutral-500">
                                    <span>Delivery Fee:</span>
                                    <span>OMR {order.deliveryFee.toFixed(3)}</span>
                                  </div>
                                  <div className="flex justify-between text-neutral-[950] font-bold border-t border-neutral-100 pt-1.5 mt-1">
                                    <span>Method ({order.billingInfo.paymentMethod === 'cod' ? 'COD' : 'Paid Card'}):</span>
                                    <span>OMR {order.total.toFixed(3)}</span>
                                  </div>
                                </div>

                              </div>

                              {/* Interactive Delivery Steps Advanced Panel */}
                              <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                                <div className="space-y-1">
                                  <p className="font-extrabold text-sky-900 flex items-center gap-1.5">
                                    <Truck className="w-4 h-4 text-sky-600" />
                                    <span>Est. Delivery: {order.estimatedDelivery}</span>
                                  </p>
                                  <p className="text-[10px] text-sky-700 font-semibold">
                                    Use the simulator button to progress the delivery pipeline for live sandbox testing.
                                  </p>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto shrink-0 flex-wrap">
                                  <button
                                    onClick={() => onTrackOrder(order)}
                                    className="flex-1 sm:flex-none px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold rounded-lg text-[10px] uppercase tracking-wider tracking-widest flex items-center justify-center gap-1 border border-neutral-900"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Live Track</span>
                                  </button>
                                  {onAdvanceStatus && (
                                    <button
                                      onClick={() => onAdvanceStatus(order.id)}
                                      className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-sky-100/50 text-sky-800 font-extrabold rounded-lg text-[10px] uppercase tracking-wider border border-sky-200 transition"
                                    >
                                      Simulate Step ➡️
                                    </button>
                                  )}
                                </div>
                              </div>

                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sticky bottom checkout metrics */}
              <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 text-xs">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-neutral-500 font-semibold uppercase text-[10px] tracking-wider leading-none">Global Session Hub</p>
                    <p className="text-neutral-700 font-bold mt-1 text-[11px]">{orders.length} total placed logs documented</p>
                  </div>
                  <p className="text-[10px] text-sky-600 bg-sky-50 px-2 py-1 rounded-md font-extrabold">🇴🇲 Oman National Delivery Enabled</p>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
