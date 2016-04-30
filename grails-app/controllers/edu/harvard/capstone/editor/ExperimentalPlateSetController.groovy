package edu.harvard.capstone.editor

import grails.converters.*;
import static org.springframework.http.HttpStatus.*
import edu.harvard.capstone.result.Result;
import grails.plugin.springsecurity.annotation.Secured

class ExperimentalPlateSetController {

  def springSecurityService
  def editorService

  static allowedMethods = [save: "POST", update: "PUT", delete: "DELETE"]

  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def index(Integer max) {
    if (!springSecurityService.isLoggedIn())
      return

    if(!springSecurityService.principal?.getAuthorities().any { it.authority == "ROLE_ADMIN" || it.authority == "ROLE_SUPER_ADMIN"}){
      params.owner = springSecurityService.principal
    }

    params.max = Math.min(max ?: 10, 100)
    def experiments = ExperimentalPlateSet.list(params)
    def resultsByExperiment = Result.list().collectEntries{ result ->
      [result.experiment, result]
    }
    def disabled = experiments.collectEntries { experiment ->
      [experiment.id,
       resultsByExperiment.containsKey(experiment) ? '' : 'disabled']
    }

    respond experiments, model:[experimentalPlateSetInstanceCount: ExperimentalPlateSet.count(),
                                disabled: disabled]
  }

  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def showactions(ExperimentalPlateSet experimentalPlateSetInstance) {
    if (!springSecurityService.isLoggedIn())
      return

    if(!springSecurityService.principal?.getAuthorities().any { it.authority == "ROLE_ADMIN" || it.authority == "ROLE_SUPER_ADMIN"}){
      params.owner = springSecurityService.principal
    }

    def plateSetList = PlateSet.findAllByExperiment(experimentalPlateSetInstance);
    respond experimentalPlateSetInstance, model:[plateSetlist: plateSetList]
  }

  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def createPlate() {
    if (!springSecurityService.isLoggedIn())
      return

    if(!springSecurityService.principal?.getAuthorities().any { it.authority == "ROLE_ADMIN" || it.authority == "ROLE_SUPER_ADMIN"}){
      params.owner = springSecurityService.principal
    }
    respond new PlateTemplate(params), model:[expId: params.expid, templateId: params.tmpid]
  }

  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def createPlateCloned() {
     if (!springSecurityService.isLoggedIn())
       return
     if(!springSecurityService.principal?.getAuthorities().any { it.authority == "ROLE_ADMIN" || it.authority == "ROLE_SUPER_ADMIN"}){
        params.owner = springSecurityService.principal
     }
     render (view: "createPlate", model:[expId: params.expid, sourcePlateId: params.sourceplate])
  }

  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def selectTemplate(ExperimentalPlateSet experimentalPlateSetInstance) {
    if (!springSecurityService.isLoggedIn())
      return

    if(!springSecurityService.principal?.getAuthorities().any { it.authority == "ROLE_ADMIN" || it.authority == "ROLE_SUPER_ADMIN"}){
      params.owner = springSecurityService.principal
    }
    respond experimentalPlateSetInstance
  }

  def barcodes(ExperimentalPlateSet experimentalPlateSetInstance){
    if (!experimentalPlateSetInstance) {
      render(contentType: "application/json") {
        [error: "No data received"]
      }
      return
    }

    def plateIDs = PlateSet.findAllByExperiment(experimentalPlateSetInstance).collect{it.barcode}
    render(contentType: "application/json") {
      [barcodes: plateIDs]
    }


  }

  def show(ExperimentalPlateSet experimentalPlateSetInstance) {
    respond experimentalPlateSetInstance
  }

  def showy(ExperimentalPlateSet experimentalPlateSetInstance) {
    render editorService.getExperimentData(experimentalPlateSetInstance) as JSON
  }


  def showWithTemplate(ExperimentalPlateSet experimentalPlateSetInstance) {
    def result = []
    if (!experimentalPlateSetInstance) {
      result = [error: "No such experiment"]
    }
    else {
      def plateSets = PlateSet.findAllByExperiment(experimentalPlateSetInstance)


      def templateInstance = plateSet ? plateSet[0].plate : null
      def template = templateInstance ? editorService.getTemplate(templateInstance) : null
      result = [experiment: experimentalPlateSetInstance,
                plateTemplate: template]
    }
    render result as JSON
  }

  def create() {
    respond new ExperimentalPlateSet(params)
  }

  def save(String name, String description) {

    if (!springSecurityService.isLoggedIn()){
      redirect action: "index", method: "GET"
      return
    }

    def experimentalPlateSetInstance = editorService.newExperiment(name, description)

    if (experimentalPlateSetInstance == null) {
      notFound()
      return
    }

    if (experimentalPlateSetInstance.hasErrors()) {
      respond experimentalPlateSetInstance.errors, view:'create'
      return
    }

    request.withFormat {
      form multipartForm {
        flash.message = message(code: 'default.created.message', args: [message(code: 'experimentalPlateSet.label', default: 'ExperimentalPlateSet'), experimentalPlateSetInstance.id])
        redirect action: 'showactions', id: experimentalPlateSetInstance.id
      }
      '*' { respond experimentalPlateSetInstance, [status: CREATED] }
    }
  }

  def edit(ExperimentalPlateSet experimentalPlateSetInstance) {
    respond experimentalPlateSetInstance
  }


  def update(ExperimentalPlateSet experimentalPlateSetInstance) {
    if (experimentalPlateSetInstance == null) {
      notFound()
      return
    }

    if (experimentalPlateSetInstance.hasErrors()) {
      respond experimentalPlateSetInstance.errors, view:'edit'
      return
    }

    experimentalPlateSetInstance.save flush:true

    request.withFormat {
      form multipartForm {
        flash.message = message(code: 'default.updated.message', args: [message(code: 'ExperimentalPlateSet.label', default: 'ExperimentalPlateSet'), experimentalPlateSetInstance.id])
        redirect experimentalPlateSetInstance
      }
      '*'{ respond experimentalPlateSetInstance, [status: OK] }
    }
  }

  def delete(ExperimentalPlateSet experimentalPlateSetInstance) {

    if (experimentalPlateSetInstance == null) {
      notFound()
      return
    }

    experimentalPlateSetInstance.delete flush:true

    request.withFormat {
      form multipartForm {
        flash.message = message(code: 'default.deleted.message', args: [message(code: 'ExperimentalPlateSet.label', default: 'ExperimentalPlateSet'), experimentalPlateSetInstance.id])
        redirect action:"index", method:"GET"
      }
      '*'{ render status: NO_CONTENT }
    }
  }

  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def exportPlate(Integer max) {

    if(!springSecurityService.principal?.getAuthorities().any { it.authority == "ROLE_ADMIN" || it.authority == "ROLE_SUPER_ADMIN"}){
      params.owner = springSecurityService.principal
    }

    params.max = Math.min(max ?: 10, 100)
    def plateSetList = PlateSet.list(params)
    log.info plateSetList
    respond plateSetList, model:[plateSetInstanceCount: PlateSet.count(), plateSetList: plateSetList]
  }



  def exportPlateSetFile(PlateSet plateSetInstance){
    if (plateSetInstance == null) {
      notFound()
      return
    }
    def file = editorService.exportPlate(plateSetInstance)
    response.setHeader "Content-disposition", "attachment; filename=${file.name}.csv"
    response.contentType = 'text-plain'
    response.outputStream << file.text
    response.outputStream.flush()
  }


  def exportPlateSetJSON(PlateSet plateSetInstance){
    if (plateSetInstance == null) {
      notFound()
      return
    }
    def plateJSONString = editorService.getPlate(plateSetInstance)
    response.setHeader "Content-disposition", "attachment; filename=plate.json"
    response.contentType = 'text-json'
    response.outputStream << (plateJSONString as JSON)
    response.outputStream.flush()
  }


  def exportPlateSetXml(PlateSet plateSetInstance){
    if (plateSetInstance == null) {
      notFound()
      return
    }
    def plateXMLString = editorService.getPlateXml(plateSetInstance)
    response.setHeader "Content-disposition", "attachment; filename=plate.xml"
    response.contentType = 'application/xml'
    response.outputStream << plateXMLString
    response.outputStream.flush()
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def exportTemplate() {
  }


  def exportTemplateFile(PlateTemplate plateTemplateInstance){
    if (plateTemplateInstance == null) {
      notFound()
      return
    }
    def file = editorService.exportTemplate(plateTemplateInstance)
    response.setHeader "Content-disposition", "attachment; filename=${file.name}.csv"
    response.contentType = 'text-plain'
    response.outputStream << file.text
    response.outputStream.flush()
  }


  def exportTemplateJSONFile(PlateTemplate plateTemplateInstance){
    if (plateTemplateInstance == null) {
      notFound()
      return
    }
    def plateTemplateString = editorService.getTemplate(plateTemplateInstance)
    response.setHeader "Content-disposition", "attachment; filename=plateTemplate.json"
    response.contentType = 'text-json'
    response.outputStream << (plateTemplateString as JSON)
    response.outputStream.flush()
  }


  def exportTemplateXMLFile(PlateTemplate plateTemplateInstance){
    if (plateTemplateInstance == null) {
      notFound()
      return
    }
    def plateTemplateString = editorService.getTemplateXML(plateTemplateInstance)
    response.setHeader "Content-disposition", "attachment; filename=plateTemplate.xml"
    response.contentType = 'text-xml'
    response.outputStream << plateTemplateString
    response.outputStream.flush()
  }


  protected void notFound() {
    request.withFormat {
      form multipartForm {
        flash.message = message(code: 'default.not.found.message', args: [message(code: 'experimentalPlateSet.label', default: 'ExperimentalPlateSet'), params.id])
        redirect action: "index", method: "GET"
      }
      '*'{ render status: NOT_FOUND }
    }
  }
}
