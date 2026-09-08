import React, { useState, useEffect } from 'react';
import { 
  Order, 
  InventoryItem, 
  ProcessingBatch, 
  StakeholderNotification, 
  PhoneInquiryLog,
  OrderStatus 
} from './types';
import { 
  INITIAL_ORDERS, 
  INITIAL_INVENTORY, 
  INITIAL_BATCHES, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_PHONE_LOGS, 
  SYSTEM_COMPARISON_DATA, 
  ROADMAP_PHASES 
} from './data/initialData';

import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { OrdersView } from './components/OrdersView';
import { InventoryProcessingView } from './components/InventoryProcessingView';
import { PhoneAiSimulatorView } from './components/PhoneAiSimulatorView';
import { MoneyForwardExportView } from './components/MoneyForwardExportView';
import { NotificationCenterView } from './components/NotificationCenterView';
import { ProposalRoadmapView } from './components/ProposalRoadmapView';
import { AiOrderParserModal } from './components/AiOrderParserModal';
import { MobileFieldModal } from './components/MobileFieldModal';

export default function App() {
  // State with localStorage persistence fallback
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('tsunoyama_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('tsunoyama_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [batches, setBatches] = useState<ProcessingBatch[]>(() => {
    const saved = localStorage.getItem('tsunoyama_batches');
    return saved ? JSON.parse(saved) : INITIAL_BATCHES;
  });

  const [notifications, setNotifications] = useState<StakeholderNotification[]>(() => {
    const saved = localStorage.getItem('tsunoyama_notifs');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [phoneLogs, setPhoneLogs] = useState<PhoneInquiryLog[]>(() => {
    const saved = localStorage.getItem('tsunoyama_phonelogs');
    return saved ? JSON.parse(saved) : INITIAL_PHONE_LOGS;
  });

  // UI state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [isAiParserOpen, setIsAiParserOpen] = useState<boolean>(false);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('tsunoyama_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('tsunoyama_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('tsunoyama_batches', JSON.stringify(batches));
  }, [batches]);

  useEffect(() => {
    localStorage.setItem('tsunoyama_notifs', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('tsunoyama_phonelogs', JSON.stringify(phoneLogs));
  }, [phoneLogs]);

  // Actions
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updated = { ...o, status: newStatus };
          if (newStatus === 'MF請求書発行済') {
            updated.mfInvoiceSynced = true;
            updated.mfInvoiceNumber = updated.mfInvoiceNumber || `MF-INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`;
          }
          return updated;
        }
        return o;
      })
    );

    // Auto-dispatch notification to relevant roles
    const targetOrder = orders.find((o) => o.id === orderId);
    if (targetOrder) {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const newNotif: StakeholderNotification = {
        id: `notif-${Date.now()}`,
        timestamp: `${now.toISOString().split('T')[0]} ${timeStr}`,
        targetRole: newStatus.includes('加工') ? '外部加工業者' : newStatus.includes('出荷') ? '営業' : '事務',
        recipientName: `${targetOrder.customerName} 担当`,
        channel: '社内Slack',
        title: `【ステータス更新】${targetOrder.orderNumber} -> ${newStatus}`,
        message: `${targetOrder.customerName} 様の注文ステータスが「${newStatus}」へ更新されました。`,
        orderId: targetOrder.id,
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  const handleAddNewOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);

    // Dispatch notification
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newNotif: StakeholderNotification = {
      id: `notif-${Date.now()}`,
      timestamp: `${now.toISOString().split('T')[0]} ${timeStr}`,
      targetRole: '営業',
      recipientName: '営業担当 (林・秋澤)',
      channel: 'LINE',
      title: `【新規受注】${newOrder.customerName} 様`,
      message: `${newOrder.channel}経由で受注を受領しました。合計金額: ¥${newOrder.totalAmount.toLocaleString()}。希望納期: ${newOrder.deliveryDate}。`,
      orderId: newOrder.id,
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleUpdateBatchStatus = (batchId: string, newStatus: ProcessingBatch['status']) => {
    setBatches((prev) =>
      prev.map((b) => (b.id === batchId ? { ...b, status: newStatus } : b))
    );

    const targetB = batches.find((b) => b.id === batchId);
    if (targetB) {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const newNotif: StakeholderNotification = {
        id: `notif-${Date.now()}`,
        timestamp: `${now.toISOString().split('T')[0]} ${timeStr}`,
        targetRole: '事務',
        recipientName: '事務担当 (山崎)',
        channel: '社内Slack',
        title: `【加工進捗】バッチ ${targetB.batchNumber} -> ${newStatus}`,
        message: `${targetB.processorName}にて、個体ID ${targetB.cattleId} のステータスが「${newStatus}」になりました。`,
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  const handleAddNewBatch = (batch: ProcessingBatch) => {
    setBatches((prev) => [batch, ...prev]);
  };

  const handleAddNewPhoneLog = (log: PhoneInquiryLog) => {
    setPhoneLogs((prev) => [log, ...prev]);

    // If urgent, send notification to sales
    if (log.urgency.includes('高') || log.intent.includes('発注')) {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const newNotif: StakeholderNotification = {
        id: `notif-${Date.now()}`,
        timestamp: `${now.toISOString().split('T')[0]} ${timeStr}`,
        targetRole: '営業',
        recipientName: '営業担当 (秋澤・林)',
        channel: 'LINE',
        title: `【電話AI受電急ぎ】${log.callerName} 様`,
        message: `用件: ${log.spokenSummary}。至急折り返し対応が必要です。`,
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  const handleConvertLogToOrder = (log: PhoneInquiryLog) => {
    setIsAiParserOpen(true);
  };

  const handleSyncSingleOrder = (orderId: string) => {
    handleUpdateOrderStatus(orderId, 'MF請求書発行済');
  };

  const handleSyncAllToMoneyForward = () => {
    setOrders((prev) =>
      prev.map((o) => {
        if (!o.mfInvoiceSynced) {
          return {
            ...o,
            mfInvoiceSynced: true,
            mfInvoiceNumber: `MF-INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`,
            status: 'MF請求書発行済',
          };
        }
        return o;
      })
    );
  };

  const handleSendProcessorNotice = (order: Order) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newNotif: StakeholderNotification = {
      id: `notif-${Date.now()}`,
      timestamp: `${now.toISOString().split('T')[0]} ${timeStr}`,
      targetRole: '外部加工業者',
      recipientName: `${order.processorPartner} 担当者様`,
      channel: 'メール',
      title: `【加工指示書送付】${order.customerName}様向け ${order.deliveryDate}納品分`,
      message: `${order.items.map(i => `${i.productName} (${i.quantity}${i.unit})`).join(', ')} の脱骨・パック指示書を送信しました。指示: ${order.processorNotes || '通常規格'}`,
      orderId: order.id,
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Update processor status
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, processorStatus: '作業中', status: '外部加工依頼中' } : o))
    );
    alert(`【加工指示書送信完了】${order.processorPartner} 宛てに指示書を連携し、ステータスを「作業中」に更新しました。`);
  };

  const unbilledCount = orders.filter((o) => !o.mfInvoiceSynced).length;
  const processingCount = batches.filter((b) => b.status !== '検品納品完了').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#1E293B] font-['Zen_Kaku_Gothic_New',sans-serif]">
      {/* Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        onOpenMobilePreview={() => setIsMobilePreviewOpen(true)}
        orderCount={orders.length}
        processingCount={processingCount}
        unbilledCount={unbilledCount}
        phoneLogCount={phoneLogs.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            orders={orders}
            inventory={inventory}
            batches={batches}
            notifications={notifications}
            onNavigateTab={setActiveTab}
            onOpenNewOrderModal={() => setActiveTab('orders')}
            onOpenAiParser={() => setIsAiParserOpen(true)}
            onOpenMobilePreview={() => setIsMobilePreviewOpen(true)}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersView
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onAddNewOrder={handleAddNewOrder}
            onOpenAiParser={() => setIsAiParserOpen(true)}
            onSendProcessorNotice={handleSendProcessorNotice}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryProcessingView
            inventory={inventory}
            batches={batches}
            orders={orders}
            onUpdateBatchStatus={handleUpdateBatchStatus}
            onAddNewBatch={handleAddNewBatch}
          />
        )}

        {activeTab === 'phone-ai' && (
          <PhoneAiSimulatorView
            phoneLogs={phoneLogs}
            onAddNewLog={handleAddNewPhoneLog}
            onConvertLogToOrder={handleConvertLogToOrder}
          />
        )}

        {activeTab === 'money-forward' && (
          <MoneyForwardExportView
            orders={orders}
            onSyncAllToMoneyForward={handleSyncAllToMoneyForward}
            onSyncSingleOrder={handleSyncSingleOrder}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationCenterView
            notifications={notifications}
            onMarkAllRead={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
            onSendCustomNotification={(n) => setNotifications((prev) => [n, ...prev])}
          />
        )}

        {activeTab === 'proposal' && (
          <ProposalRoadmapView
            comparisonData={SYSTEM_COMPARISON_DATA}
            roadmapPhases={ROADMAP_PHASES}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">津野山畜産公社 DX伴走支援プロジェクト</span>
            <span>高知県津野町・和牛約500頭飼育（土佐赤牛 / 土佐黒牛）</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>提案担当: 林 氏</span>
            <span>代表: 秋澤 氏</span>
            <span>9月中旬現地訪問 〜 伴走支援フェーズ</span>
          </div>
        </div>
      </footer>

      {/* AI Order Parser Modal */}
      <AiOrderParserModal
        isOpen={isAiParserOpen}
        onClose={() => setIsAiParserOpen(false)}
        onOrderParsedAndAdded={handleAddNewOrder}
      />

      {/* Mobile Field Phone Simulator Modal */}
      <MobileFieldModal
        isOpen={isMobilePreviewOpen}
        onClose={() => setIsMobilePreviewOpen(false)}
        orders={orders}
        inventory={inventory}
        onOpenAiParser={() => setIsAiParserOpen(true)}
      />
    </div>
  );
}
