import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Button } from "../ui/button";
import {
  CalendarDays,
  MapPin,
  Laptop,
  Users,
  MoreVertical,
  ExternalLink,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  AlertCircle,
  Share2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

/**
 * AdminEventsTable
 * Compact tabular representation of recruiter's events.
 */
const AdminEventsTable = ({
  events = [],
  onDelete,
  onTogglePublish,
  openPopoverId,
  setOpenPopoverId,
}) => {
  const navigate = useNavigate();

  const handleShare = (event, e) => {
    e.stopPropagation();
    const eventUrl = `${window.location.origin}/events/${event?._id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(eventUrl);
      toast.success("Event link copied to clipboard!");
    }
  };

  const fallbackBanner =
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&q=80";

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-purple-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader className="bg-purple-50/50 border-b border-purple-100">
            <TableRow>
              <TableHead className="py-4 pl-6 text-xs font-black text-gray-700 uppercase tracking-wider">
                Event
              </TableHead>
              <TableHead className="py-4 text-xs font-black text-gray-700 uppercase tracking-wider">
                Category & Format
              </TableHead>
              <TableHead className="py-4 text-xs font-black text-gray-700 uppercase tracking-wider">
                Schedule
              </TableHead>
              <TableHead className="py-4 text-xs font-black text-gray-700 uppercase tracking-wider">
                RSVPs / Capacity
              </TableHead>
              <TableHead className="py-4 text-xs font-black text-gray-700 uppercase tracking-wider">
                Pricing
              </TableHead>
              <TableHead className="py-4 text-xs font-black text-gray-700 uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="py-4 pr-6 text-right text-xs font-black text-gray-700 uppercase tracking-wider">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-purple-50">
            {events.map((event) => {
              const isDraft = event?.status === "Draft";
              const isCancelled = event?.status === "Cancelled";
              const isPublished = event?.status === "Published" || !event?.status;
              const isCompleted = event?.status === "Completed";
              const attendeesCount = event?.attendees?.length || 0;
              const totalCapacity = event?.isUnlimitedCapacity
                ? "Unlimited"
                : event?.totalSeats || 100;
              const isFree = !event?.price || Number(event.price) === 0;

              const formattedDate = event?.eventDate
                ? new Date(event.eventDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "TBA";

              return (
                <TableRow
                  key={event._id}
                  className="hover:bg-purple-50/40 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/events/${event._id}`)}
                >
                  {/* Event Thumbnail & Title */}
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gray-900 border border-purple-100 shrink-0 shadow-xs">
                        <img
                          src={event?.banner || fallbackBanner}
                          alt={event?.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="min-w-0 max-w-xs sm:max-w-sm">
                        <h3 className="font-bold text-sm text-gray-950 group-hover:text-[#6A38C2] transition-colors truncate">
                          {event?.title}
                        </h3>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          Hosted by {event?.organizer || "Verified Recruiter"}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Category & Format */}
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[11px] font-bold">
                        <Sparkles size={10} className="text-amber-500" />
                        <span>{event?.category || "Workshop"}</span>
                      </span>
                      <span className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
                        {event?.mode === "Online" ? (
                          <Laptop size={12} className="text-cyan-500" />
                        ) : event?.mode === "Hybrid" ? (
                          <Layers size={12} className="text-purple-500" />
                        ) : (
                          <MapPin size={12} className="text-emerald-500" />
                        )}
                        <span>{event?.mode || "Online"}</span>
                      </span>
                    </div>
                  </TableCell>

                  {/* Schedule */}
                  <TableCell className="py-4">
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">
                        {formattedDate}
                      </span>
                      <span className="text-[11px] text-gray-400 block mt-0.5">
                        {event?.startTime || "10:00"} {event?.timezone ? `(${event.timezone.split(" ")[0]})` : ""}
                      </span>
                    </div>
                  </TableCell>

                  {/* RSVPs / Capacity */}
                  <TableCell className="py-4">
                    <div className="flex items-center gap-1.5">
                      <Users size={13} className="text-[#6A38C2]" />
                      <span className="text-xs font-black text-gray-900">
                        {attendeesCount}
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium">
                        / {totalCapacity}
                      </span>
                    </div>
                  </TableCell>

                  {/* Pricing */}
                  <TableCell className="py-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                        isFree
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {isFree ? "FREE" : `₹${event.price}`}
                    </span>
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell className="py-4">
                    {isPublished && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Published</span>
                      </span>
                    )}
                    {isDraft && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                        <Clock size={11} />
                        <span>Draft</span>
                      </span>
                    )}
                    {isCancelled && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                        <AlertCircle size={11} />
                        <span>Cancelled</span>
                      </span>
                    )}
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                        <CheckCircle2 size={11} />
                        <span>Completed</span>
                      </span>
                    )}
                  </TableCell>

                  {/* Action Menu Popover */}
                  <TableCell className="py-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                    <Popover
                      open={openPopoverId === event?._id}
                      onOpenChange={(open) => setOpenPopoverId(open ? event?._id : null)}
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="w-8 h-8 rounded-full hover:bg-purple-100/60 text-gray-500 hover:text-gray-900 transition-colors inline-flex items-center justify-center cursor-pointer"
                          aria-label="Event actions"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </PopoverTrigger>

                      <PopoverContent
                        align="end"
                        className="w-48 p-1.5 rounded-2xl bg-white border border-purple-100 shadow-[0_12px_36px_-6px_rgba(106,56,194,0.18)] z-50 text-xs"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setOpenPopoverId(null);
                            navigate(`/events/${event?._id}`);
                          }}
                          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-gray-700 hover:bg-purple-50 hover:text-[#6A38C2] font-semibold transition-colors cursor-pointer"
                        >
                          <Eye size={14} className="text-[#6A38C2]" />
                          <span>View Details</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setOpenPopoverId(null);
                            navigate(`/admin/events/${event?._id}/edit`);
                          }}
                          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-gray-700 hover:bg-purple-50 hover:text-[#6A38C2] font-semibold transition-colors cursor-pointer"
                        >
                          <Edit size={14} className="text-[#6A38C2]" />
                          <span>Edit Event</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            setOpenPopoverId(null);
                            handleShare(event, e);
                          }}
                          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-gray-700 hover:bg-purple-50 hover:text-[#6A38C2] font-semibold transition-colors cursor-pointer"
                        >
                          <Share2 size={14} className="text-blue-600" />
                          <span>Copy Link</span>
                        </button>

                        <div className="my-1 border-t border-purple-50" />

                        {isPublished ? (
                          <button
                            type="button"
                            onClick={() => {
                              setOpenPopoverId(null);
                              onTogglePublish(event, "Draft");
                            }}
                            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-amber-700 hover:bg-amber-50 font-semibold transition-colors cursor-pointer"
                          >
                            <Clock size={14} />
                            <span>Unpublish</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setOpenPopoverId(null);
                              onTogglePublish(event, "Published");
                            }}
                            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-emerald-700 hover:bg-emerald-50 font-semibold transition-colors cursor-pointer"
                          >
                            <CheckCircle2 size={14} />
                            <span>Publish</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setOpenPopoverId(null);
                            onDelete(event);
                          }}
                          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminEventsTable;
