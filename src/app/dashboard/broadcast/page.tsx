// src/app/dashboard/broadcast/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { useBroadcastStore } from "@/stores/useBroadcastStore";
import { useBroadcastApi } from "./_hooks/useBroadcastApi";
import BroadcastHeader from "./_components/BroadcastHeader";
import BroadcastFilters from "./_components/BroadcastFilters";
import BroadcastList from "./_components/BroadcastList";
import ComposeMessageDialog from "./_components/ComposeMessageDialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function BroadcastPage() {
  const {
    messages,
    isComposeDialogOpen,
    openComposeDialog,
    closeComposeDialog,
    loading,
    error,
    searchQuery,
    statusFilter,
    priorityFilter,
    currentPage,
    pageSize,
    totalMessages,
    setCurrentPage,
  } = useBroadcastStore();

  const { fetchMessages, deleteMessage, resendMessage } = useBroadcastApi();
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch messages on component mount and when filters change
  useEffect(() => {
    const loadMessages = async () => {
      await fetchMessages(currentPage, pageSize, searchQuery, statusFilter, priorityFilter);
      setIsInitialized(true);
    };

    loadMessages();
  }, [currentPage, pageSize, searchQuery, statusFilter, priorityFilter, fetchMessages]);

  const handleFilterChange = useCallback(() => {
    setCurrentPage(1);
  }, [setCurrentPage]);

  const handleDeleteMessage = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this message?");
    if (confirmed) {
      await deleteMessage(id);
      // Refresh the list
      await fetchMessages(currentPage, pageSize, searchQuery, statusFilter, priorityFilter);
    }
  };

  const handleResendMessage = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to resend this message?");
    if (confirmed) {
      await resendMessage(id);
    }
  };

  const totalPages = Math.ceil(totalMessages / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <BroadcastHeader onComposeClick={openComposeDialog} />

      {/* Error Alert */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Filters */}
      <BroadcastFilters onFilterChange={handleFilterChange} />

      {/* List */}
      <BroadcastList
        messages={messages}
        loading={loading && !isInitialized}
        onDelete={handleDeleteMessage}
        onResend={handleResendMessage}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalMessages)} of{" "}
            {totalMessages} messages
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Compose Dialog */}
      <ComposeMessageDialog isOpen={isComposeDialogOpen} onClose={closeComposeDialog} />
    </div>
  );
}
