/**
 * 動画リストコンポーネント
 * JSONデータから動画リストを生成して表示
 */
export class VideoList {
    constructor(containerElement) {
        this.container = containerElement;
        this.videos = [];
    }

    /**
     * JSONファイルから動画データを読み込み
     * @param {string} jsonPath - JSONファイルのパス
     */
    async loadVideos(jsonPath) {
        try {
            const response = await fetch(jsonPath);
            if (!response.ok) {
                throw new Error(`Failed to load videos: ${response.status}`);
            }
            const data = await response.json();
            this.videos = data.videos || [];
            console.log(`${this.videos.length}件の動画データを読み込みました`);
        } catch (error) {
            console.error('動画データの読み込みエラー:', error);
            this.videos = [];
        }
    }

    /**
     * 動画リストをレンダリング
     */
    render() {
        if (!this.container) {
            console.error('コンテナ要素が見つかりません');
            return;
        }

        // コンテナをクリア
        this.container.innerHTML = '';

        if (this.videos.length === 0) {
            this.container.innerHTML = '<p style="text-align: center; color: #aaa; padding: 2rem;">動画がありません</p>';
            return;
        }

        // 各動画アイテムを生成
        this.videos.forEach(video => {
            const videoItem = this.createVideoItem(video);
            this.container.appendChild(videoItem);
        });

        console.log('動画リストのレンダリングが完了しました');
    }

    /**
     * 動画アイテム要素を作成
     * @param {Object} video - 動画データ
     * @returns {HTMLElement}
     */
    createVideoItem(video) {
        const item = document.createElement('div');
        item.className = 'video-item';
        item.dataset.videoId = video.id;

        // サムネイル
        const thumbnail = document.createElement('div');
        thumbnail.className = 'video-thumbnail';

        const img = document.createElement('img');
        img.src = video.thumbnail;
        img.alt = video.title;
        img.loading = 'lazy';

        const duration = document.createElement('div');
        duration.className = 'video-duration';
        duration.textContent = video.duration;

        thumbnail.appendChild(img);
        thumbnail.appendChild(duration);

        // 動画情報
        const info = document.createElement('div');
        info.className = 'video-info';

        const title = document.createElement('div');
        title.className = 'video-title';
        title.textContent = video.title;

        const meta = document.createElement('div');
        meta.className = 'video-meta';
        meta.textContent = video.views;

        info.appendChild(title);
        info.appendChild(meta);

        // アイテムに追加
        item.appendChild(thumbnail);
        item.appendChild(info);

        // クリックイベント（オプション）
        item.addEventListener('click', () => {
            this.onVideoClick(video);
        });

        return item;
    }

    /**
     * 動画クリック時のハンドラ
     * @param {Object} video - クリックされた動画データ
     */
    onVideoClick(video) {
        console.log('動画がクリックされました:', video.title);
        // 必要に応じて、ここで動画再生などの処理を実装
    }

    /**
     * 動画データを追加
     * @param {Object} video - 追加する動画データ
     */
    addVideo(video) {
        this.videos.push(video);
        this.render();
    }

    /**
     * 動画データをクリア
     */
    clear() {
        this.videos = [];
        this.render();
    }

    /**
     * 動画データを取得
     * @returns {Array}
     */
    getVideos() {
        return this.videos;
    }
}
