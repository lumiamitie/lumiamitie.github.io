var width = 760;
var height = 400;

var legend_x = 500,
	legend_y = 50;
var d_pent = 150;		

d3.json("data/issue_relation.json", function(data){			
		var coord = [{"x": width/3, "y": (height/2)-d_pent, "node" : "top", "focused" : 0},
					{"x": width/3 + d_pent * Math.cos(Math.PI/10), 
						"y": height/2 - d_pent * Math.sin(Math.PI/10),
						"node" : "mid_right",
						"focused" : 0},
					{"x": width/3 + d_pent * Math.cos(3*Math.PI/10), 
						"y": height/2 + d_pent * Math.sin(3*Math.PI/10),
						"node" : "bot_right",
						"focused" : 0},
					{"x": width/3 - d_pent * Math.cos(3*Math.PI/10), 
						"y": height/2 + d_pent * Math.sin(3*Math.PI/10),
						"node" : "bot_left",
						"focused" : 0},
					{"x": width/3 - d_pent * Math.cos(Math.PI/10), 
						"y": height/2 - d_pent * Math.sin(Math.PI/10),
						"node" : "mid_left",
						"focused" : 0}];

		var keyword = d3.nest()
									.key(function(d){return d.main})
									.entries(data)
									.map(function(d){return d.key})
						
		var main_data = data
									.map(function(d){
										if(d.main ===d.linked){
											return d.data
										}else{
											return data
														.filter(function(e){return e.main ===d.main})
														.filter(function(e){return e.linked ===d.main})[0].data
										}
									})
		
		var line_pair = data.map(function(d, i ){
			return {"data":d.data, 
						"linked":d.linked, 
						"main":d.main, 
						"source" : keyword.indexOf(d.main),
						"target" : keyword.indexOf(d.linked),
						"main_data": main_data[i]}});

		
		for (i =0 ; i < 5 ; i++){
			coord[i].keyword = keyword[i];
		}


					
		var svg = d3.select(".contents").append("svg")
					.attr("width", width)
					.attr("height", height);
				
		var link = svg.selectAll("line")
				.data(line_pair)
				.enter()
				.append("line")
				.attr("x1",function(d){return coord[d.source].x})
				.attr("y1",function(d){return coord[d.source].y})
				.attr("x2",function(d){return coord[d.target].x})
				.attr("y2",function(d){return coord[d.target].y})
				.attr("class", function(d){
						return coord[d.source].node + " " + coord[d.target].node;	
					})
				.style("stroke","black")
				.style("stroke-width", "3px")
				.style("opacity", 0.3);

		var ellipse = svg.selectAll("ellipse")
				.data(coord)
				.enter()
				.append("ellipse")
				.attr("cx", function(d){return d.x;})
				.attr("cy", function(d){return d.y;})
				.attr("rx", 50)
				.attr("ry", 30)
				.style("fill", function(d){if (d.focused === 0){
							return "#4DB8FF";
						} else if(d.focused ===1){
							return "#99D6FF";
						} else {
							return "#0099FF";
						}
					}) 
				.on("click", function(d){ if(d.focused !== 2){
								focus_rev(d);
								console.log(d);
								d3.selectAll("ellipse")
									.style("fill", function(d){if (d.focused === 0){
											return "#4DB8FF";
										} else if(d.focused ===1){
											return "#99D6FF";
										} else {
											return "#0099FF";
										}
									});
								d3.selectAll("line")
									.style("opacity", 0.3);
									
								d3.selectAll("." + d.node)
									.style("opacity", 0.8);
									
								d3.selectAll(".label")
									.style("display","none");

									d3.selectAll(".label_" + d.keyword)
									.style("display","inline");

									d3.select(".legend")
									.selectAll(".main")
									.style("display","none");

									d3.select(".legend")
									.selectAll(".linked_legend")
									.style("display","none")
									
									d3.select(".legend")
									.selectAll(".legend_"+d.keyword)
									.style("display","inline");
							} else {
							
								focus_reset(d);
								d3.selectAll("ellipse")
									.style("fill", function(d){if (d.focused === 0){
											return "#4DB8FF";
										} else if(d.focused ===1){
											return "#99D6FF";
										} else {
											return "#0099FF";
										}
									});
								d3.selectAll(".label")
									.style("display","none")
									
								d3.selectAll("line")
									.style("opacity", 0.3);
								d3.select(".legend")
									.selectAll(".linked_legend")
									.style("display","none")
								d3.select(".legend")
									.selectAll(".main")
									.style("display","inline")
							}
						});
				svg.selectAll("rect")
						.data(line_pair)
						.enter()
						.append("rect")
							.attr("x",function(d){return (coord[d.source].x+coord[d.target].x)/2-5})
							.attr("y",function(d){return (coord[d.source].y+coord[d.target].y)/2-15})
							.attr("width", 35)
							.attr("height",20)
							.attr("fill", "white")
							.style("opacity", 0.5)
							.attr("class",  function(d){if (d.main === d.linked){
									return "none";
								} else {
									return "label label_" + d.main;
								}						
							})
							.style("display","none");

							
				svg.selectAll("text")
						.data(coord)
						.enter()
						.append("text")
							.attr("x", function(d){return d.x;})
							.attr("y", function(d){return d.y+5;})
							.text(function(d){return d.keyword;})
							.attr("fill", "black")
							.style("text-anchor","middle");
				
				svg.selectAll(".labels")
						.data(line_pair)
						.enter()
						.append("text")
							.attr("x",function(d){return (coord[d.source].x+coord[d.target].x)/2})
							.attr("y",function(d){return (coord[d.source].y+coord[d.target].y)/2})
							.text(function(d){return d3.format("%")(d.data/d.main_data)})
							.attr("class", function(d){console.log(d);if (d.main === d.linked){
									return "none";
								} else {
									return "label label_" + d.main;
								}						
							})
							.style("display","none")
							; 
							
			var legend = svg.append("g")
									.attr("class", "legend")
									
				legend.append("rect")
							.attr("x", legend_x)
							.attr("y", legend_y)
							.attr("width", 200)
							.attr("height", 130)
							.attr("fill", "steelblue")
							.style("opacity",0.7);
							
				
				legend.selectAll("legend_text_main")
							.data(data.filter(function(d){return d.main === d.linked}))
							.enter()
							.append("text")
							.attr("x",legend_x + 20)
							.attr("y", function(d, i){return legend_y+10 + (i+1) * 20})
							.text(function(d){return d.main +" : " + d.data + "건"})
							.attr("class", "main")
							
		var legend_text = legend.selectAll("legend_text")
							.data(data)
							.enter()
							.append("text")
							.attr("x",legend_x + 20)
							.attr("y", function(d, i){return legend_y+10 + (keyword.indexOf(d.linked)+1) * 20})
							.text(function(d){return d.linked +" : " + d.data + "건"})
							.attr("class", function(d){return "linked_legend legend_" + d.main})
							.style("display","none")
							;

							
		function focus_rev(d)	{
			for(i=0 ; i<5 ; i++){
				coord[i].focused = 1
			};
			console.log(d);
			d.focused = 2;
		};

		function focus_reset(d) {
			for(i=0 ; i<5 ; i++){
				coord[i].focused =0;
			};
		};
})
