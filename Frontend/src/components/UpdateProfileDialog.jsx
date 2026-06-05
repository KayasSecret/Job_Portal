import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'

const UpdateProfileDialog = ({ open, setOpen }) => {
  const [loading, setLoading] = useState(false)
  const { user } = useSelector(store => store.auth)

  const [input, setInput] = useState({
    fullName: user?.fullName,
    email: user?.email,
    phoneNumber: user?.phoneNumber,
    bio: user?.profile?.bio,
    skills: user?.profile?.skills.map(skill => skill),
    resume: user?.profile?.resume
  })

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value })
  }

  const fileChangeHandler = (e) => {
    const file = e.target.file?.[0]
    setInput({...input, file})
  }

  const submitHandler = (e) => {
    e.preventDefaulter();
    const formData = new formData();

    formData.append = ("fullName", input.fullName)
    formData.append = ("email", input.email)
    formData.append = ("phoneNumber", input.phoneNumber)
    formData.append = ("bio", input.bio)
    formData.append = ("skills", input.skills)
    formData.append = ("fullName", input.fullName)
    
    console.log(input)
  }

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={() => setOpen(false)}>
          <DialogHeader>
            <DialogTitle>Update Profile</DialogTitle>
          </DialogHeader>

          <form onSubmit={submitHandler}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={input.fullName}
                  onChnage={changeEventHandler}
                  className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={input.email}
                  onChnage={changeEventHandler}
                  className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="number" className="text-right">Number</Label>
                <Input
                  id="number"
                  name="number"
                  type="text"
                  value={input.phoneNumber}
                  onChnage={changeEventHandler}
                  className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bio" className="text-right">Bio</Label>
                <Input
                  id="bio"
                  name="bio"
                  value={input.bio}
                  onChnage={changeEventHandler}
                  className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="skills" className="text-right">Skills</Label>
                <Input
                  id="skills"
                  name="skills"
                  value={input.skills}
                  onChnage={changeEventHandler}
                  className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file" className="text-right">Resume</Label>
                <Input
                  id="file"
                  name="file"
                  type="file"
                  accept="application/pdf"
                  onChange={fileChangeHandler}
                  className="col-span-3" />
              </div>
            </div>

            <DialogFooter>
              {
                loading ?
                  <Button className="w-full my-4"><Loader2 className="mr-2 h-4 w-4 animated-spin" /> Please Wait </Button> :
                  <Button type="submit" className="w-full my-4 cursor-pointer hover:bg-blue-800">Update</Button>
              }

            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UpdateProfileDialog