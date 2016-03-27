package edu.harvard.capstone.editor

import edu.harvard.capstone.result.RawResultFile

class PlateSet {

	PlateTemplate plate
	ExperimentalPlateSet experiment
	String assay

	String barcode
	
	Date lastUpdated
	Date dateCreated

	List rawResults

	static hasMany = [rawResults: RawResultFile]

    static constraints = {
    	assay nullable: true, blank: true
    }
}
