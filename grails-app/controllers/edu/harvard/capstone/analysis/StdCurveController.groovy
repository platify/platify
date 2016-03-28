package edu.harvard.capstone.analysis

import edu.harvard.capstone.editor.ExperimentalPlateSet
//import grails.validation.ValidationException

/**
 * Created by Monica on 3/24/2016.
 */
class StdCurveController {
    def editorService

    static allowedMethods = [save: "POST", update: "PUT", delete: "DELETE"]

    def show(ExperimentalPlateSet experiment){

/*
        if (!springSecurityService.isLoggedIn()){
            redirect controller: 'experimentalPlateSet', action: 'index', method: 'GET'
            return
        }
*/

        if (experiment == null) {
            //notFound()
            return
        }

        def importData
        try{
            importData = editorService.getExperimentData(experiment)
        }
/*        catch (ValidationException e) {
            response.sendError(400)
            return
        }*/ catch (RuntimeException e) {
            response.sendError(500)
            return
        }

        // TODO - don't really need the experiment object
        respond experiment as Object, model:[importData: importData]
    }
}
