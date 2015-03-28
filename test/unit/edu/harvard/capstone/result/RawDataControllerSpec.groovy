package edu.harvard.capstone.result


import edu.harvard.capstone.user.Scientist
import edu.harvard.capstone.parser.Equipment
import edu.harvard.capstone.editor.ExperimentalPlateSet

import edu.harvard.capstone.editor.Well
import edu.harvard.capstone.editor.PlateTemplate


import grails.test.mixin.*
import spock.lang.*

@TestFor(RawDataController)
@Mock(RawData)
class RawDataControllerSpec extends Specification {

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
            !model.rawDataInstanceList
            model.rawDataInstanceCount == 0
    }

    void "Test the create action returns the correct model"() {
        when:"The create action is executed"
            controller.create()

        then:"The model is correctly created"
            model.rawDataInstance!= null
    }

    void "Test the save action correctly persists an instance"() {

        when:"The save action is executed with an invalid instance"
            request.contentType = FORM_CONTENT_TYPE
            def rawData = new RawData()
            rawData.validate()
            controller.save(rawData)

        then:"The create view is rendered again with the correct model"
            model.rawDataInstance!= null
            view == 'create'

        when:"The save action is executed with a valid instance"
            response.reset()
            populateValidParams(params)
            rawData = new RawData(params)

            controller.save(rawData)

        then:"A redirect is issued to the show action"
            response.redirectedUrl == '/rawData/show/1'
            controller.flash.message != null
            RawData.count() == 1
    }

    void "Test that the show action returns the correct model"() {
        when:"The show action is executed with a null domain"
            controller.show(null)

        then:"A 404 error is returned"
            response.status == 404

        when:"A domain instance is passed to the show action"
            populateValidParams(params)
            def rawData = new RawData(params)
            controller.show(rawData)

        then:"A model is populated containing the domain instance"
            model.rawDataInstance == rawData
    }

    void "Test that the edit action returns the correct model"() {
        when:"The edit action is executed with a null domain"
            controller.edit(null)

        then:"A 404 error is returned"
            response.status == 404

        when:"A domain instance is passed to the edit action"
            populateValidParams(params)
            def rawData = new RawData(params)
            controller.edit(rawData)

        then:"A model is populated containing the domain instance"
            model.rawDataInstance == rawData
    }

    void "Test the update action performs an update on a valid domain instance"() {
        when:"Update is called for a domain instance that doesn't exist"
            request.contentType = FORM_CONTENT_TYPE
            controller.update(null)

        then:"A 404 error is returned"
            response.redirectedUrl == '/rawData/index'
            flash.message != null


        when:"An invalid domain instance is passed to the update action"
            response.reset()
            def rawData = new RawData()
            rawData.validate()
            controller.update(rawData)

        then:"The edit view is rendered again with the invalid instance"
            view == 'edit'
            model.rawDataInstance == rawData

        when:"A valid domain instance is passed to the update action"
            response.reset()
            populateValidParams(params)
            rawData = new RawData(params).save(flush: true)
            controller.update(rawData)

        then:"A redirect is issues to the show action"
            response.redirectedUrl == "/rawData/show/$rawData.id"
            flash.message != null
    }

    void "Test that the delete action deletes an instance if it exists"() {
        when:"The delete action is called for a null instance"
            request.contentType = FORM_CONTENT_TYPE
            controller.delete(null)

        then:"A 404 is returned"
            response.redirectedUrl == '/rawData/index'
            flash.message != null

        when:"A domain instance is created"
            response.reset()
            populateValidParams(params)
            def rawData = new RawData(params).save(flush: true)

        then:"It exists"
            RawData.count() == 1

        when:"The domain instance is passed to the delete action"
            controller.delete(rawData)

        then:"The instance is deleted"
            RawData.count() == 0
            response.redirectedUrl == '/rawData/index'
            flash.message != null
    }
}
