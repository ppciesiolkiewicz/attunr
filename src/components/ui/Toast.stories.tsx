import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Toast } from "./Toast";

const meta: Meta<typeof Toast> = {
  title: "UI/Toast",
  component: Toast,
  argTypes: {
    variant: { control: "select", options: ["info", "success", "warning"] },
    title: { control: "text" },
    message: { control: "text" },
  },
  args: {
    id: "1",
    onDismiss: () => {},
  },
  decorators: [
    (Story) => (
      <div className="p-8">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const Info: Story = {
  args: { variant: "info", title: "Stay on track with reminders", message: "We only send practice reminders — nothing else." },
};

export const Success: Story = {
  args: { variant: "success", title: "Reminders enabled", message: "You'll get daily practice reminders." },
};

export const Warning: Story = {
  args: { variant: "warning", title: "Notifications blocked", message: "Enable notifications in your browser settings to get reminders." },
};

export const WithCTA: Story = {
  args: {
    variant: "info",
    title: "Stay on track with reminders",
    message: "We only send practice reminders — nothing else.",
    cta: { label: "Enable reminders", onClick: () => alert("Enabled!") },
  },
};

export const TitleOnly: Story = {
  args: { variant: "success", title: "Settings saved" },
};
