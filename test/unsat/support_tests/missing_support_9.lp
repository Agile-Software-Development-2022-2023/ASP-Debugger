q(1) :- k(1,2).
2 <= {p(X)} <= 3 :- q(X).
k(1,2).

%% buggy rules:
% q(1) :- k(1,2).
% 2 <= {p(X)} <= 3 :- q(X).

%% no missing support