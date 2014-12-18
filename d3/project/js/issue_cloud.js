var node_color = d3.scale.category20();

d3.json("data/issue_cloud.json", function(data){
	console.log(data);
	var nodes = data;

	var width = 900,
		height = 500;
		
	var force = d3.layout.force()
		.nodes(d3.values(nodes))
		.size([width, height])
		.linkDistance(60)
		.charge(-300)
		.on("tick", tick)
		.start();
		
	var svg = d3.select("div").append("svg")
		.attr("width", width)
		.attr("height", height);
						
	var node = svg.selectAll(".node")
		.data(force.nodes())
	  .enter().append("g")
		.attr("class", "node")
		.on("mouseover", mouseover)
		.on("mouseout", mouseout)
		.call(force.drag);
				
	node.append("circle")
		.attr("r", 8)
		.style("fill",function(d){return node_color(d.name);});
		
	node.append("text")
		.attr("x", 12)
		.attr("dy", ".35em")
		.text(function(d) { return d.name; });
		
	function tick() {
	  node
		  .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	}
	
	function mouseover() {
	  d3.select(this).select("circle").transition()
		  .duration(750)
		  .attr("r", 12);
	}
	
	function mouseout() {
	  d3.select(this).select("circle").transition()
		  .duration(750)
		  .attr("r", 8);
	}
});
