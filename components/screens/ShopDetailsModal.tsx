'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { DoodhDostStore } from '@/lib/db/storage';
import { formatINR } from '@/lib/calc';
import { Shop } from '@/types/doodh_dost';
import { Store, Phone, MapPin, Receipt, Coins, Plus, Edit2, ShieldAlert } from 'lucide-react';

interface ShopDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shop: Shop | null;
  onEditShop: (shop: Shop) => void;
  onStartOrder: (shopId: string) => void;
}

export const ShopDetailsModal: React.FC<ShopDetailsModalProps> = ({
  isOpen,
  onClose,
  shop,
  onEditShop,
  onStartOrder,
}) => {
  if (!shop) return null;

  const db = DoodhDostStore.getDB();
  const shopOrders = db.orders.filter((o) => o.shopId === shop.id);
  const shopInvoices = db.invoices.filter((i) => i.shopId === shop.id);
  const shopPayments = db.payments.filter((p) => p.shopId === shop.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={shop.name}
      subtitle={`Route: ${shop.routeArea || 'General Area'}`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Contact & Status Bar */}
        <div className="bg-[#F8FAF8] p-3.5 rounded-xl border border-[#E7ECE8] flex items-start justify-between">
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2 text-[#202820] font-bold">
              <Store className="w-4 h-4 text-[#246B4B]" />
              <span>Owner: {shop.ownerName || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 text-[#6B756D]">
              <Phone className="w-3.5 h-3.5 text-[#6B756D]" />
              <span>{shop.phone || 'No phone'}</span>
            </div>
            <div className="flex items-center gap-2 text-[#6B756D]">
              <MapPin className="w-3.5 h-3.5 text-[#6B756D]" />
              <span>{shop.address || 'Address not set'}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onEditShop(shop);
            }}
            className="text-xs font-semibold text-[#246B4B] hover:underline flex items-center gap-1 p-1"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>

        {/* Balance Ledger Card */}
        <div className="bg-[#FFF0D9] p-4 rounded-xl border border-[#FFE1B3] flex items-center justify-between">
          <div>
            <div className="text-xs text-[#8C5D19] font-medium">Current Outstanding Dues</div>
            <div className="text-2xl font-black text-[#8C5D19]">
              {formatINR(shop.currentBalance)}
            </div>
            <div className="text-[11px] text-[#8C5D19] mt-0.5">
              Opening balance was {formatINR(shop.openingBalance)}
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onClose();
              onStartOrder(shop.id);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            New Order
          </Button>
        </div>

        {/* Recent Invoices Ledger */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[#6B756D] uppercase">
            Invoices & Billing History ({shopInvoices.length})
          </h4>
          {shopInvoices.length === 0 ? (
            <div className="text-xs text-[#6B756D] p-3 text-center bg-[#F8FAF8] rounded-lg">
              No bills generated yet for this shop.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {shopInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-white p-2.5 rounded-lg border border-[#E7ECE8] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-[#202820]">{inv.invoiceNumber}</span>
                    <span className="text-[#6B756D] ml-2">{inv.invoiceDate}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-[#202820]">{formatINR(inv.netAmount)}</span>
                    <span
                      className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        inv.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payments Collected History */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[#6B756D] uppercase">
            Payments Received ({shopPayments.length})
          </h4>
          {shopPayments.length === 0 ? (
            <div className="text-xs text-[#6B756D] p-3 text-center bg-[#F8FAF8] rounded-lg">
              No payments recorded yet.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {shopPayments.map((pay) => (
                <div
                  key={pay.id}
                  className="bg-white p-2.5 rounded-lg border border-[#E7ECE8] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-[#246B4B]" />
                    <span className="font-bold text-[#202820] uppercase">{pay.paymentMethod}</span>
                    <span className="text-[#6B756D]">({pay.paymentNumber})</span>
                  </div>
                  <div className="font-extrabold text-[#246B4B]">
                    +{formatINR(pay.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
