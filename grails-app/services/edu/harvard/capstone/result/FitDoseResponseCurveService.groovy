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

    def getfittedData(ExperimentalPlateSet experiment, String compound_name) {
        if (!experiment) {
            throw new RuntimeException("The experiment does not exist")
        }

        def data = getData(experiment)

        def fitData = [
                parameters   : [:],
        ]

        ArrayList<Double> x = new ArrayList<Double>()
        ArrayList<Double> y = new ArrayList<Double>()
        ArrayList<String> exclusions = new ArrayList<String>()
        data.plates.each { plate ->
            plate.rows.each { r ->
                r.columns.each { c ->
                    if (c.control == Well.WellControl.COMPOUND.toString().toUpperCase() &&
                            c.labels["compound"] == compound_name &&
                            "dosage" in c.labels.keySet() &&
                            "raw_data" in c.labels.keySet()) {
                        x.add(Double.parseDouble(c.labels["dosage"]))
                        y.add(Double.parseDouble(c.labels["raw_data"]))
                        exclusions.add("N")
                    }
                }
            }
        }


        SigmoidalCurveFitter sigmoidalFitter = new SigmoidalCurveFitter();
        boolean userOutlierDetection = true;
        //sigmoidalFitter.setFitConstraint("Max", 0.90);
        //sigmoidalFitter.setFitConstraint("Min", 0.1);

        double[] x1 = new double[x.size()];
        double[] y1 = new double[y.size()];
        String[] exclusions1 = new String[exclusions.size()];
        for(int i=0; i < x.size(); i++) {
            x1[i] = x.get(i);
            y1[i] = y.get(i);
            exclusions1[i] = "N";
        }
        HashMap<String,Object> fitResults = sigmoidalFitter.fit(x1, y1, exclusions1, userOutlierDetection);

        for(String fitOutputParameter : fitResults.keySet()) {
            fitData.parameters[fitOutputParameter] = fitResults.get(fitOutputParameter)
        }

        Function ec50Function = new EC50();
        double[] trueParams = new double[4];
        trueParams[0] = fitData.parameters["Min_ROUT"];
        trueParams[1] = fitData.parameters["Max_ROUT"];
        trueParams[2] = fitData.parameters["EC50_ROUT"];
        trueParams[3] = fitData.parameters["Slope_ROUT"];

        double[] y2 = new double[y.size()];
        for(int i=0; i < x.size(); i++)
            y2[i] = ec50Function.evaluate(Math.log10(x1[i]), trueParams);

        def s_x = x1 as List
        def s_y1 = y1 as List
        def s_y2 = y2 as List


        def start = s_x.min();
        def end = s_x.max();
        def length = end - start;
        def interval_length = length/50;
        def s_x3 = []
        def s_y3 = []
        for (i in 1..50) {
            def x3 = start+(i*interval_length)
            s_x3 <<  x3
            s_y3 << ec50Function.evaluate(Math.log10(x3), trueParams)
        }


        fitData.x = s_x
        fitData.y1 = s_y1
        fitData.y2 = s_y2
        fitData.x3 = s_x3
        fitData.y3 = s_y3

        return  fitData
    }

    def getData(ExperimentalPlateSet experiment) {
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
                def n_columns = Integer.parseInt(plateTemplate.width)
                def n_rows = Integer.parseInt(plateTemplate.height)

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
                    if (well.row < n_rows && well.column < n_columns) {
                        wellsById[well.id] = well
                        plate.rows[well.row].columns[well.column].control = well.control.toString().toUpperCase()
                    }
                }
                DomainLabel.where {
                    domainId in wellsById.keySet()
                    labelType == DomainLabel.LabelType.WELL
                }.each { domainLabel ->
                    def well = wellsById[domainLabel.domainId]
                    def wellOut = plate.rows[well.row].columns[well.column]
                    def label = domainLabel.label
                    if (label.category == "compound") {
                        plate.compounds[label.name] = 1
                    }
                    wellOut.labels[label.category] = label.name
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