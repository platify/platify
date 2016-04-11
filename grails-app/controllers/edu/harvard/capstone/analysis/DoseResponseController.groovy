package edu.harvard.capstone.analysis

import edu.harvard.capstone.editor.DomainLabel
import edu.harvard.capstone.editor.PlateSet
import edu.harvard.capstone.editor.Well
import edu.harvard.capstone.editor.WellCompound
import edu.harvard.capstone.result.Result
import edu.harvard.capstone.result.ResultLabel
import edu.harvard.capstone.result.ResultPlate
import edu.harvard.capstone.result.ResultWell
import edu.harvard.capstone.editor.WellCompound
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
    def show(Integer max) {

        def experimentList = ExperimentalPlateSet.listOrderByName();
        // TODO - don't really need the experiment object
        respond experimentList as Object, model:[experimentList: experimentList]

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


