/**
 * Created by shay on 10/12/16.
 */

angular.module("WebserviceApp.Directives")
/**
 * this directive is used to display the current "selected" project.
 * whenever the uses selected a different project, the display change as well.
 * for our project, it is place ion the navigation bar on the upper right
 */
    .directive("activeWidget", function () {
        return {
            restrict: "E",
            templateUrl: "features/project/active_widget/active-widget.html",
            controller: function ($scope, ProjectFactory) {

                $scope.getActiveProject = function () {
                    return ProjectFactory.getActiveProject();
                }
            }
        }
    });