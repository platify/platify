package edu.harvard.capstone.result

import grails.plugin.springsecurity.annotation.Secured

import static org.springframework.http.HttpStatus.*

import grails.validation.ValidationException

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
        def resultInstance
        try{
            resultInstance = resultService.newRawData(data)
        }
        catch (ValidationException e) {
            render(contentType: "application/json") {
                [error: e.errors, message: e.message]
            }            
            return
        } catch (RuntimeException e) {
            render(contentType: "application/json") {
                [error: e.message]
            }  
            return                      
        }
        if(resultInstance == null){
            render(contentType: "application/json") {
                [error: "Error storing the raw data"]
            }
            return
        }

        if(resultInstance.hasErrors()){
            render(contentType: "application/json") {
                [error: resultInstance.errors]
            }
            return            
        }

        render(contentType: "application/json") {
            [resultInstance: resultInstance]
        }

    }

    def show(Result resultInstance) {
        render(contentType: "application/json") {
            [resultInstance: resultInstance]
	}
    }

}
