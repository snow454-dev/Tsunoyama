import React, { useState, useEffect } from 'react';
import { PhoneInquiryLog, Order } from '../types';
import { clientFallbackPhoneResponse } from '../utils/aiFallback';
import { 
  PhoneCall, 
  PhoneOff, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Globe, 
  Clock, 
  MessageSquare, 
  User,
  Plus
} from 'lucide-react';

interface PhoneAiSimulatorViewProps {
  phoneLogs: PhoneInquiryLog[];
  onAddNewLog: (log: PhoneInquiryLog) => void;
  onConvertLogToOrder: (log: PhoneInquiryLog) => void;
}

export const PhoneAiSimulatorView: React.FC<PhoneAiSimulatorViewProps> = ({
  phoneLogs,
  onAddNewLog,
  onConvertLogToOrder,
}) => {
  const [isInCall, setIsInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callerMessage, setCallerMessage] = useState('');
  const [language, setLanguage] = useState<'ja' | 'en'>('ja');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCallLog, setActiveCallLog] = useState<any | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Call timer
  useEffect(() => {
    let interval: any = null;
    if (isInCall) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isInCall]);

  const presetQueries = [
    {
      label: '🌾 飼育・給餌への問い合わせ（FAQ自動回答）',
      text: 'もしもし、津野山畜産公社さんの赤牛について伺いたいのですが、牛にはどんな餌を与えていますか？配合飼料や放牧のこだわりを教えてください。',
      lang: 'ja' as const,
    },
    {
      label: '🚫 明日見学に行きたい（防疫ルール案内）',
      text: '明日高知を旅行する予定で、津野山畜産公社さんの牛舎を直接見学したいのですが、予約なしで行っても大丈夫でしょうか？',
      lang: 'ja' as const,
    },
    {
      label: '🥩 飲食店からの新規仕入れ相談（営業折り返し）',
      text: '松山市でイタリアンレストランをやっております。来週末のディナー用に土佐赤牛のサーロインを4kgほど仕入れたいのですが、在庫や取引条件はありますか？',
      lang: 'ja' as const,
    },
    {
      label: '🌏 English Inquiry from Singapore (多言語対応)',
      text: 'Hello, I am calling from a restaurant group in Singapore. We are interested in importing rare Tosa Akaushi Wagyu. Could you provide your export catalog and minimum order volume?',
      lang: 'en' as const,
    },
  ];

  const handleStartCall = (preset?: typeof presetQueries[0]) => {
    setIsInCall(true);
    setCallDuration(0);
    setActiveCallLog(null);
    if (preset) {
      setCallerMessage(preset.text);
      setLanguage(preset.lang);
    } else {
      setCallerMessage('');
    }
  };

  const handleEndCall = () => {
    setIsInCall(false);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const handleSendQueryToAi = async () => {
    if (!callerMessage.trim()) return;

    setIsLoading(true);

    try {
      let data: any = null;
      try {
        const response = await fetch('/api/ai/phone-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: callerMessage,
            language,
          }),
        });

        if (response.ok) {
          const json = await response.json();
          if (json.success && json.data) {
            data = json.data;
          }
        }
      } catch (networkErr) {
        console.warn('Backend unavailable, using static fallback for phone response:', networkErr);
      }

      if (!data) {
        data = clientFallbackPhoneResponse(callerMessage, language);
      }

      setActiveCallLog(data);

      // Text-to-speech if sound enabled
      if (soundEnabled && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(data.replyText);
        utterance.lang = language === 'en' ? 'en-US' : 'ja-JP';
        utterance.rate = 1.05;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }

      // Add to persistent logs
      const now = new Date();
      const newLog: PhoneInquiryLog = {
        id: `log-${Date.now()}`,
        timestamp: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        callerName: data.extractedData?.callerName || (language === 'en' ? 'Overseas Caller' : 'お電話のお客様'),
        callerPhone: data.extractedData?.contact || '090-XXXX-XXXX',
        intent: data.detectedIntent || '代表電話受付',
        urgency: data.urgency?.includes('高') ? '高（至急折返し）' : data.urgency?.includes('中') ? '中（本日中）' : '低（FAQ解決）',
        spokenSummary: callerMessage,
        aiReplyText: data.replyText,
        staffAction: data.actionForStaff || '社内通知済み',
        convertedToOrder: false,
        language,
      };

      onAddNewLog(newLog);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-amber-700/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-200 text-xs font-semibold border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              林氏提案 スモールスタート施策：基幹システム完成前に即効導入
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              津野山畜産公社 代表電話 AI音声自動応答システム
            </h2>
            <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
              少人数体制（営業1〜2名＋事務1名）で、牛舎での給餌作業や配送中に電話が鳴っても業務を中断させません。
              「飼育環境・給餌のこだわり」「防疫見学ルール」はAIが即座に丁寧回答し、
              注文や商談は要点を自動要約して営業携帯（LINE/Slack）へ即時通知します。
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="phone-sound-toggle-btn"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-amber-200 text-xs font-semibold rounded-xl border border-white/20 transition-all"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-300" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              音声読み上げ: {soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Simulator & Call Experience */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Phone Device Interface */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isInCall ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`}></span>
              <span className="font-bold text-xs text-slate-900">
                {isInCall ? `通話中 (${formatSeconds(callDuration)})` : '待機中（受電可能）'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <button
                onClick={() => setLanguage(language === 'ja' ? 'en' : 'ja')}
                className="font-bold text-amber-700 hover:underline"
              >
                {language === 'ja' ? '日本語' : 'English'}
              </button>
            </div>
          </div>

          {/* Quick preset selector buttons */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              よくある受電シナリオをシミュレーション:
            </span>
            <div className="space-y-1.5">
              {presetQueries.map((p, idx) => (
                <button
                  key={idx}
                  id={`phone-preset-${idx}`}
                  onClick={() => handleStartCall(p)}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/60 transition-colors text-xs"
                >
                  <div className="font-semibold text-slate-800">{p.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{p.text}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Call Controls */}
          {isInCall ? (
            <div className="space-y-3 bg-amber-50/50 p-4 rounded-xl border border-amber-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  発信者からの発話内容
                </span>
                <span className="text-[10px] text-slate-400">音声認識中</span>
              </div>
              <textarea
                rows={3}
                value={callerMessage}
                onChange={(e) => setCallerMessage(e.target.value)}
                placeholder="お客様の話している言葉を入力..."
                className="w-full p-2.5 text-xs bg-white border border-amber-200 rounded-lg focus:outline-none focus:border-amber-500"
              />
              <div className="flex items-center gap-2">
                <button
                  id="phone-speak-btn"
                  onClick={handleSendQueryToAi}
                  disabled={isLoading || !callerMessage.trim()}
                  className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      AIが回答を生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                      AIが電話口で応答する
                    </>
                  )}
                </button>
                <button
                  id="phone-hangup-btn"
                  onClick={handleEndCall}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1"
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                  通話を切る
                </button>
              </div>
            </div>
          ) : (
            <button
              id="phone-start-call-btn"
              onClick={() => handleStartCall()}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              電話着信をシミュレーション開始
            </button>
          )}

          {/* AI Response Display Area */}
          {activeCallLog && (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-emerald-600 animate-bounce' : 'text-slate-400'}`} />
                  AI自動応答（受話器からの読み上げ音声）
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  {activeCallLog.detectedIntent}
                </span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed bg-white p-3 rounded-lg border border-emerald-100 font-medium">
                「{activeCallLog.replyText}」
              </p>

              <div className="text-[11px] bg-white p-2.5 rounded-lg border border-emerald-100 text-slate-700 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">緊急度判定:</span>
                  <span className={`font-bold ${
                    activeCallLog.urgency?.includes('高') ? 'text-red-600' :
                    activeCallLog.urgency?.includes('中') ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {activeCallLog.urgency}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">スタッフのアクション:</span>{' '}
                  <strong className="text-slate-900">{activeCallLog.actionForStaff}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (2 columns): Past Phone Inquiry Logs & Order Conversion */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">受電履歴 & ナレッジ連携ログ</h3>
              <p className="text-xs text-slate-500">電話AIが受け付けた全通話のテキスト化と要約</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-full">
              累計: {phoneLogs.length} 件
            </span>
          </div>

          <div className="space-y-3">
            {phoneLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/60 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{log.callerName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{log.callerPhone}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                      {log.language === 'en' ? 'EN' : 'JA'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      log.urgency.includes('高') ? 'bg-red-100 text-red-800' :
                      log.urgency.includes('中') ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {log.urgency}
                    </span>
                    <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-700">
                  <span className="font-semibold text-slate-500">用件:</span> {log.spokenSummary}
                </div>

                <div className="text-[11px] bg-white p-2.5 rounded-lg border border-slate-200/70 text-slate-600">
                  <div className="font-bold text-emerald-800 mb-0.5">AI応答内容:</div>
                  <div className="line-clamp-2">{log.aiReplyText}</div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-slate-500">
                    次アクション: <strong className="text-slate-800">{log.staffAction}</strong>
                  </span>
                  {log.intent.includes('発注') || log.intent.includes('取引') ? (
                    <button
                      id={`phone-convert-order-${log.id}`}
                      onClick={() => onConvertLogToOrder(log)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-[11px] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      受注チケットに変換
                    </button>
                  ) : (
                    <span className="text-slate-400 text-[10px]">FAQ自動完結</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
