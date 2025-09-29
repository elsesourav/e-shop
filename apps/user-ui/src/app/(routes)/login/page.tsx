'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import GoogleButton from '../../../shared/components/google-button';
import { Eye, EyeOff } from 'lucide-react';

type FormData = {
  email: string;
  password: string;
};

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {};

  return (
    <div className="w-full py-10 min-h-[85vh] bg-[#F1F1F1]">
      <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
        Login
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . Login
      </p>
      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
          <h3 className="text-3xl font-semibold text-center mb-2">
            Login to Eshop
          </h3>
          <p className="text-center text-gray-500 mb-4">
            Don't have an account?{' '}
            <Link href={'/signup'} className="text-blue-500">
              Signup
            </Link>
          </p>

          <GoogleButton />
          <div className="flex items-center my-5 text-gray-400 text-sm">
            <div className="flex-1 border-t border-gray-300" />
            <span className="px-3">Or Sign in with Email</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          <form action="POST" onSubmit={handleSubmit(onSubmit)}>
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

            <div className="flex items-center justify-between my-4">
              <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                Remember Me
              </label>
              <Link href={'/forgot-password'} className="text-blue-500 text-sm">
                Forgot Password?
              </Link>
            </div>
            <button
              type="submit"
              className="w-full text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-all duration-200 mb-4"
            >
              Login
            </button>
            {serverError && (
              <p className="text-red-500 text-sm mb-2">
                {String(serverError)}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
export default Login;
