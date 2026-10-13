'use client';

import React, { useState } from 'react';
import { DoodhDostStore } from '@/lib/db/storage';
import { formatINR } from '@/lib/calc';
import { Invoice } from '@/types/doodh_dost';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Search, Receipt, CheckCircle2, AlertCircle, FileText, Calendar } from 'lucide-react';

interface BillHistoryScreenProps {
  onOpenPayment: (invoice: Invoice) => void;
}

export const BillHistoryScreen: React.FC<BillHistoryScreenProps> = ({ onOpenPayment }) => {
  const db = DoodhDostStore.getDB();
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState<'all' | 'today' | 'yesterday'>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  const filteredInvoices = db.invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.shopName.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterDate === 'today' && inv.invoiceDate !== todayStr) return false;
    if (filterDate === 'yesterday' && inv.invoiceDate !== yesterdayStr) return false;

    return true;
  });

  return (
    <div className="space-y-3.5 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-lg font-extrabold text-[#202820]">Bill & Invoice History</h1>
        <p className="text-xs text-[#6B756D]">
          {filteredInvoices.length} finalized delivery bills
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B756D]" />
        <input
          type="text"
          placeholder="Search by invoice number or shop..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-[#E7ECE8] rounded-xl pl-9 pr-3 py-2 text-sm text-[#202820] focus:outline-none focus:border-[#246B4B]"
        />
      </div>

      {/* Date Filter Tabs */}
      <div className="flex items-center gap-1.5 select-none">
        {[
          { key: 'all', label: 'All Bills' },
          { key: 'today', label: 'Today' },
          { key: 'yesterday', label: 'Yesterday' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilterDate(tab.key as any)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterDate === tab.key
                ? 'bg-[#246B4B] text-white shadow-2xs font-bold'
                : 'bg-white border border-[#E7ECE8] text-[#6B756D]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Invoices List */}
      <div className="space-y-2">
        {filteredInvoices.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-[#E7ECE8] text-center space-y-2">
            <Receipt className="w-8 h-8 text-[#6B756D] mx-auto opacity-40" />
            <div className="text-sm font-bold text-[#202820]">No bills found</div>
            <p className="text-xs text-[#6B756D]">Bills appear here after finalizing an order.</p>
          </div>
        ) : (
          filteredInvoices.map((inv) => {
            const isPaid = inv.status === 'paid';
            const isPartial = inv.status === 'partially_paid';

            return (
              <div
                key={inv.id}
                onClick={() => setSelectedInvoice(inv)}
                className="bg-white p-3.5 rounded-xl border border-[#E7ECE8] flex items-center justify-between cursor-pointer hover:border-[#B9E6C8] transition-all shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-[#202820]">{inv.shopName}</h3>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-800'
                          : isPartial
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-red-50 text-red-800'
                      }`}
                    >
                      {inv.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-xs text-[#6B756D] flex items-center gap-2">
                    <span>{inv.invoiceNumber}</span>
                    <span>·</span>
                    <span>{inv.invoiceDate}</span>
                  </div>

                  {inv.totalReturnCredits > 0 && (
                    <div className="text-[11px] text-[#246B4B] font-medium">
                      Return Credit: -{formatINR(inv.totalReturnCredits)}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-base font-black text-[#202820]">
                    {formatINR(inv.netAmount)}
                  </div>
                  {inv.remainingAmount > 0 && (
                    <div className="text-[11px] text-[#8C5D19] font-bold">
                      Due: {formatINR(inv.remainingAmount)}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Invoice Snapshot Viewer Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Invoice ${selectedInvoice.invoiceNumber}`}
          subtitle={`${selectedInvoice.shopName} · ${selectedInvoice.invoiceDate}`}
          maxWidth="md"
        >
          <div className="space-y-3.5 text-xs">
            {/* Items */}
            <div className="border border-[#E7ECE8] rounded-xl overflow-hidden">
              <div className="bg-[#F1F8F3] p-2 font-bold text-[#246B4B] grid grid-cols-12">
                <span className="col-span-6">Item</span>
                <span className="col-span-2 text-right">Qty</span>
                <span className="col-span-2 text-right">Rate</span>
                <span className="col-span-2 text-right">Amount</span>
              </div>
              <div className="divide-y divide-[#E7ECE8]">
                {selectedInvoice.items.map((it) => (
                  <div key={it.id} className="p-2 grid grid-cols-12 text-[#202820]">
                    <span className="col-span-6 font-medium">
                      {it.productName} ({it.packetSize})
                    </span>
                    <span className="col-span-2 text-right font-bold">{it.deliveredQuantity}</span>
                    <span className="col-span-2 text-right text-[#6B756D]">₹{it.unitPrice}</span>
                    <span className="col-span-2 text-right font-bold">
                      {formatINR(it.lineAmount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations */}
            <div className="bg-[#F8FAF8] p-3 rounded-xl border border-[#E7ECE8] space-y-1.5">
              <div className="flex justify-between text-[#6B756D]">
                <span>Delivered Value:</span>
                <span className="font-bold text-[#202820]">
                  {formatINR(selectedInvoice.deliveredValue)}
                </span>
              </div>

              {selectedInvoice.totalReturnCredits > 0 && (
                <div className="flex justify-between text-[#246B4B] font-semibold">
                  <span>Return Credit:</span>
                  <span>-{formatINR(selectedInvoice.totalReturnCredits)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm font-black text-[#202820] pt-1.5 border-t border-[#E7ECE8]">
                <span>Net Invoice Amount:</span>
                <span className="text-base text-[#246B4B]">
                  {formatINR(selectedInvoice.netAmount)}
                </span>
              </div>

              <div className="flex justify-between text-[#6B756D] pt-1">
                <span>Paid So Far:</span>
                <span className="font-bold text-[#246B4B]">
                  {formatINR(selectedInvoice.paidAmount)}
                </span>
              </div>

              <div className="flex justify-between text-[#8C5D19] font-bold">
                <span>Remaining Balance Due:</span>
                <span>{formatINR(selectedInvoice.remainingAmount)}</span>
              </div>
            </div>

            {selectedInvoice.remainingAmount > 0 && (
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => {
                  const inv = selectedInvoice;
                  setSelectedInvoice(null);
                  onOpenPayment(inv);
                }}
              >
                Record Payment for this Bill
              </Button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
