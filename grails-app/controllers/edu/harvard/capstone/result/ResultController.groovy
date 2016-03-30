package edu.harvard.capstone.result

import grails.plugin.springsecurity.annotation.Secured
import edu.harvard.capstone.editor.ExperimentalPlateSet

import static org.springframework.http.HttpStatus.*
import grails.validation.ValidationException
import grails.converters.JSON

class ResultController {

    def springSecurityService
    def resultService

    static allowedMethods = [save: "POST", update: "PUT", delete: "DELETE"]


    @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
    def index(Integer max) {
        params.max = Math.min(max ?: 10, 100)
        respond Result.list(params), model:[resultInstanceCount: Result.count()]
    }
	
    @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
    def kitchenSink(ExperimentalPlateSet experiment) {
        if (!springSecurityService.isLoggedIn()){
            render(contentType: "application/json") {
                [error: "User not logged in"]
            }
            return
        } 

        if (experiment == null) {
            render(contentType: "application/json") {
                [error: "Result not found"]
            }
            return
        }

        if (experiment.hasErrors()) {
            render(contentType: "application/json") {
                [error: experiment.errors]
            }
            return   
        }

        def result = [ImportData: resultService.getKitchenSink(experiment)]
        render result as JSON
    }


    @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
    def create() {
        respond new Result(params)
    }


    @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
    def read(Result resultInstance){
        if (!springSecurityService.isLoggedIn()){
            render(contentType: "application/json") {
                [error: "User not logged in"]
            }
            return
        } 

        if (resultInstance == null) {
            render(contentType: "application/json") {
                [error: "Result not found"]
            }
            return
        }

        if (resultInstance.hasErrors()) {
            render(contentType: "application/json") {
                [error: resultInstance.errors]
            }
            return   
        }
        def result
        try{
            result = resultService.getResults(resultInstance)    
        }
        catch (ValidationException e) {
            render(contentType: "application/json") {
                [error: e.errors, message: e.message]
            }            
            return
        } catch (RuntimeException e) {
            render(contentType: "application/json") {
                [error: e.message]
            }  
            return                      
        }

        render(contentType: "application/json") {
            [ImportData: result]
        } 
    }


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
        respond experiment as Object, model:[importData: importData]
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
	def rrf_upload() {
		render(view: "rrf_upload")
	}
	
	def upload() {
		RawResultFile rrf = new RawResultFile()
		rrf.save(flush: true)
		def rrfId = rrf.id
		def destFolderPath = System.getProperty("user.home") + "/rrf/" + rrfId
		def destDir = new File(destFolderPath)
		
		if (!destDir.exists()) destDir.mkdir()
		def f = request.getFile('filecsv')
		if (f.empty) {
			flash.message = 'file cannot be empty'
			render(view: 'rrf_upload')
			rrf.delete()
			return
		}
	
		def originalFName = f.getOriginalFilename();
		def destFile = new File(destDir, originalFName)
		
		f.transferTo(destFile)
		
		rrf.fName = rrfId + "/" + originalFName
		rrf.save(flush: true)
		response.sendError(200, 'Done')
	}
	
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
