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
        game_info_dict["id"]            = $game_item.attr("id");
        game_info_dict["name"]          = $game_item.find("name").attr("value");
        game_info_dict["image"]         = $game_item.find("image").text();
        game_info_dict["description"]   = $game_item.find("description").text();
        game_info_dict["yearpublished"] = $game_item.find("yearpublished").attr("value");
        game_info_dict["playingtime"]   = $game_item.find("playingtime").attr("value");
        game_info_dict["minplaytime"]   = $game_item.find("minplaytime").attr("value");
        game_info_dict["maxplaytime"]   = $game_item.find("maxplaytime").attr("value");
        game_info_dict["minage"]        = $game_item.find("minage").attr("value") + "+";

        var minplayers = $game_item.find("minplayers").attr("value");
        var maxplayers = $game_item.find("maxplayers").attr("value");
        if (maxplayers == "1") {
          game_info_dict["numplayers"] = "1 Player";
        }
        else {
          game_info_dict["numplayers"] = minplayers + "-" + maxplayers + " Players";
        }

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

              var max_votes_best         = 0;
              var maxplayers_best        = {"numplayers": 0, "numvotes": 0};
              var minplayers_best        = {"numplayers": 0, "numvotes": 0};
              var max_votes_recommended  = 0
              var minplayers_recommended = {"numplayers": "", "numvotes": 0};
              var maxplayers_recommended = {"numplayers": "", "numvotes": 0};
              for (var numplayers in results_dict_numplayers) {
                if (results_dict_numplayers.hasOwnProperty(numplayers)) {
                  // Find the result with the highest "best" score, then put that number into the game_info_dict
                  var votes_best = parseInt(results_dict_numplayers[numplayers]["Best"]);

                  if (votes_best > max_votes_best) {
                    if (minplayers_best["numvotes"] < maxplayers_best["numvotes"]) {
                      minplayers_best["numplayers"] = maxplayers_best["numplayers"];
                      minplayers_best["numvotes"]   = maxplayers_best["numvotes"];
                    }
                    
                    maxplayers_best["numplayers"] = parseInt(numplayers);
                    maxplayers_best["numvotes"]   = votes_best;
                    max_votes_best = votes_best;
                  }
                  else if (votes_best == max_votes_best) {
                    maxplayers_best["numplayers"] = parseInt(numplayers);
                    maxplayers_best["numvotes"]   = votes_best;
                  }

                  // Find the result with the highest "recommended" score, then put that number into the game_info_dict
                  var votes_recommended = parseInt(results_dict_numplayers[numplayers]["Recommended"]);

                  if (votes_recommended > max_votes_recommended) {
                    max_votes_recommended = votes_recommended;
                  }

                  if (votes_recommended > 0 && numplayers.indexOf("+") <= -1) {
                    maxplayers_recommended["numplayers"] = numplayers;
                    maxplayers_recommended["numvotes"]   = votes_recommended;

                    if (minplayers_recommended["numplayers"] == 0) {
                      minplayers_recommended["numplayers"] = numplayers;
                      minplayers_recommended["numvotes"]   = votes_recommended;                      
                    }
                  }
                  else if (votes_recommended > 0 && numplayers.indexOf("+") > -1) {
                    if (max_votes_recommended / votes_recommended < 1.5) {
                      maxplayers_recommended["numplayers"] = numplayers;
                      maxplayers_recommended["numvotes"]   = votes_recommended;

                      if (minplayers_recommended["numplayers"] == 0) {
                        minplayers_recommended["numplayers"] = numplayers;
                        minplayers_recommended["numvotes"]   = votes_recommended;                      
                      }
                    }
                  }
                }
              }

              // First list the community's recommended values
              if (maxplayers_recommended["numvotes"] == 0) {
                game_info_dict["suggested_numplayers"] = "Community: (no votes)";
              }
              // Only list a single number if max and min are the same
              else if (minplayers_recommended["numplayers"] == "" 
                    || maxplayers_recommended["numplayers"] == minplayers_recommended["numplayers"]) {
                game_info_dict["suggested_numplayers"] = "Community: " 
                                                         + minplayers_recommended["numplayers"];
              }
              // Otherwise use the '1-4' format
              else {
                game_info_dict["suggested_numplayers"] = "Community: "
                                                         + minplayers_recommended["numplayers"]
                                                         + "-"
                                                         + maxplayers_recommended["numplayers"];
              }

              // Then list the community's best values
              if (maxplayers_best["numvotes"] == 0) { }
              // Only list a single number if maxplayers_best doesn't have 1.5x the votes of minplayers_best or if max and min are the same
              else if (minplayers_best["numplayers"] == 0 
                    || maxplayers_best["numvotes"] / minplayers_best["numvotes"] >= 1.5
                    || maxplayers_best["numplayers"] == minplayers_best["numplayers"]) {
                game_info_dict["suggested_numplayers"] += ", Best: " 
                                                          + maxplayers_best["numplayers"];
              }
              // Otherwise use the '1-4' format
              else {
                game_info_dict["suggested_numplayers"] += ", Best: " 
                                                          + minplayers_best["numplayers"] 
                                                          + "-" 
                                                          + maxplayers_best["numplayers"];
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

              break;
          }
        });

        var boardgamecategory_list  = [];
        var boardgamemechanic_list  = [];
        var boardgamefamily_list    = [];
        var boardgamedesigner_list  = [];
        var boardgameartist_list    = [];
        var boardgamepublisher_list = [];

        $game_item.find("link").each(function() {
          var $link = $(this);

          switch($link.attr("type")) {
            case "boardgamecategory":
              boardgamecategory_list.push({
                "id"    : $link.attr("id"),
                "value" : $link.attr("value"),
                "comma" : true
              });

              break;

            case "boardgamemechanic":
              boardgamemechanic_list.push({
                "id"    : $link.attr("id"),
                "value" : $link.attr("value"),
                "comma" : true
              });

              break;

            case "boardgamefamily":
              boardgamefamily_list.push({
                "id"    : $link.attr("id"),
                "value" : $link.attr("value"),
                "comma" : true
              });

              break;

            case "boardgamedesigner":
              boardgamedesigner_list.push({
                "id"    : $link.attr("id"),
                "value" : $link.attr("value"),
                "comma" : true
              });

              break;

            case "boardgameartist":
              boardgameartist_list.push({
                "id"    : $link.attr("id"),
                "value" : $link.attr("value"),
                "comma" : true
              });

              break;

            case "boardgamepublisher":
              boardgamepublisher_list.push({
                "id"    : $link.attr("id"),
                "value" : $link.attr("value"),
                "comma" : true
              });

              break;
          }
        });

        if (boardgamecategory_list.length > 0) {
          delete boardgamecategory_list[boardgamecategory_list.length - 1]["comma"];
        }
        if (boardgamemechanic_list.length > 0) {
          delete boardgamemechanic_list[boardgamemechanic_list.length - 1]["comma"];
        }
        if (boardgamefamily_list.length > 0) {
          delete boardgamefamily_list[boardgamefamily_list.length - 1]["comma"];
        }
        if (boardgamedesigner_list.length > 0) {
          delete boardgamedesigner_list[boardgamedesigner_list.length - 1]["comma"];
        }
        if (boardgameartist_list.length > 0) {
          delete boardgameartist_list[boardgameartist_list.length - 1]["comma"];
        }
        if (boardgamepublisher_list.length > 0) {
          delete boardgamepublisher_list[boardgamepublisher_list.length - 1]["comma"];
        }

        game_info_dict["boardgamecategories"] = boardgamecategory_list;
        game_info_dict["boardgamemechanics"] = boardgamemechanic_list;
        game_info_dict["boardgamefamilies"] = boardgamefamily_list;
        game_info_dict["boardgamedesigners"] = boardgamedesigner_list;
        game_info_dict["boardgameartists"] = boardgameartist_list;
        game_info_dict["boardgamepublishers"] = boardgamepublisher_list;
      });
      
      var template = $("#game-detail-contents").html();
      var rendered = Mustache.render(template, game_info_dict);

      $("#modal-hotness-detail-body").html(rendered);
      $("#modal-hotness-detail-header").text(game_info_dict["name"]);

      $(".rating").hover(
        function() {
          $(this).removeClass("glyphicon-star");
          $(this).addClass("glyphicon-star-empty");

          $(this).prevAll().removeClass("glyphicon-star");
          $(this).prevAll().addClass("glyphicon-star-empty");
        },
        function() {
          $(this).removeClass("glyphicon-star-empty");
          $(this).addClass("glyphicon-star");

          $(this).prevAll().removeClass("glyphicon-star-empty");
          $(this).prevAll().addClass("glyphicon-star");
        }
      );
      
      $("#modal-hotness-detail").modal("show");
    },
    error: function(message) {
      console.log(message.responseText);
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
