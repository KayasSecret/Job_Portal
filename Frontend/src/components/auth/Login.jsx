import React from 'react'
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { RadioGroup } from '../ui/radio-group';
import { RadioGroupItem } from '../ui/radio-group';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { USER_API_ENDPOINT } from '../utils/constant';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [input, setInput] = useState({
    email: "",
    password: "",
    role: ""
  })

  const navigate = useNavigate()

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value })
  }

  const submitHandler = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post(`${USER_API_ENDPOINT}/login`, input, {
        headers: {
          "Content-Type": "application/json"
        },
        withCredentials: true
      })
      console.log(res.data.success)
      if (res.data.success) {
        navigate("/")
        toast.success(res.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response.data.message)
    }
  }
  return (
    <div>
      <Navbar />

      <div className="flex items-center justify-center max-w-7xl mx-auto">
        <form onSubmit={submitHandler} className="w-1/2 border border-gray-200 rounded-md p-4 my-10">
          <h1 className="text-xl font-bold mb-5">Login</h1>

          <div className="my-2">
            <label className="block mb-2">Email</label>
            <Input
              type="email"
              value={input.email}
              name="email"
              onChange={changeEventHandler}
              placeholder="Enter your email"
              className="border border-gray-300 rounded-md p-2 w-full mb-4" />
          </div>

          <div className="my-2">
            <label className="block mb-2">Password</label>
            <Input
              type="password"
              value={input.password}
              name="password"
              onChange={changeEventHandler}
              placeholder="Enter your password"
              className="border border-gray-300 rounded-md p-2 w-full mb-1" />
          </div>

          <div className="flex items-center justify-between">
            <RadioGroup className="flex items-center gap-5 my-4">

              <div className="flex items-center gap-3">
                <Input
                  type="radio"
                  value="student"
                  name="role"
                  checked={input.role === "student"}
                  onChange={changeEventHandler}
                  className="cursor-pointer scale-110"
                />
                <Label className="text-md font-medium">Student</Label>
              </div>

              <div className="flex items-center gap-3">
                <Input
                  type="radio"
                  value="recruiter"
                  name="role"
                  checked={input.role === "recruiter"}
                  onChange={changeEventHandler}
                  className="cursor-pointer scale-110"
                />
                <Label className="text-md font-medium">Recruiter</Label>
              </div>

            </RadioGroup>

          </div>

          <Button type="submit" className="w-full my-4 cursor-pointer hover:bg-blue-800">Login</Button>
          <div className="text-center text-md mt-2">
            <span>
              Don't have an account?
              <Link to="/signup" className="text-blue-500"> Sign Up</Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login