//기본적인 구성은 주제분석과 비슷하므로 참고
var width = 740,
	height = 370;

var node_size = d3.scale.linear()
					.range([6,18]);
					
var node_color = d3.scale.category10();

var node_distance = d3.scale.linear()
								.range([10, 250]);

var link_opacity = d3.scale.linear()
							.range([0.1, 1]);

							
d3.json("data/influencer.json",function(data){

	var nodes = data.influencer;
	node_channel = {"name":data.channel,
								"sentiment":"n",
								"fixed":true,
								"x":width/2, 
								"y":height/2};
	nodes.push(node_channel);
	nodes.reverse();
	
	var links = [];
	for (i = 0; i < (nodes.length - 1) ; i++){ 
		links[i] = {"source":0, "target": i+1};
	};//가운데에 들어가는 채널은 강제로 만들어서 다른 항목들과 전부 연결시킴
	
	var force = d3.layout.force()
		.nodes(d3.values(nodes))
		.links(links)
		.size([width, height])
		.linkDistance(150)
		.friction(0.5)
		.charge(-800)
		.gravity(0.2)
		.on("tick", tick)
		.start();
		
	d3.select(".chn") //그래프가 가운데로 가도록 위치 조정
		.attr("transform", "translate(", width/2, ",", height/2,")")	
		
	var svg = d3.select("div").append("svg")
		.attr("width", width)
		.attr("height", height);
	
	link_opacity.domain(d3.extent(links, function(d){return d.lift}));
	
	var link = svg.selectAll(".link")
		.data(force.links())
	  .enter().append("line")
		.attr("class", "link")
		.style("opacity", 0.7);
				
	var node = svg.selectAll(".node")
		.data(force.nodes())
	  .enter().append("g")
		.attr("class", function(d){
						if (d.sentiment === "n") {
							return "node chn";
						}else {
							return "node";
						}
					})
		.attr("fixed", function(d){ //채널 노드는 움직이지 않도록 고정
				if (d.sentiment ==="n"){
					return 1;
				}	
			})
		.call(force.drag);
			
	node_size.domain([d3.min(nodes, function(d){return d.count}), 
					  d3.max(nodes, function(d){return d.count})]);
	
	node.append("circle")
		.attr("r", function(d, i){
				if (i === 0){
					return 29; //채널 노드는 크게
				} else {
					return node_size(d.count); //나머지는 영향력정도로
				}
			})
/* 		.style("fill", function(d){
				if (d.sentiment === "positive"){
						return "steelblue";
					} else if (d.sentiment === "negative"){
						return "maroon";
					} else {
						return "darkslategray";
					}
			}) */
		.style("fill",default_color) //기본색상(긍정/부정)
		.on("click",click_node) //선택시색상
		;
		
	node.append("text")
		.attr("x",  function(d){if (d.fixed === true){
									return 0;
								} else {
									return 12;
								}								
							})
		.attr("dy", ".4em")
		.attr("text-anchor", function(d){if (d.fixed === true){
									return "middle"; //가운데 정렬
								} else {
									return "start"; //시작점부터 텍스트 시작
								}								
							})
		.text(function(d) { return d.name; })
		.attr("fill", function(d){if (d.fixed === true){
									return "white";
								} else {
									return "black";
								}
							})
		.style("text-transform",function(d){if (d.fixed === true){
									return "uppercase"; // 대문자로 변환
								} 
							});
		
 	function tick() {
		//노드가 화면 밖으로 나가지 않도록 조정
		  link
		  .attr("x1", function(d) { 
			return Math.max(18, Math.min(width - 18, d.source.x)); 
			})
		  .attr("y1", function(d) { 
			return Math.max(18, Math.min(height - 18, d.source.y)); 
			})
		  .attr("x2", function(d) { 
			return Math.max(18, Math.min(width - 18, d.target.x)); 
			})
		  .attr("y2", function(d) { 
			return Math.max(18, Math.min(height - 18, d.target.y)); 
			});
	  node
		  .attr("transform", function(d) { 
				d.x = Math.max(18, Math.min(width - 18, d.x));
				d.y = Math.max(18, Math.min(height - 18, d.y));
				return "translate(" + d.x + "," + d.y + ")"; 
			});
	}
	
	function default_color(d){
		if (d.sentiment === "positive"){
						return "steelblue";
					} else if (d.sentiment === "negative"){
						return "maroon";
					} else {
						return "darkslategray";
					}
	};
	
	function click_node(d){
		if(d.focused === 1){
			d3.selectAll("circle").style("fill", default_color)
											.style("stroke","white");
			d.focused = 0;
		} else if(d.sentiment !== "n"){
			d3.selectAll("circle").style("fill", default_color)
											.style("stroke","white");
			d3.select(this).style("fill", "LemonChiffon")
									.style("stroke", "black");
			d.focused = 1;
		}
	}

});
