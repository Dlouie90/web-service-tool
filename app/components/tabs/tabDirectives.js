/**
 * Created by shay on 10/11/16.
 */

angular.module("WebserviceApp.Directives")


/**
 * WHAT IS A TAB?
 * =============================================================================
 * A tab is a similar is a list (<li>) of click-able links organized horizontally.
 * When it is clicked, it will display information, images, or whatever onto a panel
 * below it.
 *
 * Analogy: tabs are buttons that change a tv channel while the pane is the screen,
 * it display the content on the channel.
 *
 *
 * HOW DOES IT WORK?
 * =============================================================================
 * The tab will have an add function attached to the keyword "this". This allow a pane
 * to attach itself to the tabs. Thus, the tabs is really a container for the
 * panes. When you click on a tab (link), you're really clicking on the pane. The
 * link test is really the "title" of the pane directive
 */
    .directive("tabs", function () {
        return {
            restrict: "E",
            transclude: true,
            scope: {},
            controller: function ($scope) {
                var panes = $scope.panes = [];

                $scope.select = function (pane) {
                    angular.forEach(panes, function (pane) {
                        pane.selected = false;
                    });
                    pane.selected = true;
                };

                this.addPane = function (pane) {
                    if (panes.length === 0) {
                        $scope.select(pane);
                    }
                    panes.push(pane);
                };

            },
            templateUrl: "components/tabs/tabs.html"
        };
    })

    /**
     * WHAT IS IT?
     * =============================================================================
     * A pane (or panel) displays the context of the currently selected tab
     * Because the "pane" is dependent on the "tab", the directive needs the following:
     * "required: '^tabs'. This describes their relationship.
     *
     *
     * HOW DOES IT WORK?
     * ============================================================================
     * As mentioned above, the pane attached itself to the tabs directive. The tab
     * directives is really a container for the panes. The most important part about
     * this directive is the link function, which allow the pane to add itself to
     * the parent tab by calling the addPane function (note the TabsCtrl.addPane(scope)
     */
    .directive("pane", function () {
        return {
            require: "^tabs",
            restrict: "E",
            transclude: true,
            scope: {
                title: "@", length: "="
            },

            link: function (scope, element, attrs, TabsCtrl) {
                TabsCtrl.addPane(scope);
            },
            templateUrl: "components/tabs/pane.html"
        }
    });