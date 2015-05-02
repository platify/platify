package edu.harvard.capstone.editor


import edu.harvard.capstone.user.Scientist
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.SpringSecurityUtils
import grails.converters.JSON

import spock.lang.*

/**
 *
 */
class ExperimentSpec extends Specification {

	def editorService
	def springSecurityService
	def parserService
	def resultService


	def plateTemplate
	def experiment
	def plateSet
	def equipment
	def result
	def normalizedData

    def setup() {

    }

    def cleanup() {
    }


	void "Create a correct workflow"() {
		when: "A new template is created"
			SpringSecurityUtils.doWithAuth('admin@gmail.com'){
				def data = JSON.parse("""
					{plate: {
						name: 'test name', 
						labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}],
						wells: [{row: '0', column: '0', 'groupName': 'name', labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}]}] 
						}
					}
				""")				
				plateTemplate = editorService.newTemplate(data)
			}
	   	then:
		   plateTemplate != null
		   !plateTemplate.hasErrors()
		   SpringSecurityUtils.doWithAuth('admin@gmail.com'){
		   	plateTemplate.owner.id == springSecurityService.principal.id
		   }

	   	when: "Retreive the list of my templates"
		   	def myTemplates
		   	SpringSecurityUtils.doWithAuth('admin@gmail.com'){
		   		def scientist = Scientist.get(springSecurityService.principal.id)
		      	myTemplates = PlateTemplate.findAllByOwner(scientist)
		  	}

	  	then: "I should get one template"
		  	myTemplates.size() == 1

		when: "A new experiment is created"
			SpringSecurityUtils.doWithAuth('admin@gmail.com'){			
				experiment = editorService.newExperiment("My experiment", "This is my description")
			}
	   	then:
		   experiment != null
		   !experiment.hasErrors()
		   SpringSecurityUtils.doWithAuth('admin@gmail.com'){
		   	experiment.owner.id == springSecurityService.principal.id
		   }
		
		when: "A new plate set is created"
			SpringSecurityUtils.doWithAuth('admin@gmail.com'){
				def plateData = JSON.parse("""
					{plate: {
						assay: 'my assay', 
						experimentID: ${experiment.id},
						templateID: ${plateTemplate.id},
						plateID: 'barcode',
						labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}],
						wells: [{row: 0, column: 0, labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}]}] 
						}
					}
				""")

				plateSet = editorService.newPlate(plateData)
			}
	   	then:
		   plateSet != null
		   !plateSet.hasErrors()
		
		when: "A new equipment is created"
			SpringSecurityUtils.doWithAuth('admin@gmail.com'){
				equipment = parserService.newEquipment("Test Equipment", "Machine Name", "Description", "This is the parsing data")
			}
	   	then:
		   equipment != null
		   !equipment.hasErrors()	


		
		when: "Result is parsed and stored"
			SpringSecurityUtils.doWithAuth('admin@gmail.com'){
				def data = JSON.parse("""
					{
						experimentID: '${experiment.id}', 
						parsingID: '${equipment.id}',
						plates: [{
							plateID: 'barcode',
							labels: {key: 'value'},
							rows: [ 
								{
									columns: [
										{
											labels: {key: 'value'}
										}
									]
								} 
							]
						}],
						experimentFeatures: {labels: {key: 'val', secondKey: 'second val'}}
					}
				""")
				result = resultService.newRawData(data)
			}
	   	then:
		   result != null
		   !result.hasErrors()


		
		when: "Store normalized data"
			SpringSecurityUtils.doWithAuth('admin@gmail.com'){
				def data = JSON.parse("""
					{
						experimentID: '${experiment.id}', 
						parsingID: '${equipment.id}',
						plates: [{
							plateID: 'barcode',
							labels: {key: 'value'},
							rows: [ 
								{
									columns: [
										{
											labels: {key: 'value'},
											normalizedData: {key: 'value'}
										}
									]
								} 
							]
						}],
						experimentFeatures: {labels: {key: 'val', secondKey: 'second val'}}
					}
				""")
				normalizedData = resultService.storeNormalizedData(result, data)
			}
	   	then:
		   normalizedData != null
		   !normalizedData.hasErrors()


	}


}
