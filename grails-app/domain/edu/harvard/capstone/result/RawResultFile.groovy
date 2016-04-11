package edu.harvard.capstone.result

import edu.harvard.capstone.editor.PlateSet

class RawResultFile {

      String fName

    static belongsTo = [result:Result]

    static constraints = {
		result nullable: true, blank: true
		fName nullable:true, blank: true
    }
}
