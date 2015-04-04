package edu.harvard.capstone.result


import edu.harvard.capstone.user.Scientist

import grails.converters.JSON

import org.codehaus.groovy.grails.web.json.JSONObject
import grails.validation.ValidationException

import grails.transaction.Transactional

import edu.harvard.capstone.editor.ExperimentalPlateSet
import edu.harvard.capstone.editor.PlateSet
import edu.harvard.capstone.editor.Well
import edu.harvard.capstone.editor.PlateTemplate
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
		if (plateList.size() != data.plates?.size()){
			throw new RuntimeException("Plates of the JSON do not match with the template")
		}	

    	//create a result instance
		def resultInstance = new Result(owner: scientistInstance, equipment: equipmentInstance, experiment: experimentInstance)    	
		resultInstance.save()

		if (resultInstance.hasErrors()){
			throw new ValidationException("Result is not valid", resultInstance.errors)
		}		
		
		// create the experiment labels
		data.experimentFeatures.labels.each{ key, value ->
			def resultLabelInstance = new ResultLabel(name: key, value: value, labelType: ResultLabel.LabelType.RESULT, domainId: resultInstance.id)
			resultLabelInstance.save()
			if (resultLabelInstance.hasErrors()){
    			throw new ValidationException("Experiment label is not valid", resultLabelInstance.errors)
    		}
		}

		// create the result plates
		data.plates.eachWithIndex{ plate, plateIndex ->
			def plateInstance = new ResultPlate(result: resultInstance)
			plateInstance.save()
			if (plateInstance.hasErrors()){
    			throw new ValidationException("Plate is not valid", plateInstance.errors)
    		}

    		// create the plate labels
    		plate.labels.each{ key, value ->
    			def plateLabelInstance = new ResultLabel(name: key, value: value, labelType: ResultLabel.LabelType.PLATE, domainId: plateInstance.id)
    			plateLabelInstance.save()
    			if (plateLabelInstance.hasErrors()){
	    			throw new ValidationException("Plate label is not valid", plateLabelInstance.errors)
	    		}
    		}

    		plate.rows.eachWithIndex{ row, rowIndex ->
    			row.columns.eachWithIndex{ well, columnIndex ->
    				//for each well
    				def wellInstance = Well.findAllByPlateAndRowAndColumn(plateList[plateIndex], rowIndex, columnIndex)
    				if (!wellInstance){
						throw new RuntimeException("Well does not exist")
					}

		    		def wellResultInstance = new ResultWell(plate: plateInstance, well: wellInstance)				
		    		wellResultInstance.save()

	    			if (wellResultInstance.hasErrors()){
		    			throw new ValidationException("Well instance is not valid", wellResultInstance.errors)
		    		}
		    		well.labels.each{ key, value ->
		    			def wellLabelInstance = new ResultLabel(name: key, value: value, labelType: ResultLabel.LabelType.WELL, domainId: wellResultInstance.id)
		    			wellLabelInstance.save()
		    			if (wellLabelInstance.hasErrors()){
			    			throw new ValidationException("Well label is not valid", wellLabelInstance.errors)
			    		}		    			
		    		}		    		
    			}
    		}
		}


    	return resultInstance

    }

}
