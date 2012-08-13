// PLUGIN: Transcript

(function (Popcorn) {

  /**
   * Transcript popcorn plug-in 
   * Displays a transcript in the target div or DOM node.
   * Options parameter will need a time and a target.
   * Optional parameters are futureClass.
   * 
   * Time is the time that you want this plug-in to execute,
   * Target is the id of the document element that the content refers
   * to, or the DoM node itself. This target element must exist on the DOM
   * futureClass is the CSS class name to be used when the target has not been read yet.
   *
   * 
   * @param {Object} options
   * 
   * Example:
     var p = Popcorn('#video')
        .transcript({
          time:        5,                  // seconds, mandatory
          target:      'word-42',          // mandatory
          futureClass: 'transcript-hide'   // optional
        } )
        .transcript({
          time:        32,                                    // seconds, mandatory
          target:      document.getElementById( 'word-84' ),  // mandatory
          futureClass: 'transcript-grey'                      // optional
        } )
   *
   */

  Popcorn.plugin( "transcript" , {
    
      manifest: {
        about:{
          name: "Popcorn Transcript Plugin",
          version: "0.1",
          author:  "Mark Panaghiston",
          website: "http://www.jplayer.org/"
        },
        options:{
          time      : {elem:'input', type:'text', label:'In'},
          target  :  'Transcript-container',
          futureClass     : {elem:'input', type:'text', label:'Class'}
        }
      },

      _setup: function( options ) {

        // if a target is specified and is a string, use that - Requires every word <span> to have a unique ID.
        // else if target is specified and is an object, use object as DOM reference
        // else Throw an error.
        if ( options.target && typeof options.target === "string" && options.target !== 'Transcript-container' ) {
          options.container = document.getElementById( options.target );
        } else if ( options.target && typeof options.target === "object" ) {
          options.container = options.target;
        } else {
          throw "Popcorn.transcript: target property must be an ID string or a pointer to the DOM of the transcript word.";
        }

	options.start = 0;
	options.end = options.time;

        if(!options.futureClass) {
          options.futureClass = "transcript-future"
        }

        options.transcriptRead = function() {
          if( options.container.classList ) {
            options.container.classList.remove(options.futureClass);
          } else {
            options.container.className = "";
          }
        };

        options.transcriptFuture = function() {
          if( options.container.classList ) {
            options.container.classList.add(options.futureClass);
          } else {
            options.container.className = options.futureClass;
          }
        };

	// Note: end times close to zero can have issues. (Firefox 4.0 worked with 100ms. Chrome needed 200ms. iOS needed 500ms)
	if(options.end > options.start) {
		options.transcriptFuture();
	}

      },
      /**
       * @member transcript 
       * The start function will be executed when the currentTime 
       * of the video  reaches the start time provided by the 
       * options variable
       */
      start: function(event, options){
        options.transcriptFuture();
      },
      /**
       * @member transcript 
       * The end function will be executed when the currentTime 
       * of the video  reaches the end time provided by the 
       * options variable
       */

      end: function(event, options){
        options.transcriptRead();
      }
   
  } );

})( Popcorn );
