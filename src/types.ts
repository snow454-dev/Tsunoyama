export type ProductCategory = '土佐赤牛' | '土佐黒牛' | '加工品';

export type OrderStatus = 
  | '新規受付' 
  | '外部加工依頼中' 
  | '加工・梱包完了' 
  | '出荷準備中' 
  | '出荷完了' 
  | 'MF請求書発行済';

export type OrderChannel = 'LINE' | '電話AI受付' | 'Web発注フォーム' | 'メール' | 'FAX';

export interface OrderItem {
  id: string;
  productName: string;
  category: ProductCategory;
  cutType: string; // ブロック, スライス, ハンバーグ個包装, ミンチ
  quantity: number;
  unit: 'kg' | '個' | 'パック';
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerType: '飲食店' | '精肉店' | 'ホテル・旅館' | '個人・ギフト' | '卸売';
  channel: OrderChannel;
  orderDate: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  processorPartner: string; // 例: 土佐センタミート加工(株)
  processorStatus: '未依頼' | '依頼送信済' | '作業中' | '納品完了';
  processorNotes?: string;
  internalMemo?: string;
  mfInvoiceSynced: boolean; // マネーフォワード連携フラグ
  mfInvoiceNumber?: string;
  contactPerson?: string;
  phone?: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  productName: string;
  category: ProductCategory;
  cutType: string;
  currentStock: number;
  unit: 'kg' | '個';
  safetyStock: number;
  storageLocation: '自社冷凍庫' | '委託加工所冷凍保管' | '冷蔵チルド庫';
  lotNumber: string; // 枝肉・個体識別ロット
  cattleIndividualId?: string; // 個体識別番号 (10桁)
  agingDays?: number; // 熟成日数
  expirationDate: string;
  status: '潤沢' | '適正' | '要補充' | '欠品危機';
}

export interface ProcessingBatch {
  id: string;
  batchNumber: string;
  processorName: string;
  cattleId: string; // 個体識別番号 (10桁)
  breed: ProductCategory;
  carcassWeightKg: number; // 枝肉重量
  expectedYieldRate: number; // 予想歩留まり率 (%)
  actualYieldRate?: number; // 実績歩留まり率 (%)
  shippedToProcessorDate: string;
  expectedCompletionDate: string;
  actualCompletionDate?: string;
  status: '搬入待機' | '解体・脱骨中' | 'カット・真空パック' | '検品納品完了';
  targetOrders: string[]; // 紐付く受注番号
  notes: string;
}

export interface StakeholderNotification {
  id: string;
  timestamp: string;
  targetRole: '営業' | '事務' | '外部加工業者' | '経営';
  recipientName: string;
  channel: 'LINE' | 'メール' | 'FAX連携' | '社内Slack';
  title: string;
  message: string;
  orderId?: string;
  read: boolean;
}

export interface PhoneInquiryLog {
  id: string;
  timestamp: string;
  callerName: string;
  callerPhone: string;
  intent: string;
  urgency: '高（至急折返し）' | '中（本日中）' | '低（FAQ解決）';
  spokenSummary: string;
  aiReplyText: string;
  staffAction: string;
  convertedToOrder?: boolean;
  language: 'ja' | 'en';
}

export interface SystemComparisonItem {
  category: string;
  criteria: string;
  customDevelopment: {
    rating: '◎' | '◯' | '△';
    summary: string;
    details: string;
  };
  odooErp: {
    rating: '◎' | '◯' | '△';
    summary: string;
    details: string;
  };
}

export interface RoadmapPhase {
  phase: string;
  title: string;
  period: string;
  status: '完了' | '進行中' | '予定';
  objectives: string[];
  deliverables: string[];
  hayashiCommitment: string;
  tsunoyamaAction: string;
}
