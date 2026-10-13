'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { DoodhDostStore } from '@/lib/db/storage';
import { formatINR, calculatePacketCredit, toRupees, toPaise } from '@/lib/calc';
import { Order, ReturnCondition } from '@/types/doodh_dost';
import { CornerDownLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onReturnSaved: () => void;
}

interface ReturnContentProps {
  order: Order;
  onClose: () => void;
  onReturnSaved: () => void;
}

const ReturnContent: React.FC<ReturnContentProps> = ({
  order,
  onClose,
  onReturnSaved,
}) => {
  const db = DoodhDostStore.getDB();
  const eligibleProducts = order.items.filter((i) => i.deliveredQuantity > 0);

  const [selectedProductId, setSelectedProductId] = useState<string>(
    () => eligibleProducts[0]?.productId || ''
  );
  const [returnQuantity, setReturnQuantity] = useState<number>(1);
  const [condition, setCondition] = useState<ReturnCondition>('saleable');
  const [reason, setReason] = useState<string>('Unsold packets from previous night');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedItem = order.items.find((i) => i.productId === selectedProductId);
  const product = db.products.find((p) => p.id === selectedProductId);

  // Return policy resolution
  const policy = db.returnPolicies.find((pol) => pol.productId === selectedProductId);
  const policyType = policy ? policy.policyType : product?.returnPolicyType ?? 'full_credit';
  const creditPct = policy ? policy.creditPercentage : product?.returnCreditPercentage ?? 100;

  const unitPrice = selectedItem?.unitPrice ?? 0;
  const maxEligibleQty = selectedItem?.deliveredQuantity ?? 0;

  const creditPerPacket = calculatePacketCredit(unitPrice, policyType, creditPct, condition);
  const totalCredit = toRupees(returnQuantity * toPaise(creditPerPacket));

  const isNoReturns = policyType === 'no_returns';
  const isInvalidQty = returnQuantity <= 0 || returnQuantity > maxEligibleQty;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNoReturns || isInvalidQty) return;

    setIsSubmitting(true);
    try {
      DoodhDostStore.createReturn(order.shopId, order.id, [
        {
          productId: selectedProductId,
          returnQuantity,
          condition,
          reason,
        },
      ]);
      onReturnSaved();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error recording return');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Policy notice banner */}
      <div className="bg-[#F1F8F3] p-3 rounded-xl border border-[#B9E6C8]/70 flex items-start gap-2.5">
        <CornerDownLeft className="w-4 h-4 text-[#246B4B] shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-bold text-[#246B4B]">Same-Day Return Policy: </span>
          <span className="text-[#202820]">
            Returns are credited directly against today&apos;s invoice before final billing.
          </span>
        </div>
      </div>

      {/* Product selector */}
      <div>
        <label className="block text-xs font-bold text-[#6B756D] uppercase mb-1">
          Delivered Product *
        </label>
        <select
          value={selectedProductId}
          onChange={(e) => {
            setSelectedProductId(e.target.value);
            setReturnQuantity(1);
          }}
          className="w-full bg-[#F8FAF8] border border-[#E7ECE8] rounded-xl px-3 py-2.5 text-sm font-medium text-[#202820] focus:outline-none focus:border-[#246B4B]"
        >
          {eligibleProducts.map((item) => (
            <option key={item.productId} value={item.productId}>
              {item.productName} ({item.packetSize}) — Delivered: {item.deliveredQuantity} pkts
            </option>
          ))}
        </select>
      </div>

      {/* Policy indicator tag */}
      <div className="bg-white p-3 rounded-xl border border-[#E7ECE8] text-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[#6B756D]">Applicable Return Policy:</span>
          <span className="font-bold text-[#246B4B] uppercase">
            {policyType.replace('_', ' ')} ({creditPct}%)
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#6B756D]">Delivered Unit Price:</span>
          <span className="font-bold text-[#202820]">₹{unitPrice} / pkt</span>
        </div>
        <div className="flex items-center justify-between text-[#246B4B] font-semibold pt-1 border-t border-[#E7ECE8]">
          <span>Calculated Credit / Packet:</span>
          <span className="text-sm font-bold">₹{creditPerPacket}</span>
        </div>
      </div>

      {/* Condition toggle (Saleable vs Damaged) */}
      <div>
        <label className="block text-xs font-bold text-[#6B756D] uppercase mb-1.5">
          Packet Condition *
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setCondition('saleable')}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              condition === 'saleable'
                ? 'bg-[#F1F8F3] border-[#246B4B] text-[#246B4B]'
                : 'bg-white border-[#E7ECE8] text-[#6B756D]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Saleable (Back to Stock)</span>
          </button>

          <button
            type="button"
            onClick={() => setCondition('damaged')}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              condition === 'damaged'
                ? 'bg-amber-50 border-amber-500 text-amber-800'
                : 'bg-white border-[#E7ECE8] text-[#6B756D]'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Damaged / Leaking (Quarantine)</span>
          </button>
        </div>
      </div>

      {/* Quantity Stepper */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-bold text-[#6B756D] uppercase">
            Return Quantity (Max: {maxEligibleQty})
          </label>
          <span className="text-xs text-[#6B756D]">
            Delivered: {maxEligibleQty} pkts
          </span>
        </div>
        <div className="flex items-center gap-3">
          <QuantityStepper
            value={returnQuantity}
            onChange={setReturnQuantity}
            min={1}
            max={maxEligibleQty}
            step={1}
            unit="pkts"
          />
          {returnQuantity > maxEligibleQty && (
            <span className="text-xs text-[#C62828] font-medium">
              Cannot exceed delivered quantity
            </span>
          )}
        </div>
      </div>

      {/* Reason selector */}
      <div>
        <label className="block text-xs font-bold text-[#6B756D] uppercase mb-1">
          Reason for Return
        </label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full bg-[#F8FAF8] border border-[#E7ECE8] rounded-xl px-3 py-2 text-sm text-[#202820] focus:outline-none focus:border-[#246B4B]"
        />
      </div>

      {/* Summary Credit Card */}
      <div className="bg-[#FFF0D9] p-3.5 rounded-xl border border-[#FFE1B3] flex items-center justify-between">
        <div>
          <div className="text-xs text-[#8C5D19]">Total Return Credit</div>
          <div className="text-xl font-extrabold text-[#8C5D19]">
            {formatINR(totalCredit)}
          </div>
          <div className="text-[11px] text-[#8C5D19]">
            {returnQuantity} pkts @ ₹{creditPerPacket} credit
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isSubmitting || isNoReturns || isInvalidQty}
        >
          {isSubmitting ? 'Saving...' : 'Approve Credit'}
        </Button>
      </div>
    </form>
  );
};

export const ReturnModal: React.FC<ReturnModalProps> = ({
  isOpen,
  onClose,
  order,
  onReturnSaved,
}) => {
  if (!isOpen || !order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Same-Day Return & Credit"
      subtitle={`${order.shopName} · ${order.orderNumber}`}
      maxWidth="md"
    >
      <ReturnContent
        order={order}
        onClose={onClose}
        onReturnSaved={onReturnSaved}
      />
    </Modal>
  );
};
