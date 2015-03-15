var svg = d3.select("body")
			.append("svg")
			.attr("width",600)
			.attr("height",600);

var x = d3.scale.ordinal()
		.rangeRoundBands([60, 500], 0.1);

var y = d3.scale.linear()
		.range([450, 10]);

// 두 번째 y축
var y_line = d3.scale.linear()
				.range([450, 10]);

// 두 번째 축에다 그릴 line 생성 함수
// path에 결과값을 넣어주면 된다			
var line = d3.svg.line()
			.x(function(d){return x(d.region)})
			.y(function(d){return y_line(d.value)})
			.interpolate("monotone")
			;

d3.json("data/votes.json", function(data){
	test_data = data
	
	var data_total = data.filter(function(d){return d.variable === "총투표수"});
	
	var data_t1718 = data.filter(function(d){return d.variable === "t17_18"});
	
	var data_centered = data_total.map(function(d){
								var data_mean = d3.mean(data_total.map(function(d){return d.value}))
								return {region : d.region, 
										variable : d.variable, 
										value : d3.round(d.value - data_mean)
										}
							})

	x.domain(data.map(function(d){return d.region}))
	
	//test_centered = data_centered;
	var max_value = d3.max(data_centered.map(function(d){
							return Math.abs(d.value)
							})
						)
	y.domain([-max_value, max_value])
	
	y_line.domain([0, d3.max(data_t1718.map(function(d){return d.value;}))])
	
	var rect = svg.selectAll("rect")
				.data(data_centered)
				.enter()
				.append("rect")
				.attr("x", function(d){
					return x(d.region);
					})
				.attr("y", function(d){
					return y(0);
					})
				.attr("width",function(d){
					return x.rangeBand();
					})
				.attr("height", function(d){
					return 0;
					})
				.attr("fill", function(d){
					return d.value < 0 ? "maroon":"steelblue"
					})
				.transition()
					.duration(1000)
					.attr("y", function(d){
						return y(d3.max([0, d.value]));
						})
					.attr("height", function(d){
						return Math.abs(y(0) - y(d.value));
						});
		
	var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")
			.ticks(5)
			.innerTickSize(0)
			.outerTickSize(0)
			.tickPadding(-5)
			.tickFormat(function(d){
				return d3.format(",.0f")(d/1000) + "k";
				});
				
	var y2Axis = d3.svg.axis()
					.scale(y_line)
					.orient("right")
					.ticks(5)
					.outerTickSize(0)
					.innerTickSize(0);
	
	var path = svg.append("g")
					.selectAll("path")
					.data(data_t1718)
					.enter()
					.append("path")
					.attr("class", "path")
					.attr("d", line(data_t1718));
	
	svg.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(50,0)")
		.call(yAxis);
		
	svg.append("g")
		.attr("class", "y2 axis")
		.attr("transform", "translate(500,0)")
		.call(y2Axis);

	var label = svg.selectAll(".label")
		.data(data_centered)
		.enter()
		.append("text")
		.attr("x", function(d){
			return x(d.region) + x.rangeBand()/2;
			})
		.attr("y", function(d){
			return y(-max_value) - 10;
			})
		.attr("text-anchor","start")
		.attr("class", "label")
		.text(function(d){return d.region})
		.style("fill", "#aaa");
	
})