package edu.harvard.capstone.liquid

import edu.harvard.capstone.editor.LiquidHandler
import edu.harvard.capstone.user.Scientist

import grails.converters.JSON

import org.codehaus.groovy.grails.web.json.JSONObject
import grails.validation.ValidationException

import grails.transaction.Transactional

@Transactional
class LiquidService {

    def springSecurityService

    def newMapper(String name, String inputPlateId, String inputWell, String inputDose, String outputPlateId, String outputWell, String outputDose) {
        def scientistInstance = Scientist.get(springSecurityService.principal.id)
        if (!scientistInstance)
            return

        def mapperInstance = new LiquidHandler(name: name, inputPlateId: inputPlateId, inputWell: inputWell, inputDose: inputDose, outputPlateId: outputPlateId, outputWell: outputWell, outputDose: outputDose)
        mapperInstance.save()
        mapperInstance
    }
}
