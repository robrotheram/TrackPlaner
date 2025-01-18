import React from 'react'
import { ModlerProvider } from './context/ModlerContext'
import { TrackCurvedPiece, TrackStraightPiece } from './lib/Track'
import { ModelRailwayToolbar } from './components/ModalRailwayToolbar'

export const Logo = () => {
  return <div className='flex-col justify-center items-center sm:flex hidden'>
    <div className='w-[125px] h-[15px] mx-auto  bg-white border border-b-0 pt-0.5 px-0.5 rounded-t-full '>
      <div className='bg-red-700 w-full h-full rounded-t-full'></div>
    </div>
    <div className='bg-white border p-0.5 rounded-full '>
      <div className='w-[200px] bg-red-700 text-center p-0.5 rounded-full border'>
        <h1 className="text-lg font-bold tracking-wide text-white" style={{ fontFamily: 'Gill Sans, sans-serif', textTransform: "uppercase" }} >Model Planner</h1>
      </div>
    </div>
    <div className=' w-[125px] h-[15px] mx-auto  bg-white border border-t-0  pb-0.5 px-0.5 rounded-b-full '>
      <div className='bg-red-700 w-full h-full rounded-b-full'></div>
    </div>
  </div>
}

export const LogoSVG: React.FC = () => {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="24 24 455 125" preserveAspectRatio="none">
    <path d="M 385.119 28.703 C 404.725 28.703 420.619 44.597 420.619 64.203 L 420.619 110.203 C 420.619 129.809 404.725 145.703 385.119 145.703 L 114.115 145.703 C 94.515 145.703 78.615 129.809 78.615 110.203 L 78.615 64.203 C 78.615 44.597 94.515 28.703 114.115 28.703 L 385.119 28.703 Z" fill="white" stroke="brown" strokeWidth="1" />
    <path d="M 385.119 34.203 C 401.687 34.203 415.119 47.634 415.119 64.203 L 415.119 110.203 C 415.119 126.771 401.687 140.203 385.119 140.203 L 114.115 140.203 C 97.555 140.203 84.115 126.771 84.115 110.203 L 84.115 64.203 C 84.115 47.634 97.555 34.203 114.115 34.203 L 385.119 34.203 Z" fill="brown" stroke="none" />
    <path d="M 439.616 51.704 C 466.944 51.704 484.023 81.287 470.359 104.954 C 464.018 115.938 452.299 122.704 439.616 122.704 L 59.612 122.704 C 32.292 122.704 15.212 93.121 28.872 69.454 C 35.212 58.47 46.932 51.704 59.612 51.704 L 439.616 51.704 Z" fill="white" stroke="brown" strokeWidth="1" />
    <path d="M 439.617 57.204 C 462.711 57.204 477.144 82.204 465.597 102.204 C 460.238 111.486 450.335 117.204 439.617 117.204 L 59.613 117.204 C 36.523 117.204 22.093 92.204 33.633 72.204 C 38.993 62.922 48.903 57.204 59.613 57.204 L 439.617 57.204 Z" fill="brown" stroke="none" />
    <text style={{ fill: "rgb(255, 255, 255)", fontFamily: "Arial, sans-serif", fontSize: "28px", textAnchor: "middle", textTransform: "uppercase", whiteSpace: "pre" }} x="249.617" y="96.971">Station Name</text>
  </svg>
}

const tracks  = [

  {
    "x": 500,
    "y": 500,
    "rotation": 0,
    "code": "R 603",
    "startAngle": 180,
    "endAngle": 225,
    "radius": 335
  },
  {
    "x": 500,
    "y": 500,
    "rotation": 0,
    "code": "R 603",
    "startAngle": 225,
    "endAngle": 270,
    "radius": 335
  },
  {
    "x": 500,
    "y": 500,
    "rotation": 0,
    "code": "R 604",
    "startAngle": 90,
    "endAngle": 135,
    "radius": 335
  },
  {
    "x": 500,
    "y": 500,
    "rotation": 0,
    "code": "R 605",
    "startAngle": 135,
    "endAngle": 180,
    "radius": 335
  },
  {
    "x": 500,
    "y": 165,
    "rotation": 0,
    "code": "R 601",
    "length": 200
  },
  {
    "x": 700,
    "y": 165,
    "rotation": 0,
    "code": "R 602",
    "length": 200
  },


  
  {
    "x": 900,
    "y": 500,
    "rotation": 0,
    "code": "R 603",
    "startAngle": 325,
    "endAngle": 360,
    "radius": 335
  },
  {
    "x": 900,
    "y": 500,
    "rotation": 0,
    "code": "R 603",
    "startAngle": 270,
    "endAngle": 325,
    "radius": 335
  },
  {
    "x": 900,
    "y": 500,
    "rotation": 0,
    "code": "R 604",
    "startAngle": 0,
    "endAngle": 45,
    "radius": 335
  },
  {
    "x": 900,
    "y": 500,
    "rotation": 0,
    "code": "R 605",
    "startAngle": 45,
    "endAngle": 90,
    "radius": 335
  },
  {
    "x": 500,
    "y": 835,
    "rotation": 0,
    "code": "R 601",
    "length": 200
  },
  {
    "x": 700,
    "y": 835,
    "rotation": 0,
    "code": "R 602",
    "length": 200
  },
]

const trackPieces = tracks.map((track) => {
  if ('length' in track) {
    return new TrackStraightPiece(track.code, track.x, track.y, track.rotation, track.length!)
  } else {
    return new TrackCurvedPiece(track.code, track.x, track.y, track.rotation, track.startAngle, track.endAngle, track.radius)
  }
}) 

function App() {
  return (
    <ModlerProvider initialTracks={trackPieces}>  
     <ModelRailwayToolbar/>
    </ModlerProvider>
  )
}

export default App
