import axios from 'axios'
import { useDispatch } from 'react-redux'
import { APPLICANT_API_ENDPOINT } from '@/utils/constant'
import { setAllAppliedJobs } from '@/redux/jobSlice'
import { useEffect } from 'react'

const useGetAppliedJobs = () => {
  const dispatch = useDispatch()
  
  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const res = await axios.get(`${APPLICANT_API_ENDPOINT}/get`, { withCredentials: true })
        console.log(res.data)
        if(res.data.success) {
          dispatch(setAllAppliedJobs(res.data.application))
        }
      } catch(error) {
        console.log(error);
        
      }
    } 
    fetchAppliedJobs()
  }, [])
}

export default useGetAppliedJobs
