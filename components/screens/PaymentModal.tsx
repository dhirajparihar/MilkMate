'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { DoodhDostStore } from '@/lib/db/storage';
import { formatINR, toRupees, toPaise } from '@/lib/calc';
import { Invoice, PaymentMethod, Payment } from '@/types/doodh_dost';
import { Coins, QrCode, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onPaymentSaved: () => void;
}

interface PaymentContentProps {
  invoice: Invoice;
  onClose: () => void;
  onPaymentSaved: () => void;
}

const PaymentContent: React.FC<PaymentContentProps> = ({
  invoice,
  onClose,
  onPaymentSaved,
}) => {
  const db = DoodhDostStore.getDB();
  const shop = db.shops.find((s) => s.id === invoice.shopId);

  // Total payable is current invoice remaining + previous shop balance
  const currentBillRemaining = invoice.remainingAmount;
  const currentShopBalance = shop?.currentBalance ?? 0;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amount, setAmount] = useState<number>(currentBillRemaining);
  const [upiReference, setUpiReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('Morning delivery collection');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedPayment, setSavedPayment] = useState<Payment | null>(null);

  const safeAmount = Math.max(0, amount || 0);
  const newShopBalance = Math.max(0, toRupees(toPaise(currentShopBalance) - toPaise(safeAmount)));

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (safeAmount <= 0) return;

    setIsSubmitting(true);
    try {
      const pay = DoodhDostStore.recordPayment(
        invoice.id,
        safeAmount,
        paymentMethod,
        paymentMethod === 'upi' ? upiReference || 'UPI-MANUAL-CONFIRMED' : undefined,
        notes
      );
      setSavedPayment(pay);
      onPaymentSaved();
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Confetti optional
      }
    } catch (err: any) {
      alert(err.message || 'Error recording payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {!savedPayment ? (
        <form onSubmit={handleRecordPayment} className="space-y-4">
          {/* Bill summary card */}
          <div className="bg-[#F8FAF8] p-3.5 rounded-xl border border-[#E7ECE8] space-y-2 text-xs">
            <div className="flex justify-between text-[#6B756D]">
              <span>Net Bill Amount:</span>
              <span className="font-bold text-[#202820]">{formatINR(invoice.netAmount)}</span>
            </div>
            <div className="flex justify-between text-[#6B756D]">
              <span>Current Shop Outstanding:</span>
              <span className="font-bold text-[#8C5D19]">{formatINR(currentShopBalance)}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-extrabold text-[#202820] pt-1.5 border-t border-[#E7ECE8]">
              <span>Pending on this Invoice:</span>
              <span className="text-[#246B4B]">{formatINR(currentBillRemaining)}</span>
            </div>
          </div>

          {/* Payment Method Selector (Cash vs UPI) */}
          <div>
            <label className="block text-xs font-bold text-[#6B756D] uppercase mb-1.5">
              Payment Mode *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  paymentMethod === 'cash'
                    ? 'bg-[#F1F8F3] border-[#246B4B] text-[#246B4B] shadow-xs'
                    : 'bg-white border-[#E7ECE8] text-[#6B756D]'
                }`}
              >
                <Coins className="w-4 h-4" />
                <span>Cash Received</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  paymentMethod === 'upi'
                    ? 'bg-[#F1F8F3] border-[#246B4B] text-[#246B4B] shadow-xs'
                    : 'bg-white border-[#E7ECE8] text-[#6B756D]'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>UPI / QR Scan</span>
              </button>
            </div>
          </div>

          {/* Amount Received Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-[#6B756D] uppercase">
                Amount Received (₹) *
              </label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setAmount(currentBillRemaining)}
                  className="text-[10px] font-bold text-[#246B4B] bg-[#F1F8F3] px-2 py-0.5 rounded border border-[#B9E6C8]"
                >
                  Full Bill ({formatINR(currentBillRemaining, false)})
                </button>
                {currentShopBalance > currentBillRemaining && (
                  <button
                    type="button"
                    onClick={() => setAmount(currentShopBalance)}
                    className="text-[10px] font-bold text-[#8C5D19] bg-[#FFF0D9] px-2 py-0.5 rounded border border-[#FFE1B3]"
                  >
                    Full Balance ({formatINR(currentShopBalance, false)})
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-[#6B756D]">
                ₹
              </span>
              <input
                type="number"
                step="1"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#F8FAF8] border border-[#E7ECE8] rounded-xl pl-8 pr-3 py-2.5 text-lg font-extrabold text-[#202820] focus:outline-none focus:border-[#246B4B]"
              />
            </div>
          </div>

          {/* UPI Reference (if UPI) */}
          {paymentMethod === 'upi' && (
            <div>
              <label className="block text-xs font-bold text-[#6B756D] uppercase mb-1">
                UPI Reference / UTR Number (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 428190342182 or PhonePe Ref"
                value={upiReference}
                onChange={(e) => setUpiReference(e.target.value)}
                className="w-full bg-[#F8FAF8] border border-[#E7ECE8] rounded-xl px-3 py-2 text-sm text-[#202820] focus:outline-none focus:border-[#246B4B]"
              />
              <p className="text-[10px] text-[#6B756D] mt-1">
                * Confirm payment physically on your bank/UPI app before recording.
              </p>
            </div>
          )}

          {/* Closing Balance Preview */}
          <div className="bg-[#FFF0D9] p-3 rounded-xl border border-[#FFE1B3] flex items-center justify-between text-xs">
            <div>
              <div className="text-[#8C5D19]">New Shop Outstanding Balance</div>
              <div className="text-base font-extrabold text-[#8C5D19]">
                {formatINR(newShopBalance)}
              </div>
            </div>
            {newShopBalance === 0 ? (
              <span className="text-[11px] font-bold text-[#246B4B] bg-[#F1F8F3] px-2.5 py-1 rounded-md">
                Fully Settled ✓
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-[#8C5D19]">
                Partial Payment
              </span>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={isSubmitting || safeAmount <= 0}
            icon={<CheckCircle2 className="w-5 h-5" />}
          >
            {isSubmitting ? 'Recording...' : `Confirm ₹${safeAmount} Received`}
          </Button>
        </form>
      ) : (
        /* Payment Receipt Card */
        <div className="space-y-4">
          <div className="bg-[#F1F8F3] border-2 border-[#B9E6C8] rounded-2xl p-4 text-center space-y-2">
            <div className="w-12 h-12 bg-[#246B4B] text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="text-base font-extrabold text-[#202820]">
              Payment Recorded Successfully!
            </div>
            <div className="text-2xl font-black text-[#246B4B]">
              {formatINR(savedPayment.amount)}
            </div>
            <div className="text-xs text-[#6B756D]">
              Receipt: {savedPayment.paymentNumber} · {savedPayment.paymentDate}
            </div>
            <div className="text-xs text-[#202820] font-medium pt-1">
              Method: <span className="uppercase font-bold">{savedPayment.paymentMethod}</span>
              {savedPayment.upiReference && ` (${savedPayment.upiReference})`}
            </div>
          </div>

          <div className="bg-[#F8FAF8] p-3 rounded-xl border border-[#E7ECE8] text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-[#6B756D]">Shop:</span>
              <span className="font-bold text-[#202820]">{savedPayment.shopName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B756D]">Linked Bill:</span>
              <span className="font-bold text-[#202820]">{savedPayment.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B756D]">Remaining Dues:</span>
              <span className="font-bold text-[#8C5D19]">{formatINR(newShopBalance)}</span>
            </div>
          </div>

          <Button variant="primary" size="md" fullWidth onClick={onClose}>
            Done
          </Button>
        </div>
      )}
    </>
  );
};

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onPaymentSaved,
}) => {
  if (!isOpen || !invoice) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Collection"
      subtitle={`${invoice.shopName} · Invoice ${invoice.invoiceNumber}`}
      maxWidth="md"
    >
      <PaymentContent
        invoice={invoice}
        onClose={onClose}
        onPaymentSaved={onPaymentSaved}
      />
    </Modal>
  );
};
