import React, { useState } from 'react';
import { Order, ProductCategory, OrderChannel } from '../types';
import { Sparkles, Loader2, CheckCircle, ArrowRight, MessageSquare, AlertCircle } from 'lucide-react';
import { clientFallbackOrderParser } from '../utils/aiFallback';

interface AiOrderParserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderParsedAndAdded: (order: Order) => void;
}

export const AiOrderParserModal: React.FC<AiOrderParserModalProps> = ({
  isOpen,
  onClose,
  onOrderParsedAndAdded,
}) => {
  const [inputText, setInputText] = useState('');
  const [channel, setChannel] = useState<OrderChannel>('LINE');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedData, setParsedData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const presets = [
    {
      title: '高知の料亭よりLINE（土佐赤牛サーロイン＋ハンバーグ）',
      text: 'お疲れ様です！土佐料亭 司の山本です。今週末9月11日（金）の午前中着で、土佐赤牛サーロインブロック5kgと、生ハンバーグを30個お願いします。宴会用なのでドリップ防止で真空パックでお願いします！',
      channel: 'LINE' as OrderChannel,
    },
    {
      title: 'ホテル料理長からのメール（黒牛すき焼きスライス）',
      text: 'いつも大変お世話になっております。高知城前グランドホテル仕入れ課の佐藤です。秋の収穫祭フェア用に、土佐黒牛リブロースのすき焼き用スライス（2mm）を15kg手配お願いできますでしょうか。希望納品日は9月12日（土）14-16時です。請求書は今月末締めにて処理をお願いいたします。',
      channel: 'メール' as OrderChannel,
    },
    {
      title: '東京の肉割烹からの急ぎ電話メモ',
      text: '【電話メモ 9/7 11:30】銀座 肉割烹の高橋オーナーより受電。来週火曜9/15に接待特別コースが入ったため、土佐赤牛のシャトーブリアン・特上ヒレ3kgとモモ赤身5kgを直送希望。個体識別番号の証明書同封希望とのこと。',
      channel: '電話AI受付' as OrderChannel,
    },
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    setInputText(preset.text);
    setChannel(preset.channel);
    setParsedData(null);
    setErrorMsg(null);
  };

  const handleRunAiParse = async () => {
    if (!inputText.trim()) {
      setErrorMsg('テキストを入力するか、上記のプリセットを選択してください。');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/ai/parse-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, channel }),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && json.parsed) {
          setParsedData(json.parsed);
          return;
        }
      }
      // Fallback if API returned non-ok or error
      const fallback = clientFallbackOrderParser(inputText, channel);
      setParsedData(fallback);
    } catch (err: any) {
      // Graceful fallback for static hosting (GitHub Pages)
      console.warn('Backend API unavailable, using client-side fallback parser:', err);
      const fallback = clientFallbackOrderParser(inputText, channel);
      setParsedData(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAndAddOrder = () => {
    if (!parsedData) return;

    const now = new Date();
    const orderNumber = `ORD-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`;

    const items = (parsedData.items || []).map((it: any, idx: number) => ({
      id: `item-ai-${Date.now()}-${idx}`,
      productName: it.productName || '和牛特選カット',
      category: (it.category as ProductCategory) || '土佐赤牛',
      cutType: it.cutType || '真空パック',
      quantity: Number(it.quantity) || 1,
      unit: (it.unit as 'kg' | '個' | 'パック') || 'kg',
      unitPrice: Number(it.estimatedUnitPrice) || 12000,
      subtotal: Number(it.subtotal) || 12000,
    }));

    const totalAmount = parsedData.totalAmount || items.reduce((s: number, i: any) => s + i.subtotal, 0);

    const newOrder: Order = {
      id: `ord-ai-${Date.now()}`,
      orderNumber,
      customerName: parsedData.customerName || '新規取引先',
      customerType: parsedData.customerName?.includes('ホテル') ? 'ホテル・旅館' : '飲食店',
      channel: (parsedData.channel as OrderChannel) || channel,
      orderDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      deliveryDate: parsedData.deliveryDate || new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      deliveryTimeSlot: parsedData.deliveryTimeSlot || '午前中（クール便）',
      status: '新規受付',
      items,
      totalAmount,
      processorPartner: '土佐中央食肉加工協同組合',
      processorStatus: '未依頼',
      processorNotes: parsedData.processorNotes || 'AI解析による自動抽出メモ',
      internalMemo: parsedData.internalMemo || `【原文】${inputText.slice(0, 80)}...`,
      mfInvoiceSynced: false,
    };

    onOrderParsedAndAdded(newOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">LINE・メール注文 AI自動構造化</h3>
              <p className="text-xs text-slate-500">雑多な文章をAIが瞬時に解析し、顧客名・部位・数量・納期を抽出</p>
            </div>
          </div>
          <button
            id="ai-parser-close-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>

        {/* Presets */}
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            ワンクリックテスト用サンプル（津野山畜産公社の実際の商流例）:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                id={`ai-preset-btn-${idx}`}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="text-left p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-xs text-slate-700 transition-colors"
              >
                <div className="font-semibold text-slate-900 line-clamp-1">{p.title}</div>
                <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">{p.text}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Input Text Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <label htmlFor="ai-raw-order-text">受領テキスト（LINE、メール、電話メモの貼り付け）</label>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">チャネル:</span>
              <select
                id="ai-parser-channel-select"
                value={channel}
                onChange={(e) => setChannel(e.target.value as OrderChannel)}
                className="px-2 py-1 text-xs border border-slate-200 rounded-md bg-white"
              >
                <option value="LINE">LINE</option>
                <option value="メール">メール</option>
                <option value="電話AI受付">電話AI受付</option>
                <option value="FAX">FAX</option>
              </select>
            </div>
          </div>
          <textarea
            id="ai-raw-order-text"
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="例: 「司の山本です。今週金曜日に赤牛サーロイン5kgとハンバーグ30個お願いします」"
            className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50"
          />
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Run Button */}
        <div>
          <button
            id="ai-run-parser-btn"
            onClick={handleRunAiParse}
            disabled={isLoading}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gemini AIで解析中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-200" />
                AIで構造化データを抽出する
              </>
            )}
          </button>
        </div>

        {/* Parsed Result Display */}
        {parsedData && (
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                解析結果（プレビュー）
              </span>
              <span className="text-[11px] text-emerald-700 font-mono">
                推定合計: ¥{Number(parsedData.totalAmount || 0).toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                <span className="text-slate-400 block text-[10px]">顧客名</span>
                <span className="font-bold text-slate-800">{parsedData.customerName}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                <span className="text-slate-400 block text-[10px]">希望納期</span>
                <span className="font-bold text-slate-800">{parsedData.deliveryDate}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                <span className="text-slate-400 block text-[10px]">時間帯</span>
                <span className="font-bold text-slate-800">{parsedData.deliveryTimeSlot || '指定なし'}</span>
              </div>
            </div>

            {/* Extracted items */}
            <div className="bg-white rounded-lg border border-emerald-100 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-emerald-100/40 text-emerald-900 text-[11px]">
                  <tr>
                    <th className="p-2">商品名</th>
                    <th className="p-2">区分</th>
                    <th className="p-2">カット仕様</th>
                    <th className="p-2 text-right">数量</th>
                    <th className="p-2 text-right">推定単価</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(parsedData.items || []).map((it: any, i: number) => (
                    <tr key={i}>
                      <td className="p-2 font-medium text-slate-900">{it.productName}</td>
                      <td className="p-2 text-slate-600">{it.category}</td>
                      <td className="p-2 text-slate-500 text-[11px]">{it.cutType}</td>
                      <td className="p-2 text-right font-bold">{it.quantity} {it.unit}</td>
                      <td className="p-2 text-right text-slate-700">¥{Number(it.estimatedUnitPrice || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {parsedData.processorNotes && (
              <div className="text-[11px] bg-white p-2 rounded-lg border border-emerald-100 text-slate-600">
                <span className="font-bold text-slate-700">外部加工指示メモ:</span> {parsedData.processorNotes}
              </div>
            )}

            {/* Add to Orders Button */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                id="ai-parser-confirm-add-btn"
                onClick={handleConfirmAndAddOrder}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                この内容で受注台帳に追加する
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
