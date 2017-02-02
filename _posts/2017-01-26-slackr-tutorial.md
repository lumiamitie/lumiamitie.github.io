---
layout: post
published: true
title: R에서 슬랙으로 메세지 보내기
mathjax: false
featured: false
comments: true
headline: How to Send Slack Messages in R
categories: R
tags: R slack
---

![cover-image](/images/taking-notes.jpg)

# R에서 슬랙으로 메세지 보내기

업무용 메신저로 주로 슬랙을 사용하다 보니, 어떻게든 슬랙을 활용해 볼 방법을 찾으려고 고민해보았다. 시간이 오래걸리는 작업이 끝날 때 알람을 받으면 좋겠다 싶어서 R을 이용해 슬랙 메세지 보내는 방법을 찾아보게 되었다. 스크린샷까지 자세하게 첨부하지는 못했지만, 어렵지 않으니 걱정말고 진행하면 된다!!

<br />

## 준비물

R에서 슬랙으로 메세지를 보내기 전에 준비해야 할 것들이 있다. 

- Slack에서 **API token**을 받아야 한다
	- 각 team의 App Directory (Apps & Integrations) > Build > Make a Custom Integration > Bots > Add Bot integration 으로 봇을 생성한다
	- App Directory > Manage > Custom Integrations > Bots > Add Configuration 로 들어간다
	- Bot을 등록하고 API token을 받는다
	- API token은 `xxxx-000000000000-aaaaaaaaaaaaaaaaaaaaaaaa` 과 같은 형태로 된 문자열이다
- `install.packages('slackr')` 로 **slackr 패키지**를 설치한다

<br />

## slackr 사용법

### 기본 세팅

먼저 `slackr_setup()` 함수를 이용해서 기본값을 세팅해두자. 가장 중요한 `api_token`은 필수적으로 세팅한다. `username`의 경우 봇의 이름을 지정할 수 있다. 필수는 아니지만 필요한 경우 원하는 이름으로 변경하면 된다.

```r
library(slackr)
slackr_setup(api_token = 'xxxx-000000000000-aaaaaaaaaaaaaaaaaaaaaaaa', username = 'rstudio')
```

<br />

### 단순 문자열 보내기

간단한 문자열은 `text_slackr` 함수를 통해 보낼 수 있다. channel 설정을 따로 하지 않으면 `#gerenal` 채널로 발송된다. 특정 사용자에게 보내려면 `@user_name`의 형태로 id 앞에 `@`을 붙여서 발송하면 된다.

자세한 내용을 알고 싶다면 [slack API](https://api.slack.com/methods/chat.postMessage) 를 참고하면 된다.

```r
text_slackr('Hello', channel = '#to_channel')
text_slackr('Hello', channel = '@slack_id')
```

`text_slackr` 함수에서 사용할 수 있는 옵션을 몇 가지 살펴보자. 

- `as_user = TRUE` 일 때 설정한 봇이 나에게 DM을 보낸다 (DM 리스트에 봇이름이 생긴다. 사용자처럼)
- `as_user = FALSE` 일 경우에는 slackbot이 메세지를 보낸다 (보내는 주체는 slackbot이지만 메세지를 받아보면 내가 설정한 이름으로 메세지가 와 있다)
- `preformatted = TRUE` 일 때 문자열 앞뒤에 backtick이 세 개씩 붙는다 (markdown format 형태로)
- `preformatted = FALSE` 일 때 일반 문자열 형태로 메세지를 받는다

<br />

### ggplot2 이미지 보내기

`ggplot2`로 그린 그래프를 그릴 때는 `ggslackr()` 함수를 쓰면 된다. 기본값으로 `last_plot()`을 사용하기 때문에 따로 그래프 오브젝트를 지정할 필요 없이 마지막으로 그린 그래프를 전송한다. 필요한 경우 원하는 그래프를 지정해서 사용하자. 

```r
library(ggplot2)
ggplot(iris, aes(x = Sepal.Length, y = Petal.Length)) + geom_point()
ggslackr(channels = '@slack_id')
```