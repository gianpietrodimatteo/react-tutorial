import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Square(props) {
  return (
    <button
      className="square"
      style={{ background: props.highlite ? "#00CED1" : "#fff" }}
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

const lines = [
  // horizontal
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // vertical
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // diagonals
  [0, 4, 8],
  [2, 4, 6],
];

class Board extends React.Component {
  renderSquare(i, highlite) {
    return (
      <Square
        key={i}
        highlite={highlite}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  renderRow(j) {
    const cols = [];
    for (let k = 0; k < 3; k++) {
      const index = k + 3 * j;
      cols.push(this.renderSquare(index, this.props.highlite.includes(index)));
    }
    return (
      <div className="board-row" key={j}>
        {cols}
      </div>
    );
  }

  render() {
    const rows = [];
    for (let l = 0; l < 3; l++) {
      rows.push(this.renderRow(l));
    }
    return <div>{rows}</div>;
  }
}

class Menu extends React.Component {
  render() {
    const moves = this.props.history.map((step, move) => {
      const desc = move
        ? "Go to move #" +
          move +
          ` (col: ${step.colRow.col} row: ${step.colRow.row})`
        : "Go to game start";
      return (
        <li key={move}>
          <button
            className="menu-button"
            onClick={() => this.props.jumpTo(move)}
            style={{ fontWeight: move === this.props.stepNumber ? "bold" : "" }}
          >
            {desc}
          </button>
        </li>
      );
    });

    if (this.props.reverse) {
      moves.reverse();
    }

    return <ol className="menu-list">{moves}</ol>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          colRow: { col: null, row: null },
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      reverse: false,
    };
  }

  reverseList(state) {
    this.setState({
      reverse: !state,
    });
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const highlite = calculateWinner(squares);

    if (highlite || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares,
          colRow: getColRow(i),
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    const draw = calculateDraw(current.squares);

    let status;
    if (winner) {
      status = "Winner: " + (!this.state.xIsNext ? "X" : "O");
    } else if (draw) {
      status = "Draw! :(";
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            highlite={winner ? winner : [-1, -1, -1]}
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div style={{ float: "left" }}>{status}</div>
          <button
            className="reverse-button"
            onClick={() => this.reverseList(this.state.reverse)}
          >
            Reverse
          </button>
          <Menu
            reverse={this.state.reverse}
            history={history}
            stepNumber={this.state.stepNumber}
            jumpTo={(move) => this.jumpTo(move)}
          />
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [a, b, c];
    }
  }
  return null;
}

// When all holes are filled and no one won
function calculateDraw(squares) {
  for (let i = 0; i < squares.length; i++) {
    if (!squares[i]) {
      return false;
    }
  }
  return true;
}

function getColRow(j) {
  let row = 0;
  let col = 0;
  for (let i = 0; i < 6; i++) {
    const [a, b, c] = lines[i];
    if (i < 3 && (j === a || j === b || j === c)) {
      row = i;
    } else if (i >= 3 && (j === a || j === b || j === c)) {
      col = i - 3;
    }
  }

  return { col: col, row: row };
}
