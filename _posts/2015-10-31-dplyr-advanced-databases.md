---
layout: post
published: true
title: dplyr advanced - Databases
mathjax: false
featured: true
comments: true
headline: advanced topics for dplyr
categories: R
tags: dplyr
---

![cover-image](/images/macphoto.jpg)

# Databases

dplyr은 data.frame과 같은 메모리 내의 데이터 뿐만 아니라 데이터베이스에 있는 자료를 가지고 작업을 할 수 있도록 도와주는 기능을 제공한다. 일반적인 작은 데이터라면 데이터베이스를 통해 R로 자료로 가져오는 과정이 오히려 번거롭겠지만, 데이터베이스에 저장된 데이터를 가져오거나, 엄청나게 많은 양의 데이터(메모리가 감당못할)를 가져와야 할 때에는 데이터베이스를 이용해야 한다.

만약 데이터베이스에서 대용량의 데이터를 가져와야 한다면 테이블을 통째로 가지고 오기 보다는 필요한 항목으로 간추리고 내용을 요약하여 정리하게 된다. dplyr을 이런 과정을 더 간편하게 해 준다. 데이터베이스에서 원하는 데이터를 가져다가 R에서 작업하기 위해서는 SQL과 R 양쪽에서 머리를 쥐어짜게 만드는 경우가 많은데 dplyr은 SELECT에 한해서 R의 코드가 SQL로 변환되도록 도와준다

현재 dplyr은 **SQLite**, **MySQL**, **PostgreSQL**과 구글의 **Bigquery**를 지원하고 있다. 여기서는 가장 간단하게 사용할 수 있는 **SQLite**를 가지고 dplyr을 통해 데이터베이스에 접근하는 방법을 살펴보려고 한다

<br />
<br />

---

우선 시작하기 전에 `RSQLite` 패키지를 설치하고 dplyr을 불러오자


```r
library(dplyr)

# install.packages('RSQLite')
```

<br />
<br />

SQLite는 파일을 기반으로하는 데이터베이스이기 때문에 아래 코드와 같이 데이터베이스를 생성해주면 **working directory** 안에 해당 이름으로 db가 생성된다. 처음 db를 만들 때는 `create = T` 옵션을 넣어주고, 이후에 db에 접근할 때는 `create = F` 또는 **create 옵션 없이** 사용하면 된다


```r
sqlite_db = src_sqlite('sqlite_db.sqlite3', create = T)
```
<br />

---

다른 database의 경우에도 각각의 함수들이 존재한다

`src_mysql()`, `src_postgres()`, `src_bigquery()` 의 함수를 통해 각 데이터베이스에 접근할 수 있다

<br />

---

`sqlite_db`에는 아직 아무런 데이터가 없다

일단 가장 친숙한 iris 데이터를 db에 넣어보려고 한다. `copy_to()` 함수는 local의 데이터를 remote source의 db에서 사용할 수 있도록 데이터를 복사한다. 

<br />

`copy_to(db_connection, local_data.frame)`의 형태로 사용한다

`name`옵션을 텍스트를 지정하면 테이블을 해당 이름으로 db에 저장한다

`temporary = TRUE` 일 경우 테이블을 임시 테이블로 저장한다. 


```r
copy_to(sqlite_db, iris, temporary = FALSE)
```

```
## Source: sqlite 3.8.6 [sqlite_db.sqlite3]
## From: iris [150 x 5]
## 
##    Sepal.Length Sepal.Width Petal.Length Petal.Width Species
##           (dbl)       (dbl)        (dbl)       (dbl)   (chr)
## 1           5.1         3.5          1.4         0.2  setosa
## 2           4.9         3.0          1.4         0.2  setosa
## 3           4.7         3.2          1.3         0.2  setosa
## 4           4.6         3.1          1.5         0.2  setosa
## 5           5.0         3.6          1.4         0.2  setosa
## 6           5.4         3.9          1.7         0.4  setosa
## 7           4.6         3.4          1.4         0.3  setosa
## 8           5.0         3.4          1.5         0.2  setosa
## 9           4.4         2.9          1.4         0.2  setosa
## 10          4.9         3.1          1.5         0.1  setosa
## ..          ...         ...          ...         ...     ...
```

<br />

---

이제 src_tbls 함수를 통해 db를 살펴보면 iris 데이터가 테이블 형태로 db에 들어간 것을 확인할 수 있다


```r
src_tbls(sqlite_db)
```

```
## [1] "iris"         "sqlite_stat1"
```

<br />

db에서 테이블을 가져오려면 tbl함수에서 source를 db connection으로 지정하고 table 명을 지정해주면 된다


```r
tbl(sqlite_db, 'iris')
```

```
## Source: sqlite 3.8.6 [sqlite_db.sqlite3]
## From: iris [150 x 5]
## 
##    Sepal.Length Sepal.Width Petal.Length Petal.Width Species
##           (dbl)       (dbl)        (dbl)       (dbl)   (chr)
## 1           5.1         3.5          1.4         0.2  setosa
## 2           4.9         3.0          1.4         0.2  setosa
## 3           4.7         3.2          1.3         0.2  setosa
## 4           4.6         3.1          1.5         0.2  setosa
## 5           5.0         3.6          1.4         0.2  setosa
## 6           5.4         3.9          1.7         0.4  setosa
## 7           4.6         3.4          1.4         0.3  setosa
## 8           5.0         3.4          1.5         0.2  setosa
## 9           4.4         2.9          1.4         0.2  setosa
## 10          4.9         3.1          1.5         0.1  setosa
## ..          ...         ...          ...         ...     ...
```

<br />

쿼리를 직접 입력해서 데이터를 불러올 수도 있다


```r
tbl(sqlite_db, sql('SELECT * FROM iris'))
```

```
## Source: sqlite 3.8.6 [sqlite_db.sqlite3]
## From: <derived table> [?? x 5]
## 
##    Sepal.Length Sepal.Width Petal.Length Petal.Width Species
##           (dbl)       (dbl)        (dbl)       (dbl)   (chr)
## 1           5.1         3.5          1.4         0.2  setosa
## 2           4.9         3.0          1.4         0.2  setosa
## 3           4.7         3.2          1.3         0.2  setosa
## 4           4.6         3.1          1.5         0.2  setosa
## 5           5.0         3.6          1.4         0.2  setosa
## 6           5.4         3.9          1.7         0.4  setosa
## 7           4.6         3.4          1.4         0.3  setosa
## 8           5.0         3.4          1.5         0.2  setosa
## 9           4.4         2.9          1.4         0.2  setosa
## 10          4.9         3.1          1.5         0.1  setosa
## ..          ...         ...          ...         ...     ...
```
<br />

---

db에서 데이터를 불러오면 이후에는 local data를 다루는 것 처럼 작업할 수 있다
data.frame에 사용하는 것처럼 dplyr의 기본적인 함수들인 `select`, `filter`, `mutate`, `summarise`, `arrange`를 적용할 수 있다


```r
iris_db = tbl(sqlite_db, 'iris')
iris_db %>% filter(Sepal.Length > 7)
```

```
## Source: sqlite 3.8.6 [sqlite_db.sqlite3]
## From: iris [12 x 5]
## Filter: Sepal.Length > 7 
## 
##    Sepal.Length Sepal.Width Petal.Length Petal.Width   Species
##           (dbl)       (dbl)        (dbl)       (dbl)     (chr)
## 1           7.1         3.0          5.9         2.1 virginica
## 2           7.6         3.0          6.6         2.1 virginica
## 3           7.3         2.9          6.3         1.8 virginica
## 4           7.2         3.6          6.1         2.5 virginica
## 5           7.7         3.8          6.7         2.2 virginica
## 6           7.7         2.6          6.9         2.3 virginica
## 7           7.7         2.8          6.7         2.0 virginica
## 8           7.2         3.2          6.0         1.8 virginica
## 9           7.2         3.0          5.8         1.6 virginica
## 10          7.4         2.8          6.1         1.9 virginica
## 11          7.9         3.8          6.4         2.0 virginica
## 12          7.7         3.0          6.1         2.3 virginica
```

<br />
<br />

```
# Source: sqlite 3.8.6 [sqlite_db.sqlite3]
# From: iris [12 x 5]
# Filter: Sepal.Length > 7
```

source를 보면 `as.tbl(iris)`가 `Source: local data frame [150 x 5]` 을 보여주는 것과는 다르게 sqlite를 source로 하는 것을 확인할 수 있다.

<br />
<br />

---

## Laziness

dplyr이 데이터베이스를 가지고 작업할 때에는 최대한 느긋한 계산을 통해 데이터를 처리하려고 한다

다시 말하자면 사용자가 직접 요청하기 전에는 전체 데이터를 가지고 오지 않는다. 작업을 할 때에도 최대한 끝까지 작업을 미루다가 사용자가 최종적으로 요구하는 항목들만 가지고 연산해서 데이터를 가져온다. 아래 코드를 예로 들면 `iris_fltd` 라는 변수를 생성할 때 까지도 db 작업을 하지 않다가 `iris_fltd`를 진짜 실행시키는 경우에만 db에 연결하여 데이터 작업을 하게 된다

<br />

필요한 경우에는 특정 함수를 사용해서 강제로 연산을 하도록 만들 수도 있다

<br />

작업한 내용을 local 환경으로 가져오고 싶을 때는 `collect()`함수를 사용한다

`collect()` 함수는 쿼리를 실행하고 그 결과물을 R로 반환한다(`tbl_df` 형태로)


```r
iris_fltd = iris_db %>% 
  filter(Sepal.Length > 7)

collect(iris_fltd)
```

```
## Source: local data frame [12 x 5]
## 
##    Sepal.Length Sepal.Width Petal.Length Petal.Width   Species
##           (dbl)       (dbl)        (dbl)       (dbl)     (chr)
## 1           7.1         3.0          5.9         2.1 virginica
## 2           7.6         3.0          6.6         2.1 virginica
## 3           7.3         2.9          6.3         1.8 virginica
## 4           7.2         3.6          6.1         2.5 virginica
## 5           7.7         3.8          6.7         2.2 virginica
## 6           7.7         2.6          6.9         2.3 virginica
## 7           7.7         2.8          6.7         2.0 virginica
## 8           7.2         3.2          6.0         1.8 virginica
## 9           7.2         3.0          5.8         1.6 virginica
## 10          7.4         2.8          6.1         1.9 virginica
## 11          7.9         3.8          6.4         2.0 virginica
## 12          7.7         3.0          6.1         2.3 virginica
```

`source: local data frame [12 x 5]`로 source가 변경된 것을 확인할 수 있다

<br />

`compute()` 함수를 사용하면 쿼리를 실행하고 그 결과물을 db의 임시 테이블에 저장한다


```r
compute(iris_fltd)
```

```
## Source: sqlite 3.8.6 [sqlite_db.sqlite3]
## From: vdtgepxwho [12 x 5]
## 
##    Sepal.Length Sepal.Width Petal.Length Petal.Width   Species
##           (dbl)       (dbl)        (dbl)       (dbl)     (chr)
## 1           7.1         3.0          5.9         2.1 virginica
## 2           7.6         3.0          6.6         2.1 virginica
## 3           7.3         2.9          6.3         1.8 virginica
## 4           7.2         3.6          6.1         2.5 virginica
## 5           7.7         3.8          6.7         2.2 virginica
## 6           7.7         2.6          6.9         2.3 virginica
## 7           7.7         2.8          6.7         2.0 virginica
## 8           7.2         3.2          6.0         1.8 virginica
## 9           7.2         3.0          5.8         1.6 virginica
## 10          7.4         2.8          6.1         1.9 virginica
## 11          7.9         3.8          6.4         2.0 virginica
## 12          7.7         3.0          6.1         2.3 virginica
```

테이블 목록을 확인하면 임시 테이블이 생성된 것을 볼 수 있다


```r
src_tbls(sqlite_db)
```

```
## [1] "iris"         "sqlite_stat1" "vdtgepxwho"
```

<br />
<br />

---


`dplyr`은 db 작업을 할 때, 실수로 무거운 연산을 수행하는 것을 방지하기 위해서 몇 가지 제한을 둔다

우선, `nrow()`의 결과는 무조건 NA로 처리한다


```r
nrow(tbl(sqlite_db, sql('SELECT * FROM iris')))
```

```
## [1] NA
```

<br />

연산을 할 때, 실제로 계산이 다 끝나기 전에는 row의 개수가 얼마나 될지 파악하기 힘들기 때문에 `nrow()`의 결과는 NA로 반환한다

<br />

또, tbl의 결과물은 첫 10개만 보여준다

<br />

그리고 tail()함수를 사용할 수 없다.마찬가지로 전체 쿼리의 결과물을 보기 전에는 마지막 row를 확인할 수 없다

```
# tail(tbl(sqlite_db, sql('SELECT * FROM iris')))
# > Error: tail is not supported by sql sources
```

<br />
<br />

---

 `query`항목에서는 데이터에 대한 작업이 sql로 어떻게 변환되었는지 확인할 수 있다

또는 `show_query()`함수를 통해 확인할 수 있다


```r
iris_fltd$query
```

```
## <Query> SELECT "Sepal.Length", "Sepal.Width", "Petal.Length", "Petal.Width", "Species"
## FROM "iris"
## WHERE "Sepal.Length" > 7.0
## <SQLiteConnection>
```

```r
show_query(iris_fltd)
```

```
## <SQL>
## SELECT "Sepal.Length", "Sepal.Width", "Petal.Length", "Petal.Width", "Species"
## FROM "iris"
## WHERE "Sepal.Length" > 7.0
```

<br />
<br />

---

## Group Operation

SQLite는 window function에 대한 지원이 취약하다. 따라서 group을 지정한 상태에서 mutate나 filter에 대한 결과물이 생각과는 다르게 나올 수 있다는 점을 염두해야 한다

<br />

로컬에 있는 iris에서 Species별로 Sepal.Length의 평균을 계산해서 새로운 열에 데이터를 저장하려고 한다


```r
iris %>% 
  group_by(Species) %>% 
  mutate(mean_SL = mean(Sepal.Length))
```

```
## Source: local data frame [150 x 6]
## Groups: Species [3]
## 
##    Sepal.Length Sepal.Width Petal.Length Petal.Width Species mean_SL
##           (dbl)       (dbl)        (dbl)       (dbl)  (fctr)   (dbl)
## 1           5.1         3.5          1.4         0.2  setosa   5.006
## 2           4.9         3.0          1.4         0.2  setosa   5.006
## 3           4.7         3.2          1.3         0.2  setosa   5.006
## 4           4.6         3.1          1.5         0.2  setosa   5.006
## 5           5.0         3.6          1.4         0.2  setosa   5.006
## 6           5.4         3.9          1.7         0.4  setosa   5.006
## 7           4.6         3.4          1.4         0.3  setosa   5.006
## 8           5.0         3.4          1.5         0.2  setosa   5.006
## 9           4.4         2.9          1.4         0.2  setosa   5.006
## 10          4.9         3.1          1.5         0.1  setosa   5.006
## ..          ...         ...          ...         ...     ...     ...
```

<br />

`iris`와 `iris_db`의 데이터는 동일하지만 `group_by`를 통한 `mutate`연산을 *SQLite**가 지원하지 않기 때문에

위의 코드와는 전혀 다른 결과물이 나오게 된다



```r
iris_db %>% 
  group_by(Species) %>% 
  mutate(mean_SL = mean(Sepal.Length))
```

```
## Source: sqlite 3.8.6 [sqlite_db.sqlite3]
## From: iris [1 x 6]
## Grouped by: Species 
## 
##   Sepal.Length Sepal.Width Petal.Length Petal.Width   Species  mean_SL
##          (dbl)       (dbl)        (dbl)       (dbl)     (chr)    (dbl)
## 1          5.9           3          5.1         1.8 virginica 5.843333
```

<br />

반면에 summarise 함수는 정상적으로 작동한다


```r
iris %>% 
  group_by(Species) %>% 
  summarise(mean_SL = mean(Sepal.Length))
```

```
## Source: local data frame [3 x 2]
## 
##      Species mean_SL
##       (fctr)   (dbl)
## 1     setosa   5.006
## 2 versicolor   5.936
## 3  virginica   6.588
```

```r
iris_db %>% 
  group_by(Species) %>% 
  summarise(mean_SL = mean(Sepal.Length))
```

```
## Source: sqlite 3.8.6 [sqlite_db.sqlite3]
## From: <derived table> [?? x 2]
## 
##       Species mean_SL
##         (chr)   (dbl)
## 1      setosa   5.006
## 2  versicolor   5.936
## 3   virginica   6.588
## ..        ...     ...
```

<br />
<br />

---

## Other Databases

`Mysql`의 경우에는 `RMySQL` 패키지를 설치하고 나면 `src_mysql()`함수를 통해 접근할 수 있다

<br />

db와의 connection을 생성하고 나면 이후의 사용 방법은 대부분 비슷하다

```
mysql_db= src_mysql(dbname = "dbname", 
                    host = "000.000.000.00", 
                    user = 'user', 
                    password = 'password')
```

의 형태로 connection을 생성할 수 있다. 다만 윈도우에서는 `RMySQL` 설치 자체가 까다로울 수 있으니 주의해야 한다

<br />
<br />

---

dplyr의 데이터베이스 작업에 대해서 더 자세한 내용을 살펴보고 싶다면 

dplyr을 불러온 후에 `vignette('databases')` 를 통해 dplyr의 database 관련 작업에 대한 문서를 확인할 수 있다.

또는 <https://cran.r-project.org/web/packages/dplyr/vignettes/databases.html> 에서 문서를 볼 수 있다
