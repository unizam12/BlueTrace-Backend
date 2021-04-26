var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
let cors = require("cors");
const PORT = process.env.PORT || 3000;
var router = express.Router();
var app = express();
//var getIndex = require("./index.js");
var getIndexNoti = require("./index_noti.js");

// body parser added
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use(cors());
app.use("/files", express.static(path.join(__dirname, "public")));

// test route
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
	res.send("POST REQUEST PROCESSED");
});

router.get("/", function (req, res) {
	res.send({ message: "trying to deploy backend" });
});

// router.all("/rooms",cors(), getIndex.display);

// router.all("/", function (req, res) {
//   res.send({ message: "welcome to our upload module apis" });
// });
app.get("/", (req, res) => {
	res.send("Blue Trace back end server!! ver: 12.0");
});

// app.use(getIndex)
app.use(getIndexNoti);
app.use("/myserver", router);
app.listen(PORT, () => {
	console.log(`Example app listening at http://localhost:${PORT}`);
});
console.log("server is listening...");
