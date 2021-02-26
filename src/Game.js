import {Canvas} from 'react-three-fiber';
import {animated, useSpring, config} from 'react-spring';
import React, {useRef, useEffect, useState} from 'react';
import * as easings from 'd3-ease';
import Scene from './Scene'

const Game = ({onExit}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [clock, setClock] = useState()
  const [activeInterface, setActiveInterface] = useState('init') // null || 'init' || 'countdown' || 'saving-result'

  const [leaderboard, setLeaderboard] = useState(JSON.parse(localStorage.getItem('leaderboard')) || {})

  const gameStartDate = useRef()
  const clockInterval = useRef()
  const [countdown, setCountdown] = useState(3)
  const [game, setGame] = useState(null)
  const [gameIsLoaded, setGameIsLoaded] = useState(false)
  const [gameIsGoing, setGameIsGoing] = useState(false)
  const saveResultInput = useRef()
  const reloadGameTimeout = useRef()

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
        if (prev === 1) {
          clearInterval(interval);
          return prev
        }
        return prev - 1
      })
    }, 1000)
  }

  const stopGame = () => {
    setGameIsGoing(false)
    clearInterval(clockInterval.current)
    setActiveInterface('saving-result')
  }

  const startClock = () => {
    clockInterval.current = setInterval(() => {
      setClock(((+new Date() - gameStartDate.current) / 1000).toFixed(2))
    }, 100)
  }

  const resetLeaderboard = () => {
    const password = prompt("Enter password")
    if (password === 'TD2020') {
      localStorage.removeItem('leaderboard')
      setLeaderboard({})
    } else alert ('incorrect pass')
  }

  const handleGameReloadTouchStart = () => {
    reloadGameTimeout.current = setTimeout(() => {
      window.location.reload()
    }, 3000)
  }

  const handleGameReloadTouchEnd = () => {
    clearInterval(reloadGameTimeout.current)
  }

  const saveResult = () => {
    const nickname = saveResultInput.current.value
    if (leaderboard[nickname] !== undefined) {
      alert('this name is already taken')
      return
    } else if (nickname.length < 2) {
      alert('enter name, please, at least 2 symbols')
      return
    }

    const nextLeaderboard = {
      ...leaderboard,
      [nickname]: clock
    }

    setGameIsLoaded(false)
    setLeaderboard(nextLeaderboard)
    localStorage.setItem('leaderboard', JSON.stringify(nextLeaderboard))
    setActiveInterface('init')
    setClock(null)
    setTimeout(() => {
      setGame(new Scene({onGameStop: stopGame, onGameLoad: () => setGameIsLoaded(true)}))
    }, 1000)
  }

  useEffect(() => {
    setTimeout(() => {
      setGame(new Scene({onGameStop: stopGame, onGameLoad: () => setGameIsLoaded(true)}))
    }, 1500)
  }, [])

  useEffect(() => {
    if (countdown === 1) {
      setTimeout(() => {
        setActiveInterface(null)
        gameStartDate.current = +new Date()
        startClock()
        setGameIsGoing(true)
        setCountdown(3)
      }, 1000)
    }
  }, [countdown])

  return (
    isVisible && (
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
              <a href="#" className="mainNav__link">TOPPEOPLE</a>
            </li>
            <li className="mainNav__el">
              <a href="#" className="mainNav__link">TOPGOALS</a>
            </li>
            <li className="mainNav__el">
              <a href="#" className="mainNav__link">TOPDEVS</a>
            </li>
          </ul>
        </nav>

        {gameIsGoing && (
          <div
            className="game-reload"
            onTouchStart={handleGameReloadTouchStart}
            onTouchEnd={handleGameReloadTouchEnd}
          >
            reload
          </div>
        )}

        {activeInterface !== null && (
          <div className="game-menu-wrap">
            <div className="game-menu">
              <div className="game-menu__reset" onClick={resetLeaderboard}>reset leaderboard</div>
              <div className="game-menu__exit" onClick={onExit}>exit</div>

              {activeInterface === 'init' && (
                <>
                  <div className="game-menu__list">
                    <div
                      className="game-menu__list-item"
                      onClick={startGame}
                    >
                      {gameIsLoaded ? 'start' : 'loading...'}
                    </div>
                  </div>
                  <div className="leaderboard">
                    {Object.entries(leaderboard).length ? Object.entries(leaderboard).sort(([keyA, timeA], [keyB, timeB]) => +timeA - +timeB).map(([username, time]) => (
                      <div>
                        {username}: {time}
                      </div>
                    )) : 'No any results yet'}
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
    ))
}

export {
  Game
}
