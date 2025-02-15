
"use client";

import { SessionProvider } from "next-auth/react";
import Link from "next/link";
import UserButton from "@/components/ui/user-botton";

const Home = () => {
  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-600 via-pink-500 to-teal-400 text-white p-6">
        <div className="absolute top-4 left-4">
          <p className="text-xl font-bold text-white">SketchToDress</p>
        </div>
        <div className="absolute top-4 right-4">
          <UserButton />
        </div>
        
        <div className="text-center mt-10">
          <h1 className="text-5xl font-bold mb-4 text-white">Revolutionize Your Fashion Designs</h1>
          <p className="text-lg mb-6 text-white">Upload your sketches, transform them into stunning clothing images, and render them as models with AI!</p>
          <Link href="/sketchtoimage" className="px-6 py-3 bg-white text-pink-500 text-lg font-semibold rounded-lg shadow-lg hover:bg-pink-500 hover:text-white transition-all">
            Try for Free
          </Link>
        </div>
      </div>
    </SessionProvider>
  );
};

export default Home;

