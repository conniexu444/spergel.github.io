class NetworkGraph {
    constructor(containerId) {
        this.container = d3.select(containerId);
        // Double the width and height
        this.width = this.container.node().getBoundingClientRect().width * 2;
        this.height = window.innerHeight * 1.6; // 2 * 0.8 = 1.6
        this.simulation = null;
        this.nodes = [];
        this.links = [];
        
        // Initialize SVG with doubled dimensions
        this.svg = this.container.append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .style("background-color", "var(--bg-color)")  // Use CSS variable
            .call(d3.zoom()
                .scaleExtent([0.1, 4]) // Allow more zoom range
                .on("zoom", () => this.g.attr("transform", d3.event.transform)))
                .call(d3.zoom().transform, d3.zoomIdentity.scale(0.5).translate(this.width/2, this.height/2)); // Initial zoom to fit
            
        // Add zoom capabilities with initial zoom to fit
        this.g = this.svg.append("g");
        this.svg.call(d3.zoom()
            .scaleExtent([0.1, 4]) // Allow more zoom range
            .on("zoom", () => this.g.attr("transform", d3.event.transform)))
            .call(d3.zoom().transform, d3.zoomIdentity.scale(0.5).translate(this.width/2, this.height/2)); // Initial zoom to fit
            
        // Initialize force simulation
        this.initializeSimulation();

        // Add tooltip div
        this.tooltip = d3.select("body").append("div")
            .attr("class", "graph-tooltip")
            .style("opacity", 0);

        // Add highlight groups before other elements
        this.highlightGroup = this.g.append("g").attr("class", "highlights");

        this.nodeSize = d => {
            const connectionCount = this.links.filter(l => 
                l.source.id === d.id || l.target.id === d.id
            ).length;
            return Math.max(3, Math.sqrt(connectionCount) * 2);
        };

        // Add theme change listener
        document.addEventListener('themeChanged', () => this.updateColors());

        this.isReady = false;
        this.readyCallbacks = [];
        
        // Add this line to load data immediately
        this.loadData();
    }

    initializeSimulation() {
        this.simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(d => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(this.width / 2, this.height / 2))
            .force("collision", d3.forceCollide().radius(30));
    }

    updateData(nodes, links) {
        console.log("Updating graph with:", nodes.length, "nodes,", links.length, "links");
        
        // Stop the previous simulation
        if (this.simulation) {
            this.simulation.stop();
        }

        // Convert links to use actual node objects instead of just IDs
        const nodesById = new Map(nodes.map(node => [node.id, node]));
        
        this.links = links.map(link => ({
            ...link,
            source: nodesById.get(typeof link.source === 'object' ? link.source.id : link.source),
            target: nodesById.get(typeof link.target === 'object' ? link.target.id : link.target)
        })).filter(link => link.source && link.target); // Ensure valid links only

        this.nodes = nodes;

        // Reinitialize the simulation with new data
        this.simulation = d3.forceSimulation(this.nodes)
            .force("link", d3.forceLink(this.links).id(d => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(this.width / 2, this.height / 2))
            .force("collision", d3.forceCollide().radius(30));

        // Render the updated graph
        this.render();
    }

    render() {
        console.log("Rendering graph");
        // Clear previous elements
        this.g.selectAll("*").remove();

        // Create groups in specific order (links behind, nodes in front)
        const linkGroup = this.g.append("g").attr("class", "links");
        const labelGroup = this.g.append("g").attr("class", "labels");
        const nodeGroup = this.g.append("g").attr("class", "nodes");  // Moved to front

        // Draw links with pointer-events control
        const link = linkGroup
            .selectAll("line")
            .data(this.links)
            .enter()
            .append("line")
            .attr("stroke", "var(--primary-color)")  // Use CSS variable
            .attr("stroke-width", d => Math.sqrt(d.letters.length))
            .attr("data-original-width", d => Math.sqrt(d.letters.length))  // Store original width
            .style("pointer-events", "none");  // Disable pointer events on lines

        // Add a wider transparent line for hover detection
        const linkHitArea = linkGroup
            .selectAll(".link-hit-area")
            .data(this.links)
            .enter()
            .append("line")
            .attr("stroke", "transparent")
            .attr("stroke-width", 10)  // Wide hit area
            .on("mouseover", (d) => this.highlightConnections(d, 'link'))
            .on("mouseout", () => this.clearHighlights())
            .on("click", (d) => this.handleLinkClick(d));

        // Calculate node sizes based on connections
        const nodeSize = d => {
            const connectionCount = this.links.filter(l => 
                l.source.id === d.id || l.target.id === d.id
            ).length;
            return Math.max(3, Math.sqrt(connectionCount) * 2);
        };

        // Draw nodes with dynamic radius
        const node = nodeGroup
            .selectAll("circle")
            .data(this.nodes)
            .enter()
            .append("circle")
            .attr("r", d => this.nodeSize(d))  // Set radius using nodeSize function
            .attr("data-original-radius", d => this.nodeSize(d))  // Store original radius
            .attr("fill", "var(--primary-color)")  // Use CSS variable
            .attr("stroke", "var(--node-stroke)")  // Use CSS variable
            .attr("stroke-width", "2px")
            .on("mouseover", (d) => {
                this.showTooltip(d);
                this.highlightConnections(d, 'node');
            })
            .on("mouseout", () => {
                this.hideTooltip();
                this.clearHighlights();
            })
            .on("click", (d) => this.handleNodeClick(d))  // Make sure this is bound
            .call(d3.drag()
                .on("start", this.dragstarted.bind(this))
                .on("drag", this.dragged.bind(this))
                .on("end", this.dragended.bind(this)));

        // Draw labels with more space
        const labels = labelGroup
            .selectAll("text")
            .data(this.nodes)
            .enter()
            .append("text")
            .text(d => this.truncateLabel(d))
            .attr("font-family", "var(--font-family)")
            .attr("font-size", "12px")
            .attr("fill", d => d.highlighted ? "var(--highlight-color)" : "var(--primary-color)")
            .attr("dx", d => this.nodeSize(d) + 5)
            .attr("dy", 3);

        // Add highlight handlers
        link
            .on("mouseover", (d) => this.highlightConnections(d, 'link'))
            .on("mouseout", () => this.clearHighlights())
            .on("click", (d) => this.handleLinkClick(d));

        node
            .on("mouseover", (d) => this.highlightConnections(d, 'node'))
            .on("mouseout", () => this.clearHighlights())
            .on("click", (d) => this.handleNodeClick(d));

        // Update positions on each tick without constraints
        this.simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            linkHitArea
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            // Remove constraints on nodes
            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            // Keep labels following their nodes
            labels
                .attr("x", d => d.x)
                .attr("y", d => d.y);
        });

        // Adjust forces for better distribution
        this.simulation
            .force("charge", d3.forceManyBody().strength(-2000)) // Stronger repulsion
            .force("center", d3.forceCenter(this.width / 2, this.height / 2))
            .force("collision", d3.forceCollide().radius(60)) // Larger collision radius
            .force("x", d3.forceX(this.width / 2).strength(0.02)) // Weaker x centering
            .force("y", d3.forceY(this.height / 2).strength(0.02)); // Weaker y centering

        this.simulation.alpha(1).restart();
    }

    truncateLabel(text) {
        if (!text) return '';
        const label = typeof text === 'object' ? text.id : text;
        return label.length > 20 ? label.substring(0, 17) + '...' : label;
    }

    showTooltip(d) {
        const connections = this.links.filter(l => 
            l.source.id === d.id || l.target.id === d.id
        );
        
        const tooltipContent = `
            <div class="tooltip-content">
                <strong>${d.name}</strong><br>
                Connections: ${connections.length}<br>
                ${d.tags && d.tags.length ? `Tags: ${d.tags.join(', ')}` : ''}
            </div>
        `;

        this.tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        this.tooltip.html(tooltipContent)
            .style("left", (d3.event.pageX + 10) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
    }

    hideTooltip() {
        this.tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    }

    dragstarted(d) {
        if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    dragended(d) {
        if (!d3.event.active) this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    highlightConnections(d, type) {
        const relatedNodes = new Set();
        const relatedLinks = new Set();

        if (type === 'node') {
            this.links.forEach(link => {
                if (link.source.id === d.id || link.target.id === d.id) {
                    relatedLinks.add(link);
                    relatedNodes.add(link.source);
                    relatedNodes.add(link.target);
                }
            });
        } else {
            relatedLinks.add(d);
            relatedNodes.add(d.source);
            relatedNodes.add(d.target);
        }

        // Dim elements
        this.g.selectAll("line")
            .style("opacity", 0.1)
            .attr("stroke-width", function() {
                return d3.select(this).attr("data-original-width");
            });
            
        this.g.selectAll("circle")
            .style("opacity", 0.1)
            .attr("r", function() {
                return d3.select(this).attr("data-original-radius");
            });
            
        this.g.selectAll("text")
            .style("opacity", 0.3);

        // Highlight related elements
        relatedLinks.forEach(link => {
            this.g.selectAll("line")
                .filter(l => l === link)
                .style("opacity", 1)
                .attr("stroke-width", function() {
                    return parseFloat(d3.select(this).attr("data-original-width")) * 2;
                });
        });

        relatedNodes.forEach(node => {
            this.g.selectAll("circle")
                .filter(n => n === node)
                .style("opacity", 1)
                .attr("r", function() {
                    return parseFloat(d3.select(this).attr("data-original-radius")) * 1.2;
                });
            
            this.g.selectAll("text")
                .filter(n => n === node)
                .style("opacity", 1)
                .style("font-weight", "bold");
        });
    }

    clearHighlights() {
        // Reset all elements to original values
        this.g.selectAll("line")
            .style("opacity", 1)
            .attr("stroke-width", function() {
                return d3.select(this).attr("data-original-width");
            });
        
        this.g.selectAll("circle")
            .style("opacity", 1)
            .attr("r", function() {
                return d3.select(this).attr("data-original-radius");
            });
        
        this.g.selectAll("text")
            .style("opacity", 1)
            .style("font-weight", "normal");
    }

    handleNodeClick(d) {
        console.log("Node clicked: ", d);
        document.dispatchEvent(new CustomEvent('showLetterDetails', {
            detail: {
                type: 'node',
                data: {
                    id: d.id,
                    name: d.name,
                    totalLetters: this.links.filter(l => 
                        l.source.id === d.id || l.target.id === d.id
                    ).length
                }
            }
        }));
    }

    handleLinkClick(d) {
        console.log("Link clicked: ", d);
        document.dispatchEvent(new CustomEvent('showLetterDetails', {
            detail: {
                type: 'link',
                data: d
            }
        }));
    }

    // Add new method to update colors
    updateColors() {
        if (!this.g) return;

        // Update links
        this.g.selectAll("line")
            .attr("stroke", "var(--primary-color)");

        // Update nodes
        this.g.selectAll("circle")
            .attr("fill", "var(--primary-color)")
            .attr("stroke", "var(--node-stroke)");

        // Update labels
        this.g.selectAll("text")
            .attr("fill", d => d.highlighted ? "var(--highlight-color)" : "var(--primary-color)");
    }

    async loadData() {
        try {
            // Wait for D3 initialization
            await new Promise(resolve => setTimeout(resolve, 0));
            this.isReady = true;
            this.readyCallbacks.forEach(callback => callback());
            this.readyCallbacks = [];
        } catch (error) {
            console.error("Error initializing graph:", error);
            throw error;
        }
    }

    onReady(callback) {
        if (this.isReady) {
            callback();
        } else {
            this.readyCallbacks.push(callback);
        }
    }
}
