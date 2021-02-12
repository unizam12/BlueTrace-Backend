var firebase = require("firebase-admin");
var http = require('http');
const { result } = require("lodash");

var serviceAccount = require("./bluetrace-lums-sproj-firebase-adminsdk-nrue3-cf47aba60c.json");

firebase.initializeApp({
//   credential: firebase.credential.cert(serviceAccount),
    // credential: firebase.credential.applicationDefault(),
    credential: firebase.credential.cert(serviceAccount),
//   serviceAccount : "./bluetrace-lums-sproj-firebase-adminsdk-nrue3-cf47aba60c.json",
//   databaseURL: "https://bluetrace-lums-sproj.firebaseio.com/"
});

const db = firebase.firestore();
var tokenList = {};
// console.log(db.collection('testingTable').doc('testingTable'))



const usersDb = db.collection('testingTable'); 
const liam = usersDb.doc('lragozzine'); 
// console.log(db.collection('testingTable'))
// liam.set({
//     first: 'Liam',
//     last: 'Ragozzine',
//     address: '133 5th St., San Francisco, CA',
//     birthday: '05/13/1990',
//     age: '30'
//     // test1:'abc'
//    });
// usersDb.doc('vpeluso').set({
//     first: 'Vanessa',
//     last: 'Peluso',
//     address: '49 Main St., Tampa, FL',
//     birthday: '11/30/1977',
//     age: '47'
// });

function noti(tok){

    var message = {
        notification: {title: 'Price drop', body: '5% off all electronics'},
    token: tok
    };

    // Send a message to the device corresponding to the provided
    // registration token.
    firebase.messaging().send(message)
    .then((response) => {
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
    })
    .catch((error) => {
        console.log('Error sending message:', error);
});
}  


async function addToRecentlyNotified(Uuid,From) {
    console.log("NOTIFY",Uuid,From)
    const notifyDB = firebase.firestore();
    const usersDb = notifyDB.collection('recentlyNotified'); 
    const liam = usersDb.doc(); 
    await liam.set({
        // name: Name,
        uuid: Uuid,
        from: From,
    });
}
// const users =  await db.collection('testingTable').get();
// console.log(users)
// const liamResult = await db.collection('testingTable').doc('liam').get();
// console.log(liamResult)
// if (!liamResult.exists) {
//     console.log('No document');
//    } else {
//     console.log(liam.data());
//    }

// delayedGreeting()

// const snapshot = await db.collection('testingTable').get();
// snapshot.forEach((doc) => {
//   console.log(doc.id, '=>', doc.data());
// });

function func_name(){
    console.log("HELLO");
}

var dat;
var dat1 = db.collection('testingTable').doc('lragozzine').get()
.then(doc =>{
    if(!doc.exists){
        console.log('No such document')
    }
    else{
        // console.log("HERE IS THE DOC:" ,doc.data())
        dat = doc.data();
        return doc.data();
    }

})
.catch(err =>{
    console.log("Error getting the document",err)
    process.exit();
})

const distinct =(value,index,self)=>{
    return self.indexOf(value) == index;
}

// const temp = db.collection('testingTable').doc('lragozzine');
// const temp2= await temp.get();
var arr = []
async function getAllDataFromFirebase(db) {
    // [START get_all]
    // [START firestore_data_get_all_documents]
    // [END firestore_data_get_all_documents]
    // [END get_all]
    const covidPosRef = db.collection('covidPositive');
    const snapshot = await covidPosRef.get();
    

    // Get covid pos user name
    var cpUser=[]
    var cpUuid = []
    // snapshot.forEach(doc => {
    // //   console.log(doc.id, '=>', doc.data());
    //   cpUser.push(doc.data().user)
    //   cpUuid.push(doc.data().uuid)
    // });
    
    // Get covid pos user ID
    // const covidPosTable = db.collection('covidPositive');
    // const snap = await covidPosTable.get();
    
    // snapshot.forEach(doc =>{
    //     cpUuid.push(doc.data().uuid)
    // })


    // Get user close contact table
    const closeContactRef = db.collection('userCloseContact');
    const closeTable = await closeContactRef.get()
    
    // Get user close contact name
    var uccName=[]
    var uccUuid1 = []
    var uccUuid2 = []
    // closeTable.forEach(doc =>{
    //     uccName.push(doc.data().name)
    //     uccUuid1.push(doc.data().uuid1)
    //     uccUuid2.push(doc.data().uuid2)
    // })

    // // Get user close contact uuid1
    // var uccUuid1 = []
    // closeTable.forEach(doc =>{
    //     uccUuid1.push(doc.data().uuid1)
    // })

    // // Get user close contact uuid2
    // var uccUuid2 = []
    // closeTable.forEach(doc =>{
    //     uccUuid2.push(doc.data().uuid2)
    // })

    var recNot = []
    var recNotTemp = []
    
    // const recentlyNotifiedRef = db.collection('recentlyNotified');
    const recentlyNotifiedRef = db.collection('recentlyNotified');
    const recentlyNotifiedTable = await recentlyNotifiedRef.get()
    recentlyNotifiedTable.forEach(doc =>{
            recNotTemp.push(doc.data().uuid)
    })
    
    // recNot = recNotTemp.unique()
    // recNot = recNotTemp.filter((x, i, a) => a.indexOf(x) === i)
    // console.log(recNotTemp,recNot)
    recNot = recNotTemp.filter(distinct)

    // test(cpUser,cpUuid,uccName,uccUuid1,uccUuid2,recNot)

    const observer = db.collection('recentlyNotified')
    .onSnapshot(querySnapshot => {
        var recNotTemp2 = recNotTemp
        querySnapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
            // console.log('New city: ', change.doc.data());
            // console.log("CHECK HERE FROM", change.doc.data().from ,"UUID" , change.doc.data().uuid)
            //if

            recNotTemp2.push(change.doc.data().uuid);
            if (tokenList[change.doc.data().uuid] === undefined){
                console.log("user with invalid token");
            }
            else{
                lst = tokenList[change.doc.data().uuid]
                for (var tks in lst){
                    console.log(tks," ",lst[tks]);
                    //noti(lst[tks]);
                }
            }


        }
        if (change.type === 'removed') {
            // console.log("REMOVEDEDDE", change.doc.data().from ,"UUID" , change.doc.data().uuid)
            const index = recNotTemp2.indexOf(change.doc.data().uuid)
            if (index>-1){
                recNotTemp2.splice(index,1)
            } 
        }
    });
    recNot = recNotTemp2.filter(distinct)
    console.log("SENDING REC NOT TABLE UPDATE")
    test(cpUser,cpUuid,uccName,uccUuid1,uccUuid2,recNot)
    });



    const observer2 = db.collection('covidPositive')
    .onSnapshot(querySnapshot => {
        querySnapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
            cpUuid.push(change.doc.data().uuid)
            cpUser.push(change.doc.data().user)
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
    console.log("SENDING COVID POS TABLE UPDATE")
    test(cpUser,cpUuid,uccName,uccUuid1,uccUuid2,recNot)
    });

    const observer3 = db.collection('userCloseContact')
    .onSnapshot(querySnapshot => {
        querySnapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
            uccName.push(change.doc.data().name)
            uccUuid1.push(change.doc.data().uuid1)
            uccUuid2.push(change.doc.data().uuid2)
        }
        if (change.type === 'removed') {
            const indexName = cpUuid.indexOf(change.doc.data().name)
            const indexUuid1 = cpUser.indexOf(change.doc.data().uuid1)
            const indexUuid2 = cpUser.indexOf(change.doc.data().uuid2)
            if (index>-1){
                uccName.splice(indexName,1)
                uccUuid1.splice(indexUuid1,1)
                uccUuid2.splice(indexUuid2,1)
            } 
        }
    });
    console.log("SENDING USER CLOSE CONTACT TABLE UPDATE")
    test(cpUser,cpUuid,uccName,uccUuid1,uccUuid2,recNot)
    });


}

function test(cpUser,cpUuid,uccName,uccUuid1,uccUuid2,recNot){
    console.log('COVID pos user name',cpUser,cpUser)
    console.log('COVID pos user uuid',cpUuid)
    console.log('User close contact user name',uccName)
    console.log('User close contact user ID 1',uccUuid1)
    console.log('User close contact user ID 2',uccUuid2)
    console.log('recently notified',recNot)

    var notifyUsersID=[]
    var notifyFrom=[]
    var notifyName=[]

    for(i in cpUuid){
        for(k in uccUuid1){
            if(cpUuid[i] == uccUuid1[k] && !(recNot.includes(uccUuid2[k]))){
                // console.log("YES 1 ",cpUuid[i])
                console.log(cpUuid[i],"has been tested pos, plz inform",uccUuid2[k] )
                // console.log(uccName[k],uccUuid2[k],cpUuid[i])
                
                

                if(notifyUsersID.includes(uccUuid2[k]) && notifyFrom.includes(cpUuid[i])  ){

                }
                else{
                    // notifyName.push(uccName[k])
                    notifyUsersID.push(uccUuid2[k])
                    notifyFrom.push(cpUuid[i])
                }
            }
        }
        for(m in uccUuid2){
            if(cpUuid[i] == uccUuid2[m]  && !(recNot.includes(uccUuid1[m])) ){
                // console.log("YES 2",cpUuid[i] )
                console.log(cpUuid[i],"has been tested pos, plz inform",uccUuid1[m])
                // console.log(uccName[m],uccUuid1[m],cpUuid[i])
                
                if( notifyUsersID.includes(uccUuid1[m]) && notifyFrom.includes(cpUuid[i])){

                }
                else{
                    notifyUsersID.push(uccUuid1[m])
                    notifyFrom.push(cpUuid[i])
                }

            }
        }
    }
    
    if(cpUser.length != 0 && uccName.length != 0){
        // console.log("JBKCSAJBC",notifyUsersID)
        // console.log("hdacbka",notifyFrom)
        // notifyUsersID=notifyUsersID.filter(distinct)
        // notifyFrom=notifyFrom.filter(distinct)
        // console.log("JBKCSAJBC",notifyUsersID)
        // console.log("hdacbka",notifyFrom)
        
        for(i in notifyUsersID){
            addToRecentlyNotified(notifyUsersID[i],notifyFrom[i])
        }
    }
    

    
}



getAllDataFromFirebase(db)

//Notification Implementation:



module.exports.admin = firebase







http.createServer(function (req, res) {
    var tokken, guid;
    if(req.method === "POST")
        {
            
            var body = "";
            req.on("data", function (piece) {
                body += piece;
            }).on("end", function(){



                const obj = JSON.parse(body);
                tokken = obj.token;
                guid = obj.uuid;





                noti(tokken);
                

                if (tokenList[guid] === undefined){
                    tokenList[guid] = [tokken];
                }
                else if(tokenList[guid] != tokken){
                    tokenList[guid].push(tokken)
                }


                //tokenList[guid] = tokken;
                //console.log(tokenList);

            });


            
            res.writeHead(201, { "Content-Type": "text/html" });
            return res.end();
        }

    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Server Up and Running');
}).listen(8080);








//noti()
// dat = db.collection('testingTable').doc('lragozzine').get();
// console.log("SPACE")

// dat1 = dat.then(function (result){
//     // console.log(11,result.data())
//     return result.data();
// })
// console.log(1,dat,dat1)
// getQuote().then( result =>{
//     console.log(123456789,result.body)
// })
