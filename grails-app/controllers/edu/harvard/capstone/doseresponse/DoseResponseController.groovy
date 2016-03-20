package edu.harvard.capstone.doseresponse

import grails.plugin.springsecurity.annotation.Secured
import edu.harvard.capstone.editor.ExperimentalPlateSet

import static org.springframework.http.HttpStatus.*
import grails.validation.ValidationException
import grails.converters.JSON

class DoseResponseController {

    def springSecurityService
    def resultService

    static allowedMethods = [save: "POST", update: "PUT", delete: "DELETE"]


    @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
    def show(Integer max) {

    }
}
