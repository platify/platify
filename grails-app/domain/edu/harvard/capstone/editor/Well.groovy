package edu.harvard.capstone.editor

class Well {

	PlateTemplate plate
	Integer column
	Integer row
	String groupName
	WellControl control = WellControl.EMPTY

	enum WellControl{
		POSITIVE, NEGATIVE, EMPTY
	}
	
	Date lastUpdated
	Date dateCreated

    static constraints = {
    	groupName nullable: true, blank: true
    }
}
