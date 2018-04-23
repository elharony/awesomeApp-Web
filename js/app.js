$(document).ready(function(){
    $('select').formSelect();
    $('.modal').modal();
    $('.sidenav').sidenav();
});



// Initialize Firebase
var config = {
    apiKey: "AIzaSyBVARDFRI7QWempiL8upUd2S-G8s1Uom-o",
    authDomain: "awesomeapp-4ec8d.firebaseapp.com",
    databaseURL: "https://awesomeapp-4ec8d.firebaseio.com",
    projectId: "awesomeapp-4ec8d",
    storageBucket: "awesomeapp-4ec8d.appspot.com",
    messagingSenderId: "523185544926"
};
firebase.initializeApp(config);




/*
 *
 * Login
 * 
 */
 // Initialize the FirebaseUI Widget using Firebase.
 var ui = new firebaseui.auth.AuthUI(firebase.auth());

 var uiConfig = {
   callbacks: {
     signInSuccessWithAuthResult: function(authResult, redirectUrl) {
       // User successfully signed in.
       // Return type determines whether we continue the redirect automatically
       // or whether we leave that to developer to handle.
       return true;
     },
     uiShown: function() {
       // The widget is rendered.
       // Hide the loader.
       document.getElementById('loader').style.display = 'none';
     }
   },
   // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
   signInFlow: 'popup',
   signInSuccessUrl: './',
   signInOptions: [
     // Leave the lines as is for the providers you want to offer your users.
     firebase.auth.GoogleAuthProvider.PROVIDER_ID,
   ],
   // Terms of service url.
   tosUrl: '<your-tos-url>'
 };

 // The start method will wait until the DOM is loaded.
 ui.start('#firebaseui-auth-container', uiConfig);


 const loggedInDiv = document.querySelector(".signedIn");
 const loggedOutDiv = document.querySelector(".signedOut");

 firebase.auth().onAuthStateChanged(function(user) {
   if (user) {
     loggedInDiv.style.display = "block";
     loggedOutDiv.style.display = "none";
     document.querySelector("#done").innerHTML = user;
   } else {
     loggedInDiv.style.display = "none";
     loggedOutDiv.style.display = "block";
   }
 });


















var db = firebase.firestore();

const docRef = db.doc("helpData/tracks");


/*
 * Option Field Creator [ Create and Fill it with Data ]
 */
function optionFiedCreator(arrayOfData, containerElement) {
    arrayOfData.forEach(function (entry) {
        const option = document.createElement("option");
        option.setAttribute("value", entry);
        option.innerHTML = entry;
        containerElement.appendChild(option);
    }
)}


docRef.get().then(function(doc) {
    if(doc && doc.exists) {
        const myData = doc.data();
        console.log(myData);

        /*
         *  User Preferences
         */

        // Tracks
        const tracks = document.querySelector("#tracks");
        optionFiedCreator(myData.tracksArray, tracks);

        // Languages
        const langOne = document.querySelector("#langOne");
        optionFiedCreator(myData.langsArray, langOne);

        const langTwo = document.querySelector("#langTwo");
        optionFiedCreator(myData.langsArray, langTwo);


    }
}).catch(function (error) {
    console.log("Got an error: ", error);
});