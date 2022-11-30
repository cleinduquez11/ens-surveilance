

let peerConnection;
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



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyDyATZQa83BCVhFkPkNpqiCAlYU7ozLVSs",
//   authDomain: "emergencynotificationsys-e45b1.firebaseapp.com",
//   databaseURL: "https://emergencynotificationsys-e45b1-default-rtdb.asia-southeast1.firebasedatabase.app",
//   projectId: "emergencynotificationsys-e45b1",
//   storageBucket: "emergencynotificationsys-e45b1.appspot.com",
//   messagingSenderId: "628147783877",
//   appId: "1:628147783877:web:81b466ef1f914e8c5848ac"
// };


// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// const storage = getStorage(app);
// const storageRef = ref(storage, 'recordings');



const socket = io.connect(window.location.origin);
const video = document.querySelector("video#gum");
const recordedVideo = document.querySelector("video#recorded");
const enableAudioButton = document.querySelector("#enable-audio");
const codecPreferences = document.querySelector('#codecPreferences');


let mediaRecorder;
let recordedBlobs1;

// enableAudioButton.addEventListener("click", enableAudio)




socket.on("offer", (id, description) => {
peerConnection = new RTCPeerConnection(config);
peerConnection
.setRemoteDescription(description)
.then(() => peerConnection.createAnswer())
.then(sdp => peerConnection.setLocalDescription(sdp))
.then(() => {
    socket.emit("answer", id, peerConnection.localDescription);
});
peerConnection.ontrack = event => {
video.srcObject = event.streams[0];
video.controls =true;



};
peerConnection.onicecandidate = event => {
if (event.candidate) {
    socket.emit("candidate", id, event.candidate);
}
};
});


socket.on("candidate", (id, candidate) => {
peerConnection
.addIceCandidate(new RTCIceCandidate(candidate))
.catch(e => console.error(e));
});

socket.on("connect", () => {
socket.emit("watcher");
});

socket.on("broadcaster", () => {
socket.emit("watcher");
});

window.onunload = window.onbeforeunload = () => {
socket.close();
peerConnection.close();
};

function enableAudio() {
console.log("Enabling audio")
video.muted = false;
}


function handleDataAvailable(event) {
console.log('handleDataAvailable', event);
if (event.data && event.data.size > 0) {
recordedBlobs1.push(event.data);
}
}


const playButton = document.querySelector('button#playButton');
playButton.addEventListener('click', () => {
const mimeType = 'video/webm;codecs=vp9,opus';
const superBuffer = new Blob(recordedBlobs1, {type: mimeType});
recordedVideo.src = null;
recordedVideo.srcObject = null;
recordedVideo.src = window.URL.createObjectURL(superBuffer);
recordedVideo.controls = true;
recordedVideo.play();
});

const downloadButton = document.querySelector('button#downloadButton');
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
const uploadButton = document.querySelector('button#upload');
const recordButton = document.querySelector('button#recordButton');
recordButton.addEventListener('click', () => {
if (recordButton.textContent === 'Start Recording') {
startRecording(video.srcObject);
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
mediaRecorder = new MediaRecorder(video.srcObject, options);
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

