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
    <div className="flex w-1/2">
      <div className="flex text-4xl w-32 items-center m-2">
        <span className="h-fit p-6">{timer.toFixed(2)}</span>
      </div>

      <div className="flex border-solid border-white border rounded-xl w-fit items-center m-2">
        <span className="h-12 w-12 bg-red-600 rounded-full inline-block m-2" style={{opacity: timer < 4 ? "1" : ".35"}}></span>
        <span className="h-12 w-12 bg-yellow-400 rounded-full inline-block m-2" style={{opacity: timer < 2 ? "1" : ".35"}}></span>
        <span className="h-12 w-12 bg-green-600 rounded-full inline-block m-2" style={{opacity: timer <= 0 ? "1" : ".35"}}></span>
      </div>
    </div>
  );
}