package edu.harvard.capstone.editor

import edu.harvard.capstone.result.Result
import grails.plugin.springsecurity.annotation.Secured
import static org.springframework.http.HttpStatus.*

/**
 * Liquid Handler Controller
 *
 * Handles creating & listing the liquid handler configs.
 *
 * Initiated from Issue #11 on github.com/platify/platify/issues
 * @author rbw (Reagan Williams, Spring 2016)
 *
 */
class LiquidHandlerController {
    def springSecurityService
    def liquidService

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

    def save(String name, String url, Integer inputPlatesCount, Integer outputPlatesCount, String configStatus) {

        if (!springSecurityService.isLoggedIn()){
            redirect action: "index", method: "GET"
            return
        }

        def liquidHandlerInstance = liquidService.newMapper(name, url, inputPlatesCount, outputPlatesCount, configStatus)

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
                redirect action: 'index', id: liquidHandlerInstance.id
            }
            '*' { respond liquidHandlerInstance, [status: CREATED] }
        }
    }

    @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
    def show(LiquidHandler liquidHandlerInstance) {
        if (!springSecurityService.isLoggedIn())
            return

        if(!springSecurityService.principal?.getAuthorities().any { it.authority == "ROLE_ADMIN" || it.authority == "ROLE_SUPER_ADMIN"}){
            params.owner = springSecurityService.principal
        }

        def liquidHandlerList = liquidHandler.get(liquidHandlerInstance);
        response liquidHandlerInstance, model:[liquidHandlerList: liquidHandlerList]
    }

    def list() {
        return model
    }

    /**
     * Respond to RESTful call to spoof liquid handler compound locations.
     * @return
     */
    def spoofCompoundLocations(){
        render(contentType: "application/json") {
            [compound: liquidService.getCompoundLocations()]
        }
    }
}
