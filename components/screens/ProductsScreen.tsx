'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { DoodhDostStore } from '@/lib/db/storage';
import { formatINR } from '@/lib/calc';
import { Product, ReturnPolicyType } from '@/types/doodh_dost';
import { Plus, Edit2, Package, Tag, ShieldCheck, Check } from 'lucide-react';

export const ProductsScreen: React.FC = () => {
  const db = DoodhDostStore.getDB();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [packetSize, setPacketSize] = useState('500 ml');
  const [sku, setSku] = useState('');
  const [defaultPrice, setDefaultPrice] = useState<number>(27);
  const [purchaseCost, setPurchaseCost] = useState<number>(24.5);
  const [category, setCategory] = useState<'milk' | 'curd' | 'paneer' | 'buttermilk' | 'ghee'>('milk');
  const [returnPolicyType, setReturnPolicyType] = useState<ReturnPolicyType>('full_credit');
  const [returnCreditPercentage, setReturnCreditPercentage] = useState<number>(100);
  const [isActive, setIsActive] = useState(true);

  const handleOpenAdd = () => {
    setProductToEdit(null);
    setName('');
    setPacketSize('500 ml');
    setSku(`M-${Date.now().toString().slice(-4)}`);
    setDefaultPrice(28);
    setPurchaseCost(25);
    setCategory('milk');
    setReturnPolicyType('full_credit');
    setReturnCreditPercentage(100);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setProductToEdit(product);
    setName(product.name);
    setPacketSize(product.packetSize);
    setSku(product.sku);
    setDefaultPrice(product.defaultPrice);
    setPurchaseCost(product.purchaseCost || 0);
    setCategory(product.category);
    setReturnPolicyType(product.returnPolicyType);
    setReturnCreditPercentage(product.returnCreditPercentage);
    setIsActive(product.isActive);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    DoodhDostStore.saveProduct({
      id: productToEdit?.id,
      name: name.trim(),
      packetSize: packetSize.trim(),
      sku: sku.trim(),
      defaultPrice,
      purchaseCost,
      category,
      returnPolicyType,
      returnCreditPercentage,
      isActive,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-3.5 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-[#202820]">Milk Catalogue & Rates</h1>
          <p className="text-xs text-[#6B756D]">
            Manage products, packet sizes, and selling prices
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
          Add Product
        </Button>
      </div>

      {/* Notice on Historical Pricing */}
      <div className="bg-[#F1F8F3] p-3 rounded-xl border border-[#B9E6C8]/70 flex items-start gap-2 text-xs">
        <ShieldCheck className="w-4 h-4 text-[#246B4B] shrink-0 mt-0.5" />
        <span className="text-[#202820]">
          <strong>Price Protection:</strong> Updating a catalogue price only affects new orders. Past
          bills and finalized invoices remain strictly immutable.
        </span>
      </div>

      {/* Product List */}
      <div className="space-y-2.5">
        {db.products.map((product) => {
          const margin = product.purchaseCost ? product.defaultPrice - product.purchaseCost : 0;

          return (
            <div
              key={product.id}
              className="bg-white p-3.5 rounded-xl border border-[#E7ECE8] flex items-center justify-between shadow-2xs hover:border-[#B9E6C8] transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-[#202820]">{product.name}</h3>
                  <span className="text-[10px] font-bold text-[#246B4B] bg-[#F1F8F3] px-1.5 py-0.5 rounded border border-[#B9E6C8]">
                    {product.packetSize}
                  </span>
                  {!product.isActive && (
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                      Inactive
                    </span>
                  )}
                </div>

                <div className="text-xs text-[#6B756D] flex items-center gap-2">
                  <span>SKU: {product.sku}</span>
                  <span>·</span>
                  <span>Policy: {product.returnPolicyType.replace('_', ' ')}</span>
                </div>

                {product.purchaseCost && (
                  <div className="text-[11px] text-[#6B756D]">
                    Cost: ₹{product.purchaseCost} · Margin: +₹{margin.toFixed(2)}/pkt
                  </div>
                )}
              </div>

              <div className="text-right shrink-0">
                <div className="text-base font-black text-[#246B4B]">
                  {formatINR(product.defaultPrice)}
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(product)}
                  className="mt-1 text-xs text-[#6B756D] hover:text-[#246B4B] flex items-center gap-1 font-semibold"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Rate</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for adding/editing product */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={productToEdit ? 'Edit Product & Rate' : 'Add New Product'}
        subtitle="Configure milk pouch specifications"
        maxWidth="md"
      >
        <form onSubmit={handleSaveProduct} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-[#6B756D] uppercase mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Amul Gold Full Cream Milk"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#F8FAF8] border border-[#E7ECE8] rounded-xl px-3 py-2 text-sm text-[#202820] focus:outline-none focus:border-[#246B4B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-[#6B756D] uppercase mb-1">
                Packet Size *
              </label>
              <input
                type="text"
                required
                placeholder="500 ml or 1 Litre"
                value={packetSize}
                onChange={(e) => setPacketSize(e.target.value)}
                className="w-full bg-[#F8FAF8] border border-[#E7ECE8] rounded-xl px-3 py-2 text-sm text-[#202820] focus:outline-none focus:border-[#246B4B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6B756D] uppercase mb-1">
                SKU / Code
              </label>
              <input
                type="text"
                placeholder="AG-500"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-[#F8FAF8] border border-[#E7ECE8] rounded-xl px-3 py-2 text-sm text-[#202820] focus:outline-none focus:border-[#246B4B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-[#6B756D] uppercase mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={defaultPrice}
                onChange={(e) => setDefaultPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#F8FAF8] border border-[#E7ECE8] rounded-xl px-3 py-2 text-sm font-bold text-[#202820] focus:outline-none focus:border-[#246B4B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6B756D] uppercase mb-1">
                Purchase Cost (₹)
              </label>
              <input
                type="number"
                step="0.5"
                value={purchaseCost}
                onChange={(e) => setPurchaseCost(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#F8FAF8] border border-[#E7ECE8] rounded-xl px-3 py-2 text-sm text-[#202820] focus:outline-none focus:border-[#246B4B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-[#6B756D] uppercase mb-1">
                Return Policy
              </label>
              <select
                value={returnPolicyType}
                onChange={(e) => setReturnPolicyType(e.target.value as any)}
                className="w-full bg-[#F8FAF8] border border-[#E7ECE8] rounded-xl px-3 py-2 text-xs font-medium text-[#202820] focus:outline-none focus:border-[#246B4B]"
              >
                <option value="full_credit">Full Credit (100%)</option>
                <option value="partial_credit">Partial Credit (80%)</option>
                <option value="damaged_only">Damaged Only (60%)</option>
                <option value="no_returns">No Returns (0%)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6B756D] uppercase mb-1">
                Credit %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={returnCreditPercentage}
                onChange={(e) => setReturnCreditPercentage(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#F8FAF8] border border-[#E7ECE8] rounded-xl px-3 py-2 text-sm text-[#202820] focus:outline-none focus:border-[#246B4B]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7ECE8]">
            <Button variant="outline" size="md" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" icon={<Check className="w-4 h-4" />}>
              Save Product
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
