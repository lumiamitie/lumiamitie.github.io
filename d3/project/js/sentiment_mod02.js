var width = 740,
	height = 370,
	margin = {top:20, right:30, bottom:70, left:20},
	parseDate = d3.time.format("%Y%m%d").parse,
    returnDate = d3.time.format("%m/%d")
	;
	
var svg = d3.select("div").append("svg")
			.attr("width", width)
			.attr("height", height)
			.append("g")
			.attr("transform","translate("+margin.left+","+margin.top+")");


d3.json("data/sentiment_neutral_2month.json", function(data) {
	var sentiment = d3.nest()
					.key(function(d){return d.sentiment})
					.entries(data.map(function(d){return {"count":d.count, "sentiment":d.sentiment, "date":parseDate(d.date)};}));

	var visible = {positive: "inline", negative: "inline", neutral: "inline"}
	
	drawAxes(data);

	draw(visible);
	
	drawTips(data);
	
	var legend = svg.append("g")
					.attr("class", "legend")
					.attr("x", width/3)
					.attr("y", 0)
					.attr("height", 100)
					.attr("width", 100);
	legend.selectAll("g")
			.data(sentiment.map(function(d){return d.key}))
			.enter()
			.append("g")
			.each(function(d, i) {
				var g = d3.select(this);
					g.append("rect")
					  .attr("x", margin.left + i*100)
					  .attr("y", height - 47)
					  .attr("width", 10)
					  .attr("height", 10)
					  .style("fill", function(d){
								if (d === "positive"){
									return "steelblue";
								} else if (d === "negative"){
									return "maroon";
								} else if (d === "neutral"){
									return "SandyBrown";
								}
						})
					  .on("click", function(d){
					if (d === "positive"){
						if (visible.positive === "inline"){
							visible.positive = "none";
							g.select("rect")
								.style("opacity", 0.3);
						}else {
							visible.positive = "inline";
							g.select("rect")
								.style("opacity", 1);
						}

					} else if (d === "negative"){
						if (visible.negative === "inline"){
							visible.negative = "none";
							g.select("rect")
								.style("opacity", 0.3);
						} else {
							visible.negative = "inline";
							g.select("rect")
								.style("opacity", 1);
						}
					} else if (d === "neutral"){
						if (visible.neutral === "inline"){
							visible.neutral = "none";
							g.select("rect")
								.style("opacity", 0.3);
						} else {
							visible.neutral = "inline";
							g.select("rect")
								.style("opacity", 1);
						}
					}
					d3.selectAll(".axis").remove();		
					d3.selectAll(".area").remove();
					d3.selectAll(".line").remove();
					d3.selectAll(".tips").remove();
					drawAxes(data);
					draw(visible);
					drawTips(data);
				  })
					g.append("text")
					  .attr("x", margin.left + i * 100 +15)
					  .attr("y", height - 38)
					  .attr("height", 30)
					  .attr("width", 100)
					  .style("fill", "black")
					  .text(function(d){
								if (d === "positive"){
									return "긍정";
								} else if (d === "negative"){
									return "부정";
								} else if (d === "neutral"){
									return "중립";
								}
							});
			});

	function draw(visible){
		if (visible.positive === "inline"){
			drawArea(sentiment[0].values,"pos","monotone");
		};
		if (visible.negative === "inline"){
			drawArea(sentiment[1].values, "neg","monotone");
		};
		if (visible.neutral === "inline"){
			drawLine(sentiment[2].values, "neu", "monotone");
		}
	}
	function drawTips(data){
		if (visible.positive === "none"){
			data = data.filter(function(d){return d.sentiment !== "positive"});
		};
		if (visible.negative === "none"){
			data = data.filter(function(d){return d.sentiment !== "negative"});
		};
		if (visible.neutral === "none"){
			data = data.filter(function(d){return d.sentiment !== "neutral"});
		};
		var tooltip = d3.select("div").append("div")
				.attr("class", "tooltip")
				.style("opacity", 0);

		var tip = svg.append("g")
					.attr("class","tips")
					;

		tip.selectAll(".tips")
			.data(data)
			.enter()
			.append("circle")
			.attr("cx",function(d){return x(parseDate(d.date))})
			.attr("cy", function(d){return y(d.count)})
 			.attr("r",0)
			.style("fill",function(d){
					if (d.sentiment === "positive"){
						return "steelblue";
					} else if (d.sentiment === "negative"){
						return "maroon";
					} else if (d.sentiment === "neutral"){
						return "SandyBrown";
					}		
				})
			.style("display",function(d){
				return visible[d.sentiment];
			})
			.attr("stroke","#ccc")
			.attr("class", function(d){return "tip_"+d.key;})
				.on("mouseover", function(d){
					tooltip.transition()
							.duration(200)
							.style("opacity", 0.9);
					tooltip.html(translate_kor(d.sentiment)+"<br/>"+returnDate(parseDate(d.date))+ "<br/>"+d.count)
							.style("left", (d3.event.pageX) + "px")
							.style("top", (d3.event.pageY - 28) + "px");			
				})
				.on("mouseout", function(d){
					tooltip.transition()
							.duration(500)
							.style("opacity", 0);
				})
			.transition()
			.duration(1700) 
			.attr("r",2);	
	}
	
	function drawAxes(data){
		if (visible.positive === "none"){
			data = data.filter(function(d){return d.sentiment !== "positive"});
		};
		if (visible.negative === "none"){
			data = data.filter(function(d){return d.sentiment !== "negative"});
		};
		if (visible.neutral === "none"){
			data = data.filter(function(d){return d.sentiment !== "neutral"});
		};

		y = d3.scale.linear()
					.domain(d3.extent(data,function(d){
							return d.count;
						})
					)
					.range([height - margin.top - margin.bottom, margin.top]);

		x = d3.time.scale()
					.domain(d3.extent(data,function(d){
							return parseDate(d.date);
						})
					)
					.range([margin.left, width - margin.left - margin.right]);
		
		
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(" + [0, height - margin.top - margin.bottom] + ")")
			.call(d3.svg.axis()
					.scale(x)
					.tickFormat(returnDate)
					.orient("bottom")
					.tickPadding(10)
					.ticks(10)
					.outerTickSize(1)
				);
		svg.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(" + [margin.left, 0] + ")")
			.call(d3.svg.axis()
					.scale(y)
					.orient("left")
					.innerTickSize(-width+margin.left + margin.right+10)
					.tickPadding(10)
					.ticks(5)
					.outerTickSize(1)
				);
	}
						
	function drawLine(dataSet, clsName, intp_type){
		var line_neu = d3.svg.line()
							.x(function(d){return x(d.date)})
							.y(function(d){return y(d.count)})
							.interpolate("monotone");							;
							
		var lineElements = svg.append("path")
								.attr("class","line "+ clsName)
								.attr("d", line_neu(dataSet));
	}
	
	function drawArea(dataSet, clsName, intp_type){
		var area_default = d3.svg.area()
						.x(function(d){return x(d.date)})
						.y0(function(d){return height-margin.top - margin.bottom})
						.y1(function(d){return height-margin.top - margin.bottom})
						.interpolate("monotone");
		var area = d3.svg.area()
						.x(function(d){return x(d.date)})
						.y0(function(d){return height-margin.top - margin.bottom})
						.y1(function(d){return y(d.count)})
						.interpolate("monotone");
						
		var areaElements = svg.append("path")
								.attr("class", "area "+clsName)
								.attr("d", area_default(dataSet))
								.transition()
								.duration(1000)
								.attr("d", area(dataSet));
	}
	function translate_kor(sentiment){
				if (sentiment === "positive"){
					return "긍정";
				} else if (sentiment === "negative"){
					return "부정";
				} else if (sentiment === "neutral"){
					return "중립";
				}
	}
});