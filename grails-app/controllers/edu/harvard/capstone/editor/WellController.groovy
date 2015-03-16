package edu.harvard.capstone.editor



import static org.springframework.http.HttpStatus.*
import grails.transaction.Transactional

@Transactional(readOnly = true)
class WellController {

    static allowedMethods = [save: "POST", update: "PUT", delete: "DELETE"]

    def index(Integer max) {
        params.max = Math.min(max ?: 10, 100)
        respond Well.list(params), model:[wellInstanceCount: Well.count()]
    }

    def show(Well wellInstance) {
        respond wellInstance
    }

    def create() {
        respond new Well(params)
    }

    @Transactional
    def save(Well wellInstance) {
        if (wellInstance == null) {
            notFound()
            return
        }

        if (wellInstance.hasErrors()) {
            respond wellInstance.errors, view:'create'
            return
        }

        wellInstance.save flush:true

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.created.message', args: [message(code: 'well.label', default: 'Well'), wellInstance.id])
                redirect wellInstance
            }
            '*' { respond wellInstance, [status: CREATED] }
        }
    }

    def edit(Well wellInstance) {
        respond wellInstance
    }

    @Transactional
    def update(Well wellInstance) {
        if (wellInstance == null) {
            notFound()
            return
        }

        if (wellInstance.hasErrors()) {
            respond wellInstance.errors, view:'edit'
            return
        }

        wellInstance.save flush:true

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.updated.message', args: [message(code: 'Well.label', default: 'Well'), wellInstance.id])
                redirect wellInstance
            }
            '*'{ respond wellInstance, [status: OK] }
        }
    }

    @Transactional
    def delete(Well wellInstance) {

        if (wellInstance == null) {
            notFound()
            return
        }

        wellInstance.delete flush:true

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.deleted.message', args: [message(code: 'Well.label', default: 'Well'), wellInstance.id])
                redirect action:"index", method:"GET"
            }
            '*'{ render status: NO_CONTENT }
        }
    }

    protected void notFound() {
        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.not.found.message', args: [message(code: 'well.label', default: 'Well'), params.id])
                redirect action: "index", method: "GET"
            }
            '*'{ render status: NOT_FOUND }
        }
    }
}
