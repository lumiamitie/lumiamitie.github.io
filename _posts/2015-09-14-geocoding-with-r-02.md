---
layout: post
published: true
title: Geocoding with R - 02
mathjax: false
featured: true
comments: true
headline: Making blogging easier for masses
categories: R
tags: jekyll
---

![cover-image](/images/macphoto.jpg)

## Geocoding with ggmap::geocode

```r
library(ggmap)
library(ggplot2)
```

`ggmap` 패키지에는 `geocode`라는 함수가 있다


```r
geocode('Seoul', source='google')
```

```
## Information from URL : http://maps.googleapis.com/maps/api/geocode/json?address=Seoul&sensor=false
```

```
##       lon      lat
## 1 126.978 37.56654
```

위와 같은 형태로 사용하면 검색하는 위치의 위도와 경도값을 반환해준다

<br />

그런데 한글로 검색하면 오류가 나는 것을 볼 수 있다


```r
geocode('서울', source='google')
```

```
## Information from URL : http://maps.googleapis.com/maps/api/geocode/json?address=%BC%AD%BF%EF&sensor=false
```

```
## Warning: geocode failed with status INVALID_REQUEST, location = "서울"
```

```
##   lon lat
## 1  NA  NA
```

<br />

인코딩 문제이기 때문에 `enc2utf8` 함수를 이용해서 인코딩을 변환하면 함수를 사용할 수 있다


```r
geocode(enc2utf8('서울'), source='google')
```

```
## Information from URL : http://maps.googleapis.com/maps/api/geocode/json?address=%EC%84%9C%EC%9A%B8&sensor=false
```

```
##       lon      lat
## 1 126.978 37.56654
```

---

<br />

또, 아래와 같이 `output = 'latlona'`옵션을 추가할 경우, 위도 경도에 주소까지 반환하게 된다

하지만 그냥 사용하면 주소가 영어로 나오는 것을 볼 수 있다


```r
geocode('Seoul', source='google', output = 'latlona')
```

```
##       lon      lat            address
## 1 126.978 37.56654 seoul, south korea
```

`http://maps.googleapis.com/maps/api/geocode/json?address=Seoul&sensor=false` 의 형태로 검색할 때 나오는 주소가 반환되는 것인데 여기에 아래와 같이 `language=ko` 옵션이 추가되면 주소가 한글로 반환된다

> http://maps.googleapis.com/maps/api/geocode/json?address=Seoul&language=ko&sensor=false

<br />

따라서 주소를 검색할 때, `지명&language=ko`의 형태로 검색하면 url 주소에 옵션이 추가되어서 한글 주소를 반환받을 수 있게 된다


```r
geocode('Seoul&language=ko', source='google', output = 'latlona')
```

```
## Information from URL : http://maps.googleapis.com/maps/api/geocode/json?address=Seoul&language=ko&sensor=false
```

```
##       lon      lat           address
## 1 126.978 37.56654   대한민국 서울특별시
```

---

<br />

다음은 `geocode`함수를 데이터프레임의 형태를 통해 일괄적으로 처리하는 `mutate_geocode` 함수에 대해 보려고 한다.

지명이 factor로 들어가지 않게 처리하고 한글을 UTF-8로 변환시킨다


```r
city_df = data.frame(city = c('서울', '부산', '대전'), 
                     stringsAsFactors = F)

city_df$city = enc2utf8(city_df$city)

city_df
```

```
##   city
## 1 서울
## 2 부산
## 3 대전
```

<br />
<br />

데이터 프레임이 완성되면 `mutate_geocode` 함수를 사용한다

첫 번째 인수로 해당 데이터 프레임이 들어가고

두 번째 인수로 데이터프레임에서 주소에 해당하는 열 이름을 지정한다

그리고 `source = 'google'`을 통해 구글 api를 사용할 것을 명시한다(기본값이 에러가 안난다면 사용해도 된다)


```r
city_lonlat = mutate_geocode(city_df, city, source = 'google')

city_lonlat
```

```
##   city      lon      lat
## 1 서울 126.9780 37.56654
## 2 부산 129.0756 35.17955
## 3 대전 127.3845 36.35041
```

---

<br />

그러면 `mutate_geocode`로 지하철 2호선 역들의 위치를 모두 검색해보고

지도상에 표시해보려고 한다

<br />

2호선 역 목록을 모두 입력했다


```r
station_list = c('시청역', '을지로입구역', '을지로3가역', '을지로4가역', '동대문역사문화공원역', '신당역', '상왕십리역', '왕십리역', '한양대역', '뚝섬역', '성수역', '건대입구역', '구의역', '강변역', '잠실나루역', '잠실역', '신천역', '종합운동장역', '삼성역', '선릉역', '역삼역', '강남역', '교대역', '서초역', '방배역', '사당역', '낙성대역', '서울대입구역', '봉천역', '신림역', '신대방역', '구로디지털단지역', '대림역', '신도림역','문래역', '영등포구청역', '당산역', '합정역', '홍대입구역', '신촌역', '이대역', '아현역', '충정로역')
```

<br />

위에서 지정한 2호선 역 목록을 데이터프레임으로 구성한 다음에 주소의 인코딩을 utf8로 변경한다


```r
station_df = data.frame(station_list, stringsAsFactors = FALSE)
station_df$station_list = enc2utf8(station_df$station_list)
```

<br />

ggmap 패키지의 mutate_geocode 함수를 이용해서 위도/경도값을 받아온다

`mutate_geocode(데이터프레임, 열이름, 소스(여기서는 구글))`의 형태로 지정한다


```r
station_latlon = mutate_geocode(station_df, station_list, source = 'google')

head(station_latlon)
```

```
##         station_list      lon      lat
## 1              시청역 126.9771 37.56544
## 2         을지로입구역 126.9827 37.56606
## 3          을지로3가역 126.9926 37.56629
## 4          을지로4가역 126.9976 37.56661
## 5   동대문역사문화공원역 127.0092 37.56564
## 6              신당역 127.0195 37.56567
```

<br />

위도경도 데이터가 완성되면 ggmap 패키지의 `qmap`함수를 이용해 지도를 생성하고 ggplot2 그래프를 그릴 수 있다


```r
seoul_map <- qmap('Seoul', zoom = 11, source = 'stamen', maptype = 'toner')
```

```r
seoul_map +
  geom_point(data = station_latlon, aes(lon, lat), size = 3, colour='#018b4d')
```


![](/images/post_image/geocoding_with_r-02/unnamed-chunk-12-1.png) 

