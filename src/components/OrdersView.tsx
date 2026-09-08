import React, { useState } from 'react';
import { 
  Order, 
  OrderStatus, 
  OrderChannel, 
  ProductCategory 
} from '../types';
import { 
  Sparkles, 
  Plus, 
  Search, 
  Check, 
  Clock, 
  Truck, 
  FileSpreadsheet, 
  Send,
  Eye,
  Loader2,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

interface OrdersViewProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onAddNewOrder: (order: Order) => void;
  onOpenAiParser: () => void;
  onSendProcessorNotice: (order: Order) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onUpdateOrderStatus,
  onAddNewOrder,
  onOpenAiParser,
  onSendProcessorNotice,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (selectedChannel !== 'all' && order.channel !== selectedChannel) return false;
    if (selectedStatus !== 'all' && order.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchNum = order.orderNumber.toLowerCase().includes(q);
      const matchItems = order.items.some((i) => i.productName.toLowerCase().includes(q));
      if (!matchName && !matchNum && !matchItems) return false;
    }
    return true;
  });

  // Manual Form State
  const [newCustName, setNewCustName] = useState('');
  const [newCustType, setNewCustType] = useState<Order['customerType']>('飲食店');
  const [newChannel, setNewChannel] = useState<OrderChannel>('LINE');
  const [newDeliveryDate, setNewDeliveryDate] = useState('2026-09-12');
  const [newCategory, setNewCategory] = useState<ProductCategory>('土佐赤牛');
  const [newProdName, setNewProdName] = useState('土佐赤牛 サーロインブロック');
  const [newCutType, setNewCutType] = useState('ブロック（2kg真空パック）');
  const [newQuantity, setNewQuantity] = useState(5);
  const [newUnitPrice, setNewUnitPrice] = useState(14500);
  const [newNotes, setNewNotes] = useState('');

  const handleCreateManualOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    const subtotal = newQuantity * newUnitPrice;
    const now = new Date();
    const orderNumber = `ORD-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(orders.length + 1).padStart(2, '0')}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: newCustName,
      customerType: newCustType,
      channel: newChannel,
      orderDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      deliveryDate: newDeliveryDate,
      deliveryTimeSlot: '午前中（クール便）',
      status: '新規受付',
      items: [
        {
          id: `item-${Date.now()}`,
          productName: newProdName,
          category: newCategory,
          cutType: newCutType,
          quantity: Number(newQuantity),
          unit: newCategory === '加工品' && newProdName.includes('ハンバーグ') ? '個' : 'kg',
          unitPrice: Number(newUnitPrice),
          subtotal,
        },
      ],
      totalAmount: subtotal,
      processorPartner: '土佐中央食肉加工協同組合',
      processorStatus: '未依頼',
      processorNotes: newNotes || '受注時特記事項なし',
      internalMemo: '手動登録による受注入力',
      mfInvoiceSynced: false,
    };

    onAddNewOrder(newOrder);
    setIsManualModalOpen(false);
    setNewCustName('');
  };

  const statusOptions: OrderStatus[] = [
    '新規受付',
    '外部加工依頼中',
    '加工・梱包完了',
    '出荷準備中',
    '出荷完了',
    'MF請求書発行済',
  ];

  return (
    <div className="space-y-6">
      {/* Header Actions & Explanation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">受発注一元管理（受注窓口の一本化）</h2>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                Excel脱却・全件統合
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              電話・LINE・Webフォーム・メールから寄せられる多品種な注文を1つの画面で集約管理。
              担当者1〜2名でも見落としや二重入力のない運用を実現します。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="orders-ai-parse-modal-trigger"
              onClick={onOpenAiParser}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              LINE・メール注文 AI自動解析
            </button>
            <button
              id="orders-manual-add-btn"
              onClick={() => setIsManualModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              手動で新規受注
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
          {/* Search Box */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              id="orders-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="顧客名・番号・商品名で検索..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Channel filter */}
          <div>
            <select
              id="orders-channel-filter"
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
            >
              <option value="all">全受注窓口 (チャネル)</option>
              <option value="LINE">LINE公式アカウント</option>
              <option value="電話AI受付">電話AI自動受付</option>
              <option value="Web発注フォーム">Web発注フォーム</option>
              <option value="メール">メール</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              id="orders-status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
            >
              <option value="all">全ステータス</option>
              {statusOptions.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Result count */}
          <div className="text-xs text-slate-500 flex items-center justify-end font-medium px-2">
            該当件数: <strong className="text-slate-900 ml-1">{filteredOrders.length} 件</strong>
          </div>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Mobile View: Cards Layout for phones (< 768px) */}
        <div className="md:hidden p-3 divide-y divide-slate-100">
          {filteredOrders.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              条件に一致する受注データがありません
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="py-3 first:pt-1 last:pb-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-sm text-slate-900">{order.customerName}</div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-0.5">
                      <span>{order.orderNumber}</span>
                      <span>•</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        order.channel === 'LINE' ? 'bg-emerald-100 text-emerald-800' :
                        order.channel === '電話AI受付' ? 'bg-purple-100 text-purple-800' :
                        order.channel === 'Web発注フォーム' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {order.channel}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-sm text-slate-900 font-mono">
                      ¥{order.totalAmount.toLocaleString()}
                    </div>
                    <span className={`text-[10px] font-semibold ${
                      order.mfInvoiceSynced ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {order.mfInvoiceSynced ? 'MF連携済' : 'MF未請求'}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-0.5">
                  {order.items.map((it) => (
                    <div key={it.id} className="flex justify-between">
                      <span>{it.productName}</span>
                      <span className="font-medium text-slate-900">{it.quantity}{it.unit}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                  <div className="text-[11px] text-slate-500">
                    納品: <strong className="text-slate-800">{order.deliveryDate}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      id={`mobile-order-status-${order.id}`}
                      value={order.status}
                      onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white min-h-[36px]"
                    >
                      {statusOptions.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                    <button
                      id={`mobile-order-detail-${order.id}`}
                      onClick={() => setDetailOrder(order)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="詳細確認"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop / Tablet View: Wide Table (>= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3 px-4">受注番号 / 受注日時</th>
                <th className="py-3 px-4">顧客名・種別</th>
                <th className="py-3 px-4">受付窓口</th>
                <th className="py-3 px-4">注文内容（商品・数量）</th>
                <th className="py-3 px-4">希望納期</th>
                <th className="py-3 px-4">外部加工業者連携</th>
                <th className="py-3 px-4">ステータス変更</th>
                <th className="py-3 px-4 text-right">金額 (税込)</th>
                <th className="py-3 px-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    条件に一致する受注データがありません
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Number & Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900">{order.orderNumber}</div>
                        <div className="text-[11px] text-slate-400">{order.orderDate}</div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{order.customerName}</div>
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-medium">
                          {order.customerType}
                        </span>
                      </td>

                      {/* Channel */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          order.channel === 'LINE' ? 'bg-emerald-100 text-emerald-800' :
                          order.channel === '電話AI受付' ? 'bg-purple-100 text-purple-800' :
                          order.channel === 'Web発注フォーム' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {order.channel}
                        </span>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4 max-w-[220px]">
                        {order.items.map((it) => (
                          <div key={it.id} className="text-slate-800 font-medium">
                            {it.productName} × {it.quantity}{it.unit}
                          </div>
                        ))}
                      </td>

                      {/* Delivery Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">{order.deliveryDate}</div>
                        <div className="text-[10px] text-slate-400">{order.deliveryTimeSlot}</div>
                      </td>

                      {/* Processor Status */}
                      <td className="py-3.5 px-4">
                        <div className="text-[11px] text-slate-700 font-medium">{order.processorPartner}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            order.processorStatus === '納品完了' ? 'bg-emerald-500' :
                            order.processorStatus === '作業中' ? 'bg-blue-500' :
                            order.processorStatus === '依頼送信済' ? 'bg-amber-500' : 'bg-slate-300'
                          }`}></span>
                          <span className="text-[10px] text-slate-500">{order.processorStatus}</span>
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4">
                        <select
                          id={`order-status-select-${order.id}`}
                          value={order.status}
                          onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className={`text-xs font-semibold px-2 py-1 rounded-lg border focus:outline-none transition-colors ${
                            order.status === '新規受付' ? 'bg-amber-50 text-amber-900 border-amber-300' :
                            order.status === '外部加工依頼中' ? 'bg-blue-50 text-blue-900 border-blue-300' :
                            order.status === '加工・梱包完了' ? 'bg-indigo-50 text-indigo-900 border-indigo-300' :
                            order.status === '出荷完了' ? 'bg-teal-50 text-teal-900 border-teal-300' :
                            'bg-emerald-50 text-emerald-900 border-emerald-300'
                          }`}
                        >
                          {statusOptions.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-bold text-slate-900 text-sm">
                          ¥{order.totalAmount.toLocaleString()}
                        </div>
                        {order.mfInvoiceSynced ? (
                          <span className="text-[10px] text-emerald-600 font-medium">MF連携済</span>
                        ) : (
                          <span className="text-[10px] text-amber-600 font-medium">MF未請求</span>
                        )}
                      </td>

                      {/* Detail Action */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          id={`order-view-detail-btn-${order.id}`}
                          onClick={() => setDetailOrder(order)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
                          title="詳細確認・加工指示書"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {detailOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  {detailOrder.orderNumber}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{detailOrder.customerName} 様</h3>
              </div>
              <button
                id="order-detail-close-btn"
                onClick={() => setDetailOrder(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block mb-0.5">受注チャネル</span>
                <span className="font-semibold text-slate-800">{detailOrder.channel} ({detailOrder.orderDate})</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block mb-0.5">希望納期</span>
                <span className="font-semibold text-slate-800">{detailOrder.deliveryDate} {detailOrder.deliveryTimeSlot}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block mb-0.5">外部委託加工パートナー</span>
                <span className="font-semibold text-slate-800">{detailOrder.processorPartner} ({detailOrder.processorStatus})</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block mb-0.5">マネーフォワード請求ステータス</span>
                <span className="font-semibold text-slate-800">
                  {detailOrder.mfInvoiceSynced ? `連携済 (${detailOrder.mfInvoiceNumber})` : '未請求 (CSV出力対象)'}
                </span>
              </div>
            </div>

            {/* Order item table */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">注文商品明細</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2 px-3">商品名 / カット仕様</th>
                      <th className="py-2 px-3">区分</th>
                      <th className="py-2 px-3 text-right">単価</th>
                      <th className="py-2 px-3 text-right">数量</th>
                      <th className="py-2 px-3 text-right">小計</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detailOrder.items.map((it) => (
                      <tr key={it.id}>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900">{it.productName}</div>
                          <div className="text-[11px] text-slate-500">{it.cutType}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded text-[10px]">
                            {it.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600">¥{it.unitPrice.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-medium">{it.quantity} {it.unit}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">¥{it.subtotal.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                    <tr>
                      <td colSpan={4} className="py-2 px-3 text-right text-slate-700">合計請求金額 (税込)</td>
                      <td className="py-2 px-3 text-right text-slate-900 text-sm">¥{detailOrder.totalAmount.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Notes & Memos */}
            <div className="space-y-2">
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 text-xs">
                <span className="font-bold text-blue-900 block mb-0.5">外部加工業者宛て指示メモ:</span>
                <p className="text-blue-800">{detailOrder.processorNotes || '特になし'}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                <span className="font-bold text-slate-700 block mb-0.5">社内営業・事務連絡メモ:</span>
                <p className="text-slate-600">{detailOrder.internalMemo || '特になし'}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                id="order-detail-send-processor-btn"
                onClick={() => {
                  onSendProcessorNotice(detailOrder);
                  setDetailOrder(null);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                外部加工所へ指示書送信（通知）
              </button>
              <button
                id="order-detail-dismiss-btn"
                onClick={() => setDetailOrder(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Order Creation Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">新規受注の手動登録</h3>
              <button onClick={() => setIsManualModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateManualOrder} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">顧客名 / 取引先名 *</label>
                  <input
                    type="text"
                    required
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    placeholder="例: レストラン 土佐風月"
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">顧客種別</label>
                  <select
                    value={newCustType}
                    onChange={(e) => setNewCustType(e.target.value as any)}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  >
                    <option value="飲食店">飲食店</option>
                    <option value="ホテル・旅館">ホテル・旅館</option>
                    <option value="精肉店">精肉店</option>
                    <option value="個人・ギフト">個人・ギフト</option>
                    <option value="卸売">卸売</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">受付窓口 (チャネル)</label>
                  <select
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value as any)}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  >
                    <option value="LINE">LINE公式アカウント</option>
                    <option value="Web発注フォーム">Web発注フォーム</option>
                    <option value="電話AI受付">電話AI自動受付</option>
                    <option value="メール">メール</option>
                    <option value="FAX">FAX</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">納品希望日</label>
                  <input
                    type="date"
                    value={newDeliveryDate}
                    onChange={(e) => setNewDeliveryDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Product Info */}
              <div className="bg-slate-50 p-3 rounded-xl space-y-3">
                <div className="font-semibold text-slate-800">商品明細情報</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1">商品カテゴリ</label>
                    <select
                      value={newCategory}
                      onChange={(e) => {
                        const cat = e.target.value as ProductCategory;
                        setNewCategory(cat);
                        if (cat === '土佐赤牛') {
                          setNewProdName('土佐赤牛 サーロインブロック');
                          setNewUnitPrice(14500);
                        } else if (cat === '土佐黒牛') {
                          setNewProdName('土佐黒牛 リブロース');
                          setNewUnitPrice(12500);
                        } else {
                          setNewProdName('土佐赤牛100% プレミアム生ハンバーグ');
                          setNewUnitPrice(680);
                        }
                      }}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="土佐赤牛">土佐赤牛</option>
                      <option value="土佐黒牛">土佐黒牛</option>
                      <option value="加工品">加工品</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">商品名</label>
                    <input
                      type="text"
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1">カット仕様</label>
                    <input
                      type="text"
                      value={newCutType}
                      onChange={(e) => setNewCutType(e.target.value)}
                      placeholder="ブロック / スライス等"
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">数量 (kg または 個)</label>
                    <input
                      type="number"
                      min={1}
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(Number(e.target.value))}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">単価 (税込)</label>
                    <input
                      type="number"
                      value={newUnitPrice}
                      onChange={(e) => setNewUnitPrice(Number(e.target.value))}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div className="text-right text-xs text-slate-700 font-bold">
                  小計概算: ¥{(newQuantity * newUnitPrice).toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">外部加工指示 / 社内メモ</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="例: チルド便指定、2mmスライス、ドリップシート同封等"
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs"
                >
                  受注台帳に登録する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
