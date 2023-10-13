import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import {} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";

import {} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app-check.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";
import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";
import {} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-functions.js";
import {} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-installations.js";
import {
    getStorage,
    ref as storageRef,
    uploadBytesResumable,
    listAll,
    getDownloadURL,
    getMetadata
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-storage.js";
import {
    getDatabase,
    ref as databaseRef,
    set,
    push,
    onValue as showData,
    serverTimestamp,
    query,
    orderByChild,
    get
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";


class FirebaseConfig {
    constructor() {
        const firebaseConfig = {
            apiKey: "AIzaSyAww_-fNOIQIm5jdCand0L_RNmXn55G-TU",
            authDomain: "newproject-1c2fd.firebaseapp.com",
            databaseURL: "https://newproject-1c2fd-default-rtdb.firebaseio.com",
            projectId: "newproject-1c2fd",
            storageBucket: "newproject-1c2fd.appspot.com",
            messagingSenderId: "954909544202",
            appId: "1:954909544202:web:41b9691b49ee0437fc34f3"
        };

        this.app = initializeApp(firebaseConfig);
    }
}

class AuthenticationManager {
    constructor() {
        this.auth = getAuth();
        this.database = getDatabase();
        this.storage = getStorage();
    }

    async initializeApp() {
        // Inisialisasi aplikasi Firebase
        const config = new FirebaseConfig();
        config.initializeApp();
    }

    async handleAuthentication() {
        // Tampilkan modal loading
        $('#loadingModal').modal('show');

        const user = this.auth.currentUser;
        const loginButton = document.getElementById('loginbtn');

        this.auth.onAuthStateChanged(async (user) => {
            if (user) {
                if (user.emailVerified) {
                    const uid = user.uid;
                    console.log(uid);

                    const projectDataRef = databaseRef(this.database, 'projectData');
                    const dataArray = [];

                    showData(projectDataRef, (snapshot) => {
                        dataArray.length = 0;

                        snapshot.forEach((childSnapshot) => {
                            const project = childSnapshot.val();

                            if (uid === project.ownerId || (project.allowedUsers && project.allowedUsers[uid])) {
                                dataArray.push({
                                    key: childSnapshot.key,
                                    data: project
                                });
                            }
                        });

                        dataArray.sort((a, b) => {
                            const timeA = a.data.uploadTime;
                            const timeB = b.data.uploadTime;
                            return timeA - timeB;
                        });

                        dataArray.forEach(async (item) => {
                            const apkName = item.data.apkName;
                            const screenshotPath = item.data.screenshotPath;
                            const projectPath = item.data.projectPath;

                            // Get a reference to the file in Firebase Storage
                            const fileRef = storageRef(storage, projectPath);

                            // Get the metadata for the file
                            const metadata = await getMetadata(fileRef);

                            // Extract the file size from the metadata
                            const fileSizeBytes = metadata.size;

                            // Convert bytes to a human-readable format (e.g., KB or MB)
                            const fileSizeFormatted = formatFileSize(fileSizeBytes);
                            $('#loadingModal').modal('hide');

                            createElementDiv("kategori2", apkName, screenshotPath, fileSizeFormatted);
                            showProjectUser(apkName, fileSizeFormatted, screenshotPath);

                        });
                    });

                    this.updateUserStatus(true);
                } else {
                    // User belum verifikasi
                    this.updateUserStatus(false);

                    console.log('belum verifikasi');

                    Swal.fire({
                        title: 'Verification',
                        html: '<div class="from"><input class="verifikasi" id="verifikasi" type="email" placeholder="enter your email"></div>',
                        showConfirmButton: true,
                        confirmButtonText: "Send Link",
                        allowOutsideClick: false,
                        customClass: {
                            title: 'swal-title',
                            popup: 'swal-popup',
                            container: 'swal-container'
                        }
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // Menggunakan timeout untuk menunggu dialog Swal ditampilkan sepenuhnya
                            setTimeout(() => {
                                const emailInput = document.getElementById('verifikasi');
                                if (emailInput) {
                                    const email = emailInput.value;

                                    // Tambahkan else di sini
                                    const auth = getAuth();
                                    const actionCodeSettings = {
                                        url: 'http://localhost:8080/verifikasi.html',
                                        // This must be true.
                                        handleCodeInApp: true,
                                    };

                                    sendSignInLinkToEmail(auth, email, actionCodeSettings)
                                    .then(() => {
                                        // Email berhasil dikirim
                                        window.localStorage.setItem(`emailSent_${email}`, true);
                                        window.localStorage.setItem('emailForSignIn', email);
                                        window.location.href = "verifikasi.html";
                                    })
                                    .catch((error) => {
                                        const errorCode = error.code;
                                        const errorMessage = error.message;
                                        // Handle errors here
                                    });

                                } else {
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Belum login',
                                        showConfirmButton: false,
                                        timer: 1500
                                    });
                                }
                            },
                                0);
                        }
                    });
                }
            }
        }
        




    const logout = document.getElementById('logout');
    logout.addEventListener('click',
        () => {
            this.logout();
        });

    // Tambahkan event listener untuk form login
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit',
        async (e) => {
            e.preventDefault();
            // Tangani login form seperti sebelumnya
        });

    // Tambahkan event listener untuk tombol login
    const loginBtn = document.getElementById('loginbtn');
    loginBtn.addEventListener('click',
        () => {
            // Tangani tombol login seperti sebelumnya
        });

    // Tambahkan event listener untuk form registrasi
    const registrationForm = document.getElementById('registerForm');
    registrationForm.addEventListener('submit',
        async (e) => {
            e.preventDefault();
            // Tangani registrasi form seperti sebelumnya
        });




    updateUserStatus(isLoggedIn) {
        const loginButton = document.getElementById('loginbtn');
        if (isLoggedIn) {
            // User sudah login
            loginButton.classList.remove('fa-user');
            loginButton.classList.add('fa-sign-out');
            loginButton.addEventListener('click', () => {
                this.logout();
            });
        } else {
            // User belum login
            loginButton.classList.remove('fa-sign-out');
            loginButton.classList.add('fa-user');
            loginButton.addEventListener('click', () => {
                // Tambahkan tindakan untuk menampilkan dialog login
            });
        }

        // Sembunyikan modal loading
        $('#loadingModal').modal('hide');
    }
    async logout() {
        try {
            await signOut(this.auth);
        } catch (error) {
            // Handle error
            throw error;
        }
    }

    // Metode untuk memeriksa status otentikasi
    onAuthStateChanged(callback) {
        return onAuthStateChanged(this.auth, callback);
    }




    async createElementDiv(category, apkName, Path, sizeApk) {
        const fileElement = document.createElement('div');
        fileElement.classList.add('col');
        fileElement.classList.add('m-2');
        fileElement.setAttribute('data-aos', 'fade-up');

        const element = document.createElement('div');
        element.classList.add('bg-img');
        element.classList.add('border');

        const img = document.createElement('img');
        img.setAttribute('alt', apkName);
        img.classList.add('app-image');
        img.classList.add('shadow-sm');
        img.classList.add('rounded');

        // Mengambil URL gambar dari Firebase Storage
        const storage = getStorage();
        const imageRef = storageRef(storage, Path);

        try {
            const url = await getDownloadURL(imageRef);
            img.src = url;
        } catch (error) {
            console.error('Error getting download URL:', error);
        }

        // ...
        // Anda dapat menambahkan kode lain yang berhubungan dengan elemen HTML di sini
        // ...

        const gridContainer = document.querySelector('.dataRow');
        gridContainer.appendChild(fileElement);

        fileElement.addEventListener('click', () => {
            const storage = getStorage();
            const imageRef = storageRef(storage, Path);
            getDownloadURL(imageRef)
            .then((url) => {
                this.playData(apkName, "hahahah", sizeApk, url);
            })
            .catch((error) => {
                console.error('Error getting download URL:', error);
            });
        });
    }

    playData(name, des, size, img) {
        $('#exampleModalTogglePlay').modal('show');
        const apkname = document.getElementById('play-nameApk');
        const desc = document.getElementById('play-des');
        const sizeApk = document.getElementById('play-size');
        const playImg = document.getElementById('play-sc');

        apkname.innerHTML = name;
        desc.innerHTML = des;
        sizeApk.innerHTML = size;
        playImg.src = img;
    }

    async saveDataToRealtime(name, file, screenshot, projectPath, screenshotPath, category) {
        try {
            const user = this.auth.currentUser;
            if (name && file && screenshot && projectPath && screenshotPath && category) {
                const projectInfo = {
                    name: name,
                    apkName: file,
                    screenshotName: screenshot,
                    projectPath: projectPath,
                    screenshotPath: screenshotPath,
                    uploadTime: serverTimestamp(),
                    ownerId: user.uid,
                    category: category,
                    allowedUsers: null
                };

                // Menambahkan objek `projectInfo` ke Firebase Realtime Database
                await push(databaseRef(this.database, 'projectData'), projectInfo);
                console.log('Data proyek berhasil disimpan di Firebase Realtime Database');
            } else {
                console.log("gagal");
            }
        } catch (error) {
            console.error('Error saat menyimpan data proyek di Firebase Realtime Database:', error);
            throw error;
        }
    }


        /*Bostrap modal*/
        const uploadButton = document.getElementById('upload');
        uploadButton.addEventListener('click', uploadFile);

        async function uploadFile() {
            const fileInput = document.getElementById('fileInput');
            const screenshotInput = document.getElementById('screenshotInput');
            const file = fileInput.files[0];
            const screenshot = screenshotInput.files[0];
            const user = auth.currentUser;

            if (user && file && screenshot) {
                // Menampilkan pratinjau gambar dan file setelah pengguna memilih kategori
                const reader = new FileReader();
                reader.onload = (e) => {
                    // Tampilkan pratinjau gambar dalam Swal
                    Swal.fire({
                        title: 'Pratinjau Gambar dan File',
                        html: `<img style="width: 100px; height: 100px;" src="${e.target.result}" alt="Pratinjau Gambar"><br><p>Nama File: ${file.name}</p>`,
                        confirmButtonText: 'OK',
                    }).then((previewResult) => {
                        if (previewResult.isConfirmed) {
                            // Setelah pengguna menekan OK, tampilkan dialog untuk memilih kategori
                            Swal.fire({
                                title: 'Pilih Kategori',
                                input: 'select',
                                inputOptions: {
                                    'kategori1': 'UIUX',
                                    'kategori2': 'Education',
                                    'kategori3': 'Tools',
                                    'kategori4': 'Alat',
                                },
                                showCancelButton: true,
                                confirmButtonText: 'Upload',
                            }).then((categoryResult) => {
                                // Handle logika pengunggahan file di sini
                                if (categoryResult.isConfirmed) {
                                    // Lakukan pengunggahan file Anda di sini
                                    const selectedCategory = categoryResult.value;
                                    const userId = user.uid;

                                    // Membuat struktur path berdasarkan kategori
                                    const projectPath = `${selectedCategory}/projects/${userId}/${file.name}`;
                                    const screenshotPath = `${selectedCategory}/screenshots/${userId}/${screenshot.name}`;

                                    const projectStorageRef = storageRef(storage, projectPath);
                                    const screenshotStorageRef = storageRef(storage, screenshotPath);
                                    console.log(projectStorageRef, screenshotStorageRef);

                                    // Upload file proyek
                                    const uploadProjectTask = uploadBytesResumable(projectStorageRef, file, {
                                        customMetadata: {
                                            'originalName': file.name
                                        }
                                    });

                                    // Upload gambar screenshot
                                    const uploadScreenshotTask = uploadBytesResumable(screenshotStorageRef, screenshot, {
                                        customMetadata: {
                                            'originalName': screenshot.name
                                        }
                                    });

                                    // Menampilkan Swal untuk progres
                                    Swal.fire({
                                        title: 'Uploading...',
                                        html: `
                                        <div>
                                        <div class="progress">
                                        <div id="upload-progress" class="bg-info progress-bar-striped bg-info" role="progressbar" aria-label="Info striped example" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100" style="width: 0%"></div>
                                        </div>
                                        <div id="progress-text">0%</div>
                                        </div>`,
                                        showConfirmButton: false,
                                        allowOutsideClick: false,
                                        customClass: {
                                            title: 'swal-title',
                                            popup: 'swal-popup',
                                            container: 'swal-container'
                                        }
                                    });

                                    let val = 0;

                                    // Mendengarkan perubahan progres upload proyek
                                    uploadProjectTask.on('state_changed',
                                        (snapshot) => {
                                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                            const progressElement = document.getElementById('upload-progress');

                                            // Menghitung kemajuan CSS untuk animasi gradient
                                            const gradientProgress = progress + val; // val adalah variabel yang Anda gunakan untuk memperbarui progress
                                            progressElement.style.backgroundPosition = `${gradientProgress}% 0`;

                                            // Memperbarui nilai atribut aria-valuenow dan style="width"
                                            progressElement.setAttribute('aria-valuenow', gradientProgress);
                                            progressElement.style.width = `${gradientProgress}%`;

                                            const progressTextElement = document.getElementById('progress-text');
                                            progressTextElement.textContent = gradientProgress.toFixed(2) + '%';
                                        }, (error) => {
                                            console.error('Error saat mengunggah file proyek:', error);
                                            Swal.fire({
                                                icon: 'error',
                                                title: 'Error saat mengunggah file proyek',
                                            });
                                        },
                                        () => {
                                            saveDataToRealtime("projectSaya", file.name, screenshot.name, projectPath, screenshotPath, selectedCategory);

                                            console.log('File proyek berhasil diunggah.');
                                            // Setelah proyek diunggah, lanjutkan dengan mengunggah screenshot
                                            uploadScreenshotTask.on('state_changed',
                                                (snapshot) => {
                                                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                                    const aa = Math.round(progress);
                                                    val = aa.toFixed(2) + '%'; // Handle progres screenshot (sama seperti progres proyek)
                                                },
                                                (error) => {
                                                    // Handle error saat mengunggah screenshot (sama seperti proyek)
                                                },
                                                () => {
                                                    //menyimpan data di realtime database
                                                    $('#exampleModalToggleUpload').modal('hide');


                                                    console.log('Gambar screenshot berhasil diunggah.');
                                                    Swal.fire({
                                                        icon: 'success',
                                                        title: 'Upload berhasil!',
                                                        showConfirmButton: false
                                                    });

                                                    location.reload();

                                                }
                                            );
                                        }
                                    );
                                }
                            });
                        }
                    });
                };
                reader.readAsDataURL(screenshot);
            }


            return false;
        }






        const resetPsswd = document.getElementById("resetPsswd");

        resetPsswd.addEventListener('submit', ()=> {
            const email = document.getElementById('reset').value;


            // Panggil fungsi resetPassword
            // Regular expression untuk validasi email
            const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

            // Cek apakah email valid
            const cek = regex.test(email);

            if (cek) {
                const auth = getAuth();

                sendPasswordResetEmail(auth, email)
                .then(() => {
                    // Email reset password berhasil dikirim
                    Swal.fire({
                        icon: 'success',
                        title: 'Email reset password berhasil terkirim!',
                    });
                    modal.style.display = "none";
                }).catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    // Handle errors here
                    console.error(errorCode, errorMessage);
                    console.log(errorCode + " " + errorMessage);
                });
            }

            console.log("Nilai email:", email);
            console.log("Regex cek:", cek);


        });



        var prevScrollPos = window.pageYOffset;
        var navbar = document.getElementById('navbar');


        window.addEventListener('scroll',
            function() {
                var currentScrollPos = window.pageYOffset;

                if (prevScrollPos > currentScrollPos) {
                    // Scroll ke atas
                    navbar.style.top = "0";
                } else {
                    // Scroll ke bawah
                    navbar.style.top = "-100px";
                }

                prevScrollPos = currentScrollPos;


            });
}
//AuthenticationManager And


class DatabaseManager {
    constructor() {
        this.database = getDatabase();
    }

    // Metode untuk menyimpan data ke database
    async saveData(path, data) {
        const dataRef = databaseRef(this.database, path);
        try {
            await set(dataRef, data);
        } catch (error) {
            // Handle error
            throw error;
        }
    }

    // Metode lain yang sesuai
}

class StorageManager {
    constructor() {
        this.storage = getStorage();
    }

    // Metode untuk mengunggah file
    async uploadFile(ref, file) {
        const storageRef = storageRef(this.storage, ref);
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise((resolve, reject) => {
            uploadTask.on("state_changed",
                (snapshot) => {
                    // Handle progress
                },
                (error) => {
                    // Handle error
                    reject(error);
                },
                () => {
                    // Upload berhasil
                    resolve(uploadTask.snapshot);
                }
            );
        });
    }

    // Metode lain yang sesuai
}

const authManager = new AuthenticationManager();
authManager.handleAuthentication();