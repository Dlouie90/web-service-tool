angular.module("WebserviceApp.Controllers")
    .controller("ProjectCtrl",
        ($scope, $filter, $http, ProjectFactory, constFactory) => {

            let selectedAuthor = null;

            $scope.activeProject     = ProjectFactory.getActiveProject();
            $scope.projectToBeEdited = {};
            $scope.projects          = ProjectFactory.getProjects();
            $scope.selectedPage      = 1;
            $scope.pageSize          = constFactory.PROJECT_PER_PAGE;

            $scope.topics = [
                {topic: "Graph"},
                {topic: "Summary"},
                {topic: "Edit"},
                {topic: "Run"},
                {topic: "Import"},
                {topic: "Export"},
            ];

            $scope.selectedOption    = undefined;
            $scope.selectedTopic     = "";
            $scope.compositionLevels = [];
            $scope.circlePack        = [];

            $scope.serviceResult = "NONE";

            $scope.diagram = undefined;

            /* =============== Author buttons functions =============== */

            $scope.hide = (object) => {
                object.hide = !object.hide;
            };

            $scope.getHideText = (object) => {
                return object.hide ? "show (" + object.children.length + ")" : "hide"
            };

            $scope.selectAuthor   = author => {
                selectedAuthor      = author;
                $scope.selectedPage = 1;
            };
            $scope.getAuthorClass = author => {
                return selectedAuthor == author ?
                    constFactory.ACTIVE_BTN_CSS : "";
            };

            $scope.authorFilter = project => {
                return selectedAuthor == null ||
                    project.author == selectedAuthor;
            };

            $scope.getAuthorCount = author => {
                return $scope.projects.reduce((count, project) => {
                    return project.author == author ? count + 1 : count;
                }, 0)
            };

            /* =============== Project Panel functions =============== */
            $scope.getPanelClass = project => {
                return ProjectFactory.getActiveProject().id == project.id ?
                    constFactory.ACTIVE_PANEL_CSS : ""
            };
            $scope.selectPanel   = project => {
                ProjectFactory.setActiveProject(project.id);
                $scope.selectedOption = undefined;
            };

            $scope.editProject = project => {
                $scope.projectToBeEdited = project;
            };

            $scope.deleteProject = project => {
                ProjectFactory.removeProject(project);
                $scope.projects = ProjectFactory.getProjects();
            };

            /* =============== Pagination functions =============== */

            $scope.selectPage = page => {
                $scope.selectedPage = page;
            };

            $scope.getPageClass = page => {
                return $scope.selectedPage == page ?
                    constFactory.ACTIVE_BTN_CSS : ""
            };

            /* =============== SIDE BAR OPTIONS  FUNCTIONS =============== */

            $scope.selectOption = option => {
                $scope.selectedOption = option;
                ProjectFactory.clearGraph();
            };

            $scope.getOptionClass = option => {

                if ($scope.selectedOption) {
                    return $scope.selectedOption.name == option.name
                        ? constFactory.ACTIVE_BTN_CSS : "";
                }

                return "";
            };

            /* =============== PROJECT FUNCTIONS =============== */

            $scope.getActiveProject = () => {
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
                            ProjectFactory.getParsedNodes();
                        break;
                    case "Edit":
                        $scope.circlePack =
                            ProjectFactory.getParsedNodes();
                        break;
                    case "Run":
                        $scope.runService();
                        break;
                }
                $scope.selectedTopic = topicStr;

            };
            /* =============== GRAPH FUNCTIONS =============== */

            $scope.saveGraph = () => {
                ProjectFactory.saveGraph();
                updateCompositionLevels();
            };

            $scope.resetGraph = () => {
                ProjectFactory.resetGraph();
                updateCompositionLevels();
            };

            $scope.loadGraph = () => {
                ProjectFactory.loadGraph();
                updateCompositionLevels();
            };

            $scope.goBackOneLevel = () => {
                ProjectFactory.goBackOneLevel();
                updateCompositionLevels();
            };

            $scope.viewComposition = () => {
                ProjectFactory.viewComposition();
                updateCompositionLevels();
            };

            $scope.jumpToState = index => {
                ProjectFactory.updateToState(index);
                updateCompositionLevels();
            };


            $scope.runService = () => {
				var proj = ProjectFactory.getProjectJSON();
                $http.post("./rest/ws/addws", proj) //update the graph on the server...
                    .then(result => { 
                        $http.get("./rest/ws/callws",{ params : { ws : proj.id } }) //then call it
							.then(result => {
								$scope.serviceResult = result
							})
							.catch(error => {
								console.log("failed to get");
								console.log(error);

								$scope.serviceResult = error;
							});
                    })
                    .catch(error => {
                        console.log("failed to post");
                        console.log(error);

                        $scope.serviceResult = error;
                    });
				$scope.graphJSON = proj;
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
