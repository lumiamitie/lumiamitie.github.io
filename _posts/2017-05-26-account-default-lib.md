---
layout: post
published: true
title: 사용자 계정별로 default library 설정하기
mathjax: false
featured: false
comments: true
headline: Setting Default libraries by system account
categories: R
tags: R library
---

![cover-image](/images/taking-notes.jpg)

# Setting Default libraries by system account

Rprofile.site를 설정하면 R이 실행되는 시점에 자주 쓰는 라이브러리를 불러오도록 할 수 있다. 그런데 로컬 환경같이 혼자서 쓰는 상황에는 별다른 문제가 없지만, 다른 사람들과 함께 사용하는 환경에서는 애매한 경우가 종종 있다. 누군가는 굳이 자동으로 라이브러리를 불러올 이유가 없다고 생각할 수 있고, 주로 사용하는 라이브러리가 서로 다를 수도 있다. 

회사 서버에서 작업할 때, 처음에는 공통으로 사용하는 라이브러리들만 자동으로 불러오도록 해놓았었다. 그러다가 최근에 사용자 계정별로 설정을 다르게 할 수 있도록 세팅해보았다. 혹시 비슷한 고민을 하는 분들이 있다면 요 방법도 고민해보시면 좋겠다.

일단 아래 내용은 CentOS 6.8 을 기준으로 한다. (맥에서도 동작하긴 한다. 하지만 로컬이면 그냥 하면 되니깐..)

<br /><br />

# Rprofile.site 세팅

## 어떤 방식으로 작동하면 좋을까

`/usr/lib64/R/etc/Rprofile.site` 에 있는 Rprofile.site 파일에 코드를 등록해놓으면 해당 코드가 R 실행시점에 동작한다. 우리가 해야 하는 작업은 다음과 같다.

```
[설정]
- 공통으로 불러올 라이브러리를 설정한다
- 각 사용자마다 불러올 라이브러리를 설정한다

[실제 동작]
1. 현재 사용자를 파악한다
2. 현재 사용자가 설정해둔 기본 라이브러리 (공통 + 사용자) 목록을 찾는다
3. 해당 라이브러리를 불러온다
```

## 코드를 짜보자

### 현재 사용자 파악하기

Centos에서 현재 사용자 이름을 알아내려면 `id -un` 명령어를 사용하면 되는 것 같다. 리눅스 시스템을 잘 몰라서 정확한 방법인지는 모르겠지만, 명령어를 입력해보니 사용자 이름이 반환되는 것을 확인할 수 있었다.

R에서 터미널 명령어를 직접 실행하려면 `system()` 함수를 사용하면 된다. `system('id -un')` 함수를 실행해보면 문자열이 프린트된다. 문자열 값을 반환받고 싶다면 `intern = TRUE` 옵션을 추가로 지정한다. 따라서 아래와 같이 함수를 구성할 수 있다.


```r
system_id = function() {
  system('id -un', intern = TRUE)
}
```

나중에 정리하다가 알게 된 것이지만, `Sys.getenv('USER')`를 사용해도 동일한 결과를 얻을 수 있었다. 이쪽이 더 깔끔한 것 같기도 하고.


### 라이브러리 불러오기

한꺼번에 라이브러리를 불러오는 함수를 만들어보자. `tidyverse` 라이브러리의 `tidyverse_attach` 함수가 동작하는 방식을 참고했다. 기본적으로는 `lapply` 함수를 이용해 `library` 함수를 동작시킨다.


```r
load_library = function(libs) {
  lapply(libs, library, character.only = TRUE, warn.conflicts = FALSE)
  invisible()
}
```

그런데 이렇게 코드를 짜놓고 보니 한 가지 문제점이 있었다. 목록 중간에 **존재하지 않는 라이브러리**가 있을 경우, 해당 항목보다 뒤에 위치한 라이브러리들은 로딩되지 않았다.


```r
# AAA라는 라이브러리가 존재하지 않는 경우, ggplot2도 불러오지 못한다
load_library(c('dplyr', 'AAA', 'ggplot2'))
```

그래서 존재하지 않는 라이브러리의 경우 건너뛸 수 있도록 함수의 구성을 살짝 변경하기로 했다. `library` 함수를 `try`로 감싸서, `try_library` 라는 함수를 만들었다. purrr이나 pryr의 `compose` 함수를 이용할 수도 있겠지만, 그냥 함수를 한 번 감싸서 간단하게 만들어 보았다. 완성된 함수는 다음과 같은 형태가 된다.


```r
load_library = function(libs) {
  try_library = function(l, ...) { try(library(l, ...)) }
  lapply(libs, try_library, character.only = TRUE, warn.conflicts = FALSE)
  invisible()
}
```

### 설정 구성하기

yaml이라든지 설정용 파일을 따로 빼버릴까 고민도 좀 했지만, 간단하게 list를 만들기로 했다. 공통적으로 겹치는 라이브러리가 있을 수 있으니, public 항목으로 빼고, **사용자이름 - 라이브러리 목록** 으로 구성된 list를 만들었다.


```r
startup_loading_libs = list(
  public = c('DBI', 'rJava', 'RJDBC'),
  userA = c('data.table', 'reshape2', 'ggplot2', 'stringi', 'lubridate', 'RMySQL',
           'Hmisc'),
  userB = c('data.table', 'arules'),
  userC = c('tidyverse', 'V8')
)
```

### 라이브러리 로딩

필요한건 다 만든 것 같다. 이제 `startup_loading_libs[['public']]` 과 `startup_loading_libs[[사용자]]` 에 정의된 라이브러리들을 로딩하는 작업만 추가하면 된다.

<br /><br />

## 결과물

최종적으로 완성된 코드는 다음과 같다.


```r
system_id = function() {
  system('id -un', intern = TRUE)
}

load_library = function(libs) {
  try_library = function(l, ...) { try(library(l, ...)) }
  lapply(libs, try_library, character.only = TRUE, warn.conflicts = FALSE)
  invisible()
}

startup_loading_libs = list(
  public = c('DBI', 'rJava', 'RJDBC'),
  userA = c('data.table', 'reshape2', 'ggplot2', 'stringi', 'lubridate', 'RMySQL',
           'Hmisc'),
  userB = c('data.table', 'arules'),
  userC = c('tidyverse', 'V8')
)

startup_load = function(startup_libs) {
  # 현재 시스템 user_id 받아오기
  current_id = system_id()
  # message로 출력할 default id : public
  message_id = 'public'
  
  # public / private lib 설정
  public_lib = startup_libs[['public']]
  user_lib = startup_libs[[current_id]]
  libs = unique(c(public_lib, user_lib))
  
  # 라이브러리 로드
  load_library(libs)
  
  # startup_loading_libs에 현재 id가 있으면 그 값으로 대체
  if (current_id %in% names(startup_libs)) {
    message_id = current_id
  }
  # 메세지
  message('Initialize Library Settings : ', current_id)
  
  # NULL값을 리턴하고, 화면에는 표시하지 않음
  invisible()
}

# 사용자별 기본 라이브러리 로딩!
startup_load(startup_loading_libs)
```
