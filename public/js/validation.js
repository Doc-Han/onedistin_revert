$(document).ready(function(){
  $("[name='username']").blur(function(){
    var input = $("[name='username']");
    var val = input.val();
    var data = {
      username: val
    }

    $.ajax({
      url: '/ajax/validate/username',
      method: 'POST',
      data: data,
      success: function(res){
        if(res == "1"){
          $(".errs .username").html("<div class='panel w3-red w3-padding'>This username has been taken!</div>");
        }else {
          $(".errs .username").html("");
        }
      }
    });

  });

  $("[name='email']").blur(function(){
    var val = $("[name='email']").val();
    var data = {
      email: val
    }
    $.ajax({
      url: '/ajax/validate/email',
      method: 'POST',
      data: data,
      success: function(res){
        if(res == 1){
          $(".errs .email").html("<div class='panel w3-red w3-padding'>The email is already been used!</div>");
        }else{
          $(".errs .email").html("");
        }
      }
    })
  });
});


function validate_signup(){
  if($("input").val() == "" || $("select").val() == ""){
    //alert("empty!");
    return false;
  }else{
    alert("filled!");
  }
}
