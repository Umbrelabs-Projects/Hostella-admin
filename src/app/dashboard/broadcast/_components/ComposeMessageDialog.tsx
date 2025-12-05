// src/app/dashboard/broadcast/_components/ComposeMessageDialog.tsx

"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBroadcastStore } from "@/stores/useBroadcastStore";
import { broadcastMessageSchema, BroadcastMessageFormData } from "../_validations/broadcastSchema";
import { useBroadcastApi } from "../_hooks/useBroadcastApi";
import { Loader2 } from "lucide-react";

interface ComposeMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ComposeMessageDialog({ isOpen, onClose }: ComposeMessageDialogProps) {
  const { composer, resetComposer, loading } = useBroadcastStore();
  const { sendMessage, scheduleMessage } = useBroadcastApi();

  const form = useForm<BroadcastMessageFormData>({
    resolver: zodResolver(broadcastMessageSchema),
    defaultValues: {
      title: composer.title,
      content: composer.content,
      recipientType: composer.recipientType,
      priority: composer.priority,
      scheduledFor: composer.scheduledFor || "",
      selectedRecipients: composer.selectedRecipients || [],
    },
  });

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = form;
  const watchedData = watch();
  const recipientType = watch("recipientType");
  const content = watch("content");

  const handleDialogClose = () => {
    reset();
    resetComposer();
    onClose();
  };

  const onSubmit: SubmitHandler<BroadcastMessageFormData> = async (data) => {
    try {
      const payload = {
        title: data.title,
        content: data.content,
        recipientType: data.recipientType,
        selectedRecipients: data.selectedRecipients,
        priority: data.priority,
      };

      if (data.scheduledFor) {
        await scheduleMessage({
          ...payload,
          scheduledFor: data.scheduledFor,
        });
      } else {
        await sendMessage(payload);
      }

      handleDialogClose();
    } catch {
      // Error handled by hook
    }
  };

  const charCount = content?.length || 0;
  const charLimit = 5000;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDialogClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compose Broadcast Message</DialogTitle>
        </DialogHeader>

        <form onSubmit={(e) => { void handleSubmit(onSubmit)(e); }} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Message Title</Label>
            <Input
              id="title"
              placeholder="e.g., Maintenance Schedule Update"
              {...register("title")}
              disabled={loading}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Message Content</Label>
              <span className={`text-xs ${charCount > 4500 ? "text-red-500" : "text-gray-500"}`}>
                {charCount} / {charLimit}
              </span>
            </div>
            <textarea
              id="content"
              placeholder="Write your message here..."
              className="min-h-[200px] w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
              {...register("content")}
              disabled={loading}
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content.message}</p>
            )}
          </div>

          {/* Recipient Type */}
          <div className="space-y-2">
            <Label htmlFor="recipientType">Send To</Label>
            <Select
              value={recipientType}
              onValueChange={(value) => {
                setValue("recipientType", value as "all-residents" | "all-members" | "specific-members");
              }}
              disabled={loading}
            >
              <SelectTrigger id="recipientType">
                <SelectValue placeholder="Select recipients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-residents">All Residents</SelectItem>
                <SelectItem value="all-members">All Members</SelectItem>
                <SelectItem value="specific-members">Specific Members</SelectItem>
              </SelectContent>
            </Select>
            {errors.recipientType && (
              <p className="text-sm text-red-500">{errors.recipientType.message}</p>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority Level</Label>
            <Select
              value={watchedData.priority}
              onValueChange={(value) => {
                setValue("priority", value as "low" | "medium" | "high" | "urgent");
              }}
              disabled={loading}
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - General Information</SelectItem>
                <SelectItem value="medium">Medium - Important Update</SelectItem>
                <SelectItem value="high">High - Urgent Notice</SelectItem>
                <SelectItem value="urgent">Urgent - Immediate Action Needed</SelectItem>
              </SelectContent>
            </Select>
            {errors.priority && (
              <p className="text-sm text-red-500">{errors.priority.message}</p>
            )}
          </div>

          {/* Scheduled Date/Time */}
          <div className="space-y-2">
            <Label htmlFor="scheduledFor">Schedule Send (Optional)</Label>
            <Input
              id="scheduledFor"
              type="datetime-local"
              {...register("scheduledFor")}
              disabled={loading}
            />
            {errors.scheduledFor && (
              <p className="text-sm text-red-500">{errors.scheduledFor.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Leave empty to send immediately, or choose a future date and time
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleDialogClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
