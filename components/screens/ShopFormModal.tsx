'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { DoodhDostStore } from '@/lib/db/storage';
import { Shop } from '@/types/doodh_dost';
import { Store, Check } from 'lucide-react';

interface ShopFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopToEdit?: Shop | null;
  onSaved: () => void;
}

export const ShopFormModal: React.FC<ShopFormModalProps> = ({
  isOpen,
  onClose,
  shopToEdit,
  onSaved,
}) => {
  const [name, setName] = useState(shopToEdit?.name || '');
  const [ownerName, setOwnerName] = useState(shopToEdit?.ownerName || '');
  const [phone, setPhone] = useState(shopToEdit?.phone || '');
  const [address, setAddress] = useState(shopToEdit?.address || '');
  const [routeArea, setRouteArea] = useState(shopToEdit?.routeArea || 'Main Route 1');
  const [openingBalance, setOpeningBalance] = useState<number>(shopToEdit?.openingBalance || 0);
  const [isActive, setIsActive] = useState(shopToEdit?.isActive ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      DoodhDostStore.saveShop({
        id: shopToEdit?.id,
        name: name.trim(),
        ownerName: ownerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        routeArea: routeArea.trim(),
        openingBalance: openingBalance,
        isActive: isActive,
      });
      onSaved();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error saving shop');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={shopToEdit ? 'Edit Shop Details' : 'Add New Retail Shop'}
      subtitle="Register local grocery or dairy customer"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-bold text-[#6B756D] uppercase mb-1">
            Shop Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Mahavir Daily Needs & Sweets"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#F8FAF8] border border-[#E7ECE8] rounded-xl px-3 py-2 text-sm text-[#202820] focus:outline-none focus:border-[#246B4B]"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-bold text-[#6B756D] uppercase mb-1">
              Owner Name
            </label>
            <input
              type="text"
              placeholder="e.g. Suresh Bhai"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full bg-[#F8FAF8] border border-[#E7ECE8] rounded-xl px-3 py-2 text-sm text-[#202820] focus:outline-none focus:border-[#246B4B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#6B756D] uppercase mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="e.g. 98220 12345"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#F8FAF8] border border-[#E7ECE8] rounded-xl px-3 py-2 text-sm text-[#202820] focus:outline-none focus:border-[#246B4B]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#6B756D] uppercase mb-1">
            Shop Address & Landmark
          </label>
          <input
            type="text"
            placeholder="e.g. Shop 3, Shivaji Chowk, Next to Bank"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-[#F8FAF8] border border-[#E7ECE8] rounded-xl px-3 py-2 text-sm text-[#202820] focus:outline-none focus:border-[#246B4B]"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-bold text-[#6B756D] uppercase mb-1">
              Route / Area
            </label>
            <input
              type="text"
              placeholder="e.g. Camp Route A"
              value={routeArea}
              onChange={(e) => setRouteArea(e.target.value)}
              className="w-full bg-[#F8FAF8] border border-[#E7ECE8] rounded-xl px-3 py-2 text-sm text-[#202820] focus:outline-none focus:border-[#246B4B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#6B756D] uppercase mb-1">
              Opening Balance (₹)
            </label>
            <input
              type="number"
              step="1"
              disabled={!!shopToEdit}
              placeholder="0"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#F8FAF8] border border-[#E7ECE8] rounded-xl px-3 py-2 text-sm text-[#202820] focus:outline-none focus:border-[#246B4B] disabled:opacity-60"
            />
            {shopToEdit && (
              <span className="text-[10px] text-[#6B756D]">
                Opening balance locked after creation
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="shopActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 text-[#246B4B] rounded accent-[#246B4B]"
          />
          <label htmlFor="shopActive" className="text-xs font-semibold text-[#202820]">
            Active for daily milk deliveries
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7ECE8]">
          <Button variant="outline" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting || !name.trim()}
            icon={<Check className="w-4 h-4" />}
          >
            {isSubmitting ? 'Saving...' : shopToEdit ? 'Update Shop' : 'Save Shop'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
