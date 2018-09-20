$(document).ready(function(){
  $('.ipay-initiate').click(function(){
    $(this).addClass("ipay-wait").removeClass("ipay-initiate");
    $(this).html('<h3 style="margin:0;font-size: 22px;line-height:46px;text-align:center">loading...</h3>');
    var data = {
      username: $("[name='user_name']").val(),
      provider: $("[name='provider']").val(),
      phone: $("[name='order_phone']").val(),
      dealTitle: $("[name='p_t']").val(),
      ref: $("[name='ref_f_i_d']").val()
    }
    console.log(data);
    $.ajax({
      url: '/other/ipay',
      method: 'POST',
      data: data,
      success: function(res){
        if(res != "0"){
          $("[name='invoiceId']").val(res);
          $(".ipay-wait").html('<h3 style="margin:0;font-size: 22px;line-height:46px;text-align:center">Check your phone</h3>');
          setTimeout(function(){
            $(".ipay-wait").html('<h3 style="margin:0;font-size: 22px;line-height:46px;text-align:center">I\'m done paying</h3>');
            $(".ipay-wait").addClass("ipay-validate").removeClass("ipay-wait");
          },6000);
        }else{
          $(".ipay-wait").html('<h3 style="margin:0;font-size: 22px;line-height:46px;text-align:center">Retry!</h3>');
          $(".ipay-wait").addClass("ipay-initiate").removeClass("ipay-wait");
        }
      }
    });
  });


  $(".ipay-validate").click(function(){
    alert("Valitdateing");
    data = {
      invoiceId: $("[name='invoiceId']").val(),
    }
    $.ajax({
      url: '/other/ipay/validate',
      data: data,
      method: 'POST',
      success: function(res){

      }
    });
  });
});
