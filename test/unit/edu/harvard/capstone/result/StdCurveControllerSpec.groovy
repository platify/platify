package edu.harvard.capstone.result

import grails.test.mixin.TestMixin
import grails.test.mixin.support.GrailsUnitTestMixin
import spock.lang.Specification

/**
 * See the API for {@link grails.test.mixin.support.GrailsUnitTestMixin} for usage instructions
 */
@TestMixin(GrailsUnitTestMixin)
class StdCurveControllerSpec extends Specification {

    def setup() {
    }

    def cleanup() {
    }

    void "Test getting result data"() {
        when:"The create action is executed"
        controller.create()

        then:"The model is correctly created"
        model.resultInstance!= null
    }
}
