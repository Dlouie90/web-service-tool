// a very simple project model
/** A simple representation of web service Project. */
class Project {
    constructor(id, author, name, description) {
        this.id          = id;
        this.author      = author;
        this.name        = name;
        this.description = description;

        /* --------------- DEFAULT VALUES --------------- */

        /** graph object represents the webservice visuals */
        this.graph = {};

        /** The "main" node that all other node originate from. */
        this.nodes = [];

        /** array of webservice "run performance" values */
        this.dataReport = [];

        /** Keep track of viewComposition level (nodes of nodes) */
        this.history = {
            states: []    // a stack
        };

        /** Overview scatter plot demo data */
        this.scatterData = [];

        /** Default chart demo data (unrelated to webservice) */
        this.chart = {
            data: [
                {letter: "A", count: 19},
                {letter: "E", count: 5},
                {letter: "I", count: 13},
                {letter: "O", count: 17},
                {letter: "U", count: 9},
                {letter: "L", count: 3},
                {letter: "B", count: 21},
                {letter: "R", count: 0},
                {letter: "N", count: 5}
            ],
        }
    }
}

/**
 * This factory produce a singleton project. In a full application, it would
 * probably be used to load up data from a database but for this prototype,
 * it will load up some sample data.
 *
 * The purpose of this factory is to create a singleton object that holds all
 * the project's data. It also holds the current active project data. This
 * singleton object allows other controllers to interact with the project data.
 * For example: adding and removing a project from our database or switching project
 */
angular.module("WebserviceApp.Services")
    .factory("ProjectFactory", () => {
        /** This value is used to assign Project's id. Use and increment this value
         * whenever you created a new Project (counter++) */
        let counterID = 1000;

        /** This stores all the projects created. */
        const projects = [
            new Project(counterID++, "adam", "foobar", "my description #1"),
            new Project(counterID++, "james", "hello_world", "my description #2"),
            new Project(counterID++, "james", "python_is_cool", "my description #2"),
            new Project(counterID++, "luis", "fizz buzz", "my description #3"),
            new Project(counterID++, "luis", "A* search", "my description #3"),
            new Project(counterID++, "luis", "Dijkstra Search", "my description #3"),
            new Project(counterID++, "nelson", "depth first search", "my description #4"),
            new Project(counterID++, "nelson", "breadth first search", "my description #4"),
            new Project(counterID++, "shay", "IDE", "my description #5"),
        ];

        /** This is the current project in view (selected and on displayed */
        let activeProject = {};

        /** Given an id, and a list, return the node with that id.
         * Otherwise return null. */
        function findNode(nodes, {id}) {
            for (let node of nodes) {
                if (node.id == id) {
                    return node;
                }
            }
            return null;
        }

        /** Replace the current display graph with a graph of the
         * of state on top of the history state stack. */
        function updateGraph() {
            let historyStates = activeProject.history.states;
            /* Replace the SVG. */
            let svg = d3.select(".svg-main");
            svg.selectAll("*").remove();
            activeProject.graph = new Graph(
                svg, historyStates[historyStates.length - 1].nodes);
            activeProject.graph.updateGraph();
        }

        function recursiveSave(_states) {
            /* get a copy of the states */
            var states = [];
            _states.forEach(function (state) {
                states.push(JSON.parse(JSON.stringify(state)));
            });

            /* get the most recent parent node */
            var parent = states[states.length - 1].parentNode;

            for (var i = states.length - 1; i >= 0; i--) {

                if (i == states.length - 1) {
                    parent.compositionNodes = states[i].nodes;
                } else {
                    var findParent              = findNode(states[i].nodes, parent);
                    findParent.compositionNodes = [];
                    parent.compositionNodes.forEach(function (node) {
                        findParent.compositionNodes.push(JSON.parse(JSON.stringify(node)));
                    });

                    parent = states[i].parentNode;

                    if (parent == null) {
                        var nodes = [];
                        states[i].nodes.forEach(function (node) {
                            nodes.push(JSON.parse(JSON.stringify(node)));
                        });

                        for (var k = 0; k < nodes.length; k++) {
                            if (nodes[k].id == findParent.id) {
                                nodes[k] = findParent;
                            }
                        }

                        return {nodes: nodes, parentNode: null};
                    } else {
                        parent.compositionNodes = states[i].nodes;
                    }
                }
            }
            console.error("ERROR recursive save");
        }

        /* =============== FACTORY FUNCTIONS =============== */
        return {
            addProject: project => {
                projects.push(project);
                activeProject = {};
            },

            removeProject: project => {
                for (let i = 0; i < projects.length; i++) {
                    if (projects[i].id === project.id) {
                        projects.splice(i, 1);
                        break;
                    }
                }
            },

            getProjects: () => {
                return projects;
            },

            generateID: () => {
                return counterID++;
            },

            getActiveProject: () => {
                return activeProject;
            },

            setActiveProject: id => {
                for (let i = 0; i < projects.length; i++) {
                    if (projects[i].id == id) {
                        activeProject = projects[i];
                    }
                }
            },

            /* =============== GRAPHS OPERATIONS =============== */
            /* TODO: clean up graph operations code, very messy */

            // save whatever graph MAIN is displaying onto the current project
            saveGraph: function () {
                var history = activeProject.history;

                /* retrieve the previous state parent node */
                var previousState = history.states.length == 1 ? history.states[0] : history.states[history.states.length - 2];
                var currentState  = history.states[history.states.length - 1];
                var parentNode    = currentState.parentNode;

                var savedState = activeProject.graph.currentState();

                if (parentNode) {
                    var newParentNode = findNode(previousState.nodes, parentNode);

                    currentState.nodes      = activeProject.graph.currentState().nodes;
                    currentState.parentNode = newParentNode;

                    var result                                = recursiveSave(history.states);
                    activeProject.nodes                       = result.nodes;
                    history.states[history.states.length - 1] = currentState;

                } else {
                    history.states      = [savedState];
                    activeProject.nodes = savedState.nodes;
                }
            },

            /** Clear out the Main graph and start over; empty the graph. */
            resetGraph: () => {
                /* Reset the history state stack with the default state,
                 * the state of all new graph. */
                let defaultState             = Graph.prototype.defaultState();
                activeProject.history.states = [defaultState];

                /* Draw a graph of the state on top of the history stack */
                updateGraph();
            },

            // load whatever graph the current project contains
            loadGraph: function () {
                /* clear the svg canvas */
                var svg = d3.select(".svg-main");
                svg.selectAll("*").remove();

                /* load project nodes otherwise load a default state */
                if (activeProject.nodes.length > 0) {
                    /* create a copy of project's nodes */
                    var nodes = [];
                    activeProject.nodes.forEach(function (n) {
                        nodes.push(JSON.parse(JSON.stringify(n)));
                    });

                    /* create a copy of each nodes's viewComposition nodes */
                    nodes.forEach(function (node) {
                        var cn = [];
                        for (var i = 0; i < node.compositionNodes.length; i++) {
                            cn.push(JSON.parse(JSON.stringify(node.compositionNodes[i])));
                        }
                        node.compositionNodes = cn;
                    });

                    /*  init history list for the current view */
                    var history    = activeProject.history;
                    history.states = [{nodes: nodes}];

                    /* display the graph */
                    activeProject.graph = new Graph(svg, nodes);
                    activeProject.graph.updateGraph();

                    console.log("loading a previous graph");
                } else {
                    /* load a default graph */
                    this.resetGraph();
                    console.log("no data, loading a default graph");
                }
            },

            /* Clear the graph object because it contains reference to SVG.
             * This allow other application to generate SVG*/
            clearGraph: () => {
                activeProject.graph = {};
            },

            goBackOneLevel: function () {
                /* The active project history states stack. */
                let historyStates = activeProject.history.states;

                /* Don't undo if the user only have history state on the
                 * stack because it is the main graph view. */
                if (historyStates.length <= 1) return;

                /* Remove the current state from history. */
                historyStates.pop();

                /* Draw a graph of the state on top of the history stack */
                updateGraph();
            },


            /** View the composition of the the currently selected node.
             * (Display the nodes of nodes) */
            viewComposition: () => {
                /* Ensure that the user selected a node first.
                 * TODO: Alert user when they don't have a node selected. */
                if (!activeProject.graph.state.selectedNode)  return;

                /* The node that the user clicks on.*/
                let selectedNode  = activeProject.graph.state.selectedNode;
                let historyStates = activeProject.history.states;

                /* We use this later to backtrack and display the graph
                 * state again. */
                let currentParentNode =
                        historyStates[historyStates.length - 1].parentNode;

                /* Replace the state on top of the history stack with
                 * the current one (which could be saved or unsaved) so the
                 * user can navigate(backtrack) without having to save
                 * the graph first. */
                historyStates.pop();
                let currentState = activeProject.graph.currentState();
                Object.assign(currentState, {parentNode: currentParentNode});
                historyStates.push(currentState);

                /* This is state of the node that the users want to view
                 * the composition of. Whatever state that is on top of the
                 * history stack will be used to generate the display. */
                historyStates.push({
                    parentNode: JSON.parse(JSON.stringify(selectedNode)),
                    nodes     : selectedNode.compositionNodes.slice()
                });

                /* Draw a graph of the state on top of the history stack */
                updateGraph();
            },

            /* ====== PERFORMANCES, RECORD, HISTORY DATA OPERATIONS  ======*/

            /**
             * TODO: use real data instead of generating fake data;
             * generate fake performance data from 1-100 and push it into the
             * the activeProject dataReport array
             */
            generateRandomData: () => {
                let min        = 1, max = 100;
                let randomData = Math.floor(Math.random() * (max - min + 1)) + min;
                activeProject.dataReport.push(randomData);
            },

            generateScatterPlotDataFactory: () => {
                activeProject.scatterData.push({
                    x: Math.random() * 10,
                    y: Math.random() * 10,
                    r: 15,
                    h: false
                });
            },

            setChartDataArrayFactory: array => {
                activeProject.chart.data = array;
            },
        }
    });