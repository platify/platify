// HACK - this module assumes RESULT_READ_EXPERIMENT_URL is set globally
// 	  when rendering the template for the page.

/**
 * Aggregates template, plate set, and result data from an experiment
 * for display and download.
 */
function ExperimentModel(experimentId) {
    // experiment-wide data
    this.experimentId = experimentId;
    this.plates = null; // keyed by plateID

    // updated every time we change plates
    this.controls = {'negative': null, 'positive': null};
    this.currentPlate = null;
    this.currentPlateBarcode = null;
    this.data = null;
    this.normalizedData = null;


    /**
     * Retrieves the details for the experiment, template, plate set,
     * and results.
     */
    this.getData = function() {
        var that = this; // blegh, js binding hack
        var url = RESULT_KITCHEN_SINK_URL + '/' + this.experimentId;
        return $.getJSON(url, function(result) {
            that.plates = {};
            try {
                that.experiment = result.ImportData || {plates: {}};
            }
            catch (e) {
                console.log('getData got unexpected ajax response from url '
                        + url + '\n' + result);
                console.log(e);
                return;
            }
            if (Object.keys(that.experiment.plates).length > 0) {
                for (var i=0; i<that.experiment.plates.length; i++) {
                    var plate = that.experiment.plates[i];
                    that.plates[plate.plateID] = plate;
                }
                that.selectPlate(that.experiment.plates[0].plateID);
                if ($.isEmptyObject(that.currentPlate.rows[0].columns[0].normalizedData)) {
                    that.normalizeAndSave();
                }
            }
        });
    }


    /**
     * Copies the raw data on the current plate into a 2d array to supply
     * to slickgrid.
     */
    this.loadDataForGrid = function() {
        var label = this.rawDataLabel();

        this.data = [];
        for (var x=0; x<this.currentPlate.rows.length; x++) {
            this.data[x] = [];
            for (var y=0; y<this.currentPlate.rows[0].columns.length; y++) {
                var well = this.currentPlate.rows[x].columns[y]
                if (!$.isEmptyObject(well.rawData)) {
                    this.data[x][y] = well.rawData[label];
                }
            }
        }
    }


    /**
     * Normalizes the raw data on the current plate, stores it in a 2d array
     * to supply to slickgrid.
     */
    this.loadNormalizedDataForGrid = function() {
        var label = this.rawDataLabel();

        this.normalizedData = [];
        for (var x=0; x<this.currentPlate.rows.length; x++) {
            this.normalizedData[x] = [];
            for (var y=0; y<this.currentPlate.rows[0].columns.length; y++) {
                var well = this.currentPlate.rows[x].columns[y];
                if (!$.isEmptyObject(well.normalizedData)) {
                    this.normalizedData[x][y] = well.normalizedData[label];
                }
            }
        }
    }


    /**
     * Walks the current plate, stores the coordinates of the negative
     * and positive control wells.
     */
    this.locateControls = function() {
        this.controls = {'negative': [], 'positive': []};

        for (var x=0; x<this.currentPlate.rows.length; x++) {
            for (var y=0; y<this.currentPlate.rows[x].columns.length; y++) {
                var controlType = this.currentPlate.rows[x].columns[y].control;
                switch (controlType) {
                    case 'NEGATIVE':
                    case 'POSITIVE':
                        this.controls[controlType.toLowerCase()].push([x, y]);
                        break;
                }
            }
        }
    }


    /**
     * Normalizes the data for the current plate, and saves it back to the 
     * server.
     */
    this.normalizeAndSave = function() {
        var label = this.rawDataLabel();
        var normalized = normalize(this.currentPlate, label,
                                   this.controls.negative, this.controls.positive);
        for (var x=0; x<this.currentPlate.rows.length; x++) {
            for (var y=0; y<this.currentPlate.rows[0].columns.length; y++) {
                this.currentPlate.rows[x].columns[y].normalizedData[label]
                    = normalized[x][y].toString();
            }
        }

        var url = RESULT_SAVE_REFACTORED_DATA_URL + '/' + this.experiment.resultID;
        var jqxhr = $.ajax({
            url: url,
            contentType: 'application/json; charset=UTF-8',
            data: JSON.stringify(this.experiment),
            method: 'POST',
            processData: false,
        });
        jqxhr.done(function() {
            console.log('POST of normalized data for plate '
                        + this.currentPlateBarcode + ' complete');
        });
    }


    /**
     * Picks the first raw data label from the first well on the plate.
     *
     * Our backend supports more than one data value per well, but our
     * qa/qc and results display doesn't.
     */
    this.rawDataLabel = function() {
        if (this.currentPlate.rows[0].columns[0].rawData) {
            return Object.keys(this.currentPlate.rows[0].columns[0].rawData).sort()[0];
        }
        else {
            return null;
        }
    }


    /**
     * Marks the plate with plateID plateID as the active one.  Copies data
     * from that plate into a 2d array we can feed to slickgrid.  Locates the
     * control wells for the plate.  Calculates and stores normalized data 
     * into a 2d array we can feed to slickgrid.
     *
     * TODO - put call to normalize and store normalized data into output
     * 	      parser.
     */
    this.selectPlate = function(plateID) {
        if (this.plates) {
            this.currentPlateBarcode = plateID;
            this.currentPlate = this.plates[plateID];
            this.locateControls();
            this.loadDataForGrid();
            this.loadNormalizedDataForGrid();
        }
        else {
            this.currentPlate = null;
            this.data = [];
            this.normalizedData = [];
        }
    }


    /**
     * Calculates the z-factor value for the current plate.
     */
    this.zFactor = function() {
        return zFactor(this.currentPlate, this.rawDataLabel(),
                       this.controls.negative, this.controls.positive);
    }


    /**
     * Calculates the z'-factor value for the current plate.
     */
    this.zPrimeFactor = function() {
        return zPrimeFactor(this.currentPlate, this.rawDataLabel(),
                            this.controls.negative, this.controls.positive);
    }
}
