a(X) :- b(Y), c(Z), X=Y+Z.
d(Z) :- c(X), Z = 2*X-1.
b(1).
c(1).
b(2).
c(2).
:-a(K).
:-d(X).