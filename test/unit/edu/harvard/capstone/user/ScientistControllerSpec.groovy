package edu.harvard.capstone.user

import grails.plugin.springsecurity.SpringSecurityService

import grails.test.mixin.*
import spock.lang.*

@TestFor(ScientistController)
@Mock([Scientist, SpringSecurityService, ScientistService])
class ScientistControllerSpec extends Specification {

    def populateValidParams(params) {
        assert params != null
        
        params.firstName = "Test"
        params.lastName = "User"
        params.email = "my@email.com"
        params.password = "test"

        params

    }

    void "Test the index action returns the correct model"() {

        when:"The index action is executed"
            controller.index()

        then:"The model is correct"
            !model.scientistInstanceList
            model.scientistInstanceCount == 0
    }

    void "Test the create action returns the correct model"() {
        when:"The create action is executed"
            controller.create()

        then:"The model is correctly created"
            model.scientistInstance!= null
    }

    void "Test the save action correctly persists an instance"() {

        when:"The save action is executed with the user not logged in"
            def springSecurityService = mockFor(SpringSecurityService)
            springSecurityService.demandExplicit.isLoggedIn {  -> false }

            controller.springSecurityService = springSecurityService.createMock()

            request.contentType = FORM_CONTENT_TYPE
            String firstName = "First Name"
            String lastName = "Last Name"
            String email = "my@email.com"
            String password = "password"
            Boolean admin = false
            controller.save(firstName, lastName, email, password, admin)

        then:"The create view is rendered again with the correct model"
            model.scientistInstance == null
            response.redirectedUrl == '/scientist/index'

        when:"The save action is executed with an invalid instance"
            response.reset()
            springSecurityService.demandExplicit.isLoggedIn {  -> true }

            controller.springSecurityService = springSecurityService.createMock()

            def scientistService = mockFor(ScientistService)
            scientistService.demandExplicit.newUser { String f, String l, String e, String p, Boolean a -> null }

            controller.scientistService = scientistService.createMock()

            request.contentType = FORM_CONTENT_TYPE

            controller.save(firstName, lastName, email, password, admin)

        then:"The create view is rendered again with the correct model"
            model.scientistInstance == null
            response.redirectedUrl == '/scientist/index'

        when:"The save action is executed with an invalid instance"
            response.reset()
            springSecurityService.demandExplicit.isLoggedIn {  -> true }

            controller.springSecurityService = springSecurityService.createMock()

            
            scientistService.demandExplicit.newUser { String f, String l, String e, String p, Boolean a -> 
                def s = new Scientist()
                s.validate()
                s
            }

            controller.scientistService = scientistService.createMock()

            request.contentType = FORM_CONTENT_TYPE

            controller.save(firstName, lastName, email, password, admin)

        then:"The create view is rendered again with the correct model"
            model.scientistInstance != null
            view == 'create'

        when:"The save action is executed with a valid instance"
            response.reset()

            
            springSecurityService.demandExplicit.isLoggedIn {  -> true }

            controller.springSecurityService = springSecurityService.createMock()

            
            scientistService.demandExplicit.newUser { String f, String l, String e, String p, Boolean a -> new Scientist(firstName: f, lastName: l, email: e, password: p).save() }

            controller.scientistService = scientistService.createMock()

            controller.save(firstName, lastName, email, password, admin)

        then:"A redirect is issued to the show action"
            response.redirectedUrl == '/scientist/show/1'
            controller.flash.message != null
            Scientist.count() == 1
    }

    void "Test that the show action returns the correct model"() {
        when:"The show action is executed with a null domain"
            controller.show(null)

        then:"A 404 error is returned"
            response.status == 404

        when:"A domain instance is passed to the show action"
            populateValidParams(params)
            def scientist = new Scientist(params)
            controller.show(scientist)

        then:"A model is populated containing the domain instance"
            model.scientistInstance == scientist
    }

    void "Test that the edit action returns the correct model"() {
        when:"The edit action is executed with a null domain"
            controller.edit(null)

        then:"A 404 error is returned"
            response.status == 404

        when:"A domain instance is passed to the edit action"
            populateValidParams(params)
            def scientist = new Scientist(params)
            controller.edit(scientist)

        then:"A model is populated containing the domain instance"
            model.scientistInstance == scientist
    }

    void "Test the update action performs an update on a valid domain instance"() {
        when:"Update is called for a domain instance that doesn't exist"
            request.contentType = FORM_CONTENT_TYPE
            String firstName = "First Name"
            String lastName = "Last Name"
            String email = "my@email.com"
            String password = "password"
            Boolean admin = false
            controller.update(100, firstName, lastName, email, password, admin)


        then:"A 404 error is returned"
            response.redirectedUrl == '/scientist/index'
            flash.message != null


        when:"An invalid domain instance is passed to the update action"
            response.reset()

            def scientistService = mockFor(ScientistService)
            scientistService.demandExplicit.updateUser { Scientist s, String f, String l, String e, String p, Boolean a -> 
                s.email = null
                s.save() 
                s
            }

            controller.scientistService = scientistService.createMock()

            Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test").save()
            request.contentType = FORM_CONTENT_TYPE
            controller.update(scientistInstance.id as Long, firstName, lastName, email, password, admin)

        then:"The edit view is rendered again with the invalid instance"
            model.scientistInstance.id == scientistInstance.id
            view == 'edit'            

        when:"A valid domain instance is passed to the update action"
            response.reset()
            scientistService = mockFor(ScientistService)
            scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test").save()
            scientistService.demandExplicit.updateUser { Scientist s, String f, String l, String e, String p, Boolean a -> s }

            controller.scientistService = scientistService.createMock()
            request.contentType = FORM_CONTENT_TYPE

            controller.update(scientistInstance.id as Long, firstName, lastName, email, password, admin)


        then:"A redirect is issues to the show action"
            flash.message != null
            response.redirectedUrl == "/scientist/show/${scientistInstance.id}"
            
    }

    void "Test that the delete action deletes an instance if it exists"() {
        given:
            def scientistService = mockFor(ScientistService)
            scientistService.demandExplicit.deleteUser { Scientist s ->  s.delete()}
            controller.scientistService = scientistService.createMock()

        when:"The delete action is called for a null instance"
            request.contentType = FORM_CONTENT_TYPE
            controller.delete(null)

        then:"A 404 is returned"
            response.redirectedUrl == '/scientist/index'
            flash.message != null

        when:"A domain instance is created"
            response.reset()
            Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test").save()

        then:"It exists"
            Scientist.count() == 1

        when:"The domain instance is passed to the delete action"
            controller.delete(scientistInstance)

        then:"The instance is deleted"
            Scientist.count() == 0
            response.redirectedUrl == '/scientist/index'
            flash.message != null
    }
}
