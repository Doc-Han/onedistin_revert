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

  function cat_price(){
    var len = $("[name='category']").length;
    if(len < 1){

    }else if(len > 2){
      var first = $("[name='category']:eq(0)").find("option:selected").attr("rel-data");
      var second = $("[name='category']:eq(1)").find("option:selected").attr("rel-data");
      if((first*1) != ttl){
        ttl = first;
      }
      if((second*1) != ttl){
        ttl = second;
      }
      $(".pprice").text(ttl);
      effect();
      show();
    }else if(len == 1){
      var first = $("[name='category']:eq(0)").find("option:selected").attr("rel-data");
      if((first*1) != ttl){
        ttl = first;
      }
      $(".pprice").text(ttl);
      effect();
      show();
    }
  }
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
      del = 3;
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
      sm = sm + high_del;
    }else if(del == 1 && offr_on != 0){
      del = 3;
      sm = (ttl * n);
      if(offr_tw == 1){
        sm = sm - (0.05*sm);
      }
      if(offr_tr == 1){
        sm = sm - (0.1*sm);
      }
    }else if(del == 3){
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

  $("[name='category']").change(function(){
    var length = $("[name='category']").length;
    var len = length/n;
    if(len > 1){
      var first = $("[name='category']:eq(0)").find("option:selected").attr("rel-data");
      var second = $("[name='category']:eq(1)").find("option:selected").attr("rel-data");
      if((first*1) != ttl){
        ttl = first;
      }
      if((second*1) != ttl){
        ttl = second
      }
      effect();
      show();
    }else{
      var first = $("[name='category']:eq(0)").find("option:selected").attr("rel-data");
      if((first*1) != ttl){
        ttl = first;
      }
      effect();
      show();
    }
    $(".pprice").text(ttl);
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

  $(".apply-coupon").click(function(){
    var code = $(".coupon-input").val();
    data = {
      code: code.trim()
    }
    if(code.trim() == ""){
      alert("Empty coupon doesn't exist!");
    }else{
      $(".apply-coupon").text("wait...");
      $.ajax({
        url: '/other/coupon',
        data: data,
        method: 'POST',
        success: function(res){
          if(res != "0" && res != "F1"){
            $(".apply-coupon").hide;
            $(".show-coupon").after("<p class='w3-green'>Coupon "+code+" Applied</p>");
            $(".show-coupon").hide();
            $(".coupon-box").hide();
            $(".coupon-tag").text(res+"% off");
            var discount = (res*1)/100;
            ttl = ttl - (ttl*discount);
            show();
          }else if(res == "F1"){
            offr_on = 1;
            high_del = 0;
            low_del = 0;
            $(".f_delivery").html("<p>Your delivery is free</p>");
            $(".apply-coupon").hide;
            $(".show-coupon").after("<p class='w3-green'>Coupon "+code+" Applied</p>");
            $(".show-coupon").hide();
            $(".coupon-box").hide();
            $(".delivery-fee").addClass("w3-green w3-tag").removeClass("text-color-inverse");
            $(".delivery-fee").text("free delivery");
            show();
          }else{
            $(".apply-coupon").text("Apply");
            $(".coupon-error").text("Invalid coupon code!");
          }
        }
      })
    }
    show();
  });
  effect();
  show();
  cat_price();
});

function validate(){
  if($("[name='user_name']").val() == "" || $("[name='user_address']").val() == "" || $("[name='user_city']").val() == "" || $("[name='user_phone']").val() == ""){
    $(".error").html('<p class="w3-text-red">Please fill out all inputs!<p>');
  }else{
    $(".error").html('');
    document.getElementById('id02').style.display='block';
  }
}
