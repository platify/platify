package edu.harvard.capstone.result


import edu.harvard.capstone.user.Scientist
import edu.harvard.capstone.parser.Equipment
import edu.harvard.capstone.editor.ExperimentalPlateSet

import edu.harvard.capstone.editor.Well
import edu.harvard.capstone.editor.PlateTemplate


import grails.test.mixin.*
import spock.lang.*

@TestFor(ResultController)
@Mock(Result)
class ResultControllerSpec extends Specification {

    def populateValidParams(params) {
        assert params != null
        Scientist owner = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
        Equipment equipment = new Equipment(name: "Test Equipment")
        ExperimentalPlateSet experiment = new ExperimentalPlateSet(owner: owner, name: "Test Experiment", description: "Test Description")

        params.owner = owner
        params.equipment = equipment
        params.experiment = experiment
        params.name = "Test Results"
        params.description = "Result description"

        params
    }

    void "Test the index action returns the correct model"() {

        when:"The index action is executed"
            controller.index()

        then:"The model is correct"
            !model.resultInstanceList
            model.resultInstanceCount == 0
    }

    void "Test the create action returns the correct model"() {
        when:"The create action is executed"
            controller.create()

        then:"The model is correctly created"
            model.resultInstance!= null
    }

    void "Test the save action correctly persists an instance"() {

        when:"The save action is executed with an invalid instance"
            request.contentType = FORM_CONTENT_TYPE
            def result = new Result()
            result.validate()
            controller.save(result)

        then:"The create view is rendered again with the correct model"
            model.resultInstance!= null
            view == 'create'

        when:"The save action is executed with a valid instance"
            response.reset()
            populateValidParams(params)
            result = new Result(params)

            controller.save(result)

        then:"A redirect is issued to the show action"
            response.redirectedUrl == '/result/show/1'
            controller.flash.message != null
            Result.count() == 1
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
            def result = new Result()
            result.validate()
            controller.update(result)

        then:"The edit view is rendered again with the invalid instance"
            view == 'index'
            model.resultInstance == result

        when:"A valid domain instance is passed to the update action"
            response.reset()
            populateValidParams(params)
            result = new Result(params).save(flush: true)
            controller.update(result)

        then:"A redirect is issues to the show action"
            response.redirectedUrl == "/result/show/$result.id"
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
            def result = new Result(params).save(flush: true)

        then:"It exists"
            Result.count() == 1

        when:"The domain instance is passed to the delete action"
            controller.delete(result)

        then:"The instance is deleted"
            Result.count() == 0
            response.redirectedUrl == '/result/index'
            flash.message != null
    }
}
