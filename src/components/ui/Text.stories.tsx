import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Text } from "./Text";

const meta: Meta<typeof Text> = {
  title: "UI/Text",
  component: Text,
  argTypes: {
    variant: {
      control: "select",
      options: ["heading-lg", "heading", "heading-sm", "body", "body-sm", "caption", "label"],
    },
    as: {
      control: "select",
      options: ["h1", "h2", "h3", "h4", "p", "span", "label"],
    },
    children: { control: "text" },
  },
  args: {
    children: "The quick brown fox jumps over the lazy dog",
  },
};

export default meta;
type Story = StoryObj<typeof Text>;

export const HeadingLg: Story = { args: { variant: "heading-lg" } };
export const Heading: Story = { args: { variant: "heading" } };
export const HeadingSm: Story = { args: { variant: "heading-sm" } };
export const Body: Story = { args: { variant: "body" } };
export const BodySm: Story = { args: { variant: "body-sm" } };
export const Caption: Story = { args: { variant: "caption" } };
export const Label: Story = { args: { variant: "label", children: "Section Title" } };

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Text variant="heading-lg">Heading Large</Text>
      <Text variant="heading">Heading</Text>
      <Text variant="heading-sm">Heading Small</Text>
      <Text variant="body">Body text with relaxed leading for comfortable reading.</Text>
      <Text variant="body-sm">Body small for secondary content.</Text>
      <Text variant="caption">Caption for subtle metadata</Text>
      <Text variant="label">Label Text</Text>
    </div>
  ),
};
