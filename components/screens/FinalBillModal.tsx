'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { DoodhDostStore } from '@/lib/db/storage';
import { formatINR, calculateNetInvoice } from '@/lib/calc';
import { Order, Invoice } from '@/types/doodh_dost';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FinalBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onInvoiceCreated: (invoice: Invoice) => void;
  onOpenPayment: (invoice: Invoice) => void;
}

interface FinalBillContentProps {
  order: Order;
  onClose: () => void;
  onInvoiceCreated: (invoice: Invoice) => void;
  onOpenPayment: (invoice: Invoice) => void;
}

const FinalBillContent: React.FC<FinalBillContentProps> = ({
  order,
  onClose,
  onInvoiceCreated,
  onOpenPayment,
}) => {
  const db = DoodhDostStore.getDB();
  const shop = db.shops.find((s) => s.id === order.shopId);

  // Return credits for this order
  const relatedReturns = db.returns.filter(
    (r) => r.orderId === order.id && r.status === 'approved'
  );
  const totalReturnCredits = relatedReturns.reduce((acc, r) => acc + r.totalCreditAmount, 0);

  const [otherCharges, setOtherCharges] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);

  const deliveredValue = order.items.reduce((acc, i) => acc + i.lineTotal, 0);
  const netAmount = calculateNetInvoice(deliveredValue, totalReturnCredits, otherCharges, discount);
  const previousShopBalance = shop?.currentBalance ?? 0;
  const totalDueWithPrevious = previousShopBalance + netAmount;

  const handleFinalize = () => {
    setIsSubmitting(true);
    try {
      const inv = DoodhDostStore.finalizeInvoice(order.id, otherCharges, discount);
      setCreatedInvoice(inv);
      onInvoiceCreated(inv);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {
        // Confetti optional
      }
    } catch (err: any) {
      alert(err.message || 'Error creating invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* On-Screen Invoice Bill Layout */}
      <div className="bg-white border-2 border-[#E7ECE8] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5 font-sans">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E7ECE8] pb-3">
          <div>
            <div className="text-xs font-bold text-[#246B4B] uppercase tracking-wider">
              {db.profile.businessName}
            </div>
            <div className="text-base sm:text-lg font-black text-[#202820]">
              DAILY MILK DELIVERY BILL
            </div>
            <div className="text-xs text-[#6B756D] mt-0.5">
              {db.profile.phone} · {db.profile.address}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-bold text-[#202820]">
              {createdInvoice ? createdInvoice.invoiceNumber : 'DRAFT'}
            </div>
            <div className="text-xs text-[#6B756D]">{order.orderDate}</div>
            <div className="text-[10px] text-[#246B4B] font-semibold mt-0.5">
              Order: {order.orderNumber}
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="bg-[#F8FAF8] p-3 rounded-xl border border-[#E7ECE8] flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-[#6B756D] uppercase">Bill To (Shop):</div>
            <div className="text-sm font-extrabold text-[#202820]">{order.shopName}</div>
            <div className="text-xs text-[#6B756D]">
              {shop?.ownerName} · {shop?.phone}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-[#6B756D]">Opening Balance</div>
            <div className="text-xs font-bold text-[#202820]">
              {formatINR(previousShopBalance)}
            </div>
          </div>
        </div>

        {/* Delivered Items Table */}
        <div className="space-y-1.5">
          <div className="text-xs font-bold text-[#6B756D] uppercase">Delivered Items</div>
          <div className="border border-[#E7ECE8] rounded-xl overflow-hidden text-xs">
            <div className="bg-[#F1F8F3] px-3 py-2 font-bold text-[#246B4B] grid grid-cols-12 gap-1">
              <span className="col-span-6">Product</span>
              <span className="col-span-2 text-right">Qty</span>
              <span className="col-span-2 text-right">Rate</span>
              <span className="col-span-2 text-right">Amount</span>
            </div>
            <div className="divide-y divide-[#E7ECE8]">
              {order.items.map((item) => (
                <div key={item.id} className="px-3 py-2 grid grid-cols-12 gap-1 items-center">
                  <div className="col-span-6 font-medium text-[#202820]">
                    {item.productName} ({item.packetSize})
                  </div>
                  <div className="col-span-2 text-right font-bold text-[#202820]">
                    {item.deliveredQuantity}
                  </div>
                  <div className="col-span-2 text-right text-[#6B756D]">
                    ₹{item.unitPrice}
                  </div>
                  <div className="col-span-2 text-right font-bold text-[#202820]">
                    {formatINR(item.lineTotal)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Return Credits (if any) */}
        {totalReturnCredits > 0 && (
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-[#246B4B] uppercase">
              Same-Day Return Credits Deducted
            </div>
            <div className="bg-[#F1F8F3] border border-[#B9E6C8] rounded-xl p-2.5 text-xs space-y-1">
              {relatedReturns.flatMap((r) => r.items).map((item) => (
                <div key={item.id} className="flex items-center justify-between text-[#202820]">
                  <span>
                    {item.productName} ({item.returnQuantity} pkts · {item.condition})
                  </span>
                  <span className="font-bold text-[#246B4B]">
                    - {formatINR(item.totalCredit)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calculations Summary */}
        <div className="space-y-1.5 pt-2 border-t border-[#E7ECE8] text-xs">
          <div className="flex justify-between text-[#6B756D]">
            <span>Delivered Value:</span>
            <span className="font-bold text-[#202820]">{formatINR(deliveredValue)}</span>
          </div>

          {totalReturnCredits > 0 && (
            <div className="flex justify-between text-[#246B4B] font-semibold">
              <span>Total Return Credit:</span>
              <span>- {formatINR(totalReturnCredits)}</span>
            </div>
          )}

          {!createdInvoice && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-[10px] text-[#6B756D]">Other Charges (+)</label>
                <input
                  type="number"
                  value={otherCharges}
                  onChange={(e) => setOtherCharges(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#F8FAF8] border border-[#E7ECE8] rounded px-2 py-1 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#6B756D]">Discount (-)</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#F8FAF8] border border-[#E7ECE8] rounded px-2 py-1 text-xs"
                />
              </div>
            </div>
          )}

          {/* Net Bill Amount */}
          <div className="flex justify-between items-center text-sm font-extrabold text-[#202820] pt-2 border-t border-[#E7ECE8]">
            <span>Today&apos;s Net Bill:</span>
            <span className="text-base text-[#246B4B]">{formatINR(netAmount)}</span>
          </div>

          {/* Total Balance Due (Previous + Current Bill) */}
          <div className="bg-[#FFF0D9] p-2.5 rounded-lg border border-[#FFE1B3] flex justify-between items-center font-bold text-xs text-[#8C5D19]">
            <span>Total Dues with Previous Balance:</span>
            <span className="text-sm font-black">{formatINR(totalDueWithPrevious)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {!createdInvoice ? (
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <Button variant="outline" size="md" onClick={onClose} disabled={isSubmitting}>
            Back
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleFinalize}
            disabled={isSubmitting}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            {isSubmitting ? 'Locking...' : 'Confirm & Finalize Bill'}
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 pt-1">
          <Button variant="outline" size="md" fullWidth onClick={onClose}>
            Done (View History)
          </Button>
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={() => {
              onClose();
              onOpenPayment(createdInvoice);
            }}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Record Payment
          </Button>
        </div>
      )}
    </div>
  );
};

export const FinalBillModal: React.FC<FinalBillModalProps> = ({
  isOpen,
  onClose,
  order,
  onInvoiceCreated,
  onOpenPayment,
}) => {
  if (!isOpen || !order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Final Bill"
      subtitle={`Review delivered quantities & return credits for ${order.shopName}`}
      maxWidth="lg"
    >
      <FinalBillContent
        order={order}
        onClose={onClose}
        onInvoiceCreated={onInvoiceCreated}
        onOpenPayment={onOpenPayment}
      />
    </Modal>
  );
};
