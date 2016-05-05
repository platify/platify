package platify

import edu.harvard.capstone.remoteHandler.InventoryService

class CalebTestController {
	def inventoryService
	
    def index() { 
		def returnedJson
		returnedJson = inventoryService.compoundLocations();
	}
}
