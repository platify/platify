package edu.harvard.capstone.result

class ResultLabel {

	String name
	String value
	LabelType labelType
	Long domainId

	enum LabelType{
		WELL, PLATE, RESULT
	}

    static constraints = {
    }
}
