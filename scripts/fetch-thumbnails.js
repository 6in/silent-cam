const fs = require('fs');
const path = require('path');

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

  // 最初の2つのキーワードを使用
  return keywords.slice(0, 2).join(',');
}

/**
 * サムネイル画像URLを生成（Unsplash Source使用）
 */
function generateThumbnailUrl(title, width = 120, height = 90) {
  const keywords = extractKeywords(title);
  return `https://source.unsplash.com/${width}x${height}/?${keywords}`;
}

/**
 * JSONファイルを読み込み、サムネイルURLを更新
 */
function updateThumbnails() {
  const jsonPath = path.join(__dirname, '../data/videos.json');

  // JSONファイルを読み込む
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  console.log('サムネイル画像の検索を開始します...\n');

  // 各動画のサムネイルURLを更新
  data.videos.forEach((video, index) => {
    const newThumbnail = generateThumbnailUrl(video.title);
    const oldThumbnail = video.thumbnail;

    video.thumbnail = newThumbnail;

    console.log(`[${index + 1}] ${video.title}`);
    console.log(`    旧: ${oldThumbnail}`);
    console.log(`    新: ${newThumbnail}\n`);
  });

  // 更新されたJSONを保存
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');

  console.log('✓ サムネイルURLの更新が完了しました！');
  console.log(`✓ 更新されたファイル: ${jsonPath}`);
}

// スクリプト実行
try {
  updateThumbnails();
} catch (error) {
  console.error('エラーが発生しました:', error.message);
  process.exit(1);
}
