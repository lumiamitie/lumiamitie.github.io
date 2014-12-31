var node_size = d3.scale.linear()
					.range([6,18]);
					
var node_color = d3.scale.category10();

var node_distance = d3.scale.linear()
								.range([10, 250]);

var link_opacity = d3.scale.linear()
							.range([0.1, 1]);

							
d3.json("data/influencer.json",function(data){

	var nodes = data.influencer;
	node_channel = {"name":data.channel,
								"sentiment":"n",
								"fixed":true,
								"x":450, 
								"y":250};
	nodes.push(node_channel);
	nodes.reverse();
	
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
	var svg = d3.select("div").append("svg")
		.attr("width", width)
		.attr("height", height);
	
	link_opacity.domain(d3.extent(links, function(d){return d.lift}));
	
	var link = svg.selectAll(".link")
		.data(force.links())
	  .enter().append("line")
		.attr("class", "link");
				
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
		.attr("fixed", function(d){
				if (d.sentiment ==="n"){
					return 1;
				}	
			})
		.call(force.drag);
			
	node_size.domain([d3.min(nodes, function(d){return d.count}), 
					  d3.max(nodes, function(d){return d.count})]);
	
	node.append("circle")
		.attr("r", function(d, i){console.log(d);
				if (i === 0){
					return 20;
				} else {
					return node_size(d.count);
				}
			})
		.style("fill", function(d){
				if (d.sentiment === "positive"){
						return "steelblue";
					} else if (d.sentiment === "negative"){
						return "maroon";
					} else {
						return "darkslategray";
					}
			});
		
	node.append("text")
		.attr("x",  function(d){if (d.fixed === true){
									return 0;
								} else {
									return 12;
								}								
							})
		.attr("dy", ".4em")
		.attr("text-anchor", function(d){if (d.fixed === true){
									return "middle";
								} else {
									return "start";
								}								
							})
		.text(function(d) { return d.name; })
		.attr("fill", function(d){if (d.fixed === true){
									return "white";
								} else {
									return "black";
								}
							})
		.style("text-transform",function(d){if (d.fixed === true){
									return "uppercase";
								} 
							});
		
 	function tick() {
	  link
		  .attr("x1", function(d) { return d.source.x; })
		  .attr("y1", function(d) { return d.source.y; })
		  .attr("x2", function(d) { return d.target.x; })
		  .attr("y2", function(d) { return d.target.y; });
	  node
		  .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	}
});
