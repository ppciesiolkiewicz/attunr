"use client";

import { useState } from "react";
import { Modal, SelectableCard, Button, Text } from "@/components/ui";
import { FREQUENCY_OPTIONS, type PracticeFrequency } from "@/constants/notifications";
import { requestNotificationPermission } from "@/lib/notifications";
import { useToast } from "@/context/ToastContext";
import { analytics } from "@/lib/analytics";

interface FrequencyModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (frequency: PracticeFrequency) => void;
}

export default function FrequencyModal({ open, onClose, onSave }: FrequencyModalProps) {
  const [selected, setSelected] = useState<PracticeFrequency>("daily");
  const [requesting, setRequesting] = useState(false);
  const { toast } = useToast();

  if (!open) return null;

  async function handleSave() {
    setRequesting(true);
    const result = await requestNotificationPermission();
    analytics.notificationPermissionResult(result);

    if (result === "granted") {
      analytics.notificationFrequencySelected(selected);
      onSave(selected);
      toast({
        variant: "success",
        title: "Reminders enabled",
        message: `You'll get ${FREQUENCY_OPTIONS.find((o) => o.id === selected)?.label.toLowerCase()} practice reminders.`,
      });
      onClose();
    } else {
      toast({
        variant: "warning",
        title: "Notifications blocked",
        message: "Enable notifications in your browser settings to get practice reminders.",
      });
      onClose();
    }
    setRequesting(false);
  }

  return (
    <Modal onBackdropClick={onClose}>
      <div className="px-6 pt-6 pb-2">
        <Text variant="heading-sm">How often would you like to practice?</Text>
        <Text variant="caption" color="text-2" className="mt-1.5">
          We'll only send gentle reminders — nothing else.
        </Text>
      </div>

      <div className="flex flex-col gap-1.5 px-6 py-4">
        {FREQUENCY_OPTIONS.map((opt) => (
          <SelectableCard
            key={opt.id}
            selected={selected === opt.id}
            onClick={() => setSelected(opt.id)}
          >
            <div>
              <Text variant="body-sm" color="text-1" className="font-medium">{opt.label}</Text>
              <Text variant="caption" color="text-2" className="mt-0.5">{opt.description}</Text>
            </div>
            {selected === opt.id && (
              <Text as="span" variant="body-sm" color="text-2" className="ml-2">✓</Text>
            )}
          </SelectableCard>
        ))}
      </div>

      <div className="px-6 pb-6 pt-2 flex gap-3">
        <Button variant="ghost" onClick={onClose} className="flex-1">
          Not now
        </Button>
        <Button onClick={handleSave} disabled={requesting} className="flex-1">
          {requesting ? "Requesting…" : "Enable reminders"}
        </Button>
      </div>
    </Modal>
  );
}
