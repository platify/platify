package edu.harvard.capstone.parser



import static org.springframework.http.HttpStatus.*
import grails.transaction.Transactional

@Transactional(readOnly = true)
class EquipmentController {

    static allowedMethods = [save: "POST", update: "PUT", delete: "DELETE"]

    def index(Integer max) {
        params.max = Math.min(max ?: 10, 100)
        respond Equipment.list(params), model:[equipmentInstanceCount: Equipment.count()]
    }

    def show(Equipment equipmentInstance) {
        respond equipmentInstance
    }

    def create() {
        respond new Equipment(params)
    }

    @Transactional
    def save(Equipment equipmentInstance) {
        if (equipmentInstance == null) {
            notFound()
            return
        }

        if (equipmentInstance.hasErrors()) {
            respond equipmentInstance.errors, view:'create'
            return
        }

        equipmentInstance.save flush:true

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.created.message', args: [message(code: 'equipment.label', default: 'Equipment'), equipmentInstance.id])
                redirect equipmentInstance
            }
            '*' { respond equipmentInstance, [status: CREATED] }
        }
    }

    def edit(Equipment equipmentInstance) {
        respond equipmentInstance
    }

    @Transactional
    def update(Equipment equipmentInstance) {
        if (equipmentInstance == null) {
            notFound()
            return
        }

        if (equipmentInstance.hasErrors()) {
            respond equipmentInstance.errors, view:'edit'
            return
        }

        equipmentInstance.save flush:true

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.updated.message', args: [message(code: 'Equipment.label', default: 'Equipment'), equipmentInstance.id])
                redirect equipmentInstance
            }
            '*'{ respond equipmentInstance, [status: OK] }
        }
    }

    @Transactional
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
