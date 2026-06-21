import React, { useEffect } from 'react'
import Navbar from './shared/Navbar';
import HeroSection from './HeroSection';
import CategoryCarausel from './CategoryCarausel';
import LatestJobs from './LatestJobs';
import Footer from './shared/Footer';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import { useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';

const Home = () => {
  useGetAllJobs()

  const navigate = useNavigate()
  const { user } = useSelector(store => store.auth)
  useEffect(() => {
    if (user?.role === "recruiter") {
      navigate("/admin/companies");
    }
  }, [user])
  return (
    <div>
      <Navbar />
      <HeroSection />
      <CategoryCarausel />
      <LatestJobs />
      <Footer />
    </div>
  )
}

export default Home
