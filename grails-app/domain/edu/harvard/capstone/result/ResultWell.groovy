package edu.harvard.capstone.result

import edu.harvard.capstone.editor.Well

class ResultWell {

	ResultPlate plate
	Well well

	Date lastUpdated
	Date dateCreated
	
    static constraints = {
    }
	
	static mapping = {
		outlier defaultValue: "false"
	 }
}
