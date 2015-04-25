package edu.harvard.capstone.editor


import edu.harvard.capstone.user.Scientist

class PlateTemplate {

	Scientist owner
	String name

	String width
	String height

 	Date lastUpdated
	Date dateCreated

   	static constraints = {	
   		width nullable: true, blank: true
   		height nullable: true, blank: true
    }
}
