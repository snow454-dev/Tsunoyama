import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    aiEnabled: Boolean(process.env.GEMINI_API_KEY),
  });
});

// AI Order Parser (converts unstructured LINE/Email/memo into structured order)
app.post("/api/ai/parse-order", async (req, res) => {
  const { text, channel } = req.body;
  if (!text) {
    return res.status(400).json({ error: "テキストが入力されていません" });
  }

  const ai = getAi();
  if (!ai) {
    // Graceful fallback parser
    return res.json({
      success: true,
      parsed: fallbackOrderParser(text, channel),
      source: "fallback",
    });
  }

  try {
    const prompt = `あなたは「津野山畜産公社」（高知県の和牛牧場・食肉販売）の受発注管理AIです。
以下の顧客からの未整理の連絡テキスト（LINE/メール/電話メモ等）を解析し、JSON形式のみで出力してください。

テキスト:
"""
${text}
"""

取扱商品例:
- 土佐赤牛 サーロイン (約14,000円/kg)
- 土佐赤牛 ヒレ (約18,000円/kg)
- 土佐赤牛 ロース (約12,000円/kg)
- 土佐赤牛 モモ・赤身 (約8,500円/kg)
- 土佐赤牛 カルビ・バラ (約7,500円/kg)
- 土佐黒牛 リブロース (約13,000円/kg)
- 土佐黒牛 特上カルビ (約9,000円/kg)
- 土佐黒牛 切り落とし (約5,500円/kg)
- 自家製 土佐赤牛100%ハンバーグ (約650円/個)
- 和牛ブレンドミンチ (約3,200円/kg)

出力フォーマット（厳密に以下のJSONのみを返してください。markdownのバッククォートも不要）:
{
  "customerName": "顧客名または店舗名（不明な場合は'新規顧客'）",
  "channel": "${channel || "LINE"}",
  "deliveryDate": "YYYY-MM-DD形式（推定、不明なら直近の営業日）",
  "deliveryTimeSlot": "午前中 / 14-16時 / 18-20時 / 指定なし",
  "items": [
    {
      "productName": "商品名",
      "category": "土佐赤牛 または 土佐黒牛 または 加工品",
      "cutType": "ブロック または スライス または パック または ミンチ",
      "quantity": 10,
      "unit": "kg または 個",
      "estimatedUnitPrice": 12000,
      "subtotal": 120000
    }
  ],
  "totalAmount": 120000,
  "processorNotes": "外部加工業者への指示事項（例：脱骨後500g冷凍真空パック指定、スライス2mm等）",
  "internalMemo": "社内営業・事務向けメモ"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsedJson = JSON.parse(response.text || "{}");
    return res.json({
      success: true,
      parsed: parsedJson,
      source: "gemini-3.8-flash",
    });
  } catch (err: any) {
    console.error("Gemini parse error:", err);
    return res.json({
      success: true,
      parsed: fallbackOrderParser(text, channel),
      source: "fallback_after_error",
      error: err.message,
    });
  }
});

// AI Phone Assistant Simulator (Feeding inquiry, FAQ, Phone order, Multilingual)
app.post("/api/ai/phone-agent", async (req, res) => {
  const { message, history = [], language = "ja" } = req.body;
  if (!message) {
    return res.status(400).json({ error: "発話メッセージがありません" });
  }

  const ai = getAi();
  if (!ai) {
    return res.json({
      success: true,
      response: fallbackPhoneResponse(message, language),
      source: "fallback",
    });
  }

  try {
    const prompt = `あなたは「津野山畜産公社」（高知の和牛約500頭飼育、土佐赤牛・黒牛、食肉販売）の代表電話AI自動受付アシスタントです。
現在、営業・事務スタッフが現場・牛舎に出ており、一次受電対応をあなたが行っています。

牧場情報ナレッジ:
- 正式名称: 津野山畜産公社
- 所在地: 高知県高岡郡津野町（標高の高い四国山地の清らかな水と澄んだ空気）
- 飼育頭数: 約500頭（土佐赤牛・土佐黒牛）
- 土佐赤牛の特長: 年間出荷頭数が少なく希少な幻の和牛。赤身の旨みと程よいサシが特徴で、ヘルシーかつ濃厚な風味。
- 餌・給餌方針: 地元の稲わら、良質な牧草、厳選した飼料を牛の月齢に合わせてきめ細かく給餌。ストレスフリーな環境づくり。
- 見学・防疫ルール: 口蹄疫等の家畜伝染病予防のため、一般の突然の牛舎立ち入りは不可。事前の商談・視察予約のみ対応。
- 取引・注文: 飲食店・精肉店・ホテル等への卸売り、個人向けギフト対応。外部加工委託で高品質カット・急速冷凍パック対応。
- 言語設定: ${language === "en" ? "English (英語で応答)" : "Japanese (丁寧な日本語で応答)"}

相手の発話: "${message}"

以下のJSONフォーマットのみで出力してください（Markdown装飾なし）:
{
  "replyText": "電話音声で読み上げる丁寧で温かみのある回答（50〜150文字程度）",
  "detectedIntent": "給餌・飼育への問い合わせ / 見学希望 / 新規取引・発注相談 / 在庫確認 / その他",
  "urgency": "高（スタッフ至急折返し要） / 中（本日中メール・LINE連絡） / 低（FAQ解決済）",
  "extractedData": {
    "callerName": "推定発信者名",
    "contact": "連絡先情報（電話番号等、発話にあれば）",
    "keyTopic": "主な要件要約"
  },
  "actionForStaff": "事務・営業スタッフが次に取るべき具体的アクション"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsedJson = JSON.parse(response.text || "{}");
    return res.json({
      success: true,
      data: parsedJson,
      source: "gemini-3.8-flash",
    });
  } catch (err: any) {
    console.error("Gemini phone agent error:", err);
    return res.json({
      success: true,
      data: fallbackPhoneResponse(message, language),
      source: "fallback_after_error",
    });
  }
});

// Fallback logic if API key is not yet set
function fallbackOrderParser(text: string, channel: string = "LINE") {
  const isAkaushi = text.includes("赤牛") || text.includes("あかうし") || text.includes("赤身");
  const isHamburg = text.includes("ハンバーグ") || text.includes("バーグ");
  const isSirloin = text.includes("サーロイン") || text.includes("ロース");

  const today = new Date();
  const nextDelivery = new Date(today);
  nextDelivery.setDate(today.getDate() + 4);

  const items = [];
  let total = 0;

  if (isHamburg) {
    items.push({
      productName: "土佐赤牛100% プレミアム生ハンバーグ",
      category: "加工品",
      cutType: "個包装冷凍パック (150g)",
      quantity: 20,
      unit: "個",
      estimatedUnitPrice: 680,
      subtotal: 13600,
    });
    total += 13600;
  }

  if (isSirloin || !isHamburg) {
    items.push({
      productName: isAkaushi ? "土佐赤牛 サーロインブロック" : "土佐黒牛 リブロース",
      category: isAkaushi ? "土佐赤牛" : "土佐黒牛",
      cutType: "真空ブロック (チルド/冷凍指定)",
      quantity: 5,
      unit: "kg",
      estimatedUnitPrice: isAkaushi ? 14000 : 12500,
      subtotal: (isAkaushi ? 14000 : 12500) * 5,
    });
    total += (isAkaushi ? 14000 : 12500) * 5;
  }

  return {
    customerName: text.match(/(料亭|レストラン|ホテル|ビストロ|株式会社|有限会社|焼肉)[^\s、。]*/)?.[0] || "高知特産ダイニング 雅",
    channel: channel,
    deliveryDate: nextDelivery.toISOString().split("T")[0],
    deliveryTimeSlot: "午前中（ヤマトクール便）",
    items,
    totalAmount: total,
    processorNotes: "委託加工業者宛て: 500g〜1kgブロック分割、ドリップ防止真空包装、急速冷凍保管依頼",
    internalMemo: "LINE受付文面より自動抽出。マネーフォワード売掛金未請求枠へ連携準備。",
  };
}

function fallbackPhoneResponse(message: string, language: string) {
  if (language === "en") {
    return {
      replyText:
        "Thank you for calling Tsunoyama Livestock Public Corporation (Tsunoyama Chikusan Kosha). We raise approximately 500 Tosa Wagyu cattle in Kochi Prefecture. For feeding inquiries and wholesale orders, our team will get back to you shortly.",
      detectedIntent: "Inquiry on Wagyu / Wholesale",
      urgency: "中（本日中メール・LINE連絡）",
      extractedData: {
        callerName: "Overseas Inquirer",
        contact: "Phone incoming",
        keyTopic: message.slice(0, 40),
      },
      actionForStaff: "Check wholesale availability and reply in English or via WhatsApp/Email.",
    };
  }

  if (message.includes("餌") || message.includes("飼育") || message.includes("牛")) {
    return {
      replyText:
        "お電話ありがとうございます。津野山畜産公社AI受付でございます。当牧場では四国山地の天然水と良質な牧草・厳選飼料を与え、ストレスのない環境で土佐赤牛・黒牛を約500頭育てております。詳しい飼育状況や視察のご相談は担当より折り返しご案内可能です。",
      detectedIntent: "給餌・飼育への問い合わせ",
      urgency: "低（FAQ解決済）",
      extractedData: {
        callerName: "お電話のお客様",
        contact: "発信元番号",
        keyTopic: "牛の給餌方法・飼育環境への問い合わせ",
      },
      actionForStaff: "定型FAQのため緊急対応不要。牧場レポート送付希望の場合はLINE案内を実施。",
    };
  }

  return {
    replyText:
      "お電話ありがとうございます。津野山畜産公社の自動受付サービスです。ただいまスタッフが牛舎作業および加工調整に出ております。ご用件を承りましたので、担当の営業・事務より本日中に折り返しご連絡いたします。",
    detectedIntent: "新規取引・発注相談",
    urgency: "中（本日中メール・LINE連絡）",
    extractedData: {
      callerName: "取引先・お客様",
      contact: "発信元電話番号",
      keyTopic: message.slice(0, 50),
    },
    actionForStaff: "営業担当者（携帯へ通知送信済）へLINE通知済み。17時までに折り返し連絡を推奨。",
  };
}

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
