// freecurrencyconverterapi.com
function fccaEncodeConvertions(from, targets) {
	var q = (targets).map(
		function(t) {
			return from + '_' + t;
		}).join(',');
	return { q: q };
}

function fccaDecodeResponse(data, userdata) {
	console.log(data);
	var r = {};
	for (var k in data) {
		r[k.split('_')[1]] = data[k].val;
	}
	return r;
}

defaults.dataSource.push({
	name: 'freecurrencyconverterapi.com',
	ajax: {
		'json': {
			type: 'json',
			url: "http://www.freecurrencyconverterapi.com/api/v3/convert",
			args: {
				compact: 'y',
			},
			encoder: fccaEncodeConvertions,
			responser: fccaDecodeResponse,
		},
		'jsonp': {
			type: 'jsonp',
			url: "http://www.freecurrencyconverterapi.com/api/v3/convert",
			args: {
				compact: 'y',
			},
			encoder: fccaEncodeConvertions,
			responser: fccaDecodeResponse,
		},
	},
	site: {
		icon: 'http://www.freecurrencyconverterapi.com/favicon.ico',
		title: 'freecurrencyconverterapi.com',
	},
});

