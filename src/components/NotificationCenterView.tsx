import React, { useState } from 'react';
import { StakeholderNotification } from '../types';
import { 
  Bell, 
  Send, 
  CheckCheck, 
  MessageSquare, 
  Mail, 
  Smartphone, 
  Clock, 
  CheckCircle2, 
  Layers,
  Sparkles
} from 'lucide-react';

interface NotificationCenterViewProps {
  notifications: StakeholderNotification[];
  onMarkAllRead: () => void;
  onSendCustomNotification: (notif: StakeholderNotification) => void;
}

export const NotificationCenterView: React.FC<NotificationCenterViewProps> = ({
  notifications,
  onMarkAllRead,
  onSendCustomNotification,
}) => {
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Trigger demo notification
  const handleTriggerDemo = (type: 'order' | 'processor' | 'stock') => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (type === 'order') {
      onSendCustomNotification({
        id: `notif-${Date.now()}`,
        timestamp: `${now.toISOString().split('T')[0]} ${timeStr}`,
        targetRole: '営業',
        recipientName: '営業担当 (林・秋澤)',
        channel: 'LINE',
        title: '【新規受注】料亭 土佐の宴 様より受領',
        message: 'Web発注フォームより赤牛サーロイン10kg (145,000円) の注文を受領しました。9/12午前中納品希望。',
        read: false,
      });
    } else if (type === 'processor') {
      onSendCustomNotification({
        id: `notif-${Date.now()}`,
        timestamp: `${now.toISOString().split('T')[0]} ${timeStr}`,
        targetRole: '外部加工業者',
        recipientName: '土佐中央食肉加工 担当者様',
        channel: 'メール',
        title: '【加工指示書送信】赤牛個体 1502441923 急速冷凍指定',
        message: '最新のカット・真空包装指示書が届きました。週末婚礼用の至急ロットです。',
        read: false,
      });
    } else {
      onSendCustomNotification({
        id: `notif-${Date.now()}`,
        timestamp: `${now.toISOString().split('T')[0]} ${timeStr}`,
        targetRole: '経営',
        recipientName: '代表 (秋澤)',
        channel: 'LINE',
        title: '【在庫警告】土佐赤牛ヒレ 残5.2kg (安全水準割れ)',
        message: '赤牛ヒレの引き当て可能在庫が安全水準を下回りました。次期屠畜予定の繰り上げをご検討ください。',
        read: false,
      });
    }
  };

  const filtered = notifications.filter((n) => {
    if (roleFilter !== 'all' && n.targetRole !== roleFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Context Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                関係者リアルタイム通知センター（営業・事務・外部加工業者）
              </h2>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                リアルタイム情報共有
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              外出先の営業担当（LINE）、事務所の事務スタッフ（Slack/メール）、外部の委託加工所（メール/FAX連携）へ、
              受注や加工完了のステータス変化を自動通知。電話での催促や伝達漏れを根絶します。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleTriggerDemo('order')}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors"
            >
              + 受注時通知テスト
            </button>
            <button
              onClick={() => handleTriggerDemo('processor')}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-xs font-semibold transition-colors"
            >
              + 加工指示通知テスト
            </button>
            <button
              onClick={onMarkAllRead}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              全件既読にする
            </button>
          </div>
        </div>

        {/* Channels Explanation */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold mb-1">
              <Smartphone className="w-3.5 h-3.5" />
              営業担当（外出・牛舎）
            </div>
            <p className="text-[11px] text-slate-600">LINE公式Botで新規注文・問い合わせを即時受信</p>
          </div>
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
            <div className="flex items-center gap-1.5 text-indigo-800 font-bold mb-1">
              <Layers className="w-3.5 h-3.5" />
              事務担当（オフィス）
            </div>
            <p className="text-[11px] text-slate-600">Slack / 画面上で加工完了・発送・請求書発行を検知</p>
          </div>
          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-1.5 text-blue-800 font-bold mb-1">
              <Mail className="w-3.5 h-3.5" />
              外部委託加工業者
            </div>
            <p className="text-[11px] text-slate-600">指示書PDFを自動添付したメール・FAX連携で伝達</p>
          </div>
          <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
            <div className="flex items-center gap-1.5 text-amber-800 font-bold mb-1">
              <Bell className="w-3.5 h-3.5" />
              経営（代表・役員）
            </div>
            <p className="text-[11px] text-slate-600">日次売上サマリーおよび重要在庫欠品警告を受信</p>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {['all', '営業', '事務', '外部加工業者', '経営'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  roleFilter === r
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {r === 'all' ? '全員向けログ' : r}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-400">配信ログ: {filtered.length} 件</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-4 ${
                !notif.read ? 'bg-emerald-50/20' : ''
              }`}
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    notif.targetRole === '営業' ? 'bg-emerald-100 text-emerald-800' :
                    notif.targetRole === '外部加工業者' ? 'bg-blue-100 text-blue-800' :
                    notif.targetRole === '事務' ? 'bg-indigo-100 text-indigo-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {notif.targetRole}宛 ({notif.channel})
                  </span>
                  <span className="text-xs font-bold text-slate-900">{notif.title}</span>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                <div className="text-[10px] text-slate-400">{notif.recipientName}</div>
              </div>
              <div className="text-right text-[11px] text-slate-400 shrink-0">
                <Clock className="w-3.5 h-3.5 inline mr-1 text-slate-300" />
                {notif.timestamp}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
