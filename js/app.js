import { CameraManager } from './components/CameraManager.js';
import { PhotoCapture } from './components/PhotoCapture.js';
import { VideoRecorder } from './components/VideoRecorder.js';

/**
 * メインアプリケーションクラス
 */
class SilentCamApp {
    constructor() {
        // DOM要素の取得
        this.videoElement = document.getElementById('video');
        this.canvasElement = document.getElementById('canvas');
        this.prepareButton = document.getElementById('prepare');
        this.captureButton = document.getElementById('captureButton');
        this.photoModeRadio = document.getElementById('photoMode');
        this.videoModeRadio = document.getElementById('videoMode');
        this.controlsDiv = document.querySelector('.controls');

        // コンポーネントの初期化
        this.cameraManager = new CameraManager(this.videoElement);
        this.photoCapture = new PhotoCapture(this.videoElement, this.canvasElement);
        this.videoRecorder = new VideoRecorder(null);

        // 状態管理
        this.isCameraReady = false;
        this.currentMode = 'photo'; // 'photo' または 'video'

        // イベントリスナーの設定
        this.setupEventListeners();
    }

    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        // カメラ初期化ボタン
        this.prepareButton.addEventListener('click', () => this.initializeCamera());

        // キャプチャボタン
        this.captureButton.addEventListener('click', () => this.handleCapture());

        // モード選択
        this.photoModeRadio.addEventListener('change', () => this.switchMode('photo'));
        this.videoModeRadio.addEventListener('change', () => this.switchMode('video'));
    }

    /**
     * カメラを初期化
     */
    async initializeCamera() {
        try {
            this.prepareButton.disabled = true;
            this.prepareButton.textContent = '初期化中...';

            // 動画モードの場合は音声も含める
            const includeAudio = this.videoModeRadio.checked;

            // カメラストリームを取得
            const stream = await this.cameraManager.getRearCameraStream(includeAudio);

            // ビデオ再生
            await this.cameraManager.playVideo(stream);

            // VideoRecorderを初期化
            this.videoRecorder.initialize(stream);

            // UI更新
            this.isCameraReady = true;
            this.prepareButton.style.display = 'none';
            this.controlsDiv.classList.remove('hidden');

            console.log('カメラの初期化が完了しました');
            console.log(`音声トラック: ${this.cameraManager.hasAudioTrack() ? '有効' : '無効'}`);
            console.log(`ビデオトラック: ${this.cameraManager.hasVideoTrack() ? '有効' : '無効'}`);
        } catch (error) {
            console.error('カメラ初期化エラー:', error);
            alert(`カメラの初期化に失敗しました: ${error.message}`);
            this.prepareButton.disabled = false;
            this.prepareButton.textContent = '最初にクリック';
        }
    }

    /**
     * キャプチャを実行
     */
    handleCapture() {
        if (!this.isCameraReady) {
            alert('カメラが初期化されていません');
            return;
        }

        try {
            if (this.currentMode === 'photo') {
                this.capturePhoto();
            } else if (this.currentMode === 'video') {
                this.toggleVideoRecording();
            }
        } catch (error) {
            console.error('キャプチャエラー:', error);
            alert(`キャプチャに失敗しました: ${error.message}`);
        }
    }

    /**
     * 静止画をキャプチャ
     */
    capturePhoto() {
        this.photoCapture.capture();
        console.log('写真をキャプチャしました');
    }

    /**
     * 動画録画を切り替え
     */
    toggleVideoRecording() {
        const isRecording = this.videoRecorder.getRecordingState();

        if (!isRecording) {
            // 録画開始
            this.videoRecorder.start();
            this.captureButton.textContent = '停止';
            this.captureButton.classList.add('recording');
            this.disableModeSelection(true);
            console.log('録画を開始しました');
        } else {
            // 録画停止
            this.videoRecorder.stop();
            this.captureButton.textContent = '撮影';
            this.captureButton.classList.remove('recording');
            this.disableModeSelection(false);
            console.log('録画を停止しました');
        }
    }

    /**
     * モードを切り替え
     * @param {string} mode - 'photo' または 'video'
     */
    async switchMode(mode) {
        if (this.currentMode === mode) return;

        console.log(`モードを切り替え: ${this.currentMode} → ${mode}`);

        // 録画中は切り替えを禁止
        if (this.videoRecorder.getRecordingState()) {
            alert('録画中はモードを切り替えられません');
            return;
        }

        this.currentMode = mode;

        // カメラが初期化済みで、音声の有効/無効が変わる場合は再初期化
        if (this.isCameraReady) {
            const needsAudio = mode === 'video';
            const hasAudio = this.cameraManager.hasAudioTrack();

            if (needsAudio && !hasAudio) {
                // 音声が必要だが無効な場合、カメラを再初期化
                await this.reinitializeCamera(true);
            }
        }

        // ボタンテキストの更新
        this.captureButton.textContent = '撮影';
        this.captureButton.classList.remove('recording');
    }

    /**
     * カメラを再初期化
     * @param {boolean} includeAudio
     */
    async reinitializeCamera(includeAudio) {
        try {
            console.log('カメラを再初期化中...');

            // 既存のストリームを停止
            this.cameraManager.stopStream();

            // 新しいストリームを取得
            const stream = await this.cameraManager.getRearCameraStream(includeAudio);

            // ビデオ再生
            await this.cameraManager.playVideo(stream);

            // VideoRecorderを再初期化
            this.videoRecorder.cleanup();
            this.videoRecorder.initialize(stream);

            console.log('カメラの再初期化が完了しました');
            console.log(`音声トラック: ${this.cameraManager.hasAudioTrack() ? '有効' : '無効'}`);
        } catch (error) {
            console.error('カメラ再初期化エラー:', error);
            alert(`カメラの再初期化に失敗しました: ${error.message}`);
        }
    }

    /**
     * モード選択を無効/有効にする
     * @param {boolean} disabled
     */
    disableModeSelection(disabled) {
        this.photoModeRadio.disabled = disabled;
        this.videoModeRadio.disabled = disabled;
    }

    /**
     * クリーンアップ
     */
    cleanup() {
        this.cameraManager.stopStream();
        this.videoRecorder.cleanup();
    }
}

// アプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
    const app = new SilentCamApp();

    // ページアンロード時のクリーンアップ
    window.addEventListener('beforeunload', () => {
        app.cleanup();
    });

    console.log('SilentCam アプリケーションが起動しました');
});
