package edu.harvard.capstone.result


import grails.plugin.springsecurity.annotation.Secured
import grails.validation.ValidationException

import static org.springframework.http.HttpStatus.*

import grails.validation.ValidationException

class RefactoredDataController {
    
    def springSecurityService
    def resultService
    
    static allowedMethods = [save: "POST", update: "PUT", delete: "DELETE"]


    def save(Long id) {
        def resultInstance = Result.get(id)

        if (!resultInstance){
            render(contentType: "application/json") {
                [error: "No result was specified"]
            }
            return
        } 


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

        try{
            resultInstance = resultService.storeNormalizedData(resultInstance, data)
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
                [error: "Error storing the normalized data"]
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

}
