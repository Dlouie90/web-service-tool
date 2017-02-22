/** * Created by shay on 10/12/16. */

angular.module("WebserviceApp.Controllers")
    .controller("ProjectCtrl",
        function ($scope, $filter, $http, ProjectFactory, ConstantFactory) {

            // for convinces
            const constant = ConstantFactory;

            let selectedAuthor = null;

            let runBtnToggle = false;

            // default text, can be toggle to 'Stop Project"
            let runBtnText = "Run Project";

            $scope.activeProject     = ProjectFactory.getActiveProject();
            $scope.projectToBeEdited = {};
            $scope.projects          = ProjectFactory.getProjects();
            $scope.selectedPage      = 1;
            $scope.pageSize          = constant.PROJECT_PER_PAGE;

            $scope.topics = [
                {topic: "Graph"},
                {topic: "Summary"},
                {topic: "Analytic"},
                {topic: "History"},
            ];

            $scope.number         = null;
            $scope.plot           = {};
            $scope.selectedOption = undefined;

            $scope.selectedTopic = "";

            $scope.compositionLevels = [];

            $scope.circlePack = [];

            /* =============== Author buttons functions =============== */


            $scope.selectAuthor   = function (author) {
                selectedAuthor      = author;
                $scope.selectedPage = 1;
            };
            $scope.getAuthorClass = function (author) {
                return selectedAuthor == author ? constant.ACTIVE_BTN_CSS : "";
            };

            $scope.authorFilter = function (project) {
                return selectedAuthor == null ||
                    project.author == selectedAuthor;
            };

            $scope.getAuthorCount = function (author) {
                var count = 0;
                angular.forEach($scope.projects, function (project) {
                    if (project.author == author)
                        count++;
                });

                return count;
            };

            /* =============== Project Panel functions =============== */
            $scope.getPanelClass = function (project) {
                return ProjectFactory.getActiveProject().id == project.id
                    ? constant.ACTIVE_PANEL_CSS : ""
            };
            $scope.selectPanel   = function (project) {
                ProjectFactory.setActiveProject(project.id);
                $scope.selectedOption = undefined;
            };

            $scope.editProject = function (project) {
                $scope.projectToBeEdited = project;
            };

            $scope.deleteProject = function (project) {
                ProjectFactory.removeProject(project);
                $scope.projects = ProjectFactory.getProjects();
            };

            /* =============== Pagination functions =============== */


            $scope.selectPage = function (page) {
                $scope.selectedPage = page;
            };

            $scope.getPageClass = function (page) {
                return $scope.selectedPage == page ? constant.ACTIVE_BTN_CSS : ""
            };

            /* =============== SIDE BAR OPTIONS  FUNCTIONS =============== */


            $scope.selectOption   = function (option) {
                $scope.selectedOption = option;
                ProjectFactory.clearGraph();
            };
            $scope.getOptionClass = function (option) {

                if ($scope.selectedOption)
                    return $scope.selectedOption.name == option.name ? constant.ACTIVE_BTN_CSS : "";
                else
                    return "";
            };

            /* =============== PROJECT FUNCTIONS =============== */


            $scope.getActiveProject = function () {
                $scope.activeProject = ProjectFactory.getActiveProject();
                return $scope.activeProject;
            };

            $scope.displayTopic = topicStr => {
                switch (topicStr) {
                    case "Graph":
                        $scope.loadGraph();
                        break;
                    case "Summary":
                        $scope.circlePack =
                            ProjectFactory.getCirclePackData();
                        break;
                }
                $scope.selectedTopic = topicStr;

            };
            /* =============== GRAPH FUNCTIONS =============== */

            $scope.saveGraph = function () {
                ProjectFactory.saveGraph();
                updateCompositionLevels();
            };

            $scope.resetGraph = function () {
                ProjectFactory.resetGraph();
                updateCompositionLevels();
            };

            $scope.loadGraph = function () {
                ProjectFactory.loadGraph();
                updateCompositionLevels();
            };

            $scope.goBackOneLevel = function () {
                ProjectFactory.goBackOneLevel();
                updateCompositionLevels();
            };


            $scope.viewComposition = function () {
                ProjectFactory.viewComposition();
                updateCompositionLevels();
            };


            $scope.jumpToState = index => {
                ProjectFactory.updateToState(index);
                updateCompositionLevels();
            };

            /* =============== BUTTONS FUNCTIONS =============== */

            $scope.getIconClass = function () {
                return runBtnToggle ? constant.SPIN_ICON : ""
            };

            // display the "run" attribute text as the default text (when
            // the page is first loaded, else return the text field .

            $scope.displayBtnText = function () {
                return runBtnText;
            };

            $scope.getBtnClass = function () {
                return runBtnToggle ? constant.CANCEL_BTN_CSS : constant.DEFAULT_BTN_CSS;
            };


            /* =============== NON $SCOPE FUNCTIONS =============== */
            /** Generate a list of parent's node id from the states track.
             * If the state has not parent node (the root state), the its
             * give "ROOT".*/
            function updateCompositionLevels() {
                const STATES       = ProjectFactory.getStates();
                $scope.parentNodes = STATES.map(state => {
                    return state.parentNode ? `ID# ${state.parentNode.id}` : "ROOT";
                })
            }

        });


