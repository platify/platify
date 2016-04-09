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
    respond Compound.getAll(), [formats:['json']]
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def domain_label() {
    respond DomainLabel.getAll(), [formats:['json']]
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def dose() {
    respond Label.getAll(), [formats:['json']]
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def equipment() {
    respond Equipment.getAll(), [formats:['json']]
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def experimental_plate_set() {
    respond ExperimentalPlateSet.getAll(), [formats:['json']]
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def label() {
    respond Label.getAll(), [formats:['json']]
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def liquid_handler() {
    respond LiquidHandler.getAll(), [formats:['json']]
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def plate_set() {
    respond PlateSet.getAll(), [formats:['json']]
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def plate_template() {
    respond PlateTemplate.getAll(), [formats:['json']]
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def raw_result_file() {
    respond RawResultFile.getAll(), [formats:['json']]
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def result() {
    respond Result.getAll(), [formats:['json']]
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def result_label() {
    respond ResultLabel.getAll(), [formats:['json']]
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def result_plate() {
    respond ResultPlate.getAll(), [formats:['json']]
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def result_well() {
    respond ResultWell.getAll(), [formats:['json']]
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def role() {
    respond Role.getAll(), [formats:['json']]
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def scientist() {
    respond Scientist.getAll(), [formats:['json']]
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def scientist_role() {
    respond ScientistRole.getAll(), [formats:['json']]
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def well() {
    respond Well.getAll(), [formats:['json']]
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def well_compound() {
    respond WellCompound.getAll(), [formats:['json']]
  }

}
