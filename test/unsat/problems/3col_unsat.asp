color(X,green) | color(X,red) | color( X,blue) :- node(X).
:- color(X,C), color(Y,C), X != Y, edge(X,Y).
node(1).
node(2).
node(3).
node(4).
edge(2,1).
edge(1,4).
edge(3,1).
edge(1,2).
edge(3,2).
edge(4,2).
edge(2,3).
edge(4,3).
edge(3,4).