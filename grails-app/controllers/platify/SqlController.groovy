package platify

import groovy.sql.Sql
import grails.plugin.springsecurity.annotation.Secured

class SqlController
{
  def springSecurityService
  def dataSource
  static allowedMethods = [run: "POST", update: "PUT", delete: "DELETE", index: ["GET", "POST"] ]

  @Secured(['ROLE_SCIENTIST', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])
  def index()
  {
    if (!springSecurityService.isLoggedIn()) return

    if (!springSecurityService.principal?.getAuthorities().
            any { it.authority == "ROLE_ADMIN" || it.authority == "ROLE_SUPER_ADMIN" })
    {
      params.owner = springSecurityService.principal
    }

    if (request.method == 'POST') {
      def sql = new Sql(dataSource)
      def rows = sql.rows(params.sql)
      sql.close()
      [results: rows]
    } else {
      [results: null]
    }
  }
}

