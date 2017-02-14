/**
 * Created by shay on 10/12/16.
 */

angular.module("WebserviceApp.Directives")

    .directive("projectList", function () {

        return {
            restrict: "E",
            templateUrl: "features/project/list/project-list.html",
        }
    });