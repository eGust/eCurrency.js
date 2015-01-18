//	need jQuery

function ExIcon(obj) {
	function generateChildren(dest, options) {
		if (options.image)
			dest.append($('<img>').attr('src', options.image).attr('alt', options.label));
		else
			dest.html( $('<span>').addClass('label').text(options.label) );
		return dest;
	}

	function generateWithOptions(options) {
		/*
			size: default 16
			image: url
			label: string
		*/
		var size = options.size || 16;
		return generateChildren($('<span>').addClass('icon').addClass('icon-'+size), options);
	};

	function generateWithObject(obj) {
		var options = { image: obj.attr('data-icon-image'), label: obj.attr('data-icon-label'), };
		return generateChildren( obj, options );
	}

	if (obj instanceof jQuery) {
		return generateWithObject(obj);
	} else {
		return generateWithOptions(obj);
	}
}

$(function () {
	$('.icon').each(function () {
		ExIcon($(this));
	});
});

+function setupDropdownMenu() {
	var openingMenu = null;
	$(document)
		.on('click.dropdown.close.menu', function () {
				var current = openingMenu;
				openingMenu = null;

				$('.open-menu').removeClass('open-menu');
				if (current) {
					current.addClass('open-menu');
				}
			})
		.on('click.dropdown.open.menu', '.click-to-popup-menu:has(>.dropdown-menu)', function (e) {
				var menu = $(this);
				openingMenu = menu.hasClass('open-menu') ? null : menu;
			});
}();

