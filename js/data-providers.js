// http://egust.thefreephphost.com/currency_api/query_rate.php?provider=openexchangerates&from=CNY&targets=JPY_USD_HKD_NZD
/**
[Usage]
    parameters:
        provider    openexchangerates or currencylayer
        from        currency from
        targets     target currencies, joined with _
        callback    optional, for JSONP usage
    note:
        Because I'm using free plans, the limits are 1000 requests/month, and they only update the rates every 60 minuts for free plans, so my API also updates the rates every 60mins.
*/

// http://egust.altervista.org/currency_api/google_rate.php?from=USD&targets=JPY_CNY_HKD_NZD

function commonEncodeConvertions(from, targets) {
    return { from: from, targets: targets.join("_") };
}

function commonDecodeConvertions(data, userdata) {
    return data.rates;
}

defaults.dataSource = defaults.dataSource.concat([
    {
        name: 'openexchangerates.org',
        ajax: {
            'json': {
                type: 'json',
                url: "http://egust.thefreephphost.com/currency_api/query_rate.php",
                args: { provider: 'openexchangerates', },
                encoder: commonEncodeConvertions,
                responser: commonDecodeConvertions,
            },
            'jsonp': {
                type: 'jsonp',
                url: "http://egust.thefreephphost.com/currency_api/query_rate.php",
                args: { provider: 'openexchangerates', },
                encoder: commonEncodeConvertions,
                responser: commonDecodeConvertions,
            },
        },
        site: {
            icon: 'https://openexchangerates.org/favicon.ico',
            title: 'openexchangerates.org',
        },
    },
    {
        name: 'currencylayer.com',
        ajax: {
            'json': {
                type: 'json',
                url: "http://egust.thefreephphost.com/currency_api/query_rate.php",
                args: { provider: 'currencylayer', },
                encoder: commonEncodeConvertions,
                responser: commonDecodeConvertions,
            },
            'jsonp': {
                type: 'jsonp',
                url: "http://egust.thefreephphost.com/currency_api/query_rate.php",
                args: { provider: 'currencylayer', },
                encoder: commonEncodeConvertions,
                responser: commonDecodeConvertions,
            },
        },
        site: {
            icon: 'https://currencylayer.com/images/currencylayer_shortcut_icon.ico',
            title: 'currencylayer.com',
        },
    },
    {
        name: 'google.com',
        ajax: {
            'json': {
                type: 'json',
                url: "http://egust.altervista.org/currency_api/google_rate.php",
                args: {},
                encoder: commonEncodeConvertions,
                responser: commonDecodeConvertions,
            },
            'jsonp': {
                type: 'jsonp',
                url: "http://egust.altervista.org/currency_api/google_rate.php",
                args: {},
                encoder: commonEncodeConvertions,
                responser: commonDecodeConvertions,
            },
        },
        site: {
            icon: 'http://www.google.com/images/google_favicon_128.png',
            title: 'google.com',
        },
    },
]);
