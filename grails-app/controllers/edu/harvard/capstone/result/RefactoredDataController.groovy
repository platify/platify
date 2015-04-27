package edu.harvard.capstone.result


import grails.plugin.springsecurity.annotation.Secured
import grails.validation.ValidationException

import static org.springframework.http.HttpStatus.*

class RefactoredDataController {

    static allowedMethods = [save: "POST", update: "PUT", delete: "DELETE"]


    def save(Result resultInstance) {

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
            resultService.storeNormalizedData(resultInstance, data)
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
