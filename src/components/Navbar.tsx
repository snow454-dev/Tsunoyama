import React, { useState } from 'react';
import { 
  Beef, 
  Smartphone, 
  Layers, 
  ClipboardList, 
  PhoneCall, 
  FileSpreadsheet, 
  Bell, 
  TrendingUp,
  UserCheck,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  onOpenMobilePreview: () => void;
  orderCount: number;
  processingCount: number;
  unbilledCount: number;
  phoneLogCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedRole,
  setSelectedRole,
  onOpenMobilePreview,
  orderCount,
  processingCount,
  unbilledCount,
  phoneLogCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', label: '総合ダッシュボード', icon: Layers },
    { id: 'orders', label: '受発注一元管理', icon: ClipboardList, badge: orderCount },
    { id: 'inventory', label: '在庫・外部加工連携', icon: Beef, badge: processingCount },
    { id: 'phone-ai', label: '電話AI自動受付', icon: PhoneCall, badge: phoneLogCount, highlight: true },
    { id: 'money-forward', label: 'マネーフォワード請求連携', icon: FileSpreadsheet, badge: unbilledCount },
    { id: 'notifications', label: '関係者リアルタイム通知', icon: Bell },
    { id: 'proposal', label: '業務改善提案・ロードマップ', icon: TrendingUp },
  ];

  const roles = [
    { id: 'all', label: '全体ビュー' },
    { id: 'sales', label: '営業担当' },
    { id: 'clerk', label: '事務担当' },
    { id: 'processor', label: '外部加工所' },
  ];

  const handleTabSelect = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top utility banner with livestock facts & quick stats */}
      <div className="bg-[#183B2B] text-white px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-1 sm:gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1.5 font-medium truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              約500頭飼育（赤牛 / 黒牛）
            </span>
            <span className="hidden md:inline text-slate-300">|</span>
            <span className="hidden md:inline text-emerald-200">
              食肉販売2年目 DX業務改革・伴走支援モックアップ（
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px]">
            <span className="bg-emerald-800/90 text-emerald-100 px-1.5 sm:px-2 py-0.5 rounded">
              未処理: <strong className="text-white">{orderCount}件</strong>
            </span>
            <span className="bg-emerald-800/90 text-emerald-100 px-1.5 sm:px-2 py-0.5 rounded">
              加工中: <strong className="text-white">{processingCount}頭分</strong>
            </span>
            <span className="bg-amber-800/90 text-amber-100 px-1.5 sm:px-2 py-0.5 rounded">
              MF未請求: <strong className="text-white">{unbilledCount}件</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          {/* Brand Logo & Name */}
          <div 
            className="flex items-center gap-2.5 sm:gap-3 shrink-0 cursor-pointer min-w-0" 
            onClick={() => handleTabSelect('dashboard')}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#1E3A2F] to-[#2D5A46] flex items-center justify-center text-white shadow-sm ring-1 ring-emerald-900/20 shrink-0">
              <Beef className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                  〇〇畜産公社
                </h1>
                <span className="text-[9px] sm:text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded shrink-0">
                  食肉販売DX
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 truncate hidden xs:block">
                受発注・在庫・委託加工・MF請求一元管理
              </p>
            </div>
          </div>

          {/* Right Action Tools: Role Switcher & Mobile Simulator Button & Mobile Hamburger */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Role Filter Selector on Desktop */}
            <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/80 text-xs">
              <span className="px-2 text-slate-500 flex items-center gap-1 font-medium">
                <UserCheck className="w-3.5 h-3.5" />
                視点:
              </span>
              {roles.map((r) => (
                <button
                  key={r.id}
                  id={`role-btn-${r.id}`}
                  onClick={() => setSelectedRole(r.id)}
                  className={`px-2 py-1 rounded-md transition-all font-medium ${
                    selectedRole === r.id
                      ? 'bg-white text-emerald-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Smartphone Field Preview Button */}
            <button
              id="open-mobile-preview-btn"
              onClick={onOpenMobilePreview}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300/80 rounded-lg shadow-xs transition-colors"
              title="牛舎や外出先営業でのスマホ操作画面をプレビュー"
            >
              <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-700" />
              <span className="hidden sm:inline">現場スマホ体験</span>
            </button>

            {/* Mobile Hamburger Toggle Button */}
            <button
              id="mobile-nav-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="メニュー開閉"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer (Visible when burger is clicked on small screens) */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-3 space-y-3 bg-white animate-in fade-in duration-150">
            {/* Role switch on mobile */}
            <div className="px-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                表示視点
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    className={`p-2 text-xs rounded-lg font-medium text-left border ${
                      selectedRole === r.id
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                        : 'border-slate-200 text-slate-600 bg-slate-50'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation items in mobile menu */}
            <div className="px-1 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                機能メニュー
              </span>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabSelect(tab.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#1E3A2F] text-white font-bold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-300' : 'text-slate-500'}`} />
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                        isActive ? 'bg-emerald-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab Strip: Horizontal scrollable for smooth mobile swipe */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-slate-100 py-1.5 scroll-smooth">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => handleTabSelect(tab.id)}
                className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all shrink-0 min-h-[38px] ${
                  isActive
                    ? 'bg-[#1E3A2F] text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-emerald-300' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                      isActive
                        ? 'bg-emerald-400 text-slate-950'
                        : tab.highlight
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
                {tab.highlight && !tab.badge && (
                  <span className="ml-1 text-[9px] bg-amber-500 text-white px-1.5 py-0.2 rounded font-bold">
                    即効策
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
