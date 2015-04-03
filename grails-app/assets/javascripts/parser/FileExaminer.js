/**
 * Created by zacharymartin on 3/25/15.
 */

/**
 * An object for converting delimiter separated value files into a 2D array of values
 */
function FileExaminer(){
    this.LINE_TERMINATOR = /\n+/;
    this.CELL_TERMINATORS = {
        "comma" : /\s*,\s*/,
        "semicolon" : /\s*;\s*/,
        "tab": "\t"
    };

    var _self = this;
    this.file = null;
    this.fileContents = null;
    this.delimiter = null;
    this.reader = new FileReader();
    this.colsSize = -1;
    this.rowsSize = -1;
    this.matrix = null;
    this.loadObservers = [];

    /**
     * This public public starts the file examining process for a given file content
     * string. The results are ready and the fields of the FileExaminer object are
     * completely set when a load event occurs. A callback function must be registered
     * with the registerAsLoadListener function, to be called when the file contents have
     * been completely examined and parsed into matrix form.
     *
     * This function will perform the examining process by detecting the delimiter that
     * separates the file into the largest number of tokens.
     * @param file - the string contents of a delimiter separated value file
     */
    this.setFile = function(file){
        // Read the file as text which will trigger the reader's onload event.
        this.reader.readAsText(file);
    };

    /**
     * This public function re-examines a file with a specified delimiter rather than a
     * detected delimiter. The results are ready and the fields of the FileExaminer object
     * are completely re-set when a load event occurs. A callback function must be
     * registered with the registerAsLoadListener function, to be called when the file
     * contents have been completely examined and parsed into matrix form.
     *
     * @param delimiter - the delimiter to be used to examine the file and parse it to
     *      2D array form. It can be one of the following string values:
     *          "comma"
     *          "semicolon"
     *          "tab"
     */
    this.reExamineWithDelimiter = function(delimiter){
        _self.delimiter = delimiter;
        _self.matrix = file2grid(_self.fileContents,
                                 _self.LINE_TERMINATOR,
                                 _self.CELL_TERMINATORS[_self.delimiter]);
        notifyLoadObservers();
    };

    /**
     * This function registers a callback function to be called when the set file has
     * been completely examined and the FileExaminer fields are set with the results.
     * @param callback - a function to be called when the FileExaminer instance has
     * completely examined the file. The first argument provided to the callback will be
     * a reference to the calling FileExaminer instance.
     */
    this.registerAsLoadListener = function(callback){
        this.loadObservers.push(callback);
    };


    /**
     * This is a call back for the reader field's onload event.
     * @param e
     */
    this.reader.onload = function(e) {
        _self.fileContents = e.target.result;

        // determine the delimiter
        _self.delimiter = determineDelimiter(_self.fileContents);

        // call the parse function with the proper line terminator and cell terminator
        //parseCSV(e.target.result, '\n', '\t');
        _self.matrix
            = file2grid(_self.fileContents,
            _self.LINE_TERMINATOR,
            _self.CELL_TERMINATORS[_self.delimiter]);
        notifyLoadObservers();
    };

    /**
     * This private function calls all of the registered load observer callbacks for the
     * FileExaminer instance.
     */
    function notifyLoadObservers(){
        for (var i=0; i<_self.loadObservers.length; i++){
            _self.loadObservers[i](_self);
        }
    }


    /**
     * A private function for parsing the file content string into a 2D matrix and setting
     * the colsSize and rowsSize fields
     * @param text
     * @param lineTerminator
     * @param cellTerminator
     * @returns {Array}
     */
    function file2grid(text, lineTerminator, cellTerminator) {
        var lines;
        var information = [];
        var matrix = [];

        //break the lines apart
        lines = text.split(lineTerminator);
        _self.rowsSize = 0;

        // determine the dimensions of the data set
        // and split it into an irregular information matrix
        for(var i=0; i<lines.length; i++){
            information[_self.rowsSize] = lines[i].split(cellTerminator);
            if (information[_self.rowsSize].length > _self.colsSize){
                _self.colsSize = information[_self.rowsSize].length;
            }
            _self.rowsSize++;
        }

        // put the irregular information matrix into a regular matrix
        for(var j = 0; j<_self.rowsSize; j++){
            matrix[j] = [];
            for(var k = 0; k < _self.colsSize; k++){
                if (!((typeof information[j][k]) == "undefined")){
                    matrix[j][k] = information[j][k];
                } else {
                    matrix[j][k] = "";
                }
            }
        }

        return matrix;
    }

    /**
     * A private function that determines the delimiter that breaks the file contents
     * into the largest number of tokens.
     * @param fileContents - a string of the contents of a file to be examined
     * @returns {*} - the delimiter with the highest token count
     */
    function determineDelimiter(fileContents){
        var delimiterToTokenCount = {};
        var lines = fileContents.split(_self.LINE_TERMINATOR);

        // count total number of tokens in the file for each
        // delimiter
        for (var key in _self.CELL_TERMINATORS){
            var currentLineTokenCount = 0;
            var currentDelimiter = _self.CELL_TERMINATORS[key];
            delimiterToTokenCount[currentDelimiter] = 0;

            for (var j=0; j<lines.length; j++){
                delimiterToTokenCount[currentDelimiter]
                    += lines[j].split(currentDelimiter).length;
            }
        }

        // determine the delimiter with the max number of tokens
        var max = -1;
        var maxDelimiter;
        var maxDelimiterName;

        for (key in _self.CELL_TERMINATORS){
            var delimiter = _self.CELL_TERMINATORS[key];

            if (delimiterToTokenCount[delimiter] > max){
                max = delimiterToTokenCount[delimiter];
                maxDelimiter = delimiter;
                maxDelimiterName = key;
            }
        }

        return maxDelimiterName;
    }
}