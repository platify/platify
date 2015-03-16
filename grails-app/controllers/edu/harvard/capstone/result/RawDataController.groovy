package edu.harvard.capstone.result



import static org.springframework.http.HttpStatus.*
import grails.transaction.Transactional

@Transactional(readOnly = true)
class RawDataController {

    static allowedMethods = [save: "POST", update: "PUT", delete: "DELETE"]

    def index(Integer max) {
        params.max = Math.min(max ?: 10, 100)
        respond RawData.list(params), model:[rawDataInstanceCount: RawData.count()]
    }

    def show(RawData rawDataInstance) {
        respond rawDataInstance
    }

    def create() {
        respond new RawData(params)
    }

    @Transactional
    def save(RawData rawDataInstance) {
        if (rawDataInstance == null) {
            notFound()
            return
        }

        if (rawDataInstance.hasErrors()) {
            respond rawDataInstance.errors, view:'create'
            return
        }

        rawDataInstance.save flush:true

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.created.message', args: [message(code: 'rawData.label', default: 'RawData'), rawDataInstance.id])
                redirect rawDataInstance
            }
            '*' { respond rawDataInstance, [status: CREATED] }
        }
    }

    def edit(RawData rawDataInstance) {
        respond rawDataInstance
    }

    @Transactional
    def update(RawData rawDataInstance) {
        if (rawDataInstance == null) {
            notFound()
            return
        }

        if (rawDataInstance.hasErrors()) {
            respond rawDataInstance.errors, view:'edit'
            return
        }

        rawDataInstance.save flush:true

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.updated.message', args: [message(code: 'RawData.label', default: 'RawData'), rawDataInstance.id])
                redirect rawDataInstance
            }
            '*'{ respond rawDataInstance, [status: OK] }
        }
    }

    @Transactional
    def delete(RawData rawDataInstance) {

        if (rawDataInstance == null) {
            notFound()
            return
        }

        rawDataInstance.delete flush:true

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.deleted.message', args: [message(code: 'RawData.label', default: 'RawData'), rawDataInstance.id])
                redirect action:"index", method:"GET"
            }
            '*'{ render status: NO_CONTENT }
        }
    }

    protected void notFound() {
        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.not.found.message', args: [message(code: 'rawData.label', default: 'RawData'), params.id])
                redirect action: "index", method: "GET"
            }
            '*'{ render status: NOT_FOUND }
        }
    }
}
