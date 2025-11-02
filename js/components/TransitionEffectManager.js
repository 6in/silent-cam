/**
 * トランジションエフェクト管理クラス
 * カメラプレビューに定期的にランダムなトランジションエフェクトを適用
 */
export class TransitionEffectManager {
    /**
     * @param {HTMLElement} videoContainer - エフェクトを適用するビデオコンテナ要素
     */
    constructor(videoContainer) {
        if (!videoContainer) {
            throw new Error('videoContainer要素が必要です');
        }

        this.videoContainer = videoContainer;
        this.timerId = null;
        this.isRunning = false;

        // 利用可能なエフェクト一覧
        this.effects = [
            'effect-fade',
            'effect-slide-left',
            'effect-slide-right',
            'effect-zoom-in',
            'effect-zoom-out',
            'effect-rotate',
            'effect-glitch'
        ];

        // エフェクトの継続時間（ミリ秒）
        this.effectDurations = {
            'effect-fade': 1000,
            'effect-slide-left': 1000,
            'effect-slide-right': 1000,
            'effect-zoom-in': 1000,
            'effect-zoom-out': 1000,
            'effect-rotate': 1000,
            'effect-glitch': 1200
        };

        // ランダム間隔の範囲（ミリ秒）
        this.minInterval = 20000; // 20秒
        this.maxInterval = 40000; // 40秒
    }

    /**
     * エフェクトの自動適用を開始
     */
    start() {
        if (this.isRunning) {
            console.log('TransitionEffectManager は既に実行中です');
            return;
        }

        this.isRunning = true;
        this.scheduleNextEffect();
        console.log('TransitionEffectManager を開始しました');
    }

    /**
     * エフェクトの自動適用を停止
     */
    stop() {
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }

        this.isRunning = false;
        this.removeCurrentEffect();
        console.log('TransitionEffectManager を停止しました');
    }

    /**
     * 次のエフェクトをスケジュール
     */
    scheduleNextEffect() {
        if (!this.isRunning) {
            return;
        }

        // ランダムな間隔を計算（20〜40秒）
        const interval = this.getRandomInterval();

        // タイマーを設定
        this.timerId = setTimeout(() => {
            this.applyRandomEffect();
        }, interval);

        console.log(`次のエフェクトまで: ${(interval / 1000).toFixed(1)}秒`);
    }

    /**
     * ランダムな間隔を取得（ミリ秒）
     * @returns {number} ランダムな間隔（20000〜40000ミリ秒）
     */
    getRandomInterval() {
        return Math.floor(
            Math.random() * (this.maxInterval - this.minInterval) + this.minInterval
        );
    }

    /**
     * ランダムなエフェクトを適用
     */
    applyRandomEffect() {
        // ランダムにエフェクトを選択
        const randomEffect = this.effects[Math.floor(Math.random() * this.effects.length)];

        // エフェクトを適用
        this.applyEffect(randomEffect);
    }

    /**
     * 指定されたエフェクトを適用
     * @param {string} effectName - エフェクト名（例: 'effect-fade'）
     */
    applyEffect(effectName) {
        if (!this.effects.includes(effectName)) {
            console.warn(`不明なエフェクト: ${effectName}`);
            return;
        }

        console.log(`エフェクトを適用: ${effectName}`);

        // 既存のエフェクトクラスを削除
        this.removeCurrentEffect();

        // 新しいエフェクトクラスを追加
        this.videoContainer.classList.add(effectName);

        // エフェクトの継続時間後にクラスを削除
        const duration = this.effectDurations[effectName] || 1000;
        setTimeout(() => {
            this.videoContainer.classList.remove(effectName);
        }, duration);

        // 次のエフェクトをスケジュール
        this.scheduleNextEffect();
    }

    /**
     * 現在適用中のエフェクトを削除
     */
    removeCurrentEffect() {
        this.effects.forEach(effect => {
            this.videoContainer.classList.remove(effect);
        });
    }

    /**
     * クリーンアップ
     */
    cleanup() {
        this.stop();
    }
}
