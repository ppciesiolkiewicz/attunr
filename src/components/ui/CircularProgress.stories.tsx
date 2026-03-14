import type { Meta, StoryObj } from "@storybook/react";
import { CircularProgress } from "./CircularProgress";

const meta: Meta<typeof CircularProgress> = {
  title: "UI/CircularProgress",
  component: CircularProgress,
  argTypes: {
    progress: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
    size: { control: { type: "number", min: 32, max: 200 } },
    strokeWidth: { control: { type: "number", min: 1, max: 12 } },
    showLabel: { control: "boolean" },
    complete: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="bg-black/90 p-8 rounded-xl inline-block">
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof CircularProgress>;

export const Default: Story = {
  args: { progress: 0.45 },
};

export const Empty: Story = {
  args: { progress: 0 },
};

export const HalfFull: Story = {
  args: { progress: 0.5 },
};

export const AlmostDone: Story = {
  args: { progress: 0.92 },
};

export const Complete: Story = {
  args: { progress: 1, complete: true },
};

export const Small: Story = {
  args: { progress: 0.6, size: 40, strokeWidth: 3 },
};

export const Large: Story = {
  args: { progress: 0.75, size: 120, strokeWidth: 6 },
};

export const NoLabel: Story = {
  args: { progress: 0.65, showLabel: false },
};

export const Translucent: Story = {
  args: { progress: 0.55, className: "opacity-40" },
};
