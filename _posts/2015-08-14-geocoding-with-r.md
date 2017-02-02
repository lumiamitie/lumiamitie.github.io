---
layout: post
published: true
title: Geocoding with R
mathjax: false
featured: false
comments: true
headline: Geocoding with ggmap
categories: R
tags: map geocoding
---

![cover-image](../../images/rocks-waves.jpg)

## ggmap::geocode 함수를 이용한 지오코딩

**ggmap** 패키지에는 **geocode**라는 함수가 있다

지명을 인자로 넣어주면 위도와 경도값을 반환해주고, 옵션에 따라 더 많은 정보를 불러오기도 한다

그런데 언어가 영문으로 고정되어 있기 때문인지 영문지명으로 입력해야 하고 반환되는 값 또한 영문주소가 반환된다


```r
library(ggmap)
```

```
## Loading required package: ggplot2
```

```r
geocode('Seoul')
```

```
## Information from URL : http://maps.googleapis.com/maps/api/geocode/json?address=Seoul&sensor=false
```

```
##       lon      lat
## 1 126.978 37.56654
```

```r
geocode('Seoul', output='latlona')
```

```
##       lon      lat            address
## 1 126.978 37.56654 seoul, south korea
```

```r
geocode('Seoul', output='more')
```

```
##       lon      lat     type     loctype            address   north   south
## 1 126.978 37.56654 locality approximate seoul, south korea 37.6956 37.4346
##       east     west postal_code     country administrative_area_level_2
## 1 127.1823 126.7968        <NA> south korea                        <NA>
##   administrative_area_level_1 locality street streetNo point_of_interest
## 1                        <NA>    seoul   <NA>       NA              <NA>
##   query
## 1 Seoul
```

아래와 같이 한글로 지명을 입력하면 오류가 난다.

`geocode('서울')`

옵션을 일부 변경하면 한글도 사용할 수 있지 않을까 하고 생각했지만 아직까지는 방법을 찾지 못했다

한글지명으로 입력하서 한글주소를 반환받으려면 어떻게 해야할까?


---

## Geocoding with Google API (+rvest)

일단 여기서는 위도와 경도 자료만 가지고 오려고 한다


`http://maps.googleapis.com/maps/api/geocode/xml?sensor=false&language=ko&address='서울'`

웹브라우저에서 위 url로 들어가보면 xml 데이터를 볼 수 있다

url 중간에 있는 xml을 json으로 바꿔주면 json 형태의 자료도 받을 수 있다

---

그러면 아래에서는 `rvest`패키지를 이용해 위 주소의 xml자료를 가져오고 원하는 항목만 정리해보려고 한다


```r
library(rvest)
url = "http://maps.googleapis.com/maps/api/geocode/xml?sensor=false&language=ko&address='서울'"
seoul_xml = xml(url, encoding='UTF-8')
```

---

location 태그를 검색하면 하위 항목에 위도, 경도 자료가 있는 것을 볼 수 있다 


```r
seoul_xml %>%
  xml_node('location')
```

```
## <location>
##   <lat>37.5665350</lat>
##   <lng>126.9779692</lng>
## </location>
```

---

아래 처럼 자식항목의 텍스트를 한꺼번에 받아와도 되고


```r
seoul_xml %>%
  xml_node('location') %>%
  xml_children() %>%
  xml_text()
```

```
##           lat           lng 
##  "37.5665350" "126.9779692"
```

---

아래처럼 필요한 항목에 직접 접근해서 받아와도 된다


```r
seoul_xml %>%
  xml_node('lat') %>%
  xml_text()
```

```
## [1] "37.5665350"
```

---

기본적인 방법을 알았으니 복수의 지명에 대해서 위도/경도 자료를 가지고 오자

여기서는 우선 지명에 대한 목록을 작성한 후에

각 지명에 대해 api로 접근해서 위도, 경도값을 받아오고

이 작업을 for 문을 이용해 반복해서 원하는 결과를 얻으려고 한다


```r
# 위도,경도값을 얻으려고 하는 지명의 목록이다
loc_list = c('서울', '대전', '부산')

# 결과물을 취합하기 위한 빈 벡터
geocode_result = c()
for(loc in loc_list){
  
  # 검색어를 제외한 url
  url = "http://maps.googleapis.com/maps/api/geocode/xml?sensor=false&language=ko&address='"
  
  # 검색어를 포함시켜서 만든 완전한 url
  geocode_url = paste0(url, loc, "'")
  
  # url에서 utf-8 인코딩으로 xml자료를 가져온다
  geocode_xml = xml(geocode_url, encoding='UTF-8')
  
  # 위도값을 가져온다
  geocode_lat = geocode_xml %>%
    xml_node('lat') %>%
    xml_text()
  
  # 경도값을 가져온다
  geocode_lon = geocode_xml %>%
    xml_node('lng') %>%
    xml_text()
  
  # 지명, 위도, 경도를 1행짜리 데이터 프레임으로 구성한다
  # 이 때 위도,경도값을 숫자로 변환한다
  geocode_data = data.frame(location = loc, 
                            lat = as.numeric(geocode_lat), 
                            lon = as.numeric(geocode_lon)
                            )
  # 최종 결과물이 저장될 오브젝트에 누적시켜서 값을 저장한다
  geocode_result = rbind(geocode_result, geocode_data)
}
geocode_result
```

```
##   location      lat      lon
## 1     서울 37.56654 126.9780
## 2     대전 36.35041 127.3845
## 3     부산 35.17955 129.0756
```

