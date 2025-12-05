// src/app/dashboard/broadcast/_validations/broadcastSchema.ts

import { z } from "zod";

export const broadcastMessageSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .min(5, "Title must be at least 5 characters")
      .max(100, "Title must be less than 100 characters"),

    content: z
      .string()
      .min(1, "Message content is required")
      .min(10, "Content must be at least 10 characters")
      .max(5000, "Content must be less than 5000 characters"),

    recipientType: z.enum(["all-residents", "all-members", "specific-members"]),

    selectedRecipients: z.array(z.string()),

    priority: z.enum(["low", "medium", "high", "urgent"]),

    scheduledFor: z.string(),
  })
  .superRefine((data, ctx) => {
    // Validate selectedRecipients if specific-members is selected
    if (data.recipientType === "specific-members" && data.selectedRecipients.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["selectedRecipients"],
        message: "Please select at least one recipient for targeted messaging",
      });
    }

    // Validate scheduledFor if provided
    if (data.scheduledFor) {
      const scheduledDate = new Date(data.scheduledFor);
      if (isNaN(scheduledDate.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["scheduledFor"],
          message: "Invalid date format",
        });
      } else if (scheduledDate <= new Date()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["scheduledFor"],
          message: "Scheduled time must be in the future",
        });
      }
    }
  });

export type BroadcastMessageFormData = z.infer<typeof broadcastMessageSchema>;

// Schema for quick send (without scheduling)
export const quickBroadcastSchema = broadcastMessageSchema.omit({ scheduledFor: true });

export type QuickBroadcastFormData = z.infer<typeof quickBroadcastSchema>;
