'use client';

import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Eye, EyeOff } from 'lucide-react';
// import { useRouter } from 'next/navigation';
import CreateShop from '@src/shared/modules/auth/create-shop';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import Countries from '@packages/constant/countries';
import StripeLogo from '../../assets/svg/stripe-logo';

type FormData = {
  name: string;
  email: string;
  phone: string;
  country: string;
  password: string;
};

const steps = [
  { label: 'Create Account' },
  { label: 'Setup Shop' },
  { label: 'Connect Bank' },
];

const Signup = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [showOtp, setShowOtp] = useState(false);
  const [sellerData, setSellerData] = useState<FormData | null>(null);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState('');
  const inputRef = useRef<(HTMLInputElement | null)[]>([]);

  // const router = useRouter();

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

  const signupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/seller-registration`,
        data
      );
      return response.data;
    },
    onSuccess: (_, formData) => {
      setSellerData(formData);
      setShowOtp(true);
      setCanResend(false);
      setTimer(60);
      startResendTimer();
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!sellerData) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/seller-verify`,
        {
          ...sellerData,
          otp: otp.join(''),
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setSellerId(data?.seller?.id);
      setActiveStep(1);
      setShowOtp(false);
      setOtp(['', '', '', '']);
    },
  });

  const onSubmit = async (data: FormData) => {
    signupMutation.mutate(data);
  };

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

  const resendOtp = () => {
    if (sellerData) {
      signupMutation.mutate(sellerData);
      setOtp(['', '', '', '']);
      inputRef.current[0]?.focus();
      startResendTimer();
    }
  };

  const connectStripe = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-stripe-account`,
        { sellerId }
      );

      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full flex flex-col items-center pt-10 min-h-screen bg-[#F1F1F1]">
      {/* Stepper */}
      <div className="relative flex justify-between items-center mb-8 md:w-[50%]">
        <div
          className="absolute top-[25%] left-0 w-full h-1 z-10 transition-background"
          style={{
            background: `linear-gradient(to right, #3B82F6 ${
              50 * activeStep
            }%, #CCCCCC ${50 * activeStep}%, #CCCCCC 100%)`,
          }}
        />
        {steps.map((step, index) => (
          <div key={index}>
            <div
              className={`relative size-10 flex items-center justify-center rounded-full text-white font-bold z-20 ${
                index <= activeStep ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              {index + 1}
            </div>
            <div className="relative size-10 grid place-items-center">
              <span className="absolute w-fit text-center text-nowrap">
                {step?.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
        {activeStep === 0 && (
          <>
            {!showOtp ? (
              <form action="POST" onSubmit={handleSubmit(onSubmit)}>
                <h3 className="text-3xl font-semibold text-center mb-2">
                  Create Account
                </h3>

                <label
                  htmlFor="name"
                  className="block text-gray-700 mb-1 text-sm font-medium"
                >
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Sourav"
                  {...register('name', {
                    required: 'Name is required',
                  })}
                  className="w-full px-3 py-2 border border-gray-300 outline-0 rounded-md mb-1"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mb-2">
                    {String(errors.name.message)}
                  </p>
                )}

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

                <label
                  htmlFor="country"
                  className="block text-gray-700 mb-1 text-sm font-medium"
                >
                  Country
                </label>
                <select
                  {...register('country', {
                    required: 'Country is required',
                  })}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 outline-0 rounded-md mb-1"
                >
                  <option value="">Select your country</option>
                  {Countries.map((country) => (
                    <option key={country.code} value={country.name}>
                      {country.name} {country.flag}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="text-red-500 text-sm mb-2">
                    {String(errors.country.message)}
                  </p>
                )}

                <label
                  htmlFor="phone"
                  className="block text-gray-700 mb-1 text-sm font-medium"
                >
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <div className="w-[100px] px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center justify-center font-medium text-gray-700">
                    {selectedCountry
                      ? Countries.find((c) => c.name === selectedCountry)
                          ?.phone || '+00'
                      : '+00'}
                  </div>
                  <input
                    type="tel"
                    placeholder="1234567890"
                    {...register('phone', {
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[0-9]{10,15}$/,
                        message: 'Invalid phone number (digits only)',
                      },
                      minLength: {
                        value: 10,
                        message: 'Phone number must be at least 10 digits',
                      },
                      maxLength: {
                        value: 15,
                        message: 'Phone number must be at most 15 digits',
                      },
                    })}
                    className="flex-1 px-3 py-2 border border-gray-300 outline-0 rounded-md"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm mb-2">
                    {String(errors.phone.message)}
                  </p>
                )}

                <label
                  htmlFor="password"
                  className="block text-gray-700 mb-1 text-sm font-medium"
                >
                  Password
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
                  disabled={signupMutation.isPending}
                  className="w-full text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-all duration-200 my-4"
                >
                  {signupMutation.isPending ? 'Signing up...' : 'Signup'}
                </button>
                {signupMutation.isError &&
                  signupMutation.error instanceof AxiosError && (
                    <p className="text-red-500 text-sm mt-2">
                      {String(
                        signupMutation.error.response?.data?.message ||
                          signupMutation.error.message
                      )}
                    </p>
                  )}

                <p className="text-center text-gray-500 mb-2">
                  Already have an account?{' '}
                  <Link href={'/login'} className="text-blue-500">
                    Login
                  </Link>
                </p>
              </form>
            ) : (
              <div>
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
                      onClick={resendOtp}
                      className="text-blue-500 cursor-pointer"
                    >
                      Resend OTP
                    </button>
                  ) : (
                    `Resend OTP in ${timer} sec`
                  )}
                </p>
                {verifyOtpMutation.isError &&
                  verifyOtpMutation.error instanceof AxiosError && (
                    <p className="text-red-500 text-sm mt-2">
                      {String(
                        verifyOtpMutation.error.response?.data?.message ||
                          verifyOtpMutation.error.message
                      )}
                    </p>
                  )}
              </div>
            )}
          </>
        )}

        {activeStep === 1 && (
          <CreateShop sellerId={sellerId} setActiveStep={setActiveStep} />
        )}

        {activeStep === 2 && (
          <div className="text-center">
            <h3 className="text-3xl font-semibold mb-4">Withdraw Method</h3>
            <br />
            <button
              className="w-full  flex justify-center items-center gap-3 text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-all duration-200 my-4"
              onClick={connectStripe}
            >
              Connect Stripe <StripeLogo />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default Signup;
