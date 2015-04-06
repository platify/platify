package edu.harvard.capstone.editor


import static org.springframework.http.HttpStatus.*
import edu.harvard.capstone.parser.Equipment;
import grails.plugin.springsecurity.annotation.Secured

class ExperimentalPlateSetController {

    def springSecurityService
    def editorService

    static allowedMethods = [save: "POST", update: "PUT", delete: "DELETE"]


    @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
    def index(Integer max) {
        if (!springSecurityService.isLoggedIn())
            return

        if(!springSecurityService.principal?.getAuthorities().any { it.authority == "ROLE_ADMIN" || it.authority == "ROLE_SUPER_ADMIN"}){
            params.owner = springSecurityService.principal
        }
        
        params.max = Math.min(max ?: 10, 100)
        respond ExperimentalPlateSet.list(params), model:[experimentalPlateSetInstanceCount: ExperimentalPlateSet.count()]
    }

    def show(ExperimentalPlateSet experimentalPlateSetInstance) {
        respond experimentalPlateSetInstance
    }

    def create() {
        respond new ExperimentalPlateSet(params)
    }
	
	def showactions(ExperimentalPlateSet experimentalPlateSetInstance) {
		respond experimentalPlateSetInstance
	}
	
	def createPlate(PlateTemplate templateInstance) {
		[templateId: templateInstance.id]
	}
	
	def selectTemplate(ExperimentalPlateSet experimentalPlateSetInstance) {
		respond experimentalPlateSetInstance
	}

    def save(String name, String description) {

        if (!springSecurityService.isLoggedIn()){
            redirect action: "index", method: "GET"
            return
        }  

        def experimentalPlateSetInstance = editorService.newExperiment(name, description)

         if (experimentalPlateSetInstance == null) {
            notFound()
            return
        }

        if (experimentalPlateSetInstance.hasErrors()) {
            respond experimentalPlateSetInstance.errors, view:'create'
            return
        }  
        
        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.created.message', args: [message(code: 'experimentalPlateSet.label', default: 'ExperimentalPlateSet'), experimentalPlateSetInstance.id])
                redirect experimentalPlateSetInstance
            }
            '*' { respond experimentalPlateSetInstance, [status: CREATED] }
        }
    }

    def edit(ExperimentalPlateSet experimentalPlateSetInstance) {
        respond experimentalPlateSetInstance
    }


    def update(ExperimentalPlateSet experimentalPlateSetInstance) {
        if (experimentalPlateSetInstance == null) {
            notFound()
            return
        }

        if (experimentalPlateSetInstance.hasErrors()) {
            respond experimentalPlateSetInstance.errors, view:'edit'
            return
        }

        experimentalPlateSetInstance.save flush:true

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.updated.message', args: [message(code: 'ExperimentalPlateSet.label', default: 'ExperimentalPlateSet'), experimentalPlateSetInstance.id])
                redirect experimentalPlateSetInstance
            }
            '*'{ respond experimentalPlateSetInstance, [status: OK] }
        }
    }

    def delete(ExperimentalPlateSet experimentalPlateSetInstance) {

        if (experimentalPlateSetInstance == null) {
            notFound()
            return
        }

        experimentalPlateSetInstance.delete flush:true

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.deleted.message', args: [message(code: 'ExperimentalPlateSet.label', default: 'ExperimentalPlateSet'), experimentalPlateSetInstance.id])
                redirect action:"index", method:"GET"
            }
            '*'{ render status: NO_CONTENT }
        }
    }

    protected void notFound() {
        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.not.found.message', args: [message(code: 'experimentalPlateSet.label', default: 'ExperimentalPlateSet'), params.id])
                redirect action: "index", method: "GET"
            }
            '*'{ render status: NOT_FOUND }
        }
    }
}
