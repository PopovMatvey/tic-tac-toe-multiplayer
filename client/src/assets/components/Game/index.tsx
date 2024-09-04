import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import io from 'socket.io-client';
import "./css/style.css"

import { useState } from 'react';
const socket = io('ws://localhost:2000');

function Square({ value, onSquareClick }: any) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay, chooseType }: any) {
  const [statusO, setStatusO] = useState(0);
  const [statusX, setStatusX] = useState(0);
  let statusOVarible = 0;
  let statusXVarible = 0;

  // let statusO:number;
  // let statusX:number;

  function handleClick(i: any) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = chooseType;

    onPlay(nextSquares);
  }


  console.log("sdds" ,calculateWinner(squares))
  const winner = calculateWinner(squares);
  let status;


  if (winner) {
    if (winner === "X") {
      statusXVarible++;
    }

    if (winner === "O") {
      statusOVarible++;
    }

    console.log(winner === "X")
    console.log(winner === "O")

    if ((statusOVarible === 3) || (statusXVarible === 3)) {
      status = 'Winner: ' + winner;
    }

    // for (let i = 0; i < squares.length; i++) {
    //   squares[i] = "";
    // }

  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }


  return (
    <>
      <div className="status_zeros">Win O:{statusOVarible}</div>
      <div className="status_zeros">Win X:{statusXVarible}</div>
      <div className="status">{status}</div>
      <div className="score-container">
        
        Score:
        X: {statusO}
        O: {statusX}
      </div>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </>
  );
}

export function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  let currentSquares = history[currentMove];
  const [chooseType, setChooseType] = useState("");
  // let [currentSquares, setCurrentSquares]= history[currentMove];

  function handlePlay(nextSquares: any) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
    socket.emit('message', nextSquares);
  }

  function jumpTo(nextMove: any) {
    setCurrentMove(nextMove);
  }

  socket.on('message', (historyWS: any) => {
    const nextHistory = [...history.slice(0, currentMove + 1), historyWS];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  });

  // const moves = history.map((squares, move) => {
  //   let description;
  //   if (move > 0) {
  //     description = 'Go to move #' + move;
  //   } else {
  //     description = 'Go to game start';
  //   }
  //   return (
  //     <li key={move}>
  //       <button onClick={() => jumpTo(move)}>{description}</button>
  //     </li>
  //   );
  // });

  /**
   * 
   * @param _event 
   */
  const handlerOnCkickChooseTypeCross = (_event: any) => {
    setChooseType("X");
  }

  const handlerOnCkickChooseTypeZero = (_event: any) => {
    setChooseType("O");
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} chooseType={chooseType} />
      </div>
      <div className="choose-type">
        <span>Сторона {chooseType}</span>
        <button onClick={handlerOnCkickChooseTypeCross}>Выбрать Х</button>
        <button onClick={handlerOnCkickChooseTypeZero}>Выбрать О</button>
      </div>
    </div>
  );
}

function calculateWinner(squares: any) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }

  return null;
}
