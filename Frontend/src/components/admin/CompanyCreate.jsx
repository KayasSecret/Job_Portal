import React from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'

const CompanyCreate = () => {
    return (
        <div>
            <Navbar />
            <div className='max-w-4xl mx-auto'>
                <h1 className='font-bold text-2xl'>Your company name</h1>
                <p className='text-gray-500'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Illum, ipsum!</p>

                <Label>Company Name</Label>
                <Input
                    type="text"
                    className="my-2"
                    placeholder="Jobhunt, Microsoft"
                />
            </div>
        </div>
    )
}

export default CompanyCreate
