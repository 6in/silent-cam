/**
 * ファイルをダウンロードするユーティリティ関数
 * @param {Blob} blob - ダウンロードするBlobオブジェクト
 * @param {string} filename - 保存するファイル名
 */
export function downloadFile(blob, filename) {
    try {
        // BlobからURLを生成
        const url = URL.createObjectURL(blob);

        // ダウンロード用のリンク要素を作成
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;

        // リンクをクリック（ダウンロード開始）
        document.body.appendChild(link);
        link.click();

        // クリーンアップ
        document.body.removeChild(link);

        // URLを解放（メモリリーク防止）
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 100);

        console.log(`ファイルをダウンロードしました: ${filename}`);
    } catch (error) {
        console.error('ダウンロードエラー:', error);
        throw new Error(`ファイルのダウンロードに失敗しました: ${error.message}`);
    }
}

/**
 * タイムスタンプ付きファイル名を生成
 * @param {string} prefix - ファイル名のプレフィックス
 * @param {string} extension - ファイル拡張子
 * @returns {string}
 */
export function generateTimestampedFilename(prefix, extension) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${prefix}_${timestamp}.${extension}`;
}

/**
 * ファイルサイズを人間が読みやすい形式に変換
 * @param {number} bytes - バイト数
 * @returns {string}
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
