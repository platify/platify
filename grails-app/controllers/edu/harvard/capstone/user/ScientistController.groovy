package edu.harvard.capstone.user



import static org.springframework.http.HttpStatus.*
import grails.transaction.Transactional

@Transactional(readOnly = true)
class ScientistController {

    static allowedMethods = [save: "POST", update: "PUT", delete: "DELETE"]

    def index(Integer max) {
        params.max = Math.min(max ?: 10, 100)
        respond Scientist.list(params), model:[scientistInstanceCount: Scientist.count()]
    }

    def show(Scientist scientistInstance) {
        respond scientistInstance
    }

    def create() {
        respond new Scientist(params)
    }

    @Transactional
    def save(Scientist scientistInstance) {
        if (scientistInstance == null) {
            notFound()
            return
        }

        if (scientistInstance.hasErrors()) {
            respond scientistInstance.errors, view:'create'
            return
        }

        scientistInstance.save flush:true

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.created.message', args: [message(code: 'scientist.label', default: 'Scientist'), scientistInstance.id])
                redirect scientistInstance
            }
            '*' { respond scientistInstance, [status: CREATED] }
        }
    }

    def edit(Scientist scientistInstance) {
        respond scientistInstance
    }

    @Transactional
    def update(Scientist scientistInstance) {
        if (scientistInstance == null) {
            notFound()
            return
        }

        if (scientistInstance.hasErrors()) {
            respond scientistInstance.errors, view:'edit'
            return
        }

        scientistInstance.save flush:true

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.updated.message', args: [message(code: 'Scientist.label', default: 'Scientist'), scientistInstance.id])
                redirect scientistInstance
            }
            '*'{ respond scientistInstance, [status: OK] }
        }
    }

    @Transactional
    def delete(Scientist scientistInstance) {

        if (scientistInstance == null) {
            notFound()
            return
        }

        scientistInstance.delete flush:true

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.deleted.message', args: [message(code: 'Scientist.label', default: 'Scientist'), scientistInstance.id])
                redirect action:"index", method:"GET"
            }
            '*'{ render status: NO_CONTENT }
        }
    }

    protected void notFound() {
        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.not.found.message', args: [message(code: 'scientist.label', default: 'Scientist'), params.id])
                redirect action: "index", method: "GET"
            }
            '*'{ render status: NOT_FOUND }
        }
    }
}
