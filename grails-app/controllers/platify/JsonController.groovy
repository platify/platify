package platify

import edu.harvard.capstone.editor.Compound
import edu.harvard.capstone.editor.DomainLabel
import edu.harvard.capstone.editor.ExperimentalPlateSet
import edu.harvard.capstone.editor.Label
import edu.harvard.capstone.editor.LiquidHandler
import edu.harvard.capstone.editor.PlateSet
import edu.harvard.capstone.editor.PlateTemplate
import edu.harvard.capstone.editor.Well
import edu.harvard.capstone.editor.WellCompound
import edu.harvard.capstone.parser.Equipment
import edu.harvard.capstone.result.RawResultFile
import edu.harvard.capstone.result.Result
import edu.harvard.capstone.result.ResultLabel
import edu.harvard.capstone.result.ResultPlate
import edu.harvard.capstone.result.ResultWell
import edu.harvard.capstone.user.Role
import edu.harvard.capstone.user.Scientist
import edu.harvard.capstone.user.ScientistRole
import grails.plugin.springsecurity.annotation.Secured


class JsonController
{
  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def compound() {
    if (params.id){
      respond Compound.get(params.id), [formats:['json']]
    } else {
      respond Compound.getAll(), [formats:['json']]
    }
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def domain_label() {
    if (params.id){
      respond DomainLabel.get(params.id), [formats:['json']]
    } else {
      respond DomainLabel.getAll(), [formats:['json']]
    }
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def dose() {
    if (params.id){
      respond Label.get(params.id), [formats:['json']]
    } else {
      respond Label.getAll(), [formats:['json']]
    }
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def equipment() {
    if (params.id){
      respond Equipment.get(params.id), [formats:['json']]
    } else {
      respond Equipment.getAll(), [formats:['json']]
    }
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def experimental_plate_set() {
    if (params.id){
      respond ExperimentalPlateSet.get(params.id), [formats:['json']]
    } else {
      respond ExperimentalPlateSet.getAll(), [formats:['json']]
    }
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def label() {
    if (params.id){
      respond Label.get(params.id), [formats:['json']]
    } else {
      respond Label.getAll(), [formats:['json']]
    }
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def liquid_handler() {
    if (params.id){
      respond LiquidHandler.get(params.id), [formats:['json']]
    } else {
      respond LiquidHandler.getAll(), [formats:['json']]
    }
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def plate_set() {
    if (params.id){
      respond PlateSet.get(params.id), [formats:['json']]
    } else {
      respond PlateSet.getAll(), [formats:['json']]
    }
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def plate_template() {
    if (params.id){
      respond PlateTemplate.get(params.id), [formats:['json']]
    } else {
      respond PlateTemplate.getAll(), [formats:['json']]
    }
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def raw_result_file() {
    if (params.id){
      respond RawResultFile.get(params.id), [formats:['json']]
    } else {
      respond RawResultFile.getAll(), [formats:['json']]
    }
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def result() {
    if (params.id){
      respond Result.get(params.id), [formats:['json']]
    } else {
      respond Result.getAll(), [formats:['json']]
    }
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def result_label() {
    if (params.id){
      respond ResultLabel.get(params.id), [formats:['json']]
    } else {
      respond ResultLabel.getAll(), [formats:['json']]
    }
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def result_plate() {
    if (params.id){
      respond ResultPlate.get(params.id), [formats:['json']]
    } else {
      respond ResultPlate.getAll(), [formats:['json']]
    }
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def result_well() {
    if (params.id){
      respond ResultWell.get(params.id), [formats:['json']]
    } else {
      respond ResultWell.getAll(), [formats:['json']]
    }
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def role() {
    if (params.id){
      respond Role.get(params.id), [formats:['json']]
    } else {
      respond Role.getAll(), [formats:['json']]
    }
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def scientist() {
    if (params.id){
      respond Scientist.get(params.id), [formats:['json']]
    } else {
      respond Scientist.getAll(), [formats:['json']]
    }
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def scientist_role() {
    if (params.id){
      respond ScientistRole.get(params.id), [formats:['json']]
    } else {
      respond ScientistRole.getAll(), [formats:['json']]
    }
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def well() {
    if (params.id){
      respond Well.get(params.id), [formats:['json']]
    } else {
      respond Well.getAll(), [formats:['json']]
    }
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def well_compound() {
    if (params.id){
      respond WellCompound.get(params.id), [formats:['json']]
    } else {
      respond WellCompound.getAll(), [formats:['json']]
    }
  }

}
