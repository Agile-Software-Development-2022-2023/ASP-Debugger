a(X) :- b(X).
c(X) :- a(X), b(Y), X < Y.
b(1..3).
