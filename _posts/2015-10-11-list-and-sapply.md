---
layout: post
published: true
title: List and sapply
mathjax: false
featured: true
comments: true
headline: Making blogging easier for masses
categories: R
tags: jekyll
---

![cover-image](../../images/note-and-pen.jpg)

json이나 파이썬의 딕셔너리처럼 자유로운 형태의 데이터를 사용하게 되면 list를 많이 사용하게 된다. 평소에는 주로 data.frame을 사용하다보니 상대적으로 list에는 익숙하지가 않았다. 이번에 인스타그램에서 데이터를 가져오면서 리스트에 대해 한 번쯤 정리를 해야겠다는 필요성을 느꼈다. 그래서 api를 통해 데이터를 가져올 때 많이 사용할 만한 내용을 살펴보려고 한다

---

# List

R의 리스트는 key-value 형태로 데이터를 저장한다

value에는 숫자, 문자열, 리스트, 데이터프레임 등 다양한 형태의 데이터 프레임이 존재할 수 있다

다만 여기서는 json 형태의 데이터를 R로 가져왔을 때 가장 많이 발생하는 형태인 '리스트가 중첩된 형태' 를 중점적으로 생각하려고 한다

---

## list 생성하기

리스트를 생성하려면 `list()`함수를 사용하면 된다


```r
list01 = list(
  id = 'aaa',
  data = list(list(media_id = 'a01', like = 18, filter = 'filterA'), 
              list(media_id = 'a02', like = 5,  filter = 'filterB'), 
              list(media_id = 'a03', like = 23, filter = 'filterC')
              )
)

list01
```

```
## $id
## [1] "aaa"
## 
## $data
## $data[[1]]
## $data[[1]]$media_id
## [1] "a01"
## 
## $data[[1]]$like
## [1] 18
## 
## $data[[1]]$filter
## [1] "filterA"
## 
## 
## $data[[2]]
## $data[[2]]$media_id
## [1] "a02"
## 
## $data[[2]]$like
## [1] 5
## 
## $data[[2]]$filter
## [1] "filterB"
## 
## 
## $data[[3]]
## $data[[3]]$media_id
## [1] "a03"
## 
## $data[[3]]$like
## [1] 23
## 
## $data[[3]]$filter
## [1] "filterC"
```

---

## list 불러오기

리스트에 값을 저장했을 때, 데이터를 불러오는 방식은 크게 두 가지가 있다


<br />

### key-value의 형태

인덱싱을 통해 특정 데이터를 호출할 때 [] 를 사용하면 key값과 value값이 모두 반환되어 list 형식으로 값이 나오게 된다

숫자를 입력하면 1부터 시작하는 인덱스 번호로 호출되고

변수에 이름이 존재할 경우에는 이름으로 호출할 수도 있다


```r
list01['id']
```

```
## $id
## [1] "aaa"
```

```r
list01[1]
```

```
## $id
## [1] "aaa"
```


### value 값만 출력

반면에 [[]]를 이용해서 출력할 경우에는 key없이 value만 호출하게 된다

value 항목이 벡터 형태라면 벡터만 출력되고, 리스트 형태라면 리스트가 출력된다

마찬가지로 숫자를 넣으면 인덱스 번호로 호출한다

<br />

`$`를 통해 호출하는 경우에도 value만 출력된다


```r
list01[['id']]
```

```
## [1] "aaa"
```

```r
list01[['data']]
```

```
## [[1]]
## [[1]]$media_id
## [1] "a01"
## 
## [[1]]$like
## [1] 18
## 
## [[1]]$filter
## [1] "filterA"
## 
## 
## [[2]]
## [[2]]$media_id
## [1] "a02"
## 
## [[2]]$like
## [1] 5
## 
## [[2]]$filter
## [1] "filterB"
## 
## 
## [[3]]
## [[3]]$media_id
## [1] "a03"
## 
## [[3]]$like
## [1] 23
## 
## [[3]]$filter
## [1] "filterC"
```

```r
list01[[1]]
```

```
## [1] "aaa"
```

```r
list01$id
```

```
## [1] "aaa"
```

---

<br />

## list에서 데이터 추출하기

인스타그램에서 데이터를 성공적으로 받아왔다고 하면, 이제 거기에서 필요한 데이터만 꺼내서 정리해야 한다.

일정한 형태가 반복될 것이기 때문에 for문이나 sapply함수 등을 사용해서 정리할 수 있다

---

<br />

### list01의 data에서 media_id만 추출하기 - for문

빈 벡터를 하나 만들고, for문이 돌 때마다 값을 하나씩 추가한다


```r
media_id = c()
for(post in list01$data){
  media_id = c(media_id, post$media_id)
}

media_id
```

```
## [1] "a01" "a02" "a03"
```

---

### list01의 data에서 media_id만 추출하기 - sapply

`sapply`함수를 이용하면 `list01$data`의 각 항목을 `x`로 둘 때 `x$media_id`의 값을 벡터로 정리해서 반환해준다


```r
sapply(list01$data, function(x) x$media_id)
```

```
## [1] "a01" "a02" "a03"
```

```r
sapply(list01$data, function(x) x[['media_id']])
```

```
## [1] "a01" "a02" "a03"
```

<br />

---

## sapply?

첫 번째 인자로 들어오는 벡터 또는 리스트의 항목을 하나씩 그 뒤에 들어오는 함수에 대입시킨다

각 결과물을 벡터로 모아서 반환한다


```r
sapply(1:10, function(x) 2*x)
```

```
##  [1]  2  4  6  8 10 12 14 16 18 20
```

위 코드에서는 

1이 x에 반영되어 2*1

2가 x에 반영되어 2*2

...

10이 x에 반영되어 2*10

이 반복되어서 최종적으로는 2부터 20까지의 짝수 벡터가 출력된다

<br />

---

## 데이터를 data.frame에 정리하기

위에서는 간단하게 필요한 변수만 벡터로 저장해 보았다면 여기서는 여러 가지 변수들을 모아서 데이터 프레임으로 저장해 보려고 한다.

<br />

### list01$data 를 데이터 프레임으로 정리하기 - for문

row단위로 데이터를 합치게 된다

for문 안에서 1행의 데이터 프레임을 생성한 다음에 기존에 있던 데이터프레임의 마지막 행에 추가하는 형태로 반복한다


```r
df_data_for = c()
for(post in list01$data){
  df_data_for = rbind(df_data_for, 
					  data.frame(media_id = post$media_id, 
                                 like = post$like, 
                                 filter = post$filter))
}

df_data_for
```

```
##   media_id like  filter
## 1      a01   18 filterA
## 2      a02    5 filterB
## 3      a03   23 filterC
```



### list01$data를 데이터 프레임으로 정리하기 - sapply

col단위로 데이터를 합치게 된다

sapply함수를 이용해 각각의 열에 들어갈 자료를 벡터로 만들고 그 벡터들을 data.frame함수로 묶게된다


```r
df_data_sapply = data.frame(
  media_id = sapply(list01$data, function(x) x$media_id),
  like = sapply(list01$data, function(x) x$like),
  filter = sapply(list01$data, function(x) x$filter)
)

df_data_sapply
```

```
##   media_id like  filter
## 1      a01   18 filterA
## 2      a02    5 filterB
## 3      a03   23 filterC
```

<br />

---

## list 들을 합치는 방법들

api에서 한 번에 제공하는 데이터의 양은 한정되어있다

따라서 분석을 하기 위해서는 데이터를 계속 수집하면서 하나의 데이터셋으로 모아줄 필요가 있다

맨 처음에 생성했던 리스트와 동일한 형태로 list02라는 리스트를 생성한다


```r
list02 = list(
  id = 'bbb',
  data = list(list(media_id = 'b01', like = 8,  filter = 'filterD'), 
              list(media_id = 'b02', like = 15, filter = 'filterA'), 
              list(media_id = 'b03', like = 13, filter = 'filterB')))
```

---

<br />

첫 번째로 리스트를 합치는 방법은 벡터에서 처럼 `c()` 함수를 사용하는 것이다


```r
c(list01, list02)
```

```
## $id
## [1] "aaa"
## 
## $data
## $data[[1]]
## $data[[1]]$media_id
## [1] "a01"
## 
## $data[[1]]$like
## [1] 18
## 
## $data[[1]]$filter
## [1] "filterA"
## 
## 
## $data[[2]]
## $data[[2]]$media_id
## [1] "a02"
## 
## $data[[2]]$like
## [1] 5
## 
## $data[[2]]$filter
## [1] "filterB"
## 
## 
## $data[[3]]
## $data[[3]]$media_id
## [1] "a03"
## 
## $data[[3]]$like
## [1] 23
## 
## $data[[3]]$filter
## [1] "filterC"
## 
## 
## 
## $id
## [1] "bbb"
## 
## $data
## $data[[1]]
## $data[[1]]$media_id
## [1] "b01"
## 
## $data[[1]]$like
## [1] 8
## 
## $data[[1]]$filter
## [1] "filterD"
## 
## 
## $data[[2]]
## $data[[2]]$media_id
## [1] "b02"
## 
## $data[[2]]$like
## [1] 15
## 
## $data[[2]]$filter
## [1] "filterA"
## 
## 
## $data[[3]]
## $data[[3]]$media_id
## [1] "b03"
## 
## $data[[3]]$like
## [1] 13
## 
## $data[[3]]$filter
## [1] "filterB"
```

이렇게 하면 `list01$id`, `list01$data`, `list02$id`, `list02$data` 순으로 들어간다

따라서 각각의 항목을 [[1]], [[2]], [[3]], [[4]]로 호출할 수 있다

---

<br />

`c()` 함수에서 `recursive = TRUE` 옵션을 사용하면 list 안에 있는 내용을 모두 벡터로 반환한다



```r
c(list01, list02, recursive = TRUE)
```

```
##            id data.media_id     data.like   data.filter data.media_id 
##         "aaa"         "a01"          "18"     "filterA"         "a02" 
##     data.like   data.filter data.media_id     data.like   data.filter 
##           "5"     "filterB"         "a03"          "23"     "filterC" 
##            id data.media_id     data.like   data.filter data.media_id 
##         "bbb"         "b01"           "8"     "filterD"         "b02" 
##     data.like   data.filter data.media_id     data.like   data.filter 
##          "15"     "filterA"         "b03"          "13"     "filterB"
```

전체 항목이 벡터로 반환되는 것을 볼 수 있다

---

<br />

리스트의 형태로 두 리스트를 묶을 수도 있다


```r
list(list01, list02)
```

```
## [[1]]
## [[1]]$id
## [1] "aaa"
## 
## [[1]]$data
## [[1]]$data[[1]]
## [[1]]$data[[1]]$media_id
## [1] "a01"
## 
## [[1]]$data[[1]]$like
## [1] 18
## 
## [[1]]$data[[1]]$filter
## [1] "filterA"
## 
## 
## [[1]]$data[[2]]
## [[1]]$data[[2]]$media_id
## [1] "a02"
## 
## [[1]]$data[[2]]$like
## [1] 5
## 
## [[1]]$data[[2]]$filter
## [1] "filterB"
## 
## 
## [[1]]$data[[3]]
## [[1]]$data[[3]]$media_id
## [1] "a03"
## 
## [[1]]$data[[3]]$like
## [1] 23
## 
## [[1]]$data[[3]]$filter
## [1] "filterC"
## 
## 
## 
## 
## [[2]]
## [[2]]$id
## [1] "bbb"
## 
## [[2]]$data
## [[2]]$data[[1]]
## [[2]]$data[[1]]$media_id
## [1] "b01"
## 
## [[2]]$data[[1]]$like
## [1] 8
## 
## [[2]]$data[[1]]$filter
## [1] "filterD"
## 
## 
## [[2]]$data[[2]]
## [[2]]$data[[2]]$media_id
## [1] "b02"
## 
## [[2]]$data[[2]]$like
## [1] 15
## 
## [[2]]$data[[2]]$filter
## [1] "filterA"
## 
## 
## [[2]]$data[[3]]
## [[2]]$data[[3]]$media_id
## [1] "b03"
## 
## [[2]]$data[[3]]$like
## [1] 13
## 
## [[2]]$data[[3]]$filter
## [1] "filterB"
```

인스타그램에서 데이터를 받아오면 이런 형식일 것이다

첫 번째 항목([[1]])에 list01이 들어가고 두 번째 항목([[2]])에 list02가 들어간다

위에서 데이터를 data.frame으로 저장했던 방식을 응용하면 (for, sapply 또는 for + sapply) 필요한 항목만 정리할 수 있다
