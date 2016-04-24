package edu.harvard.capstone.analysis

import edu.harvard.capstone.editor.DomainLabel
import edu.harvard.capstone.editor.PlateSet
import edu.harvard.capstone.editor.Well
import edu.harvard.capstone.editor.Compound
import edu.harvard.capstone.result.Result
import edu.harvard.capstone.result.ResultLabel
import edu.harvard.capstone.result.ResultPlate
import edu.harvard.capstone.result.ResultWell
import grails.plugin.springsecurity.annotation.Secured
import edu.harvard.capstone.editor.ExperimentalPlateSet

import static org.springframework.http.HttpStatus.*
import grails.validation.ValidationException
import grails.converters.JSON

class DoseResponseController {

    def springSecurityService
    def fitDoseResponseCurveService

    static allowedMethods = [save: "POST", update: "PUT", delete: "DELETE"]


    @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
    def show() {

        def experimentList = ExperimentalPlateSet.listOrderByName();
        // TODO - don't really need the experiment object
        respond experimentList as Object, model:[experimentList: experimentList]

    }

    @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
    def updateCompounds(int experiment_id)
    {
        def resultData
        try{
            def experiment = ExperimentalPlateSet.findById(experiment_id);
            resultData = fitDoseResponseCurveService.getData(experiment)
            render g.select(id:"compoundSelect", name:"compound", from:resultData.plates[0].compounds.keySet(),
                    noSelection:[null:' '], onchange:"updateDoseResponseCurve(this.value)")
            return resultData
        }
        catch (RuntimeException e) {
            response.sendError(500)
            return
        }
    }


    @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
    def getfittedData(int experiment_id, String compound_name)
    {
        def resultData
        try{
            def experiment = ExperimentalPlateSet.findById(experiment_id);
            resultData = fitDoseResponseCurveService.getfittedData(experiment, compound_name)
        }
        catch (RuntimeException e) {
            response.sendError(500)
            return
        }
        render (resultData as JSON);
    }

    @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
    def getfittedData2(int experiment_id, String compound_name, String max_param, String min_param, String ec50, String slope)
    {
        def resultData
        try{
            def experiment = ExperimentalPlateSet.findById(experiment_id);
            resultData = fitDoseResponseCurveService.getfittedData2(experiment, compound_name, max_param, min_param, ec50, slope)
        }
        catch (RuntimeException e) {
            response.sendError(500)
            return
        }
        render (resultData as JSON);
    }

    @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
    def getDoseResponseData(int experiment_id) {
        def resultData
        try{
            def experiment = ExperimentalPlateSet.findById(experiment_id);
            resultData = fitDoseResponseCurveService.getData(experiment)
        }
        catch (RuntimeException e) {
            response.sendError(500)
            return
        }

        render (resultData as JSON);
    }
}


