---
layout: post
published: true
title: Web Scraping with rvest
mathjax: false
featured: false
comments: true
headline: Making blogging easier for masses
categories: R Web
tags: jekyll
---

![cover-image](../../../images/taking-notes.jpg)

# Web Scraping with rvest

꿈꾸는 데이터 디자이너 2기의 수업 보조자료입니다
강의자료는 [이 곳](http://www.slideshare.net/neuroassociates/week5rscraping)에서 확인하실 수 있습니다

<br />

# rvest

rvest는 html과 xml 자료를 쉽게 가져와서 처리할 수 있도록 해주는 Hadley Wickham의 패키지이다. 파이썬의 BeautifulSoup 등을 참고해서 기존에 있던 패키지들 보다 더 간단한 문법으로 데이터를 처리하고, Hadley Wickham의 다른 패키지들 처럼 `%>%`연산자를 활용하기 쉽게 구성되었다.

<br />

---

# HTML


```r
library(dplyr)
```



```r
library(rvest)

# url을 chr에 저장한다
daum_bball = 'http://score.sports.media.daum.net/record/baseball/kbo/prnk.daum'

# html()함수를 통해 해당 주소를 긁어오고 html 형태로 파싱한다
# encoding은 'UTF-8'로 지정한다
daum_bball_html = html(daum_bball, encoding='UTF-8')
```

<br />
<br />

html 문서 내에서 `html_node()`함수를 통해 **id값이 table1인 항목**을 찾고

table 태그 내부의 자료를 `html_table()`을 통해 data.frame 형태로 자료를 가져온다


```r
bball_table = html_node(daum_bball_html, '#table1')
html_table(bball_table)
```

```
##    순위       선수 (팀) 경기 승 패 세이브 홀드    이닝 투구수 피안타
## 1     1    양현종 (KIA)   26 12  5      0    1 152 2/3   2488    123
## 2     2       해커 (NC)   25 16  4      0    0 166 1/3   2511    135
## 3     3   유희관 (두산)   24 16  4      0    0 163 1/3   2503    155
## 4     4 린드블럼 (롯데)   26 11  7      0    0     174   2731    158
## 5     5   장원준 (두산)   24 11  9      0    0 142 1/3   2402    146
## 6     6   윤성환 (삼성)   24 13  7      0    0     160   2483    156
## 7     7   피가로 (삼성)   23 12  6      0    0     152   2453    145
## 8     8   밴헤켄 (넥센)   26 12  6      0    0 162 1/3   2666    154
## 9     9     김광현 (SK)   23 11  3      0    0     136   2268    138
## 10   10   레일리 (롯데)   26  7  8      0    0     146   2400    155
## 11   11 피어밴드 (넥센)   25 11  8      0    0 149 1/3   2432    162
## 12   12   옥스프링 (kt)   26  9  9      0    0     159   2677    164
## 13   13       켈리 (SK)   23  7  9      0    0 142 2/3   2239    152
## 14   14       소사 (LG)   25  8 10      0    1 153 1/3   2459    159
## 15   15    스틴슨 (KIA)   27 10  8      0    0 151 1/3   2539    167
## 16   16   차우찬 (삼성)   24  9  5      0    0     143   2510    131
## 17   17 클로이드 (삼성)   23 10  8      0    0 133 1/3   2259    155
## 18   18     루카스 (LG)   28  8  9      0    1 142 1/3   2733    140
## 19   19   탈보트 (한화)   25  8  9      0    0     126   2299    131
##    피홈런 탈삼진 사사구 실점 자책 평균자책 WHIP QS
## 1      15    125     62   41   39     2.30 1.21 16
## 2       9    143     30   58   48     2.60 0.99 21
## 3      17    113     37   58   57     3.14 1.18 15
## 4      21    141     41   66   65     3.36 1.14 19
## 5       7    110     53   61   56     3.54 1.40 15
## 6      22    140     25   66   63     3.54 1.13 14
## 7      15    108     50   64   60     3.55 1.28 16
## 8      11    165     53   74   66     3.66 1.28 14
## 9      12    127     53   69   57     3.77 1.40 12
## 10     16    112     43   79   65     4.01 1.36 15
## 11     16    122     49   73   68     4.10 1.41 16
## 12     20    122     56   85   73     4.13 1.38 13
## 13     14    104     42   70   66     4.16 1.36 13
## 14     15    129     29   84   72     4.23 1.23 14
## 15     13     80     56   83   77     4.58 1.47 11
## 16     24    150     59   80   75     4.72 1.33 15
## 17     17     97     32   76   71     4.79 1.40 13
## 18     11    134     90   85   78     4.93 1.62  9
## 19     11     91     69   83   74     5.29 1.59 10
```

<br />

pipe 연산자를 통해 표현하면 다음과 같다


```r
daum_bball_html %>%
  html_node('#table1') %>%
  html_table()
```

<br />
<br />

`html_table()`함수의 경우 윈도우 환경에서는 아직 인코딩을 제대로 처리하지 못하는 것으로 보인다

`rvest` 이전에 사용하던 `XML`과 `RCurl` 패키지를 이용해서 비슷한 방식으로 가지고 올 수 있다

글의 맨 마지막 부분에서 코드를 살펴볼 수 있다

<br />
<br />

---

`html_node()` 함수는 node이름이나 css주소, xpath등을 받으면 해당하는 요소를 **1개만** 반환한다

테이블의 header 부분 정보를 담고있는 thead 태그 내부에서 html_node('th')로 th 태그의 항목들을 검색해보면

**가장 첫 번째 th 요소**를 태그와 내용을 함께 반환한다



```r
bball_thead = html_node(daum_bball_html, 'thead')
html_node(bball_thead, 'th')
```

```
## <th scope="col">순위</th>
```


```r
# pipe
daum_bball_html %>% 
  html_node('thead') %>% 
  html_node('th')
```
<br />
<br />

`html_nodes()` 함수는 해당하는 요소를 전부 반환한다


```r
html_nodes(bball_thead, 'th')
```

```
## [[1]]
## <th scope="col">순위</th> 
## 
## [[2]]
## <th class="txt_league" scope="col">선수 <em>(팀)</em></th> 
## 
## [[3]]
## <th scope="col">
##   <a href="?season_id=2015&amp;col=GP&amp;ord=DESC" class="ico_comm3 btn_align">경기</a>
## </th> 
## 
## [[4]]
## <th scope="col">
##   <a href="?season_id=2015&amp;col=W&amp;ord=DESC" class="ico_comm3 btn_align">승</a>
## </th> 
## 
## [[5]]
## <th scope="col">
##   <a href="?season_id=2015&amp;col=L&amp;ord=DESC" class="ico_comm3 btn_align">패</a>
## </th> 
## 
## [[6]]
## <th scope="col">
##   <a href="?season_id=2015&amp;col=SV&amp;ord=DESC" class="ico_comm3 btn_align">세이브</a>
## </th> 
## 
## [[7]]
## <th scope="col">
##   <a href="?season_id=2015&amp;col=HLD&amp;ord=DESC" class="ico_comm3 btn_align">홀드</a>
## </th> 
## 
## [[8]]
## <th scope="col">
##   <a href="?season_id=2015&amp;col=IP&amp;ord=DESC" class="ico_comm3 btn_align">이닝</a>
## </th> 
## 
## [[9]]
## <th scope="col">
##   <a href="?season_id=2015&amp;col=NP&amp;ord=DESC" class="ico_comm3 btn_align">투구수</a>
## </th> 
## 
## [[10]]
## <th scope="col">
##   <a href="?season_id=2015&amp;col=HIT&amp;ord=DESC" class="ico_comm3 btn_align">피안타</a>
## </th> 
## 
## [[11]]
## <th scope="col">
##   <a href="?season_id=2015&amp;col=HR&amp;ord=DESC" class="ico_comm3 btn_align">피홈런</a>
## </th> 
## 
## [[12]]
## <th scope="col">
##   <a href="?season_id=2015&amp;col=SO&amp;ord=DESC" class="ico_comm3 btn_align">탈삼진</a>
## </th> 
## 
## [[13]]
## <th scope="col">
##   <a href="?season_id=2015&amp;col=BB&amp;ord=DESC" class="ico_comm3 btn_align">사사구</a>
## </th> 
## 
## [[14]]
## <th scope="col">
##   <a href="?season_id=2015&amp;col=R&amp;ord=DESC" class="ico_comm3 btn_align">실점</a>
## </th> 
## 
## [[15]]
## <th scope="col">
##   <a href="?season_id=2015&amp;col=ER&amp;ord=DESC" class="ico_comm3 btn_align">자책</a>
## </th> 
## 
## [[16]]
## <th scope="col" class="on">
##   <a href="?season_id=2015&amp;col=ERA&amp;ord=ASC" data-type="reverse" class="ico_comm3 btn_align">평균자책</a>
## </th> 
## 
## [[17]]
## <th scope="col">
##   <a href="?season_id=2015&amp;col=WHIP&amp;ord=ASC" class="ico_comm3 btn_align">WHIP</a>
## </th> 
## 
## [[18]]
## <th scope="col">
##   <a href="?season_id=2015&amp;col=QS&amp;ord=DESC" class="ico_comm3 btn_align">QS</a>
## </th> 
## 
## attr(,"class")
## [1] "XMLNodeSet"
```


```r
# pipe
daum_bball_html %>% 
  html_node('thead') %>% 
  html_nodes('th')
```
<br />
<br />

---

요소를 반환 받았을 때 html_text() 함수를 이용해 내용만 추출할 수 있다


```r
html_text(html_node(bball_thead, 'th'))
```

```
## [1] "순위"
```


```r
# pipe
daum_bball_html %>% 
  html_node('thead') %>% 
  html_node('th') %>% 
  html_text()
```
<br />
<br />


```r
html_text(html_nodes(bball_thead, 'th'))
```

```
##  [1] "순위"      "선수 (팀)" "경기"      "승"        "패"       
##  [6] "세이브"    "홀드"      "이닝"      "투구수"    "피안타"   
## [11] "피홈런"    "탈삼진"    "사사구"    "실점"      "자책"     
## [16] "평균자책"  "WHIP"      "QS"
```


```r
# pipe
daum_bball_html %>% 
  html_node('thead') %>% 
  html_nodes('th') %>% 
  html_text()
```
<br />
<br />
<br />

# XML

xml자료를 가져올때는 `xml()`을 사용하고

`xml_node()`, `xml_nodes()`, `xml_text()`등의 함수를 사용할 수 있다.

html 함수들과 사용방법은 동일하다


```r
boxoffice_xml = xml('boxoffice0831.xml', encoding = 'UTF-8')
```
<br />
<br />

`xml_structure` 함수를 사용하면 xml 문서의 구조를 볼 수 있다


```r
xml_structure(boxoffice_xml)
```

```
## {DTD}
## <html>
##   <body>
##     <boxofficeresult>
##       <boxofficetype> {text}
##       <showrange> {text}
##       <dailyboxofficelist>
##         <dailyboxoffice>
##           <rank> {text}
##           <movienm> {text}
##           <audicnt> {text}
##         <dailyboxoffice>
##           <rank> {text}
##           <movienm> {text}
##           <audicnt> {text}
##         <dailyboxoffice>
##           <rank> {text}
##           <movienm> {text}
##           <audicnt> {text}
##         <dailyboxoffice>
##           <rank> {text}
##           <movienm> {text}
##           <audicnt> {text}
##         <dailyboxoffice>
##           <rank> {text}
##           <movienm> {text}
##           <audicnt> {text}
##         <dailyboxoffice>
##           <rank> {text}
##           <movienm> {text}
##           <audicnt> {text}
##         <dailyboxoffice>
##           <rank> {text}
##           <movienm> {text}
##           <audicnt> {text}
##         <dailyboxoffice>
##           <rank> {text}
##           <movienm> {text}
##           <audicnt> {text}
##         <dailyboxoffice>
##           <rank> {text}
##           <movienm> {text}
##           <audicnt> {text}
##         <dailyboxoffice>
##           <rank> {text}
##           <movienm> {text}
##           <audicnt> {text}
```

<br />
<br />

---

html과 마찬가지로 xml_node, xml_nodes, xml_text를 통해 데이터를 추출할 수 있다


```r
xml_text(xml_node(boxoffice_xml, 'showrange'))
```

```
## [1] "20150831~20150831"
```


```r
# pipe
boxoffice_xml %>% 
  xml_node('showrange') %>% 
  xml_text()
```

<br />
<br />

dailyboxoffice 태그들 안에 동일한 태그로 데이터가 담겨있기 때문에

일단 dailyboxoffice을 선택하고(`xml_node`)

바로 원하는 자료들이 담긴 태그들에 직접 접근해서(`xml_nodes`) 자료를 받아오려고 한다(`xml_text`)



```r
daily = xml_node(boxoffice_xml, 'dailyboxofficelist')

# 순위와, 영화이름, 관객 수를 각각 벡터에 저장한다
rank    = xml_text(xml_nodes(daily, 'rank'))
movieNm = xml_text(xml_nodes(daily, 'movienm'))
audiCnt = xml_text(xml_nodes(daily, 'audicnt'))

# 세 개의 벡터를 묶어서 data.frame으로 구성한다
daily_boxoffice = data.frame(rank, movieNm, audiCnt)
daily_boxoffice
```

```
##    rank                   movieNm audiCnt
## 1     1                    베테랑  144263
## 2     2             뷰티 인사이드   59994
## 3     3                      암살   47798
## 4     4                  치외법권   26420
## 5     5               미쓰 와이프   18834
## 6     6           아메리칸 울트라   13839
## 7     7 미션 임파서블: 로그네이션   10337
## 8     8             미라클 벨리에    7203
## 9     9                  미니언즈    2756
## 10   10                판타스틱 4    2500
```

<br />
<br />
<br />

## XML과 RCurl을 이용해서 table 가져오기

윈도우에서 rvest의 `html_table`함수가 인코딩 문제가 생긴다면 `XML`과 `RCurl` 패키지를 사용해서 테이블을 처리할 수 있다


```r
library(XML)
```

```r
library(RCurl)
```


```r
daum_bball = 'http://score.sports.media.daum.net/record/baseball/kbo/prnk.daum'
xml_daum = getURL(daum_bball)

bball_table = readHTMLTable(xml_daum)$table1
# 헤더 부분 인코딩이 깨지는 문제는 rvest 패키지의 repair_encoding()함수로 처리한다
names(bball_table) = repair_encoding(names(bball_table))
```


```r
head(bball_table)
```

```
##   순위       선수 (팀) 경기 승 패 세이브 홀드    이닝 투구수 피안타 피홈런
## 1    1    양현종 (KIA)   26 12  5      0    1 152 2/3   2488    123     15
## 2    2       해커 (NC)   25 16  4      0    0 166 1/3   2511    135      9
## 3    3   유희관 (두산)   24 16  4      0    0 163 1/3   2503    155     17
## 4    4 린드블럼 (롯데)   26 11  7      0    0     174   2731    158     21
## 5    5   장원준 (두산)   24 11  9      0    0 142 1/3   2402    146      7
## 6    6   윤성환 (삼성)   24 13  7      0    0     160   2483    156     22
##   탈삼진 사사구 실점 자책 평균자책 WHIP QS
## 1    125     62   41   39     2.30 1.21 16
## 2    143     30   58   48     2.60 0.99 21
## 3    113     37   58   57     3.14 1.18 15
## 4    141     41   66   65     3.36 1.14 19
## 5    110     53   61   56     3.54 1.40 15
## 6    140     25   66   63     3.54 1.13 14
```
