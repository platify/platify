package edu.harvard.capstone.result

import curvefit.exceptions.ConvergenceException
import edu.harvard.capstone.editor.Compound
import edu.harvard.capstone.editor.DomainLabel
import edu.harvard.capstone.editor.ExperimentalPlateSet
import edu.harvard.capstone.editor.PlateSet
import edu.harvard.capstone.editor.Well
import grails.converters.JSON
import grails.transaction.Transactional

import curvefit.functions.EC50;
import curvefit.functions.Function;
import curvefit.wrapper.SigmoidalCurveFitter
import org.apache.commons.lang.math.NumberUtils;

import java.util.HashMap;


@Transactional
class FitDoseResponseCurveService {

    def serviceMethod() {

    }

    def getfittedData2(ExperimentalPlateSet experiment, String compound_name, String max_param, String min_param, String ec50, String slope, String data_type) {
        if (!experiment) {
            throw new RuntimeException("The experiment does not exist")
        }

        def data = getData(experiment)

        def fitData = [
                parameters   : [:],
        ]

        def compound_info = []
        ArrayList<Double> x = new ArrayList<Double>()
        ArrayList<Double> y = new ArrayList<Double>()
        ArrayList<String> exclusions = new ArrayList<String>()
        data.plates.eachWithIndex { plate, index ->
            plate.rows.eachWithIndex { r, r_i ->
                r.columns.eachWithIndex { c, c_i ->
                    if (c.control == Well.WellControl.COMPOUND.toString().toUpperCase() &&
                            c.labels["compound"] == compound_name &&
                            "dosage" in c.labels.keySet() &&
                            data_type in c.labels.keySet()) {
                        x.add(Double.parseDouble(c.labels["dosage"]))
                        y.add(Double.parseDouble(c.labels[data_type]))
                        def excludeStatus = (c.outlier && c.outlier == "true") ? "Y" : "N";
                        exclusions.add(excludeStatus)
                        compound_info.push([
                            plateIndex: index,
                            row: r_i,
                            column: c_i,
                            outlier: c.outlier
                        ])
                    }
                }
            }
        }

        Double _max = NumberUtils.isNumber(max_param) ? Double.parseDouble(replaceDot(max_param)) : 0;
        Double _min = NumberUtils.isNumber(min_param) ? Double.parseDouble(replaceDot(min_param)) : 0;
        Double _ec50 = NumberUtils.isNumber(ec50) ? Double.parseDouble(replaceDot(ec50)) : 0;
        Double _slope = NumberUtils.isNumber(slope) ? Double.parseDouble(replaceDot(slope)) : 0;

        double[] x1 = new double[x.size()];
        double[] y1 = new double[y.size()];
        for(int i=0; i < x.size(); i++) {
            x1[i] = x.get(i);
            y1[i] = y.get(i);
        }

        Function ec50Function = new EC50();
        double[] estParams = new double[4];
        estParams[0] = _min;
        estParams[1] = _max;
        estParams[2] = _ec50;
        estParams[3] = _slope;

        double[] y2 = new double[y.size()];
        for(int i=0; i < x.size(); i++)
            if (x1[i]!=0) {
                x1[i]=Math.log10(x1[i]);
                y2[i] = ec50Function.evaluate(x1[i], estParams);
            } else
                x1[i]=0;
        def s_x = x1 as List
        def s_y1 = y1 as List
        def s_y2 = y2 as List

        fitData.parameters["Min_ROUT"]=_min
        fitData.parameters["Max_ROUT"]=_max
        fitData.parameters["EC50_ROUT"]=_ec50
        fitData.parameters["Slope_ROUT"]=_slope
        fitData.x = s_x
        fitData.y1 = s_y1
        fitData.y2 = s_y2
        fitData.compounds = compound_info
        fitData.err = false
        fitData.msg = ""

        return  fitData
    }


    def getfittedData(ExperimentalPlateSet experiment, String compound_name, String data_type) {
        if (!experiment) {
            throw new RuntimeException("The experiment does not exist")
        }

        def data = getData(experiment)

        def fitData = [
                parameters   : [:],
        ]

        def compound_info = []
        ArrayList<Double> x = new ArrayList<Double>()
        ArrayList<Double> y = new ArrayList<Double>()
        ArrayList<String> exclusions = new ArrayList<String>()
        data.plates.eachWithIndex { plate, index ->
            plate.rows.eachWithIndex { r, r_i ->
                r.columns.eachWithIndex { c, c_i ->
                    if (c.control == Well.WellControl.COMPOUND.toString().toUpperCase() &&
                            c.labels["compound"] == compound_name &&
                            "dosage" in c.labels.keySet() &&
                            data_type in c.labels.keySet()) {
                        x.add(Double.parseDouble(c.labels["dosage"]))
                        y.add(Double.parseDouble(c.labels[data_type]))
                        def excludeStatus = (c.outlier && c.outlier == "true") ? "Y" : "N";
                        exclusions.add(excludeStatus)
                        compound_info.push([
                                plateIndex: index,
                                row: r_i,
                                column: c_i,
                                outlier: c.outlier
                        ])
                    }
                }
            }
        }


        SigmoidalCurveFitter sigmoidalFitter = new SigmoidalCurveFitter();
        boolean userOutlierDetection = true;

        double[] x1 = new double[x.size()];
        double[] y1 = new double[y.size()];
        String[] exclusions1 = new String[exclusions.size()];
        for(int i=0; i < x.size(); i++) {
            x1[i] = x.get(i);
            y1[i] = y.get(i);
            exclusions1[i] = exclusions.get(i);
        }

        try {
            HashMap<String, Object> fitResults = sigmoidalFitter.fit(x1, y1, exclusions1, userOutlierDetection);
            for(String fitOutputParameter : fitResults.keySet()) {
                fitData.parameters[fitOutputParameter] = fitResults.get(fitOutputParameter)
            }

            Function ec50Function = new EC50();
            double[] estParams = new double[4];
            estParams[0] = fitData.parameters["Min_ROUT"];
            estParams[1] = fitData.parameters["Max_ROUT"];
            estParams[2] = fitData.parameters["EC50_ROUT"];
            estParams[3] = fitData.parameters["Slope_ROUT"];
            def s_x = [] as List
            def s_y1 = [] as List
            def s_y2 = [] as List
            for(int i=0; i < x1.size(); i++) {
                if (x1[i] != 0) {
                    s_x << Math.log10(x1[i])
                    s_y1 << y1[i]
                    s_y2 << ec50Function.evaluate(Math.log10(x1[i]), estParams);
                }
            }
            fitData.x = s_x
            fitData.y1 = s_y1
            fitData.y2 = s_y2
            fitData.compounds = compound_info
            fitData.err = false
            fitData.msg = ""
        } catch (ConvergenceException e) {
            fitData.err = true
            fitData.msg = "The fitting algorithm failing to converge"
        } catch (Exception e) {
            fitData.err = true
            fitData.msg = "Invalid parameter"
        }


        return  fitData
    }

    def getData(ExperimentalPlateSet experiment) {
        if (!experiment) {
            throw new RuntimeException("The experiment does not exist")
        }

        def resultData = [
                experimentID: experiment.id,
                plates     : [],
                compounds: [:]
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
                                control: Well.WellControl.EMPTY.toString().toUpperCase(),
                                outlier: [:]
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
                DomainLabel.findAllByPlate(plateSet).each { domainLabel ->
                    if (domainLabel.domainId in wellsById.keySet() &&
                            domainLabel.labelType == DomainLabel.LabelType.WELL)
                    {
                        def well = wellsById[domainLabel.domainId]
                        def wellOut = plate.rows[well.row].columns[well.column]
                        def label = domainLabel.label
                        wellOut.labels[label.category] = replaceDot(label.name)
                        if (label.category == "dosage") {
                            wellOut.labels["units"] = label.units
                        }
                    }
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
                                wellOut.outlier = resultLabel.outlier
                                break
                            case ResultLabel.LabelType.NORMALIZED_DATA:
                                wellOut.labels["normalized_data"] = resultLabel.value
                                wellOut.outlier = resultLabel.outlier
                                break
                        }
                    }
                }

                plate.rows.each { r ->
                    r.columns.each { c ->
                        if (c.control == Well.WellControl.COMPOUND.toString().toUpperCase() &&
                                "dosage" in c.labels.keySet() &&
                                "raw_data" in c.labels.keySet()) {
                            plate.compounds[c.labels["compound"]]=1
                            resultData.compounds[c.labels["compound"]]=1
                        }
                    }
                }

                resultData.plates << plate
            }
        }

        return resultData
    }

    def replaceDot(String dotString) {
        return dotString.replace("__dot__", ".");
    }
}
