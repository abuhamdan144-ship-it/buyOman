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
  ExternalLink,
  FileDown
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Order, CartItem, Product } from '../types.ts';

interface OrderHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onTrackOrder: (order: Order) => void;
  onAdvanceStatus?: (orderId: string) => void;
  onWriteReview?: (product: Product) => void;
}

export default function OrderHistory({
  isOpen,
  onClose,
  orders,
  onTrackOrder,
  onAdvanceStatus,
  onWriteReview
}: OrderHistoryProps) {
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleDownloadInvoice = (order: Order) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Draw Top solid header banner matching BuyOman color scheme
      doc.setFillColor(15, 23, 42); // slate-900 (deep aesthetic)
      doc.rect(0, 0, 210, 42, 'F');

      // Brand Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('Helvetica', 'bold');
      doc.text('BUYOMAN ELECTRONICS', 15, 18);

      // Store Details / Sub-header
      doc.setFontSize(8.5);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(186, 230, 253); // sky-200
      doc.text('Oman\'s Ultimate Premium Smart Home Store', 15, 24);
      doc.text('Azaiba Office Tower, Muscat, Sultanate of Oman', 15, 29);

      // Tax Invoice Label
      doc.setFontSize(15);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('OFFICIAL INVOICE', 195, 18, { align: 'right' });

      // Invoice metadata
      doc.setFontSize(8.5);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(255, 255, 255);
      doc.text(`Invoice Ref: INV-${order.id.substring(0, 10).toUpperCase()}`, 195, 24, { align: 'right' });
      doc.text(`Date of Issue: ${order.date}`, 195, 29, { align: 'right' });
      doc.text(`Transaction Status: Paid & Confirmed`, 195, 34, { align: 'right' });

      // Addresses section
      let y = 55;
      doc.setFontSize(10);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('SHIP TO / CUSTOMER DETAILS:', 15, y);
      doc.text('SUPPLIER / STORE OFFICE:', 110, y);

      y += 6;
      doc.setFontSize(8.5);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(31, 41, 55); // neutral-800
      doc.text(order.billingInfo.fullName, 15, y);
      doc.text('BuyOman E-store LLC', 110, y);

      y += 5;
      doc.text(order.billingInfo.addressLines, 15, y);
      doc.text('CR Number: 1409552 / Oman Tech City', 110, y);

      y += 5;
      doc.text(`${order.billingInfo.city}, ${order.billingInfo.governorate}, Oman`, 15, y);
      doc.text('Contact GSM: +968 2455 1200', 110, y);

      y += 5;
      doc.text(`Contact Phone: ${order.billingInfo.phone}`, 15, y);
      doc.text('Email support: billing@buyoman.com', 110, y);

      y += 12;

      // Divider Line
      doc.setDrawColor(229, 231, 235); // neutral-205 border
      doc.setLineWidth(0.4);
      doc.line(15, y, 195, y);

      y += 10;

      // Items Table Header
      doc.setFillColor(243, 244, 246); // gray-100 banner
      doc.rect(15, y, 180, 8, 'F');
      
      doc.setFontSize(8.5);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(75, 85, 99); // gray-600
      doc.text('Item Electronics Package', 18, y + 5.5);
      doc.text('Brand', 110, y + 5.5);
      doc.text('Qty', 140, y + 5.5, { align: 'center' });
      doc.text('Unit Price', 165, y + 5.5, { align: 'right' });
      doc.text('Subtotal', 190, y + 5.5, { align: 'right' });

      y += 8;

      // Items Table Rows
      doc.setFont('Helvetica', 'normal');
      order.items.forEach((item, index) => {
        // Alternating zebra backgrounds
        if (index % 2 === 1) {
          doc.setFillColor(249, 250, 251); // gray-50
          doc.rect(15, y, 180, 10, 'F');
        }
        
        doc.setTextColor(17, 24, 39); // gray-900

        // Truncate long item names politely
        const rawName = item.product.name;
        const displayName = rawName.length > 52 ? `${rawName.substring(0, 49)}...` : rawName;

        doc.text(displayName, 18, y + 6.5);
        doc.text(item.product.brand, 110, y + 6.5);
        doc.text(item.quantity.toString(), 140, y + 6.5, { align: 'center' });
        doc.text(`OMR ${item.product.price.toFixed(3)}`, 165, y + 6.5, { align: 'right' });
        
        const lineTotal = item.product.price * item.quantity;
        doc.text(`OMR ${lineTotal.toFixed(3)}`, 190, y + 6.5, { align: 'right' });

        doc.setDrawColor(243, 244, 246);
        doc.line(15, y + 10, 195, y + 10);
        
        y += 10;
      });

      y += 6;

      // Totals Panel
      const rightColX = 135;
      doc.setFontSize(8.5);
      
      // Subtotal
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(107, 114, 128); // gray-500
      doc.text('Subtotal Base Price:', rightColX, y);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text(`OMR ${order.subtotal.toFixed(3)}`, 190, y, { align: 'right' });

      // Delivery Fee
      y += 6;
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(107, 114, 128);
      doc.text('Oman Governorate Delivery Fee:', rightColX, y);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text(`OMR ${order.deliveryFee.toFixed(3)}`, 190, y, { align: 'right' });

      // Grand Total Row with Slate Dark Highlights
      y += 9;
      doc.setLineWidth(0.6);
      doc.setDrawColor(15, 23, 42); // solid block underline
      doc.line(rightColX, y - 4, 195, y - 4);

      doc.setFontSize(10.5);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('GRAND TOTAL DUE:', rightColX, y);
      doc.text(`OMR ${order.total.toFixed(3)}`, 190, y, { align: 'right' });

      // Payment Details & Method Info
      y += 18;
      doc.setFontSize(8.5);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('PAYMENT DETAILS & METHOD:', 15, y);

      y += 5;
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      const isCod = order.billingInfo.paymentMethod === 'cod';
      const paymentMsg = isCod
        ? 'Cash on Delivery (COD). Please have the exact payment of OMR ' + order.total.toFixed(3) + ' ready when dispatch courier contacts.'
        : 'Credit/Debit Card payment was successfully pre-authorized and drafted securely online.';
      doc.text(paymentMsg, 15, y);

      // Disclaimer / Thank you block in footer
      doc.setDrawColor(229, 231, 235);
      doc.line(15, 272, 195, 272);
      
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text('This is an electronically generated document. No physical signature is required under Omani E-Commerce Law.', 105, 278, { align: 'center' });
      doc.text('Thank you for shopping premium appliances at BuyOman! Reach us at support@buyoman.com for refunds or queries.', 105, 282, { align: 'center' });

      // Save PDF triggering immediate download
      doc.save(`BuyOman-Invoice-${order.id}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF Invoice: ", err);
      alert("Error generating printable invoice PDF. Please try again.");
    }
  };

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
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onWriteReview?.(item.product);
                                            }}
                                            className="mt-1.5 flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-black text-amber-700 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-305/40 rounded-sm transition cursor-pointer"
                                            title="Submit rating or feedback for this item"
                                          >
                                            ★ Rate & Review item
                                          </button>
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
                                    onClick={() => handleDownloadInvoice(order)}
                                    className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 border border-emerald-600 transition cursor-pointer"
                                    title="Download printable PDF Invoice"
                                  >
                                    <FileDown className="w-3.5 h-3.5" />
                                    <span>Download Invoice</span>
                                  </button>
                                  <button
                                    onClick={() => onTrackOrder(order)}
                                    className="flex-1 sm:flex-none px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold rounded-lg text-[10px] uppercase tracking-wider tracking-widest flex items-center justify-center gap-1 border border-neutral-900 cursor-pointer"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Live Track</span>
                                  </button>
                                  {onAdvanceStatus && (
                                    <button
                                      onClick={() => onAdvanceStatus(order.id)}
                                      className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-sky-100/50 text-sky-800 font-extrabold rounded-lg text-[10px] uppercase tracking-wider border border-sky-200 transition cursor-pointer"
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
