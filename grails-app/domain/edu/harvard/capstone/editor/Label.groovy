package edu.harvard.capstone.editor

class Label {

	String category
	String name
	String value // color
	String units

    static constraints = {
    	value blank: true, nullable: true
    	units blank: true, nullable: true
    }
}
