import React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Avatar, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { LogOut, User2 } from "lucide-react";
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Navbar() {
    const user = useSelector(store => store.auth.user)
    return (
        <div className="bg-white">
            <div className="flex items-center justify-between container mx-auto max-w-7xl h-16">
                <div>
                    <h1 className="text-2xl font-bold">Job <span className='text-[#F83002]'>Portal</span></h1>
                </div>
                <div className="flex items-center gap-12">
                    <ul className='flex font-medium items-center gap-5'>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/jobs">Jobs</Link></li>
                        <li><Link to="/browse">Browse</Link></li>
                    </ul>

                    {
                        !user ?
                            (
                                <div className="flex items-center gap-2">
                                    <Link to="/login">
                                        <Button variant="outline" className="cursor-pointer">Login</Button>
                                    </Link>
                                    <Link to="/signup">
                                        <Button variant="outline" className="bg-[#6A38C2] text-white hover:bg-[#7716ff] hover:text-white cursor-pointer">Signup</Button>
                                    </Link>
                                </div>
                            ) :
                            (
                                <Popover>
                                    {/* POPOVERTRIGGER */}
                                    <PopoverTrigger asChild>
                                        <Avatar className="cursor-pointer">
                                            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                        </Avatar>
                                    </PopoverTrigger>

                                    {/* POPOVERCONTENT */}
                                    <PopoverContent className="w-80">
                                        <div>
                                            <div className="flex gap-4">
                                                <Avatar className="cursor-pointer">
                                                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                                </Avatar>
                                                <div>
                                                    <h2 className="font-medium">Hire Nest</h2>
                                                    <p className="text-sm text-muted-foreground"> Lorem ipsum dolor sit amet.</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col my-2 text-600">
                                                <div className="flex w-fit items-center gap-2 cursor-pointer">
                                                    <User2 />
                                                    <Button variant="link" className="cursor-pointer"><Link to="/profile">View Profile</Link></Button>
                                                </div>
                                                <div className="flex w-fit items-center gap-2 cursor-pointer">
                                                    <LogOut />
                                                    <Button variant="link" className="cursor-pointer">Logout</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            )

                    }
                </div>
            </div>
        </div >
    )
}

export default Navbar
