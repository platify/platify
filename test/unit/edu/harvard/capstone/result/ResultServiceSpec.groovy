package edu.harvard.capstone.result

import grails.test.mixin.TestFor
import spock.lang.Specification


import edu.harvard.capstone.editor.ExperimentalPlateSet
import edu.harvard.capstone.editor.PlateSet
import edu.harvard.capstone.editor.Well
import edu.harvard.capstone.editor.PlateTemplate
import edu.harvard.capstone.parser.Equipment

import edu.harvard.capstone.user.Scientist

import grails.validation.ValidationException

import org.codehaus.groovy.grails.web.json.JSONObject
import grails.converters.JSON

/**
 * See the API for {@link grails.test.mixin.services.ServiceUnitTestMixin} for usage instructions
 */
@TestFor(ResultService)
@Mock([Scientist, Well, PlateTemplate, PlateSet, Result, ResultLabel, ResultWell, ResultPlate, Equipment, ExperimentalPlateSet])
class ResultServiceSpec extends Specification {

    def setup() {
    }

    def cleanup() {
    }

	void "Test Data object null"() {
		when: "Data object null"
			def resultInstance = service.newRawData(null)

		then:
			def ex = thrown(RuntimeException)
			ex.message.contains("Incorrect Data")			
			resultInstance == null
			ResultPlate.count() == 0
			ResultLabel.count() == 0
			ResultWell.count() == 0
			Result.count() == 0
	}
	
	void "Test wrong Data object param"() {
		when: "Data object incorrect"
			def data = JSON.parse("{plate: ''}")
			def resultInstance = service.newRawData(data)

		then:
			def ex = thrown(RuntimeException)
			ex.message.contains("Incorrect Data")			
			resultInstance == null
			ResultPlate.count() == 0
			ResultLabel.count() == 0
			ResultWell.count() == 0
			Result.count() == 0
	}
	
	void "Test missing parsing ID Data object param"() {
		when: "Data object incorrect"
			def data = JSON.parse("{experimentId: 'experiment'}")
			def resultInstance = service.newRawData(data)

		then:
			def ex = thrown(RuntimeException)
			ex.message.contains("Incorrect Data")			
			resultInstance == null
			ResultPlate.count() == 0
			ResultLabel.count() == 0
			ResultWell.count() == 0
			Result.count() == 0
	}	

	
	void "Test user not logged in"() {
		when: "Data object correct"
	    	// Fake springSecurityService - login as id 1
			service.springSecurityService = [principal: [id: null]]

			def data = JSON.parse("{experimentID: 'experiment', parsingID: 'parsing'}")
			def resultInstance = service.newRawData(data)

		then:
			def ex = thrown(RuntimeException)
			ex.message.contains("Scientist does not exist")			
			resultInstance == null
			ResultPlate.count() == 0
			ResultLabel.count() == 0
			ResultWell.count() == 0
			Result.count() == 0
	}	

	
	void "Test wrong user"() {
		when: "Data object correct"
	    	// Fake springSecurityService - login as id 1
			service.springSecurityService = [principal: [id: 1]]

			def data = JSON.parse("{experimentID: 'experiment', parsingID: 'parsing'}")
			def resultInstance = service.newRawData(data)

		then:
			def ex = thrown(RuntimeException)
			ex.message.contains("Scientist does not exist")				
			resultInstance == null
			ResultPlate.count() == 0
			ResultLabel.count() == 0
			ResultWell.count() == 0
			Result.count() == 0
	}	

	
	void "Test no experiment object"() {
		when: "Data object correct"

			Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
			scientistInstance.save()
			service.springSecurityService = [principal: [id: scientistInstance.id]]
			ExperimentalPlateSet experimentInstance = new ExperimentalPlateSet(owner: scientistInstance, name: "my experiment", description: "my description")
			experimentInstance.save()

			def data = JSON.parse("{experimentID: '${experimentInstance.id}', parsingID: 'parsing'}")
			def resultInstance = service.newRawData(data)

		then:
			def ex = thrown(RuntimeException)
			ex.message.contains("Either the equipment or the experiment does not exist")				
			resultInstance == null
			ResultPlate.count() == 0
			ResultLabel.count() == 0
			ResultWell.count() == 0
			Result.count() == 0
	}	

	
	void "Test no equipment object"() {
		when: "Data object correct"

			Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
			scientistInstance.save()
			service.springSecurityService = [principal: [id: scientistInstance.id]]
			Equipment equipmentInstance = new Equipment(name: "my equipment", machineName: "my machine name", description: "my description", config: "my config")
			equipmentInstance.save()


			def data = JSON.parse("{experimentID: 'experiment', parsingID: '${equipmentInstance.id}'}")
			def resultInstance = service.newRawData(data)

		then:
			def ex = thrown(RuntimeException)
			ex.message.contains("Either the equipment or the experiment does not exist")			
			resultInstance == null
			ResultPlate.count() == 0
			ResultLabel.count() == 0
			ResultWell.count() == 0
			Result.count() == 0
	}	

	
	void "Test no plates object"() {
		when: "Data object correct"

			Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
			scientistInstance.save()
			service.springSecurityService = [principal: [id: scientistInstance.id]]
			Equipment equipmentInstance = new Equipment(name: "my equipment", machineName: "my machine name", description: "my description", config: "my config")
			equipmentInstance.save()
			ExperimentalPlateSet experimentInstance = new ExperimentalPlateSet(owner: scientistInstance, name: "my experiment", description: "my description")
			experimentInstance.save()

			def data = JSON.parse("{experimentID: '${experimentInstance.id}', parsingID: '${equipmentInstance.id}'}")
			def resultInstance = service.newRawData(data)

		then:
			def ex = thrown(RuntimeException)
			ex.message.contains("No plates")			
			resultInstance == null
			ResultPlate.count() == 0
			ResultLabel.count() == 0
			ResultWell.count() == 0
			Result.count() == 0
	}			

	
	void "Test existing PlateSets but JSON data has different amount of plates"() {
		when: "Data object correct"

			Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
			scientistInstance.save()
			service.springSecurityService = [principal: [id: scientistInstance.id]]
			Equipment equipmentInstance = new Equipment(name: "my equipment", machineName: "my machine name", description: "my description", config: "my config")
			equipmentInstance.save()
			ExperimentalPlateSet experimentInstance = new ExperimentalPlateSet(owner: scientistInstance, name: "my experiment", description: "my description")
			experimentInstance.save()
			PlateTemplate templateInstance = new PlateTemplate(owner: scientistInstance, name: "my template")
			templateInstance.save()
			new PlateSet(plate: templateInstance, experiment: experimentInstance).save()

			def data = JSON.parse("{experimentID: '${experimentInstance.id}', parsingID: '${equipmentInstance.id}'}")
			def resultInstance = service.newRawData(data)

		then:
			def ex = thrown(RuntimeException)
			ex.message.contains("Plates of the JSON do not match with the template")					
			resultInstance == null
			ResultPlate.count() == 0
			ResultLabel.count() == 0
			ResultWell.count() == 0
			Result.count() == 0
	}

	
	void "Test incorrect experiment labels"() {
		when: "Data object correct"

			Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
			scientistInstance.save()
			service.springSecurityService = [principal: [id: scientistInstance.id]]
			Equipment equipmentInstance = new Equipment(name: "my equipment", machineName: "my machine name", description: "my description", config: "my config")
			equipmentInstance.save()
			ExperimentalPlateSet experimentInstance = new ExperimentalPlateSet(owner: scientistInstance, name: "my experiment", description: "my description")
			experimentInstance.save()
			PlateTemplate templateInstance = new PlateTemplate(owner: scientistInstance, name: "my template")
			templateInstance.save()
			new PlateSet(plate: templateInstance, experiment: experimentInstance).save()

			def data = JSON.parse("""
				{
					experimentID: '${experimentInstance.id}', 
					parsingID: '${equipmentInstance.id}',
					plates: [{firstPlate: 'true'}],
					experimentFeatures: {labels: {key: ''}}
				}
			""")
			def resultInstance = service.newRawData(data)

		then:
			def ex = thrown(ValidationException)
			ex.message.contains('Experiment label is not valid')		
			resultInstance == null
			ResultPlate.count() == 0
			ResultLabel.count() == 0
			ResultWell.count() == 0
			Result.count() == 0
	}

	
	void "Test incorrect plate labels"() {
		when: "Data object correct"

			Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
			scientistInstance.save()
			service.springSecurityService = [principal: [id: scientistInstance.id]]
			Equipment equipmentInstance = new Equipment(name: "my equipment", machineName: "my machine name", description: "my description", config: "my config")
			equipmentInstance.save()
			ExperimentalPlateSet experimentInstance = new ExperimentalPlateSet(owner: scientistInstance, name: "my experiment", description: "my description")
			experimentInstance.save()
			PlateTemplate templateInstance = new PlateTemplate(owner: scientistInstance, name: "my template")
			templateInstance.save()
			new PlateSet(plate: templateInstance, experiment: experimentInstance).save()

			def data = JSON.parse("""
				{
					experimentID: '${experimentInstance.id}', 
					parsingID: '${equipmentInstance.id}',
					plates: [{
						labels: {key: ''},
						firstPlate: 'true'
					}],
					experimentFeatures: {labels: {key: 'val', secondKey: 'second val'}}
				}
			""")
			def resultInstance = service.newRawData(data)

		then:
			def ex = thrown(ValidationException)
			ex.message.contains('Plate label is not valid')		
			resultInstance == null
			ResultPlate.count() == 0
			ResultLabel.count() == 0
			ResultWell.count() == 0
			Result.count() == 0
	}

	void "Test incorrect wells"() {
		when: "Data object correct"

			Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
			scientistInstance.save()
			service.springSecurityService = [principal: [id: scientistInstance.id]]
			Equipment equipmentInstance = new Equipment(name: "my equipment", machineName: "my machine name", description: "my description", config: "my config")
			equipmentInstance.save()
			ExperimentalPlateSet experimentInstance = new ExperimentalPlateSet(owner: scientistInstance, name: "my experiment", description: "my description")
			experimentInstance.save()
			PlateTemplate templateInstance = new PlateTemplate(owner: scientistInstance, name: "my template")
			templateInstance.save()
			new PlateSet(plate: templateInstance, experiment: experimentInstance).save()

			def data = JSON.parse("""
				{
					experimentID: '${experimentInstance.id}', 
					parsingID: '${equipmentInstance.id}',
					plates: [{
						labels: {key: 'value'},
						rows: [{columns: {key: 'val'}}]
					}],
					experimentFeatures: {labels: {key: 'val', secondKey: 'second val'}}
				}
			""")
			def resultInstance = service.newRawData(data)

		then:
			def ex = thrown(RuntimeException)
			ex.message.contains("Well does not exist")		
			resultInstance == null

	}	

	void "Test incorrect well labels"() {
		when: "Data object correct"

			Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
			scientistInstance.save()
			service.springSecurityService = [principal: [id: scientistInstance.id]]
			Equipment equipmentInstance = new Equipment(name: "my equipment", machineName: "my machine name", description: "my description", config: "my config")
			equipmentInstance.save()
			ExperimentalPlateSet experimentInstance = new ExperimentalPlateSet(owner: scientistInstance, name: "my experiment", description: "my description")
			experimentInstance.save()
			PlateTemplate templateInstance = new PlateTemplate(owner: scientistInstance, name: "my template")
			templateInstance.save()
			new PlateSet(plate: templateInstance, experiment: experimentInstance).save()
			new Well(plate: templateInstance, column: '0', row: '0', groupName: 'my group').save()


			def data = JSON.parse("""
				{
					experimentID: '${experimentInstance.id}', 
					parsingID: '${equipmentInstance.id}',
					plates: [{
						labels: {key: 'value'},
						rows: [ 
							{
								columns: [
									{
										labels: {key: ''}
									}
								]
							} 
						]
					}],
					experimentFeatures: {labels: {key: 'val', secondKey: 'second val'}}
				}
			""")
			def resultInstance = service.newRawData(data)

		then:
			def ex = thrown(ValidationException)
			ex.message.contains("Well label is not valid")
			resultInstance == null

	}

	void "Test everything working"() {
		when: "Data object correct"

			Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
			scientistInstance.save()
			service.springSecurityService = [principal: [id: scientistInstance.id]]
			Equipment equipmentInstance = new Equipment(name: "my equipment", machineName: "my machine name", description: "my description", config: "my config")
			equipmentInstance.save()
			ExperimentalPlateSet experimentInstance = new ExperimentalPlateSet(owner: scientistInstance, name: "my experiment", description: "my description")
			experimentInstance.save()
			PlateTemplate templateInstance = new PlateTemplate(owner: scientistInstance, name: "my template")
			templateInstance.save()
			new PlateSet(plate: templateInstance, experiment: experimentInstance).save()
			new Well(plate: templateInstance, column: '0', row: '0', groupName: 'my group').save()


			def data = JSON.parse("""
				{
					experimentID: '${experimentInstance.id}', 
					parsingID: '${equipmentInstance.id}',
					plates: [{
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
			def resultInstance = service.newRawData(data)

		then:
			notThrown ValidationException
			resultInstance != null
			ResultPlate.count() == 1
			ResultLabel.count() == 4
			ResultWell.count() == 1
			Result.count() == 1
	}			

}




