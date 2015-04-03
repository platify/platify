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
@Mock([Scientist, Well, PlateTemplate, Label, DomainLabel, ExperimentalPlateSet])
class EditorServiceSpec extends Specification {

    def setup() {
    }

    def cleanup() {
    }

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


		def data = JSON.parse("{plate: [{key: 'val'},{key: 'val'}]}")
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
			{plate: [
				{name: 'test name', labels: [{key: 'val'}] }
			]}
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
			{plate: [
				{name: 'test name', 
				labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}],
				wells: [{key: 'key', val: 'val'}] 
				}
			]}
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
			{plate: [
				{name: 'test name', 
				labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}],
				wells: [{row: '0', column: '0', 'groupName': 'name', labels: [{key: 'val'}]}] 
				}
			]}
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
			{plate: [
				{name: 'test name', 
				labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}],
				wells: [{row: '0', column: '0', 'groupName': 'name', labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}]}] 
				}
			]}
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
			{plate: [
				{name: 'test name', 
				labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}],
				wells: [{row: '0', column: '0', 'groupName': 'name', labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}]}] 
				}
			]}
		""")

		def plateTemplate = service.newTemplate(data)
		def plate = service.getTemplate(plateTemplate[0])

		then:
			notThrown ValidationException
			plateTemplate != null
			PlateTemplate.count() == 1
			Label.count() == 4
			Well.count() == 1
			data.plate[0].name == plate.name
			data.plate[0].labels == plate.labels
			data.plate[0].wells[0].row == plate.wells[0].row
			data.plate[0].wells[0].column == plate.wells[0].column
			data.plate[0].wells[0].groupName == plate.wells[0].groupName
			data.plate[0].wells[0].labels == plate.wells[0].labels
	}	

}
