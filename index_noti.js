var firebase = require("firebase-admin");
var http = require("http");
const { result } = require("lodash");
const express = require('express');
const path = require('path');

var serviceAccount = require("./bluetrace-lums-sproj-firebase-adminsdk-nrue3-cf47aba60c.json");

if (!firebase.apps.length) {
	firebase.initializeApp({
		credential: firebase.credential.cert(serviceAccount),
	});
}

const db = firebase.firestore();
var tokenList = {};

function noti(tok) {
	//add name variable later

	var message = {
		notification: {
			title: "Covid Contact Alert",
			body:
				"Someone you've recently met has been tested Covid Positive, Please have yourself tested and quranteened.",
		},
		token: tok,
	};

	// Send a message to the device corresponding to the provided
	// registration token.
	firebase
		.messaging()
		.send(message)
		.then((response) => {
			// Response is a message ID string.
			console.log("Successfully sent message:", response);
		})
		.catch((error) => {
			console.log("Error sending message:", error);
		});
}

async function addToRecentlyNotified(Uuid, From) {
	const notifyDB = firebase.firestore();
	const usersDb = notifyDB.collection("recentlyNotified");
	const liam = usersDb.doc();
	await liam.set({
		// name: Name,
		uuid: Uuid,
		from: From,
	});
}

const distinct = (value, index, self) => {
	return self.indexOf(value) == index;
};

async function getAllDataFromFirebase(db) {
	const covidPosRef = db.collection("covidPositive");
	const snapshot = await covidPosRef.get();

	// Get covid pos user name
	var cpUser = [];
	var cpUuid = [];

	// Get user close contact table
	const closeContactRef = db.collection("userCloseContact");
	const closeTable = await closeContactRef.get();

	// Get user close contact name
	var uccName = [];
	var timestamp = [];
	var location = [];
	var uccUuid1 = [];
	var uccUuid2 = [];

	// get recently notified name
	var recNot = [];
	var recNotTemp = [];

	// const recentlyNotifiedRef = db.collection('recentlyNotified');
	const recentlyNotifiedRef = db.collection("recentlyNotified");
	const recentlyNotifiedTable = await recentlyNotifiedRef.get();
	recentlyNotifiedTable.forEach((doc) => {
		recNotTemp.push(doc.data().uuid);
	});

	// reomve duplicates
	recNot = recNotTemp.filter(distinct);

	// test(cpUser,cpUuid,uccName,uccUuid1,uccUuid2,recNot)

	// check for updates in recently notified
	const observer = db
		.collection("recentlyNotified")
		.onSnapshot((querySnapshot) => {
			var recNotTemp2 = recNotTemp;
			querySnapshot.docChanges().forEach((change) => {
				if (change.type === "added") {
					recNotTemp2.push(change.doc.data().uuid);
					if (tokenList[change.doc.data().uuid] === undefined) {
						console.log('My object: ', tokenList);
						console.log("user with invalid token");
					} else {
						lst = tokenList[change.doc.data().uuid];
						for (var tks in lst) {
							//console.log(tks, " ", lst[tks]);
							noti(lst[tks]);
						}
					}
				}
				if (change.type === "removed") {
					// console.log("REMOVEDEDDE", change.doc.data().from ,"UUID" , change.doc.data().uuid)
					const index = recNotTemp2.indexOf(change.doc.data().uuid);
					if (index > -1) {
						recNotTemp2.splice(index, 1);
					}
				}
			});
			recNot = recNotTemp2.filter(distinct);
			// console.log("SENDING REC NOT TABLE UPDATE");
			// send data to main func
			test(cpUser, cpUuid, uccName, uccUuid1, uccUuid2, recNot);
		});

	// cehck for updates in covid pos
	const observer2 = db
		.collection("covidPositive")
		.onSnapshot((querySnapshot) => {
			querySnapshot.docChanges().forEach((change) => {
				if (change.type === "added") {
					cpUuid.push(change.doc.data().uuid);
					var uuid_covid = change.doc.data().uuid;
					cpUser.push(change.doc.data().user);
					var user_covid = change.doc.data().user;

					db.collection("contactData")
						.where("sndUserUUID", "==", uuid_covid)
						.get()
						.then(function (querySnapshot) {
							querySnapshot.forEach(function (doc) {
								// doc.data() is never undefined for query doc snapshots
								//console.log(doc.id, " => ", doc.data());
								db.collection("contactData")
									.doc(doc.id)
									.set({ covidStatus: true }, { merge: true });
							});
						});
				}
				// if (change.type === 'removed') {
				//     const indexUuid = cpUuid.indexOf(change.doc.data().uuid)
				//     const indexUser = cpUser.indexOf(change.doc.data().user)
				//     if (index>-1){
				//         cpUuid.splice(indexUuid,1)
				//         cpUser.splice(indexUser,1)
				//     }
				// }
			});

			//console.log("SENDING COVID POS TABLE UPDATE");
			test(cpUser, cpUuid, uccName, uccUuid1, uccUuid2, recNot);
		});

	// check for updates in user close contacts
	const observer3 = db
		.collection("userCloseContact")
		.onSnapshot((querySnapshot) => {
			querySnapshot.docChanges().forEach((change) => {
				if (change.type === "added") {
					uccName.push(change.doc.data().name);
					var currUUID = change.doc.data().uuid1;
					uccUuid1.push(change.doc.data().uuid1);
					uccUuid2.push(change.doc.data().uuid2);
					var my_uuid2 = change.doc.data().uuid2;
					timestamp.push(change.doc.data().timestamp);
					var times = change.doc.data().timestamp;
					location.push(change.doc.data().location);
					var loc = change.doc.data().location;
					//console.log("detected");
					//console.log(change.doc.data().name);
					db.collection("users")
						.where("uuid", "==", my_uuid2)//change.doc.data().my_uuid2)
						.get()
						.then(function (querySnapshot) {
							querySnapshot.forEach(function (doc) {
								// doc.data() is never undefined for query doc snapshots
								//console.log(doc.id, " => ", doc.data());
								db.collection("contactData").add({
									uuid: currUUID,
									sndUserUUID: my_uuid2,
									sndUserName: doc.data().name,
									covidStatus: doc.data().covidStatus,
									location: loc,
									timestamp: times,
								});
							});
						});
				}
				if (change.type === "removed") {
					const indexName = cpUuid.indexOf(change.doc.data().name);
					const indexUuid1 = cpUser.indexOf(change.doc.data().uuid1);
					const indexUuid2 = cpUser.indexOf(change.doc.data().uuid2);
					if (index > -1) {
						uccName.splice(indexName, 1);
						uccUuid1.splice(indexUuid1, 1);
						uccUuid2.splice(indexUuid2, 1);
					}
				}
			});

			//     (doc) => {
			//         db.collection('contactData').add({uuid:uccUuid1[0],sndUserName:doc.data().name,covidStatus:doc.data().covidStatus,location:location[0],timestamp:timestamp[0]});
			//     }
			// ).catch((error) => {
			//     console.log("Error getting document:", error);
			// });

			//console.log("SENDING USER CLOSE CONTACT TABLE UPDATE");
			// send data to main function
			test(cpUser, cpUuid, uccName, uccUuid1, uccUuid2, recNot);
		});
}

function test(cpUser, cpUuid, uccName, uccUuid1, uccUuid2, recNot) {
	/*console.log("COVID pos user name", cpUser, cpUser);
	console.log("COVID pos user uuid", cpUuid);
	console.log("User close contact user name", uccName);
	console.log("User close contact user ID 1", uccUuid1);
	console.log("User close contact user ID 2", uccUuid2);
	console.log("recently notified", recNot);*/

	var notifyUsersID = [];
	var notifyFrom = [];
	var notifyName = [];

	for (i in cpUuid) {
		for (k in uccUuid1) {
			if (cpUuid[i] == uccUuid1[k] && !recNot.includes(uccUuid2[k])) {
				// console.log(cpUuid[i], "has been tested pos, plz inform", uccUuid2[k]);

				if (
					notifyUsersID.includes(uccUuid2[k]) &&
					notifyFrom.includes(cpUuid[i])
				) {
				} else {
					// notifyName.push(uccName[k])
					notifyUsersID.push(uccUuid2[k]);
					notifyFrom.push(cpUuid[i]);
				}
			}
		}
		for (m in uccUuid2) {
			if (cpUuid[i] == uccUuid2[m] && !recNot.includes(uccUuid1[m])) {
				//console.log(cpUuid[i], "has been tested pos, plz inform", uccUuid1[m]);
				if (
					notifyUsersID.includes(uccUuid1[m]) &&
					notifyFrom.includes(cpUuid[i])
				) {
				} else {
					notifyUsersID.push(uccUuid1[m]);
					notifyFrom.push(cpUuid[i]);
				}
			}
		}
	}

	if (cpUser.length != 0 && uccName.length != 0) {
		for (i in notifyUsersID) {
			addToRecentlyNotified(notifyUsersID[i], notifyFrom[i]);
		}
	}
}

async function addToCovidPos(db, Timestampo, User, Uuid) {
	await db.collection("covidPositive").add({
		timestamp: Timestamp.fromMillisecondsSinceEpoch(parseInt(Timestampo)),
		user: User,
		uuid: Uuid,
	});
	db.collection("users")
	.where("uuid", "==", Uuid)
	.get()
	.then(function (querySnapshot) {
		querySnapshot.forEach(function (doc) {
			// doc.data() is never undefined for query doc snapshots
			//console.log(doc.id, " => ", doc.data());
			db.collection("users")
				.doc(doc.id)
				.set({ covidStatus: true }, { merge: true });
		});
	});
}



// module.exports = function (req, res) {
// 	console.log("authondication checker process");
// 	getAllDataFromFirebase(db);
// 	var tokken, guid;
// 	if (req.method === "POST") {
// 		console.log("Posting posted");
// 		var body = "";
// 		var obj;
// 		req.on('error', (err) => {
// 			// This prints the error message and stack trace to `stderr`.
// 			console.error(err.stack);
// 		  });
// 		req.on("data", function (piece) {
// 			console.log("IDHR1");
// 			body += piece.toString();
// 		});
// 		req.on("end", function () {
// 			obj = JSON.parse(body);
// 			var type = String(obj.callType);
// 			//console.log("IDHR");
// 			//if (type === "noti_token_provision") {
// 				//console.log("obj.token");
// 				tokken = obj.token;
// 				guid = obj.uuid;
// 				noti(tokken);
// 				// if (tokenList[guid] === undefined) {
// 				// 	tokenList[guid] = [tokken];
// 				// } else if (tokenList[guid] != tokken) {
// 				// 	tokenList[guid].push(tokken);
// 				// }
// 			// } else if (type === "updated_covid_pos") {
// 			// 	Timestampi = obj.timestamp;
// 			// 	User = obj.user;
// 			// 	Uuid = obj.uuid;
// 			// 	//addToCovidPos(db, Timestampi, User, Uuid);
// 			// 	console.log("Timestampi");
// 			// }
// 			//tokenList[guid] = tokken;
// 			//console.log(tokenList);
// 		});
// 		//res.writeHead(201, { "Content-Type": "text/html" });
// 		//return res.end("IF STATEMENT");
// 	}
// 	// res.writeHead(200, { "Content-Type": "text/plain" });
// 	// res.end("Server Up and Running");
// 	//next();
// };




//Notification Implementation:
//module.exports.admin = firebase
// http.createServer(function (req, res) {

// 	res.writeHead(200, { "Content-Type": "text/plain" });
// 	res.end("Server Up and Running");
// }).listen(process.env.PORT ||8080);


var port = process.env.PORT || 3000;
var app = express();
//var bodyParser = require("body-parser");
app.use('/json', express.json());
// app.use('/user/:id', function (req, res, next) {
// 	console.log('Request Type:', req.method);
// 	next();
//  });
app.post('/', function (req, res) {
	var type, tokken, guid;
	var body = "";
	var obj;

	type = req.body.callType;
	tokken = req.body.token;
	guid = req.body.uuid;
	console.log("CALLED");
	console.log(type);
	//noti(tokken);
	if (tokenList[guid] === undefined) {
		tokenList[guid] = [tokken];
	} else if (tokenList[guid] != tokken) {
		tokenList[guid].push(tokken);
	}
		// req.on("end", function () {
		// 	obj = JSON.parse(body);
		// 	//var type = String(obj.callType);
		// 	//console.log("IDHR");
		// 	//if (type === "noti_token_provision") {
		// 		//console.log("obj.token");

		// 	// } else if (type === "updated_covid_pos") {
		// 	// 	Timestampi = obj.timestamp;
		// 	// 	User = obj.user;
		// 	// 	Uuid = obj.uuid;
		// 	// 	//addToCovidPos(db, Timestampi, User, Uuid);
		// 	// 	console.log("Timestampi");
		// 	// }
		// 	//tokenList[guid] = tokken;
		// 	//console.log(tokenList);
		// });
	res.send("POST REQUEST PROCESSED");


});

//module.exports = router;

var server = app.listen(port, function () {
	// console.log("authondication checker process");
	// getAllDataFromFirebase(db);
 console.log(`Node server is running..`);
});