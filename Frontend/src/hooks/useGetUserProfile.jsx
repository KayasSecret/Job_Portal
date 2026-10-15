import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setUser } from "@/redux/authSlice";
import { USER_API_ENDPOINT } from "@/utils/constant";

/**
 * Custom hook to load the freshest authenticated user profile directly from the backend.
 * Persists the latest user data into the Redux auth state.
 */
const useGetUserProfile = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    let isMounted = true;

    const fetchUserProfile = async () => {
      try {
        const res = await axios.get(`${USER_API_ENDPOINT}/profile`, {
          withCredentials: true,
        });

        if (isMounted && res.data.success && res.data.user) {
          dispatch(setUser(res.data.user));
        }
      } catch (error) {
        // Silently catch or log; user may still have persisted state
        console.error("Failed to fetch fresh user profile:", error);
      }
    };

    fetchUserProfile();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);
};

export default useGetUserProfile;
