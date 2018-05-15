// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');

admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.updateUser = functions.firestore
    .document('Users/{userId}')
    .onUpdate((change, context) => {
      // Get an object representing the document
      // e.g. {'name': 'Marie', 'age': 66}
      const newValue = change.after.data().currentProject;

      // ...or the previous value before this update
      const previousValue = change.before.data().currentProject;
      // access a particular field as you would any JS property

      // add to nbUsers
      admin.firestore().collection('Projects')
            .where('name', '==', newValue).get()
            .then(querySnapshot => {
                let projectId;
                querySnapshot.forEach(doc => {
                  projectId = doc;  
                })
                return projectId;
            }).then(projectId => {
              admin.firestore().doc('Projects/'+ projectId.id).set({
                nbUsers: projectId.data().nbUsers + 1
              }, { merge: true })
              return;
            }).catch(error => {
                console.log(error)
            });
      // delete from nbUsers
      admin.firestore().collection('Projects')
            .where('name', '==', previousValue).get()
            .then(querySnapshot => {
                let projectId;
                querySnapshot.forEach(doc => {
                  projectId = doc;  
                })
                return projectId;
            }).then(projectId => {
              admin.firestore().doc('Projects/'+ projectId.id).set({
                nbUsers: projectId.data().nbUsers - 1
              }, { merge: true })
              return;
            }).catch(error => {
                console.log(error)
            });
      // perform desired operations ...
    });
