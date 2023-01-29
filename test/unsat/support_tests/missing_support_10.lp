p(X) :- k(_,X).
:- p(1), not p(11).
k(1,1..5).

%% buggy rules:
% p(X) :- k(_,X).
% :- p(1), not p(11).

%% missing support (because of p(11))
% p(X) :- k(_,X).