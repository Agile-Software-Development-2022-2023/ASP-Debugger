% Knight Tour

% Input:
% - size(N), if the chessboard is NxN
% - givenmove(X1,Y1,X2,Y2), if the knight must move from X1,Y1 to X2,Y2.

% Output:
% - move(X1,Y1,X2,Y2), if the knight moves from X1,Y1 to X2,Y2.


size(8). givenmove(7,5,8,7). givenmove(1,7,3,6). 

number(X) :- size(X).
number(X) :- number(Y), X=Y-1, X>0.

% There is no tour for a NxN chessboard where N is odd.
even :- size(N), number(X), N = X+X.
:- not even.

% There is no tour for a NxN chessboard where N is lesser than 6.
:- size(N), N < 6.


% Compute the cells of the chessboard.
row_col(X) :- number(X), X >= 1, X <= N, size(N), even.
cell(X,Y) :- row_col(X), row_col(Y).


% Given moves must be done.
move(X1,Y1,X2,Y2) :- givenmove(X1,Y1,X2,Y2).

% Guess the other moves.
move(X1,Y1,X2,Y2) | non_move(X1,Y1,X2,Y2):- valid(X1,Y1,X2,Y2).


% Compute the valid moves from each cell.
valid(X1,Y1,X2,Y2) :- cell(X1,Y1), cell(X2,Y2), X1 = X2+2, Y1 = Y2+1.
valid(X1,Y1,X2,Y2) :- cell(X1,Y1), cell(X2,Y2), X1 = X2+2, Y2 = Y1+1.
valid(X1,Y1,X2,Y2) :- cell(X1,Y1), cell(X2,Y2), X2 = X1+2, Y1 = Y2+1.
valid(X1,Y1,X2,Y2) :- cell(X1,Y1), cell(X2,Y2), X2 = X1+2, Y2 = Y1+1.
valid(X1,Y1,X2,Y2) :- cell(X1,Y1), cell(X2,Y2), X1 = X2+1, Y1 = Y2+2.
valid(X1,Y1,X2,Y2) :- cell(X1,Y1), cell(X2,Y2), X1 = X2+1, Y2 = Y1+2.
valid(X1,Y1,X2,Y2) :- cell(X1,Y1), cell(X2,Y2), X2 = X1+1, Y1 = Y2+2.
valid(X1,Y1,X2,Y2) :- cell(X1,Y1), cell(X2,Y2), X2 = X1+1, Y2 = Y1+2.


% Exactly one move entering to each cell.
:- cell(X,Y), not exactlyOneMoveEntering(X,Y).
exactlyOneMoveEntering(X,Y) :- move(X,Y,X1,Y1), not atLeastTwoMovesEntering(X,Y).
atLeastTwoMovesEntering(X,Y) :- move(X,Y,X1,Y1), move(X,Y,X2,Y2), X1 != X2.
atLeastTwoMovesEntering(X,Y) :- move(X,Y,X1,Y1), move(X,Y,X2,Y2), Y1 != Y2.

% Exactly one move leaving each cell.
:- cell(X,Y), not exactlyOneMoveLeaving(X,Y).
exactlyOneMoveLeaving(X,Y) :- move(X1,Y1,X,Y), not atLeastTwoMovesLeaving(X,Y).
atLeastTwoMovesLeaving(X,Y) :- move(X1,Y1,X,Y), move(X2,Y2,X,Y), X1 != X2.
atLeastTwoMovesLeaving(X,Y) :- move(X1,Y1,X,Y), move(X2,Y2,X,Y), Y1 != Y2.


% Each cell must be reached by the knight.
reached(X,Y) :- move(1,1,X,Y).
reached(X2,Y2) :- reached(X1,Y1), move(X1,Y1,X2,Y2).
:- cell(X,Y), not reached(X,Y).

