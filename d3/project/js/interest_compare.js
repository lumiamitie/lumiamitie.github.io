d3.json("data/interest_compare.json", function(raw_data){
	var daily_nest = d3.nest()
						.key(function(d){return d.keyword})
						.key(function(d){return d.axis})
						.entries(raw_data.daily);
						
	var daily_keyword = daily_nest.map(function(d){
							return d.values.map(function(e){
								return {"name":e.values.map(function(f){
									return f.keyword;
									})[0],
								"axis":e.key,
								"value":d3.sum(e.values.map(function(f){
									return f.value;
									}))
								}
							})
						});
test_data = raw_data;
	var fallwidth_scale = d3.scale.linear()
						.range([0,10])
						.domain([0,
								d3.max(raw_data.daily
									.filter(function(d){
										return d.axis ==="변화폭";
										})
									.map(function(d){
										return d.value;
										})
									)
								]);	
	var count_scale = d3.scale.linear()
					.range([0,10])
					.domain([0,
							d3.max(raw_data.daily
								.filter(function(d){
									return d.axis ==="평균빈도";
									})
								.map(function(d){
									return d.value;
									})
								)
							]);	
							
	var ratio_scale = d3.scale.linear()
						.range([0,5,10])
						.domain([0,1,
							d3.max(raw_data.daily
								.filter(function(d){
									return d.axis ==="변화율";
									})
								.map(function(d){
									return d.value;
									})
								)
							]);
	var data = daily_nest.map(function(d){
							return {"key":d.key,
									"values":d.values.map(function(e){
									return {"name":e.values.map(function(f){
										return f.keyword;
										})[0],
									"axis":e.key,
									"value":d3.mean(e.values.map(function(f){
										if (e.key === "변화폭"){
											return fallwidth_scale(f.value);
										} else if(e.key === "평균빈도"){
											return count_scale(f.value);
										} else if(e.key === "변화율"){
											return ratio_scale(f.value);
										} else {
											return f.value;
										}
									})).toFixed(2)
								}
							})}
							
						});

	var color = d3.scale.category10();
	var chart = RadarChart.chart();
	var cfg = chart.config(); // retrieve default config
	var width = cfg.w +380,
		height = cfg.h +50;	
	
	var svg = d3.select('body').append('svg')
				  .attr('width', width)
				  .attr('height', height);
	svg.append('g').classed('single', 1).datum(data).call(chart);

	
	for(i = 0; i < data.length; i++){
		d3.selectAll("." + data[i].name)
			.style("fill", color(i))
			.style("stroke", "none")
			.style("opacity", 0.8);
			
		d3.select("g." + data[i].name)
			.selectAll("circle")
			.style("fill", color(i))
			.style("stroke", "none")
			.style("opacity",1);
	};
	
	var legend = svg.append("g")
					.attr("x", cfg.w / 3)
					.attr("y", 20)
					.attr("class", "legend")
					
	legend.selectAll("g")
			.data(data.map(function(d){return d.key;}))
			.enter()
			.append("text")
			.attr("x", function(d, i){return 50 + i* 100})
			.attr("y", cfg.h + 30)
			.text(function(d){return d;})
	legend.selectAll("g")
			.data(data.map(function(d){return d.key;}))
			.enter()
			.append("rect")
			.attr("x", function(d, i){return 35 + i* 100})
			.attr("y", cfg.h + 20)
			.attr("width", 10)
			.attr("height", 10)
			.attr("fill", function(d, i){return cfg.color(i)});
	var data_sentiment_tidy = d3.nest()
							.key(function(d){return d.keyword;})
							.entries(raw_data.sentiment)
							
	var data_sentiment = data_sentiment_tidy.map(function(d){
								return {
									"keyword":d.key,
									"positive":d.values.filter(function(e){return e.sentiment ==="positive"})[0].value,
									"negative":d.values.filter(function(e){return e.sentiment ==="negative"})[0].value,
									"neutral":d.values.filter(function(e){return e.sentiment ==="neutral"})[0].value
									}
								});
	var rangeband = 35 * data_sentiment_tidy.length;						
	var x = d3.scale.linear().range([0, width/4]),
		y = d3.scale.ordinal().rangeRoundBands([0,rangeband]);
	
	var yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);
	var xAxis = d3.svg.axis()
				.scale(x)
				.orient("top")
				.ticks(5)
				.tickSize(0)
				.tickFormat(d3.format("%"));
	

	x.domain([0, 1]);
	y.domain(data_sentiment.map(function(d){return d.keyword;}));

	var data_sum = data_sentiment.map(function(d){
		if (d.positive + d.negative + d.neutral > 0){
			return {"keyword": d.keyword,
					"x0": d.positive,
					"x1": d.negative,
					"x2": d.neutral,
					"sum": d.positive + d.negative + d.neutral
					}
		} else {
			return {"keyword": d.keyword,
				"x0": 1,
				"x1": 1,
				"x2": 1,
				"sum": 2
				}
		}
		});
	var pie_legend = svg.append("g")
					.attr("x", width-250)
					.attr("y", 70)
					.attr("class", "legend");
					
	pie_legend.selectAll("g")
			.data(["긍정", "부정", "중립"])
			.enter()
			.append("text")
			.attr("x", function(d, i){return width-240 + i* 70})
			.attr("y", 108)
			.text(function(d){return d;});
	pie_legend.selectAll("g")
			.data(["긍정", "부정", "중립"])
			.enter()
			.append("rect")
			.attr("x", function(d, i){return width-260 + i* 70})
			.attr("y", 100)
			.attr("width", 10)
			.attr("height", 10)
			.attr("fill", function(d){
				if (d === "긍정"){
					return "steelblue";
				} else if (d === "부정"){
					return "IndianRed";
				} else {
					return "SandyBrown";
				}
			
			});
	
/* 	var svg = d3.select(".contents")
				.append("svg")
				.attr("width", width)
				.attr("height", height);
 */
	var rect = svg.selectAll(".stackedRect")
		.data(data_sum)
		.enter()
		.append("g")
		.attr("transform", "translate(" + [width-250, 150]+ ")")
		
	rect.append("rect")
		.attr("width", function(d){return x(d.x0/d.sum);})
		.attr("height", function(d){return 25;})
		.attr("x",0)
		.attr("y", function(d){return y(d.keyword)})
		.attr("class", "bar pos")
		.style("fill","steelblue");	
	
	rect.append("rect")
		.attr("width", function(d){return x(d.x1/d.sum);})
		.attr("height", function(d){return 25;})
		.attr("x",function(d){return x(d.x0/d.sum);})
		.attr("y", function(d){return y(d.keyword)})
		.attr("class", "bar neg")
		.style("fill","IndianRed");

	rect.append("rect")
		.attr("width", function(d){return x(d.x2/d.sum);})
		.attr("height", function(d){return 25;})
		.attr("x",function(d){return x((d.x0 + d.x1)/d.sum);})
		.attr("y", function(d){return y(d.keyword)})
		.attr("class", "bar neu")
		.style("fill","SandyBrown");

	svg.append("g")
		.attr("class","y axis")
		.attr("transform", "translate(" + [width -250, 150]+ ")")
		.call(yAxis);
		
	svg.append("g")
		.attr("class","x axis")
		.attr("transform", "translate(" + [width -250, 150]+ ")")
		.call(xAxis);		
});