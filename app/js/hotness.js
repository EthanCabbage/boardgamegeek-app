// Switch tabs between Games, People, and Companies and generate content
$(".content-tab").click(function() {
  setActiveItem(this);

  switch($(this).text()) {
    case "Games":
      populateHotGames();
      break;
    case "People":
      populateHotPeople();
      break;
    case "Companies":
      populateHotCompany();
      break;
  }
});


// On load, generate content for the active tab
$(document).ready(function () {
  var active_tab = $(".content-tab.active");
  switch(active_tab.text()) {
    case "Games":
      populateHotGames();
      break;
    case "People":
      populateHotPeople();
      break;
    case "Companies":
      populateHotCompany("boardgamecompany");
      break;
  }
});


// Populate the modal that displays details about the selected game
function showModalGameDetail(game_id) {
  $("#modal-game-detail").modal("show");
  
  $.ajax({
    type    : "GET",
    url     : "https://www.boardgamegeek.com/xmlapi2/thing?id=" + game_id,
    dataType: "xml",
    success : function(result) {
      // TODO: build a dictionary and inject it into the micro template
    },
    error   : function(message) {
      
    }
  });
}


// Create a list entry for each game in the top 50 Hotness list
function populateHotGames() {
  var $hotness_list = $("#hotness-list");
  var $loading_gif  = $("#hotness-loading-gif");
  
  $hotness_list.empty();
  $loading_gif.show();
  
  $.ajax({
    type: "GET",
    url: "https://www.boardgamegeek.com/xmlapi2/hot?type=boardgame",
    dataType: "xml",
    success: function(result) {
      var template = $("#hotness-row-three").html();
      
      Mustache.parse(template);
      $loading_gif.hide();
      
      $(result).find("items").each(function() {
        $(this).find("item").each(function() {
          var id              = $(this).attr("id");
          var thumbnail       = $(this).find("thumbnail").attr("value");
          var name            = $(this).find("name").attr("value");
          var year_published  = $(this).find("yearpublished").attr("value");
          var game_info       = {
                                  "game_id"       : id, 
                                  "thumbnail"     : thumbnail, 
                                  "name"          : name, 
                                  "year_published": year_published
                                };
          var rendered        = Mustache.render(template, game_info);
          
          $hotness_list.append(rendered);
        });
      });
    },
    error: function(message) {

    }
  });
}


// Create a list entry for each person in the top 50 Hotness list
function populateHotPeople() {
  var $hotness_list = $("#hotness-list");
  var $loading_gif  = $("#hotness-loading-gif");
  
  $hotness_list.empty();
  $loading_gif.show();
  
  $.ajax({
    type: "GET",
    url: "https://www.boardgamegeek.com/xmlapi2/hot?type=boardgameperson",
    dataType: "xml",
    success: function(result) {
      var $hotness_list = $("#hotness-list");
      var template      = $("#hotness-row-two").html();
      
      $hotness_list.empty();
      Mustache.parse(template);
      
      $loading_gif.hide();
      
      $(result).find("items").each(function() {
        $(this).find("item").each(function() {
          var id          = $(this).attr("id");
          var thumbnail   = $(this).find("thumbnail").attr("value");
          var name        = $(this).find("name").attr("value");
          var person_info = {
                              "id"       : id, 
                              "thumbnail": thumbnail, 
                              "name"     : name,
                              "topic"    : "People"
                            };
          var rendered    = Mustache.render(template, person_info);
          
          $hotness_list.append(rendered);
        });
      });
    },
    error: function(message) {

    }
  });
}


// Create a list entry for each company in the top 50 Hotness list
function populateHotCompany() {
  var $hotness_list = $("#hotness-list");
  var $loading_gif  = $("#hotness-loading-gif");
  
  $hotness_list.empty();
  $loading_gif.show();
  
  $.ajax({
    type: "GET",
    url: "https://www.boardgamegeek.com/xmlapi2/hot?type=boardgamecompany",
    dataType: "xml",
    success: function(result) {
      var $hotness_list = $("#hotness-list");
      var template      = $("#hotness-row-two").html();
      
      $hotness_list.empty();
      Mustache.parse(template);
      $loading_gif.hide();
      
      $(result).find("items").each(function() {
        $(this).find("item").each(function() {
          var id          = $(this).attr("id");
          var thumbnail   = $(this).find("thumbnail").attr("value");
          var name        = $(this).find("name").attr("value");
          var person_info = {
                              "id"       : id, 
                              "thumbnail": thumbnail, 
                              "name"     : name,
                              "topic"    : "Companies"
                            };
          var rendered    = Mustache.render(template, person_info);
          
          $hotness_list.append(rendered);
        });
      });
    },
    error: function(message) {

    }
  });
}
