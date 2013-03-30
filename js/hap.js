$(document).ready(function(){

	$.jPlayer.timeFormat.padMin = false;

	var log = true;

	var theScript = [];  
/*
	var mediaDir = "http://happyworm.com/video";
	var transcriptDir = "transcripts";  
	var exposedTranscripts = [{'id':'internetindians','title':'Internet Amazonians'},{'id':'raidsinrainforest','title':'Rainforest Raids'}];
*/
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

	var currentlyLoaded = 0;
	var hints = true;

	var myPlayerSource = $("#jquery_jplayer_source");

	// we need two instances so that we can do transitions

	var myPlayer1 = $("#jquery_jplayer_1");
	var myPlayer2 = $("#jquery_jplayer_2");

	// WIP: Want to migrate all the target player Flags and controls into this object
	var targetPlayer = {
		play: false,
		scriptIndex: 0, // ref to theScript[]
		start: 0,
		end: 0,
		currentMediaId: null,
		player1MediaId: null,
		player2MediaId: null
	};

	// These JSON object would be loaded in.

	// There would be different types of JSON:
	//  - Transcript Definition.
	//  - MIX Definition.
	//  - List of Transcripts/Mixes.

	var transcripts = [{
		title: "Internet Amazonians",
		url: "transcripts/internetindians.htm",
		media: {
			m4v: 'http://happyworm.com/video/internetindians.mp4',
			webmv: 'http://happyworm.com/video/internetindians.webm'
		}
	}, {
		title: "Rainforest Raids",
		url: "transcripts/raidsinrainforest.htm",
		media: {
			m4v: 'http://happyworm.com/video/raidsinrainforest.mp4',
			webmv: 'http://happyworm.com/video/raidsinrainforest.webm'
		}
	}];

	function checkState(event) {
	
		//var now = this.Popcorn.instances[0].media.currentTime*1000;   

		var now;

		//console.log(targetPlayer.currentMediaId);

		if (targetPlayer.player1MediaId == targetPlayer.currentMediaId) {
			now = myPlayer1.data('jPlayer').status.currentTime * 1000;
		} else {
			now = myPlayer2.data('jPlayer').status.currentTime * 1000;
		}

		//console.log(now);
	
		var src = "";

		//console.log("now="+now+" targetPlayer.end="+targetPlayer.end+"theScript.length="+theScript.length+" targetPlayer.scriptIndex="+targetPlayer.scriptIndex);

		//console.log('targetPlayer.end = '+targetPlayer.end);
		//console.log('now = '+now);

		//console.log(targetPlayer.play);
	
		if (now > targetPlayer.end && targetPlayer.play) {
			// BUG this bit of code is executed infintely after the piece has stopped playing



			//console.log('tick');

			//myPlayer1.jPlayer("pause");
			//myPlayer2.jPlayer("pause");
			targetPlayer.scriptIndex = parseInt(targetPlayer.scriptIndex);

			// check for the targetPlayer.end

			console.log("targetPlayer.end ="+targetPlayer.end);
			console.log("now = "+now);
			console.log("theScript.length = "+theScript.length);
			console.log("targetPlayer.scriptIndex = "+targetPlayer.scriptIndex);

			if (theScript.length <= (targetPlayer.scriptIndex+1) && now > targetPlayer.end) {
				console.log("Attempting to pause");
				//if (log2) console.log('targetPlayer.end reached '+targetPlayer.end+" now "+now);
				//log2 = false;
				if (!myPlayer1.data('jPlayer').status.paused) {
					myPlayer1.jPlayer("pause");
					console.log("paused player 1");
				}
				
				if (!myPlayer2.data('jPlayer').status.paused) {
					myPlayer2.jPlayer("pause");
					console.log("paused player 1");
				}
			}

			if (theScript.length > (targetPlayer.scriptIndex+1)) {

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

				targetPlayer.scriptIndex = targetPlayer.scriptIndex + 1;
				//if (log) console.log('targetPlayer.scriptIndex incremented now ='+targetPlayer.scriptIndex);
				if (log) console.dir(theScript);
				targetPlayer.start = theScript[targetPlayer.scriptIndex].s;
				targetPlayer.end = theScript[targetPlayer.scriptIndex].e;
				targetPlayer.currentMediaId = theScript[targetPlayer.scriptIndex].m;




				$('#fader-content').css('background-color',fadeColor);

				console.log("targetPlayer.player1MediaId = "+targetPlayer.player1MediaId);
				console.log("targetPlayer.player2MediaId = "+targetPlayer.player2MediaId);

				if (targetPlayer.player1MediaId === targetPlayer.currentMediaId) {
					$('#fader-content').fadeTo(fadeSpeed, 1, function() {
						//console.log('ping');
						$('#jquery_jplayer_2').hide();
						$('#jquery_jplayer_1').show();
						$('#fader-content').fadeTo(fadeSpeed, 0);
					});
					console.log("switch to 1");
					myPlayer2.jPlayer("pause");
					myPlayer1.jPlayer("play",targetPlayer.start/1000);
				} else if (targetPlayer.player2MediaId === targetPlayer.currentMediaId) {
					$('#fader-content').fadeTo(fadeSpeed, 1, function() {
						//console.log('pong');
						$('#jquery_jplayer_1').hide();
						$('#jquery_jplayer_2').show();
						$('#fader-content').fadeTo(fadeSpeed, 0);
					});
					console.log("switch to 2");
					console.log(targetPlayer.start);
					myPlayer1.jPlayer("pause");
					myPlayer2.jPlayer("play",targetPlayer.start/1000); 
				} else {
					// Would need to change the media
				}

				/*myPlayer1.bind($.jPlayer.event.progress + ".fixStart", function(event) {
					// Warning: The variable 'targetPlayer.start' must not be changed before this handler is called.
					$(this).unbind(".fixStart"); 
					$(this).jPlayer("play",targetPlayer.start/1000);
				});

				myPlayer1.jPlayer("pause",targetPlayer.start);   */
			}
		}
	};

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
		supplied: "webmv,m4v",
		preload: "auto"
	});

	myPlayer1.jPlayer({
		ready: function (event) {

			if(event.jPlayer.html.used && event.jPlayer.html.video.available) {
				// sets size of video to that of container
				// fitVideo($(this));
			}
		},
		timeupdate: function(event) {
			checkState(event);
		},
		solution: "html, flash",
		swfPath: "js",
		supplied: "webmv,m4v",
		preload: "auto"
	});

	myPlayer2.jPlayer({
		ready: function (event) {

			if(event.jPlayer.html.used && event.jPlayer.html.video.available) {
				// sets size of video to that of container
				// fitVideo($(this));
			}
		},
		timeupdate: function(event) {
			checkState(event);
		},
		solution: "html, flash",
		swfPath: "js",
		supplied: "webmv,m4v",
		preload: "auto"
	});

	// These events are fired as play time increments  

	var playingWord = 1;

	// transcript links to audio

	$('#transcript-content').delegate('span','click',function(e){ 

		targetPlayer.play = false; 
		var jumpTo = $(this).attr('m')/1000; 
		//console.log('playing from '+jumpTo);

/*
		if (currentlyLoaded == 1) {
			myPlayer1.jPlayer("play",jumpTo);
		} else {
			myPlayer2.jPlayer("play",jumpTo);
		}
*/
		myPlayerSource.jPlayer("play",jumpTo);

		$('#play-btn-source').hide();
		$('#pause-btn-source').show();  

		/*e.stopPropagation();
		e.preventDefault(); 
		e.stopImmediatePropagation();*/
		//console.log('click');

		return false;
	});

	var filename = "";


	$('#target-content').delegate('span','click',function(){

		targetPlayer.play = true;

		var jumpTo = $(this).attr('m')/1000;

		targetPlayer.scriptIndex = $(this).parent().attr('i');

		filename = $(this).parent().attr('f');  
		targetPlayer.start = $(this).parent().attr('s'); 
		targetPlayer.end = $(this).parent().attr('e');  

		targetPlayer.currentMediaId = theScript[targetPlayer.scriptIndex].m;

		console.log("-----------");
		console.log(targetPlayer.currentMediaId);
		console.log(targetPlayer.player1MediaId);
		console.log("targetPlayer.scriptIndex="+targetPlayer.scriptIndex);
		console.log("jumpTo="+jumpTo);


		if(targetPlayer.player1MediaId == targetPlayer.currentMediaId) {

			$('#jquery_jplayer_2').hide();
			$('#jquery_jplayer_1').show();

			myPlayer2.jPlayer("pause");
			myPlayer1.jPlayer("play",jumpTo); 

		} else if(targetPlayer.player2MediaId == targetPlayer.currentMediaId) {

			$('#jquery_jplayer_1').hide();
			$('#jquery_jplayer_2').show();

			myPlayer1.jPlayer("pause");
			myPlayer2.jPlayer("play",jumpTo);
		} else {
			// Can we fix it? - Yes we can!
			loadTranscriptTarget(targetPlayer.currentMediaId);
		}
		
		return false;
	});

	// Listen to contenteditable

	document.addEventListener("DOMCharacterDataModified", function(event) {
		console.log($(event.target).parent()[0].tagName);
		console.dir(event);
		console.log($(event.target).parent().attr("m"));
		var index = $(event.target).parents('p').attr("i");
		var newText = event.newValue;
		console.log(event.newValue);
		var commands = newText.substring(newText.indexOf('[')+1,newText.indexOf(']'));
		console.log(commands);
		var commandList = commands.split(" ");
		console.dir(commandList);


		var action,time,color;

		console.log("cm length = "+commandList.length);

		for (var i=0; i < commandList.length; i++) {

			console.log("word "+i);

			// detecting fade
			if (commandList[i] == 'fade') {
				action = commandList[i];
			}

			console.log(commandList[i]+ 'a number? = '+isNumber(commandList[i]) );

			if (isNumber(commandList[i])) {
				time = commandList[i];
			}

			if (isColor(commandList[i])) {
				color = commandList[i];
			}
		}

		console.log(action);
		console.log(time);
		console.log(color);

		if ( newText.indexOf(']') > 0 ) {
			theScript[index].action = action;
			theScript[index].time = time;
			theScript[index].color = color;
		}

		//console.dir(commandList);
		console.dir(theScript);
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

	myPlayer1.bind($.jPlayer.event.ended, function() {

	}); 

	/* hyperaudiopad stuff */

	/* load in the file */


	function initPopcorn(id) {
		var p = Popcorn(id);
		$("#transcript-content span").each(function(i) {  
/*
			p.transcript({
				time: $(this).attr("m") / 1000, // seconds
				futureClass: "transcript-grey",
				target: this
			});
*/
			p.transcript({
				time: $(this).attr("m") / 1000, // seconds
				futureClass: "transcript-grey",
				target: this,
				onNewPara: function(parent) {
					$("#transcript-content").stop().scrollTo($(parent), 800, {axis:'y',margin:true,offset:{top:0}});
				}
			});
		});
	};


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
			initPopcorn('#' + myPlayerSource.data("jPlayer").internal.video.id);
			myPlayerSource.jPlayer("setMedia", transcripts[id].media);

			// Store reference to the transcript
			$.data(myPlayerSource,'mediaId',id);

			// Correct the initial video display without a poster.
			fitVideo(myPlayerSource);

			$('#load-status-source').html('');

			if (hints == true) {
				$('#transcript-content-hint').fadeIn('slow');
				$('#transcript-file-hint').fadeOut('slow');
			}

			$('#source-header-ctrl').fadeIn();
			$('#jp_container_source').delay(800).fadeTo("slow", 0.9);
		});
	}

	// loadTranscriptTarget(id)

	function loadTranscriptTarget(id) { 

		// The id is the index reference to the transcripts array.

		console.log('loadTranscriptTarget('+id+')');
/*
		var file = transcriptDir+'/'+id+'.htm'; 
		var mediaMp4 = mediaDir+'/'+id+'.mp4';
		var mediaWebM = mediaDir+'/'+id+'.webm';
*/
		//$('.direct').html('loading ...');

		// Reset the play/pause button
		$('#play-btn-target').show();
		$('#pause-btn-target').hide();

		 // Stop the players
		myPlayer1.jPlayer("pause");
		myPlayer2.jPlayer("pause");

		$('#load-status-target').html('loading ...');

		// load in the audio
		// check which player to load media into

		if (myPlayer1.data('jPlayer').status.src && currentlyLoaded < 2) {
			// initPopcorn('#' + myPlayer2.data("jPlayer").internal.video.id);
			myPlayer2.jPlayer("setMedia", transcripts[id].media);
			// $.data(myPlayer2,'mediaId',id);
			currentlyLoaded = 2;
			targetPlayer.player2MediaId = id;
			$('#jquery_jplayer_1').hide();
			$('#jquery_jplayer_2').show();
			fitVideo(myPlayer2);
		} else {
			// initPopcorn('#' + myPlayer1.data("jPlayer").internal.video.id);
			myPlayer1.jPlayer("setMedia", transcripts[id].media);
			// $.data(myPlayer1,'mediaId',id);
			currentlyLoaded = 1;
			targetPlayer.player1MediaId = id;
			$('#jquery_jplayer_2').hide();
			$('#jquery_jplayer_1').show();
			fitVideo(myPlayer1);
		}

		$('#load-status-target').html('');

		if (hints == true) {
			$('#transcript-content-hint').fadeIn('slow');
			$('#transcript-file-hint').fadeOut('slow');
		}

		$('#target-header-ctrl').fadeIn();
		
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
				// $('#target-content').append('<p s="'+startTime+'" e="'+endTime+'" f="'+myPlayer1.data('jPlayer').status.src+'">');
				var selectedStuff = $('<p i="'+theScript.length+'" s="'+startTime+'" e="'+endTime+'"  f="'+myPlayer1.data('jPlayer').status.src+'">'); 
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
				timespan.s = startTime;
				timespan.e = nextSpanStartTime;  

				timespan.m = $.data(myPlayerSource,'mediaId');

				// This next line in here is a hack to just make it work for the time being.
				loadTranscriptTarget(timespan.m);


				//console.log("s="+startTime);
				//console.log("e="+endTime);
				//console.log("n="+nextSpanStartTime);

				//console.log(myPlayer1.data('jPlayer').status.src);
				//timespan.src = myPlayer1.data('jPlayer').status.src;
				theScript.push(timespan);
				
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
		if (currentlyLoaded == 1) {
			myPlayer1.jPlayer("play");
		}

		if (currentlyLoaded == 2) {
			myPlayer2.jPlayer("play");
		}
		
		if (currentlyLoaded > 0) {
			$(this).hide();
			$('#pause-btn-target').show();
		}

		return false;
	});

	$('#pause-btn-target').click(function(){

		if (currentlyLoaded == 1) {
			myPlayer1.jPlayer("pause");
		}

		if (currentlyLoaded == 2) {
			myPlayer2.jPlayer("pause");
		}
		
		if (currentlyLoaded > 0) {
			$(this).hide();
			$('#play-btn-target').show();
		}

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
		$(this).stop(true,true).fadeTo("slow", 0.9);
	}).on("mouseleave",function(){
		$(this).stop(true,true).delay(800).fadeTo("slow", 0.5);
	});
});