package edu.harvard.capstone.user

import org.apache.commons.lang.builder.HashCodeBuilder

class ScientistRole implements Serializable {

	private static final long serialVersionUID = 1

	Scientist scientist
	Role role

	boolean equals(other) {
		if (!(other instanceof ScientistRole)) {
			return false
		}

		other.scientist?.id == scientist?.id &&
		other.role?.id == role?.id
	}

	int hashCode() {
		def builder = new HashCodeBuilder()
		if (scientist) builder.append(scientist.id)
		if (role) builder.append(role.id)
		builder.toHashCode()
	}

	static ScientistRole get(long scientistId, long roleId) {
		ScientistRole.where {
			scientist == Scientist.load(scientistId) &&
			role == Role.load(roleId)
		}.get()
	}

	static boolean exists(long scientistId, long roleId) {
		ScientistRole.where {
			scientist == Scientist.load(scientistId) &&
			role == Role.load(roleId)
		}.count() > 0
	}

	static ScientistRole create(Scientist scientist, Role role, boolean flush = false) {
		def instance = new ScientistRole(scientist: scientist, role: role)
		instance.save(flush: flush, insert: true)
		instance
	}

	static boolean remove(Scientist u, Role r, boolean flush = false) {
		if (u == null || r == null) return false

		int rowCount = ScientistRole.where {
			scientist == Scientist.load(u.id) &&
			role == Role.load(r.id)
		}.deleteAll()

		if (flush) { ScientistRole.withSession { it.flush() } }

		rowCount > 0
	}

	static void removeAll(Scientist u, boolean flush = false) {
		if (u == null) return

		ScientistRole.where {
			scientist == Scientist.load(u.id)
		}.deleteAll()

		if (flush) { ScientistRole.withSession { it.flush() } }
	}

	static void removeAll(Role r, boolean flush = false) {
		if (r == null) return

		ScientistRole.where {
			role == Role.load(r.id)
		}.deleteAll()

		if (flush) { ScientistRole.withSession { it.flush() } }
	}

	static constraints = {
		role validator: { Role r, ScientistRole ur ->
			if (ur.scientist == null) return
			boolean existing = false
			ScientistRole.withNewSession {
				existing = ScientistRole.exists(ur.scientist.id, r.id)
			}
			if (existing) {
				return 'userRole.exists'
			}
		}
	}

	static mapping = {
		id composite: ['role', 'scientist']
		version false
	}
}
