package edu.harvard.capstone.result

import edu.harvard.capstone.editor.DomainLabel
import edu.harvard.capstone.editor.PlateTemplate
import grails.plugin.springsecurity.annotation.Secured
import edu.harvard.capstone.editor.ExperimentalPlateSet
import edu.harvard.capstone.editor.PlateSet
import edu.harvard.capstone.editor.Well


import static org.springframework.http.HttpStatus.*
import grails.validation.ValidationException
import grails.converters.JSON
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.multipart.MultipartHttpServletRequest

class ResultController {

    def springSecurityService
    def resultService
    def editorService

    static allowedMethods = [save: "POST", update: "PUT", delete: "DELETE"]


    @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
    def index(Integer max) {
        params.max = Math.min(max ?: 10, 100)
        respond Result.list(params), model:[resultInstanceCount: Result.count()]
    }
	
//    @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
//    def kitchenSink(ExperimentalPlateSet experiment) {
//        if (!springSecurityService.isLoggedIn()){
//            render(contentType: "application/json") {
//                [error: "User not logged in"]
//            }
//            return
//        }
//
//        if (experiment == null) {
//            render(contentType: "application/json") {
//                [error: "Result not found"]
//            }
//            return
//        }
//
//        if (experiment.hasErrors()) {
//            render(contentType: "application/json") {
//                [error: experiment.errors]
//            }
//            return
//        }
//
//        def result = [ImportData: resultService.getKitchenSink(experiment)]
//        render result as JSON
//    }


    @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
    def create() {
        respond new Result(params)
    }


//    @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
//    def read(Result resultInstance){
//        if (!springSecurityService.isLoggedIn()){
//            render(contentType: "application/json") {
//                [error: "User not logged in"]
//            }
//            return
//        }
//
//        if (resultInstance == null) {
//            render(contentType: "application/json") {
//                [error: "Result not found"]
//            }
//            return
//        }
//
//        if (resultInstance.hasErrors()) {
//            render(contentType: "application/json") {
//                [error: resultInstance.errors]
//            }
//            return
//        }
//        def result
//        try{
//            result = resultService.getResults(resultInstance)
//        }
//        catch (ValidationException e) {
//            render(contentType: "application/json") {
//                [error: e.errors, message: e.message]
//            }
//            return
//        } catch (RuntimeException e) {
//            render(contentType: "application/json") {
//                [error: e.message]
//            }
//            return
//        }
//println(result)
//        render(contentType: "application/json") {
//            [ImportData: result]
//        }
//    }


    @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
    def showactions(ExperimentalPlateSet experiment){
        if (!springSecurityService.isLoggedIn()){
            redirect controller: 'experimentalPlateSet', action: 'index', method: 'GET'
            return
        } 

        if (experiment == null) {
            notFound()
            return
        }

        def importData
        try{
            importData = resultService.getResults(experiment)    
        }
        catch (ValidationException e) {
            response.sendError(400)
            return
        } catch (RuntimeException e) {
            response.sendError(500)
            return                      
        }

        // TODO - don't really need the experiment object
        respond experiment as Object, model:[importData: importData, exp_id: experiment.id]
    }


    @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
    def save(Result resultInstance) {
        if (resultInstance == null) {
            notFound()
            return
        }

        if (resultInstance.hasErrors()) {
            respond resultInstance.errors, view:'create'
            return
        }

        resultInstance.save flush:true

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.created.message', args: [message(code: 'result.label', default: 'Result'), resultInstance.id])
                redirect resultInstance
            }
            '*' { respond resultInstance, [status: CREATED] }
        }
    }


    @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
    def update(Result resultInstance) {
        if (resultInstance == null) {
            notFound()
            return
        }

        if (resultInstance.hasErrors()) {
            respond resultInstance.errors, view:'index'
            return
        }

        resultInstance.save flush:true

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.updated.message', args: [message(code: 'Result.label', default: 'Result'), resultInstance.id])
                redirect resultInstance
            }
            '*'{ respond resultInstance, [status: OK] }
        }
    }

    @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
    def delete(Result resultInstance) {
        if (resultInstance == null) {
            notFound()
            return
        }

        resultInstance.delete flush:true

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.deleted.message', args: [message(code: 'Result.label', default: 'Result'), resultInstance.id])
                redirect action:"index", method:"GET"
            }
            '*'{ render status: NO_CONTENT }
        }
    }

    @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
    def updateOutlier(int exp_id, String barcode, String scope, int row, int col, String outlier) {
        def experiment = ExperimentalPlateSet.findById(exp_id);
        def plate = PlateSet.findByExperimentAndBarcode(experiment, barcode)
        def result = Result.findByExperiment(experiment)
        def resultPlate = ResultPlate.findByBarcode(barcode);
        def plateTemplate = plate.plate;

        def domainId;
        def labels = null;
        if (scope.toLowerCase() == "well") {
            def well = Well.findByPlateAndRowAndColumn(plateTemplate, row, col)
            println("Update outlier for well "+well.toString())
            domainId = ResultWell.findByPlateAndWell(resultPlate, well).id

            labels = ResultLabel.findAllByDomainIdAndScope(domainId, ResultLabel.LabelScope.WELL)
        }
        else if (scope.toLowerCase() == "plate") {
            domainId = ResultPlate.findByResultAndBarcode(result, barcode).id
            labels = ResultLabel.findAllByDomainIdAndScope(domainId, ResultLabel.LabelScope.PLATE);
        }

        if (labels == null || labels.isEmpty()) {
            render(contentType: "application/json") {
                [error: "Labels not found"]
            }
            return
        }

        labels.each { label ->
            label.outlier = outlier.toLowerCase()

            if (label.outlier != "true" && outlier != "false")
                label.domainId = null //to fail
            label.save(flush:true)

            if (label.hasErrors()) {
                throw new ValidationException('Some outlier status could not be saved',
                        label.errors)
            }
        }

        render(contentType: "application/json") {
            [message: "Outlier status set"]
        }
    }

//	@Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
//	def rrf_upload() {
//		render(view: "rrf_upload")
//	}
//	
//	def upload() {
//		List<String, MultipartFile> filesList = request.getFiles("filecsv[]");
//		
//		if (filesList.size() < 1) {
//			flash.message = 'file cannot be empty'
//			render(view: 'rrf_upload')
//			rrf.delete()
//			return
//		}
//		
//		def rrfRoot = grailsApplication.mainContext.servletContext.getRealPath('rrf')
//		def rrfRootDir = new File(rrfRoot)
//		if (!rrfRootDir.exists()) rrfRootDir.mkdir()
//		
//		filesList.each { f ->
//
//			RawResultFile rrf = new RawResultFile()
//			rrf.save(flush: true)
//			def rrfId = rrf.id
//			def destFolderPath = rrfRoot + "/" + rrfId
//			def destDir = new File(destFolderPath)
//
//			if (!destDir.exists()) destDir.mkdir()
//
//			def originalFName = f.getOriginalFilename();
//			def destFile = new File(destDir, originalFName)
//
//			f.transferTo(destFile)
//
//			rrf.fName = rrfId + "/" + originalFName
//			rrf.save(flush: true)
//		}
//		response.sendError(200, 'Done')
//	}
	
    protected void notFound() {
        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.not.found.message', args: [message(code: 'result.label', default: 'Result'), params.id])
                redirect controller: 'experimentalPlateSet', action: "index", method: "GET"
            }
            '*'{ render status: NOT_FOUND }
        }
    }
}
