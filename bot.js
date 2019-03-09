console.log('Bot starting...');
const Twit = require('twit');
const config = require('./config');
const fs = require('fs');
const fse = require('fs-extra');

var T = new Twit(config);

var hasTweeted = false;

// T.post('statuses/update', { status: 'hello world!' }, function(err, data, response) {
//   console.log(data)
// })

init();
setInterval(init, 1000);

function tweetIt(txt) {
  T.post({status: txt}, tweeted);
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

function init() {
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
  switch (month) {
    case 0:
      monthstr = "January";
      break;
    case 1:
      monthstr = "February";
      break;
    case 2:
      monthstr = "March";
      break;
    case 3:
      monthstr = "April";
      break;
    case 4:
      monthstr = "May";
      break;
    case 5:
      monthstr = "June";
      break;
    case 6:
      monthstr = "July";
      break;
    case 7:
      monthstr = "August";
      break;
    case 8:
      monthstr = "September";
      break;
    case 9:
      monthstr = "October";
      break;
    case 10:
      monthstr = "November";
      break;
    case 11:
      monthstr = "December";
      break;
    default:
      monthstr = "None";
      break;
  }
  if(/*day == 1 &&*/ hour == 19-1 && minute == 0 && second <= 3) {
    if(!hasTweeted) {
      hasTweeted = true;
      console.log("19h! /*day of the month! (" + monthstr + ")*/");
      tweetIt("#ThisMonth Dev Test : it's 6pm!");
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
