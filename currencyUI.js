var eventsSetuped = false, 
	manager = null, options = { fromCurrency: "USD", targets: ['CNY'], fromAmount: 100, },
	currencyDict = null, flags = null, commonArray = null, 
	defaultCommon = "USD,EUR,CNY,GBP,JPY,HKD,CAD,AUD,BRL,INR,RUB";

function loadInitData() {
	if (currencyDict)
		return;

	flags = jsonpObjs.pop();
	currencyDict = jsonpObjs.pop().results;
	commonArray = defaultCommon.split(',');
}

function jpcbResponseRate(data) {
	var fromAmount = new Decimal( options.fromAmount );
	for (var key in data) {
		var rate = data[key].val, target = key.split('_')[1], row = manager.selectedCurrencies[target]; 
		//$('.row:has([name="currency"][data-currency="'+target+'"])');
		row.rate.text(rate);
		rate = new Decimal(rate);
		row.amount.text( fromAmount.times(rate).toDP(6).toString() );
		row.back.text( fromAmount.dividedBy(rate).toDP(6).toString() );
	}
}

function myAjaxJsonp(url) {
	var script = $('<script>').attr('time-stamp', 'time_'+Date.now()).attr('src', url);
	$('head').append( script );
	script.remove();
}

function requestRate() {
	const url = 'http://www.freecurrencyconverterapi.com/api/v3/convert?q={$cnvt}&compact=y&callback={$cb}';
	var targets = Object.keys(manager.selectedCurrencies);
	if ( targets.length == 0 )
		return;

	var fromCurrency = manager.fromCurrency,
		cnvt = targets.map(function (t) {
			return fromCurrency + '_' + t;
		}).join(',');

	try {
		var amount = $('#amountFrom').val();
		new Decimal(amount);
		options.fromAmount = amount;
	} catch (e) {
		$('#amountFrom').val(options.fromAmount);
	} finally {
		myStg.set( { 'fromAmount': options.fromAmount } );
		$.ajax({
		    url: 'http://www.freecurrencyconverterapi.com/api/v3/convert',
		    dataType: "json",
		    data: {
		        q: cnvt,
		        compact: 'y',
		    },
		    success: jpcbResponseRate,
		    error: function () {
				$.ajax({
				    url: 'http://www.freecurrencyconverterapi.com/api/v3/convert',
				    jsonpCallback: "jpcbResponseRate",
				    dataType: "jsonp",
				    data: {
				        q: cnvt,
				        compact: 'y',
				    },
				});
		    },
		});
	}
}

function setupEvents() {
	if (eventsSetuped)
		return;

	$(document)
		.on('click.row.remove', '.row.removable>.index>.icon', function() {
			var input = $('.label[name="currency"]', $(this).parent().parent()), data = input.data('data');
			data.oldValue = data.newValue;
			changeInputCurrency(input, data, '');
		})
		.on('click.combo.box', '.combo-box[role="dropdown-menu"]', function(event) {
			var input = $('input', $(this)), ii = input.autocomplete("instance");
			if (ii.menu.element.is(':visible')) {
				ii.close();
				return;
			}

			if (input.hasClass('ui-state-disabled')) return;

			input.autocomplete("search", "");
			input.select().focus();
		})
		.on('submit', '#fromAmount', function (e) {
			e.preventDefault();
			requestRate();
		})
		.on('click', '.search', function (e) {
			$('#fromAmount').submit();
		});
}

function reloadSettings() {
	try {
		//commonArray = defaultCommon.split(',');
		var settings = myStg.getAll();
		for (var k in settings) {
			options[k] = settings[k];
		}
	} catch (e) {}
	finally {
		//
	}
}

function initUI() {
	$('#amountFrom').val(options.fromAmount);

	manager = new UIRowGroupManager(currencyDict, commonArray);
	var rows = manager.generateRows($('.row.template'), 9), tb = $('.toBox');
	for (var i in rows) {
		$('.number', rows[i]).text((i|0)+1);
		tb.append(rows[i]);
	}

	manager
		.setCurrencyChangedEvent(
			function (row, cid, oldCid) {
				if (!manager.loadingOptions)
					myStg.set( manager.options() );
				if (row) {
					row.input.parent().attr('title', (cid && cid.length) ? currencyDict[cid].currencyName : 'Target currency' );
					row.rate.text('');
					row.amount.text('');
					row.back.text('');
				}
			})
		.setFromInput(
			$('#fromCurrency .label[name="currency"]'),
			function (cid) { // changed event
				var symbol = currencyDict[cid].currencySymbol || '';
				$('#fromAmount .icon > .label').attr('title', currencyDict[cid].currencyName).text(symbol);
				//saveSettings( { 'fromCurrency': cid } );
			})
		.options( options );
	$('.row.template').remove();
}

$(function () {
	setupEvents();
	loadInitData();
	reloadSettings();
	initUI();
});
