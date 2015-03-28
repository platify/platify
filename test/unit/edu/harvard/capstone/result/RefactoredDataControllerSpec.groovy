package edu.harvard.capstone.result


import edu.harvard.capstone.user.Scientist
import edu.harvard.capstone.parser.Equipment
import edu.harvard.capstone.editor.ExperimentalPlateSet

import edu.harvard.capstone.editor.Well
import edu.harvard.capstone.editor.PlateTemplate


import grails.test.mixin.*
import spock.lang.*

@TestFor(RefactoredDataController)
@Mock(RefactoredData)
class RefactoredDataControllerSpec extends Specification {

    def populateValidParams(params) {
        assert params != null
        Scientist owner = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
        Equipment equipment = new Equipment(name: "Test Equipment")
        ExperimentalPlateSet experiment = new ExperimentalPlateSet(owner: owner, name: "Test Experiment", description: "Test Description")
        Result result = new Result(owner: owner, equipment: equipment, experiment: experiment, name: "Test Results", description: "Result description")

        PlateTemplate plate = new PlateTemplate(owner: owner, name: "Plate Template")        
        Well well = new Well(plate: plate, column: "1", row:"1")

        params.result = result
        params.value = 2.0
        params.well = well

        params

    }

    void "Test the index action returns the correct model"() {

        when:"The index action is executed"
            controller.index()

        then:"The model is correct"
            !model.refactoredDataInstanceList
            model.refactoredDataInstanceCount == 0
    }

    void "Test the create action returns the correct model"() {
        when:"The create action is executed"
            controller.create()

        then:"The model is correctly created"
            model.refactoredDataInstance!= null
    }

    void "Test the save action correctly persists an instance"() {

        when:"The save action is executed with an invalid instance"
            request.contentType = FORM_CONTENT_TYPE
            def refactoredData = new RefactoredData()
            refactoredData.validate()
            controller.save(refactoredData)

        then:"The create view is rendered again with the correct model"
            model.refactoredDataInstance!= null
            view == 'create'

        when:"The save action is executed with a valid instance"
            response.reset()
            populateValidParams(params)
            refactoredData = new RefactoredData(params)

            controller.save(refactoredData)

        then:"A redirect is issued to the show action"
            response.redirectedUrl == '/refactoredData/show/1'
            controller.flash.message != null
            RefactoredData.count() == 1
    }

    void "Test that the show action returns the correct model"() {
        when:"The show action is executed with a null domain"
            controller.show(null)

        then:"A 404 error is returned"
            response.status == 404

        when:"A domain instance is passed to the show action"
            populateValidParams(params)
            def refactoredData = new RefactoredData(params)
            controller.show(refactoredData)

        then:"A model is populated containing the domain instance"
            model.refactoredDataInstance == refactoredData
    }

    void "Test that the edit action returns the correct model"() {
        when:"The edit action is executed with a null domain"
            controller.edit(null)

        then:"A 404 error is returned"
            response.status == 404

        when:"A domain instance is passed to the edit action"
            populateValidParams(params)
            def refactoredData = new RefactoredData(params)
            controller.edit(refactoredData)

        then:"A model is populated containing the domain instance"
            model.refactoredDataInstance == refactoredData
    }

    void "Test the update action performs an update on a valid domain instance"() {
        when:"Update is called for a domain instance that doesn't exist"
            request.contentType = FORM_CONTENT_TYPE
            controller.update(null)

        then:"A 404 error is returned"
            response.redirectedUrl == '/refactoredData/index'
            flash.message != null


        when:"An invalid domain instance is passed to the update action"
            response.reset()
            def refactoredData = new RefactoredData()
            refactoredData.validate()
            controller.update(refactoredData)

        then:"The edit view is rendered again with the invalid instance"
            view == 'edit'
            model.refactoredDataInstance == refactoredData

        when:"A valid domain instance is passed to the update action"
            response.reset()
            populateValidParams(params)
            refactoredData = new RefactoredData(params).save(flush: true)
            controller.update(refactoredData)

        then:"A redirect is issues to the show action"
            response.redirectedUrl == "/refactoredData/show/$refactoredData.id"
            flash.message != null
    }

    void "Test that the delete action deletes an instance if it exists"() {
        when:"The delete action is called for a null instance"
            request.contentType = FORM_CONTENT_TYPE
            controller.delete(null)

        then:"A 404 is returned"
            response.redirectedUrl == '/refactoredData/index'
            flash.message != null

        when:"A domain instance is created"
            response.reset()
            populateValidParams(params)
            def refactoredData = new RefactoredData(params).save(flush: true)

        then:"It exists"
            RefactoredData.count() == 1

        when:"The domain instance is passed to the delete action"
            controller.delete(refactoredData)

        then:"The instance is deleted"
            RefactoredData.count() == 0
            response.redirectedUrl == '/refactoredData/index'
            flash.message != null
    }
}
