import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { setUser } from "@/redux/authSlice";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  LogOut,
  User2,
  Briefcase,
  Building2,
  Menu,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { USER_API_ENDPOINT } from "@/utils/constant";
import { toast } from "sonner";
import Logo from "../../assets/Logo_Org.png"

function Navbar() {
  const { user } = useSelector((store) => store.auth) || {};
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const logoutHandler = async () => {
    try {
      const res = await axios.get(
        `${USER_API_ENDPOINT}/logout`,
        {
          withCredentials: true,
        }
      );

      if (res.data.success) {
        dispatch(setUser(null));
        navigate("/");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
        "Logout failed"
      );
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-purple-100 shadow-sm">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-[72px]">

          {/* LOGO */}

          <Link to="/" className="flex items-center gap-2">
            {/* <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#6A38C2] to-[#8B5CF6] flex items-center justify-center text-white font-bold shadow-md">
              HN
            </div> */}

            <div className="w-15 h-15">
              <img src={Logo} alt="" />
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#4C1D95] via-[#a53aed] to-[#C026D3] bg-clip-text text-transparent drop-shadow-sm">
              HIRE <span className="font-black">NEST</span>
            </h1>
          </Link>

          {/* NAVIGATION */}

          <div className="flex items-center gap-10">
            <ul className="hidden md:flex items-center gap-8 font-medium text-gray-700">

              {user && user.role === "recruiter" ? (
                <>
                  <li>
                    <Link
                      to="/admin/companies"
                      className={`transition-all duration-200 hover:text-[#6A38C2] ${isActive("/admin/companies")
                          ? "text-[#6A38C2] font-semibold"
                          : ""
                        }`}
                    >
                      Companies
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/admin/jobs"
                      className={`transition-all duration-200 hover:text-[#6A38C2] ${isActive("/admin/jobs")
                          ? "text-[#6A38C2] font-semibold"
                          : ""
                        }`}
                    >
                      Jobs
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      to="/"
                      className={`transition-all duration-200 hover:text-[#6A38C2] ${isActive("/")
                          ? "text-[#6A38C2] font-semibold"
                          : ""
                        }`}
                    >
                      Home
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/jobs"
                      className={`transition-all duration-200 hover:text-[#6A38C2] ${isActive("/jobs")
                          ? "text-[#6A38C2] font-semibold"
                          : ""
                        }`}
                    >
                      Jobs
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/browse"
                      className={`transition-all duration-200 hover:text-[#6A38C2] ${isActive("/browse")
                          ? "text-[#6A38C2] font-semibold"
                          : ""
                        }`}
                    >
                      Browse
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/savedjobs"
                      className={`transition-all duration-200 hover:text-[#6A38C2] ${isActive("/savedjobs")
                          ? "text-[#6A38C2] font-semibold"
                          : ""
                        }`}
                    >
                      Saved Jobs
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/events"
                      className={`transition-all duration-200 hover:text-[#6A38C2] ${isActive("/events")
                          ? "text-[#6A38C2] font-semibold"
                          : ""
                        }`}
                    >
                      Events
                    </Link>
                  </li>
                </>
              )}
            </ul>

            {/* AUTH SECTION */}

            {!user ? (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button
                    variant="outline"
                    className="border-purple-200 hover:bg-purple-50 hover:text-[#6A38C2]"
                  >
                    Login
                  </Button>
                </Link>

                <Link to="/signup">
                  <Button className="bg-[#6A38C2] hover:bg-[#5B21B6] text-white shadow-md">
                    Signup
                  </Button>
                </Link>
              </div>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <Avatar className="cursor-pointer border-2 border-purple-200 hover:border-[#6A38C2] transition-all">
                    <AvatarImage
                      src={user?.profile?.profilePhoto}
                      alt={user?.fullName}
                    />
                  </Avatar>
                </PopoverTrigger>

                <PopoverContent className="w-80 rounded-2xl border border-purple-100 shadow-xl">
                  <div className="space-y-4">

                    {/* USER INFO */}

                    <div className="flex gap-4 items-start">
                      <Avatar className="h-14 w-14 border border-purple-200">
                        <AvatarImage
                          src={user?.profile?.profilePhoto}
                          alt={user?.fullName}
                        />
                      </Avatar>

                      <div>
                        <h2 className="font-semibold text-lg">
                          {user?.fullName}
                        </h2>

                        <p className="text-sm text-gray-500">
                          {user?.profile?.bio ||
                            "Welcome to Job Portal"}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-3 space-y-2">

                      {user?.role !== "recruiter" && (
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-50 transition-all"
                        >
                          <User2 size={18} />
                          <span>View Profile</span>
                        </Link>
                      )}

                      <button
                        onClick={logoutHandler}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-50 text-red-500 transition-all w-full text-left"
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>

                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;