const UIDGenerator = require('uid-generator');
const uidgen = new UIDGenerator();
var cloudinary = require('cloudinary');

var currentTime = function() {
  var date = new Date();
  var year = date.getFullYear();
  var _month = parseInt(date.getMonth())+1;
  var month = "0"+_month;
  var day = date.getDate()+"";
  if (day.length == 1){
    day = "0"+day;
  }
  var hour = date.getHours().toString();
  if (hour.length < 2){
    hour = "0"+hour;
  }
  var minute = date.getMinutes().toString();
  if (minute.length < 2){
    minute = "0"+minute;
  }
  var second = date.getSeconds().toString();
  if (second.length < 2){
    second = "0"+second;
  }
  var currentTime = year+month+day+hour+minute+second;
  return currentTime;
}

var currentDate = function() {
  var date = new Date();
  var year = date.getFullYear();
  var _month = parseInt(date.getMonth())+1;
  var month = "0"+_month;
  var day = date.getDate()+"";
  if(day.length == 1){
    day = "0"+day;
  }
  var currentDate = year+month+day;
  return currentDate;
}

var getToken = function(){
  var uid = uidgen.generateSync();
  return uid;
}

var uploadImage = function(path){
  cloudinary.uploader.upload(path, function(img_res){
    if(img_res > 0){
      return img_res.public_id;
    }
  });
}

var dateToEdit = function(date){
  var y = date[0]+date[1]+date[2]+date[3];
  var m = date[4]+date[5];
  var d = date[6]+date[7];
  return rev = y+"-"+m+"-"+d;
}


module.exports = {
  currentDate: currentDate,
  currentTime: currentTime,
  getToken: getToken,
  uploadImage: uploadImage,
  dateToEdit: dateToEdit
}
