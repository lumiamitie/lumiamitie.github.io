---
layout: post
published: true
title: R6 - Modify in place
mathjax: false
featured: false
comments: true
headline: R6 modify in place vs copy on modify
categories: R
tags: R R6
---

![cover-image](/images/taking-notes.jpg)

# R6 : Modify-in-place

[이전 글](http://lumiamitie.github.io/r/R6-basics/)에서 R6는 **Modify-in-place**라는 표현을 사용했다. 실제로 메모리 주소가 어떻게 변하는지 간단하게 살펴보도록 하겠다.

R에서 메모리와 관련된 내용은 [Advanced R](http://adv-r.had.co.nz/memory.html) 을 참고했다.

<br />

---

### CASE : R default

iris 데이터를 하나 복사한다. R은 기본적으로 객체를 변화시키지 않기 때문에 object를 변경하는 동작을 취하면 object를 복사한다.


```r
iris_test = iris
```


`pryr`패키지의 `address` 함수를 이용하면 해당 오브젝트의 메모리 주소를 확인할 수 있다


```r
pryr::address(iris_test)
```

```
## [1] "0x88c6d08"
```

이제 `iris_test`의 값을 변경하고 다시 메모리 주소를 확인해보자


```r
iris_test[2,2] = 0
pryr::address(iris_test)
```

```
## [1] "0xadae5a8"
```

메모리 주소가 변경되었다. 어떠한 오브젝트를 변경하면 실제로는 object를 복사한 후에 값을 변경하는 방식으로 동작한다는 것을 확인할 수 있다.

---

### CASE : R6

이번에는 R6 패키지를 불러오고 `Iris` 라는 클래스를 생성한다. data라는 field를 만들어서 iris데이터를 입력했다.


```r
library(R6)
Iris = R6Class("Iris",
               public = list(
                 data = iris
               ))
```

인스턴스를 생성하고 메모리 주소를 확인한다


```r
r6_iris = Iris$new()
pryr::address(r6_iris)
```

```
## [1] "0x7bc32b0"
```

위에서 했던 것과 마찬가지로 값을 변경하고 메모리 주소를 확인한다


```r
r6_iris$data[2,2] = 0
pryr::address(r6_iris)
```

```
## [1] "0x7bc32b0"
```

내부의 값을 변경했지만 메모리 주소는 변경되지 않았다는 것을 볼 수 있다.
