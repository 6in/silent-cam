/**
 * カメラプレビュー用の字幕を管理するクラス
 */
export class SubtitleManager {
    constructor(subtitleElement) {
        this.subtitleElement = subtitleElement;
        this.currentIndex = 0;
        this.intervalId = null;
        this.isActive = false;

        // カフェでスイーツをレビューしているセリフ
        this.subtitles = [
            'このケーキ、ふわふわで美味しい！',
            '甘さ控えめで食べやすいですね',
            'クリームがとっても滑らかです',
            'このティラミスは絶品ですよ',
            '抹茶の風味が濃厚で最高！',
            'フルーツとの相性もばっちりです',
            'このお店のパティシエさん、天才かも',
            '見た目も可愛くてインスタ映えしますね',
            'コーヒーとの相性が抜群です',
            '何度でも食べたくなる味ですね'
        ];
    }

    /**
     * 字幕表示を開始
     */
    start() {
        if (this.isActive) {
            return;
        }

        this.isActive = true;
        this.currentIndex = 0;

        // 最初の字幕を表示
        this.showSubtitle();

        // 5秒ごとに字幕を切り替え
        this.intervalId = setInterval(() => {
            this.showSubtitle();
        }, 5000);
    }

    /**
     * 字幕表示を停止
     */
    stop() {
        if (!this.isActive) {
            return;
        }

        this.isActive = false;

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        // 字幕を非表示
        this.hideSubtitle();
    }

    /**
     * 現在の字幕を表示
     */
    showSubtitle() {
        if (!this.subtitleElement) {
            return;
        }

        // 字幕テキストを更新
        this.subtitleElement.textContent = this.subtitles[this.currentIndex];

        // フェードイン
        this.subtitleElement.classList.remove('hidden');
        this.subtitleElement.classList.add('visible');

        // 次の字幕へ
        this.currentIndex = (this.currentIndex + 1) % this.subtitles.length;
    }

    /**
     * 字幕を非表示
     */
    hideSubtitle() {
        if (!this.subtitleElement) {
            return;
        }

        this.subtitleElement.classList.remove('visible');
        this.subtitleElement.classList.add('hidden');
    }

    /**
     * 字幕が表示中かどうか
     * @returns {boolean}
     */
    isRunning() {
        return this.isActive;
    }
}
