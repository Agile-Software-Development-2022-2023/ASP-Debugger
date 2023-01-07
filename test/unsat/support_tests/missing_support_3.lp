b(2).
_support(X) :- b(X).
_support(X) | _a(X,Y) :- b(X), b(Y).
:- not _support(1).