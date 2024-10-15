let blocks = document.getElementsByClassName("drawing-area")[0];
let addEdge = false;
let cnt = 0;
let dist;

let alerted = localStorage.getItem("alerted") || "";
if (alerted !== "yes") {
  alert(
    "Read instructions before proceeding by clicking i-icon in the top-right corner"
  );
  localStorage.setItem("alerted", "yes");
}

// It is called when user starts adding edges by clicking on button given
const addEdges = () => {
  if (cnt < 2) {
    alert("Create atleast two nodes to add an edge");
    return;
  }

  addEdge = true;
  document.getElementById("add-edge-enable").disabled = true;
  document.getElementsByClassName("run-btn")[0].disabled = false;
  // Initializing array for adjacency matrix representation
  dist = new Array(cnt + 1)
    .fill(Infinity)
    .map(() => new Array(cnt + 1).fill(Infinity));
};

// Temporary array to store clicked elements to make an edge between the(max size =2)
let arr = [];

const appendBlock = (x, y) => {
  document.querySelector(".reset-btn").disabled = false;
  document.querySelector(".click-instruction").style.display = "none";
  // Creating a node
  const block = document.createElement("div");
  block.classList.add("block");
  block.style.top = `${y}px`;
  block.style.left = `${x}px`;
  block.style.transform = `translate(-50%,-50%)`;
  block.id = cnt;

  block.innerText = cnt++;

  // Click event for node
  block.addEventListener("click", (e) => {
    // Prevent node upon node
    e.stopPropagation() || (window.event.cancelBubble = "true");

    // If state variable addEdge is false, can't start adding edges
    if (!addEdge) return;

    block.style.backgroundColor = "coral";
    arr.push(block.id);

    // When two elements are push, draw a edge and empty the array
    if (arr.length === 2) {
      drawUsingId(arr);
      arr = [];
    }
  });
  blocks.appendChild(block);
};

// Allow creating nodes on screen by clicking
blocks.addEventListener("click", (e) => {
  if (addEdge) return;
  if (cnt > 12) {
    alert("cannot add more than 12 vertices");
    return;
  }
  console.log(e.x, e.y);
  appendBlock(e.x, e.y);
});

// Function to draw a line between nodes
const drawLine = (x1, y1, x2, y2, ar) => {
  // prevent multiple edges for same couple of nodes
  if (dist[Number(ar[0])][Number(ar[1])] !== Infinity) {
    document.getElementById(arr[0]).style.backgroundColor = "#333";
    document.getElementById(arr[1]).style.backgroundColor = "#333";
    return;
  }

  console.log(ar);
  // Length of line
  const len = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
  const slope = x2 - x1 ? (y2 - y1) / (x2 - x1) : y2 > y1 ? 90 : -90;

  // Adding length to distance array
  dist[Number(ar[0])][Number(ar[1])] = Math.round(len / 10);
  dist[Number(ar[1])][Number(ar[0])] = Math.round(len / 10);

  // Drawing line
  const line = document.createElement("div");
  line.id =
    Number(ar[0]) < Number(ar[1])
      ? `line-${ar[0]}-${ar[1]}`
      : `line-${ar[1]}-${ar[0]}`;
  line.classList.add("line");
  line.style.width = `${len}px`;
  line.style.left = `${x1}px`;
  line.style.top = `${y1}px`;

  // Edge weight
  let p = document.createElement("p");
  p.classList.add("edge-weight");
  p.innerText = Math.round(len / 10);
  p.contentEditable = "true";
  p.inputMode = "numeric";
  p.addEventListener("blur", (e) => {
    if (isNaN(Number(e.target.innerText))) {
      alert("Enter valid edge weight");
      return;
    }
    n1 = Number(p.closest(".line").id.split("-")[1]);
    n2 = Number(p.closest(".line").id.split("-")[2]);
    // console.log(p.closest('.line'), e.target.innerText, n1, n2);
    dist[n1][n2] = Number(e.target.innerText);
    dist[n2][n1] = Number(e.target.innerText);
  });
  line.style.transform = `rotate(${
    x1 > x2 ? Math.PI + Math.atan(slope) : Math.atan(slope)
  }rad)`;

  p.style.transform = `rotate(${
    x1 > x2 ? (Math.PI + Math.atan(slope)) * -1 : Math.atan(slope) * -1
  }rad)`;

  line.append(p);
  blocks.appendChild(line);
  document.getElementById(arr[0]).style.backgroundColor = "#333";
  document.getElementById(arr[1]).style.backgroundColor = "#333";
};

// Function to get (x, y) coordinates of clicked node
const drawUsingId = (ar) => {
  if (ar[0] === ar[1]) {
    document.getElementById(arr[0]).style.backgroundColor = "#333";
    arr = [];
    return;
  }
  x1 = Number(document.getElementById(ar[0]).style.left.slice(0, -2));
  y1 = Number(document.getElementById(ar[0]).style.top.slice(0, -2));
  x2 = Number(document.getElementById(ar[1]).style.left.slice(0, -2));
  y2 = Number(document.getElementById(ar[1]).style.top.slice(0, -2));
  drawLine(x1, y1, x2, y2, ar);
};

// Add this function to handle enabling/disabling of the source/target node inputs
const handleAlgorithmSelection = () => {
  const algoSelect = document.getElementById("algorithm-select");
  const sourceNodeInput = document.getElementById("source-node");
  const targetNodeInput = document.getElementById("target-node");

  const algo = algoSelect.value;
  if (algo === "kruskal" || algo === "floydwarshall") {
    sourceNodeInput.disabled = true;
    targetNodeInput.disabled = true;
    sourceNodeInput.placeholder = "Not required for this algorithm";
    targetNodeInput.placeholder = "Not required for this algorithm";
  } else {
    sourceNodeInput.disabled = false;
    targetNodeInput.disabled = false;
    sourceNodeInput.placeholder = "Source Node";
    targetNodeInput.placeholder = "Target Node";
  }
};

// Add this event listener after the DOM has loaded or inline in the <script> tag
document.getElementById("algorithm-select").addEventListener("change", handleAlgorithmSelection);

// Call the function once during page load to ensure the correct initial state
window.onload = () => {
  handleAlgorithmSelection();
};


// Function to find shortest path from given source to all other nodes

const runAlgorithm = () => {
  const algoSelect = document.getElementById("algorithm-select");
  const sourceNode = document.getElementById("source-node").value;
  const targetNode = document.getElementById("target-node").value;

  // Check if both source and target nodes are valid numbers and within bounds
  if (sourceNode === "" || targetNode === "" || isNaN(sourceNode) || isNaN(targetNode)) {
    alert("Please enter valid numeric values for source and target nodes.");
    return;
  }

  let source = Number(sourceNode);
  let target = Number(targetNode);

  if (source < 0 || target < 0 || source >= cnt || target >= cnt) {
    alert("Source or target node does not exist. Please select nodes within the valid range.");
    return;
  }

  // Reset colors of all nodes
  resetNodeColors();

  // Disable "Add Edge" functionality
  document.getElementById("add-edge-enable").disabled = true;
  disableAddEdgeFunctionality();

  // Execute the selected algorithm
  executeAlgorithm(algoSelect, source, target);
};

// Function to reset all node colors to their default state
const resetNodeColors = () => {
  const nodes = document.getElementsByClassName("node");
  for (let node of nodes) {
    node.style.backgroundColor = ""; // Reset inline background color
    node.classList.remove("highlighted", "visited", "path"); // Remove any CSS classes related to coloring (adjust class names as per your styles)
  }
};

// Disable the ability to add edges
const disableAddEdgeFunctionality = () => {
  addEdge = false; // Disable adding edges globally
  const nodes = document.getElementsByClassName("node");
  for (let node of nodes) {
    node.removeEventListener("click", handleNodeClick); // Disable the click event for adding edges
  }
};


const executeAlgorithm = (el, source, target) => {
  const algo = el.value;

  switch (algo) {
    case "dijkstra":
      findShortestPath(source, target);
      break;
    case "bfs":
      breadthFirstSearch(source, target);
      break;
    case "dfs":
      depthFirstSearch(source, target);
      break;
    case "bellmanford":
      bellmanFord(source, target);
      break;
    case "kruskal":
      kruskalAlgorithm();
      break;
    default:
      alert("Please select a valid algorithm.");
  }
};

// Bellman-Ford Algorithm
const bellmanFord = (source, target) => {
  clearScreen();

  let cost = Array(cnt).fill(Infinity);
  let parent = Array(cnt).fill(-1);
  cost[source] = 0;

  // Relax all edges cnt - 1 times
  for (let i = 0; i < cnt - 1; i++) {
    for (let u = 0; u < cnt; u++) {
      for (let v = 0; v < cnt; v++) {
        if (dist[u][v] !== Infinity && cost[u] + dist[u][v] < cost[v]) {
          cost[v] = cost[u] + dist[u][v];
          parent[v] = u;
        }
      }
    }
  }

  // Check for negative-weight cycles
  for (let u = 0; u < cnt; u++) {
    for (let v = 0; v < cnt; v++) {
      if (dist[u][v] !== Infinity && cost[u] + dist[u][v] < cost[v]) {
        alert("Graph contains a negative-weight cycle!");
        return;
      }
    }
  }

  indicatePath(parent, source, target);
};

// Kruskal's Algorithm
const kruskalAlgorithm = () => {
  clearScreen();

  let result = []; // This will store the resultant MST
  let parent = Array(cnt).fill(null).map((_, i) => i); // Union-Find (Disjoint Set)
  let rank = Array(cnt).fill(0);

  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const union = (u, v) => {
    let root1 = find(u);
    let root2 = find(v);

    if (rank[root1] < rank[root2]) {
      parent[root1] = root2;
    } else if (rank[root1] > rank[root2]) {
      parent[root2] = root1;
    } else {
      parent[root2] = root1;
      rank[root1]++;
    }
  };

  let edges = [];

  // Store all the edges with weights
  for (let i = 0; i < cnt; i++) {
    for (let j = i + 1; j < cnt; j++) {
      if (dist[i][j] !== Infinity) {
        edges.push([i, j, dist[i][j]]);
      }
    }
  }

  // Sort edges in increasing order of their weight
  edges.sort((a, b) => a[2] - b[2]);

  // Iterate through all sorted edges
  for (let [u, v, w] of edges) {
    if (find(u) !== find(v)) {
      result.push([u, v, w]); // Add edge to result
      union(u, v); // Union the sets
    }
  }

  displayKruskalResult(result);
};

const displayKruskalResult = (result) => {
  document.getElementsByClassName("path")[0].innerHTML = "<p>Minimum Spanning Tree using Kruskal's Algorithm:</p>";

  result.forEach(async ([u, v]) => {
    let tmp = document.getElementById(`line-${Math.min(u, v)}-${Math.max(u, v)}`);
    await colorEdge(tmp);

    let p = document.createElement("p");
    p.innerText = `Edge between Node ${u} and Node ${v}`;
    document.getElementsByClassName("path")[0].appendChild(p);
  });
};



// Dijkstra's Algorithm
const findShortestPath = (source, target) => {
  clearScreen();

  let visited = [];
  let unvisited = Array.from({ length: cnt }, (_, i) => i);
  let cost = Array(cnt).fill(Infinity);
  let parent = Array(cnt).fill(-1);

  cost[source] = 0;

  while (unvisited.length) {
    let mini = unvisited.reduce(
      (minIdx, node) => (cost[node] < cost[minIdx] ? node : minIdx),
      unvisited[0]
    );

    // Stop if target node is reached
    if (mini === target) break;

    visited.push(mini);
    unvisited.splice(unvisited.indexOf(mini), 1);

    for (let i = 0; i < cnt; i++) {
      if (
        dist[mini][i] !== Infinity &&
        unvisited.includes(i) &&
        cost[i] > cost[mini] + dist[mini][i]
      ) {
        cost[i] = cost[mini] + dist[mini][i];
        parent[i] = mini;
      }
    }
  }
  indicatePath(parent, source, target);
};


// BFS Algorithm
const breadthFirstSearch = (source, target) => {
  clearScreen();

  let queue = [];
  let visited = new Array(cnt).fill(false);
  let parent = new Array(cnt).fill(-1);

  queue.push(source);
  visited[source] = true;

  while (queue.length) {
    let node = queue.shift();
    document.getElementById(node).style.backgroundColor = "coral";

    if (node === target) break; // Stop if target is found

    for (let i = 0; i < cnt; i++) {
      if (dist[node][i] !== Infinity && !visited[i]) {
        queue.push(i);
        visited[i] = true;
        parent[i] = node;
      }
    }
  }
  indicatePath(parent, source, target);
};


// DFS Algorithm
const depthFirstSearch = (source, target) => {
  clearScreen();

  let visited = new Array(cnt).fill(false);
  let parent = new Array(cnt).fill(-1);

  const dfs = (node) => {
    visited[node] = true;
    document.getElementById(node).style.backgroundColor = "coral";

    if (node === target) return true; // Stop if target is found

    for (let i = 0; i < cnt; i++) {
      if (dist[node][i] !== Infinity && !visited[i]) {
        parent[i] = node;
        if (dfs(i)) return true;
      }
    }
    return false;
  };

  dfs(source);
  indicatePath(parent, source, target);
};


// Function to indicate path from source to target
const indicatePath = async (parentArr, src, tgt) => {
  document.getElementsByClassName("path")[0].innerHTML = "";
  let p = document.createElement("p");
  p.innerText = `Path from Node ${src} to Node ${tgt}:`;
  
  // Color the source node
  colorNode(src, "green"); // Green color for source node

  // Find and print the path
  await printPath(parentArr, tgt, p, src);

  // Color the target node
  colorNode(tgt, "red"); // Red color for target node
};

// Function to print the path
const printPath = async (parent, j, el_p, src) => {
  if (parent[j] === -1) return;
  
  // Recursively print the path
  await printPath(parent, parent[j], el_p, src);
  
  // Color each node in the path except source and target
  if (j !== src) {
    colorNode(j, "yellow"); // Yellow for nodes in the path
  }
  
  // Append path to the UI
  el_p.innerText += ` ${j}`;
  document.getElementsByClassName("path")[0].style.padding = "1rem";
  document.getElementsByClassName("path")[0].appendChild(el_p);

  // Color the edge in the path
  let tmp = document.getElementById(`line-${Math.min(j, parent[j])}-${Math.max(j, parent[j])}`);
  await colorEdge(tmp);
};


const colorEdge = async (el) => {
  if (el.style.backgroundColor !== "aqua") {
    await wait(1000);
    el.style.backgroundColor = "aqua";
    el.style.height = "8px";
  }
};

// Function to clear the screen and previous results
const clearScreen = () => {
  // Clear path display
  document.getElementsByClassName("path")[0].innerHTML = ""; 

  // Reset all edges' colors and thickness
  let lines = document.getElementsByClassName("line");
  for (let line of lines) {
    line.style.backgroundColor = "#EEE"; // Reset edge color
    line.style.height = "5px";           // Reset edge thickness
  }

  // Reset all nodes' colors
  let nodes = document.getElementsByClassName("node");
  for (let node of nodes) {
    node.style.backgroundColor = "";     // Reset node color
  }
};


// Event listener for dropdown selection
document.getElementById("algorithm-select").addEventListener("change", (event) => {
  const selectedAlgorithm = event.target.value;

  // Clear previous results before running the new algorithm
  clearScreen(); // Reset all node and path colors

  // Enable the run button for the selected algorithm
  document.querySelector(".run-btn").disabled = false;
  
  // Reset any necessary states or UI elements
  resetUI();

  // Optionally, if you want to immediately display something related to the selected algorithm
  if (selectedAlgorithm === "dijkstra") {
    document.getElementById("info").innerText = "Dijkstra's Algorithm selected.";
  } else if (selectedAlgorithm === "kruskal") {
    document.getElementById("info").innerText = "Kruskal's Algorithm selected.";
  }
  // Add other algorithms as needed...
});


const resetDrawingArea = () => {
  blocks.innerHTML = "";

  const p = document.createElement("p");
  p.classList.add("click-instruction");
  p.innerHTML = "Click to create node";

  blocks.appendChild(p);
  document.getElementById("add-edge-enable").disabled = false;
  document.querySelector(".reset-btn").disabled = true;
  document.querySelector(".run-btn").disabled = true;
  document.getElementsByClassName("path")[0].innerHTML = "";

  cnt = 0;
  dist = [];
  arr = []; // clear the temp edge array
  addEdge = false;

  // Re-enable the click event for nodes
  enableAddEdgeFunctionality();
};

// Re-enable edge addition functionality
const enableAddEdgeFunctionality = () => {
  addEdge = true; // Enable adding edges globally
  const nodes = document.getElementsByClassName("node");
  for (let node of nodes) {
    node.addEventListener("click", handleNodeClick); // Re-enable the click event for adding edges
  }
};

// Function to color a node
const colorNode = (nodeId, color) => {
  let node = document.getElementById(nodeId);
  node.style.backgroundColor = color;
};

const wait = async (t) => {
  let pr = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("done!");
    }, t);
  });
  res = await pr;
};




