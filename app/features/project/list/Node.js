function Composition() {
    this.nodes = [];
    this.edges = [];
}

function Node(id, x, y) {
    this.id          = id;
    this.x           = x;
    this.y           = y;
    this.children    = [];
    this.composition = new Composition();
}

