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

	// commons, currencyDict -> currencyArray
	var cd = {}, options = settings.options;
	for (var i in options.commons) {
		var cid = options.commons[i], c = currencyDict[cid];
		cd[cid] = c;
		currencyArray.push(cid);
	}

	var cids = Object.keys(currencyDict).sort();
	for (var i in cids) {
		var cid = cids[i];
		if (cid in cd)
			continue;
		currencyArray.push(cid);
	}

	// dataSource
	var ajaxFmts = ['jsonp'], href = location.href;
	for (var fmt in defaults.ajaxFormats) {
		if (href.indexOf(fmt) == 0) {
			ajaxFmts = defaults.ajaxFormats[fmt];
			break;
		}
	}

	for (var i in defaults.dataSource) {
		var src = defaults.dataSource[i];
		for (var j in ajaxFmts) {
			var fmt = ajaxFmts[j];
			if (fmt in src.ajax) {
				var ajax = src.ajax[fmt];
				ajax.name = src.name;
				ajax.site = src.site;
				dataSource.push(ajax);
				break;
			}
		}
	}
}();

function reloadSettings() {
	try {
		var options = settings.options;

		if (options.fromCurrency) {
			ajScope.currencyFrom.cid = options.fromCurrency;
		}

		if (options.amountFrom) {
			ajScope.amountFrom = options.amountFrom;
		}

		if (options.targets) {
			for (var i in options.targets) {
				ajTargets[i].cid = options.targets[i];
			}
		}

		if (options.source) {
			for (var i in dataSource) {
				var ds = dataSource[i];
				if (ds.name == options.source) {
					ajScope.curSource = ds;
					break;
				}
			}
		}
	} catch (e) {}
	finally {
		ajScope.$apply();
	}
}

function saveCurrencies(isTarget) {
	if (isTarget) {
		var targets = [];
		for (var i in ajTargets) {
			var cid = ajTargets[i].cid;
			if (cid == '')
				break;
			targets.push(cid);
		}
		settings.set({ targets: targets });
	} else {
		settings.set({ fromCurrency: ajScope.currencyFrom.cid });
	}
}

function generateMenu(input, settings) {
	var modified = null,
		ii = input.autocomplete({
			source: settings.source,
			minLength: 0,
			autoFocus: true,
			position: settings.pos,
			open: function ( event, ui ) {
				if (modified)
					return;

				modified = {};
				var cid;

				// add new classes
			    if (settings.isTarget) {
			    	for (var i in ajTargets) {
			    		var t = ajTargets[i];
			    		if (t.state() != 'removable')
			    			break;
						cid = t.cid;
			    		(modified[cid] = ajMenuItemDict[cid]).classes = 'hidden';
			    	}
					cid = ajScope.currencyFrom.cid;
			    	(modified[cid] = ajMenuItemDict[cid]).classes = 'hidden';
			    }

			    var cidThis = settings.bind.cid;
			    if (cidThis.length) {
			    	(modified[cidThis] = ajMenuItemDict[cidThis]).classes = 'ui-state-disabled';
			    }

			    isOpen = true;
				ajScope.$apply();
			},
			close: function ( event, ui ) {
				if (modified) {
					/*// remove old classes
					for (var i in settings.source) {
						settings.source[i].classes = '';
					}
					//*/
					for (var cid in modified) {
						modified[cid].classes = "";
					}
					modified = null;
				}
				//console.log('close menu', Date.now());

				settings.input.val( settings.bind.cid );
			},
			select: function ( event, ui ) {
				//console.log('select menu', Date.now());

				var value = ui.item.value.trim();
				if ( (value == '' && !settings.isTarget) || !(value in ajMenuItemDict) || value == settings.bind.cid )
					return;

				if (!settings.isTarget) {	// from currency
					// make a dict of all targets
					var targets = {};
			    	for (var i in ajTargets) {
			    		var t = ajTargets[i];
			    		if (t.state() != 'removable')
			    			break;
			    		targets[t.cid] = t;
			    	}

			    	if (value in targets) {	// swap
						var t = targets[value];
						t.input.val(t.cid = settings.bind.cid);
			    		saveCurrencies(true);
			    	}
				}

				// reset rate/amount/back
		    	for (var i in ajTargets) {
		    		var t = ajTargets[i];
		    		t.rate = '';
		    		if (t.state() != 'removable')
		    			break;
		    	}

				if ( value == '' ) {	// remove currency
					ajScope.$apply(function () {
						settings.bind.reset();
					});
					return false;
				}

				settings.bind.cid = value;
				saveCurrencies(settings.isTarget);
				ajScope.$apply();
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
	var i, j, k, itemClose = ajMenuItemDict[''], inputFrom = $('#fromCurrency > input'), items = [];

	itemClose.li = $('.menu-template > li[data-cid=""]');
	//itemClose.ref = itemClose;
	for (i in currencyArray) {
		var cid = currencyArray[i], item = ajMenuItemDict[cid];
		item.li = $('.menu-template > li[data-cid="'+cid+'"]');
		//item.ref = item;
		items.push(item);
	}

	generateMenu(
		inputFrom,
		{
			source: items,
			pos: { my: "left top", at: "left bottom", },
			isTarget: false,
			input: inputFrom,
			bind: ajScope.currencyFrom,
		});

	items = [itemClose].concat(items);
	for (i in ajTargets) {
		var input = $('input[data-index="'+i+'"]');
		//ajTargets[i].menuItems = items;
		ajTargets[i].input = input;
		generateMenu(
			input,
			{
				source: items,
				pos: i < 4 ? { my: "left top", at: "right top" } : { my: "left bottom", at: "right bottom" },
				isTarget: true,
				input: input,
				bind: ajTargets[i],
			});
	}
}

function requestRates(cidFrom, targets, source, $http) {
	var settings = {
			url: source.url,
			data: {},
			dataType: source.type,
			success: function (data) {
				var decoded = source.responser(data);

				for (var k in decoded) {
					targets[k].rate = decoded[k];
				}

				ajScope.$apply();
			},
			error: function() {
				//cbError = '[fail] AJAX time-out';
			},
		};

	for (var k in source.args) {
		settings.data[k] = source.args[k];
	}

	var datas = source.encoder(cidFrom, Object.keys(targets));
	for (var k in datas) {
		settings.data[k] = datas[k];
	}

	$.ajax(settings);
}

$(function () {
	setTimeout(function () {
		initUI();
		reloadSettings();
		ajScope.$apply(function () {
			var ds = ajScope.dataSource;
			for (var i = 0, _len = ds.length; i < _len; i++) {
				var src = ds[i];
				src['icon'] = src.site.icon;
			}
		});
	}, 10);
});

var ajApp = angular.module('eCurrency', []),
	ajTargets,
	ajScope,
	ajMenuItemDict = {};

ajApp
.config(['$compileProvider',
	function( $compileProvider )
	{
		$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|resource|file):/);
		$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|resource|file):/);
	}
])
.controller('MainCtrl', ['$scope', '$http',
	function($scope, $http){
		ajScope = $scope;

		ajMenuItemDict[''] = {
			cid: '',
			name: 'Remove Currency',
			symbol: '',
			classes: '',

			label: '',
			value: '',
			li: null,
		};

		var currencyItems = {};

		for (var cid in currencyDict) {
			var currency = currencyDict[cid], item = {
				cid: cid,
				name: currency.currencyName,
				symbol: currency.currencySymbol,
				classes: '',

				label: cid + '  ' + currency.currencyName,
				value: cid,
				li: null,
			}
			currencyItems[cid] = ajMenuItemDict[cid] = item;
		}

		var targets = [];
		for (var i = 0; i < 9; i++) {
			targets.push({
				index: i,
				state: function()
				{
					var item = this;
					if (item.cid != '')
						return 'removable';
					var index = item.index;
					if (index == 0 || ajTargets[index-1].cid != '')
						return 'available';
					return 'disabled';
				},
				isDisabled: function() {
					return (this.cid == '' && this.index > 0 && ajTargets[this.index-1].cid == '');
				},
				input: null,
				cid: '',
				rate: '',
				amount: function () {
					r = '';
					try {
						var rate = new Decimal(this.rate), amountFrom = new Decimal($scope.amountFrom);
						return amountFrom.times(rate).toDP(6).toString();
					} catch (e) {
						return '';
					}
				},
				back: function () {
					r = '';
					try {
						var rate = new Decimal(this.rate), amountFrom = new Decimal($scope.amountFrom);
						return amountFrom.dividedBy(rate).toDP(6).toString();
					} catch (e) {
						return '';
					}
				},
				reset: function() {
					if (this.cid == '')
						return;

					for (var i = this.index+1; i < 9; i++) {
						var cidNew = targets[i].cid, tt = targets[i-1];
						tt.input.val(tt.cid = cidNew);
						if (cidNew == '')
							break;
					}
					targets[8].cid = '';
					saveCurrencies(true);
				}
			});
		}

		$scope.currencyFrom = { cid: 'USD' };
		//$scope.currencyDict = currencyDict;
		$scope.currencyItems = currencyItems;
		$scope.targets = ajTargets = targets;
		$scope.dataSource = dataSource;
		$scope.curSource = dataSource[0];
		$scope.menuItemDict = ajMenuItemDict;
		$scope.amountFrom = 100;
		$scope.autoRefresh = false;

		$scope.selectSource = function (name) {
			if (name == $scope.curSource.name)
				return;

			for (var i in dataSource) {
				var ds = dataSource[i];
				if (ds.name == name) {
					$scope.curSource = ds;
					break;
				}
			}
			settings.set( { source: name, } );
		}

		$scope.submitQuest = function () {
			var tcs = {}, cnt = 0;
			for (var i in targets) {
				var tc = targets[i], cid = tc.cid;
				if (cid == '')
					break;
				tcs[cid] = tc;
				++cnt;
			}

			if (cnt == 0)
				return;

			settings.set( { amountFrom: $scope.amountFrom } );
			requestRates($scope.currencyFrom.cid, tcs, $scope.curSource, $http);
		};

		$scope.toggleAutoRefresh = function () {
			$scope.autoRefresh = !$scope.autoRefresh;
		}
	}
]);
