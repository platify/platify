package edu.harvard.capstone.editor

import edu.harvard.capstone.user.Scientist

class ExperimentalPlateSet {

	Scientist owner
	String name
	String description

    static constraints = {
    	description blank: true, nullable: true
    }

	static mapping = {
		description type: 'text'
	}

}
