---
layout: post
published: true
title: koding.com 에서 Jekyll 활용하기
mathjax: false
featured: false
comments: true
headline: Making blogging easier for masses
categories: Web
tags: jekyll
---

![cover-image](../../images/old-book.jpg)

## Koding.com

[Koding](http://koding.com)은 Amazon EC2 인스턴스를 기반으로 하는 서비스다. 가입하면 무료로 VM을 하나 받을 수 있다. RAM 1기가에 하드 3기가 뿐이지만 우분투가 기본적으로 설치되어있고, 파이썬이나 루비 등이 미리 세팅되어있다. 무료로 사용하는 동안에는 접속이 끊어지면 VM도 자동으로 종료된다.

VM내부의 Web 폴더는 github.io 처럼 정적인 호스트를 제공하기 때문에 Jekyll 페이지를 테스트하는 용도로 사용하기로 했다. 

원래 jekyll 페이지를 작성하고 웹페이지로 변환시키려면 `jekyll serve` 명령어를 사용한다. 우리는 변환시킨 결과물을 **Web** 폴더에 보내려고 한다. 이 경우에는 *-d* 옵션을 사용하고 (destination) 그 뒤에 대상 폴더의 주소를 지정하면 된다. (~/Web)

    jekyll serve -d ~/Web
    
이제 Koding.com의 VM이 켜져있는 동안에는 id.koding.io 에서 결과물을 확인할 수 있다