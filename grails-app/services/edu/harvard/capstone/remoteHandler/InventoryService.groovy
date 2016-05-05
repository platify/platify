package edu.harvard.capstone.remoteHandler

import grails.transaction.Transactional
import grails.web.JSONBuilder
import org.apache.commons.csv.CSVParser
import static org.apache.commons.csv.CSVFormat.*
import java.nio.file.Paths
import java.nio.file.*
import grails.util.Holders
import groovy.json.*
import java.io.Reader

@Transactional
class InventoryService {

	def compoundLocations() {
		Random rnd = new Random()
		def rrfRoot = System.getenv("PLATIFY_RRF")
		if (!rrfRoot)
			rrfRoot = Holders.grailsApplication.mainContext.servletContext.getRealPath('rrf')


		def compoundList = new ArrayList<CompoundDetails>()
		def compoundDetails
		def valIdx

		FileReader f1 = new FileReader(Paths.get(rrfRoot + '/Compounds.csv').toString());
//		Paths.get(rrfRoot + '/Compounds.csv').withReader { reader ->
  		f1.withReader { reader ->
			CSVParser csv = new CSVParser(reader, DEFAULT.withHeader())
			def plateIdx = -1


			for (record in csv.iterator()) {
				plateIdx++
				for (valIdx = 0; valIdx < record.size(); ++valIdx) {

					compoundDetails = new CompoundDetails()
					compoundDetails.name = record.get(valIdx)
					compoundDetails.concentration = (rnd.nextInt(20) + 1) * 5000
					compoundDetails.row = (int)(valIdx / 10)
					compoundDetails.col = valIdx % 10
					compoundDetails.srcPlateId = 'LHS' + plateIdx

					compoundList.push(compoundDetails)
				}
			}

		}


		def json = JsonOutput.toJson(compoundList)

		return json

		/*
		def builder = new groovy.json.JsonBuilder()
		
		def root = builder.compounds {
			
			
			
			
			
			
			person {
				firstName 'Guillame'
				lastName 'Laforge'
				// Named arguments are valid values for objects too
				address(
						city: 'Paris',
						country: 'France',
						zip: 12345,
				)
				married true
				// a list of values
				conferences 'JavaOne', 'Gr8conf'
			}
		}
		*/
//		json = JsonOutput.prettyPrint(json.toString())

    }
}
