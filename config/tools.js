var currentTime = function() {
  var date = new Date();
  var year = date.getFullYear();
  var _month = parseInt(date.getMonth())+1;
  var month = "0"+_month;
  var day = date.getDate().toString();
  if (day.length < 2){
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
  var day = date.getDate();
  if(day.length < 2){
    day = "0"+day;
  }
  var currentDate = year+month+day;
  return currentDate;
}

console.log(currentTime());

module.exports = {
  currentDate: currentDate,
  currentTime: currentTime
}
