import java.util.Random

import edu.harvard.capstone.user.Scientist
import edu.harvard.capstone.user.ScientistRole
import edu.harvard.capstone.user.Role

import edu.harvard.capstone.editor.DomainLabel
import edu.harvard.capstone.editor.ExperimentalPlateSet
import edu.harvard.capstone.editor.Label
import edu.harvard.capstone.editor.PlateSet
import edu.harvard.capstone.editor.PlateTemplate
import edu.harvard.capstone.editor.Well
import edu.harvard.capstone.parser.Equipment
import edu.harvard.capstone.result.Result
import edu.harvard.capstone.result.ResultLabel
import edu.harvard.capstone.result.ResultPlate
import edu.harvard.capstone.result.ResultWell

class BootStrap {

    def init = { servletContext ->
    	if (!Scientist.count()){

            def andres = new Scientist (firstName: "Andres", lastName: "Arslanian", email: "andres@gmail.com", password:"admin").save(failOnError: true, flush: true)
            def jaime = new Scientist (firstName: "Jaime", lastName: "Valencia", email: "jaime@gmail.com", password:"admin").save(failOnError: true, flush: true)
            def zach = new Scientist (firstName: "Zach", lastName: "Martin", email: "zach@gmail.com", password:"admin").save(failOnError: true, flush: true)
            def frank = new Scientist (firstName: "Frank", lastName: "O'Connor", email: "frank@gmail.com", password:"admin").save(failOnError: true, flush: true)
            def dave = new Scientist (firstName: "Dave", lastName: "Bonner", email: "dave@gmail.com", password:"admin").save(failOnError: true, flush: true)

            def admin = new Scientist (firstName: "John", lastName: "Davids", email: "admin@gmail.com", password:"admin").save(failOnError: true, flush: true)
			def scientist = new Scientist (firstName: "Mike", lastName: "Tara", email: "s@gmail.com", password:"s").save(failOnError: true, flush: true)

            // Roles
            def externalUser = Role.findOrCreateByAuthority("ROLE_SCIENTIST").save(flush: true)
            def adminUser = Role.findOrCreateByAuthority("ROLE_ADMIN").save(flush: true)
            def superAdmin = Role.findOrCreateByAuthority("ROLE_SUPER_ADMIN").save(flush: true)

            // User Roles
            ScientistRole.findOrCreateByScientistAndRole(admin, externalUser).save(flush: true)
            ScientistRole.findOrCreateByScientistAndRole(admin, adminUser).save(flush: true)
            ScientistRole.findOrCreateByScientistAndRole(scientist, externalUser).save(flush: true)

            ScientistRole.findOrCreateByScientistAndRole(andres, externalUser).save(flush: true)
            ScientistRole.findOrCreateByScientistAndRole(andres, adminUser).save(flush: true)
            ScientistRole.findOrCreateByScientistAndRole(andres, superAdmin).save(flush: true)
            ScientistRole.findOrCreateByScientistAndRole(jaime, externalUser).save(flush: true)
            ScientistRole.findOrCreateByScientistAndRole(jaime, adminUser).save(flush: true)
            ScientistRole.findOrCreateByScientistAndRole(jaime, superAdmin).save(flush: true)
            ScientistRole.findOrCreateByScientistAndRole(zach, externalUser).save(flush: true)
            ScientistRole.findOrCreateByScientistAndRole(zach, adminUser).save(flush: true)
            ScientistRole.findOrCreateByScientistAndRole(zach, superAdmin).save(flush: true)
            ScientistRole.findOrCreateByScientistAndRole(frank, externalUser).save(flush: true)
            ScientistRole.findOrCreateByScientistAndRole(frank, adminUser).save(flush: true)
            ScientistRole.findOrCreateByScientistAndRole(frank, superAdmin).save(flush: true)
            ScientistRole.findOrCreateByScientistAndRole(dave, externalUser).save(flush: true)
            ScientistRole.findOrCreateByScientistAndRole(dave, adminUser).save(flush: true)
            ScientistRole.findOrCreateByScientistAndRole(dave, superAdmin).save(flush: true)

            //def config = '''{"name": "abc","machineName": "defg","description": "test6","exampleFileName": "envisionMultiPlate copy.txt","exampleFileContents": [],"delimiter": "tab","plate": {"featureLabel": "plate","description": "","topLeftCoords": [1,1],"bottomRightCoords": [21,26],"topLeftValue": "Barcode Assay: ","bottomRightValue": "1.184\r","relativeToLeftX": 1,"relativeToLeftY": 1,"color": 0,"typeOfFeature": "plate"},"experimentFeatures": [],"features": [{"featureLabel": "data plate","description": "","topLeftCoords": [6,3],"bottomRightCoords": [21,26],"topLeftValue": "1.2475","bottomRightValue": "1.184\r","relativeToLeftX": 2,"relativeToLeftY": 5,"color": 1,"typeOfFeature": "data","importData": true},{"featureLabel": "temperature","description": "","topLeftCoords": [6,2],"bottomRightCoords": [6,2],"topLeftValue": "22.7","bottomRightValue": "22.7","relativeToLeftX": 1,"relativeToLeftY": 5,"color": 2,"typeOfFeature": "unique","importData": true}],"multiplePlatesPerFile": true,"multipleValuesPerWell": false,"gridFormat": true}'''
            def config = '''
                {
				  "id":"2",	
                  "name": "abc",
                  "machineName": "defg",
                  "description": "test6",
                  "exampleFileName": "envisionMultiPlate copy.txt",
                  "exampleFileContents": [

                  ],
                  "delimiter": "tab",
                  "plate": {
                    "featureLabel": "plate",
                    "description": "",
                    "topLeftCoords": [
                      1,
                      1
                    ],
                    "bottomRightCoords": [
                      21,
                      26
                    ],
                    "topLeftValue": "Barcode Assay: ",
                    "bottomRightValue": "1.184",
                    "relativeToLeftX": 1,
                    "relativeToLeftY": 1,
                    "color": 0,
                    "typeOfFeature": "plate"
                  },
                  "experimentFeatures": [

                  ],
                  "features": [
                    {
                      "featureLabel": "data plate",
                      "description": "",
                      "topLeftCoords": [
                        6,
                        3
                      ],
                      "bottomRightCoords": [
                        21,
                        26
                      ],
                      "topLeftValue": "1.2475",
                      "bottomRightValue": "1.184",
                      "relativeToLeftX": 2,
                      "relativeToLeftY": 5,
                      "color": 1,
                      "typeOfFeature": "data",
                      "importData": true
                    },
                    {
                      "featureLabel": "temperature",
                      "description": "",
                      "topLeftCoords": [
                        6,
                        2
                      ],
                      "bottomRightCoords": [
                        6,
                        2
                      ],
                      "topLeftValue": "22.7",
                      "bottomRightValue": "22.7",
                      "relativeToLeftX": 1,
                      "relativeToLeftY": 5,
                      "color": 2,
                      "typeOfFeature": "unique",
                      "importData": true
                    }
                  ],
                  "multiplePlatesPerFile": true,
                  "multipleValuesPerWell": false,
                  "gridFormat": true
                }
            '''
            def machine1 = new Equipment(name: "First Equipment", machineName: "My machine", description: "This is my machine description", config: config).save(flush: true)
            new Equipment(name: "Second Equipment", machineName: "My greate machine", description: "This is my very long machine description", config: config).save(flush: true)            

            def experiment1 = new ExperimentalPlateSet(owner: andres, name: "Inhibitor Assay", description: "Assay with inihibitors description").save(flush: true)
            new ExperimentalPlateSet(owner: scientist, name: "Scientist Assay", description: "Scientist assay description").save(flush: true)
            new ExperimentalPlateSet(owner: admin, name: "Admin Assay", description: "Admin assay description").save(flush: true)
            new ExperimentalPlateSet(owner: andres, name: "Zero Assay", description: "Zero assay description").save(flush: true)
            def experiment3 = new ExperimentalPlateSet(owner: zach, name: "envision", description: "Envision assay description").save(flush: true)

            def template1 = new PlateTemplate(owner: andres, name: "first template", width: "24", height: "16").save(flush: true)
            def template2 = new PlateTemplate(owner: zach, name: "envision template", width: "24", height: "16").save(flush: true)

            def plateSet1 = new PlateSet(plate: template1, experiment: experiment1, assay: "my assay", barcode: "10293").save(flush: true)
            def plateSet2 = new PlateSet(plate: template1, experiment: experiment1, assay: "my assay", barcode: "3321").save(flush: true)
            def plateSet3 = new PlateSet(plate: template1, experiment: experiment1, assay: "my assay", barcode: "2334").save(flush: true)

            new PlateSet(plate: template2, experiment: experiment3, assay: "my assay", barcode: "001one").save(flush: true)
            new PlateSet(plate: template2, experiment: experiment3, assay: "my assay", barcode: "002two").save(flush: true)
            new PlateSet(plate: template2, experiment: experiment3, assay: "my assay", barcode: "003three").save(flush: true)
            new PlateSet(plate: template2, experiment: experiment3, assay: "my assay", barcode: "004four").save(flush: true)
            new PlateSet(plate: template2, experiment: experiment3, assay: "my assay", barcode: "005five").save(flush: true)
            new PlateSet(plate: template2, experiment: experiment3, assay: "my assay", barcode: "006six").save(flush: true)
            new PlateSet(plate: template2, experiment: experiment3, assay: "my assay", barcode: "007seven").save(flush: true)
            new PlateSet(plate: template2, experiment: experiment3, assay: "my assay", barcode: "008eight").save(flush: true)
            new PlateSet(plate: template2, experiment: experiment3, assay: "my assay", barcode: "009nine").save(flush: true)
            new PlateSet(plate: template2, experiment: experiment3, assay: "my assay", barcode: "010ten").save(flush: true)
            new PlateSet(plate: template2, experiment: experiment3, assay: "my assay", barcode: "011eleven").save(flush: true)
            new PlateSet(plate: template2, experiment: experiment3, assay: "my assay", barcode: "012twelve").save(flush: true)
            new PlateSet(plate: template2, experiment: experiment3, assay: "my assay", barcode: "013thirteen").save(flush: true)
            new PlateSet(plate: template2, experiment: experiment3, assay: "my assay", barcode: "014fourteen").save(flush: true)
            new PlateSet(plate: template2, experiment: experiment3, assay: "my assay", barcode: "015fifteen").save(flush: true)
            new PlateSet(plate: template2, experiment: experiment3, assay: "my assay", barcode: "016sixteen").save(flush: true)
            new PlateSet(plate: template2, experiment: experiment3, assay: "my assay", barcode: "017seventeen").save(flush: true)
            new PlateSet(plate: template2, experiment: experiment3, assay: "my assay", barcode: "018eighteen").save(flush: true)
            new PlateSet(plate: template2, experiment: experiment3, assay: "my assay", barcode: "019nineteen").save(flush: true)
            new PlateSet(plate: template2, experiment: experiment3, assay: "my assay", barcode: "020twenty").save(flush: true)
            new PlateSet(plate: template2, experiment: experiment3, assay: "my assay", barcode: "021twenty-one").save(flush: true)
            new PlateSet(plate: template2, experiment: experiment3, assay: "my assay", barcode: "022twenty-two").save(flush: true)
            new PlateSet(plate: template2, experiment: experiment3, assay: "my assay", barcode: "023twenty-three").save(flush: true)
            new PlateSet(plate: template2, experiment: experiment3, assay: "my assay", barcode: "024twenty-four").save(flush: true)

	    // largely stolen from ResultService.save(), let's set up a plate including results
            def result1 = new Result(owner: andres, equipment: machine1, experiment: experiment1, name: "Results 1", description: "Do we really need to name and describe results?").save(flush: true)
	    def resultLabel1 = new ResultLabel(name: "result label", value: "result label value", labelType: ResultLabel.LabelType.LABEL, scope: ResultLabel.LabelScope.RESULT, domainId: result1.id).save(flush: true)
	    def resultPlate1 = new ResultPlate(result: result1, rows: 4, columns: 4, barcode: plateSet1.barcode).save(flush: true)
	    def resultPlateLabel = new ResultLabel(name: "result plate label", value: "result plate label value", labelType: ResultLabel.LabelType.LABEL, scope: ResultLabel.LabelScope.PLATE, domainId: resultPlate1.id).save(flush: true)

            // pick some labels to apply to the wells
            def foo = new Label(category: "foo", name: "foo").save(flush: true)
            def bar = new Label(category: "foo", name: "bar").save(flush: true)
            def baz = new Label(category: "foo", name: "baz").save(flush: true)

	    def random = new Random()
	    def controlWells = []
	    def controlLabels = []
	    for (x in 0 .. resultPlate1.rows-1) {
		for (y in 0 .. resultPlate1.columns-1) {
		    def well = new Well(plate: template1, column: x, row: y,
					control: Well.WellControl.EMPTY).save(flush: true)
		    if ((x < 4) && (y == 0)) {
                        controlWells << well
                        def domainLabel = new DomainLabel(label: foo, domainId: well.id, labelType: DomainLabel.LabelType.WELL).save(flush: true)
                    }
                    else {
                        def thisLabel = ((x % 2) == 1) ? bar : baz;
                        def domainLabel = new DomainLabel(label: thisLabel, domainId: well.id, labelType: DomainLabel.LabelType.WELL).save(flush: true)
                    }
		    def resultWell = new ResultWell(plate: resultPlate1, well: well).save(flush: true)
		    def resultLabel = new ResultLabel(name: "smoots",
						      value: random.nextFloat() * 100,
						      labelType: ResultLabel.LabelType.RAW_DATA,
						      scope: ResultLabel.LabelScope.WELL,
						      domainId: resultWell.id).save(flush: true)
		    if ((x < 4) && (y == 0)) { controlLabels << resultLabel }
		}
	    }
	    for (i in 0 .. 1) {
		controlWells[i].control = Well.WellControl.NEGATIVE
		controlWells[i].save(flush: true)
		controlLabels[i].value = "0"
		controlLabels[i].save(flush: true)
	    }
	    for (i in 2 .. 3) {
		controlWells[i].control = Well.WellControl.POSITIVE
		controlWells[i].save(flush: true)
		controlLabels[i].value = "100"
		controlLabels[i].save(flush: true)
	    }
		}
		log.info "Users: " + Scientist.count()
		log.info "Roles: " + Role.count()
		log.info "UserRole: " + ScientistRole.count()            
		
    }
    def destroy = {
    }
}
