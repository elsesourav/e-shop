'use client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MoveRight } from 'lucide-react';

const Hero = () => {
  const router = useRouter();

  return (
    <div className="bg-[#115061] h-[85vh] flex flex-col justify-center w-full">
      <div className="md:w-[80%] w-[90%] m-auto md:flex h-full items-center">
        <div className="md:w-1/2">
          <p className="font-Roboto font-normal text-white pb-2 text-xl">
            Starting from ₹149
          </p>
          <h1 className="text-white text-6xl font-extrabold font-Roboto">
            The best seeds <br />
            Collection 2025
          </h1>
          <p className="font-Oregano text-3xl pt-4 text-white">
            Exclusive offers <span className="text-yellow-400">10%</span> this
            week
          </p>
          <br />
          <button
            className="w-[140px] gap-2 font-semibold h-[40px] outline outline-white text-white flex justify-center items-center hover:bg-white hover:text-black rounded-lg transition-all duration-300"
            onClick={() => router.push('/products')}
          >
            Shop Now <MoveRight size={20} />
          </button>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <Image
            src="https://ik.imagekit.io/elsesourav/products/Screenshot%202025-10-25%20at%2011.33.30-Photoroom.png?updatedAt=1761375618468"
            alt="Hero Image"
            width={450}
            height={450}
          />
        </div>
      </div>
    </div>
  );
};
export default Hero;
