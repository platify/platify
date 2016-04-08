package platify

import groovy.sql.Sql
import grails.plugin.springsecurity.annotation.Secured


class SqlController
{
  def springSecurityService
  def dataSource

  static allowedMethods = [save: "POST", update: "PUT", delete: "DELETE"]
  def runQuery(){
    def sql = new Sql(dataSource)
    def rows = sql.rows(params.sql)
    rows.each { row ->
      log.debug row.name
    }
    sql.close()
    render "Query Executed"
  }


  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def index()
  {
    if (!springSecurityService.isLoggedIn()) return

    if (!springSecurityService.principal?.getAuthorities().
            any { it.authority == "ROLE_ADMIN" || it.authority == "ROLE_SUPER_ADMIN" })
    {
      params.owner = springSecurityService.principal
    }
    runQuery();
  }
}



