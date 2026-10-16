import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { EVENT_API_ENDPOINT } from "@/utils/constant";
import { setAllEvents } from "@/redux/eventSlice";

const useGetAllEvents = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  const fetchAllEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(EVENT_API_ENDPOINT, {
        withCredentials: true,
      });

      if (res.data.success) {
        dispatch(setAllEvents(res.data.events || []));
      }
    } catch (error) {
      console.error("Error fetching all events:", error);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchAllEvents();
  }, [fetchAllEvents]);

  return { refetch: fetchAllEvents, loading };
};

export default useGetAllEvents;