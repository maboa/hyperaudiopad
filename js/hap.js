$(document).ready(function(){   
		
	var theScript = [];  
	var audioDir = "../audio";
	var transcriptDir = "transcripts";  
	var latency = 1000;
        //console.log('start');                    
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
		
		
	var currentyLoaded = "";
	var hints = true;
	var playSource = true;
		

		
	var myPlayer = $("#jquery_jplayer_1");
	
	
	myPlayer.jPlayer({
 		ready: function (event) {
  
			if(event.jPlayer.html.used && event.jPlayer.html.audio.available) {
					//initPopcorn('#' + $(this).data("jPlayer").internal.audio.id);
			}
    }, 
  			
		solution: "html, flash",
    swfPath: "js",
    supplied: "mp3,oga",
		preload: "auto"
    //errorAlerts: "true",
		//warningAlerts: "true"
  });  


	var i = 0;



	if (theScriptState[i] != false) { 
		 	while (theScriptState[i] != undefined) {
				//loadFile(theScriptState[i].m); 
                
				// repeated code use loadFile with a callback 
				
				//console.log('snippet --------------- > '+i);

				var timespan = {};
				timespan.s = parseInt(theScriptState[i].s);
				timespan.e = parseInt(theScriptState[i].e);  
				timespan.m = theScriptState[i].m; 
				
				//var id = theScriptState[i].m;
        var file = transcriptDir+'/'+timespan.m+'.htm'; 
				var audioogg = audioDir+'/'+timespan.m+'.ogg';
				var audiomp3 = audioDir+'/'+timespan.m+'.mp3';
				
				//console.log('file = '+audioogg);       
				//console.log(myPlayer.data('jPlayer').status.src);
				//timespan.src = myPlayer.data('jPlayer').status.src; 
				 
				
				theScript.push(timespan);  
				
				//console.log(theScriptState[i].s);   


				
				$.ajax({
				  url: file,
				  async: false,
				  success: function(data) {  

						//load success!!!     
						initPopcorn('#' + myPlayer.data("jPlayer").internal.audio.id);      

						// load in the audio      

				  	myPlayer.jPlayer("setMedia", {
		        	mp3: audiomp3, 
							oga: audioogg  
		      	});

						$.data(myPlayer,'mediaId',timespan.m);

				  	$('#transcript-content').html(data); 

						//$('.scroll-panel').jScrollPane(); 
					
						// We need to paste the appropriate parts in the target pane here     
 
						var thisSpan = $('#transcript-content span[m="'+timespan.s+'"]');     
					      
						var endFound = false;
 
					
						var selectedStuff = $('<p i="'+i+'" s="'+timespan.s+'" e="'+timespan.e+'"  f="'+myPlayer.data('jPlayer').status.src+'">');
					 
						$('#target-content').append( selectedStuff ); 

						while (endFound == false) {

							$(thisSpan).clone().appendTo(selectedStuff);   
							thisSpan = thisSpan.next();    
							selectedStuff.append(' ');
							if (thisSpan.attr('m') == timespan.e) endFound = true; 
						} 

						$('#target-content').append('</p>');       

				  }
				});




				//while (theScript

				//$('#target-content').append();

				i++;
				//console.log('New snippet');      
			 } 
		   
		}  
		
		//console.log('EXITED');
   

		// These events are fired as play time increments  

		var playingWord = 1;    
		
		
		// transcript links to audio

		$('#transcript').delegate('span','click',function(e){ 
			playSource = true; 
			var jumpTo = $(this).attr('m')/1000; 
            //console.log('playing from '+jumpTo);
			myPlayer.jPlayer("play",jumpTo);  
			$('#play-btn-source').hide();
			$('#pause-btn-source').show();  

			/*e.stopPropagation();
			e.preventDefault(); 
    	e.stopImmediatePropagation();*/
			console.log('click');
		   
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

			if (currentlyPlaying != mediaId) {
				loadFile(mediaId);				
			}
				
			var audiomp3 = audioDir+"/"+mediaId+".mp3";
			var audioogg = audioDir+"/"+mediaId+".ogg";

			myPlayer.jPlayer("setMedia", {
	      mp3: audiomp3, 
			  oga: audioogg  
	    }); 
            
			myPlayer.jPlayer("play");
			myPlayer.jPlayer("pause");   
			
			setTimeout(function(){myPlayer.jPlayer("play",jumpTo); }, latency);           
			
		  filename = $(this).parent().attr('f');  
			end = $(this).parent().attr('e');  
			start = $(this).parent().attr('s'); 
			index = $(this).parent().attr('i'); 

			return false;
		});


 

		
		myPlayer.bind($.jPlayer.event.ended, function() {  
			// 
		}); 
		     
		
		/* hyperaudiopad stuff */

		/* load in the file */  

		function initPopcorn(id) {   
			var p = Popcorn(id)
			.code({
			   start: 0,
		       end: 2000,
		       onStart: function (options) {
		         //console.log('start')
		       },
		       onFrame: (function () {
		        var count = 0;
		        return function (options) {
					
            var now = this.Popcorn.instances[0].media.currentTime*1000;   
					
						var src = "";

						//console.log("now="+now+" end="+end+"theScript.length="+theScript.length+" index="+index);

					
						if (now > end && playSource == false) {   

          		myPlayer.jPlayer("pause");
							index = parseInt(index);

							// check for the end

							if (theScript.length <= (index+1) && now > end) {
								myPlayer.jPlayer("pause");
							} 
							
							if (theScript.length > (index+1)) {  

								// moving to the next block in the target

								index = index + 1;       

								start = theScript[index].s;   
								end = theScript[index].e;
						    mediaId = theScript[index].m;
							
								myPlayer.bind($.jPlayer.event.progress + ".fixStart", function(event) {
									// Warning: The variable 'start' must not be changed before this handler is called.
							    $(this).unbind(".fixStart"); 
									$(this).jPlayer("play",start/1000);
								});     

								loadFile(mediaId);
							
								var audiomp3 = audioDir+"/"+mediaId+".mp3";
								var audioogg = audioDir+"/"+mediaId+".ogg";
     
								myPlayer.jPlayer("setMedia", {
				         	mp3: audiomp3, 
									oga: audioogg  
				       	});   
				
								myPlayer.jPlayer("pause",start);   
							}    
						}   
		      }
		    })(),
		    onEnd: function (options) {
		         //console.log('end');
		    }
			});  

			$("#transcript-content span").each(function(i) {  
				p.transcript({
					time: $(this).attr("m") / 1000, // seconds
					futureClass: "transcript-grey",
					target: this
				});  
			});
		};


		$('.transcript-file').live('click',function(){ 
			var id = $(this).attr('href');  
			
			$('#script-title').text($(this).text());  
			
			loadFile(id); 

			return false;
		}); 
		
		function loadFile(id) { 
			var file = transcriptDir+'/'+id+'.htm'; 
			var audioogg = audioDir+'/'+id+'.ogg';
			var audiomp3 = audioDir+'/'+id+'.mp3';  
			
			//console.log('file = '+audioogg);
			 
			currentlyPlaying = id;

			//$('.direct').html('loading ...');
			   
      $('#load-status').html('loading ...');
			$('#transcript-content').load(file, function() {
			  	//load success!!!     
				initPopcorn('#' + myPlayer.data("jPlayer").internal.audio.id);   

				// load in the audio

			    myPlayer.jPlayer("setMedia", {
	         		mp3: audiomp3, 
					oga: audioogg  
	       		});   
	
				$.data(myPlayer,'mediaId',id);
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
					// $('#target-content').append('<p s="'+startTime+'" e="'+endTime+'" f="'+myPlayer.data('jPlayer').status.src+'">');
					var selectedStuff = $('<p i="'+theScript.length+'" s="'+startTime+'" e="'+endTime+'"  f="'+myPlayer.data('jPlayer').status.src+'">'); 
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

					//console.log(selectedStuff);


					$('#target-content').append('</p>');   

					
					var timespan = {};
					timespan.s = startTime;
					timespan.e = endTime;  
					timespan.m = $.data(myPlayer,'mediaId');  
					//console.log(myPlayer.data('jPlayer').status.src);
					//timespan.src = myPlayer.data('jPlayer').status.src;
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
		  if (endNode == node) {
		    return null;
		  }
		  if (node.firstChild && !skipChildren) {
		    return node.firstChild;
		  }
		  if (!node.parentNode){
		    return null;
		  }
		  return node.nextElementSibling 
		         || getNextNode(node.parentNode, true, endNode); 
		
		  //return node.nextSibling 
				         //|| getNextNode(node.parentNode, true, endNode);
		
		};  

		$('#play-btn-source').click(function(){
			myPlayer.jPlayer("play");
			$(this).hide();
			$('#pause-btn-source').show();
			return false;
		});

		$('#pause-btn-source').click(function(){
			myPlayer.jPlayer("pause");
			$(this).hide();
			$('#play-btn-source').show();
			return false;
		});

		$('#clear-btn').click(function(){   
			
			//$.bbq.removeState();
			theScript = [];
			$('#transcript-content').html('');
			$('#target-content').html('');

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
		
});    