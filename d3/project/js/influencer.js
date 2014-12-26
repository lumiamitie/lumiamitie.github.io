var test_node = []
var test_link = []

var node_size = d3.scale.linear()
					.range([6,18]);
					
var node_color = d3.scale.category10();

var node_distance = d3.scale.linear()
								.range([10, 250]);

var link_opacity = d3.scale.linear()
							.range([0.1, 1]);

							
d3.json("data/influencer.json",function(data){
	console.log(data);
//	var links = data.edge;
//	var nodes = data.node;
//test_node = data.influencer;
	var nodes = data.influencer;
	node_channel = {"name":data.channel,"sentiment":"n","fixed":true,"x":450, "y":250};
	nodes.push(node_channel);
	nodes.reverse();
//test_node.push(node_channel);
//test_node.reverse();
	
	
	var links = [];
	for (i = 0; i < (nodes.length - 1) ; i++){
		links[i] = {"source":0, "target": i+1};
	};
	
	var width = 900,
		height = 500;
		
	var force = d3.layout.force()
		.nodes(d3.values(nodes))
		.links(links)
		.size([width, height])
		.linkDistance(200)
		.friction(0.5)
		.charge(-800)
		.gravity(0.2)
		.on("tick", tick)
		.start();
		
	d3.select(".chn").attr("transform", "translate(", width/2, ",", height/2,")")
//	d3.select(".chn").attr("transform", "translate(0,0)");
console.log(force);		
	var svg = d3.select("div").append("svg")
		.attr("width", width)
		.attr("height", height);
	
	link_opacity.domain(d3.extent(test_link, function(d){return d.lift}));
	
	var link = svg.selectAll(".link")
		.data(force.links())
	  .enter().append("line")
		.attr("class", "link");
		
//	link.style("opacity", function(d){return link_opacity(d.lift)});
		
	var node = svg.selectAll(".node")
		.data(force.nodes())
	  .enter().append("g")
		.attr("class", function(d){
						if (d.sentiment === "n") {
							return "node chn";
						}else {
							return "node";
						}
					})
		.attr("fixed", function(d){console.log(d);
				if (d.sentiment ==="n"){
					return 1;
				}	
			})
//		.on("mouseover", mouseover)
//		.on("mouseout", mouseout)
		.call(force.drag);
		

	
	node_size.domain([d3.min(nodes, function(d){return d.count}), 
					  d3.max(nodes, function(d){return d.count})]);
	
	node.append("circle")
//		.attr("r", function(d){return node_size(d.count);})
//		.attr("r", 8)
		.attr("r", function(d, i){
				if (i === 0){
					return 16;
				} else {
					return 8;
				}
			})
//		.style("fill",function(d){return node_color(d.cluster);});
//		.style("fill", "teal");
		.style("fill", function(d){
				if (d.sentiment === "positive"){
						return "blue";
					} else if (d.sentiment === "negative"){
						return "red";
					} else {
						return "teal";
					}
			});
		
	node.append("text")
		.attr("x", 12)
		.attr("dy", ".4em")
		.text(function(d) { return d.name; });
		
 	function tick() {
	  link
		  .attr("x1", function(d) { return d.source.x; })
		  .attr("y1", function(d) { return d.source.y; })
		  .attr("x2", function(d) { return d.target.x; })
		  .attr("y2", function(d) { return d.target.y; });
	  node
		  .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	}
//	d3.select(".chn").attr("transform", "translate(", width/2, ",", height/2,")")

/*	
	function mouseover() {
	  d3.select(this).select("circle").transition()
		  .duration(750)
		  .attr("r", function(d){return 1.5 * node_size(d.prob)});
	}
	
	function mouseout() {
	  d3.select(this).select("circle").transition()
		  .duration(750)
		  .attr("r", function(d){return node_size(d.prob)});
	} */
});
