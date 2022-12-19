node(1..
6).
arco(1
,2)
. arco(1,6).
 arco(1,5).
arco(2,1). arco(2,3). arco(2,4). arco(2,6).
arco(3,2). arco(3,4).
arco(4,3). arco(4,2). arco(4,6). arco(4,5).
arco
(5,1). arco(5,4). arco(5,6).
arco(6,1). arco(6,4). arco(6,5).

cammino(1,
2).
cammino
    (
    C,
    B
    ) |
    nonCammino(C,B) :-
        cammino
        (
        A
        ,
        C
        ),
        arco(C,B).
:-
cammino(A,B),
cammino(C,B),
A
!=
C.
:- cammino(A,B), cammino(A,C), B!=C.
uscenteDa(A) :- cammino(A,_).
entranteIn(A) :- cammino(_,A).
:-
entranteIn(A),
     not 
     uscenteDa(A).
:- 
uscenteDa(A), not entranteIn(A).
passoDa(A) :- cammino(A,_).
passoDa(B) :-
cammino(
    _
    ,
    B).
:- node(X), not passoDa(X).