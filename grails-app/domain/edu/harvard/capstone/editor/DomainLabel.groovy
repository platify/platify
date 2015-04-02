package edu.harvard.capstone.editor

class DomainLabel {

	Label label
	Long domainId
	LabelType labelType

	enum LabelType{
		WELL, TEMPLATE, PLATE_SET, EXPERIMENT
	}
}
