import { useEffect, useState } from 'react';

const Timer = (props:{ start: number }) => {
  const [time, setTime] = useState(0)
  
  useEffect(() => {
    let interval;
    if (props.start !== 0) {
      setTime(0)
      interval = setInterval(() => {
        setTime(new Date().getTime() - props.start)
      }, 50);
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval);
  }, [props.start]);

  return (
    <>
      <span>{("0" + Math.floor((time / 3600000) % 60)).slice(-2)}:</span>
      <span>{("0" + Math.floor((time / 60000) % 60)).slice(-2)}:</span>
      <span>{("0" + Math.floor((time / 1000) % 60)).slice(-2)}</span>
      {/* <span>.{("0" + ((time / 10) % 100)).slice(-2)}</span> */}
    </>
  );
}

export default Timer;