# サムネイル画像自動取得スクリプト

このスクリプトは、`data/videos.json`内の動画タイトルから自動的に関連する画像を検索し、サムネイルURLを更新します。

## クイックスタート（APIキー不要）

APIキーなしでもすぐに使用できます：

```bash
node scripts/fetch-thumbnails.js
```

APIキーが設定されていない場合、Lorem Picsumのプレースホルダー画像が使用されます。タイトルに基づいて一貫性のある画像が生成されます。

## より良い画像を取得する（Pexels API使用）

タイトルに関連した実際の写真を取得したい場合は、Pexels APIを使用できます。

### 1. Pexels APIキーの取得

1. [Pexels](https://www.pexels.com/)にアクセス
2. 右上の「Join」または「サインアップ」をクリック
3. メールアドレスでアカウントを作成（無料）
4. [API設定ページ](https://www.pexels.com/api/)にアクセス
5. 「Your API Key」セクションにAPIキーが表示されます

### 2. 環境変数の設定

APIキーを環境変数として設定します：

#### Linux/Mac:
```bash
export PEXELS_API_KEY="your_api_key_here"
```

#### Windows (コマンドプロンプト):
```cmd
set PEXELS_API_KEY=your_api_key_here
```

#### Windows (PowerShell):
```powershell
$env:PEXELS_API_KEY="your_api_key_here"
```

### 3. スクリプトの実行

```bash
node scripts/fetch-thumbnails.js
```

## 使用方法

スクリプトは以下の処理を行います：

1. `data/videos.json`を読み込み
2. 各動画のタイトルからキーワードを抽出（日本語→英語変換）
3. Pexels APIで画像を検索
4. 取得した画像URLでJSONを更新

## キーワードマッピング

以下の日本語キーワードが自動的に英語に変換されます：

- 風景 → landscape
- 夕焼け → sunset
- 街並み → cityscape
- 料理 → cooking
- ペット → pet
- 旅行 → travel
- 音楽 → music
- DIY → diy
など

## 注意事項

- Pexels APIは無料プランで月間20,000リクエストまで利用可能
- スクリプトはAPIレート制限を考慮して、各リクエスト間に500msの待機時間を設けています
- 画像が見つからない場合は、プレースホルダー画像が使用されます
