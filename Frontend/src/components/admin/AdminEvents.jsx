import React, { useState, useMemo } from "react";
import Navbar from "../shared/Navbar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import RecruiterHero from "./RecruiterHero";
import AdminEventCard from "./AdminEventCard";
import AdminEventsTable from "./AdminEventsTable";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useGetAllAdminEvents from "@/hooks/useGetAllAdminEvents";
import { setAllAdminEvents } from "@/redux/eventSlice";
import {
  CalendarDays,
  Search,
  Plus,
  Sparkles,
  Users,
  LayoutGrid,
  Table as TableIcon,
  X,
  RotateCcw,
  Laptop,
  Layers,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import axios from "axios";
import { EVENT_API_ENDPOINT } from "@/utils/constant";
import { toast } from "sonner";

/**
 * AdminEvents
 * Master Recruiter Events Management Dashboard.
 * Displays all events created by the authenticated recruiter with live metrics,
 * real-time filtering, card/table view toggles, publish/unpublish shortcuts,
 * and deletion management.
 */
const AdminEvents = () => {
  const { refetch, loading, error } = useGetAllAdminEvents();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { allAdminEvents = [] } = useSelector((store) => store.event);

  // Search & Filter State
  const [searchInput, setSearchInput] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedMode, setSelectedMode] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("cards"); // "cards" | "table"

  // Popover & Deletion State
  const [openPopoverId, setOpenPopoverId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Computed Dashboard Metrics
  const totalEventsCount = allAdminEvents?.length || 0;
  const publishedCount = useMemo(() => {
    return allAdminEvents?.filter(
      (e) => e?.status === "Published" || !e?.status
    )?.length || 0;
  }, [allAdminEvents]);

  const draftsCount = useMemo(() => {
    return allAdminEvents?.filter((e) => e?.status === "Draft")?.length || 0;
  }, [allAdminEvents]);

  const totalRegistrations = useMemo(() => {
    return (
      allAdminEvents?.reduce(
        (acc, e) => acc + (e?.attendees?.length || 0),
        0
      ) || 0
    );
  }, [allAdminEvents]);

  // Categories list derived dynamically from events + standard list
  const categoryOptions = useMemo(() => {
    const defaultCategories = [
      "Workshop",
      "Hackathon",
      "Webinar",
      "Conference",
      "Career Fair",
      "Networking",
      "Seminar",
      "Bootcamp",
    ];
    const existing = allAdminEvents.map((e) => e?.category).filter(Boolean);
    return Array.from(new Set([...defaultCategories, ...existing]));
  }, [allAdminEvents]);

  // Filter & Sort Pipeline
  const filteredEvents = useMemo(() => {
    let result = [...allAdminEvents];

    // 1. Text Search
    if (searchInput.trim()) {
      const q = searchInput.toLowerCase().trim();
      result = result.filter((event) => {
        const titleMatch = event?.title?.toLowerCase()?.includes(q);
        const descMatch = event?.description?.toLowerCase()?.includes(q);
        const orgMatch = event?.organizer?.toLowerCase()?.includes(q);
        const speakerMatch = event?.speaker?.toLowerCase()?.includes(q);
        const locMatch = event?.location?.toLowerCase()?.includes(q);
        const catMatch = event?.category?.toLowerCase()?.includes(q);
        const tagMatch = event?.tags?.some((t) => t?.toLowerCase()?.includes(q));
        return (
          titleMatch ||
          descMatch ||
          orgMatch ||
          speakerMatch ||
          locMatch ||
          catMatch ||
          tagMatch
        );
      });
    }

    // 2. Status Filter
    if (selectedStatus !== "All") {
      result = result.filter((event) => {
        const status = event?.status || "Published";
        return status.toLowerCase() === selectedStatus.toLowerCase();
      });
    }

    // 3. Format / Mode Filter
    if (selectedMode !== "All") {
      result = result.filter((event) => {
        const mode = event?.mode || "Online";
        if (selectedMode === "In-Person") {
          return mode === "In-Person" || mode === "Offline";
        }
        return mode.toLowerCase() === selectedMode.toLowerCase();
      });
    }

    // 4. Category Filter
    if (selectedCategory !== "All") {
      result = result.filter(
        (event) =>
          event?.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // 5. Sorting
    result.sort((a, b) => {
      if (sortBy === "soonest") {
        return new Date(a?.eventDate || 0) - new Date(b?.eventDate || 0);
      }
      if (sortBy === "registrations") {
        return (b?.attendees?.length || 0) - (a?.attendees?.length || 0);
      }
      if (sortBy === "title") {
        return (a?.title || "").localeCompare(b?.title || "");
      }
      // Default: "newest"
      return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
    });

    return result;
  }, [
    allAdminEvents,
    searchInput,
    selectedStatus,
    selectedMode,
    selectedCategory,
    sortBy,
  ]);

  const hasActiveFilters =
    Boolean(searchInput.trim()) ||
    selectedStatus !== "All" ||
    selectedMode !== "All" ||
    selectedCategory !== "All" ||
    sortBy !== "newest";

  const handleResetFilters = () => {
    setSearchInput("");
    setSelectedStatus("All");
    setSelectedMode("All");
    setSelectedCategory("All");
    setSortBy("newest");
  };

  // Quick Status Toggle (e.g. Published <-> Draft, or Cancelled)
  const handleTogglePublish = async (event, newStatus) => {
    try {
      const res = await axios.put(
        `${EVENT_API_ENDPOINT}/${event._id}`,
        { status: newStatus },
        { withCredentials: true }
      );

      if (res.data.success) {
        const updatedList = allAdminEvents.map((e) =>
          e._id === event._id ? { ...e, status: newStatus } : e
        );
        dispatch(setAllAdminEvents(updatedList));
        toast.success(
          `Event status changed to ${newStatus}`
        );
      }
    } catch (err) {
      console.error("Toggle event status error:", err);
      toast.error(
        err?.response?.data?.message || "Failed to update event status"
      );
    }
  };

  // Delete Event Handler
  const handleDeleteClick = (event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    try {
      setDeleting(true);
      const res = await axios.delete(
        `${EVENT_API_ENDPOINT}/${eventToDelete._id}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        const updatedList = allAdminEvents.filter(
          (e) => e._id !== eventToDelete._id
        );
        dispatch(setAllAdminEvents(updatedList));
        toast.success("Event deleted successfully");
        setDeleteDialogOpen(false);
        setEventToDelete(null);
      }
    } catch (err) {
      console.error("Delete event error:", err);
      toast.error(
        err?.response?.data?.message || "Failed to delete event"
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-transparent py-6 sm:py-10 overflow-x-hidden">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          {/* ================= HERO DASHBOARD BANNER ================= */}
          <RecruiterHero
            badgeText="Events Command Center"
            badgeIcon={CalendarDays}
            title="Tech Events & Workshops"
            description="Publish webinars, hackathons, and coding workshops to connect with high-caliber student developers."
            action={
              <Button
                onClick={() => navigate("/admin/events/create")}
                className="h-9 sm:h-10 px-4 sm:px-5 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 hover:from-purple-600 hover:via-pink-600 hover:to-amber-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-purple-900/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                <Plus size={16} />
                <span>Create Event</span>
              </Button>
            }
            stats={[
              {
                label: "Total Events",
                value: totalEventsCount,
                icon: CalendarDays,
                color: "text-purple-300",
              },
              {
                label: "Live / Published",
                value: publishedCount,
                icon: CheckCircle2,
                color: "text-emerald-400",
              },
              {
                label: "Total Registrations",
                value: totalRegistrations,
                icon: Users,
                color: "text-cyan-400",
              },
              {
                label: "Drafts",
                value: draftsCount,
                icon: Clock,
                color: "text-amber-300",
              },
            ]}
          />

          {/* ================= CONTROLS & FILTER BAR ================= */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-purple-100/90 shadow-[0_4px_20px_-4px_rgba(106,56,194,0.06)] p-3.5 sm:p-5 mb-6 transition-all">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
              {/* Left: Search Input */}
              <div className="relative flex-1 min-w-[240px] max-w-lg">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-600"
                />
                <Input
                  type="text"
                  placeholder="Search by title, speaker, tags, venue..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 pr-9 h-10 rounded-xl border-purple-100 bg-purple-50/40 text-xs sm:text-sm focus-visible:ring-[#6A38C2]"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Right: Select Filters & View Switcher */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                {/* Status Filter */}
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="h-10 w-[130px] rounded-xl border-purple-100 bg-purple-50/40 text-xs font-bold text-gray-700">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-purple-100 bg-white">
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Draft">Drafts</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                {/* Format / Mode Filter */}
                <Select value={selectedMode} onValueChange={setSelectedMode}>
                  <SelectTrigger className="h-10 w-[125px] rounded-xl border-purple-100 bg-purple-50/40 text-xs font-bold text-gray-700">
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-purple-100 bg-white">
                    <SelectItem value="All">All Formats</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="In-Person">In-Person</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>

                {/* Category Filter */}
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="h-10 w-[135px] rounded-xl border-purple-100 bg-purple-50/40 text-xs font-bold text-gray-700">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-purple-100 bg-white max-h-56">
                    <SelectItem value="All">All Categories</SelectItem>
                    {categoryOptions.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort Filter */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-10 w-[135px] rounded-xl border-purple-100 bg-purple-50/40 text-xs font-bold text-gray-700">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-purple-100 bg-white">
                    <SelectItem value="newest">Newest Created</SelectItem>
                    <SelectItem value="soonest">Event Date (Soonest)</SelectItem>
                    <SelectItem value="registrations">Most RSVPs</SelectItem>
                    <SelectItem value="title">Alphabetical (A-Z)</SelectItem>
                  </SelectContent>
                </Select>

                {/* Reset Button */}
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="h-10 px-2.5 rounded-xl text-purple-700 hover:bg-purple-50 text-xs font-bold"
                  >
                    <RotateCcw size={14} className="mr-1" />
                    <span>Reset</span>
                  </Button>
                )}

                {/* View Switcher: Cards vs Table */}
                <div className="flex items-center p-1 rounded-xl bg-purple-50/70 border border-purple-100 ml-auto sm:ml-0">
                  <button
                    type="button"
                    onClick={() => setViewMode("cards")}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      viewMode === "cards"
                        ? "bg-white text-[#6A38C2] shadow-xs font-bold"
                        : "text-gray-400 hover:text-gray-700"
                    }`}
                    title="Grid Cards View"
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      viewMode === "table"
                        ? "bg-white text-[#6A38C2] shadow-xs font-bold"
                        : "text-gray-400 hover:text-gray-700"
                    }`}
                    title="Compact Table View"
                  >
                    <TableIcon size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ================= CONTENT STATES ================= */}

          {/* 1. Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="rounded-3xl bg-white/70 border border-purple-100 p-4 h-96 animate-pulse flex flex-col justify-between"
                >
                  <div className="h-44 rounded-2xl bg-purple-100/60" />
                  <div className="space-y-3 mt-4">
                    <div className="h-4 w-1/3 bg-purple-100/60 rounded-md" />
                    <div className="h-6 w-3/4 bg-purple-100/60 rounded-md" />
                    <div className="h-3 w-full bg-purple-100/40 rounded-md" />
                  </div>
                  <div className="h-10 bg-purple-100/40 rounded-xl mt-4" />
                </div>
              ))}
            </div>
          )}

          {/* 2. Error State */}
          {!loading && error && (
            <div className="rounded-3xl bg-rose-50/80 border border-rose-200 p-8 text-center max-w-lg mx-auto my-8">
              <AlertCircle size={36} className="text-rose-500 mx-auto mb-3" />
              <h3 className="text-lg font-black text-rose-950">
                Failed to Load Events
              </h3>
              <p className="text-xs text-rose-700 mt-1 mb-4">{error}</p>
              <Button
                onClick={refetch}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* 3. Empty State (No events at all) */}
          {!loading && !error && allAdminEvents.length === 0 && (
            <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-purple-100 p-10 sm:p-14 text-center max-w-xl mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-100 to-pink-100 border border-purple-200/80 flex items-center justify-center mx-auto mb-4 text-[#6A38C2] shadow-inner">
                <CalendarDays size={30} />
              </div>

              <h2 className="text-xl font-black text-gray-950">
                No Events Created Yet
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1.5 max-w-md mx-auto leading-relaxed">
                Host your first tech conference, hackathon, or university workshop to showcase your engineering culture and recruit top candidates.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button
                  onClick={() => navigate("/admin/events/create")}
                  className="h-11 px-6 rounded-2xl bg-gradient-to-r from-[#6A38C2] to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white font-black text-xs sm:text-sm shadow-lg shadow-purple-600/30 flex items-center gap-2"
                >
                  <Plus size={16} />
                  <span>Create Your First Event</span>
                </Button>
              </div>
            </div>
          )}

          {/* 4. Filter Empty State (Events exist, but none match filters) */}
          {!loading && !error && allAdminEvents.length > 0 && filteredEvents.length === 0 && (
            <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-purple-100 p-10 text-center max-w-lg mx-auto shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
                <Filter size={22} />
              </div>
              <h3 className="text-lg font-black text-gray-950">
                No Matching Events Found
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                No events match your current search keywords or selected filter criteria.
              </p>
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="mt-4 rounded-xl border-purple-200 text-[#6A38C2] font-bold text-xs"
              >
                Reset All Filters
              </Button>
            </div>
          )}

          {/* 5. Events Results (Cards or Table) */}
          {!loading && !error && filteredEvents.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4 px-1">
                <span className="text-xs font-bold text-gray-500">
                  Showing{" "}
                  <span className="text-gray-950 font-black">
                    {filteredEvents.length}
                  </span>{" "}
                  {filteredEvents.length === 1 ? "Event" : "Events"}
                </span>
              </div>

              {viewMode === "cards" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((event) => (
                    <AdminEventCard
                      key={event._id}
                      event={event}
                      onDelete={handleDeleteClick}
                      onTogglePublish={handleTogglePublish}
                      openPopoverId={openPopoverId}
                      setOpenPopoverId={setOpenPopoverId}
                    />
                  ))}
                </div>
              ) : (
                <AdminEventsTable
                  events={filteredEvents}
                  onDelete={handleDeleteClick}
                  onTogglePublish={handleTogglePublish}
                  openPopoverId={openPopoverId}
                  setOpenPopoverId={setOpenPopoverId}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Tech Event"
        itemName={eventToDelete?.title || "this event"}
        itemType="event"
        warningMessage="Deleting this event will permanently remove it from the public student portal and archive all attendee registrations. This action cannot be undone."
        onConfirm={handleConfirmDelete}
        deleting={deleting}
      />
    </>
  );
};

export default AdminEvents;