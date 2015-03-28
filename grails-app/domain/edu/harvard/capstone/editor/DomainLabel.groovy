package edu.harvard.capstone.editor

class DomainLabel {

	Label label
	Integer domainId
	LabelType labelType

	enum LabelType{
		PARSER, WELL, TEMPLATE, PLATE_SET, EXPERIMENT
	}

    static constraints = {
    	domainId unique: ['labelType']
    }
}
