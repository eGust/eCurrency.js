var	dataSource = [],
	defaults = {
		dataSource: [],
		ajaxFormats: {	// location.href.startsWith:
			'resource://': [ 'json', 'xml', ],
			'chrome-extension://': [ 'json', 'xml', ],
		},
	};
