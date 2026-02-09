'use client';
import { useState, useRef, useEffect } from 'react';

export default function OtpModal({
  phone,
  visible,
  onClose,
}: {
  phone: string;
  visible: boolean;
  onClose: () => void;
}) {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (visible) {
      setOtp(['', '', '', '', '', '']);
      inputsRef.current = [];
      setTimeout(() => inputsRef.current[0]?.focus(), 0);
    }
  }, [visible]);

  const handleChange = (val: string, i: number) => {
    if (!/^[0-9]?$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[i] = val;
    setOtp(newOtp);
    if (val && i < 5) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, i: number) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) return alert('Enter all 6 digits');

    const res = await fetch('/api/auth/login/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber: phone, otp: fullOtp }),
    });

    const data = await res.json();
    if (data.success) {
      alert('Logged in successfully');
      onClose();
    } else {
      alert('Invalid OTP');
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-[90%] max-w-md rounded-lg bg-white p-6 text-center shadow-md">
        <h2 className="mb-2 text-xl font-semibold">OTP Verification</h2>
        <p className="mb-4 text-sm text-gray-600">Enter the 6-digit code sent to {phone}</p>
        <div className="mb-4 flex justify-center gap-2">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => {
                inputsRef.current[i] = el;
              }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(e.target.value, i)}
              onKeyDown={e => handleKeyDown(e, i)}
              className="h-12 w-10 rounded border text-center text-lg"
            />
          ))}
        </div>
        <button onClick={handleVerify} className="rounded-md bg-blue-600 px-4 py-2 text-white">
          Verify
        </button>
        <div className="mt-2 cursor-pointer text-sm text-blue-500" onClick={() => alert('Resent!')}>
          Resend
        </div>
      </div>
    </div>
  );
}
