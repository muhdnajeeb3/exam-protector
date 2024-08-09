import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const Timer = ({ initialMinute = 1, initialSeconds = 0, onTimeout }) => {
  const [minutes, setMinutes] = useState(initialMinute);
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    let myInterval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }
      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(myInterval);
          onTimeout();  // Trigger onTimeout callback
        } else {
          setMinutes(minutes - 1);
          setSeconds(59);
        }
      }

      // Notify when 15 minutes are left
      if (minutes === 15 && seconds === 0) {
        toast.info('15 minutes remaining');
      }
	  if (minutes === 5 && seconds === 0) {
        toast.info('5 minutes remaining');
      }
    }, 1000);

    return () => {
      clearInterval(myInterval);
    };
  }, [minutes, seconds, onTimeout]);

  return (
    <React.Fragment>
      {minutes === 0 && seconds === 0 ? 'Time Out' : (
        <h2 className="title-heading">
          {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </h2>
      )}
    </React.Fragment>
  );
};

export default Timer;
