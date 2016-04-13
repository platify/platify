package edu.harvard.capstone.user

import grails.converters.JSON

import grails.plugin.springsecurity.annotation.Secured

import static org.springframework.http.HttpStatus.*

class ScientistController {

    def scientistService 
    def springSecurityService

    static allowedMethods = [save: "POST", update: "PUT", delete: "DELETE", export: "GET"]

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

    @Secured(['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
    def save(String firstName, String lastName, String password, String email, Boolean admin) {

        if (!springSecurityService.isLoggedIn()){
            redirect action: "index", method: "GET"
            return
        }  

        def scientistInstance = scientistService.newUser(firstName, lastName, password, email, admin)

         if (scientistInstance == null) {
            notFound()
            return
        }

        if (scientistInstance.hasErrors()) {
            respond scientistInstance.errors, view:'create'
            return
        }       


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

    @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
    def xml() {
        //render scientistInstance as JSON.use('deep')
        respond Scientist.getAll(), [formats:['xml']]
    }

    @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
    def json() {
        //render scientistInstance as JSON.use('deep')
        respond Scientist.getAll(), [formats:['json']]
    }


    def update(Long id, String firstName, String lastName, String password, String email, Boolean admin) {
        def scientistInstance = Scientist.get(id)
        if (scientistInstance == null) {
            notFound()
            return
        }

        scientistInstance = scientistService.updateUser(scientistInstance, firstName, lastName, password, email, admin)

        if (scientistInstance.hasErrors()) {
            respond scientistInstance.errors, view:'edit'
            return
        }

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.updated.message', args: [message(code: 'Scientist.label', default: 'Scientist'), scientistInstance.id])
                redirect scientistInstance
            }
            '*'{ respond scientistInstance, [status: OK] }
        }
    }

    def delete(Scientist scientistInstance) {

        if (scientistInstance == null) {
            notFound()
            return
        }
        def id = scientistInstance.id
        
        scientistService.deleteUser(scientistInstance)

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.deleted.message', args: [message(code: 'Scientist.label', default: 'Scientist'), id])
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
