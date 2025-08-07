# AI Business Diagnosis Lite

AI活用診断アプリケーションのライト版です。

## 特徴

- 選択式質問：10問（Q1-Q10）
- 自由記述質問：5問（Q36-Q40）
- 職種選択とビジネス課題の入力
- Googleドライブの画像によるスキル分析表示
- Difyによる詳細な分析レポート

## デプロイ

このアプリケーションはVercelにデプロイされています：
https://ai-business-diagnosis-lite.vercel.app

## 技術スタック

- React + TypeScript
- Vite
- Tailwind CSS
- Dify API
- Vercel

## ローカル開発

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build
```

## 環境変数

Vercelのダッシュボードで以下の環境変数を設定してください（必要に応じて）：

- `REACT_APP_DIFY_API_KEY`: Dify APIキー（オプション）

## ライセンス

Private