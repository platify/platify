package edu.harvard.capstone.editor

class LiquidHandler {

    String type
    Integer maxInputPlates
    Integer maxOutputPlates
    Integer maxRacks

    static constraints = {
        type blank: false, nullable: false
        maxInputPlates min: 0, max: 99999
        maxOutputPlates min: 0, max: 99999
        maxRacks min: 0, max: 99999
    }
}
