/**
 * カメラプレビュー用の字幕を管理するクラス
 */
export class SubtitleManager {
    constructor(subtitleElement) {
        this.subtitleElement = subtitleElement;
        this.currentIndex = 0;
        this.intervalId = null;
        this.isActive = false;

        // Café sweets review subtitles (English)
        this.subtitles = [
            'This cake is so fluffy and delicious!',
            'It\'s not too sweet and easy to eat',
            'The cream is so smooth',
            'This tiramisu is exquisite',
            'The matcha flavor is rich and amazing!',
            'It pairs perfectly with the fruit',
            'The pastry chef here might be a genius',
            'It looks so cute and Instagram-worthy',
            'It goes excellently with coffee',
            'It\'s a taste you\'ll want to enjoy again and again'
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
