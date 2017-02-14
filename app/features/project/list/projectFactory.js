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

        /** Keep track of composition level (nodes of nodes) */
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
    .factory("ProjectFactory", function () {
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

            // clear out the main graph, start over. is an empty graph now
            resetGraph: function () {
                // clear the svg canvas
                var svg = d3.select(".svg-main");
                svg.selectAll("*").remove();

                /* retrieve the default nodes */
                var defaultState = Graph.prototype.defaultState();
                var nodes        = defaultState.nodes;

                /* init history list for the current project */
                var history    = activeProject.history;
                history.states = [defaultState];

                /* display graph */
                activeProject.graph = new Graph(svg, nodes);
                activeProject.graph.updateGraph();
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

                    /* create a copy of each nodes's composition nodes */
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

            undoStateFact: function () {
                var history = activeProject.history.states;

                /* don't undo if the user only have one stack of history state
                 * because it will delete all the views!*/
                if (history.length <= 1) return;

                /* remove the current state from history */
                history.pop();
                var svg = d3.select(".svg-main");
                svg.selectAll("*").remove();

                /* display the current view */
                activeProject.graph = new Graph(svg, history[history.length - 1].nodes);
                activeProject.graph.updateGraph();
            },


            compositionFF: function () {
                /* ensure that the user selected a node first */
                if (!activeProject.graph.state.selectedNode) {
                    return;
                }

                /* the currently highlighted node */
                var selectedNode = activeProject.graph.state.selectedNode;

                /* update the current state of history */
                var history           = activeProject.history;
                var currentParentNode = history.states[history.states.length - 1].parentNode;
                history.states.pop();
                var currentState        = activeProject.graph.currentState();
                currentState.parentNode = currentParentNode;
                history.states.push(currentState);

                /* add a state for the composition nodes (if any) */
                var newState = {
                    parentNode: JSON.parse(JSON.stringify(selectedNode)),
                    nodes     : selectedNode.compositionNodes.slice()
                };
                history.states.push(newState);

                /* clear the svg canvas */
                var svg = d3.select(".svg-main");
                svg.selectAll("*").remove();

                /* display the composition nodes (if any) */
                activeProject.graph = new Graph(svg, history.states[history.states.length - 1].nodes);
                activeProject.graph.updateGraph();
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