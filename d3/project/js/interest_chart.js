var margin = {top: 20, right: 80, bottom: 60, left: 50}, //차트 여백
	width = 760 /* - margin.left - margin.right */, //차트 사이즈
	height = 800 /* - margin.top - margin.bottom */,
	radius = 200;

var parseDate = d3.time.format("%Y%m%d").parse, //날짜 파싱 함수
	returnDate = d3.time.format("%m/%d"); //축에 들어갈 날짜 포맷

var color = d3.scale.category10(); //색상 함수

var outer_arc = d3.svg.arc() //바깥쪽 파이차트
			.outerRadius(radius - 10) //바깥구간 반지름
			.innerRadius(radius/2); //안쪽구간 반지름
			
var inner_arc = d3.svg.arc() //안쪽 파이차트
			.outerRadius(radius/2-1)
			.innerRadius(radius/4);
			
var pie = d3.layout.pie() //파이 레이아웃
			.value(function(d){return d.value;}) //각도로 변환할 데이터 지정
			.sort(null);
			
var x = d3.time.scale() //선그래프에서 x축 시간에 대한 scale
				.range([0, width-margin.right-margin.left]);
						
var y = d3.scale.linear() //선그래프에서 y축 값에대한 scale
				.range([height/3, 0]);
						
var svg_line = d3.select("div") // 선차트 부분
			 .append("svg")
				.attr("width", width)
				.attr("height", height)
			 .append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
			.attr("class","line");

var xAxis = d3.svg.axis() //x축 불러오기
					.scale(x)
					.orient("bottom")
//					.innerTickSize(-height)
					.outerTickSize(0)
					.ticks(5)
					.tickFormat(returnDate)
					.tickPadding(10);
					
var yAxis = d3.svg.axis() //y축 불러오기
					.scale(y)
					.orient("left")
					.innerTickSize(-width + margin.left + margin.right)
					.ticks(5)
					.outerTickSize(0)
					.tickPadding(10);
	
var line = d3.svg.line() // 선그리기 함수
					.interpolate("monotone") // 점과 점을 잇는 방식 결정 
					.x(function(d) { return x(d.date); }) //x축 값
					.y(function(d) { return y(d.count); }); //y축 값
//var test_data = [];
//var test_keywords = [];

d3.json("data/interest_skewed.json", function(error, raw_data) { 

	var nest_data_pie = d3.nest() //키워드와 채널을 기준으로 그룹화
						.key(function(d){return d.key})
						.key(function(d){return d.channel})
						.entries(raw_data);
	var pie_data=[];
	
	// 채널별 건수 데이터 구성
	// 이렇게 안하고 d3.nest() 함수의 rollup 기능 이용하는 것이 더 좋을 듯
	for (i=0; i< nest_data_pie.length; i++){
		for(j=0; j< nest_data_pie[i].values.length; j++){
		pie_data.push({"keyword": nest_data_pie[i].key, 
				"channel": nest_data_pie[i].values[j].key, 
				"value":d3.sum(nest_data_pie[i].values[j].values.map(function(d){return d.count})
					)}
			);
		}
	}			
	
	// 채널 이름을 기준으로 sort
	pie_data.sort(function(a,b){
		if (a.channel < b.channel) {
				return -1
			} else {
				return 1
			} 
		});
	
	// pie_data를 채널을 기준으로 그룹화
	var data_chn = d3.nest()
					.key(function(d){return d.channel})
					.entries(pie_data);
	// 채널 이름을 기준으로 sort				
	data_chn.sort(function(a,b){
		if (a.key < b.key) {
				return -1
			} else {
				return 1
			} 
		});
	
	// 채널별로 값을 합산
	var data_chn_sum = data_chn.map(function(d){
				return {"channel": d.key,
						"value": d3.sum(d.values.map(function(e){
							return e.value;
						}))
					}
				})
	//파이차트가 들어갈 구간 지정
	var svg = d3.select("svg")	
				.attr("width", width)
				.attr("height", height)
				.append("g")
				.attr("transform", "translate("+[width/2, height-radius-10]+")")
				.attr("class","pie")
				;
	//바깥쪽 파이차트 구성
	var outer_g = svg.selectAll(".outer")
				.data(pie(pie_data))
				.enter()
				.append("g")
				.attr("class", "outer arc");
				
	outer_g.append("path")
		.attr("d", outer_arc) 
		.style("fill", function(d, i){ //색상 지정
			return d3.rgb(color(d.data.channel)) //data가 맞나 pie_data가 맞나
						.darker((i % 2)/7)
						.toString();
			})
		.on("mouseover",function(d){ //마우스오버 이벤트
				tooltip.transition()
						.duration(200)
						.style("opacity", 0.9);
				tooltip.html(d.data.keyword+"<br/>"+d.data.channel+"<br/>"+d.value)
						.style("left", (d3.event.pageX) + "px")
						.style("top", (d3.event.pageY - 28) + "px");
			})
		.on("mouseout", function(d){ //마우스 벗어날때 이벤트
				tooltip.transition()
						.duration(500)
						.style("opacity", 0);
			});

	outer_g.append("text") //바깥쪽 파이 텍스트
			.attr("transform", function(d){
				return "translate("+ outer_arc.centroid(d)+")";
				//centroid는 도형의 무게중심좌표(한가운데)를 리턴함
				})
			.text(function(d){
				if (d.endAngle - d.startAngle > 0.2){ 
				//각도가 너무 작으면 텍스트가 보이지 않도록 설정
					return d.data.keyword;
					}
				})
			.attr("text-anchor","middle")
			.style("font-size", "12px");
	
	// 안쪽 파이차트 구성
	var inner_g = svg.selectAll(".inner")
					.data(pie(data_chn_sum))
					.enter()
					.append("g")
					.attr("class", "inner arc");
					
	inner_g.append("path")
		.attr("d",inner_arc)
		.style("fill", function(d, i){ //안쪽 파이차트 색상
			return d3.rgb(color(d.data.channel))
						.brighter(1/3)
						.toString();
			});

	inner_g.append("text") //안쪽 파이차트 텍스트 
			.attr("transform", function(d){
				return "translate("+ inner_arc.centroid(d)+")";
				// 좌표는 각 도형의 무게중심으로
				})
			.text(function(d){return d.data.channel})
			.attr("text-anchor","middle"); 
			//좌표를 기준으로 텍스트 가운데 정렬
	
	// 데이터를 날짜와 키워드를 기준으로 그룹화
	var nest_data = d3.nest()
						.key(function(d){return d.key})
						.key(function(d){return d.date})
						.entries(raw_data)

	var line_data=[];
	
	//날짜별 키워드별로 데이터 합산
	//이것도 d3.nest()의 rollup기능 적용하는 것이 나을 듯
	for (i=0; i< nest_data.length; i++){
		for(j=0; j< nest_data[i].values.length; j++){
		line_data.push({"key": nest_data[i].key, 
				"date": nest_data[i].values[j].key, 
				"count":d3.sum(nest_data[i].values[j].values.map(function(d){return d.count})
					)}
			);
		}
	}
	
	// 선 그래프에서 색상에 대한 domain 지정
	// 안해도 될 것 같음
		color.domain(d3.keys(line_data[0])
			.filter(function(key) { 
				return key !== "date"; 
			})
		);
		
		// 날짜 파싱
		  line_data.forEach(function(d) {
				d.date = parseDate(d.date);
		  });
			
		// 키워드를 기준으로 그룹화
		  keywords = d3.nest()
						.key(function(d){return d.key})
						.entries(line_data);

		//x, y축의 domain 구성
		  x.domain(d3.extent(line_data, function(d) { return d.date; }));
		  y.domain([ //각 키워드별로 max값과 min값을 기준으로 y축 구성
				d3.max([0, d3.min(keywords, function(c) { 
					return d3.min(c.values, function(v) { return v.count; }); }) - 10]),
				d3.max(keywords, function(c) { 
					return d3.max(c.values, function(v) { return v.count + 10; }); 
				})
		  ]);
		  
		  svg_line.append("g") //x축 불러오기
				  .attr("class", "x axis")
				  .attr("transform", "translate(0," + (height/3 - 0) + ")")
				  .call(xAxis);
				  
		  svg_line.append("g") //y축 불러오기
				  .attr("class", "y axis")
				  .call(yAxis);

		  var keyword = svg_line.selectAll(".keyword")
								.data(keywords)
								.enter()
								.append("g")
								.attr("class", function(d, i){
									return "keyword_" + d.key
									});
		   
			keyword.append("path") //그래프에 선 그리기
						  .attr("class", "line")
						  .attr("id", function(d, i){ return "line_" + d.key})
						  .attr("d", function(d) {return line(d.values); })
						  .style("fill", "none")
						  .style("stroke", function(d) { return color(d.key); });
			
		  var legend = svg_line.append("g") //범례 추가
			  .attr("class", "legend")
			  .attr("x", width/3) //범례 구간지정
			  .attr("y", -20)
			  .attr("height", 100)
			  .attr("width", 100);    
			
			legend.selectAll('g')
			.data(keywords) //범례에 들어갈 데이터 반영
			  .enter()
			  .append('g')
			  .each(function(d, i) {
					var g = d3.select(this);
						g.append("rect")
						  .attr("x", i*120) //범례의 사각형 x축 좌표
						  .attr("y", height/3 + 51)// 범례 사각형 y축 좌표
						  .attr("width", 10) //사각형 너비
						  .attr("height", 10) //사각형 높이
						  .style("fill", function(){ //사각형 색(선과 동일)
											return color(d.key)})
						  .on("click", function(d){ //클릭시 이벤트
						  //리스크모니터링 등 선그래프와 동일
						if (d3.select("#line_" + d.key).style("display") == "inline"){
						  d3.select("#line_" + d.key)
								.style('display','none');
						  d3.selectAll(".tip_" + d.key)
							.style('display', 'none');
						  g.select("rect")
								.style("opacity", 0.3);
						} else {
						   d3.select("#line_" + d.key)
								.style('display', 'inline');
						   d3.selectAll('.tip_'+d.key)
								.style('display', 'inline');
						   g.select("rect")
								.style("opacity", 1);
						}
					  });
						g.append("text") //범례 텍스트
						  .attr("x", (i) * 120 + 15)
						  .attr("y", height/3 + 60)
						  .attr("height", 30)
						  .attr("width", 100)
						  .style("fill", "black")
						  .text(function(){
									return d.key;
							});
				});

	//툴팁부분은 다른차트들과 내용 동일함
	//툴팁 구성해놓고 html 파일에서 css 수정을 통해 모양 등을 수정함
	//다른 차트에 적욯할때는 data()부분과 tooltip.html 부분을 위주로 수정
	var tooltip = d3.select("div").append("div") 
			.attr("class", "tooltip")
			.style("opacity", 0);

	var tip = svg_line.append("g")
					.attr("class","tips");

	tip.selectAll(".tips") //차트의 팁(동그라미) 부분 
		.data(line_data)
		.enter()
		.append("circle")
		.attr("cx",function(d){return x(d.date)})
		.attr("cy", function(d){return y(d.count)})
		.attr("r",4) //원 반지름
		.style("fill","white") //원 내부 색
		.attr("stroke",function(d){return color(d.key)}) //원 둘레 색
		.attr("stroke-width", "2px") //원 둘레 선 두께
		.attr("class", function(d){return "tip_"+d.key;})
			.on("mouseover", function(d){
				tooltip.transition()
						.duration(200)
						.style("opacity", 0.9);
				tooltip.html(d.key+"<br/>"+returnDate(d.date)+ "<br/>"+d.count)
						.style("left", (d3.event.pageX) + "px")
						.style("top", (d3.event.pageY - 28) + "px");			
			})
			.on("mouseout", function(d){
				tooltip.transition()
						.duration(500)
						.style("opacity", 0);
			});
	  
});
