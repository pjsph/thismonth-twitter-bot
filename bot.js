console.log('Bot starting...');
/* ------------------------------------------------ */
const Twit = require('twit');
//const config = require('./config');
const fs = require('fs');
const fse = require('fs-extra');
const MySqlSync = require('sync-mysql');
const mysql = require('mysql');
/* ------------------------------------------------ */

/* ------------------------------------------------ */
// SYNC GET CONNECTION
var connection = new MySqlSync({
  host: process.env.DBHOST,
  user: process.env.DBUSER,
  password: process.env.DBPASS,
  database: process.env.DBNAME
});

// ASYNC POST CONNECTION
var connect2 = mysql.createConnection({
  host: process.env.DBHOST,
  user: process.env.DBUSER,
  password: process.env.DBPASS,
  database: process.env.DBNAME
});

var T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms:           60*1000,
  strictSSL:            true,
});

var json;
var status;
var oldStatus;
/* ------------------------------------------------ */

// T.post('statuses/update', { status: 'hello world!' }, function(err, data, response) {
//   console.log(data)
// })

/* ------------------------------------------------ */
init();

update();
setInterval(update, 1000);
/* ------------------------------------------------ */

/* ------------------------------------------------ */
function tweetIt(txt) {
  T.post("statuses/update", {status: txt}, tweeted);
}

function tweetImg(txt, path) {
  if(fs.existsSync(path)) {

    var params = {encoding: 'base64'};
    var img = fs.readFileSync(path, params);
    T.post("media/upload", {media_data: img}, uploaded);

  } else {
    console.error("Path : " + path + " does not exist.");
  }

  function uploaded(err, data, response) {
    if(err) {
      console.error("Error while uploading the image.");
    } else {
      console.log("Pic uploaded.");
      var id = data.media_id_string;
      T.post("statuses/update", {status: txt, media_ids: [id]}, tweeted);
    }
  }
}
/* ------------------------------------------------ */

/* ------------------------------------------------ */
function init() {
// JSON INITIALISATION
  const res = connection.query("SELECT * FROM json WHERE id=1");

  json = JSON.parse(res[0].json);
  console.log('Successfully cached Json.');

  status = json.status;
  oldStatus = json.oldStatus;

  console.log("Status: " + status + ";" + oldStatus);

  console.log("Initied!");
}

function update() {
  var date = new Date();
  var month = date.getUTCMonth();
  var day = date.getUTCDate(); // from 1 to 31
  var hour = date.getUTCHours();
  var minute = date.getUTCMinutes();
  var second = date.getUTCSeconds();

  checkDate(month, day, hour, minute, second);
}

function checkDate(month, day, hour, minute, second) {
  var monthstr;
  var monthjson;
  switch (month) {
    case 0:
      monthstr = "January";
      monthjson = json.month.January;
      break;
    case 1:
      monthstr = "February";
      monthjson = json.month.February;
      break;
    case 2:
      monthstr = "March";
      monthjson = json.month.March;
      break;
    case 3:
      monthstr = "April";
      monthjson = json.month.April;
      break;
    case 4:
      monthstr = "May";
      monthjson = json.month.May;
      break;
    case 5:
      monthstr = "June";
      monthjson = json.month.June;
      break;
    case 6:
      monthstr = "July";
      monthjson = json.month.July;
      break;
    case 7:
      monthstr = "August";
      monthjson = json.month.August;
      break;
    case 8:
      monthstr = "September";
      monthjson = json.month.September;
      break;
    case 9:
      monthstr = "October";
      monthjson = json.month.October;
      break;
    case 10:
      monthstr = "November";
      monthjson = json.month.November;
      break;
    case 11:
      monthstr = "December";
      monthjson = json.month.December;
      break;
    default:
      monthstr = "Nøne";
      monthjson = null;
      break;
  }
  //EVERY DAY
  if(/*hour == 0 && minute == 0 &&*/ second <= 3) {

    //STATUS UPDATE
    if(day > 0 && day <= 7) status = 1;
    else if(day > 7 && day <= 14) status = 2;
    else if(day > 14 && day <= 21) status = 3;
    else if(day > 21 && day <= 31) status = 4;

    //TIME TO TWEET
    if(status != oldStatus) {
      oldStatus = status;

      //SAVE DB
      connect2.connect();
      json.status = status;
      json.oldStatus = oldStatus;
      var newjson = JSON.stringify(json);

      connect2.query('UPDATE json SET json = ? WHERE id = 1', [newjson], function(error, results, fields) {
        if(error) console.log("Error while updating database.");
        else console.log("Successfully saved database.");
      });

      connect2.end(function(error) {
        if(error) console.log("Error while ending connection.");
        else console.log("Async connection ended.");
      });

      // IT'S THE 1ST PERIOD (TWEET IMAGE)
      if(status == 1) {
        tweetImg("Have a nice month!", "./Pics/" + monthstr + ".jpg");
      }

      var tweet = monthstr + " (" + status + "/4)";

      //SAVE DESCRIPTION OF THE DAY
      var datas = [];
      var index = [];

      //SET INDEX OF THE DAYS
      if(status == 1) index = [-1, 6];
      else if(status == 2) index = [6, 13];
      else if(status == 3) index = [13, 20];
      else if(status == 4) index = [20, 30];

      //SAVE THE DATAS OF THE SPECIFIED INDEX
      for(var i = (index[0]+1); i <= index[1]; i++) {
        if(monthjson[i] != null) {
          if(monthjson[i][0] != "") {
            datas.push([i+1, monthjson[i][0], monthjson[i][1]]);
          }
        }
      }

      //COMPOSE THE TWEET
      if(Array.isArray(datas) && datas.length !== 0) {
        //DATAS ARE NOT EMPTY
        for(var i = 0; i < datas.length; i++) {
          var suffix;
          if(!endsWith(datas[i][0].toString(), "11") && endsWith(datas[i][0].toString(), "1")) suffix = "st";
          else if(!endsWith(datas[i][0].toString(), "12") && endsWith(datas[i][0].toString(), "2")) suffix = "nd";
          else if(!endsWith(datas[i][0].toString(), "13") && endsWith(datas[i][0].toString(), "3")) suffix = "rd";
          else suffix = "th";

          tweet += "\n\nThe " + datas[i][0] + suffix + " (" + datas[i][2].substr(0, 3) + "): „" + datas[i][1] + "”";
        }
      } else {
        //DATAS ARE NULL
        tweet += "\n\nNothing to remember this period!";
      }

      tweetIt("#ThisMonth " + tweet + "\n\nSee you the " + (status == 4 ? "1" : index[1]+2) + (status == 4 ? "st" : (index[1]+2 == 22 ? "nd" : "th")) + "!");
      // console.log("#ThisMonth " + tweet + "\n\nSee you the " + (status == 4 ? "1" : index[1]+2) + (status == 4 ? "st" : (index[1]+2 == 22 ? "nd" : "th")) + "!");
    }
  }
}
/* ------------------------------------------------ */

/* ------------------------------------------------ */
function tweeted(err, data, response) {
  if(err) {
    console.error("Tweet cannot be sent.");
  } else {
    console.log("Tweet sent!");
  }
}

function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
/* ------------------------------------------------ */
