package edu.harvard.capstone.result

class ResultLabel {

	String name
	String value
	LabelType labelType
	LabelScope scope
	Long domainId
	String outlier

	enum LabelType{
		LABEL, RAW_DATA, NORMALIZED_DATA
	}

	enum LabelScope{
		WELL, PLATE, RESULT
	}

    static constraints = {
    	   outlier nullable:true, blank:true
    }
	
	static mapping = {
		outlier defaultValue: "false"
	 }
}
