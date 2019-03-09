---
layout: post
published: true
title: Useful dplyr Functions
mathjax: false
featured: false
comments: true
headline: Useful dplyr Functions
categories: R
tags: R dplyr
---

# 유용한 dplyr 함수들

이 문서에서는 dplyr 함수들에 대한 설명과 간단한 사용법을 정리할 예정이다.
문서의 내용은 계속해서 추가될 예정이다. 마지막으로 업데이트된 날짜는 **2019-03-09**이다.

더 압축적으로 정리된 문서를 찾는다면, [dplyr CheatSheet](https://www.rstudio.com/resources/cheatsheets/#dplyr) 를 확인해보자.

여기서는 다음과 같이 카테고리를 나누고 점차 내용을 추가할 예정이다.

- 변수 다루기
    - 변수 선택/추출하기
    - 변수 선택 도구들
    - 변수 이름 바꾸기
    - 새로운 변수 만들기
- 데이터프레임 다루기
    - 데이터프레임의 일부 추출하기
    - 데이터프레임 정렬하기
    - 데이터프레임에 자료 추가하기
    - 데이터프레임 요약하기
    - 데이터프레임에 그룹 지정하기
- 다양한 함수들
    - Vector Function
    - Summary Function
- Miscellaneous
    - `*_if`, `*_at`, `*_all` 함수들


```r
library(tidyverse)
# 또는 library(dplyr)
```

## 변수 다루기

### 변수 선택/추출하기

#### select

- 데이터프레임에서 특정 변수만 선택한다
- `select(data.frame, col1, col2, ...)`
- `select` 함수 안에서는 `tidyselect` 라이브러리를 통해 제공하는 다양한 선택 도구들을 사용할 수 있다
    - `starts_with`, `ends_with`, `contains`, `matches`, `num_range`, `one_of`, `everything`, `last_col`
    - 위 함수들을 사용하는 방법은 **변수 선택 도구들** 항목에서 다룰 예정이다


```r
iris %>% 
  head() %>% 
  select(Sepal.Length, Sepal.Width, Species) # 세 개의 변수를 선택한다
```

```
##   Sepal.Length Sepal.Width Species
## 1          5.1         3.5  setosa
## 2          4.9         3.0  setosa
## 3          4.7         3.2  setosa
## 4          4.6         3.1  setosa
## 5          5.0         3.6  setosa
## 6          5.4         3.9  setosa
```


```r
iris %>% 
  head() %>% 
  select(1,2,3) # 1,2,3 열을 선택한다
```

```
##   Sepal.Length Sepal.Width Petal.Length
## 1          5.1         3.5          1.4
## 2          4.9         3.0          1.4
## 3          4.7         3.2          1.3
## 4          4.6         3.1          1.5
## 5          5.0         3.6          1.4
## 6          5.4         3.9          1.7
```


```r
# select 함수 내에서 변수명을 변경할 수 있다
# 변경후이름 = 변경전이름 형태로 값을 전달한다
iris %>% 
  head() %>% 
  select(sepal_length = Sepal.Length, species = Species)
```

```
##   sepal_length species
## 1          5.1  setosa
## 2          4.9  setosa
## 3          4.7  setosa
## 4          4.6  setosa
## 5          5.0  setosa
## 6          5.4  setosa
```


### 변수 선택 도구들

TODO

### 변수 이름 바꾸기

TODO

### 새로운 변수 만들기

TODO

## 데이터프레임 다루기

### 데이터프레임의 일부 추출하기

TODO

### 데이터프레임 정렬하기

TODO

### 데이터프레임에 자료 추가하기

TODO

### 데이터프레임 요약하기

TODO

### 데이터프레임에 그룹 지정하기

TODO

## 다양한 함수들

### Vector Function

TODO

### Summary Function

## Miscellaneous

### _if, _at, _all 함수들

TODO
