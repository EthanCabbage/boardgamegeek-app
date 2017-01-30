// TODO: Remove this when not editing!
document.addEventListener("keydown", function (e) {
	if (e.which === 116) {
		location.reload();
	}
});

// function htmlbodyHeightUpdate() {
// 	var height3 = $(window).height()
// 	var height1 = $('.nav').height()+50
// 	height2 = $('.main').height()
// 	if(height2 > height3){
// 		$('html').height(Math.max(height1,height3,height2)+10);
// 		$('body').height(Math.max(height1,height3,height2)+10);
// 	}
// 	else
// 	{
// 		$('html').height(Math.max(height1,height3,height2));
// 		$('body').height(Math.max(height1,height3,height2));
// 	}
// }

function setActiveItem(item) {
	$(item).siblings().removeClass("active");
	$(item).addClass("active");
}

$(document).ready(function () {
	// htmlbodyHeightUpdate();
	//
	// $(window).resize(function() {
	// 	htmlbodyHeightUpdate();
	// });
	//
	// $(window).scroll(function() {
	// 	height2 = $('.main').height();
	// 	htmlbodyHeightUpdate();
	// });

	$.get("homepage.html", function(data) {
		$("#page-content").html(data);
	});

	$("#navbar-search").click(function() {
		setActiveItem(this);
		$.get("search.html", function(data) {
			$("#page-content").html(data);
		});
	});

	$("#navbar-home").click(function() {
		setActiveItem(this);
		$.get("homepage.html", function(data) {
			$("#page-content").html(data);
		});
	});

	$("#navbar-hotness").click(function() {
		setActiveItem(this);
		$.get("hotness.html", function(data) {
			$("#page-content").html(data);
		});
	});
});
