package edu.harvard.capstone.editor

class Well {

	PlateTemplate plate
	Integer column
	Integer row
	String groupName
	WellControl control = WellControl.EMPTY

	enum WellControl {
	    POSITIVE ("POS"),
	    NEGATIVE ("NEG"),
	    EMPTY ("EMPTY"),
	    COMPOUND ("COMP");
    
	  	WellControl(String value) { this.value = value }
	    
	  	private final String value
	    
	  	public String value() { return value }

	}



	Date lastUpdated
	Date dateCreated

    static constraints = {
    	groupName nullable: true, blank: true
    }
    static mapping = {
        column column: '`column`'
    }
}
