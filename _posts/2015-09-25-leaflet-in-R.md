---
layout: post
published: true
title: leaflet in R
mathjax: false
featured: true
comments: true
headline: Making blogging easier for masses
categories: R Visualization
tags: tutorial mapping
---

![cover-image](/images/desk-pen-ruler.jpg)

# leaflet in R

**leaflet**은 인터랙티브한 지도를 구현할 수 있게 해주는 오픈소스 자바스크립트 라이브러리이다

R의 leaflet 패키지는 R에서 데이터를 가지고 쉽게 Leaflet 지도를 생성할 수 있게 해준다

`install.packages('leaflet')`를 통해 해당 패키지를 설치하면 바로 사용할 수 있다

실습을 위한 데이터는 서울 열린 데이터 광장의 [공공 Wifi 위치정보](http://data.seoul.go.kr/openinf/sheetview.jsp?infId=OA-1218&tMenu=11) 데이터 중에서 설치기관이 skt, kt, lgu+인 경우로만 필터링해서 사용했다


```r
# install.packages('leaflet')
library(leaflet)
library(dplyr)
```


```r
# 서울의 위도, 경도 값
seoul_lonlat = unlist(ggmap::geocode('seoul', source='google'))
```


```r
# 서울 열린데이터광장
# http://data.seoul.go.kr/openinf/sheetview.jsp?infId=OA-1218&tMenu=11
wifi_data = read.csv('../dataset/wifi_data.csv', stringsAsFactors = FALSE)
```

### 이 페이지에서는 leaflet이 구동 되지 않습니다 ㅠㅠ
현재 페이지에서 leaflet을 제대로 보이기 힘든 것 같아서 여기에는 지도의 캡쳐로 대신하고 실제 구동되는 페이지는 [다음 링크](http://lumiamitie.github.io/r_tutorial/blog_link/leaflet_in_r.html) 로 들어가시면 확인하실 수 있습니다



---

<br / >
<br / >

## Creating default map

`leaflet(data)`를 통해 leaflet map widget을 생성하고 데이터를 연결한다

`setView()`함수를 사용하면 지도의 중심과 확대 정도를 설정한다

`addTiles()` 함수는 기본 타일(OpenStreetMap)을 불러와서 지도를 보여준다

`addCircles()` 함수를 통해 데이터를 원의 형태로 지도에 나타낼 수 있다

각각의 함수는 `%>%`를 통해 연결할 수 있다


```r
leaflet(wifi_data) %>% 
  setView(lng = seoul_lonlat[1], lat = seoul_lonlat[2], zoom = 11) %>% 
  addTiles() %>% 
  addCircles(lng = ~lon, lat=~lat)
```
![](/images/post_image/leaflet_in_R/leaflet01.PNG)

---

<br / >
<br / >

## Third Party Tiles

`addTiles()`대신에 `addProviderTiles()`를 이용하면 OSM이 아닌 다른 형태의 지도를 사용할 수 있다

`Stamen.Toner`,`Stamen.Watercolor`, `Acetate.terrain`, `CartoDB.Positron` 등의 옵션을 사용할 수 있고

<https://github.com/leaflet-extras/leaflet-providers>에서 다른 provider들의 지도를 불러올 수 있는 방법에 대해서 알아볼 수 있다


```r
leaflet(wifi_data) %>% 
  setView(lng = seoul_lonlat[1], lat = seoul_lonlat[2], zoom = 11) %>% 
  addProviderTiles('Stamen.Toner') %>% 
  addCircles(lng = ~lon, lat=~lat)
```

![](/images/post_image/leaflet_in_R/leaflet02.PNG)


```r
leaflet(wifi_data) %>% 
  setView(lng = seoul_lonlat[1], lat = seoul_lonlat[2], zoom = 11) %>% 
  addProviderTiles('CartoDB.Positron') %>% 
  addCircles(lng = ~lon, lat=~lat)
```

![](/images/post_image/leaflet_in_R/leaflet03.PNG)

---

<br / >
<br / >

## Popup

popup 옵션을 이용하면 tooltip을 생성할 수 있다

클릭하면 해당 데이터를 확인할 수 있다


```r
leaflet(wifi_data) %>% 
  setView(lng = seoul_lonlat[1], lat = seoul_lonlat[2], zoom = 11) %>% 
  addProviderTiles('Stamen.Toner') %>% 
  addCircles(lng = ~lon, lat=~lat, popup = ~div)
```

![](/images/post_image/leaflet_in_R/leaflet04.PNG)

---

<br / >
<br / >

## Color

leaftlet에서는 `colorNumeric`, `colorBin`, `colorQuantile`, `colorFactor` 등의 함수를 이용해서 색상을 지정하는 함수를 생성할 수 있다.

위에서 사용한 와이파이 정보를 통신사별로 구별하기 위해서 서로 다른 색상을 지정해보려고 한다

`colorFactor`함수를 이용하면 `RColorBrewer` 패키지의 색상이나 다른 함수의 색상을 가져와서 구성할 수 있다

첫 번째 인수로는 RColorBrewer의 팔레트 이름, 두 번째 인수는 적용할 데이터(열까지)를 지정한다


```r
telecom_color = colorFactor('Set1', wifi_data$div)
```

색상 함수를 생성하면 `color`옵션에서 해당 변수에 함수를 사용한 형태로 값을 지정한다


```r
leaflet(wifi_data) %>% 
  setView(lng = seoul_lonlat[1], lat = seoul_lonlat[2], zoom = 11) %>% 
  addProviderTiles('Stamen.Toner') %>% 
  addCircles(lng = ~lon, lat=~lat, popup = ~div, color = ~telecom_color(div))
```



![](/images/post_image/leaflet_in_R/leaflet05.PNG)

---

<br / >
<br / >

## Legends

`addLegend`함수를 이용해서 범례를 추가할 수 있다

`position` 항목에는 topright", bottomright, bottomleft, topleft 중 하나를 선택하여 범례의 위치를 지정할 수 있다

`pal` 옵션에는 우리가 사용했던 색상 팔레트 함수를 입력한다

`values` 옵션에는 색상 팔레트 함수가 색상을 생성하는데 사용한 변수값을 지정한다


```r
leaflet(wifi_data) %>% 
  setView(lng = seoul_lonlat[1], lat = seoul_lonlat[2], zoom = 11) %>% 
  addProviderTiles('Stamen.Toner') %>% 
  addCircles(lng = ~lon, lat=~lat, popup = ~div, color = ~telecom_color(div)) %>% 
  addLegend(position = 'bottomright', 
            title = 'Wifi Provider', 
            pal = telecom_color, values = ~div, opacity = 1)
```


![](/images/post_image/leaflet_in_R/leaflet06.PNG)


<br />
<br />

## Interactive Layer

각각의 레이어를 서로 다른 group으로 지정하면 사용자 선택에 의해서 원하는 레이어만 선택하여 볼 수 있다.

`addCircles`함수를 사용할 때 `group`이라는 항목을 추가하고

`addLayersControl`함수에서 설정을 통해 선택창을 생성할 수 있다

**baseGroups** 항목에 목록을 넣으면 라디오 버튼(항목 중에서 한 개만 선택가능)이 구성되고

**overlayGroups** 항목에 들어가는 목록은 체크박스를 구성한다


```r
leaflet() %>% 
  setView(lng = seoul_lonlat[1], lat = seoul_lonlat[2], zoom = 11) %>% 
  addProviderTiles('Stamen.Toner') %>% 
  addCircles(data = wifi_data %>% filter(div == 'SKT'), 
             lng = ~lon, lat=~lat, popup = ~div, group = 'skt', 
             color = ~telecom_color(div)) %>% 
  addCircles(data = wifi_data %>% filter(div == 'KT'), 
             lng = ~lon, lat=~lat, popup = ~div, group = 'kt', 
             color = ~telecom_color(div)) %>% 
  addCircles(data = wifi_data %>% filter(div == 'LGU+'), 
             lng = ~lon, lat=~lat, popup = ~div, group = 'lg', 
             color = ~telecom_color(div)) %>% 
  addLayersControl(overlayGroups = c('skt', 'kt', 'lg'),
                   options = layersControlOptions(collapsed = FALSE))
```

![](/images/post_image/leaflet_in_R/leaflet07.PNG)