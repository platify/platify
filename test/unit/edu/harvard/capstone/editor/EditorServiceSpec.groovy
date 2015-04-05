package edu.harvard.capstone.editor

import grails.test.mixin.TestFor
import spock.lang.Specification

import edu.harvard.capstone.user.Scientist

import org.codehaus.groovy.grails.web.json.JSONObject
import grails.converters.JSON

import grails.validation.ValidationException

/**
 * See the API for {@link grails.test.mixin.services.ServiceUnitTestMixin} for usage instructions
 */
@TestFor(EditorService)
@Mock([Scientist, Well, PlateTemplate, Label, DomainLabel, ExperimentalPlateSet, PlateSet])
class EditorServiceSpec extends Specification {

    def setup() {
    }

    def cleanup() {
    }


    void "Test experiment creation user missing"(){
    	when: "Incorrect data"
    		service.springSecurityService = [principal: [id: null]]
    		def experiment = service.newExperiment("name", "description")
    	then:
    		experiment == null
    		ExperimentalPlateSet.count() == 0
    }

    void "Test experiment creation incorrect params"(){
    	when: "Incorrect data"
	    	Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
			scientistInstance.save()
			service.springSecurityService = [principal: [id: scientistInstance.id]]
    		def experiment = service.newExperiment("", "description")
    	then:
    		experiment.hasErrors()
    		
    }    

    void "Test experiment creation correct params"(){
    	when: "Correct data"
	    	Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
			scientistInstance.save()
			service.springSecurityService = [principal: [id: scientistInstance.id]]
    		def experiment = service.newExperiment("name", "description")
    	then:
    		experiment != null
    		ExperimentalPlateSet.count() == 1
    }        
    /* Template level tests */

	void "Test wrong Data object"() {
		when: "Data object null"
		def plateTemplate = service.newTemplate(null)

		then:
		plateTemplate == null
		PlateTemplate.count() == 0
	}
	
	void "Test wrong Data object param"() {
		when: "Data object null"
		def data = JSON.parse("{plate: ''}")
		def plateTemplate = service.newTemplate(data)

		then:
		plateTemplate == null
		PlateTemplate.count() == 0
	}

	
	void "Test wrong User"() {
		when: "No user logged in"
    	// Fake springSecurityService - login as id 1
		service.springSecurityService = [principal: [id: null]]

		def data = JSON.parse("{plate: 'test'}")
		def plateTemplate = service.newTemplate(data)

		then:
		plateTemplate == null
		PlateTemplate.count() == 0
	}	

	void "Test wrong PlateTeamplate creation"() {
		when: "User logged in"
    	// Fake springSecurityService - login as id 1
		Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
		scientistInstance.save()
		service.springSecurityService = [principal: [id: scientistInstance.id]]


		def data = JSON.parse("{plate: {key: 'val',key: 'val'} }")
		def plateTemplate = service.newTemplate(data)

		then:
			def ex = thrown(ValidationException)
			ex.message.contains('Plate is not valid')
			plateTemplate == null
			PlateTemplate.count() == 0
	}

	void "Test wrong Label creation"() {
		when: "No name for label"
    	// Fake springSecurityService - login as id 1
		Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
		scientistInstance.save()
		service.springSecurityService = [principal: [id: scientistInstance.id]]


		def data = JSON.parse("""
			{plate: {name: 'test name', labels: [{key: 'val'}] }
			}
		""")
		def plateTemplate = service.newTemplate(data)

		then:
			def ex = thrown(ValidationException)
			ex.message.contains('Label for plate is not valid')
			plateTemplate == null
			PlateTemplate.count() == 0
			Label.count() == 0
	}	

	void "Test wrong well creation"() {
		when: "Wrong well parameters"
    	// Fake springSecurityService - login as id 1
		Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
		scientistInstance.save()
		service.springSecurityService = [principal: [id: scientistInstance.id]]


		def data = JSON.parse("""
			{plate: 
				{name: 'test name', 
				labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}],
				wells: [{key: 'key', val: 'val'}] 
				}
			}
		""")
		def plateTemplate = service.newTemplate(data)

		then:
			def ex = thrown(ValidationException)
			ex.message.contains('Well is not valid')
			plateTemplate == null
			PlateTemplate.count() == 0
			Label.count() == 0
			Well.count() == 0
	}

	void "Test wrong well label creation"() {
		when: "Wrong Label parameters"
    	// Fake springSecurityService - login as id 1
		Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
		scientistInstance.save()
		service.springSecurityService = [principal: [id: scientistInstance.id]]


		def data = JSON.parse("""
			{plate: 
				{name: 'test name', 
				labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}],
				wells: [{row: '0', column: '0', 'groupName': 'name', labels: [{key: 'val'}]}] 
				}
			}
		""")

		def plateTemplate = service.newTemplate(data)

		then:
			def ex = thrown(ValidationException)
			ex.message.contains('Label for well is not valid')
			plateTemplate == null
			PlateTemplate.count() == 0
			Label.count() == 0
			Well.count() == 0
	}

	void "Test correct creation"() {
		when: "Correct parameters"
    	// Fake springSecurityService - login as id 1
		Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
		scientistInstance.save()
		service.springSecurityService = [principal: [id: scientistInstance.id]]


		def data = JSON.parse("""
			{plate: {
				name: 'test name', 
				labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}],
				wells: [{row: '0', column: '0', 'groupName': 'name', labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}]}] 
				}
			}
		""")

		def plateTemplate = service.newTemplate(data)

		then:
			notThrown ValidationException
			plateTemplate != null
			PlateTemplate.count() == 1
			Label.count() == 4
			Well.count() == 1
	}

	
	void "Test getting a template with an incorrect template"() {
		when: "No user logged in"

		def plateTemplate = service.getTemplate(null)

		then:
		plateTemplate == null
	}	

	void "Test getting a template"() {
		when: "Correct parameters"
    	// Fake springSecurityService - login as id 1
		Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
		scientistInstance.save()
		service.springSecurityService = [principal: [id: scientistInstance.id]]


		def data = JSON.parse("""
			{
				plate: {
					name: 'test name', 
					labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}],
					wells: [{row: 0, column: 0, 'groupName': 'name', labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}]}] 
				}
			}
		""")

		def plateTemplate = service.newTemplate(data)
		def plate = service.getTemplate(plateTemplate)

		then:
			notThrown ValidationException
			plateTemplate != null
			PlateTemplate.count() == 1
			Label.count() == 4
			Well.count() == 1
			data.plate.name == plate.name
			data.plate.labels.size() == plate.labels.size()
			data.plate.wells[0].row == plate.wells[0].row
			data.plate.wells[0].column == plate.wells[0].column
			data.plate.wells[0].groupName == plate.wells[0].groupName
			data.plate.wells[0].labels.size() == plate.wells[0].labels.size()
	}	


	/* Plate level tests */
	void "Test correct creation of a plate"() {
		when: "Correct parameters"
    	// Fake springSecurityService - login as id 1
		Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
		scientistInstance.save()
		service.springSecurityService = [principal: [id: scientistInstance.id]]


		def data = JSON.parse("""
			{plate: {
				name: 'test name', 
				labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}],
				wells: [{row: '0', column: '0', 'groupName': 'name', labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}]}] 
				}
			}
		""")

		def plateTemplate = service.newTemplate(data)

		def experiment = new ExperimentalPlateSet(name: "test", description: "description", owner: scientistInstance)
		experiment.save()


		def plateData = JSON.parse("""
			{plate: {
				assay: 'my assay', 
				experimentID: ${experiment.id},
				templateID: ${plateTemplate.id},
				plateID: 'barcode',
				labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}],
				wells: [{row: '0', column: '0', labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}]}] 
				}
			}
		""")

		def plateInstance = service.newPlate(plateData)


		then:
			notThrown ValidationException
			plateTemplate != null
			plateInstance != null
			PlateTemplate.count() == 1
			Label.count() == 8
			Well.count() == 1
			PlateSet.count() == 1
	}


	void "Test incorrect creation of a plate, template missing"() {
		when: "Incorrect parameters"
    	// Fake springSecurityService - login as id 1
		Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
		scientistInstance.save()
		service.springSecurityService = [principal: [id: scientistInstance.id]]


		def data = JSON.parse("""
			{plate: {
				name: 'test name', 
				labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}],
				wells: [{row: '0', column: '0', 'groupName': 'name', labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}]}] 
				}
			}
		""")

		def plateTemplate = service.newTemplate(data)

		def experiment = new ExperimentalPlateSet(name: "test", description: "description", owner: scientistInstance)
		experiment.save()


		def plateData = JSON.parse("""
			{plate: {
				assay: 'my assay', 
				experimentID: ${experiment.id},
				plateID: 'barcode',
				labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}],
				wells: [{row: '0', column: '0', labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}]}] 
				}
			}
		""")

		def plateInstance = service.newPlate(plateData)


		then:
			def ex = thrown(RuntimeException)
			ex.message.contains('A valid template ID is missing')
			plateInstance == null
			PlateSet.count() == 0		
	}

	void "Test incorrect creation of a plate, experiment missing"() {
		when: "Incorrect parameters"
    	// Fake springSecurityService - login as id 1
		Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
		scientistInstance.save()
		service.springSecurityService = [principal: [id: scientistInstance.id]]


		def data = JSON.parse("""
			{plate: {
				name: 'test name', 
				labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}],
				wells: [{row: '0', column: '0', 'groupName': 'name', labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}]}] 
				}
			}
		""")

		def plateTemplate = service.newTemplate(data)

		def experiment = new ExperimentalPlateSet(name: "test", description: "description", owner: scientistInstance)
		experiment.save()


		def plateData = JSON.parse("""
			{plate: {
				assay: 'my assay', 
				templateID: ${plateTemplate.id},
				plateID: 'barcode',
				labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}],
				wells: [{row: '0', column: '0', labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}]}] 
				}
			}
		""")

		def plateInstance = service.newPlate(plateData)

		then:
			def ex = thrown(RuntimeException)
			ex.message.contains('A valid experiment ID is missing')
			plateInstance == null
			PlateSet.count() == 0	
	}
	
	void "Test incorrect creation of a plate, barcode missing"() {
		when: "Incorrect parameters"
    	// Fake springSecurityService - login as id 1
		Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
		scientistInstance.save()
		service.springSecurityService = [principal: [id: scientistInstance.id]]


		def data = JSON.parse("""
			{plate: {
				name: 'test name', 
				labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}],
				wells: [{row: '0', column: '0', 'groupName': 'name', labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}]}] 
				}
			}
		""")

		def plateTemplate = service.newTemplate(data)

		def experiment = new ExperimentalPlateSet(name: "test", description: "description", owner: scientistInstance)
		experiment.save()


		def plateData = JSON.parse("""
			{plate: {
				assay: 'my assay', 
				experimentID: ${experiment.id},
				templateID: ${plateTemplate.id},
				labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}],
				wells: [{row: '0', column: '0', labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}]}] 
				}
			}
		""")

		def plateInstance = service.newPlate(plateData)

		then:
			def ex = thrown(ValidationException)
			ex.message.contains('Plate is not valid')
			plateInstance == null
			PlateSet.count() == 0
	}

	void "Test incorrect creation of a plate, incorrect plate labels"() {
		when: "Incorrect parameters"
    	// Fake springSecurityService - login as id 1
		Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
		scientistInstance.save()
		service.springSecurityService = [principal: [id: scientistInstance.id]]


		def data = JSON.parse("""
			{plate: {
				name: 'test name', 
				labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}],
				wells: [{row: '0', column: '0', 'groupName': 'name', labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}]}] 
				}
			}
		""")

		def plateTemplate = service.newTemplate(data)

		def experiment = new ExperimentalPlateSet(name: "test", description: "description", owner: scientistInstance)
		experiment.save()


		def plateData = JSON.parse("""
			{plate: {
				assay: 'my assay', 
				experimentID: ${experiment.id},
				templateID: ${plateTemplate.id},
				plateID: 'barcode',
				labels: [{value: 'val'}, {category: 'val', name: 'val', value: 'val'}],
				wells: [{row: '0', column: '0', labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}]}] 
				}
			}
		""")

		def plateInstance = service.newPlate(plateData)

		then:
			def ex = thrown(ValidationException)
			ex.message.contains('Label for plate is not valid')
			plateInstance == null
			PlateSet.count() == 0
	}


	void "Test incorrect creation of a plate, plate size does not match template size"() {
		when: "Incorrect parameters"
    	// Fake springSecurityService - login as id 1
		Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
		scientistInstance.save()
		service.springSecurityService = [principal: [id: scientistInstance.id]]


		def data = JSON.parse("""
			{plate: {
				name: 'test name', 
				labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}],
				wells: [{row: '0', column: '0', 'groupName': 'name', labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}]}] 
				}
			}
		""")

		def plateTemplate = service.newTemplate(data)

		def experiment = new ExperimentalPlateSet(name: "test", description: "description", owner: scientistInstance)
		experiment.save()


		def plateData = JSON.parse("""
			{plate: {
				assay: 'my assay', 
				experimentID: ${experiment.id},
				templateID: ${plateTemplate.id},
				plateID: 'barcode',
				labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}],
				wells: [{row: '1', column: '1', labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}]}] 
				}
			}
		""")

		def plateInstance = service.newPlate(plateData)

		then:
			def ex = thrown(RuntimeException)
			ex.message.contains('Well is not valid')
			plateInstance == null
	}

	void "Test incorrect creation of a plate, plate size does not match template size"() {
		when: "Incorrect parameters"
    	// Fake springSecurityService - login as id 1
		Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
		scientistInstance.save()
		service.springSecurityService = [principal: [id: scientistInstance.id]]


		def data = JSON.parse("""
			{plate: {
				name: 'test name', 
				labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}],
				wells: [{row: '0', column: '0', 'groupName': 'name', labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}]}] 
				}
			}
		""")

		def plateTemplate = service.newTemplate(data)

		def experiment = new ExperimentalPlateSet(name: "test", description: "description", owner: scientistInstance)
		experiment.save()


		def plateData = JSON.parse("""
			{plate: {
				assay: 'my assay', 
				experimentID: ${experiment.id},
				templateID: ${plateTemplate.id},
				plateID: 'barcode',
				labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}],
				wells: [{row: '0', column: '0', labels: [{value: 'val'}, {category: 'val', name: 'val', value: 'val'}]}] 
				}
			}
		""")

		def plateInstance = service.newPlate(plateData)

		then:
			def ex = thrown(ValidationException)
			ex.message.contains('Label for well is not valid')
			plateInstance == null
	}	


	void "Test getting a plate with an incorrect plate"() {
		when: "No user logged in"

		def plateTemplate = service.getPlate(null)

		then:
		plateTemplate == null
	}	

	void "Test getting a plate"() {
		when: "Correct parameters"
    	Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
		scientistInstance.save()
		service.springSecurityService = [principal: [id: scientistInstance.id]]


		def data = JSON.parse("""
			{plate: {
				name: 'test name', 
				labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}],
				wells: [{row: '0', column: '0', 'groupName': 'name', labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}]}] 
				}
			}
		""")

		def plateTemplate = service.newTemplate(data)

		def experiment = new ExperimentalPlateSet(name: "test", description: "description", owner: scientistInstance)
		experiment.save()


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

		def plateInstance = service.newPlate(plateData)
		def plate = service.getPlate(plateInstance)

		then:
			notThrown ValidationException
			plateTemplate != null
			PlateTemplate.count() == 1
			Label.count() == 8
			Well.count() == 1
			PlateSet.count() == 1
			plateData.plate.assay == plate.assay
			plateData.plate.experimentID == experiment.id
			plateData.plate.templateID == plateTemplate.id
			plateData.plate.plateID == plate.plateID
			plateData.plate.labels.size() == plate.labels.size()
			plateData.plate.wells[0].row == plate.wells[0].row
			plateData.plate.wells[0].column == plate.wells[0].column
			plateData.plate.wells[0].labels.size() == plate.wells[0].labels.size()
	}
/*
	void "Test incorrect creation of a plate, experiment missing"() {
		when: "Incorrect parameters"
    	// Fake springSecurityService - login as id 1
		Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
		scientistInstance.save()
		service.springSecurityService = [principal: [id: scientistInstance.id]]


		def data = JSON.parse("""
			{plate: {
				name: 'test name', 
				labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}],
				wells: [{row: '0', column: '0', 'groupName': 'name', labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}]}] 
				}
			}
		""")

		def plateTemplate = service.newTemplate(data)

		def experiment = new ExperimentalPlateSet(name: "test", description: "description", owner: scientistInstance)
		experiment.save()


		def plateData = JSON.parse("""
			{plate: {
				assay: 'my assay', 
				experimentID: ${experiment.id},
				templateID: ${plateTemplate.id},
				plateID: 'barcode',
				labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}],
				wells: [{row: '0', column: '0', labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}]}] 
				}
			}
		""")

		def plateInstance = service.newPlate(plateData)

		then:
			def ex = thrown(ValidationException)
			ex.message.contains('A valid template ID is missing')
			plateInstance == null
			PlateSet.count() == 0
	}	
*/
	
}
