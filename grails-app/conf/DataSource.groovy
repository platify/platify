dataSource {
    pooled = true
       driverClassName = "com.mysql.jdbc.Driver"
       username = "platify"
       password = "platify"
       dialect = org.hibernate.dialect.MySQL5InnoDBDialect
       properties {
          maxActive = 50
          maxIdle = 25
          minIdle = 5
          initialSize = 5
          minEvictableIdleTimeMillis = 1800000
          timeBetweenEvictionRunsMillis = 1800000
          maxWait = 10000
          ValidationQuery = 'select 1'
       }
}

hibernate {
    cache.use_second_level_cache = true
    cache.use_query_cache = false
    cache.region.factory_class = 'net.sf.ehcache.hibernate.EhCacheRegionFactory'
}
// environment specific settings
environments {
    development {
        dataSource {
            dbCreate = "none"
            //dbCreate = "create-drop" // one of 'create', 'create-drop', 'update', 'validate', ''
            url = "jdbc:mysql://127.0.0.1:3306/platify?useUnicode=yes&characterEncoding=UTF-8"
        }
    }
    test {
        dataSource {
            dbCreate = "create"
//            dbCreate = "update" // one of 'create', 'create-drop', 'update', 'validate', ''
            url = "jdbc:mysql://127.0.0.1:3306/platify?useUnicode=yes&characterEncoding=UTF-8"
        }
    }
    production {
        dataSource {
            dbCreate = "update" // one of 'create', 'create-drop', 'update', 'validate', ''
            url = "jdbc:mysql://127.0.0.1:3306/platify?useUnicode=yes&characterEncoding=UTF-8"

        }
    }
}


