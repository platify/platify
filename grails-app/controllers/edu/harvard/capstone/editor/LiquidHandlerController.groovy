package edu.harvard.capstone.editor

import edu.harvard.capstone.result.Result
import grails.plugin.springsecurity.annotation.Secured
import static org.springframework.http.HttpStatus.*


/**
 * Liquid Handler Controller
 *
 * Handles creating & listing the liquid handler configs.
 *
 * Issue #11 on github.com/platify/platify/issues
 * @author rbw (Reagan Williams, Spring 2016)
 *
 */
class LiquidHandlerController {
    def springSecurityService
    def liquidHandlerService

    /**
     * Lists the liquid handler configurations
     * @param max
     * @return
     */

    @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
    def index(Integer max) {
        if (!springSecurityService.isLoggedIn())
            return

        if(!springSecurityService.principal?.getAuthorities().any { it.authority == "ROLE_SCIENTIST" || it.authority == "ROLE_ADMIN" || it.authority == "ROLE_SUPER_ADMIN"}){
            params.owner = springSecurityService.principal
        }

        // # of LH configs to return
        params.max = Math.min(max ?: 10, 100)

        respond LiquidHandler.list(params), model:[liquidHandlerInstanceCount: LiquidHandler.count()]

    }

    def create() {
        respond new LiquidHandler(params)
    }

    def save(String name, String inputPlateId, String inputWell, String inputDose, String outputPlateId, String outputWell, String outputDose) {

        if (!springSecurityService.isLoggedIn()){
            redirect action: "index", method: "GET"
            return
        }

        def liquidHandlerInstance = liquidHandlerService.newMapper(name, inputPlateId, inputWell, inputDose, outputPlateId, outputWell, outputDose)

        if (liquidHandlerInstance == null) {
            notFound()
            return
        }

        if (liquidHandlerInstance.hasErrors()) {
            respond liquidHandlerInstance.errors, view:'create'
            return
        }

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.created.message', args: [message(code: 'liquidHandler.label', default: 'LiquidHandler'), liquidHandlerInstance.id])
                redirect action: 'showactions', id: liquidHandlerInstance.id
            }
            '*' { respond liquidHandlerInstance, [status: CREATED] }
        }
    }



    def list() {
        return model
    }
}
