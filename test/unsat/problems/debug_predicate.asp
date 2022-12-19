_debug(X) :- b(X).
c(X) :- _debug(X), b(Y), X < Y.
:- c(X).
h(X):-g(X).
g(1).
b(1..3).
