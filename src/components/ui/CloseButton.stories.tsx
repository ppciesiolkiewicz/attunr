import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CloseButton } from "./CloseButton";
import { fn } from "storybook/test";

const meta: Meta<typeof CloseButton> = {
  title: "UI/CloseButton",
  component: CloseButton,
  args: {
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof CloseButton>;

export const Default: Story = {};

export const WithBackground: Story = {
  decorators: [
    (Story) => (
      <div
        className="inline-flex items-center justify-between gap-8 px-5 py-4 rounded-xl"
        style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <span className="text-white/95 font-semibold">Modal Header</span>
        <Story />
      </div>
    ),
  ],
};
