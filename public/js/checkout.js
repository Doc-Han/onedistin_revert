$(document).ready(function(){
  var num = 1;
  var total = $("[class='acpoit']").val() * 1;
  var sum;
  var del = 0;
  function show(){
    if(del == 0){
      sum = (total * num) + 5;
    }else if(del == 1){
      sum = (total * num) + 10;
    }
    $('.total_price').text("GHS "+sum.toFixed(2));
    $("[name='total']").val(sum.toFixed(2));
  }
  $(".add-item-bar").click(function(){
    if(num <= 2){
      num++;
      var item = $(".checkout-items .single-item:first-child");
      var loc = $(".checkout-items");
      var itempricing = $(".item-pricing");
      var pricingproto = itempricing.html();
      var proto = item.html();
      loc.append(proto);
      itempricing.after("<dd>"+pricingproto+"</dd>");
      show();
      if(num==3){
        $(".add-item-bar").hide();
      }
    }

  });


  $("#low").click(function(){
    del = 0;
    $(".delivery-fee").text("GHS 5.00");
    show();
  });
  $("#high").click(function(){
    del = 1;
    $(".delivery-fee").text("GHS 10.00");
    show();
  });

  $(".show-coupon").click(function(){
    $(".coupon-box").toggle();
  });
  show();
});
