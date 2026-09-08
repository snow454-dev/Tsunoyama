/**
 * Fallback parser and responder for static hosting (GitHub Pages)
 * where a custom Node.js Express server is not running.
 */

export function clientFallbackOrderParser(text: string, channel: string = 'LINE') {
  const isAkaushi = text.includes('赤牛') || text.includes('あかうし') || text.includes('赤身');
  const isHamburg = text.includes('ハンバーグ') || text.includes('バーグ');
  const isSirloin = text.includes('サーロイン') || text.includes('ロース');
  const isFilet = text.includes('ヒレ') || text.includes('フィレ');

  const today = new Date();
  const nextDelivery = new Date(today);
  nextDelivery.setDate(today.getDate() + 4);

  const items = [];
  let total = 0;

  if (isHamburg) {
    items.push({
      productName: '土佐赤牛100% プレミアム生ハンバーグ',
      category: '加工品',
      cutType: '個包装冷凍パック (150g)',
      quantity: 20,
      unit: '個',
      estimatedUnitPrice: 680,
      subtotal: 13600,
    });
    total += 13600;
  }

  if (isFilet) {
    items.push({
      productName: '土佐赤牛 ヒレブロック',
      category: '土佐赤牛',
      cutType: '真空ブロック (チルド)',
      quantity: 3,
      unit: 'kg',
      estimatedUnitPrice: 18000,
      subtotal: 54000,
    });
    total += 54000;
  }

  if (isSirloin || (!isHamburg && !isFilet)) {
    const unitPrice = isAkaushi ? 14500 : 13000;
    const qty = 5;
    items.push({
      productName: isAkaushi ? '土佐赤牛 サーロインブロック' : '土佐黒牛 リブロース',
      category: isAkaushi ? '土佐赤牛' : '土佐黒牛',
      cutType: '真空ブロック (チルド/冷凍指定)',
      quantity: qty,
      unit: 'kg',
      estimatedUnitPrice: unitPrice,
      subtotal: unitPrice * qty,
    });
    total += unitPrice * qty;
  }

  // Extract customer name pattern or default
  const extractedName = text.match(/(料亭|レストラン|ホテル|ビストロ|株式会社|有限会社|焼肉|庵|亭)[^\s、。]{1,15}/)?.[0] || '料亭 土佐の宴';

  return {
    customerName: extractedName,
    channel,
    deliveryDate: nextDelivery.toISOString().split('T')[0],
    deliveryTimeSlot: '午前中（ヤマトクール便）',
    items,
    totalAmount: total,
    processorNotes: '外部加工業者宛て: 500g〜1kgブロック分割、ドリップ防止真空包装、急速冷凍保管依頼',
    internalMemo: '【GitHub Pages静的デモモード】テキストから自動構造化抽出を行いました。',
  };
}

export function clientFallbackPhoneResponse(message: string, language: 'ja' | 'en') {
  if (language === 'en') {
    return {
      replyText:
        'Thank you for calling Tsunoyama Livestock Public Corporation. We raise approximately 500 Tosa Wagyu cattle in Kochi Prefecture. For feeding inquiries and wholesale orders, our representative will contact you shortly.',
      detectedIntent: 'Inquiry on Wagyu / Export',
      urgency: '中（本日中メール・LINE連絡）',
      extractedData: {
        callerName: 'Overseas Inquirer',
        contact: '090-XXXX-XXXX',
        keyTopic: message.slice(0, 40),
      },
      actionForStaff: 'Check wholesale availability and contact in English.',
    };
  }

  if (message.includes('餌') || message.includes('飼育') || message.includes('牛')) {
    return {
      replyText:
        'お電話ありがとうございます。津野山畜産公社AI受付でございます。当牧場では四国カルストの山水と良質な牧草・厳選飼料を与え、ストレスのない環境で土佐赤牛・黒牛を約500頭育てております。詳しい飼育状況や視察のご相談は担当より折り返しご案内可能です。',
      detectedIntent: '給餌・飼育への問い合わせ',
      urgency: '低（FAQ自動解決）',
      extractedData: {
        callerName: 'お電話のお客様',
        contact: '発信元番号',
        keyTopic: '牛の給餌方法・飼育環境への問い合わせ',
      },
      actionForStaff: 'FAQ解決済み。折り返し不要。',
    };
  }

  if (message.includes('見学') || message.includes('牧場') || message.includes('防疫')) {
    return {
      replyText:
        'お電話ありがとうございます。津野山畜産公社でございます。牛舎および放牧地への立ち入りは、家畜伝染病予防および防疫管理のため、事前の許可および車両消毒が必要です。一般の見学ツアー受付窓口のURLをショートメッセージでお送りいたします。',
      detectedIntent: '見学・防疫ルール問い合わせ',
      urgency: '低（FAQ自動解決）',
      extractedData: {
        callerName: '見学希望のお客様',
        contact: '発信元番号',
        keyTopic: '牛舎・牧場の見学希望および防疫基準',
      },
      actionForStaff: '防疫ガイドライン案内済み。',
    };
  }

  return {
    replyText:
      'お電話ありがとうございます。津野山畜産公社AI受付でございます。ご用件を承りました。担当営業（林・秋澤）の携帯へ要約を転送いたしましたので、本日中に折り返しご連絡申し上げます。',
    detectedIntent: '新規仕入れ・取引相談',
    urgency: '高（至急折返し）',
    extractedData: {
      callerName: message.match(/(レストラン|ホテル|ビストロ|株式会社|有限会社|焼肉|店長)[^\s、。]*/)?.[0] || '仕入れご担当者様',
      contact: '090-XXXX-XXXX',
      keyTopic: message.slice(0, 45),
    },
    actionForStaff: '至急、営業担当者（林・秋澤）より折り返し連絡を実施してください。',
  };
}
