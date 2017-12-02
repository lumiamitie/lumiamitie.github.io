---
layout: post
published: true
title: 비동기 프로그래밍 with Future (R-adv week1)
mathjax: false
featured: true
comments: true
headline: Asynchronous programming in R w. Future
categories: R
tags: R future async
---

![cover-image](/images/taking-notes.jpg)

# Intro

## R 중급 스터디

최근 주위 사람들과 함께 R중급 스터디를 시작하게 되었다. 여기서 **중급**이라는 단어를 붙이게 된 것은, 단순히 다른 사람들이 만들어 놓은 코드와 라이브러리를 가져다 쓰는 것이 아니라 **재사용 및 배포 가능한 R 프로그래밍**을 목표로 하기 때문이다. 

R을 사용하는 사람 중에서 상당수는 전문적인 개발자보다는 도구로서 코딩을 사용할 줄 아는 사람인 경우가 많다. 그렇기 때문에 사용자가 컨텐츠의 소비자이면서 동시에 생산자가 되는 다른 오픈소스 커뮤니티 보다는 수동적인 소비자로 남아있는 사용자 층이 더 두꺼울 것이라고 생각한다. (데이터 보는 일로 밥벌어먹으면서 이렇게 단정해도 될지는 모르겠다. 시간이 된다면 관련된 데이터를 수집해봐야지...) 

잘 만들어진 라이브러리/프레임워크는 각 언어 생태계에 지대한 영향을 미친다. 잘 만들어진 언어가 아니라 라이브러리 생태계가 잘 구성된 언어가 오래 살아남는 것이 아닐까?? 그렇다면 정들어버린 이 R이라는 생태계가 건강하게 지속될 수록 있도록 생산자로서 각자가 성장해야 한다. 튜토리얼을 정리하고, 새로운 분석 기법을 공유하고, 잘 정리한 코드를 라이브버리로 배포하는 과정에서 개인뿐만 아니라 커뮤니티도 성장하게 될 것이다. 새로운 언어를 배우는게 사실 귀찮기는 하니까.. 되도록이면 R이 망하지 않고 오래오래 살아남았으면 하는 바람이다.

잡소리가 길어졌는데, 결국 스터디에서는 중기 목표로 각자 R 패키지를 만들어보기로 했다. 그리고 그 전까지는 R 프로그래밍 자체에 대한 것들. 분석이나 시각화 작업을 할 때는 사실 중요하지 않지만 패키지를 만들 때는 중요할 수 있는 그런것들을 공부하려고 한다. 일단 첫 주차는 **비동기 프로그래밍**, 그리고 다음 주차에는 **R OO System: S3, S4, R6 **에 대해서 진행한다.

<br />

## 비동기 프로그래밍

 일반적으로 우리가 짜둔 코드는 순차적으로 실행된다. js의 호이스팅 등 코드가 실행되는 순서가 바뀌는 경우는 있겠지만, 보통은 어떤 규칙에 의해 실행될 순서가 정해지고 처리자는 (CPU의 코어라고 보면 되겠다) 순서대로 일을 처리한다. 회사든 조모임이든 어떤 상황에서 혼자 일을 하게 되는 경우를 생각해보자. 혼자 일을 처리하기 때문에 편한 점이 분명히 있다. 히스토리도 내가 다 알고 있고, 누군가의 트롤링을 고민하지 않아도 된다. 커뮤니케이션으로 인한 시간 낭비도 없다. 하지만 일이 너무 많아진다면 나 혼자로는 벅차고 일이 밀리게 될 것이다. 또, 일하고 있는데 갑자기 급하게 서류를 받으러 갈 일이 생겼다고 해보자. 내가 직접 받을 필요는 없지만 거리가 멀어서 다녀오려면 시간이 꽤 걸릴 것 같고, 안받자니 언제 다시 받을 수 있을지 기약이 없다.
 
 뭐 이런저런 상황이 발생한다면 결국 내가 해야하는 일의 일부를 다른 사람에게 위임하게 된다. 여전히 내가 메인 담당자이지만, 일부 업무를 위임하고 나는 내 업무를 하면서 다른 사람들이 작업을 완료하는 것을 기다릴 수 있다. 이러한 형태의 처리 방식을 **비동기** 라고 한다. 너무 일상적인 상황으로 비유를 들다보니 실제 프로그래밍에서 발생하는 내용과는 거리가 있을 수 있지만, 큰 틀에서 비동기 프로그래밍을 이해하는데는 도움이 될 것이다.

 사실 개발이 아닌 분석 일을 할 때는 비동기 어쩌구 하는 이야기를 들을 일은 별로 없다. 없었던 것 같다. 하지만 가끔 d3를 가지고 시각화 작업을 할 때는 나도 모르는 사이에 많이 사용하고 있었다. `d3.json()` 함수 등으로 외부의 데이터를 불러오는 작업이 보통 비동기로 진행된다. 데이터 불러온다고 화면이 멈추면 안되니까, 데이터를 불러다가 그래프를 그리는 구간은 위임하게 된다. 일단은 깊게 원리를 이해하지는 못하더라도 특정 상황에 어떻게 사용하는지 방법을 익히는 정도로 들여다보자.

<br /><br />

# Introduction to Future

`future` 라이브러리를 사용해서 간단한 비동기 코드를 작성하는 방법을 알아보자.


```r
# install.packages('future')
library('future')
```

## Basics

future 라이브러리를 이용해서 코드를 작성하는 방법을 살펴보자. 

```r
# 1.
v1 = {
  cat('Plain R Code...\n')
  123
}                     #>>> Plain R Code...
v1                    #>>> 123

# 2.
v2 %<-% {
  cat('Future: basic\n')
  123
} %plan% sequential   #>>> Future: basic
v2                    #>>> 123

# 3.
v3 %<-% {
  cat('Future: Multiprocess')
  123
} %plan% multiprocess #>>> <Nothing>
v3                    #>>> 123
```

위 코드에서 v1은 일반적인 R 구문이다. v2와 v3는 서로 다른 plan을 사용하는 future 구문을 나타낸다. future 구문은 기본적으로 다음과 같은 형태로 구성된다.

- `<-` 또는 `=` 연산자 대신 `%<-%` 연산자를 사용하고 있다.
- 실행할 코드 블럭 뒤에 `%plan%` 연산자를 통해 코드가 동작하는 방식을 결정한다.

```
var01 %<-% {
  expr
} %plan% future_plan
```

v2를 동작시킬 때는 cat 함수 안에 있는 내용이 출력된다. 하지만 v3에서는 출력되지 않는다. 뒤에서 더 자세히 살펴보겠지만, v2는 작업을 위임하지 않은 상태고 v3는 (다른 코어로) 작업을 위임한 상태이다. 따라서 결과물을 반환받기 전까지 다른 동작들에 대해서는 쉽게 확인하기 어려운 상태가 된다.

<br />

## Implicit vs Explicit

사실 위에서 살펴본 future 구문은 암묵적으로 Future를 생성한 것이다. 원래 Future는 다음과 같은 두 가지 단계로 동작한다

1. Future를 생성한다 (업무 위임)
2. 작업이 완료되면 결과를 받아온다

Implicit Future는 위 두가지 작업이 한번에 동작한다. 

```
v %<-% { expr } # Creates a Future & Gets the value of the Future
```

Explicit Future는 각 단계를 구분한다.

```
f <- future({ expr }) # Creates a Future
v <- value(f)         # Gets the value of the future (if resolved)
```

future를 explicit하게 선언하면 발생하는 future 객체로 작업이 완료되었는지 여부를 확인할 수 있다. 아래 코드에서 `f1` 변수에 future를 생성했다면, `resolved(f1)` 으로 완료 여부를 확인할 수 있다. 작업이 끝나면 해당 함수는 TRUE를 반환한다.


```r
f1 = future({
  cat('Explicit Future...\n')
  123
})

resolved(f1) # 완료되었다면 TRUE, 작업 중이라면 FALSE
v1 = value(f1)
```

Implicit하게 Future를 생성한 경우에는 `futureOf` 함수를 통해 다시 future 객체를 반환받을 수 있다.


```r
v1 %<-% {
  cat('Implicit Future...\n')
  123
}

f1 = futureOf(v1) # Future obj를 추출해서
resolved(f1) # 작업의 완료 여부를 확인할 수 있다
```

<br />

## Evaluation Strategy

위에서는 Future를 통해 작업을 생성하는 방법을 알아보았다. 이번에는 작업이 동작하는 방식에 대해서 알아보자.

future에서는 작업이 동작하는 시점, 그리고 위치에 따라서 평가 전략을 나눈다. 예를 들면

* 위치
    * Synchronous: 현재 R 세션에서 작업이 실행 (Default)
    * Asynchronous: 다른 세션에서 작업 실행
* 동작 시점
    * Eager: 실행 즉시 동작 (Default)
    * Lazy: 값을 반환해야 하는 시점에 동작

기본적으로 future에서는 현재 세션에서 실행되고, 실행하는 즉시 동작하는 형태(eager)를 기본값으로 한다. 이러한 평가전략을 해당 라이브러리에서는 `sequential` 이라고 한다. 자주 사용하게 될 몇 가지 평가 전략에 대해서 살펴보자.

### 1) Synchronous Future

#### 1-1) Sequential

위에서 설명했듯이, future가 동작하는 기본적인 방식이다. 즉시 동작(Eagerly)하고, 현재 세션에서 실행된다(Synchronously).

평가 전략을 세팅하는 방법은 두 가지가 있다. 하나는 `%plan%` 연산자를 사용하는 것이고, 하나는 `plan()` 함수를 쓰는 것이다. 연산자를 사용하면 해당 future에만 설정이 적용되지만, plan 함수를 쓰면 이후의 future에도 모두 적용되기 때문에 현재 plan 상태를 잘 확인하면서 진행해야 한다.

- `v %<-% { expr } %plan% sequential` : 해당 future에만 설정
- `plan(sequential); v %<-% { expr }` : 전역 설정


```r
plan(sequential)
a = 1
x %<-% {
  a = 2
  a * 2
}
x ## 4
a ## 1
```

#### 1-2) Transparent

Sequential plan은 현재 세션에서 동작하고 바로 생성되지만, 격리된 environment에서 동작한다. 따라서 중간에 발생하는 에러에 대해서는 대처하기 쉽지 않다. 따라서 이러한 상황에서 내부를 투명하게 살펴볼 수 있도록 **transparent** 라는 특수한 sequential plan이 존재한다. transparent plan에서는 에러 메세지들이 동작하는 과정 중에서 바로바로 발생한다. 또 assignment 등 동작이 현재 환경에서 동작하기 때문에 변수가 변화하는 과정을 쉽게 추적할 수 있다. sequential과 다른 점을 비교해보기 위해 다음 코드를 살펴보자.


```r
plan(sequential)
a = 1
x %<-% {
  a = 2
  stop('stop')
  a * 2
} # 에러가 발생하지 않는다
x # Error: stop
a # 1
```


```r
plan(transparent)
a = 1
x %<-% {
  a = 2
  stop('stop')
  a * 2
} # Error: stop
x # Error: stop
a # 2
```

강제로 에러가 발생하는 상황을 만들기 위해 중간에 `stop` 함수를 넣었다. sequential plan에서는 future를 생성할 때 에러가 발생하지 않는다. 하지만 x 변수를 호출하는 순간 에러가 발생한다. 그리고 future 내부에서 `a = 2` 라는 할당 작업이 수행되었지만 격리된 환경이기 때문에 기존에 정의해둔 `a = 1` 이라는 값에는 영향을 주지 않는다.

반면에 transparent에서는 future를 생성하는 과정에서 에러가 바로 발생한다. 그리고 `a = 2`로 변경되어 있는 것을 확인할 수 있다.

<br />

### 2) Asynchronous Future

#### 2-1) Multiprocess

Asynchronous Future에도 여러 가지 종류가 있지만, Multiprocess plan의 사용법만 살펴보고 넘어갈 것이다. Multiprocess는 **기본적으로 multicore 플랜을 시도하고, multicore 사용이 불가능한 환경에서는 multisession 플랜을 사용**해서 동작한다. 두 플랜의 차이점은 다음과 같다.

- **Multisession** : 동일한 프로세스의 다른 R 세션에서 동작한다
- **Multicore**    : 현재 R 프로세스를 포크해서 동작한다 (Multisession보다 빠르지만 윈도우에선 지원하지 않는다)


```r
# 가능한 코어 수를 미리 확인해보자!!
availableCores() 
```

```
## system 
##      4
```

지금은 테스트로만 확인하면 되니까, 다른 프로세스에서 동작하는지 id값만 확인해보자. 실행하는 환경마다 pid 값은 다르게 나오기 때문에 a와 f1 값이 다르게 나오기만 하면 된다.


```r
plan(multiprocess)

a = Sys.getpid()
f1 %<-% {
  Sys.getpid()
}

a ## [1] 19966
f1 ## [1] 19977
```

<br /><br />

# Case Study: Geocoding

자, 이제 배운 내용을 어디에 써먹을 수 있을지 확인해보자. 비동기 방식이 최대한의 효율을 낼 수 있으려면, 업무를 위임하는 형태의 작업이 효과적인 상황이 필요하다. 분석가가 맞이하게 될 상황 중에서는 다음과 같은 것들이 있다.

- DB, Hive로 작업이 오래 걸리는 쿼리를 (여러개) 보내는 경우
- 외부 API 서버에 작업을 요청하는 경우

특히 한 번 돌리는데 10분 걸리는 하이브 쿼리를 6개 돌린다면, 순서대로 하면 60분이 걸리겠지만 동시에 처리할 수 있다면 10분에 끝날 수도 있다. (이론적으로는 그렇다... 아무 생각없이 작업 막 날리다보면 리소스 부족해서 작업 kill 당하는 경우도 있으니 조심조심)

일단 여기서는 구글 지오코딩을 가지고 실습을 해보도록 하자. 크롤링은 생각보다 빠르게 동작하지만 지오코딩은 결과를 반환받는데 생각보다 시간이 오래걸리기 때문에 비동기/병렬처리를 수행할 때 효과를 많이 볼 수 있다. 일단 ip 또는 계정별로 하루에 요청할 수 있는 쿼리 수 제한이 있기 때문에 작업하면서 계속 확인을 해야 한다. 지오코딩은 `ggmap` 패키지에 있는 함수를 사용한다.


```r
# Check remaining queries
ggmap::geocodeQueryCheck()

## 2500 geocoding queries remaining.
```


## 1) 그냥

일단은 future 없이 그냥 해보자! 분당선 지하철역 13군데의 위도/경도 값을 가져온다.


```r
bundang_lines = c('분당선 왕십리역', '분당선 서울숲역', '분당선 압구정로데오역', '분당선 강남구청역',
                  '분당선 선정릉역', '분당선 선릉역', '분당선 한티역', '분당선 도곡역', '분당선 구룡역',
                  '분당선 개포동역', '분당선 대모산입구역', '분당선 수서역', '분당선 복정역')

a = Sys.time()
bundang_lines_location = lapply(bundang_lines, function(x) list(station = x, lonlat = ggmap::geocode(x)))
b = Sys.time()

b - a ## Time difference of 9.371381 secs
```

```r
bundang_lines_location[1:3]

## [[1]]
## [[1]]$station
## [1] "분당선 왕십리역"
## 
## [[1]]$lonlat
##        lon      lat
## 1 127.0355 37.56113
## 
## 
## [[2]]
## [[2]]$station
## [1] "분당선 서울숲역"
## 
## [[2]]$lonlat
##        lon      lat
## 1 127.0446 37.54313
## 
## 
## [[3]]
## [[3]]$station
## [1] "분당선 압구정로데오역"
## 
## [[3]]$lonlat
##        lon      lat
## 1 127.0406 37.52739
```

<br />

## 2) Distributed Tasks: Multiprocess + listenv

두 번째는 모든 요청을 잘게 쪼개서 각각의 future로 만드는 것이다. 사용할 수 있는 모든 코어를 활용해서 동시에 요청한다. 아래 코드에서 future 객체를 implicit하게 리스트에 할당하려고 할 때, 일반 list 대신 `listenv` 라이브러리의 list environment를 사용해야 한다는 점에 주의하자.


```r
c = Sys.time()
bundang_lines_location2 = listenv::listenv()
for (i in seq_along(bundang_lines)) {
  bundang_lines_location2[[i]] %<-% {
    target_station = bundang_lines[[i]]
    list(station = target_station,
         lonlat = ggmap::geocode(target_station))
  } %plan% multiprocess
}
d = Sys.time()
d-c # Time difference of 3.722796 secs
```

```r
as.list(bundang_lines_location2)[1:3]

## [[1]]
## [[1]]$station
## [1] "분당선 왕십리역"
## 
## [[1]]$lonlat
##        lon      lat
## 1 127.0355 37.56113
## 
## 
## [[2]]
## [[2]]$station
## [1] "분당선 서울숲역"
## 
## [[2]]$lonlat
##        lon      lat
## 1 127.0446 37.54313
## 
## 
## [[3]]
## [[3]]$station
## [1] "분당선 압구정로데오역"
## 
## [[3]]$lonlat
##        lon      lat
## 1 127.0406 37.52739
```

<br />

## 3) Async Tasks

세 번째는 그냥 작업을 통째로 위임하는 형태이다. 현재 메인 프로세스와는 별개의 작업만 구성하고 완료되면 결과를 확인한다. future 안에서 결과물을 반환하기 전에 slack 메세지를 하나 보내놓으면 다른 작업을 하다가 확인하기도 좋다. 


```r
bundang_lines_future3 = future({
  result = lapply(bundang_lines, function(x) list(station = x, lonlat = ggmap::geocode(x)))
  result
}) %plan% multiprocess
# if (resolved(bundang_lines_future3)) bundang_lines_location3 = value(bundang_lines_future3)
```

아래 코드처럼 while문을 사용해서 작업이 완료되는 것을 기다릴 수도 있다. 동시에 여러 작업을 수행하고 있다면 모든 future가 완료되었을 때 나머지 작업을 진행할 수 있도록 코드를 구성할 수도 있다. 일단 while이 돌아가면 block 되는건 똑같으니까, 필요한 경우에 잘 활용하면 된다.


```r
while ( !resolved(bundang_lines_future3) ) {
  bundang_lines_location3 = value(bundang_lines_future3)
}
```


<br /><br />

# 참고자료

[The future package provides an API for futures (or promises) in R](https://www.r-bloggers.com/asynchronous-and-distributed-programming-in-r-with-the-future-package/)

[A Future for R: A Comprehensive Overview](https://cran.r-project.org/web/packages/future/vignettes/future-1-overview.html)

[Wikipedia: Futures and promises](https://en.wikipedia.org/wiki/Futures_and_promises)
