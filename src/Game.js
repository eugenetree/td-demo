import {Canvas} from 'react-three-fiber';
import {animated, useSpring, config} from 'react-spring';
import React, {useRef, useEffect, useState} from 'react';
import * as easings from 'd3-ease';
import Scene from './Scene'

const Game = () => {
  const [clock, setClock] = useState()
  const [activeInterface, setActiveInterface] = useState('init') // null || 'init' || 'countdown' || 'saving-result'

  const [leaderboard, setLeaderboard] = useState(JSON.parse(localStorage.getItem('leaderboard')) || {})
  const [nickname, setNickname] = useState('')

  const gameStartDate = useRef()
  const clockInterval = useRef()
  const [countdown, setCountdown] = useState(3)
  const [game, setGame] = useState(null)
  const saveResultInput = useRef()

  const canvasRef = useRef()
  const canvasSpringProps = useSpring({
    transform: 'translateY(0)',
    opacity: 1,
    config: {...config.default, duration: 1500, easing: easings.easePolyOut},
    from: {
      transform: 'translateY(100%)',
      opacity: 0,
    },
  })

  const startGame = () => {
    setActiveInterface('countdown')
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev - 1 === 0) clearInterval(interval)
        return prev - 1
      })
    }, 1000)
  }

  const stopGame = () => {
    clearInterval(clockInterval.current)
    setActiveInterface('saving-result')
  }

  const startClock = () => {
    clockInterval.current = setInterval(() => {
      setClock(((+new Date() - gameStartDate.current) / 1000).toFixed(2))
    }, 100)
  }

  const saveResult = () => {
    const nickname = saveResultInput.current.value
    const nextLeaderboard = {
      ...leaderboard,
      [nickname]: clock
    }

    setLeaderboard(nextLeaderboard)
    localStorage.setItem('leaderboard', JSON.stringify(nextLeaderboard))
  }

  useEffect(() => {
    setTimeout(() => {
      setGame(new Scene({onGameStop: stopGame}))
    }, 1500)
  }, [])

  useEffect(() => {
    if (countdown === 0) {
      setActiveInterface(null)
      gameStartDate.current = +new Date()
      startClock()
    }
  }, [countdown])

  return (
    <animated.div
      className="game-screen"
      style={canvasSpringProps}
    >
      <canvas
        ref={canvasRef}
        id="stage"
      />
      <nav className="mainNav">
        <ul className="mainNav__list">
          <li className="mainNav__el">
            <a href="#" className="mainNav__link">toppeople</a>
          </li>
          <li className="mainNav__el">
            <a href="#" className="mainNav__link">topgoals</a>
          </li>
          <li className="mainNav__el">
            <a href="#" className="mainNav__link">topdevs</a>
          </li>
        </ul>
      </nav>

      {activeInterface !== null && (
        <div className="game-menu-wrap">
          <div className="game-menu">
            {activeInterface === 'init' && (
              <>
                <div className="game-menu__list">
                  <div
                    className="game-menu__list-item"
                    onClick={startGame}
                  >
                    start
                  </div>
                </div>
                <div className="leaderboard">
                  {Object.entries(leaderboard).map(([username, time]) => (
                    <div>
                      {username}: {time}
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeInterface === 'countdown' && (
              <div className="game-menu__countdown">
                {countdown}
              </div>
            )}

            {activeInterface === 'saving-result' && (
              <div className="save-result">
                <div className="save-result__title">
                  nice try, bro. save your result <br/> {clock} seconds
                </div>
                <input
                  className="save-result__input"
                  type="text"
                  placeholder="enter your nickname"
                  ref={saveResultInput}
                />
                <div
                  className="save-result__btn"
                  onClick={saveResult}
                >
                  save result
                </div>
              </div>
            )}

            {/*{activeInterface === 'end' && (*/}
            {/*  <div className="result-panel">*/}
            {/*    <div className="result-panel__clock">*/}
            {/*      Your time: {clock}*/}
            {/*    </div>*/}

            {/*    <div className="result-panel__leaderboard">*/}
            {/*      <div className="result-panel__leaderboard-item">*/}

            {/*      </div>*/}
            {/*    </div>*/}
            {/*  </div>*/}
            {/*)}*/}
          </div>
        </div>
      )}

      {clock && (
        <div className="clock-panel">
          {clock}
        </div>
      )}
    </animated.div>
  )
}

export {
  Game
}
