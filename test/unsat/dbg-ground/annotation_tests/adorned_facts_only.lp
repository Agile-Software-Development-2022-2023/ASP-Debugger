%@correct.
p(1,2).q(1):-_debug1.
q(2):-_debug2.
%@check.
q(3):-_debug3.
q(4):-_debug4.
%@skip.
p(1,3). p(1,4):-_debug5.
p(2,1):-_debug6.
%@check.
p(2,2):-_debug7.
%@check.
p(2,3):-_debug8.
%@skip.
p(2,4).

%@skip.
a(X,Y) :- p(X,Y), not q(Y).
%@check.
b(X) :- p(X,_), not q(X).
adorn_it(X) :- q(X).

%@correct.
:- a(X,X), b(_).
%@check.
:- a(_,X), not b(X).
:- adorn_it(X).

%@skip.
:~ q(_). [1@2]
%@check.
:~ p(X,_), q(X). [2@3]
:~ adorn_it(X). [X@4]

_debug1.
_debug2.
_debug3.
_debug4.
_debug5.
_debug6.
_debug7.
_debug8.