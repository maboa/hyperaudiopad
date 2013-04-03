$(document).ready(function(){

	// var seriously = new Seriously(); // instance seriously lib for global use

	$.jPlayer.timeFormat.padMin = false;

	var DEBUG_MP = true;
	var DEBUG_MB = true;

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
			/* m4v: 'http://happyworm.com/video/internetindians.mp4',
			webmv: 'http://happyworm.com/video/internetindians.webm' */
			m4v: '../video/internetindians.mp4',
			webmv: '../video/internetindians.webm'
		}
	}, {
		title: "Rainforest Raids",
		url: "transcripts/raidsinrainforest.htm",
		media: {
			/* m4v: 'http://happyworm.com/video/raidsinrainforest.mp4',
			webmv: 'http://happyworm.com/video/raidsinrainforest.webm' */
			m4v: '../video/raidsinrainforest.mp4',
			webmv: '../video/raidsinrainforest.webm'
		}
	}
	, {
		title: "The Justice Boat",
		url: "transcripts/justiceboat.htm",
		media: {
			/* m4v: 'http://happyworm.com/video/justiceboat.mp4',
			webmv: 'http://happyworm.com/video/justiceboat.webm' */
			m4v: '../video/justiceboat.mp4',
			webmv: '../video/justiceboat.webm'
		}
	}/*, {
		title: "SOTU 2013",
		url: "transcripts/sotu2013.htm",
		media: {
			m4v: 'http://bc05.ajnm.me/665003303001/665003303001_2161312826001_The-2013-State-of-the-Union-Address.mp4',
			webmv: 'Noo fecking WebM pal'
		}
	}, {
		title: "SOTU 2012",
		url: "transcripts/sotu2012.htm",
		media: {
			m4v: 'http://bc05.ajnm.me/665003303001/665003303001_2154491034001_012412-StateoftheUnion-EN-HD.mp4',
			webmv: 'Noo fecking WebM pal'
		}
	}*/];


	if (DEBUG_MB) console.log('hash = '+window.location.hash);

	function loadTranscriptsFromFile(i) {
		
		if(!i) {
			i = 0;
		}

		if (DEBUG_MB) console.log("index = "+i);

		if (i < theScript.length) {
			if (DEBUG_MB) console.log("copying over...");
			var transcript = transcripts[theScript[i].mediaId].url;

			$('#transcript-content').load(transcript, function() {
				
				var startSpan, endSpan, startTime, endTime;

				startTime = theScript[i].start;
				endTime = theScript[i].end;

				if (DEBUG_MB) console.log("grabbing the spans");

				$('#transcript-content span[m="'+startTime+'"]').each(function() {
					startSpan = $(this)[0];
					$('#transcript-content span[m="'+endTime+'"]').each(function() {
						endSpan = $(this)[0].previousElementSibling;

						if (DEBUG_MB) console.log("start/end");
						if (DEBUG_MB) console.dir(startSpan);
						if (DEBUG_MB) console.dir(endSpan);
						if (DEBUG_MB) console.log("startTime = "+startTime);
						if (DEBUG_MB) console.log("endTime = "+endTime);

						copyOver(startSpan, endSpan, startTime, endTime, function() {
							if (DEBUG_MB) console.log("calling loadTranscriptsFromFile");
							loadTranscriptsFromFile(++i);
						});
					});
				});
				
				if (DEBUG_MB) console.log('transcript = '+transcript);
			});
		} else {
			if (DEBUG_MB) console.log('dropping out');
			//return false;
		}
	}

	var hash = window.location.hash.replace("#","");
	if (hash.length > 0) {
		// load theScript
		$.get('remixes/'+hash+'.json', function(data) {
			if (DEBUG_MB) console.log('theScript loaded in');
			if (DEBUG_MB) console.dir(data);
			theScript = data;

			loadTranscriptsFromFile();

		});
	}

	var theScript = [];  
	var latency = 1000;

	// Grab the script from the URL
	var theScriptState = [];
	//var theScriptState = $.bbq.getState();
	//console.dir(theScript);  
	var theScriptLength = theScript.length; 

	//console.log(theScript[0].m);
	//console.log(theScriptLength);
	//console.log(theScript.length);

	/*if (theScriptLength > 0) {

		for (var i=0; i < theScriptLength; i++) {
			loadFile(theScript[i].m);
		}
	} else {
		theScript = [];
	} */

	var hints = true;

	var myPlayerSource = $("#jquery_jplayer_source");
	var sourceMediaId = null;
	var sourcePopcorn = null;

	// making it clear that we have an editable content pane
	$('#target-content').focus();

	// Want to migrate all the target player Flags and controls into this object
	var targetPlayer = {
		paused: true,
		scriptIndex: 0, // ref to theScript[]
		start: 0,
		end: 0,
		player: [$("#jquery_jplayer_1"),$("#jquery_jplayer_2")],
		playerMediaId: [],
		currentMediaId: null,
		nextMediaId: null,
		lastPlayerPrimed: 1, // So the first instance used is #0, then second is #1
		popcorn: null, // The popcorn instance use by the player.

		seriously: new Seriously(),
		videoMap: {
			videoSource: null,
			canvasTarget: null,
			fader: null,
			effect: []
		},
		currentVideoId: "",
		fadeEnd: false, // Used to capture the fade at the end of a chunk. ie., True until the animation starts.
		fadeStart: false, // Used to fade at the start of a chunk.

		initVideoMap: function() {
			this.videoMap.fader = this.seriously.effect('fader');
			this.videoMap.fader.amount = 0; // Otherwise it defaults to complete fade of 1.
			// this.videoMap.fader.color = [255,0,0,1];

			this.videoMap.canvasTarget = this.seriously.target('#target-canvas');
			this.videoMap.canvasTarget.source = this.videoMap.fader;
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

			if (DEBUG_MP) console.log("fadeTo(): from=%f | videoMap.effect=%o", from, this.videoMap.effect);

			$({fade:from}).animate({fade:options.amount}, {
				duration: options.duration,
				step: function() {
					self.videoMap.fader.amount = this.fade;
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
			if(typeof color === 'string') {
				switch(color) {
					case 'red': rgba = [255,0,0,1]; break;
					case 'green': rgba = [0,255,0,1]; break;
					case 'blue': rgba = [0,0,255,1]; break;
					case 'yellow': rgba = [255,255,0,1]; break;
				}
			} else if(color && color.length === 4) {
				rgba = color;
			}
			this.videoMap.fader.color = rgba;
		},

		play: function(config) {


			console.log("==============");
			console.dir(theScript);
			console.log("==============");

			// Set play configuration
			if(config) {
				this.scriptIndex = config.scriptIndex;
				this.start = config.start; 
				this.end = config.end;  
			} else {
				config = {}; // So the config.jumpTo is happily undefined.
			}

			this.currentMediaId = theScript[this.scriptIndex].mediaId;
			this.nextMediaId = this.scriptIndex+1 < theScript.length ? theScript[this.scriptIndex+1].mediaId : null;

			this.paused = false;

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

			// Prepare a player for this media
			if(DEBUG_MP) console.log('play(): prepare current media');
			this.load(this.currentMediaId);

			if(DEBUG_MP) console.log('play(): this.popcorn='+this.popcorn);

			// The jumpTo does this for clicks, and the popcron instance check for play button.
			if(config.jumpTo || !this.popcorn) {
				killTargetPopcorn();
				setTargetHighlighting(this.scriptIndex);
			}

			var nextVideoId = "";

			if(this.playerMediaId[0] === this.currentMediaId) {
				if(DEBUG_MP) console.log('play(): already prepared for in player[0]');
				if(config.jumpTo || !this.popcorn) {
					initTargetPopcorn('#' + this.player[0].data("jPlayer").internal.video.id, this.scriptIndex, config.jumpTo);
				}
				this.player[1].hide().jPlayer("pause");
				this.player[0].show().jPlayer("play", config.jumpTo);
				nextVideoId = this.player[0].data("jPlayer").internal.video.id;
			} else if(this.playerMediaId[1] === this.currentMediaId) {
				if(DEBUG_MP) console.log('play(): already prepared for in player[1]');
				if(config.jumpTo || !this.popcorn) {
					initTargetPopcorn('#' + this.player[1].data("jPlayer").internal.video.id, this.scriptIndex, config.jumpTo);
				}
				this.player[0].hide().jPlayer("pause");
				this.player[1].show().jPlayer("play", config.jumpTo);
				nextVideoId = this.player[1].data("jPlayer").internal.video.id;
			} else {
				// we have a problem
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

			this.fadeEnd = theScript[this.scriptIndex].fade;
			this.fadeStart = false;
		},
		pause: function() {
			this.paused = true;
			// Then pause the player playing... or just pause both?
			$('#play-btn-target').show();
			$('#pause-btn-target').hide();

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
				} else {
					if(DEBUG_MP) console.log('cue(): prepare the current video');
					this.load(this.currentMediaId);
					this.player[(this.lastPlayerPrimed+1)%2].hide();
					this.player[this.lastPlayerPrimed].show().jPlayer("pause", currentJumpTo);
					nextVideoId = this.player[this.lastPlayerPrimed].data("jPlayer").internal.video.id;
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
/*
				if (this.currentVideoId !== nextVideoId) {
					this.connectVideo(nextVideoId);
				}
*/
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

			if(typeof id !== 'number') {
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

				this.player[nextPlayerUsed].jPlayer("setMedia", transcripts[id].media);
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

				if (this.playerMediaId[0] === this.currentMediaId) {
					now = this.player[0].data('jPlayer').status.currentTime * 1000;
				} else if (this.playerMediaId[1] === this.currentMediaId) {
					now = this.player[1].data('jPlayer').status.currentTime * 1000;
				} else {
					// We have a problem
				}

				//console.log("now="+now+" this.end="+this.end+"theScript.length="+theScript.length+" this.scriptIndex="+this.scriptIndex);

				if(DEBUG_MP) console.log("targetPlayer.manager(): this.end="+this.end);
				if(DEBUG_MP) console.log("targetPlayer.manager(): now="+now);

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
				// If the chunk playing has ended...
				if (now > this.end) {

					// BUG this bit of code is executed infintely after the piece has stopped playing

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

						$('#fader-content').css('background-color',fadeColor);

						if(DEBUG_MP) console.log("targetPlayer.playerMediaId[0] = "+this.playerMediaId[0]);
						if(DEBUG_MP) console.log("targetPlayer.playerMediaId[1] = "+this.playerMediaId[1]);

						// Compared with this.currentVideoId further down.
						var nextVideoId = "";

						if (this.playerMediaId[0] === this.currentMediaId) {
							nextVideoId = this.player[0].data("jPlayer").internal.video.id;
/*
							$('#fader-content').fadeTo(fadeSpeed, 1, function() {
								//console.log('ping');
								self.player[1].hide();
								self.player[0].show();
								$('#fader-content').fadeTo(fadeSpeed, 0);
							});
*/

							this.player[1].hide();
							this.player[0].show();

							if(DEBUG_MP) console.log("switch to 1");
							initTargetPopcorn('#' + this.player[0].data("jPlayer").internal.video.id, this.scriptIndex);
							this.player[1].jPlayer("pause");
							this.player[0].jPlayer("play",this.start/1000);
						} else if (this.playerMediaId[1] === this.currentMediaId) {
							nextVideoId = this.player[1].data("jPlayer").internal.video.id;
/*
							$('#fader-content').fadeTo(fadeSpeed, 1, function() {
								//console.log('pong');
								self.player[0].hide();
								self.player[1].show();
								$('#fader-content').fadeTo(fadeSpeed, 0);
							});
*/
							this.player[0].hide();
							this.player[1].show();

							if(DEBUG_MP) console.log("switch to 2");
							initTargetPopcorn('#' + this.player[1].data("jPlayer").internal.video.id, this.scriptIndex);
							this.player[0].jPlayer("pause");
							this.player[1].jPlayer("play",this.start/1000); 
						} else {
							// Would need to change the media... But it should already be ready.
						}

						if (effectArray.length) {
							this.createVideoMap(effectArray);
							this.connectVideo(nextVideoId);
						} else if (this.currentVideoId !== nextVideoId) {
							this.connectVideo(nextVideoId);
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
						this.cue();

						// Show the correct control button
						$('#play-btn-target').show();
						$('#pause-btn-target').hide();
					}
				}
			}
		}
	};

	targetPlayer.initVideoMap();

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

	targetPlayer.player[0].jPlayer({
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

	// Listen to contenteditable

	document.addEventListener("DOMCharacterDataModified", function(event) {
		if (DEBUG_MB) console.log($(event.target).parent()[0].tagName);
		if (DEBUG_MB) console.dir(event);
		if (DEBUG_MB) console.log($(event.target).parent().attr("m"));
		var index = $(event.target).parents('p').attr("i");
		var newText = event.newValue;
		if (DEBUG_MB) console.log(event.newValue);
		var commands = newText.substring(newText.indexOf('[')+1,newText.indexOf(']'));
		if (DEBUG_MB) console.log(commands);
		var commandList = commands.split(" ");
		console.dir(commandList);

		// read in any existing settings

		var time = theScript[index].time,
			color = theScript[index].color,
			fade = theScript[index].fade,
			effect = theScript[index].effect;

		console.log("cm length = "+commandList.length);

		var applyFlag = false;

		// We could use this list to load the appropriate JS files (also conceivably we could load on demand) -MB
		var effects = ['none','ascii','bleach-bypass','colorcube','emboss','invert','nightvision','noise','ripple','scanlines','sepia','sketch','tvglitch','vignette'];

		var effectIndex = 0;

		for (var i=0; i < commandList.length; i++) {

			if (DEBUG_MB) console.log("word "+i);

			if (applyFlag == true && $.inArray(commandList[i], effects) >= 0) {
				// action = 'apply';
				if(commandList[i] === 'none') {
					effect = [commandList[i]]; // none
				} else {
					effect[effectIndex] = commandList[i];
					effectIndex++;
				}
			}

			if (commandList[i] == 'apply') {
				applyFlag = true;
				effect = [];
			}

			if (DEBUG_MB) console.log(commandList[i]+ 'a number? = '+isNumber(commandList[i]) );

			// detecting fade
			if (commandList[i] == 'fade') {
				fade = true;
			}

			if (fade && isNumber(commandList[i])) {
				time = commandList[i];
			}

			if (fade && isColor(commandList[i])) {
				color = commandList[i];
			}
		}

		// if (DEBUG_MB) console.log(action);
		if (DEBUG_MB) console.log(time);
		if (DEBUG_MB) console.log(color);

		if ( newText.indexOf(']') > 0 ) {
			if (theScript.length == 0) { // direction has been given at the start
				if (DEBUG_MB) console.log('theScript length is zero');
				// create empty timespan to hold the effect
				var timespan = {};
				timespan.start = 0;
				timespan.end = 0;
				timespan.mediaId = 0;
				theScript.push(timespan);
				index = 0;
			}
			// theScript[index].action = action;
			theScript[index].fade = fade;
			theScript[index].time = time;
			theScript[index].color = color;
			theScript[index].effect = effect;
			theScript[index].commandText = commands;
		}

		//console.dir(commandList);
		if (DEBUG_MB) console.dir(theScript);
	});

	function isNumber(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
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
		if(sourcePopcorn) {
			if(DEBUG_MP) console.log('initSourcePopcorn('+id+'): Destroying sourcePopcorn');
			sourcePopcorn.destroy();
		}
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

		console.log('loadTranscriptSource('+id+')');

		// Set the title
		$('#script-title').text(transcripts[id].title); // Move to loadTranscriptSource()

		// Reset the play/pause button
		$('#play-btn-source').show();
		$('#pause-btn-source').hide();

		 // Stop the player
		myPlayerSource.jPlayer("pause");

		$('#load-status-source').html('loading ...');
		$('#transcript-content').load(transcripts[id].url, function() {
			//load success!!!

			// Scroll the transcript to the top
			$("#transcript-content").stop().scrollTo($("#transcript-content p:first"), 800, {axis:'y',margin:true,offset:{top:0}});

			// Setup popcorn and load in the media
			initSourcePopcorn('#' + myPlayerSource.data("jPlayer").internal.video.id);
			myPlayerSource.jPlayer("setMedia", transcripts[id].media);
			$('.fb-title').text(transcripts[id].title);

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
			$('#jp_container_source').delay(800).fadeTo("slow", 0.9);
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

	function copyOver(startSpan, endSpan, startTime, endTime, callback) {

		var nextSpan = startSpan; 
		// $('#target-content').append('<p s="'+startTime+'" e="'+endTime+'" f="'+targetPlayer.player[0].data('jPlayer').status.src+'">');
		var selectedStuff = $('<p i="'+theScript.length+'" start="'+startTime+'" end="'+endTime+'">'); 
		$('#target-content').append( selectedStuff ); 
		
		//console.log('selected....');
		
		
		while(nextSpan != endSpan) { 
			//console.log('nextspan');   
			//console.log(nextSpan);         
			// $(nextSpan).clone().appendTo('#target-content');
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


		//console.log(selectedStuff);


		$('#target-content').append('</p>');

		var timespan = {};
		timespan.start = startTime;
		timespan.end = nextSpanStartTime;  

		timespan.mediaId = sourceMediaId;


		//console.log("s="+startTime);
		//console.log("e="+endTime);
		//console.log("n="+nextSpanStartTime);

		//console.log(targetPlayer.player[0].data('jPlayer').status.src);
		//timespan.src = targetPlayer.player[0].data('jPlayer').status.src;

		callback(timespan);
	}



	$('#transcript-content').mouseup(function(e){ 

		//console.log('mouseup');

		var select = getSelText(); 
			var tweetable = select+"";  

		var startSpan = select.anchorNode.nextSibling; 
		if (startSpan == null) {
			startSpan = select.anchorNode.parentNode;
		}


		//var endSpan = select.focusNode.nextSibling;

		//console.log('select.focusnode');
		//console.dir(select.focusNode);

		var endSpan;

		// Check node sibling is a span (otherwise must be a para)
		// NB: Node is always text which is why we need to grab the sibling

		var endNode = select.focusNode.nextSibling;

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
			var endTime = parseInt(endSpan.getAttribute('m'));   

			/*console.log('startTime');
			console.log(startTime);
			console.log('--------');
			console.log('endTime');
			console.log(endTime); 
			console.log('--------');*/

			var tempSpan = endSpan;
			var tempTime = endTime;
			
			if (endTime < startTime) {
				endSpan = startSpan; 
				endTime = startTime;  
				startSpan = tempSpan;
				startTime = tempTime;
			}
			
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
				
				var timespan;
				copyOver(startSpan,endSpan,startTime,endTime, function(ts){
					timespan = ts;
				});

				theScript.push(timespan);

				/*--- end snip ----*/


				if(theScript.length === 1) {
					// Setup the target player for the start.
					targetPlayer.cue();
				}
				
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
		if (node.firstChild && !skipChildren) {
			return node.firstChild;
		}
		if (!node.parentNode){
			return null;
		}
		return node.nextElementSibling || getNextNode(node.parentNode, true, endNode); 

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

	$('#play-btn-target').click(function(){
		targetPlayer.play();
		$(this).hide();
		$('#pause-btn-target').show();
		return false;
	});

	$('#pause-btn-target').click(function(){
		targetPlayer.pause();
		$(this).hide();
		$('#play-btn-target').show();
		return false;
	});

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

	$('#jquery_jplayer_source').on("mouseenter",function(){
		$('#jp_container_source').trigger("mouseenter");
	}).on("mouseleave",function(){
		$('#jp_container_source').trigger("mouseleave");
	});

	$('#jp_container_source').on("mouseenter",function(){
		if (sourceLoaded == true) {
			$(this).stop(true,true).fadeTo("slow", 0.9);
		}
	}).on("mouseleave",function(){
		if (sourceLoaded == true) {
			$(this).stop(true,true).delay(800).fadeTo("slow", 0.5);
		}
	});

	// testing drag stuff

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