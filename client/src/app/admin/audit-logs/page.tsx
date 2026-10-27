"use client";

import React, { useState } from "react";
import { ScrollText, Search, ShieldCheck, Terminal, Filter } from "lucide-react";
import { dataStore, AuditLogItem } from "@/lib/dataStore";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export default function AdminAuditLogsPage() {
  const [logs] = useState<AuditLogItem[]>(dataStore.getAuditLogs());
  const [search, setSearch] = useState("");

  const filtered = logs.filter(
    (l) =>
      l.actorName.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.target.toLowerCase().includes(search.toLowerCase()) ||
      l.ipAddress.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Security & Audit Logs</h1>
          <p className="text-xs text-gray-500 mt-1">
            Tamper-evident system activity ledger for compliance, unlock events, and return audits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            Immutable Records: {logs.length}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search audit actions, IP, student, or target..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/70">
              <TableRow>
                <TableHead className="text-xs font-bold text-gray-700">Timestamp (UTC)</TableHead>
                <TableHead className="text-xs font-bold text-gray-700">Actor</TableHead>
                <TableHead className="text-xs font-bold text-gray-700">Role</TableHead>
                <TableHead className="text-xs font-bold text-gray-700">Security Action</TableHead>
                <TableHead className="text-xs font-bold text-gray-700">Target Entity / Key</TableHead>
                <TableHead className="text-xs font-bold text-gray-700">Network Node / IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((log) => (
                <TableRow key={log.id} className="hover:bg-emerald-50/20 font-mono text-xs">
                  <TableCell className="text-gray-500 whitespace-nowrap">{log.timestamp}</TableCell>
                  <TableCell className="font-sans font-bold text-gray-900">{log.actorName}</TableCell>
                  <TableCell>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-sans uppercase">
                      {log.actorRole}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold text-emerald-800">{log.action}</TableCell>
                  <TableCell className="text-gray-700 truncate max-w-xs">{log.target}</TableCell>
                  <TableCell className="text-gray-500">{log.ipAddress}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
