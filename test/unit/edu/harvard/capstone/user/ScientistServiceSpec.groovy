package edu.harvard.capstone.user

import grails.test.mixin.Mock
import grails.test.mixin.TestFor
import spock.lang.Specification

/**
 * See the API for {@link grails.test.mixin.services.ServiceUnitTestMixin} for usage instructions
 */
@TestFor(ScientistService)
@Mock([Scientist, Role, ScientistRole])
class ScientistServiceSpec extends Specification {

    def setup() {
    }

    def cleanup() {
    }

	void "Test user creation"() {
		when: "Created with valid params a Scientist"
		def scientist = service.newUser('first name', 'last name', 'password', "my@email.com", false)

		then:
		scientist.validate()
		scientist.authorities.any{ it.authority == "ROLE_SCIENTIST"}
		scientist.authorities.any{ it.authority != "ROLE_ADMIN" }
	}

	void "Test user creation"() {
		when: "Created with valid params an Admin"
		def scientist = service.newUser('first name', 'last name', 'password', "my@email.com", true)

		then:
		scientist.validate()
		scientist.authorities.any{ it.authority == "ROLE_SCIENTIST" }
		scientist.authorities.any{ it.authority == "ROLE_ADMIN" }
	}

	void "Test user creation"() {
		when: "Created with invalid params"
		def scientist = service.newUser('first name', 'last name', '', "my@email.com", false)

		then:
		!scientist.validate()
	}

	void "Test update user"() {
		when: "Update with valid params"
		def scientist = service.newUser('first name', 'last name', 'password', "my@email.com", false)
		scientist = service.updateUser(scientist, 'test', 'last name', '', "my@email.com", false)

		then:
		scientist.validate()
		scientist.firstName == 'test'
	}

	void "Test delete user"() {
		when: "A user is deleted"
		def scientist = service.newUser('first name', 'last name', 'password', "my@email.com", false)
		service.deleteUser(scientist)

		then:
		!Scientist.get(scientist.id)
	}

}
