$(document).ready(function(){
  $("#thing-get-add").click(function(){
    $(this).before('<textarea style="resize: none" name="thingGet" placeholder="You get ..." class="thing-get w3-input w3-border w3-border-grey w3-round w3-animate-left"></textarea>');
  });

  $("#thing-get-reduce").click(function(){
    $(".thing-get:last").remove();
  });

});
