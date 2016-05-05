package edu.harvard.capstone.result

import edu.harvard.capstone.editor.DomainLabel
import edu.harvard.capstone.editor.PlateSet
import edu.harvard.capstone.user.Scientist
import edu.harvard.capstone.parser.Equipment
import edu.harvard.capstone.editor.ExperimentalPlateSet

import edu.harvard.capstone.editor.Well
import edu.harvard.capstone.editor.PlateTemplate
import grails.converters.JSON
import grails.plugin.springsecurity.SpringSecurityService
import grails.test.mixin.*
import grails.validation.ValidationException
import org.codehaus.groovy.grails.web.json.JSONObject
import spock.lang.*

@TestFor(ResultController)
@Mock([Scientist, Well, PlateTemplate, PlateSet, Result, ResultLabel, ResultWell, ResultPlate, Equipment, ExperimentalPlateSet, DomainLabel, SpringSecurityService, ResultService])
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

    void "Test correct model"() {
        when:
        def springSecurityService = mockFor(SpringSecurityService)
        springSecurityService.demandExplicit.isLoggedIn {  -> true }

        controller.springSecurityService = springSecurityService.createMock()
        Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test").save(flush:true)

        Equipment equipmentInstance = new Equipment(name: "my equipment", machineName: "my machine name", description: "my description", config: "my config").save(flush:true)
        ExperimentalPlateSet experimentInstance = new ExperimentalPlateSet(owner: scientistInstance, name: "my experiment", description: "my description").save(flush:true)
        PlateTemplate templateInstance = new PlateTemplate(owner: scientistInstance, name: "my template").save(flush:true)
        new PlateSet(plate: templateInstance, experiment: experimentInstance, barcode: 'barcode').save(flush:true)
        Well well = new Well(plate: templateInstance, column: 0, row: 0, groupName: 'my group').save(flush:true)

        def result = new Result(experiment: experimentInstance, equipment: equipmentInstance, owner: scientistInstance, name: "Test Results").save(flush:true)
        def resultPlate = new ResultPlate(result: result, barcode: "test barcode", rows: 0, columns: 0).save(flush:true)
        def resultWell = new ResultWell(plate: resultPlate, well: well).save(flush:true)
        new ResultLabel(domainId: resultWell.id, labelType: ResultLabel.LabelType.RAW_DATA, name: "key", scope: "WELL", value: "value").save(flush:true)
        def resultInstance = new Result(owner: scientistInstance, equipment: equipmentInstance, experiment: experimentInstance).save(flush:true)

        def resultService = mockFor(ResultService)
        resultService.demandExplicit.getResults { ExperimentalPlateSet exp ->
            def data = JSON.parse("""
				{
					experimentID: '${experimentInstance.id}',
					plates: [{
						plateID: 'barcode',
						parsingID: '${equipmentInstance.id}',
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

            data as JSON
        }

        controller.resultService = resultService.createMock()
        controller.showactions(experimentInstance)

        then:
        def data = JSON.parse(model.importData as String)
        data.experimentID == Long.toString(experimentInstance.id)
        data.plates[0].parsingID == Long.toString(equipmentInstance.id)
        data.plates.size() == 1
        data.plates[0].labels.key == 'value'
        data.plates[0].rows.size() == 1
        data.plates[0].rows[0].columns.size() == 1
        data.plates[0].rows[0].columns[0].labels.key == 'value'
        data.experimentFeatures.labels.size() == 2
        data.experimentFeatures.labels.key == 'val'
        data.experimentFeatures.labels.secondKey == 'second val'
    }

    void "Test updating outlier field of result label"() {
        when:
        Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test").save(flush:true)
        Equipment equipmentInstance = new Equipment(name: "my equipment", machineName: "my machine name", description: "my description", config: "my config").save(flush:true)
        ExperimentalPlateSet experimentInstance = new ExperimentalPlateSet(owner: scientistInstance, name: "my experiment", description: "my description").save(flush:true)
        PlateTemplate templateInstance = new PlateTemplate(owner: scientistInstance, name: "my template").save(flush:true)
        PlateSet plate = new PlateSet(plate: templateInstance, experiment: experimentInstance, barcode: 'barcode').save(flush:true)
        Well well = new Well(plate: templateInstance, column: 0, row: 0, groupName: 'my group').save(flush:true)

        def result = new Result(experiment: experimentInstance, equipment: equipmentInstance, owner: scientistInstance, name: "Test Results").save(flush:true)
        def resultPlate = new ResultPlate(result: result, barcode: "barcode", rows: 0, columns: 0).save(flush:true)
        def resultWell = new ResultWell(plate: resultPlate, well: well).save(flush:true)
        def resultLabel = new ResultLabel(domainId: resultWell.id, labelType: ResultLabel.LabelType.RAW_DATA, name: "key", scope: "WELL", value: "value", outlier: "false").save(flush:true)

        controller.updateOutlier((int)experimentInstance.id, plate.barcode, resultLabel.scope.toString(), well.row, well.column, "true")

        then:
        resultLabel.outlier == "true"
    }

    void "Test updating outlier field of non-existing result label"() {
        when:
        Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test").save(flush:true)
        Equipment equipmentInstance = new Equipment(name: "my equipment", machineName: "my machine name", description: "my description", config: "my config").save(flush:true)
        ExperimentalPlateSet experimentInstance = new ExperimentalPlateSet(owner: scientistInstance, name: "my experiment", description: "my description").save(flush:true)
        PlateTemplate templateInstance = new PlateTemplate(owner: scientistInstance, name: "my template").save(flush:true)
        PlateSet plate = new PlateSet(plate: templateInstance, experiment: experimentInstance, barcode: 'barcode').save(flush:true)
        Well well = new Well(plate: templateInstance, column: 0, row: 0, groupName: 'my group').save(flush:true)

        def result = new Result(experiment: experimentInstance, equipment: equipmentInstance, owner: scientistInstance, name: "Test Results").save(flush:true)
        def resultPlate = new ResultPlate(result: result, barcode: "barcode", rows: 0, columns: 0).save(flush:true)
        def resultWell = new ResultWell(plate: resultPlate, well: well).save(flush:true)
//        def resultLabel = new ResultLabel(domainId: resultWell.id, labelType: ResultLabel.LabelType.RAW_DATA, name: "key", scope: "WELL", value: "value", outlier: "false").save(flush:true)

        controller.updateOutlier((int)experimentInstance.id, plate.barcode, "well", well.row, well.column, "true")

        then:
        def message = JSON.parse(response.text)
        message.error == "Labels not found"
    }

    void "Test illegal outlier field when updating for result label"() {
        when:
        Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test").save(flush:true)
        Equipment equipmentInstance = new Equipment(name: "my equipment", machineName: "my machine name", description: "my description", config: "my config").save(flush:true)
        ExperimentalPlateSet experimentInstance = new ExperimentalPlateSet(owner: scientistInstance, name: "my experiment", description: "my description").save(flush:true)
        PlateTemplate templateInstance = new PlateTemplate(owner: scientistInstance, name: "my template").save(flush:true)
        PlateSet plate = new PlateSet(plate: templateInstance, experiment: experimentInstance, barcode: 'barcode').save(flush:true)
        Well well = new Well(plate: templateInstance, column: 0, row: 0, groupName: 'my group').save(flush:true)

        def result = new Result(experiment: experimentInstance, equipment: equipmentInstance, owner: scientistInstance, name: "Test Results").save(flush:true)
        def resultPlate = new ResultPlate(result: result, barcode: "barcode", rows: 0, columns: 0).save(flush:true)
        def resultWell = new ResultWell(plate: resultPlate, well: well).save(flush:true)
        def resultLabel = new ResultLabel(domainId: resultWell.id, labelType: ResultLabel.LabelType.RAW_DATA, name: "key", scope: "WELL", value: "value", outlier: "false").save(flush:true)

        controller.updateOutlier((int)experimentInstance.id, plate.barcode, "well", well.row, well.column, "illegalOutlierNeitherTrueNorFalse")

        then:
        def ex = thrown(ValidationException)
        ex.message.contains("Some outlier status could not be saved")
    }

    void "Test update result"() {
        when:
        Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test").save(flush:true)
        Equipment equipmentInstance = new Equipment(name: "my equipment", machineName: "my machine name", description: "my description", config: "my config").save(flush:true)
        ExperimentalPlateSet experimentInstance = new ExperimentalPlateSet(owner: scientistInstance, name: "my experiment", description: "my description").save(flush:true)

        def result = new Result(experiment: experimentInstance, equipment: equipmentInstance, owner: scientistInstance, name: "Test Results").save(flush:true)
        result.name = "Modified Test Results"
        controller.update(result)

        then:
        Result.findById(result.id).name == "Modified Test Results"
    }

    void "Test delete result"() {
        when:
        Scientist scientistInstance = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test").save(flush:true)
        Equipment equipmentInstance = new Equipment(name: "my equipment", machineName: "my machine name", description: "my description", config: "my config").save(flush:true)
        ExperimentalPlateSet experimentInstance = new ExperimentalPlateSet(owner: scientistInstance, name: "my experiment", description: "my description").save(flush:true)

        def result = new Result(experiment: experimentInstance, equipment: equipmentInstance, owner: scientistInstance, name: "Test Results").save(flush:true)
        controller.delete(result)

        then:
        Result.findById(result.id) == null
    }
}
