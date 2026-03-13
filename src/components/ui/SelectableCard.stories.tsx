import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SelectableCard } from "./SelectableCard";

const meta: Meta<typeof SelectableCard> = {
  title: "UI/SelectableCard",
  component: SelectableCard,
  argTypes: {
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof SelectableCard>;

export const Default: Story = {
  args: {
    selected: false,
    children: (
      <div>
        <p className="text-sm font-medium text-white/95">Option label</p>
        <p className="text-xs mt-0.5 text-white/65">Description text</p>
      </div>
    ),
  },
};

export const Selected: Story = {
  args: {
    selected: true,
    children: (
      <div className="flex items-center justify-between w-full">
        <div>
          <p className="text-sm font-medium text-white/95">A440 Standard</p>
          <p className="text-xs mt-0.5 text-white/65">Most common modern tuning</p>
        </div>
        <span className="text-sm ml-2 text-white/65">{"\u2713"}</span>
      </div>
    ),
  },
};

export const TuningSelector: Story = {
  render: () => {
    const options = [
      { id: "432", label: "A432 Verdi", description: "Warmer, softer tone" },
      { id: "440", label: "A440 Standard", description: "Most common modern tuning" },
      { id: "444", label: "A444 Bright", description: "Slightly brighter resonance" },
    ];
    const [selected, setSelected] = useState("440");
    return (
      <div className="flex flex-col gap-1.5 max-w-xs">
        {options.map((opt) => (
          <SelectableCard
            key={opt.id}
            selected={selected === opt.id}
            onClick={() => setSelected(opt.id)}
          >
            <div>
              <p className="text-sm font-medium text-white/95">{opt.label}</p>
              <p className="text-xs mt-0.5 text-white/65">{opt.description}</p>
            </div>
            {selected === opt.id && (
              <span className="text-sm ml-2 text-white/65">{"\u2713"}</span>
            )}
          </SelectableCard>
        ))}
      </div>
    );
  },
};
