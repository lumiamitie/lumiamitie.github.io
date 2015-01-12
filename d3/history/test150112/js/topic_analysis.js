var node_size = d3.scale.linear()
					.range([6,16]);
					
var node_color = d3.scale.category10();

var node_distance = d3.scale.linear()
								.range([10, 250]);

var link_opacity = d3.scale.linear()
							.range([0.05, 0.8]);
							
d3.json("data/topic_analysis.json",function(data){

	var links = data.edge;
	var nodes = data.node;
	
	node_distance.domain(d3.extent(nodes, function(d){return d.prob}));
	
	var width = 740,
		height = 370;
		
	var force = d3.layout.force()
		.nodes(d3.values(nodes))
		.links(links)
		.size([width, height])
		.linkDistance(100)
		.friction(0.5)
		.charge(-500)
		.gravity(0.2)
		.on("tick", tick)
		.start();
		
	var svg = d3.select("div").append("svg")
		.attr("width", width)
		.attr("height", height);
	
	link_opacity.domain(d3.extent(links, function(d){return d.lift}));
	
	var link = svg.selectAll(".link")
		.data(force.links())
	  .enter().append("line")
		.attr("class", "link");
		
	link.style("opacity", function(d){return link_opacity(d.lift)});
		
	var node = svg.selectAll(".node")
		.data(force.nodes())
	  .enter().append("g")
		.attr("class", "node")
		.on("mouseover", mouseover)
		.on("mouseout", mouseout)
		.on("click",selectCluster)
		.call(force.drag);
		
	node_size.domain([d3.min(nodes, function(d){return d.prob}), 
					  d3.max(nodes, function(d){return d.prob})]);
	
	node.append("circle")
		.attr("r", function(d){return node_size(d.prob);})
		.style("fill",function(d){return node_color(d.cluster);});
		
	node.append("text")
		.attr("x", 12)
		.attr("dy", ".35em")
		.text(function(d) { return d.name; });
		
	function tick() {
	  link
		  .attr("x1", function(d) { return d.source.x; })
		  .attr("y1", function(d) { return d.source.y; })
		  .attr("x2", function(d) { return d.target.x; })
		  .attr("y2", function(d) { return d.target.y; });
 
	  node
		  .attr("transform", function(d) { 
			d.x = Math.max(18, Math.min(width - 18, d.x));
			d.y = Math.max(18, Math.min(height - 18, d.y))
			return "translate(" + d.x + "," + 
									d.y + ")"; });

	}
	
	function mouseover() {
	  d3.select(this).select("circle").transition()
		  .duration(750)
		  .attr("r", function(d){return 1.5 * node_size(d.prob)});
	}
	
	function mouseout() {
	  d3.select(this).select("circle").transition()
		  .duration(750)
		  .attr("r", function(d){return node_size(d.prob)});
	}
	var selectedCluster = 0;
	function selectCluster(d){
		if(selectedCluster !== d.cluster){
			node.selectAll("circle")
				.attr("class",function(node){
					if(node.cluster === d.cluster){
						return "node focused";
					} else {
						return "node out_focused"
					}
				})
			node.selectAll("text")
				.attr("class",function(node){
					if(node.cluster === d.cluster){
						return "node focused";
					} else {
						return "node out_focused";
					}
				})
			selectedCluster = d.cluster;
		} else {
			node.selectAll("circle")
				.attr("class", "node focused")
			node.selectAll("text")
				.attr("class", "node focused")	
			selectedCluster = 0;
		}

	}
});