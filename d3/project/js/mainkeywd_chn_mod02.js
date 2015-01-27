var width = 560, //차트 너비
    height = 300, //차트 높이
    p = [20, 50, 20, 20], //차트 여백
	z = d3.scale.category10(), //색깔
    parseDate = d3.time.format("%Y%m%d").parse, //날짜 파싱
    returnDate = d3.time.format("%m/%d"), //차트용 날짜 포맷
	channel_list = ["news", "blog", "community", "voc", "twitter", "reply"], 
	start_point = [p[1], height - 70] //(0,0)좌표 이동; 

var x = d3.scale.ordinal() //명목형 변수에 대한 스케일 지정
			.rangeRoundBands([p[1], width - p[1] - p[3]]),
	y = d3.scale.linear() //연속형 변수에 대한 스케일 지정(선형변환)
			.range([start_point[1] - p[0], 0]);
	
var stack = d3.layout.stack() //stack layout 적용 -> 값들을 각도로 변환
				.values(function(d){return d.y});

var svg = d3.select("div").append("svg") //svg 구성
    .attr("width", width)
    .attr("height", height);

d3.json("data/mainkeywd_chn_month.json", function(keyword) {

	var visible = {news: "inline", blog: "inline", community: "inline",
					voc: "inline", twitter:"inline", reply:"inline"}
	// 각 채널별로 현재 차트에서 보이는지 안보이는지 설정 체크

	var keywords = d3.nest()
				.key(function(d){return d.channel;})
				.entries(keyword)
	// 채널을 기준으로 nest 적용

	var channels = setKeywd(keywords);

	setAxis(channels);

	var channel = svg.append("g")
					 .attr("class", "bar");
		
	drawRect(channels);	

	var legend = svg.append("g") //범례 생성
	  .attr("class", "legend")
	  .attr("x", width/3)
	  .attr("y", height - p[0] - p[2])
	  .attr("height", 100)
	  .attr("width", 100);    
	
	legend.selectAll('g').data(channel_list) 
      .enter()
      .append('g')
      .each(function(d, i) { //각각의 채널마다 적용
		var g = d3.select(this);
			g.append("rect")
			  .attr("x", p[1] + i*80)
			  .attr("y", height - p[0] - p[2] + 10)
			  .attr("width", 10)
			  .attr("height", 10)
			  .style("fill", function(i){ // 범례 사각형 색깔지정
						return d3.rgb(z(i)).brighter(); //원래 색보다 더 밝게
						})
			  .on("click", function(d,i){ //범례 클릭하면 차트를 다시 구성
				if(visible[d] === "inline"){ // 현재 보이고 있는 차트를 클릭하면
					visible[d] = "none"; //visible항목을 "none"으로 체크하고
					svg.selectAll(".bar").remove(); //막대를 전부 없앰
					svg.selectAll(".axis").remove(); //축도 전부 없앰
					setAxis(setKeywd(keywords)); // 축설정을 다시하고
					drawRect(setKeywd(keywords)); // 막대를 다시 그림
					g.select("rect").style("opacity",0.3); //범례색상을 투명하게
				} else {
					visible[d] = "inline" //visible 항목을 "inline"으로 변경
					svg.selectAll(".bar").remove(); 
					svg.selectAll(".axis").remove();
					setAxis(setKeywd(keywords));
					drawRect(setKeywd(keywords));
					g.select("rect").style("opacity",1);
				}
			  });
        
        g.append("text")
          .attr("x", p[1] + i*80 + 15)
          .attr("y", height - p[0] - p[2] + 19)
          .attr("height",30)
          .attr("width",100)
          .style("fill", "black")
		  .style("font-size", "12px")
          .text(function(d){return translate_kor(d)})
          ;
	});
	function setKeywd(keywords){
		// visible 항목이 "none"인 데이터를 빼는과정
		if (visible.news === "none"){ 
			keywords = keywords.filter(function(d){return d.key !== "news"})
		};
		if (visible.blog === "none"){
			keywords = keywords.filter(function(d){return d.key !== "blog"})
		};
		if (visible.community === "none"){
			keywords = keywords.filter(function(d){return d.key !== "community"})
		};
		if (visible.voc === "none"){
			keywords = keywords.filter(function(d){return d.key !== "voc"})
		};
		if (visible.twitter === "none"){
			keywords = keywords.filter(function(d){return d.key !== "twitter"})
		};
		if (visible.reply === "none"){
			keywords = keywords.filter(function(d){return d.key !== "reply"})
		};
		
		// 남아있는 데이터로 날짜를 파싱한다
		var keywords_parsed = keywords.map(function(d){
			return d.values.map(function(e){
				return {x:parseDate(e.date),y:e.count, chnl:e.channel}
				})
			});
		return d3.layout.stack()(keywords_parsed); //누적막대로 구성
	}
	function setAxis(channels){
		// x, y의 domain 설정
		x.domain(channels[0].map(function(d) { 
						return returnDate(d.x); 
					})
				)
		y.domain([0, d3.max(channels[channels.length - 1], function(d) { 
					return d.y0 + d.y; //y0는 각 누적막대의 아래 좌표
				})						//y는 각 누적막대의 위쪽 좌표
			]);
		xAxis = d3.svg.axis() //x축 구성
				.scale(x)
				.orient("bottom") //축 기준으로 눈금 텍스트는 아래에 위치
				.outerTickSize(0) // 축 선 없애버림
				.tickPadding(5); // 축과 눈금텍스트 사이의 간격
					
		yAxis = d3.svg.axis() //y축 구성
				.scale(y)
				.orient("left")
				.innerTickSize((-width + 2 * p[1])) // 수평선
				.ticks(5) //눈금은 5개
				.outerTickSize(0)
				.tickPadding(10);
				
		// 날짜가 20일 이상으로 길어지면 5일 단위로 눈금이 표시되도록
		if (channels[0].length > 20){
			xAxis.tickFormat(function(d, i){
					return i % 5 !== 0 ? null : d;
				});
		}else {
			xAxis.ticks(5)
		}
			svg.append("g") // x축이 막대 밑으로 내려가도록 평행 이동
		  .attr("class", "x axis")
		  .attr("transform", "translate(0," + start_point[1] + ")")
		  .call(xAxis);
		  
	svg.append("g")
		  .attr("class", "y axis")
		  .attr("transform", 
			"translate(" + start_point[0] +"," + (start_point[1]-y(0))+")"
		  )
		  .call(yAxis);
	}
	function drawRect(channels){
		var channel = svg.append("g")
						 .attr("class", "bar");
		
		// Tooltip이 들어갈 div 구성
		var tooltip = d3.select("div")
						.append("div")
						.attr("class", "tooltip")
						.style("opacity", 0);	 
						
		var rect = channel.selectAll("g") // 누적막대 구성
		  .data(d3.merge(channels))
		.enter().append("rect")
		  .attr("x", function(d) { return x(returnDate(d.x)); })
			.attr("y", function(d) { return y(d.y + d.y0); })
			.attr("height", function(d){return 0})
			.attr("width", x.rangeBand()-2) // x.rangeBand()는 여유가 남지 않을 막대너비를 반환함
			.attr("class", function(d){ return "bar_" + d.chnl; })
			.attr("transform", 
				"translate(0," + (start_point[1]-y(0))+")"
			  )
		 .style("fill", function(d){ return d3.rgb(z(d.chnl)).brighter();})
			.on("mouseover", function(d){ // 마우스오버시 Tooltip 등장 이벤트
				tooltip.transition()
						.duration(200)
						.style("opacity", 0.9);
				tooltip.html(returnDate(d.x)+"<br/>"+translate_kor(d.chnl)+"<br/>"+ d.y)
						.style("left", (d3.event.pageX) + "px")
						.style("top", (d3.event.pageY - 28) + "px");			
			})
			.on("mouseout", function(d){ //마우스오버가 끝났을 때 Tooltip 사라짐
				tooltip.transition() //변화(애니메이션) 시작
						.duration(500) // 사라지는데 걸리는 시간
						.style("opacity", 0);
			})
			.transition() // 막대가 아래에서부터 위로 차오르는 느낌을 주도록
			.duration(500)
			.attr("height", function(d) { return y(d.y0) - y(d.y+d.y0); });	
	}
	function translate_kor(data){ //항목 이름을 한글로 변경하기
		if (data === "news"){
			return "뉴스";
		} else if (data === "blog"){
			return "블로그";
		} else if (data === "community"){
			return "커뮤니티";
		} else if (data === "voc"){
			return "VOC";
		} else if (data === "twitter"){
			return "트위터";
		} else if (data === "reply"){
			return "댓글";
		}
	}
});
