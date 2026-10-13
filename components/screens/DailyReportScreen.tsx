'use client';

import React, { useState } from 'react';
import { DoodhDostStore } from '@/lib/db/storage';
import { formatINR } from '@/lib/calc';
import { getTodayDateString } from '@/lib/db/mock-data';
import {
  FileBarChart2,
  Calendar,
  Truck,
  Receipt,
  Coins,
  Warehouse,
  Printer,
  TrendingUp,
} from 'lucide-react';

export const DailyReportScreen: React.FC = () => {
  const db = DoodhDostStore.getDB();
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());

  const ordersForDate = db.orders.filter((o) => o.orderDate === selectedDate);
  const totalOrders = ordersForDate.length;
  const completedDeliveries = ordersForDate.filter(
    (o) => o.status === 'delivered' || o.status === 'billed' || o.status === 'paid'
  ).length;
  const totalDeliveredPackets = ordersForDate.reduce((acc, o) => acc + o.totalDeliveredPackets, 0);

  const invoicesForDate = db.invoices.filter((i) => i.invoiceDate === selectedDate);
  const totalBilledSales = invoicesForDate.reduce((acc, i) => acc + i.netAmount, 0);
  const totalReturnCredits = invoicesForDate.reduce((acc, i) => acc + i.totalReturnCredits, 0);

  const paymentsForDate = db.payments.filter((p) => p.paymentDate === selectedDate);
  const cashCollected = paymentsForDate
    .filter((p) => p.paymentMethod === 'cash')
    .reduce((acc, p) => acc + p.amount, 0);
  const upiCollected = paymentsForDate
    .filter((p) => p.paymentMethod === 'upi')
    .reduce((acc, p) => acc + p.amount, 0);
  const totalCollected = cashCollected + upiCollected;

  const receiptsForDate = db.stockReceipts.filter((r) => r.receiptDate === selectedDate);
  const totalStockReceived = receiptsForDate.reduce((acc, r) => acc + r.totalPackets, 0);

  const inventory = DoodhDostStore.getInventoryStatus();
  const remainingStock = inventory.reduce((acc, i) => acc + Math.max(0, i.availableStock), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header & Date Picker */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-[#202820]">Daily Distribution Report</h1>
          <p className="text-xs text-[#6B756D]">End-of-day sales & reconciliation audit</p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="p-2 text-[#246B4B] bg-[#F1F8F3] border border-[#B9E6C8] rounded-xl hover:bg-[#E2F5E8] transition-colors"
          title="Print summary"
        >
          <Printer className="w-4 h-4" />
        </button>
      </div>

      {/* Date Selector */}
      <div className="bg-white p-3 rounded-xl border border-[#E7ECE8] flex items-center justify-between text-xs">
        <span className="font-bold text-[#6B756D]">Report Date:</span>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-[#F8FAF8] border border-[#E7ECE8] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#202820] focus:outline-none focus:border-[#246B4B]"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Sales */}
        <div className="bg-white p-3.5 rounded-xl border border-[#E7ECE8] shadow-2xs space-y-1">
          <div className="text-xs text-[#6B756D] font-medium flex items-center justify-between">
            <span>Billed Sales</span>
            <Receipt className="w-4 h-4 text-[#246B4B]" />
          </div>
          <div className="text-xl font-black text-[#246B4B]">
            {formatINR(totalBilledSales)}
          </div>
          <div className="text-[11px] text-[#6B756D]">
            {invoicesForDate.length} invoices generated
          </div>
        </div>

        {/* Collections */}
        <div className="bg-white p-3.5 rounded-xl border border-[#E7ECE8] shadow-2xs space-y-1">
          <div className="text-xs text-[#6B756D] font-medium flex items-center justify-between">
            <span>Collections</span>
            <Coins className="w-4 h-4 text-[#246B4B]" />
          </div>
          <div className="text-xl font-black text-[#202820]">
            {formatINR(totalCollected)}
          </div>
          <div className="text-[11px] text-[#6B756D]">
            Cash: {formatINR(cashCollected, false)} · UPI: {formatINR(upiCollected, false)}
          </div>
        </div>
      </div>

      {/* Operations Breakdown */}
      <div className="bg-white p-4 rounded-xl border border-[#E7ECE8] space-y-3 shadow-2xs">
        <h2 className="text-xs font-bold text-[#6B756D] uppercase">
          Delivery Operations Reconciliation
        </h2>

        <div className="space-y-2 text-xs divide-y divide-[#E7ECE8]/60">
          <div className="flex justify-between py-1 text-[#202820]">
            <span className="text-[#6B756D]">Total Orders Placed:</span>
            <span className="font-bold">{totalOrders}</span>
          </div>

          <div className="flex justify-between py-1 text-[#202820]">
            <span className="text-[#6B756D]">Completed Deliveries:</span>
            <span className="font-bold text-[#246B4B]">
              {completedDeliveries} of {totalOrders}
            </span>
          </div>

          <div className="flex justify-between py-1 text-[#202820]">
            <span className="text-[#6B756D]">Total Delivered Packets:</span>
            <span className="font-bold">{totalDeliveredPackets} pkts</span>
          </div>

          <div className="flex justify-between py-1 text-[#202820]">
            <span className="text-[#6B756D]">Same-Day Return Credits:</span>
            <span className="font-bold text-[#C62828]">- {formatINR(totalReturnCredits)}</span>
          </div>

          <div className="flex justify-between py-1 text-[#202820]">
            <span className="text-[#6B756D]">Dairy Stock Received Today:</span>
            <span className="font-bold text-[#246B4B]">+{totalStockReceived} pkts</span>
          </div>

          <div className="flex justify-between py-1 text-[#202820]">
            <span className="text-[#6B756D]">Available Saleable Inventory:</span>
            <span className="font-bold">{remainingStock} pkts</span>
          </div>
        </div>
      </div>

      {/* Difference / Outstanding Alert */}
      <div className="bg-[#FFF0D9] p-3.5 rounded-xl border border-[#FFE1B3] flex items-center justify-between text-xs text-[#8C5D19]">
        <div>
          <div className="font-bold">Uncollected Sales Balance Today:</div>
          <div className="text-[11px]">
            Difference between today&apos;s billed sales and cash/UPI collected
          </div>
        </div>
        <div className="text-base font-black">
          {formatINR(Math.max(0, totalBilledSales - totalCollected))}
        </div>
      </div>
    </div>
  );
};
