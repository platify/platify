package edu.harvard.capstone.editor

class DomainLabel {

	Label label
	Long domainId
	LabelType labelType
	PlateSet plate = null 	// If it's null, it a template label, if not is part of a plate

	enum LabelType {
		WELL, PLATE, PLATE_SET, EXPERIMENT
	}

    static constraints = {
    	plate blank: true, nullable: true
    }	

}
