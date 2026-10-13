'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { DoodhDostStore } from '@/lib/db/storage';
import { formatINR, calculateLineTotal } from '@/lib/calc';
import { Order, OrderStatus } from '@/types/doodh_dost';
import { CheckCircle2, Truck, FileText, CornerDownLeft } from 'lucide-react';

interface DeliveryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onDeliveryUpdated: () => void;
  onOpenReturns: (order: Order) => void;
  onOpenFinalBill: (order: Order) => void;
}

interface DeliveryContentProps {
  order: Order;
  onClose: () => void;
  onDeliveryUpdated: () => void;
  onOpenReturns: (order: Order) => void;
  onOpenFinalBill: (order: Order) => void;
}

const DeliveryContent: React.FC<DeliveryContentProps> = ({
  order,
  onClose,
  onDeliveryUpdated,
  onOpenReturns,
  onOpenFinalBill,
}) => {
  const [items, setItems] = useState(() =>
    order.items.map((i) => ({
      productId: i.productId,
      productName: i.productName,
      packetSize: i.packetSize,
      orderedQuantity: i.orderedQuantity,
      deliveredQuantity: i.deliveredQuantity,
      unitPrice: i.unitPrice,
    }))
  );

  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateDeliveredQty = (productId: string, qty: number) => {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, deliveredQuantity: qty } : i))
    );
  };

  const totalDelivered = items.reduce((acc, i) => acc + i.deliveredQuantity, 0);
  const totalDeliveredValue = items.reduce(
    (acc, i) => acc + calculateLineTotal(i.deliveredQuantity, i.unitPrice),
    0
  );

  const handleSaveDelivery = (newStatus: OrderStatus) => {
    setIsSubmitting(true);
    try {
      DoodhDostStore.updateDelivery(
        order.id,
        newStatus,
        items.map((i) => ({
          productId: i.productId,
          deliveredQuantity: i.deliveredQuantity,
          unitPrice: i.unitPrice,
        })),
        reason
      );
      onDeliveryUpdated();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error updating delivery');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Status pipeline indicator */}
      <div className="bg-[#F1F8F3] p-3 rounded-xl border border-[#B9E6C8]/70 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#246B4B]" />
          <span className="font-semibold text-[#202820]">Current Status:</span>
          <span className="font-bold text-[#246B4B] uppercase">{order.status.replace('_', ' ')}</span>
        </div>
        <span className="text-[#6B756D]">{order.orderDate}</span>
      </div>

      {/* Item-by-item Delivery Stepper */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-[#6B756D] uppercase">
          <span>Product Breakdown</span>
          <span>Delivered Qty / Ordered</span>
        </div>

        {items.map((item) => {
          const hasShortage = item.deliveredQuantity < item.orderedQuantity;
          const hasSurplus = item.deliveredQuantity > item.orderedQuantity;
          const lineTotal = calculateLineTotal(item.deliveredQuantity, item.unitPrice);

          return (
            <div
              key={item.productId}
              className="bg-white p-3.5 rounded-xl border border-[#E7ECE8] shadow-2xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-[#202820]">{item.productName}</div>
                  <div className="text-xs text-[#6B756D]">
                    Size: {item.packetSize} · Ordered: {item.orderedQuantity} pkts
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-extrabold text-[#202820]">
                    {formatINR(lineTotal)}
                  </div>
                  <div className="text-[10px] text-[#6B756D]">
                    @ ₹{item.unitPrice} / pkt
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E7ECE8]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#202820]">Delivered:</span>
                  <QuantityStepper
                    value={item.deliveredQuantity}
                    onChange={(val) => handleUpdateDeliveredQty(item.productId, val)}
                    min={0}
                    step={1}
                    unit="pkts"
                    size="sm"
                  />
                </div>

                {hasShortage && (
                  <span className="text-[11px] font-semibold text-[#C62828] bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                    Shortage: -{item.orderedQuantity - item.deliveredQuantity}
                  </span>
                )}
                {hasSurplus && (
                  <span className="text-[11px] font-semibold text-[#246B4B] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Extra: +{item.deliveredQuantity - item.orderedQuantity}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Shortage or delivery reason */}
      <div>
        <label className="block text-xs font-bold text-[#6B756D] uppercase mb-1">
          Delivery Notes / Shortage Reason
        </label>
        <input
          type="text"
          placeholder="e.g. 2 leaking packets replaced, delivered to store boy Mohan"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full bg-[#F8FAF8] border border-[#E7ECE8] rounded-xl px-3 py-2 text-sm text-[#202820] focus:outline-none focus:border-[#246B4B]"
        />
      </div>

      {/* Total Summary */}
      <div className="bg-[#F8FAF8] p-3.5 rounded-xl border border-[#E7ECE8] flex items-center justify-between">
        <div>
          <div className="text-xs text-[#6B756D]">Actual Delivered Total</div>
          <div className="text-lg font-extrabold text-[#246B4B]">
            {formatINR(totalDeliveredValue)}
          </div>
          <div className="text-[11px] text-[#6B756D]">{totalDelivered} total packets</div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => handleSaveDelivery('out_for_delivery')}
            disabled={isSubmitting}
          >
            Out for Delivery
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => handleSaveDelivery('delivered')}
            disabled={isSubmitting}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            Mark Delivered
          </Button>
        </div>
      </div>

      {/* Post-Delivery Next Steps (Returns & Billing) */}
      {order.status === 'delivered' && !order.isBilled && (
        <div className="pt-2 border-t border-[#E7ECE8] flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={() => {
              onClose();
              onOpenReturns(order);
            }}
            icon={<CornerDownLeft className="w-4 h-4" />}
          >
            Record Return
          </Button>

          <Button
            variant="cream"
            size="md"
            fullWidth
            onClick={() => {
              onClose();
              onOpenFinalBill(order);
            }}
            icon={<FileText className="w-4 h-4" />}
          >
            Generate Final Bill
          </Button>
        </div>
      )}
    </div>
  );
};

export const DeliveryDetailsModal: React.FC<DeliveryDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
  onDeliveryUpdated,
  onOpenReturns,
  onOpenFinalBill,
}) => {
  if (!isOpen || !order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delivery & Crate Check"
      subtitle={`${order.shopName} · ${order.orderNumber}`}
      maxWidth="lg"
    >
      <DeliveryContent
        order={order}
        onClose={onClose}
        onDeliveryUpdated={onDeliveryUpdated}
        onOpenReturns={onOpenReturns}
        onOpenFinalBill={onOpenFinalBill}
      />
    </Modal>
  );
};
