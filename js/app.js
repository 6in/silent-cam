import { CameraManager } from './components/CameraManager.js';
import { PhotoCapture } from './components/PhotoCapture.js';
import { VideoRecorder } from './components/VideoRecorder.js';
import { VideoList } from './components/VideoList.js';
import { SubtitleManager } from './components/SubtitleManager.js';

/**
 * メインアプリケーションクラス
 */
class SilentCamApp {
    constructor() {
        // DOM要素の取得
        this.videoElement = document.getElementById('video');
        this.canvasElement = document.getElementById('canvas');
        this.preparePhotoButton = document.getElementById('preparePhoto');
        this.prepareVideoButton = document.getElementById('prepareVideo');
        this.playPauseButton = document.getElementById('playPauseButton');
        this.playIcon = document.getElementById('playIcon');
        this.pauseIcon = document.getElementById('pauseIcon');
        this.modeIndicator = document.getElementById('modeIndicator');
        this.initialScreen = document.getElementById('initialScreen');
        this.mainContainer = document.getElementById('mainContainer');
        this.videoListElement = document.getElementById('videoList');
        this.subtitleElement = document.getElementById('subtitle');

        // 必須要素の存在確認
        const requiredElements = {
            video: this.videoElement,
            canvas: this.canvasElement,
            preparePhoto: this.preparePhotoButton,
            prepareVideo: this.prepareVideoButton,
            playPauseButton: this.playPauseButton,
            initialScreen: this.initialScreen,
            mainContainer: this.mainContainer
        };

        for (const [name, element] of Object.entries(requiredElements)) {
            if (!element) {
                throw new Error(`必須要素が見つかりません: ${name}`);
            }
        }

        // コンポーネントの初期化
        this.cameraManager = new CameraManager(this.videoElement);
        this.photoCapture = new PhotoCapture(this.videoElement, this.canvasElement);
        this.videoRecorder = new VideoRecorder(null);
        this.videoList = new VideoList(this.videoListElement);
        this.subtitleManager = new SubtitleManager(this.subtitleElement);

        // 状態管理
        this.isCameraReady = false;
        this.currentMode = 'photo'; // 'photo' または 'video'
        this.isRecording = false;

        // イベントリスナーの設定
        this.setupEventListeners();

        // 動画リストの初期化
        this.initializeVideoList();
    }

    /**
     * 動画リストを初期化
     */
    async initializeVideoList() {
        await this.videoList.loadVideos('data/videos.json');
        this.videoList.render();
    }

    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        // 静止画モード初期化ボタン
        this.preparePhotoButton.addEventListener('click', () => this.initializeCamera('photo'));

        // 動画モード初期化ボタン
        this.prepareVideoButton.addEventListener('click', () => this.initializeCamera('video'));

        // 再生/停止ボタン
        this.playPauseButton.addEventListener('click', () => this.handlePlayPause());
    }

    /**
     * カメラを初期化
     * @param {string} mode - 'photo' または 'video'
     */
    async initializeCamera(mode) {
        try {
            // ボタンを無効化
            this.preparePhotoButton.disabled = true;
            this.prepareVideoButton.disabled = true;
            this.preparePhotoButton.textContent = '初期化中...';
            this.prepareVideoButton.textContent = '初期化中...';

            // モードを設定
            this.currentMode = mode;

            // 動画モードの場合は音声も含める
            const includeAudio = mode === 'video';

            // カメラストリームを取得
            const stream = await this.cameraManager.getRearCameraStream(includeAudio);

            // ビデオ再生
            await this.cameraManager.playVideo(stream);

            // VideoRecorderを初期化
            this.videoRecorder.initialize(stream);

            // モードに応じてUIを設定
            this.updateUIForMode();

            // UI更新：初期画面を非表示、メインコンテナを表示
            this.isCameraReady = true;
            this.initialScreen.classList.add('hidden');
            this.mainContainer.classList.remove('hidden');

            // 字幕表示を開始
            this.subtitleManager.start();

            console.log(`カメラの初期化が完了しました (${mode}モード)`);
            console.log(`音声トラック: ${this.cameraManager.hasAudioTrack() ? '有効' : '無効'}`);
            console.log(`ビデオトラック: ${this.cameraManager.hasVideoTrack() ? '有効' : '無効'}`);

            // 動画モードで音声トラックがない場合、ユーザーに通知
            if (mode === 'video' && !this.cameraManager.hasAudioTrack()) {
                alert('音声のパーミッションが取得できませんでした。\nビデオのみで初期化されています（音声なし）。\n\n音声を使用する場合は、ブラウザの設定でマイクのアクセスを許可してください。');
            }
        } catch (error) {
            console.error('カメラ初期化エラー:', error);
            alert(`カメラの初期化に失敗しました: ${error.message}`);
            this.preparePhotoButton.disabled = false;
            this.prepareVideoButton.disabled = false;
            this.preparePhotoButton.textContent = '📷 静止画モード';
            this.prepareVideoButton.textContent = '🎥 動画モード';
        }
    }

    /**
     * モードに応じてUIを更新
     */
    updateUIForMode() {
        if (this.currentMode === 'photo') {
            // 静止画モード: 停止アイコンを表示
            this.playIcon.classList.add('hidden');
            this.pauseIcon.classList.remove('hidden');
            this.modeIndicator.textContent = '📷 静止画モード';
            this.modeIndicator.classList.remove('recording-indicator');
        } else {
            // 動画モード: 再生アイコンを表示
            this.playIcon.classList.remove('hidden');
            this.pauseIcon.classList.add('hidden');
            this.modeIndicator.textContent = '🎥 動画モード';
            this.modeIndicator.classList.remove('recording-indicator');
        }
    }

    /**
     * 再生/停止ボタンのクリック処理
     */
    handlePlayPause() {
        if (!this.isCameraReady) {
            alert('カメラが初期化されていません');
            return;
        }

        try {
            if (this.currentMode === 'photo') {
                // 静止画モード: クリックで即座に静止画をキャプチャ
                this.capturePhoto();
            } else if (this.currentMode === 'video') {
                // 動画モード: 録画の開始/停止を切り替え
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
        if (!this.isRecording) {
            // 録画開始
            this.videoRecorder.start();
            this.isRecording = true;

            // UIを更新: 停止アイコンを表示
            this.playIcon.classList.add('hidden');
            this.pauseIcon.classList.remove('hidden');
            this.modeIndicator.textContent = '🔴 Live中';
            this.modeIndicator.classList.add('recording-indicator');

            console.log('録画を開始しました');
        } else {
            // 録画停止
            this.videoRecorder.stop();
            this.isRecording = false;

            // UIを更新: 再生アイコンを表示
            this.playIcon.classList.remove('hidden');
            this.pauseIcon.classList.add('hidden');
            this.modeIndicator.textContent = '🎥 動画モード';
            this.modeIndicator.classList.remove('recording-indicator');

            console.log('録画を停止しました');
        }
    }


    /**
     * クリーンアップ
     */
    cleanup() {
        this.cameraManager.stopStream();
        this.videoRecorder.cleanup();
        this.subtitleManager.stop();
    }
}

// アプリケーション起動
// DOMが完全に読み込まれていることを確認してから初期化
if (document.readyState === 'loading') {
    // まだ読み込み中の場合は、DOMContentLoadedを待つ
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // 既に読み込み完了している場合は、即座に初期化
    initApp();
}

function initApp() {
    const app = new SilentCamApp();

    // ページアンロード時のクリーンアップ
    window.addEventListener('beforeunload', () => {
        app.cleanup();
    });

    console.log('SilentCam アプリケーションが起動しました');
}
