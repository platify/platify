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


    	// for storing the objects
    	def platesList = []


    	data.plate?.each{ plate ->
    		// first create the plate
    		def plateInstance = new PlateTemplate(owner: scientistInstance, name: plate.name)
    		plateInstance.save()
    		// if it has errors, delete all the data just created and exit
    		if (plateInstance.hasErrors()){
    			throw new ValidationException("Plate is not valid", plateInstance.errors)
    		}
    		platesList << plateInstance
    		// for storing the created objects
	    	def labelsList = []
	    	def wellsLabelsList = []    		

    		// iterate throught the labels and create if it's a new one
    		plate.labels.each{ label ->
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

    		// link the plate to the labels
    		labelsList.each{ plateLabel ->
    			def plateLabelInstance = new DomainLabel(label: plateLabel, domainId: plateInstance.id, labelType: DomainLabel.LabelType.TEMPLATE)
    			plateLabelInstance.save()
    			if (plateLabelInstance.hasErrors()){
					throw new ValidationException("Plate Label is not valid", plateLabelInstance.errors)	
				}
    		}

    		// create the wells
    		plate.wells.each{ well ->
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

    	return platesList

    }

    def getTemplate(PlateTemplate plateTemplateInstance){
	
    	if (!plateTemplateInstance)
    		return
   		
   		def template = [:]

    	template.name = plateTemplateInstance.name
    	template.labels = []

    	def plateLabels = DomainLabel.findAllByDomainIdAndLabelType(plateTemplateInstance.id, DomainLabel.LabelType.TEMPLATE).collect{it.label}
    	plateLabels.each{ 
    		def label = [:]
    		label.category = it.category
    		label.name = it.name
    		label.value = it.value
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
	    	
	    	def wellLabels = DomainLabel.findAllByDomainIdAndLabelType(it.id, DomainLabel.LabelType.WELL).collect{it.label}
	    	wellLabels.each{ 
	    		def label = [:]
	    		label.category = it.category
	    		label.name = it.name
	    		label.value = it.value
	    		well.labels << label
	    	}  

	    	template.wells << well  		
    	}

    	return template

    }
}
	
