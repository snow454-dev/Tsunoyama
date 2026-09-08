import React, { useState } from 'react';
import { InventoryItem, ProcessingBatch, Order } from '../types';
import { 
  Beef, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Printer, 
  Plus, 
  FileText, 
  Sparkles,
  Layers,
  ArrowRight,
  Send
} from 'lucide-react';

interface InventoryProcessingViewProps {
  inventory: InventoryItem[];
  batches: ProcessingBatch[];
  orders: Order[];
  onUpdateBatchStatus: (batchId: string, newStatus: ProcessingBatch['status']) => void;
  onAddNewBatch: (batch: ProcessingBatch) => void;
}

export const InventoryProcessingView: React.FC<InventoryProcessingViewProps> = ({
  inventory,
  batches,
  orders,
  onUpdateBatchStatus,
  onAddNewBatch,
}) => {
  const [selectedTab, setSelectedTab] = useState<'inventory' | 'batches'>('inventory');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedBatchForSheet, setSelectedBatchForSheet] = useState<ProcessingBatch | null>(batches[0] || null);
  const [isNewBatchModalOpen, setIsNewBatchModalOpen] = useState(false);

  // Filtered inventory
  const filteredInventory = inventory.filter((item) => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    return true;
  });

  // Form for new batch
  const [newBreed, setNewBreed] = useState<'土佐赤牛' | '土佐黒牛'>('土佐赤牛');
  const [newCattleId, setNewCattleId] = useState('1503991044');
  const [newCarcassWeight, setNewCarcassWeight] = useState(475.0);
  const [newProcessor, setNewProcessor] = useState('土佐中央食肉加工協同組合');
  const [newExpDate, setNewExpDate] = useState('2026-09-18');
  const [newNotes, setNewNotes] = useState('飲食店用サーロイン・ヒレ優先。残肉はハンバーグ用ミンチ。');

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const batchNumber = `BATCH-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(batches.length + 1).padStart(2, '0')}`;
    const newB: ProcessingBatch = {
      id: `batch-${Date.now()}`,
      batchNumber,
      processorName: newProcessor,
      cattleId: newCattleId,
      breed: newBreed,
      carcassWeightKg: Number(newCarcassWeight),
      expectedYieldRate: newBreed === '土佐赤牛' ? 64.0 : 66.5,
      shippedToProcessorDate: new Date().toISOString().split('T')[0],
      expectedCompletionDate: newExpDate,
      status: '搬入待機',
      targetOrders: [],
      notes: newNotes,
    };
    onAddNewBatch(newB);
    setIsNewBatchModalOpen(false);
  };

  const statusList: ProcessingBatch['status'][] = [
    '搬入待機',
    '解体・脱骨中',
    'カット・真空パック',
    '検品納品完了',
  ];

  return (
    <div className="space-y-6">
      {/* Header Context Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">在庫 & 外部委託加工パートナー連携</h2>
              <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                自社加工場なしモデル特化
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              枝肉の屠畜から外部委託加工業者（土佐中央食肉加工等）での脱骨・スライス・急速冷凍・保管、
              そして歩留まり率管理までを一貫してトラッキングします。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="inv-new-batch-btn"
              onClick={() => setIsNewBatchModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              新規加工バッチ（屠畜出荷）登録
            </button>
          </div>
        </div>

        {/* Sub-tab selection */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
          <button
            id="inv-tab-inventory-btn"
            onClick={() => setSelectedTab('inventory')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              selectedTab === 'inventory'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            部位別・製品在庫一覧 ({inventory.length}品目)
          </button>
          <button
            id="inv-tab-batches-btn"
            onClick={() => setSelectedTab('batches')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              selectedTab === 'batches'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            外部委託加工バッチ進捗 ({batches.length}件)
          </button>
        </div>
      </div>

      {/* Tab 1: Current Meat Inventory */}
      {selectedTab === 'inventory' && (
        <div className="space-y-4">
          {/* Filter Pills */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {['all', '土佐赤牛', '土佐黒牛', '加工品'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    categoryFilter === cat
                      ? 'bg-emerald-800 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat === 'all' ? '全カテゴリ' : cat}
                </button>
              ))}
            </div>
            <div className="text-xs text-slate-500">
              欠品・逼迫アラート: <span className="text-amber-700 font-bold">2件</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Mobile View: Inventory Cards (< 768px) */}
            <div className="md:hidden p-3 divide-y divide-slate-100">
              {filteredInventory.map((item) => (
                <div key={item.id} className="py-3 first:pt-1 last:pb-1 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-slate-900">{item.productName}</div>
                      <div className="text-xs text-slate-500">{item.cutType}</div>
                    </div>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === '欠品危機' ? 'bg-red-100 text-red-800' :
                      item.status === '要補充' ? 'bg-amber-100 text-amber-800' :
                      item.status === '潤沢' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="text-slate-600">
                      現在庫: <strong className="text-slate-900 text-sm font-mono">{item.currentStock}</strong> {item.unit}
                      <span className="text-[11px] text-slate-400 ml-1.5">(安全: {item.safetyStock}{item.unit})</span>
                    </div>
                    <div className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {item.storageLocation}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                    <span>SKU: {item.sku}</span>
                    {item.cattleIndividualId && <span>個体: {item.cattleIndividualId}</span>}
                    <span>賞味: {item.expirationDate}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Wide Table (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-3 px-4">SKU / ロット番号</th>
                    <th className="py-3 px-4">商品名 / カット仕様</th>
                    <th className="py-3 px-4">個体識別番号</th>
                    <th className="py-3 px-4">現在庫数量</th>
                    <th className="py-3 px-4">安全在庫水準</th>
                    <th className="py-3 px-4">保管場所</th>
                    <th className="py-3 px-4">熟成日数 / 賞味期限</th>
                    <th className="py-3 px-4 text-center">在庫状態</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-slate-900">{item.sku}</div>
                        <div className="text-[11px] text-slate-400">{item.lotNumber}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{item.productName}</div>
                        <div className="text-[11px] text-slate-500">{item.cutType}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {item.cattleIndividualId ? (
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                            {item.cattleIndividualId}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                        {item.currentStock} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {item.safetyStock} {item.unit}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <span className="inline-block px-2 py-0.5 bg-slate-100 rounded text-[11px]">
                          {item.storageLocation}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700">
                          {item.agingDays ? `${item.agingDays}日 熟成` : '即時加工'}
                        </div>
                        <div className="text-[10px] text-slate-400">賞味: {item.expirationDate}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          item.status === '欠品危機' ? 'bg-red-100 text-red-800' :
                          item.status === '要補充' ? 'bg-amber-100 text-amber-800' :
                          item.status === '潤沢' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: External Processing Batches */}
      {selectedTab === 'batches' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Batches Table (2 columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">外部委託加工バッチ一覧</h3>
                <span className="text-xs text-slate-500">外部加工業者との情報共有</span>
              </div>
              {/* Mobile View: Batch cards (< 768px) */}
              <div className="md:hidden p-3 divide-y divide-slate-100">
                {batches.map((b) => (
                  <div key={b.id} className="py-3 first:pt-1 last:pb-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-slate-900">{b.breed}</div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                          <span>{b.batchNumber}</span>
                          <span>•</span>
                          <span>個体: {b.cattleId}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedBatchForSheet(b)}
                        className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 ${
                          selectedBatchForSheet?.id === b.id
                            ? 'bg-blue-50 border-blue-300 text-blue-800 font-bold'
                            : 'border-slate-200 text-slate-600 bg-white'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>指示書</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg">
                      <span className="text-slate-600">{b.processorName}</span>
                      <span className="font-bold text-slate-900">{b.carcassWeightKg} kg</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <span className="text-[11px] text-slate-500">
                        納品予定: <strong className="text-slate-800">{b.expectedCompletionDate}</strong>
                      </span>
                      <select
                        value={b.status}
                        onChange={(e) => onUpdateBatchStatus(b.id, e.target.value as any)}
                        className="text-xs font-semibold px-2 py-1.5 rounded-lg border border-slate-300 bg-white min-h-[36px]"
                      >
                        {statusList.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View: Wide Table (>= 768px) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="p-3">バッチ番号 / 個体ID</th>
                      <th className="p-3">品種 / 委託先</th>
                      <th className="p-3">枝肉重量 / 歩留まり</th>
                      <th className="p-3">予定納品日</th>
                      <th className="p-3">進捗ステータス</th>
                      <th className="p-3 text-center">指示書</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {batches.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono">
                          <div className="font-bold text-slate-900">{b.batchNumber}</div>
                          <div className="text-[11px] text-slate-500">ID: {b.cattleId}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-900">{b.breed}</div>
                          <div className="text-[11px] text-slate-500">{b.processorName}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{b.carcassWeightKg} kg</div>
                          <div className="text-[10px] text-emerald-700">
                            歩留: {b.actualYieldRate ? `${b.actualYieldRate}% (実績)` : `${b.expectedYieldRate}% (予想)`}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-slate-800">{b.expectedCompletionDate}</div>
                        </td>
                        <td className="p-3">
                          <select
                            value={b.status}
                            onChange={(e) => onUpdateBatchStatus(b.id, e.target.value as any)}
                            className="text-xs font-semibold px-2 py-1 rounded-lg border bg-white focus:outline-none"
                          >
                            {statusList.map((st) => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setSelectedBatchForSheet(b)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              selectedBatchForSheet?.id === b.id
                                ? 'bg-blue-100 text-blue-800'
                                : 'text-slate-500 hover:bg-slate-100'
                            }`}
                            title="加工指示書プレビュー"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Processing Instruction Sheet Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                <FileText className="w-4 h-4 text-blue-700" />
                カット加工指示書プレビュー
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                外部送信用（LINE/FAX/PDF）
              </span>
            </div>

            {selectedBatchForSheet ? (
              <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="text-center font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
                  食肉加工委託 指示書
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><span className="text-slate-400">委託先:</span> <strong className="text-slate-800">{selectedBatchForSheet.processorName}</strong></div>
                  <div><span className="text-slate-400">発注元:</span> <strong>津野山畜産公社</strong></div>
                  <div><span className="text-slate-400">個体番号:</span> <span className="font-mono">{selectedBatchForSheet.cattleId}</span></div>
                  <div><span className="text-slate-400">品種:</span> <strong>{selectedBatchForSheet.breed}</strong></div>
                  <div><span className="text-slate-400">枝肉重量:</span> {selectedBatchForSheet.carcassWeightKg} kg</div>
                  <div><span className="text-slate-400">完納希望日:</span> <strong>{selectedBatchForSheet.expectedCompletionDate}</strong></div>
                </div>

                <div className="border-t border-slate-200 pt-2">
                  <span className="text-[11px] font-bold text-slate-700 block mb-1">加工・カット指定要項:</span>
                  <p className="text-[11px] text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/80">
                    {selectedBatchForSheet.notes}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>ステータス: <strong>{selectedBatchForSheet.status}</strong></span>
                  <button
                    onClick={() => alert(`【加工指示送信】${selectedBatchForSheet.processorName} 宛てにLINEおよびFAX連携指示を送信しました。`)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    加工所へ指示送信
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">バッチを選択してください</div>
            )}
          </div>
        </div>
      )}

      {/* New Batch Creation Modal */}
      {isNewBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">新規 屠畜・外部加工バッチの登録</h3>
              <button onClick={() => setIsNewBatchModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">牛の品種</label>
                  <select
                    value={newBreed}
                    onChange={(e) => setNewBreed(e.target.value as any)}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  >
                    <option value="土佐赤牛">土佐赤牛（褐毛和種）</option>
                    <option value="土佐黒牛">土佐黒牛（黒毛和種）</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">個体識別番号 (10桁)</label>
                  <input
                    type="text"
                    required
                    value={newCattleId}
                    onChange={(e) => setNewCattleId(e.target.value)}
                    placeholder="例: 1503991044"
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">枝肉重量 (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newCarcassWeight}
                    onChange={(e) => setNewCarcassWeight(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">委託加工パートナー</label>
                  <select
                    value={newProcessor}
                    onChange={(e) => setNewProcessor(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  >
                    <option value="土佐中央食肉加工協同組合">土佐中央食肉加工協同組合</option>
                    <option value="南国ミートプロセシング">南国ミートプロセシング</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">加工完了・納品希望日</label>
                <input
                  type="date"
                  required
                  value={newExpDate}
                  onChange={(e) => setNewExpDate(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">カット・包装指示メモ</label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewBatchModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs"
                >
                  バッチを発行する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
