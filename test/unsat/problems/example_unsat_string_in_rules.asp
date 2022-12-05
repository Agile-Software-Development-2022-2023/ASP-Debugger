a(X) :- b(X), d(X, Y).
c(X) :- a(X), b(Y).
:- c(X).
h(X):-g(X).
g("1").
b("1").
b("2").
b("3").
d("1", "try constant in rule X Y").
d("2", "try constant in rule").
d("2", "try constant in rule").