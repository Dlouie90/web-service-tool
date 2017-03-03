angular.module("WebserviceApp.Directives")

    .directive("projectList", function () {

        return {
            restrict   : "E",
            templateUrl: "features/project/list/project-list.html",
        }
    })

    .directive("editModal", function () {
        return {
            restrict   : "E",
            scope      : {target: "@", object: "="},
            templateUrl: "features/project/list/template.html"
        }
    });