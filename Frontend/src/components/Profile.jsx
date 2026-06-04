import React from 'react'
import Navbar from './shared/Navbar';
import { Avatar } from './ui/Avatar'
import { AvatarImage } from './ui/Avatar'
import Logo from '../assets/logo.png'
import { Button } from './ui/button';
import { Pen } from 'lucide-react';
import { Mail } from 'lucide-react';
import { Contact } from 'lucide-react';
import { Badge } from './ui/badge';

const skills = ["html", "css", "js", "react", "node", "express", "mongodb", "mysql"]

const Profile = () => {
    return (
        <div>
            <Navbar />
            <div className="max-w-7xl mx-auto bg-white border border-gray-300 rounded-2xl my-5 p-8">
                <div className="flex justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar className="w-24 h-24">
                            <AvatarImage src={Logo} alt="Profile" />
                        </Avatar>
                        <div>
                            <h1 className="font-medium text-xl">Full Name</h1>
                            <p>Add your bio here...!</p>
                        </div>
                    </div>
                    <Button className="text-right cursor-pointer" variant="outline"><Pen /></Button>
                </div>

                <div className="my-5">
                    <div className="flex items-center gap-3 mt-3">
                        <Mail />
                        <span>kayasmishra@gmail.com</span>
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                        <Contact />
                        <span>93xxx-xx45</span>
                    </div>
                </div>

                <div>
                    <h1>Skills</h1>
                    {
                        skills.length !== 0 ? skills.map((item, index) => <Badge key={index}>{item}</Badge>) : <span>No skills added</span>
                    }
                </div>
            </div>
        </div>
    )
}

export default Profile
