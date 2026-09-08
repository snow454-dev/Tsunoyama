# 津野山畜産公社 業務改善・受発注在庫管理DXプラットフォーム

高知県で和牛（土佐赤牛・土佐黒牛）約500頭を飼育する「津野山畜産公社」向けの、受発注・在庫・外部委託加工・請求業務（マネーフォワード連携）の一元管理および電話対応AI自動化システムです。

---

## 🌐 GitHub連携・Web公開手順

### ステップ1: AI Studio から GitHub にエクスポート
1. 画面右上のメニュー（または設定メニュー）を開きます。
2. **「Export to GitHub」** を選択します。
3. リポジトリ名を入力してエクスポートを実行します（問題なく完了します）。

---

### ステップ2: Web上に公開する方法（2つの選択肢）

#### 方法A: GitHub Pages で公開（無料・数クリック）
1. 作成されたGitHubリポジトリを開き、**「Settings」>「Pages」** を開きます。
2. **「Build and deployment」>「Source」** で **「GitHub Actions」** を選択します。
3. リポジトリの画面に戻り、**「Add file」>「Create new file」** をクリックします。
4. ファイル名に `.github/workflows/deploy.yml` と入力し、以下の内容を貼り付けて「Commit changes」をクリックします：

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: ["main", "master"]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: "pages"
  cancel-in-progress: true
jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run build:client
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - id: deployment
        uses: actions/deploy-pages@v4
```

これだけで自動的にGitHub Pages上で公開されます！

#### 方法B: Vercel または Render / Cloudflare Pages（最も簡単）
1. [Vercel](https://vercel.com) または [Cloudflare Pages](https://pages.cloudflare.com) にログインします。
2. 「Import Git Repository」から作成したGitHubリポジトリを選択します。
3. Build Commandを `npm run build:client`、Output Directoryを `dist` に指定して「Deploy」をクリックすると即座に公開URLが発行されます。

> **💡 静的ホスティング（GitHub Pages）対応について:**
> 本アプリはGitHub Pages（静的ホスティング）上でも動作するよう、クライアントサイド・フォールバック機能を内蔵しています。サーバー不要で「LINE注文AI自動解析」や「代表電話AI音声自動応答」のシミュレーションをそのままお試しいただけます。

---

## 💻 ローカル環境での起動方法

```bash
# 1. 依存パッケージのインストール
npm install

# 2. 環境変数の設定（AI機能を本格実行する場合）
cp .env.example .env
# .env 内の GEMINI_API_KEY にGoogle AI StudioのAPIキーを設定

# 3. 開発サーバー起動（ポート3000でフロント & Expressサーバーが起動）
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。

---

## 🚀 ビルドコマンド

- `npm run build`: フロントエンド静的ファイルとNode.jsサーバーを同時にコンパイル
- `npm run build:client`: GitHub Pages用のフロントエンド静的アセットのみをコンパイル (`dist/`)
- `npm run start`: 本番サーバー起動 (`dist/server.cjs`)
- `npm run lint`: TypeScript型チェック

---

## 🥩 主な機能一覧

1. **営業事務ダッシュボード**: リアルタイム受注・出荷ステータス、安全在庫警告、売上集計
2. **LINE / メール注文 AI自動構造化**: 雑多な問い合わせ・発注テキストから品名・数量・単価・納期を瞬時に抽出し注文台帳へ自動登録
3. **部位別在庫 & 外部委託加工管理**: 赤牛・黒牛ごとの在庫水準、加工所（土佐中央食肉加工等）への指示書自動プレビュー
4. **マネーフォワード クラウド請求書連携**: 出荷確定データからMF用インポートCSVをワンクリック出力し、転記作業をゼロ化
5. **代表電話 AI音声自動応答システム**: 飼育・防疫ルールの24時間FAQ自動回答、商談の要約と営業担当（LINE/Slack）への即時通知
6. **社内自走化 伴走ロードマップ & 運用ルール**: 9月中旬の現地訪問から段階的な定着を支援するステップ設計
7. **牛舎・現場向けスマホ完全レスポンシブ**: スマートフォンやタブレットでの片手操作に最適化
