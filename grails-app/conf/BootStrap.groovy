import edu.harvard.capstone.user.Scientist
import edu.harvard.capstone.user.ScientistRole
import edu.harvard.capstone.user.Role

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

		}
		log.info "Users: " + Scientist.count()
		log.info "Roles: " + Role.count()
		log.info "UserRole: " + ScientistRole.count()            
		
    }
    def destroy = {
    }
}
