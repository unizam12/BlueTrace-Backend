var firebase = require("firebase");

// var serviceAccount = require("./bluetrace-lums-sproj-firebase-adminsdk-nrue3-cf47aba60c.json");

firebase.initializeApp({
//   credential: firebase.credential.cert(serviceAccount),
  serviceAccount : "./bluetrace-lums-sproj-firebase-adminsdk-nrue3-cf47aba60c.json",
  databaseURL: "https://bluetrace-lums-sproj.firebaseio.com/"
});

var message = {text:"Sending message from node 2" , text2:"Receiving medssage from node 2"  };
var ref = firebase.database().ref().child('node-client');
// var ref = firebase.database().collection('testingTable');

var logsRef = ref.child('logs');
var messagesRef = ref.child('messages');

logsRef.child(messagesRef.key).set(message);

var messageRef = messagesRef.push(message);

ref.on("value",function(snap){
console.log("VALUE IS ",snap.val())
},
function(errorObject){
    console.log("The read failed: " + errorObject.code);
}
);


logsRef.orderByKey().limitToLast(1).on('child_added', function(snap){
    console.log("Added :",snap.val());
});
logsRef.on('child_removed', function(snap){
    console.log('Removed',snap.val());
});
logsRef.on('child_changed', function(snap){
    console.log('Changed',snap.val());
});
logsRef.on('child_removed', function(snap){
    console.log('Removed',snap.val());
});