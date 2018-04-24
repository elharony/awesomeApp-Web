$(document).ready(function(){
    $('.tabs').tabs();
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
 const userName  = document.querySelector("#userName");
 const userEmail = document.querySelector("#userEmail");
 const userImage = document.querySelector("#userImage");



 /*
  *
  * LoggedIn / LoggedOut
  *
  */
 firebase.auth().onAuthStateChanged(function(user) {
   if (user) {

    // Show/Hide based on Auth
    loggedInDiv.style.display = "block";
    loggedOutDiv.style.display = "none";
    console.log(user);

    // Display User Data
    userName.innerHTML = user.displayName;
    userEmail.innerHTML = user.email;
    userImage.setAttribute("src", user.photoURL);


    // Add New Data
    const preferencesForm  = document.querySelector("#preferencesForm");
    const u_slackName      = document.querySelector("#slackName");
    const u_track          = document.querySelector("#tracks");
    const u_currentProject = document.querySelector("#availableProjects");
    const u_langOne        = document.querySelector("#langOne");
    const u_langTwo        = document.querySelector("#langTwo");

    preferencesForm.addEventListener("submit", function(e) {
        e.preventDefault();
        writeUserData(user.uid, user.displayName, user.email, u_slackName.value, u_track.value, u_currentProject.value, u_langOne.value, u_langTwo.value);
    });
    
     
   } else {
     loggedInDiv.style.display = "none";
     loggedOutDiv.style.display = "block";
   }
 });


/*
 * Write User Data
 */
function writeUserData(u_id, u_name, u_email, u_slackName, u_track, u_currentProject, u_langOne, u_langTwo) {
    db.doc("Users/" + u_id + "/").set({
      userName: u_name,
      userEmail: u_email,
      slackName: u_slackName,
      userTrack: u_track,
      currentProject: u_currentProject,
      languageFirst: u_langOne,
      languageSecond: u_langTwo
    }).then(function() {
        console.log("Data Saved!");
    }).catch(function(error) {
        console.log("Error: ", error)
    });
}



 /*
  *
  * Logout
  * 
  */
 document.querySelector("#signout").addEventListener("click", function() {
    firebase.auth().signOut().then(function() {
        console.log('Signed Out');
    }, function(error) {
        console.error('Sign Out Error', error);
    });
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


/*
 * Get All Data
 */
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

        // Get Available Projects based on the selected Track
        const availableProjects = document.querySelector("#availableProjects");
        tracks.addEventListener("change", function() {
            switch(tracks.value) {
                case "AND":
                    availableProjects.innerHTML = "";
                    optionFiedCreator(myData.andProjectsArray, availableProjects);
                break;
                case "ABND":
                    availableProjects.innerHTML = "";
                    optionFiedCreator(myData.abndProjectsArray, availableProjects);
                break;
                case "FEND":
                    availableProjects.innerHTML = "";
                    optionFiedCreator(myData.fendProjectsArray, availableProjects);
                break;
                case "MWS":
                    availableProjects.innerHTML = "";
                    optionFiedCreator(myData.mwsProjectsArray, availableProjects);
                break;

            }
        });

        // Languages
        const langOne = document.querySelector("#langOne");
        optionFiedCreator(myData.langsArray, langOne);
        const langTwo = document.querySelector("#langTwo");
        optionFiedCreator(myData.langsArray, langTwo);



        /*
         * Explore
         */

        // Tracks
        const tracksContainer = document.querySelector(".tracks");
        myData.tracksArray.forEach(function (value) {
            const track = document.createElement("div");
            track.className = "track col s6 m3 center-align";
            const trackBtn = document.createElement("button");
            trackBtn.className = "track-button waves-effect waves-light btn-large";
            trackBtn.innerHTML = value;
            trackBtn.setAttribute("data-value", value);
            track.appendChild(trackBtn);
            tracksContainer.appendChild(track);
        });

        // Projects in each Track
        const projectsContainer = document.querySelector(".projects");

        // Add Event Listener to each Track Button
        const trackButtons = document.querySelectorAll(".track-button");
        console.log(trackButtons);
        for(let i = 0; i < trackButtons.length; i++) {
            trackButtons[i].addEventListener("click", function() {
                const trackName = this.getAttribute("data-value");

                
            });
        }


    }
}).catch(function (error) {
    console.log("Got an error: ", error);
});
