package edu.harvard.capstone.editor

import groovy.json.*

import static org.springframework.http.HttpStatus.*

import grails.validation.ValidationException


class PlateTemplateController {

    def editorService
    def springSecurityService

    static allowedMethods = [save: "POST", update: "PUT", delete: "DELETE"]

    def index(Integer max) {
        params.max = Math.min(max ?: 10, 100)
        respond PlateTemplate.list(params), model:[plateTemplateInstanceCount: PlateTemplate.count()]
    }

    def show(PlateTemplate plateTemplateInstance) {
        respond plateTemplateInstance
    }

    def create() {
        respond new PlateTemplate(params)
    }

    def getPlate(PlateTemplate plateTemplateInstance){
        if (!springSecurityService.isLoggedIn()){
            render(contentType: "application/json") {
                [error: "User not logged in"]
            }
            return
        } 

        if (plateTemplateInstance == null) {
            render(contentType: "application/json") {
                [error: "Plate template not found"]
            }
            return
        }

        if (plateTemplateInstance.hasErrors()) {
            render(contentType: "application/json") {
                [error: plateTemplateInstance.errors]
            }
            return   
        }

        def plateTemplate = editorService.getTemplate(plateTemplateInstance)

        render(contentType: "application/json") {
            [plate: plateTemplateInstance]
        }        

    }

    def save() {
        if (!springSecurityService.isLoggedIn()){
            render(contentType: "application/json") {
                [error: "User not logged in"]
            }
            return
        } 
        
        def data = request.JSON        
        
        if (!data) {
            render(contentType: "application/json") {
                [error: "No data received"]
            }
            return
        }

        try{
            def plateTemplateInstance = editorService.newTemplate(data)
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

        if(plateTemplateInstance == null){
            render(contentType: "application/json") {
                [error: "Error creating the plate template"]
            }
            return
        }

       /* if(plateTemplateInstance.hasErrors()){
            render(contentType: "application/json") {
                [error: plateTemplateInstance.errors]
            }
            return            
        }*/

        render(contentType: "application/json") {
            [plateTemplate: plateTemplateInstance]
        }
   }

    def edit(PlateTemplate plateTemplateInstance) {
        respond plateTemplateInstance
    }

    def update(PlateTemplate plateTemplateInstance) {
        if (plateTemplateInstance == null) {
            notFound()
            return
        }

        if (plateTemplateInstance.hasErrors()) {
            respond plateTemplateInstance.errors, view:'edit'
            return
        }

        plateTemplateInstance.save flush:true

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.updated.message', args: [message(code: 'PlateTemplate.label', default: 'PlateTemplate'), plateTemplateInstance.id])
                redirect plateTemplateInstance
            }
            '*'{ respond plateTemplateInstance, [status: OK] }
        }
    }

    def delete(PlateTemplate plateTemplateInstance) {

        if (plateTemplateInstance == null) {
            notFound()
            return
        }

        plateTemplateInstance.delete flush:true

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.deleted.message', args: [message(code: 'PlateTemplate.label', default: 'PlateTemplate'), plateTemplateInstance.id])
                redirect action:"index", method:"GET"
            }
            '*'{ render status: NO_CONTENT }
        }
    }

    protected void notFound() {
        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.not.found.message', args: [message(code: 'plateTemplate.label', default: 'PlateTemplate'), params.id])
                redirect action: "index", method: "GET"
            }
            '*'{ render status: NOT_FOUND }
        }
    }
}
