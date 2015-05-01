package edu.harvard.capstone.editor


import edu.harvard.capstone.user.Scientist
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.SpringSecurityUtils
import grails.converters.JSON

import spock.lang.*

/**
 *
 */
class ExperimentSpec extends Specification {

	def editorService
	def springSecurityService


	def plateTemplate


    def setup() {

    }

    def cleanup() {
    }


	void "Create a plate template"() {
	   when: "A new template is created"
			SpringSecurityUtils.doWithAuth('admin@gmail.com'){
				def data = JSON.parse("""
					{plate: {
						name: 'test name', 
						labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}],
						wells: [{row: '0', column: '0', 'groupName': 'name', labels: [{category: 'val', name: 'val', value: 'val'}, {category: 'val', name: 'val', value: 'val'}]}] 
						}
					}
				""")				
				plateTemplate = editorService.newTemplate(data)
			}
	   then:
	   (plateTemplate != null)
	}

	void "Retrieve my templates"() {
	   when: "Retreive the list of my templates"
	   	def myTemplates
	   	SpringSecurityUtils.doWithAuth('admin@gmail.com'){
	   		def scientist = Scientist.get(springSecurityService.principal.id)
	      	myTemplates = PlateTemplate.findAllByOwner(scientist)
	  	}

	  then: "I should get one template"
	  	myTemplates.size() == 1
	}

}
