import { useState, useEffect } from "react";

export default function TimerComponent({startTime}: {startTime: Date | null}) {
  const [timer, setTimer] = useState(5);

  useEffect(()=>{
    if (startTime !== null) {
      const countdown = setInterval(()=>{
        const newTimer = (startTime.getTime() - Date.now()) / 1000;
        setTimer(newTimer);
        
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