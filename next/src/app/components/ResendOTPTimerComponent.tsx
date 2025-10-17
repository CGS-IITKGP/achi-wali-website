import { useState, useEffect } from "react";

interface IResendOTPTimerProps {
  initialTime: number;
  onResend: () => void;
}

const ResendOTPTimerComponent: React.FC<IResendOTPTimerProps> = (props) => {
  const [secondsLeft, setSecondsLeft] = useState(props.initialTime);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;

    if (isResendDisabled && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsResendDisabled(false);
      if (timer) clearInterval(timer);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [secondsLeft, isResendDisabled]);

  const handleResend = () => {
    if (isResendDisabled) {
      return;
    }

    setSecondsLeft(props.initialTime);
    setIsResendDisabled(true);

    props.onResend();
  };

  return (
    <div className="flex flex-row justify-between">
      {isResendDisabled ? (
        <p
          className="text-red-400 text-sm hover:cursor-not-allowed"
          onClick={handleResend}
        >
          Resend OTP in {secondsLeft}
        </p>
      ) : (
        <p
          className="text-pink-400 text-sm hover:cursor-pointer"
          onClick={handleResend}
        >
          Resend OTP
        </p>
      )}
    </div>
  );
};

export default ResendOTPTimerComponent;
