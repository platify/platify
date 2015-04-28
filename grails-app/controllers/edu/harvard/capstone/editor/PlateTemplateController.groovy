package edu.harvard.capstone.editor

import groovy.json.*
import static org.springframework.http.HttpStatus.*
import grails.validation.ValidationException
import grails.plugin.springsecurity.annotation.Secured

class PlateTemplateController {

    def editorService
    def springSecurityService

    static allowedMethods = [save: "POST", update: "PUT", delete: "DELETE"]

    @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
    def index(Integer max) {

        if(!springSecurityService.principal?.getAuthorities().any { it.authority == "ROLE_ADMIN" || it.authority == "ROLE_SUPER_ADMIN"}){
            params.owner = springSecurityService.principal
        }
  
        params.max = Math.min(max ?: 10, 100)
        respond PlateTemplate.list(params), model:[plateTemplateInstanceCount: PlateTemplate.count()]
    }

    def show(PlateTemplate plateTemplateInstance) {
        respond plateTemplateInstance
    }

	def create() {
        respond new PlateTemplate(params), model:[expId: params.expid, templateName: params.name, 
			gridWidth: params.width, gridHeight: params.height]
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
            [plate: plateTemplate]
        }        

    }
	
	def filterTemplateBySize = {
		def filterWidth;
		def filterHeight;
		def pList;
		
		switch(params.filterWells) {
			case "96 wells":
				filterWidth = "12";
				filterHeight = "8";
				break;
			case "384 wells":
				filterWidth = "24";
				filterHeight = "16";
				break;
			case "1536 wells":
				filterWidth = "48";
				filterHeight = "32";
				break;
			case "3456 wells":
				filterWidth = "72";
				filterHeight = "48";
				break;
			case "9600 wells":
				filterWidth = "120";
				filterHeight = "80";
				break;
			case "custom":
				filterWidth = "";	// need to send custom size as params
				filterHeight = "";
				break;
			default:
				// default to show all templates
				filterWidth = null;
				filterHeight = null;
				break;
		}
		
		if (filterWidth == null || filterHeight == null) {
			// no filter
			pList = edu.harvard.capstone.editor.PlateTemplate.list();
		} else {
			pList = edu.harvard.capstone.editor.PlateTemplate.list().findAll {
				it.width == filterWidth && it.height == filterHeight
			}
		}
		render(template: 'templateDropDown', model:  [filteredTemplateList: pList])
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
        def plateTemplateInstance
        try{
            plateTemplateInstance = editorService.newTemplate(data)
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
