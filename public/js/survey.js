$(document).ready(function(){
  $(".submit-survey").click(function(){
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
        }else{
          $("#survey").html("<p>There was an error submiting your vote. Please re-vote.</p>");
        }
      }
    })
  });
});
