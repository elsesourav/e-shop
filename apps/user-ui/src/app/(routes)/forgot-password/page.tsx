'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

type FormData = {
  email: string;
  password: string;
};

const ForgotPassword = () => {
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const inputRef = useRef<(HTMLInputElement | null)[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const startResendTimer = () => {
    setCanResend(false);
    setTimer(60);
    const intervalId = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(intervalId);
          setCanResend(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const requestOtpMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user-forgot-password`,
        { email }
      );
      return response.data;
    },
    onSuccess: (_, { email }) => {
      setUserEmail(email);
      setStep('otp');
      setServerError(null);
      setCanResend(false);
      startResendTimer();
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message: string })?.message ||
        'Email not found!';
      setServerError(errorMessage);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userEmail) return;

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user-verify-forgot-password`,
        { email: userEmail, otp: otp.join('') }
      );
      return response.data;
    },
    onSuccess: () => {
      setStep('reset');
      setServerError(null);
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message: string })?.message ||
        'Invalid OTP try again!';
      setServerError(errorMessage);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      if (!password) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user-reset-password`,
        { email: userEmail, newPassword: password }
      );
      return response.data;
    },
    onSuccess: () => {
      setStep('email');
      toast.success(
        'Password reset successful! You can now log in with your new password.'
      );
      setServerError(null);
      router.push('/login');
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message: string })?.message ||
        'Failed to reset password. Try again!';
      setServerError(errorMessage);
    },
  });

  const handleOtpChange = (index: number, value: string) => {
    if (/^[0-9a-zA-Z]$/.test(value) || value === '') {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value !== '' && index < inputRef.current.length - 1) {
        inputRef.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRef.current[index - 1]?.focus();
    }
  };

  const onSubmitEmail = async (data: FormData) => {
    requestOtpMutation.mutate({ email: data.email });
  };

  const onSubmitReset = async (data: FormData) => {
    resetPasswordMutation.mutate({ password: data.password });
  };

  return (
    <div className="w-full py-10 min-h-[85vh] bg-[#F1F1F1]">
      <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
        Forgot Password
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . forgot-password
      </p>
      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
          {step === 'email' && (
            <>
              <h3 className="text-3xl font-semibold text-center mb-2">
                Login to Eshop
              </h3>
              <p className="text-center text-gray-500 mb-4">
                Go back to?{' '}
                <Link href={'/login'} className="text-blue-500">
                  Login
                </Link>
              </p>

              <form action="POST" onSubmit={handleSubmit(onSubmitEmail)}>
                <label
                  htmlFor="email"
                  className="block text-gray-700 mb-1 text-sm font-medium"
                >
                  Email
                </label>
                <input
                  type="email"
                  placeholder="elsesourav@support.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: 'Invalid email address',
                    },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 outline-0 rounded-md mb-1"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mb-2">
                    {String(errors.email.message)}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={requestOtpMutation.isPending}
                  className="w-full text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-all duration-200 my-4"
                >
                  {requestOtpMutation.isPending ? 'Sending OTP...' : 'Submit'}
                </button>
                {serverError && (
                  <p className="text-red-500 text-sm mb-2">
                    {String(serverError)}
                  </p>
                )}
              </form>
            </>
          )}

          {step === 'otp' && (
            <>
              <h3 className="text-xl font-semibold text-center mb-4">
                Enter OTP
              </h3>
              <div className="flex justify-center gap-6">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={data}
                    ref={(el) => {
                      if (el) inputRef.current[index] = el;
                    }}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="size-12 text-center border border-gray-300 outline-0 rounded-md text-lg"
                  />
                ))}
              </div>
              <button
                type="button"
                disabled={verifyOtpMutation.isPending}
                onClick={() => verifyOtpMutation.mutate()}
                className="w-full text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-all duration-200 my-4"
              >
                {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify OTP'}
              </button>
              <p className="text-center text-sm mt-4">
                {canResend ? (
                  <button
                    onClick={() =>
                      requestOtpMutation.mutate({ email: userEmail! })
                    }
                    className="text-blue-500 cursor-pointer"
                  >
                    Resend OTP
                  </button>
                ) : (
                  `Resend OTP in ${timer} sec`
                )}
              </p>
              {serverError && (
                <p className="text-red-500 text-sm mt-2">
                  {String(serverError)}
                </p>
              )}
            </>
          )}

          {step === 'reset' && (
            <>
              <h3 className="text-2xl font-semibold text-center mb-4">
                Reset Password
              </h3>
              <form onSubmit={handleSubmit(onSubmitReset)}>
                <label
                  htmlFor="password"
                  className="block text-gray-700 mb-1 text-sm font-medium"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={passwordVisible ? 'text' : 'password'}
                    placeholder="Minimum 6 characters"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters long',
                      },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 outline-0 rounded-md mb-1"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute inset-y-0 right-2 flex items-center text-gray-400"
                  >
                    {passwordVisible ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mb-2">
                    {String(errors.password.message)}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                  className="w-full text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-all duration-200 my-4"
                >
                  {resetPasswordMutation.isPending
                    ? 'Resetting Password...'
                    : 'Reset Password'}
                </button>
                {serverError && (
                  <p className="text-red-500 text-sm mb-2">
                    {String(serverError)}
                  </p>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default ForgotPassword;
