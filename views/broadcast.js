const peerConnections = {};
const config = {
iceServers: [
{ 
    "urls": "stun:stun.l.google.com:19302",
},
// { 
//   "urls": "turn:TURN_IP?transport=tcp",
//   "username": "TURN_USERNAME",
//   "credential": "TURN_CREDENTIALS"
// }
]
};

const socket = io.connect(window.location.origin);
const recordedVideo = document.querySelector("video#recorded");
const enableAudioButton = document.querySelector("#enable-audio");
const codecPreferences = document.querySelector('#codecPreferences');


let mediaRecorder;
let recordedBlobs1;

socket.on("answer", (id, description) => {
peerConnections[id].setRemoteDescription(description);
});

socket.on("watcher", id => {
const peerConnection = new RTCPeerConnection(config);
peerConnections[id] = peerConnection;

let stream = videoElement.srcObject;
stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

peerConnection.onicecandidate = event => {
if (event.candidate) {
    socket.emit("candidate", id, event.candidate);
}
};

peerConnection
.createOffer()
.then(sdp => peerConnection.setLocalDescription(sdp))
.then(() => {
    socket.emit("offer", id, peerConnection.localDescription);
});
});

socket.on("candidate", (id, candidate) => {
peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
});

socket.on("disconnectPeer", id => {
peerConnections[id].close();
delete peerConnections[id];
});

window.onunload = window.onbeforeunload = () => {
socket.close();
};

// Get camera and microphone
const videoElement = document.querySelector("video");
const audioSelect = document.querySelector("select#audioSource");
const videoSelect = document.querySelector("select#videoSource");

audioSelect.onchange = getStream;
videoSelect.onchange = getStream;

getStream()
.then(getDevices)
.then(gotDevices);

function getDevices() {
return navigator.mediaDevices.enumerateDevices();
}

function gotDevices(deviceInfos) {
window.deviceInfos = deviceInfos;
for (const deviceInfo of deviceInfos) {
const option = document.createElement("option");
option.value = deviceInfo.deviceId;
if (deviceInfo.kind === "audioinput") {
    option.text = deviceInfo.label || `Microphone ${audioSelect.length + 1}`;
    audioSelect.appendChild(option);
} else if (deviceInfo.kind === "videoinput") {
    option.text = deviceInfo.label || `Camera ${videoSelect.length + 1}`;
    videoSelect.appendChild(option);
}
}
}

function getStream() {
if (window.stream) {
window.stream.getTracks().forEach(track => {
    track.stop();
});
}
const audioSource = audioSelect.value;
const videoSource = videoSelect.value;
const constraints = {
audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
video: { deviceId: videoSource ? { exact: videoSource } : undefined }
};
return navigator.mediaDevices
.getUserMedia(constraints)
.then(gotStream)
.catch(handleError);
}

function gotStream(stream) {
window.stream = stream;
audioSelect.selectedIndex = [...audioSelect.options].findIndex(
option => option.text === stream.getAudioTracks()[0].label
);
videoSelect.selectedIndex = [...videoSelect.options].findIndex(
option => option.text === stream.getVideoTracks()[0].label
);
videoElement.srcObject = stream;
videoElement.controls = true;
socket.emit("broadcaster");
}

function handleError(error) {
console.error("Error: ", error);
}




function handleDataAvailable(event) {
    console.log('handleDataAvailable', event);
    if (event.data && event.data.size > 0) {
    recordedBlobs1.push(event.data);
    }
    }
    
    
    const playButton = document.querySelector('button#playButton1');
    playButton.addEventListener('click', () => {
    const mimeType = 'video/webm;codecs=vp9,opus';
    const superBuffer = new Blob(recordedBlobs1, {type: mimeType});
    recordedVideo.src = null;
    recordedVideo.srcObject = null;
    recordedVideo.src = window.URL.createObjectURL(superBuffer);
    recordedVideo.controls = true;
    recordedVideo.label = true;
    recordedVideo.play();
    });
    
    const downloadButton = document.querySelector('button#downloadButton1');
    downloadButton.addEventListener('click', () => {
    const blob = new Blob(recordedBlobs1, {type: 'video/webm'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const d = new Date();
    a.style.display = 'none';
    a.href = url;
    a.download = d;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    }, 100);
    });
    const uploadButton = document.querySelector('button#upload1');
    const recordButton = document.querySelector('button#recordButton1');
    recordButton.addEventListener('click', () => {
    if (recordButton.textContent === 'Start Recording') {
    startRecording();
    } else {
    stopRecording();
    recordButton.textContent = 'Start Recording';
    playButton.disabled = false;
    downloadButton.disabled = false;
    codecPreferences.disabled = false;
    uploadButton.disabled = false;
    
    }
    });
    
    
    
    
    function getSupportedMimeTypes() {
    const possibleTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=h264,opus',
    'video/mp4;codecs=h264,aac',
    ];
    return possibleTypes.filter(mimeType => {
    return MediaRecorder.isTypeSupported(mimeType);
    });
    }
    
    function startRecording() {
    recordedBlobs1 = [];
    const mimeType = 'video/webm;codecs=vp9,opus';
    const options = {mimeType};
    
    try {
    mediaRecorder = new MediaRecorder(videoElement.srcObject, options);
    } catch (e) {
    console.error('Exception while creating MediaRecorder:', e);
    errorMsgElement.innerHTML = `Exception while creating MediaRecorder: ${JSON.stringify(e)}`;
    return;
    }
    
    console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
    recordButton.textContent = 'Stop Recording';
    playButton.disabled = true;
    downloadButton.disabled = true;
    codecPreferences.disabled = true;
    mediaRecorder.onstop = (event) => {
    console.log('Recorder stopped: ', event);
    console.log('Recorded Blobs: ', recordedBlobs1);
    };
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start();
    console.log('MediaRecorder started', mediaRecorder);
    }
    
    function stopRecording() {
    mediaRecorder.stop();
    
    }
    
    function handleSuccess(stream) {
    recordButton.disabled = false;
    console.log('getUserMedia() got stream:', stream);
    window.stream = stream;
    
    const gumVideo = document.querySelector('video#gum');
    gumVideo.srcObject = stream;
    
    getSupportedMimeTypes().forEach(mimeType => {
    const option = document.createElement('option');
    option.value = mimeType;
    option.innerText = option.value;
    codecPreferences.appendChild(option);
    });
    codecPreferences.disabled = false;
    }
    
    async function init(constraints) {
    try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    handleSuccess(stream);
    } catch (e) {
    console.error('navigator.getUserMedia error:', e);
    errorMsgElement.innerHTML = `navigator.getUserMedia error:${e.toString()}`;
    }
    }
    
    