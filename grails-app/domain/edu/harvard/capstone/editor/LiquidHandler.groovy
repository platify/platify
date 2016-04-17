package edu.harvard.capstone.editor

class LiquidHandler {

    String name
    String url
    Integer inputPlatesCount
    Integer outputPlatesCount
    String configStatus

    static constraints = {
        name blank: false, nullable: false
        url blank: false, nullable: false

        // defaults set to -1 before populated by LH webservice call
        inputPlatesCount defaultValue: -1
        outputPlatesCount defaultValue: -1
        configStatus defaultValue: "In progress..."
    }
}
