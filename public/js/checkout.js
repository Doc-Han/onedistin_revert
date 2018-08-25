$(document).ready(function(){
  var num = 1;
  function setPrice(){

  }
  $(".add-item-bar").click(function(){
    if(num < 3){
      num++;
      var item = $(".checkout-items .single-item:first-child");
      var loc = $(".checkout-items");
      var itempricing = $(".item-pricing");
      var pricingproto = itempricing.html();
      var proto = item.html();
      loc.append(proto);
      itempricing.after("<dd>"+pricingproto+"</dd>");
    }else{
      alert('You can only buy a maximum of three');
    }

  });


  $("#low").click(function(){
    $(".delivery-fee").text("GHS 5.0");
  });
  $("#high").click(function(){
    $(".delivery-fee").text("GHS 10.0");
  });

  $(".show-coupon").click(function(){
    $(".coupon-box").toggle();
  });
});
