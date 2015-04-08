package edu.harvard.capstone.parser


import grails.plugin.springsecurity.SpringSecurityService


import grails.test.mixin.*
import spock.lang.*

@TestFor(EquipmentController)
@Mock([Equipment, SpringSecurityService, ParserService])
class EquipmentControllerSpec extends Specification {

    def populateValidParams(params) {
        assert params != null
        // TODO: Populate valid properties like...
        params["name"] = 'Test Equipment'

        params
    }

    void "Test the index action returns the correct model"() {

        when:"The index action is executed"
            controller.index()

        then:"The model is correct"
            !model.equipmentInstanceList
            model.equipmentInstanceCount == 0
    }

    void "Test the create action returns the correct model"() {
        when:"The create action is executed"
            controller.create()

        then:"The model is correctly created"
            model.equipmentInstance!= null
    }

    void "Test save action with a user not logged in"(){
        when:"The save action is executed with a user not logged in"
            def springSecurityService = mockFor(SpringSecurityService)
            springSecurityService.demandExplicit.isLoggedIn {  -> false }

            controller.springSecurityService = springSecurityService.createMock()
            request.contentType = FORM_CONTENT_TYPE
            request.json = "{data': null}"
            controller.save()

        then:"An error is returned"
            model.equipmentInstance == null
            response.json.error != null
            response.json.error == "User not logged in"
    }
    void "Test save action with no data passed"(){
        when:"The save action is executed with no data"
            def springSecurityService = mockFor(SpringSecurityService)
            springSecurityService.demandExplicit.isLoggedIn {  -> true }

            controller.springSecurityService = springSecurityService.createMock()

            request.contentType = FORM_CONTENT_TYPE
            controller.save()

        then:"An error is returned"
            model.equipmentInstance == null
            response.json.error != null 
            response.json.error == "No data received" 
    }

    void "Test save action with data incorrect"(){
        when:"Null equipment"
            def springSecurityService = mockFor(SpringSecurityService)
            springSecurityService.demandExplicit.isLoggedIn {  -> true }
            
            controller.springSecurityService = springSecurityService.createMock()

            def parserService = mockFor(ParserService)
            parserService.demandExplicit.newEquipment { String n, String mn, String desc, String da ->  null }

            controller.parserService = parserService.createMock()
            

            request.json = '{"name": "test name"}'

            controller.save()

        then:"An error is returned"
            model.equipmentInstance == null
            response.json.error != null 
            response.json.error == "Error creating the equipment"
    }

    void "Test the save action with incorrect data"(){
        when:"The name that is required is missing"
            def springSecurityService = mockFor(SpringSecurityService)
            springSecurityService.demandExplicit.isLoggedIn {  -> true }
            
            def parserService = mockFor(ParserService)
            parserService.demandExplicit.newEquipment { String name, String machineName, String description, String data -> 
                def e = new Equipment(name: name, machineName: machineName, description: description, config: data)
                e.save()
                e
            }

            controller.parserService = parserService.createMock()
            controller.springSecurityService = springSecurityService.createMock()
            request.json = "{name: ''}"

            controller.save()

        then:"An error is returned"
            model.equipmentInstance == null
            response.json.error != null  
            response.json.error != "Error creating the equipment"          
    }


    void "Test the save action correctly persists an instance"() {
        when:"The save action is executed with a valid instance"
            def springSecurityService = mockFor(SpringSecurityService)
            springSecurityService.demandExplicit.isLoggedIn {  -> true }
            
            def parserService = mockFor(ParserService)
            parserService.demandExplicit.newEquipment { String name, String machineName, String description, String data -> 
                def e = new Equipment(name: name, machineName: machineName, description: description, config: data)
                e.save()
                e
            }

            controller.parserService = parserService.createMock()
            controller.springSecurityService = springSecurityService.createMock()
            request.json = "{name: 'my name'}"

            controller.save()

        then:"A redirect is issued to the show action"
            response.json.error == null  
            response.json.equipment != null  
            Equipment.count() == 1
    }

    void "Test that the show action returns the correct model"() {
        when:"The show action is executed with a null domain"
            controller.show(null)

        then:"An empty equipment is returned"
            !response.json.equipment

        when:"A domain instance is passed to the show action"
            response.reset()

            def equipmentInstance = new Equipment(name: "test equipment")
            controller.show(equipmentInstance)

        then:"A model is populated containing the domain instance"
            response.json.equipment.name == equipmentInstance.name
    }

    void "Test that the edit action returns the correct model"() {
        when:"The edit action is executed with a null domain"
            controller.edit(null)

        then:"A 404 error is returned"
            response.status == 404

        when:"A domain instance is passed to the edit action"
            populateValidParams(params)
            def equipment = new Equipment(params)
            controller.edit(equipment)

        then:"A model is populated containing the domain instance"
            model.equipmentInstance == equipment
    }

    void "Test update action with no equipment"(){
        when:"Equipment is null"
            controller.update()

        then:"An error is returned"
            model.equipmentInstance == null
            response.json.error != null 
            response.json.error == "Equipment not found" 
    }

    void "Test update action with no data"(){
        when:"The update action is executed with no data"
            populateValidParams(params)
            def equipment = new Equipment(params)
            equipment.save()

            request.contentType = FORM_CONTENT_TYPE
            controller.update(equipment.id)

        then:"An error is returned"
            model.equipmentInstance == null
            response.json.error != null 
            response.json.error == "No data received" 
    }

    void "Test update action with incorrect data"(){
        when:"Incorrect data"
            def parserService = mockFor(ParserService)
            parserService.demandExplicit.updateEquipment {Equipment e, String n, String d, String c, String f -> 
                def eq = new Equipment()
                eq.save()
                eq
            }
            populateValidParams(params)
            def equipment = new Equipment(params)
            controller.parserService = parserService.createMock()
            request.json = "{data: 'my data'}"
            equipment.save()

            request.contentType = FORM_CONTENT_TYPE
            controller.update(equipment.id)

        then:"An error is returned"
            model.equipmentInstance == null
            response.json.error != null 
            response.json.error == "Error updating the equipment" 
    }

    void "Test update action working"(){
        when:"Correct data"
            def parserService = mockFor(ParserService)
            parserService.demandExplicit.updateEquipment {Equipment e, String n, String d, String c, String f  -> 
                e
            }
            populateValidParams(params)
            def equipment = new Equipment(params)
            controller.parserService = parserService.createMock()
            request.json = "{data: 'my data'}"
            equipment.save()

            request.contentType = FORM_CONTENT_TYPE
            controller.update(equipment.id)

        then:"An error is returned"
            model.equipmentInstance == null
            response.json.error == null 
            response.json.equipment.name == equipment.name
    }

    void "Test that the delete action deletes an instance if it exists"() {
        when:"The delete action is called for a null instance"
            request.contentType = FORM_CONTENT_TYPE
            controller.delete(null)

        then:"A 404 is returned"
            response.redirectedUrl == '/equipment/index'
            flash.message != null

        when:"A domain instance is created"
            response.reset()
            populateValidParams(params)
            def equipment = new Equipment(params).save(flush: true)

        then:"It exists"
            Equipment.count() == 1

        when:"The domain instance is passed to the delete action"
            controller.delete(equipment)

        then:"The instance is deleted"
            Equipment.count() == 0
            response.redirectedUrl == '/equipment/index'
            flash.message != null
    }
}
