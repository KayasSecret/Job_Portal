import React from 'react'
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { RadioGroup } from '../ui/radio-group';
import { RadioGroupItem } from '../ui/radio-group';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';

const Signup = () => {
  return (
    <div>
      <Navbar />

      <div className="flex items-center justify-center max-w-7xl mx-auto">
        <form action="" className="w-1/2 border border-gray-200 rounded-md p-4 my-10">
          <h1 className="text-xl font-bold mb-5">Sign Up</h1>

          <div className="my-2">
            <label className="block mb-2">Full Name</label>
            <Input type="text" placeholder="Enter your full name" className="border border-gray-300 rounded-md p-2 w-full mb-4" />
          </div>

          <div className="my-2">
            <label className="block mb-2">Email</label>
            <Input type="email" placeholder="Enter your email" className="border border-gray-300 rounded-md p-2 w-full mb-4" />
          </div>

          <div className="my-2">
            <label className="block mb-2">Phone Number</label>
            <Input type="text" placeholder="Enter your phone number" className="border border-gray-300 rounded-md p-2 w-full mb-4" />
          </div>

          <div className="my-2">
            <label className="block mb-2">Password</label>
            <Input type="password" placeholder="Enter your password" className="border border-gray-300 rounded-md p-2 w-full mb-1" />
          </div>

          <div className="flex items-center justify-between">
            <RadioGroup className="flex items-center gap-5 my-4">

              <div className="flex items-center gap-3">
                <Input
                  type="radio"
                  value="student"
                  name="role"
                  className="cursor-pointer scale-110"
                />
                <Label className="text-md font-medium">Student</Label>
              </div>

              <div className="flex items-center gap-3">
                <Input
                  type="radio"
                  value="recruiter"
                  name="role"
                  className="cursor-pointer scale-110"
                />
                <Label className="text-md font-medium">Recruiter</Label>
              </div>

            </RadioGroup>

            <div className="flex items-center gap-2 w-150">
              <label>Profile</label>
              <Input accept="image/*" type="file" className="w-full cursor-pointer" />
            </div>

          </div>

          <Button type="submit" className="w-full my-4 cursor-pointer hover:bg-blue-800">Sign Up</Button>
          <div className="text-center text-md mt-2">
            <span>
              Already have an account?
              <Link to="/login" className="text-blue-500"> Login</Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Signup
