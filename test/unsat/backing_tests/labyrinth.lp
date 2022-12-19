dir(e). dir(w). dir(n). dir(s).
inverse(e,w). inverse(w,e).
inverse(n,s). inverse(s,n).

row(X) :- field(X,Y).
col(Y) :- field(X,Y).

num_rows(X) :- row(X), not row(XX), XX = X+1.
num_cols(Y) :- col(Y), not col(YY), YY = Y+1.

goal(X,Y,0)   :- goal_on(X,Y).
reach(X,Y,0)  :- init_on(X,Y).
conn(X,Y,D,0) :- connect(X,Y,D).

step(S) :- max_steps(S),     0 < S.
step(T) :- step(S), T = S-1, 1 < S.

%%  Direct neighbors

dneighbor(n,X,Y,XX,Y) :- field(X,Y), field(XX,Y), XX = X+1.
dneighbor(s,X,Y,XX,Y) :- field(X,Y), field(XX,Y), XX = X-1.
dneighbor(e,X,Y,X,YY) :- field(X,Y), field(X,YY), YY = Y+1.
dneighbor(w,X,Y,X,YY) :- field(X,Y), field(X,YY), YY = Y-1.

%%  All neighboring fields

neighbor(D,X,Y,XX,YY) :- dneighbor(D,X,Y,XX,YY).
neighbor(n,X,Y, 1, Y) :- field(X,Y), num_rows(X).
neighbor(s,1,Y, X, Y) :- field(X,Y), num_rows(X).
neighbor(e,X,Y, X, 1) :- field(X,Y), num_cols(Y).
neighbor(w,X,1, X, Y) :- field(X,Y), num_cols(Y).

%%  Select a row or column to push

neg_goal(T) :- goal(X,Y,T), not reach(X,Y,T).

rrpush(T)   :- step(T), neg_goal(S), S = T-1, not ccpush(T).
ccpush(T)   :- step(T), neg_goal(S), S = T-1, not rrpush(T).

orpush(X,T) :- row(X), row(XX), rpush(XX,T), X != XX.
ocpush(Y,T) :- col(Y), col(YY), cpush(YY,T), Y != YY.

rpush(X,T)  :- row(X), rrpush(T), not orpush(X,T).
cpush(Y,T)  :- col(Y), ccpush(T), not ocpush(Y,T).

push(X,e,T) :- rpush(X,T), not push(X,w,T).
push(X,w,T) :- rpush(X,T), not push(X,e,T).
push(Y,n,T) :- cpush(Y,T), not push(Y,s,T).
push(Y,s,T) :- cpush(Y,T), not push(Y,n,T).

%%  Determine new position of a (pushed) field

shift(XX,YY,X,Y,T) :- neighbor(e,XX,YY,X,Y), push(XX,e,T), step(T).
shift(XX,YY,X,Y,T) :- neighbor(w,XX,YY,X,Y), push(XX,w,T), step(T).
shift(XX,YY,X,Y,T) :- neighbor(n,XX,YY,X,Y), push(YY,n,T), step(T).
shift(XX,YY,X,Y,T) :- neighbor(s,XX,YY,X,Y), push(YY,s,T), step(T).
shift( X, Y,X,Y,T) :- field(X,Y), not push(X,e,T), not push(X,w,T), not push(Y,n,T), not push(Y,s,T), step(T).

%%  Move connections around

conn(X,Y,D,T) :- conn(XX,YY,D,S), S = T-1, dir(D), shift(XX,YY,X,Y,T), step(T).

%%  Location of goal after pushing

goal(X,Y,T) :- goal(XX,YY,S), S = T-1, shift(XX,YY,X,Y,T), step(T).

%%  Locations reachable from new position

reach(X,Y,T) :- reach(XX,YY,S), S = T-1, shift(XX,YY,X,Y,T), step(T).
reach(X,Y,T) :- reach(XX,YY,T), dneighbor(D,XX,YY,X,Y), conn(XX,YY,D,T), conn(X,Y,E,T), inverse(D,E), step(T).

%%  Goal must be reached

:- neg_goal(S), max_steps(S).

%% Project output

% #hide.
% #show push(Z,D,T).


field(1,1).
field(1,2).
field(1,3).
field(1,4).
field(2,1).
field(2,2).
field(2,3).
field(2,4).
field(3,1).
field(3,2).
field(3,3).
field(3,4).
field(4,1).
field(4,2).
field(4,3).
field(4,4).
init_on(3,2).
goal_on(1,4).
connect(1,1,s).
connect(1,1,w).
connect(1,2,n).
connect(1,2,e).
connect(1,2,w).
connect(1,3,e).
connect(1,4,n).
connect(1,4,w).
connect(2,1,n).
connect(2,1,w).
connect(2,2,n).
connect(2,2,w).
connect(2,3,n).
connect(2,3,s).
connect(2,4,n).
connect(2,4,e).
connect(2,4,w).
connect(3,1,n).
connect(3,1,s).
connect(3,2,n).
connect(3,2,w).
connect(3,3,e).
connect(3,4,n).
connect(3,4,s).
connect(3,4,w).
connect(4,1,n).
connect(4,1,w).
connect(4,2,n).
connect(4,2,s).
connect(4,2,e).
connect(4,2,w).
connect(4,3,n).
connect(4,3,e).
connect(4,4,w).
max_steps(2).