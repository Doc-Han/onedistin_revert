var hubtelpayment = require('hubtelmobilepayment');
  var hubtel_pay = new hubtelpayment({
  clientid: process.env.HUBTEL_CLIENT_ID,
  secretid: process.env.HUBTEL_CLIENT_SECRET,
  merchantaccnumber: process.env.HUBTEL_MERCHANT_ACCOUNT_NO,
});


module.exports = {
  hubtel_pay: hubtel_pay,
}
