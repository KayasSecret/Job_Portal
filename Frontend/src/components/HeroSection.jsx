import React from 'react'
import { Button } from "./ui/button";
import { MagnifyingGlass } from "@phosphor-icons/react";

const HeroSection = () => {
  return (
    <div className="text-center">
      <div className="flex flex-col gap-6 my-10">
        <span className="mx-auto px-4 py-2 rounded-full bg-gray-100 text-[#F83002] font-bold">Amazing Job Portal Website</span>
        <h1 className="text-5xl font-bold">Search, Apply & <br />Get Your <span className="text-[#6A38C2]">Dream Job</span></h1>
        <p>Find the perfect job that matches your skills, passion, role and experience.</p>

        <div className="flex w-[40%] shadow-lg border border-gray-200 rounded-full pl-3 items-center mx-auto">
          <input
            type="text"
            placeholder="Find your dream job...!"
            className="outline-none border-none w-full"
          />
          <Button>
            <MagnifyingGlass
             className="h-5 w-5" 
            />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default HeroSection
