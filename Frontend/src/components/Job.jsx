import React from 'react'
import { Button } from './ui/Button'
import { BookmarkIcon } from 'lucide-react'
import { Avatar } from './ui/Avatar'
import { AvatarImage } from './ui/Avatar'
import Logo from '../assets/logo.png'
import { Badge } from './ui/Badge'

const Job = () => {
  return (
    <div className="p-5 rounded-md shadow-xl bg-white border border-gray-200">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">2 Days ago</p>
        <Button variant="outline" className="rounded-full" size="icon"><BookmarkIcon /></Button>
      </div>

      <div className="flex items-center gap-2 my-2">
        <Button variant="outline" className="p-6" size="icon">
          <Avatar className="cursor-pointer">
            <AvatarImage src={Logo} />
          </Avatar>
        </Button>

        <div>
          <h1 className="font-bold text-lg">Company Name</h1>
          <p className="text-sm text-gray-600">India</p>
        </div>
      </div>

      <div>
        <h1 className="font-bold text-lg my-2">Title</h1>
        <p className="text-sm text-gray-600">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quaerat, laborum! Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusantium, nobis.</p>
      </div>

      <div className="flex items-center mt-4">
        <Badge className={"text-blue-700 font-bold "} variant="ghost">Positions: 12</Badge>
        <Badge className={"text-[#F83002] font-bold "} variant="ghost">Job Type: Full-time</Badge>
        <Badge className={"text-[#7209b7] font-bold "} variant="ghost">Salary: 20LPA</Badge>
      </div>

      <div className="flex items-center gap-4 mt-4">
        <Button variant="outline" className="cursor-pointer">Details</Button>
        <Button className="bg-[#7209b7] font-bold cursor-pointer">Save For Later</Button>
      </div>
    </div>
  )
}

export default Job
