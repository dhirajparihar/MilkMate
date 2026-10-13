'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { DoodhDostStore } from '@/lib/db/storage';
import { formatINR, calculateLineTotal } from '@/lib/calc';
import { getTodayDateString } from '@/lib/db/mock-data';
import { CowMascot } from '@/components/mascot/CowMascot';
import { Check, ShoppingBag, Plus, Trash2, Calendar, Store } from 'lucide-react';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedShopId?: string;
  onOrderCreated: (orderId: string) => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  preselectedShopId,
  onOrderCreated,
}) => {
  const shops = DoodhDostStore.getShops().filter((s) => s.isActive);
  const products = DoodhDostStore.getProducts().filter((p) => p.isActive);

  const [selectedShopId, setSelectedShopId] = useState<string>(
    preselectedShopId || (shops[0]?.id ?? '')
  );
  const [orderDate, setOrderDate] = useState<string>(getTodayDateString());
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial order items: default to top 2 products with typical quantities
  const [items, setItems] = useState<
    Array<{ productId: string; quantity: number; unitPrice: number }>
  >([
    {
      productId: products[0]?.id || 'prod-001',
      quantity: 30,
      unitPrice: products[0]?.defaultPrice || 27,
    },
    {
      productId: products[1]?.id || 'prod-002',
      quantity: 20,
      unitPrice: products[1]?.defaultPrice || 34,
    },
  ]);

  const handleShopChange = (shopId: string) => {
    setSelectedShopId(shopId);
    // Update unit prices if shop has price overrides
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        unitPrice: DoodhDostStore.getEffectiveProductPrice(shopId, item.productId),
      }))
    );
  };

  const handleAddProduct = (productId: string) => {
    const existing = items.find((i) => i.productId === productId);
    if (existing) {
      setItems((prev) =>
        prev.map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + 10 } : i))
      );
    } else {
      const price = DoodhDostStore.getEffectiveProductPrice(selectedShopId, productId);
      setItems((prev) => [...prev, { productId, quantity: 10, unitPrice: price }]);
    }
  };

  const handleRemoveItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    );
  };

  const handleUpdatePrice = (productId: string, price: number) => {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, unitPrice: Math.max(0, price) } : i))
    );
  };

  const totalPackets = items.reduce((acc, i) => acc + i.quantity, 0);
  const estimatedTotal = items.reduce(
    (acc, i) => acc + calculateLineTotal(i.quantity, i.unitPrice),
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShopId) return;
    if (items.length === 0 || totalPackets === 0) return;

    setIsSubmitting(true);
    try {
      const newOrder = DoodhDostStore.createDailyOrder(
        selectedShopId,
        orderDate,
        items.filter((i) => i.quantity > 0),
        notes
      );
      onOrderCreated(newOrder.id);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error creating order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Daily Order"
      subtitle="Enter morning milk order for delivery"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Shop Selection & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#6B756D] uppercase mb-1">
              Select Shop *
            </label>
            <div className="relative">
              <select
                value={selectedShopId}
                onChange={(e) => handleShopChange(e.target.value)}
                required
                className="w-full bg-[#F8FAF8] border border-[#E7ECE8] rounded-xl px-3 py-2.5 text-sm font-medium text-[#202820] focus:outline-none focus:border-[#246B4B]"
              >
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name} {shop.currentBalance > 0 ? `(Dues: ₹${shop.currentBalance})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#6B756D] uppercase mb-1">
              Delivery Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full bg-[#F8FAF8] border border-[#E7ECE8] rounded-xl px-3 py-2.5 text-sm font-medium text-[#202820] focus:outline-none focus:border-[#246B4B]"
              />
            </div>
          </div>
        </div>

        {/* Product Items List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B756D] uppercase">
              Ordered Products ({items.length})
            </span>
            <span className="text-xs text-[#246B4B] font-semibold">
              Total {totalPackets} packets
            </span>
          </div>

          {items.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            const lineTotal = calculateLineTotal(item.quantity, item.unitPrice);

            return (
              <div
                key={item.productId}
                className="bg-[#F8FAF8] p-3 rounded-xl border border-[#E7ECE8] space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-[#202820]">
                      {product?.name || 'Milk Product'}
                    </div>
                    <div className="text-xs text-[#6B756D]">
                      Packet: {product?.packetSize || '500 ml'} · SKU: {product?.sku}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.productId)}
                    className="text-[#6B756D] hover:text-[#C62828] p-1 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#E7ECE8]/60">
                  {/* Quantity Stepper with large touch targets */}
                  <QuantityStepper
                    value={item.quantity}
                    onChange={(val) => handleUpdateQuantity(item.productId, val)}
                    min={0}
                    step={5}
                    unit="pkts"
                  />

                  {/* Inline Price Edit & Line Total */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] text-[#6B756D]">Rate / pkt</div>
                      <div className="inline-flex items-center text-xs font-semibold text-[#202820]">
                        ₹
                        <input
                          type="number"
                          step="0.5"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleUpdatePrice(item.productId, parseFloat(e.target.value) || 0)
                          }
                          className="w-12 text-center bg-white border border-[#E7ECE8] rounded px-1 py-0.5 ml-0.5 text-xs focus:outline-none focus:border-[#246B4B]"
                        />
                      </div>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <div className="text-[10px] text-[#6B756D]">Line Total</div>
                      <div className="text-sm font-extrabold text-[#246B4B]">
                        {formatINR(lineTotal)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Add Product Chips */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-bold text-[#6B756D] uppercase">
            Add More Products
          </span>
          <div className="flex flex-wrap gap-1.5">
            {products
              .filter((p) => !items.some((i) => i.productId === p.id))
              .map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleAddProduct(p.id)}
                  className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-white border border-[#E7ECE8] hover:border-[#246B4B] hover:text-[#246B4B] flex items-center gap-1 active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    {p.name} ({p.packetSize}) - ₹{p.defaultPrice}
                  </span>
                </button>
              ))}
          </div>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-bold text-[#6B756D] uppercase mb-1">
            Delivery Notes (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Deliver before 6:30 AM, keep 1 crate inside"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-[#F8FAF8] border border-[#E7ECE8] rounded-xl px-3 py-2 text-sm text-[#202820] focus:outline-none focus:border-[#246B4B]"
          />
        </div>

        {/* Sticky Summary Bar */}
        <div className="bg-[#FFF0D9] p-3.5 rounded-xl border border-[#FFE1B3] flex items-center justify-between">
          <div>
            <div className="text-xs text-[#8C5D19] font-medium">Estimated Order Total</div>
            <div className="text-lg font-extrabold text-[#8C5D19]">
              {formatINR(estimatedTotal)}
            </div>
            <div className="text-[11px] text-[#8C5D19]">
              {totalPackets} packets across {items.length} products
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting || totalPackets === 0}
            icon={<Check className="w-4 h-4" />}
          >
            {isSubmitting ? 'Saving...' : 'Save Order'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
