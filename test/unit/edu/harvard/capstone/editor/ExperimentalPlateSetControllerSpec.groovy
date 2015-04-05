package edu.harvard.capstone.editor

import grails.plugin.springsecurity.SpringSecurityService

import edu.harvard.capstone.user.Scientist

import grails.test.mixin.*
import spock.lang.*

@TestFor(ExperimentalPlateSetController)
@Mock([Scientist, SpringSecurityService, ExperimentalPlateSet, EditorService])
class ExperimentalPlateSetControllerSpec extends Specification {

    def populateValidParams(params) {
        assert params != null
        Scientist owner = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")

        // TODO: Populate valid properties like...
        params["name"] = 'Test Experiment'
        params["description"] = "Experiment Description"
        params['owner'] = owner

        params
    }



    void "Test the create action returns the correct model"() {
        when:"The create action is executed"
            controller.create()

        then:"The model is correctly created"
            model.experimentalPlateSetInstance!= null
    }

    void "Test the save action correctly persists an instance"() {

        when:"The save action is executed with the user not logged in"
            def springSecurityService = mockFor(SpringSecurityService)
            springSecurityService.demandExplicit.isLoggedIn {  -> false }

            controller.springSecurityService = springSecurityService.createMock()

            request.contentType = FORM_CONTENT_TYPE
            String name = "Name"
            String description = "My Description"

            controller.save(name, description)

        then:"The create view is rendered again with the correct model"
            model.experimentalPlateSetInstance == null
            response.redirectedUrl == '/experimentalPlateSet/index'

        when:"The save action is executed with an invalid instance"
            response.reset()
            springSecurityService.demandExplicit.isLoggedIn {  -> true }

            controller.springSecurityService = springSecurityService.createMock()

            def editorService = mockFor(EditorService)
            editorService.demandExplicit.newExperiment { String n, String d -> null }

            controller.editorService = editorService.createMock()

            request.contentType = FORM_CONTENT_TYPE

            controller.save(name, description)

        then:"The create view is rendered again with the correct model"
            model.experimentalPlateSetInstance == null
            response.redirectedUrl == '/experimentalPlateSet/index'


        when:"The save action is executed with an invalid instance"
            response.reset()
            springSecurityService.demandExplicit.isLoggedIn {  -> true }

            controller.springSecurityService = springSecurityService.createMock()


            editorService = mockFor(EditorService)
            editorService.demandExplicit.newExperiment { String n, String d -> 
                def e = new ExperimentalPlateSet()
                e.validate()
                e
            }

            controller.editorService = editorService.createMock()

            request.contentType = FORM_CONTENT_TYPE

            controller.save(name, description)

        then:"The create view is rendered again with the correct model"
            model.experimentalPlateSetInstance != null
            view == 'create'

        when:"The save action is executed with a valid instance"
            response.reset()
            
            springSecurityService.demandExplicit.isLoggedIn {  -> true }

            controller.springSecurityService = springSecurityService.createMock()

            editorService = mockFor(EditorService)
            editorService.demandExplicit.newExperiment { String n, String d -> 
                Scientist owner = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
                def e = new ExperimentalPlateSet(name: n, description: d, owner: owner)
                e.save()
                e
            }
            controller.editorService = editorService.createMock()

            request.contentType = FORM_CONTENT_TYPE

            controller.save(name, description)

        then:"A redirect is issued to the show action"
            response.redirectedUrl == '/experimentalPlateSet/show/1'
            controller.flash.message != null
            ExperimentalPlateSet.count() == 1
    }

    void "Test that the show action returns the correct model"() {
        when:"The show action is executed with a null domain"
            controller.show(null)

        then:"A 404 error is returned"
            response.status == 404

        when:"A domain instance is passed to the show action"
            populateValidParams(params)
            def experimentalPlateSet = new ExperimentalPlateSet(params)
            controller.show(experimentalPlateSet)

        then:"A model is populated containing the domain instance"
            model.experimentalPlateSetInstance == experimentalPlateSet
    }

    void "Test that the edit action returns the correct model"() {
        when:"The edit action is executed with a null domain"
            controller.edit(null)

        then:"A 404 error is returned"
            response.status == 404

        when:"A domain instance is passed to the edit action"
            populateValidParams(params)
            def experimentalPlateSet = new ExperimentalPlateSet(params)
            controller.edit(experimentalPlateSet)

        then:"A model is populated containing the domain instance"
            model.experimentalPlateSetInstance == experimentalPlateSet
    }

    void "Test the update action performs an update on a valid domain instance"() {
        when:"Update is called for a domain instance that doesn't exist"
            request.contentType = FORM_CONTENT_TYPE
            controller.update(null)

        then:"A 404 error is returned"
            response.redirectedUrl == '/experimentalPlateSet/index'
            flash.message != null


        when:"An invalid domain instance is passed to the update action"
            response.reset()
            def experimentalPlateSet = new ExperimentalPlateSet()
            experimentalPlateSet.validate()
            controller.update(experimentalPlateSet)

        then:"The edit view is rendered again with the invalid instance"
            view == 'edit'
            model.experimentalPlateSetInstance == experimentalPlateSet

        when:"A valid domain instance is passed to the update action"
            response.reset()
            populateValidParams(params)
            experimentalPlateSet = new ExperimentalPlateSet(params).save(flush: true)
            controller.update(experimentalPlateSet)

        then:"A redirect is issues to the show action"
            response.redirectedUrl == "/experimentalPlateSet/show/$experimentalPlateSet.id"
            flash.message != null
    }

    void "Test that the delete action deletes an instance if it exists"() {
        when:"The delete action is called for a null instance"
            request.contentType = FORM_CONTENT_TYPE
            controller.delete(null)

        then:"A 404 is returned"
            response.redirectedUrl == '/experimentalPlateSet/index'
            flash.message != null

        when:"A domain instance is created"
            response.reset()
            populateValidParams(params)
            def experimentalPlateSet = new ExperimentalPlateSet(params).save(flush: true)

        then:"It exists"
            ExperimentalPlateSet.count() == 1

        when:"The domain instance is passed to the delete action"
            controller.delete(experimentalPlateSet)

        then:"The instance is deleted"
            ExperimentalPlateSet.count() == 0
            response.redirectedUrl == '/experimentalPlateSet/index'
            flash.message != null
    }
}
