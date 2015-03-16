package edu.harvard.capstone.editor



import static org.springframework.http.HttpStatus.*
import grails.transaction.Transactional

@Transactional(readOnly = true)
class PlateSetController {

    static allowedMethods = [save: "POST", update: "PUT", delete: "DELETE"]

    def index(Integer max) {
        params.max = Math.min(max ?: 10, 100)
        respond PlateSet.list(params), model:[plateSetInstanceCount: PlateSet.count()]
    }

    def show(PlateSet plateSetInstance) {
        respond plateSetInstance
    }

    def create() {
        respond new PlateSet(params)
    }

    @Transactional
    def save(PlateSet plateSetInstance) {
        if (plateSetInstance == null) {
            notFound()
            return
        }

        if (plateSetInstance.hasErrors()) {
            respond plateSetInstance.errors, view:'create'
            return
        }

        plateSetInstance.save flush:true

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.created.message', args: [message(code: 'plateSet.label', default: 'PlateSet'), plateSetInstance.id])
                redirect plateSetInstance
            }
            '*' { respond plateSetInstance, [status: CREATED] }
        }
    }

    def edit(PlateSet plateSetInstance) {
        respond plateSetInstance
    }

    @Transactional
    def update(PlateSet plateSetInstance) {
        if (plateSetInstance == null) {
            notFound()
            return
        }

        if (plateSetInstance.hasErrors()) {
            respond plateSetInstance.errors, view:'edit'
            return
        }

        plateSetInstance.save flush:true

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.updated.message', args: [message(code: 'PlateSet.label', default: 'PlateSet'), plateSetInstance.id])
                redirect plateSetInstance
            }
            '*'{ respond plateSetInstance, [status: OK] }
        }
    }

    @Transactional
    def delete(PlateSet plateSetInstance) {

        if (plateSetInstance == null) {
            notFound()
            return
        }

        plateSetInstance.delete flush:true

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.deleted.message', args: [message(code: 'PlateSet.label', default: 'PlateSet'), plateSetInstance.id])
                redirect action:"index", method:"GET"
            }
            '*'{ render status: NO_CONTENT }
        }
    }

    protected void notFound() {
        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.not.found.message', args: [message(code: 'plateSet.label', default: 'PlateSet'), params.id])
                redirect action: "index", method: "GET"
            }
            '*'{ render status: NOT_FOUND }
        }
    }
}
