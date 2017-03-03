/* to do list
 * TODO: user cannot delete the initial two nodes
 * */


class State {
    constructor(nodes = [], parentNode = null) {
        this.nodes      = nodes;
        this.parentNode = parentNode;
    }
}

class Node {
    constructor(id, x, y) {
        /* todo: change neighbors name to siblings */
        this.id        = id;
        this.x         = x;
        this.y         = y;
        this.neighbors = [];
        this.children  = [];
        this.isInput   = false;
        this.isOutput  = false;
        this.name      = "webservice-" + id;
    }

    /** Return true if the node is neither a input or output node. */
    static isRegular(node) {
        return !(node.isInput || node.isOutput);
    }

    /*TODO: write a static method that clones the node*/
}
/* =============== GLOBAL VARIABLES AND SETUP =============== */

var idCounter = incrementer();
function incrementer() {
    var counter = 0;

    return function () {
        return counter++;
    }
}

/** Given a list nodes, return an object with the nodes and its edges.
 * Each node will be "clone". */
function parseData(nodeArray) {

    /*  TLDR: Need to clone for d3.js to work properly.
     *  Javascript and d3.js equate object based on their memory location(?).
     *  But because we identify and organize our node based on ID, some node
     *  may not be == the same to d3.js even though they have the same id.
     *  (This is because we save, load, and reload our nodes).
     *  The solution to this is to clone all the nodes here before we work on
     *  them. If we don't clone, when we move some node, d3.js won't see the
     *  the change in x y pos because he is still looking at the memory location. */
    const nodes = nodeArray.map(node => JSON.parse(JSON.stringify(node)));
    const edges = [];

    for (let node of nodes) {
        for (let neighbor of node.neighbors) {
            edges.push({
                source: node,
                /* Same reasoning as above. We want to ensure the neighbor node
                 * is the same node in memory as the node in the nodes array. */
                target: findNeighbor(nodes, neighbor)
            })
        }
    }
    return {nodes: nodes, edges: edges};
}

/** Return the node with the same id as the neighbors in the nodes array. */
function findNeighbor(nodes, neighbor) {
    for (let node of nodes) {
        if (node.id === neighbor.id)
            return node;
    }
}

function Graph(svgIn, nodesIn, parentNode = undefined) {
    // for clarity: typing this over and over can be confusing
    var thisGraph = this;

    const nodeEdgeData = parseData(nodesIn);

    /* *** Graph variables *** */
    thisGraph.svg        = svgIn;
    thisGraph.nodes      = nodeEdgeData.nodes || [];
    thisGraph.edges      = nodeEdgeData.edges || [];
    thisGraph.paths      = undefined;
    thisGraph.circles    = undefined;
    thisGraph.svgG       = undefined;
    thisGraph.dragLine   = undefined;
    thisGraph.drag       = undefined;
    thisGraph.stack      = [];
    thisGraph.parentNode = parentNode;

    // State of the graph (selected nodes, links, etc..)
    thisGraph.state = {
        selectedNode  : null,
        selectedEdge  : null,
        mouseDownNode : null,
        shiftNodeDrag : false,
        graphMouseDown: false
    };

    /* these two element are used to create the link/edges used in this graph */
    // define arrow markers for graph links
    var defs = svgIn.append("svg:defs");
    defs.append("svg:marker")
        .attr('id', 'end-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', "32")
        .attr('markerWidth', 4.0)
        .attr('markerHeight', 4.5)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5');

    // define arrow markers for leading arrow
    defs.append('svg:marker')
        .attr('id', 'mark-end-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 7)
        .attr('markerWidth', 3.5)
        .attr('markerHeight', 3.5)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5');

    // the main container for all <circle> <path> elements
    thisGraph.svgG = svgIn.append("g")
        .classed(thisGraph.final.GRAPH_CLASS, true);

    // For convenience (typing thisGraph.svgG is tedious)
    var svgG = thisGraph.svgG;

    // displayed when dragging between nodes
    thisGraph.dragLine = svgG.append('svg:path')
        .attr('class', 'link dragline hidden')
        .attr('d', 'M0,0L0,0')
        .style('marker-end', 'url(#mark-end-arrow)');

    // a Selection of all <g> in the graph for <paths>
    thisGraph.paths = svgG.append("g").attr("class", "pathG").selectAll("g");

    // a Selection of all <g> in the graph for <circle>
    thisGraph.circles = svgG.append("g").attr("class", "circleG").selectAll("g");

    // Define Graph drag behavior
    thisGraph.drag = d3.behavior.drag()
        .origin(function (d) {
            return {x: d.x, y: d.y};
        })
        .on("drag", function (args) {
            thisGraph.dragmove.call(thisGraph, args);
        });

    // handle deletion of nodes/edges
    d3.select(window)
        .on("keydown", function () {
            thisGraph.svgKeyDown.call(thisGraph);
        });

    // insert a new node based on the cursor's location
    svgIn.on("mousedown", function (d) {
        thisGraph.svgMouseDown.call(thisGraph, d)
    });
    svgIn.on("mouseup", function (d) {
        thisGraph.svgMouseUp.call(thisGraph, d)
    });
}

/* =============== PROTOTYPE  CONSTANTS =============== */
Graph.prototype.final = {
    /* --------------- NODE CONSTANTS --------------- */
    NODE_RADIUS: 60,

    /* --------------- KEY CODES --------------- */
    BACK_SPACE_KEY: 8, DELETE_KEY: 46,

    /* ---------------  CSS CLASS --------------- */
    SELECTED_CLASS: "selected", CONNECTED_NODE_CLASS: "connect-node",
    CIRCLE_G_CLASS: "conceptG", GRAPH_CLASS: "graph"
};

/* =============== PROTOTYPE EDGE/LINK/PATH FUNCTIONS =============== */

/**
 * Drag the node or, if the shift key is held, drag the "drag line"
 */
Graph.prototype.dragmove = function (d) {
    var thisGraph = this;

    if (thisGraph.state.shiftNodeDrag) {
        thisGraph.dragLine.attr('d', 'M' + d.x + ',' + d.y + 'L' + d3.mouse(thisGraph.svgG.node())[0] + ',' + d3.mouse(this.svgG.node())[1]);
    } else {
        d.x += d3.event.dx;
        d.y += d3.event.dy;
        thisGraph.updateGraph();
    }
};

/** Toggle the path/link/edge selected css.
 *  If edge is highlighted, then un-highlight it, if it is not, un-highlight
 *  all the other edges and highlight the current click one
 */
Graph.prototype.pathMouseDown = function (d3path, link) {
    var thisGraph = this;
    var state     = thisGraph.state;
    var prevEdge  = state.selectedEdge;

    d3.event.stopPropagation();

    // Un-highlight selectedNode: we only want on thing (edge or node) to be
    // highlighted at a time.
    if (state.selectedNode) {
        thisGraph.removeSelectFromNode();
    }

    // update the state: this is the selected link
    state.mouseDownLink = link;

    if (!prevEdge || prevEdge !== link) {
        thisGraph.replaceSelectEdge(d3path, link);
    } else {
        thisGraph.removeSelectFromEdge();
    }
};

/** Highlight a path. And if there is a path that is already highlighted,
 * then un-highlight it.
 */
Graph.prototype.replaceSelectEdge = function (d3Path, edgeData) {
    var thisGraph = this;
    d3Path.classed(thisGraph.final.SELECTED_CLASS, true);

    // un-highlight the previous edge if there is one
    if (thisGraph.state.selectedEdge) {
        thisGraph.removeSelectFromEdge();
    }
    thisGraph.state.selectedEdge = edgeData;
};

/** Remove the select highlighting css from the selectedEdge
 */
Graph.prototype.removeSelectFromEdge = function () {
    var thisGraph = this;

    // Find the path that is the selectedEdge (should be only 1) and remove
    // the selected highlighting css
    thisGraph.paths.filter(function (cd) {
        return cd === thisGraph.state.selectedEdge;
    }).classed(thisGraph.final.SELECTED_CLASS, false);

    // reset the state
    thisGraph.state.selectedEdge = null;
};

/* =============== PROTOTYPE NODE/CIRCLE FUNCTIONS =============== */

/**
 * Reposition the "drag line" when the user hold shift and drag
 * The "drag line" is used to create an Edge when it connects with another node.
 */
Graph.prototype.circleMouseDown = function (d3node, d) {
    var thisGraph = this;
    var state     = thisGraph.state;

    d3.event.stopPropagation();

    state.mouseDownNode = d;

    if (d3.event.shiftKey) {
        state.shiftNodeDrag = d3.event.shiftKey;
        thisGraph.dragLine.classed('hidden', false)
            .attr('d', 'M' + d.x + ',' + d.y + 'L' + d.x + ',' + d.y);
    }
};

/**
 * Insert an edge into a graph if it "connects" to a node
 */
Graph.prototype.circleMouseUp = function (d3node, d) {
    var thisGraph = this;
    var state     = thisGraph.state;
    var final     = thisGraph.final;

    // reset the states
    state.shiftNodeDrag = false;
    d3node.classed(final.CONNECTED_NODE_CLASS, false);

    var mouseDownNode = state.mouseDownNode;

    if (!mouseDownNode) return;

    thisGraph.dragLine.classed("hidden", true);

    if (mouseDownNode !== d) {
        // we're in a different node: create new edge for mousedown edge and add to graph
        var newEdge = {source: mouseDownNode, target: d};

        // Get all the edges from the graph that is the same as newEdge
        var filtRes = thisGraph.paths.filter(function (d) {

            // // if the reversed edge exist (a->b & b->a), replace the previous one
            // if (d.source === newEdge.target && d.target === newEdge.source) {
            //     thisGraph.edges.splice(thisGraph.edges.indexOf(d), 1);
            // }

            return d.source === newEdge.source && d.target === newEdge.target;
        });

        // if the edge is not a duplicate, add it to the graph
        if (!filtRes[0].length) {
            mouseDownNode.neighbors.push(d);
            thisGraph.edges.push(newEdge);
            thisGraph.updateGraph();
        }

    } else {
        // we're in the same node
        if (state.selectedEdge) {
            thisGraph.removeSelectFromEdge();
        }
        var prevNode = state.selectedNode;

        if (!prevNode || prevNode.id !== d.id) {
            thisGraph.replaceSelectNode(d3node, d);
        } else {
            thisGraph.removeSelectFromNode();
        }
    }

    state.mouseDownNode = null;
};

/** Remove all the edges associated with a node.
 *  Used after a node is deleted to delete all the edges connected to it. */
Graph.prototype.spliceLinksFormNode = function (node) {
    const thisGraph = this;

    /* Get a list of all the edges to removed. */
    const toSplice = thisGraph.edges.filter(edge => {
        return (edge.source.id === node.id || edge.target.id === node.id);
    });

    /* remove each edges from the graph. */
    toSplice.forEach(edge => {
        thisGraph.edges.splice(thisGraph.edges.indexOf(edge), 1);
    });
};


Graph.prototype.replaceSelectNode = function (d3Node, nodeData) {
    var thisGraph = this;
    var final     = thisGraph.final;

    d3Node.classed(final.SELECTED_CLASS, true);

    if (thisGraph.state.selectedNode) {
        thisGraph.removeSelectFromNode();
    }
    thisGraph.state.selectedNode = nodeData;
};

Graph.prototype.removeSelectFromNode = function () {
    var thisGraph = this;

    thisGraph.circles.filter(function (cd) {
        return cd.id === thisGraph.state.selectedNode.id;
    }).classed(thisGraph.final.SELECTED_CLASS, false);

    thisGraph.state.selectedNode = null;
};


/* =============== PROTOTYPE SVG FUNCTIONS =============== */


/** Delete the selected node or edge when the user press the delete key or
 *  back space key. When deleting a node, all the associated edge with be
 *  deleted as well.
 */
Graph.prototype.svgKeyDown = function () {
    var thisGraph = this;
    var state     = thisGraph.state;
    var final     = thisGraph.final;

    state.lastKeyDown = d3.event.keyCode;
    var selectedNode  = state.selectedNode;
    var selectedEdge  = state.selectedEdge;

    switch (d3.event.keyCode) {
        case final.BACK_SPACE_KEY:
        case final.DELETE_KEY:
            // d3.event.preventDefault();

            /* Can only delete selected node that are not an input/output node. */
            if (selectedNode && Node.isRegular(selectedNode)) {
                /* Remove the node form the list. */
                thisGraph.nodes.splice(thisGraph.nodes.indexOf(selectedNode), 1);
                /* Remove all edges originating from this node. */
                thisGraph.spliceLinksFormNode(selectedNode);
                /* Remove the node from all neighbors field */
                removeFromNeighbor(this.nodes, selectedNode);

                state.selectedNode = null;
                thisGraph.updateGraph();
            } else if (selectedEdge) {
                /* Remove the edge from the edge list */
                thisGraph.edges.splice(thisGraph.edges.indexOf(selectedEdge), 1);

                /* Remove the edge from the node list too. */
                removeEdge(thisGraph.nodes, selectedEdge);

                state.selectedEdge = null;
                thisGraph.updateGraph();
            }
    }
};

/** Remove the edges from the nodes list. An edge exist between a node
 * and its neighbor's node. */
function removeEdge(nodes, edge) {
    /* This is the source node that is in the nodes array. */
    const node = nodes.filter(currentNode => {
        return currentNode.id == edge.source.id;
    }) [0];

    /* Remove the target node from the node neighbors field. */
    node.neighbors = node.neighbors.filter(currentNode => {
        return currentNode.id != edge.target.id;
    });
}

/** Remove the nodeToRemove from all nodes.neighbor field */
function removeFromNeighbor(nodes, nodeToRemove) {
    nodes.forEach(node => {
        node.neighbors.forEach((neighbor, index) => {
            if (neighbor.id === nodeToRemove.id) {
                node.neighbors.splice(index, 1);
            }
        });
    })
}

// mousedown on main svg
Graph.prototype.svgMouseDown = function () {
    this.state.graphMouseDown = true;
};

/**
 * Insert node into the graph when the user have the shift key head down and
 * click on the graph
 */
Graph.prototype.svgMouseUp = function () {
    const thisGraph = this;
    const state     = thisGraph.state;

    if (state.graphMouseDown && d3.event.shiftKey) {
        const xyCord = d3.mouse(thisGraph.svgG.node());
        const node   = new Node(idCounter(), xyCord[0], xyCord[1]);

        thisGraph.nodes.push(node);
        thisGraph.updateGraph();
    } else if (state.shiftNodeDrag) {
        // hide the "drag line": the line that display when you are trying
        // to connect an edge to a node
        state.shiftNodeDrag = false;
        thisGraph.dragLine.classed("hidden", true);
    }
    state.graphMouseDown = false;
};

/* =============== MISCELLANEOUS  PROTOTYPE FUNCTIONS =============== */
/**
 * Return a copy of the state of the graph. Can be used to repopulate the
 * the state of the graph.
 */
Graph.prototype.currentState = function () {
    const nodes = this.nodes.map(node => {
        return copyObject(node);
    });

    return new State(nodes, this.parentNode);
};


/**  Return a "start-up" graph. Default graph. */
Graph.defaultState = function () {
    /* Create 3 default nodes: regular, input, output node. */
    const input     = new Node(idCounter(), 100, 100);    // default neighbors,
    const output    = new Node(idCounter(), 750, 100);    // composition = []
    input.isInput   = true;
    output.isOutput = true;

    /* There should be an edge between the input and a regular node, and
     * another between the regular and the output.*/
    input.neighbors.push(output);

    /* Default state with no parentNode. */
    return new State([input, output]);
};

/** Copy and return the copy. */
function copyObject(object) {
    return JSON.parse(JSON.stringify(object));
}


/* =============== MAIN FUNCTION  =============== */

/**
 * Update the Graph. Draw/Redraw the graph.
 */
Graph.prototype.updateGraph = function () {
    // for convinces
    var thisGraph = this;
    var final     = this.final;
    var state     = this.state;


    // update the paths : paths = ...selectAll("g")
    thisGraph.paths = thisGraph.paths
        .data(thisGraph.edges, function (d) {
            return d.source.id + "+" + d.target.id;
        });

    // For convinces: the update selection
    var paths = thisGraph.paths;

    // Update existing paths (notice no enter() or exit())
    paths.style('marker-end', 'url(#end-arrow)')
        .classed(final.SELECTED_CLASS, function (d) {
            return d === state.selectedEdge;
        })
        .attr("d", function (d) {
            return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
        });

    // Add new paths: the enter selection
    paths.enter()
        .append("path")
        .style("marker-end", "url(#end-arrow)")
        .classed("link", true)
        .attr("d", function (d) {
            return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
        })
        .on("mousedown", function (d) {
            thisGraph.pathMouseDown.call(thisGraph, d3.select(this), d);
        });


    // remove old links: the exit selection
    paths.exit().remove();

    // update the circle selection
    thisGraph.circles = thisGraph.circles
        .data(thisGraph.nodes, function (d) {
            return String(d.id);
        });

    // update all current circles on the graph
    thisGraph.circles.attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
    });

    // add new circles to the graph(they are wrapped in <g>)
    var newGs = thisGraph.circles.enter()
        .append("g");

    newGs.classed(final.CIRCLE_G_CLASS, true)
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
        .on("mouseover", function (d) {
            if (state.shiftNodeDrag) {
                d3.select(this).classed(final.CONNECTED_NODE_CLASS, true);
            }
        })
        .on("mouseout", function (d) {
            d3.select(this).classed(final.CONNECTED_NODE_CLASS, false);
        })
        .on("mousedown", function (d) {
            thisGraph.circleMouseDown.call(thisGraph, d3.select(this), d);
        })
        .on("mouseup", function (d) {
            thisGraph.circleMouseUp.call(thisGraph, d3.select(this), d);
        })
        .call(thisGraph.drag);

    newGs.append("circle")
        .attr("r", 10)
        .transition()
        .attr("r", String(final.NODE_RADIUS));

    newGs.append("text")
        .attr("text-anchor", "middle")
        .style("font", "14px 'Helvetica Neue'")
        .text(function (d) {
            if (Node.isRegular(d)) {
                return `name: ${d.id}`;
            } else {
                return d.isInput ? "Input" : "Output";
            }
        });

    /* Attach an html element onto the circle that display the number
     * of composition nodes (children) that the current node contains. */
    newGs.append("foreignObject")
        .append("xhtml:body")
        .html(function (d) {
            if (Node.isRegular(d) && d.children.length - 2 > 0) {
                /* Minus 2 because we don't want to include the input/output
                 * nodes that every list of nodes contains */
                return `<p style="float:none">${d.children.length - 2}</p>`;
            }
        });

    // remove old nodes;
    thisGraph.circles.exit().remove();
};
