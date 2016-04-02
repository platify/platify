package edu.harvard.capstone.editor

class LiquidHandlerMapping {

    String inputPlateId
    String inputWell
    String inputDose
    String outputPlateId
    String outputWell
    String outputDose

    static constraints = {
        inputPlateId blank: false, nullable: false
        inputWell blank: false, nullable: false
        inputDose blank: false, nullable: false
        outputPlateId blank: false, nullable: false
        outputWell blank: false, nullable: false
        outputDose blank: false, nullable: false
    }
}
