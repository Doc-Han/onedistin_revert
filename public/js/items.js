function local_deals(title, old_price, new_price, location, off){
  var div = '<div></div>';
  var span = '<span></span>';
  var card = $(div).addClass('card');
  var img = $(div).addClass('img');
  var bar1 = $(div).addClass('w3-bar');
  var bar2 = $(div);
  var title = $(span).addClass('w3-large').text(title);
  var span1 = $(span).addClass('w3-right');
  var span2 = $('<s></s>').html($(span).addClass('w3-text-grey').text('GHS'+old_price));
  var span3 = $(span).addClass('w3-text-yellow').text(' GHS'+new_price);
  var location = $(span).addClass('w3-text-grey').text(location);
  var off = $(span).addClass('w3-right w3-border w3-margin-bottom w3-border-yellow w3-round-large w3-text-yellow w3-padding').text(off+'% off')

  span1.append(span2,span3);

  bar1.append(title,span1);
  bar2.append(location,off);

  card.append(img,bar1,bar2);
  $(".local_deals").append(card);
}


function deal_of_the_day(title, old_price, new_price, time_left){
  var div = '<div></div>';
  var span = '<span></span>';
  var card = $(div).addClass('card');
  var img = $(div).addClass('img');
  var bar1 = $(div).addClass('w3-bar');
  var bar2 = $(div);
  var title = $(span).addClass('w3-large').text(title);
  var span1 = $(span).addClass('w3-right');
  var span2 = $('<s></s>').html($(span).addClass('w3-text-grey').text('GHS'+old_price));
  var span3 = $(span).addClass('w3-text-yellow').text(' GHS'+new_price);
  var timer = $(span).addClass('w3-right w3-margin-bottom w3-text-red w3-padding').text(time_left);

  span1.append(span2,span3);

  bar1.append(title,span1);
  bar2.append(timer);

  card.append(img,bar1,bar2);
  $(".deal_of_the_day").append(card);
}


function more_deals(title, old_price, new_price, off) {
  var div = '<div></div>';
  var span = '<span></span>';
  var card = $(div).addClass('card');
  var img = $(div).addClass('img');
  var bar1 = $(div).addClass('w3-bar');
  var bar2 = $(div);
  var title = $(span).addClass('w3-large').text(title);
  var span1 = $(span).addClass('w3-right');
  var span2 = $('<s></s>').html($(span).addClass('w3-text-grey').text('GHS'+old_price));
  var span3 = $(span).addClass('w3-text-yellow').text(' GHS'+new_price);
  var off = $(span).addClass('w3-right w3-border w3-margin-bottom w3-border-yellow w3-round-large w3-text-yellow w3-padding').text(off+'% off')

  span1.append(span2,span3);

  bar1.append(title,span1);
  bar2.append(off);

  card.append(img,bar1,bar2);
  $(".more_deals").append(card);
}
