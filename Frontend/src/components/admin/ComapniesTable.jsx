import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Avatar, AvatarImage } from '../ui/avatar'
import Logo from '../../assets/logo.png'

const ComapniesTable = () => {
    return (
        <div>
            <Table>
                <TableCaption>
                    A list of your recent registerd companies
                </TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Logo</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    <TableCell>
                        <Avatar className="cursor-pointer">
                            <AvatarImage src={Logo} />
                        </Avatar>
                    </TableCell>
                    <TableCell>
                        Comapny Name
                    </TableCell>
                    <TableCell>
                        14-06-2026
                    </TableCell>
                </TableBody>
            </Table>
        </div>
    )
}

export default ComapniesTable
