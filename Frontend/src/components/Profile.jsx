import React, { useState } from 'react'
import Navbar from './shared/Navbar';
import { Avatar } from './ui/Avatar'
import { AvatarImage } from './ui/Avatar'
import Logo from '../assets/logo.png'
import { Button } from './ui/button';
import { Pen } from 'lucide-react';
import { Mail } from 'lucide-react';
import { Contact } from 'lucide-react';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import AppliedJobTable from './AppliedJobTable';
import UpdateProfileDialog from './UpdateProfileDialog';

const skills = ["html", "css", "js", "react", "node", "express", "mongodb", "mysql"]
const isResume = true;

const Profile = () => {
    const [open, setOpen] = useState(false);

    return (
        <div>
            <Navbar />
            <div className="max-w-4xl mx-auto bg-white border border-gray-300 rounded-2xl my-5 p-8">
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
                    <Button onClick={() => setOpen(true)} className="text-right cursor-pointer" variant="outline"><Pen /></Button>
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

                <div className="my-5">
                    <h1>Skills</h1>
                    <div className="flex items-center gap-1">
                        {
                            skills.length !== 0 ? skills.map((item, index) => <Badge key={index}>{item}</Badge>) : <span>No skills added</span>
                        }
                    </div>
                </div>

                <div className="grid-w-full max-w-sm items-center gap-1.5">
                    <Label className="text-md font-bold">Resume</Label>
                    {
                        isResume ? <a target="blank" href="https://youtube.com/@patelmernstack" className="text-blue-500 w-full hover:underline cursor-pointer">Kayas MERN Stack</a> : <span>Not applicable</span>
                    }
                </div>

            </div>

            <div className="max-w-4xl mx-auto bg-white rounded-2xl">
                <h1 className="font-bold text-lg my-5">Applied Jobs</h1>
                {/* Application Table */}
                <AppliedJobTable />
            </div>
            <UpdateProfileDialog open={open} setOpen={setOpen} />
        </div>
    )
}

export default Profile
