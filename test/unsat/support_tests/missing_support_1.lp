b(2). k(5).
a(X) :- b(X).
:- not a(1), k(X).

%% buggy rules
% :- not a(1), k(X).

%% missing support (because of a(1)):
% a(X) :- b(X).