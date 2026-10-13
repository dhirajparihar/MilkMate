'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { DoodhDostStore } from '@/lib/db/storage';
import {
  Warehouse,
  Plus,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';

interface InventoryScreenProps {
  onOpenReceiveStock: () => void;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({ onOpenReceiveStock }) => {
  const inventory = DoodhDostStore.getInventoryStatus();
  const movements = DoodhDostStore.getStockMovements().slice(0, 20);

  const totalAvailable = inventory.reduce((acc, i) => acc + Math.max(0, i.availableStock), 0);
  const totalReceived = inventory.reduce((acc, i) => acc + i.stockReceived, 0);
  const totalDelivered = inventory.reduce((acc, i) => acc + i.deliveredQty, 0);

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-[#202820]">Inventory & Stock Ledger</h1>
          <p className="text-xs text-[#6B756D]">Real-time crate & pouch stock audit</p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onOpenReceiveStock}
          icon={<Plus className="w-4 h-4" />}
        >
          Receive Stock
        </Button>
      </div>

      {/* Stock Formula Banner */}
      <div className="bg-[#F1F8F3] p-3 rounded-xl border border-[#B9E6C8]/80 text-xs space-y-1">
        <div className="font-bold text-[#246B4B] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" />
          <span>Strict Ledger Invariant:</span>
        </div>
        <p className="text-[#202820] font-mono text-[11px]">
          Available = Opening + Received + Saleable Returns - Delivered - Damaged
        </p>
      </div>

      {/* High-level summary metrics */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white p-2.5 rounded-xl border border-[#E7ECE8]">
          <div className="text-[10px] text-[#6B756D]">Received</div>
          <div className="text-sm font-extrabold text-[#202820]">{totalReceived}</div>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-[#E7ECE8]">
          <div className="text-[10px] text-[#6B756D]">Delivered</div>
          <div className="text-sm font-extrabold text-[#202820]">{totalDelivered}</div>
        </div>
        <div className="bg-[#FFF0D9] p-2.5 rounded-xl border border-[#FFE1B3]">
          <div className="text-[10px] text-[#8C5D19]">Available</div>
          <div className="text-sm font-black text-[#8C5D19]">{totalAvailable}</div>
        </div>
      </div>

      {/* Product Stock Cards */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-bold text-[#6B756D] uppercase">Stock by Product</h2>

        {inventory.map((item) => {
          const isLowStock = item.availableStock <= item.lowStockThreshold;

          return (
            <div
              key={item.productId}
              className="bg-white p-3.5 rounded-xl border border-[#E7ECE8] shadow-2xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[#202820]">{item.productName}</h3>
                  <div className="text-xs text-[#6B756D]">Packet: {item.packetSize}</div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-black text-[#246B4B]">
                    {item.availableStock}{' '}
                    <span className="text-xs font-normal text-[#6B756D]">pkts</span>
                  </div>
                  {isLowStock ? (
                    <span className="text-[10px] font-bold text-[#C62828] bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                      Low Stock Warning
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-[#246B4B]">Adequate</span>
                  )}
                </div>
              </div>

              {/* Formula Breakdown Details */}
              <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-[#E7ECE8] text-[11px] text-center bg-[#F8FAF8] p-2 rounded-lg">
                <div>
                  <div className="text-[#6B756D]">Opening</div>
                  <div className="font-bold text-[#202820]">{item.openingStock}</div>
                </div>
                <div>
                  <div className="text-[#6B756D]">Received</div>
                  <div className="font-bold text-[#202820]">+{item.stockReceived}</div>
                </div>
                <div>
                  <div className="text-[#6B756D]">Delivered</div>
                  <div className="font-bold text-[#C62828]">-{item.deliveredQty}</div>
                </div>
                <div>
                  <div className="text-[#6B756D]">Returns</div>
                  <div className="font-bold text-[#246B4B]">+{item.saleableReturns}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stock Movement Audit Log */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-[#6B756D] uppercase">
          Recent Stock Movements Ledger ({movements.length})
        </h2>

        <div className="space-y-1.5 max-h-60 overflow-y-auto">
          {movements.map((mov) => {
            const isPositive = mov.quantityChange > 0;

            return (
              <div
                key={mov.id}
                className="bg-white p-2.5 rounded-xl border border-[#E7ECE8] flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-[#202820] flex items-center gap-1.5">
                    <span>{mov.productName}</span>
                    <span className="text-[10px] text-[#6B756D] uppercase">
                      ({mov.movementType.replace('_', ' ')})
                    </span>
                  </div>
                  <div className="text-[11px] text-[#6B756D]">{mov.notes}</div>
                </div>

                <div
                  className={`text-sm font-black ${
                    isPositive ? 'text-[#246B4B]' : 'text-[#C62828]'
                  }`}
                >
                  {isPositive ? `+${mov.quantityChange}` : mov.quantityChange}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
