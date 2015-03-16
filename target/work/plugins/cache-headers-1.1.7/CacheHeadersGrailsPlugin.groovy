class CacheHeadersGrailsPlugin {
	def version = "1.1.7"
	def grailsVersion = "2.0 > *"
	def observe = ['controllers']
	def pluginExcludes = [
		"grails-app/controllers/**",
		"src/docs/**"
	]
	def author = "Graeme Rocher"
	def authorEmail = "grocher@gopivotal.com"
	def title = "Caching Headers Plugin"
	def description = 'Improve your application performance with browser caching, with easy ways to set caching headers in controller responses'
	def developers = [ [ name: "Marc Palmer", email: "marc@grailsrocks.com" ], [ name: "Graeme Rocher", email: "grocher@gopivotal.com" ]]
	def issueManagement = [ system: "JIRA", url: "http://jira.grails.org/browse/GPCACHEHEADERS" ]
	def scm = [ url: "http://github.com/grails-plugins/grails-cache-headers" ]
	def license = "APACHE"
	def documentation = "http://grails.org/plugin/cache-headers"

	def doWithDynamicMethods = { ctx ->
		addCacheMethods(application, log)
	}

	def doWithApplicationContext = { ctx ->
		reloadConfig(application, ctx.cacheHeadersService, log)
	}

	def onChange = { event ->
		addCacheMethods(event.application, log)
	}

	def onConfigChange = { event ->
		// Config change might mean that the caching has been turned on/off
		reloadConfig(event.application, event.application.mainContext.cacheHeadersService, log)
	}

	private void reloadConfig(application, svc, log) {
		def conf = application.config.cache.headers
		def cacheSetting = conf.enabled
		svc.enabled = ((cacheSetting instanceof String) || (cacheSetting instanceof Boolean)) ? Boolean.valueOf(cacheSetting.toString()) : true
		svc.presets = conf.presets
		log.info "Caching enabled in Config: ${svc.enabled}"
		log.debug "Caching presets declared: ${svc.presets}"
	}

	private void addCacheMethods(application, log) {

		def svc = application.mainContext.cacheHeadersService

		for (controllerClass in application.controllerClasses) {

			log.debug "Adding cache methods to ${controllerClass.clazz}"

			def mc = controllerClass.metaClass

			mc.cache = { boolean allow -> svc.cache(delegate.response, allow) }

			mc.cache << { String preset -> svc.cache(delegate.response, preset) }

			mc.cache << { Map args -> svc.cache(delegate.response, args) }

			mc.withCacheHeaders = { Closure c -> svc.withCacheHeaders(delegate, c) }

			mc.lastModified = { dateOrLong -> svc.lastModified(delegate.response, dateOrLong) }
		}
	}
}
