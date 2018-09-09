$(document).ready(function(){
var n = 1;
  var hv = $("[class='acpoit']").val();
  var hvsplt = hv.split("-");
  var low_del = 5;
  var high_del = 10;
  var offrs = hvsplt[0];
  var offr_on = offrs[0];
  var offr_tw = offrs[1];
  var offr_tr = offrs[2];
  var ttl = hvsplt[1];
  var sm;
  var del = 0;
  function show(){

    if(del == 0 && offr_on == 0){
      sm = (ttl * n);
      if(offr_tw == 1){
        sm = sm - (0.05*sm);
      }
      if(offr_tr == 1){
        sm = sm - (0.1*sm);
      }
      sm = sm + low_del;
    }else if(del == 0 && offr_on != 0){
      sm = (ttl * n);
      if(offr_tw == 1){
        sm = sm - (0.05*sm);
      }
      if(offr_tr == 1){
        sm = sm - (0.1*sm);
      }
    }else if(del == 1 && offr_on == 0){
      sm = (ttl * n);
      if(offr_tw == 1){
        sm = sm - (0.05*sm);
      }
      if(offr_tr == 1){
        sm = sm - (0.1*sm);
      }
      sm = sm +high_del;
    }else if(del == 1 && offr_on != 0){
      sm = (ttl * n);
      if(offr_tw == 1){
        sm = sm - (0.05*sm);
      }
      if(offr_tr == 1){
        sm = sm - (0.1*sm);
      }
    }


    $('.total_price').text("GHS "+sm.toFixed(2));
    $("[name='total']").val(sm.toFixed(2));
  }
  $(".add-item-bar").click(function(){
    if(n <= 2){
      n++;
      var item = $(".checkout-items .single-item:first-child");
      var loc = $(".checkout-items");
      var ip = $(".item-pricing");
      var pp = ip.html();
      var prt = item.html();
      loc.append(prt);
      ip.after("<dd>"+pp+"</dd>");
      show();
      if(n==3){
        $(".add-item-bar").hide();
      }
    }

  });

  if($("#low").length < 1){
    del = 1;
    $(".delivery-fee").text("GHS 10.00");
    show();
  }

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
