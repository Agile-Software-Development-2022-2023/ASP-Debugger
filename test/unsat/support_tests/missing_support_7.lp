p(1) :- f.
q(1) :- f.
:- not p(1), not q(1).

%% buggy rules:
% :- not p(1), not q(1).

%% missing support (because of f):
% no rule exists!

%% missing support (because of p(1)):
% p(1) :- f.

%% missing support (because of q(1)):
% q(1) :- f.