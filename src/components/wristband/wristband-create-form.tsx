"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MagicCard } from "~/components/ui/magic-card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { useCreateWristband } from "~/lib/api/hooks/qr-code";
import { toast } from "sonner";
import { Loader2, Plus, QrCode } from "lucide-react";

const wristbandSchema = z.object({
  eventId: z.string().min(1, "Please select an event"),
  name: z.string().min(1, "Wristband name is required"),
  description: z.string().optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  maxScans: z.number().int().positive().optional(),
});

type WristbandFormData = z.infer<typeof wristbandSchema>;

interface WristbandCreateFormProps {
  organizerId: string;
  events: Array<{
    id: string;
    title: string;
    startDate: string;
    endDate: string;
  }>;
  isEventsLoading?: boolean;
  onSuccess?: (wristband: any) => void;
  onCancel?: () => void;
}

export function WristbandCreateForm({
  organizerId,
  events,
  isEventsLoading = false,
  onSuccess,
  onCancel,
}: WristbandCreateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createWristband } = useCreateWristband();

  const form = useForm<WristbandFormData>({
    resolver: zodResolver(wristbandSchema),
    defaultValues: {
      eventId: "",
      name: "",
      description: "",
      validFrom: "",
      validUntil: "",
    },
  });

  const onSubmit = async (data: WristbandFormData) => {
    setIsSubmitting(true);
    try {
      const wristbandData = {
        ...data,
        validFrom: data.validFrom || undefined,
        validUntil: data.validUntil || undefined,
        maxScans: data.maxScans || undefined,
      };

      const result = await createWristband(organizerId, wristbandData);

      toast.success("Wristband has been created successfully. You can now generate its QR code.");

      form.reset();
      onSuccess?.(result.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create wristband");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <QrCode className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Create New Wristband</h3>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Event Selection */}
            <FormField
              control={form.control}
              name="eventId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isEventsLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isEventsLoading ? "Loading events..." : "Select an event"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isEventsLoading ? (
                        <SelectItem value="" disabled>
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading events...
                          </div>
                        </SelectItem>
                      ) : events.length > 0 ? (
                        events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.title}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          No events available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the event this wristband will be used for
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Wristband Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wristband Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., VIP Access, Staff Pass, General Admission" {...field} />
                  </FormControl>
                  <FormDescription>
                    A descriptive name for this wristband type
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional details about this wristband..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description for internal reference
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Validity Period */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="validFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid From (Optional)</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormDescription>
                      When this wristband becomes valid
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="validUntil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid Until (Optional)</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormDescription>
                      When this wristband expires
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Max Scans */}
            <FormField
              control={form.control}
              name="maxScans"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Scans (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Leave empty for unlimited scans"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormDescription>
                    Limit the number of times this wristband can be scanned
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Wristband
                  </>
                )}
              </Button>
              
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </MagicCard>
  );
}
