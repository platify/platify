package edu.harvard.capstone.liquid

import edu.harvard.capstone.editor.LiquidHandler
import edu.harvard.capstone.user.Scientist
import groovy.json.*

import static grails.async.Promises.*

import grails.transaction.Transactional

@Transactional
class LiquidService {
    Random random = new Random()

    def springSecurityService

    def newMapper(String name, String url, Integer inputPlatesCount, Integer outputPlatesCount, String configStatus) {
        def scientistInstance = Scientist.get(springSecurityService.principal.id)
        if (!scientistInstance)
            return

        def mapperInstance = new LiquidHandler(name: name, url: url, inputPlatesCount: inputPlatesCount, outputPlatesCount: outputPlatesCount, configStatus: configStatus)
        mapperInstance.save()


        // Call LH web service with async call to get config
        def p = task {
            getLiquidHandlerConfiguration(mapperInstance)
        }

        p.onError { Throwable err ->
            System.out.println("An error occurred in the async task: ${err.message}")
        }

        p.onComplete {
            System.out.println("complete!")
        }

        mapperInstance
    }

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

    def updateMapper(LiquidHandler liquidHandlerInstance, String name, String url, Integer inputPlatesCount, Integer outputPlatesCount, String configStatus) {
        liquidHandlerInstance.name = name
        liquidHandlerInstance.url = url
        liquidHandlerInstance.inputPlatesCount = inputPlatesCount
        liquidHandlerInstance.outputPlatesCount = outputPlatesCount
        liquidHandlerInstance.configStatus = configStatus
        liquidHandlerInstance.save()
        liquidHandlerInstance
    }


    def getLiquidHandlerConfiguration(LiquidHandler liquidHandlerInstance) {

        // spoof web service call to Liquid Handler URL

        // sleep for short period to make the call seem more believable :)
        // this can obviously be removed when someone extends this call at a later date to pull
        // configs directly from LHs
        Thread.sleep(5000)

        // stub rest get request for the future engineer who wants to build this out!
        //def resp = rest.get(liquidHandlerInstance.url)

        Integer randomPlatesBoundary = 999;

        // spoof'd json to respond from LH w/random in/out plate quantities
        def jsonResponse = JsonOutput.toJson([ inputPlatesQuantity: random.nextInt(randomPlatesBoundary),
                                               outputPlatesQuantity: random.nextInt(randomPlatesBoundary) ])

        // parse JSON response
        def jsonSlurper = new JsonSlurper()
        def responseObject = jsonSlurper.parseText(jsonResponse)

        // call new LiquidHandlerDeviceController on "config"
        def i = responseObject.inputPlatesQuantity
        def o = responseObject.outputPlatesQuantity

        updateMapper(liquidHandlerInstance, liquidHandlerInstance.name, liquidHandlerInstance.url, i, o, "Configured")
    }
}
