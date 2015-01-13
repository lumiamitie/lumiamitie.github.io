var margin = {top: 20, right: 15, bottom: 60, left: 60}
  , width = 740 - margin.left - margin.right
  , height = 370 - margin.top - margin.bottom;



var chart = d3.select('div')
					.append('svg')
					.attr('width', width + margin.right + margin.left)
					.attr('height', height + margin.top + margin.bottom)
					.attr('class', 'chart')
var main = chart.append('g')
						.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
						.attr('width', width)
						.attr('height', height)
						.attr('class', 'main')   
	
var color = d3.scale.category20();


d3.json("data/word_distance.json", function(data){
	var x = d3.scale.linear()
						  .domain([0.8 * d3.min(data, function(d) { return d.x; }), 
									1.1 * d3.max(data, function(d) { return d.x; })])
						  .range([ 0, width ]);

	var y = d3.scale.linear()
						  .domain([0.8 * d3.min(data, function(d) { return d.y; }), 
									1.1 *d3.max(data, function(d) { return d.y; })])
						  .range([ height, 0 ]);
			  
	var z = d3.scale.linear()
							.domain([d3.min(data, function(d) {return d.score; }), 
									d3.max(data, function(d) {return d.score; })])
							.range([10, 30])
	
	// draw the x axis					
	var xAxis = d3.svg.axis()
						.scale(x)
						.orient('bottom')
//						.innerTickSize(-height)
						.outerTickSize(0)
						.tickPadding(10);
	main.append('g')
			.attr('transform', 'translate(0,' + height + ')')
			.attr('class', 'main axis date')
			.call(xAxis);
		
	// draw the y axis
	var yAxis = d3.svg.axis()
						.scale(y)
						.orient('left')
						.ticks(5)
						.innerTickSize(-width)
						.outerTickSize(0)
						.tickPadding(10);;
	main.append('g')
			.attr('transform', 'translate(0,0)')
			.attr('class', 'main axis date')
			.call(yAxis);		
	
	
	var g = main.append("svg:g"); 
	var selectedDot = 0;
	g.selectAll(".scatter-dots")
	  .data(data)
	  .enter().append("circle")
		  .attr("cx", function (d,i) { return x(d.x); } )
		  .attr("cy", function (d) { return y(d.y); } )
		  .attr("r", function (d) { return z(d.score); })
		  .attr("fill", function(d){return color(d.word)})
		  .attr("class", "scatter-dots")
		  .style("opacity", 0.6)
		  .on("click",function(d,i){
			if(selectedDot !== i){
				d3.selectAll(".scatter-dots")
					.style("opacity",0.6)
					.style("stroke","none");
				d3.select(this)
					.style("opacity", 1)
					.style("stroke", "black")
					.style("stroke-width", "2px");
				selectedDot = i;
			} else {
				d3.selectAll(".scatter-dots")
					.style("stroke","none")
					.style("opacity",0.6);
			}
		  })
		.on("mouseover", function(d){
				tooltip.transition()
						.duration(200)
						.style("opacity", 0.9);
				tooltip.html(d.word+"<br/>"+d.score)
						.style("left", (d3.event.pageX) + "px")
						.style("top", (d3.event.pageY - 28) + "px");			
			})
			.on("mouseout", function(d){
				tooltip.transition()
						.duration(500)
						.style("opacity", 0);
			});;
	
	//Label    
	g.selectAll("text")
		.data(data)
		.enter()
		.append("text")
		.text(function(d) {return d.word;})
		.attr("x", function(d,i) {return x(d.x);})
		.attr("y", function(d,i) {return y(d.y);})
		.attr("fill",'black')
		.attr("class","circle_label")
		.attr("text-anchor","middle");

	var tooltip = d3.select("div").append("div")
			.attr("class", "tooltip")
			.style("opacity", 0);
	
});
