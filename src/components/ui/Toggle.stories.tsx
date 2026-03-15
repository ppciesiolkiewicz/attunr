import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Toggle } from "./Toggle";
import { Text } from "./Text";

const meta: Meta<typeof Toggle> = {
  title: "UI/Toggle",
  component: Toggle,
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  render: () => {
    const [on, setOn] = useState(false);
    return (
      <div className="flex items-center gap-3 p-4">
        <Toggle checked={on} onChange={setOn} />
        <Text variant="body-sm" color="text-2">{on ? "On" : "Off"}</Text>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-3">
        <Toggle checked={false} onChange={() => {}} disabled />
        <Text variant="body-sm" color="muted-1">Disabled off</Text>
      </div>
      <div className="flex items-center gap-3">
        <Toggle checked={true} onChange={() => {}} disabled />
        <Text variant="body-sm" color="muted-1">Disabled on</Text>
      </div>
    </div>
  ),
};
