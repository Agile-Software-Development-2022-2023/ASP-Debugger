a(X) :- b(X).
c(X) :- a(X), b(Y).
:- c(X).
h(X):-g(X).
g("1").
b("1").
b("2").
b("3").