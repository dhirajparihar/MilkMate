'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { DoodhDostStore } from '@/lib/db/storage';
import { CowMascot } from '@/components/mascot/CowMascot';
import {
  Settings as SettingsIcon,
  Database,
  Cloud,
  RotateCcw,
  ShieldCheck,
  Code2,
  CheckCircle2,
  Download,
} from 'lucide-react';

interface SettingsScreenProps {
  onOpenTestRunner: () => void;
  onOpenFlutterViewer: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onOpenTestRunner,
  onOpenFlutterViewer,
}) => {
  const db = DoodhDostStore.getDB();

  const [businessName, setBusinessName] = useState(db.profile.businessName);
  const [distributorName, setDistributorName] = useState(db.profile.distributorName);
  const [phone, setPhone] = useState(db.profile.phone);
  const [dairySupplierName, setDairySupplierName] = useState(db.profile.dairySupplierName);

  const [supabaseUrl, setSupabaseUrl] = useState(db.supabaseConfig?.url || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(db.supabaseConfig?.anonKey || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    DoodhDostStore.updateProfile({
      businessName,
      distributorName,
      phone,
      dairySupplierName,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleResetData = () => {
    if (confirm('Reset database to clean initial milk distributor demo data?')) {
      DoodhDostStore.resetToDemo();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-lg font-extrabold text-[#202820]">Business Settings</h1>
        <p className="text-xs text-[#6B756D]">
          Distributor profile, Supabase configuration, and Flutter source export
        </p>
      </div>

      {/* Profile Form */}
      <div className="bg-white p-4 rounded-xl border border-[#E7ECE8] shadow-2xs space-y-3.5">
        <h2 className="text-xs font-bold text-[#6B756D] uppercase">
          Distributor Agency Profile
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-[#6B756D] mb-1">Business / Agency Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full bg-[#F8FAF8] border border-[#E7ECE8] rounded-xl px-3 py-2 text-sm text-[#202820] focus:outline-none focus:border-[#246B4B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-[#6B756D] mb-1">Distributor Name</label>
              <input
                type="text"
                value={distributorName}
                onChange={(e) => setDistributorName(e.target.value)}
                className="w-full bg-[#F8FAF8] border border-[#E7ECE8] rounded-xl px-3 py-2 text-sm text-[#202820] focus:outline-none focus:border-[#246B4B]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#6B756D] mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#F8FAF8] border border-[#E7ECE8] rounded-xl px-3 py-2 text-sm text-[#202820] focus:outline-none focus:border-[#246B4B]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#6B756D] mb-1">Main Dairy Plant Supplier</label>
            <input
              type="text"
              value={dairySupplierName}
              onChange={(e) => setDairySupplierName(e.target.value)}
              className="w-full bg-[#F8FAF8] border border-[#E7ECE8] rounded-xl px-3 py-2 text-sm text-[#202820] focus:outline-none focus:border-[#246B4B]"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#246B4B] font-bold">
              {isSaved ? '✓ Profile Saved' : ''}
            </span>
            <Button type="submit" variant="primary" size="sm">
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Cloud & Supabase Setup */}
      <div className="bg-white p-4 rounded-xl border border-[#E7ECE8] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#246B4B]" />
            <h2 className="text-xs font-bold text-[#202820] uppercase">
              Supabase PostgreSQL Database
            </h2>
          </div>
          <span className="text-[10px] font-bold bg-[#F1F8F3] text-[#246B4B] px-2 py-0.5 rounded-full border border-[#B9E6C8]">
            Local Persistence Active
          </span>
        </div>

        <p className="text-xs text-[#6B756D]">
          Doodh Dost includes full offline-first Drift/SQLite persistence. To sync with a remote
          Supabase PostgreSQL instance, add your project credentials below or run the SQL migration
          file from the project explorer.
        </p>

        <div className="space-y-2 text-xs">
          <div>
            <label className="block font-bold text-[#6B756D] mb-1">Supabase URL</label>
            <input
              type="text"
              placeholder="https://xyz.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full bg-[#F8FAF8] border border-[#E7ECE8] rounded-xl px-3 py-2 text-xs font-mono text-[#202820] focus:outline-none focus:border-[#246B4B]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#6B756D] mb-1">Anon Public Key</label>
            <input
              type="text"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5..."
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              className="w-full bg-[#F8FAF8] border border-[#E7ECE8] rounded-xl px-3 py-2 text-xs font-mono text-[#202820] focus:outline-none focus:border-[#246B4B]"
            />
          </div>
        </div>
      </div>

      {/* Flutter Source Code & Test Suite Shortcuts */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-[#6B756D] uppercase">
          Developer & Architecture Tools
        </h2>

        <div
          onClick={onOpenFlutterViewer}
          className="bg-white p-3.5 rounded-xl border border-[#B9E6C8] flex items-center justify-between cursor-pointer hover:bg-[#F1F8F3]/60 transition-all shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F1F8F3] text-[#246B4B] flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#202820]">
                Flutter Project Source & ZIP Export
              </div>
              <div className="text-xs text-[#6B756D]">
                Inspect all Dart files, Android configs, pubspec & download as .ZIP
              </div>
            </div>
          </div>
          <Download className="w-4 h-4 text-[#246B4B]" />
        </div>

        <div
          onClick={onOpenTestRunner}
          className="bg-white p-3.5 rounded-xl border border-[#E7ECE8] flex items-center justify-between cursor-pointer hover:border-[#246B4B] transition-all shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F1F8F3] text-[#246B4B] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#202820]">
                Run Automated Tests (18 Suites)
              </div>
              <div className="text-xs text-[#6B756D]">
                Verify all calculation, stock ledger, and billing rules
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-[#246B4B]">Run Tests →</span>
        </div>
      </div>

      {/* Data Reset */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleResetData}
          className="w-full text-xs text-[#C62828] font-bold p-2.5 rounded-xl border border-red-200 hover:bg-red-50 flex items-center justify-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Clean Demo Records</span>
        </button>
      </div>
    </div>
  );
};
