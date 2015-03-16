package edu.harvard.capstone.result

import edu.harvard.capstone.user.User
import edu.harvard.capstone.parser.Equipment
import edu.harvard.capstone.editor.ExperimentalPlateSet

class Result {

	User owner
	Equipment equipment
	ExperimentalPlateSet experiment
	String name
	String description

    static constraints = {
    	description blank: true, nullable: true
    }

	static mapping = {
		description type: 'text'
	}

}
