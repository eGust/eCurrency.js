function changeInputCurrency(input, data, cid, options) {
	if ( !input )
		return;

	var old = data.oldValue, changed = cid != old, li = data.liMap[cid] || data.liClose, changedEvent = data.changedEvent;
	if (!(options && options.forceChange) && li.hasClass('ui-state-disabled'))
		return;

	data.oldValue = null;
	data.newValue = cid;
	input.val( cid ).attr('data-currency', cid);
	$('.icon', input.parent()).html( $('.icon', li).html() );

	changed && ( !(options && options.noEvent) ) && changedEvent && changedEvent instanceof Function 
		&& changedEvent.apply(data.thisPtr, [ cid, old, input ]);
}

function generateMenu(input, data, pos) {
	var 
		ii = input.autocomplete({
			source: data.data,
			minLength: 0,
			autoFocus: true,
			position: pos,
			/*
			focus: function( event, ui ) {
				input.val( ui.item.value );
				$('.icon', input.parent()).html( $('.icon', ui.item.li).html() );
				return false;
			},
			*/
			open: function ( event, ui ) {
				data.oldValue = data.newValue;
			},
			close: function ( event, ui ) {
				if (data.oldValue != null)
					input.val( data.oldValue );
			},
			select: function ( event, ui ) {
				changeInputCurrency(input, data, ui.item.value.trim());
				return false;
			},
	    }).autocomplete( "instance" );
    ii._renderItem = function( ul, item ) {
     	return item.li.appendTo( ul );
    };
    ii.menu.element.addClass("dropdown-menu");
}

function UIRowManager(index, manager, row, data) {
	if (UIRowManager.prototype.state == undefined) {
		const
			states = {
				disabled: 'disabled',
				removable: 'removable',
				available: 'available',
			},
			self = UIRowManager.prototype;

		function onCurrencyChanged(cid, oldCid, input) {
			this.manager.onCurrencyChanged(this, cid, oldCid);
		}

		self.reset = function (row) {
			this.row = row;
			this.currency = $('.currency>.currency', row);
			this.input = $('.label[name="currency"]', row);
			this.rate = $('.rate > .value', row);
			this.amount = $('.amount > .value', row);
			this.back = $('.Back > .value', row);

			this.data.thisPtr = this;
			this.data.changedEvent = onCurrencyChanged;
			this.data.oldValue = null;
			this.data.newValue = '';
			this.data.index = this.index;
			this.input.data('data', this.data);
			generateMenu(this.input, this.data, 
				this.index < 4 ? { my: "left top", at: "right top" } : { my: "left bottom", at: "right bottom" });
		};

		function getState(row) {
			for (var state in states) {
				if (row.hasClass(state))
					return state;
			}
			return 'unknown';
		}

		function removeState(state) {
			if (state == 'unknown')
				return;

			this.row.removeClass(state);
			if (state == 'disabled') {
				this.input.removeClass('ui-state-disabled').removeAttr('disabled');
			}
		}

		function addState(state, oldState) {
			this.row.addClass(state);
			if (state == 'disabled') {
				this.input.addClass('ui-state-disabled').attr('disabled', 'disabled').attr('data-cancel', '').val('');
				ExIcon($('.icon', this.currency));
				this.rate.text('');
				this.amount.text('');
				this.back.text('');
				this.input.parent().removeAttr('title');
			} else if (state == 'available') {
				if (oldState == 'removable') {
					this.input.attr('data-cancel', '').val('');
					ExIcon($('.icon', this.currency));
					this.rate.text('');
					this.amount.text('');
					this.back.text('');
				}
				this.data.liClose.removeClass('ui-state-disabled');
				this.input.parent().attr('title', 'Select target Currency');
			} else if (state == 'removable') {
				//this.data.liClose.addClass('ui-state-disabled');
			}
		}

		self.state = function (value) {
			var state = getState(this.row);
			if (!value)
				return state; 

			if (value in states && state != value) {
				removeState.apply(this, [state]);
				addState.apply(this, [value, state]);
			}
			return this;
		};
	}

	this.data = data;
	this.index = index;
	this.manager = manager;
	this.reset(row);
}

function UIRowGroupManager(currencies, common) {
	if (UIRowGroupManager.prototype.generateRows == undefined) {
		var
			currencyData = { data: [], liMap: {} },
			currencyDict = {}, commonArray = common,
			currencyArray = null, commonDict = {},
			liClose = null,
			self = UIRowGroupManager.prototype;

		var i, k;
		// currency/common Dict and Array
		for (k in currencies) {
			if (k in flags)
				currencyDict[k] = currencies[k];
		}
		currencyArray = Object.keys(currencyDict).sort();

		for (i = 0; i < commonArray.length; i++) {
			k = commonArray[i];
			commonDict[k] = k;
		};

		// currencyData
		function menuitemWithIcon(attrs, icon) {
			var r = $('<li>').addClass('menuitem').append(ExIcon(icon));
			for (var k in attrs)
				r.attr[k] = attrs[k];
			return r;
		}

		liClose = menuitemWithIcon({title: 'Cancel'}, { label: '>' }).addClass('currency')
				.append( $('<span>').addClass('close').text('X') ).attr('title', 'Remove Currency');

		function next(c) {
			var cid = c.id, 
				li = menuitemWithIcon({title: cid}, {label: c.currencySymbol, image: './flags'+flags[cid] })
					.addClass('currency').addClass('common').attr('title', c.currencyName).attr('cid', cid)
					.append( $('<b>').text(cid) ).append(' - '+c.currencyName);

			currencyData.data.push({
					label: cid + ' - '+c.currencyName, 
					value: cid, 
					li: currencyData.liMap[cid] = li,
				});
		}

		for (i in commonArray) {
			next(currencyDict[commonArray[i]]);
		}

		for (i in currencyArray) {
			var cid = currencyArray[i];
			if ( !(cid in commonDict) )
				next(currencyDict[cid]);
		};

		// clone data
		function newRowData() {
			var src = currencyData.data, idx = 0, dst = new Array(src.length+1), map = {};
			dst[0] = {
				label: 'close',
				value: ' ',
				li: liClose.clone(),
			};

			for (var i in src) {
				var d = src[i], cid = d.value;
				dst[++idx] = { 
						label: d.label, 
						value: cid, 
						li: map[cid] = d.li.clone(),
					};
			}
			return { data: dst, liMap: map, liClose: dst[0].li, };
		}

		self.generateRows = function(template, count) {
			var dh = template.html(), r = new Array(count), rows = new Array(count);

			for (var i = 0; i < count; i++) {
				var row = new UIRowManager(
						i, 
						this, 
						r[i] = $('<div>').addClass('row').html(dh), 
						newRowData()
					);
				row.state('disabled');
				rows[i] = row;
			}
			this.rows = rows;
			return r;
		};

		function onFromCurrencyChanged(cid, oldCid) {
			self.onCurrencyChanged.apply(currencyData.thisPtr, [null, cid, oldCid]);
			var changedEvent = currencyData.thisPtr.fromInputChangedEvent;
			changedEvent && changedEvent(cid);
		}

		self.setFromInput = function(input, changedEvent) {
			this.fromInput = input;
			this.fromInputChangedEvent = changedEvent;
			currencyData.thisPtr = this;
			currencyData.changedEvent = onFromCurrencyChanged;
			currencyData.oldValue = null;
			currencyData.newValue = '';
			generateMenu(input, currencyData);
			return this;
		};

		self.setCurrencyChangedEvent = function(changedEvent) {
			this.currencyChangedEvent = changedEvent;
			return this;
		}

		self.onCurrencyChanged = function(row, cid, oldCid) {
			if (!row) {
				this.fromCurrency = cid;
				if (oldCid && oldCid.length) {
					if (row=this.selectedCurrencies[cid]) {
						// swap
						changeInputCurrency(row.input, row.data, oldCid, {forceChange: true, noEvent: true});
						
						row.data.liMap[cid].hide();
						row.rate.text('');
						row.amount.text('');
						row.back.text('');
						delete this.selectedCurrencies[cid];
						this.selectedCurrencies[oldCid] = row;

						cid = oldCid;
						oldCid = null;
					}
				}
			}

			this.currencyChangedEvent && this.currencyChangedEvent(row, cid, oldCid);

			var i, j, r;
			// remove old disabled
			if (oldCid && oldCid.length) {
				for (i in this.rows) {
					r = this.rows[i];
					r.data.liMap[oldCid].removeClass('ui-state-disabled').show();
				}
				delete this.selectedCurrencies[oldCid];
			}

			// add new disabled
			if (cid && cid.length) {
				for (var i in this.rows) {
					this.rows[i].data.liMap[cid].addClass('ui-state-disabled').hide();
				}

				if (row) {
					row.state('removable');
					this.selectedCurrencies[cid] = row;
				}
			} else {
				// change state to available
				r = row;
				var last = this.rows.length - 1, lastRow = this.rows[last];
				for (i = row.index+1; i <= last; i++) {
					var rn = this.rows[i], nstate = rn.state();
					if (nstate == 'disabled') {
						lastRow = rn;
						break;
					}

					var ncid = rn.data.newValue;
					if (ncid.length) {
						this.selectedCurrencies[ncid] = r;
						rn.data.liMap[ncid].hide();
					}
					changeInputCurrency(r.state(rn.state()).input, r.data, ncid, {forceChange: true, noEvent: true});
					r.input.parent().attr('title', rn.input.parent().attr('title'));
					r = rn;
				}
				changeInputCurrency(lastRow.state('disabled').input, lastRow.data, '', { noEvent: true });
			}

			// manage rows
			var available = 0;
			for (; available < this.rows.length; available++) {
				if (this.rows[available].state() != "removable")
					break;
			}

			for (i = 0; i < available; i++) {
				this.rows[i].state('removable');
			}

			if (available < this.rows.length) {
				this.rows[available].state('available');
				for (i = available+1; i < this.rows.length; i++)
					this.rows[i].state('disabled');
			}

			// show current selected
			for (var cid in this.selectedCurrencies) {
				row = this.selectedCurrencies[cid];
				row.data.liMap[cid].show();
			}
		};

		self.options = function (options) {
			if (options) {
				try {
					this.loadingOptions = true;

					var targets = options.targets;
					if (targets && targets.length) {
						for (var i in targets) {
							var cid = targets[i], row = this.rows[i];
							if (cid)
								changeInputCurrency(row.input, row.data, cid);
							else
								rows.state('disabled');
						}
					}

					var fromCurrency = options.fromCurrency;
					if (fromCurrency && fromCurrency.length > 0) {
						changeInputCurrency(this.fromInput, currencyData, fromCurrency);
					}
				} catch (e) {
				} finally {
					this.loadingOptions = false;
				}
				return this;
			}

			var targets = [];
			for (var i in this.rows) {
				var t = this.rows[i].data.newValue;
				if (t && t.length)
					targets.push(t);
				else
					break;
			}
			return { fromCurrency: this.fromCurrency, targets: targets };
		};
	}
	this.fromInput = null;
	this.rows = [];
	this.selectedCurrencies = {};
	this.fromCurrency = null;
	this.loadingOptions = false;
}
