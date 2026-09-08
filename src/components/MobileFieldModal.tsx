import React, { useState } from 'react';
import { Order, InventoryItem } from '../types';
import { 
  Smartphone, 
  X, 
  Beef, 
  ClipboardList, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Sparkles, 
  Search,
  ChevronRight,
  Truck
} from 'lucide-react';

interface MobileFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  inventory: InventoryItem[];
  onOpenAiParser: () => void;
}

export const MobileFieldModal: React.FC<MobileFieldModalProps> = ({
  isOpen,
  onClose,
  orders,
  inventory,
  onOpenAiParser,
}) => {
  const [mobileTab, setMobileTab] = useState<'home' | 'orders' | 'stock'>('home');
  const [selectedMobileOrder, setSelectedMobileOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-950 text-slate-100 rounded-3xl max-w-sm w-full p-4 shadow-2xl border-4 border-slate-800 relative flex flex-col h-[740px] max-h-[94vh]">
        {/* Smartphone Speaker notch */}
        <div className="flex items-center justify-between pb-2 px-3 text-[10px] text-slate-400 border-b border-slate-800/80">
          <span className="font-mono">11:42</span>
          <div className="w-16 h-3.5 bg-slate-800 rounded-full"></div>
          <span>津野山現場 5G</span>
        </div>

        {/* Top Header inside phone */}
        <div className="py-2.5 px-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center text-white">
              <Beef className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-xs text-white">津野山畜産公社 現場モバイル</span>
          </div>
          <button
            id="mobile-modal-close-btn"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Phone Screen Content */}
        <div className="flex-1 overflow-y-auto p-2 space-y-3 text-xs bg-slate-900 rounded-2xl">
          {mobileTab === 'home' && (
            <div className="space-y-3">
              {/* Quick Status Pill */}
              <div className="bg-emerald-950/80 border border-emerald-700/60 p-3 rounded-xl space-y-1">
                <span className="text-[10px] text-emerald-300 font-bold block">牛舎・現場モード</span>
                <div className="font-bold text-sm text-white">本日の未処理受注: {orders.filter(o => o.status === '新規受付').length}件</div>
                <p className="text-[10px] text-slate-300">外部加工中: 3バッチ / 赤牛ヒレ要補充</p>
              </div>

              {/* Quick Action Large Buttons for Field Staff */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenAiParser();
                  }}
                  className="p-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-left text-white font-bold space-y-1 shadow-sm transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <div className="text-xs">LINE注文をAI解析</div>
                  <div className="text-[9px] text-emerald-100 font-normal">文章を貼るだけ即登録</div>
                </button>

                <button
                  onClick={() => setMobileTab('stock')}
                  className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left text-white font-bold space-y-1 border border-slate-700 transition-colors"
                >
                  <Beef className="w-4 h-4 text-amber-300" />
                  <div className="text-xs">肉在庫クイック確認</div>
                  <div className="text-[9px] text-slate-400 font-normal">赤牛・黒牛残量</div>
                </button>
              </div>

              {/* Today's Urgent Deliveries */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
                  <span>直近の出荷・納品予定</span>
                  <span className="text-emerald-400 text-[10px]" onClick={() => setMobileTab('orders')}>すべて見る</span>
                </div>
                {orders.slice(0, 3).map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedMobileOrder(ord)}
                    className="p-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl space-y-1 cursor-pointer hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-white truncate max-w-[150px]">{ord.customerName}</span>
                      <span className="text-amber-400 font-mono">{ord.deliveryDate}</span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      {ord.items.map(i => `${i.productName} (${i.quantity}${i.unit})`).join(', ')}
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5">
                      <span>{ord.channel}経由</span>
                      <span className="text-emerald-400 font-semibold">{ord.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mobileTab === 'orders' && (
            <div className="space-y-2">
              <div className="font-bold text-xs text-white px-1">受発注一覧 (モバイル)</div>
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => setSelectedMobileOrder(ord)}
                  className="p-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl space-y-1 cursor-pointer hover:bg-slate-800"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{ord.customerName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">¥{ord.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="text-[10px] text-slate-300">
                    納期: {ord.deliveryDate} ({ord.deliveryTimeSlot})
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">{ord.channel}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-800">
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {mobileTab === 'stock' && (
            <div className="space-y-2">
              <div className="font-bold text-xs text-white px-1">部位別 在庫残量</div>
              {inventory.map((it) => (
                <div key={it.id} className="p-2 bg-slate-800/70 border border-slate-700/60 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white text-xs">{it.productName}</div>
                    <div className="text-[10px] text-slate-400">{it.storageLocation}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white text-xs">
                      {it.currentStock} {it.unit}
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      it.status === '欠品危機' ? 'bg-red-900/80 text-red-300' :
                      it.status === '要補充' ? 'bg-amber-900/80 text-amber-300' : 'bg-emerald-900/80 text-emerald-300'
                    }`}>
                      {it.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Order Detail Sheet inside Phone */}
        {selectedMobileOrder && (
          <div className="absolute inset-x-2 bottom-14 bg-slate-800 border border-slate-700 p-3 rounded-2xl shadow-xl space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
              <span className="font-bold text-white">{selectedMobileOrder.customerName} 様</span>
              <button onClick={() => setSelectedMobileOrder(null)} className="text-slate-400">✕</button>
            </div>
            <div className="text-[11px] text-slate-300 space-y-1">
              <div>希望納期: <strong className="text-white">{selectedMobileOrder.deliveryDate}</strong></div>
              <div>商品: {selectedMobileOrder.items.map(i => `${i.productName} × ${i.quantity}${i.unit}`).join(', ')}</div>
              <div>委託先: {selectedMobileOrder.processorPartner} ({selectedMobileOrder.processorStatus})</div>
              <div>指示: {selectedMobileOrder.processorNotes || '特記事項なし'}</div>
            </div>
          </div>
        )}

        {/* Mobile Bottom Navigation Bar */}
        <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-800 text-[10px] text-center">
          <button
            onClick={() => setMobileTab('home')}
            className={`py-1.5 rounded-lg font-bold ${mobileTab === 'home' ? 'text-emerald-400 bg-slate-800' : 'text-slate-400'}`}
          >
            ホーム
          </button>
          <button
            onClick={() => setMobileTab('orders')}
            className={`py-1.5 rounded-lg font-bold ${mobileTab === 'orders' ? 'text-emerald-400 bg-slate-800' : 'text-slate-400'}`}
          >
            受発注 ({orders.length})
          </button>
          <button
            onClick={() => setMobileTab('stock')}
            className={`py-1.5 rounded-lg font-bold ${mobileTab === 'stock' ? 'text-emerald-400 bg-slate-800' : 'text-slate-400'}`}
          >
            在庫確認
          </button>
        </div>
      </div>
    </div>
  );
};
