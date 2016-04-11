package edu.harvard.capstone.analysis

import edu.harvard.capstone.editor.DomainLabel
import edu.harvard.capstone.editor.ExperimentalPlateSet
import edu.harvard.capstone.editor.PlateSet
import edu.harvard.capstone.editor.Well
import edu.harvard.capstone.result.Result
import edu.harvard.capstone.result.ResultLabel
import edu.harvard.capstone.result.ResultPlate
import edu.harvard.capstone.result.ResultService
import edu.harvard.capstone.result.ResultWell
import grails.converters.JSON

//import grails.validation.ValidationException

/**
 * Created by Monica on 3/24/2016.
 */
class StdCurveController {
    def editorService
    def resultService

    static allowedMethods = [save: "POST", update: "PUT", delete: "DELETE"]

    def show(){

/*
        if (!springSecurityService.isLoggedIn()){
            redirect controller: 'experimentalPlateSet', action: 'index', method: 'GET'
            return
        }
*/
        def experimentList = ExperimentalPlateSet.listOrderByName();
        // TODO - don't really need the experiment object
        respond experimentList as Object, model:[experimentList: experimentList]
    }

    def getResultData(int experiment_id) {
        def resultData
        try{
            def experiment = ExperimentalPlateSet.findById(experiment_id);
            resultData = resultService.getResults(experiment)
        }
        catch (RuntimeException e) {
            response.sendError(500)
            return
        }

        render (resultData as JSON);
    }

    def getUnknownPlates(int experiment_id) {
        def unknownExperiment = ExperimentalPlateSet.findById(experiment_id);
        def unknownPlate = PlateSet.findAllByExperiment(unknownExperiment);
        render g.select(id:"unknownPlate", name:"unknownPlate", from:unknownPlate,
                optionKey:'id', optionValue:"barcode", noSelection:[null:' '], onchange:"unknownPlateChanged()")
    }

    def getReferencePlates(int experiment_id) {
        def referenceExperiment = ExperimentalPlateSet.findById(experiment_id);
        def referencePlate = PlateSet.findAllByExperiment(referenceExperiment);
        render g.select(id:"refPlate", name:"refPlate", from:referencePlate,
            optionKey:'id', optionValue:"barcode", noSelection:[null:' '], onchange:"refPlateChanged(this.value)")
    }

    def getReferenceXCategories(int experiment_id) {
//        def plateInstance = PlateSet.findById(plate_id);
//        def referenceWells = Well.findAllByPlate(plateInstance.plate);
//        def wellLabels = [];
//        referenceWells.each{
//            def label = DomainLabel.findAllByDomainIdAndLabelTypeAndPlate(
//                    it.id, DomainLabel.LabelType.WELL, plateInstance).collect{it.label}
//            label.each{
//                if (!wellLabels.contains(it.category) && it.category != "compound")
//                wellLabels << it.category;
//            }
//        }
//
//        render g.select(id:"refXCategory", name:"refXCategory", from:wellLabels,
//                noSelection:[null:' '], onchange:"xCategoryChanged(this.value)")
        def experiment = ExperimentalPlateSet.findById(experiment_id);
        def resultInstance = Result.findByExperiment(experiment);
        def resultPlate = ResultPlate.findByResult(resultInstance);
        def result_well = ResultWell.findByPlate(resultPlate);
        def result_label = ResultLabel.findByDomainIdAndLabelType(result_well.id, ResultLabel.LabelType.RAW_DATA)
        def labels = [result_label.name];
        render g.select(id:"refXCategory", name:"refXCategory", from:labels,
                noSelection:[null:' '], onchange:"xCategoryChanged(this.value)")
    }

    def getReferenceYCategories(int plate_id) {
//        def plateInstance = PlateSet.findById(plate_id);
//        def referenceWells = Well.findAllByPlate(plateInstance.plate);
//
//        def wellLabels = [];
//        referenceWells.each{
//            def label = DomainLabel.findAllByDomainIdAndLabelTypeAndPlate(
//                    it.id, DomainLabel.LabelType.WELL, plateInstance).collect{it.label}
//            label.each{
//                if (!wellLabels.contains(it.category) && it.category != "compound"
//                    && it.category != x_category)
//                    wellLabels << it.category;
//            }
//        }
//
//        render g.select(id:"refYCategory", name:"refYCategory", from:wellLabels,
//                noSelection:[null:' '], onchange:"yCategoryChanged()")

        def plateInstance = PlateSet.findById(plate_id);
        def referenceWells = Well.findAllByPlate(plateInstance.plate);
        def wellLabels = [];
        referenceWells.each{
            def label = DomainLabel.findAllByDomainIdAndLabelTypeAndPlate(
                    it.id, DomainLabel.LabelType.WELL, plateInstance).collect{it.label}
            label.each{
                if (!wellLabels.contains(it.category) && it.category != "compound")
                wellLabels << it.category;
            }
        }

        render g.select(id:"refYCategory", name:"refYCategory", from:wellLabels,
                noSelection:[null:' '], onchange:"yCategoryChanged()")
    }

    def getReferenceData(int plate_id) {
//        def plate = PlateSet.findById(plate_id);
//        def referenceData = editorService.getPlate(plate);

        def test = ExperimentalPlateSet.findById(6);
        def referenceData = editorService.getExperimentData(test);

        render(referenceData as JSON);
    }
}
