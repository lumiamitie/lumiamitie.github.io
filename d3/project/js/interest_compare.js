//레이더차트관련 수정사항은 rada-chart.css 에서 수정
d3.json("data/interest_compare.json", function(raw_data){
	// 키워드와 축 항목에 대해서 그룹화
	var daily_nest = d3.nest()
						.key(function(d){return d.keyword})
						.key(function(d){return d.axis})
						.entries(raw_data.daily);
	
	//각 축별로 값을 합산
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
//test_data = raw_data;
	var fallwidth_scale = d3.scale.linear() //변화폭에 대한 스케일 함수
						.range([0,10]) //표시 범위는 0~10으로 
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
	var count_scale = d3.scale.linear() // 평균빈도에 대한 스케일 함수
					.range([0,10]) //표시 범위는 0~10
					.domain([0,
							d3.max(raw_data.daily //평균빈드의 max값이 10이된다
								.filter(function(d){
									return d.axis ==="평균빈도";
									})
								.map(function(d){
									return d.value;
									})
								)
							]);	
							
	var ratio_scale = d3.scale.linear() //변화율에 대한 스케일 함수
						.range([0,5,10]) //변화율이 1(변하지 않음)이면 5로 출력
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
	var data = daily_nest.map(function(d){ //레이더차트 구성을 위한 데이터
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
										} //위에서 작성한 스케일 함수들 반영
									})).toFixed(2) //소수점 둘째자리까지 출력
								}
							})}
							
						});

	var color = d3.scale.category10(); //기본 색상
	var chart = RadarChart.chart();
	var cfg = chart.config(); // retrieve default config
	var width = cfg.w +380, //차트 사이즈
		height = cfg.h +50;	
	
	var svg = d3.select('body')
				.append('svg')
				  .attr('width', width)
				  .attr('height', height);
	
	svg.append('g')
		.classed('single', 1)
		.datum(data)
		.call(chart);
	
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
	
	//레이더 차트 범례
	var legend = svg.append("g")
					.attr("x", cfg.w / 3)
					.attr("y", 20)
					.attr("class", "legend")
	
	//범례 텍스트
	legend.selectAll("g")
			.data(data.map(function(d){return d.key;}))
			.enter()
			.append("text")
			.attr("x", function(d, i){return 50 + i* 100})
			.attr("y", cfg.h + 30)
			.text(function(d){return d;})
	//범례 사각형
	legend.selectAll("g")
			.data(data.map(function(d){return d.key;}))
			.enter()
			.append("rect")
			.attr("x", function(d, i){return 35 + i* 100})
			.attr("y", cfg.h + 20)
			.attr("width", 10)
			.attr("height", 10)
			.attr("fill", function(d, i){return cfg.color(i)});
	
	//감성차트 데이터		
	var data_sentiment_tidy = d3.nest()
							.key(function(d){return d.keyword;})
							.entries(raw_data.sentiment)
	//차트에 적용할 수 있는 형태로 변경					
	var data_sentiment = data_sentiment_tidy.map(function(d){
								return {
									"keyword":d.key,
									"positive":d.values.filter(function(e){return e.sentiment ==="positive"})[0].value,
									"negative":d.values.filter(function(e){return e.sentiment ==="negative"})[0].value,
									"neutral":d.values.filter(function(e){return e.sentiment ==="neutral"})[0].value
									}
								});

	// 감성막대 세로 범위 지정(개수가 많아지면 넓어져야 함)
	var rangeband = 35 * data_sentiment_tidy.length;						

	// 감성막대 x, y 스케일 함수
	var x = d3.scale.linear()
				.range([0, width/4]),
		y = d3.scale.ordinal()
				.rangeRoundBands([0,rangeband]);
	
	//x, y축 설정
	var yAxis = d3.svg.axis()
				.scale(y)
				.orient("left")
				.tickSize(0);
	var xAxis = d3.svg.axis()
				.scale(x)
				.orient("top")
				.ticks(5)
				.tickSize(0)
				.tickFormat(d3.format("%"));
	
	// x, y 스케일 domain 설정
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
			return {"keyword": d.keyword, //감성값이 없을 때
				"x0": 1,
				"x1": 1,
				"x2": 1,
				"sum": 2
				}
			}
		});
		
	//감성 차트 범례
	var pie_legend = svg.append("g")
					.attr("x", width-250)
					.attr("y", 70)
					.attr("class", "legend");
	//범례 텍스트				
	pie_legend.selectAll("g")
			.data(["긍정", "부정", "중립"])
			.enter()
			.append("text")
			.attr("x", function(d, i){return width-240 + i* 70})
			.attr("y", 108)
			.text(function(d){return d;});
	//범례 사각형
	pie_legend.selectAll("g")
			.data(["긍정", "부정", "중립"])
			.enter()
			.append("rect")
			.attr("x", function(d, i){return width-260 + i* 70})
			.attr("y", 100)
			.attr("width", 10)
			.attr("height", 10)
			.attr("fill", function(d){ //범례 색상
				if (d === "긍정"){
					return "steelblue";
				} else if (d === "부정"){
					return "IndianRed";
				} else {
					return "SandyBrown";
				}
			
			});
	
	//감성 차트
	var rect = svg.selectAll(".stackedRect")
		.data(data_sum)
		.enter()
		.append("g")
		.attr("transform", "translate(" + [width-250, 150]+ ")")
		//차트 전체를 우측으로 이동
		
	rect.append("rect")
		.attr("width", function(d){return x(d.x0/d.sum);})
		.attr("height", function(d){return 25;})
		.attr("x",0)
		.attr("y", function(d){return y(d.keyword)})
		.attr("class", "bar pos")
		.style("fill","steelblue");	
		// 긍정 막대
	
	rect.append("rect")
		.attr("width", function(d){return x(d.x1/d.sum);})
		.attr("height", function(d){return 25;})
		.attr("x",function(d){return x(d.x0/d.sum);})
		.attr("y", function(d){return y(d.keyword)})
		.attr("class", "bar neg")
		.style("fill","IndianRed");
		// 부정 막대

	rect.append("rect")
		.attr("width", function(d){return x(d.x2/d.sum);})
		.attr("height", function(d){return 25;})
		.attr("x",function(d){return x((d.x0 + d.x1)/d.sum);})
		.attr("y", function(d){return y(d.keyword)})
		.attr("class", "bar neu")
		.style("fill","SandyBrown");
		// 중립 막대

	svg.append("g")
		.attr("class","y axis")
		.attr("transform", "translate(" + [width -250, 150]+ ")")
		.call(yAxis);
		//x축 호출
		
	svg.append("g")
		.attr("class","x axis")
		.attr("transform", "translate(" + [width -250, 150]+ ")")
		.call(xAxis);
		//y축 호출
});