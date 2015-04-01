package edu.harvard.capstone.editor

class DomainLabel {

	Label label
	Integer domainId
	LabelType labelType

	enum LabelType{
		WELL, TEMPLATE, PLATE_SET, EXPERIMENT
	}
}
