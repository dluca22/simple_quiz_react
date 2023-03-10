import { useState, useEffect } from "react";
import { decodeHtml, shuffle } from "../helper_functions/";
import Question from "./Question";
import Confetti from "react-confetti";
import fakeAPI from "../fakeAPI";

// getting props from App and unpacking
export default function Quiz({ setRound, round }) {
  // keep track of result for the round
  const [result, setResult] = useState(0);
  // keep track of global score
  const [globalScore, setGlobalScore] = useState(0);

  // state to hold array of quiz questions
  const [quiz, setQuiz] = useState([]);
  // on submit button set gameEnded = true, check answers and if n/n play confetti
  const [gameEnded, setGameEnded] = useState(false);
  // new state for tracking selected answers, object with {id(key):userChoice(value)}
  const [selected, setSelected] = useState({});

  // on round update sends a request to API
  useEffect(() => {
    // ==== REAL API CALL ===========================================================

    fetch("https://opentdb.com/api.php?amount=5&type=multiple")
      .then((res) => res.json())
      .then((data) => {
        // create dynamic object based on num of questions to store user answers
        const userAnswers = data.results.reduce((acc, item, index) => {
          acc[index] = "";
          return acc;
        }, {});
        setSelected(userAnswers);

        // add all answer options in one key, then decode the html content and shuffle order
        let quizData = data.results.map((quest) => ({
          question: `${decodeHtml(quest.question)}`,
          all_answers: shuffle(
            decodeHtml([...quest.incorrect_answers, quest.correct_answer])
          ),
          correct_answer: decodeHtml(quest.correct_answer),
        }));
        return setQuiz(quizData);
      });
    // ==== END REAL API CALL ===========================================================

    /*
    // ======= TEMP FAKE API CALL ============================================================
    // getting data from a local file copy from openTDB,
    // same as the API, reduce() creates an object for storing userAnswers
    // then map creates array of question object to set in quiz State

    // setting obj for user Answers
    const userAnswers = fakeAPI.results.reduce((acc, item, index) => {
      acc[index] = "";
      return acc;
    }, {});
    setSelected(userAnswers);

    // setting data to quiz State
    let testData = fakeAPI.results.map((quest) => ({
      question: `${decodeHtml(quest.question)}`,
      all_answers: shuffle(
        decodeHtml([...quest.incorrect_answers, quest.correct_answer])
      ),
      correct_answer: decodeHtml(quest.correct_answer),
    }));
    setQuiz(testData);

    // ======= END TEMP FAKE API CALL ============================================================
*/



  }, [round]);

  // updates the `selected` state object to store userChoice for the corresponding question id
  function selectAnswer(id, userChoice) {
    // ternary operator allows to chose between values, or de-select it to revert to default empty value
    setSelected((prevState) => ({
      ...prevState,
      [id]: prevState[id] == userChoice ? "" : userChoice,
    }));
  }

  // generate <Question /> components, passing question, answer-options, the `selected` value for this question component and the function to handle setSelected
  const questions = quiz.map((item, index) => {
    return (
      <Question
        key={index}
        id={index}
        question={item.question}
        answers={item.all_answers}
        selected={selected[index]}
        correct_answer={quiz[index].correct_answer}
        gameEnded={gameEnded}
        handleChoice={selectAnswer}
      />
    );
  });

  useEffect(() => {
    if (gameEnded == true) {
      let score = 0;
      // map over quiz array, for each question check if correct_answer == selected[id] value
      quiz.map((question, index) => {
        score = question.correct_answer == selected[index] ? score + 1 : score;
      });
      setResult(score);
    }
  }, [gameEnded]);

  function newGame() {
    setRound((round) => round + 1);
    setGlobalScore((prevScore) => prevScore + result);
    setGameEnded(false);
  }

  return (
    <div className="Quiz">
      {gameEnded && result == 5 && <Confetti />}
      <div className="counters">
        <div>
          <span className="counter"> Round: </span>{" "}
          <span className="counter-result">{round}</span>
        </div>
        <div>
          <span className="counter">Global Score: </span>
          <span className="counter-result">
            {globalScore} / {round == 1 ? 0 : (round - 1) * 5}
          </span>
        </div>
        {gameEnded && <div className="round-result"> correct = {result}/5</div>}
      </div>

      {questions}

      <div className="quiz-buttons ">
        <div className="btn-1">
          <button className="homepage-button" onClick={() => setRound(0)}>
            {" "}
            &larr; Home
          </button>
        </div>
        <div className="btn-2">
          {gameEnded ? (
            <button className="new-game" onClick={() => newGame()}>
              Play Again?
            </button>
          ) : (
            <button className="submit" onClick={() => setGameEnded(true)}>
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
