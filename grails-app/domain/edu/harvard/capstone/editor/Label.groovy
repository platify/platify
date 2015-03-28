package edu.harvard.capstone.editor

class Label {

	Label category
	String name
	String value

    static constraints = {
    	value blank: true, nullable: true
    }
}
