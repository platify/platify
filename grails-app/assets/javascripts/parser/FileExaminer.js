/**
 * Created by zacharymartin on 3/25/15.
 */

/**
 * An object for converting delimiter separated value files into a 2D array of values
 */
function FileExaminer(){
    this.LINE_TERMINATOR = /\r\n|\n+|\r+/;
    this.CELL_TERMINATORS = {
        "comma" : /\s*,\s*/,
        "semicolon" : /\s*;\s*/,
        "colon" : /\s*:\s*/,
        "tab": "\t"
    };

    var _self = this;
    this.files = null;
    this.numFiles = 0;
    this.currentFileIndex = 0;
    this.fileContents = "";
    this.delimiter = null;
    this.reader = new FileReader();
    this.colsSize = -1;
    this.rowsSize = -1;
    this.matrix = null;
    this.loadObservers = [];

    /**
     * This public public starts the file examining process for a given set of files in
     * array form. The content string of each file is ready when a FileReader onload event
     * occurs, and the onload handler appends those contents to the fileContents string
     * field and call the readAsText function for the next file which then triggers the
     * next FileReader onload event. When all files have been read and the fields of the
     * FileExaminer object are completely set, the FileExaminer notifies all of the
     * registered load listener callbacks. A callback function must be registered
     * with the registerAsLoadListener function, to be called when all of the file
     * contents have been completely examined and parsed into matrix form.
     *
     * @param file - the string contents of a delimiter separated value file
     */
    this.setFiles = function(files){
        this.numFiles = files.length;
        this.currentFileIndex = 0;
        this.files = files;
        this.fileContents = "";

        // Read the 0th file as text which will trigger the reader's onload event.
        this.reader.readAsText(this.files[0]);
    };

    /**
     * This function sets the delimiter that should be used for parsing Delimiter
     * Separated Value (DSV) files. The delimiter can be any of the property strings of
     * the CELL_TERMINATORS field or null. If the set delimiter is null, then the
     * FileExaminer will chose the delimiter that breaks the contents of the Files into
     * the greatest number of tokens.
     * @param delimiter
     */
    this.setDelimiter = function(delimiter){

        // determine if the given delimiter is recognized
        var recognized = false;
        for (var key in this.CELL_TERMINATORS){
            if (delimiter == key || delimiter == null){
                recognized = true;
                break
            }
        }

        if (recognized) {
            this.delimiter = delimiter;
        } else {
            // error!
        }
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
     * This is a call back for the reader field's onload event. This function will
     * append the current file's content string to the FileExaminer's fileContents string
     * and then read the next file which when loaded will call this function again.
     * When all the files have been read, this function, parses the fileContents field
     * in to matrix form either using a specified delimiter or using the delimiter that
     * breaks the content string into the greatest number of tokens and then notifies
     * all of the registered load listener callbacks that the FileExaminer has examined
     * all of the files
     * @param e - the onload event object for the FileReader
     */
    this.reader.onload = function(e) {
        var fileName = _self.files[_self.currentFileIndex].name;

        _self.fileContents += e.target.result + "\n[ end of file: "+ fileName +"]\n";

        _self.currentFileIndex++;

        if (_self.currentFileIndex >= _self.numFiles){   // we have read the last file
            // determine the delimiter if necessary
            if (!_self.delimiter){
                _self.delimiter = determineDelimiter(_self.fileContents);
            }


            // call the parse function with the proper line terminator and cell terminator
            //parseCSV(e.target.result, '\n', '\t');
            _self.matrix
                = file2grid(_self.fileContents,
                _self.LINE_TERMINATOR,
                _self.CELL_TERMINATORS[_self.delimiter]);
            notifyLoadObservers();
        } else {           // we have not read the last file, so read the next one
            _self.reader.readAsText(_self.files[_self.currentFileIndex]);
        }


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