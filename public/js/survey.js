$(document).ready(function(){
  $(".submit-survey").click(function(){
    $(this).hide(500);
    var a = $("input[name='survey']:checked").val();
    data = {
      ans: a
    }
    $.ajax({
      url: '/other/survey',
      method: 'POST',
      data: data,
      success: function(res){
        if(res == "1"){
          $("#survey").html("<p>Your vote has been submitted.</p>");
        }else if(res == "0"){
          document.location = "/login";
          /*$("#survey").html("<h5 style='font-size:22px' class='muli-regular'>Please <a href='/login'>login</a> to make a vote.</h5>");*/
        }else{
          $("#survey").html("<p>There was an error submiting your vote. Please re-vote.</p>");
        }
      }
    });
  });
});
