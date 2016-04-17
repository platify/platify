package edu.harvard.capstone.editor

import grails.rest.RestfulController

class LiquidHandlerDeviceController extends RestfulController {
    static responseFormats = ['json']

    def configController() {
        respond "3"
    }
}
