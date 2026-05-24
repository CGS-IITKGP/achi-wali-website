import { useRef, useState } from "react";

type IOTPInputComponentProps = {
  length: number;
  onComplete: (pin: string) => void;
};

const OTPInputComponent: React.FC<IOTPInputComponentProps> = ({
  length,
  onComplete,
}) => {
  const inputRef = useRef<HTMLInputElement[]>([]);
  const [OTP, setOTP] = useState<string[]>(Array(length).fill(""));

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOTP = [...OTP];
    newOTP[index] = value;
    setOTP(newOTP);

    if (value && index < length - 1) {
      inputRef.current[index + 1]?.focus();
    }

    if (newOTP.every((digit) => digit !== "")) {
      onComplete(newOTP.join(""));
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOTP = [...OTP];
      if (OTP[index]) {
        newOTP[index] = "";
        setOTP(newOTP);
      } else if (index > 0) {
        inputRef.current[index - 1]?.focus();
        newOTP[index - 1] = "";
        setOTP(newOTP);
      }
    }
  };

 return (
  <div className="flex flex-wrap justify-between gap-2 sm:gap-3 w-full">
    {Array.from({ length }, (_, index) => (
      <div key={index} className="relative group">
        <input
          type="text"
          maxLength={1}
          value={OTP[index]}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          ref={(ref) => {
            inputRef.current[index] = ref as HTMLInputElement;
          }}
          className={`w-9 h-9 sm:w-14 sm:h-14  text-center text-white text-lg font-medium bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400/20 focus:border-pink-400 transition-all duration-300 group-hover:bg-white/10`}
        />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-400/0 via-pink-400/5 to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>
    ))}
  </div>
);

};

export default OTPInputComponent;
