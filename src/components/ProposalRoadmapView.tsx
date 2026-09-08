import React, { useState } from 'react';
import { 
  SystemComparisonItem, 
  RoadmapPhase 
} from '../types';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Layers, 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  MapPin, 
  FileText, 
  ShieldCheck, 
  Users, 
  ChevronRight,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';

interface ProposalRoadmapViewProps {
  comparisonData: SystemComparisonItem[];
  roadmapPhases: RoadmapPhase[];
}

export const ProposalRoadmapView: React.FC<ProposalRoadmapViewProps> = ({
  comparisonData,
  roadmapPhases,
}) => {
  const [activeSection, setActiveSection] = useState<'flow' | 'comparison' | 'roadmap' | 'rules'>('flow');
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const noticeTemplateText = `【お取引先様各位】津野山畜産公社 受発注窓口の一本化（公式LINE・Webフォーム導入）のお知らせ

拝啓 貴社ますますご清栄のこととお慶び申し上げます。平素は格別のご愛顧を賜り、厚く御礼申し上げます。
さて、当牧場では和牛（土佐赤牛・土佐黒牛）の飼育頭数拡大および食肉販売事業の成長に伴い、
より迅速かつ確実な納品手配を行うため、2026年10月より受発注窓口を一本化することとなりました。

つきましては、従来の電話・個別担当者メールでのご発注から、
「津野山畜産公社 公式発注LINE」または「専用Web発注フォーム」からのご発注へ移行をお願い申し上げます。

■ 移行スケジュール:
・2026年9月下旬: 新発注アカウントのご案内・テスト受付開始
・2026年10月1日: 原則として公式窓口からの受付へ一本化

■ ご発注窓口:
1. 公式LINE発注アカウント: [登録URLまたはQRコード]
2. Web発注フォーム: [専用発注URL]
※お電話での急ぎの在庫確認や給餌等のご相談は、24時間AI自動受付にて引き続き承ります。

今後とも品質の高い土佐和牛を安定してお届けできるよう努めてまいります。何卒ご理解とご協力を賜りますようお願い申し上げます。
敬具
津野山畜産公社 代表 秋澤 / 営業担当 林`;

  const handleCopyNotice = () => {
    navigator.clipboard.writeText(noticeTemplateText);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Tabs for Proposal View */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSection('flow')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeSection === 'flow'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ① 新旧業務フロー比較図 (Before / After)
          </button>
          <button
            onClick={() => setActiveSection('comparison')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeSection === 'comparison'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ② システム選定比較 (カスタム vs Odoo ERP)
          </button>
          <button
            onClick={() => setActiveSection('roadmap')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeSection === 'roadmap'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ③ 伴走支援ロードマップ (現地訪問〜自走化)
          </button>
          <button
            onClick={() => setActiveSection('rules')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeSection === 'rules'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ④ 運用ルール整備・案内文テンプレート
          </button>
        </div>
      </div>

      {/* Section 1: Before / After Flow Comparison */}
      {activeSection === 'flow' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              営業事務業務全体の整理と新旧業務フロー比較
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              少人数（営業1〜2名＋事務1名）で多品種（赤牛・黒牛・加工品）を処理する現場において、
              「ツール分散」と「窓口不統一」を解消する抜本的改善設計です。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Before Flow Card */}
              <div className="bg-red-50/50 rounded-2xl border border-red-200 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm text-red-950">現状の業務フロー（Before）</h4>
                    <span className="text-[11px] text-red-700">ツール分散・属人化・伝達漏れリスク</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-red-200/80">
                    <strong className="text-red-900 block mb-1">1. 受注窓口の乱立</strong>
                    <p className="text-slate-600 leading-relaxed">
                      電話・LINE・メールがバラバラに入り、現場作業中の営業の個人端末に溜まる。事務への転達が遅延。
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-red-200/80">
                    <strong className="text-red-900 block mb-1">2. Excel手作業での在庫・受注台帳管理</strong>
                    <p className="text-slate-600 leading-relaxed">
                      バージョン違いや誤上書きのリスク。牛舎・外出先から在庫確認できず、電話確認が頻発。
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-red-200/80">
                    <strong className="text-red-900 block mb-1">3. 外部委託加工業者とのアナログ連絡</strong>
                    <p className="text-slate-600 leading-relaxed">
                      電話やFAXでカット依頼。加工所の納品予定や現在の歩留まりがリアルタイムで把握不能。
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-red-200/80">
                    <strong className="text-red-900 block mb-1">4. マネーフォワードへの二重入力</strong>
                    <p className="text-slate-600 leading-relaxed">
                      Excelを見ながら請求書を手打ちで再作成。事務1名への月末負荷が極大化し、請求漏れが発生。
                    </p>
                  </div>
                </div>
              </div>

              {/* After Flow Card */}
              <div className="bg-emerald-50/50 rounded-2xl border border-emerald-200 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm text-emerald-950">提案する新業務フロー（After）</h4>
                    <span className="text-[11px] text-emerald-700">一元化ポータル・電話AI・MF直結</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-emerald-200/80">
                    <strong className="text-emerald-900 block mb-1">1. 窓口一本化 ＆ 電話AI一次受付</strong>
                    <p className="text-slate-600 leading-relaxed">
                      公式LINE・Webフォームに集約。電話はAIが一次受電しFAQは即答、注文要件のみ自動で起票。
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-200/80">
                    <strong className="text-emerald-900 block mb-1">2. クラウド統合データベース（スマホ対応）</strong>
                    <p className="text-slate-600 leading-relaxed">
                      牛舎・外出先から片手で在庫・納期を確認。AI注文解析でLINEの文面をワンタップ登録。
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-200/80">
                    <strong className="text-emerald-900 block mb-1">3. 外部加工指示書の自動発行・共有</strong>
                    <p className="text-slate-600 leading-relaxed">
                      枝肉重量から歩留まりを自動計算。加工所向け指示書を即時メール・LINE配信し進捗可視化。
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-200/80">
                    <strong className="text-emerald-900 block mb-1">4. マネーフォワード請求書 ワンクリック同期</strong>
                    <p className="text-slate-600 leading-relaxed">
                      手入力再転記を全廃。確定受注から直接MF用CSVを出力し、二重入力ゼロ・請求漏れゼロを達成。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Custom System vs Odoo ERP Comparison Matrix */}
      {activeSection === 'comparison' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                システム選定分析：カスタム開発 vs Odoo ERP
              </h3>
              <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                林氏推奨：フェーズ別ハイブリッド
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              林氏から提示された「カスタムシステム開発」と「Odoo導入」の選択肢を、
              津野山畜産公社の規模・予算・運用体制（営業1〜2名＋事務1名）に照らし合わせて詳細評価しました。
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-3.5 w-1/5">評価軸</th>
                  <th className="p-3.5 w-2/5 bg-emerald-50/50 text-emerald-950 border-r border-emerald-100">
                    A案: カスタム開発 (AI Studio + Claude等)
                  </th>
                  <th className="p-3.5 w-2/5 bg-slate-100/70 text-slate-900">
                    B案: Odoo (オープンソースERPパッケージ)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {comparisonData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-bold text-slate-800">
                      <div>{item.category}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{item.criteria}</div>
                    </td>
                    <td className="p-3.5 bg-emerald-50/20 border-r border-emerald-100/60">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                          {item.customDevelopment.rating}
                        </span>
                        <strong className="text-slate-900">{item.customDevelopment.summary}</strong>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {item.customDevelopment.details}
                      </p>
                    </td>
                    <td className="p-3.5 bg-slate-50/30">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                          {item.odooErp.rating}
                        </span>
                        <strong className="text-slate-900">{item.odooErp.summary}</strong>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {item.odooErp.details}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Hayashi's Recommendation Conclusion */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              林氏からの選定推奨アドバイス：
            </div>
            <p className="text-slate-700 leading-relaxed">
              <strong>「まずはカスタムモックアップ ＋ 電話対応AIのスモールスタート」を最優先で推奨します。</strong><br />
              Odooは100万社実績のある優れたERPですが、現在の津野山畜産公社様（営業1〜2名＋事務1名）にとっては機能過多で画面が重く、
              「牛舎でのスマホ片手入力」や「外部委託加工パートナーとの個別連絡」に合わせるための改修コストと学習負荷が高くなります。<br />
              最新のAIを活用した軽量な専用カスタムシステムで素早く現場の定着を図り、将来的に事業規模がさらに拡大した段階でOdoo等への移行を検討するのが最もリスクの低いアプローチです。
            </p>
          </div>
        </div>
      )}

      {/* Section 3: Implementation Roadmap */}
      {activeSection === 'roadmap' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                導入支援・社内定着 伴走ロードマップ
              </h3>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                現地訪問 ＆ リモート伴走
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              9月中旬の現地訪問からスタートし、現場担当者（秋澤氏・山崎氏）が無理なく自走できるまで段階的に伴走します。
            </p>
          </div>

          <div className="space-y-4">
            {roadmapPhases.map((phase, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors bg-slate-50/50 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-emerald-800 text-white rounded text-xs font-bold font-mono">
                      {phase.phase}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">{phase.title}</h4>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-500 flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {phase.period}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      phase.status === '進行中' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {phase.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <strong className="text-slate-700 block mb-1">主要目標（ゴール）:</strong>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      {phase.objectives.map((obj, i) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong className="text-slate-700 block mb-1">成果物（納品物）:</strong>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      {phase.deliverables.map((del, i) => (
                        <li key={i} className="text-emerald-900 font-medium">{del}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-semibold">林氏のコミットメント:</span>
                    <p className="text-slate-800">{phase.hayashiCommitment}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">津野山畜産公社様のアクション:</span>
                    <p className="text-slate-800">{phase.tsunoyamaAction}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 4: Operational Rules & Guidelines */}
      {activeSection === 'rules' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              運用ルールの整備と定着ガイドライン
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              システムを導入しても運用ルールが曖昧だと形骸化します。社内および取引先・外部加工業者との約束事を定義しました。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Rule 1 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <span className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[10px]">1</span>
                受注窓口の一本化ルール
              </div>
              <p className="text-slate-600 leading-relaxed">
                新規・既存問わず、発注は「公式LINE」または「専用Webフォーム」へ誘導。
                電話や口頭で受けた注文も、営業担当者が必ずその場でAIテキスト解析またはスマホ入力画面を通して登録し、口頭受注の放置を厳禁とします。
              </p>
            </div>

            {/* Rule 2 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <span className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[10px]">2</span>
                外部加工業者とのカット指示締め時刻
              </div>
              <p className="text-slate-600 leading-relaxed">
                翌々日納品分の加工指示は「前々営業日14:00」を確定締め切りとし、システムから指示書PDF/メールを一括送信。
                突発的な緊急発注は、加工所担当者へLINE通知した上でシステムステータスを即時「至急」へ更新します。
              </p>
            </div>

            {/* Rule 3 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <span className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[10px]">3</span>
                マネーフォワード請求締め日ルーティン
              </div>
              <p className="text-slate-600 leading-relaxed">
                毎月20日および月末に「MF請求書CSV」をワンクリック出力して取り込み。
                出荷完了ステータスのデータのみが請求対象となるため、出荷と請求の突合漏れが構造的に発生しません。
              </p>
            </div>

            {/* Rule 4 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <span className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[10px]">4</span>
                社内自走化のための週次振り返り
              </div>
              <p className="text-slate-600 leading-relaxed">
                週1回30分のオンラインミーティングにて、未処理案件・歩留まり実績・現場スタッフの操作疑問点を解消。
                マスタ更新（新商品追加、単価変更）はスタッフ自身が行えるようマニュアル化します。
              </p>
            </div>
          </div>

          {/* Template Copy Box */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-700" />
                取引先向け「受発注窓口一本化（LINE/Web発注導入）ご案内状」テンプレート
              </span>
              <button
                onClick={handleCopyNotice}
                className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                {copiedTemplate ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    コピー完了
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    文面をコピー
                  </>
                )}
              </button>
            </div>
            <pre className="text-[11px] text-slate-700 bg-white p-3 rounded-lg border border-slate-200 font-sans whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
              {noticeTemplateText}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
