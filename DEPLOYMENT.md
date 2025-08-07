# 多社展開デプロイメントガイド

## サブドメイン方式による多社展開

このアプリケーションは、サブドメインベースのマルチテナント構成に対応しています。

### 設定方法

#### 1. 新しい会社の追加

`src/utils/difyApi.ts` の `TENANT_CONFIGS` に新しい設定を追加：

```typescript
const TENANT_CONFIGS = {
  'company-name': {
    baseURL: 'https://api.dify.ai/v1',
    apiKey: 'app-YOUR_COMPANY_API_KEY_HERE',
    endpoint: '/workflows/run',
    webhookUrl: 'https://company-name.ai-business-diagnosis.vercel.app/api/webhook-simple'
  }
};
```

#### 2. DNS設定

各会社のサブドメインを設定：
- `company1.ai-business-diagnosis.vercel.app`
- `company2.ai-business-diagnosis.vercel.app`
- `demo.ai-business-diagnosis.vercel.app`

#### 3. Vercelでのドメイン設定

Vercelプロジェクトの設定で、各サブドメインを追加：
1. Vercel Dashboard → Domains
2. Add domain: `company1.ai-business-diagnosis.vercel.app`
3. 必要に応じてSSL証明書を設定

### 動作確認

各サブドメインでアクセスすると：
- 自動的に該当する会社の設定が読み込まれる
- APIキーとWebhook URLが自動切り替わる
- デバッグ情報で現在のテナントが確認できる

### 新規展開手順

1. **設定追加**: `TENANT_CONFIGS`に新しい会社設定を追加
2. **APIキー取得**: Difyで新しいワークフローのAPIキーを取得
3. **ドメイン設定**: Vercelで新しいサブドメインを追加
4. **Dify設定**: WebhookURLを `https://company-name.domain.com/api/webhook-simple` に設定
5. **テスト**: 新しいサブドメインでフォーム送信をテスト

### セキュリティ注意事項

- APIキーは絶対に公開リポジトリにコミットしない
- 本番環境では環境変数との組み合わせを検討
- 各社のデータは完全に分離される

### トラブルシューティング

- **Webhookが届かない**: ドメイン設定とDify側のWebhook URL設定を確認
- **APIエラー**: コンソールでテナント設定が正しく読み込まれているか確認
- **サブドメイン判定エラー**: `getCurrentTenant()`の戻り値をデバッグ表示で確認