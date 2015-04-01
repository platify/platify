package edu.harvard.capstone.parser

import grails.transaction.Transactional

@Transactional
class ParserService {

	def springSecurityService

    def newEquipment(String name, String machineName, String description, String data) {
    	def equipmentInstance = new Equipment(name: name, machineName: machineName, description: description, config: data)
    	equipmentInstance.save()
    	equipmentInstance
    }
}
