var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
let cors = require("cors");
const PORT = process.env.PORT || 3000;
var router = express.Router();
var app = express();

// body parser added
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());
app.use('/files', express.static(path.join(__dirname , 'public')));

// test route

var getIndex = require("./index.js");

router.get("/", function (req, res) {
    res.send({ message: "trying to deploy backend" });
});

// router.all("/rooms",cors(), getIndex.display);


// router.all("/", function (req, res) {
//   res.send({ message: "welcome to our upload module apis" });
// });


app.use(getIndex)
app.use("/myserver", router);
app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
  })
console.log("server is listening...");