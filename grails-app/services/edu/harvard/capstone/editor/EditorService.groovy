package edu.harvard.capstone.editor

import edu.harvard.capstone.user.Scientist

import grails.converters.JSON
import groovy.json.*
import groovy.xml.MarkupBuilder
import org.codehaus.groovy.grails.web.json.JSONObject
import grails.validation.ValidationException

import grails.transaction.Transactional

@Transactional
class EditorService {

    def springSecurityService

    def newExperiment(String name, String description) {
        def scientistInstance = Scientist.get(springSecurityService.principal.id)
        if (!scientistInstance)
            return
        def experimentInstance = new ExperimentalPlateSet(name: name, description: description, owner: scientistInstance)
        experimentInstance.save()
        experimentInstance
    }

    /**
     * 	Throws ValidationException if can't create a domain object
     */
    def newTemplate(JSONObject data) {
        //if no data of the template return,
        if (!data || !data.plate)
            return

        // get the scientist to attach it as an owner of the plate template
        def scientistInstance = Scientist.get(springSecurityService.principal.id)
        if (!scientistInstance)
            return

        // first create the plate
        def plateInstance = new PlateTemplate(owner: scientistInstance, name: data.plate.name, width: data.plate.width, height: data.plate.height)
        plateInstance.save()
        // if it has errors, delete all the data just created and exit
        if (plateInstance.hasErrors()) {
            throw new ValidationException("Plate is not valid", plateInstance.errors)
        }

        // for storing the created objects
        def labelsList = []
        def wellsLabelsList = []

        // iterate throught the labels and create if it's a new one
        labelsList = []
        data.plate.labels.each { label ->
            if (label) {
                def labelInstance = Label.get(label.id)
                if (!labelInstance) {
                    labelInstance = new Label(category: label.category, name: label.name, value: label.value)
                    labelInstance.save()
                    if (labelInstance.hasErrors()) {
                        throw new ValidationException("Label for plate is not valid", labelInstance.errors)
                    }
                }
                // add it to the labels that will be assigned to the plate

                labelsList << labelInstance
            }
        }

        // link the plate to the labels
        labelsList.each { plateLabel ->

            def plateLabelInstance = new DomainLabel(label: plateLabel, domainId: plateInstance.id, labelType: DomainLabel.LabelType.PLATE)
            plateLabelInstance.save()
            if (plateLabelInstance.hasErrors()) {
                throw new ValidationException("Plate Label is not valid", plateLabelInstance.errors)
            }
        }

        // create the wells
        data.plate.wells.each { well ->
            wellsLabelsList = []
            if (well) {
                def controlType
                try {
                    controlType = Well.WellControl[well.control.toUpperCase()]
                }
                catch (Exception e) {

                    controlType = Well.WellControl.EMPTY
                }

                def wellInstance = new Well(plate: plateInstance, row: well.row, column: well.column, groupName: well.groupName, control: controlType)
                wellInstance.save()
                if (wellInstance.hasErrors()) {
                    throw new ValidationException("Well is not valid", wellInstance.errors)
                }

                // iterate throught the labels and create if it's a new one
                well.labels.each { label ->
                    def labelInstance = Label.get(label.id)
                    if (!labelInstance) {
                        labelInstance = new Label(category: label.category, name: label.name, value: label.value)
                        labelInstance.save()
                        if (labelInstance.hasErrors()) {
                            throw new ValidationException("Label for well is not valid", labelInstance.errors)
                        }
                    }
                    // add it to the labels that will be assigned to the well
                    wellsLabelsList << labelInstance
                }

                // link the well to the labels
                wellsLabelsList.each { wellLabel ->
                    def wellLabelInstance = new DomainLabel(label: wellLabel, domainId: wellInstance.id, labelType: DomainLabel.LabelType.WELL)
                    wellLabelInstance.save()
                    if (wellLabelInstance.hasErrors()) {
                        throw new ValidationException("Well Label is not valid", wellLabelInstance.errors)
                    }
                }
            }
        }

        return plateInstance
    }


    def getTemplateXML(PlateTemplate plateTemplateInstance) {
        def writer = new StringWriter()
        def xml = new MarkupBuilder(writer)
        if (!plateTemplateInstance)
            return
        xml.template(
                name: plateTemplateInstance.name,
                height: plateTemplateInstance.height,
                width: plateTemplateInstance.width
        ) {
            def plateLabels = DomainLabel.findAllByDomainIdAndLabelTypeAndPlateIsNull(plateTemplateInstance.id, DomainLabel.LabelType.PLATE).collect {
                it.label
            }
            plateLabels.each {
                labels(category: it.category,
                        name: it.name,
                        value: it.value,
                        id: it.id) {
                }
            }
            def wells = Well.findAllByPlate(plateTemplateInstance)
            wells.each {
                def wellLabels = DomainLabel.findAllByDomainIdAndLabelTypeAndPlateIsNull(it.id,
                        DomainLabel.LabelType.WELL).collect { it.label }
                well(
                        row: it.row,
                        column: it.column,
                        groupName: it.groupName,
                        control: it.control.toString().toLowerCase()
                ) {
                    wellLabels.each {
                        wellLabel(
                                category: it.category,
                                name: it.name,
                                value: it.value,
                                id: it.id
                        ) {
                        }
                    }
                }
            }
        }
        return writer.toString()
    }


    def getTemplate(PlateTemplate plateTemplateInstance) {

        if (!plateTemplateInstance)
            return

        def template = [:]

        template.name = plateTemplateInstance.name
        template.height = plateTemplateInstance.height
        template.width = plateTemplateInstance.width
        template.labels = []

        def plateLabels = DomainLabel.findAllByDomainIdAndLabelTypeAndPlateIsNull(plateTemplateInstance.id, DomainLabel.LabelType.PLATE).collect {
            it.label
        }
        plateLabels.each {

            def label = [:]
            label.category = it.category
            label.name = it.name
            label.value = it.value
            label.id = it.id

            template.labels << label
        }

        template.wells = []

        def wells = Well.findAllByPlate(plateTemplateInstance)
        wells.each {
            def well = [:]
            well.row = it.row
            well.column = it.column
            well.groupName = it.groupName
            String c = it.control
            well.control = c.toString().toLowerCase()
            well.labels = []

            def wellLabels = DomainLabel.findAllByDomainIdAndLabelTypeAndPlateIsNull(it.id, DomainLabel.LabelType.WELL).collect {
                it.label
            }
            wellLabels.each {
                def label = [:]
                label.category = it.category
                label.name = it.name
                label.value = it.value
                label.id = it.id
                well.labels << label
            }

            template.wells << well
        }

        return template

    }

    /**
     * 	Throws ValidationException if can't create a domain object
     */
    def newPlate(JSONObject data) {
        //if no data of the template return,
        if (!data || !data.plate)
            return

        // first get the data of the Template and Experiment
        def templateInstance = PlateTemplate.get(data.plate.templateID)
        if (!templateInstance) {
            throw new RuntimeException("A valid template ID is missing")
        }
        def experimentInstance = ExperimentalPlateSet.get(data.plate.experimentID)
        if (!experimentInstance) {
            throw new RuntimeException("A valid experiment ID is missing")
        }

        def plateInstance = new PlateSet(plate: templateInstance, experiment: experimentInstance, assay: data.plate.assay, barcode: data.plate.plateID)
        plateInstance.save()
        // if it has errors, delete all the data just created and exit
        if (plateInstance.hasErrors()) {
            throw new ValidationException("Plate is not valid", plateInstance.errors)
        }

        // for storing the created objects
        def labelsList = []

        // iterate throught the labels and create if it's a new one
        data.plate.labels.each { label ->

            if (label) {
                def labelInstance = Label.get(label.id)
                if (!labelInstance) {
                    labelInstance = new Label(category: label.category, name: label.name, value: label.value)
                    labelInstance.save()
                    if (labelInstance.hasErrors()) {
                        throw new ValidationException("Label for plate is not valid", labelInstance.errors)
                    }
                }
                // add it to the labels that will be assigned to the plate
                labelsList << labelInstance
            }
        }

        // link the plate to the labels
        labelsList.each { plateLabel ->
            def plateLabelInstance = new DomainLabel(label: plateLabel, domainId: plateInstance.id, labelType: DomainLabel.LabelType.PLATE, plate: plateInstance)
            plateLabelInstance.save()
            if (plateLabelInstance.hasErrors()) {
                throw new ValidationException("Plate Label is not valid", plateLabelInstance.errors)
            }
        }

        // create the wells
        data.plate.wells.each { well ->
            def wellsLabelsList = []
            if (well) {
                def wellInstance = Well.findByPlateAndRowAndColumn(templateInstance, well.row, well.column)
                if (!wellInstance) {
                    throw new RuntimeException("Well is not valid")
                }

                // iterate throught the labels and create if it's a new one
                well.labels.each { label ->
                    def labelInstance = Label.get(label.id)
                    if (!labelInstance) {
                        labelInstance = new Label(category: label.category, name: label.name, value: label.value, units: label.units)
                        labelInstance.save()
                        if (labelInstance.hasErrors()) {
                            throw new ValidationException("Label for well is not valid", labelInstance.errors)
                        }
                    }
                    // add it to the labels that will be assigned to the well
                    wellsLabelsList << labelInstance
                }

                // link the well to the labels
                wellsLabelsList.each { wellLabel ->
                    def wellLabelInstance = new DomainLabel(label: wellLabel, domainId: wellInstance.id, labelType: DomainLabel.LabelType.WELL, plate: plateInstance)
                    wellLabelInstance.save()
                    if (wellLabelInstance.hasErrors()) {
                        throw new ValidationException("Well Label is not valid", wellLabelInstance.errors)
                    }
                }
            }
        }
        return plateInstance
    }


    def getPlateXml(PlateSet plateInstance) {
        def writer = new StringWriter()
        def xml = new MarkupBuilder(writer)
        if (!plateInstance)
            return
        xml.plate(
                assay: plateInstance.assay,
                experimentID: plateInstance.experiment.id,
                templateID: plateInstance.plate.id,
                plateID: plateInstance.barcode
        ) {
            def plateLabels = DomainLabel.findAllByDomainIdAndLabelTypeAndPlate(plateInstance.plate.id, DomainLabel.LabelType.PLATE, plateInstance).collect {
                it.label
            }
            plateLabels.each {
                labels(
                        category: it.category,
                        name: it.name,
                        value: it.value,
                        id: it.id
                ) {
                }
            }
            def wells = Well.findAllByPlate(plateInstance.plate)
            wells.each {
                def wellLabels = DomainLabel.findAllByDomainIdAndLabelTypeAndPlate(it.id, DomainLabel.LabelType.WELL, plateInstance).collect {
                    it.label
                }
                well(
                        row: it.row,
                        column: it.column,
                        groupName: it.groupName,
                        control: it.control.toString().toLowerCase()
                ) {
                    wellLabels.each {
                        labels(
                                category: it.category,
                                name: it.name,
                                value: it.value,
                                id: it.id,
                                units: it.units
                        ) {
                        }
                    }
                }
            }
        }
        return writer.toString()
    }


    def getPlate(PlateSet plateInstance) {

        if (!plateInstance)
            return

        def plate = [:]

        plate.assay = plateInstance.assay
        plate.experimentID = plateInstance.experiment.id
        plate.templateID = plateInstance.plate.id
        plate.plateID = plateInstance.barcode
        plate.width = plateInstance.plate.width
        plate.height = plateInstance.plate.height

        plate.labels = []

        def plateLabels = DomainLabel.findAllByDomainIdAndLabelTypeAndPlate(plateInstance.plate.id, DomainLabel.LabelType.PLATE, plateInstance).collect {
            it.label
        }
        plateLabels.each {
            def label = [:]
            label.category = it.category
            label.name = it.name
            label.value = it.value
            label.id = it.id
            plate.labels << label
        }

        plate.wells = []

        def wells = Well.findAllByPlate(plateInstance.plate)
        wells.each {
            def well = [:]
            well.row = it.row
            well.column = it.column
            well.groupName = it.groupName
            String c = it.control
            well.control = c.toString().toLowerCase()
            well.labels = []

            def wellLabels = DomainLabel.findAllByDomainIdAndLabelTypeAndPlate(it.id, DomainLabel.LabelType.WELL, plateInstance).collect {
                it.label
            }
            wellLabels.each {
                def label = [:]
                label.category = it.category
                label.name = it.name
                label.value = it.value
                label.id = it.id
                label.units = it.units
                well.labels << label
            }

            plate.wells << well
        }

        return plate

    }


    File exportTemplate(PlateTemplate templateInstance) {
        if (!templateInstance)
            return

        def wells = Well.findAllByPlate(templateInstance)

        File file = File.createTempFile("template", ".csv")

        wells.each { well ->

            def row = ""
            row = row + well.row + ","
            row = row + well.column + ","
            row = row + well.control.value() + ","
            if (well.control == Well.WellControl.EMPTY) {
                row = row + ","
                file.append(row + "\r\n")
            } else {
                row = row + "compound," + well.groupName
                file.append(row + "\r\n")

                row = well.row + "," + well.column + "," + well.control.value() + ","

                def labels = DomainLabel.findAllByDomainIdAndLabelTypeAndPlateIsNull(well.id, DomainLabel.LabelType.WELL).collect {
                    it.label
                }

                labels.each { label ->
                    def labelRow = row
                    labelRow = labelRow + label.category + ","
                    labelRow = labelRow + label.name
                    file.append(labelRow + "\r\n")
                }
            }

        }

        return file
    }

    File exportPlate(PlateSet plateInstance) {
        if (!plateInstance)
            return

        def templateInstance = plateInstance.plate

        def wells = Well.findAllByPlate(templateInstance)


        File file = File.createTempFile("plate", ".csv")

        wells.each { well ->

            def row = ""
            row = row + well.row + ","
            row = row + well.column + ","
            row = row + well.control.value() + ","
            if (well.control == Well.WellControl.EMPTY) {
                row = row + ",,,,"
                file.append(row + "\r\n")
            } else {

                def wellLabels = DomainLabel.findAllByDomainIdAndLabelTypeAndPlate(well.id, DomainLabel.LabelType.WELL, plateInstance)
                def labels = wellLabels.findAll {
                    !it.label.category.toLowerCase().contains('compound') && !it.label.category.toLowerCase().contains('dosage')
                }.collect { it.label }
                def compounds = wellLabels.findAll { it.label.category.toLowerCase().contains('compound') }.collect {
                    it.label
                }
                def dosage = wellLabels.findAll { it.label.category.toLowerCase().contains('dosage') }.collect {
                    it.label
                }

                if (labels) {
                    labels.each { label ->
                        if (compounds) {
                            compounds.each { compound ->
                                def plateRow = row
                                plateRow = plateRow + label.category + "," + label.name + ","
                                plateRow = plateRow + compound.name + ","
                                if (dosage) {
                                    plateRow = plateRow + dosage[0].name + ","
                                    if (dosage[0].units)
                                        plateRow = plateRow + dosage[0].units

                                } else {
                                    plateRow = plateRow + "1.0,"
                                }
                                file.append(plateRow + "\r\n")
                            }
                        } else {
                            def plateRow = row
                            plateRow = plateRow + label.category + "," + label.name + ","
                            plateRow = plateRow + ","
                            if (dosage) {
                                plateRow = plateRow + dosage[0].name + ","
                                if (dosage[0].units)
                                    plateRow = plateRow + dosage[0].units

                            } else {
                                plateRow = plateRow + "1.0,"
                            }
                            file.append(plateRow + "\r\n")
                        }
                    }
                } else {
                    if (compounds) {
                        compounds.each { compound ->
                            def plateRow = row
                            plateRow = plateRow + "," + ","
                            plateRow = plateRow + compound.name + ","
                            if (dosage) {
                                plateRow = plateRow + dosage[0].name + ","
                                if (dosage[0].units)
                                    plateRow = plateRow + dosage[0].units

                            } else {
                                plateRow = plateRow + "1.0,"
                            }
                            file.append(plateRow + "\r\n")
                        }
                    } else {
                        def plateRow = row
                        plateRow = plateRow + "," + ","
                        plateRow = plateRow + ","
                        if (dosage) {
                            plateRow = plateRow + dosage[0].name + ","
                            if (dosage[0].units)
                                plateRow = plateRow + dosage[0].units

                        } else {
                            plateRow = plateRow + "1.0,"
                        }
                        file.append(plateRow + "\r\n")
                    }
                }
            }

        }

        return file
    }

    // Get all compounds by experiment/assay and return in a JSON list
    def getAssayList() {
        // get list of all experimental plate sets
        def assays = ExperimentalPlateSet.findAll()

        return assays
    }


    def getCompoundsOfExperiment(ExperimentalPlateSet experimentalPlateSet) {
        // Get all plates of experiment
        def plateList = PlateSet.findAllByExperiment(experimentalPlateSet)

        // Get all well-label relationships of experiment
        def plateDomainLabels = DomainLabel.findAllByPlateInList(plateList)
        def wellLabelRelationList = DomainLabel.findAllByDomainIdInList(plateDomainLabels.collect{it.domainId}).collect { it.label.id }

        // Get unique compound names of experiment
        def compoundNameSet = Label.findAllByIdInListAndCategory(wellLabelRelationList, "compound").collect {
            it.name
        }.toSet()

        def compoundList = [:]
        compoundList.compound = []

        // For each compound, determine compound's plates
        compoundNameSet.each { compoundName ->
            def compound = [:]
            compound.name = compoundName
            compound.destinations = []

            // All domain-label associated with current compound
            def domainLabelLinksOfCompound = DomainLabel.withCriteria {
                inList("label", Label.findAllByCategoryAndName("compound", compoundName))
                inList("plate", plateList)
                eq("labelType", DomainLabel.LabelType.WELL)
            }

            // For each plate, determine compound's wells
            plateList.each { plate ->
                // Filter domainLabelLinksOfCompound further to get only current plate's
                def domainLabelLinkOfPlate = DomainLabel.withCriteria {
                    inList("id", domainLabelLinksOfCompound.collect { it.id })
                    eq("plate", plate)
                }

                // For each well, determine compound's row-column, dosage, & dosage unit
                def wellIdSet = domainLabelLinkOfPlate.collect { it.domainId }.toSet()
                wellIdSet.each { wellId ->
                    def destination = [:]

                    def dosageLabels = DomainLabel.withCriteria {
                        eq("domainId", wellId)
                        eq("plate", plate)
                      //  eq("label", Label.findByCategory("dosage"))
                    }

                    Label dosageLabel = null
                    dosageLabels.each { domainLabel ->
                        // Get label containing dosage
                        if (domainLabel.label.category == "dosage") {
                            dosageLabel = domainLabel.label
                            return
                        }
                    }
                    if (!dosageLabel)
                        return

                    Well well = Well.findById(wellId)

                    destination.plate = plate.barcode
                    destination.well = well.row + "-" + well.column
                    destination.dosage = replaceDot(dosageLabel.name)
                    destination.unit = dosageLabel.units

                    compound.destinations << destination
                }
            }

            compoundList.compound << compound
        }

        return compoundList
    }

    def replaceDot(String numString) {
        return numString.replace("__dot__", ".")
    }

    // Get all compounds by experimentalplateset/assay and return in a JSON list
    def getCompoundListByAssay(Integer assayId) {
        def experimentalPlateSet = ExperimentalPlateSet.findById(assayId)

        // Get all plates of experiment
        def plateList = PlateSet.findAllByExperiment(experimentalPlateSet)

        // Get all well-label relationships of experiment
        def plateDomainLabels = DomainLabel.findAllByPlateInList(plateList)
        def wellLabelRelationList = DomainLabel.findAllByDomainIdInList(plateDomainLabels.collect{it.domainId}).collect { it.label.id }

        // Get unique compound names of experiment
        def compoundNameSet = Label.findAllByIdInListAndCategory(wellLabelRelationList, "compound").collect {
            it.name
        }.toSet()

        def compoundList = [:]
        compoundList.compound = []

        // For each compound, determine compound's plates
        compoundNameSet.each { compoundName ->
            def compound = [:]
            compound.id = compoundName
            compound.name = compoundName
            compound.destinations = []


            // All domain-label associated with current compound
            def domainLabelLinksOfCompound = DomainLabel.withCriteria {
                inList("label", Label.findAllByCategoryAndName("compound", compoundName))
                inList("plate", plateList)
                eq("labelType", DomainLabel.LabelType.WELL)
            }

            // For each plate, determine compound's wells
            plateList.each { plate ->

                // Filter domainLabelLinksOfCompound further to get only current plate's
                def domainLabelLinkOfPlate = DomainLabel.withCriteria {
                    inList("id", domainLabelLinksOfCompound.collect { it.id })
                    eq("plate", plate)
                }

                // For each well, determine compound's row-column, dosage, & dosage unit
                def wellIdSet = domainLabelLinkOfPlate.collect { it.domainId }.toSet()
                wellIdSet.each { wellId ->
                    def destination = [:]

                    def dosageLabels = DomainLabel.withCriteria {
                        eq("domainId", wellId)
                        eq("plate", plate)
                        //  eq("label", Label.findByCategory("dosage"))
                    }

                    Label dosageLabel = null
                    dosageLabels.each { domainLabel ->
                        // Get label containing dosage
                        if (domainLabel.label.category == "dosage") {
                            dosageLabel = domainLabel.label
                            return
                        }
                    }
                    if (!dosageLabel)
                        return

                    Well well = Well.findById(wellId)

                    destination.plate = plate.barcode

                    // warning: janky conversion logic from 0-based column, row design to
                    // 1-based letter, row output
                    // had to do this because inherited code from previous SAMS team
                    def asciiletter = well.row.toInteger() + 65
                    destination.well = Character.toChars(asciiletter).toString() + well.column.toString()
                    destination.dosage = replaceDot(dosageLabel.name)
                    destination.unit = dosageLabel.units

                    compound.destinations << destination
                }

            }

            compoundList.compound << compound
//            compoundList << compound

        }

        return compoundList
    }

    def getCompoundListByAssay_OLD(Integer assayId) {

        def compoundList = []

        def experimentalPlateSetInstance = ExperimentalPlateSet.findById(assayId)

        // find unique compounds by name
        def compounds = Label.findAllByCategory("compound").unique { cmp ->
            cmp.name
        }

        compounds.each { c ->
            def compound = [:]
            compound.id = c.id
            compound.name = c.name

            // create the destinations JSON array
            compound.destinations = []

            def wells = Well.findAllByGroupName(c.name)

            wells.each { w1 ->
                def destination = [:]

                def plate = PlateSet.findByExperimentAndPlate(experimentalPlateSetInstance, w1.plate)

                if (!plate)
                    return //continue

                destination.plate = plate.barcode

                // warning: janky conversion logic from 0-based column, row design to
                // 1-based letter, row output
                // had to do this because inherited code from previous SAMS team
                def asciiletter = w1.row.toInteger() + 65

                destination.well = Character.toChars(asciiletter).toString() + w1.column.toString()

                // Super hack because the Label domain was given to us in a sad state
                def dosageunits = Label.findById(c.id.toInteger() - 1)

                // test if units is null - then go back 2 ids
                if (!dosageunits.units)
                {
                    dosageunits = Label.findById(c.id.toInteger() - 2)
                }

                // if still null, then continue out of this instance of the closure
                if (!dosageunits.units)
                    return

                destination.dosage = replaceDot(dosageunits.name)
                destination.unit = dosageunits.units

                compound.destinations << destination

            }

            if (compound.destinations.size() > 0) {
                compoundList << compound
            }
        }


/*
Old code that was built expecting the Compound domain object to be in use.
Sadly, when testing I realized the Compound domain object was never built out
and we are left to deal with the poor data model design from the SAMS team
using the Label domain object. :/
 */
        /*
        // get list of all compounds in assay
        def compounds = Compound.findAllByExperiment(experimentalPlateSetInstance);


        // walk each compound and retrieve data
        compounds.each { c ->
            def compound = [:]
            compound.id = c.id
            compound.name = c.name

            // create the destinations JSON array
            compound.destinations = [:]

            def plateSets = PlateSet.findAllByExperiment(experimentalPlateSetInstance)

            plateSets.each { ps ->

                def wellCompounds = WellCompound.findAllByCompound(c)

                wellCompounds.each { wc ->
                    // test if well compound is the compound we're looking for!
                    if (wc.compound.id == c.id) {

                        def destination = [:]

                        destination.plate = ps.barcode
                        // warning: janky conversion logic from 0-based column, row design to
                        // 1-based letter, row output

                        def asciiletter = wc.well.row.toInteger() + 65

                        destination.well = Character.toChars(asciiletter).toString() + wc.well.column.toString()
                        destination.dosage = wc.amount
                        destination.unit = wc.unit.toString()

                        compound.destinations << destination
                        compoundList << compound

                    }

                }


            }

        }
*/


        return compoundList
    }

    def getCompoundLocations(Integer compoundId) {

        def compoundInstance = Compound.findByName("substanceA")

        def wellCompoundInstance = WellCompound.findByCompound(compoundInstance)

//        wellCompoundInstance.well
//        wellCompoundInstance.amount
//        wellCompoundInstance.unit

        def wellInstance = wellCompoundInstance.well
        def plateTemplateInstance = wellInstance.plate

        def plateSetInstance = PlateSet.findByExperiment(compoundInstance.experiment)

        def barcode = plateSetInstance.barcode
        def well = wellCompoundInstance.well.column + "-" + wellCompoundInstance.well.row
        def amount = wellCompoundInstance.amount + " " + wellCompoundInstance.unit

        def jsonResponse = JsonOutput.toJson([barcode      : barcode,
                                              well         : well,
                                              concentration: amount])

        // parse JSON response
        def jsonSlurper = new JsonSlurper()
        def responseObject = jsonSlurper.parseText(jsonResponse)

        return jsonResponse
    }


//    def getExperimentData(ExperimentalPlateSet experimentInstance){
//    if (!experimentInstance)
//      return
//
//    def plateSetList = PlateSet.findAllByExperiment(experimentInstance)
//
//    def experiment = [:]
//    experiment.plates = []
//
//    plateSetList.each{ plateInstance ->
//      def plate = [:]
//
//      plate.assay = plateInstance.assay
//      plate.experimentID = plateInstance.experiment.id
//      plate.templateID = plateInstance.plate.id
//      plate.plateID = plateInstance.barcode
//
//      plate.labels = []
//
//      // experiment labels
//      def plateLabels = DomainLabel.findAllByDomainIdAndLabelTypeAndPlate(plateInstance.plate.id, DomainLabel.LabelType.PLATE, plateInstance).collect{it.label}
//      plateLabels.each{
//        def label = [:]
//        label.category = it.category
//        label.name = it.name
//        label.value = it.value
//        label.id = it.id
//        plate.labels << label
//      }
//
//      // plate labels
//      DomainLabel.findAllByDomainIdAndLabelTypeAndPlateIsNull(plateInstance.plate.id, DomainLabel.LabelType.PLATE).collect{it.label}.each{
//        def label = [:]
//        label.category = it.category
//        label.name = it.name
//        label.value = it.value
//        label.id = it.id
//        plate.labels << label
//      }
//
//      plate.wells = []
//
//      def wells = Well.findAllByPlate(plateInstance.plate)
//      wells.each{
//        def well = [:]
//        well.row = it.row
//        well.column = it.column
//        well.groupName = it.groupName
//        String c = it.control
//        well.control = c.toString().toLowerCase()
//        well.labels = []
//
//        // experiment labels
//        def wellLabels = DomainLabel.findAllByDomainIdAndLabelTypeAndPlate(it.id, DomainLabel.LabelType.WELL, plateInstance).collect{it.label}
//        wellLabels.each{
//          def label = [:]
//          label.category = it.category
//          label.name = it.name
//          label.value = it.value
//          label.id = it.id
//          well.labels << label
//        }
//
//        // template labels
//        DomainLabel.findAllByDomainIdAndLabelTypeAndPlateIsNull(it.id, DomainLabel.LabelType.WELL).collect{it.label}.each{
//          def label = [:]
//          label.category = it.category
//          label.name = it.name
//          label.value = it.value
//          label.id = it.id
//          well.labels << label
//        }
//
//        plate.wells << well
//      }
//
//      experiment.plates << plate
//
//    }
//
//
//    return experiment
//  }

    def getControlData(ExperimentalPlateSet experimentInstance){
        if (!experimentInstance)
            return

        def plateSetList = PlateSet.findAllByExperiment(experimentInstance)

        def experiment = [:]
        experiment.plates = []

        plateSetList.each{ plateInstance ->
            def plate = [:]

            plate.plateID = plateInstance.barcode

            plate.wells = []

            def wells = Well.findAllByPlateAndControlNotEqual(plateInstance.plate, Well.WellControl.COMPOUND)
            wells.each{
                def well = [:]
                well.row = it.row
                well.column = it.column
//                well.groupName = it.groupName
//                String c = it.control
//                well.control = c.toString().toLowerCase()
                well.labels = []

                // experiment labels
                def wellLabels = DomainLabel.findAllByDomainIdAndLabelTypeAndPlate(it.id, DomainLabel.LabelType.WELL, plateInstance).collect{it.label}
                wellLabels.each{
                    def label = [:]
                    label.category = it.category
                    label.name = it.name
//                    label.value = it.value
//                    label.id = it.id
                    well.labels << label
                }

                plate.wells << well
            }

            experiment.plates << plate

        }

        return experiment
    }
}
