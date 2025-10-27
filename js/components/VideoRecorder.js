import { downloadFile } from '../utils/download.js';

/**
 * 動画録画を管理するクラス
 */
export class VideoRecorder {
    constructor(stream) {
        this.stream = stream;
        this.mediaRecorder = null;
        this.chunks = [];
        this.isRecording = false;
    }

    /**
     * MediaRecorderを初期化
     * @param {MediaStream} stream
     */
    initialize(stream) {
        this.stream = stream;
        try {
            // 対応しているMIMEタイプを確認
            const mimeType = this.getSupportedMimeType();

            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: mimeType,
                videoBitsPerSecond: 2500000, // 2.5 Mbps
            });

            this.setupEventHandlers();
        } catch (error) {
            console.error('MediaRecorder初期化エラー:', error);
            throw new Error(`録画の初期化に失敗しました: ${error.message}`);
        }
    }

    /**
     * サポートされているMIMEタイプを取得
     * @returns {string}
     */
    getSupportedMimeType() {
        const types = [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm;codecs=h264,opus',
            'video/webm',
            'video/mp4',
        ];

        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                console.log(`使用するMIMEタイプ: ${type}`);
                return type;
            }
        }

        // フォールバック
        return '';
    }

    /**
     * イベントハンドラーを設定
     */
    setupEventHandlers() {
        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
                this.chunks.push(event.data);
            }
        };

        this.mediaRecorder.onstop = () => {
            this.handleRecordingStop();
        };

        this.mediaRecorder.onerror = (error) => {
            console.error('MediaRecorderエラー:', error);
            this.isRecording = false;
        };
    }

    /**
     * 録画を開始
     */
    start() {
        if (!this.mediaRecorder) {
            throw new Error('MediaRecorderが初期化されていません');
        }

        if (this.isRecording) {
            console.warn('すでに録画中です');
            return;
        }

        try {
            this.chunks = [];
            this.mediaRecorder.start(100); // 100msごとにデータを取得
            this.isRecording = true;
            console.log('録画を開始しました');
        } catch (error) {
            console.error('録画開始エラー:', error);
            throw new Error(`録画の開始に失敗しました: ${error.message}`);
        }
    }

    /**
     * 録画を停止
     */
    stop() {
        if (!this.mediaRecorder || !this.isRecording) {
            console.warn('録画中ではありません');
            return;
        }

        try {
            this.mediaRecorder.stop();
            this.isRecording = false;
            console.log('録画を停止しました');
        } catch (error) {
            console.error('録画停止エラー:', error);
            throw new Error(`録画の停止に失敗しました: ${error.message}`);
        }
    }

    /**
     * 録画停止時の処理
     */
    handleRecordingStop() {
        if (this.chunks.length === 0) {
            console.warn('録画データがありません');
            return;
        }

        // MIMEタイプを取得
        const mimeType = this.mediaRecorder.mimeType || 'video/webm';

        // Blobを作成
        const blob = new Blob(this.chunks, { type: mimeType });

        // ファイル拡張子を決定
        const extension = this.getFileExtension(mimeType);

        // タイムスタンプ付きでダウンロード
        const timestamp = new Date().toISOString();
        downloadFile(blob, `video_${timestamp}.${extension}`);

        // チャンクをクリア
        this.chunks = [];
    }

    /**
     * MIMEタイプから拡張子を取得
     * @param {string} mimeType
     * @returns {string}
     */
    getFileExtension(mimeType) {
        if (mimeType.includes('webm')) {
            return 'webm';
        } else if (mimeType.includes('mp4')) {
            return 'mp4';
        }
        return 'webm'; // デフォルト
    }

    /**
     * 録画状態を取得
     * @returns {boolean}
     */
    getRecordingState() {
        return this.isRecording;
    }

    /**
     * MediaRecorderの状態を取得
     * @returns {string}
     */
    getMediaRecorderState() {
        return this.mediaRecorder ? this.mediaRecorder.state : 'inactive';
    }

    /**
     * リソースをクリーンアップ
     */
    cleanup() {
        if (this.mediaRecorder && this.isRecording) {
            this.stop();
        }
        this.chunks = [];
        this.mediaRecorder = null;
    }
}
