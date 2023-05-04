// DOM要素の取得
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const captureButton = document.getElementById('captureButton');
const photoMode = document.getElementById('photoMode');
const videoMode = document.getElementById('videoMode');

let mediaRecorder;
let chunks = [];

// リアカメラのストリームを取得
async function getRearCameraStream() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    const rearCamera = videoDevices.find(device => device.label.toLowerCase().includes('back')) || videoDevices[videoDevices.length - 1];

    const constraints = {
        video: {
            // deviceId: rearCamera.deviceId,
            facingMode: {
                exact: 'environment',
            },
            width: 1920,
            height: 1080,
        },
        audio: true,
    };

    return await navigator.mediaDevices.getUserMedia(constraints);
}

// 静止画をキャプチャする関数
function capturePhoto() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const timestamp = new Date().toISOString();
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `photo_${timestamp}.png`;
    link.click();
}

// 動画キャプチャの開始/停止を切り替える関数
function toggleVideoCapture() {
    if (mediaRecorder.state === 'inactive') {
        mediaRecorder.start();
        captureButton.textContent = '停止';
        chunks = [];
        mediaRecorder.ondataavailable = e => chunks.push(e.data);
    } else {
        mediaRecorder.stop();
        captureButton.textContent = '撮影';
        mediaRecorder.onstop = () => {
            const timestamp = new Date().toISOString();
            const blob = new Blob(chunks, { type: 'video/webm' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `video_${timestamp}.webm`;
            link.click();
        };
    }
}

// メイン処理
function main() {
    getRearCameraStream()
        .then(stream => {
            video.srcObject = stream;
            video.play();
            mediaRecorder = new MediaRecorder(stream);
        })
        .catch(err => console.error('An error occurred: ' + err));

    captureButton.addEventListener('click', () => {
        if (photoMode.checked) {
            capturePhoto();
        } else if (videoMode.checked) {
            toggleVideoCapture();
        }
    });
}

main();
