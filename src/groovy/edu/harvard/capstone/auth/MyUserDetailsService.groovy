package edu.harvard.capstone.auth

import grails.plugin.springsecurity.*
import grails.plugin.springsecurity.SpringSecurityUtils
import grails.plugin.springsecurity.userdetails.GrailsUser
import grails.plugin.springsecurity.userdetails.GrailsUserDetailsService
import org.springframework.security.core.authority.GrantedAuthorityImpl
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UsernameNotFoundException

import edu.harvard.capstone.user.Scientist

class MyUserDetailsService implements GrailsUserDetailsService {

   /**
    * Some Spring Security classes (e.g. RoleHierarchyVoter) expect at least
    * one role, so we give a user with no granted roles this one which gets
    * past that restriction but doesn't grant anything.
    */
   static final List NO_ROLES = [new GrantedAuthorityImpl(SpringSecurityUtils.NO_ROLE)]

   UserDetails loadUserByUsername(String username, boolean loadRoles)
            throws UsernameNotFoundException {
      return loadUserByUsername(username)
   }

   UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

      Scientist.withTransaction { status ->
            def user = Scientist.findByEmail(username)//.findWhere((conf.userLookup.usernamePropertyName): username)
            if (!user) {
                log.warn "User not found: $username request"
                throw new UsernameNotFoundException('User not found', username)
            }
            log.info "User $username trying to log in"
            def authorities = user.authorities.collect {
             new GrantedAuthorityImpl(it.authority)
            }
            createUserDetails user, authorities
        }
   }
}