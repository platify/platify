package edu.harvard.capstone.user

import grails.transaction.Transactional

@Transactional
class ScientistService {

    def springSecurityService

    /**
    * 	Create a new user.
    *	Receive: the Scientist attributes
    *	Returns: the Scientist instance
    */
    Scientist newUser(String firstName, String lastName, String password, String email, Boolean admin){
    	log.info "(String $firstName, String $lastName, String $password, String $email, Boolean $admin)"
    	def scientistInstance = new Scientist (firstName: firstName,
    										   lastName: lastName,
    										   password: password,
    										   email: email).save(failOnError: true)


		if (!scientistInstance?.hasErrors()){
	        // Add Role
	        def externalUser = Role.findOrCreateByAuthority("ROLE_SCIENTIST").save()
	        ScientistRole.findOrCreateByScientistAndRole(scientistInstance, externalUser).save()

	        if(admin){
		        def adminUser = Role.findOrCreateByAuthority("ROLE_ADMIN").save()
		        ScientistRole.findOrCreateByScientistAndRole(scientistInstance, adminUser).save()
	        }
		}

		return scientistInstance
    }


    /**
    *	Delete a Scientist. 
    *	MISSING: Delete all the objects depending of Scientist according to the UML
    */
    def deleteUser(Scientist scientistInstance){
    	def scientistRoles = ScientistRole.findAllByScientist(scientistInstance)

    	scientistRoles.each{
    		it.delete()
    	}

    	scientistInstance.delete()
    }

    Scientist updateUser(Scientist scientistInstance, String firstName, String lastName, String password, String email, Boolean admin){
    	log.info password
    	if (password)
    		scientistInstance.password = password

    	scientistInstance.firstName = firstName
    	scientistInstance.lastName = lastName
    	scientistInstance.email = email

    	scientistInstance.save()

		if (!scientistInstance?.hasErrors()){
			def adminUser = Role.findByAuthority("ROLE_ADMIN")
			def isAdmin = ScientistRole.findByScientistAndRole(scientistInstance, adminUser)
	        if(admin && !isAdmin){
		        ScientistRole.findOrCreateByScientistAndRole(scientistInstance, adminUser).save()
	        } else if (!admin && isAdmin){
	        	isAdmin.delete()
	        }
		} 
		return scientistInstance   	
    }


}
