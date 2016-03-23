package edu.harvard.capstone.result

import edu.harvard.capstone.editor.PlateSet

class RawResultFile {

      String fName

    static belongsTo = [plateSet:PlateSet]

    static constraints = {
		plateSet nullable: true, blank: true
    }
}
