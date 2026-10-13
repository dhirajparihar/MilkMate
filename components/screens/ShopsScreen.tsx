'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { DoodhDostStore } from '@/lib/db/storage';
import { formatINR } from '@/lib/calc';
import { Shop } from '@/types/doodh_dost';
import {
  Store,
  Plus,
  Search,
  Phone,
  MapPin,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface ShopsScreenProps {
  onOpenAddShop: () => void;
  onOpenShopDetails: (shop: Shop) => void;
  onStartOrderForShop: (shopId: string) => void;
}

export const ShopsScreen: React.FC<ShopsScreenProps> = ({
  onOpenAddShop,
  onOpenShopDetails,
  onStartOrderForShop,
}) => {
  const db = DoodhDostStore.getDB();
  const [search, setSearch] = useState('');
  const [filterRoute, setFilterRoute] = useState('all');

  const routes = Array.from(new Set(db.shops.map((s) => s.routeArea || 'General'))).filter(Boolean);

  const filteredShops = db.shops.filter((shop) => {
    const query = search.toLowerCase();
    const matchesQuery =
      shop.name.toLowerCase().includes(query) ||
      (shop.ownerName && shop.ownerName.toLowerCase().includes(query)) ||
      shop.phone.includes(query) ||
      (shop.routeArea && shop.routeArea.toLowerCase().includes(query));

    if (!matchesQuery) return false;
    if (filterRoute !== 'all' && shop.routeArea !== filterRoute) return false;
    return true;
  });

  const totalOutstanding = filteredShops.reduce((acc, s) => acc + Math.max(0, s.currentBalance), 0);

  return (
    <div className="space-y-3.5 pb-20">
      {/* Header & Add Shop Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-[#202820]">Retail Shops</h1>
          <p className="text-xs text-[#6B756D]">
            {filteredShops.length} active milk retail partners
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onOpenAddShop}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Shop
        </Button>
      </div>

      {/* Outstanding Summary Strip */}
      <div className="bg-[#FFF0D9] p-3 rounded-xl border border-[#FFE1B3] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-[#8C5D19]" />
          <span className="text-xs font-bold text-[#8C5D19]">Total Dues:</span>
        </div>
        <span className="text-base font-black text-[#8C5D19]">
          {formatINR(totalOutstanding)}
        </span>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B756D]" />
        <input
          type="text"
          placeholder="Search by shop name, owner, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-[#E7ECE8] rounded-xl pl-9 pr-3 py-2 text-sm text-[#202820] focus:outline-none focus:border-[#246B4B]"
        />
      </div>

      {/* Route Filter Chips */}
      {routes.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 select-none">
          <button
            type="button"
            onClick={() => setFilterRoute('all')}
            className={`text-xs px-2.5 py-1 rounded-lg font-semibold shrink-0 transition-all ${
              filterRoute === 'all'
                ? 'bg-[#246B4B] text-white shadow-2xs'
                : 'bg-white border border-[#E7ECE8] text-[#6B756D]'
            }`}
          >
            All Routes ({db.shops.length})
          </button>
          {routes.map((rt) => (
            <button
              key={rt}
              type="button"
              onClick={() => setFilterRoute(rt)}
              className={`text-xs px-2.5 py-1 rounded-lg font-semibold shrink-0 transition-all ${
                filterRoute === rt
                  ? 'bg-[#246B4B] text-white shadow-2xs'
                  : 'bg-white border border-[#E7ECE8] text-[#6B756D]'
              }`}
            >
              {rt}
            </button>
          ))}
        </div>
      )}

      {/* Shops Roster */}
      <div className="space-y-2">
        {filteredShops.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-[#E7ECE8] text-center space-y-2">
            <Store className="w-8 h-8 text-[#6B756D] mx-auto opacity-40" />
            <div className="text-sm font-bold text-[#202820]">No shops match criteria</div>
            <p className="text-xs text-[#6B756D]">Tap &quot;Add Shop&quot; to register a new store.</p>
          </div>
        ) : (
          filteredShops.map((shop) => {
            const hasDues = shop.currentBalance > 0;
            const hasTodayOrder = db.orders.some(
              (o) => o.shopId === shop.id && o.orderDate === new Date().toISOString().split('T')[0]
            );

            return (
              <div
                key={shop.id}
                onClick={() => onOpenShopDetails(shop)}
                className="bg-white p-3.5 rounded-xl border border-[#E7ECE8] flex items-center justify-between cursor-pointer hover:border-[#B9E6C8] transition-all active:scale-[0.99] shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-[#202820] leading-snug">
                      {shop.name}
                    </h3>
                    {!shop.isActive && (
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-[#6B756D] flex items-center gap-2">
                    <span>{shop.ownerName || 'Owner'}</span>
                    <span>·</span>
                    <span>{shop.phone}</span>
                  </div>

                  <div className="text-[11px] text-[#6B756D] flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-[#6B756D]" />
                    <span className="truncate max-w-[200px]">{shop.address}</span>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-2">
                  <div className="text-xs text-[#6B756D]">Outstanding</div>
                  <div
                    className={`text-sm font-black ${
                      hasDues ? 'text-[#8C5D19]' : 'text-[#246B4B]'
                    }`}
                  >
                    {formatINR(shop.currentBalance)}
                  </div>

                  {hasTodayOrder ? (
                    <span className="inline-block mt-0.5 text-[10px] font-bold text-[#246B4B] bg-[#F1F8F3] px-1.5 py-0.5 rounded border border-[#B9E6C8]">
                      Ordered Today ✓
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartOrderForShop(shop.id);
                      }}
                      className="mt-0.5 text-[10px] font-bold text-[#246B4B] hover:underline"
                    >
                      + Order
                    </button>
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
