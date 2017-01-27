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

function populateHotGames() {
  $.ajax({
    type: "GET",
    url: "https://www.boardgamegeek.com/xmlapi2/hot?type=boardgame",
    dataType: "xml",
    success: function(result) {
      var hotness_contents = $("#hotness-contents");
      hotness_contents.empty();
      hotness_contents.append("<ul id='hotness-list'></ul>");
      var hotness_list = $("#hotness-list");

      hotness_list.parent().prepend(
        "<div class='row'>" +
          "<div class='col-sm-3 center-text header-row first-header'>" +
            "Box Art" +
          "</div>" +
          "<div class='col-sm-6 center-text header-row'>" +
            "Title" +
          "</div>" +
          "<div class='col-sm-3 center-text header-row last-header'>" +
            "Year Published" +
          "</div>" +
        "</div>"
      );

      $(result).find("items").each(function() {
        $(this).find("item").each(function() {
          var id = $(this).attr("id");
          var thumbnail = $(this).find("thumbnail").attr("value");
          var name = $(this).find("name").attr("value");
          var year_published = $(this).find("yearpublished").attr("value");

          hotness_list.append(
            "<li>" +
              "<div class='row'>" +
                "<div class='col-sm-2'>" +
                  "<img src='http:" + thumbnail + "'>" +
                "</div>" +
                "<div class='col-sm-1'>" +
                  "<hr width='1' size='500'>" +
                "</div>" +
                "<div class='col-sm-6 center-vertical'>" +
                  "<a href='#'>" +
                    name +
                  "</a>" +
                "</div>" +
                "<div class='col-sm-1'>" +
                  "<hr width='1' size='500'>" +
                "</div>" +
                "<div class='col-sm-2 center-text center-vertical'>" +
                    year_published +
                "</div>" +
              "</div>" +
            "</li>"
          );
        });
      });
    },
    error: function(message) {

    }
  });
}

function populateHotPeople() {
  $.ajax({
    type: "GET",
    url: "https://www.boardgamegeek.com/xmlapi2/hot?type=boardgameperson",
    dataType: "xml",
    success: function(result) {
      var hotness_list = $("#hotness-list");
      hotness_list.empty();
      $(result).find("items").each(function() {
        $(this).find("item").each(function() {
          var id = $(this).attr("id");
          var thumbnail = $(this).find("thumbnail").attr("value");
          var name = $(this).find("name").attr("value");

          hotness_list.append(
            "<li>" +
              "<div class='row'>" +
                "<div class='col-sm-3'>" +
                  "<img src='http:" + thumbnail + "'>" +
                "</div>" +
                "<div class='col-sm-9 center-vertical'>" +
                  "<a href='#'>" +
                    name +
                  "</a>" +
                "</div>" +
              "</div>" +
            "</li>"
          );
        });
      });
    },
    error: function(message) {

    }
  });
}

function populateHotCompany() {
  $.ajax({
    type: "GET",
    url: "https://www.boardgamegeek.com/xmlapi2/hot?type=boardgamecompany",
    dataType: "xml",
    success: function(result) {
      var hotness_list = $("#hotness-list");
      hotness_list.empty();
      $(result).find("items").each(function() {
        $(this).find("item").each(function() {
          var id = $(this).attr("id");
          var thumbnail = $(this).find("thumbnail").attr("value");
          var name = $(this).find("name").attr("value");

          hotness_list.append(
            "<li>" +
              "<div class='row'>" +
                "<div class='col-sm-3'>" +
                  "<img src='http:" + thumbnail + "'>" +
                "</div>" +
                "<div class='col-sm-9 center-vertical'>" +
                  "<a href='#'>" +
                    name +
                  "</a>" +
                "</div>" +
              "</div>" +
            "</li>"
          );
        });
      });
    },
    error: function(message) {

    }
  });
}
