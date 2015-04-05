package edu.harvard.capstone.editor

import edu.harvard.capstone.user.Scientist

import grails.converters.JSON

import org.codehaus.groovy.grails.web.json.JSONObject
import grails.validation.ValidationException

import grails.transaction.Transactional

@Transactional
class EditorService {

	def springSecurityService

	/**
	*	Throws ValidationException if can't create a domain object
	*/
    def newTemplate(JSONObject data) {
    	//if no data of the template return, 
    	if (!data || !data.plate)
    		return

    	// get the scientist to attach it as an owner of the plate template
    	def scientistInstance = Scientist.get(springSecurityService.principal.id)
    	if (!scientistInstance)
    		return

		// first create the plate
		def plateInstance = new PlateTemplate(owner: scientistInstance, name: data.plate.name)
		plateInstance.save()
		// if it has errors, delete all the data just created and exit
		if (plateInstance.hasErrors()){
			throw new ValidationException("Plate is not valid", plateInstance.errors)
		}

		// for storing the created objects
    	def labelsList = []
    	def wellsLabelsList = []    		

		// iterate throught the labels and create if it's a new one
		data.plate.labels.each{ label ->
			if (label){
				def labelInstance = Label.get(label.id)
				if (!labelInstance){
					labelInstance = new Label(category: label.category, name: label.name, value: label.value)
					labelInstance.save()
					if (labelInstance.hasErrors()){
						throw new ValidationException("Label for plate is not valid", labelInstance.errors)	
					}
				}
				// add it to the labels that will be assigned to the plate
				labelsList << labelInstance
			}
		}

		// link the plate to the labels
		labelsList.each{ plateLabel ->
			def plateLabelInstance = new DomainLabel(label: plateLabel, domainId: plateInstance.id, labelType: DomainLabel.LabelType.PLATE)
			plateLabelInstance.save()
			if (plateLabelInstance.hasErrors()){
				throw new ValidationException("Plate Label is not valid", plateLabelInstance.errors)	
			}
		}

		// create the wells
		data.plate.wells.each{ well ->
			if (well){
				def controlType
				if (well.control && well.control.toLowerCase().contains("positive"))
					controlType = Well.WellControl.POSITIVE
				else if (well.control && well.control.toLowerCase().contains("negative"))
					controlType = Well.WellControl.NEGATIVE
				else
					controlType = Well.WellControl.EMPTY
				
				def wellInstance = new Well(plate: plateInstance, row: well.row, column: well.column, groupName: well.groupName, control: controlType)
				wellInstance.save()
				if (wellInstance.hasErrors()){
					throw new ValidationException("Well is not valid", wellInstance.errors)	
				}

	    		// iterate throught the labels and create if it's a new one
	    		well.labels.each{ label ->
	    			def labelInstance = Label.get(label.id)
	    			if (!labelInstance){
	    				labelInstance = new Label(category: label.category, name: label.name, value: label.value)
	    				labelInstance.save()
	    				if (labelInstance.hasErrors()){
	    					throw new ValidationException("Label for well is not valid", labelInstance.errors)	
	    				}
	    			}
	    			// add it to the labels that will be assigned to the well
					wellsLabelsList << labelInstance
	    		}

	    		// link the well to the labels
	    		wellsLabelsList.each{ wellLabel ->
	    			def wellLabelInstance = new DomainLabel(label: wellLabel, domainId: wellInstance.id, labelType: DomainLabel.LabelType.WELL)
	    			wellLabelInstance.save()
	    			if (wellLabelInstance.hasErrors()){
						throw new ValidationException("Well Label is not valid", wellLabelInstance.errors)	
					}
	    		}				
			}
		}

    	return plateInstance

    }

    def getTemplate(PlateTemplate plateTemplateInstance){
	
    	if (!plateTemplateInstance)
    		return
   		
   		def template = [:]

    	template.name = plateTemplateInstance.name
    	template.labels = []

    	def plateLabels = DomainLabel.findAllByDomainIdAndLabelTypeAndPlateIsNull(plateTemplateInstance.id, DomainLabel.LabelType.PLATE).collect{it.label}
    	plateLabels.each{ 
    		def label = [:]
    		label.category = it.category
    		label.name = it.name
    		label.value = it.value
    		label.id = it.id    	    
    		template.labels << label
    	}

    	template.wells = []

    	def wells = Well.findAllByPlate(plateTemplateInstance)
    	wells.each{
    		def well = [:]
    		well.row = it.row
    		well.column = it.column
    		well.groupName = it.groupName
    		well.control = it.control
    		well.labels = []
	    	
	    	def wellLabels = DomainLabel.findAllByDomainIdAndLabelTypeAndPlateIsNull(it.id, DomainLabel.LabelType.WELL).collect{it.label}
	    	wellLabels.each{ 
	    		def label = [:]
	    		label.category = it.category
	    		label.name = it.name
	    		label.value = it.value
	    		label.id = it.id
	    		well.labels << label
	    	}  

	    	template.wells << well  		
    	}

    	return template

    }


	/**
	*	Throws ValidationException if can't create a domain object
	*/
    def newPlate(JSONObject data) {
    	//if no data of the template return, 
    	if (!data || !data.plate)
    		return

		// first get the data of the Template and Experiment
		def templateInstance = PlateTemplate.get(data.plate.templateID)
		if(!templateInstance){
			throw new RuntimeException("A valid template ID is missing")
		}
		def experimentInstance = ExperimentalPlateSet.get(data.plate.experimentID)
		if(!experimentInstance){
			throw new RuntimeException("A valid experiment ID is missing")
		}

		def plateInstance = new PlateSet(plate: templateInstance, experiment: experimentInstance, assay: data.plate.assay, barcode: data.plate.plateID)
		plateInstance.save()
		// if it has errors, delete all the data just created and exit
		if (plateInstance.hasErrors()){
			throw new ValidationException("Plate is not valid", plateInstance.errors)
		}

		// for storing the created objects
    	def labelsList = []
    	def wellsLabelsList = []    		

		// iterate throught the labels and create if it's a new one
		data.plate.labels.each{ label ->
			if (label){
				def labelInstance = Label.get(label.id)
				if (!labelInstance){
					labelInstance = new Label(category: label.category, name: label.name, value: label.value)
					labelInstance.save()
					if (labelInstance.hasErrors()){
						throw new ValidationException("Label for plate is not valid", labelInstance.errors)	
					}
				}
				// add it to the labels that will be assigned to the plate
				labelsList << labelInstance
			}
		}

		// link the plate to the labels
		labelsList.each{ plateLabel ->
			def plateLabelInstance = new DomainLabel(label: plateLabel, domainId: plateInstance.id, labelType: DomainLabel.LabelType.PLATE, plate: plateInstance)
			plateLabelInstance.save()
			if (plateLabelInstance.hasErrors()){
				throw new ValidationException("Plate Label is not valid", plateLabelInstance.errors)	
			}
		}

		// create the wells
		data.plate.wells.each{ well ->
			if (well){
				def wellInstance = Well.findByPlateAndRowAndColumn(templateInstance, well.row, well.column)
				if (!wellInstance){
					throw new RuntimeException("Well is not valid")	
				}

	    		// iterate throught the labels and create if it's a new one
	    		well.labels.each{ label ->
	    			def labelInstance = Label.get(label.id)
	    			if (!labelInstance){
	    				labelInstance = new Label(category: label.category, name: label.name, value: label.value)
	    				labelInstance.save()
	    				if (labelInstance.hasErrors()){
	    					throw new ValidationException("Label for well is not valid", labelInstance.errors)	
	    				}
	    			}
	    			// add it to the labels that will be assigned to the well
					wellsLabelsList << labelInstance
	    		}

	    		// link the well to the labels
	    		wellsLabelsList.each{ wellLabel ->
	    			def wellLabelInstance = new DomainLabel(label: wellLabel, domainId: wellInstance.id, labelType: DomainLabel.LabelType.WELL, plate: plateInstance)
	    			wellLabelInstance.save()
	    			if (wellLabelInstance.hasErrors()){
						throw new ValidationException("Well Label is not valid", wellLabelInstance.errors)	
					}
	    		}				
			}
		}

    	return plateInstance
    }    

    def getPlate(PlateSet plateInstance){
	
    	if (!plateInstance)
    		return
   		
   		def plate = [:]

    	plate.assay = plateInstance.assay
    	plate.experimentID = plateInstance.experiment.id
    	plate.templateID = plateInstance.plate.id
    	plate.plateID = plateInstance.barcode

    	plate.labels = []

    	def plateLabels = DomainLabel.findAllByDomainIdAndLabelTypeAndPlate(plateInstance.plate.id, DomainLabel.LabelType.PLATE, plateInstance).collect{it.label}
    	plateLabels.each{ 
    		def label = [:]
    		label.category = it.category
    		label.name = it.name
    		label.value = it.value
    		label.id = it.id
    		plate.labels << label
    	}

    	plate.wells = []

    	def wells = Well.findAllByPlate(plateInstance.plate)
    	wells.each{
    		def well = [:]
    		well.row = it.row
    		well.column = it.column
    		well.groupName = it.groupName
    		well.control = it.control
    		well.labels = []
	    	
	    	def wellLabels = DomainLabel.findAllByDomainIdAndLabelTypeAndPlate(it.id, DomainLabel.LabelType.WELL, plateInstance).collect{it.label}
	    	wellLabels.each{ 
	    		def label = [:]
	    		label.category = it.category
	    		label.name = it.name
	    		label.value = it.value
    			label.id = it.id	    		
	    		well.labels << label
	    	}  

	    	plate.wells << well  		
    	}

    	return plate

    }
}
	
