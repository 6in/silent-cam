const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * タイトルから検索キーワードを抽出
 */
function extractKeywords(title) {
  // 「 - 」で分割して、より具体的な部分を取得
  const parts = title.split(' - ');

  // キーワードマッピング（日本語から英語への変換）
  const keywordMap = {
    '風景': 'landscape',
    '夕焼け': 'sunset',
    '街並み': 'cityscape',
    '東京': 'tokyo',
    '料理': 'cooking',
    'レシピ': 'recipe',
    'ペット': 'pet',
    '可愛い': 'cute',
    '癒やし': 'relaxing',
    '旅行': 'travel',
    '京都': 'kyoto',
    '観光': 'tourism',
    '音楽': 'music',
    'ギター': 'guitar',
    'DIY': 'diy',
    '棚': 'shelf',
    '朝': 'morning',
    'ルーティン': 'routine'
  };

  // タイトルからキーワードを抽出して英語に変換
  let keywords = [];
  for (const [jp, en] of Object.entries(keywordMap)) {
    if (title.includes(jp)) {
      keywords.push(en);
    }
  }

  // キーワードが見つからない場合はデフォルト
  if (keywords.length === 0) {
    keywords = ['nature'];
  }

  // 最初のキーワードを使用
  return keywords[0];
}

/**
 * プレースホルダー画像URLを生成（APIキー不要）
 */
function generatePlaceholderUrl(query, index) {
  // Lorem Picsumを使用してseedベースで一貫性のある画像を生成
  // seedを使用することで、同じクエリに対して同じ画像が返される
  const seed = query.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `https://picsum.photos/seed/${seed + index}/120/90`;
}

/**
 * Pexels APIを使用して画像を検索
 */
async function searchImageFromPexels(query, index) {
  const apiKey = process.env.PEXELS_API_KEY;

  // APIキーがない場合はプレースホルダーを使用
  if (!apiKey) {
    console.log('  ℹ️  PEXELS_API_KEY未設定のため、プレースホルダー画像を使用します');
    return generatePlaceholderUrl(query, index);
  }

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.pexels.com',
      path: `/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      headers: {
        'Authorization': apiKey
      }
    };

    https.get(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.photos && result.photos.length > 0) {
            // 小さいサイズの画像URLを取得
            resolve(result.photos[0].src.tiny);
          } else {
            // 画像が見つからない場合はプレースホルダー
            console.log('  ⚠️  画像が見つからなかったため、プレースホルダーを使用します');
            resolve(generatePlaceholderUrl(query, index));
          }
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * JSONファイルを読み込み、サムネイルURLを更新
 */
async function updateThumbnails() {
  const jsonPath = path.join(__dirname, '../data/videos.json');

  // JSONファイルを読み込む
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  console.log('サムネイル画像の検索を開始します...\n');

  // 各動画のサムネイルURLを更新
  for (let i = 0; i < data.videos.length; i++) {
    const video = data.videos[i];
    const keyword = extractKeywords(video.title);
    const oldThumbnail = video.thumbnail;

    try {
      const newThumbnail = await searchImageFromPexels(keyword, i);
      video.thumbnail = newThumbnail;

      console.log(`[${i + 1}] ${video.title}`);
      console.log(`    キーワード: ${keyword}`);
      console.log(`    旧: ${oldThumbnail}`);
      console.log(`    新: ${newThumbnail}\n`);
    } catch (error) {
      console.error(`[${i + 1}] エラー: ${error.message}`);
    }

    // APIレート制限を考慮して少し待機
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 更新されたJSONを保存
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');

  console.log('✓ サムネイルURLの更新が完了しました！');
  console.log(`✓ 更新されたファイル: ${jsonPath}`);
}

// スクリプト実行
(async () => {
  try {
    await updateThumbnails();
  } catch (error) {
    console.error('エラーが発生しました:', error.message);
    process.exit(1);
  }
})();
