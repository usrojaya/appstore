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
const firebase = window.firebaseConfig;

window.onload = function() {
 $('#loadingModal').modal('show');

    $(document).ready(function() {

        const database = getDatabase(firebase);
        const storage = getStorage(firebase);
        const auth = getAuth(firebase);
        const firestore = getFirestore(firebase);

        const user = auth.currentUser;
        const loginButton = document.getElementById('loginbtn');
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                $('#loadingModal').modal('hide');
                if (user.emailVerified) {
                    const uid = user.uid;
                    console.log(uid);
                    const projectDataRef = databaseRef(database, 'projectData');

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
document.getElementById('navbar').style.display='block';
        document.getElementById('footer').style.display='block';
  
                            createElementDiv("kategori2", apkName, screenshotPath, fileSizeFormatted);
                            showProjectUser(apkName, fileSizeFormatted, screenshotPath);

                        });
                    });


                    loginButton.classList.remove('fa-user');
                    loginButton.classList.add('fa-sign-out');
                    loginButton.addEventListener('click', () => {
                        logOut();
                    });

                } else {

                    loginButton.classList.remove('fa-sign-out');
                    loginButton.classList.add('fa-user');
                    loginButton.addEventListener('click', () => {});

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
                                    $('#loadingModal').modal('hide');
                                    $('#exampleModalToggle').modal('show');

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
            } else {

                Swal.fire({
                    icon: 'error',
                    title: 'Not Signed In',
                    text: 'Sign In to Continue',
                    showConfirmButton: true,
                    showCancelButton: true, // Tidak showCancleButton, seharusnya showCancelButton
                    cancelButtonText: "Exit", // Mengganti "Back" dengan "Exit"
                    confirmButtonText: "Sign In",
                    allowOutsideClick: false,
                }).then((result) => {
                    if (result.isConfirmed) {
                        $('#loadingModal').modal('hide');
                        $('#exampleModalToggle').modal('show');
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        window.close();
                    }
                });



            }


        });

        function formatFileSize(bytes) {
            const kilobyte = 1024;
            const megabyte = kilobyte * 1024;
            if (bytes < kilobyte) {
                return bytes + ' B';
            } else if (bytes < megabyte) {
                return (bytes / kilobyte).toFixed(2) + ' KB';
            } else {
                return (bytes / megabyte).toFixed(2) + ' MB';
            }
        }



        function showProjectUser(apkName, size, path, img) {
            const showContainer = document.getElementById('showDataUser');
            const list = document.createElement('li');
            const badge = document.createElement('span');
            list.classList.add('list-group-item');
            list.classList.add('d-flex');
            list.classList.add('align-items-center');
            list.classList.add('position-relative');
            // Membuat array dengan 100 warna hex secara acak
            let randomColors = [];
            for (let i = 0; i < 100; i++) {
                let selectedColor = generateRandomRGBColor();
                randomColors.push(selectedColor);
            }

            // Memilih warna RGB secara acak dari array
            let randomIndex = Math.floor(Math.random() * randomColors.length);
            let selectedColor = randomColors[randomIndex];

            // Menggunakan warna RGB yang dipilih
            badge.style.backgroundColor = selectedColor;
            list.style.borderColor = selectedColor;
            badge.classList.add('badge');
            badge.classList.add('rounded-pill');
            badge.classList.add('position-absolute');
            badge.classList.add('top-50');
            badge.classList.add('start-100');
            badge.classList.add('translate-middle');



            showContainer.appendChild(list);
            const text = document.createTextNode(apkName);
            list.appendChild(text);
            badge.textContent = size;

            list.appendChild(badge);

            list.addEventListener('click',
                () => {

                    const storage = getStorage();
                    const imageRef = storageRef(storage,
                        path);
                    getDownloadURL(imageRef)
                    .then((url) => {
                        playData(apkName, "hahahah", size, url);
                    })
                    .catch((error) => {
                        console.error('Error getting download URL:', error);
                    });
                });

        }

        function generateRandomRGBColor() {
            let randomColor;
            do {
                let r = Math.floor(Math.random() * 256); // Komponen merah acak
                let g = Math.floor(Math.random() * 256); // Komponen hijau acak
                let b = Math.floor(Math.random() * 256); // Komponen biru acak
                randomColor = `rgb(${r}, ${g}, ${b})`; // Format warna RGB
            } while (randomColor === "rgb(255, 255, 255)" || randomColor === "rgba(0, 0, 0, 0)"); // Cek apakah warna adalah putih atau transparan

            return randomColor;
        }


        /*Logout*/

        const logout = document.getElementById('logout');
        logout.addEventListener('click',
            function() {
                logOut();

            });
        function logOut() {
            const user = auth.currentUser;
            if (user) {

                signOut(auth)
                .then(() => {
                    // Logout berhasil
                    // Hapus item dengan kunci "emailForSignIn"
                    localStorage.removeItem("emailForSignIn");
                    Swal.fire({
                        icon: 'success',
                        title: 'Logout Success',
                        showConfirmButton: false,
                        timer: 1000
                    });
                    location.reload();
                    $('#loadingModal').modal('hide');

                })
                .catch((error) => {
                    // Tangani error
                    Swal.fire({
                        icon: 'warning',
                        title: 'Logout Failed',
                        showConfirmButton: false,
                        timer: 1000
                    });
                    console.log(error);
                });
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'Anda Sudah Logout',
                    showConfirmButton: false,
                    timer: 1000
                });
            }
        }



        /* Login Form Handling */
        const loginForm = document.getElementById('loginForm');

        loginForm.addEventListener('submit',
            async (e) => {
                e.preventDefault();

                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;

                try {
                    await signInWithEmailAndPassword(auth, email, password);

                    // Login berhasil
                    Swal.fire({
                        icon: 'success',
                        title: 'Login berhasil',
                        showConfirmButton: false,
                        timer: 1500
                    });

                    // Kosongkan input email dan password
                    document.getElementById('email').value = "";
                    document.getElementById('password').value = "";

                    $('#exampleModalToggle').modal('hide');

                } catch (error) {
                    const errorCode = error.code;

                    if (errorCode === "auth/user-not-found") {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Email belum terdaftar',
                            showConfirmButton: false,
                            timer: 1500
                        });
                    } else if (errorCode === "auth/wrong-password") {
                        const result = await Swal.fire({
                            icon: 'error',
                            title: 'Password Salah. Reset jika lupa',
                            showConfirmButton: true,
                            confirmButtonText: 'Reset',
                            showCancelButton: true,
                            allowOutsideClick: false,
                            cancelButtonText: 'Batal'
                        });

                        if (result.isConfirmed) {
                            $('.signup, .login').hide();
                            $('.recover-password, .notification').fadeIn(300);

                            $('.btn-password').click(function () {
                                //   const email = document.getElementById('resetPassword').value;

                            });
                        }
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: error.message,
                            showConfirmButton: false,
                            timer: 1500
                        });
                    }
                }
            });


        const loginBtn = document.getElementById('loginbtn');
        loginBtn.addEventListener('click',
            ()=> {
                const user = auth.currentUser;
                if (user) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Sudah Login',
                        showConfirmButton: false
                    });
                } else {
                    $('#exampleModalToggle').modal('show');
                }
            });



        const registrationForm = document.getElementById('registerForm');

        registrationForm.addEventListener('submit',
            async (e) => {
                e.preventDefault();

                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const repeatPassword = document.getElementById('repeatPassword').value;
                const username = document.getElementById('username').value; // Get username value

                if (password !== "" && repeatPassword !== "" && username !== "") {
                    if (password !== repeatPassword) {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Password tidak sama',
                            showConfirmButton: false,
                            timer: 1500
                        });
                    } else {
                        try {
                            const auth = getAuth();

                            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                            const user = userCredential.user;
                            Swal.fire({
                                icon: 'success',
                                title: 'Registration Success',
                                showConfirmButton: false,
                                timer: 1500
                            });
                            $('#exampleModalToggle2').modal('hide');

                            // Save additional user data in Realtime Database
                            // Save additional user data in Realtime Database
                            await set(databaseRef(database, 'users/' + user.uid), {
                                username: username,
                                email: email
                            });

                            // Clear input fields
                            document.getElementById('email').value = "";
                            document.getElementById('password').value = "";
                            document.getElementById('repeatPassword').value = "";
                            document.getElementById('username').value = "";

                            document.getElementById("myModal").style.display = "none";
                        } catch (error) {
                            const pesan = error;
                            Swal.fire({
                                icon: 'warning',
                                title: pesan,
                                showConfirmButton: false,
                                timer: 1500
                            });
                        }
                    }
                } else {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Input tidak boleh kosong',
                        showConfirmButton: false,
                        timer: 1500
                    });
                }
            });

        function resetPassword(email) {
            const auth = getAuth();

            sendPasswordResetEmail(auth,
                email)
            .then(() => {
                // Email reset password berhasil dikirim
                Swal.fire({
                    icon: 'success',
                    title: 'Email reset password berhasil terkirim!',
                });
                $('#exampleModalToggleForgot').modal('hide');

            }).catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                // Handle errors here
                console.error(errorCode, errorMessage);
                console.log(errorCode + " " + errorMessage);
            });

        }

        function createElementDiv(category, apkName, Path, sizeApk) {
            const fileElement = document.createElement('div');
            fileElement.classList.add('col');
            fileElement.classList.add('m-2'); // Menggunakan classList untuk menambahkan class
            fileElement.setAttribute('data-aos',
                'fade-up');
            const element = document.createElement('div');
            element.classList.add('bg-img');
            element.classList.add('border');

            const img = document.createElement('img');
            img.setAttribute('alt',
                apkName); // Mengatur atribut alt untuk gambar
            img.classList.add('app-image');
            img.classList.add('shadow-sm');
            img.classList.add('rounded');

            // Menambahkan class untuk gambar
            fileElement.appendChild(img);
            const textName = document.createElement('div');
            textName.classList.add('bg-textName');
            const projectNameElement = document.createElement('p');
            projectNameElement.textContent = apkName; // Menggunakan textContent untuk mengatur teks
            textName.appendChild(projectNameElement);
            // Mengambil URL gambar dari Firebase Storage
            const storage = getStorage();
            const imageRef = storageRef(storage,
                Path);
            getDownloadURL(imageRef)
            .then((url) => {
                img.src = url;
            })
            .catch((error) => {
                console.error('Error getting download URL:', error);
            });

            const descriptionElement = document.createElement('span');
            const des = document.createElement('small');

            descriptionElement.appendChild(des);
            des.textContent = 'Description of ' + apkName;
            textName.appendChild(descriptionElement);
            fileElement.appendChild(textName);

            const gridContainer = document.querySelector('.dataRow');
            gridContainer.appendChild(fileElement);

            fileElement.addEventListener('click',
                () => {
                    const storage = getStorage();
                    const imageRef = storageRef(storage,
                        Path);
                    getDownloadURL(imageRef)
                    .then((url) => {
                        playData(apkName, "hahahah", sizeApk, url);

                    })
                    .catch((error) => {
                        console.error('Error getting download URL:', error);
                    });
                });
        }

        function playData(name, des, size, img) {
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

        // Contoh cara memanggil createElementDiv dengan array nama file
        async function saveDataToRealtime(name, file, screenshot, projectPath, screenshotPath, category) {
            try {
                const user = auth.currentUser;
                if (name && file && screenshot && projectPath && screenshotPath, category) {
                    const projectInfo = {
                        name: name,
                        apkName: file,
                        screenshotName: screenshot,
                        projectPath: projectPath,
                        screenshotPath: screenshotPath,
                        uploadTime: serverTimestamp(),
                        ownerId: user.uid,
                        // Menyimpan ID pengguna yang mengunggah proyek
                        category: category,
                        allowedUsers: null // Tidak ada pengguna yang diizinkan khusus (semua pengguna dapat melihat)
                    };


                    // Menambahkan objek `projectInfo` ke dalam Firebase Realtime Database
                    await push(databaseRef(database, 'projectData'), projectInfo);

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


    });
}