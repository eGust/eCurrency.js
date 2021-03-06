function MyStorage(prefix) {
	if (MyStorage.prototype.get == undefined) {
		var self = MyStorage.prototype;

		function getItem(p, k) {
			var r = localStorage.getItem(p.str+k);
			return r ? JSON.parse(r) : null;
		}

		function setItem(p, k, v) {
			localStorage.setItem(p.str+k, JSON.stringify(v === undefined ? null : v));
		}

		function removeItem(p, k) {
			localStorage.removeItem(p.str+k);
		}

		function getKeys(p, index) {
			function hasPrefix(s) {
				return s.slice(0, p.len) == p.str;
			}

			if (index == undefined)
			{
				var count = localStorage.length, r = [];
				for (var i = 0, idx = 0; i < count; i++)
				{
					var k = localStorage.key(i);
					if (hasPrefix(k))
					{
						r[idx++] = k.slice(p.len);
					}
				}
				return r;
			}

			var count = localStorage.length;
			for (var i = 0, idx = 0; i < count; i++)
			{
				var k = localStorage.key(i);
				if (hasPrefix(k) && idx++ == index)
				{
					return k.slice(p.len);
				}
			}
			return null;
		}

		self.get = function (keys, singleAsDict) {
			var r = {};
			if ( typeof(keys) == "string" ) {
				var v = getItem(this.prefix, keys);
				if (!singleAsDict)
					return v;
				r[keys] = v;
			} else if ( keys instanceof Array || keys instanceof Object) {
				for (var i in keys)
				{
					var k = keys[i];
					r[k] = getItem(this.prefix, k);
				}
			}
			return r;
		};

		self.set = function (keys, values) {
			if ( typeof(keys) === "string" ) {
				r[keys] = setItem(this.prefix, keys, values);
			} else if ( keys instanceof Array && values instanceof Array && keys.length == values.length) {
				for (var i in keys)
				{
					setItem(this.prefix, keys[i], values[i]);
				}
			} else if (keys instanceof Object && values == undefined) {
				for (var k in keys)
				{
					setItem(this.prefix, k, keys[k]);
				}
			}
		};

		self.clear = function() {
			this.remove(this.keys());
		};

		self.remove = function (keys) {
			if ( typeof(keys) == "string" ) {
				removeItem(this.prefix, keys);
			} else if ( keys instanceof Array || keys instanceof Object) {
				for (var i in keys)
				{
					removeItem(this.prefix, keys[i]);
				}
			}
		};

		self.keys = function(index) {
			return getKeys(this.prefix, index);
		};

		self.length = function() {
			return this.keys().length;
		};

		self.getAll = function() {
			return this.get(this.keys());
		}
	}

	if (!(this instanceof MyStorage))
		return new MyStorage(prefix);

	this.prefix = { 'str': prefix, 'len': prefix.length};
}

function Settings(storage, options) {
	if (Settings.prototype.load === undefined) {
		var self = Settings.prototype;

		self.load = function () {
			var options = this.storage.getAll();
			for (var k in options) {
				this.options[k] = options[k];
			}
			return this;
		};

		self.save = function () {
			this.storage.set(options);
			return this;
		};

		self.get = function (key) {
			return this.options[key];
		};

		self.set = function (options) {
			var o = this.options;
			for (var k in options) {
				o[k] = options[k];
			}
			this.storage.set(options);
		}
	}

	if (!(this instanceof Settings)) {
		return new Settings(storage, options);
	}

	this.storage = storage;
	var o = this.options = {};
	for (var k in options) {
		o[k] = options[k];
	}
}

var myStg = MyStorage('prfx:ecurrency@eGust.stg/'),
	currencyArray = [],
	settings = Settings(myStg, {
		fromCurrency: "USD",
		fromAmount: 100,
		targets: 'EUR,CNY,GBP'.split(','),
		commons: "USD,EUR,CNY,GBP,JPY,HKD,CAD,AUD,BRL,INR,RUB".split(','),
		autoRefresh: false,
		lastQuery: null,
	}).load();
