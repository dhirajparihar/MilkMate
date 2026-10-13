'use client';

import React from 'react';
import { CowMascot } from '@/components/mascot/CowMascot';
import { Button } from '@/components/ui/Button';
import { DoodhDostStore } from '@/lib/db/storage';
import { formatINR } from '@/lib/calc';
import {
  Plus,
  Truck,
  Store,
  Receipt,
  FileBarChart2,
  PackageCheck,
  Coins,
  Warehouse,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface DashboardScreenProps {
  onNavigate: (tab: string, subTab?: string) => void;
  onOpenCreateOrder: () => void;
  onOpenReceiveStock: () => void;
  onOpenTestRunner: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigate,
  onOpenCreateOrder,
  onOpenReceiveStock,
  onOpenTestRunner,
}) => {
  const metrics = DoodhDostStore.getDashboardMetrics();
  const db = DoodhDostStore.getDB();
  const recentOrders = db.orders.slice(0, 4);

  const todayFormatted = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-4 pb-20">
      {/* Friendly Welcome Card with Cow Mascot */}
      <div className="bg-gradient-to-br from-[#F1F8F3] to-[#E3F4EA] rounded-2xl p-4 sm:p-5 border border-[#B9E6C8]/70 flex items-center justify-between shadow-xs">
        <div className="space-y-1 pr-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#246B4B]">
            <Sparkles className="w-3.5 h-3.5 text-[#246B4B]" />
            <span>{todayFormatted}</span>
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold text-[#202820] tracking-tight">
            Good morning, {db.profile.distributorName.split(' ')[0]}!
          </h1>
          <p className="text-xs text-[#6B756D] leading-relaxed max-w-[260px]">
            Ready for morning delivery rounds to {db.shops.filter((s) => s.isActive).length} active shops.
          </p>
        </div>
        <div className="shrink-0">
          <CowMascot size={80} mood="happy" showMilkPacket={true} />
        </div>
      </div>

      {/* Primary Action Button (Big green, one-handed tap) */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        icon={<Plus className="w-5 h-5 stroke-[2.5]" />}
        onClick={onOpenCreateOrder}
        className="text-base font-bold shadow-md shadow-[#246B4B]/20 py-3.5 rounded-xl"
      >
        + New Daily Order
      </Button>

      {/* Main 4 Metric Cards */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {/* Card 1: Orders Today */}
        <div
          onClick={() => onNavigate('orders')}
          className="bg-white p-3.5 rounded-xl border border-[#E7ECE8] shadow-2xs hover:border-[#B9E6C8] transition-all cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center justify-between text-[#6B756D] text-xs font-medium">
            <span>Orders Today</span>
            <Receipt className="w-4 h-4 text-[#246B4B]" />
          </div>
          <div className="mt-1.5 text-2xl font-extrabold text-[#202820]">
            {metrics.totalOrdersCount}
          </div>
          <div className="mt-0.5 text-[11px] text-[#6B756D]">
            {metrics.pendingDeliveries > 0 ? (
              <span className="text-[#E67E22] font-semibold">{metrics.pendingDeliveries} to deliver</span>
            ) : (
              <span className="text-[#246B4B] font-semibold">All delivered</span>
            )}
          </div>
        </div>

        {/* Card 2: Packets to Deliver */}
        <div
          onClick={() => onNavigate('orders')}
          className="bg-white p-3.5 rounded-xl border border-[#E7ECE8] shadow-2xs hover:border-[#B9E6C8] transition-all cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center justify-between text-[#6B756D] text-xs font-medium">
            <span>Packets Total</span>
            <Truck className="w-4 h-4 text-[#246B4B]" />
          </div>
          <div className="mt-1.5 text-2xl font-extrabold text-[#202820]">
            {metrics.packetsToDeliver}
          </div>
          <div className="mt-0.5 text-[11px] text-[#6B756D]">Ordered packets</div>
        </div>

        {/* Card 3: Billed Sales */}
        <div
          onClick={() => onNavigate('more', 'invoices')}
          className="bg-white p-3.5 rounded-xl border border-[#E7ECE8] shadow-2xs hover:border-[#B9E6C8] transition-all cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center justify-between text-[#6B756D] text-xs font-medium">
            <span>Billed Sales</span>
            <span className="text-xs font-bold text-[#246B4B]">₹</span>
          </div>
          <div className="mt-1.5 text-2xl font-extrabold text-[#246B4B]">
            {formatINR(metrics.todayBilledSales, false)}
          </div>
          <div className="mt-0.5 text-[11px] text-[#6B756D]">Today&apos;s final invoices</div>
        </div>

        {/* Card 4: Payments Collected */}
        <div
          onClick={() => onNavigate('more', 'payments')}
          className="bg-white p-3.5 rounded-xl border border-[#E7ECE8] shadow-2xs hover:border-[#B9E6C8] transition-all cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center justify-between text-[#6B756D] text-xs font-medium">
            <span>Collected</span>
            <Coins className="w-4 h-4 text-[#246B4B]" />
          </div>
          <div className="mt-1.5 text-2xl font-extrabold text-[#202820]">
            {formatINR(metrics.paymentsCollected, false)}
          </div>
          <div className="mt-0.5 text-[11px] text-[#6B756D] flex items-center gap-1.5">
            <span>Cash: {formatINR(metrics.cashCollected, false)}</span>
            <span>·</span>
            <span>UPI: {formatINR(metrics.upiCollected, false)}</span>
          </div>
        </div>
      </div>

      {/* Secondary Information Strip */}
      <div className="grid grid-cols-2 gap-2.5">
        <div
          onClick={() => onNavigate('more', 'inventory')}
          className="bg-[#F8FAF8] p-3 rounded-xl border border-[#E7ECE8] cursor-pointer hover:bg-white transition-colors"
        >
          <div className="text-[11px] text-[#6B756D] font-medium flex items-center justify-between">
            <span>Dairy Stock Received</span>
            <Warehouse className="w-3.5 h-3.5 text-[#246B4B]" />
          </div>
          <div className="mt-1 text-lg font-bold text-[#202820]">
            {metrics.stockReceivedToday} <span className="text-xs font-normal text-[#6B756D]">pkts</span>
          </div>
          <div className="text-[10px] text-[#246B4B] font-medium">
            Avail: {metrics.remainingSaleableStock} pkts
          </div>
        </div>

        <div
          onClick={() => onNavigate('shops')}
          className="bg-[#FFF0D9]/50 p-3 rounded-xl border border-[#FFE1B3] cursor-pointer hover:bg-[#FFF0D9] transition-colors"
        >
          <div className="text-[11px] text-[#8C5D19] font-medium flex items-center justify-between">
            <span>Total Outstanding</span>
            <Store className="w-3.5 h-3.5 text-[#8C5D19]" />
          </div>
          <div className="mt-1 text-lg font-bold text-[#8C5D19]">
            {formatINR(metrics.totalOutstandingBalances, false)}
          </div>
          <div className="text-[10px] text-[#8C5D19]">Across all active shops</div>
        </div>
      </div>

      {/* Quick Action Shortcuts (Scrollable horizontal or 4-grid) */}
      <div className="space-y-1.5">
        <h2 className="text-xs font-bold text-[#6B756D] uppercase tracking-wider px-1">
          Quick Actions
        </h2>
        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => onNavigate('shops', 'add')}
            className="flex flex-col items-center justify-center p-2.5 bg-white border border-[#E7ECE8] rounded-xl hover:border-[#B9E6C8] active:scale-95 transition-all text-center"
          >
            <div className="w-9 h-9 rounded-lg bg-[#F1F8F3] text-[#246B4B] flex items-center justify-center mb-1">
              <Store className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-[#202820]">Add Shop</span>
          </button>

          <button
            type="button"
            onClick={onOpenReceiveStock}
            className="flex flex-col items-center justify-center p-2.5 bg-white border border-[#E7ECE8] rounded-xl hover:border-[#B9E6C8] active:scale-95 transition-all text-center"
          >
            <div className="w-9 h-9 rounded-lg bg-[#F1F8F3] text-[#246B4B] flex items-center justify-center mb-1">
              <PackageCheck className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-[#202820]">Receive Stock</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('more', 'invoices')}
            className="flex flex-col items-center justify-center p-2.5 bg-white border border-[#E7ECE8] rounded-xl hover:border-[#B9E6C8] active:scale-95 transition-all text-center"
          >
            <div className="w-9 h-9 rounded-lg bg-[#F1F8F3] text-[#246B4B] flex items-center justify-center mb-1">
              <Receipt className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-[#202820]">View Bills</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('more', 'reports')}
            className="flex flex-col items-center justify-center p-2.5 bg-white border border-[#E7ECE8] rounded-xl hover:border-[#B9E6C8] active:scale-95 transition-all text-center"
          >
            <div className="w-9 h-9 rounded-lg bg-[#F1F8F3] text-[#246B4B] flex items-center justify-center mb-1">
              <FileBarChart2 className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-[#202820]">Daily Report</span>
          </button>
        </div>
      </div>

      {/* Automated Tests Verification Banner */}
      <div
        onClick={onOpenTestRunner}
        className="bg-white p-3 rounded-xl border border-[#B9E6C8] flex items-center justify-between cursor-pointer hover:bg-[#F1F8F3]/50 transition-colors shadow-2xs"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#F1F8F3] text-[#246B4B] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#246B4B]" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#202820] flex items-center gap-1.5">
              <span>Business Rules Verification Suite</span>
              <span className="text-[10px] text-[#246B4B] font-semibold">18/18 Tests Ready</span>
            </div>
            <div className="text-[11px] text-[#6B756D]">
              Tap to verify all financial & inventory integrity rules
            </div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-[#6B756D]" />
      </div>

      {/* Recent Orders Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-[#6B756D] uppercase tracking-wider">
            Today&apos;s Orders
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('orders')}
            className="text-xs font-semibold text-[#246B4B] hover:underline"
          >
            See All ({db.orders.length})
          </button>
        </div>

        <div className="space-y-2">
          {recentOrders.map((order) => {
            const statusConfig = {
              placed: { label: 'Placed', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
              out_for_delivery: { label: 'On Route', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
              delivered: { label: 'Delivered', bg: 'bg-[#F1F8F3] text-[#246B4B] border-[#B9E6C8]' },
              billed: { label: 'Billed', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
              paid: { label: 'Paid', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
              draft: { label: 'Draft', bg: 'bg-gray-100 text-gray-700 border-gray-200' },
              confirmed: { label: 'Confirmed', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
              cancelled: { label: 'Cancelled', bg: 'bg-red-50 text-red-700 border-red-200' },
            }[order.status];

            return (
              <div
                key={order.id}
                onClick={() => onNavigate('orders')}
                className="bg-white p-3 rounded-xl border border-[#E7ECE8] flex items-center justify-between cursor-pointer hover:border-[#B9E6C8] transition-all active:scale-[0.99]"
              >
                <div>
                  <div className="text-sm font-bold text-[#202820]">{order.shopName}</div>
                  <div className="text-xs text-[#6B756D] flex items-center gap-2 mt-0.5">
                    <span>{order.orderNumber}</span>
                    <span>·</span>
                    <span>{order.totalDeliveredPackets} packets</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-extrabold text-[#202820]">
                    {formatINR(order.estimatedTotal)}
                  </div>
                  <span
                    className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusConfig.bg}`}
                  >
                    {statusConfig.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
