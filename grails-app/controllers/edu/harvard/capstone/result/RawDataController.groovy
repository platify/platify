package edu.harvard.capstone.result

import grails.plugin.springsecurity.annotation.Secured

import static org.springframework.http.HttpStatus.*

class RawDataController {

    def springSecurityService
    def resultService

    static allowedMethods = [save: "POST", update: "PUT", delete: "DELETE"]

    def save() {
        if (!springSecurityService.isLoggedIn()){
            render(contentType: "application/json") {
                [error: "User not logged in"]
            }
            return
        } 
        
        def data = request.JSON        
        
        if (!data) {
            render(contentType: "application/json") {
                [error: "No data received"]
            }
            return
        }

        def plateTemplateInstance = resultService.newRawData(data)

        if(plateTemplateInstance == null){
            render(contentType: "application/json") {
                [error: "Error creating the plate template"]
            }
            return
        }

        if(plateTemplateInstance.hasErrors()){
            render(contentType: "application/json") {
                [error: plateTemplateInstance.errors]
            }
            return            
        }

        render(contentType: "application/json") {
            [plateTemplate: plateTemplateInstance]
        }

    }

}
