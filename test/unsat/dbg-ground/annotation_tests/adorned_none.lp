%@correct.
p(1,2).q(1).
q(2).
%@check.
q(3):-_debug1.
q(4).
%@skip.
p(1,3). p(1,4).
p(2,1).
%@check.
p(2,2):-_debug2.
%@check.
p(2,3):-_debug3.
%@skip.
p(2,4).

%@skip.
a(X,Y) :- p(X,Y), not q(Y).
%@check.
b(X) :- p(X,_), not q(X), _debug4(X).
adorn_it(X) :- q(X).

%@correct.
:- a(X,X), b(_).
%@check.
:- a(_,X), not b(X), _debug5(X).
:- adorn_it(X).

%@skip.
:~ q(_). [1@2]
%@check.
:~ p(X,_), q(X). [2@3]
:~ adorn_it(X). [X@4]

_debug1.
_debug2.
_debug3.
_debug4(X) :-  p(X,_), not q(X).
_debug5(X) :-  a(_,X), not b(X).