var width = 740,//차트 사이즈
	height = 370,
	margin = {top:20, right:30, bottom:70, left:20}, //차트 여백
	parseDate = d3.time.format("%Y%m%d").parse, //날짜 파싱
    returnDate = d3.time.format("%m/%d") //축에 보이는 날짜 포맷
	;
	
var svg = d3.select("div").append("svg") // svg구성
			.attr("width", width)
			.attr("height", height)
			.append("g")
			.attr("transform","translate("+margin.left+","+margin.top+")");

d3.json("data/sentiment_neutral_week.json", function(data) {
	var null_date = data.filter(function(d){return d.sentiment !== "positive" && d.sentiment !=="negative" && d.sentiment !== "neutral"})
						.map(function(d){return d.date});
	if (null_date.length >0){
		for (i=0; i< null_date.length; i++){
			data.push({"date":null_date[i], "sentiment":"positive", "count":0})
			data.push({"date":null_date[i], "sentiment":"negative", "count":0})
			data.push({"date":null_date[i], "sentiment":"neutral", "count":0})
		}
	data.sort(function(a,b){
			if (a.date >b.date) {
				return 1;
			}else if (a.date <b.date){ 
				return -1;
			} else {
			return 0}
		})
	};
	
	var sentiment = d3.nest() //감성별로 그룹화
					.key(function(d){return d.sentiment})
					.entries(data.map(function(d){
						return {"count":d.count, 
								"sentiment":d.sentiment, 
								"date":parseDate(d.date)
								};
							})
						)
					.filter(function(d){ // 긍정/중립/부정인 경우만
						return d.key === "positive" | d.key ==="negative" | d.key === "neutral"});

	// 현재 화면에서 보일지 숨길지 여부					
	var visible = {positive: "inline", negative: "inline", neutral: "inline"}

	drawAxes(data); //축 그리기

	draw(visible); // 차트 그리기
	
	drawTips(data); // 팁 그리기
	
	drawLegend(sentiment.map(function(d){return d.key})); //범례 그리기
	// 범례

	function removeChart(){
			d3.selectAll(".axis").remove();		//차트화면 제거
			d3.selectAll(".area").remove();
			d3.selectAll(".line").remove();
			d3.selectAll(".tips").remove();
	};
	
	function draw(visible){ // 차트그리기 함수
		if (visible.positive === "inline"){
			drawArea(sentiment.filter(function(d){return d.key === "positive"})[0].values,"pos","monotone");
		};
		if (visible.negative === "inline"){
			drawArea(sentiment.filter(function(d){return d.key === "negative"})[0].values, "neg","monotone");
		};
		if (visible.neutral === "inline"){
			drawLine(sentiment.filter(function(d){return d.key === "neutral"})[0].values, "neu", "monotone");
		}
	}
	
	function drawTips(dataSet, type){
		var data = dataSet.filter(function(d){
				return d.sentiment === "positive" |  d.sentiment === "negative" | d.sentiment === "neutral" ;
			});
		if (visible.positive === "none"){
			data = data.filter(function(d){return d.sentiment !== "positive"});
		};
		if (visible.negative === "none"){
			data = data.filter(function(d){return d.sentiment !== "negative"});
		};
		if (visible.neutral === "none"){
			data = data.filter(function(d){return d.sentiment !== "neutral"});
		};
		
		if (type === "area"){
			data.forEach(function(d){
				d.count = Math.abs(d.count);
			})
		} else if(type === "std"){
			data.forEach(function(d){
							if (d.sentiment === "negative"){
								d.count = -Math.abs(d.count);
							}
						})
		}
		var tooltip = d3.select("div").append("div")
				.attr("class", "tooltip")
				.style("opacity", 0);

		var tip = svg.append("g")
					.attr("class","tips");

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
			.style("opacity", 0.3)
			.style("border", "0px")
			.attr("class", function(d){return "tip_"+d.key;})
				.on("mouseover", function(d){
					tooltip.transition()
							.duration(200)
							.style("opacity", 0.9);
					tooltip.html(translate_kor(d.sentiment)+"<br/>"+returnDate(parseDate(d.date))+ "<br/>"+Math.abs(d.count))
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
			.attr("r",4.5);	
	}
	
	function drawAxes(data){
		var area_data = data;
			area_data.filter(function(d){
				return d.sentiment === "positive" |  d.sentiment === "negative" | d.sentiment === "neutral" ;
				});
		//data.forEach(function(d){d.count = Math.abs(d.count)});
		if (visible.positive === "none"){
			area_data = area_data.filter(function(d){return d.sentiment !== "positive"});
		};
		if (visible.negative === "none"){
			area_data = area_data.filter(function(d){return d.sentiment !== "negative"});
		};
		if (visible.neutral === "none"){
			area_data = area_data.filter(function(d){return d.sentiment !== "neutral"});
		};

		y = d3.scale.linear()
					.domain(d3.extent(area_data,function(d){
							return d.count;
						})
					)
					.range([height - margin.top - margin.bottom, margin.top]);

		x = d3.time.scale()
					.domain(d3.extent(area_data,function(d){
							return parseDate(d.date);
						})
					)
					.range([margin.left, width - margin.left - margin.right]);
		
		var tick_number = sentiment[0].values.length < 8 ? sentiment[0].values.length  : 7;

		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(" + [0, height - margin.top - margin.bottom] + ")")
			.call(d3.svg.axis()
					.scale(x)
					.tickFormat(returnDate)
					.orient("bottom")
					.tickPadding(10)
					.ticks(tick_number)
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
						
	function drawLine(dataSet, clsName, intp_type){ //선그리기 함수
		var line_neu = d3.svg.line()
							.x(function(d){return x(d.date)})
							.y(function(d){return y(d.count)})
							.interpolate(intp_type);							;
							
		var lineElements = svg.append("path")
								.attr("class","line "+ clsName)
								.attr("d", line_neu(dataSet));
	}
	
	function drawArea(dataSet, clsName, intp_type){ //면적 그리기 함수
		var area_dataSet = dataSet;
		area_dataSet.forEach(function(d){
							if (d.sentiment === "negative"){
									d.count = Math.abs(d.count)
								}
							});
		var area_default = d3.svg.area() //면적 0 인 시점
						.x(function(d){return x(d.date)})
						.y0(function(d){
							return height-margin.top - margin.bottom;
							})
						.y1(function(d){
							return height-margin.top - margin.bottom;
							})
						.interpolate(intp_type);
		var area = d3.svg.area()
						.x(function(d){
							return x(d.date)
							})
						.y0(function(d){ //색칠될 면적의 아래쪽 좌표
							return height-margin.top - margin.bottom;
							})
						.y1(function(d){ //색칠될 면적의 위쪽 좌표
							return y(d.count)
							})
						.interpolate(intp_type);
						
		var areaElements = svg.append("path") //애니메이션 적용
								.attr("class", "area "+clsName)
								.attr("d", area_default(area_dataSet)) //변하기 전
								.transition()
									.duration(1000)
									.attr("d", area(area_dataSet)); //변한 후
	}
	
	function drawLegend(lg_data){
		var legend = svg.append("g")
				.attr("class", "legend")
				.attr("x", width/3)
				.attr("y", 0)
				.attr("height", 100)
				.attr("width", 100);
		legend.selectAll("g")
			//.data(sentiment.map(function(d){return d.key})) //키워드를 적용
			.data(lg_data)
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
					  .on("click", function(d){ //클릭 이벤트
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
					removeChart(); //차트화면 제거
					drawAxes(data); //다시 그리기
					draw(visible);
					drawTips(data, "area");
				  })
					g.append("text") //범례 텍스트
					  .attr("x", margin.left + i * 100 +15)
					  .attr("y", height - 38)
					  .attr("height", 30)
					  .attr("width", 100)
					  .style("fill", "black")
					  .text(function(d){ //범례 내용 한글로 표기
								if (d === "positive"){
									return "긍정";
								} else if (d === "negative"){
									return "부정";
								} else if (d === "neutral"){
									return "중립";
								}
							});
			});
	};
	function translate_kor(sentiment){
				if (sentiment === "positive"){
					return "긍정";
				} else if (sentiment === "negative"){
					return "부정";
				} else if (sentiment === "neutral"){
					return "중립";
				}
	}
	
	function drawStdAxes(data){
		var stddata = data.filter(function(d){
				return d.sentiment === "positive" | d.sentiment === "negative";
				})

		y = d3.scale.linear()
			.domain([-d3.max(stddata,function(d){return d.count;}),
						d3.max(stddata,function(d){return d.count;})]
			)
			.range([height - margin.top - margin.bottom, margin.top]);		
				
		x = d3.time.scale()
			.domain(d3.extent(stddata,function(d){
					return parseDate(d.date);
				})
			)
			.range([margin.left, width - margin.left - margin.right]);
		var tick_number = sentiment[0].values.length < 8 ? sentiment[0].values.length  : 7;	
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(" + [0, height - margin.top - margin.bottom] + ")")
			.call(d3.svg.axis()
					.scale(x)
					.tickFormat(returnDate)
					.orient("bottom")
					.tickPadding(10)
					.ticks(tick_number)
					.outerTickSize(0)
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
	};
	
	function drawStdArea(dataSet, clsName, intp_type){
		var std_dataSet = dataSet;
		std_dataSet.forEach(function(d){
							if (d.sentiment === "negative"){
									d.count = -Math.abs(d.count)
								}
							});
		var area_default = d3.svg.area() //면적 0 인 시점
						.x(function(d){return x(d.date);})
						.y0(function(d){
							return y(0);
							})
						.y1(function(d){
							return y(0);
							})
						.interpolate(intp_type);
		var area = d3.svg.area()
						.x(function(d){
							return x(d.date);
							})
						.y0(function(d){ //색칠될 면적의 아래쪽 좌표
							return y(0);
							})
						.y1(function(d){ //색칠될 면적의 위쪽 좌표
							return y(d.count);
							})
						.interpolate(intp_type);
						
		var areaElements = svg.append("path") //애니메이션 적용
								.attr("class", "area "+clsName)
								.attr("d", area_default(std_dataSet)) //변하기 전
								.transition()
									.duration(1000)
									.attr("d", area(std_dataSet)); //변한 후
	};
	function drawStd(){
		drawStdArea(sentiment.filter(function(d){return d.key === "positive"})[0].values,"pos","monotone");

		drawStdArea(sentiment.filter(function(d){return d.key === "negative"})[0].values, "neg","monotone");
	};
	function drawStdTips(){
		
	};
	function drawStdLeg(lg_data){
		var legend = svg.append("g")
				.attr("class", "legend")
				.attr("x", width/3)
				.attr("y", 0)
				.attr("height", 100)
				.attr("width", 100);
		legend.selectAll("g")
			.data(lg_data)
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
								}
						});
					g.append("text") //범례 텍스트
					  .attr("x", margin.left + i * 100 +15)
					  .attr("y", height - 38)
					  .attr("height", 30)
					  .attr("width", 100)
					  .style("fill", "black")
					  .text(function(d){ //범례 내용 한글로 표기
								if (d === "positive"){
									return "긍정";
								} else if (d === "negative"){
									return "부정";
								}
							});
			});
	};
	//버튼 이벤트
	d3.select("#area")
		.on("click", function(){
			removeChart();
			d3.selectAll(".legend").remove();
			visible = {positive: "inline", 
						negative: "inline", 
						neutral: "inline"
						};
			drawAxes(data); //축 그리기

			draw(visible); // 차트 그리기
			
			drawTips(data, "area");
			drawLegend(["positive","negative","neutral"]);
			//drawLegend(sentiment.map(function(d){return d.key}));
		})
	
	d3.select("#stacked")
		.on("click", function(){
			removeChart();
			d3.selectAll(".legend").remove();
			visible = {positive: "inline", 
						negative: "inline", 
						neutral: "none"
						};
			drawStdAxes(data);
			drawStd();
			drawStdLeg(["positive", "negative"])
			drawTips(data.filter(function(d){return d.sentiment ==="positive" | d.sentiment === "negative"}), "std")
		})
});
