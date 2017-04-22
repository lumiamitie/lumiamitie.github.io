---
layout: post
published: true
title: Mac 시에라에서 한글 로케일 문제 해결하기
mathjax: false
featured: false
comments: true
headline: Locale errors in R (Mac Sierra)
categories: R
tags: R Mac
---

![cover-image](/images/taking-notes.jpg)

# Mac Sierra

---

사실 이전부터 맥 시에라에서 이런저런 문제가 많이 생긴다는 소리는 듣고 있었다. 심지어 회사에서 쓰는 프로그램들과도 충돌이 많이 나는 편이었다. 굳이 그런 귀찮음을 감수하고서까지 버전업을 할 생각은 없었기 때문에 시에라에서만 등장하는 에러들은 정말 안중에도 없었다. (심지어 집에서 쓰던 개인용 맥북은 아직도 요세미티..) 그런데 마침 괜찮은 맥북에어 중고를 발견하여 질렀더니 판매자께서 친절하게 시에라로 세팅을 해주셨다. 그 때부터 고난(귀찮음)이 시작되었다.

<br /><br />

# R error

---

R과 R-Studio를 설치하고 실행을 해보니 다음과 같은 에러가 발생했다.

```
During startup - Warning messages:
1: Setting LC_CTYPE failed, using "C" 
2: Setting LC_COLLATE failed, using "C" 
3: Setting LC_TIME failed, using "C" 
4: Setting LC_MESSAGES failed, using "C" 
5: Setting LC_MONETARY failed, using "C" 
```

이게 뭔가 싶어서 로케일 설정을 확인해보니 전부 C로 설정되어 있는 것을 확인할 수 있었다.

```
Sys.getlocale()
[1] "C"
```

이게 무슨 문젠가 싶겠지만, 다음의 간단한 한 줄 짜리 코드를 실행시켜보자.

```
print('안녕')
[1] "\354\225\210\353\205\225"
```

 로케일이 제대로 설정되어있지 않기 때문에 한글을 제대로 표현하지 못한다. 맥에서 R을 사용하는 사람들이 흔히들 겪은 인코딩 문제와는 다른 로케일의 문제다. 개발자가 아닌지라 로케일과 인코딩에 차이에 대해서 정확하게 설명할 수는 없을 것 같아서  [Quora에 올라온 질문](https://www.quora.com/What-is-the-difference-between-locale-and-charset-or-encoding) 에 대한 답변을 대신 달아놓았다. 말하자면 로케일은 문자, 날짜, 정렬 방식 등 해당 지역/언어를 바탕으로 한 맥락을 설정한다. 그리고 인코딩은 특정 문자들이 어떤 bit로 구성되어 있는지를 정의한다. (이 부분에 대해서는 잘못된 부분이 있다면 설명 좀 부탁드립니다 ㅜㅜ)

 로케일 설정이 문제라면 강제로 R에서 로케일을 변경해보면 어떨까? 원래 문제가 생기지 않았다면 `ko_KR.UTF-8` 로 설정이 되어있어야 한다. `Sys.setlocale` 함수를 이용해서 강제로 로케일을 바꿔보자.
 
```
Sys.setlocale('LC_ALL', 'ko_KR.UTF-8')
[1] "ko_KR.UTF-8/ko_KR.UTF-8/ko_KR.UTF-8/C/ko_KR.UTF-8/C"

print('안녕')
[1] "안녕"
```

로케일을 바꿔보니 일단 한글이 출력은 되는 것을 확인할 수 있었다. 나중에는 또 무슨 문제가 생길지 알 수 없지만 일단 이 정도 수준에서 마음을 놓기로 했다. 

<br /><br />

# Setting Rprofile.site

---

문제를 근본적으로 해결하지는 못했지만, 우회할 가능성을 찾은 것 같다. 하지만 매번 실행시킬 때마다 로케일을 변경하는 것은 매우 귀찮은 작업이다. 그러니 R이 실행될 때 자동으로 로케일을 변경하도록 설정해보자.

맥 시에라에서 일반적인 방법으로 R을 설치했다면 `/Library/Frameworks/R.framework/Resources/etc` 위치에 `Rprofile.site` 라는 파일을 생성하면 된다. vi를 쓰든 서브라임텍스트를 쓰든 그냥 텍스트 편집 가능한 툴로 파일을 만들고 그 안에다가 `Sys.setlocale('LC_ALL', 'ko_KR.UTF-8')` 한 줄을 입력해서 저장한다. 이제 Restart R로 R을 다시 시작해보면 오류는 여전히 발생하지만 R 시작과 동시에 로케일을 변경해버리는 것을 확인할 수 있다.

<br /><br />

# 결론

---

`Rprofile.site` 세팅을 통해 사전에 동작할 함수들을 등록하는 방식으로 문제를 피해보았다. 하지만 이런 임시방편말고 근본적인 해결책을 찾으신 분이 계시다면 꼭 공유해주셨으면 한다. ㅜㅜ 참고로 위 세팅을 이용하면 매번 쓰는 라이브러리나 함수들을 자동으로 등록시켜버릴 수 있으니 활용하면 좋다.
