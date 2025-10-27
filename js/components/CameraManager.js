/**
 * カメラストリームを管理するクラス
 */
export class CameraManager {
    constructor(videoElement) {
        this.videoElement = videoElement;
        this.stream = null;
    }

    /**
     * リアカメラのストリームを取得
     * @param {boolean} includeAudio - 音声を含めるかどうか
     * @returns {Promise<MediaStream>}
     */
    async getRearCameraStream(includeAudio = false) {
        try {
            // デバイスを列挙してリアカメラを探す
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');

            // リアカメラを見つける（'back' または最後のデバイス）
            const rearCamera = videoDevices.find(device =>
                device.label.toLowerCase().includes('back')
            ) || videoDevices[videoDevices.length - 1];

            // カメラとマイクの制約
            const constraints = {
                video: {
                    facingMode: {
                        exact: 'environment',
                    },
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                },
                audio: includeAudio, // 音声の有効/無効を制御
            };

            // ストリームを取得
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            return this.stream;
        } catch (error) {
            console.error('カメラアクセスエラー:', error);

            // environment facingModeが失敗した場合、フォールバック
            try {
                const fallbackConstraints = {
                    video: {
                        width: { ideal: 1920 },
                        height: { ideal: 1080 },
                    },
                    audio: includeAudio,
                };
                this.stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
                return this.stream;
            } catch (fallbackError) {
                throw new Error(`カメラの取得に失敗しました: ${fallbackError.message}`);
            }
        }
    }

    /**
     * ビデオ再生を開始
     * @param {MediaStream} stream
     */
    async playVideo(stream) {
        try {
            this.videoElement.srcObject = stream;
            await this.videoElement.play();
        } catch (error) {
            console.error('ビデオ再生エラー:', error);
            throw new Error(`ビデオの再生に失敗しました: ${error.message}`);
        }
    }

    /**
     * ストリームを停止
     */
    stopStream() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.videoElement.srcObject) {
            this.videoElement.srcObject = null;
        }
    }

    /**
     * 現在のストリームを取得
     * @returns {MediaStream|null}
     */
    getStream() {
        return this.stream;
    }

    /**
     * 音声トラックが有効かどうかを確認
     * @returns {boolean}
     */
    hasAudioTrack() {
        if (!this.stream) return false;
        const audioTracks = this.stream.getAudioTracks();
        return audioTracks.length > 0;
    }

    /**
     * ビデオトラックが有効かどうかを確認
     * @returns {boolean}
     */
    hasVideoTrack() {
        if (!this.stream) return false;
        const videoTracks = this.stream.getVideoTracks();
        return videoTracks.length > 0;
    }
}
