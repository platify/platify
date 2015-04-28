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
        for (var i=0; i<this.currentPlate.rows.length; i++) {
            this.data[i] = [];
            for (var j=0; j<this.currentPlate.rows[i].columns.length; j++) {
                if (this.currentPlate.rows[i].columns[j].rawData) {
                    this.data[i][j] = this.currentPlate.rows[i].columns[j].rawData[label];
                }
            }
        }
    }


    /**
     * Normalizes the raw data on the current plate, stores it in a 2d array
     * to supply to slickgrid.
     */
    this.loadNormalizedDataForGrid = function() {
        var normalized = normalize(this.currentPlate, this.rawDataLabel(),
                                   this.controls.negative, this.controls.positive);
        this.normalizedData = $.map(normalized, function(row) {
            return [$.map(row, function(val) {
                return val.toString(); })]
        });
    }


    /**
     * Walks the current plate, stores the coordinates of the negative
     * and positive control wells.
     */
    this.locateControls = function() {
        this.controls = {'negative': [], 'positive': []};

        for (var i=0; i<this.currentPlate.rows.length; i++) {
            for (var j=0; j<this.currentPlate.rows[i].columns.length; j++) {
                var controlType = this.currentPlate.rows[i].columns[j].control;
                switch (controlType) {
                    case 'NEGATIVE':
                    case 'POSITIVE':
                        this.controls[controlType.toLowerCase()].push([i, j]);
                        break;
                }
            }
        }
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
        this.currentPlateBarcode = plateID;
        this.currentPlate = this.plates[plateID];
        this.locateControls();
        this.loadDataForGrid();
        this.loadNormalizedDataForGrid();
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
