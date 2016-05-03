package edu.harvard.capstone.result

import edu.harvard.capstone.editor.DomainLabel
import edu.harvard.capstone.editor.ExperimentalPlateSet
import edu.harvard.capstone.editor.Label
import edu.harvard.capstone.editor.PlateSet
import edu.harvard.capstone.editor.PlateTemplate
import edu.harvard.capstone.editor.Well
import edu.harvard.capstone.parser.Equipment
import edu.harvard.capstone.user.Scientist
import grails.test.mixin.Mock
import grails.test.mixin.TestFor
import spock.lang.Specification

/**
 * See the API for {@link grails.test.mixin.support.GrailsUnitTestMixin} for usage instructions
 */
@TestFor(StdCurveController)
@Mock([Scientist, Equipment, ExperimentalPlateSet, Result, ResultPlate, ResultWell, ResultLabel, Well, PlateSet, DomainLabel, Label, PlateTemplate])
class StdCurveControllerSpec extends Specification {

    def setupData(params) {
        Scientist owner = new Scientist(firstName: "Test", lastName: "User", email:"my@email.com", password:"test").save(flush:true)
        ExperimentalPlateSet exp = new ExperimentalPlateSet(owner: owner, name: "UnitTest Assay", description: "Test Description").save(flush:true)
        def template = new PlateTemplate(owner: owner, name: "test template", width: 0, height: 0).save(flush:true)
        Well well = new Well(plate: template, control: "POSITIVE", groupName: "P", row: 0, column: 0).save(flush:true)
        def plate = new PlateSet(barcode: "test barcode", experiment: exp, plate: template).save(flush:true)
        def editorLabel = new Label(category: "dosage", name: "0", units: "ml", value: "color").save(flush:true)
        def domainLabelRelation = new DomainLabel(labelType: DomainLabel.LabelType.WELL, plate: plate, domainId: well.id, label: editorLabel).save(flush:true)

        Equipment equipment = new Equipment(name: "Test Equipment").save(flush:true)
        def result = new Result(experiment: exp, equipment: equipment, owner: owner, name: "Test Results").save(flush:true)
        def resultPlate = new ResultPlate(result: result, barcode: "test barcode", rows: 0, columns: 0).save(flush:true)
        def resultWell = new ResultWell(plate: resultPlate, well: well).save(flush:true)
        def resultLabel = new ResultLabel(domainId: resultWell.id, labelType: ResultLabel.LabelType.RAW_DATA, name: "absorbance", scope: "WELL", value: "0").save(flush:true)

        params.experiment = exp
        params.plate = plate
        params.resultLabel = resultLabel
        params.editorLabel = editorLabel

        params
    }

    def cleanup() {
    }

    void "Test getting result labels of experiment"() {
        when:"The getReferenceXCategories method is executed"
        setupData(params)
        controller.getReferenceXCategories((int)params.experiment.id)

        then:"The select element with correct options is rendered"
        response.text == '<select id="refXCategory" name="refXCategory" onchange="xCategoryChanged(this.value)" >\r\n' +
                '<option value="null"> </option>\r\n' +
                "<option value=\"$params.resultLabel.name\" >$params.resultLabel.name</option>\r\n" +
                '</select>'
    }

    void "Test getting editor labels of experiment"() {
        when:"The getReferenceYCategories method is executed"
        setupData(params)
        controller.getReferenceYCategories((String)params.plate.barcode, (int)params.experiment.id)

        then:"The select element with correct options is rendered"
        response.text == '<select id="refYCategory" name="refYCategory" onchange="yCategoryChanged()" >\r\n' +
                '<option value="null"> </option>\r\n' +
                '<option value="' + params.editorLabel.category + '" >' + params.editorLabel.category + '</option>\r\n' +
                '</select>'
    }
}
