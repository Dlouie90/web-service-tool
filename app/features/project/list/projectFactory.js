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

        /** List of "main" current nodes. */
        this.currentNodes = [];

        /** List of all the SAVED "main" nodes. */
        this.savedNodes = [];

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
            new Project(counterID++, "Trump", "Super Wall", "This wall will be bigly."),

        ];

        /** This is the current project in view (selected and on displayed */
        let activeProject = {};


        /** Replace the current display graph with a graph of the
         * of state on top of the history state stack. */
        function drawCurrentState() {
            let states      = activeProject.history.states;
            let recentState = states[states.length - 1];

            /* Replace the SVG. */
            let svg = d3.select(".svg-main");
            svg.selectAll("*").remove();
            activeProject.graph = new Graph(
                svg, recentState.nodes, recentState.parentNode);
            activeProject.graph.updateGraph();

        }

        /** Clear out the Main graph and start over; empty the graph. */
        function _resetGraph() {
            /* Reset the history state stack with the default state,
             * the state of all new graph. */
            let defaultState             = Graph.defaultState();
            activeProject.currentNodes   = defaultState.nodes;
            activeProject.history.states = [defaultState];

            /* Draw a graph of the state on top of the history stack */
            drawCurrentState();
        }

        /** Update the current state on the history states stack (top one).
         *  Why? When the user make changes, the changes are not recorded
         *  at the state level. */
        function updateCurrentState() {
            let currentState = activeProject.graph.currentState();
            activeProject.history.states.pop();
            activeProject.history.states.push(currentState);
        }

        /** Recursively removes "Input"/"Output" (Not regular) nodes
         * from the input.children */
        function removeIrregularNodes(inputNode) {
            for (let i = 0; i < inputNode.children.length; i++) {
                let node = inputNode.children[i];

                /* Remove the "Input/Output" node. After removal, the array
                 * is re-indexed so we decrement the counter  (i--) */
                if (!Node.isRegular(node)) {
                    inputNode.children.splice(i, 1);
                    i--;
                }
            }

            /* For all the normal nodes left, RECURSIVELY remove the input/output
             * node from THEIR children. */
            for (let i = 0; i < inputNode.children.length; i++) {
                let node = inputNode.children[i];
                if (node.children.length > 0) {
                    node = removeIrregularNodes(node);
                }
            }
            return inputNode;
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

            /** Save every changes made to the graph by the user. */
            saveGraph: () => {
                /* Update the state stack with the user's most recent changes.*/
                updateCurrentState();

                /* By reversing the stack array, the first element will be the
                 * element on top of the stack. Easier to work with.*/
                const STATES = activeProject.history.states.reverse();

                /* We trying to reduce the states into a single root state
                 * that could be used to build the entire graph again. */
                const ROOT_STATE = new State();

                /* These variables are used to help traverse  and pass values
                 * through the stack.*/
                let previousParentNode = null;
                let currentParentNode  = null;
                let nodes              = [];

                /* Update the list of nodes to reflect any new composition nodes
                 * that the user may have make. */
                for (let i = 0; i < STATES.length; i++) {

                    previousParentNode = currentParentNode;
                    currentParentNode  = STATES[i].parentNode;
                    nodes              = STATES[i].nodes;

                    /* Parent node has composition nodes. Child node has parent.
                     * Parent nodes may contain composition nodes. But its
                     * "Child" version may not. We synchronize those two here. */
                    if (previousParentNode) {
                        for (let k = 0; k < nodes.length; k++) {
                            if (nodes[k].id == previousParentNode.id) {
                                nodes[k] = previousParentNode;
                            }
                        }
                    }

                    /* Save the current nodes onto the parent. Used to pass
                     * composition nodes "up" the graph to be synchronize later. */
                    if (currentParentNode) {
                        Object.assign(currentParentNode,
                            {children: nodes});
                    }

                    /* Build "upward" to the the root. At the top, parentNode
                     * will be null. Each node form "nodes" may contain composition
                     * nodes.*/
                    Object.assign(ROOT_STATE, {
                        parentNode: currentParentNode,
                        nodes     : nodes
                    });

                }

                /* Update the history stack, now the user can traverse to
                 * composition vies, back, and to composition again. */
                activeProject.history.states = STATES.reverse();

                /* The active project nodes now contains a list of all the nodes
                 * and all the nodes that each node is made up. */
                activeProject.currentNodes = ROOT_STATE.nodes;
                activeProject.savedNodes   = ROOT_STATE.nodes;
            },

            /** Clear out the Main graph and start over; empty the graph. */
            resetGraph: () => {
                _resetGraph();
            },

            // load whatever graph the current project contains
            loadGraph: () => {
                /* load project nodes otherwise load a default state */
                if (activeProject.savedNodes.length !== 0) {

                    /* init history list for the current view */
                    let history    = activeProject.history;
                    history.states = [new State(activeProject.savedNodes)];

                    /* Draw a graph of the state on top of the history stack */
                    drawCurrentState();

                } else {
                    /* load a default graph */
                    _resetGraph();
                }
            },

            /* Clear the graph object because it contains reference to SVG.
             * This allow other application to generate SVG*/
            clearGraph: () => {
                activeProject.graph = {};
            },

            goBackOneLevel: () => {
                /* The active project history states stack. */
                let historyStates = activeProject.history.states;

                /* Don't undo if the user only have history state on the
                 * stack because it is the main graph view. */
                if (historyStates.length <= 1) return;

                /* Remove the current state from history. */
                historyStates.pop();

                /* Draw a graph of the state on top of the history stack */
                drawCurrentState();
            },


            /** View the composition of the the currently selected node.
             * (Display the nodes of nodes) */
            viewComposition: () => {
                /* The node that the user clicks on.*/
                const selectedNode = activeProject.graph.state.selectedNode;

                /* Ensure that the user selected a node first and it is NOT
                 * an output/input node.
                 * TODO: Alert user when they don't have a node selected. */
                if (!selectedNode || !Node.isRegular(selectedNode))  return;

                /* Update the current state before so the changes the user made
                 * will be saved at the state level. */
                updateCurrentState();

                /* This is state of the node that the users want to view
                 * the composition of. */
                let parentNode = selectedNode;
                let nodes      = selectedNode.children.length === 0 ? Graph.defaultState().nodes : selectedNode.children;

                /* Whatever state that is on top of the  history stack will
                 * be used to generate the display. The composition view is
                 * on top of the stack. */
                let historyStates = activeProject.history.states;
                historyStates.push(new State(nodes, parentNode));

                drawCurrentState();
            },


            /* =============== GRAPH UTILITY OPERATIONS ===============*/
            getStates: () => {
                return activeProject.history.states;
            },

            /** Given an index of the history.states ("stack"), update the graph
             * to display that state. All state "on top" on the target state will
             * be pop. */
            updateToState(index) {
                /* Save the user's most recent state onto the stack. */
                updateCurrentState();

                activeProject.history.states =
                    activeProject.history.states.slice(0, index + 1);

                drawCurrentState();
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

                });
            },

            setChartDataArrayFactory: array => {
                activeProject.chart.data = array;
            },

            /* =============== VISUALIZATION FUNCTIONS =============== */

            /** Return the node composition with all the irregular
             * (input/output) nodes removed. */
            getCirclePackData() {
                let clonedRootNode = JSON.parse(JSON.stringify({
                    /* TODO: maybe assign the root node an id?, all are null */
                    id      : null,
                    children: activeProject.currentNodes
                }));

                return removeIrregularNodes(clonedRootNode);
            }
        }
    });
