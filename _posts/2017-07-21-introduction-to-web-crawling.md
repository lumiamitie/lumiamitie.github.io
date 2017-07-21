---
layout: post
published: true
title: 웹 크롤링에 대해서
mathjax: false
featured: true
comments: true
headline: Introduction to web crawling and scraping
categories: Web
tags: R python web crawling
---

![cover-image](/images/taking-notes.jpg)

# Intro

이 글은 원래 대학교 데이터 분석 학회의 팀 세션에서 크롤링 과정을 간단하게 설명하기 위해 쓰기 시작했다. **웹에 대해서 자세하게는 모르지만 데이터를 긁어야 하는 일이 종종 생기는 비개발자를 위해**, 크롤링에 대한 간단한 설명과 일반적인 케이스들, 그리고 주의해야 할 점들을 정리해 보았다. 실제 팀 세션에서는 다른 발표 자료들이 있기 때문에 이 글 만으로는 비어 있는 부분이 있을 수 있다. 하지만 처음 접하는 분들에게 혹시라도 도움이 될까 싶어서 블로그에도 올려두기로 했다. 

이 글을 읽는다고 크롤링을 할 수 있게되는 것은 아니다. 여기서는 라이브러리의 사용법을 알려주는 것도 아니고, CSS Selector 쓰는 방법을 보여주지도 않는다. 하지만 전체적인 흐름을 파악하고 나면 최소한 이 크롤링 작업을 내가 빠르게 할 수 있을지 없을지 견적?을 내는데 도움이 될 것이다. 

<br />
<br />

# 웹 크롤링

<hr />

## 크롤링?

데이터 분석과 관련된 활동을 하다 보면 **크롤링** 이라는 말을 흔히 들을 수 있다. 웹에 있는 데이터를 수집해서 저장하는 과정을 우리는 *크롤링한다* 라고 표현하고 있다. 이 작업은 크게 두 부분으로 나누어진다. 하나는 원하는 페이지를 탐색하고 다른 페이지로 옮겨다니는 것, 또 하나는 도달한 페이지의 내용을 가져와서 원하는 형태로 가공하는 것이다. 전자를 웹 크롤링 (Web Crawling), 후자를 웹 스크레이핑 (Web Scaping) 이라고 한다. 보통은 이러한 과정을 묶어서 그냥 **크롤링** 이라고 해버리고 있다. 

## 원하는 페이지 찾아다니기

일단 데이터를 구하려면, 데이터가 존재하는 웹 페이지들을 찾아다녀야 한다. 여기서는 웹 페이지를 찾아다니는 방식을 크게 두 가지로 나누어 보려고 한다.

* <1> URL로 직접 접근
    * URL 주소의 패턴을 통해 다음 주소를 파악
    * 해당 페이지에 존재하는 링크를 파싱해서 다음 주소를 파악
* <2> 웹 브라우저를 사용
    * Selenium을 이용해 웹 브라우저를 직접 컨트롤
    * PhantomJS 등 Headless 브라우저를 사용

URL로 직접 접근하는 방식은 가장 단순하게 크롤링을 수행할 수 있다. 원하는 URL로 웹서버에 직접 요청을 보내고, 웹서버가 응답을 해주면 그 결과를 파싱해서 데이터를 추출한다. URL의 구조가 단순해서 패턴이 바로 보이는 경우, 예를들면 `target-web-page.com/page/10/` 등 순서를 유추할 수 있는 경우 특정 문자열을 바꾸기만 해도 원하는 페이지로 이동할 수 있게 된다. 이러한 패턴은 대개 직접 웹 페이지에서 원하는 페이지를 클릭해 보면서 판단할 수 있다. 가끔은 원하는 페이지에서 다른 페이지로 이동하는 링크를 찾아서 옮겨가야 하는 경우도 있다. 하지만 기본적으로 URL을 통해 직접 요청하는 방식은 동일하다. 가능하다면 이렇게 URL로 직접 요청을 하는 방식을 사용하는 것이 좋다.

위와 같은 방식으로는 원하는 결과물을 얻기가 쉽지 않을 때, 할 수 있는 방법 중 하나가 웹 브라우저의 도움을 얻는 것이다. 문제가 될 수 있는 상황은 여러 가지가 있는데, 대표적으로 다음과 같은 상황이 있다.

* 로그인해서 데이터를 가져와야 한다
* 클릭, 폼 전송 등 사용자의 인터랙션이 필요하다
* 서버에서 보내는 HTML 결과물이 내가 보는 화면과 다르다

사용자의 액션이 필요하거나, 자바스크립트를 이용해 웹페이지를 동적으로 구성할 경우에는 단순하게 서버에 요청하는 것 만으로는 원하는 결과물을 얻기 힘들 때가 많다. 따라서 이런 경우에는 웹 브라우저를 직접 컨트롤해서 브라우저를 통해 결과물을 전달받는 방식을 사용한다. 대표적으로 **Selenium**을 많이 사용한다. Selenium을 사용하면 크롬/파이어폭스/사파리 등 원하는 브라우저를 파이썬/R 코드를 통해 동작시킬 수 있다. 클릭, 키보드 입력 등을 모두 코드를 통해 구현할 수 있기 때문에 사용자의 액션을 따라할 수 있다. 또한 브라우저가 JS 코드를 동작시켜서 HTML을 동적으로 렌더링 해주기 때문에 동적으로 구성되는 페이지라도 완전한 결과물을 확인할 수 있게 된다. 액션이 진행되는 과정을 눈으로 확인하려면 Selenium이 동작시키는 브라우저 화면을 보면 된다. 하지만 그런 과정 확인 없이 동작만 잘 하면 된다- 라고 생각한다면, PhantomJS 등 **Headless Browser**를 사용하면 된다. 헤드리스 브라우저는 그냥 화면이 존재하지 않는 웹 브라우저라고 생각하면 된다. 화면이 존재하지 않기 때문에 눈에는 보이지 않지만, 웹 브라우저이기 때문에 동적으로 구성되는 페이지도 렌더링할 수 있다. 따라서 서버상에서 동작시키거나 굳이 화면을 켜놓고 싶지 않은 상황에서 사용한다.


## 웹페이지의 데이터를 가져오기 (요청)

웹 브라우저를 통해 직접 접근하게 되면 요청을 우리가 직접 할 필요는 없다. 하지만 URL로 직접 연결해야 할 경우, 서버에 적절한 요청을 하지 못하면 제대로 된 응답 (우리가 원하는 웹페이지) 을 받지 못하게 될 수도 있다. 보통 HTTP 메서드 중에서도 GET을 많이 사용하게 되고, 가끔 필요한 경우 POST 요청을 하게 될 수 있다. GET 요청의 경우 URL 뒤에 모든 파라미터가 붙고, POST 요청의 경우 전송되는 파라미터가 URL 상으로는 알 수 없다는 눈에 띄는 차이점이 존재한다. 우리가 원하는 페이지가 GET / POST 중 어떤 요청을 사용하는지 확인하려면 크롬 개발자도구의 네트워크 항목을 들어가보면 확인할 수 있다. 

GET과 POST의 구체적인 차이점이 궁금하다면 다음 블로그의 포스팅을 참고하자. <https://blog.outsider.ne.kr/312>

이 부분은 파이썬에서는 주로 `requests`, R에서는 `httr`을 사용해서 처리할 수 있다.

## 웹페이지의 데이터를 가져오기 (결과)

어떤 방식을 사용했든지 간에 원하는 HTML 결과를 얻었다고 생각해보자. (결과물이 XML, 또는 json일 수도 있다. 일단은 HTML에 대해서만 생각해보자) 하지만 우리가 얻어낸건 태그들이 가득한 문자열이다. 이 문자열들로부터 원하는 데이터를 얻어내기 위해서는 HTML을 파싱할 수 있는 도구를 사용해야 한다. 일반적으로 파이썬을 사용해 HTML을 처리한다면 	`BeautifulSoup`를 사용하게 된다. R을 사용할 경우 `rvest`나 `RCurl` 등을 사용한다.

<br />
<br />

# 실습

<hr />

미디어 다음( <http://media.daum.net/> )에서 실시간 이슈 키워드를 가져와보자

![](/images/post_image/intro_to_crawling/issue_capture.png)

## Python

```python
import requests
from bs4 import BeautifulSoup
import pandas as pd

# 크롤링하려는 웹 페이지
target_url = 'http://media.daum.net/'

# GET 요청
r = requests.get(target_url)

# HTML 파싱
html_result = BeautifulSoup(r.content, 'lxml')

# <실시간 이슈> 항목의 내용들을 선택한다
trending_keywords_list = html_result.select('#mAside > div.aside_g.aside_search > ul > li')

# 전체 / 뉴스 / 연예 / 스포츠 항목을 돌면서 각 항목의 이슈 키워드를 추출하고 pandas DataFrame으로 정리한다
df_list = []
for cate in trending_keywords_list:
    trend_category = cate.select('div.cont_aside > strong')[0].text
    trend_keyword = [x.text for x in cate.select('a.link_txt')]
    
    df_list.append(
        pd.DataFrame({
            'category': trend_category,
            'ranking': range(1, len(keyword_ranking)+1), 
            'keyword': trend_keyword
        })
    )

# 각 카테고리별 DataFrame을 하나로 합친다
total_trend_keyword = (
  pd.concat(df_list)
    .reset_index()
    .drop('index', axis=1)
    .loc[['category', 'ranking', 'keyword']]
)
```

## R

```r
library('rvest')
library('dplyr')

# 원하는 페이지의 HTML을 파싱
html_result = read_html('http://media.daum.net/')

result_list = html_result %>% 
  html_nodes('#mAside > div.aside_g.aside_search > ul > li') %>% 
  lapply(function(x) {
    # 전체 / 뉴스 / 연예 / 스포츠 항목
    title = x %>% html_node('div.cont_aside > strong') %>% html_text
    # 키워드 목록
    keywords = x %>% html_nodes('a.link_txt') %>% html_text
    # 각 항목을 tibble dataframe으로 정리
    data_frame(title = title,
               rank = seq_along(keywords),
               keywords = keywords)
  }) %>% 
  bind_rows
```

<br />
<br />

# 크롤링하는 과정에서 주의해야 할 점

<hr />

## 한글 인코딩

한글로 표기된 데이터를 가지고 작업을 해봤다면 한 번쯤 인코딩과 관련된 문제를 겪어보았을 것이다. 요즘에는 그래도 많은 페이지들이 UTF-8 인코딩으로 작성되어 있지만, 여전히 EUC-KR (또는 CP949) 로 되어있는 페이지들이 있다. 데이터를 긁어왔는데 한글만 깨진다면 인코딩 문제를 의심해 볼 수 있겠다. `<head>` 안에 있는 **meta 태그**를 확인해보자. `<meta charset="utf-8">` 이라면 크게 신경쓰지 않아도 될 것이다. euc-kr을 사용하는 웹페이지의 대표적인 사례.... http://stat.yonsei.ac.kr/

## 서버의 방해

실제로 서비스를 사용하는 것도 아니면서 데이터만 노리는 우리 같은 사용자를 서버쪽에서 좋아할 리가 없다. 데이터 좀 긁어보겠다고 짧은 시간 동안에 엄청나게 많은 수의 요청을 서버로 날리게 되면, 해당 요청을 처리하느라 실제 서비스 사용자들에게 영향을 미칠 수 있다. 따라서 이에 대한 대비가 잘 되어있는 경우 서버측에서 정상적인 서비스 사용 패턴을 보이지 않는 사용자에 대해서 요청을 거부할 수가 있다. 1초 안에 일정 수 이상의 요청이 동시에 날아오거나, 일정한 시간 간격을 두고 요청이 오는 등 서버 내에서 비정상 사용자를 감지하는 특정한 룰을 정하고 사용자를 거부하는 경우가 존재한다. 보통은 시간당 요청 수를 제한하고, 요청과 요청 사이의 간격에 난수를 부여하는 등 다양한 방법으로 대처한다. 피해가려면 많은 방법이 있겠지만, 전문적인 크롤러를 작성하려는 것이 아니라면 일정 부분은 포기하는 것도 방법이다 (속도를 포기하거나, 완전한 자동화를 포기하거나)

## 주기적인 데이터 저장

서버에 1초에 1번 요청하는 속도로 10000건의 페이지를 긁어야 하는 상황을 가정해보자. 10000번째 페이지를 긁어오는 작업이 완료되면 정리한 결과물을 모아서 DB 서버에 올리는 방식으로 코드를 짜두었다. 그런데 9999번째 페이지를 긁다가 원인 모를 이유로 프로그램 작동이 중단된다면?? 그 동안 참고 기다려온 시간이 헛수고가 되어 버린다. 금방 끝내는 작업이라면 모르겠지만, 시간이 오래 걸리는 작업이라면 중간 결과물을 파일로 남겨 만일을 대비하는 것도 좋은 방법이다. 

<br />
<br />

# 참고자료

<hr />

## BeautifulSoup

* BeautifulSoup Document
    * <https://www.crummy.com/software/BeautifulSoup/bs4/doc/>
* 나만의 웹 크롤러 만들기 with Requests/BeautifulSoup
    * <https://beomi.github.io/2017/01/20/HowToMakeWebCrawler/>
* 나만의 웹 크롤러 만들기(2): Login with Session
    * <https://beomi.github.io/2017/01/20/HowToMakeWebCrawler-With-Login/>

## rvest

* Web Scaping with rvest
	* <http://lumiamitie.github.io/r/web/web-scraping-with-rvest/>
* R로 웹페이지 스크래핑을 해보자
	* <https://brunch.co.kr/@dugi/12>

## Selenium

* Python Selenium
    * <http://selenium-python.readthedocs.io/>
* 나만의 웹 크롤러 만들기(3): Selenium으로 무적 크롤러 만들기
    * <https://beomi.github.io/2017/02/27/HowToMakeWebCrawler-With-Selenium/>

