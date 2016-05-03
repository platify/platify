package edu.harvard.capstone.result

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
    def springSecurityService

    def getReferenceXCategories(int experiment_id) {
        def experiment = ExperimentalPlateSet.findById(experiment_id);
        def resultInstance = Result.findByExperiment(experiment);
        def resultPlate = ResultPlate.findByResult(resultInstance);
        def result_well = ResultWell.findByPlate(resultPlate);
        def result_labels = ResultLabel.findAllByDomainIdAndLabelType(result_well.id, ResultLabel.LabelType.RAW_DATA)
        def labels = [];
        result_labels.each { result_label -> labels.push(result_label.name) }
        render g.select(id:"refXCategory", name:"refXCategory", from:labels,
                noSelection:[null:' '], onchange:"xCategoryChanged(this.value)")
    }

    def getReferenceYCategories(String barcode, int exp_id) {
        def experiment = ExperimentalPlateSet.findById(exp_id);
        def plateInstance = PlateSet.findByBarcodeAndExperiment(barcode, experiment);
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
}
