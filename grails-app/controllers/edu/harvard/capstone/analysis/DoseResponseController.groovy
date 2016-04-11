package edu.harvard.capstone.analysis

import edu.harvard.capstone.editor.DomainLabel
import edu.harvard.capstone.editor.PlateSet
import edu.harvard.capstone.editor.Well
import edu.harvard.capstone.editor.WellCompound
import edu.harvard.capstone.result.Result
import edu.harvard.capstone.result.ResultLabel
import edu.harvard.capstone.result.ResultPlate
import edu.harvard.capstone.result.ResultWell
import edu.harvard.capstone.editor.WellCompound
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


