$(document).ready(function(){
  $("[name='survey']").click(function(){
    var a = $(this).val();
    data = {
      ans: a
    }
    $.ajax({
      url: '/other/survey',
      method: 'POST',
      data: data,
      success: function(res){
        alert(res);
      }
    })
  });
});
