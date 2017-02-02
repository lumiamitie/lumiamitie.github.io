---
layout: post
published: true
title: Grouped Bar chart
mathjax: false
featured: false
comments: true
headline: How to make grouped bar chart with D3
categories: D3
tags: D3
---

![cover-image](/images/old-book.jpg)

# Grouped bar chart

<http://bl.ocks.org/mbostock/3887051>를 보고 수정하면서 알게 된 내용을 정리하려고 한다.

위 예제에서는 x축의 scale함수를 **그룹에 대한 scale**과 **그룹 내에서 막대의 위치**에 대한 scale 두 개로 나누어서 막대를 배치하는 방식으로 구성했다. 여기서는 D3를 이용해서 기본적인 막대그래프를 만드는 방법은 알고 있다고 가정하고 기본적인 내용에 대해서는 넘어갈 것이다. 

<br />

---
D3를 이용해서 막대그래프를 구성할 수 있다면 일반 막대그래프와 그룹 막대그래프의 차이는 scale 함수의 구성이 일부 달라진다는 것 뿐이다. 

일반적인 막대 그래프이 다음과 같이 구성되어 있다고 생각해보자

```
x_scale
y_scale

막대의 x축 위치 : x_scale(data.x)
막대의 높이 : height - y_scale(data.value)
```

x축의 항목이 ordinal(명목형) 변수일 때 `x_scale` 함수는 해당 변수에 맞는 x축 위치를 제공한다

그림으로 표현하면 아래와 같다

![](/images/post_image/grouped_bar/grouped_bar01.PNG)

x_scale의 결과물이 반환하는 좌표값은 각 막대의 왼쪽 끝에 해당하는 x좌표가 된다

<br />

---

반면에 그룹별로 막대그래프를 만들 때에는 x축에 대한 scale 함수가 두 개 필요해진다. 우선 그룹에 맞는 위치를 찾아야하고, 그룹 내에서 막대의 위치를 잡아주어야 한다. 따라서 `x_scale` 함수도 그룹에 대한 함수와 세부적인 위치에 대한 함수를 따로 생성해야 한다

```
x_scale_group
x_scale_bar
y_scale
막대의 x축 위치 : x_scale_group(data.group) + x_scale_bar(data.bar)
막대의 높이 : height - y_scale(data.value)
```

그림으로 표현한다면 아래와 같다

![](/images/post_image/grouped_bar/grouped_bar02.PNG)

먼저, group의 값에 따라서 `x_scale_group` 함수가 해당 그룹의 x 좌표를 반환한다. 화살표의 끝이 각 그룹의 왼쪽 맨 끝을 향하고 있는 것을 볼 수 있다. `x_scale_group` 함수는 각 그룹을 하나의 커다란 막대로 생각하여 값을 반환한다. 따라서 여기서 결정되는 가상의 막대 너비(그룹의 범위)는 곧 `x_scale_bar` 함수의 range를 결정하는 값이 된다. 

![](/images/post_image/grouped_bar/grouped_bar03.PNG)

두 번째 그룹의 막대들을 대상으로 막대의 위치를 결정한다고 하면, `x_scale_bar` 함수가 반환하는 값은 해당 그룹의 범위 내에서 막대가 위치해야 하는 지점의 좌표를 반환한다. 실제로 막대를 원하는 위치에 놓기 위해서는 `x_scale_group` 의 결과물과 `x_scale_bar` 의 결과물을 합하면 원하는 x좌표를 얻을 수 있게 된다

---

<br />

이제 나머지 과정은 일반적인 막대그래프를 만드는 과정과 같다. 따라서 html, css, js, json 파일의 내용과 완성된 결과물로 마무리하려고 한다. 아래 내용을 실습하려면 웹서버 환경이 필요하기 때문에 익숙하지 않다면 <https://github.com/mbostock/d3/wiki#using>의 내용을 참고해서 진행하면 된다. 크롬 확장프로그램에도 간단한 web server가 있으니 다른 언어를 설치하는 과정이 번거롭다면 참고할 수 있다. 

---

<br />

### grouped_bar.html
```html
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<script src="//d3js.org/d3.v3.min.js" charset="utf-8"></script>
	<link rel="stylesheet" type="text/css" href="grouped_bar.css">
	<title>grouped bar chart</title>
</head>
<body>
	<div id = "chart"></div>
	<script src = "grouped_bar.js"></script>
</body>
</html>
```

### grouped_bar.css
```css
.pos {
 	fill: #1f4e79;
}

.neg {
	fill: #e51843;
}

.neu {
	fill: #73ad21;
}

.y g.tick:first-child line {
	display: none;
}

.y line {
	stroke: #ccc;
}
```
### grouped_bar.json
```json
[{"group":"그룹1","sentiment":"긍정","value":34},
{"group":"그룹2","sentiment":"긍정","value":75},
{"group":"그룹3","sentiment":"긍정","value":51},
{"group":"그룹1","sentiment":"부정","value":76},
{"group":"그룹2","sentiment":"부정","value":59},
{"group":"그룹3","sentiment":"부정","value":79},
{"group":"그룹1","sentiment":"중립","value":25},
{"group":"그룹2","sentiment":"중립","value":94},
{"group":"그룹3","sentiment":"중립","value":98}] 
```

### grouped_bar.js
```javascript
//grouped bar chart

// 차트의 크기
var chart_size = {
	width : 600,
	height : 400
}

// margin 설정
var margin = {
	top : 50,
	bot : 50,
	right : 10,
	left : 30
}

// svg 생성
// id = "chart" 인 div 태그의 하위 element로 svg 생성
// 차트의 크기에다 margin값을 더해서 svg 전체의 면적을 결정한다
// x축은 margin.left, y축은 margin.top만큼 평행이동 시켜서 이후의 차트는 margin값과 상관없이 그릴 수 있도록 한다
var svg = d3.select('#chart')
		.append('svg')
		.attr("width", chart_size.width + margin.right + margin.left)
		.attr("height", chart_size.height + margin.top + margin.bot)
		.attr("transform", "translate("+margin.left+","+margin.top+")");

// 각 그룹의 위치를 결정하는 scale 함수
var x_scale_group = d3.scale.ordinal()
					.rangeRoundBands([0, chart_size.width], 0.1);

// 그룹 내에서 막대의 위치를 결정하는 scale 함수
var x_scale_bar = d3.scale.ordinal();

// 막대의 높이를 결정하는 scale 함수
// y축의 값이 위에는 높은값, 아래에는 0이 있어야 한다. 그렇기 때문에 range에 들어가는 배열에서 값의 순서가 바뀐다
var y_scale = d3.scale.linear()
				.range([chart_size.height, 0]);

// x축을 생성하는 함수
var xAxis = d3.svg.axis()
				.scale(x_scale_group)
				.orient("bottom")
				.outerTickSize(1);

// y축을 생성하는 함수
// 막대 뒤에 선을 표시하기 위해서 innerTickSize에 -chart_size.width 값을 부여한다
// 원래는 y축 눈금을 만드는 함수인데 -값을 주면 반대방향(차트 안쪽)으로 눈금이 길어진다
var yAxis = d3.svg.axis()
				.scale(y_scale)
				.orient("left")
				.outerTickSize(0)
				.innerTickSize(-chart_size.width)
				.ticks(5);

// json 파일을 불러온다
// 외부 파일을 불러오기 때문에 웹서버 환경에서만 실행 가능해진다
d3.json("grouped_bar.json", function(error, data){
	if(error) throw error;

	// data를 group 값을 기준으로 그룹 지정한다
	var nested = d3.nest()
			.key(function(d){return d.group})
			.entries(data)

	
	// 그룹명(json 데이터에서 group 값)만 추출한다
	var group_name = nested.map(function(d){return d.key});

	// x_scale_group의 domain에 group_name 변수를 지정한다
	// 그룹 수에 맞게 막대 그룹 개수 설정
	x_scale_group.domain(group_name);

	// x_scale_bar의 domain에 각 막대에 해당하는 값을 넣는다
	// x_scale_group처럼 배열에서 값을 추출해서 쓰는 것이 더 좋다
	// rangeRoundBands([interval], padding)의 형태로 사용했다
	// padding의 값은 0과 1 사이의 값이 들어가는데 0.5일 때 막대의 너비와 막대 사이의 간격이 같아진다
	x_scale_bar.domain(["긍정", "부정", "중립"])
			   .rangeRoundBands([0, x_scale_group.rangeBand()], 0.1);

	// y_scale의 domain 범위를 지정한다
	// 막대 그래프의 아래쪽 눈금은 0부터 시작하는 것이 바람직하기 때문에 배열의 첫 번째 값은 0으로 한다
	// 두 번째 값은 data의 value 값중에서 가장 큰 값을 찾고 그 값에서 임의의 값(여기서는 10)을 더해서 그래프 상단의 공간이 여유가 있도록 한다
	y_scale.domain([0, d3.max(data.map(function(d){
				return +d.value + 10; }))
			]);

	// x축을 생성한다
	// 그냥 만들면 (0,0) 위치 (화면 좌측 상단)에 생기기 때문에 margin.left 만큼 x축을 이동시키고 차트의 높이만큼 아래로 내려준다
	svg.append("g")
		.attr("class", "x Axis")
		.attr("transform", "translate("+ margin.left +","+ chart_size.height +")")
		.call(xAxis);

	// y축을 생성한다
	// margin.left만큼 우측으로 평행이동 시킨다
	svg.append("g")
		.attr("class", "y Axis")
		.attr("transform", "translate("+ margin.left +","+ 0 +")")
		.call(yAxis);

	// 막대를 생성하기 위해서 data를 연결한다
	var bars = d3.select("svg")
				.append("g")
				.selectAll(".bar")
				.data(data);

	// 새로 생성되는 부분(enter)에 대한 코드
	// 막대의 x축 위치는 x_scale_group으로 생성되는 그룹 위치와 x_scale_bar로 생성되는 막대 위치를 더하고 margin.left를 더한다
	// 막대의 y축 위치(막대가 시작되는 좌표)는 일반 막대그래프와 마찬가지로 value값을 y_scale로 변형시키면 된다
	// width의 값은 x_scale_bar.rangeBand()값을 그래도 사용한다
	// 막대의 높이는 y_scale(d.value)부터 시작해서 y축의 0 위치까지 와야 한다. 
	// 따라서 막대가 시작되는 지점의 y좌표와 막대의 길이를 더하면 차트의 높이가 되어야 한다
	// y의 값이 y_scale(d.value) 이니까 height값은 chart_size.height - y_scale(d.value)
	// sentiment에 해당하는 값에 따라서 막대의 색을 다르게 하기 위해 class 항목을 지정하고 해당하는 색상은 css에서 명시한다
	bars.enter()
		.append("rect")
		.attr("x", function(d){ 
			return margin.left + 
				x_scale_group(d.group) + 
				x_scale_bar(d.sentiment); 
			})
		.attr("y", function(d){ return  y_scale(d.value)})
		.attr("width", function(d){ return x_scale_bar.rangeBand(); })
		.attr("height", function(d){ return chart_size.height - y_scale(d.value); })
		.attr("class", function(d){ 
			class_list = {"긍정": "pos", "부정": "neg", "중립":"neu"}
			return class_list[d.sentiment]});

})

```

### Chart (image)

![](/images/post_image/grouped_bar/grouped_bar04.PNG)