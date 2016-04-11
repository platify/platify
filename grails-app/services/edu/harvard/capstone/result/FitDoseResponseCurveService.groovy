package edu.harvard.capstone.result

import edu.harvard.capstone.editor.Compound
import edu.harvard.capstone.editor.DomainLabel
import edu.harvard.capstone.editor.ExperimentalPlateSet
import edu.harvard.capstone.editor.PlateSet
import edu.harvard.capstone.editor.Well
import grails.converters.JSON
import grails.transaction.Transactional

import curvefit.functions.EC50;
import curvefit.functions.Function;
import curvefit.wrapper.SigmoidalCurveFitter;
import java.util.HashMap;

@Transactional
class FitDoseResponseCurveService {

    def serviceMethod() {

    }

    def getfittedData(ExperimentalPlateSet experiment) {
        if (!experiment) {
            throw new RuntimeException("The experiment does not exist")
        }

        data = getResults(experiment)

        def resultData = [
                experimentID: experiment.id,
                compounds     : []
        ]

        data.compounds.keySet().each { compound ->

            def fitData = [
                    name: compound.name,
                    parameters   : [:],
            ]

            def x = []
            def y = []
            def exclusions = []
            def userOutlierDetection = true
            SigmoidalCurveFitter sigmoidalFitter = new SigmoidalCurveFitter();

            data.plates.each { plate ->
                plate.rows.each { row ->
                    row.columns.each { column ->
                        if (c.control == Well.WellControl.COMP.toString().toUpperCase() &&
                                c.labels["compound"] == compound.name) {
                            x.push(c.labels["dosage"])
                            y.push(c.labels["raw_data"])
                            exclusions.push('N')
                        }
                    }
                }
            }
            HashMap<String,Object> fitResults = sigmoidalFitter.fit(x, y, exclusions, userOutlierDetection);
            for(String fitOutputParameter : fitResults.keySet()) {
                fitData.parameters[fitOutputParameter] = fitResults.get(fitOutputParameter)
            }

            resultData.compounds << fitData
        }
    }

    def getResults(ExperimentalPlateSet experiment) {
        if (!experiment) {
            throw new RuntimeException("The experiment does not exist")
        }

        def resultData = [
                experimentID: experiment.id,
                plates     : []
        ]

        Result.findAllByExperiment(experiment).each { resultInstance ->
            ResultPlate.findAllByResult(resultInstance).each { resultPlate ->
                def plateSet = PlateSet.findByBarcode(resultPlate.barcode)
                def plateTemplate = plateSet.plate
                def plate = [
                        plateID  : plateSet.barcode,
                        rows     : [],
                        compounds: [:]
                ]
                def n_rows = Integer.parseInt(plateTemplate.width)
                def n_columns = Integer.parseInt(plateTemplate.height)

                // generate the shape of the plate
                (0..n_rows - 1).each { rowIndex ->
                    plate.rows << [columns: []]
                    (0..n_columns - 1).each { columnIndex ->
                        plate.rows[rowIndex].columns << [
                                labels : [:],
                                control: Well.WellControl.EMPTY.toString().toUpperCase()
                        ]
                    }
                }

                def wellsById = [:]
                Well.findAllByPlate(plateSet.plate).each { well ->
                    wellsById[well.id] = well
                    plate.rows[well.row].columns[well.column].control = well.control.toString().toUpperCase()
                }
                DomainLabel.where {
                    domainId in wellsById.keySet()
                    labelType == DomainLabel.LabelType.WELL
                }.each { domainLabel ->
                    def well = wellsById[domainLabel.domainId]
                    def wellOut = plate.rows[well.row].columns[well.column]
                    def label = domainLabel.label
                    if (label.category == "compound") {
                        plate.compounds[label.value] = 1
                    }
                    wellOut.labels[label.category] = label.value
                }

                def resultWellsById = [:]
                ResultWell.findAllByPlate(resultPlate).each { well ->
                    resultWellsById[well.id] = well
                }
                ResultLabel.where {
                    domainId in resultWellsById.keySet()
                    scope == ResultLabel.LabelScope.WELL
                }.each { resultLabel ->
                    def resultWell = resultWellsById[resultLabel.domainId]
                    if (resultWell.well.row<n_rows && resultWell.well.column<n_columns) {
                        def wellOut = plate.rows[resultWell.well.row].columns[resultWell.well.column]
                        switch (resultLabel.labelType) {
                            case ResultLabel.LabelType.RAW_DATA:
                                wellOut.labels["raw_data"] = resultLabel.value
                                break
                            case ResultLabel.LabelType.NORMALIZED_DATA:
                                wellOut.labels["normalized_data"] = resultLabel.value
                                break
                        }
                    }
                }

                resultData.plates << plate
            }
        }

        return resultData
    }
}