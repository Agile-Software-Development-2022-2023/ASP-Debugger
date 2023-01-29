q(1) :- k(1,2).
1 <= { p(X) } <= 2 :- q(X).

%% no buggy rules

%% missing support (because of q(1)):
% q(1) :- k(1,2).