package edu.harvard.capstone.editor

class Label {

	String category
	String name
	String value // color

    static constraints = {
    	value blank: true, nullable: true
    }
}
