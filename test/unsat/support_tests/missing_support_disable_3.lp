b(2).
_support(X) :- b(X).
_support(X) | _a(X,Y) :- b(X), b(Y).
1 <= 
{ _support(X) } 
<= 2 :- b(X), b(Y).
{ _support(X): 
b(X), b(Y); _support(3) }.
:- not _support(1).
%#debug support=none.