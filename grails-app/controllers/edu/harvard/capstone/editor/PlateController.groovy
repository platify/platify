package edu.harvard.capstone.editor

import groovy.json.*

import static org.springframework.http.HttpStatus.*
import grails.plugin.springsecurity.annotation.Secured

import grails.validation.ValidationException

class PlateController {

    def editorService
    def springSecurityService

    static allowedMethods = [save: "POST", update: "PUT", delete: "DELETE"]

    def read(PlateSet plateSetInstance){

        if (!springSecurityService.isLoggedIn()){
            render(contentType: "application/json") {
                [error: "User not logged in"]
            }
            return
        } 

        if (plateSetInstance == null) {
            render(contentType: "application/json") {
                [error: "Plate not found"]
            }
            return
        }

        if (plateSetInstance.hasErrors()) {
            render(contentType: "application/json") {
                [error: plateSetInstance.errors]
            }
            return   
        }

        def plateInstance = editorService.getPlate(plateSetInstance)

        render(contentType: "application/json") {
            [plate: plateInstance]
        }        

    }

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
        def plateInstance
        try{
            plateInstance = editorService.newPlate(data)
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

        if(plateInstance == null){
            render(contentType: "application/json") {
                [error: "Error creating the plate"]
            }
            return
        }

       /* if(plateTemplateInstance.hasErrors()){
            render(contentType: "application/json") {
                [error: plateTemplateInstance.errors]
            }
            return            
        }*/

        render(contentType: "application/json") {
            [plate: plateInstance]
        }
   }

    def getPlates(ExperimentalPlateSet experimentalPlateSetInstance){
        if (!experimentalPlateSetInstance) {
            render(contentType: "application/json") {
                [error: "No data received"]
            }
            return
        }

        def plates = PlateSet.findAllByExperiment(experimentalPlateSetInstance)
        render(contentType: "application/json") {
            [plates: plates]
        }


    }

    def getCompounds(){
        def CompoundList = editorService.getCompoundList()

        render(contentType: "application/json") {
            [compound: CompoundList]
        }

    }




    @Secured(['permitAll'])
    def debug(Long id){
/*
    File exportPlate(PlateSet plateInstance){

    File exportTemplate(PlateTemplate templateInstance){

*/
        def file = editorService.exportPlate(PlateSet.get(id))
        //def file = editorService.exportTemplate(PlateTemplate.get(id))
        response.setHeader "Content-disposition", "attachment; filename=${file.name}.csv"
        response.contentType = 'text-plain'
        response.outputStream << file.text
        response.outputStream.flush()
    }
}
