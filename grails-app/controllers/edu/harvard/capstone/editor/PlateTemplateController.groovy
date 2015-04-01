package edu.harvard.capstone.editor

import groovy.json.*

import static org.springframework.http.HttpStatus.*
import grails.transaction.Transactional

@Transactional(readOnly = true)
class PlateTemplateController {

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

    @Transactional
    def save(PlateTemplate plateTemplateInstance) {
        if (plateTemplateInstance == null) {
            notFound()
            return
        }

        if (plateTemplateInstance.hasErrors()) {
            respond plateTemplateInstance.errors, view:'create'
            return
        }

        plateTemplateInstance.save flush:true

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.created.message', args: [message(code: 'plateTemplate.label', default: 'PlateTemplate'), plateTemplateInstance.id])
                redirect plateTemplateInstance
            }
            '*' { respond plateTemplateInstance, [status: CREATED] }
        }
    }

    def edit(PlateTemplate plateTemplateInstance) {
        respond plateTemplateInstance
    }

    @Transactional
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

    @Transactional
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
