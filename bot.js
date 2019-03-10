console.log('Bot starting...');
const Twit = require('twit');
//const config = require('./config');
const fs = require('fs');
const fse = require('fs-extra');

var T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms:           60*1000,
  strictSSL:            true,
});

var json;
var hasTweeted = false;

// T.post('statuses/update', { status: 'hello world!' }, function(err, data, response) {
//   console.log(data)
// })

init("database.json");

update();
setInterval(update, 1000);

function tweetIt(txt) {
  T.post("statuses/update", {status: txt}, tweeted);
}

function tweetImg(txt, path) {
  var params = {encoding: 'base64'};
  var img = fs.readFileSync(path, params);

  T.post("media/upload", {media_data: img}, uploaded);

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

function init(filename) {
  var fromJSON = fs.readFileSync(filename);
  json = JSON.parse(fromJSON);

  console.log("Initied!");
}

function update() {
  var date = new Date();
  var month = date.getUTCMonth();
  var day = date.getUTCDate();
  var hour = date.getUTCHours();
  var minute = date.getUTCMinutes();
  var second = date.getUTCSeconds();

  console.log(day + "d " + hour + "h " + minute + "m " + second + "s");
  console.log(hasTweeted);

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
  if(day == 10 && hour == 15-1 && minute == 5 && second <= 3) {
    if(!hasTweeted) {
      hasTweeted = true;
      console.log("10th day of the month! (" + monthstr + ")");

      tweetIt("#ThisMonth Dev Test 0" + (month+1) + "/" + day + "/19"
      + "\n"
      + "„" + monthjson[9][0] + "”"
      + "\n\n"
      + "Remember:"
      + "The 14th " + monthjson[13][1] + ":\n"
      + monthjson[13][0]);
    }
  } else if(hasTweeted && second >= 4 && second <= 7) {
    hasTweeted = false;
  }
}

function tweeted(err, data, response) {
  if(err) {
    console.error("Tweet cannot be sent.");
  } else {
    console.log("Tweet sent!");
  }
}
