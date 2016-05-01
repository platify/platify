package edu.harvard.capstone.result


import edu.harvard.capstone.user.Scientist

import grails.converters.JSON

import grails.util.Holders

import org.codehaus.groovy.grails.web.json.JSONObject

import grails.validation.ValidationException

import grails.transaction.Transactional

import edu.harvard.capstone.editor.DomainLabel
import edu.harvard.capstone.editor.ExperimentalPlateSet
import edu.harvard.capstone.editor.PlateSet
import edu.harvard.capstone.editor.PlateTemplate
import edu.harvard.capstone.editor.Well
import edu.harvard.capstone.parser.Equipment

@Transactional
class ResultService {

	def springSecurityService
	/**
	*	Throws ValidationException if can't create a domain object
	*/
    def newRawData(JSONObject data) {
//		println("newRawData")
//		println(data.toString())
    	//if no data of the template return, 
    	if (!data || !data.experimentID || !data.parsingID){
			throw new RuntimeException("Incorrect Data")
		}		

    	//get the owner of the results
    	def scientistInstance = Scientist.get(springSecurityService.principal.id)
    	if(!scientistInstance){
			throw new RuntimeException("Scientist does not exist")
		}	

    	//get data from the experiment and the equipment used
    	def experimentInstance = ExperimentalPlateSet.get(data.experimentID)
    	def equipmentInstance = Equipment.get(data.parsingID)
    	if (!experimentInstance || !equipmentInstance){
			throw new RuntimeException("Either the equipment or the experiment does not exist")
		}	

    	//get the template
    	def plateList = PlateSet.findAllByExperiment(experimentInstance).collect{ it.plate }
    	if (!plateList){
			throw new RuntimeException("No plates")
		}	

		
		//verify that the number of plates of the template are = to the result plates
		/*if (plateList.size() != data.plates?.size()){
			throw new RuntimeException("Plates of the JSON do not match with the template")
		}	*/

    	//create a result instance
		def resultInstance = new Result(owner: scientistInstance, equipment: equipmentInstance, experiment: experimentInstance)    	
		resultInstance.save()

		if (resultInstance.hasErrors()){
			throw new ValidationException("Result is not valid", resultInstance.errors)
		}		
		

		data.rawFiles.each { name, contents ->
			def rawResultFile = createRawResultFile(name, contents)
			resultInstance.addToRawResults(rawResultFile)
			resultInstance.save()
		}

		// create the experiment labels
		data.experimentFeatures.labels.each{ key, value ->
			def resultLabelInstance = new ResultLabel(name: key, value: value, labelType: ResultLabel.LabelType.LABEL, scope: ResultLabel.LabelScope.RESULT, domainId: resultInstance.id)
			resultLabelInstance.save()
			if (resultLabelInstance.hasErrors()){
    			throw new ValidationException("Experiment label is not valid", resultLabelInstance.errors)
    		}
		}

		// create the result plates
		data.plates.eachWithIndex{ dataPlate, plateIndex ->
			def numberOfRows = dataPlate.rows?.size()
			def numberOfColumns = -1
			if (dataPlate.rows)
				numberOfColumns = dataPlate.rows[0]?.columns?.size()

			def plateInstance = new ResultPlate(result: resultInstance, rows: numberOfRows, columns: numberOfColumns, barcode: dataPlate.plateID)
			
			plateInstance.save()
			if (plateInstance.hasErrors()){
    			throw new ValidationException("Plate is not valid", plateInstance.errors)
    		}

    		// create the plate labels
    		dataPlate.labels.each{ key, value ->
    			def plateLabelInstance = new ResultLabel(name: key, value: value, labelType: ResultLabel.LabelType.LABEL, scope: ResultLabel.LabelScope.PLATE, domainId: plateInstance.id)
    			plateLabelInstance.save()
    			if (plateLabelInstance.hasErrors()){
	    			throw new ValidationException("Plate label is not valid", plateLabelInstance.errors)
	    		}
    		}

    		// well level
    		dataPlate.rows.eachWithIndex{ row, rowIndex ->
    			row.columns.eachWithIndex{ well, columnIndex ->
    				//for each well
    				def wellInstance = Well.withCriteria{
    					eq('row', rowIndex)
    					eq('column', columnIndex)
    					eq('plate', PlateSet.findByBarcodeAndExperiment(dataPlate.plateID, experimentInstance)?.plate)
    				}


    				if (!wellInstance){
						throw new RuntimeException("Well does not exist")
					}

		    		def wellResultInstance = new ResultWell(plate: plateInstance, well: wellInstance)				
		    		wellResultInstance.save()

	    			if (wellResultInstance.hasErrors()){
		    			throw new ValidationException("Well instance is not valid", wellResultInstance.errors)
		    		}
		    		// labels
		    		well.labels?.each{ key, value ->
		    			def wellLabelInstance = new ResultLabel(name: key, value: value, labelType: ResultLabel.LabelType.LABEL, scope: ResultLabel.LabelScope.WELL, domainId: wellResultInstance.id)
		    			wellLabelInstance.save()
		    			if (wellLabelInstance.hasErrors()){
			    			throw new ValidationException("Well label is not valid", wellLabelInstance.errors)
			    		}		    			
		    		}		    		
		    		// raw data
		    		well.rawData?.each{ key, value ->
		    			def rawDataInstance = new ResultLabel(name: key, value: value, labelType: ResultLabel.LabelType.RAW_DATA, scope: ResultLabel.LabelScope.WELL, domainId: wellResultInstance.id)
		    			rawDataInstance.save()
		    			if (rawDataInstance.hasErrors()){
			    			throw new ValidationException("Raw Data is not valid", rawDataInstance.errors)
			    		}		    			
		    		}		    		

    			}
    		}
		}


    	return resultInstance

    }

	/**
	*	Throws ValidationException if can't create a domain object
	*/
    def storeNormalizedData(Result resultInstance, JSONObject data) {
        if (!data || !data.experimentID || !data.parsingID){
			throw new RuntimeException("Incorrect Data")
		}

    	//get the owner of the results
    	def scientistInstance = Scientist.get(springSecurityService.principal.id)
    	if(!scientistInstance){
			throw new RuntimeException("Scientist does not exist")
		}

        def experiment = ExperimentalPlateSet.findById(data.experimentID);

        data.plates.eachWithIndex{ dataPlate, plateIndex ->
            def plate = PlateSet.findByExperimentAndBarcode(experiment, dataPlate.plateID)
            def resultPlate = ResultPlate.findByBarcode(dataPlate.plateID);
            def plateTemplate = plate.plate;

            def domainId;

            dataPlate.rows.eachWithIndex { row, rowIndex ->
                row.columns.eachWithIndex { wellInstance, columnIndex ->
                    def well = Well.findByPlateAndRowAndColumn(plateTemplate, rowIndex, columnIndex)
                    domainId = ResultWell.findByPlateAndWell(resultPlate, well).id

                    wellInstance.normalizedData?.each { key, value ->
                        def label = ResultLabel.findOrCreateByNameAndLabelTypeAndScopeAndDomainId(
                                key, ResultLabel.LabelType.NORMALIZED_DATA, ResultLabel.LabelScope.WELL, domainId)
                        label.outlier = wellInstance.outlier
                        label.value = value
                        label.save()
                    }
                }
            }
        }

        return resultInstance
//


////		println("Store normalized data")
////		println(data.toString())
//    	//if no data of the template return,
//    	if (!data || !data.experimentID || !data.parsingID){
//			throw new RuntimeException("Incorrect Data")
//		}
//
//    	//get the owner of the results
//    	def scientistInstance = Scientist.get(springSecurityService.principal.id)
//    	if(!scientistInstance){
//			throw new RuntimeException("Scientist does not exist")
//		}
//
//    	//get data from the experiment and the equipment used
//    	def experimentInstance = ExperimentalPlateSet.get(data.experimentID)
//    	def equipmentInstance = Equipment.get(data.parsingID)
//    	if (!experimentInstance || !equipmentInstance){
//			throw new RuntimeException("Either the equipment or the experiment does not exist")
//		}
//
//    	//get the template
//    	def plateList = PlateSet.findAllByExperiment(experimentInstance).collect{ it.plate }
//    	if (!plateList){
//			throw new RuntimeException("No plates")
//		}
//
//        // maybe check to make sure the plates we received are valid for this assay instead?
//        /*
//		//verify that the number of plates of the template are = to the result plates
//		if (plateList.size() != data.plates?.size()){
//			throw new RuntimeException("Plates of the JSON do not match with the template")
//		}
//        */
//
//        if (!resultInstance){
//            throw new RuntimeException("A result set must be specified")
//        }
////log.info(data);
//		// create the result plates
//		data.plates.eachWithIndex{ dataPlate, plateIndex ->
//			def plateInstance = ResultPlate.findByResultAndBarcode(resultInstance, dataPlate.plateID)
//
//    		// well level
//    		dataPlate.rows.eachWithIndex{ row, rowIndex ->
//    			row.columns.eachWithIndex{ wellInstance, columnIndex ->
//    				//for each well
//					//wellInstance will have the "outlier" information
////log.info(wellInstance);
////                    def well = Well.withCriteria{
////                        eq('row', rowIndex)
////                        eq('column', columnIndex)
////                        eq('plate', PlateSet.findByBarcodeAndExperiment(dataPlate.plateID, experimentInstance)?.plate)
////                    }.first()
//
//		    		def wellResultInstance = ResultWell.withCriteria {
////		    			well {
////	    					eq('row', rowIndex)
////	    					eq('column', columnIndex)
////	    					eq('plate', PlateSet.findByBarcodeAndExperiment(dataPlate.plateID, experimentInstance)?.plate)
////	    				}
//                        eq('well', Well.findByRowAndColumnAndPlate(rowIndex,columnIndex,PlateSet.findByBarcodeAndExperiment(dataPlate.plateID, experimentInstance).plate))
//	    				eq('plate', plateInstance)
//		    		}
////                    log.info(wellResultInstance as JSON);
//					//Update all of the cells here?
//
////					println("Raw Well instance outlier: "+wellInstance.outlier)
////					println("Well instance: "+wellInstance.toString())
////					println("Well Result Instance: "+wellResultInstance.toString())
//					// raw data needs to be saved too!
////                    log.info(wellInstance as JSON);//
//					wellInstance.rawData?.each{ key, value ->
//						def rawDataObj = new ResultLabel(name: key, value: value,
//							labelType: ResultLabel.LabelType.RAW_DATA,
//							scope: ResultLabel.LabelScope.WELL,
//							outlier: wellInstance.outlier,
//							domainId: wellResultInstance[0].id)
////						println("name: "+key+" value: "+value+" labelType: "+ResultLabel.LabelType.RAW_DATA+" scope: "+ResultLabel.LabelScope.WELL+" outlier: "+wellInstance.outlier+" domainId: "+wellResultInstance.id)
////						println(rawDataObj.toString())
//						if(rawDataObj.validate()) {
////							println("Validated just fine")
//						} else {
////							println("No validation!!!")
//						}
////						println("Results of saving raw object:")
//						/*println(*/rawDataObj.save(failOnError: true, flush: true)/*)*/
////						println("IT FUCKING SAVED")
////						println("Saved result data with value: "+value+" outlier: "+wellInstance.outlier)
//						if (rawDataObj.hasErrors()){
////							println("Error saving this! ")
////							println(rawDataObj.errors)
//							throw new ValidationException("Normalized Data is not valid", rawDataObj.errors)
//						}
//
//					}
//		    		// nomalized data
//		    		wellInstance.normalizedData?.each{ key, value ->
//		    			def normalizedDataObj = new ResultLabel(name: key, value: value,
//							labelType: ResultLabel.LabelType.NORMALIZED_DATA,
//							scope: ResultLabel.LabelScope.WELL,
//							outlier: wellInstance.outlier,
//							domainId: wellResultInstance[0].id)
////						println("name: "+key+" value: "+value+" labelType: "+ResultLabel.LabelType.NORMALIZED_DATA+" scope: "+ResultLabel.LabelScope.WELL+" outlier: "+wellInstance.outlier+" domainId: "+wellResultInstance.id)
////						println(normalizedDataObj.toString())
//						if(normalizedDataObj.validate()) {
////							println("Validated just fine")
//						} else {
////							println("No validation")
//						}
////						println("Results of saving:")
//						/*println(*/normalizedDataObj.save(failOnError: true, flush: true)/*)*/
////						println("IT FUCKING SAVED")
////						println("Saved result data with value: "+value+" outlier: "+wellInstance.outlier)
//		    			if (normalizedDataObj.hasErrors()){
////							println("Error saving this! ")
////							println(normalizedDataObj.errors)
//			    			throw new ValidationException("Normalized Data is not valid", normalizedDataObj.errors)
//			    		}
//		    		}
//
//    			}
//    		}
//
//            // plate level
//            dataPlate.rawData?.each { key, value ->
//                def resultData = new ResultLabel(name: key,
//                                                 value: value,
//                                                 labelType: ResultLabel.LabelType.RAW_DATA,
//                                                 scope: ResultLabel.LabelScope.PLATE,
//												 outlier: wellInstance.outlier,
//                                                 domainId: plateInstance.id)
//                resultData.save(failOnError: true, flush: true)
////				println("Saved result data with value: "+value+" outlier: "+outlier)
//                if (resultData.hasErrors()) {
////					println("Error saving this! ")
////					println(resultData.errors)
//                    throw new ValidationException('Plate-level raw data is not valid',
//                                                  resultData.errors)
//                }
//            }
//		}
//
//    	return resultInstance
    }    

    def getResults(ExperimentalPlateSet experiment) {
//		println("getResults")
//		println(experiment.toString())
    	if (!experiment) {
			throw new RuntimeException("The experiment does not exist")
        }
        
    	def importData = [
            experimentID: experiment.id,
            experimentFeatures: [labels: [:]],
            plates: [],
        ]

        DomainLabel.findAllByDomainIdAndLabelType(experiment.id, DomainLabel.LabelType.PLATE_SET).each{
            importData.experimentFeatures.labels[it.category] = it.name
        }

        def platesByBarcode = PlateSet.findAllByExperiment(experiment).collectEntries { plate ->
            [plate.barcode, plate]
        }
        
        Result.findAllByExperiment(experiment).each { resultInstance ->
            ResultLabel.findAllByDomainIdAndLabelTypeAndScope(resultInstance.id, ResultLabel.LabelType.LABEL, ResultLabel.LabelScope.RESULT).each{
                importData.experimentFeatures.labels[it.name] = it.value
            }

            ResultPlate.findAllByResult(resultInstance).each{ resultPlate ->
                def plate = [
                    resultID: resultInstance.id,
                    parsingID: resultInstance.equipment.id,
                    resultCreated: resultInstance.dateCreated,
                    plateID: resultPlate.barcode,
                    labels: [:],
                    rawData: [:],
                    normalizedData: [:],
					outlier: [:],
                    rows: [],
                ]

                // fill in the plate-level stuff
                def plateInstance = platesByBarcode.get(resultPlate.barcode)
                if (plateInstance) {
                    DomainLabel.findAllByDomainIdAndLabelTypeAndPlate(plateInstance.plate.id,
                                                                      DomainLabel.LabelType.PLATE,
                                                                      plateInstance).each {
                        plate.labels[it.name] = it.value
                    }
                }
                ResultLabel.findAllByDomainIdAndLabelTypeAndScope(resultPlate.id,
                                                                  ResultLabel.LabelType.LABEL,
                                                                  ResultLabel.LabelScope.PLATE).each {
                    plate.labels[it.name] = it.value
					
                }

                ResultLabel.findAllByDomainIdAndLabelTypeAndScope(resultPlate.id,
                                                                  ResultLabel.LabelType.RAW_DATA,
                                                                  ResultLabel.LabelScope.PLATE).each{
                    plate.rawData[it.name] = it.value
                }
                ResultLabel.findAllByDomainIdAndLabelTypeAndScope(resultPlate.id,
                                                                  ResultLabel.LabelType.NORMALIZED_DATA,
                                                                  ResultLabel.LabelScope.PLATE).each{
                    plate.normalizedData[it.name] = it.value
                }

                // generate the shape of the plate
				//If this is marked as "outlier" print something that won't 
				//end up in the data
                (0..resultPlate.rows-1).each{ rowIndex ->
                    plate.rows << [columns: []]
                    (0..resultPlate.columns-1).each{ columnIndex ->
                        plate.rows[rowIndex].columns << [
                            labels: [:],
                            rawData: [:],
                            normalizedData: [:],
                            control: Well.WellControl.EMPTY.toString().toUpperCase(),
							outlier: [:],
                        ]
                    }
                }

                // now fill it
                def resultWellsById = [:]
                ResultWell.findAllByPlate(resultPlate).each { well ->
                    resultWellsById[well.id] = well
                    plate.rows[well.well.row].columns[well.well.column].control = well.well.control.toString().toUpperCase()
                }
                ResultLabel.where { domainId in resultWellsById.keySet()
                                    scope == ResultLabel.LabelScope.WELL }.each { resultLabel ->
                    def resultWell = resultWellsById[resultLabel.domainId]
                    def wellOut = plate.rows[resultWell.well.row].columns[resultWell.well.column]
                    switch (resultLabel.labelType) {
                        case ResultLabel.LabelType.LABEL:
                            wellOut.labels[resultLabel.name] = resultLabel.value
                            break
                        case ResultLabel.LabelType.RAW_DATA:
                            wellOut.rawData[resultLabel.name] = resultLabel.value
							//Add this when raw data is processed
							wellOut.outlier = resultLabel.outlier
                            break
                        case ResultLabel.LabelType.NORMALIZED_DATA:
                            wellOut.normalizedData[resultLabel.name] = resultLabel.value
                            break
                    }
                }

                if (plateInstance) {
                    def wellsById = Well.findAllByPlate(plateInstance.plate)
                                        .collectEntries { well -> [well.id, well] }
                    DomainLabel.where { ((domainId in wellsById.keySet())
                                         && (labelType == DomainLabel.LabelType.WELL)) }.each { wellLabel ->
                        def well = wellsById[wellLabel.domainId]
                        plate.rows[well.row].columns[well.column].labels[wellLabel.label.category] = wellLabel.label.name
                    }
                }
                importData.plates << plate
            } // ResultPlate.each{}
        } // Result.each{}
    	return importData
    }

    def getKitchenSink(ExperimentalPlateSet experimentInstance){
		println("getKitchenSInk")
        if (!experimentInstance)
            return

        def experiment = [:]
        experiment.experimentID = experimentInstance.id
        experiment.plates = []

        def plateSetsByBarcode = PlateSet.findAllByExperiment(experimentInstance).collectEntries{plateSet -> [plateSet.barcode, plateSet]}

        def result = Result.findByExperiment(experimentInstance)
        def resultPlatesByBarcode = [:]
        if (result) {
            experiment.resultID = result.id
            resultPlatesByBarcode = ResultPlate.findAllByResult(result).collectEntries{resultPlate -> [resultPlate.barcode, resultPlate]}

            def resultExperimentLabels = ResultLabel.findAllByDomainIdAndLabelTypeAndScope(result.id, ResultLabel.LabelType.LABEL, ResultLabel.LabelScope.RESULT)
            def experimentFeatureLabels = resultExperimentLabels.collectEntries{resultExperimentLabel -> [resultExperimentLabel.name, resultExperimentLabel.value]}
            experiment.experimentFeatures = [labels: experimentFeatureLabels]
            experiment.parsingID = result.equipment.id
        }

        def allBarcodes = plateSetsByBarcode.keySet() + resultPlatesByBarcode.keySet()

        allBarcodes.each{ barcode ->
            def plate = [:]
            plate.plateID = barcode
            plate.rows = []

            // first the template and plate
            def plateSet = plateSetsByBarcode[barcode]
            if (plateSet) {
                plate.labels = [:]

                // plate labels
                def plateLabels = DomainLabel.findAllByDomainIdAndLabelTypeAndPlate(plateSet.plate.id, DomainLabel.LabelType.PLATE, plateSet)
                plate.labels << plateLabels.collectEntries {plateLabel -> [plateLabel.label.category, plateLabel.label.name]}

                // template labels
                def templateLabels = DomainLabel.findAllByDomainIdAndLabelTypeAndPlateIsNull(plateSet.plate.id, DomainLabel.LabelType.PLATE)
                plate.labels << templateLabels.collectEntries {templateLabel -> [templateLabel.label.category, templateLabel.label.name]}
                
                // go through some contortions because we didn't nail down the size of the plates ahead of time
                def wells = Well.findAllByPlate(plateSet.plate).sort {[it.row, it.column]}
                def numRows = wells[-1].row + 1
                def numColumns = wells[-1].column + 1
                def wellsByCoords = wells.collectEntries {well -> [[well.row, well.column], well]}

                // now find the well-level labels and results
                for (x in 0 .. numRows-1) {
                    plate.rows[x] = [columns: []]
                    for (y in 0 .. numColumns-1) {
                        plate.rows[x].columns[y] = [:]
                        def well = wellsByCoords[[x,y]]
                        if (well) {
                            plate.rows[x].columns[y] = [:]

			    // control or not?
			    plate.rows[x].columns[y].control = (well.control == Well.WellControl.EMPTY) ? null : well.control.toString()

                            // plate labels
                            def wellPlateLabels = DomainLabel.findAllByDomainIdAndLabelTypeAndPlate(well.id, DomainLabel.LabelType.WELL, plateSet)
                            plate.rows[x].columns[y].labels = wellPlateLabels.collectEntries {wellLabel -> [wellLabel.label.category, wellLabel.label.name]}

                            // template labels
                            def wellTemplateLabels = DomainLabel.findAllByDomainIdAndLabelTypeAndPlateIsNull(well.id, DomainLabel.LabelType.WELL)
                            plate.rows[x].columns[y].labels << wellTemplateLabels.collectEntries {wellLabel -> [wellLabel.label.category, wellLabel.label.name]}
                        }
                    }
                }
            }

            // now the results
            def resultPlate = resultPlatesByBarcode[barcode]
            if (resultPlate) {
                // plate-level results
                def plateResultLabels = ResultLabel.findAllByDomainIdAndLabelTypeAndScope(
                                            resultPlate.id,
                                            ResultLabel.LabelType.RAW_DATA,
                                            ResultLabel.LabelScope.PLATE)
                plate.rawData = plateResultLabels.collectEntries{plateResultLabel -> [plateResultLabel.name, plateResultLabel.value]}

                // well-level results
                def resultWells = ResultWell.findAllByPlate(resultPlate)
                def resultWellsByCoords = resultWells.collectEntries {resultWell -> [[resultWell.well.row, resultWell.well.column], resultWell]}
                for (x in 0 .. resultPlate.rows-1) {
                    if (!plate.rows[x]) {
                        plate.rows[x] = [columns: []]
                    }
                    for (y in 0 .. resultPlate.columns-1) {
                        if (!plate.rows[x].columns[y]) {
                            plate.rows[x].columns[y] = [:]
                        }
                        def resultWell = resultWellsByCoords[[x,y]]
                        if (resultWell) {
                            def resultLabels = ResultLabel.findAllByDomainIdAndLabelTypeAndScope(resultWell.id, ResultLabel.LabelType.LABEL, ResultLabel.LabelScope.WELL)
                            plate.rows[x].columns[y].labels << resultLabels.collectEntries {resultLabel -> [resultLabel.name, resultLabel.value]}

                            def rawDataLabels = ResultLabel.findAllByDomainIdAndLabelTypeAndScope(resultWell.id, ResultLabel.LabelType.RAW_DATA, ResultLabel.LabelScope.WELL)
                            plate.rows[x].columns[y].rawData = rawDataLabels.collectEntries {rawDataLabel -> [rawDataLabel.name, rawDataLabel.value]}

                            def normDataLabels = ResultLabel.findAllByDomainIdAndLabelTypeAndScope(resultWell.id, ResultLabel.LabelType.NORMALIZED_DATA, ResultLabel.LabelScope.WELL)
                            plate.rows[x].columns[y].normalizedData = normDataLabels.collectEntries {normDataLabel -> [normDataLabel.name, normDataLabel.value]}
                        }
                    }
                }
            }

            experiment.plates << plate
        }
        return experiment
    }
	
	def createRawResultFile(String fname, String fdata) {

		def rrfRoot = System.getenv("PLATIFY_RRF")
		if (!rrfRoot)
		   rrfRoot = Holders.grailsApplication.mainContext.servletContext.getRealPath('rrf')
//		def tmpFile = new File("/tmp/tmpout.debug")
//		tmpFile.text = "rrfRoot: " + rrfRoot + "\n"
//		tmpFile << "Raw Data: "
//		tmpFile << fdata

		File rrfRootDir = new File(rrfRoot)
		
		if (!rrfRootDir.exists()) {
		    rrfRootDir.mkdir()
//		    tmpFile << "Making rrf dir\n"
		}
		
		RawResultFile rrf = new RawResultFile()
		rrf.save(flush: true)
		def rrfId = rrf.id
		def destFolderPath = rrfRoot + "/" + rrfId
		File destDir = new File(destFolderPath)

//		tmpFile << "new file dir: "

//		tmpFile << destFolderPath + "\n"

		if (!destDir.exists()) {
//		    tmpFile << "Making ID dir: "
//		    tmpFile << destFolderPath + "\n"
		    destDir.mkdir()
		}

//		tmpFile << "New filename: " + fname + "\n"

		def destFile = new File(destDir, fname)
		destFile.text = fdata

//		tmpFile << "Wrote file data\n"
		rrf.fName = rrfId + "/" + fname
		rrf.save(flush: true)
		
		return rrf
	}
}
