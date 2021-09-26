---
layout: post
published: true
title: 실험없이 이벤트 효과를 추정할 수 있을까? - Difference in Differences
mathjax: false
featured: true
comments: true
headline: Difference in Differences
categories: data
tags: data
---

![cover-image](/images/taking-notes.jpg)

IT 업계에서 데이터 분석가로 커리어를 시작하다 보니 이벤트나 프로모션의 효과를 확인해달라는 업무 요청이 많았습니다. 
또, 추천 등 저희 부서에서 제공하는 모델링 결과물을 도입한 뒤에 얼마나 성과가 났는지 확인하는 것도 주된 업무 중 하나였구요. 
이런 이벤트의 효과를 확인하려면 A/B 테스트 같은 체계적인 실험을 하는 것이 가장 확실한 방법입니다. 하지만, 언제나 실험을 할 수 있는건 아닙니다. 
다음과 같은 상황에서는 어떻게 해야 할까요?

영업에 성공하여 고객사(또는 다른 부서라고 해도 좋습니다.)에서 드디어 저희 솔루션을 사용하기 시작했다고 해봅시다. 
우선 한 달간 성과를 확인해보고, 정식으로 도입할지 여부를 검토하기로 합니다. 그런데 솔루션이 도입되는 시점과 맞물려 비수기가 시작되면서 전반적인 매출이 줄어들기 시작했습니다. 
하지만 저희 솔루션 덕분에 당초 예상보다는 훨씬 나은 정도로 매출 하락을 막을 수 있었습니다. 
그런데 갑자기! 고객사에서 솔루션 도입 후에 매출이 떨어지고 있다며 정식 도입을 하지 않겠다고 연락이 왔습니다. 당신은 현재 매우 억울한 상황입니다. 
공교롭게도 비수기가 시작되는 시점이라 매출이 떨어지는게 분명한데, 이걸 어떻게 확인할 수 있을까요? 고객사를 설득할 수 있는 분석 결과를 뽑아낼 수 있을까요?

이번 글에서는 이런 상황에서 적용해 볼 수 있는 방법인 **Difference in Differences** (DiD, 또는 이중차분법)와 연관된 다른 방법론들에 대해 간단히 살펴보려고 합니다.

# Difference in Differences

마침 고객사에는 기존의 서비스와 거의 유사한 지표 추이를 보이는 다른 서비스가 존재했습니다. 그리고 그 데이터도 저희가 확인할 수 있구요. 그런데 해당 서비스에는 우리 솔루션이 도입되지 않았습니다. 정식 도입을 하게 되면 그 때 한꺼번에 설치하기로 했거든요. 이 때, 무엇인가 번뜩이는 생각이 스쳐 지나갑니다.

> 우리 솔루션이 도입되지 않은 서비스에서도 매출이 떨어지고 있는 추세를 보이고 있다면, 이를 바탕으로 우리 솔루션 때문에 매출이 떨어지고 있는 것이 아니라는 것을 설명할 수 있지 않을까? 🤔

확인해보니 해당 서비스에서는 매출이 더 급격하게 떨어지고 있는 추세를 볼 수 있었습니다. 
그래서 이 지표를 바탕으로 우리 솔루션을 통해 매출 방어를 할 수 있었다는 논리를 잘 전달할 수 있었다고 합니다. 그렇게 해피엔딩!

앞선 사례는 픽션이라(비슷한 일이 실제로 있었지만 결말은...) 제 맘대로 급조된 해피엔딩을 만들어 마무리해버렸습니다. 
픽션이라고는 해도 실제로 업무를 하면서 비슷한 상황을 어렵지 않게 마주할 수 있습니다. 문제는 조금 더 복잡하겠지만요. 
이번에 살펴보려는 **Difference in Differences** (너무 길어서 이후로는 DiD로 줄여서 부르겠습니다.) 는 앞선 사례를 조금 더 체계적으로 정리한 결과라고 볼 수 있습니다.

## 핵심적인 컨셉

우리가 알고 싶은 것은 다음과 같습니다.

> "특정한 시점에 뭔가 개입(이벤트나 프로모션 등)이 발생했습니다. 
이 개입이 이후에 얼마나 영향을 미쳤을까요?"

그런데 우연히 이벤트의 영향을 받지 않은 영역이 있었다는 것을 알게 되었습니다. 
해당 영역은 이벤트 영역과 거의 동일한 패턴으로 추세를 따른다는 것도 데이터를 통해 확인할 수 있었습니다. 
그렇다면 **(1) 이벤트 전후의 차이**를 한 번 구하고, **(2) 이벤트의 영향을 받은 곳과 받지 않은 곳의 차이**를 한 번 더 비교하면 어떻게 될까요? 
놀랍게도 이벤트의 효과를 분리할 수 있습니다. 
*"차이 안에서 한 번 더 차이를 비교한다"* 라는 점에서 **Difference in Differences** 라는 이름이 왜 나왔는지 바로 알 수 있습니다.

## 필요한 조건 : Parallel trends assumption

DiD를 항상 사용할 수 있는 것은 아닙니다. 간단한 만큼 강력한 가정을 필요로 하는데요. 바로 **Parallel trends assumption** 입니다. 
이것은 **"시간에 따른 추이 변화가 이벤트 대상과 비교군에서 동일하게 나타나야 한다"**는 점을 의미합니다.

이벤트가 적용된 영역의 원래 값을 EG, 적용되지 않은 영역의 원래 값을 NEG 라고 임의로 표기해보겠습니다. 

- 이벤트가 적용된 영역은 이벤트 이후에 `EG + 시간이 흘러서 생긴 변화 + 이벤트 효과` 가 됩니다.
    - 해당 영역에 대해서만 `이벤트 후 - 이벤트 전` 을 계산합니다.
    - 그러면 `시간이 흘러서 생긴 변화 + 이벤트 효과` 가 남습니다. → `Difference1`
- 이벤트가 적용되지 않은 영역은 이벤트 이후에 `NEG + 시간이 흘러서 생긴 변화` 가 됩니다.
    - 해당 영역에 대해서도 `이벤트 후 - 이벤트 전` 을 계산합니다.
    - 그러면 `시간이 흘러서 생긴 변화` 만 남습니다. → `Difference2`

```
Event Group (Before) = EG
Event Group (After)  = EG + TimeEffect + EventEffect
---------------------------------------------------
Difference1 = TimeEffect + EventEffect

Non-event Group (Before) = NEG
Non-event Group (After)  = NEG + TimeEffect
---------------------------------------------------
Difference2 = TimeEffect
```

만약 NEG와 EG의 차이가 항상 일정하다면 어떻게 될까요? 
다시 말해, **(1) 이벤트가 적용된 영역의 시간에 따른 변화**와 **(2) 이벤트가 적용되지 않은 영역의 시간에 따른 변화**가 동일하다면 어떻게 되는 걸까요? 
이 경우에는 Difference1 에서 Difference2 를 빼는 것으로 이벤트의 효과를 구할 수 있게 됩니다.

```
Difference1 - Difference2 
= (TimeEffect + EventEffect) - (TimeEffect)
= EventEffect
```

NEG와 EG의 차이가 항상 일정해야 한다는 조건을 위해 필요한 가정이 바로 **Parallel trends assumption** 입니다. 
위키피디아에 검색하면 나오는 아래 그림을 보면 더 직관적으로 이해할 수 있습니다.

![Wikipedia Difference_in_differences](https://upload.wikimedia.org/wikipedia/en/f/fb/Parallel_Trend_Assumption.png)

# DiD를 더 일반화해서 적용할 수 있을까?

DiD는 굉장히 단순하면서 강력한 기법이지만, 제한되는 부분도 많습니다.

- 시간에 따라 변화하는 데이터를 사용하는데도 iid 가정(Independent and identically distributed)을 바탕으로 하는 정적인 회귀 모형을 기반으로 합니다.
- 대부분의 DiD 분석은 이벤트 이전과 이후의 두 시점만 비교하는데, 실제로 분석할 때는 시간에 따라 효과가 어떻게 달라지는지 확인해야 하는 경우도 많습니다.
- Parallel trends 가정을 만족시키지 못하는 경우 사용할 수 없습니다.
- 대조군 역할로 사용할 만한 비교 대상이나 참고할 만한 공변량이 많을 경우에 모든 데이터를 활용하기 어렵습니다.

위와 같은 문제를 해결하고자, DiD 컨셉을 바탕으로 개선된 방법론이 많이 등장했습니다. 
여기서는 Synthetic Control 과 CausalImpact 라는 두 가지 방법만 간단히 살펴보겠습니다. 각 모형에 대한 자세한 설명이나 코드에 대해서는 나중에 별도의 글로 다룰 예정입니다.

## (1) Synthetic Control

Synthetic Control 은 이벤트의 효과를 받지 않은 다양한 비교 대상의 데이터를 모아 **가상의 대조군**을 만들어냅니다. 
여러 비교 대상 데이터를 조합하여 최적의 가중치를 학습합니다. 모형을 통해 만들어낸 **가상의 대조군과 실제 값의 차이를 계산**하는 방식으로 이벤트의 효과를 추정할 수 있습니다.

모형의 특정을 간단히 정리해보면 다음과 같습니다.

1. 데이터를 학습할 때 이벤트 이후 시점의 데이터를 사용하지 않습니다.
    - 실험 결과에 따라 데이터나 모형을 임의로 계속 조정하는 p-hacking 등을 방지하는데 도움이 될 수 있습니다.
    - 이벤트 이후 결과가 없어도 학습이 가능하기 때문에, 모형을 설계하는데 더 집중할 수 있습니다.
2. 가상의 대조군을 만들어 내는 방식이 투명하게 공개됩니다.
    - 가중치 값을 확인할 수 있기 때문에, 모형을 정밀하게 해석할 수 있습니다.
3. 데이터가 존재하는 범위 내에서만 예측을 수행합니다. (No Extrapolation)
    - 변수를 조합하기 위한 가중치 값을 양수 범위에서 존재하며 모두 합하면 1이 되도록 학습합니다.
    - 따라서 데이터가 존재하는 범위 내에서만 예측을 하기 때문에 안정적인 모델링이 가능합니다.

## (2) CausalImpact

CausalImpact 는 2015년에 구글에서 공개한 방법론입니다. 가중치 기반으로 변수를 조합하는 Synthetic Control 과 다르게, **시계열 모형을 바탕으로 가상의 대조군을 만들어냅니다.** 
시계열 모형 중에서도 **Bayesian structural time-series models** 를 사용하는데, **추세, 계절성, 회귀 모형의 세 가지 컴포넌트**로 구성되어 있습니다. 
따라서 시계열 정보에 추가적인 공변량을 반영하여 추이를 학습할 수 있습니다.

# Summary

Difference in Differences 와 관련된 방법론들을 사용하면 이벤트 등 특정한 개입으로 인해 발생하는 효과를 추정할 수 있습니다. 
특히 DiD는 Parallel trends 가정만 만족한다면 간단한 회귀 모형만으로도 이벤트 효과를 계산해볼 수 있다는 장점이 있습니다. 
모형이 단순한 만큼 시간에 따른 효과를 파악하기 어렵고, 가정을 만족하지 못하는 경우 정확한 추정이 어려워진다는 문제가 있습니다. 
하지만 이를 보완하거나 개선한 여러 방법론이 존재하기 때문에 컨셉 자체는 여전히 유효하다고 생각합니다.

머신러닝이나 통계 관련된 공부만 하다가 처음 비즈니스 분석을 접하게 되면서, 기존에 알고 있던 통계/머신러닝 기법들에 딱 맞지 않는 상황이 많이 생겨났습니다. 
그 중에서도 가장 흔하게 발생하는 상황이 오늘 살펴본 내용이었습니다. 
DiD는 컨셉이 직관적이기 때문에 문제가 복잡하지 않다면 따로 공부를 하지 않더라도 어렵지 않게 활용할 수 있습니다. 
하지만 이렇게 큰 틀에서 정리해두면 언제 이 방법을 사용하는 것을 피해야 하는지, 사전에 어떤 데이터를 남겨두어야 계산할 수 있는지 등등 더 폭넓은 시각에서 문제를 바라볼 수 있습니다.

# 참고자료

- [Causal Inference: The Mixtape - Difference in Differences](https://mixtape.scunning.com/difference-in-differences.html){:target="_blank"}
- [Difference-in-Difference Estimation](http://www.publichealth.columbia.edu/research/population-health-methods/difference-difference-estimation){:target="_blank"}
- [Causal Inference for the Brave and True : Difference in Differences](https://matheusfacure.github.io/python-causality-handbook/14-Difference-in-Difference.html){:target="_blank"}
- [Using Synthetic Controls: Feasibility, Data Requirements, and Methodological Aspects](https://economics.mit.edu/files/17847){:target="_blank"}
- [CausalImpact : An R package for causal inference in time series](https://github.com/google/CausalImpact){:target="_blank"}
