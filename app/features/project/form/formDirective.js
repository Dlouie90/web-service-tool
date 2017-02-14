/**
 * Created by shay on 10/12/16.
 */
angular.module("WebserviceApp.Directives")

/**
 * Simple form to register a project into the application, or used to edit a
 * project. Make sure to assign the project to be edit with the attribute:
 * "project". For example: <project-form project="editThisProject" /> where
 * "editThisProject" represent an object
 */
    .directive("projectForm", function (ProjectFactory) {

        return {
            restrict: "E",
            templateUrl: "features/project/form/form.html",
            scope: {project: "="},
            controller: function ($scope, $timeout) {
                $scope.projects = ProjectFactory.getProjects();

                $scope.addProject = function (project) {
                    // assign an id value to this object
                    project.id = ProjectFactory.generateID();
                    ProjectFactory.addProject(project);
                    // reset the form
                    $scope.project = {};

                    // inform the user that a new project has been added
                    $scope.alertDisplayed = true;
                    $timeout(function () {
                        $scope.alertDisplayed = false;
                    }, 3000)
                }
            }
        }
    });