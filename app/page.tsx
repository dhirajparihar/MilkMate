'use client';

import React, { useState, useEffect } from 'react';
import { CowMascot } from '@/components/mascot/CowMascot';
import { DoodhDostStore } from '@/lib/db/storage';
import { Order, Shop, Invoice } from '@/types/doodh_dost';

// Screens
import { DashboardScreen } from '@/components/screens/DashboardScreen';
import { OrdersScreen } from '@/components/screens/OrdersScreen';
import { ShopsScreen } from '@/components/screens/ShopsScreen';
import { ProductsScreen } from '@/components/screens/ProductsScreen';
import { InventoryScreen } from '@/components/screens/InventoryScreen';
import { BillHistoryScreen } from '@/components/screens/BillHistoryScreen';
import { DailyReportScreen } from '@/components/screens/DailyReportScreen';
import { SettingsScreen } from '@/components/screens/SettingsScreen';

// Modals
import { CreateOrderModal } from '@/components/screens/CreateOrderModal';
import { DeliveryDetailsModal } from '@/components/screens/DeliveryDetailsModal';
import { ReturnModal } from '@/components/screens/ReturnModal';
import { FinalBillModal } from '@/components/screens/FinalBillModal';
import { PaymentModal } from '@/components/screens/PaymentModal';
import { ShopFormModal } from '@/components/screens/ShopFormModal';
import { ShopDetailsModal } from '@/components/screens/ShopDetailsModal';
import { StockReceiptModal } from '@/components/screens/StockReceiptModal';
import { TestRunnerModal } from '@/components/screens/TestRunnerModal';
import { FlutterProjectViewerModal } from '@/components/screens/FlutterProjectViewerModal';

// Icons
import {
  Home,
  Receipt,
  Store,
  Menu,
  Smartphone,
  Monitor,
  Package,
  Warehouse,
  FileBarChart2,
  Settings as SettingsIcon,
  ShieldCheck,
  Code2,
  Wifi,
  Battery,
  Signal,
  Sparkles,
} from 'lucide-react';

export default function DoodhDostApp() {
  const [, setTick] = useState(0);

  // Subscribe to DoodhDostStore changes
  useEffect(() => {
    const unsubscribe = DoodhDostStore.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'orders' | 'shops' | 'more'>('home');
  const [moreSubTab, setMoreSubTab] = useState<
    'menu' | 'products' | 'inventory' | 'invoices' | 'payments' | 'reports' | 'settings'
  >('menu');

  // Device view toggle (Mobile 412dp frame vs Responsive Desktop)
  const [isMobileFrame, setIsMobileFrame] = useState(true);

  // Modal States
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [preselectedShopId, setPreselectedShopId] = useState<string | undefined>(undefined);

  const [activeDeliveryOrder, setActiveDeliveryOrder] = useState<Order | null>(null);
  const [activeReturnOrder, setActiveReturnOrder] = useState<Order | null>(null);
  const [activeBillOrder, setActiveBillOrder] = useState<Order | null>(null);
  const [activePaymentInvoice, setActivePaymentInvoice] = useState<Invoice | null>(null);

  const [isAddShopOpen, setIsAddShopOpen] = useState(false);
  const [shopToEdit, setShopToEdit] = useState<Shop | null>(null);
  const [selectedShopDetail, setSelectedShopDetail] = useState<Shop | null>(null);

  const [isStockReceiptOpen, setIsStockReceiptOpen] = useState(false);
  const [isTestRunnerOpen, setIsTestRunnerOpen] = useState(false);
  const [isFlutterViewerOpen, setIsFlutterViewerOpen] = useState(false);

  // Helper Navigation
  const handleNavigate = (tab: string, subTab?: string) => {
    if (tab === 'home' || tab === 'orders' || tab === 'shops') {
      setActiveTab(tab as any);
      setMoreSubTab('menu');
    } else if (tab === 'more') {
      setActiveTab('more');
      if (subTab) {
        setMoreSubTab(subTab as any);
      } else {
        setMoreSubTab('menu');
      }
    }
  };

  const handleStartOrderForShop = (shopId: string) => {
    setPreselectedShopId(shopId);
    setIsCreateOrderOpen(true);
  };

  const handleOpenPaymentForOrder = (order: Order) => {
    const db = DoodhDostStore.getDB();
    const invoice = db.invoices.find((i) => i.orderId === order.id);
    if (invoice) {
      setActivePaymentInvoice(invoice);
    } else {
      // If not yet billed, open final bill first
      setActiveBillOrder(order);
    }
  };

  // Render current tab content
  const renderCurrentView = () => {
    if (activeTab === 'home') {
      return (
        <DashboardScreen
          onNavigate={handleNavigate}
          onOpenCreateOrder={() => {
            setPreselectedShopId(undefined);
            setIsCreateOrderOpen(true);
          }}
          onOpenReceiveStock={() => setIsStockReceiptOpen(true)}
          onOpenTestRunner={() => setIsTestRunnerOpen(true)}
        />
      );
    }

    if (activeTab === 'orders') {
      return (
        <OrdersScreen
          onOpenCreateOrder={() => {
            setPreselectedShopId(undefined);
            setIsCreateOrderOpen(true);
          }}
          onOpenDeliveryDetails={(order) => setActiveDeliveryOrder(order)}
          onOpenReturns={(order) => setActiveReturnOrder(order)}
          onOpenFinalBill={(order) => setActiveBillOrder(order)}
          onOpenPaymentForOrder={handleOpenPaymentForOrder}
        />
      );
    }

    if (activeTab === 'shops') {
      return (
        <ShopsScreen
          onOpenAddShop={() => {
            setShopToEdit(null);
            setIsAddShopOpen(true);
          }}
          onOpenShopDetails={(shop) => setSelectedShopDetail(shop)}
          onStartOrderForShop={handleStartOrderForShop}
        />
      );
    }

    if (activeTab === 'more') {
      if (moreSubTab === 'products') {
        return <ProductsScreen />;
      }
      if (moreSubTab === 'inventory') {
        return <InventoryScreen onOpenReceiveStock={() => setIsStockReceiptOpen(true)} />;
      }
      if (moreSubTab === 'invoices') {
        return (
          <BillHistoryScreen
            onOpenPayment={(inv) => setActivePaymentInvoice(inv)}
          />
        );
      }
      if (moreSubTab === 'reports') {
        return <DailyReportScreen />;
      }
      if (moreSubTab === 'settings') {
        return (
          <SettingsScreen
            onOpenTestRunner={() => setIsTestRunnerOpen(true)}
            onOpenFlutterViewer={() => setIsFlutterViewerOpen(true)}
          />
        );
      }

      // Default "More" Hub
      return (
        <div className="space-y-4 pb-20">
          <div>
            <h1 className="text-lg font-extrabold text-[#202820]">More Tools & Operations</h1>
            <p className="text-xs text-[#6B756D]">
              Milk catalogue, stock receipts, audit reports & settings
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              {
                id: 'products',
                title: 'Milk Catalogue & Rates',
                desc: 'Manage packet sizes, default rates & shop overrides',
                icon: <Package className="w-5 h-5 text-[#246B4B]" />,
              },
              {
                id: 'inventory',
                title: 'Inventory & Stock Ledger',
                desc: 'Live stock formula, daily arrivals & movement logs',
                icon: <Warehouse className="w-5 h-5 text-[#246B4B]" />,
              },
              {
                id: 'invoices',
                title: 'Final Bills & Invoice History',
                desc: 'Immutable snapshot bills with return credits',
                icon: <Receipt className="w-5 h-5 text-[#246B4B]" />,
              },
              {
                id: 'reports',
                title: 'Daily Distribution Reports',
                desc: 'End-of-day sales, collections & stock reconciliation',
                icon: <FileBarChart2 className="w-5 h-5 text-[#246B4B]" />,
              },
              {
                id: 'settings',
                title: 'Agency Profile & Supabase Sync',
                desc: 'Distributor details, currency INR & cloud database',
                icon: <SettingsIcon className="w-5 h-5 text-[#246B4B]" />,
              },
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => setMoreSubTab(item.id as any)}
                className="bg-white p-3.5 rounded-xl border border-[#E7ECE8] flex items-start gap-3 cursor-pointer hover:border-[#B9E6C8] transition-all shadow-2xs active:scale-[0.99]"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F1F8F3] flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#202820]">{item.title}</h3>
                  <p className="text-xs text-[#6B756D] mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Shortcuts for Flutter Code & Test Suite */}
          <div className="space-y-2 pt-2">
            <h2 className="text-xs font-bold text-[#6B756D] uppercase">Project & Architecture</h2>

            <div
              onClick={() => setIsFlutterViewerOpen(true)}
              className="bg-[#FFF0D9] p-3 rounded-xl border border-[#FFE1B3] flex items-center justify-between cursor-pointer hover:bg-[#FFE6C2] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Code2 className="w-5 h-5 text-[#8C5D19]" />
                <div>
                  <div className="text-xs font-bold text-[#8C5D19]">
                    Flutter Source Code & APK Export (.ZIP)
                  </div>
                  <div className="text-[11px] text-[#8C5D19]">
                    Inspect full Dart project, pubspec & download archive
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-[#8C5D19]">Open →</span>
            </div>

            <div
              onClick={() => setIsTestRunnerOpen(true)}
              className="bg-white p-3 rounded-xl border border-[#B9E6C8] flex items-center justify-between cursor-pointer hover:bg-[#F1F8F3] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#246B4B]" />
                <div>
                  <div className="text-xs font-bold text-[#202820]">
                    Automated Test Suite (18 Suites)
                  </div>
                  <div className="text-[11px] text-[#6B756D]">
                    Runs unit and integration business rules live
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-[#246B4B]">Run →</span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-[#F0F4F1] flex flex-col items-center justify-start p-0 sm:py-6 selection:bg-[#B9E6C8]">
      {/* Top Device Viewport Controls on Desktop */}
      <header className="hidden sm:flex items-center justify-between w-full max-w-[420px] mb-3 px-2 text-xs text-[#6B756D]">
        <div className="flex items-center gap-2 font-bold text-[#202820]">
          <span className="w-2 h-2 rounded-full bg-[#246B4B] animate-pulse" />
          <span>Doodh Dost Milk Distributor System</span>
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E7ECE8] shadow-2xs">
          <button
            type="button"
            onClick={() => setIsMobileFrame(true)}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
              isMobileFrame ? 'bg-[#246B4B] text-white font-bold' : 'text-[#6B756D] hover:text-[#202820]'
            }`}
            title="Android Phone Mockup (390-412 dp)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
          <button
            type="button"
            onClick={() => setIsMobileFrame(false)}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
              !isMobileFrame ? 'bg-[#246B4B] text-white font-bold' : 'text-[#6B756D] hover:text-[#202820]'
            }`}
            title="Expand Full Width"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Full View</span>
          </button>
        </div>
      </header>

      {/* Main Container (Styled as Android device frame or full responsive container) */}
      <main
        className={`w-full bg-white relative transition-all duration-200 flex flex-col ${
          isMobileFrame
            ? 'max-w-[414px] min-h-[840px] max-h-[920px] sm:rounded-[36px] sm:shadow-2xl sm:border-[8px] sm:border-[#1E2521] overflow-hidden'
            : 'max-w-3xl min-h-screen sm:rounded-2xl sm:shadow-md sm:border border-[#E7ECE8]'
        }`}
      >
        {/* Android Status Bar (Morning 6:30 AM delivery time) */}
        <div className="h-10 px-6 bg-white shrink-0 flex items-center justify-between text-xs font-bold text-[#202820] select-none border-b border-[#F1F8F3]">
          <div className="flex items-center gap-1.5">
            <span className="tracking-tight">06:30</span>
            <span className="text-[10px] text-[#6B756D] font-normal">AM</span>
          </div>

          <div className="flex items-center gap-2 text-[#202820]">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px]">98%</span>
              <Battery className="w-4 h-4 fill-current" />
            </div>
          </div>
        </div>

        {/* Top App Header */}
        <div className="px-4 py-2.5 bg-white border-b border-[#E7ECE8] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <CowMascot size={36} mood="happy" showMilkPacket={false} />
            <div>
              <div className="text-sm font-black text-[#202820] tracking-tight leading-none flex items-center gap-1">
                <span>Doodh Dost</span>
                <span className="text-[9px] font-bold text-[#246B4B] bg-[#F1F8F3] px-1.5 py-0.2 rounded border border-[#B9E6C8]">
                  दूध दोस्त
                </span>
              </div>
              <p className="text-[10px] text-[#6B756D] leading-tight mt-0.5">
                Your daily milk business, made simple.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsFlutterViewerOpen(true)}
              className="p-1.5 text-[#246B4B] bg-[#F1F8F3] hover:bg-[#E3F2E8] rounded-lg transition-colors"
              title="Download Flutter Project (.zip)"
            >
              <Code2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('more');
                setMoreSubTab('settings');
              }}
              className="p-1.5 text-[#6B756D] hover:text-[#202820] hover:bg-[#F1F8F3] rounded-lg transition-colors"
              title="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-navigation bar when inside 'More' section */}
        {activeTab === 'more' && moreSubTab !== 'menu' && (
          <div className="px-4 py-2 bg-[#F8FAF8] border-b border-[#E7ECE8] flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setMoreSubTab('menu')}
              className="font-bold text-[#246B4B] flex items-center gap-1 hover:underline"
            >
              ← Back to More Menu
            </button>
            <span className="text-[11px] font-semibold text-[#6B756D] capitalize">
              {moreSubTab}
            </span>
          </div>
        )}

        {/* Scrollable View Area */}
        <div className="flex-1 overflow-y-auto p-4">{renderCurrentView()}</div>

        {/* Bottom Navigation Bar (Material 3 Tabs) */}
        <nav
          className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#E7ECE8] px-2 py-1.5 flex items-center justify-around select-none z-20 shadow-lg"
          aria-label="Bottom Navigation"
        >
          <button
            type="button"
            onClick={() => handleNavigate('home')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeTab === 'home'
                ? 'text-[#246B4B] font-extrabold'
                : 'text-[#6B756D] hover:text-[#202820]'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-colors ${
                activeTab === 'home' ? 'bg-[#F1F8F3] text-[#246B4B]' : ''
              }`}
            >
              <Home className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5">Home</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('orders')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeTab === 'orders'
                ? 'text-[#246B4B] font-extrabold'
                : 'text-[#6B756D] hover:text-[#202820]'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-colors ${
                activeTab === 'orders' ? 'bg-[#F1F8F3] text-[#246B4B]' : ''
              }`}
            >
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5">Orders</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('shops')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeTab === 'shops'
                ? 'text-[#246B4B] font-extrabold'
                : 'text-[#6B756D] hover:text-[#202820]'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-colors ${
                activeTab === 'shops' ? 'bg-[#F1F8F3] text-[#246B4B]' : ''
              }`}
            >
              <Store className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5">Shops</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('more')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeTab === 'more'
                ? 'text-[#246B4B] font-extrabold'
                : 'text-[#6B756D] hover:text-[#202820]'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-colors ${
                activeTab === 'more' ? 'bg-[#F1F8F3] text-[#246B4B]' : ''
              }`}
            >
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5">More</span>
          </button>
        </nav>
      </main>

      {/* Global Modals */}
      <CreateOrderModal
        isOpen={isCreateOrderOpen}
        onClose={() => setIsCreateOrderOpen(false)}
        preselectedShopId={preselectedShopId}
        onOrderCreated={() => {
          setActiveTab('orders');
        }}
      />

      <DeliveryDetailsModal
        isOpen={!!activeDeliveryOrder}
        onClose={() => setActiveDeliveryOrder(null)}
        order={activeDeliveryOrder}
        onDeliveryUpdated={() => {}}
        onOpenReturns={(order) => setActiveReturnOrder(order)}
        onOpenFinalBill={(order) => setActiveBillOrder(order)}
      />

      <ReturnModal
        isOpen={!!activeReturnOrder}
        onClose={() => setActiveReturnOrder(null)}
        order={activeReturnOrder}
        onReturnSaved={() => {}}
      />

      <FinalBillModal
        isOpen={!!activeBillOrder}
        onClose={() => setActiveBillOrder(null)}
        order={activeBillOrder}
        onInvoiceCreated={() => {}}
        onOpenPayment={(inv) => setActivePaymentInvoice(inv)}
      />

      <PaymentModal
        isOpen={!!activePaymentInvoice}
        onClose={() => setActivePaymentInvoice(null)}
        invoice={activePaymentInvoice}
        onPaymentSaved={() => {}}
      />

      <ShopFormModal
        isOpen={isAddShopOpen}
        onClose={() => {
          setIsAddShopOpen(false);
          setShopToEdit(null);
        }}
        shopToEdit={shopToEdit}
        onSaved={() => {}}
      />

      <ShopDetailsModal
        isOpen={!!selectedShopDetail}
        onClose={() => setSelectedShopDetail(null)}
        shop={selectedShopDetail}
        onEditShop={(shop) => {
          setShopToEdit(shop);
          setIsAddShopOpen(true);
        }}
        onStartOrder={handleStartOrderForShop}
      />

      <StockReceiptModal
        isOpen={isStockReceiptOpen}
        onClose={() => setIsStockReceiptOpen(false)}
        onReceiptSaved={() => {
          setActiveTab('more');
          setMoreSubTab('inventory');
        }}
      />

      <TestRunnerModal
        isOpen={isTestRunnerOpen}
        onClose={() => setIsTestRunnerOpen(false)}
      />

      <FlutterProjectViewerModal
        isOpen={isFlutterViewerOpen}
        onClose={() => setIsFlutterViewerOpen(false)}
      />
    </div>
  );
}
