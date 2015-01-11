var width = 740,
	height = 370;

var node_color = d3.scale.category20();

var node_size = d3.scale.linear().range([10,30]);

d3.json("data/issue_cloud.json", function(data){
	var nodes = data;
	
	node_size.domain(
				d3.extent(
					data.map(function(d){
						return d.prob;
					})
				)
			);
		
	var force = d3.layout.force()
		.nodes(d3.values(nodes))
		.size([width, height])
		.linkDistance(60)
		.charge(-200)
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
				
/* 	node.append("circle")
		.attr("r", 8)
		.style("fill",function(d){return node_color(d.name);}); */
		
	node.append("text")
	//	.attr("x", 12)
	//	.attr("dy", ".35em")
		.text(function(d) { return d.name; })
		.style("fill",function(d){
					return node_color(d.name);
				})
		.style("font-size", function(d){
					return node_size(d.prob) + "pt";
				});
		
	function tick() {
	  node
		  .attr("transform", function(d) { 
				d.x = Math.max(18, Math.min(width - 18, d.x));
				d.y = Math.max(18, Math.min(height - 18, d.y));
				return "translate(" + d.x + "," + d.y + ")"; 
			});
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
