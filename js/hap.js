$(document).ready(function(){   

	var theScript = [];  
	var mediaDir = "http://happyworm.com/video";
	var transcriptDir = "transcripts";  
	var exposedTranscripts = [{'id':'internetindians','title':'Internet Amazonians'},{'id':'raidsinrainforest','title':'Rainforest Raids'}];

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
	var playSource = true;

	// we need two instances so that we can do transitions

	var myPlayer1 = $("#jquery_jplayer_1");
	var myPlayer2 = $("#jquery_jplayer_2");

	var player1MediaId = "";
	var player2MediaId = "";

	function checkState(event) {
	
		//var now = this.Popcorn.instances[0].media.currentTime*1000;   

		var now;

		//console.log(mediaId);

		if (player1MediaId == mediaId) {
			now = myPlayer1.data('jPlayer').status.currentTime * 1000;
		} else {
			now = myPlayer2.data('jPlayer').status.currentTime * 1000;
		}

		//console.log(now);
	
		var src = "";

		//console.log("now="+now+" end="+end+"theScript.length="+theScript.length+" index="+index);

		//console.log('end = '+end);
		//console.log('now = '+now);

		//console.log(playSource);
	
		if (now > end && playSource == false) {
			// BUG this bit of code is executed infintely after the piece has stopped playing



			//console.log('tick');

			//myPlayer1.jPlayer("pause");
			//myPlayer2.jPlayer("pause");
			index = parseInt(index);

			// check for the end



			if (theScript.length <= (index+1) && now > end) {
				//console.log(end);
				//console.log(now);
				//if (log2) console.log('end reached '+end+" now "+now);
				//log2 = false;
				myPlayer1.jPlayer("pause");
				myPlayer2.jPlayer("pause");
			}


			
			if (theScript.length > (index+1)) {

				var fadeSpeed = 100; //ms
				var fadeColor = "black";

				//console.log(index);

				if (theScript[index].action == 'fade') {
					console.log('action fade detected');

					if (theScript[index].color) {
						fadeColor = theScript[index].color;
					}

					if (theScript[index].time) {
						fadeSpeed = theScript[index].time*1000;
					}
				}

				console.log(fadeColor);
				console.log(fadeSpeed);

				// moving to the next block in the target

				index = index + 1;
				//if (log) console.log('index incremented now ='+index);
				//if (log) console.dir(theScript);
				start = theScript[index].s;
				end = theScript[index].e;
				mediaId = theScript[index].m;




				$('#fader-content').css('background-color',fadeColor);

				if (player1MediaId == mediaId) {
					$('#fader-content').fadeTo(fadeSpeed, 1, function() {
						//console.log('ping');
						$('#jquery_jplayer_2').hide();
						$('#jquery_jplayer_1').show();
						$('#fader-content').fadeTo(fadeSpeed, 0);
					});
					console.log("switch to 1");
					myPlayer2.jPlayer("pause");
					myPlayer1.jPlayer("play",start/1000);
				} else {
					$('#fader-content').fadeTo(fadeSpeed, 1, function() {
						//console.log('pong');
						$('#jquery_jplayer_1').hide();
						$('#jquery_jplayer_2').show();
						$('#fader-content').fadeTo(fadeSpeed, 0);
					});
					console.log("switch to 2");
					myPlayer1.jPlayer("pause");
					myPlayer2.jPlayer("play",start/1000); 
				}

				/*myPlayer1.bind($.jPlayer.event.progress + ".fixStart", function(event) {
					// Warning: The variable 'start' must not be changed before this handler is called.
					$(this).unbind(".fixStart"); 
					$(this).jPlayer("play",start/1000);
				});

				myPlayer1.jPlayer("pause",start);   */
			}
		}
	};

	function fitVideo(c) {
		c.find('video').css('width',c.css('width')).css('height',c.css('height'));
	}

	myPlayer1.jPlayer({
		ready: function (event) {

			if(event.jPlayer.html.used && event.jPlayer.html.video.available) {
				// sets size of video to that of container
				fitVideo($(this));
			}
		},
		timeupdate: function(event) {
			checkState(event);
		},
		solution: "html, flash",
		swfPath: "js",
		supplied: "m4v,webmv",
		preload: "auto"
	});

	myPlayer2.jPlayer({
		ready: function (event) {

			if(event.jPlayer.html.used && event.jPlayer.html.video.available) {
				// sets size of video to that of container
				fitVideo($(this));
			}
		},
		timeupdate: function(event) {
			checkState(event);
		},
		solution: "html, flash",
		swfPath: "js",
		supplied: "m4v,webmv",
		preload: "auto"
	});



	$('#transcript-files').empty();
	for (var j = 0; j < exposedTranscripts.length; j++) {
		$('#transcript-files').append('<li><a class="transcript-file" href="'+exposedTranscripts[j].id+'" >'+exposedTranscripts[j].title+'</a></li>');
	}



	// These events are fired as play time increments  

	var playingWord = 1;

	// transcript links to audio

	$('#transcript').delegate('span','click',function(e){ 

		playSource = true; 
		var jumpTo = $(this).attr('m')/1000; 
		//console.log('playing from '+jumpTo);

		if (currentlyLoaded == 1) {
			myPlayer1.jPlayer("play",jumpTo);
		} else {
			myPlayer2.jPlayer("play",jumpTo);
		}
		
		$('#play-btn-source').hide();
		$('#pause-btn-source').show();  

		/*e.stopPropagation();
		e.preventDefault(); 
		e.stopImmediatePropagation();*/
		//console.log('click');

		return false;
	});

	var index = "";
	var filename = "";
	var end = "";
	var start = "";
	var mediaId = "";


	$('#target-content').delegate('span','click',function(){

		playSource = false;

		var jumpTo = $(this).attr('m')/1000;

		index = $(this).parent().attr('i');

		mediaId = theScript[index].m;

		var mediaMp4 = mediaDir+"/"+mediaId+".mp4";
		var mediaWebM = mediaDir+'/'+mediaId+'.webm';

		//console.log(mediaId);
		//console.log(player1MediaId);
		//console.log("index="+index);
		//console.log("jumpTo="+jumpTo);

		console.log(mediaId);

		if (player1MediaId == mediaId) {

			//var file = transcriptDir+'/'+mediaId+'.htm'; 

			//if (currentlyLoaded != 1) {
			//	$('#transcript-content').load(file);
			//}

			$('#jquery_jplayer_2').hide();
			$('#jquery_jplayer_1').show();

			myPlayer2.jPlayer("pause");
			myPlayer1.jPlayer("play",jumpTo); 

		} else {

			//if (currentlyLoaded != 2) {
			//	$('#transcript-content').load(file);
			//}

			$('#jquery_jplayer_1').hide();
			$('#jquery_jplayer_2').show();

			myPlayer1.jPlayer("pause");
			myPlayer2.jPlayer("play",jumpTo);
		}
		
		filename = $(this).parent().attr('f');  
		end = $(this).parent().attr('e');  
		start = $(this).parent().attr('s'); 
		index = $(this).parent().attr('i'); 

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
			p.transcript({
				time: $(this).attr("m") / 1000, // seconds
				futureClass: "transcript-grey",
				target: this
			});
		});
	};


	$('.transcript-file').on('click',function(){ 
		var id = $(this).attr('href');

		//console.log(id);
		
		$('#script-title').text($(this).text());

		loadFile(id);

		return false;
	}); 


	function loadFile(id) { 
		var file = transcriptDir+'/'+id+'.htm'; 
		var mediaMp4 = mediaDir+'/'+id+'.mp4';
		var mediaWebM = mediaDir+'/'+id+'.webm';

		//$('.direct').html('loading ...');

		$('#load-status').html('loading ...');
		$('#transcript-content').load(file, function() {
			//load success!!!

			// load in the audio

			// check which player to load media into



			if (myPlayer1.data('jPlayer').status.src && currentlyLoaded < 2) {
				initPopcorn('#' + myPlayer2.data("jPlayer").internal.video.id);
				myPlayer2.jPlayer("setMedia", {
				m4v: mediaMp4,
					webmv: mediaWebM
			});
			$.data(myPlayer2,'mediaId',id);
				currentlyLoaded = 2;
				player2MediaId = id;
				$('#jquery_jplayer_1').hide();
				$('#jquery_jplayer_2').show();
			} else {
				initPopcorn('#' + myPlayer1.data("jPlayer").internal.video.id);
				myPlayer1.jPlayer("setMedia", {
					m4v: mediaMp4,
					webmv: mediaWebM
				});
				$.data(myPlayer1,'mediaId',id);
				currentlyLoaded = 1;
				player1MediaId = id;
				$('#jquery_jplayer_2').hide();
				$('#jquery_jplayer_1').show();
			}

			$('#load-status').html('');

			if (hints == true) {
				$('#transcript-content-hint').fadeIn('slow');
				$('#transcript-file-hint').fadeOut('slow');
			}

			$('#source-header-ctrl').fadeIn();
			
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
					nextSpanStartTime = Math.floor(myPlayer1.data('jPlayer').status.duration * 1000);
				}


				//console.log(selectedStuff);


				$('#target-content').append('</p>');   


				
				var timespan = {};
				timespan.s = startTime;
				timespan.e = nextSpanStartTime;  
				if (currentlyLoaded == 1) {
					timespan.m = $.data(myPlayer1,'mediaId');
				} else {
					timespan.m = $.data(myPlayer2,'mediaId');
				}
				

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

	$('#play-btn-source').click(function(){
		if (currentlyLoaded == 1) {
			myPlayer1.jPlayer("play");
		}

		if (currentlyLoaded == 2) {
			myPlayer2.jPlayer("play");
		}
		
		if (currentlyLoaded > 0) {
			$(this).hide();
			$('#pause-btn-source').show();
		}

		return false;
	});

	$('#pause-btn-source').click(function(){

		if (currentlyLoaded == 1) {
			myPlayer1.jPlayer("pause");
		}

		if (currentlyLoaded == 2) {
			myPlayer2.jPlayer("pause");
		}
		
		if (currentlyLoaded > 0) {
			$(this).hide();
			$('#play-btn-source').show();
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


	$('#show-video').click(function(){

		$('#transcript-content').css('top','350px');
		$(this).hide();
		$('#hide-video').show();

		return false;
	});

	$('#hide-video').click(function(){

		$('#transcript-content').css('top','78px');
		$(this).hide();
		$('#show-video').show();

		return false;
	});
});