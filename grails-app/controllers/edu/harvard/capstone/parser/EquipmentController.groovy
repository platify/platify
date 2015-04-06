package edu.harvard.capstone.parser

import edu.harvard.capstone.editor.ExperimentalPlateSet

import static org.springframework.http.HttpStatus.*

import grails.plugin.springsecurity.annotation.Secured

class EquipmentController {

    def springSecurityService
    def parserService

    static allowedMethods = [save: "POST", update: "PUT", delete: "DELETE"]

    def index(Integer max) {
        params.max = Math.min(max ?: 10, 100)
        respond Equipment.list(params), model:[equipmentInstanceCount: Equipment.count()]
    }

    def show(Equipment equipmentInstance) {
        render(contentType: "application/json") {
            [equipment: equipmentInstance]
        }
    }

    def create() {
        respond new Equipment(params)
    }

    @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
    def selectexperiment(Equipment equipmentInstance, Integer max){
        if (!springSecurityService.isLoggedIn())
            return

        if(!springSecurityService.principal?.getAuthorities().any { it.authority == "ROLE_ADMIN" || it.authority == "ROLE_SUPER_ADMIN"}){
            params.owner = springSecurityService.principal
        }
        
        params.max = Math.min(max ?: 10, 100)
        respond ExperimentalPlateSet.list(params), model:[experimentalPlateSetInstanceCount: ExperimentalPlateSet.count(), equipmentInstance: equipmentInstance]
    }

    @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
    def parse(Long equipment, Long experiment){
        if (!equipment || !experiment) {
            notFound()
            return
        }

        def equipmentInstance = Equipment.get(equipment)
        def experimentInstance = ExperimentalPlateSet.get(experiment)

        if (!equipmentInstance || !experimentInstance) {
            notFound()
            return
        }

        respond equipmentInstance, model:[equipmentInstance: equipmentInstance, experimentInstance: experimentInstance]
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

        def equipmentInstance = parserService.newEquipment(data.name, data.machineName, data.description, data.toString())

        if(equipmentInstance == null){
            render(contentType: "application/json") {
                [error: "Error creating the equipment"]
            }
            return
        }

        if(equipmentInstance.hasErrors()){
            render(contentType: "application/json") {
                [error: equipmentInstance.errors]
            }
            return            
        }

        render(contentType: "application/json") {
            [equipment: equipmentInstance]
        }
    }

    def edit(Equipment equipmentInstance) {
        respond equipmentInstance
    }


    def update(Equipment equipmentInstance) {
        if (equipmentInstance == null) {
            render(contentType: "application/json") {
                [error: "Equipment not found"]
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

        equipmentInstance = parserService.updateEquipment(equipmentInstance, data.name, data.machineName, data.description, data.toString())

        if (equipmentInstance.hasErrors()) {
            render(contentType: "application/json") {
                [error: "Error updating the equipment", errors: equipmentInstance.errors]
            }
            return            
        }

        render(contentType: "application/json") {
            [equipment: equipmentInstance]
        }
    }


    def delete(Equipment equipmentInstance) {

        if (equipmentInstance == null) {
            notFound()
            return
        }

        equipmentInstance.delete flush:true

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.deleted.message', args: [message(code: 'Equipment.label', default: 'Equipment'), equipmentInstance.id])
                redirect action:"index", method:"GET"
            }
            '*'{ render status: NO_CONTENT }
        }
    }

    protected void notFound() {
        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.not.found.message', args: [message(code: 'equipment.label', default: 'Equipment'), params.id])
                redirect action: "index", method: "GET"
            }
            '*'{ render status: NOT_FOUND }
        }
    }
}
