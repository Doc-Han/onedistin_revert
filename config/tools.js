var currentTime = function() {
  var date = new Date();
  var year = date.getFullYear();
  var _month = parseInt(date.getMonth())+1;
  var month = "0"+_month;
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();
  var currentTime = year+month+day+hour+minute+second;
  return currentTime;
}

var currentDate = function() {
  var date = new Date();
  var year = date.getFullYear();
  var _month = parseInt(date.getMonth())+1;
  var month = "0"+_month;
  var day = date.getDate();
  var currentDate = year+month+day;
  return currentDate;
}

module.exports = {
  currentDate: currentDate,
  currentTime: currentTime
}
