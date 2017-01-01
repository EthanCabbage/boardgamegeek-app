$(document).ready(function() {
	var main_div = $("div#main-div");
	$.ajax({
		type: 'GET',
		url: 'https://www.boardgamegeek.com/xmlapi2/thing?id=113924',
		dataType: 'XML',
		success: function(xml) {
			var items = $(xml).find("items")[0];
			var item = $(items).children("item");
			var title = $(item).children("name")[0];
			title = $(title).attr("value");
			// TODO: Fix this, it isn't showing up
			console.log(title);
			console.log(main_div);
			main_div.append(
				"<h1>" + title + "</h1>"
			);
		},
		error: function(message) {
			alert(message);
		}
	});
});
