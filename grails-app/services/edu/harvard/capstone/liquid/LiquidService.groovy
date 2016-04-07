package edu.harvard.capstone.liquid

import edu.harvard.capstone.editor.DomainLabel
import edu.harvard.capstone.editor.LiquidHandler
import edu.harvard.capstone.editor.PlateTemplate
import edu.harvard.capstone.editor.Well
import edu.harvard.capstone.user.Scientist

import grails.converters.JSON

import org.codehaus.groovy.grails.web.json.JSONObject
import grails.validation.ValidationException

import grails.transaction.Transactional

@Transactional
class LiquidService {

    def springSecurityService

    /**
     * Create new Liquid Handler Mapper
     *
     * @param name
     * @param inputPlateId
     * @param inputWell
     * @param inputDose
     * @param outputPlateId
     * @param outputWell
     * @param outputDose
     * @return
     */
    def newMapper(String name, String inputPlateId, String inputWell, String inputDose, String outputPlateId, String outputWell, String outputDose) {
        def scientistInstance = Scientist.get(springSecurityService.principal.id)
        if (!scientistInstance)
            return

        def mapperInstance = new LiquidHandler(name: name, inputPlateId: inputPlateId, inputWell: inputWell, inputDose: inputDose, outputPlateId: outputPlateId, outputWell: outputWell, outputDose: outputDose)
        mapperInstance.save()
        mapperInstance
    }

    /**
     * Export Liquid Handler Mappings to CSV
     *
     * @param liquidHandlerInstance
     * @return
     */

    File exportLiquidHandlerMapper(LiquidHandler liquidHandlerInstance){
        if (!liquidHandlerInstance)
            return

        def lh = LiquidHandler.findAllById(liquidHandlerInstance)

        File file = File.createTempFile("liquidhandlermapper",".csv")

        lh.each{ l ->
            def row = ""
            row = row + l.name + ","
            row = row + l.inputPlateId + ","
            row = row + l.inputWell + ","
            row = row + l.inputDose + ","
            row = row + l.outputPlateId + ","
            row = row + l.outputWell + ","
            row = row + l.outputDose
            file.append(row+"\r\n")
        }

        return file
    }

}
