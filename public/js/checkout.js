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

    $(".payment_details").val(n+"-"+del+"-"+ttl);

    if(n == 1){
      $(".reduce-item:first-child").hide();
    }


    $('.total_price').text("GHS "+sm.toFixed(2));
    $("[name='total']").val(sm.toFixed(2));
  }

  $(".add-item-bar").click(function(){
    if(n <= 2){
      n++;
      //This is for the checkout item increment
      var item = $(".checkout-items .single-item:first-child");
      var loc = $(".checkout-items");
      var prt = item.html();
      loc.append(prt);
      //This is for the checkout price increment
      var ip = $(".item-pricing:first-child");
      var pp = ip.html();
      ip.after("<dd class='item-pricing'>"+pp+"</dd>");
      show();
      if(n==3){
        $(".add-item-bar").hide();
      }

      if(n > 1){
          $(".reduce-item:first-child").show();
      }

    }

  });

  $(document).on("click",".reduce-item", function(){
    if(n > 1){
      n--;
      $(".add-item-bar").show();
      $(this).parent().remove();
      var ip = $(".item-pricing:first-child");
      ip.remove();
      show();
    }
    if(n == 1){
        $(".reduce-item:first-child").hide();
    }
  });

  /*if($("#low").length < 1){
    del = 1;
    $(".delivery-fee").text("GHS 10.00");
    show();
  }*/
  function effect(){
    if($("[name='user_region']").val() == "Greater Accra"){
      del = 0;
      $(".delivery-fee").text("GHS 5.00");
    }else{
      del = 1;
      $(".delivery-fee").text("GHS 10.00");
    }
  }

  $("[name='user_region']").change(function(){
    if($("[name='user_region']").val() == "Greater Accra"){
      $("#del_table01").hide();
      $("#del_table02").show();
      del = 0;
      $(".delivery-fee").text("GHS 5.00");
      effect();
      show();
    }else{
      $("#del_table01").show();
      $("#del_table02").hide();
      del = 1;
      $(".delivery-fee").text("GHS 10.00");
      effect();
      show();
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
