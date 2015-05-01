package edu.harvard.capstone.editor

import grails.plugin.springsecurity.SpringSecurityService

import edu.harvard.capstone.user.Scientist

import grails.test.mixin.*
import spock.lang.*

@TestFor(PlateTemplateController)
@Mock([PlateTemplate, Scientist, SpringSecurityService, ExperimentalPlateSet, EditorService])
class PlateTemplateControllerSpec extends Specification {

    def populateValidParams(params) {
        assert params != null

        Scientist owner = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")

        // TODO: Populate valid properties like...
        params["name"] = 'Test Plate'
        params["owner"] = owner

        params
    }

    void "Test the index action returns the correct model"() {

        when:"The index action is executed"
            controller.springSecurityService = [principal: [id:1, getAuthorities: { -> 
                    def authorities = []
                    def a  = [:]
                    a.authority =[]
                    a.authority << "ROLE_ADMIN"                 
                    authorities << a
                    return authorities
                }]]
            controller.index()

        then:"The model is correct"
            !model.plateTemplateInstanceList
            model.plateTemplateInstanceCount == 0
    }

    void "Test the create action returns the correct model"() {
        when:"The create action is executed"
            controller.create()

        then:"The model is correctly created"
            model.plateTemplateInstance!= null
    }


    void "Test that the show action returns the correct model"() {
        when:"The show action is executed with a null domain"
            controller.show(null)

        then:"A 404 error is returned"
            response.status == 404

        when:"A domain instance is passed to the show action"
            populateValidParams(params)
            def plateTemplate = new PlateTemplate(params)
            controller.show(plateTemplate)

        then:"A model is populated containing the domain instance"
            model.plateTemplateInstance == plateTemplate
    }

    void "Test that the edit action returns the correct model"() {
        when:"The edit action is executed with a null domain"
            controller.edit(null)

        then:"A 404 error is returned"
            response.status == 404

        when:"A domain instance is passed to the edit action"
            populateValidParams(params)
            def plateTemplate = new PlateTemplate(params)
            controller.edit(plateTemplate)

        then:"A model is populated containing the domain instance"
            model.plateTemplateInstance == plateTemplate
    }

    void "Test the update action performs an update on a valid domain instance"() {
        when:"Update is called for a domain instance that doesn't exist"
            request.contentType = FORM_CONTENT_TYPE
            controller.update(null)

        then:"A 404 error is returned"
            response.redirectedUrl == '/plateTemplate/index'
            flash.message != null


        when:"An invalid domain instance is passed to the update action"
            response.reset()
            def plateTemplate = new PlateTemplate()
            plateTemplate.validate()
            controller.update(plateTemplate)

        then:"The edit view is rendered again with the invalid instance"
            view == 'edit'
            model.plateTemplateInstance == plateTemplate

        when:"A valid domain instance is passed to the update action"
            response.reset()
            populateValidParams(params)
            plateTemplate = new PlateTemplate(params).save(flush: true)
            controller.update(plateTemplate)

        then:"A redirect is issues to the show action"
            response.redirectedUrl == "/plateTemplate/show/$plateTemplate.id"
            flash.message != null
    }

    void "Test that the delete action deletes an instance if it exists"() {
        when:"The delete action is called for a null instance"
            request.contentType = FORM_CONTENT_TYPE
            controller.delete(null)

        then:"A 404 is returned"
            response.redirectedUrl == '/plateTemplate/index'
            flash.message != null

        when:"A domain instance is created"
            response.reset()
            populateValidParams(params)
            def plateTemplate = new PlateTemplate(params).save(flush: true)

        then:"It exists"
            PlateTemplate.count() == 1

        when:"The domain instance is passed to the delete action"
            controller.delete(plateTemplate)

        then:"The instance is deleted"
            PlateTemplate.count() == 0
            response.redirectedUrl == '/plateTemplate/index'
            flash.message != null
    }
}
