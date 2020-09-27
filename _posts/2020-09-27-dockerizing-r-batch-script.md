---
layout: post
published: true
title: Dockerizing R Batch Scripts
mathjax: false
featured: true
comments: true
headline: Dockerizing R Batch Scripts
categories: R
tags: R Docker
---

![cover-image](/images/taking-notes.jpg)

# Dockerizing R Batch Scripts

데이터 분석이나 모델링 업무를 하고 있다면, 정해진 작업을 매시간 또는 매일 수행하는 배치 작업 스크립트를 한 번쯤은 작성하게 될 것이다. 그리고 작성한 스크립트를 서버에 올려두고, 젠킨스나 에어플로우 등 다양한 도구를 통해 원하는 주기로 동작하도록 만든다. 그동안 나는 이러한 작업을 주로 파이썬을 통해 처리해왔다. 아무래도 주변에 파이썬 개발자 분들이 많다 보니 도움을 청하기도 용이했고, 참고할 만한 좋은 자료가 많았기 때문이었다. 그러다 최근에 R로 협업해야 할 일이 생기면서, 나중에 활용할 수 있도록 R 배치작업 템플릿을 만들어 보기로 했다. 

예전에 R을 통해 배치 스크립트를 작성할 때는 다음과 같은 부분을 잘 처리하는 것이 까다로웠다.

- 분석 환경과는 별도로 격리된 환경에서 스크립트가 동작해야 한다 (분석 환경의 라이브러리를 업데이트 하더라도 배치 작업에 영향을 주어서는 안된다)
- 로컬 환경에서 돌던 작업이 서버에서도 동일하게 동작해야 한다
- 각 스크립트를 기능별로 깔끔하게 모듈화하여 처리하고 싶다

위 문제들을 해결하기 위해 도커와 `modules` 라이브러리를 적용해보았고, 배치 스크립트를 작성하는데 도움이 되는 몇 가지 라이브러리를 추가했다.

최종 결과물을 [Github Repository (lumiamitie/r_docker_script_template)](https://github.com/lumiamitie/r_docker_script_template) 에 올려두었으니 참고하시기 바란다.

# Dockerizing R Scripts

여기서 도커에 대해 자세한 설명을 하지는 않는다. 도커를 사용하면 맥이든 윈도우든 내 로컬 컴퓨터든 서버든 모든 곳에서 동일한 환경을 유지할 수 있게 해준다고 이해하면 된다. 

보통 도커를 사용할 때는 다른 사람들이 만들어 둔 베이스 이미지에 내가 필요한 추가 작업들을 덧붙이는 방식으로 사용한다. 그 내용을 `Dockerfile` 이라는 파일에 저장해두고, 여기에 적힌 내용을 통해 도커 이미지를 만든다.

나는 `rocker` 에서 만든 tidyverse 3.6.1 버전 이미지를 사용할 것이다. [Dockerhub](https://hub.docker.com/u/rocker) 에서 확인해보면 rocker 에서 제공하는 다양한 이미지를 확인할 수 있다. 

```docker
FROM rocker/tidyverse:3.6.1
```

다음으로는 리눅스 환경에서 설치해야 하는 항목들을 추가한다. 컨테이너 내에서 스크립트를 직접 수정할 일이 종종 생기기 때문에 vim을 설치해두었다. 리눅스 환경에서 설치해야 하는 것들은 다음 스크립트에서 수정하면 된다.

```docker
RUN apt-get update \
    && apt-get install -y vim
```

이제 스크립트가 동작하는데 필요한 R 라이브러리를 설치한다. `rocker/tidyverse` 이미지는 `littler` 라이브러리의 샘플 스크립트를 사용하여 필요한 패키지를 설치한다. 필요한 R 라이브러리가 있다면 추가한다.

[참고: Littler Examples](https://cran.r-project.org/web/packages/littler/vignettes/littler-examples.html)

```docker
RUN install2.r --error \
    # 모듈 및 배치작업을 위한 라이브러리들
    modules \
    docopt \
    logger \
    # 예제 스크립트를 동작시키기 위해 필요한 라이브러리를
    cranlogs \
    forecast
```

이번에는 로케일 및 시간대를 변경한다. 언어와 시간대를 고려할 필요가 없다면 이 부분은 스킵해도 된다. 

```docker
RUN sed -i 's/^# \(ko_KR.UTF-8\)/\1/' /etc/locale.gen \
    && localedef -f UTF-8 -i ko_KR ko_KR.UTF-8
ENV LC_ALL ko_KR.UTF-8
ENV TZ Asia/Seoul
RUN echo 'TZ=Asia/Seoul' >> /usr/local/lib/R/etc/Renviron
```

다음은 도커 내 워킹 디렉토리를 설정하고, 프로젝트의 모든 스크립트를 이동시킨다. 굳이 이렇게 파일을 복사하는 이유는 도커의 캐싱 기능을 활용하기 위해서이다. `Dockerfile` 의 스크립트는 각 단계별로 변동 사항이 없다면 캐싱된 값을 사용하게 된다. 따라서 스크립트를 변경되었지만 사용하는 라이브러리 세팅이 동일하다면, 파일을 복사하는 부분만 다시 실행하고 나머지 설치 과정은 스킵할 수 있다. 

```docker
WORKDIR /app
COPY . ./
```

모든 과정을 종합하면 최종적으로 아래와 같은 `Dockerfile` 을 작성하게 된다.

```docker
# 3.6.1 버전의 tidyverse 이미지를 베이스로 사용한다
FROM rocker/tidyverse:3.6.1

# 컨테이너 내에서 스크립트를 직접 수정할 일이 종종 생기기 때문에 vim을 설치해둔다
RUN apt-get update \
    && apt-get install -y vim

# 스크립트를 실행하는데 필요한 R 라이브러리를 설치한다
RUN install2.r --error \
    # 모듈 및 배치작업을 위한 라이브러리들
    modules \
    docopt \
    logger \
    # 예제 스크립트를 동작시키기 위해 필요한 라이브러리를
    cranlogs \
    forecast

# 기본 로케일을 "ko_KR.UTF-8" 로 변경한다
RUN sed -i 's/^# \(ko_KR.UTF-8\)/\1/' /etc/locale.gen \
    && localedef -f UTF-8 -i ko_KR ko_KR.UTF-8
ENV LC_ALL ko_KR.UTF-8

# Timezone을 설정하고, R 환경에 반영한다
ENV TZ Asia/Seoul
RUN echo 'TZ=Asia/Seoul' >> /usr/local/lib/R/etc/Renviron

# Working directory를 설정하고, 프로젝트 내의 모든 스크립트를 도커 컨테이너 안에 복사한다
WORKDIR /app
COPY . ./
```

# Modules in R

R로 작성한 배치 스크립트가 복잡해지면서 다양한 문제들이 발생하기 시작했다. 2명 이상이 동시에 한 프로젝트를 작업하게 되니, 함수를 기능별로 묶고 스크립트를 쪼개는 방식으로 작성하기로 했다. 그런데 `source()` 함수를 통해 스크립트를 불러오게 되면 각 스크립트가 서로 영향을 주기 쉬운 상태가 되는 문제가 있었다. 작업 과정에서 다음과 같은 문제들이 툭하면 튀어나왔다.

- 지금 사용하고 있는 함수가 어느 스크립트에서 불러온 것인지 확인하기 어렵다
- 서로 다른 스크립트에서 `library` 함수를 사용할 때마다 기존 함수들을 덮어씌워서 코드가 꼬인다
- 알 수 없는 곳에서 `stats::filter` 가 `dplyr::filter` 를 덮어씌운다
- `source` 함수를 사용하면 굳이 불러올 필요가 없는 값/함수 까지 가져오게 된다

이러한 문제들을 깔끔하게 해결할 수 있는 방법이 있는지 리서치를 해봤다. 최종적으로 `modules` 라이브러리의 방식이 내가 원하던 방향과 가장 유사했고, CRAN에도 올라있는 라이브러리였기 때문에 사용하게 되었다.

modules 라이브러리를 사용하면 다음과 같은 형태로 스크립트를 모듈화할 수 있다.

```r
#### /app/run.r ####
# /app/src 디렉토리 내의 모든 R 모듈 스크립트를 가져온다
lib <- modules::use("src")

# /app/src/utils.r 의 함수
TARGET_DATE <- lib$utils$get_date(dt)
# /app/src/data.r 의 함수
data <- lib$data$get_data(PACKAGE, TARGET_DATE)
# /app/src/fit.r 의 함수
model <- lib$fit$fit_arima(data$train)

# 이렇게 파일 단위로 불러와도 된다
# utils <- modules::use("src/utils.r")
# utils$get_date(dt)
```

이번에는 모듈 스크립트를 어떻게 작성했는지 살펴보자. 기본적인 컨셉은 함수의 import, export 를 명시적으로 수행하는 것이다.

- import
    - 필요한 라이브러리, 또는 특정 라이브러리의 원하는 함수를 입력한다
    - `import("라이브러리")`
    - `import("라이브러리", "함수1")`
    - `import("라이브러리", "함수1", "함수2", ...)`
- export
    - 해당 모듈에서 내보낼 함수의 이름을 입력한다
    - `export("함수1", "함수2", ...)`

```r
#### /app/data.r ####
# import할 라이브러리/함수
import("cranlogs", "cran_downloads")
import("lubridate", "ymd")
import("logger", "log_info")
import("glue", "glue")
import("dplyr")

# 해당 모듈에서 내보낼 함수
export("get_data")

# 실제 함수 구현
get_data <- function(package, target_dt) {
  log_info(glue("Package : {package}, Target date : {target_dt}"))

  to <- ymd(target_dt)
  from <- to - (100 - 1)
  data <- cran_downloads(package = package, from = from, to = to)

  list(
      train = data %>% filter(date < (to - 19)),
      test = data %>% filter(date >= (to - 19))
  )
}
```

다만 일부 함수를 사용할 때는 주의해야 할 점이 있다. R에서 모델링 결과를 바탕으로 예측할 때는 일반적으로 `predict` 함수를 사용한다. 이 함수는 `stats` 라이브러리에 generic 함수가 존재하기 때문에, 다른 라이브러리의 `predict` 함수를 사용할 때도 `stats::predict` 를 import 해야 사용할 수 있다. 

```r
# ...
# import generic function "predict"
import("stats", "predict")

# ...

forecast_arima <- function(model, n = 20) {
    as.numeric(predict(model, n.ahead = n)$pred)
}
```

# Miscellaneous

## docopt

배치 스크립트를 작성할 때 가장 귀찮은 점 중 하나가 바로 파라미터를 입력받고, 도움말을 작성하는 부분일 것이다. 이런 귀찮은 작업들은 잘 만들어진 라이브러리를 사용하는 것이 생산성을 높이는 데 도움이 된다. 여기서는 [docopt](http://docopt.org/) 라이브러리를 사용했는데, 다음과 같은 특징이 있다.

- Help Message를 먼저 작성하고, 그 문구를 파싱하여 스크립트를 구성한다
- Python의 `docopt` 에서 영향을 받아 만들어졌기 때문에 사용법이 거의 동일하다

협업이나 인수인계를 고려하면 도움말을 잘 작성하는 것이 매우 중요하다. 하지만 스크립트를 작성하다 보면 도움말을 작성하는 작업은 우선순위에서 밀리기 쉽다. `docopt` 를 사용하면 도움말을 먼저 작성하게 되기 때문에 스크립트를 사용하게 될 다른 사람들(과 멍청한 미래의 나)에게 도움이 된다.

또한 파라미터별 필수/옵션 여부, 기본값, 배타적으로 사용해야 하는 옵션들 등 다양한 기능을 쉽게 적용할 수 있기 때문에 여러 파라미터가 필요한 작업이라면 꼭 사용해보길 권한다.

```r
#### /app/run.r ####
# 도움말을 작성한다. 크게 세 부분으로 이루어져 있다.
# - 무슨 스크립트인지 설명한다
# - 사용 방법을 설명한다
# - 사용 가능한 옵션을 설명한다
doc <- "
Sample batch script using R.

Usage:
  run.r [--target_dt=<date>] [--package=<p>]
  run.r (-h | --help)
  runBatch.r --version

Options:
  -h --help            Show this screen.
  --version            Show version.
  --target_dt=<date>   Target date [default: today].
  --package=<package>  Target package [default: dplyr].
"

# 도움말 문서를 파싱하여 arguments 객체에 저장한다
arguments <- docopt::docopt(doc, version = "1.0\n")
```

해당 라이브러리의 자세한 사용법은 [docopt 공식 문서](http://docopt.org/)에서 확인할 수 있다.

## logger

스크립트가 정상적으로 동작하여 운영 모드에 돌입하게 되면, 배치 작업이 잘 돌고 있는지, 시간은 얼마나 걸리는지, 에러가 났다면 어떤 문제가 있는 건지 체크하는 일이 많아진다. 이 때 편리한 작업을 위해서는 꼼꼼하게 로그를 남겨두는 것이 도움이 된다. 여기서는 [logger 라이브러리](https://github.com/daroczig/logger)를 사용하여 로그를 남겨보았다.

```r
logger::log_info("log for information")
# INFO [2020-09-27 23:33:15] logger for information

logger::log_warn("log for warning")
# WARN [2020-09-27 23:34:35] log for warning

logger::log_error("log for error")
# ERROR [2020-09-27 23:34:19] log for error

logger::log_fatal("log for fatal error")
# FATAL [2020-09-27 23:34:50] log for fatal error
```

`tryCatch` 를 이용한 예외 처리와 함께 logger를 사용하면, 문제가 발생했을 때 로그를 통해 원인을 파악하는데 도움을 받을 수 있다.

```r
# (1) 에러가 발생하지 않을 경우 Info 로거가 실행되었다
tryCatch({
  logger::log_info("Success")
}, error = function(e) {
  logger::log_error("Error : ", e$message)
})
# INFO [2020-09-27 23:37:29] Success

# (2) 에러가 발생해서 Error 로거가 실행되었다
tryCatch({
  stop("Something happened...")
  logger::log_info("Success")
}, error = function(e) {
  logger::log_error("Error : ", e$message)
})
# ERROR [2020-09-27 23:37:37] Error : Something happened...
```

# Executing batch script

배치로 실행할 R 스크립트를 작성하고, 도커 이미지까지 준비가 완료되었다. 이제 배치작업을 쉽게 실행시킬 수 있도록 `docker-compose` 스크립트를 작성해보자. 위에서 생성한 도커 이미지가 실제로 작동하려면 **"컨테이너"** 를 만들어야 하는데, 이 컨테이너를 만들 때 필요한 다양한 파라미터를 미리 정의해두는 역할을 한다.

아래 파일을 작성하고 `docker-compose.yaml` 로 저장한다. 몇 가지 중요한 부분만 보면 다음과 같은 것들이 정의되어 있다.

- `Dockerfile` 파일을 가져와서 빌드한다
- 컨테이너가 실행되면 `r run.r` 스크립트를 실행한다

```yaml
version: '3.5'
services:
  svc_r_batch:
    build:
      context: .
      dockerfile: ./Dockerfile
    container_name: r_batch
    stdin_open: true
    tty: true
    command: r run.r
```

이제 스크립트를 실행하려면, `docker-compose.yaml` 파일이 있는 위치로 이동해서 `docker-compose up` 명령을 사용하면 된다. 여기에 `—-build` 옵션을 추가하면 스크립트가 변경될 때마다 전체 스크립트를 다시 컨테이너 안으로 복사한다.

```bash
# 프로젝트 디렉토리로 이동 (docker-compose.yaml 파일이 있는 곳)
cd r_docker_script_template

# 도커 빌드 후 지정된 스크립트 실행
docker-compose up --build
```

# Conclusion

배치 작업의 세부적인 구조에 따라 디테일한 내용은 달라지겠지만, 위에서 설명한 내용으로도 기본적인 요구 사항들은 상당 부분 해결할 수 있을 것이다. 이 포스팅에는 없지만 추가로 고민해 볼만한 요소들은 다음과 같다.

- `renv` 를 통해 패키지 디펜던시들을 원하는 버전으로 고정시키기
- `testthat` 으로 테스트 스크립트 작성하기
- 환경변수 및 DB config 정보들 관리하기
