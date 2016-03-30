package edu.harvard.capstone.analysis

import edu.harvard.capstone.editor.DomainLabel
import edu.harvard.capstone.editor.ExperimentalPlateSet
import edu.harvard.capstone.editor.PlateSet
import edu.harvard.capstone.editor.Well
import grails.converters.JSON

//import grails.validation.ValidationException

/**
 * Created by Monica on 3/24/2016.
 */
class StdCurveController {
    def editorService

    static allowedMethods = [save: "POST", update: "PUT", delete: "DELETE"]

    def show(ExperimentalPlateSet experiment){

/*
        if (!springSecurityService.isLoggedIn()){
            redirect controller: 'experimentalPlateSet', action: 'index', method: 'GET'
            return
        }
*/

        if (experiment == null) {
            //notFound()
            return
        }

        def importData
        try{
            importData = editorService.getExperimentData(experiment)
        }
/*        catch (ValidationException e) {
            response.sendError(400)
            return
        }*/ catch (RuntimeException e) {
            response.sendError(500)
            return
        }

        // TODO - don't really need the experiment object
        respond experiment as Object, model:[importData: importData]
    }

    def getReferencePlates(int experiment_id) {
        def referenceExperiment = ExperimentalPlateSet.findById(experiment_id);
        def referencePlate = PlateSet.findAllByExperiment(referenceExperiment);
        render g.select(id:"refPlate", name:"refPlate", from:referencePlate,
            optionKey:'id', optionValue:"barcode", noSelection:[null:' '], onchange:"plateChanged(this.value)")
    }

    def getReferenceXCategories(int plate_id) {
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

        render g.select(id:"refXCategory", name:"refXCategory", from:wellLabels,
                noSelection:[null:' '], onchange:"xCategoryChanged(this.value)")
    }

    def getReferenceYCategories(int plate_id, String x_category) {
        def plateInstance = PlateSet.findById(plate_id);
        def referenceWells = Well.findAllByPlate(plateInstance.plate);
        def wellLabels = [];
        referenceWells.each{
            def label = DomainLabel.findAllByDomainIdAndLabelTypeAndPlate(
                    it.id, DomainLabel.LabelType.WELL, plateInstance).collect{it.label}
            label.each{
                if (!wellLabels.contains(it.category) && it.category != "compound"
                    && it.category != x_category)
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
