a(X):- b(X), #count{Y : c(Y, "string")}=T, #max{Y: b(Y)} = S, S>T.
d(X):-f(X).
c(1, "string").
c(2, "string").
b(1).
f(22).
f(a).
f("a").
:-a(X).