/*
 * The Hyperaudio Pad
 * http://hyperaud.io
 *
 * Copyright (c) 2013 Hyperaudio Incorporated
 * Dual licensed under the MIT and GPL licenses.
 *  - http://www.opensource.org/licenses/mit-license.php
 *  - http://www.gnu.org/copyleft/gpl.html
 *
 * Authors: 
 * Mark Boas
 * Mark J Panaghiston
 */

$(document).ready(function(){

	$.jPlayer.timeFormat.padMin = false;

	var DEBUG_MP = false;
	var DEBUG_MB = false;

	var DEBUG_VIDEO = false;
	var DEBUG_AUDIO = false;
	var DEBUG_CURRENTTIME = false;
	var DEBUG_LOAD_REMIX = false;

	// var BASE = "http://happyworm.com/";
	var BASE = "/";

	if (DEBUG_VIDEO) {
		$('#media-target').show();
	};

	// These JSON object would be loaded in.

	// There would be different types of JSON:
	//  - Transcript Definition.
	//  - MIX Definition.
	//  - List of Transcripts/Mixes.

	var suppliedMedia = "webmv,m4v"

	var transcripts = [{
		title: "Internet Amazonians",
		url: "transcripts/internetindians.htm",
		media: {
			m4v: BASE+'video/internetindians.mp4',
			webmv: BASE+'video/internetindians.webm'
		}
	}, {
		title: "Rainforest Raids",
		url: "transcripts/raidsinrainforest.htm",
		media: {
			m4v: BASE+'video/raidsinrainforest.mp4',
			webmv: BASE+'video/raidsinrainforest.webm'
		}
	}, {
		title: "The Justice Boat",
		url: "transcripts/justiceboat.htm",
		media: {
			m4v: BASE+'video/justiceboat.mp4',
			webmv: BASE+'video/justiceboat.webm'
		}
	}, {
		title: "Snowden Interview",
		url: "transcripts/edsnowdeninterview.htm",
		media: {
			m4v: BASE+'video/edsnowdeninterview.mp4',
			webmv: BASE+'video/edsnowdeninterview.webm'
		}
	}, {
		title: "Biden on NSA 2006",
		url: "transcripts/biden2006nsa.htm",
		media: {
			m4v: BASE+'video/biden2006nsa.mp4',
			webmv: BASE+'video/biden2006nsa.webm'
		}
	}, {
		title: "Sen. Feinstein",
		url: "transcripts/sen-feinstein-1212.htm",
		media: {
			m4v: BASE+'video/sen-feinstein-1212.mp4',
			webmv: BASE+'video/sen-feinstein-1212.webm'
		}
	}, {
		title: "James Clapper Denies",
		url: "transcripts/clapper-march-13.htm",
		media: {
			m4v: BASE+'video/clapper-march-13.mp4',
			webmv: BASE+'video/clapper-march-13.webm'
		}
	}, {
		title: "James Clapper Responds",
		url: "transcripts/clapper-responds.htm",
		media: {
			m4v: BASE+'video/clapper-responds.mp4',
			webmv: BASE+'video/clapper-responds.webm'
		}
	}, {
		title: "Obama Responds",
		url: "transcripts/obama-responds.htm",
		media: {
			m4v: BASE+'video/obama-responds.mp4',
			webmv: BASE+'video/obama-responds.webm'
		}
	}];


	if (DEBUG_MB) console.log('hash = '+window.location.hash);

	var theScript = [];
	var latency = 1000;

	function loadTranscriptsFromFile(options) {
		
		var i = options.i;

		if(!i) {
			i = 0;
		}

		if (DEBUG_LOAD_REMIX) console.log("loadTranscriptsFromFile(): index = "+i);

		if (i < theScript.length) {

			if (DEBUG_LOAD_REMIX) console.log("loadTranscriptsFromFile(): transcripts = %o",transcripts);
			if (DEBUG_LOAD_REMIX) console.log("loadTranscriptsFromFile(): theScript[%f].mediaId = %f", i, theScript[i].mediaId);

			// var transcript = transcripts[theScript[i].mediaId].url;

			if(theScript[i].mediaId >= 0) {

				$('#transcript-content').load(transcripts[theScript[i].mediaId].url, function() {

					if (DEBUG_LOAD_REMIX) console.log('loadTranscriptsFromFile(): transcript URL = '+transcripts[theScript[i].mediaId].url);
					
					var startSpan, endSpan, startTime, endTime;

					startTime = theScript[i].start;
					endTime = theScript[i].end;

					if (DEBUG_LOAD_REMIX) console.log("loadTranscriptsFromFile(): grabbing the spans");

					$('#transcript-content span[m="'+startTime+'"]').each(function() {
						startSpan = $(this)[0];

						// remember the endTime is either the start time of the following span or
						// in the case it is the last span - that span + 1000ms

						if (DEBUG_LOAD_REMIX) console.log("loadTranscriptsFromFile(): endTime = "+endTime);
						
						var nextSpan = $('#transcript-content span[m="'+endTime+'"]');
						var lastSpan = false;

						if (!nextSpan.length) {
							nextSpan = $('#transcript-content span').last();
							lastSpan = true;
						}

						if (DEBUG_LOAD_REMIX) console.log("loadTranscriptsFromFile(): nextspan = %o", nextSpan);
						if (DEBUG_LOAD_REMIX) console.log("loadTranscriptsFromFile(): lastSpan = "+lastSpan);

						// MJP is unclear as to why we have an each loop here... And $(this)[0] === this so WTF... +1 for bad code.
						nextSpan.each(function() {
							// See: $(this)[0] === this
							if (DEBUG_LOAD_REMIX) console.log("loadTranscriptsFromFile(): this = %o",this);
							if (DEBUG_LOAD_REMIX) console.log("loadTranscriptsFromFile(): $(this)[0] = %o",$(this)[0]);

							if (lastSpan == true) {
								endSpan = $(this)[0];
							} else {

								if (DEBUG_LOAD_REMIX) console.log("loadTranscriptsFromFile(): nextSpan.previousElementSibling = "+$(this)[0].previousElementSibling);

								if($(this)[0].previousElementSibling) {
									endSpan = $(this)[0].previousElementSibling;
								} else {
									// We need to find the previous span
									// Since we know the structure... Assume it is: 1) Up parent <p>, 2) Previous sibling, 3) down to children, and 4) The last span.

									endSpan = $(this.parentNode.previousElementSibling).children('span').last()[0];
								}

							}
							
							//

							if (DEBUG_LOAD_REMIX) console.log("loadTranscriptsFromFile(): startSpan = %o", startSpan);
							if (DEBUG_LOAD_REMIX) console.log("loadTranscriptsFromFile(): endSpan = %o", endSpan);
							if (DEBUG_LOAD_REMIX) console.log("loadTranscriptsFromFile(): startTime = "+startTime);
							if (DEBUG_LOAD_REMIX) console.log("loadTranscriptsFromFile(): endTime = "+endTime);

							if (DEBUG_LOAD_REMIX) console.log("loadTranscriptsFromFile(): copying over...");
							copyOver(startSpan, endSpan, startTime, endTime, i);

							if (DEBUG_LOAD_REMIX) console.log("loadTranscriptsFromFile(): calling loadTranscriptsFromFile");
							var commandText = theScript[i].commandText;
							if (commandText != undefined && commandText.length > 0) {
								var direction = $('<p><span>['+commandText+']<span></p>'); 
								$('#target-content').append( direction );
							}

							// loadTranscriptsFromFile(++i);
							loadTranscriptsFromFile({i:++i,callback:options.callback});
						});
					});
				});
			} else {
				var commandText = theScript[i].commandText;
				if (DEBUG_LOAD_REMIX) console.log('loadTranscriptsFromFile(): No transcript, handling commandText: ' + commandText);
				if (commandText != undefined && commandText.length > 0) {
					var direction = $('<p i="'+i+'" start="'+theScript[i].start+'" end="'+theScript[i].end+'"><span>['+commandText+']</span></p>'); 
					$('#target-content').append( direction );
				}
				loadTranscriptsFromFile({i:++i,callback:options.callback});
			}
		} else {
			if (DEBUG_LOAD_REMIX) console.log('loadTranscriptsFromFile(): dropping out');
			if(options.callback) {
				options.callback();
			}
			//return false;
		}
	}

	function loadTheScript(data) {

		if (DEBUG_LOAD_REMIX) console.log('loadTheScript(%o): theScript loaded in');
		if (DEBUG_LOAD_REMIX) console.log('loadTheScript(%o)',data);
		theScript = data;

		$('#transcript-content').hide();
		loadTranscriptsFromFile({
			callback:function() {
				targetPlayer.cue();
				var search = 1;
				while(theScript[theScript.length-search].mediaId < 0) {
					search++;
				}
				loadTranscriptSource(theScript[theScript.length-search].mediaId);
				$('#transcript-content').show();
				// TODO make top 350 a separate class and apply when needed
				$('#target-content').css('top','350px');
				// saved pieces should default view in fullscreen
				
				targetPlayer.setDuration();
				fullscreen.request();
			}
		});
	}

	// Check for the hash on the URL - which means this is a saved piece
	var hash = window.location.hash.replace("#","");
	if (hash.length > 0) {
		// load theScript
		$.get('remixes/'+hash+'.json', loadTheScript, 'json');
	}

	var theScriptState = [];
	var theScriptLength = theScript.length;

	var hints = true;

	var myPlayerSource = $("#jquery_jplayer_source");
	var sourceMediaId = null;
	var sourcePopcorn = null;
	var myAudio = $('#jquery_jplayer_audio');

	// making it clear that we have an editable content pane
	$('#target-content').focus();

	// Want to migrate all the target player Flags and controls into this object
	var targetPlayer = {
		paused: true,
		scriptIndex: 0, // ref to theScript[]
		start: 0,
		end: 0,
		duration: 0,
		player: [$("#jquery_jplayer_1"),$("#jquery_jplayer_2")],
		playerMediaId: [],
		currentMediaId: null,
		nextMediaId: null,
		lastPlayerPrimed: 1, // So the first instance used is #0, then second is #1
		popcorn: null, // The popcorn instance use by the player.

		seriously: new Seriously(),
		videoMap: {
			videoSource: null,
			captionSource: null,
			canvasTarget: null,
			fader: null,
			blend: null,
			effect: []
		},
		currentVideoId: "",
		fadeEnd: false, // Used to capture the fade at the end of a chunk. ie., True until the animation starts.
		fadeStart: false, // Used to fade at the start of a chunk.

		init: function() {
			targetPlayer.initCaption();
			targetPlayer.initVideoMap();
		},

		initVideoMap: function() {
			this.videoMap.fader = this.seriously.effect('fader');
			this.videoMap.fader.amount = 0; // Otherwise it defaults to complete fade of 1.
			// this.videoMap.fader.color = [255,0,0,1];

			// Blend the video map with captions
			this.videoMap.captionSource = this.seriously.source("#caption-canvas");
			this.videoMap.captionBlend = this.seriously.effect('blend');
			this.videoMap.captionBlend.top = this.videoMap.captionSource;
			this.videoMap.captionBlend.bottom = this.videoMap.fader;

			// Blend the video map with title
			// this.videoMap.titleSource = this.seriously.source("#caption-canvas");
			this.videoMap.titleBlend = this.seriously.effect('blend');
			// this.videoMap.titleBlend.top = this.videoMap.titleSource;
			this.videoMap.titleBlend.bottom = this.videoMap.captionBlend;

			this.videoMap.canvasTarget = this.seriously.target('#target-canvas');
			// this.videoMap.canvasTarget.source = this.videoMap.fader;
			// this.videoMap.canvasTarget.source = this.videoMap.captionBlend;
			this.videoMap.canvasTarget.source = this.videoMap.titleBlend;
		},
		createVideoMap: function(effects) {

			var i, iLen;

			this.seriously.stop();

			for (i=0, iLen=this.videoMap.effect.length; i < iLen; i++) {
				this.videoMap.effect[i].destroy();
				this.videoMap.effect[i] = null;
			}

			this.videoMap.effect = [];

			if(effects[0] !== 'none') {

				// add all the effects

				for (i=0, iLen=effects.length; i < iLen; i++) {
					this.videoMap.effect[i] = this.seriously.effect(effects[i]);
					if (i > 0) {
						this.videoMap.effect[i].source = this.videoMap.effect[i-1];
						if (DEBUG_MP) console.log("createVideoMap(): connecting up effect chain");
					}
				}
			}

			if (DEBUG_MP) console.log("createVideoMap(): videoMap.effect=%o",this.videoMap.effect);
		},
		connectVideo: function(videoId) {

			if(!videoId) {
				return;
			}

			this.currentVideoId = videoId;

			this.seriously.stop();

			// Remove the previous video input and clean up.
			if(this.videoMap.videoSource) {
				this.videoMap.videoSource.destroy();
				this.videoMap.videoSource = null;
			}
			// Create the new video source node
			this.videoMap.videoSource = this.seriously.source("#"+videoId);

			// If effects map, connect to it
			if(this.videoMap.effect[0]) {
				// Connect the video to the first effect
				this.videoMap.effect[0].source = this.videoMap.videoSource;
				// Connect the last effect to the canvas
				// this.videoMap.canvasTarget.source = this.videoMap.effect[this.videoMap.effect.length-1];
				this.videoMap.fader.source = this.videoMap.effect[this.videoMap.effect.length-1];
			} else {
				// Connect the video to the canvas
				// this.videoMap.canvasTarget.source = this.videoMap.videoSource;
				this.videoMap.fader.source = this.videoMap.videoSource;
			}

			this.seriously.go();
		},
		fadeTo: function(options) {
			var self = this,
				from = this.videoMap.fader.amount;
/*
			options: {
				amount: number,
				duration: number,
				callback: function()
			}
*/

			if (DEBUG_MP) console.log("fadeTo(): from=%f | options=%o", from, options);

			$({fade:from}).animate({fade:options.amount}, {
				duration: options.duration,
				easing: 'linear',
				step: function() {
					self.videoMap.fader.amount = this.fade;
					// if (DEBUG_MP) console.log("fadeTo(): from=%f | options=%o | this.fade=%f", from, options, this.fade);
				},
				complete: function() {
					self.videoMap.fader.amount = options.amount;
					if(options.callback) {
						setTimeout(function() {
							options.callback();
						},0);
					}
				}
			});
		},
		fadeColor: function(color) {
			var rgba = [0,0,0,1]; // Default is black

			// search for the legalColors var to see the whitelist.

			if(typeof color === 'string') {
				switch(color) {
					case 'silver': rgba = [0.75,0.75,0.75,1]; break;
					case 'gray': rgba = [0.25,0.25,0.25,1]; break;
					case 'white': rgba = [1,1,1,1]; break;
					case 'maroon': rgba = [0.5,0,0,1]; break;
					case 'red': rgba = [1,0,0,1]; break;
					case 'purple': rgba = [0.5,0,0.5,1]; break;
					case 'fuchsia': rgba = [1,0,1,1]; break;
					case 'green': rgba = [0,0.5,0,1]; break;
					case 'lime': rgba = [0,1,0,1]; break;
					case 'olive': rgba = [0.5,0.5,0,1]; break;
					case 'yellow': rgba = [1,1,0,1]; break;
					case 'navy': rgba = [0,0,0.5,1]; break;
					case 'blue': rgba = [0,0,1,1]; break;
					case 'teal': rgba = [0,0.5,0.5,1]; break;
					case 'aqua': rgba = [0,1,1,1]; break;
					// case 'XXX': rgba = [RRR,GGG,BBB,1]; break;
				}
			} else if(color && color.length === 4) {
				rgba = color;
			}
			this.videoMap.fader.color = rgba;
		},

		initCaption: function() {
			var canvas = this.captionCanvas = document.getElementById('caption-canvas');
			var ctx = this.captionContext = this.captionCanvas.getContext('2d');
			// canvas.width = 480;
			// canvas.height = 270;
/*
			this.setCaption({
				// color: 'black',
				// bgcolor: 'white',
				// size: '48px',
				// align: 'RigHt',
				// valign: 'BoTTom',
				text:'Internet Amazonians'
			});
*/
		},
		setCaption: function(caption) {
			var self = this,
				canvas = this.captionCanvas,
				ctx = this.captionContext,
				x, y;

			/* Object of type:
			caption = {
				color: 'black',
				bgcolor: 'white',
				size: '48px',
				align: 'RigHt',
				valign: 'BoTTom',
				text:'Internet Amazonians'
			}
			*/

			// console.log('caption: %o', caption);

			if(typeof caption !== 'object') {
				return;
			}

			// Reset the canvas
			canvas.width = canvas.width;

			caption.align = caption.align && caption.align.toLowerCase();
			caption.valign = caption.valign && caption.valign.toLowerCase();

			switch(caption.align) {
				case 'left':
					ctx.textAlign = 'left';
					x = 10;
					break;
				case 'right':
					ctx.textAlign = 'right';
					x = canvas.width - 10;
					break;
				case 'center':
				default:
					ctx.textAlign = 'center';
					x = canvas.width/2;
					break;
			}

			switch(caption.valign) {
				case 'top':
					ctx.textBaseline = 'top';
					y = 10;
					break;
				case 'bottom':
					ctx.textBaseline = 'bottom';
					y = canvas.height - 10;
					break;
				case 'middle':
				default:
					ctx.textBaseline = 'middle';
					y = canvas.height/2;
					break;
			}

			// Firefox did not like quotation marks around any of the font names. But Chrome seems to group the bold with the first 1 instead.
			ctx.font = (caption.size || '32px') + ' bold CrimsonRoman, Georgia, Times, serif';

/*
			// Note for if we want a background rectangle.
			// http://stackoverflow.com/questions/10099226/determine-width-of-string-in-html5-canvas
			var dim = ctx.measureText(caption.text),
				w = dim.width,
				h = dim.height; // undefined
			ctx.fillStyle = 'blue';
			ctx.fillRect(x-(w/2), y-(32/2), w, 32); // For the center/middle case.

			console.log('dim: %o', dim);
*/

			ctx.fillStyle = caption.bgcolor || '#000';
			ctx.fillText(caption.text, x+1, y+1);

			ctx.fillStyle = caption.color || '#fff';
			ctx.fillText(caption.text, x, y);

			this.videoMap.captionBlend.top.update();

			setTimeout(function() {
				canvas.width = canvas.width;
				self.videoMap.captionBlend.top.update();
			}, (caption.duration ? caption.duration * 1000 : 1000));

		},

		clearTitle: function(title) {

			var canvas = this.titleCanvas;

			// Reset the canvas
			if(canvas) {
				canvas.width = canvas.width;
				if(this.videoMap.titleBlend.top.update) {
					this.videoMap.titleBlend.top.update();
				}
			}
		},

		setTitle: function(title) {

			var self = this,
				canvas = this.titleCanvas = document.createElement('canvas'),
				ctx = this.titleContext = canvas.getContext('2d'),
				x, y;

			canvas.width = 480;
			canvas.height = 270;

			/* Object of type:
			title = {
				color: 'black',
				bgcolor: 'white',
				size: '48px',
				align: 'RigHt',
				valign: 'BoTTom',
				text:'Internet Amazonians'
			}
			*/

			if(DEBUG_MP) console.log('title: %o', title);

			if(typeof title !== 'object') {
				return;
			}

			// Reset the canvas
			// canvas.width = canvas.width;

			title.align = title.align && title.align.toLowerCase();
			title.valign = title.valign && title.valign.toLowerCase();

			switch(title.align) {
				case 'left':
					ctx.textAlign = 'left';
					x = 10;
					break;
				case 'right':
					ctx.textAlign = 'right';
					x = canvas.width - 10;
					break;
				case 'center':
				default:
					ctx.textAlign = 'center';
					x = canvas.width/2;
					break;
			}

			switch(title.valign) {
				case 'top':
					ctx.textBaseline = 'top';
					y = 10;
					break;
				case 'bottom':
					ctx.textBaseline = 'bottom';
					y = canvas.height - 10;
					break;
				case 'middle':
				default:
					ctx.textBaseline = 'middle';
					y = canvas.height/2;
					break;
			}

			// Firefox did not like quotation marks around any of the font names. But Chrome seems to group the bold with the first 1 instead.
			ctx.font = (title.size || '32px') + ' bold CrimsonRoman, Georgia, Times, serif';

/*
			// Note for if we want a background rectangle.
			// http://stackoverflow.com/questions/10099226/determine-width-of-string-in-html5-canvas
			var dim = ctx.measureText(title.text),
				w = dim.width,
				h = dim.height; // undefined
			ctx.fillStyle = 'blue';
			ctx.fillRect(x-(w/2), y-(32/2), w, 32); // For the center/middle case.

			if(DEBUG_TITLE) console.log('dim: %o', dim);
*/

			ctx.fillStyle = title.bgcolor || '#000';
			// ctx.fillText(title.text, x+1, y+1);
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.fillStyle = title.color || '#fff';
			ctx.fillText(title.text, x, y);

			this.videoMap.titleSource = this.seriously.source(canvas);
			this.videoMap.titleBlend.top = this.videoMap.titleSource;

			this.videoMap.titleBlend.top.update();

			this.seriously.go();

		},

		play: function(config) {

			var self = this;

			// Handle the case where saved trans given but fullscreen denied at page load.
			if(fullscreen.isRestricted()) {
				fullscreen.request();
			}

			if(DEBUG_MP) {
				console.log("==============");
				console.log("theScript: %o", theScript);
				console.log("==============");
			}

			// Set play configuration
			if(config) {
				this.scriptIndex = config.scriptIndex;
				this.start = config.start; 
				this.end = config.end;  
			} else {
				config = {}; // So the config.jumpTo is happily undefined.
			}

			if (DEBUG_MB) console.log("INDEX = "+this.scriptIndex); 

			// sorry MP - quick frig to check
			// if (this.scriptIndex >= theScript.length) this.scriptIndex = 0;

			this.currentMediaId = theScript[this.scriptIndex].mediaId;
			this.nextMediaId = this.scriptIndex+1 < theScript.length ? theScript[this.scriptIndex+1].mediaId : null;

			this.paused = false;

			if(this.scriptIndex > 0) {
				this.setCaption(theScript[this.scriptIndex-1].caption);
			}

			if(DEBUG_MP) {
				console.log("------Play Target Transcript------");
				console.log("targetPlayer.currentMediaId="+this.currentMediaId);
				console.log("targetPlayer.playerMediaId[0]="+this.playerMediaId[0]);
				console.log("targetPlayer.playerMediaId[1]="+this.playerMediaId[1]);
				console.log("targetPlayer.scriptIndex="+this.scriptIndex);
				console.log("targetPlayer.start="+this.start);
				console.log("targetPlayer.end="+this.end);
				console.log("config.jumpTo="+config.jumpTo);
			}

			//if(DEBUG_MB) console.log(Math.random().toString(36).substring(6).toUpperCase());

			$('#play-btn-target').hide();
			$('#pause-btn-target').show();

			$('#jp_container_target .jp-play').hide();
			$('#jp_container_target .jp-pause').show();

			// Prepare a player for this media
			if(DEBUG_MP) console.log('play(): prepare current media');
			this.load(this.currentMediaId);

			if(DEBUG_MP) console.log('play(): this.popcorn='+this.popcorn);

			// The jumpTo does this for clicks, and the popcron instance check for play button.
			if(config.jumpTo || !this.popcorn) {
				killTargetPopcorn();
				setTargetHighlighting(this.scriptIndex);
			}

			this.clearTitle();

			var nextVideoId = "";

			if(this.playerMediaId[0] === this.currentMediaId) {
				if(DEBUG_MP) console.log('play(): already prepared for in player[0]');
				if(config.jumpTo || !this.popcorn) {
					initTargetPopcorn('#' + this.player[0].data("jPlayer").internal.video.id, this.scriptIndex, config.jumpTo);
				}
				this.player[1].hide().jPlayer("pause");
				this.player[0].show().jPlayer("play", config.jumpTo);
				nextVideoId = this.player[0].data("jPlayer").internal.video.id;
				clearInterval(this.managerInterval);
			} else if(this.playerMediaId[1] === this.currentMediaId) {
				if(DEBUG_MP) console.log('play(): already prepared for in player[1]');
				if(config.jumpTo || !this.popcorn) {
					initTargetPopcorn('#' + this.player[1].data("jPlayer").internal.video.id, this.scriptIndex, config.jumpTo);
				}
				this.player[0].hide().jPlayer("pause");
				this.player[1].show().jPlayer("play", config.jumpTo);
				nextVideoId = this.player[1].data("jPlayer").internal.video.id;
				clearInterval(this.managerInterval);
			} else {
				this._pauseVideos();
				this.setTitle(theScript[this.scriptIndex].title);
				this.titleTimeRef = (new Date()).getTime();
				clearInterval(this.managerInterval);
				this.managerInterval = setInterval(function() {
					if(DEBUG_MP) console.log('manager interval: Generated in play()')
					self.manager();
				},250);
			}
			// Prepare the other player for the next media
			if(DEBUG_MP) console.log('play(): prepare next media');
			this.load(this.nextMediaId);


			// Experimenting with Canvas Effects and Seriously.js

			if(DEBUG_MP) console.log("seriously ...");

			// If someone clicked on a word, changing the usual flow.
			if(config.jumpTo) {

				var effectArray = (typeof theScript[0].mediaId === 'undefined' && theScript[0].effect) || [],
					search;

				if(DEBUG_MP) console.log('play(): theScript[]=%o',theScript);
				if(DEBUG_MP) console.log('play(): (Default) effectArray[]=%o',effectArray);

				for(search = this.scriptIndex - 1; search >= 0; search--) {
					// Search back to the last effect applied
					if (theScript[search].effect) {
						if(DEBUG_MP) console.log('play(): action apply detected');
						effectArray = theScript[search].effect;
						break; // exit for loop
					}
				}

				if(DEBUG_MP) console.log('play(): (Searched) effectArray[]=%o',effectArray);

				this.createVideoMap(effectArray);
				this.connectVideo(nextVideoId);
			} else if (this.currentVideoId !== nextVideoId) {
				this.connectVideo(nextVideoId);
			}

			if(!myAudio.data('jPlayer').status.paused) {
				if(DEBUG_AUDIO) console.log('play(): pausing audio since it was playing');
				myAudio.jPlayer('pause');
			}

			var findAudioFromIndex = this.scriptIndex-1 < 0 ? 0 : this.scriptIndex-1;

			// Odd looking mediaId logic since it either undefined or -1 when not being used... need to normalize that bit. (effects vs titles/audio)
			if(this.scriptIndex > 0 || !(theScript[0].mediaId >= 0)) {

				for(var findAudio = findAudioFromIndex; findAudio >= 0; findAudio--) {
					if(DEBUG_AUDIO) console.log('play(): findAudio=%f : theScript.length=%f',findAudio,theScript.length);
					if(theScript[findAudio] && theScript[findAudio].audio) {
						var offset = this.getRelativeTimeOffset(findAudio, findAudioFromIndex),
							audio = theScript[findAudio].audio;
						if(DEBUG_AUDIO) console.log('play(): [found] theScript[%f]=%o',findAudio,theScript[findAudio]);
						if(myAudio.data('jPlayer').status.src !== audio.url) {
							if(DEBUG_AUDIO) console.log('play(): [found] setMedia=%s',audio.url);
							myAudio.jPlayer('setMedia', {
								mp3: audio.url
							});
						}

						if(DEBUG_AUDIO) console.log('play(): [found] script chunk offset=%f',offset);

						if(DEBUG_AUDIO) console.log('play(): [found] volume=%f : start=%f',audio.volume,audio.start);
						if(typeof audio.volume === 'number') {
							myAudio.jPlayer('volume', audio.volume);
						}
						if(typeof audio.start === 'number') {
							offset += audio.start;
						}

						if(DEBUG_AUDIO) console.log('play(): [found] before jumpTo/currentTime offset=%f',offset);
						if(config.jumpTo) {
							offset += config.jumpTo - (theScript[this.scriptIndex].start / 1000);
						} else {
							offset += this.getRelativeCurrentTime();
						}
						if(DEBUG_AUDIO) console.log('play(): [found] playing at offset=%f',offset);
						myAudio.jPlayer('play', offset);
						break;  // exit for loop
					}
				}
			}

			this.fadeEnd = theScript[this.scriptIndex].fade;
			this.fadeStart = false;
		},
		pause: function() {
			this.paused = true;

			$('#play-btn-target').show();
			$('#pause-btn-target').hide();

			$('#jp_container_target .jp-play').show();
			$('#jp_container_target .jp-pause').hide();

			clearInterval(this.managerInterval);

			this._pauseVideos();

			if (!myAudio.data('jPlayer').status.paused) {
				myAudio.jPlayer("pause");
				if(DEBUG_MP) console.log("pause(): paused myAudio");
			}
		},
		_pauseVideos: function() {
			// Then pause the player playing... or just pause both?
			if(DEBUG_MP) console.log("pause(): Attempting to pause");
			if (!this.player[0].data('jPlayer').status.paused) {
				this.player[0].jPlayer("pause");
				if(DEBUG_MP) console.log("pause(): paused player 1");
			}
			
			if (!this.player[1].data('jPlayer').status.paused) {
				this.player[1].jPlayer("pause");
				if(DEBUG_MP) console.log("pause(): paused player 2");
			}
		},
		cue: function() {

			var currentJumpTo, nextJumpTo, nextVideoId;

			this.start = theScript[this.scriptIndex].start;
			this.end = theScript[this.scriptIndex].end;

			this.currentMediaId = theScript[this.scriptIndex].mediaId;
			currentJumpTo = theScript[this.scriptIndex].start / 1000;

			if(this.scriptIndex > 0) {
				this.setCaption(theScript[this.scriptIndex-1].caption);
			}

			if(this.scriptIndex+1 < theScript.length) {
				this.nextMediaId = theScript[this.scriptIndex+1].mediaId;
				nextJumpTo = theScript[this.scriptIndex+1].start / 1000;
			} else {
				this.nextMediaId = null;
			}

			if(this.paused) {
				if(this.playerMediaId[0] === this.currentMediaId) {
					if(DEBUG_MP) console.log('cue(): already prepared for in player[0]');
					this.player[1].hide();
					this.player[0].show().jPlayer("pause", currentJumpTo); 
					nextVideoId = this.player[0].data("jPlayer").internal.video.id;
				} else if(this.playerMediaId[1] === this.currentMediaId) {
					if(DEBUG_MP) console.log('cue(): already prepared for in player[1]');
					this.player[0].hide();
					this.player[1].show().jPlayer("pause", currentJumpTo);
					nextVideoId = this.player[1].data("jPlayer").internal.video.id;
				} else if(this.currentMediaId >= 0) {
					if(DEBUG_MP) console.log('cue(): prepare the current video');
					this.load(this.currentMediaId);
					this.player[(this.lastPlayerPrimed+1)%2].hide();
					this.player[this.lastPlayerPrimed].show().jPlayer("pause", currentJumpTo);
					nextVideoId = this.player[this.lastPlayerPrimed].data("jPlayer").internal.video.id;
				} else {
					this.setTitle(theScript[this.scriptIndex].title);
				}
				killTargetPopcorn();
				setTargetHighlighting(this.scriptIndex);

				var effectArray = (typeof theScript[0].mediaId === 'undefined' && theScript[0].effect) || [],
					search;

				if(DEBUG_MP) console.log('cue(): theScript[]=%o',theScript);
				if(DEBUG_MP) console.log('cue(): (Default) effectArray[]=%o',effectArray);

				for(search = this.scriptIndex - 1; search >= 0; search--) {
					// Search back to the last effect applied
					if (theScript[search].effect) {
						if(DEBUG_MP) console.log('cue(): action apply detected');
						effectArray = theScript[search].effect;
						break; // exit for loop
					}
				}

				if(DEBUG_MP) console.log('cue(): (Searched) effectArray[]=%o',effectArray);

				this.createVideoMap(effectArray);
				this.connectVideo(nextVideoId);

				this.setCurrentTime(0); // assuming this is the first time we cue up
			}

			if(this.currentMediaId !== this.nextMediaId) {
				// Prepare the other player for the next media
				if(DEBUG_MP) console.log('cue(): prepare next video');
				if(this.load(this.nextMediaId)) {
					this.player[this.lastPlayerPrimed].jPlayer("pause", nextJumpTo);
				}
			}
		},
		load: function(id) { 

			// The id is the index reference to the transcripts array.

			if(DEBUG_MP) console.log('loadTranscriptTarget('+id+')');
			if(DEBUG_MB) console.log('sourceMediaId = '+sourceMediaId);

			if(typeof id !== 'number' || id < 0) {
				if(DEBUG_MP) console.log('Ignoring: id='+id);
				return false;
			}

			// Check whether a player already setup to play this media.
			if(this.playerMediaId[0] === id) {
				this.lastPlayerPrimed = 0;
			} else if(this.playerMediaId[1] === id) {
				this.lastPlayerPrimed = 1;
			} else {

				var nextPlayerUsed = (this.lastPlayerPrimed + 1) % 2;
				if(DEBUG_MP) console.log('[before] targetPlayer.lastPlayerPrimed='+this.lastPlayerPrimed+' | nextPlayerUsed='+nextPlayerUsed);

				if(DEBUG_MB) console.dir("media object ...");
				if(DEBUG_MB) console.dir(transcripts[id].media);

				// fix since Chrome and cache does not like duplicate videos.
				var chromeFix = $.extend({},transcripts[id].media);
				chromeFix.m4v += "?a";
				chromeFix.webmv += "?a";

				// this.player[nextPlayerUsed].jPlayer("setMedia", transcripts[id].media);
				this.player[nextPlayerUsed].jPlayer("setMedia", chromeFix);
				this.playerMediaId[nextPlayerUsed] = id;
				fitVideo(this.player[nextPlayerUsed]);

				this.lastPlayerPrimed = nextPlayerUsed;

				if(DEBUG_MP) console.log('[after] targetPlayer.lastPlayerPrimed='+this.lastPlayerPrimed+' | nextPlayerUsed='+nextPlayerUsed);
			}

			$('#target-header-ctrl').fadeIn();
			$('#target-action-ctrl').fadeIn();
			return true;
		},
		manager: function(event) {
		
			var self = this,
				now;

			if (!this.paused) {
/*
				if (this.playerMediaId[0] === this.currentMediaId) {
					now = this.player[0].data('jPlayer').status.currentTime * 1000;
				} else if (this.playerMediaId[1] === this.currentMediaId) {
					now = this.player[1].data('jPlayer').status.currentTime * 1000;
				} else {
					// Titles
					now = (new Date()).getTime() - this.titleTimeRef;
				}
*/
				now = this.getAbsoluteCurrentTime() * 1000; // We is working in da milliseconds.

				this.setCurrentTime();

				//console.log("now="+now+" this.end="+this.end+"theScript.length="+theScript.length+" this.scriptIndex="+this.scriptIndex);

				if(DEBUG_MP) console.log("targetPlayer.manager(): this.end="+this.end);
				if(DEBUG_MP) console.log("targetPlayer.manager(): now="+now);

				if(DEBUG_MP) console.log("targetPlayer.manager(): titleTimeRef="+this.titleTimeRef);

				if(this.fadeEnd) {
					if(DEBUG_MP) console.log('manager(): fade END detected');

					var duration = theScript[this.scriptIndex].time*1000;

					if (now > this.end - duration) {
						this.fadeEnd = false;
						// this.fadeStart = true;
						this.fadeColor(theScript[this.scriptIndex].color);
						this.fadeTo({
							amount:1,
							duration:duration,
							callback: function() {
								self.fadeTo({
									amount:0,
									duration:duration,
									callback: function() {
										console.log('End of: Fade in then out')
									}
								});
							}
						});
					}
				}
/*
				if(this.fadeStart) {
					if(DEBUG_MP) console.log('manager(): fade START detected');

					var duration = theScript[this.scriptIndex-1].time*1000;

					this.fadeStart = false;
					// this.fadeColor(theScript[this.scriptIndex-1].color);
					this.fadeTo({amount:0, duration:duration});
				}
*/
				if (DEBUG_MB) {
					console.log("now = "+now);
					console.log("this.end = "+this.end);
				}

				// If the chunk playing has ended...
				if (now > this.end) {

					// check for the this.end

					if(DEBUG_MP) console.log("theScript.length = "+theScript.length);
					if(DEBUG_MP) console.log("targetPlayer.scriptIndex = "+this.scriptIndex);

					// Pause the player playing

					if(DEBUG_MP) console.log("Attempting to pause");
					if (this.playerMediaId[0] === this.currentMediaId) {
						if(DEBUG_MP) console.log("pausing player 1");
						this.player[0].jPlayer("pause");
						if(DEBUG_MP) console.log("paused player 1");
					} else if (this.playerMediaId[1] === this.currentMediaId) {
						if(DEBUG_MP) console.log("pausing player 2");
						this.player[1].jPlayer("pause");
						if(DEBUG_MP) console.log("paused player 2");
					} else {
						// We have a problem - something should have been setup and playing.
					}

/*
					if (theScript.length <= this.scriptIndex+1) {
						if(DEBUG_MP) console.log("Attempting to pause");
						if (!this.player[0].data('jPlayer').status.paused) {
							this.player[0].jPlayer("pause");
							if(DEBUG_MP) console.log("paused player 1");
						}
						
						if (!this.player[1].data('jPlayer').status.paused) {
							this.player[1].jPlayer("pause");
							if(DEBUG_MP) console.log("paused player 2");
						}
					}
*/

					var effectArray = [];

					if (this.scriptIndex+1 < theScript.length) {

						var fadeSpeed = 100; //ms
						var fadeColor = "black";

						//console.log(this.scriptIndex);
/*
						if (theScript[this.scriptIndex].fade) {
							if(DEBUG_MP) console.log('manager(): fade START set');
							this.fadeStart = true;
						}
*/

/*
						if (theScript[this.scriptIndex].fade) {
							// if(DEBUG_MP) console.log('manager(): fade detected');

							if (theScript[this.scriptIndex].color) {
								fadeColor = theScript[this.scriptIndex].color;
							}

							if (theScript[this.scriptIndex].time) {
								fadeSpeed = theScript[this.scriptIndex].time*1000;
							}

							this.fadeColor(fadeColor);
							this.fadeTo({amount:1, duration:fadeSpeed});

							$({fade:0}).animate({fade:1}, {
								duration: fadeSpeed,
								step: function() {
									self.videoMap.fader.amount = this.fade;
								},
								complete: function() {
									self.videoMap.fader.amount = 1;
								}
							});
						}
*/

						// Think we can just always make it equal to... The if really just for the console.
						if (theScript[this.scriptIndex].effect) {
							if(DEBUG_MP) console.log('action apply detected');

							effectArray = theScript[this.scriptIndex].effect;
						}

						if(DEBUG_MP) console.log("fadeColor="+fadeColor);
						if(DEBUG_MP) console.log("fadeSpeed="+fadeSpeed);
						// if(DEBUG_MP) console.log("effect="+effect);

						// moving to the next block in the target
						this.scriptIndex++;
						if (DEBUG_MP) console.dir(theScript);

						if (theScript[this.scriptIndex].fade) {
							if(DEBUG_MP) console.log('manager(): fade END set');
							this.fadeEnd = true;
						}

						// Prepare the other player for the next media
						// Also updates this.start, this.end, this.currentMediaId and this.nextMediaId
						this.cue();

						if(DEBUG_MP) console.log("targetPlayer.playerMediaId[0] = "+this.playerMediaId[0]);
						if(DEBUG_MP) console.log("targetPlayer.playerMediaId[1] = "+this.playerMediaId[1]);

						this.clearTitle();
						clearInterval(this.managerInterval);

						// Compared with this.currentVideoId further down.
						var nextVideoId = "";

						if (this.playerMediaId[0] === this.currentMediaId) {
							nextVideoId = this.player[0].data("jPlayer").internal.video.id;

							this.player[1].hide();
							this.player[0].show();

							if(DEBUG_MP) console.log("switch to 1");
							initTargetPopcorn('#' + this.player[0].data("jPlayer").internal.video.id, this.scriptIndex);
							this.player[1].jPlayer("pause");
							this.player[0].jPlayer("play",this.start/1000);
						} else if (this.playerMediaId[1] === this.currentMediaId) {
							nextVideoId = this.player[1].data("jPlayer").internal.video.id;

							this.player[0].hide();
							this.player[1].show();

							if(DEBUG_MP) console.log("switch to 2");
							initTargetPopcorn('#' + this.player[1].data("jPlayer").internal.video.id, this.scriptIndex);
							this.player[0].jPlayer("pause");
							this.player[1].jPlayer("play",this.start/1000); 
						} else {
							// Would need to change the media... But it should already be ready.
							this._pauseVideos();
							this.setTitle(theScript[this.scriptIndex].title);
							this.titleTimeRef = (new Date()).getTime();
							clearInterval(this.managerInterval);
							this.managerInterval = setInterval(function() {
								if(DEBUG_MP) console.log('manager interval: Generated in manager()')
								self.manager();
							},250);
						}

						if (effectArray.length) {
							this.createVideoMap(effectArray);
							this.connectVideo(nextVideoId);
						} else if (this.currentVideoId !== nextVideoId) {
							this.connectVideo(nextVideoId);
						}

						// Setup the audio if necessary

						// Odd looking mediaId logic since it either undefined or -1 when not being used... need to normalize that bit. (effects vs titles/audio)
						// if(this.scriptIndex > 0 || !(theScript[0].mediaId >= 0)) {

						if(theScript[this.scriptIndex-1] && theScript[this.scriptIndex-1].audio) {
							var offset = 0,
								audio = theScript[this.scriptIndex-1].audio;
							if(DEBUG_AUDIO) console.log('manager(): theScript[%f]=%o',this.scriptIndex-1,theScript[this.scriptIndex-1]);

							if(myAudio.data('jPlayer').status.src !== audio.url) {
								if(DEBUG_AUDIO) console.log('manager(): setMedia=%s',audio.url);
								myAudio.jPlayer('setMedia', {
									mp3: audio.url
								});
							}

							if(DEBUG_AUDIO) console.log('manager(): script chunk offset=%f',offset);

							if(DEBUG_AUDIO) console.log('manager(): volume=%f : start=%f',audio.volume,audio.start);
							if(typeof audio.volume === 'number') {
								myAudio.jPlayer('volume', audio.volume);
							}
							if(typeof audio.start === 'number') {
								offset += audio.start;
							}

							if(DEBUG_AUDIO) console.log('manager(): playing at offset=%f',offset);
							myAudio.jPlayer('play', offset);
						}

					} else {
						// Ended Target Transcript.
						if (DEBUG_MP) console.log("Ended Target Transcript.");

						this.paused = true; // FYI - If you do not set this flag, the player loops and auto-plays from the start again.

						this.scriptIndex = 0;
						this.start = theScript[this.scriptIndex].start;
						this.end = theScript[this.scriptIndex].end;

						// Hide both players.
						this.player[0].hide();
						this.player[1].hide();

						// Reset the video map to the first one, or just remove it if no initial effect.
						// this.createVideoMap((theScript[0].mediaId && theScript[0].effect) || []);

						// Cue up the players ready for if the play button is pressed.
						this.cue(); // Ideally we want this to not display the start, but leave on the end

						// Show the correct control button
						$('#play-btn-target').show();
						$('#pause-btn-target').hide();

						$('#jp_container_target .jp-play').show();
						$('#jp_container_target .jp-pause').hide();
					}
				}
			}
		},
		// setDuration calculates the duration of the target player contents
		setDuration: function() {
			var duration = 0;
			$.each(theScript, function() {
				duration += this.end - this.start;
			});

			duration /= 1000; // convert to seconds.
			this.duration = duration;
			$('#jp_container_target .jp-duration').text($.jPlayer.convertTime(duration));
		},
		// getCurrentTimeOffset calculates the duration of the previous entities.
		getCurrentTimeOffset: function(scriptIndex) {
			return this.getRelativeTimeOffset(0,scriptIndex);
		},
		// getRelativeTimeOffset calculates the time between two script entities.
		getRelativeTimeOffset: function(thatIndex, thisIndex) {
			var offset = 0;
			for(var i=thatIndex; i < thisIndex; i++) {
				offset += theScript[i].end - theScript[i].start;
			}
			offset /= 1000; // convert to seconds.
			if(DEBUG_CURRENTTIME) console.log('getRelativeTimeOffset(%f,%f): offset=%f',thatIndex,thisIndex,offset);
			return offset;
		},
		getAbsoluteCurrentTime: function() {
			var currentTime = 0;

			if(this.playerMediaId[0] === this.currentMediaId) {
				currentTime = this.player[0].data('jPlayer').status.currentTime;
			} else if(this.playerMediaId[1] === this.currentMediaId) {
				currentTime = this.player[1].data('jPlayer').status.currentTime;
			} else if(!this.paused) {
				currentTime = ((new Date()).getTime() - this.titleTimeRef) / 1000;
			}
			if(DEBUG_CURRENTTIME) console.log('getAbsoluteCurrentTime(): currentTime=%f',currentTime);
			return currentTime;
		},
		getRelativeCurrentTime: function() {
			var currentTime = this.getAbsoluteCurrentTime() - (theScript[this.scriptIndex].start / 1000);
			if(DEBUG_CURRENTTIME) console.log('getRelativeCurrentTime(): currentTime=%f',currentTime);
			return currentTime;
		},
		getCurrentTime: function() {
			var currentTime = this.getCurrentTimeOffset(this.scriptIndex) + this.getRelativeCurrentTime();
			if(DEBUG_CURRENTTIME) console.log('getCurrentTime(): currentTime=%f',currentTime);
			return currentTime;
		},
		setCurrentTime: function(time) {
			var currentTime = (typeof time === 'number') ? time : this.getCurrentTime();
			if(currentTime > this.duration) {
				currentTime = this.duration;
			} else if(currentTime < 0) {
				currentTime = 0;
			}
			$('#jp_container_target .jp-current-time').text($.jPlayer.convertTime(currentTime));
		}
	};

	targetPlayer.init();

	function fitVideo(c) {
		var s = c.data('jPlayer').options.size;
		// c.find('video').css('width',c.css('width')).css('height',c.css('height'));
		c.find('video').css('width',s.width).css('height',s.height);
	}

	myPlayerSource.jPlayer({
		ready: function (event) {
			// Err Umm... Could set a flag here if we think user could react within a few ms.
		},
		cssSelectorAncestor: "#jp_container_source",
		solution: "html, flash",
		swfPath: "js",
		supplied: suppliedMedia,
		preload: "auto"
	});



	/*targetPlayer.player[0].jPlayer({
		ready: function (event) {

			if(event.jPlayer.html.used && event.jPlayer.html.video.available) {
				// sets size of video to that of container
				// fitVideo($(this));
			}
		},
		timeupdate: function(event) {
			setTimeout(function() {
				targetPlayer.manager(event);
			},0);
		},
		solution: "html, flash",
		swfPath: "js",
		supplied: suppliedMedia,
		preload: "auto"
	});

	targetPlayer.player[1].jPlayer({
		ready: function (event) {

			if(event.jPlayer.html.used && event.jPlayer.html.video.available) {
				// sets size of video to that of container
				// fitVideo($(this));
			}
		},
		timeupdate: function(event) {
			setTimeout(function() {
				targetPlayer.manager(event);
			},0);
		},
		solution: "html, flash",
		swfPath: "js",
		supplied: suppliedMedia,
		preload: "auto"
	});*/

	// refactored the above to eliminate duplication of code - MB

	function playerListen(player) {
		player.jPlayer({
			ready: function (event) {

				if(event.jPlayer.html.used && event.jPlayer.html.video.available) {
					// sets size of video to that of container
					// fitVideo($(this));
				}
			},
			timeupdate: function(event) {
				setTimeout(function() {
					targetPlayer.manager(event);
				},0);
			},
			solution: "html, flash",
			swfPath: "js",
			supplied: suppliedMedia,
			preload: "auto"
		});
	}

	playerListen(targetPlayer.player[0]);
	playerListen(targetPlayer.player[1]);

	myAudio.jPlayer({
		error: function (event) {
			console.log('audio error event: %o',event);
		},
		solution: "html, flash",
		swfPath: "js",
		supplied: "mp3",
		preload: "auto"
	});

	// These events are fired as play time increments  

	var playingWord = 1;

	// transcript links to audio

	$('#transcript-content').delegate('span','click',function(e){ 

		targetPlayer.paused = true; 
		var jumpTo = $(this).attr('m')/1000; 
		//console.log('playing from '+jumpTo);

		myPlayerSource.jPlayer("play",jumpTo);

		$('#play-btn-source').hide();
		$('#pause-btn-source').show();  

		/*e.stopPropagation();
		e.preventDefault(); 
		e.stopImmediatePropagation();*/
		//console.log('click');

		return false;
	});

	$('#target-content').delegate('span','click',function(){

		var playConfig = {
			jumpTo: $(this).attr('m')/1000,
			scriptIndex: parseInt($(this).parent().attr('i'), 10),
			start: parseInt($(this).parent().attr('start'), 10),
			end: parseInt($(this).parent().attr('end'),  10)
		}

		targetPlayer.play(playConfig);

		return false;
	});

	// function to update the target transcript indexes when splicing in a title
	function spliceTargetIndex(index, myPara) {
		index = Number(index);
		$('#target-content p').each(function() {
			var $this = $(this),
				i = Number($this.attr('i'));

			if(DEBUG_MP) console.log(i + ":  " + $this.text());
			if(i === index) {
				// if($this.text().toLowerCase().indexOf('[title') >= 0) {
				if($this[0] === myPara) {
					$this.attr('i', i+1);
				}
			} else if(i > index) {
				$this.attr('i', i+1);
			}
		});
	}
	// window.spliceTargetIndex = spliceTargetIndex; // TMP for testing

	// Listen to contenteditable
	document.addEventListener("DOMCharacterDataModified", function(event) {
		
		// This whole thing needs 'evolving'

		if (DEBUG_MB) console.log($(event.target).parent()[0].tagName);
		if (DEBUG_MB) console.dir(event);
		if (DEBUG_MB) console.log($(event.target).parent().attr("m"));
		var index = $(event.target).parents('p').attr("i");
		var parentPara = $(event.target).parents('p')[0];
		var newText = event.newValue;
		if (DEBUG_MB) console.log(event.newValue);
		if (DEBUG_MB) console.log("the whole event");
		if (DEBUG_MB) console.dir(event);


		var startBracketIndex = newText.indexOf('[');
		var endBracketIndex = newText.indexOf(']');

		// Ignore the events until the whole command has been entered
		if(endBracketIndex < 0) {
			return;
		}

		if(!parentPara) {
			$(event.target).wrap('<p><span>'); // .wrap('<span>');
			parentPara = $(event.target).parents('p')[0];
		}

		var startQuoteIndex = newText.indexOf('"');
		var endQuoteIndex = newText.indexOf('"', startQuoteIndex+1);
		var quoteInCmd = (startQuoteIndex >= 0) && (endQuoteIndex >= 0);
		var quoteCaption = 'Needs "text"';

		var commands = newText.substring(startBracketIndex+1,endBracketIndex);
		var commandsTrimmed = commands;

		if(quoteInCmd) {
			quoteCaption = newText.substring(startQuoteIndex+1,endQuoteIndex);
			commandsTrimmed = newText.substring(startBracketIndex+1,startQuoteIndex) + newText.substring(endQuoteIndex+1,endBracketIndex);
		}

		if (DEBUG_MB) console.log('commands: '+commands);
		if (DEBUG_MB) console.log('commandsTrimmed: '+commandsTrimmed);
		var commandList = commandsTrimmed.toLowerCase().split(" ");
		if (DEBUG_MB) console.dir(commandList);

		// read in any existing settings

		var time,
			color,
			fade,
			effect,
			caption,
			title,
			audio;

		if(theScript[index]) {
			time = theScript[index].time;
			color = theScript[index].color;
			fade = theScript[index].fade;
			effect = theScript[index].effect;
			caption = theScript[index].caption;
			title = theScript[index].title;
			audio = theScript[index].audio;
		}

		if (DEBUG_MB) console.log("cm length = "+commandList.length);

		// We could use this list to load the appropriate JS files (also conceivably we could load on demand) -MB
		var effects = ['none','ascii','bleach-bypass','colorcube','emboss','invert','nightvision','noise','ripple','scanlines','sepia','sketch','tvglitch','vignette'];

		var effectIndex = 0;

		/* The commands need to have some rules.
		 * 1) Primary command is first.
		 *  - "apply" for effect.
		 *  - "fade" for a main video fade.
		 *  - "caption" for a caption.
		 */

		if(commandList[0] === 'apply') {
			effect = [];
		} else if(commandList[0] === 'fade') {
			fade = true;
		} else if(commandList[0] === 'caption') {
			caption = {
				text: quoteCaption
			};
		} else if(commandList[0] === 'title') {
			title = {
				text: quoteCaption
			};
		} else if(commandList[0] === 'audio') {
			audio = {
				url: quoteCaption
			};
		}

		// Ripe for refactor... want more generic command syntax... Knock on refactor to other parts though.

		for (var i=1; i < commandList.length; i++) {

			if (DEBUG_MB) console.log("word "+i);

			if (commandList[0] === 'apply' && $.inArray(commandList[i], effects) >= 0) {
				if(commandList[i] === 'none') {
					effect = [commandList[i]]; // none
				} else {
					effect[effectIndex] = commandList[i];
					effectIndex++;
				}
			}

			if (DEBUG_MB) console.log(commandList[i]+ 'a number? = '+isNumber(commandList[i]) );

			// detecting main video fade
			if (commandList[0] === 'fade') {
				if (isNumber(commandList[i])) {
					time = commandList[i];
				}

				if (isColor(commandList[i])) {
					color = commandList[i];
				}
			}

			// The caption and title coding could probably be merged in a refactor

			if(commandList[0] === 'caption') {
				if(isColor(commandList[i])) {
					if(!caption.color) {
						caption.color = commandList[i]; // Stores the 1st color given
					} else {
						caption.bgcolor = commandList[i]; // Stores the 2nd or last color given.
					}
				}
				switch(commandList[i]) {
					case 'left':
					case 'center':
					case 'right':
						caption.align = commandList[i];
						break;
					case 'top':
					case 'middle':
					case 'bottom':
						caption.valign = commandList[i];
						break;
				}
				if(isNumber(commandList[i])) {
					caption.duration = commandList[i] * 1; // Convert to a number (from string)
				}
			}


			if(commandList[0] === 'title') {
				if(isColor(commandList[i])) {
					if(!title.color) {
						title.color = commandList[i]; // Stores the 1st color given
					} else {
						title.bgcolor = commandList[i]; // Stores the 2nd or last color given.
					}
				}
				switch(commandList[i]) {
					case 'left':
					case 'center':
					case 'right':
						title.align = commandList[i];
						break;
					case 'top':
					case 'middle':
					case 'bottom':
						title.valign = commandList[i];
						break;
				}
				if(isNumber(commandList[i])) {
					title.duration = commandList[i] * 1; // Convert to a number (from string)
				}
			}

			if(commandList[0] === 'audio') {
				if(isPercent(commandList[i])) {
					audio.volume = percentToRatio(commandList[i]);
				}
				if(isNumber(commandList[i])) {
					audio.start = commandList[i] * 1; // Convert to a number (from string)
				}
			}

		}

		// if (DEBUG_MB) console.log(action);
		if (DEBUG_MB) console.log(time);
		if (DEBUG_MB) console.log(color);

		if ( newText.indexOf(']') > 0 ) { // Beleive this clause redundant due to check and return at start.

			var needCue = false,
				copyOldProps = true;

			// direction has been given at the start OR this is a title
			if (theScript.length === 0 || commandList[0] === 'title') {

				// create empty timespan to hold the effect/title
				var timespan = {};
				timespan.start = 0;

				timespan.mediaId = -1; // 0

				if (theScript.length === 0 && commandList[0] === 'title') {
					if (DEBUG_MB) console.log('theScript length is zero AND adding title');
					timespan.end = title.duration * 1000;
					index = 0;
					$(parentPara).attr('i',index).attr('start',timespan.start).attr('end',timespan.end);
					theScript.push(timespan);
					needCue = true;
					copyOldProps = false;
					theScript[index].title = title;
				} else if(theScript.length === 0) {
					if (DEBUG_MB) console.log('theScript length is zero');
					timespan.end = 0;
					index = 0;
					$(parentPara).attr('i',index).attr('start',timespan.start).attr('end',timespan.end);
					theScript.push(timespan);
				} else {
					if (DEBUG_MB) console.log('Adding title to theScript');
					timespan.end = title.duration * 1000;
					spliceTargetIndex(index, parentPara);
					$(parentPara).attr('start',timespan.start).attr('end',timespan.end);
					index++;
					theScript.splice(index, 0, timespan);
					copyOldProps = false;
					theScript[index].title = title;
				}

				// update the duration
				targetPlayer.setDuration();
			}

			// titles create a new object, so do not copy the old ones or we get duplicates. Bad for audio at least.
			if(copyOldProps) {

				theScript[index].fade = fade;
				theScript[index].time = time;
				theScript[index].color = color;
				theScript[index].effect = effect;
				theScript[index].caption = caption;
				theScript[index].title = title;
				theScript[index].audio = audio;
			}

			theScript[index].commandText = commands;

			if(needCue) {
				targetPlayer.cue();
			}

		}

		//console.dir(commandList);
		if (DEBUG_MB) console.dir(theScript);
	});

	function isNumber(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}

	function isPercent(p) {
		var ui = p.indexOf('%'),
			n = p.substring(0,ui);
		return (ui >= 0) && isNumber(n) && (ui === p.length-1);
	}
	function percentToRatio(p) {
		var ui = p.indexOf('%'),
			n = p.substring(0,ui);
		return Number(n) / 100;
	}

	var legalColors = ['black','silver','gray','white','maroon','red','purple','fuchsia','green','lime','olive','yellow','navy','blue','teal','aqua'];

	function isColor(c) {
		for (i = 0; i < legalColors.length; i++) {
			if (c == legalColors[i]) {
				return true;
			}
		}
	}

	targetPlayer.player[0].bind($.jPlayer.event.ended, function() {

	}); 

	/* hyperaudiopad stuff */

	/* load in the file */


	function initSourcePopcorn(id) {
		if(DEBUG_MP) console.log('initSourcePopcorn('+id+')');
		killSourcePopcorn();
		if(DEBUG_MP) console.log('initSourcePopcorn('+id+'): Creating sourcePopcorn');
		sourcePopcorn = Popcorn(id);
		$("#transcript-content span").each(function(i) {  
			sourcePopcorn.transcript({
				time: $(this).attr("m") / 1000, // seconds
				futureClass: "transcript-grey",
				target: this,
				onNewPara: function(parent) {
					$("#transcript-content").stop().scrollTo($(parent), 800, {axis:'y',margin:true,offset:{top:0}});
				}
			});
		});
	}


	// Destroying the popcorn instance in Firefox cause lock-up for up to 10 seconds.
	function killSourcePopcorn() {
		if(sourcePopcorn) {
			// if(DEBUG_MP) console.log('killSourcePopcorn(): Destroying sourcePopcorn');
			// sourcePopcorn.destroy();
			// Popcorn.destroy(sourcePopcorn);
			delete sourcePopcorn;
		}
	}

	// Applied to the current chunk in the target that is playing
	function initTargetPopcorn(id, index, jumpTo) {
		if(DEBUG_MP) console.log('initTargetPopcorn('+id+', '+index+', '+jumpTo+')');
		killTargetPopcorn();
		if(DEBUG_MP) console.log('initTargetPopcorn('+id+', '+index+', '+jumpTo+'): Creating targetPlayer.popcorn');
		targetPlayer.popcorn = Popcorn(id);
		$("#target-content p[i='" + index + "'] span").each(function(i) {
			var myTime = $(this).attr("m") / 1000; // seconds
			targetPlayer.popcorn.transcript({
				time: myTime, // seconds
				futureClass: "transcript-grey",
				target: this,
				onNewPara: function(parent) {
					$("#target-content").stop().scrollTo($(parent), 800, {axis:'y',margin:true,offset:{top:0}});
				}
			});
			// Since the first word is usually highlighted incorrectly, due to event never firing.
			// ie., The currentTime jumped past the trigger time for the word.
			// if(i === 0) {
			if(i === 0 || jumpTo && myTime <= jumpTo) {
				$(this).removeClass("transcript-grey");
			}
		});
	}

	function killTargetPopcorn() {
		if(targetPlayer.popcorn) {
			if(DEBUG_MP) console.log('killTargetPopcorn(): Destroying targetPlayer.popcorn');
			targetPlayer.popcorn.destroy();
			delete targetPlayer.popcorn;
		}
	}

	function setTargetHighlighting(index) {

		$("#target-content p").each(function() {
			var $this = $(this),
				i = parseInt($this.attr('i'), 10);

			if(DEBUG_MP) console.log('setTargetHighlighting('+index+'): i='+i);

			// if (i > index || (i !== 0 && index === 0)) { // Transcript after index will be read in the future. index=0 for a reset all.
			if (i > index || (index === 0)) { // Transcript after index will be read in the future.
				$this.find("span").addClass("transcript-grey");
			} else if (i < index) { // Transcript before index has been read.
				$this.find("span").removeClass("transcript-grey");
			}
			// Leave the current index alone, since popcorn will deal with that.
		});
	}

	// Generate the Transcript list.

	var $transFiles = $('#transcript-files').empty();
	$.each(transcripts, function(i) {
		var $transBtn = $('<a class="transcript-file">' + this.title + '</a>').click(function(e) {
			e.preventDefault();
			loadTranscriptSource(i);
		});
		$transFiles.append($('<li></li>').append($transBtn));
	});

	// For loading Transcripts into the source area.

	var sourceLoaded = false;

	function loadTranscriptSource(id) { 

		// The id is the index reference to the transcripts array.

		if (DEBUG_MB) console.log('loadTranscriptSource('+id+')');

		// Set the title
		$('#script-title').text(transcripts[id].title); // Move to loadTranscriptSource()

		// Reset the play/pause button
		$('#play-btn-source').show();
		$('#pause-btn-source').hide();

		 // Stop the player
		myPlayerSource.jPlayer("pause");

		killSourcePopcorn();

		$('#load-status-source').html('loading ...');
		$('#transcript-content').empty().load(transcripts[id].url, function() {
			//load success!!!

			// Scroll the transcript to the top
			$("#transcript-content").stop().scrollTo($("#transcript-content p:first"), 800, {axis:'y',margin:true,offset:{top:0}});

			// Setup popcorn and load in the media
			initSourcePopcorn('#' + myPlayerSource.data("jPlayer").internal.video.id);
			myPlayerSource.jPlayer("setMedia", transcripts[id].media);
			$('#jp_container_source .fb-title').text(transcripts[id].title);

			// Store reference to the transcript
			sourceMediaId = id;

			// Correct the initial video display without a poster.
			fitVideo(myPlayerSource);

			$('#load-status-source').html('');

			if (hints == true) {
				$('#transcript-content-hint').fadeIn('slow');
				$('#transcript-file-hint').fadeOut('slow');
			}

			$('#source-header-ctrl').fadeIn();
			$('#jp_container_source').show().find('.jp-gui').hide().delay(800).fadeTo("slow", 0.5);
			sourceLoaded = true;
		});
	}

	// select text function

	function getSelText()
	{
		var txt = '';
		if (window.getSelection){
			txt = window.getSelection();
		}
		else if (document.getSelection){
			txt = document.getSelection();
		}
		else if (document.selection){
			txt = document.selection.createRange().text;
		}

		return txt;
	}

	// Causes issues when content is scrolled

	/*$('#transcript-content').mousedown(function(){ 
		$(this).focus();
	});*/

	// Sets the excerpt  

	function copyOver(startSpan, endSpan, startTime, endTime, sIndex) {

		var nextSpan = startSpan; 
		// $('#target-content').append('<p s="'+startTime+'" e="'+endTime+'" f="'+targetPlayer.player[0].data('jPlayer').status.src+'">');
		var selectedStuff = $('<p i="'+sIndex+'" start="'+startTime+'" end="'+endTime+'">'); 
		var initialSelectedStuff = selectedStuff; 
		
		//console.log('selected....');


		
		
		while(nextSpan && nextSpan != endSpan) { 

			if(DEBUG_MB) console.log('nextSpan != endSpan while loop');
			if(DEBUG_MB) console.log('endSpan = '+endSpan);
			if(DEBUG_MB) console.log('nextSpan = '+nextSpan);

			if (nextSpan instanceof HTMLSpanElement) {
				$(nextSpan).clone().appendTo(selectedStuff); 
				selectedStuff.append(' ');
			}

			// as nextNode of a paragraph is a parapgraph we want to drop down here
			if (nextSpan instanceof HTMLParagraphElement) {
				selectedStuff.append('<p>');
				nextSpan = nextSpan.firstChild;
			} else {
				nextSpan = getNextNode(nextSpan,true,endSpan);	
			}
		}

		if (nextSpan) {
			$('#target-content').append( initialSelectedStuff ); 

			$(endSpan).clone().appendTo(selectedStuff); 

			// grab the span after the endSpan to get proper end time

			var nextSpanStart = getNextNode(nextSpan,true,endSpan);

			if (nextSpanStart instanceof HTMLParagraphElement) {
				nextSpanStart = nextSpanStart.firstChild;
			}

			var nextSpanStartTime = parseInt(nextSpanStart.getAttribute('m'));

			if (isNaN(nextSpanStartTime)) { // checking for end of text select
				nextSpanStartTime = Math.floor(myPlayerSource.data('jPlayer').status.duration * 1000);
			}

			$('#target-content').append('</p>');

			var timespan = {};
			timespan.start = startTime;
			timespan.end = nextSpanStartTime;

			timespan.mediaId = sourceMediaId;

			return timespan;
		}
		else
		{
			return null;
		}
	}


	// check whether content has been highlighted on the LHS

	$('#transcript-content').mouseup(function(e){ 

		//console.log('mouseup');

		var select = getSelText(); 
			var tweetable = select+"";  

		if(DEBUG_MB) console.log('select: %o', select);

		var startSpan = select.anchorNode.nextSibling; 
		if (startSpan == null) {
			startSpan = select.anchorNode.parentNode;
		}

		if(DEBUG_MB) console.log('startSpan = '+startSpan);


		//var endSpan = select.focusNode.nextSibling;

		//console.log('select.focusnode');
		//console.dir(select.focusNode);

		var endSpan;

		// Check node sibling is a span (otherwise must be a para)
		// NB: Node is always text which is why we need to grab the sibling

		//var endNode = select.focusNode.nextSibling;
		var endNode = select.focusNode;

		if (endNode instanceof HTMLSpanElement) {
			endSpan = endNode; 
		} else {
			//console.log('endNode not span');
			//console.dir(endNode);

			if (endNode instanceof HTMLParagraphElement) {
				endSpan = select.focusNode.previousSibling.lastElementChild;
			} else {
				endSpan = select.focusNode.previousSibling;
			}
		}

		if (endSpan == null) {  
			//console.log('END SPAN IS NULL');
			endSpan = select.focusNode.parentNode; 
			/*if (endSpan == null) {
				endSpan = select.focusNode.parentNode;
			}*/
		}

		/*if (endSpan == null) {  
			console.log('END SPAN IS NULL');
			endSpan = select.focusNode.parentNode.nextElementSibling; 
			if (endSpan == null) {
				endSpan = select.focusNode.parentNode;
			}
		} */
		

		/*console.log('start span ..... ');
		console.dir(startSpan);
		console.log('start span');
		console.log(startSpan); 
		console.log('--------');  
		console.log('end span ..... ');
		console.dir(endSpan);
		console.log('end span');
		console.log(endSpan); 
		console.log('--------');*/


		//console.log(endSpan instanceof);


		// if either are null we have a problem basically, a problem that should be solved
		if (startSpan != null && endSpan != null) {

			// Flip if end time is less than start time (ie the text was selected backwards)

			var startTime = parseInt(startSpan.getAttribute('m'));
			//var endTime = parseInt(endSpan.getAttribute('m'));

			

			var endTime = parseInt(endSpan.getAttribute('m')); 

			



			var tempSpan = endSpan;
			var tempTime = endTime;
			
			if (endTime < startTime) {
				endSpan = startSpan; 
				endTime = startTime;  
				startSpan = tempSpan;
				startTime = tempTime;
			}

			

			if(DEBUG_MB) console.log("next time ="+getNextNode(endSpan,true,endSpan).getAttribute('m'));

			var nextElement = getNextNode(endSpan,true,endSpan);

			if (nextElement instanceof HTMLParagraphElement) {
				nextElement = nextElement.firstChild;
			}

			var startNextWord = nextElement.getAttribute('m');

			// endTime should only be last word time + 1 second if there is no next node

			if (startNextWord) {
				if(DEBUG_MB) console.log('not last word');
				endTime = parseInt(startNextWord);
			} else {
				if(DEBUG_MB) console.log('last word');
				endTime = Math.floor(myPlayerSource.data('jPlayer').status.duration * 1000);
			}

			if(DEBUG_MB) console.log('startTime');
			if(DEBUG_MB) console.log(startTime);
			if(DEBUG_MB) console.log('--------');
			if(DEBUG_MB) console.log('endTime');
			if(DEBUG_MB) console.log(endTime); 
			if(DEBUG_MB) console.log('--------');
			
			// check for single word click
			//if (getNextNode(startSpan,true,endSpan) != endSpan) {
			// we should allows for single word selection though
			if (startSpan != endSpan) {
				/*console.log('startspan');
				console.log(startSpan); 
				console.log('--------');
				console.log('endspan');
				console.log(endSpan); 
				console.log('--------'); */


				/* --- start snip --- */
				
				var timespan = copyOver(startSpan,endSpan,startTime,endTime, theScript.length);

				if(DEBUG_MB) console.log('--------');
				if(DEBUG_MB) console.log('timespan ...');
				if(DEBUG_MB) console.dir(timespan);

				if (timespan) {
					theScript.push(timespan);

					if(theScript.length === 1) {
						// Setup the target player for the start.
						targetPlayer.cue();
					}
					
					// update the duration
					targetPlayer.setDuration();

					//$.bbq.pushState(theScript);
					//console.dir(theScript);

					//alert('here');

					//$('#target-content span').addClass('transcript-grey');

					$('#target-header-ctrl').fadeIn();
					$('#target-action-ctrl').fadeIn();

					$('#transcript-content-hint').fadeOut();

					// this reveals the target video on first paste
					
					if (!$('#show-video-target').is(":visible")) {
						$('#target-content').css('top','350px');
					}

					// making it clear that we have an editable content pane
					$('#target-content').focus();
					
					hints = false;
				}

				/*--- end snip ----*/

				//e.preventDefault(); 
				//e.stopImmediatePropagation();
				return false; 
			}
		}


		
	});

	$('#transcript-content-hint').click(function() {
		$(this).fadeOut('slow');
		hints = false;
	});



	var getNextNode = function(node, skipChildren, endNode){

		//console.dir(node);
		//if there are child nodes and we didn't come from a child node
		/*if (endNode == node) {
			return null;
		}*/

		if(DEBUG_MB) console.log('getNextNode');

		if (node != null) {

			if (node.firstChild && !skipChildren) {
				return node.firstChild;
			}
			if (!node.parentNode){
				return null;
			}
			return node.nextElementSibling || getNextNode(node.parentNode, true, endNode); 
		} else {
			if(DEBUG_MB) console.log('null node found');
			return false;
		}

		//return node.nextSibling || getNextNode(node.parentNode, true, endNode);

	};

	// play and pause for the source area.
	/*$('#play-btn-source').click(function(){
		myPlayerSource.jPlayer("play");
		$(this).hide();
		$('#pause-btn-source').show();
		return false;
	});
	$('#pause-btn-source').click(function(){
		myPlayerSource.jPlayer("pause");
		$(this).hide();
		$('#play-btn-source').show();
		return false;
	});*/


	// play and pause for the target area.

	$('#play-btn-target').click(function(e) {
		e.preventDefault();
		targetPlayer.play();
	});

	$('#pause-btn-target').click(function(e) {
		e.preventDefault();
		targetPlayer.pause();
	});

	$('#jp_container_target .jp-play').click(function(e) {
		e.preventDefault();
		targetPlayer.play();
	});
	$('#jp_container_target .jp-pause').click(function(e) {
		e.preventDefault();
		targetPlayer.pause();
	}).hide();

/*
	$('#clear-btn').click(function(){

		//$.bbq.removeState();
		theScript = [];
		$('#transcript-content').html('');
		$('#target-content').html('');

		Popcorn.destroy(p);

		return false;
	});
*/

	$('#instructions-btn').click(function(){

		if($('#instructions').is(':visible')){
			$('#instructions').fadeOut();
		} else {
			$('#instructions').fadeIn();
		}

		return false;
	});


	$('#show-video-source').click(function(){

		$('#transcript-content').css('top','350px');
		$(this).hide();
		$('#hide-video-source').show();

		return false;
	});

	$('#hide-video-source').click(function(){

		$('#transcript-content').css('top','78px');
		$(this).hide();
		$('#show-video-source').show();

		return false;
	});

	$('#show-video-target').click(function(){

		$('#target-content').css('top','350px');
		$(this).hide();
		$('#hide-video-target').show();

		return false;
	});

	$('#hide-video-target').click(function(){

		$('#target-content').css('top','78px');
		$(this).hide();
		$('#show-video-target').show();

		return false;
	});

	$('#clear-target').click(function(){
		theScript = [];

		targetPlayer.pause();
		killTargetPopcorn();

		// Remove any effects.
		targetPlayer.createVideoMap([]);

		// Remove the old transcript
		$('#target-content').empty();
		// need to make two classes here with heights in - too much repeated code with fixed numeric values
		$('#target-content').css('top','78px');
		$('#target-header-ctrl').fadeOut();
		$('#target-action-ctrl').fadeOut();

		return false;
	});

	$('#save-target').click(function(){

		var code = Math.random().toString(36).substring(7);

		$.ajax({
			url: "server/save.php" + "?save=1&code=" + code,
			data: {settings: JSON.stringify(theScript)},
			type: "POST",
			// contentType:"application/json;charset=UTF-8",
			dataType: "json",
			success: function(json) {
				window.location.hash = code;
			},
			error: function(xhr, status, error) {
				console.log('status = '+status);
				console.log('error = '+error);
			}
		});
		
		return false;
	});

	$('#jp_container_source').on("mouseenter",function(){
		if (sourceLoaded) {
			$(this).find('.jp-gui').stop(true).fadeTo("slow", 0.9);
		}
	}).on("mouseleave",function(){
		if (sourceLoaded) {
			$(this).find('.jp-gui').stop(true).delay(800).fadeTo("slow", 0.5);
		}
	});

	$('#jp_container_target').on("mouseenter",function(){
		$(this).find('.jp-gui').stop(true).fadeTo("slow", 0.9);
	}).on("mouseleave",function(){
		$(this).find('.jp-gui').stop(true).delay(800).fadeTo("slow", 0.5);
	}).on("mousemove",function(){
		var $gui = $(this).find('.jp-gui');
		if(fullscreen.requested) {
			if(targetPlayer.paused) {
				$gui.fadeTo("fast", 0.9);
			} else {
				$gui.stop(true).fadeTo("fast", 0.9).delay(800).fadeTo("slow", 0);
			}
		}
	}).find('.jp-gui').fadeTo("fast", 0.5);


	var fullscreen = {
		target: '#jp_container_target', // '#target-canvas',
		$target: null,
		btnFullscreen: '#full-screen-target',
		$btnFullscreen: null,
		btnRestorescreen: '.jp-viewsource', // inside the target
		$btnRestorescreen: null,
		enabled: false,
		active:false,
		requested:false,
		init: function() {
			var self = this;

			this.$target = $(this.target);
			this.$btnFullscreen = $(this.btnFullscreen);
			this.$btnRestorescreen = this.$target.find(this.btnRestorescreen);

			// Create event handlers if native fullscreen is supported
			if($.jPlayer.nativeFeatures.fullscreen.api.fullscreenEnabled) {
				this._addEventListeners();
				this.enabled = true;
			} else {
				this.$btnFullscreen.hide();
			}

			this.$btnFullscreen.click(function(e) {
				e.preventDefault();
				self.request();
			});

			this.$btnRestorescreen.click(function(e) {
				e.preventDefault();
				self.exit();
			}).parent().hide();
		},
		_addEventListeners: function() {
			var self = this,
				fs = $.jPlayer.nativeFeatures.fullscreen;

			if(fs.api.fullscreenEnabled) {
				if(fs.event.fullscreenchange) {
					document.addEventListener(fs.event.fullscreenchange, function() {
						self._change();
					}, false);
				}
				if(fs.event.fullscreenerror) {
					// Little point creating handler for fullscreenerror. There is no event on the webkit browser.
					document.addEventListener(fs.event.fullscreenerror, function() {
						self._error();
					}, false);
				}
			}
		},
		_change: function() {
			var fsElem = $.jPlayer.nativeFeatures.fullscreen.api.fullscreenElement();
			// console.log('change: elem: ' + fsElem);

			// If nothing is fullscreen, then we cannot be in fullscreen mode. ie., Detect escape pressed.
			if(this.requested && !fsElem) {
				this.exit();
			}

			this.active = !!fsElem;
		},
		_error: function() {
			// console.log('error: elem: ' + $.jPlayer.nativeFeatures.fullscreen.api.fullscreenElement());
		},
		isRestricted: function() {
			return this.enabled && (this.active !== this.requested);
		},
		request: function() {
			var e = this.$target[0],
				fs = $.jPlayer.nativeFeatures.fullscreen;

			if(fs.api.fullscreenEnabled) {
				this.requested = true;
				fs.api.requestFullscreen(e);
				this.$target.addClass('jp-fullscreen');
				this.$btnRestorescreen.parent().show();
			}
		},
		exit: function() {
			var fs = $.jPlayer.nativeFeatures.fullscreen;

			if(fs.api.fullscreenEnabled) {
				this.requested = false;
				fs.api.exitFullscreen();
				this.$target.removeClass('jp-fullscreen');
				this.$btnRestorescreen.parent().hide();
			}
		}
	};
	fullscreen.init();









	// testing panel resize stuff (not currently used)

	$('.drag-bar').drag(function( ev, dd ){
		$( this ).css('left', dd.offsetX);
		$('.right.col').css('left',dd.offsetX);

		// second param is the base - not required in most browsers
		var middleLeft = parseFloat($('.middle.col').css('left'),10);
		var middleWidth = dd.offsetX - middleLeft-4;

		if (DEBUG_MB) console.log(middleWidth);
		if (DEBUG_MB) console.log(middleLeft);

		
		$('.middle.col').css('width', middleWidth);


		if (DEBUG_MB) console.log("dd.offsetX:"+dd.offsetX);
	});

});