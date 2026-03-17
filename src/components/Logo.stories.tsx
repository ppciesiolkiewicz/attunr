import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Logo from "./Logo";

const meta: Meta<typeof Logo> = {
  title: "Components/Logo",
  component: Logo,
  argTypes: {
    layout: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
    },
    animate: {
      control: "select",
      options: [undefined, 1, 2, 3, 4],
    },
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
  decorators: [
    (Story) => (
      <div className="bg-zinc-950 p-8 rounded-lg">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Logo>;

export const Default: Story = {};

export const Horizontal: Story = {
  args: { layout: "horizontal" },
};

export const Vertical: Story = {
  args: { layout: "vertical" },
};

export const Bounce: Story = {
  args: { animate: 1 },
};

export const SineWave: Story = {
  args: { animate: 2 },
};

export const Combined: Story = {
  args: { animate: 3 },
};

export const UnifiedWave: Story = {
  args: { animate: 4 },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <span className="text-zinc-500 text-xs uppercase tracking-wider">Sizes — Horizontal</span>
        <div className="flex flex-wrap items-center gap-8">
          <Logo size="sm" />
          <Logo size="default" />
          <Logo size="lg" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-zinc-500 text-xs uppercase tracking-wider">Sizes — Vertical</span>
        <div className="flex flex-wrap items-end gap-8">
          <Logo layout="vertical" size="sm" />
          <Logo layout="vertical" size="default" />
          <Logo layout="vertical" size="lg" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-zinc-500 text-xs uppercase tracking-wider">Animations — Horizontal</span>
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex flex-col items-center gap-1">
            <Logo animate={1} />
            <span className="text-zinc-600 text-xs">bounce</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Logo animate={2} />
            <span className="text-zinc-600 text-xs">sine wave</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Logo animate={3} />
            <span className="text-zinc-600 text-xs">combined</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Logo animate={4} />
            <span className="text-zinc-600 text-xs">unified wave</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-zinc-500 text-xs uppercase tracking-wider">Animations — Vertical (lg)</span>
        <div className="flex flex-wrap items-end gap-12">
          <div className="flex flex-col items-center gap-1">
            <Logo layout="vertical" size="lg" animate={1} />
            <span className="text-zinc-600 text-xs">bounce</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Logo layout="vertical" size="lg" animate={2} />
            <span className="text-zinc-600 text-xs">sine wave</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Logo layout="vertical" size="lg" animate={3} />
            <span className="text-zinc-600 text-xs">combined</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Logo layout="vertical" size="lg" animate={4} />
            <span className="text-zinc-600 text-xs">unified wave</span>
          </div>
        </div>
      </div>
    </div>
  ),
};
