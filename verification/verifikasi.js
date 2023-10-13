import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAww_-fNOIQIm5jdCand0L_RNmXn55G-TU",
  authDomain: "newproject-1c2fd.firebaseapp.com",
  databaseURL: "https://newproject-1c2fd-default-rtdb.firebaseio.com",
  projectId: "newproject-1c2fd",
  storageBucket: "newproject-1c2fd.appspot.com",
  messagingSenderId: "954909544202",
  appId: "1:954909544202:web:41b9691b49ee0437fc34f3",
};

const firebaseApp = initializeApp(firebaseConfig);

document.addEventListener("DOMContentLoaded", function () {
  const auth = getAuth(firebaseApp);
  if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = window.localStorage.getItem("emailForSignIn");

    if (!email) {
      email = window.prompt("Please provide your email for confirmation");
}
    signInWithEmailLink(auth, email, window.location.href)
      .then((result) => {
        // Clear email from storage.
        window.localStorage.removeItem("emailForSignIn");
        // Redirect to a success page or perform other actions.
        Swal.fire({
          icon: 'success',
          title:  'Verification Success',
          showConfirmButton: false,
          timer: 1500
        });
        
    
        window.localStorage.removeItem("email");
       
       window.location.href="index.html";
        
       
      })
      .catch((error) => {
        console.error("Error:", error.code, error.message);
        // Handle errors, display error messages, or redirect to an error page.
        console.log("gagal", error);
      });

  }
});
