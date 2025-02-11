"use client"

import { SessionProvider } from "next-auth/react";
import UserButton from "@/components/ui/user-botton";


const Home = () => {
  return ( <div>
    <SessionProvider>
      <UserButton />
    </SessionProvider> 
  </div>);
}

export default Home;
