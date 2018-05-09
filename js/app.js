const loader = document.getElementById('loader');
const search = document.getElementById('searchClassmate');
const slackNameField = document.getElementById('slackName');
const message = document.getElementById('message');

$('.modal').modal();
const modalWindow = M.Modal.getInstance($('.modal'));
$('#prefsButton').on('click', ()=>{
    modalWindow.open();
    
});


function clearSearch(search) {
    if(search.placeholder){
        search.placeholder = "";
    }else if (search.value == search.defaultValue) {
        search.value = "";
    }
}
function setSearch(search) {
    if(search.placeholder == ""){
        search.placeholder = "Enter your Slack Username here";
    }else if (search.value == "") {
        search.value = search.defaultValue;
    }
}


// Initialize Firebase
const config = {
    apiKey: "AIzaSyBVARDFRI7QWempiL8upUd2S-G8s1Uom-o",
    authDomain: "awesomeapp-4ec8d.firebaseapp.com",
    databaseURL: "https://awesomeapp-4ec8d.firebaseio.com",
    projectId: "awesomeapp-4ec8d",
    storageBucket: "awesomeapp-4ec8d.appspot.com",
    messagingSenderId: "523185544926"
};

firebase.initializeApp(config);

/*
 * Login
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
     firebase.auth.GithubAuthProvider.PROVIDER_ID
   ],
   // Terms of service url.
   tosUrl: '<your-tos-url>'
 };

 // The start method will wait until the DOM is loaded.
 ui.start('#firebaseui-auth-container', uiConfig);


 // Select the intro [ Info Summary Div ]
 const loggedInDiv     = document.querySelector(".signedIn");
 const loggedOutDiv    = document.querySelector(".signedOut");
 const userContact     = document.querySelector("#userContact");
 const userPreferences = document.querySelector("#userPreferences");
 const userImage       = document.querySelector("#userImage");
 const event = new Event('change');
 const inputEvent = new Event('input');
 /*
  * LoggedIn / LoggedOut
  */
 firebase.auth().onAuthStateChanged(function(user) {

    slackNameField.addEventListener('input', ()=>{
        //when input - clear students container from previous data
        slackNameField.innerHTML = '';

        if( slackNameField.value && slackNameField.value.replace(/[^\w]/g,'').length >= 3 &&
            slackNameField.value.replace(/\s/g,'') !== '' ) {

            message.innerHTML = '';
            // get request to the DB
            //checkSlackUsername();

        }else{
            message.innerHTML = "Your Slack Username should include at least 3 numbers of letters";
            message.style.color = "red";
        }
    });

   if (user) {
    
    $('#closeButton').on('click', ()=>{
            if( slackNameField.value.replace(/\s/g,'') !== '' &&
                slackNameField.value.replace(/[^\w]/g,'').length >= 3) {
                modalWindow.close();
            }
    });

     const studentsContainer = document.querySelector(".students");
     // Listener to check search input
     search.addEventListener('input', ()=>{
        //when input - clear students container from previous data
        studentsContainer.innerHTML = '';

        if(search.value) {
            // get request to the DB
            getStudents(studentsContainer, null, 'classmate');
        }
     });
     // refresh once when application run
     refreshPageData(user);
   } else {
     // if not authorized user change view
     loggedInDiv.style.display = "none";
     loggedOutDiv.style.display = "block";
   }
 });

function checkSlackUsername(){
    return new Promise((resolve, reject)=>{
        db.collection("Users")
        .where('slackName', '>=', slackNameField.value )
        .orderBy('slackName')
        .startAt(slackNameField.value)
        .endAt(slackNameField.value).get()
        .then(querySnapshot => {
            let usrName = '';
            querySnapshot.forEach(doc => {
                usrName = doc.data().userName;
            });
                if(firebase.auth().currentUser.displayName === usrName){
                    // message.innerHTML = "This is your actual Username"
                    // message.style.color = "green";
                    resolve('true');
                }else if(querySnapshot.size && firebase.auth().currentUser.displayName !== usrName ){
                    message.innerHTML = '<p>This Username already in use. If you\'re sure that is someone uses your Slack Username, please <a href=#>report</a></p>';
                    message.style.color = "red";
                    reject("Already in use");
                    return false;
                }else if(slackNameField.value.replace(/\s/g,'') !== '' &&
                        slackNameField.value.replace(/[^\w]/g,'').length >= 3){
                    // message.innerHTML = "Username is available"
                    // message.style.color = "green";
                    resolve('true');
                }
        }).catch(error=>{
            console.log(error); 
        })   

    });
}

/*
 * initialize user data and refresh page
 */
 const refreshPageData = (user) => {
    return new Promise((resolve, reject) => {
    //Show preloader
    loader.style.display = "flex";

    // Show/Hide based on Auth
    loggedInDiv.style.display = "block";
    loggedOutDiv.style.display = "none";
    console.log(user);

    // Display User Data
    userImage.setAttribute("src", user.photoURL);
    userContact.innerHTML  = `<i class="fas fa-user"></i> ${user.displayName}`;


    // Preferences Fields
    const preferencesForm  = document.querySelector("#preferencesForm");
    const u_slackName      = document.querySelector("#slackName");
    const u_track          = document.querySelector("#tracks");
    const u_currentProject = document.querySelector("#availableProjects");
    const u_langOne        = document.querySelector("#langOne");
    const u_langTwo        = document.querySelector("#langTwo");

    //info-box fields
    const totalClassmates  = document.querySelector("#totalClassmates");
    const lastClassmate  = document.querySelector("#lastClassmate");


    db.doc("Users/" + user.uid + "/").get().then(function(doc) {

        
        if (doc.exists) {
            if( doc.data().slackName === undefined || 
                doc.data().slackName === ''  ){
                modalWindow.open();
                reject('First need to provide data in Preferences!');
            }
            const u_tracks_Options = u_track.querySelectorAll('option');

            // User Current Info [ Top Summary ]
            userPreferences.innerHTML = `<i class="fas fa-certificate"></i> ${doc.data().userTrack} <i class="fas fa-bug"></i> ${doc.data().currentProject} <br><i class="fas fa-globe"></i> ${doc.data().language.replace(',', ', ')}`;

            // User Current Info [ Preferences Fields ]
            const [lang1, lang2] = doc.data().language.split(',');
            u_slackName.value = doc.data().slackName;
            u_langOne.value = lang1;
            u_langTwo.value = lang2;

            // set current track as a selected
            u_tracks_Options.forEach(option => {
                if(option.innerHTML === doc.data().userTrack) {
                    option.setAttribute('selected', '');
                    // call change event when current track is changed
                    u_track.dispatchEvent(event);
                }
            })

            const u_currentProjects = u_currentProject.querySelectorAll('option');
            // set current project as a selected
            u_currentProjects.forEach(project => {
                if(project.innerHTML === doc.data().currentProject) {
                    project.setAttribute('selected', '');
                }
            })

            // console.log("Document data:", doc.data());
        } else {
            // doc.data() will be undefined in this case
            modalWindow.open();
            console.log("No such document!");
        }

        resolve(true);
        loader.style.display = "none";
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });

    preferencesForm.addEventListener("submit", function(e) {
        e.preventDefault();
        message.append(spinnerBox)
        checkSlackUsername().then(response => {
            if(response) {
                u_slackName.style.border = "none";
                loader.style.display = "flex";
                message.innerHTML = '';
                modalWindow.close();
                writeUserData(user.uid, user.displayName, user.email, u_slackName.value, u_track.value, u_currentProject.value, u_langOne.value, u_langTwo.value);
            }
        })
    });


    db.collection("Users")
    .get()
    .then(function(querySnapshot) {
        totalClassmates.innerHTML = querySnapshot.size;
    });


    db.collection("Users").limit(1)
    .get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            lastClassmate.innerHTML = doc.data().slackName;
        });
    });

  });

}

/*
 * Write User Data
 */
function writeUserData(u_id, u_name, u_email, u_slackName, u_track, u_currentProject, u_langOne, u_langTwo) {

    db.doc("Users/" + u_id + "/").set({
      userName: u_name,
      slackName: u_slackName,
      userTrack: u_track,
      currentProject: u_currentProject,
      language: u_langOne + ',' + u_langTwo
    }).then(function() {
      db.collection('UsersByLanguage').where('slackName', '==', u_slackName).get().then((querySnapshot)=>{
        querySnapshot.forEach((data)=>{
            db.collection('UsersByLanguage').doc(data.id).delete().catch(function(error) {
                    console.log("Error: ", error)
                  });
            });
      }).then(function() {
        db.collection("UsersByLanguage").doc(u_langOne + '_' + u_id).set({
            slackName: u_slackName,
            project: u_currentProject,
            languages: u_langOne + ',' + u_langTwo   
        }).catch(function(error) {
            console.log("Error: ", error)
        });  
      }).then(function() {
        db.collection("UsersByLanguage").doc(u_langTwo + '_' + u_id).set({
          slackName: u_slackName,
          project: u_currentProject,
          languages: u_langOne + ',' + u_langTwo   
        }).catch(function(error) {
          console.log("Error: ", error)
        });  
      });
    }).then(function() {
        // location.reload();
        refreshPageData(firebase.auth().currentUser).then(function() {
        })
    }).catch(function(error) {
        console.log("Error: ", error)
    });
}


var db = firebase.firestore();


// spinner
const spinnerBox = document.createElement('div');
spinnerBox.classList.add('progress');
const spinner = document.createElement('div');
spinner.classList.add('indeterminate');
spinnerBox.append(spinner);

/*
 * Show all Students in the Selected Project
 * [ Explore ]
 */
function getStudents(containerElement, projectName, queryFlag) {
    const foundInfo = document.querySelector('.search-results');
    foundInfo.innerHTML = '';
    containerElement.removeAttribute('style');
    containerElement.innerHTML = '';
    containerElement.append(spinnerBox);
    let query = queryFlag === 'classmate' ?
             ["slackName", ">=", search.value]:
             ["currentProject", ">=", projectName];

    db.collection("Users")
    .orderBy(queryFlag?'slackName':'currentProject').where(...query)
    .startAt(queryFlag?search.value:projectName)
    .endAt(queryFlag?search.value +"\uf8ff":projectName)
    .get()
    .then(function(querySnapshot) {
        containerElement.innerHTML = '';
        if(queryFlag && search.value === '') return;
        if(querySnapshot.size){

            // lang filter
            const langFilter = document.createElement('select');
            langFilter.classList.add('language-filter');
            langFilter.innerHTML = "<option value disabled selected>Filter by language</option>";

            //filter event listener
            langFilter.addEventListener('change', function(evt){
                const studentsFilterList = containerElement.querySelectorAll('ul');
                studentsFilterList.forEach(e => {
                    if(e.lastChild.innerHTML.match(langFilter.value)) {
                        if(e.classList.contains('hidden')){
                            e.classList.remove('hidden');
                        }
                    }else{
                        e.classList.add('hidden');
                    }
                });
                const numOfItems = langFilter[langFilter.selectedIndex].innerHTML.match(/(\d+)/i)[0];
                studentsCount.innerHTML = ('Filtered ' + numOfItems + " record" + (+numOfItems===1?"":"s"));
                const closeFilter = document.createElement("span");
                closeFilter.classList.add("closeFilter");
                closeFilter.innerHTML = "close"
                studentsCount.appendChild(closeFilter);

                //close filter event
                closeFilter.addEventListener('click', ()=>{
                    studentsFilterList.forEach(e => {
                        e.classList.remove('hidden');
                        
                    });
                    langFilter.selectedIndex = 0;
                    studentsCount.innerHTML = "Found " + querySnapshot.size + " record" + (querySnapshot.size===1?"":"s");
                });
            });
            
            // add found results
            const infoBox = document.querySelector('.info-block');
            // const foundInfo = document.querySelector('.search-results');
            foundInfo.innerHTML = '';
            //foundInfo.classList.add("search-results");
            const studentsCount = document.createElement("div");
            studentsCount.classList.add("search-count");
            studentsCount.innerHTML = "Found " + querySnapshot.size + " record" + (querySnapshot.size===1?"":"s");
            foundInfo.append(studentsCount);

            const langFilterObject = {};
            //containerElement.append(foundInfo);
            const retrievedStudents = {};
            querySnapshot.forEach(function(doc) {                

                // extract languages
                const userLangs = doc.data().language.split(',');
                userLangs.forEach(lang => {
                    langFilterObject[lang] = langFilterObject[lang]?langFilterObject[lang]+1:1;
                    
                })

                const student = document.createElement("ul");
                student.className = "student-card collection";

                const data_contact = document.createElement("li");
                data_contact.className = "collection-item row";
                data_contact.innerHTML = `<div class="col s6"><i class="fab fa-slack-hash"></i> ${doc.data().slackName}</div> <div class="col s6"><a href="https://slack.com/app_redirect?channel=C97PS9WJD" id="go-to-slack" class="waves-effect waves-light btn-small blue-grey darken-4">Go to Slack</a></div>`;

                const data_languages = document.createElement("li");
                data_languages.className = "collection-item row";
                data_languages.innerHTML = `<div class="col s12"><i class="fas fa-globe"></i> ${doc.data().language.replace(',',', ')} </div>`;



                student.appendChild(data_contact);
                if(queryFlag) {
                    const workingProject = document.createElement("li");
                    workingProject.className = "collection-item row";
                    const currentTrack = document.createElement("li");
                    currentTrack.className = "collection-item row";
                    currentTrack.innerHTML = `<div class="col s12"><i class="fas fa-certificate"></i> ${doc.data().userTrack}</div>`;
                    workingProject.innerHTML = `<div class="col s12"><i class="fas fa-bug"></i> ${doc.data().currentProject}</div>`;
                    student.appendChild(currentTrack);
                    student.appendChild(workingProject);
                }

                student.appendChild(data_languages);
                
                retrievedStudents[doc.data().slackName] = student;
                
                
            });

            const sortedList = Object.keys(retrievedStudents);
            sortedList.sort((a,b)=>{
                return a.toLowerCase() > b.toLocaleLowerCase();
            });
            sortedList.forEach((e,i)=>{
                containerElement.appendChild(retrievedStudents[e]);
            });

            if(containerElement.offsetHeight > 420){
                containerElement.setAttribute('style', 'overflow-y:scroll');
                containerElement.scrollTop = 0;
            }
            
            optionFiedCreator(Object.keys(langFilterObject).sort(), langFilter);
            foundInfo.append(langFilter);

            const langContainer = document.querySelectorAll('.language-filter option');

            for(i = 1; i < langContainer.length; i++) {
                langContainer[i].innerText = langContainer[i].innerText + " (" + langFilterObject[langContainer[i].value] + ") ";
            }



        }else{
            const student = document.createElement("ul");
            student.className = "student-card collection";
            const notFound = document.createElement("li");
            notFound.className = "collection-item row";
            notFound.innerHTML = `<div class="col s12 notfound"><i class="small material-icons .fab">error_outline</i> It seems we could not find anything</div>`;
            student.appendChild(notFound);
            containerElement.appendChild(student);
        }

    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });
}


/*
 * Get All Data
 * [ Preferences & Explore ]
 */

db.collection('Languages').get().then(function(querySnapshot) {
    const myLanguages =[];
    querySnapshot.forEach(doc => {
        myLanguages.push(doc.data().name);
    });
    // Languages
    const langOne = document.querySelector("#langOne");
    optionFiedCreator(myLanguages, langOne);
    const langTwo = document.querySelector("#langTwo");
    optionFiedCreator(myLanguages, langTwo);
});

db.collection("Tracks").get().then(function(querySnapshot) {
    
    const myData =[];
    querySnapshot.forEach(doc => {
        myData.push(doc.data().name);
    });
    /*
     * Preferences
     */

    // Tracks
    const tracks = document.querySelector("#tracks");
    optionFiedCreator(myData, tracks);

    // Get Available Projects based on the selected Track
    const availableProjects = document.querySelector("#availableProjects");
    tracks.addEventListener("change", function() {
        getAvailableProjects(myData, tracks, availableProjects);
    });

    /*
     * Explore
     */

    // Tracks
    const tracksContainer = document.querySelector(".tracks");
    myData.forEach(function (value) {
        const track = document.createElement("div");
        track.className = "track col s6 m3 center-align";
        const trackBtn = document.createElement("button");
        trackBtn.className = "track-button waves-effect waves-light btn-large blue-grey darken-4";
        trackBtn.innerHTML = value;
        trackBtn.setAttribute("data-value", value);
        track.appendChild(trackBtn);
        tracksContainer.appendChild(track);
    });


    // Track Buttons
    const trackButtons = document.querySelectorAll(".track-button");

    // Projects Container
    const projectsContainer = document.querySelector(".projects");

    for(let i = 0; i < trackButtons.length; i++) {
        trackButtons[i].addEventListener("click", function() {
            const foundInfo = document.querySelector('.search-results');
            foundInfo.innerHTML = '';
            const studentsContainer = document.querySelector(".students");
            studentsContainer.innerHTML = "";
            const trackName = this.getAttribute("data-value");

            // Display the projects based on the clicked Track
            switch(trackName) {
                case "AND":
                    projectsContainer.innerHTML = "";
                    getProjects(andProjects, projectsContainer, "AND");
                break;
                case "ABND":
                    projectsContainer.innerHTML = "";
                    getProjects(abndProjects, projectsContainer, "ABND");
                break;
                case "FEND":
                    projectsContainer.innerHTML = "";
                    getProjects(fendProjects, projectsContainer, "FEND");
                break;
                case "MWS":
                    projectsContainer.innerHTML = "";
                    getProjects(mwsProjects, projectsContainer, "MWS");
                break;
            }
        });
    }

}).catch(function (error) {
    console.log("Got an error: ", error);
});


/*****************************
****** Helper Functions ******
******************************/


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
 * Display All Related Projects
 */
function getProjects(arrayOfData, containerElement, trackName) {
    arrayOfData.forEach(function(data) {
        const project = document.createElement("button");
        project.className = "project-button waves-effect waves-light btn-large blue-grey darken-3";
        project.setAttribute("data-track", trackName);
        project.setAttribute("data-project", data);
        project.innerHTML = data;
        containerElement.appendChild(project);
    });

    // Project Buttons
    const projectButtons = document.querySelectorAll(".project-button");

    // Students Container
    const studentsContainer = document.querySelector(".students");

    for(let i = 0; i < projectButtons.length; i++) {
        projectButtons[i].addEventListener("click", function(evt) {
            const trackName = this.getAttribute("data-track");
            const projectName = this.getAttribute("data-project");
            //console.log("Clicked Project: ", projectName);
            getProjectNames(trackName);
            // Show all people who are working on the Selected Project
            switch(trackName) {
                case "AND":
                    for(let x  = 0; x < andProjects.length; x++) {
                        switch(projectName) {
                            case andProjects[x]:
                                studentsContainer.innerHTML = "";
                                getStudents(studentsContainer, andProjects[x]);
                            break;
                        }
                    }
                break;
                case "ABND":
                    for(let x  = 0; x < abndProjects.length; x++) {
                        switch(projectName) {
                            case abndProjects[x]:
                                studentsContainer.innerHTML = "";
                                getStudents(studentsContainer, abndProjects[x]);
                            break;
                        }
                    }
                break;
                case "FEND":
                    for(let x  = 0; x < fendProjects.length; x++) {
                        switch(projectName) {
                            case fendProjects[x]:
                                studentsContainer.innerHTML = "";
                                getStudents(studentsContainer, fendProjects[x]);
                            break;
                        }
                    }
                break;
                case "MWS":
                    for(let x  = 0; x < mwsProjects.length; x++) {
                        switch(projectName) {
                            case mwsProjects[x]:
                                studentsContainer.innerHTML = "";
                                getStudents(studentsContainer, mwsProjects[x]);
                            break;
                        }
                    }
                break;
            }


            // Retrieve project's deadlines

            let projectsContainer = document.querySelectorAll(".projects button");
            let hideDeadlineBox = document.querySelector(".projects .deadline");

            if(hideDeadlineBox) {
                hideDeadlineBox.classList.remove('deadline');
                hideDeadlineBox.classList.add('hidden');
            }

            const insertIndex = Array.prototype.indexOf.call(projectsContainer, evt.target);
            // Prevent to retrieve again if already has deadline (if next sibling not a student-card OR IF it is a last button and it's button already has no sibling)
            if(evt.target.nextSibling && !evt.target.nextSibling.classList.contains('student-card') || !evt.target.nextSibling && insertIndex + 1 === projectsContainer.length) {

            db.collection("Projects").where('name', '==', projectName)
                .get().then((querySnapshot) => {
                    querySnapshot.forEach(function(doc) {
                        const deadline = doc.data().deadline
                        .toLocaleString('en-EN',{ timeZone: 'UTC', day: "numeric", month: "long", year: "numeric", minute: "2-digit", hour: "2-digit", timeZoneName: "short" })
                    const deadline_ul = document.createElement("ul");
                    deadline_ul.className = "student-card collection deadline";
                    const deadline_li = document.createElement("li");
                    deadline_li.className = "collection-item row";;
                    deadline_li.innerHTML = `<div class="col s12">Deadline: ${deadline}</div>`;
                    deadline_ul.appendChild(deadline_li);
                    projectsContainer[insertIndex].after(deadline_ul);
                    })
                }).catch((error) => {
                    console.log(error)
                })

            }else if(evt.target.nextSibling && !evt.target.nextSibling.classList.contains('project-button')) {
                evt.target.nextSibling.classList.remove('hidden')
                evt.target.nextSibling.classList.add('deadline')
            }

        });
    }
}

/*
 * Get Project Names
 */
let andProjects,
    abndProjects,
    fendProjects,
    mwsProjects;
function getProjectNames(track) {
   
    db.collection("Projects").get().then(function(querySnapshot) {
        andProjects = [],  
        abndProjects = [],
        fendProjects = [],
        mwsProjects = [];
        querySnapshot.forEach(function(doc) {
            if (doc.id.match(/FEND/gi)) {
                fendProjects.push(doc.data().name);                
            }else if(doc.id.match(/ABND/gi)) {
                abndProjects.push(doc.data().name);                
            }else if(doc.id.match(/AND/gi)) {
                andProjects.push(doc.data().name);                
            }else if(doc.id.match(/MWS/gi)) {
                mwsProjects.push(doc.data().name);                
            }
        });
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });
}
getProjectNames();

/*
 * Display projects based on Track
 * [ Preferences ]
 */
function getAvailableProjects(db, tracks, container) {
    switch(tracks.value) {
        case "AND":
            container.innerHTML = "";
            optionFiedCreator(andProjects, container);
        break;
        case "ABND":
            container.innerHTML = "";
            optionFiedCreator(abndProjects, container);
        break;
        case "FEND":
            container.innerHTML = "";
            optionFiedCreator(fendProjects, container);
        break;
        case "MWS":
            container.innerHTML = "";
            optionFiedCreator(mwsProjects, container);
        break;
    }
}

/*
 * Logout
 */
document.querySelector("#signout").addEventListener("click", function() {
    firebase.auth().signOut().then(function() {
        alert("We will miss you!");
        location.reload();
    }, function(error) {
        console.error('Sign Out Error', error);
    });
});



/*****************************
********* UI Stuff ***********
******************************/
$(document).ready(function(){
    $('.tabs').tabs();
    $('select').formSelect();
    $('.modal').modal();
    $('.sidenav').sidenav();
});

const signedOutContainer = document.querySelector(".signedOut");
signedOutContainer.style.height = window.innerHeight + "px";