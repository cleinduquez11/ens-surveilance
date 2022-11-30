import { initializeApp } from 'firebase/app';
import { getStorage,uploadBytes, ref } from 'firebase/storage';


const firebaseConfig = {
    apiKey: "AIzaSyDyATZQa83BCVhFkPkNpqiCAlYU7ozLVSs",
    authDomain: "emergencynotificationsys-e45b1.firebaseapp.com",
    databaseURL: "https://emergencynotificationsys-e45b1-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "emergencynotificationsys-e45b1",
    storageBucket: "emergencynotificationsys-e45b1.appspot.com",
    messagingSenderId: "628147783877",
    appId: "1:628147783877:web:81b466ef1f914e8c5848ac"
};


export const app = initializeApp(firebaseConfig)

export const storage = getStorage(app);
const d = new Date();
export const storageRef = ref(storage, 'recordings/server/' + d + '.mp4');
export const storageRef1 = ref(storage, 'recordings/client/' + d + '.mp4');

export {uploadBytes};

const uploadButton = document.querySelector('button#upload');
const uploadButton1 = document.querySelector('button#upload1');

console.log("Recorded blobsssss: " + recordedBlobs1);


uploadButton.addEventListener('click', () => {

    const mimeType = 'video/webm';
    const superBuffers = new Blob(recordedBlobs1, {type: mimeType});
    uploadBytes(storageRef1, superBuffers).then((snapshot) => {
        console.log('Uploaded a blob or file!');
        recordedBlobs1 = [];
    });
    });


uploadButton1.addEventListener('click', () => {

const mimeType = 'video/webm';
const superBuffers = new Blob(recordedBlobs1, {type: mimeType});
uploadBytes(storageRef, superBuffers).then((snapshot) => {
    console.log('Uploaded a blob or file!');
    recordedBlobs1 = [];
});
});




//const file = 'recordings/sample.webm';

console.log('Firebase Already Set up');


