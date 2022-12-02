% Compute nodes from arcs
node(X) :- arc(X, _).
node(X) :- arc(_, X).
% Assign a color to each node
col(X, blue) | col(X, red) | col(X, yellow) :- node(X).
% Different colors for adjacent nodes
:- col(X, C1), col(Y, C2), arc(X, Y), C1=C2.