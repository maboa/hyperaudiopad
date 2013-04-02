$(document).ready(function(){

	var seriously = new Seriously(); // instance seriously lib for global use

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

			$('#play-btn-target').hide();
			$('#pause-btn-target').show();

			// Prepare a player for this media
			if(DEBUG_MP) console.log('play(): prepare current media');
			this.load(this.currentMediaId, this.scriptIndex);

			var currentVideoId = "";

			if(this.playerMediaId[0] === this.currentMediaId) {
				if(DEBUG_MP) console.log('play(): already prepared for in player[0]');
				initTargetPopcorn('#' + this.player[0].data("jPlayer").internal.video.id, this.scriptIndex);
				this.player[1].hide().jPlayer("pause");
				this.player[0].show().jPlayer("play", config.jumpTo);
				currentVideoId = "jp_video_1";
			} else if(this.playerMediaId[1] === this.currentMediaId) {
				if(DEBUG_MP) console.log('play(): already prepared for in player[1]');
				initTargetPopcorn('#' + this.player[1].data("jPlayer").internal.video.id, this.scriptIndex);
				this.player[0].hide().jPlayer("pause");
				this.player[1].show().jPlayer("play", config.jumpTo);
				currentVideoId = "jp_video_2";
			} else {
				// we have a problem
			}

			// Prepare the other player for the next media
			if(DEBUG_MP) console.log('play(): prepare next media');
			this.load(this.nextMediaId, this.scriptIndex+1);


			// Experimenting with Canvas Effects and Seriously.js
			// not the best place to put it

			if(DEBUG_MP) console.log("seriously ...");


			var sourceVid = seriously.source('#'+currentVideoId);
			var target = seriously.target('#target-canvas');

			target.source = sourceVid;

			seriously.go();
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

			var currentJumpTo, nextJumpTo;

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
				} else if(this.playerMediaId[1] === this.currentMediaId) {
					if(DEBUG_MP) console.log('cue(): already prepared for in player[1]');
					this.player[0].hide();
					this.player[1].show().jPlayer("pause", currentJumpTo);
				} else {
					if(DEBUG_MP) console.log('cue(): prepare the current video');
					this.load(this.currentMediaId, this.scriptIndex);
					this.player[(this.lastPlayerPrimed+1)%2].hide();
					this.player[this.lastPlayerPrimed].show().jPlayer("pause", currentJumpTo);
				}
			}

			if(this.currentMediaId !== this.nextMediaId) {
				// Prepare the other player for the next media
				if(DEBUG_MP) console.log('cue(): prepare next video');
				if(this.load(this.nextMediaId, this.scriptIndex+1)) {
					this.player[this.lastPlayerPrimed].jPlayer("pause", nextJumpTo);
				}
			}
		},
		load: function(id, index) { 

			// The id is the index reference to the transcripts array.

			if(DEBUG_MP) console.log('loadTranscriptTarget('+id+', '+index+')');

			if(typeof id !== 'number') {
				if(DEBUG_MP) console.log('Ignoring: id='+id);
				return false;
			}

			// Reset the play/pause button
			// $('#play-btn-target').show();
			// $('#pause-btn-target').hide();

			// Stop the players
			// this.player[0].jPlayer("pause");
			// this.player[1].jPlayer("pause");

			// $('#load-status-target').html('loading ...');

			// load in the audio
			// check which player to load media into


			// Check whether a player already setup to play this media.
			if(this.playerMediaId[0] === id) {
				this.lastPlayerPrimed = 0;
			} else if(this.playerMediaId[1] === id) {
				this.lastPlayerPrimed = 1;
			} else {

				var nextPlayerUsed = (this.lastPlayerPrimed + 1) % 2;
				if(DEBUG_MP) console.log('[before] targetPlayer.lastPlayerPrimed='+this.lastPlayerPrimed+' | nextPlayerUsed='+nextPlayerUsed);

				this.player[nextPlayerUsed].jPlayer("setMedia", transcripts[id].media);
				this.playerMediaId[nextPlayerUsed] = id;
				// this.player[this.lastPlayerPrimed].hide();
				// this.player[nextPlayerUsed].show();
				fitVideo(this.player[nextPlayerUsed]);

				this.lastPlayerPrimed = nextPlayerUsed;

				if(DEBUG_MP) console.log('[after] targetPlayer.lastPlayerPrimed='+this.lastPlayerPrimed+' | nextPlayerUsed='+nextPlayerUsed);
			}

			// initTargetPopcorn('#' + this.player[this.lastPlayerPrimed].data("jPlayer").internal.video.id, index);

			$('#target-header-ctrl').fadeIn();
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

					var effectIndex = 0;
					var effectArray = [];

					if (this.scriptIndex+1 < theScript.length) {

						var fadeSpeed = 100; //ms
						var fadeColor = "black";

						//console.log(this.scriptIndex);

						if (theScript[this.scriptIndex].action == 'fade') {
							if(DEBUG_MP) console.log('action fade detected');

							if (theScript[this.scriptIndex].color) {
								fadeColor = theScript[this.scriptIndex].color;
							}

							if (theScript[this.scriptIndex].time) {
								fadeSpeed = theScript[this.scriptIndex].time*1000;
							}
						}

						if (theScript[this.scriptIndex].action == 'apply') {
							if(DEBUG_MP) console.log('action apply detected');

							effectArray = theScript[this.scriptIndex].effect;
						}

						if(DEBUG_MP) console.log("fadeColor="+fadeColor);
						if(DEBUG_MP) console.log("fadeSpeed="+fadeSpeed);
						// if(DEBUG_MP) console.log("effect="+effect);

						// moving to the next block in the target
						this.scriptIndex++;
						if (DEBUG_MP) console.dir(theScript);

						// This bit to...
/*
						this.start = theScript[this.scriptIndex].start;
						this.end = theScript[this.scriptIndex].end;

						this.currentMediaId = theScript[this.scriptIndex].mediaId;
						this.nextMediaId = this.scriptIndex+1 < theScript.length ? theScript[this.scriptIndex+1].mediaId : null;

						// Prepare the other player for the next media
						this.load(this.nextMediaId);
*/
						// ...To this bit.

						// Prepare the other player for the next media
						// Also updates this.start, this.end, this.currentMediaId and this.nextMediaId
						this.cue();

						$('#fader-content').css('background-color',fadeColor);

						if(DEBUG_MP) console.log("targetPlayer.playerMediaId[0] = "+this.playerMediaId[0]);
						if(DEBUG_MP) console.log("targetPlayer.playerMediaId[1] = "+this.playerMediaId[1]);

						var nextVideoId = "";

						if (this.playerMediaId[0] === this.currentMediaId) {
							nextVideoId = "jp_video_1";
							$('#fader-content').fadeTo(fadeSpeed, 1, function() {
								//console.log('ping');
								self.player[1].hide();
								self.player[0].show();
								$('#fader-content').fadeTo(fadeSpeed, 0);
							});
							if(DEBUG_MP) console.log("switch to 1");
							initTargetPopcorn('#' + this.player[0].data("jPlayer").internal.video.id, this.scriptIndex);
							this.player[1].jPlayer("pause");
							this.player[0].jPlayer("play",this.start/1000);
						} else if (this.playerMediaId[1] === this.currentMediaId) {
							nextVideoId = "jp_video_2";
							$('#fader-content').fadeTo(fadeSpeed, 1, function() {
								//console.log('pong');
								self.player[0].hide();
								self.player[1].show();
								$('#fader-content').fadeTo(fadeSpeed, 0);
							});
							if(DEBUG_MP) console.log("switch to 2");
							initTargetPopcorn('#' + this.player[1].data("jPlayer").internal.video.id, this.scriptIndex);
							this.player[0].jPlayer("pause");
							this.player[1].jPlayer("play",this.start/1000); 
						} else {
							// Would need to change the media... But it should already be ready.
						}

						if (effectArray.length > 0) {

							//seriously = null;
							seriously = new Seriously();

							var sourceVid = seriously.source("#"+nextVideoId);
							var target = seriously.target('#target-canvas');
							var seriouslyEffect = [];

							// add all the effects

							for (var i=0; i < effectArray.length; i++) {
								seriouslyEffect[i] = seriously.effect(effectArray[i]);
								if (i > 0) {
									seriouslyEffect[i].source = seriouslyEffect[i-1];
									if (DEBUG_MB) console.log("connecting up");
								} else {
									seriouslyEffect[0].source = sourceVid;
								}
							}

							//console.log("EFFECT IS "+effectArray[0]);

							// connect all our nodes in the right order
							// seriouslyEffect[0].source = sourceVid;
							target.source = seriouslyEffect[effectArray.length-1];

							seriously.go();
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

						// Cue up the players ready for if the play button is pressed.
						this.cue();

						// Show the correct control button
						$('#play-btn-target').show();
						$('#pause-btn-target').hide();

						// Should not need the others set since we play though .play() method

						// this.currentMediaId = theScript[this.scriptIndex].mediaId;
						// this.nextMediaId = this.scriptIndex+1 < theScript.length ? theScript[this.scriptIndex+1].mediaId : null;
					}
				}
			}
		}
	};

/*
	// WIP: Move checkState to targetPlayer.manager() method
	function checkState(event) {
	
		var now;

		if (!targetPlayer.paused) {

			if (targetPlayer.playerMediaId[0] === targetPlayer.currentMediaId) {
				now = targetPlayer.player[0].data('jPlayer').status.currentTime * 1000;
			} else {
				now = targetPlayer.player[1].data('jPlayer').status.currentTime * 1000;
			}

			//console.log("now="+now+" targetPlayer.end="+targetPlayer.end+"theScript.length="+theScript.length+" targetPlayer.scriptIndex="+targetPlayer.scriptIndex);

			console.log("targetPlayer.end ="+targetPlayer.end);
			console.log("now = "+now);

			// If the chunk playing has ended...
			if (now > targetPlayer.end) {

				// BUG this bit of code is executed infintely after the piece has stopped playing


				// This should be a number already after refactor...
				// Now done where this initially set.
				// targetPlayer.scriptIndex = parseInt(targetPlayer.scriptIndex);

				// check for the targetPlayer.end

				console.log("theScript.length = "+theScript.length);
				console.log("targetPlayer.scriptIndex = "+targetPlayer.scriptIndex);

				// Pause the player playing
				if (theScript.length <= targetPlayer.scriptIndex+1) {
					console.log("Attempting to pause");
					if (!targetPlayer.player[0].data('jPlayer').status.paused) {
						targetPlayer.player[0].jPlayer("pause");
						console.log("paused player 1");
					}
					
					if (!targetPlayer.player[1].data('jPlayer').status.paused) {
						targetPlayer.player[1].jPlayer("pause");
						console.log("paused player 1");
					}
				}

				if (targetPlayer.scriptIndex+1 < theScript.length) {

					var fadeSpeed = 100; //ms
					var fadeColor = "black";

					//console.log(targetPlayer.scriptIndex);

					if (theScript[targetPlayer.scriptIndex].action == 'fade') {
						console.log('action fade detected');

						if (theScript[targetPlayer.scriptIndex].color) {
							fadeColor = theScript[targetPlayer.scriptIndex].color;
						}

						if (theScript[targetPlayer.scriptIndex].time) {
							fadeSpeed = theScript[targetPlayer.scriptIndex].time*1000;
						}
					}

					console.log(fadeColor);
					console.log(fadeSpeed);

					// moving to the next block in the target
					targetPlayer.scriptIndex++;
					if (DEBUG_MP) console.dir(theScript);
					targetPlayer.start = theScript[targetPlayer.scriptIndex].start;
					targetPlayer.end = theScript[targetPlayer.scriptIndex].end;
					targetPlayer.currentMediaId = theScript[targetPlayer.scriptIndex].mediaId;

					$('#fader-content').css('background-color',fadeColor);

					console.log("targetPlayer.playerMediaId[0] = "+targetPlayer.playerMediaId[0]);
					console.log("targetPlayer.playerMediaId[1] = "+targetPlayer.playerMediaId[1]);

					if (targetPlayer.playerMediaId[0] === targetPlayer.currentMediaId) {
						$('#fader-content').fadeTo(fadeSpeed, 1, function() {
							//console.log('ping');
							$('#jquery_jplayer_2').hide();
							$('#jquery_jplayer_1').show();
							$('#fader-content').fadeTo(fadeSpeed, 0);
						});
						console.log("switch to 1");
						targetPlayer.player[1].jPlayer("pause");
						targetPlayer.player[0].jPlayer("play",targetPlayer.start/1000);
					} else if (targetPlayer.playerMediaId[1] === targetPlayer.currentMediaId) {
						$('#fader-content').fadeTo(fadeSpeed, 1, function() {
							//console.log('pong');
							$('#jquery_jplayer_1').hide();
							$('#jquery_jplayer_2').show();
							$('#fader-content').fadeTo(fadeSpeed, 0);
						});
						console.log("switch to 2");
						console.log(targetPlayer.start);
						targetPlayer.player[0].jPlayer("pause");
						targetPlayer.player[1].jPlayer("play",targetPlayer.start/1000); 
					} else {
						// Would need to change the media
					}

					// targetPlayer.player[0].bind($.jPlayer.event.progress + ".fixStart", function(event) {
						// Warning: The variable 'targetPlayer.start' must not be changed before this handler is called.
						// $(this).unbind(".fixStart");
						// $(this).jPlayer("play",targetPlayer.start/1000);
					// });

					// targetPlayer.player[0].jPlayer("pause",targetPlayer.start);
				}
			}
		}
	};
*/
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
			// checkState(event);
			targetPlayer.manager(event);
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
			// checkState(event);
			targetPlayer.manager(event);
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

/*
		playConfig
		var jumpTo = $(this).attr('m')/1000;
		targetPlayer.scriptIndex = parseInt($(this).parent().attr('i'), 10);
		targetPlayer.start = parseInt($(this).parent().attr('start'), 10); 
		targetPlayer.end = parseInt($(this).parent().attr('end'),  10);  

		targetPlayer.currentMediaId = theScript[targetPlayer.scriptIndex].mediaId;

		console.log("------Clicked On A Target Word------");
		console.log("targetPlayer.currentMediaId="+targetPlayer.currentMediaId);
		console.log("targetPlayer.playerMediaId[0]="+targetPlayer.playerMediaId[0]);
		console.log("targetPlayer.playerMediaId[1]="+targetPlayer.playerMediaId[1]);
		console.log("targetPlayer.scriptIndex="+targetPlayer.scriptIndex);
		console.log("targetPlayer.start="+targetPlayer.start);
		console.log("targetPlayer.end="+targetPlayer.end);
		console.log("jumpTo="+jumpTo);
*/
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


		var action,time,color,effect;

		console.log("cm length = "+commandList.length);

		var applyFlag = false;

		// We could use this list to load the appropriate JS files (also conceivably we could load on demand) -MB
		var effects = ['ascii','bleach-bypass','invert','nightvision','noise','ripple','scanlines','sepia','sketch','tvglitch','vignette'];

		var effectIndex = 0;
		var effect = [];

		for (var i=0; i < commandList.length; i++) {

			if (DEBUG_MB) console.log("word "+i);

			// detecting fade
			if (commandList[i] == 'fade') {
				action = commandList[i];
			}

			if (applyFlag == true && $.inArray(commandList[i], effects) >= 0) {
				action = 'apply';
				effect[effectIndex] = commandList[i];
				effectIndex++;
			}

			if (commandList[i] == 'apply') {
				applyFlag = true;
			}

			if (DEBUG_MB) console.log(commandList[i]+ 'a number? = '+isNumber(commandList[i]) );

			if (isNumber(commandList[i])) {
				time = commandList[i];
			}

			if (isColor(commandList[i])) {
				color = commandList[i];
			}
		}

		if (DEBUG_MB) console.log(action);
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
			theScript[index].action = action;
			theScript[index].time = time;
			theScript[index].color = color;
			theScript[index].effect = effect;
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

	function initTargetPopcorn(id, index) {
		if(targetPlayer.popcorn) {
			if(DEBUG_MP) console.log('initTargetPopcorn('+id+', '+index+'): Destroying targetPlayer.popcorn');
			targetPlayer.popcorn.destroy();
		}
		if(DEBUG_MP) console.log('initTargetPopcorn('+id+', '+index+'): Creating targetPlayer.popcorn');
		targetPlayer.popcorn = Popcorn(id);
		$("#target-content p[i='" + index + "'] span").each(function(i) {  
			targetPlayer.popcorn.transcript({
				time: $(this).attr("m") / 1000, // seconds
				futureClass: "transcript-grey",
				target: this,
				onNewPara: function(parent) {
					$("#target-content").stop().scrollTo($(parent), 800, {axis:'y',margin:true,offset:{top:0}});
				}
			});
		});
	}

	var $transFiles = $('#transcript-files').empty();
	$.each(transcripts, function(i) {
		var $transBtn = $('<a class="transcript-file">' + this.title + '</a>').click(function(e) {
			e.preventDefault();
			loadTranscriptSource(i);
		});
		$transFiles.append($('<li></li>').append($transBtn));
	});
/*
	$('#transcript-files').empty();
	for (var j = 0; j < exposedTranscripts.length; j++) {
		$('#transcript-files').append('<li><a class="transcript-file" href="'+exposedTranscripts[j].id+'" >'+exposedTranscripts[j].title+'</a></li>');
	}

	$('.transcript-file').on('click',function(){ 
		var id = $(this).attr('href');

		//console.log(id);
		
		$('#script-title').text($(this).text());

		loadTranscriptSource(id);

		return false;
	}); 
*/

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

				// This next line in here is a hack to just make it work for the time being.
				// targetPlayer.load(timespan.mediaId);

				//console.log("s="+startTime);
				//console.log("e="+endTime);
				//console.log("n="+nextSpanStartTime);

				//console.log(targetPlayer.player[0].data('jPlayer').status.src);
				//timespan.src = targetPlayer.player[0].data('jPlayer').status.src;
				theScript.push(timespan);

				if(theScript.length === 1) {
					// Setup the target player for the start.
					targetPlayer.cue();
				}
				
				//$.bbq.pushState(theScript);
				//console.dir(theScript);

				//alert('here');

				//$('#target-content span').addClass('transcript-grey');

				$('#target-header-ctrl').fadeIn();

				//e.preventDefault(); 
				//e.stopImmediatePropagation();
				return false; 
			}
		}


		$('#transcript-content-hint').fadeOut();
		hints = false;
		
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

	$('#clear-btn').click(function(){

		//$.bbq.removeState();
		theScript = [];
		$('#transcript-content').html('');
		$('#target-content').html('');

		Popcorn.destroy(p);

		return false;
	});


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