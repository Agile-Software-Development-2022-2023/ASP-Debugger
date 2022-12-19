color(X,green) | color(X,red) :- node(X).
:- color(X,C), color(Y,C), X != Y, edge(X,Y).
node(1).
node(2).
node(3).
edge(1,2).
edge(2,1).
edge(1,3).
edge(3,1).
edge(2,3).
edge(3,2).