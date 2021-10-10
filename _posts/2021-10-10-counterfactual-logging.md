---
layout: post
published: true
title: 트리거가 필요한 실험에서 결과의 신뢰성을 높이는 방법
mathjax: false
featured: true
comments: true
headline: Counterfactual logging and Triggering in experiments
categories: data
tags: data
---

![cover-image](/images/taking-notes.jpg)

날씨 관련 검색을 하면 날씨 예보를 보여주는 기능을 개발했습니다. 그런데 날씨 관련 검색의 요청수가 생각보다 너무 적어서, 전체 데이터를 기준으로 A군과 B군을 비교해보니 유의미한 효과를 확인할 수가 없었습니다. 이런 상황에서 실험 결과를 제대로 확인할 수 있으려면 어떻게 해야 할까요?

# 트리거링(Triggering)

앞에서 설명한 내용은 마이크로소프트의 서비스인 Bing에서 실제로 있었던 사례인데요. 이러한 상황은 특정한 조건을 만족하는 일부 유저를 대상으로 실험을 진행할 때 종종 발생하는 문제입니다. 어떤 조건을 만족해야 실험 대상이 될 수 있는 경우, 조건을 만족하지 못하는 유저들이 만들어내는 데이터는 분석 과정에서 노이즈 역할을 하게 됩니다. 

노이즈로 인해 발생한 편향을 제거하기 위해서는 데이터를 필터링 하는 작업을 해야 하는데요. 이것을 트리거링(Triggering) 이라고 합니다. 어떤 실험이 시작되기 위해 특정한 트리거가 필요한 상황을 나타낸다고 보시면 됩니다. 

그렇다면 어떻게 해야 우리가 원하는 실험 결과를 얻을 수 있을까요? 

# Counterfactual logging

## Bing case

우리가 원하는 실험 결과를 얻기 위해서는 실험군과 대조군에서 적절한 필터링이 이루어져야 합니다. 우선 실험군에서는 날씨 예보가 실제로 노출된 사람들의 데이터로 필터링을 하면 됩니다. 그렇다면 날씨 예보가 노출되지 않은 대조군에서는 어떻게 해야 할까요?

대조군에서 요청이 왔는데 만약 실험군이었다면 날씨 예보가 나갔어야 하는 유저들이 있습니다. 이러한 유저들에는 가상의 노출 로그만 기록하고 날씨 예보 없이 결과를 반환합니다. 이러한 가상의 노출 로그를 통해 대조군 데이터를 필터링할 수 있습니다.

## 컨셉 이해하기

Counterfactual logging은 실험군/대조군 여부와 관계없이 동일한 경험을 하는 유저는 실험 대상으로 포함될 필요가 없다는 개념을 바탕으로 합니다.

A군은 모든 사람들에게 쿠폰을 제공하고, B군은 앱 사용자에게 쿠폰을 주는 실험을 진행한다고 가정해봅시다. 실험을 통해 어느 쪽이 이익을 극대화하는데 도움이 되는지 확인하려고 합니다. 이 때 앱 사용자는 A군이든 B군이든 관계없이 쿠폰을 받게 됩니다. 따라서 이러한 고객들의 데이터를 포함하는 경우 실험의 효과를 제대로 파악하기 어려울 수 있습니다. 위 상황에서는 "앱 사용자" 라는 명확한 기준이 있기 때문에 쉽게 대상자를 찾아낼 수 있습니다. 하지만 2개 이상의 모델링 결과를 비교하는 등의 실험에서는 대상자를 판별하는 것이 쉽지 않기 때문에 Counterfactual logging 을 통해 명시적으로 기록하는 방식을 선택합니다.

## Counterfactual logging 의 효과

Counterfactual logging을 통해 노이즈 역할을 하는 데이터를 필터링하기 때문에 검정력(실제로 효과가 있을 때 효과를 탐지할 가능성)이 올라가는 효과가 있습니다.

또한 필터링 없이 전체 데이터를 사용할 경우 편향된 추정치를 가지게 되는데, Counterfactual logging을 통해 이러한 편향을 보정하는 효과가 있습니다. 
다만 필터링 과정에서 사용 가능한 데이터의 수가 줄어들기 때문에 분산이 더 커지는 경우도 발생합니다.

# 마무리

인과 모형을 더 효과적으로 수행하기 위한 방법을 고민하다가 흥미로운 키워드를 발견해서 정리하게 되었습니다. 실험을 수행할 수 있는 환경이 갖추어진다면 남은 것은 결과를 잘 해석하는 것뿐이라고 생각했는데, 실험 결과의 신뢰성을 높이기 위한 다양한 기법들이 있다는 것을 알게 되었습니다. 이번 내용을 정리하면서 새롭게 알게된 키워드가 많아서 당분간은 새롭게 공부해야 할 것들이 (이미 잔뜩 쌓여있지만) 더 많아질 것 같습니다.

# 참고자료 
- [An Explanation of Counterfactual Logging](https://towardsdatascience.com/an-explanation-of-counterfactual-logging-81931a6fd192){:target="_blank"}
- [Microsoft Research - Patterns of Trustworthy Experimentation: Pre-Experiment Stage](https://www.microsoft.com/en-us/research/group/experimentation-platform-exp/articles/patterns-of-trustworthy-experimentation-pre-experiment-stage/){:target="_blank"}
