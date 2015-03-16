package edu.harvard.capstone.result



import static org.springframework.http.HttpStatus.*
import grails.transaction.Transactional

@Transactional(readOnly = true)
class RefactoredDataController {

    static allowedMethods = [save: "POST", update: "PUT", delete: "DELETE"]

    def index(Integer max) {
        params.max = Math.min(max ?: 10, 100)
        respond RefactoredData.list(params), model:[refactoredDataInstanceCount: RefactoredData.count()]
    }

    def show(RefactoredData refactoredDataInstance) {
        respond refactoredDataInstance
    }

    def create() {
        respond new RefactoredData(params)
    }

    @Transactional
    def save(RefactoredData refactoredDataInstance) {
        if (refactoredDataInstance == null) {
            notFound()
            return
        }

        if (refactoredDataInstance.hasErrors()) {
            respond refactoredDataInstance.errors, view:'create'
            return
        }

        refactoredDataInstance.save flush:true

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.created.message', args: [message(code: 'refactoredData.label', default: 'RefactoredData'), refactoredDataInstance.id])
                redirect refactoredDataInstance
            }
            '*' { respond refactoredDataInstance, [status: CREATED] }
        }
    }

    def edit(RefactoredData refactoredDataInstance) {
        respond refactoredDataInstance
    }

    @Transactional
    def update(RefactoredData refactoredDataInstance) {
        if (refactoredDataInstance == null) {
            notFound()
            return
        }

        if (refactoredDataInstance.hasErrors()) {
            respond refactoredDataInstance.errors, view:'edit'
            return
        }

        refactoredDataInstance.save flush:true

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.updated.message', args: [message(code: 'RefactoredData.label', default: 'RefactoredData'), refactoredDataInstance.id])
                redirect refactoredDataInstance
            }
            '*'{ respond refactoredDataInstance, [status: OK] }
        }
    }

    @Transactional
    def delete(RefactoredData refactoredDataInstance) {

        if (refactoredDataInstance == null) {
            notFound()
            return
        }

        refactoredDataInstance.delete flush:true

        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.deleted.message', args: [message(code: 'RefactoredData.label', default: 'RefactoredData'), refactoredDataInstance.id])
                redirect action:"index", method:"GET"
            }
            '*'{ render status: NO_CONTENT }
        }
    }

    protected void notFound() {
        request.withFormat {
            form multipartForm {
                flash.message = message(code: 'default.not.found.message', args: [message(code: 'refactoredData.label', default: 'RefactoredData'), params.id])
                redirect action: "index", method: "GET"
            }
            '*'{ render status: NOT_FOUND }
        }
    }
}
