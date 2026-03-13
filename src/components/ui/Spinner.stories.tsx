import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Spinner } from "./Spinner";

const meta: Meta<typeof Spinner> = {
  title: "UI/Spinner",
  component: Spinner,
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {};

export const InContext: Story = {
  render: () => (
    <div className="flex items-center gap-2 text-white/70">
      <Spinner />
      <span className="text-sm">Detecting pitch...</span>
    </div>
  ),
};
