// Switch tabs between Games, People, and Companies and generate content
$(".content-tab").click(function() {
  setActiveItem(this);

  switch ($(this).text()) {
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
$(document).ready(function() {
  var active_tab = $(".content-tab.active");
  switch (active_tab.text()) {
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
    type     : "GET",
    url      : "https://www.boardgamegeek.com/xmlapi2/thing?id=" + game_id,
    dataType : "xml",
    success  : function(result) {
      // TODO: build a dictionary and inject it into the micro template
      var game_info_dict = {};

      $(result).find("items").each(function() {
        var $game_item                  = $(this).find("item");
        game_info_dict["name"]          = $game_item.find("name").attr("value");
        game_info_dict["image"]         = $game_item.find("image").text();
        game_info_dict["description"]   = $game_item.find("description").text();
        game_info_dict["yearpublished"] = $game_item.find("yearpublished").attr("value");
        game_info_dict["minplayers"]    = $game_item.find("minplayers").attr("value");
        game_info_dict["maxplayers"]    = $game_item.find("maxplayers").attr("value");
        game_info_dict["playingtime"]   = $game_item.find("playingtime").attr("value");
        game_info_dict["minplaytime"]   = $game_item.find("minplaytime").attr("value");
        game_info_dict["maxplaytime"]   = $game_item.find("maxplaytime").attr("value");
        game_info_dict["minage"]        = $game_item.find("minage").attr("value") + "+";

        $game_item.find("poll").each(function() {
          var $poll = $(this);

          switch($poll.attr("name")) {
            // Get the results of the poll for the suggested number of players
            case "suggested_numplayers":
              var results_dict_numplayers = {};

              $poll.find("results").each(function() {
                var $results = $(this);
                results_dict_numplayers[$results.attr("numplayers")] = {};

                $results.find("result").each(function() {
                  var $result = $(this);

                  results_dict_numplayers[$results.attr("numplayers")][$result.attr("value")] = $result.attr("numvotes");
                })
              });

              // Find the result with the highest "best" score, then put that number into the game_info_dict
              var max_votes = 0;
              var highest   = {"numplayers": 0, "numvotes": 0};
              var second    = {"numplayers": 0, "numvotes": 0};
              for (var numplayers in results_dict_numplayers) {
                if (results_dict_numplayers.hasOwnProperty(numplayers)) {
                  var votes_best = parseInt(results_dict_numplayers[numplayers]["Best"]);
                  if (votes_best > max_votes) {
                    if (second["numvotes"] < highest["numvotes"]) {
                      second["numplayers"] = highest["numplayers"];
                      second["numvotes"]   = highest["numvotes"];
                    }
                    
                    highest["numplayers"] = parseInt(numplayers);
                    highest["numvotes"]   = votes_best;
                    max_votes = votes_best;
                  }
                  else if (votes_best == max_votes) {
                    highest["numplayers"] = parseInt(numplayers);
                    highest["numvotes"]   = votes_best;
                  }
                }
              }

              // Only use '1-4' format if the highest doesn't have 1.5x the votes of the second highest
              if (second["numplayers"] == 0 || highest["numvotes"] / second["numvotes"] >= 1.5) {
                game_info_dict["suggested_numplayers"] = highest["numplayers"].toString();
              }
              else {
                game_info_dict["suggested_numplayers"] = second["numplayers"] + "-" + highest["numplayers"];
              }

              break;

            case "suggested_playerage":
              $poll.find("results").each(function() {
                var $results = $(this);
                var highest  = {"value": "", "numvotes": 0};
                
                $results.find("result").each(function() {
                  var $result       = $(this);
                  var current_votes = parseInt($result.attr("numvotes"));

                  if (current_votes > highest["numvotes"]) {
                    highest["value"]    = $result.attr("value");
                    highest["numvotes"] = current_votes;
                  }                  
                })
                
                // Add either '(no votes)', 'num+', or 'num and up'
                if (highest["numvotes"] == 0) {
                  game_info_dict["suggested_playerage"] = "(no votes)";
                }
                else if (highest["value"].length > 2) {
                  game_info_dict["suggested_playerage"] = highest["value"];  
                }
                else {
                  game_info_dict["suggested_playerage"] = highest["value"] + "+";
                }
              });
              debugger;
              break;

            case "language_dependence":
              $poll.find("results").each(function() {
                var $results = $(this);
                var highest  = {"level": "", "value": "", "numvotes": 0};
                
                $results.find("result").each(function() {
                  var $result       = $(this);
                  var current_votes = parseInt($result.attr("numvotes"));
                  
                  if (current_votes > highest["numvotes"]) {
                    highest["level"]    = $result.attr("level");
                    highest["value"]    = $result.attr("value");
                    highest["numvotes"] = current_votes;
                  }
                })
                  
                if (highest["numvotes"] == 0) {
                  game_info_dict["language_dependence"] = "(no votes)";
                }
                else {
                  game_info_dict["language_dependence"] = highest["value"];
                }
              });
              debugger;
              break;
          }
        });
      });
      
      var template = $("#game-detail-contents").html();
      var rendered = Mustache.render(template, game_info_dict);

      $("#modal-hotness-detail-body").html(rendered);
      $("#modal-hotness-detail").modal("show");
    },
    error: function(message) {

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
          var id             = $(this).attr("id");
          var thumbnail      = $(this).find("thumbnail").attr("value");
          var name           = $(this).find("name").attr("value");
          var year_published = $(this).find("yearpublished").attr("value");
          var game_info      = {
            "game_id"        : id,
            "thumbnail"      : thumbnail,
            "name"           : name,
            "year_published" : year_published
          };
          var rendered = Mustache.render(template, game_info);

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
    type     : "GET",
    url      : "https://www.boardgamegeek.com/xmlapi2/hot?type=boardgameperson",
    dataType : "xml",
    success  : function(result) {
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
            "id"        : id,
            "thumbnail" : thumbnail,
            "name"      : name,
            "topic"     : "People"
          };
          var rendered = Mustache.render(template, person_info);

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
    type     : "GET",
    url      : "https://www.boardgamegeek.com/xmlapi2/hot?type=boardgamecompany",
    dataType : "xml",
    success  : function(result) {
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
            "id"        : id,
            "thumbnail" : thumbnail,
            "name"      : name,
            "topic"     : "Companies"
          };
          var rendered = Mustache.render(template, person_info);

          $hotness_list.append(rendered);
        });
      });
    },
    error: function(message) {

    }
  });
}
