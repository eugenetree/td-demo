import {Canvas} from 'react-three-fiber';
import {animated, useSpring} from 'react-spring';
import React, {useRef, useEffect} from 'react';
import * as easings from 'd3-ease';
import Scene from './Scene'

const Game = () => {
  const canvasRef = useRef()
  const canvasSpringProps = useSpring({
    top: '0%',
    opacity: 1,
    from: {
      top: '100%',
      opacity: 0
    },
  })

  useEffect(() => {
    setTimeout(() => {
      new Scene()
    }, 2000)
  }, [])

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
    </animated.div>
  )
}

export {
  Game
}
