// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage, StorageReference, uploadBytesResumable as firebaseUploadBytesResumable, getDownloadURL } from "firebase/storage";
import { resolve } from "path";
import { ref } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDjCYqoJHsZixUfo2GbroxG3e9B57ia9k8",
    authDomain: "lit-git-up.firebaseapp.com",
    projectId: "lit-git-up",
    storageBucket: "lit-git-up.firebasestorage.app",
    messagingSenderId: "855755245518",
    appId: "1:855755245518:web:baf62319f04503a32bcd9f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

export async function uploadFile(file: File, setProgress?: (progress: number) => void) {
    return new Promise((resolve, reject) => {
        try {
            const storageRef = ref(storage, file.name);
            const uploadTask =
                firebaseUploadBytesResumable(storageRef, file);
            uploadTask.on('state_changed', snapshot => {
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                if (setProgress) setProgress(progress);
                switch (snapshot.state) {
                    case 'paused': console.log('upload is paused'); break;
                    case 'running': console.log('upload is running'); break;
                }
            },
                error => {
                    console.error(error);
                    reject(error);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then(downloadUrl => {
                        resolve(downloadUrl)
                    })
                });

        } catch (error) {
            console.error(error);
            reject(error);
        }
    });
}


