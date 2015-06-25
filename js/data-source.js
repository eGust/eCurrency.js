var	dataSource = [],
	defaults = {
		dataSource: [],
		ajaxFormats: {	// location.href.startsWith:
			'resource://': [ 'jsonp', 'xml', ],
			'chrome-extension://': [ 'json', 'xml', ],
		},
	};
