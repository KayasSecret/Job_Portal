import React from 'react'
import Navbar from '../shared/Navbar'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import ComapniesTable from './ComapniesTable'

const Companies = () => {
    return (
        <div>
            <Navbar />
            <div className='max-w-6xl mx-auto my-10'>
                <div className='flex items-center justify-between my-5'>
                    <Input
                        className="w-fit"
                        placeholder="Filter by name"
                    />
                    <Button>New Company</Button>
                </div>
                <ComapniesTable />
            </div>
        </div>
    )
}

export default Companies
