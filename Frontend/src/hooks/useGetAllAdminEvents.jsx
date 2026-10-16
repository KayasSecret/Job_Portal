import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { EVENT_API_ENDPOINT } from "@/utils/constant";
import { setAllAdminEvents } from "@/redux/eventSlice";

const useGetAllAdminEvents = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllAdminEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${EVENT_API_ENDPOINT}/admin`, {
        withCredentials: true,
      });

      if (res.data.success) {
        dispatch(setAllAdminEvents(res.data.events || []));
      }
    } catch (err) {
      console.error("Error fetching admin events:", err);
      setError(err?.response?.data?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchAllAdminEvents();
  }, [fetchAllAdminEvents]);

  return { refetch: fetchAllAdminEvents, loading, error };
};

export default useGetAllAdminEvents;