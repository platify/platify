package edu.harvard.capstone.parser

import edu.harvard.capstone.result.Result
class Equipment {

	String name
	String machineName
	String description
	String config

	Date dateCreated
	Date lastUpdated
    
    static constraints = {
    	machineName nullable: true, blank: true
    	description nullable: true, blank: true
    	config nullable: true, blank: true
	}

	static mapping = {
		description type: 'text'
		config type: 'text'
	}


	Boolean canUpdate(){
		!Result.findAllByEquipment(this)
	}
}
