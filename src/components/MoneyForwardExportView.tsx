import React, { useState } from 'react';
import { Order } from '../types';
import { 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  RefreshCw,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface MoneyForwardExportViewProps {
  orders: Order[];
  onSyncAllToMoneyForward: () => void;
  onSyncSingleOrder: (orderId: string) => void;
}

export const MoneyForwardExportView: React.FC<MoneyForwardExportViewProps> = ({
  orders,
  onSyncAllToMoneyForward,
  onSyncSingleOrder,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'unbilled' | 'synced'>('unbilled');

  const unbilledOrders = orders.filter((o) => !o.mfInvoiceSynced);
  const syncedOrders = orders.filter((o) => o.mfInvoiceSynced);

  const displayedOrders = filterType === 'unbilled' 
    ? unbilledOrders 
    : filterType === 'synced' 
    ? syncedOrders 
    : orders;

  const totalUnbilledAmount = unbilledOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Generate and download actual CSV for Money Forward Cloud Invoice
  const handleDownloadMfCsv = () => {
    // Header for Money Forward Invoicing CSV import
    const headers = [
      '請求書番号',
      '取引先名',
      '件名',
      '請求日',
      'お支払期日',
      '品名',
      '数量',
      '単位',
      '単価',
      '税率',
      '備考',
      '合計金額',
    ];

    const rows: string[][] = [];

    unbilledOrders.forEach((ord) => {
      ord.items.forEach((it) => {
        rows.push([
          ord.orderNumber,
          `"${ord.customerName}"`,
          `"食肉販売代金 (${it.productName})"`,
          ord.orderDate.split(' ')[0],
          ord.deliveryDate,
          `"${it.productName} [${it.cutType}]"`,
          String(it.quantity),
          it.unit,
          String(it.unitPrice),
          '軽減税率8%', // Food meat is 8%
          `"外部加工連携: ${ord.processorPartner}"`,
          String(it.subtotal),
        ]);
      });
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MF_Invoice_Import_Tsunoyama_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Overview Context Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                マネーフォワード クラウド請求書 連携ハブ
              </h2>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                二重入力ゼロ化
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              これまで「受発注Excel」を見ながら事務スタッフ1名が「マネーフォワード クラウド請求書」に手入力していた転記作業を全廃。
              受注データからMF標準インポートCSVを1秒で生成し、売上・請求・売掛金管理をシームレスに同期します。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="mf-download-csv-btn"
              onClick={handleDownloadMfCsv}
              disabled={unbilledOrders.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              MF用 請求書CSVダウンロード ({unbilledOrders.length}件)
            </button>
            <button
              id="mf-sync-all-btn"
              onClick={onSyncAllToMoneyForward}
              disabled={unbilledOrders.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              全件連携済みに更新
            </button>
          </div>
        </div>

        {/* Sync Stats Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
            <span className="text-slate-500 text-[11px] block">未請求データ（CSV連携待ち）</span>
            <div className="text-lg font-bold text-amber-900 mt-0.5">
              {unbilledOrders.length} 件 / ¥{totalUnbilledAmount.toLocaleString()}
            </div>
          </div>
          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
            <span className="text-slate-500 text-[11px] block">マネーフォワード連携完了</span>
            <div className="text-lg font-bold text-emerald-900 mt-0.5">
              {syncedOrders.length} 件
            </div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-slate-500 text-[11px] block">適格請求書（インボイス制度）</span>
              <span className="text-xs font-semibold text-slate-800">軽減税率8%（食肉）完全準拠</span>
            </div>
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterType('unbilled')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                filterType === 'unbilled' ? 'bg-amber-100 text-amber-900' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              未連携 ({unbilledOrders.length})
            </button>
            <button
              onClick={() => setFilterType('synced')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                filterType === 'synced' ? 'bg-emerald-100 text-emerald-900' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              連携完了 ({syncedOrders.length})
            </button>
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                filterType === 'all' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              すべて ({orders.length})
            </button>
          </div>
          <span className="text-[11px] text-slate-400">マネーフォワード クラウド請求書 CSVフォーマット準拠</span>
        </div>

        {/* Mobile View: Invoice cards (< 768px) */}
        <div className="md:hidden p-3 divide-y divide-slate-100">
          {displayedOrders.map((order) => (
            <div key={order.id} className="py-3 first:pt-1 last:pb-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-sm text-slate-900">{order.customerName}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{order.orderNumber}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-slate-900 font-mono">
                    ¥{order.totalAmount.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400">税込 (軽減8%)</div>
                </div>
              </div>

              <div className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg space-y-0.5">
                {order.items.map((it) => (
                  <div key={it.id} className="flex justify-between">
                    <span>{it.productName}</span>
                    <span className="font-medium text-slate-900">{it.quantity}{it.unit}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <div>
                  {order.mfInvoiceSynced ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      {order.mfInvoiceNumber || 'MF連携済'}
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
                      MF未請求
                    </span>
                  )}
                </div>
                {!order.mfInvoiceSynced && (
                  <button
                    onClick={() => onSyncSingleOrder(order.id)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    連携済みに更新
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Wide Table (>= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-3">受注番号</th>
                <th className="p-3">取引先名</th>
                <th className="p-3">受注日 / 納品日</th>
                <th className="p-3">請求品名・数量</th>
                <th className="p-3 text-right">税抜・消費税率</th>
                <th className="p-3 text-right">請求金額 (税込)</th>
                <th className="p-3 text-center">MF連携状態</th>
                <th className="p-3 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-900">{order.orderNumber}</td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-900">{order.customerName}</div>
                    <span className="text-[10px] text-slate-400">{order.customerType}</span>
                  </td>
                  <td className="p-3 text-slate-600">
                    <div>受: {order.orderDate.split(' ')[0]}</div>
                    <div className="text-[10px] text-slate-400">納: {order.deliveryDate}</div>
                  </td>
                  <td className="p-3">
                    {order.items.map((it) => (
                      <div key={it.id} className="text-slate-800">
                        {it.productName} ({it.quantity}{it.unit})
                      </div>
                    ))}
                  </td>
                  <td className="p-3 text-right text-slate-500">
                    軽減税率 8%
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900 text-sm">
                    ¥{order.totalAmount.toLocaleString()}
                  </td>
                  <td className="p-3 text-center">
                    {order.mfInvoiceSynced ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        {order.mfInvoiceNumber || 'MF発行済'}
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
                        未請求
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {!order.mfInvoiceSynced && (
                      <button
                        onClick={() => onSyncSingleOrder(order.id)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium transition-colors"
                      >
                        連携済みにする
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
