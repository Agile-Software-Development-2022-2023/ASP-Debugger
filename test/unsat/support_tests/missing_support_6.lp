d(X) :- f(X,Y), a(Y).
a(X) :- n(X).
:- c(1), not d(1).

c(1). f(1,2). n(1).