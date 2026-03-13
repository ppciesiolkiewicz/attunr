import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { CloseButton } from "./CloseButton";
import { Text } from "./Text";
import { fn } from "storybook/test";

const meta: Meta<typeof Modal> = {
  title: "UI/Modal",
  component: Modal,
  args: {
    onBackdropClick: fn(),
  },
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  args: {
    children: (
      <>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <Text variant="heading-sm">Modal Title</Text>
          <CloseButton onClick={() => {}} />
        </div>
        <div className="px-5 py-5">
          <Text variant="body-sm">This is the modal content area. It can contain any content.</Text>
        </div>
        <div className="px-5 py-4 border-t border-white/[0.06] flex justify-end">
          <Button>Got it</Button>
        </div>
      </>
    ),
  },
};
