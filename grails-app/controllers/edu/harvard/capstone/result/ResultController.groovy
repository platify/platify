package edu.harvard.capstone.result

import grails.plugin.springsecurity.annotation.Secured

import static org.springframework.http.HttpStatus.*
import grails.validation.ValidationException

class ResultController {

    def springSecurityService
    def resultService

    static allowedMethods = [save: "POST", update: "PUT", delete: "DELETE"]

    def index(Integer max) {
        params.max = Math.min(max ?: 10, 100)
        respond Result.list(params), model:[resultInstanceCount: Result.count()]
    }

    def show(Result resultInstance) {
        respond resultInstance
    }

    def create() {
        respond new Result(params)
    }

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

    def edit(Result resultInstance) {
        respond resultInstance
    }

    def update(Result resultInstance) {
        if (resultInstance == null) {
            notFound()
            return
        }

        if (resultInstance.hasErrors()) {
            respond resultInstance.errors, view:'edit'
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

    protected void notFound() {
        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.not.found.message', args: [message(code: 'result.label', default: 'Result'), params.id])
                redirect action: "index", method: "GET"
            }
            '*'{ render status: NOT_FOUND }
        }
    }
}
