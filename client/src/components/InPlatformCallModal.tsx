"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  ShieldCheck,
  Zap,
  Radio,
  Clock,
  AlertCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { StoredBooking } from "@/lib/dataStore";

export type CallState = "calling" | "connecting" | "connected" | "ended" | "failed";

interface InPlatformCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: StoredBooking | null;
  callerRole: "owner" | "renter";
}

export function InPlatformCallModal({
  isOpen,
  onClose,
  booking,
  callerRole,
}: InPlatformCallModalProps) {
  const [callState, setCallState] = useState<CallState>("calling");
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Counterparty info based on caller role
  const targetName =
    callerRole === "owner" ? booking?.renterName || "Student Renter" : booking?.ownerName || "Vehicle Host";
  const targetAvatar =
    callerRole === "owner" ? booking?.renterAvatar : booking?.ownerAvatar;
  const targetRoleLabel =
    callerRole === "owner" ? "Verified Student Renter" : "Verified Vehicle Host";
  const targetCampusInfo =
    callerRole === "owner"
      ? booking?.renterCampus || "Campus Quad Member"
      : `${booking?.campusHub || "Campus Hub"} Host`;

  // Start call simulation sequence on open
  useEffect(() => {
    if (!isOpen || !booking) {
      setCallState("calling");
      setCallDuration(0);
      setIsMuted(false);
      setIsSpeakerOn(true);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setCallState("calling");
    setCallDuration(0);

    // Transition from Calling -> Connecting after 1.8s
    const t1 = setTimeout(() => {
      setCallState("connecting");
    }, 1800);

    // Transition from Connecting -> Connected after 3.2s
    const t2 = setTimeout(() => {
      setCallState("connected");
    }, 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, booking]);

  // Handle live connected timer
  useEffect(() => {
    if (callState === "connected") {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  if (!isOpen || !booking) return null;

  const handleEndCall = () => {
    setCallState("ended");
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleRestartCall = () => {
    setCallState("calling");
    setCallDuration(0);
    setTimeout(() => setCallState("connecting"), 1500);
    setTimeout(() => setCallState("connected"), 3000);
  };

  const handleSimulateFailed = () => {
    setCallState("failed");
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Calling Card */}
      <div className="relative z-10 w-full max-w-md bg-gradient-to-b from-[#061814] via-[#041F1A] to-[#021310] text-white rounded-3xl shadow-2xl border border-emerald-500/30 overflow-hidden flex flex-col font-sans">
        
        {/* Top Bar with Booking Info */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10 bg-black/20">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-emerald-300">
              {booking.id}
            </span>
            <span className="text-[10px] text-gray-400">• {booking.vehicleName}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close Call Modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Central Caller Info & Avatar with Pulsing Waves */}
        <div className="p-6 sm:p-8 flex flex-col items-center text-center space-y-4">
          
          {/* Avatar with dynamic calling waves */}
          <div className="relative flex items-center justify-center my-2">
            {callState === "calling" && (
              <>
                <div className="absolute w-32 h-32 rounded-full bg-emerald-500/20 animate-ping" />
                <div className="absolute w-28 h-28 rounded-full bg-emerald-400/25 animate-pulse" />
              </>
            )}
            {callState === "connecting" && (
              <div className="absolute w-28 h-28 rounded-full bg-cyan-500/25 animate-spin" />
            )}
            {callState === "connected" && (
              <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-emerald-500 to-green-400 opacity-75 blur-xs animate-pulse" />
            )}

            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-400/50 shadow-xl bg-emerald-950 flex items-center justify-center">
              {targetAvatar ? (
                <img
                  src={targetAvatar}
                  alt={targetName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-2xl font-black text-emerald-300">
                  {targetName.charAt(0)}
                </div>
              )}
            </div>

            {/* Connected audio badge */}
            {callState === "connected" && (
              <div className="absolute -bottom-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-black uppercase tracking-wider shadow flex items-center gap-1">
                <Radio size={10} className="animate-pulse" />
                <span>Live Audio</span>
              </div>
            )}
          </div>

          {/* Participant Names and Roles */}
          <div className="space-y-1">
            <h3 className="text-xl font-black tracking-tight text-white">
              {targetName}
            </h3>
            <p className="text-xs font-semibold text-emerald-300">
              {targetRoleLabel}
            </p>
            <p className="text-[11px] text-gray-400 max-w-xs truncate">
              {targetCampusInfo}
            </p>
          </div>

          {/* Dynamic Call Status Badge / Timer */}
          <div className="pt-2">
            {callState === "calling" && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-bold animate-pulse">
                <Phone size={12} className="animate-bounce" />
                <span>Calling peer via Wheelzy...</span>
              </div>
            )}

            {callState === "connecting" && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-bold">
                <Radio size={12} className="animate-spin" />
                <span>Establishing encrypted connection...</span>
              </div>
            )}

            {callState === "connected" && (
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-sm font-mono font-bold shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{formatDuration(callDuration)}</span>
                </div>
                {/* Audio visualizer bars (simulated) */}
                <div className="flex items-center justify-center gap-1 h-4">
                  <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_100ms] h-3" />
                  <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_300ms] h-4" />
                  <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_200ms] h-2" />
                  <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_400ms] h-4" />
                  <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_150ms] h-2.5" />
                </div>
              </div>
            )}

            {callState === "ended" && (
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700 text-xs font-bold">
                  <Clock size={12} />
                  <span>Call Ended • Duration {formatDuration(callDuration)}</span>
                </div>
              </div>
            )}

            {callState === "failed" && (
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-950/80 text-red-300 border border-red-800/60 text-xs font-bold">
                  <AlertCircle size={12} />
                  <span>Peer Unavailable</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Unable to establish session. You can retry in a few moments.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Call Controls Bar */}
        <div className="p-6 bg-black/40 border-t border-white/10 space-y-4">
          {callState !== "ended" && callState !== "failed" ? (
            <div className="flex items-center justify-center gap-6">
              {/* Mute Control */}
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  isMuted
                    ? "bg-red-500/20 border-red-500 text-red-300 shadow-lg shadow-red-900/30"
                    : "bg-white/10 border-white/20 text-gray-200 hover:bg-white/20"
                }`}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                <span className="text-[10px] font-bold">
                  {isMuted ? "Muted" : "Mute"}
                </span>
              </button>

              {/* End Call Button */}
              <button
                type="button"
                onClick={handleEndCall}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-xl shadow-red-900/50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="End Call"
                aria-label="End Call"
              >
                <PhoneOff size={26} />
              </button>

              {/* Speaker Control */}
              <button
                type="button"
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  isSpeakerOn
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-900/30"
                    : "bg-white/10 border-white/20 text-gray-400 hover:bg-white/20"
                }`}
                title={isSpeakerOn ? "Speaker On" : "Speaker Off"}
              >
                {isSpeakerOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
                <span className="text-[10px] font-bold">
                  {isSpeakerOn ? "Speaker" : "Earpiece"}
                </span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleRestartCall}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>Call Again</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Return to Ride
              </button>
            </div>
          )}

          {/* Strict Privacy Guarantee Box */}
          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 text-[11px] text-emerald-200/90 flex items-start gap-2">
            <ShieldCheck size={14} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-white">
                Zero-Knowledge Phone Privacy
              </span>
              <span className="text-emerald-200/80 leading-tight">
                Personal mobile numbers are strictly hidden. Calls route through the Wheelzy campus voice relay without exposing phone numbers.
              </span>
            </div>
          </div>

          {/* Dev Simulation Switcher for demo completeness */}
          <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1">
            <span>Client Voice Demo Interface</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSimulateFailed}
                className="hover:text-gray-300 underline"
              >
                Test Offline
              </button>
              <button
                type="button"
                onClick={handleRestartCall}
                className="hover:text-emerald-400 underline"
              >
                Reset Call
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
