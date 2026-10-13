'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { DoodhDostStore } from '@/lib/db/storage';
import { formatINR } from '@/lib/calc';
import { Order, OrderStatus } from '@/types/doodh_dost';
import {
  Plus,
  Search,
  Truck,
  Receipt,
  CornerDownLeft,
  Coins,
  CheckCircle2,
  Clock,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface OrdersScreenProps {
  onOpenCreateOrder: () => void;
  onOpenDeliveryDetails: (order: Order) => void;
  onOpenReturns: (order: Order) => void;
  onOpenFinalBill: (order: Order) => void;
  onOpenPaymentForOrder: (order: Order) => void;
}

export const OrdersScreen: React.FC<OrdersScreenProps> = ({
  onOpenCreateOrder,
  onOpenDeliveryDetails,
  onOpenReturns,
  onOpenFinalBill,
  onOpenPaymentForOrder,
}) => {
  const db = DoodhDostStore.getDB();
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'delivered' | 'billed' | 'paid'>('all');

  const filteredOrders = db.orders.filter((order) => {
    const matchesSearch =
      order.shopName.toLowerCase().includes(search.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'pending') {
      return order.status === 'placed' || order.status === 'out_for_delivery';
    }
    if (filterTab === 'delivered') {
      return order.status === 'delivered';
    }
    if (filterTab === 'billed') {
      return order.status === 'billed';
    }
    if (filterTab === 'paid') {
      return order.status === 'paid';
    }
    return true;
  });

  return (
    <div className="space-y-3.5 pb-20">
      {/* Top Header & New Order CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-[#202820]">Delivery Orders</h1>
          <p className="text-xs text-[#6B756D]">
            {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} listed
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onOpenCreateOrder}
          icon={<Plus className="w-4 h-4" />}
        >
          New Order
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B756D]" />
        <input
          type="text"
          placeholder="Search shop name or order no..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-[#E7ECE8] rounded-xl pl-9 pr-3 py-2 text-sm text-[#202820] focus:outline-none focus:border-[#246B4B]"
        />
      </div>

      {/* Segmented Filter Control */}
      <div className="flex items-center gap-1 p-1 bg-[#F1F8F3] rounded-xl overflow-x-auto select-none border border-[#B9E6C8]/50">
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'To Deliver' },
          { key: 'delivered', label: 'Delivered' },
          { key: 'billed', label: 'Billed' },
          { key: 'paid', label: 'Paid' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilterTab(tab.key as any)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${
              filterTab === tab.key
                ? 'bg-white text-[#246B4B] shadow-2xs font-bold'
                : 'text-[#6B756D] hover:text-[#202820]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-2.5">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-[#E7ECE8] text-center space-y-2">
            <div className="w-12 h-12 bg-[#F1F8F3] text-[#246B4B] rounded-full flex items-center justify-center mx-auto">
              <Truck className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-[#202820]">No orders found</div>
            <p className="text-xs text-[#6B756D]">
              {search ? 'Try clearing your search keyword.' : 'Tap "+ New Order" to start fresh delivery.'}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isDelivered = order.status === 'delivered';
            const isBilled = order.status === 'billed';
            const isPaid = order.status === 'paid';
            const isPending = order.status === 'placed' || order.status === 'out_for_delivery';

            const statusBadge = {
              placed: { label: 'Placed', color: 'bg-blue-50 text-blue-700 border-blue-200' },
              out_for_delivery: { label: 'On Route', color: 'bg-amber-50 text-amber-700 border-amber-200' },
              delivered: { label: 'Delivered', color: 'bg-[#F1F8F3] text-[#246B4B] border-[#B9E6C8]' },
              billed: { label: 'Billed', color: 'bg-purple-50 text-purple-700 border-purple-200' },
              paid: { label: 'Paid', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
              draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 border-gray-200' },
              confirmed: { label: 'Confirmed', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
              cancelled: { label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200' },
            }[order.status];

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-[#E7ECE8] p-3.5 space-y-3 shadow-2xs hover:border-[#B9E6C8] transition-all"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#202820] leading-snug">
                      {order.shopName}
                    </h3>
                    <div className="text-xs text-[#6B756D] flex items-center gap-1.5 mt-0.5">
                      <span>{order.orderNumber}</span>
                      <span>·</span>
                      <span>{order.orderDate}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-[#202820]">
                      {formatINR(order.estimatedTotal)}
                    </div>
                    <span
                      className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge.color}`}
                    >
                      {statusBadge.label}
                    </span>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="bg-[#F8FAF8] p-2.5 rounded-lg border border-[#E7ECE8]/60 text-xs space-y-1">
                  <div className="flex justify-between font-semibold text-[#6B756D] text-[11px]">
                    <span>Items ({order.items.length})</span>
                    <span>Delivered / Ordered</span>
                  </div>
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-[#202820]">
                      <span>
                        {item.productName} ({item.packetSize})
                      </span>
                      <span className="font-bold">
                        {item.deliveredQuantity} / {item.orderedQuantity} pkts
                      </span>
                    </div>
                  ))}
                </div>

                {/* Interactive Action Buttons per status */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#E7ECE8]">
                  {isPending && (
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() => onOpenDeliveryDetails(order)}
                      icon={<Truck className="w-3.5 h-3.5" />}
                    >
                      Update Delivery & Crate Qty
                    </Button>
                  )}

                  {isDelivered && !order.isBilled && (
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onOpenReturns(order)}
                        icon={<CornerDownLeft className="w-3.5 h-3.5" />}
                      >
                        Record Return
                      </Button>
                      <Button
                        variant="cream"
                        size="sm"
                        onClick={() => onOpenFinalBill(order)}
                        icon={<Receipt className="w-3.5 h-3.5" />}
                      >
                        Final Bill
                      </Button>
                    </div>
                  )}

                  {isBilled && (
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() => onOpenPaymentForOrder(order)}
                      icon={<Coins className="w-3.5 h-3.5" />}
                    >
                      Collect Payment (Cash / UPI)
                    </Button>
                  )}

                  {isPaid && (
                    <div className="w-full flex items-center justify-between text-xs text-[#246B4B] font-bold bg-[#F1F8F3] px-3 py-1.5 rounded-lg border border-[#B9E6C8]">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#246B4B]" />
                        Delivered, Billed & Fully Paid
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenFinalBill(order)}
                        className="underline text-[11px]"
                      >
                        View Bill
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
