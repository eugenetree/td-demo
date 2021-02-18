import {useGLTF} from "@react-three/drei";
import React, {useMemo, useRef, useState, Suspense, useEffect} from 'react'
import {Canvas, useFrame} from 'react-three-fiber'
import {animated, useSpring} from 'react-spring'
import {ResizeObserver} from '@juggle/resize-observer'
import * as THREE from 'three'
import {Game} from './Game'

function Model(props) {
  const group = useRef()
  const {nodes, materials} = useGLTF('/scene.glb')
  useFrame(() => {
    const scale = props.logoSpring.value
    group.current.scale.x = scale
    group.current.scale.y = scale
    group.current.scale.z = scale
    group.current.position.z = 10
    group.current.rotation.y -= props.rotateSpring.value
  })

  return (
    <group ref={group} {...props} dispose={null}>
      <mesh material={materials.wire_088144225} geometry={nodes.Tube008.geometry}>
        <meshStandardMaterial color='#ce0737' args={['color']}/>
      </mesh>
    </group>
  )
}

const roundedSquareWave = (t, delta = 0.1, a = 1, f = 1 / 10) => {
  return ((2 * a) / Math.PI) * Math.atan(Math.sin(2 * Math.PI * t * f) / delta)
}

function Dots({ticksSpring, clickSpring, duration, ...props}) {
  const ref = useRef()
  const {vec, right, transform, vec3Mouse, focus, positions} = useMemo(() => {
    const vec = new THREE.Vector3()
    const transform = new THREE.Matrix4()
    const right = new THREE.Vector3(1, 0, 0)
    const vec3Mouse = new THREE.Vector3()
    const focus = new THREE.Vector3()
    const positions = [...Array(10000)].map((_, i) => {
      const position = new THREE.Vector3()
      position.x = (i % 100) - 50
      position.y = Math.floor(i / 100) - 50
      position.y += (i % 2) * 0.5
      position.x += Math.random() * 0.3
      position.y += Math.random() * 0.3
      return position
    })
    return {vec, right, transform, vec3Mouse, focus, positions}
  }, [])

  useFrame(({mouse, viewport}) => {
    for (let i = 0; i < 10000; ++i) {
      focus.copy(vec3Mouse).multiplyScalar(clickSpring.value + .1)
      vec.copy(positions[i]).sub(focus)
      const dist = vec.length() + Math.cos(vec.angleTo(right) * 8) * 0.5
      const t = ticksSpring.value / 2 + 1 / 2 - dist / 100
      const wave = roundedSquareWave(t, 0.15 + (0.2 * dist) / 72, 0.4, 1)
      vec.multiplyScalar(wave + 1.3).add(focus)
      transform.setPosition(vec)
      ref.current.setMatrixAt(i, transform)
    }
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh args={[null, null, 10000]} ref={ref} {...props}>
      <circleBufferGeometry args={[0.15, 8]}/>
      <meshBasicMaterial color={'rgb(162,162,162)'}/>
    </instancedMesh>
  )
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState(0)
  const [progressIsEnough, setProgressIsEnough] = useState(false)
  const [progressPercent, setProgressPercent] = useState(0)
  const [ticks, setTicks] = useState(0)
  const [rotateFreq, setRotateFreq] = useState(.01)
  const [logoScale, setLogoScale] = useState(.03)

  const initScreenSpringProps = useSpring({
    opacity: activeScreen === 1 ? 0 : 1,
    config: {duration: 1500}
  })

  const {logoSpring} = useSpring({
    logoSpring: ticks % 2 === 1 ? .02 : logoScale,
    config: {precision: .001, tension: 10, friction: 10, clamp: true, duration: 2500}
  })

  const {ticksSpring, clickSpring, rotateSpring} = useSpring({
    onFrame: ({clickSpring}) => {
      if (progressIsEnough) return
      setProgressPercent(clickSpring)
      if (clickSpring > .75) setTimeout(() => setProgressIsEnough(true), 1500)
    },

    ticksSpring: ticks, // Springy tick value (each click / release is a tick)
    clickSpring: ticks % 2 === 1 ? 1 : 0, // Springy click factor (1 means clicked, 0 means released)
    rotateSpring: ticks % 2 === 1 ? .01 : rotateFreq,
    config: {precision: .001, tension: 10, friction: 10}
  })

  const handlePointerDown = e => {
    setTicks(ticks + 1)
  }

  const handlePointerUp = e => {
    if (clickSpring.value > 0.75) {
      setTimeout(() => {
        setRotateFreq(.01)
        setLogoScale(1)
      }, 300)

      setTimeout(() => setActiveScreen(1), 1000)

      setTicks(ticks + 1)
    } else setTicks(ticks - 1)
  }

  const clicksInRow = useRef({
    count: 0,
    lastClickedTime: +new Date()
  })

  const handleClick = e => {
    const clicks = clicksInRow.current
    const currentTime = +new Date()
    if (currentTime - clicks.lastClickedTime > 500) {
      clicksInRow.current = {
        count: 0,
        lastClickedTime: currentTime
      }
    } else {
      const nextCount = clicks.count + 1
      if (nextCount === 2) window.location.reload()
      clicksInRow.current = {
        count: nextCount,
        lastClickedTime: currentTime
      }
    }
  }

  return (
    <div
      onTouchStart={handlePointerDown}
      onTouchEnd={handlePointerUp}
    >
      <animated.div
        style={initScreenSpringProps}
        className="init-screen"
        onClick={handleClick}
      >
        <Canvas
          orthographic
          colorManagement={false}
          camera={{position: [0, 0, 100], zoom: 15}}
          resize={{polyfill: ResizeObserver}}  // Allows @react-spring/three to work in Safari
        >
          <pointLight position={[0, 0, 100]}/>
          <color attach="background" args={['black']}/>
          <Dots
            ticksSpring={ticksSpring}
            clickSpring={clickSpring}
            duration={3.8}
          />
          <Suspense fallback={null}>
            <Model
              activeScreen={activeScreen}
              setActiveScreen={setActiveScreen}
              rotateSpring={rotateSpring}
              logoSpring={logoSpring}
              ticksSpring={ticksSpring}
              clickSpring={clickSpring}/>
          </Suspense>
        </Canvas>
      </animated.div>

      {activeScreen === 1 && <Game/>}
      {/*{true && <Game/>}*/}

      {/*<animated.div*/}
      {/*  className="game-screen"*/}
      {/*  style={gameScreenSpringProps}*/}
      {/*>*/}
      {/*  <Canvas ref={gameScreenRef}>*/}
      {/*  </Canvas>*/}
      {/*</animated.div>*/}


      <span className={`ready-alert ${progressIsEnough && activeScreen === 0 && `ready-alert--blinking`}`}>
        that's enough, bro
      </span>

      <div className={`progress-bar ${activeScreen === 1 && `progress-bar--hidden`}`}>
        <animated.div
          className="progress-bar__line"
          style={{width: progressIsEnough ? '100%' : progressPercent * 133 + '%'}}
        />
      </div>
    </div>
  )
}
