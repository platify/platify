package edu.harvard.capstone.result


import edu.harvard.capstone.user.Scientist
import edu.harvard.capstone.parser.Equipment
import edu.harvard.capstone.editor.ExperimentalPlateSet

import edu.harvard.capstone.editor.Well
import edu.harvard.capstone.editor.PlateTemplate

import grails.plugin.springsecurity.SpringSecurityService
import grails.validation.ValidationException
import org.codehaus.groovy.grails.web.json.JSONObject

import grails.test.mixin.*
import spock.lang.*

@TestFor(RefactoredDataController)
@Mock([Result, SpringSecurityService, ResultService, Scientist, ExperimentalPlateSet, Equipment])
class RefactoredDataControllerSpec extends Specification {


    def resultInstance



    void "Test the no result specified"() {

        when:"The params are incorrect"
            def springSecurityService = mockFor(SpringSecurityService)
            springSecurityService.demandExplicit.isLoggedIn {  -> true }

            controller.springSecurityService = springSecurityService.createMock()

            controller.save()

        then:"The create view is rendered again with the correct model"
            response.json.error == 'No result was specified'
    }

    void "Test the save action when user is not logged in"() {

        when:"The user is not logged in"
            Scientist owner = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
            Equipment equipment = new Equipment(name: "Test Equipment")
            ExperimentalPlateSet experiment = new ExperimentalPlateSet(owner: owner, name: "Test Experiment", description: "Test Description")
            resultInstance = new Result(owner: owner, equipment: equipment, experiment: experiment, name: "Test Results", description: "Result Description").save()

            def springSecurityService = mockFor(SpringSecurityService)
            springSecurityService.demandExplicit.isLoggedIn {  -> false }

            controller.springSecurityService = springSecurityService.createMock()

            controller.save(resultInstance.id)

        then:"The create view is rendered again with the correct model"
            response.json.error == 'User not logged in'
    }


    void "Test no JSON data"() {

        when:"Data is null"
            Scientist owner = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
            Equipment equipment = new Equipment(name: "Test Equipment")
            ExperimentalPlateSet experiment = new ExperimentalPlateSet(owner: owner, name: "Test Experiment", description: "Test Description")
            resultInstance = new Result(owner: owner, equipment: equipment, experiment: experiment, name: "Test Results", description: "Result Description").save()
            def springSecurityService = mockFor(SpringSecurityService)
            springSecurityService.demandExplicit.isLoggedIn {  -> true }

            controller.springSecurityService = springSecurityService.createMock()

            controller.save(resultInstance.id)

        then:"The create view is rendered again with the correct model"
            response.json.error == 'No data received'
    }

    void "Test validation exception"() {

        when:"Data has incorrect information"
            Scientist owner = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
            Equipment equipment = new Equipment(name: "Test Equipment")
            ExperimentalPlateSet experiment = new ExperimentalPlateSet(owner: owner, name: "Test Experiment", description: "Test Description")
            resultInstance = new Result(owner: owner, equipment: equipment, experiment: experiment, name: "Test Results", description: "Result Description").save()

            def springSecurityService = mockFor(SpringSecurityService)
            springSecurityService.demandExplicit.isLoggedIn {  -> true }

            controller.springSecurityService = springSecurityService.createMock()

            def resultService = mockFor(ResultService)
            resultService.demandExplicit.storeNormalizedData {  Result r, JSONObject o -> throw new RuntimeException("Error!") }

            controller.resultService = resultService.createMock()

            request.json = "{data: true}"
            controller.save(resultInstance.id)

        then:"The create view is rendered again with the correct model"
            response.json.error == 'Error!'
    }

    void "Test null object"() {

        when:"Data has incorrect information"
            Scientist owner = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
            Equipment equipment = new Equipment(name: "Test Equipment")
            ExperimentalPlateSet experiment = new ExperimentalPlateSet(owner: owner, name: "Test Experiment", description: "Test Description")
            resultInstance = new Result(owner: owner, equipment: equipment, experiment: experiment, name: "Test Results", description: "Result Description").save()

            def springSecurityService = mockFor(SpringSecurityService)
            springSecurityService.demandExplicit.isLoggedIn {  -> true }

            controller.springSecurityService = springSecurityService.createMock()

            def resultService = mockFor(ResultService)
            resultService.demandExplicit.storeNormalizedData {  Result r, JSONObject o -> null }

            controller.resultService = resultService.createMock()

            request.json = "{data: true}"
            controller.save(resultInstance.id)

        then:"The create view is rendered again with the correct model"
            response.json.error == 'Error storing the normalized data'
    }


    void "Test object errors"() {

        when:"Data has incorrect information"
            Scientist owner = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
            Equipment equipment = new Equipment(name: "Test Equipment")
            ExperimentalPlateSet experiment = new ExperimentalPlateSet(owner: owner, name: "Test Experiment", description: "Test Description")
            resultInstance = new Result(owner: owner, equipment: equipment, experiment: experiment, name: "Test Results", description: "Result Description").save()

            def springSecurityService = mockFor(SpringSecurityService)
            springSecurityService.demandExplicit.isLoggedIn {  -> true }

            controller.springSecurityService = springSecurityService.createMock()

            def resultService = mockFor(ResultService)
            resultService.demandExplicit.storeNormalizedData {  Result re, JSONObject o ->
                def r = new Result()
                r.save()
                r
            }

            controller.resultService = resultService.createMock()

            request.json = "{data: true}"
            controller.save(resultInstance.id)

        then:"The create view is rendered again with the correct model"
            response.json.error != null
    }


    void "Test everything working"() {

        when:"Data has incorrect information"
            Scientist owner = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
            Equipment equipment = new Equipment(name: "Test Equipment")
            ExperimentalPlateSet experiment = new ExperimentalPlateSet(owner: owner, name: "Test Experiment", description: "Test Description")
            resultInstance = new Result(owner: owner, equipment: equipment, experiment: experiment, name: "Test Results", description: "Result Description").save()        


            def springSecurityService = mockFor(SpringSecurityService)
            springSecurityService.demandExplicit.isLoggedIn {  -> true }

            controller.springSecurityService = springSecurityService.createMock()
            
            def resultService = mockFor(ResultService)
            resultService.demandExplicit.storeNormalizedData {  Result re, JSONObject o ->
                Scientist owner2 = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test")
                Equipment equipment2 = new Equipment(name: "Test Equipment")
                ExperimentalPlateSet experiment2 = new ExperimentalPlateSet(owner: owner2, name: "Test Experiment", description: "Test Description")
                def r = new Result(owner: owner2, equipment: equipment2, experiment: experiment2)
                r.save()
                r
            }

            controller.resultService = resultService.createMock()            

            request.json = "{data: true}"
            controller.save(resultInstance.id)

        then:"The create view is rendered again with the correct model"
            response.json.resultInstance != null
            response.json.resultInstance.class == 'edu.harvard.capstone.result.Result'
    }                              
}
