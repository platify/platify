package edu.harvard.capstone.parser



import static org.springframework.http.HttpStatus.*
import grails.transaction.Transactional

@Transactional(readOnly = true)
class ParserAttributeController {

    static allowedMethods = [save: "POST", update: "PUT", delete: "DELETE"]

    def index(Integer max) {
        params.max = Math.min(max ?: 10, 100)
        respond ParserAttribute.list(params), model:[parserAttributeInstanceCount: ParserAttribute.count()]
    }

    def show(ParserAttribute parserAttributeInstance) {
        respond parserAttributeInstance
    }

    def create() {
        respond new ParserAttribute(params)
    }

    @Transactional
    def save(ParserAttribute parserAttributeInstance) {
        if (parserAttributeInstance == null) {
            notFound()
            return
        }

        if (parserAttributeInstance.hasErrors()) {
            respond parserAttributeInstance.errors, view:'create'
            return
        }

        parserAttributeInstance.save flush:true

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.created.message', args: [message(code: 'parserAttribute.label', default: 'ParserAttribute'), parserAttributeInstance.id])
                redirect parserAttributeInstance
            }
            '*' { respond parserAttributeInstance, [status: CREATED] }
        }
    }

    def edit(ParserAttribute parserAttributeInstance) {
        respond parserAttributeInstance
    }

    @Transactional
    def update(ParserAttribute parserAttributeInstance) {
        if (parserAttributeInstance == null) {
            notFound()
            return
        }

        if (parserAttributeInstance.hasErrors()) {
            respond parserAttributeInstance.errors, view:'edit'
            return
        }

        parserAttributeInstance.save flush:true

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.updated.message', args: [message(code: 'ParserAttribute.label', default: 'ParserAttribute'), parserAttributeInstance.id])
                redirect parserAttributeInstance
            }
            '*'{ respond parserAttributeInstance, [status: OK] }
        }
    }

    @Transactional
    def delete(ParserAttribute parserAttributeInstance) {

        if (parserAttributeInstance == null) {
            notFound()
            return
        }

        parserAttributeInstance.delete flush:true

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.deleted.message', args: [message(code: 'ParserAttribute.label', default: 'ParserAttribute'), parserAttributeInstance.id])
                redirect action:"index", method:"GET"
            }
            '*'{ render status: NO_CONTENT }
        }
    }

    protected void notFound() {
        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.not.found.message', args: [message(code: 'parserAttribute.label', default: 'ParserAttribute'), params.id])
                redirect action: "index", method: "GET"
            }
            '*'{ render status: NOT_FOUND }
        }
    }
}
