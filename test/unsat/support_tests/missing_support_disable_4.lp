b(1..2).
a(X) :- b(X).
%#debug support=none.
%#debug support=none.
a(X) | _a(X,Y) :- b(X), b(Y).
:- not a(1).
:- b(2).