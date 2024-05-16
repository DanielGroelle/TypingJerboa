import { useState, useEffect } from "react";

export default function TimerComponent({startTime}: {startTime: Date | null}) {
  const [timer, setTimer] = useState(5);

  useEffect(()=>{
    if (startTime !== null) {
      const countdown = setInterval(()=>{
        const newTimer = (startTime.getTime() - Date.now()) / 1000;
        setTimer(newTimer);
        /*
          TODO: fix going back a page while race is running causing this error
          Unhandled Runtime Error
          Error: Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.

          Source
          src/app/race/TimerComponent.tsx (10:8) @ setTimer

            8 | const countdown = setInterval(()=>{
            9 |   const newTimer = (startTime.getTime() - Date.now()) / 1000;
          > 10 |   setTimer(newTimer);
              |  ^
            11 |   
            12 |   //if the timer hits zero stop the interval
            13 |   if (newTimer <= 0) {
        */
        
        //if the timer hits zero stop the interval
        if (newTimer <= 0) {
          setTimer(0.0);
          clearInterval(countdown);
        }
      }, 9);
    }
  }, [startTime]);

  return (
    <div className="w-96 border-solid border-white border">
      {timer}
      <span className="h-12 w-12 bg-red-600 rounded-full inline-block m-2"></span>
      <span className="h-12 w-12 bg-yellow-400 rounded-full inline-block m-2"></span>
      <span className="h-12 w-12 bg-green-600 rounded-full inline-block m-2"></span>
    </div>
  );
}