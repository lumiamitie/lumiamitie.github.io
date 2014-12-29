//d3.select("div").append("svg").attr("width", 800).attr("height", 600);
//a=[1,2,3,4,5];

/* var circle = d3.select("svg")
				.selectAll("circle")
				.data(a)
				.enter()
				.append("circle")
				.attr("cx",0)
				.attr("cy", -100)
				.attr("r",20)
				.style("fill","teal");
circle.attr("transform", function(d,i){
				return "translate(400,200) rotate("+ 72*(d-1) +",0,100)"
			}); */
var width = 760;
var height = 500;

var d_pent = 200;		
			
var coord = [{"x": width/2, "y": (height/2)-d_pent},
			{"x": width/2 + d_pent * Math.cos(Math.PI/10), 
				"y": height/2 - d_pent * Math.sin(Math.PI/10)},
			{"x": width/2 + d_pent * Math.cos(3*Math.PI/10), 
				"y": height/2 + d_pent * Math.sin(3*Math.PI/10)},
			{"x": width/2 - d_pent * Math.cos(3*Math.PI/10), 
				"y": height/2 + d_pent * Math.sin(3*Math.PI/10)},
			{"x": width/2 - d_pent * Math.cos(Math.PI/10), 
				"y": height/2 - d_pent * Math.sin(Math.PI/10)}];
			
var line_pair = [{"source":0, "target":1},
				{"source":0, "target":2},
				{"source":0, "target":3},
				{"source":0, "target":4},
				{"source":1, "target":2},
				{"source":1, "target":3},
				{"source":1, "target":4},
				{"source":2, "target":3},
				{"source":2, "target":4},
				{"source":3, "target":4}];
			
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
		.style("stroke","black")
		.style("opacity", 0.8);
		
var circle = svg.selectAll("circle")
		.data(coord)
		.enter()
		.append("circle")
		.attr("cx", function(d){return d.x;})
		.attr("cy", function(d){return d.y;})
		.attr("r", 20)
		.style("fill", "teal");
