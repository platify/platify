package edu.harvard.capstone.editor

class PlateSet {

	PlateTemplate plate
	ExperimentalPlateSet experiment
	String assay
	
	Date lastUpdated
	Date dateCreated

    static constraints = {
    	assay nullable: true, blank: true
    }
}
