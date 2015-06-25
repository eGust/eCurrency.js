// http://egust.altervista.org/currency_api/google_rate.php?from=USD&targets=JPY:CNY:HKD:NZD

// freecurrencyconverterapi.com
function googleEncodeConvertions(from, targets) {
	return { from: from, targets: targets.join("_") };
}

function googleDecodeResponse(data, userdata) {
	return data.rates;
}

defaults.dataSource.push({
	name: 'google.com',
	ajax: {
		'json': {
			type: 'json',
			url: "http://egust.altervista.org/currency_api/google_rate.php",
			args: {},
			encoder: googleEncodeConvertions,
			responser: googleDecodeResponse,
		},
		'jsonp': {
			type: 'jsonp',
			url: "http://egust.altervista.org/currency_api/google_rate.php",
			args: {},
			encoder: googleEncodeConvertions,
			responser: googleDecodeResponse,
		},
	},
	site: {
		icon: 'http://www.google.com/images/google_favicon_128.png',
		title: 'google.com',
	},
});

