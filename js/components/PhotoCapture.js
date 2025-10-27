import { downloadFile } from '../utils/download.js';

/**
 * 静止画キャプチャを管理するクラス
 */
export class PhotoCapture {
    constructor(videoElement, canvasElement) {
        this.videoElement = videoElement;
        this.canvasElement = canvasElement;
        this.ctx = canvasElement.getContext('2d');
    }

    /**
     * 静止画をキャプチャしてダウンロード
     */
    capture() {
        try {
            // キャンバスのサイズを設定
            const width = this.canvasElement.width;
            const height = this.canvasElement.height;

            // ビデオフレームをキャンバスに描画
            this.ctx.drawImage(this.videoElement, 0, 0, width, height);

            // キャンバスをPNG画像データに変換
            this.canvasElement.toBlob((blob) => {
                if (blob) {
                    const timestamp = new Date().toISOString();
                    downloadFile(blob, `photo_${timestamp}.png`);
                } else {
                    throw new Error('画像データの生成に失敗しました');
                }
            }, 'image/png');
        } catch (error) {
            console.error('写真キャプチャエラー:', error);
            throw new Error(`写真のキャプチャに失敗しました: ${error.message}`);
        }
    }

    /**
     * キャンバスをクリア
     */
    clearCanvas() {
        const width = this.canvasElement.width;
        const height = this.canvasElement.height;
        this.ctx.clearRect(0, 0, width, height);
    }

    /**
     * キャンバスサイズを設定
     * @param {number} width
     * @param {number} height
     */
    setCanvasSize(width, height) {
        this.canvasElement.width = width;
        this.canvasElement.height = height;
    }

    /**
     * プレビュー画像を取得（Base64）
     * @returns {string}
     */
    getPreviewDataURL() {
        return this.canvasElement.toDataURL('image/png');
    }
}
