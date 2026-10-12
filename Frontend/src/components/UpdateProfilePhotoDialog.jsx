import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import {
  Camera,
  Upload,
  Trash2,
  Loader2,
  X,
  Check,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { setUser } from "@/redux/authSlice";
import { USER_API_ENDPOINT } from "@/utils/constant";

const DEFAULT_AVATAR = "https://avatar.iran.liara.run/public";
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const UpdateProfilePhotoDialog = ({ open, setOpen }) => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  const currentPhoto = user?.profile?.profilePhoto || "";

  // Mode: "menu" | "camera" | "preview" | "remove-confirm"
  const [mode, setMode] = useState("menu");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [validationError, setValidationError] = useState("");
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);
  const cameraFallbackInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Reset state when dialog opens or closes
  useEffect(() => {
    if (!open) {
      stopCameraStream();
      setMode("menu");
      setSelectedFile(null);
      setValidationError("");
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl("");
      }
    }
  }, [open, stopCameraStream]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [stopCameraStream, previewUrl]);

  const validateAndStageFile = (file) => {
    setValidationError("");
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      const msg = "Invalid file format. Please select a JPEG, PNG, or WebP image.";
      setValidationError(msg);
      toast.error(msg);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      const msg = "Image size exceeds the 5 MB limit. Please choose a smaller image.";
      setValidationError(msg);
      toast.error(msg);
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
    setMode("preview");
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndStageFile(file);
    }
    e.target.value = "";
  };

  const startCamera = async () => {
    setValidationError("");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      // Fallback to native file input with camera capture
      cameraFallbackInputRef.current?.click();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = stream;
      setMode("camera");
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 50);
    } catch (err) {
      console.error("Camera access error:", err);
      toast.error("Unable to access webcam. Opening file picker instead.");
      cameraFallbackInputRef.current?.click();
    }
  };

  const capturePhotoFromVideo = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    const size = Math.min(video.videoWidth || 640, video.videoHeight || 640);
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    const startX = ((video.videoWidth || size) - size) / 2;
    const startY = ((video.videoHeight || size) - size) / 2;
    ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error("Failed to capture photo from camera.");
          return;
        }
        const capturedFile = new File([blob], `camera_photo_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        stopCameraStream();
        validateAndStageFile(capturedFile);
      },
      "image/jpeg",
      0.92
    );
  };

  const handleSavePhoto = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true);
      const res = await axios.post(`${USER_API_ENDPOINT}/profile/photo`, formData, {
        withCredentials: true,
      });

      if (res.data.success) {
        dispatch(setUser(res.data.user));
        toast.success(res.data.message || "Profile picture updated!");
        setOpen(false);
      }
    } catch (error) {
      console.error("Profile photo upload error:", error);
      const errMsg =
        error?.response?.data?.message || "Failed to update profile picture";
      setValidationError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${USER_API_ENDPOINT}/profile/photo`,
        { removePhoto: true },
        { withCredentials: true }
      );

      if (res.data.success) {
        dispatch(setUser(res.data.user));
        toast.success(res.data.message || "Profile photo removed.");
        setOpen(false);
      }
    } catch (error) {
      console.error("Remove profile photo error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to remove profile photo"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPreview = () => {
    stopCameraStream();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
    setSelectedFile(null);
    setValidationError("");
    setMode("menu");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-[440px] rounded-3xl border border-purple-100 shadow-2xl p-0 overflow-hidden bg-white"
        onInteractOutside={() => !loading && setOpen(false)}
      >
        {/* Top Gradient Bar */}
        <div className="h-2 bg-gradient-to-r from-[#6A38C2] via-violet-500 to-orange-500" />

        <div className="p-6">
          <DialogHeader className="text-center sm:text-center">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Profile Picture
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-sm mt-1">
              Supported formats: JPEG, PNG, WebP (Max 5 MB)
            </DialogDescription>
          </DialogHeader>

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            ref={cameraFallbackInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="user"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Validation Error Banner */}
          {validationError && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs font-medium text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{validationError}</span>
            </div>
          )}

          {/* MODE 1: MAIN MENU */}
          {mode === "menu" && (
            <div className="mt-6 flex flex-col items-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-100 shadow-lg bg-purple-50">
                  <img
                    src={currentPhoto || DEFAULT_AVATAR}
                    alt={user?.fullName || "Profile"}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="w-full mt-6 space-y-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border border-purple-100 bg-purple-50/60 hover:bg-purple-100/80 text-gray-800 font-medium transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#6A38C2] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                    <Upload size={18} />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900">
                      Choose from Device
                    </div>
                    <div className="text-xs text-gray-500">
                      Upload a JPEG, PNG, or WebP photo
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border border-purple-100 bg-purple-50/60 hover:bg-purple-100/80 text-gray-800 font-medium transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                    <Camera size={18} />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900">
                      Take a Photo
                    </div>
                    <div className="text-xs text-gray-500">
                      Use your camera to capture a new photo
                    </div>
                  </div>
                </button>

                {currentPhoto && (
                  <button
                    type="button"
                    onClick={() => setMode("remove-confirm")}
                    className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border border-red-100 bg-red-50/50 hover:bg-red-100/70 text-red-600 font-medium transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Trash2 size={18} />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold">Remove Photo</div>
                      <div className="text-xs text-red-400">
                        Reset to the default profile avatar
                      </div>
                    </div>
                  </button>
                )}
              </div>

              <div className="w-full mt-5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="w-full rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* MODE 2: LIVE CAMERA CAPTURE */}
          {mode === "camera" && (
            <div className="mt-5 flex flex-col items-center">
              <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-[#6A38C2] shadow-xl bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Center your face in the circle and click Capture
              </p>

              <div className="flex gap-3 w-full mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelPreview}
                  className="flex-1 rounded-xl border-purple-200 hover:bg-purple-50"
                >
                  <X className="mr-1.5 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={capturePhotoFromVideo}
                  className="flex-1 rounded-xl bg-[#6A38C2] hover:bg-[#5B21B6] text-white"
                >
                  <Camera className="mr-1.5 h-4 w-4" />
                  Capture
                </Button>
              </div>
            </div>
          )}

          {/* MODE 3: IMAGE PREVIEW & SAVE / CANCEL */}
          {mode === "preview" && (
            <div className="mt-5 flex flex-col items-center">
              <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-[#6A38C2] shadow-xl bg-purple-50">
                <img
                  src={previewUrl}
                  alt="New profile preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="mt-3 text-center">
                <p className="text-sm font-medium text-gray-800 truncate max-w-[260px]">
                  {selectedFile?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedFile
                    ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                    : ""}
                </p>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#6A38C2] hover:underline cursor-pointer"
              >
                <RefreshCw size={13} />
                Choose a different image
              </button>

              <div className="flex gap-3 w-full mt-6">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={handleCancelPreview}
                  className="flex-1 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  <X className="mr-1.5 h-4 w-4" />
                  Cancel
                </Button>

                <Button
                  type="button"
                  disabled={loading}
                  onClick={handleSavePhoto}
                  className="flex-1 rounded-xl bg-[#6A38C2] hover:bg-[#5B21B6] text-white shadow-md"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="mr-1.5 h-4 w-4" />
                      Save Photo
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* MODE 4: REMOVE CONFIRMATION */}
          {mode === "remove-confirm" && (
            <div className="mt-5 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center text-red-500 mb-3">
                <Trash2 size={36} />
              </div>
              <h3 className="text-base font-semibold text-gray-900">
                Remove Current Photo?
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                Your profile picture will be reset to the default avatar across HireNest.
              </p>

              <div className="flex gap-3 w-full mt-6">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={() => setMode("menu")}
                  className="flex-1 rounded-xl border-gray-200"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={loading}
                  onClick={handleRemovePhoto}
                  className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    "Remove"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateProfilePhotoDialog;
