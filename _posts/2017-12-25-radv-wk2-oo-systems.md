---
layout: post
published: true
title: R OO Systems (R-adv week2)
mathjax: false
featured: true
comments: true
headline: OO Systems in R (S3, S4, R6)
categories: R
tags: R
---

![cover-image](/images/taking-notes.jpg)

# Various OO Systems in R

R에서는 클래스와 메소드가 어떤 식으로 정의되는지에 따라 몇 가지 서로 다른 객체지향 시스템이 존재한다. 이러한 내용은 일반적으로 R을 사용하는 사람들은 몰라도 큰 지장이 없다. 하지만 패키지를 만든다거나 하는 목적으로 언어 자체에 대한 공부를 하게되면 한 번씩은 거쳐가는 관문인 것 같다. 공부하다 보니 R로 프로그래밍을 입문한 경우에도, 다른 언어를 먼저 사용하다가 넘어온 경우에도 언어 자체의 컨셉을 이해하는 것은 중요한 문제라는 생각이 든다. 우리가 사용하는 R이라는 언어가, 도구가 어떠한 특성을 가지도록 설계되어 있는지 파악할 수 있는 계기가 되었으면 한다.

다시, R에서는 클래스와 메소드가 어떤 식으로 정의되는지에 따라 몇 가지 서로 다른 객체지향 시스템이 존재한다. S3, S4, RC, R6 네 가지의 주된 시스템 중에서 RC를 제외한 나머지 세 가지 OO System이 어떤 식으로 객체를 생성하고 메소드를 적용하는지 살펴보려고 한다. 간단하게 컨셉적인 내용만 살펴보자면 다음과 같은 차이가 있다.

<br />

## 1) S3

R에서 가장 먼저 등장했고, 가장 단순한 형태의 OO 시스템. base, stat 및 CRAN에 존재하는 많은 라이브러리가 S3를 바탕으로 구성되어 있다. Generic Function을 중심으로 시스템이 구성되어 있다.

<br />

## 2) S4

기본적으로 S3와 비슷한 방식으로 동작하지만 더 formal한 형태를 가진다. S3와 다른 점은 크게 두 가지가 있다.

- S3와 비교했을 때 훨씬 formal한 방식으로 클래스와 상속을 표현한다
- 제네릭과 메소드를 정의할 때 Naming Convention에 의존하지 않고 명시적으로 함수를 이용한다

arules, Matrix 등 일부 라이브러리가 S4를 기반으로 구성되어 있다. Bioconductor에는 S4를 기반으로 동작하는 라이브러리가 상당수 존재한다.

<br />

## 3) RC (Reference Class)

S3나 S4와는 다르게 Reference Semantic을 기반으로 동작하는 시스템이다. S4를 기반으로 짜여져있다.

<br />

## 4) R6

RC와 비슷하지만 더 경량화된 버전의 시스템이다. R6는 S3를 기반으로 동작하고 라이브러리 형태로 제공된다.

<br /><br />

---

# 각 시스템 비교

## S3

S3에서 클래스는 객체에 "Class Attribute"를 덧붙이는 형태로 동작한다. 그리고 Generic fucntion을 통해서 각 클래스에 맞는 함수를 구현한다.

<br />

### 객체 생성하기

`soju` 라는 클래스의 객체를 하나 만들어보자. `structure` 함수는 객체에 특정한 attribute를 설정하는 역할을 한다. class attribute를 부여하는 방식으로 S3 객체를 생성할 수 있다.


```r
chamisl = structure(list(n_bottles = 3), class = 'soju')
class(chamisl)
```

```
## [1] "soju"
```

객체의 변수는 $ 를 통해서 접근한다


```r
chamisl$n_bottles
```

```
## [1] 3
```

S3의 경우 새로운 값을 제한없이 추가할 수 있다


```r
chamisl$new_value = 1
chamisl$new_value
```

```
## [1] 1
```

위에서는 `structure` 함수를 이용했지만, list를 먼저 만들고 나서 나중에 class를 등록해도 된다


```r
c1 = list(n_bottle = 3)
class(c1) = 'soju'
```

<br />

### Generic & Method

R을 처음 배우기 시작했을 때 신기했던 것이 있는데, 어떤 객체든지 간에 plot 함수 하나만 사용하면 해당 자료형에 맞는 시각화를 해준다는 사실이었다. 데이터프레임이든, 행렬이든, 시계열이든 plot 함수에만 넣으면 일단 결과물이 나온다. S3에서는 **제네릭(generic)** 함수를 이용해서 위와 같은 결과를 가능하게 한다.

- **제네릭**은 입력받은 객체에 맞는 함수(메소드)를 찾아주는 역할을 한다.
- **메소드**에는 특정 class에 대한 제네릭 함수의 동작을 정의해둔다.

위와 같은 과정을 **Method Dispatch** 라고 한다

`plot(iris)` 함수를 예로 들면, 

1) plot 제네릭은 iris 데이터의 타입을 확인해서 (data.frame) 해당하는 메소드(graphics:::plot.data.frame)로 연결시킨다.

2) data.frame 자료형이 입력되었을 때 plot 함수가 어떻게 동작해야 하는지 plot.data.frame 이라는 함수(Method)에 정의되어 있다.

S3 시스템에서 메소드를 구성할 때는 함수의 이름을 특정한 형태로 만들어야 한다. 제네릭 함수가 생성되어 있을 때, 메소드는 `generic.class()` 라는 형태의 함수로 정의한다. lm 클래스에 대한 summary 함수는 `summary.lm`, factor 클래스에 대한 print 함수는 `print.factor` 라는 이름으로 구성한다.

S3의 제네릭과 메소드를 생성하는 방법에 대해서 살펴보자


```r
# Generic Function 만들기
drink = function(x) UseMethod('drink')

# generic.class 의 형태로 구성된다
drink.soju = function(x) print('Bad...')
```


```r
# drink.soju가 실행된다
drink(chamisl)
```

```
## [1] "Bad..."
```

사전에 등록되지 않은 Class에 대해서는 `<generic>.default` 에 정의해두면 된다. 


drink 제네릭의 기본 동작을 정의해보자


```r
drink.default = function(x) print('...???')
drink(chamisl)
```

```
## [1] "Bad..."
```

등록되지 않은 클래스에 대해서는 default 동작이 실행된다


```r
unknown_drink = structure(list(n_bottles = 1), class = c('abc'))
drink(unknown_drink)
```

```
## [1] "...???"
```

두 개 이상의 클래스가 등록되어 있지만 첫 번째 클래스에 대해서는 동작이 정의되지 않은 경우, 나머지 클래스를 순차적으로 탐색한다.


```r
# 두 가지 클래스가 동시에 적용되었지만, orange_juice 클래스에 대한 메소드는 없다 
#   -> soju 클래스로 적용
unknown_drink2 = structure(list(n_bottles = 1), class = c('orange_juice', 'soju'))
drink(unknown_drink2)
```

```
## [1] "Bad..."
```

<br />

제네릭과 메소드 디스패치를 활용하는 방식이 가지는 장점 중 하나는 동일한 인터페이스를 유연하게 확장할 수 있다는 점이다. 누군가 새로운 클래스를 만들었는데 `summary` 함수를 확장시켜서 해당 클래스에 적용할 수 있게 만든다고 해보자. 우리는 summary 함수의 원래 정의를 수정하거나 덮어씌우는 작업을 하지 않고도, summary 제네릭에 메소드를 하나 더 추가하는 방식으로 기능을 확장시킬 수 있게 된다. 

파이썬에서는 비슷한 기능을 `functools.singledispatch` 를 통해 제공한다.

<br /><br />

---

## S4

S4는 S3와 유사한 형태로 되어 있지만 몇 가지 차이점이 있다

- setClass() 함수를 통해 훨씬 formal한 형태로 클래스를 정의한다
- S3에서는 $ 연산자를 통해 객체의 attribute에 접근했다면, S4에서는 @ 연산자를 통해 객체의 Slot에 접근한다
- 함수의 네이밍이 아니라 setMethod() 함수를 통해 메소드를 정의한다

<br />

### 객체 생성하기

S4에서는 `setClass` 함수를 통해 클래스를 생성한다. 각 슬롯의 타입도 클래스 생성 시점에 명시한다.


```r
.beer = setClass('beer', slots = c(type = 'character', cnt = 'numeric'))
.stout = setClass('stout', contains = 'beer', slots = c(brewery = 'character'))

guinness = .stout(type = 'stout', brewery = 'my_brewery', cnt = 1)
```

`sealed=TRUE` 옵션을 사용하면 해당 클래스를 다시 정의할 수 없게 잠근다


```r
.sealedBeer = setClass('sealedBeer', slots = c(type = 'character', cnt = 'numeric'), sealed = TRUE)
.sealedBeer2 = setClass('sealedBeer')
# Error in setClass("sealedBeer") : 
#  "sealedBeer"는 보호된 클래스 정의이므로 재정의될 수 없습니다
```

slot에 접근하려면 $ 연산자 대신 @ 를 사용해서 접근한다


```r
guinness@brewery
```

```
## [1] "my_brewery"
```

`slotNames` 함수를 사용하면 해당 객체의 모든 slot 정보를 확인할 수 있다


```r
slotNames(guinness)
```

```
## [1] "brewery" "type"    "cnt"
```

<br />

### Generic & Method 

S4의 Generic function은 S3와 비슷하지만 조금 더 formal한 구조를 가지고 있다. 제네릭은 `setGeneric`, 메소드는 `setMethod`라는 함수를 통해서 생성하게 된다.


```r
setGeneric('s4drink', function(x) standardGeneric('s4drink'))

setMethod('s4drink', 'beer', function(x) {
  message('[S4] Drinking Beer....')
})

setMethod('s4drink', 'stout', function(x) {
  message('[S4] Drinking Stout....')
})
```

```r
cass = .beer(type = 'koreanBeer', cnt = 1)
s4drink(cass)
```

```
## [S4] Drinking Beer....
```

```r
s4drink(guinness)
```

```
## [S4] Drinking Stout....
```

<br /><br />

---

## RC

RC의 경우 여기서는 다루지 않으려고 한다. 필요한 경우 [Advanced R: RC](http://adv-r.had.co.nz/OO-essentials.html#rc) 에서 관련된 내용을 볼 수 있다.

<br /><br />

---

## R6

R6는 S3나 S4와는 다르게 캡슐화된 형태의 OO System을 제공한다. 큰 차이점은 다음과 같다.

- 메소드는 제네릭 함수에 연결되어 있지 않고, 객체 내부에 존재한다
- Mutable한 객체를 제공한다

위와 같은 말들이 구체적으로 어떤 것들은 의미하는지에 대해서는 밑에서 설명하려고 한다. 우선 기본적인 사용법에 대해서 알아보자. R6는 라이브러리 형태로 제공된다.

<br />

### 객체 생성하기

R6 라이브러리의 `R6Class` 함수를 이용해서 객체를 생성한다. 파이썬 등의 언어에서 클래스를 접해보았다면 쉽게 익숙해질 수 있는 형태로 구성되어 있다. 우선은 가장 기본적인 요소에 대해서만 살펴보자.

- **classname** : R6 객체가 S3의 Method Dispatch를 사용할 수 있도록 S3 기준의 클래스명을 입력할 수 있게 한다. (밑에서 pub 인스턴스를 만든 후에 `class(pub)` 으로 확인해보면 `"Brewery" "R6"` 라는 두 개의 S3 클래스가 등록된 것을 확인할 수 있다)
- **public** : public 멤버를 정의한다. 함수나 프로퍼티 등이 들어갈 수 있다. `initialize` 라는 함수를 만들어 두면 인스턴스가 생성될 때 수행되는 동작을 정의할 수 있다
- **private** : 객체 외부에서는 접근할 수 없는 멤버를 정의한다


```r
Brewery = R6::R6Class(
  classname = 'Brewery',
  public = list(
    initialize = function(name, location) {
      self$name = name
      self$location = location
    },
    name = NULL,
    location = NULL,
    add = function(item) { private$tap_list = c(private$tap_list, item) },
    show = function() { private$tap_list }
  ),
  private = list(
    tap_list = c()
  )
)

pub = Brewery$new(name = 'pub01', location = 'Gangnam')
```

public에 정의된 필드는 $ 연산자로 접근할 수 있다


```r
pub$name
```

```
## [1] "pub01"
```

```r
pub$location
```

```
## [1] "Gangnam"
```

public에 정의된 메소드도 $ 연산자를 통해 접근할 수 있다


```r
pub$add('IPA')
pub$add('Session')
pub$add('Kolsch')
pub$add('Lager')
```

Private 요소에는 직접 접근할 수 없다


```r
pub$tap_list
```

```
## NULL
```

메소드를 통해서는 Private 요소에 접근할 수 있다


```r
pub$show()
```

```
## [1] "IPA"     "Session" "Kolsch"  "Lager"
```

<br />

### S3와의 차이점

- S3와 S4의 경우 객체를 변경하려고 하면 기존에 존재하던 객체를 복사한 후 변경한다. (Copy-On-Modify)
- 반면에 R6에서는 객체를 직접 변경한다. (Modify-in-place)

다음 예시를 통해 구체적인 사례를 살펴보자.


```r
a = 20
b = a
b = 10
a
```

```
## [1] 20
```

b의 값이 변경되었지만 a의 값은 여전히 20이다 (Immutable)


R6의 경우에는 어떨까??


```r
r6_value = R6::R6Class(
  public = list(
    initialize = function(value) { self$value = value },
    value = NULL
  )
)

r6_a = r6_value$new(20)
r6_b = r6_a
r6_b$value = 10
r6_a$value
```

```
## [1] 10
```

`r6_b`의 값이 변경되자 `r6_a`의 값도 바뀌는 것을 볼 수 있다. (Mutable)

이러한 특성의 차이는 강점을 보이는 상황이 다르다. 따라서 필요한 상황에 적절하게 사용하면 된다.

<br /><br />

---

# 결론

사실 최종 사용자들이 워낙 S3에 익숙해져있다 보니, 어떻게 시스템을 구성하든지 간에 S3와 유사한 형태로 사용할 수 있도록 최종 인터페이스가 결정되는 것 같다. 하지만 알고서 사용하는 것과 몰라서 그냥 사용하는 것에는 엄청난 차이가 있지 않을까. 양질의 라이브러리(성능좋고+쓰기편하고)를 공유해주시는 분들이 늘어나서 생태계가 더 풍성해졌으면 하는 바람이다.

<br /><br />

---

# 참고자료

- [Advanced-R : OO Field Guide](http://adv-r.had.co.nz/OO-essentials.html)
- [Google's R Style Guide](https://google.github.io/styleguide/Rguide.xml)
- [Introduction to R6](https://cran.r-project.org/web/packages/R6/vignettes/Introduction.html)
- [Advanced-R SE: R6](https://adv-r.hadley.nz/r6)
