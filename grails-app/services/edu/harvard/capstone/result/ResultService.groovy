package edu.harvard.capstone.result


import edu.harvard.capstone.user.Scientist

import grails.converters.JSON

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

        // maybe check to make sure the plates we received are valid for this assay instead?
        /*
		//verify that the number of plates of the template are = to the result plates
		if (plateList.size() != data.plates?.size()){
			throw new RuntimeException("Plates of the JSON do not match with the template")
		}	
        */
		

        if (!resultInstance){
            throw new RuntimeException("A result set must be specified")
        }


		// create the result plates
		data.plates.eachWithIndex{ dataPlate, plateIndex ->

			def plateInstance = ResultPlate.findByResultAndBarcode(resultInstance, dataPlate.plateID)
			
    		// well level
    		dataPlate.rows.eachWithIndex{ row, rowIndex ->
    			row.columns.eachWithIndex{ wellInstance, columnIndex ->
    				//for each well

		    		def wellResultInstance = ResultWell.withCriteria {
		    			well {
	    					eq('row', rowIndex)
	    					eq('column', columnIndex)
	    					eq('plate', PlateSet.findByBarcodeAndExperiment(dataPlate.plateID, experimentInstance)?.plate)
	    				}
	    				eq('plate', plateInstance)
		    		}			

		    		// nomalized data
		    		wellInstance.normalizedData?.each{ key, value ->
		    			def normalizedData = new ResultLabel(name: key, value: value, labelType: ResultLabel.LabelType.NORMALIZED_DATA, scope: ResultLabel.LabelScope.WELL, domainId: wellResultInstance.id)
		    			normalizedData.save()
		    			if (normalizedData.hasErrors()){
			    			throw new ValidationException("Normalized Data is not valid", normalizedData.errors)
			    		}		    			
		    		}		    		

    			}
    		}

            // plate level
            dataPlate.rawData?.each { key, value ->
                def resultData = new ResultLabel(name: key,
                                                 value: value,
                                                 labelType: ResultLabel.LabelType.RAW_DATA,
                                                 scope: ResultLabel.LabelScope.PLATE,
                                                 domainId: plateInstance.id)
                resultData.save()
                if (resultData.hasErrors()) {
                    throw new ValidationException('Plate-level raw data is not valid',
                                                  resultData.errors)
                }
            }
		}

    	return resultInstance
    }    

    def getResults(Result resultInstance) {

    	if (!resultInstance)
    		return

    	def importData = [:]

        importData.resultID = resultInstance.id
    	importData.experimentID = resultInstance.experiment.id
    	importData.parsingID = resultInstance.equipment.id
    	importData.experimentFeatures = [:]
    	def experimentLabels = [:]
    	ResultLabel.findAllByDomainIdAndLabelTypeAndScope(resultInstance.id, ResultLabel.LabelType.LABEL, ResultLabel.LabelScope.RESULT).each{
    		experimentLabels[it.name] = it.value
    	}

    	importData.experimentFeatures.labels = experimentLabels
    	importData.plates = []

    	ResultPlate.findAllByResult(resultInstance).each{ plateResult ->
    		def plate = [:]
		plate.plateID = plateResult.barcode
    		def plateLabels = [:]
    		ResultLabel.findAllByDomainIdAndLabelTypeAndScope(plateResult.id, ResultLabel.LabelType.LABEL, ResultLabel.LabelScope.PLATE).each{
    			plateLabels[it.name] = it.value
    		}
    		plate.labels = plateLabels
    		def numberOfRows = plateResult.rows


    		plate.rows = []

    		def numberOfColumns = plateResult.columns

    		(0..numberOfRows-1).each{ rowIndex ->
    			def row = [:]
    			row.columns = []
    			(0..numberOfColumns-1).each{ columnIndex ->
    				def wellInstance = [:]
    				wellInstance.labels = [:]
	
		    		def wellResult = ResultWell.withCriteria{
		    			well{
		    				eq("row", rowIndex)
		    				eq("column", columnIndex)
		    			}
		    			eq('plate', plateResult)		    			
		    		}
				// TODO - why the hell is control an array?
				wellInstance.control = wellResult.well.control[0].toString()

		    		def wellLabels = [:]
		    		        
		    		ResultLabel.findAllByDomainIdAndLabelTypeAndScope(wellResult.id, ResultLabel.LabelType.LABEL, ResultLabel.LabelScope.WELL)?.each{
		    			wellLabels[it.name] = it.value
		    		}
		    		wellInstance.labels = wellLabels


		    		def rawData = [:]
		    		        
		    		ResultLabel.findAllByDomainIdAndLabelTypeAndScope(wellResult.id, ResultLabel.LabelType.RAW_DATA, ResultLabel.LabelScope.WELL)?.each{
		    			rawData[it.name] = it.value
		    		}
		    		wellInstance.rawData = rawData


		    		def normalizedData = [:]
		    		        
		    		ResultLabel.findAllByDomainIdAndLabelTypeAndScope(wellResult.id, ResultLabel.LabelType.NORMALIZED_DATA, ResultLabel.LabelScope.WELL)?.each{
		    			normalizedData[it.name] = it.value
		    		}
		    		wellInstance.normalizedData = normalizedData


    				row.columns << wellInstance
    			}
    			plate.rows << row
    		}

    		importData.plates << plate
    	}

    	return importData
    }


    def getKitchenSink(ExperimentalPlateSet experimentInstance){
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
}
