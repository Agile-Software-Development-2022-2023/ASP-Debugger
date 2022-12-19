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