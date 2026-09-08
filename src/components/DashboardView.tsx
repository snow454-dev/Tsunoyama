import React from 'react';
import { 
  Order, 
  InventoryItem, 
  ProcessingBatch, 
  StakeholderNotification 
} from '../types';
import { 
  Beef, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Sparkles, 
  PhoneCall, 
  FileSpreadsheet, 
  Smartphone,
  Layers,
  ChevronRight
} from 'lucide-react';

interface DashboardViewProps {
  orders: Order[];
  inventory: InventoryItem[];
  batches: ProcessingBatch[];
  notifications: StakeholderNotification[];
  onNavigateTab: (tab: string) => void;
  onOpenNewOrderModal: () => void;
  onOpenAiParser: () => void;
  onOpenMobilePreview: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  inventory,
  batches,
  notifications,
  onNavigateTab,
  onOpenNewOrderModal,
  onOpenAiParser,
  onOpenMobilePreview,
}) => {
  // Aggregate stats
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const unbilledOrders = orders.filter((o) => !o.mfInvoiceSynced);
  const unbilledAmount = unbilledOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const lowStockItems = inventory.filter((i) => i.status === '要補充' || i.status === '欠品危機');
  const activeBatches = batches.filter((b) => b.status !== '検品納品完了');

  // Pipeline counts
  const newOrders = orders.filter((o) => o.status === '新規受付').length;
  const processingOrders = orders.filter((o) => o.status === '外部加工依頼中').length;
  const packedOrders = orders.filter((o) => o.status === '加工・梱包完了' || o.status === '出荷準備中').length;
  const shippedOrders = orders.filter((o) => o.status === '出荷完了' || o.status === 'MF請求書発行済').length;

  return (
    <div className="space-y-6">
      {/* Welcome & Situation Banner */}
      <div className="bg-gradient-to-r from-[#183B2B] via-[#1E3A2F] to-[#254C3A] text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-emerald-800/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              林氏提案：業務フロー整理・システム選定＆伴走支援プロトタイプ
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              津野山畜産公社 営業事務・受発注一元管理ポータル
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              和牛500頭の肥育から食肉販売まで。営業1〜2名＋事務1名の体制で、Excelとマネーフォワードに分散していた
              「受発注」「在庫」「外部委託加工」「請求業務」を一本化し、少人数での安定運用と将来の自走化を目指します。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            <button
              id="dash-quick-ai-parse-btn"
              onClick={onOpenAiParser}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4 text-emerald-950" />
              LINE・メール注文AI自動解析
            </button>
            <button
              id="dash-quick-mobile-btn"
              onClick={onOpenMobilePreview}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm rounded-xl border border-white/20 transition-all"
            >
              <Smartphone className="w-4 h-4 text-emerald-300" />
              現場スマホ表示
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Monthly Orders */}
        <div 
          onClick={() => onNavigateTab('orders')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">受注高（今月確定分）</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100 transition-colors">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">¥{totalRevenue.toLocaleString()}</span>
            <span className="text-xs text-emerald-600 font-semibold">{orders.length} 件</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>土佐赤牛 62% / 黒牛 26% / 加工品 12%</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </div>

        {/* Processing Batches (External Contractor) */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">委託加工中（外部提携）</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700 group-hover:bg-blue-100 transition-colors">
              <Beef className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{activeBatches.length} 頭分</span>
            <span className="text-xs text-blue-600 font-medium">土佐中央 / 南国ミート</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>平均歩留まり 64.8%（枝肉→正肉）</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </div>

        {/* Low Stock Warning */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">在庫アラート</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700 group-hover:bg-amber-100 transition-colors">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-900">{lowStockItems.length} 品目</span>
            <span className="text-xs text-amber-700 font-semibold">要補充・欠品危機</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>土佐赤牛ヒレ(残5.2kg) 逼迫</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </div>

        {/* Money Forward Unbilled Amount */}
        <div 
          onClick={() => onNavigateTab('money-forward')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">マネーフォワード未連携</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100 transition-colors">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{unbilledOrders.length} 件</span>
            <span className="text-xs text-slate-500">(¥{unbilledAmount.toLocaleString()})</span>
          </div>
          <p className="text-xs text-emerald-700 mt-2 flex items-center justify-between font-medium">
            <span>ワンクリックCSV出力対応</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </div>
      </div>

      {/* Order Status Pipeline Flow */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              リアルタイム業務パイプライン（受発注・加工・出荷・請求）
            </h3>
            <p className="text-xs text-slate-500">電話/LINE/Web受注から外部加工業者連携、請求書発行までの進行状況</p>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            全受注一覧を見る
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Step 1: New orders */}
          <div 
            onClick={() => onNavigateTab('orders')}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600">① 新規受付</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{newOrders} <span className="text-xs font-normal text-slate-500">件</span></div>
            <p className="text-[11px] text-slate-500 mt-1">電話AI/LINE/Web経由</p>
          </div>

          {/* Step 2: External Processing */}
          <div 
            onClick={() => onNavigateTab('inventory')}
            className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/80 hover:bg-blue-100/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-blue-800">② 外部委託加工中</span>
              <Beef className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-900">{processingOrders} <span className="text-xs font-normal text-blue-700">件</span></div>
            <p className="text-[11px] text-blue-700 mt-1">カット指示書発行済み</p>
          </div>

          {/* Step 3: Packed & Ready */}
          <div 
            onClick={() => onNavigateTab('orders')}
            className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200/80 hover:bg-indigo-100/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-indigo-800">③ 梱包・出荷準備</span>
              <Truck className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-indigo-900">{packedOrders} <span className="text-xs font-normal text-indigo-700">件</span></div>
            <p className="text-[11px] text-indigo-700 mt-1">ヤマトクール便手配中</p>
          </div>

          {/* Step 4: Shipped & MF Invoiced */}
          <div 
            onClick={() => onNavigateTab('money-forward')}
            className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 hover:bg-emerald-100/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-800">④ 出荷済・MF請求</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-900">{shippedOrders} <span className="text-xs font-normal text-emerald-700">件</span></div>
            <p className="text-[11px] text-emerald-700 mt-1">二重入力なしで連携</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Orders & Quick AI Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Active Orders with Status */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">直近の受発注ステータス</h3>
              <p className="text-xs text-slate-500">飲食店・ホテル・精肉店からの注文と外部加工の進行状況</p>
            </div>
            <button
              id="dash-add-order-modal-btn"
              onClick={onOpenNewOrderModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1E3A2F] hover:bg-[#254C3A] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              + 新規受注入力
            </button>
          </div>

          {/* Mobile view: Cards instead of wide table */}
          <div className="sm:hidden space-y-2.5">
            {orders.slice(0, 4).map((order) => (
              <div 
                key={order.id} 
                onClick={() => onNavigateTab('orders')}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 active:bg-slate-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 truncate max-w-[170px]">{order.customerName}</span>
                  <span className="font-bold text-xs text-emerald-900 font-mono">¥{order.totalAmount.toLocaleString()}</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  {order.items.map((i) => `${i.productName} (${i.quantity}${i.unit})`).join(', ')}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono">{order.orderNumber}</span>
                    <span>•</span>
                    <span>納: {order.deliveryDate}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full font-bold ${
                    order.status === '新規受付' ? 'bg-amber-100 text-amber-800' :
                    order.status === '外部加工依頼中' ? 'bg-blue-100 text-blue-800' :
                    order.status === '加工・梱包完了' ? 'bg-indigo-100 text-indigo-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop / Tablet view: Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">受注番号 / 顧客</th>
                  <th className="py-2.5 px-3">窓口</th>
                  <th className="py-2.5 px-3">商品・数量</th>
                  <th className="py-2.5 px-3">希望納期</th>
                  <th className="py-2.5 px-3">ステータス</th>
                  <th className="py-2.5 px-3 text-right">合計金額</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 4).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{order.customerName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{order.orderNumber}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        order.channel === 'LINE' ? 'bg-emerald-100 text-emerald-800' :
                        order.channel === '電話AI受付' ? 'bg-purple-100 text-purple-800' :
                        order.channel === 'Web発注フォーム' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {order.channel}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-800 font-medium truncate max-w-[160px]">
                        {order.items.map((i) => `${i.productName} (${i.quantity}${i.unit})`).join(', ')}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {order.deliveryDate}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        order.status === '新規受付' ? 'bg-amber-100 text-amber-800' :
                        order.status === '外部加工依頼中' ? 'bg-blue-100 text-blue-800' :
                        order.status === '加工・梱包完了' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      ¥{order.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (1 span): Hayashi's Key Proposal Highlights & AI Features */}
        <div className="space-y-4">
          {/* Small Start Phone AI Box */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl border border-amber-200 p-5 shadow-xs">
            <div className="flex items-center gap-2 text-amber-800 mb-2">
              <PhoneCall className="w-4 h-4 text-amber-700" />
              <h4 className="text-xs font-bold uppercase tracking-wider">スモールスタート施策</h4>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              代表電話 AI自動応答システム
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              牛の給餌や現場作業中のスタッフの手を止めず、FAQ（飼育方針、防疫見学ルール）自動回答や注文受付をAIが代行します。
            </p>
            <button
              id="dash-open-phone-ai-btn"
              onClick={() => onNavigateTab('phone-ai')}
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              電話AI応答をシミュレーション
            </button>
          </div>

          {/* Quick Notification Snapshot */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                関係者への通知ログ
              </h4>
              <button
                onClick={() => onNavigateTab('notifications')}
                className="text-[11px] text-emerald-700 hover:underline font-medium"
              >
                すべて見る
              </button>
            </div>
            <div className="space-y-2.5">
              {notifications.slice(0, 3).map((notif) => (
                <div key={notif.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-semibold text-slate-600">宛先: {notif.targetRole} ({notif.channel})</span>
                    <span>{notif.timestamp}</span>
                  </div>
                  <div className="font-semibold text-slate-800 line-clamp-1">{notif.title}</div>
                  <div className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">{notif.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
