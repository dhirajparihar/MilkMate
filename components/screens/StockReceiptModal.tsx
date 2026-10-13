'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { DoodhDostStore } from '@/lib/db/storage';
import { Warehouse, CheckCircle2, Truck } from 'lucide-react';

interface StockReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReceiptSaved: () => void;
}

export const StockReceiptModal: React.FC<StockReceiptModalProps> = ({
  isOpen,
  onClose,
  onReceiptSaved,
}) => {
  const db = DoodhDostStore.getDB();
  const [supplierName, setSupplierName] = useState(
    `${db.profile.dairySupplierName} (Van MH-12)`
  );
  const [items, setItems] = useState(
    db.products.map((p) => ({
      productId: p.id,
      productName: p.name,
      packetSize: p.packetSize,
      quantity: 50,
      purchaseCost: p.purchaseCost,
    }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateQty = (productId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    );
  };

  const totalPackets = items.reduce((acc, i) => acc + i.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalPackets <= 0) return;

    setIsSubmitting(true);
    try {
      DoodhDostStore.recordDairyReceipt(
        supplierName,
        items
          .filter((i) => i.quantity > 0)
          .map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            purchaseCost: i.purchaseCost,
          }))
      );
      onReceiptSaved();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error recording stock receipt');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Receive Morning Dairy Stock"
      subtitle="Log fresh crate arrivals from chilling plant"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#6B756D] uppercase mb-1">
            Dairy Supplier / Delivery Van *
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              className="w-full bg-[#F8FAF8] border border-[#E7ECE8] rounded-xl px-3 py-2 text-sm text-[#202820] focus:outline-none focus:border-[#246B4B]"
            />
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#6B756D] uppercase">
            <span>Product Breakdown</span>
            <span>Crates / Packets Received</span>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
            {items.map((item) => (
              <div
                key={item.productId}
                className="bg-white p-3 rounded-xl border border-[#E7ECE8] flex items-center justify-between shadow-2xs"
              >
                <div>
                  <div className="text-sm font-bold text-[#202820]">{item.productName}</div>
                  <div className="text-xs text-[#6B756D]">Size: {item.packetSize}</div>
                </div>

                <QuantityStepper
                  value={item.quantity}
                  onChange={(val) => handleUpdateQty(item.productId, val)}
                  min={0}
                  step={10}
                  unit="pkts"
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#FFF0D9] p-3.5 rounded-xl border border-[#FFE1B3] flex items-center justify-between">
          <div>
            <div className="text-xs text-[#8C5D19]">Total Stock Received</div>
            <div className="text-xl font-black text-[#8C5D19]">{totalPackets} Packets</div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting || totalPackets <= 0}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            {isSubmitting ? 'Receiving...' : 'Confirm Receipt'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
