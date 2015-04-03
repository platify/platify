/**
 * Created by zacharymartin on 3/24/15.
 */

function ImportData(experimentIdentifier, parsingConfigIdentifier){
    this.experimentID = experimentIdentifier;
    this.parsingID = parsingConfigIdentifier;
    this.experimentFeatures = {
        labels : []
    };
    this.plates = [];
}