%@correct.
p(1,2).q(1).
q(2).
%@check.
q(3).
q(4).
%@skip.
p(1,3). p(1,4).
p(2,1).
%@check.
p(2,2).
%@check.
p(2,3).
%@skip.
p(2,4).

%@skip.
a(X,Y) :- p(X,Y), not q(Y).
%@check.
b(X) :- p(X,_), not q(X), _debug1(X).
adorn_it(X) :- q(X), _debug2(X).

%@correct.
:- a(X,X), b(_).
%@check.
:- a(_,X), not b(X), _debug3(X).
:- adorn_it(X), _debug4(X).

%@skip.
:~ q(_). [1@2]
%@check.
:~ p(X,_), q(X). [2@3]
:~ adorn_it(X). [X@4]

_debug1(X) :-  p(X,_), not q(X).
_debug2(X) :-  q(X).
_debug3(X) :-  a(_,X), not b(X).
_debug4(X) :-  adorn_it(X).