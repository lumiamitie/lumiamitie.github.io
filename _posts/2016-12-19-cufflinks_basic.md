---
layout: post
published: true
title: Cufflinks Basic
mathjax: false
featured: true
comments: true
headline: Python cufflinks 기초
categories: Python
tags: python cufflinks plotly
---

![cover-image](/images/desk-pen-ruler.jpg)

<style>
table {
	margin: 10px auto !important;
}
</style>


# Cufflinks basic

`cufflinks`는 `pandas.DataFrame`형태의 데이터를 `plotly`를 이용해 쉽게 시각화할 수 있도록 도와주는 라이브러리이다. 

데이터프레임을 가지고 간단하게 인터렉티브한 그래프를 만들 수 있다는 장점이 있지만, svg만 사용하다보니 만개를 넘어가는 산점도 등 복잡한 형태의 그래프를 그릴 때에는 좋은 결과물을 얻기 힘들다. (`plotly`에서는 그냥 webgl을 쓰면 되는데.... cufflinks에 없는건지 내가 못찾는건지 ㅠㅠ)

최종적인 시각화 결과물을 내는 데에는 부족하지만 (그 퀄리티를 내려면 `plotly`를 쓰셔야 합니다...) 분석을 위한 간단한 그래프를 빠르게 찍어내는데는 상당히 유용하게 사용할 수 있다.


```python
import pandas as pd
import cufflinks as cf
cf.go_offline()
```

사용한 라이브러리 버전은 다음과 같다


```python
# cufflinks
cf.__version__
```
    '0.8.2'

```python
# pandas
pd.__version__
```
    '0.18.1'

---
## 데이터 불러오기

연습/테스트용으로 많이 사용되는 데이터를 불러와서 그래프를 그려보자. 라이브러리에서 데이터를 제공하는 경우도 있지만 적당한 데이터를 찾지 못했다면 아래 url 링크를 통해 데이터를 불러와서 진행하면 된다.

`pandas.read_csv()` 를 통해 csv 데이터를 데이터 프레임으로 변환시킨다


```python
diamonds = pd.read_csv('https://raw.githubusercontent.com/hadley/ggplot2/master/data-raw/diamonds.csv')
economics = pd.read_csv('https://raw.githubusercontent.com/hadley/ggplot2/master/data-raw/economics.csv')
iris = pd.read_csv('https://raw.githubusercontent.com/mwaskom/seaborn-data/master/iris.csv')
```

---
## 산점도 (Scatter Plot)

불러온 데이터 중에서 `iris` 데이터를 가지고 간단한 산점도를 그려보자. 데이터는 다음과 같이 구성되어 있다.


```python
iris.head()
```




<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>sepal_length</th>
      <th>sepal_width</th>
      <th>petal_length</th>
      <th>petal_width</th>
      <th>species</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>5.1</td>
      <td>3.5</td>
      <td>1.4</td>
      <td>0.2</td>
      <td>setosa</td>
    </tr>
    <tr>
      <th>1</th>
      <td>4.9</td>
      <td>3.0</td>
      <td>1.4</td>
      <td>0.2</td>
      <td>setosa</td>
    </tr>
    <tr>
      <th>2</th>
      <td>4.7</td>
      <td>3.2</td>
      <td>1.3</td>
      <td>0.2</td>
      <td>setosa</td>
    </tr>
    <tr>
      <th>3</th>
      <td>4.6</td>
      <td>3.1</td>
      <td>1.5</td>
      <td>0.2</td>
      <td>setosa</td>
    </tr>
    <tr>
      <th>4</th>
      <td>5.0</td>
      <td>3.6</td>
      <td>1.4</td>
      <td>0.2</td>
      <td>setosa</td>
    </tr>
  </tbody>
</table>
</div>



`데이터프레임.iplot()` 을 통해 jupyter notebook에 그래프를 바로 그릴 수 있다. 독립적인 html 파일로 그래프를 출력한다면 `데이터프레임.plot()`을 사용하면 된다.


```python
(iris
 .iplot(kind='scatter', mode='markers', # markers 옵션이 빠지면 '선'의 형태로 표시됨
        x='sepal_length', y='petal_length') # x, y를 명시하지 않으면 index가 x축으로 지정됨
)
```

![](/images/post_image/cufflinks_basic/cufflinks_basic01.png)



### 그룹별로 그리기

`categories` 항목에 그룹으로 지정할 열 이름을 넣으면 그룹별 산점도를 그릴 수 있다


```python
(iris
 .iplot(kind='scatter', mode='markers',
        x='sepal_length', y='petal_length', categories='species') # categories 항목에 해당 열 이름을 추가
)
```

![](/images/post_image/cufflinks_basic/cufflinks_basic02.png)



### 제목 추가하기

기본 plotly에서는 레이아웃을 직접 지정해야했지만, cufflinks에서는 **title** 옵션을 통해 제목을 추가할 수 있다


```python
(iris
 .iplot(kind='scatter', mode='markers',
        x='sepal_length', y='petal_length', categories='species',
        title='Scatter Plot for Iris Data') # title에 제목을 추가한다
)
```

![](/images/post_image/cufflinks_basic/cufflinks_basic03.png)



### Subplot 구성하기

`subplots=True` 항목을 추가하면 각 항목의 그래프를 나누어서 그릴 수 있다


```python
(iris
 .iplot(kind='scatter', mode='markers',
        x='sepal_length', y='petal_length', categories='species', 
        subplots=True, # subplots=True 를 추가
        title='Scatter Plot for Iris Data')
)
```

![](/images/post_image/cufflinks_basic/cufflinks_basic04.png)



어차피 각 항목별로 그래프가 나누어져있으니 범례를 지우고 각 subplot에 소제목을 추가해보자

- `subplot_titles=True`로 설정하면 각 subplot에 소제목이 추가된다 
- `legend=False`를 설정하면 범례가 보이지 않는다


```python
(iris
 .iplot(kind='scatter', mode='markers',
        x='sepal_length', y='petal_length', categories='species', 
        subplots=True, subplot_titles=True, legend=False,
        title='Scatter Plot for Iris Data')
)
```

![](/images/post_image/cufflinks_basic/cufflinks_basic05.png)



subplot의 배치방식을 바꾸려면 `shape` 옵션을 변경해주면 된다. `shape=(행, 열)`의 형태로 정수값을 입력한다.

옆으로 나란히 세 개의 그래프를 배치해보자


```python
(iris
 .iplot(kind='scatter', mode='markers',
        x='sepal_length', y='petal_length', categories='species', 
        subplots=True, subplot_titles=True, legend=False, 
        shape=(1,3), # shape=(원하는 행 수, 원하는 열 수)
        title='Scatter Plot for Iris Data')
)
```

![](/images/post_image/cufflinks_basic/cufflinks_basic06.png)



---
## 막대그래프

이번에는 `diamonds` 데이터를 가지고 막대그래프를 그려보려고 한다. 데이터는 다음과 같이 구성되어 있다.


```python
diamonds.head()
```




<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>carat</th>
      <th>cut</th>
      <th>color</th>
      <th>clarity</th>
      <th>depth</th>
      <th>table</th>
      <th>price</th>
      <th>x</th>
      <th>y</th>
      <th>z</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>0.23</td>
      <td>Ideal</td>
      <td>E</td>
      <td>SI2</td>
      <td>61.5</td>
      <td>55.0</td>
      <td>326</td>
      <td>3.95</td>
      <td>3.98</td>
      <td>2.43</td>
    </tr>
    <tr>
      <th>1</th>
      <td>0.21</td>
      <td>Premium</td>
      <td>E</td>
      <td>SI1</td>
      <td>59.8</td>
      <td>61.0</td>
      <td>326</td>
      <td>3.89</td>
      <td>3.84</td>
      <td>2.31</td>
    </tr>
    <tr>
      <th>2</th>
      <td>0.23</td>
      <td>Good</td>
      <td>E</td>
      <td>VS1</td>
      <td>56.9</td>
      <td>65.0</td>
      <td>327</td>
      <td>4.05</td>
      <td>4.07</td>
      <td>2.31</td>
    </tr>
    <tr>
      <th>3</th>
      <td>0.29</td>
      <td>Premium</td>
      <td>I</td>
      <td>VS2</td>
      <td>62.4</td>
      <td>58.0</td>
      <td>334</td>
      <td>4.20</td>
      <td>4.23</td>
      <td>2.63</td>
    </tr>
    <tr>
      <th>4</th>
      <td>0.31</td>
      <td>Good</td>
      <td>J</td>
      <td>SI2</td>
      <td>63.3</td>
      <td>58.0</td>
      <td>335</td>
      <td>4.34</td>
      <td>4.35</td>
      <td>2.75</td>
    </tr>
  </tbody>
</table>
</div>



막대그래프를 사용하려면 `kind='bar'`로 지정하면 된다

- 'bar' 는 세로 방향의 막대그래프
- 'barh'는 가로 방향의 막대그래프를 그릴 수 있다

`cut` 변수를 기준으로 하여 그룹별로 항목의 갯수를 세어보고 막대그래프에 나타내어 보자.


```python
dia_cut = (diamonds
 .groupby('cut')
 .size()
 .sort_values()
)

dia_cut
```




    cut
    Fair          1610
    Good          4906
    Very Good    12082
    Premium      13791
    Ideal        21551
    dtype: int64




```python
dia_cut.iplot(kind='bar')
```

![](/images/post_image/cufflinks_basic/cufflinks_basic07.png)



```python
dia_cut.iplot(kind='barh')
```

![](/images/post_image/cufflinks_basic/cufflinks_basic08.png)


### 적당한 제목을 추가해보자!!

위에서 했던 것과 마찬가지로 `title` 값을 채워주면 된다.


```python
dia_cut.iplot(kind='bar', title='다이아몬드 데이터')
```

![](/images/post_image/cufflinks_basic/cufflinks_basic09.png)


### clarity별로 항목의 개수를 집계해서 막대그래프를 만들어보자

`cut`이 아니라 `clarity`를 기준으로 집계한다면 다음과 같은 결과물이 나온다.


```python
(diamonds
 .groupby('clarity')
 .size()
 .sort_values()
 .iplot(kind='bar', title='clarity별 항목 개수')
)
```

![](/images/post_image/cufflinks_basic/cufflinks_basic10.png)

<br />
<br />

### 막대 색상변경하기

`colors`옵션을 변경하면 막대의 색상을 지정할 수 있다

색상은 다양한 방식으로 지정할 수 있다

- 지정된 색상이름
- #로 시작하는 색상 코드
- 문자열로 지정된 rgb 값 'rgb(10,10,10)'


```python
dia_cut.iplot(kind='bar', colors='teal')
```
![](/images/post_image/cufflinks_basic/cufflinks_basic11.png)


```python
dia_cut.iplot(kind='bar', colors='#bbbbbb')
```
![](/images/post_image/cufflinks_basic/cufflinks_basic12.png)


```python
dia_cut.iplot(kind='bar', colors='rgb(100,30,30)')
```
![](/images/post_image/cufflinks_basic/cufflinks_basic13.png)

<br />
<br />

### 그룹별 막대그래프

- x축에 들어가려는 값은 `index`에 놓고
- 그룹으로 나누려는 값은 `column`으로 구분한다

데이터를 정리한 후에, `unstack` 메서드를 이용해서 그래프를 그릴 수 있는 형태로 변경한다


```python
dia_cutcolor = (diamonds
  .groupby(['cut', 'color'])
  .size()
)

dia_cutcolor
```




    cut        color
    Fair       D         163
               E         224
               F         312
               G         314
               H         303
               I         175
               J         119
    Good       D         662
               E         933
               F         909
               G         871
               H         702
               I         522
               J         307
    Ideal      D        2834
               E        3903
               F        3826
               G        4884
               H        3115
               I        2093
               J         896
    Premium    D        1603
               E        2337
               F        2331
               G        2924
               H        2360
               I        1428
               J         808
    Very Good  D        1513
               E        2400
               F        2164
               G        2299
               H        1824
               I        1204
               J         678
    dtype: int64




```python
dia_cutcolor.unstack('color')
```




<div>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th>color</th>
      <th>D</th>
      <th>E</th>
      <th>F</th>
      <th>G</th>
      <th>H</th>
      <th>I</th>
      <th>J</th>
    </tr>
    <tr>
      <th>cut</th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>Fair</th>
      <td>163</td>
      <td>224</td>
      <td>312</td>
      <td>314</td>
      <td>303</td>
      <td>175</td>
      <td>119</td>
    </tr>
    <tr>
      <th>Good</th>
      <td>662</td>
      <td>933</td>
      <td>909</td>
      <td>871</td>
      <td>702</td>
      <td>522</td>
      <td>307</td>
    </tr>
    <tr>
      <th>Ideal</th>
      <td>2834</td>
      <td>3903</td>
      <td>3826</td>
      <td>4884</td>
      <td>3115</td>
      <td>2093</td>
      <td>896</td>
    </tr>
    <tr>
      <th>Premium</th>
      <td>1603</td>
      <td>2337</td>
      <td>2331</td>
      <td>2924</td>
      <td>2360</td>
      <td>1428</td>
      <td>808</td>
    </tr>
    <tr>
      <th>Very Good</th>
      <td>1513</td>
      <td>2400</td>
      <td>2164</td>
      <td>2299</td>
      <td>1824</td>
      <td>1204</td>
      <td>678</td>
    </tr>
  </tbody>
</table>
</div>



`color`를 기준으로 `unstack`한 상태에서 `iplot`을 통해 그래프를 그린다.


```python
(dia_cutcolor
 .unstack('color')
 .iplot(kind='bar')
)
```

![](/images/post_image/cufflinks_basic/cufflinks_basic14.png)

<br />

### 누적막대그래프

plotly와 마찬가지로, `barmode='stack'`을 추가하면 된다


```python
(dia_cutcolor
 .unstack('color')
 .iplot(kind='bar', barmode='stack')
)
```

![](/images/post_image/cufflinks_basic/cufflinks_basic15.png)

<br />
<br />

### 색상 팔레트 적용하기

기본 색상팔레트 이외에 정의되어있는 팔레트를 적용할 수 있다

- `cf.colors.scales()` 함수를 통해 적용할 수 있는 팔레트의 목록과 이름을 확인할 수 있으며
- 팔레트 이름 앞에 `-`를 붙이면 색상의 순서를 반대로 적용할 수 있다

cufflinks의 색상관련 내용은 다음 링크에 자세히 설명되어 있다.<br/> <http://nbviewer.jupyter.org/gist/santosjorge/00ca17b121fa2463e18b>


```python
(dia_cutcolor
 .unstack('color')
 .iplot(kind='bar', barmode='stack', colorscale='blues')
)
```

![](/images/post_image/cufflinks_basic/cufflinks_basic16.png)



```python
(dia_cutcolor
 .unstack('color')
 .iplot(kind='bar', barmode='stack', colorscale='-blues') # 색상의 순서를 반대로 지정하려면 색상명 앞에 `-`를 붙인다
)
```


![](/images/post_image/cufflinks_basic/cufflinks_basic17.png)

사용할 수 있는 색상조합은 아래와 같이 확인할 수 있다. 데이터의 특성에 맞는 조합을 사용해야 한다.


```python
cf.colors.scales()
```

![](/images/post_image/cufflinks_basic/cufflinks_basic18.png)

<br />
<br />

---
## 선그래프

`kind='scatter'` 일 경우 기본값으로 선 그래프를 그린다.


```python
economics.iplot(kind='scatter', x='date', y='unemploy')
```

![](/images/post_image/cufflinks_basic/cufflinks_basic19.png)


x에 date만 적용하고 나머지 변수들로 subplot을 그려보자


```python
economics.iplot(kind='scatter', x='date', subplots=True)
```

![](/images/post_image/cufflinks_basic/cufflinks_basic20.png)

<br />

### 그래프 전체 크기 조절하기

그래프의 전체 크기를 조절하려면 `dimensions` 옵션에 원하는 사이즈를 튜플 형태로 넘긴다

다섯 개의 그래프를 세로로 나란히 배치하고 그래프 전체의 사이즈를 조절해보자


```python
economics.iplot(kind='scatter', x='date', 
                subplots=True, subplot_titles=True, legend=False,
                shape=(5,1), # 5행, 1열
                dimensions=(800,1000)) # 가로 800, 세로 1000
```

![](/images/post_image/cufflinks_basic/cufflinks_basic21.png)

<br />

### Shared Axes

`shared_yaxes`(또는 `shared_xaxes`)를 적용하면 subplot별로 같은 축을 사용하도록 강제할 수 있다

다만 subplot의 위치에도 영향을 받기 때문에 모든 그래프에 동일한 y축 범위를 적용하려면 아래와 같이 row수가 1로 고정되어야 한다


```python
economics.iplot(kind='scatter', x='date', 
                subplots=True, subplot_titles=True, legend=False,
                shared_yaxes=True,
                shape=(1,5), dimensions=(1000,400))
```

![](/images/post_image/cufflinks_basic/cufflinks_basic22.png)

<br />

---

## Box Plot

그룹별 Box Plot은 약간의 편법(?)을 통해서 만들 수 있다.

1. 그룹으로 지정하려고 하는 열과 y축 값을 나타내려는 열만 남긴다
2. 그룹으로 지정하려고 하는 열을 인덱스로 지정한다(`append=True` 옵션을 통해 row number를 남기자)
3. `unstack` 메서드를 사용해서 각 그룹을 열로 구성한다
4. 이로 인해 엄청난 양의 NaN값이 생기지만 무시하고 그래프를 그린다!


```python
(diamonds
 .loc[:, ['cut', 'price']]
 .set_index('cut', append=True)
 .unstack('cut')['price']
 .iplot(kind='box')
)
```

![](/images/post_image/cufflinks_basic/cufflinks_basic23.png)

