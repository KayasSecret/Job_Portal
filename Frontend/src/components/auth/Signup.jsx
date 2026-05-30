import React from 'react'
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { RadioGroup } from '../ui/radio-group';
import { RadioGroupItem } from '../ui/radio-group';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { USER_API_ENDPOINT } from '../utils/constant';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [input, setInput] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "",
    file: ""
  })

  const navigate = useNavigate()

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value })
  }

  const changeFileHandler = (e) => {
    setInput({ ...input, file: e.target.files?.[0] })
  }

  const submitHandler = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("fullName", input.fullName)
    formData.append("email", input.email)
    formData.append("phoneNumber", input.phoneNumber)
    formData.append("password", input.password)
    formData.append("role", input.role)
    if (input.file) {
      formData.append("file", input.file)
    }
    try {
      const res = await axios.post(`${USER_API_ENDPOINT}/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        withCredentials: true
      })
      if (res.data) {
        navigate("/login")
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
          <h1 className="text-xl font-bold mb-5">Sign Up</h1>

          <div className="my-2">
            <label className="block mb-2">Full Name</label>
            <Input
              type="text"
              value={input.fullName}
              name="fullName"
              onChange={changeEventHandler}
              placeholder="Enter your full name"
              className="border border-gray-300 rounded-md p-2 w-full mb-4" />
          </div>

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
            <label className="block mb-2">Phone Number</label>
            <Input
              type="text"
              value={input.phoneNumber}
              name="phoneNumber"
              onChange={changeEventHandler}
              placeholder="Enter your phone number"
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

            <div className="flex items-center gap-2 w-150">
              <label>Profile</label>
              <Input
                accept="image/*"
                type="file"
                onChange={changeFileHandler}
                className="w-full cursor-pointer" />
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
