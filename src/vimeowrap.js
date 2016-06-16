/** @license
* Vimeo Wrap
*
* Author: Wesley Luyten
* Version: 1.1 - (2012/06/07)
* Version: 1.2 - (2012/11/23)
*/

var players = {};

var vimeowrap = window.vimeowrap = function(identifier) {

	var container;
	if (identifier.nodeType) {
		// Handle DOM Element
		container = identifier;
	} else if (typeof identifier === "string") {
		// Find container by ID
		container = document.getElementById(identifier);
	}
	
	if (container) {
		var foundPlayer = players[container.id];
		if (foundPlayer) {
			return foundPlayer;
		} else {
			return players[container.id] = new vimeowrap.api(container);
		}
	}
	return null;
};

vimeowrap.utils = utils;

vimeowrap.getPlayers = function() {
	return players;
};

vimeowrap.api = function(container) {
	var _this = this,
		playlist = null,
		config = null;
	
	this.container = container;
	this.id = container.id;
	this.display = null;
	this.iframe = null;
	this.player = null;
	this.config = null;
	this.plugins = {};

	this.events = {
		playerReady: new signal(),
		playlist: new signal(),
		playlistItem: new signal()
	};

	this.setup = function(c) {
	
		var options = {
			width: 480,
			height: 270,
			color: "00adef",
			repeat: "none",
			item: 0,
			private: false,
			api: true,
			player_id: utils.uniqueId('player_')
		};

		config = utils.extend(options, c);
		this.config = config;

		this.container.innerHTML = "";
		
		var bounds = { x:0, y:0, width:config.width, height:config.height };
		var plugin = null;

		this.events.playlist.add(overridePlaylistItems);

		for (var key in config.plugins) {
			if (typeof vimeowrap[key] === "function") {
				plugin = this.plugins[key] = new vimeowrap[key](this, config.plugins[key]);
				switch (plugin.config.position) {
					case "left":
					case "right":
						bounds.width += plugin.config.size || 0;
						plugin.width = plugin.config.size;
						plugin.height = config.height;
						break;
					default:
						bounds.height += plugin.config.size || 0;
						plugin.width = config.width;
						plugin.height = plugin.config.size;
				}
			}
		}

		utils.css(this.container, {
			position: 'relative',
			width: bounds.width,
			height: bounds.height
		});

		for (key in this.plugins) {
			plugin = this.plugins[key];
			switch (plugin.config.position) {
				case "left":
					plugin.x = bounds.x;
					bounds.x += plugin.width;
					bounds.width -= plugin.width;
					break;
				case "right":
					plugin.x = bounds.x + bounds.width - plugin.width;
					bounds.width -= plugin.width;
					break;
				case "top":
					plugin.y = bounds.y;
					bounds.y += plugin.height;
					bounds.height -= plugin.height;
					break;
				case "bottom":
					plugin.y = bounds.y + bounds.height - plugin.height;
					bounds.height -= plugin.height;
					break;
			}

			this.plugins[key].setup();
		}

		this.display = document.createElement('div');
		this.display.id = this.id + "_display";
		this.container.appendChild(this.display);
		utils.css(this.display, {
			background: '#000000',
			width: bounds.width,
			height: bounds.height,
			position: 'absolute',
			left: bounds.x,
			top: bounds.y
		});

		config.internal = {};
		config.internal.urls = {};
		config.internal.urls.array = [];
		config.internal.urls.object = {};
		playlist = [];
		for (var i = 0; i < config.urls.length; i++) {
			if (typeof config.urls[i] === 'object') {
				config.internal.urls.array.push(config.urls[i]['url']);
				if (typeof config.internal.urls.object[config.urls[i].url] === 'undefined') {
					config.internal.urls.object[config.urls[i].url] = [];
				}
				config.internal.urls.object[config.urls[i].url].push(config.urls[i]);
			} else {
				config.internal.urls.array.push(config.urls[i]);
				if (typeof config.internal.urls.object[config.urls[i].url] === 'undefined') {
					config.internal.urls.object[config.urls[i].url] = [];
				}
				config.internal.urls.object[config.urls[i].url].push({ url: config.urls[i] });
			}
		}
		
		this.events.playlist.add(playlistLoaded);
		var loader = new playlistloader(this);
		loader.load(config.internal.urls.array);

		return this;
	};

	function overridePlaylistItems(p) {
		var urls = JSON.parse(JSON.stringify(config.internal.urls.object));
		for (var i = 0; i < p.length; i++) {
			if (urls[p[i].url] instanceof Array && urls[p[i].url].length > 0) {
				var url = urls[p[i].url].shift();
				for (var key in url) {
					if (key != 'url') {
						p[i][key] = url[key];
					}
				}
			}
		}
	}

	function playlistLoaded(p) {
		playlist = p;

		var item = playlist[config.item];
		_this.events.playlistItem.dispatch(item, config.item);

		embed(item.url);
	}
	
	function embed(url) {

		utils.jsonp('https://vimeo.com/api/oembed.json', getEmbedArgs({ url:url }), function(json) {

			var temp = document.createElement('div');
			temp.innerHTML = json.html;
			_this.iframe = temp.children[0];
			_this.iframe.id = config.player_id;
			utils.css(_this.iframe, {
				position: 'absolute',
				display: 'none'
			});

			var showPlayer = function() {
				utils.css(_this.iframe, {
					display: 'block'
				});
			};
			if (_this.iframe.attachEvent) {
				_this.iframe.attachEvent("onload", showPlayer);
			} else {
				_this.iframe.onload = showPlayer;
			}
			
			utils.prepend(_this.iframe, _this.display);
					
			Froogaloop(_this.iframe.id).addEvent('ready', function() {

				_this.player = Froogaloop(_this.iframe.id);
				_this.events.playerReady.dispatch(_this.player);

				_this.player.addEvent('finish', playerFinish);
			});
		});
	}
	
	function getEmbedArgs(args) {
	
		var allowed = [	'url', 'width', 'maxwidth', 'height', 'maxheight', 'byline',
						'title', 'portrait', 'color', 'callback', 'autoplay', 'loop',
						'xhtml', 'api', 'wmode', 'iframe', 'player_id',
						'badge' ];

		for (var i = 0; i < allowed.length; i++) {
			var key = allowed[i];
			if (config.hasOwnProperty(key)) {
				var value = config[key];
				if (typeof value === "boolean") value = value ? 1 : 0;
				args[key] = value;
			}
		}
		
		return args;
	}

	function playerFinish(data) {
		var index;
		switch (config.repeat) {
			case "list":
				index = config.item + 1;
				if (index < playlist.length) {
					_this.playlistItem(index, true);
				}
				break;
			case "always":
				index = config.item + 1;
				if (index >= playlist.length) {
					index = 0;
				}
				_this.playlistItem(index, true);
				break;
			case "single":
				_this.play();
				break;
		}
	}
	
	this.playlistItem = function(index, autoplay) {
		
		config.item = index;

		this.pause();
		utils.css(this.iframe, {
			display: 'none'
		});

		if (typeof autoplay === "boolean") {
			config.autoplay = autoplay;
		}
		
		var item = playlist[index];
		var url = 'https://player.vimeo.com/video/' + item.id + '?';
		var allowed = [	'byline', 'title', 'portrait', 'color',
						'autoplay', 'loop', 'api', 'player_id',
						'badge' ];

		for (var i = 0; i < allowed.length; i++) {
			var key = allowed[i];
			if (config.hasOwnProperty(key)) {
				var value = config[key];
				if (typeof value === "boolean") value = value ? 1 : 0;
				url += encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
			}
		}
		
		if (this.iframe) {
			this.iframe.src = url.slice(0, -1);
		}

		this.events.playlistItem.dispatch(item, index);
	};

	this.playlistNext = function(autoplay) {
		var index = config.item + 1;
		if (index >= playlist.length) {
			index = 0;
		}
		this.playlistItem(index, autoplay);
	};

	this.playlistPrev = function(autoplay) {
		var index = config.item - 1;
		if (index < 0) {
			index = playlist.length - 1;
		}
		this.playlistItem(index, autoplay);
	};
	
	this.play = function() {
		if (this.player) {
			this.player.api('paused', function(paused, player_id) {
				if (paused === true) _this.player.api('play');
			});
		}
	};

	this.pause = function() {
		if (this.player) {
			this.player.api('paused', function(paused, player_id) {
				if (paused === false) _this.player.api('pause');
			});
		}
	};

	this.onPlay = function(func) {
		if (this.player) this.player.addEvent('play', func);
	};

	this.onPause = function(func) {
		if (this.player) this.player.addEvent('pause', func);
	};

	this.onFinish = function(func) {
		if (this.player) this.player.addEvent('finish', func);
	};

	this.getPlugin = function(key) {
		return this.plugins[key];
	};

	this.getPlaylist = function() {
		return playlist;
	};
};
