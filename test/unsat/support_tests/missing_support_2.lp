b(2).
a(X) :- b(X).
a(X) | _a(X,Y) :- b(X), b(Y).
:- not a(1).