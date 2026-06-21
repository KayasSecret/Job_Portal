import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { MoreHorizontal } from 'lucide-react'
import { useSelector } from 'react-redux'
import { store } from '@/redux/store'

const shortListingStatus = ["Accepted", "Rejected"]

const ApplicantsTable = () => {
  const { applicants } = useSelector(store => store.application)

  return (
    <div>
      <Table>
        <TableCaption>A list of recent applied users.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>FullName</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Resume</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            applicants && applicants?.applications?.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item?.applicant?.fullName}</TableCell>
                <TableCell>{item?.applicant?.email}</TableCell>
                <TableCell>{item?.applicant?.phoneNumber}</TableCell>
                <TableCell>
                  <a
                    className='text-blue-600 cursor-pointer'
                    href={item?.applicant?.profile?.resumeOriginalName}
                    target="_blank"
                    rel="noopener noreferrer">
                    {item?.applicant?.profile?.resumeOriginalName}
                  </a>
                </TableCell>
                <TableCell>{item?.applicant?.createdAt.split("T")[0]}</TableCell>
                <TableCell className="text-right cursor-pointer">
                  <Popover>
                    <PopoverTrigger>
                      <MoreHorizontal />
                    </PopoverTrigger>
                    <PopoverContent className="cursor-pointer">
                      {
                        shortListingStatus.map((status, index) => {
                          return (
                            <div key={index}>
                              <span>{status}</span>
                            </div>
                          )
                        })
                      }
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))
          }
        </TableBody>
      </Table>
    </div>
  )
}

export default ApplicantsTable
