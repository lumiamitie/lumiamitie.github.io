---
layout: post
published: true
title: Mapping with ggplot2+shp
mathjax: false
featured: true
comments: true
headline: Making blogging easier for masses
categories: R Visualization
tags: jekyll
---
![cover-image](/images/macphoto.jpg)
여기서는 shp파일을 불러와서 직접 ggplot2를 이용해 지도를 그리는 방법을 설명하려고 한다


```
library(maptools)
```

```
## Loading required package: sp
## Checking rgeos availability: TRUE
```

```
library(ggplot2)
```
maptools 패키지를 실행시키면 `Checking rgeos availability` 라는 문구가 나오는데 여기서 FALSE가 나온다면 rgeos 패키지를 설치해주자

[여기 주소](http://www.diva-gis.org/gdata)를 통해 한국의 행정구역이 표시된 shp파일을 구해서 데이터를 불러오도록 한다. **Administrative areas**항목을 다운로드 받는다. 그 중에서 `KOR_adm2.shp`파일을 `maptools::readShapePoly()`함수로 불러오고, `str()` 함수로 데이터를 살펴보자.



    shp2 <- readShapePoly("D:\\data\\gis\\SouthKorea_source\\KOR_adm\\KOR_adm2.shp")
    str(shp2@data)

~~~ r
  ## 'data.frame':	228 obs. of  18 variables:
    $ ID_0      : int  124 124 124 124 124 124 124 124 124 124 ...
    $ ISO       : Factor w/ 1 level "KOR": 1 1 1 1 1 1 1 1 1 1 ...
    $ NAME_0    : Factor w/ 1 level "South Korea": 1 1 1 1 1 1 1 1 1 1 ...
    $ ID_1      : int  1591 1591 1591 1591 1591 1592 1592 1592 1587 1588 ...
    $ NAME_1    : Factor w/ 16 levels "Busan","Chungcheongbuk-do",..: 14 14 14 14 14 15 15 15 10 11 ...
    $ ID_2      : int  19391 19392 19393 19394 19395 19396 19397 19398 19347 19348 ...
    $ NAME_2    : Factor w/ 208 levels "Andong","Ansan",..: 166 179 191 197 204 34 36 39 186 13 ...
    $ VARNAME_2 : Factor w/ 0 levels: NA NA NA NA NA NA NA NA NA NA ...
    $ NL_NAME_2 : Factor w/ 9 levels "?? | ??","??? |  ???",..: 6 6 6 6 6 6 5 6 6 6 ...
    $ HASC_2    : Factor w/ 0 levels: NA NA NA NA NA NA NA NA NA NA ...
    $ CC_2      : Factor w/ 0 levels: NA NA NA NA NA NA NA NA NA NA ...
    $ TYPE_2    : Factor w/ 3 levels "Gu","Gun","Si": 3 2 2 2 3 1 1 1 3 1 ...
    $ ENGTYPE_2 : Factor w/ 3 levels "City","County",..: 1 2 2 2 1 3 3 3 1 3 ...
    $ VALIDFR_2 : Factor w/ 1 level "Unknown": 1 1 1 1 1 1 1 1 1 1 ...
    $ VALIDTO_2 : Factor w/ 1 level "Present": 1 1 1 1 1 1 1 1 1 1 ...
    $ REMARKS_2 : Factor w/ 0 levels: NA NA NA NA NA NA NA NA NA NA ...
    $ Shape_Leng: num  1.63 12.39 2.17 2 7.53 ...
    $ Shape_Area: num  0.0809 0.0463 0.06 0.0473 0.0484 ...
    -attr(*, "data_types")= chr  "N" "C" "C" "N" ...
~~~

데이터를 보면 `NAME_1` 항목에는 광역시와 도 등 광역단체목록이 담겨있고, `NAME_2`에는 시/군 과 서울의 구가 들어있다. 


일단은 shp 데이터를 불러온 것 만으로도 지도의 형태는 살펴볼 수 있다


```
plot(shp2)
```

![](/images/post_image/mapping_with_ggplot2/unnamed-chunk-3-1.png) 

`ggplot2`를 이용해서 지도를 그리려면 이 데이터를 데이터 프레임으로 변경해야 하는데 `ggplot2::fortify()` 함수를 이용해서 shp 데이터를 데이터 프레임으로 바꿀 수 있다.


```
shp2_ffd_noregion <- fortify(shp2)
```

```
head(shp2_ffd_noregion)
```

~~~
##       long      lat order  hole piece group id
## 1 127.5484 35.08423     1 FALSE     1   0.1  0
## 2 127.5519 35.07868     2 FALSE     1   0.1  0
## 3 127.5509 35.07233     3 FALSE     1   0.1  0
## 4 127.5491 35.06628     4 FALSE     1   0.1  0
## 5 127.5443 35.05591     5 FALSE     1   0.1  0
## 6 127.5422 35.04578     6 FALSE     1   0.1  0
~~~

이렇게 데이터를 보면 `group`과 `id`가 숫자로 구분된 것을 볼 수 있는데, 나중에 다른 데이터를 합칠 수 있도록 어떤 변수로 지역을 구분할지 명시할 수 있다.


~~~r
shp2_ffd <- fortify(shp2, region = "NAME_1")
shp2_ffd2 <- fortify(shp2, region = "NAME_2")
head(shp2_ffd)
~~~

~~~
##       long      lat order  hole piece   group    id
## 1 129.0179 35.07678     1 FALSE     1 Busan.1 Busan
## 2 129.0179 35.07653     2 FALSE     1 Busan.1 Busan
## 3 129.0176 35.07653     3 FALSE     1 Busan.1 Busan
## 4 129.0176 35.07625     4 FALSE     1 Busan.1 Busan
## 5 129.0174 35.07625     5 FALSE     1 Busan.1 Busan
## 6 129.0174 35.07597     6 FALSE     1 Busan.1 Busan
~~~

데이터 프레임으로 구성했으니 ggplot2를 이용해서 지도를 그릴 수 있다. path를 이용해 각 점을 선으로 연결하는 형태이므로 `geom_path()`를 사용하면 되고 데이터에서 `long`, `lat`, `group` 변수를 이용한다


~~~r
ggplot(shp2_ffd, 
  aes(x=long, y=lat, group=group)) + 
  geom_path()
~~~

![](/images/post_image/mapping_with_ggplot2/unnamed-chunk-6-1.png) 

`NAME_1` 변수를 기준으로 구분한 지도는 광역단체로만 구분이 되고, 아래와 같이 `NAME_2` 변수를 기준으로 fortify시킨경우에는 시(도의 경우), 구(서울 등)로 구분되는 것을 볼 수 있다.


~~~r
ggplot(shp2_ffd2, 
  aes(x=long, y=lat, group=group)) + 
  geom_path()
~~~

![](/images/post_image/mapping_with_ggplot2/unnamed-chunk-7-1.png) 

`geom_path()`가 아니라 `geom_polygon()`을 사용하면 지역별로 색상을 채우는 것이 가능하다. 적용할만한 다른 데이터를 추가하면 히트맵이나 코로플레스같은 시각화를 할 수 있다


~~~r
ggplot(shp2_ffd, aes(x=long, y=lat, group=group)) + 
  geom_polygon(aes(fill=id))
~~~

![](/images/post_image/mapping_with_ggplot2/unnamed-chunk-8-1.png) 

`dplyr`패키지를 불러와서 난수를 데이터에 대입시키고 어떻게 ggplot2를 이용할 수 있을지 살펴보자.



~~~r
library(dplyr)
~~~

~~~r
shp2_value <- data.frame(
  shp2_ffd %>% 
  select(id) %>%
  distinct,
  value = round(runif(16,10,100)))

shp2_value
~~~

~~~
##                   id value
## 1              Busan    24
## 2  Chungcheongbuk-do    76
## 3  Chungcheongnam-do    74
## 4              Daegu    22
## 5            Daejeon    73
## 6         Gangwon-do    68
## 7            Gwangju    34
## 8        Gyeonggi-do    88
## 9   Gyeongsangbuk-do    16
## 10  Gyeongsangnam-do    28
## 11           Incheon    98
## 12              Jeju    56
## 13      Jeollabuk-do    33
## 14      Jeollanam-do    41
## 15             Seoul    96
## 16             Ulsan    32
~~~

각 광역 단체에 적당한 값을 넣은 데이터 프레임을 만들었다


~~~r
shp2_data <- shp2_ffd %>%
  left_join(shp2_value)
~~~

~~~r
ggplot(shp2_data, aes(x=long, y=lat, group=group)) + 
  geom_polygon(aes(fill = value))
~~~

![](/images/post_image/mapping_with_ggplot2/unnamed-chunk-10-1.png) 

원래의 fortify된 지도에 `left_join`을 해서 값을 대입하고, 추가한 열을 `geom_polygon`에서 fill값으로 잡아주면 된다. 색상을 변경하려면 scale 값을 조정해주는 함수를 사용하면 된다. 여기서는 `RColorBrewer`패키지를 이용하는 `scale_fill_distiller`함수를 사용했다.


~~~r
ggplot(shp2_data, aes(x=long, y=lat, group=group)) + 
  geom_polygon(aes(fill = value)) +
  scale_fill_distiller(palette = "Spectral")
~~~

![](/images/post_image/mapping_with_ggplot2/unnamed-chunk-11-1.png) 

---

이제 지도에서 일부분을 추출해보려고 한다. 예를 들어 서울만 지도를 그리고 싶다면, 맨 처음에 shp 파일을 불러왔을 때 `NAME_1` 항목이 *Seoul*인 것만 찾아서 `fortify`시키면 된다. 이 경우에는 구별로 구분된 지도를 봐야 하기 때문에 region 구분은 `NAME_2`를 기준으로 해야 한다.


~~~r
shp2_subset <- shp2[shp2$NAME_1 == "Seoul",]
seoul_ffd <- fortify(shp2_subset, region="NAME_2")
~~~

이후에는 위에서 했던 것과 같은 방식으로 지도를 그릴 수 있다


~~~r
ggplot(seoul_ffd, aes(x=long, y=lat, group=group)) + 
  geom_polygon(aes(fill=id))
~~~

![](/images/post_image/mapping_with_ggplot2/unnamed-chunk-13-1.png) 

