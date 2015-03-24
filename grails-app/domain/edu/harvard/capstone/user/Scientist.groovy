package edu.harvard.capstone.user

class Scientist {

	transient springSecurityService

	String password
	boolean enabled = true
	boolean accountExpired
	boolean accountLocked
	boolean passwordExpired

	String firstName
	String lastName
	String email

	Date dateCreated
	Date lastUpdated

	static transients = ['springSecurityService']

	static constraints = {
		email email: true, blank: false, unique: true
		password blank: false

	}

	static mapping = {
		password column: '`password`'
	}

	Set<Role> getAuthorities() {
		ScientistRole.findAllByScientist(this).collect { it.role }
	}

	def beforeInsert() {
		encodePassword()
	}

	def beforeUpdate() {
		if (isDirty('password')) {
			encodePassword()
		}
	}

	protected void encodePassword() {
		password = springSecurityService?.passwordEncoder ? springSecurityService.encodePassword(password) : password
	}
}
