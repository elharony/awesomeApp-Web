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