$(document).ready(function(){
    var data= [0,0,0,0];
    /* 1. Visualizing things on Hover - See next part for action on click */
    $('.starVote li').on('mouseover', function(){
      var onStar = parseInt($(this).data('value'), 10); // The star currently mouse on
     
      // Now highlight all the stars that's not after the current hovered star
      $(this).parent().children('li.star').each(function(e){
        if (e < onStar) {
          $(this).addClass('hover');
        }
        else {
          $(this).removeClass('hover');
        }
      });
      
    }).on('mouseout', function(){
      $(this).parent().children('li.star').each(function(e){
        $(this).removeClass('hover');
      });
    });
    
    
    /* 2. Action to perform on click */
    $('.starVote li').on('click', function(){
      var onStar = parseInt($(this).data('value'), 10); // The star currently selected
      var stars = $(this).parent().children('li.star');
      var onRule = parseInt($(this).parent().data('value'),10);

      data[onRule-1]= onStar;
//      console.log(onRule);
//      console.log(data);

      for (i = 0; i < stars.length; i++) {
        $(stars[i]).removeClass('selected');
      }
      
      for (i = 0; i < onStar; i++) {
        $(stars[i]).addClass('selected');
      }
      
      // JUST RESPONSE (Not needed)
      var ratingValue = parseInt($('#stars li.selected').last().data('value'), 10);
      var msg = "";
      if (ratingValue > 1) {
          msg = "Thanks! You rated this " + ratingValue + " stars.";
      }
      else {
          msg = "We will improve ourselves. You rated this " + ratingValue + " stars.";
      }
      responseMessage(msg);
      
    });
    
    $("#sendBtn").on('click', () =>{
      
      if(validation(data)){
        var userid = $("#user-id").val();
        $.post('/vote',{
          userid: userid,
          sc1: data[0],
          sc2: data[1],
          sc3: data[2],
          sc4: data[3]
        }).done( (res) => {
          if(res.error){
            $('#fail-modal').modal('toggle');
          } else {
            $('#success-modal').modal('toggle');
          }
        });
      } else {
        console.log("Validate fail");
        $('.error-toast').stop().fadeIn(400).delay(2500).fadeOut(400);
      }
      
    });
    
    $(".modal button").on("click",() =>{
      data = [0,0,0,0];
      $("li.star").removeClass('selected');
    })

    $('.ui.dropdown').dropdown();
  });
  
  
  function responseMessage(msg) {
    $('.success-box').fadeIn(200);  
    $('.success-box div.text-message').html("<span>" + msg + "</span>");
  }

  function validation(data) {
    var flag = true;
    data.forEach(element => {
      if(element < 1) {
        flag= false;
      }
    });
    return flag;
  }