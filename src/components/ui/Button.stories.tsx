import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  argTypes: {
    variant: {
      control: "select",
      options: ["solid", "outline", "ghost", "icon"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "compact"],
    },
    color: {
      control: "select",
      options: ["primary", "secondary", "muted", "accent", "subtle"],
    },
    disabled: { control: "boolean" },
    children: { control: "text" },
  },
  args: {
    children: "Button",
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { children: "Continue" },
};

export const Secondary: Story = {
  args: { color: "secondary", children: "Begin Exercise" },
};

export const Outline: Story = {
  args: { variant: "outline", children: "Play tone" },
};

export const Ghost: Story = {
  args: { variant: "ghost", children: "Re-detect my range" },
};

export const Icon: Story = {
  args: {
    variant: "icon",
    color: "subtle",
    children: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
    "aria-label": "Settings",
  },
};

export const Small: Story = {
  args: { size: "sm", children: "Prev" },
};

export const Large: Story = {
  args: { size: "lg", children: "Enable microphone", className: "px-8" },
};

export const Disabled: Story = {
  args: { children: "Continue", disabled: true },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button>Solid Primary</Button>
      <Button color="secondary">Solid Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="ghost" color="muted">Ghost Muted</Button>
      <Button variant="ghost" color="accent">Ghost Accent</Button>
      <Button variant="icon" color="subtle" aria-label="Icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      </Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg" className="px-8">Large</Button>
      <Button variant="ghost" size="compact" color="muted">Compact</Button>
    </div>
  ),
};
