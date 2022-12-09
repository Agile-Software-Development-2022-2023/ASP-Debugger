a(X):- b(X), #count{Y : c(Y)}=T, #max{Y: b(Y)} = S, S>T.
d(X):-f(X).
c(1).
c(2).
b(3).
f(22).
f(a).
f("a").
:-a(X).