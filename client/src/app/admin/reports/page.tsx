"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle2, Clock, ShieldAlert, MessageSquare } from "lucide-react";
import { dataStore, IncidentReport } from "@/lib/dataStore";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<IncidentReport[]>(dataStore.getReports());
  const [selectedReport, setSelectedReport] = useState<IncidentReport | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");

  const reload = () => setReports(dataStore.getReports());

  useEffect(() => {
    const handleUpdate = () => reload();
    window.addEventListener("wheelzy-store-update", handleUpdate);
    return () => window.removeEventListener("wheelzy-store-update", handleUpdate);
  }, []);

  const handleResolve = () => {
    if (!selectedReport) return;
    dataStore.resolveReport(selectedReport.id, resolutionNote || "Resolved after admin review.");
    toast.success(`Complaint #${selectedReport.id} marked as resolved.`);
    setSelectedReport(null);
    setResolutionNote("");
    reload();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Reports & Complaints</h1>
          <p className="text-xs text-gray-500 mt-1">
            Resolve student incident reports, vehicle damage claims, and late return disputes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            Open Tickets: {reports.filter((r) => r.status !== "resolved").length}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <div
            key={report.id}
            className="p-5 sm:p-6 rounded-3xl bg-white border border-gray-100 hover:border-emerald-200 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
          >
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  report.status === "open"
                    ? "bg-rose-100 text-rose-800"
                    : report.status === "in_investigation"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}>
                  {report.status.replace("_", " ").toUpperCase()}
                </span>
                <span className="text-xs font-bold text-gray-900">{report.category}</span>
                <span className="text-xs text-gray-400">· {report.createdAt}</span>
              </div>

              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{report.description}</p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 pt-1">
                <span>Reporter: <strong className="text-gray-900">{report.reporterName}</strong> ({report.reporterRole})</span>
                <span>•</span>
                <span>Target Entity: <strong className="text-gray-900">{report.targetId}</strong></span>
              </div>

              {report.resolutionNotes && (
                <div className="mt-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800">
                  <strong>Resolution:</strong> {report.resolutionNotes}
                </div>
              )}
            </div>

            {report.status !== "resolved" ? (
              <button
                onClick={() => setSelectedReport(report)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-sm transition-all shrink-0 cursor-pointer"
              >
                Resolve Incident
              </button>
            ) : (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 self-start md:self-center">
                Resolved ✓
              </span>
            )}
          </div>
        ))}
      </div>

      {selectedReport && (
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-md rounded-3xl bg-white p-6">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900">
                Resolve Incident #{selectedReport.id}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                {selectedReport.category} · {selectedReport.reporterName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 my-3">
              <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                {selectedReport.description}
              </p>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Resolution Summary
                </label>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Record campus mediation details or corrective actions taken..."
                  rows={3}
                  className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <button
                onClick={() => setSelectedReport(null)}
                className="py-2 px-3 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                className="py-2 px-4 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800"
              >
                Confirm Resolution
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
