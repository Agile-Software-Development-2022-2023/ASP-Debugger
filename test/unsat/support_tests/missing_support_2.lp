b(2).
a(X) :- b(X).
a(X) | _a(X,Y) :- b(X), b(Y).
{
    a(3);
    a(4)
}.
:- not a(1).

%% buggy rules:
% :- not a(1).

%% missing support (because of a(1)):
% a(X) :- b(X).
% a(X) | _a(X,Y) :- b(X), b(Y).