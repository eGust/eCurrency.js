var ajScope = null,
	ajApp = angular.module('eCurrency', []),
	commonCurrencies = settings.get('commons'),
	otherCurrencies = [];

function updateOthers() {
	var currencies = Object.keys(currencyDict).sort(), commons = {}, i;
	otherCurrencies.length = 0;

	for (i in commonCurrencies) {
		var cid = commonCurrencies[i];
		commons[cid] = cid;
	}

	for (i in currencies) {
		var cid  = currencies[i];
		if (cid in commons)
			continue;
		otherCurrencies.push(cid);
	}

	return otherCurrencies;
}

// init: global events, currencies, data source
+function staticInit() {
	// global events
	$(document)
		.on('click.combo.box', '.combo-box[role="dropdown-menu"]', function(event) {
			var input = $('input', $(this)), ii = input.autocomplete("instance");
			if (ii.menu.element.is(':visible')) {
				ii.close();
				return;
			}

			if (input.hasClass('ui-state-disabled')) return;

			input.autocomplete("search", "");
			input.select().focus();
		});
}();

function updateSaveCommon() {
	commonCurrencies.length = 0;
	for (var i in ajCommonBoxes) {
		var cid  = ajCommonBoxes[i].cid;
		if (cid == '')
			break;
		commonCurrencies.push(cid);
	}
	settings.set({ commons: commonCurrencies });
}

function generateMenu(input, settings) {
	var commons = null,
		ii = input.autocomplete({
			source: settings.source,
			minLength: 0,
			autoFocus: true,
			position: { my: "left top", at: "right top" },
			open: function ( event, ui ) {
				if (commons)
					return;

			    commons = commonCurrencies.slice();
				ajScope.$apply(function() {
					for (var i in commons) {
						ajCurrencyInfo[commons[i]].classes = 'hidden';
					}
				});
			},
			close: function ( event, ui ) {
				if (commons) {
					for (var i in commons) {
						ajCurrencyInfo[commons[i]].classes = '';
					}
					commons = null;
				}
				settings.input.val( settings.bind.cid );
			},
			select: function ( event, ui ) {
				var value = ui.item.value.trim();
				if ( value == '' || !(value in ajCurrencyInfo) || value == settings.bind.cid )
					return;

				updateSaveCommon();
				ajScope.$apply(function () {
					settings.bind.cid = value;
				});
				return false;
			},
	    }).autocomplete( "instance" );
	ii._renderItem = function( ul, item ) {
		return item.li.appendTo( ul );
	};

	ii.menu.element.addClass("dropdown-menu");
	return ii;
}

function initUI() {
	var i, items = [], currencies = Object.keys(ajCurrencyInfo).sort();

	for (i in currencies) {
		var cid = currencies[i], item = ajCurrencyInfo[cid];
		item.li = $('.menu-template > li[data-cid="'+cid+'"]');
		items.push(item);
	}

	for (i in ajCommonBoxes) {
		var input = ajCommonBoxes[i].input = $('input[data-index="'+i+'"]');
		generateMenu(
			input,
			{
				source: items,
				input: input,
				bind: ajCommonBoxes[i],
			});
	}

	ajScope.$apply(function () {
		for (i in commonCurrencies) {
			ajCommonBoxes[i].cid = commonCurrencies[i];
		}
	});
}

$(function () {
	initUI();
});

var ajApp = angular.module('eCurrency', []),
	ajScope,
	ajCommonBoxes,
	ajCurrencyInfo;

ajApp.config( [
	'$compileProvider',
	function( $compileProvider )
	{
		$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|resource|file):/);
		$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|resource|file):/);
	}
]);
ajApp.controller(
	'MainCtrl',
	function($scope){
		ajScope = $scope;

		var currencyInfo = {};
		for (var cid in currencyDict) {
			var currency = currencyDict[cid];
			currencyInfo[cid] = {
				cid: cid,
				name: currency.currencyName,
				symbol: currency.currencySymbol,
				classes: '',

				label: cid + '  ' + currency.currencyName,
				value: cid,
				li: null,
			}
		}

		var commons = [], MAX_COMMON = 20, LAST_INDEX = $scope.LAST_INDEX = MAX_COMMON-1;
		for (var i = 0; i < MAX_COMMON; i++) {
			commons.push({
				index: i,
				input: null,
				cid: '',
				state: function()
				{
					var item = this;
					if (item.cid != '')
						return 'removable';
					var index = item.index;
					if (index == 0 || commons[index-1].cid != '')
						return 'available';
					return 'disabled';
				},
				isDisabled: function() {
					return (this.cid == '' && this.index > 0 && commons[this.index-1].cid == '');
				},
				remove: function() {
					if (this.cid == '')
						return;

					for (var i = this.index+1; i < LAST_INDEX; i++) {
						var cidNew = commons[i].cid, old = commons[i-1];
						old.input.val(old.cid = cidNew);
						if (cidNew == '')
							break;
					}
					commons[LAST_INDEX].cid = '';
					updateSaveCommon();
				},
			});
		}

		$scope.currencyInfo = ajCurrencyInfo = currencyInfo;
		$scope.commonBoxes = ajCommonBoxes = commons;
		$scope.swapBox = function (id1, id2) {
			var cid1, cid2;
			if (id2 < 0 || id2 > LAST_INDEX || (cid2 = commons[id2].cid) == '')
				return;

			cid1 = commons[id1].cid;
			commons[id1].input.val(cid2);
			commons[id2].input.val(cid1);
			commons[id1].cid = cid2;
			commons[id2].cid = cid1;
			updateSaveCommon();
		}
	}
);
