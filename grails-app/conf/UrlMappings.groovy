class UrlMappings {

	static mappings = {
        "/$controller/$action?/$id?(.$format)?"{
            constraints {
                // apply constraints here
            }
        }

        name parse: "/parse/$equipment/$experiment"(controller: 'equipment', action:'parse')


        "/"(view:"/index")
        "500"(view:'/error')
	}
}
