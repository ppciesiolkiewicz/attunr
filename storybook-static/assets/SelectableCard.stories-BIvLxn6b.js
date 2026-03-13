import{a as e}from"./chunk-BEbK6clS.js";import{t}from"./react-B-EOhADM.js";import{n}from"./iframe-B-evtYGe.js";var r=n(),i=e(t()),a=(0,i.forwardRef)(({selected:e=!1,className:t=``,style:n,...i},a)=>(0,r.jsx)(`button`,{ref:a,className:`cursor-pointer flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left transition-all disabled:opacity-70 disabled:cursor-not-allowed ${t}`,style:{backgroundColor:e?`rgba(255,255,255,0.07)`:`rgba(255,255,255,0.04)`,borderColor:e?`rgba(255,255,255,0.08)`:`rgba(255,255,255,0.06)`,...n},...i}));a.displayName=`SelectableCard`;var o={title:`UI/SelectableCard`,component:a,argTypes:{selected:{control:`boolean`},disabled:{control:`boolean`}}},s={args:{selected:!1,children:(0,r.jsxs)(`div`,{children:[(0,r.jsx)(`p`,{className:`text-sm font-medium text-white/95`,children:`Option label`}),(0,r.jsx)(`p`,{className:`text-xs mt-0.5 text-white/65`,children:`Description text`})]})}},c={args:{selected:!0,children:(0,r.jsxs)(`div`,{className:`flex items-center justify-between w-full`,children:[(0,r.jsxs)(`div`,{children:[(0,r.jsx)(`p`,{className:`text-sm font-medium text-white/95`,children:`A440 Standard`}),(0,r.jsx)(`p`,{className:`text-xs mt-0.5 text-white/65`,children:`Most common modern tuning`})]}),(0,r.jsx)(`span`,{className:`text-sm ml-2 text-white/65`,children:`✓`})]})}},l={render:()=>{let e=[{id:`432`,label:`A432 Verdi`,description:`Warmer, softer tone`},{id:`440`,label:`A440 Standard`,description:`Most common modern tuning`},{id:`444`,label:`A444 Bright`,description:`Slightly brighter resonance`}],[t,n]=(0,i.useState)(`440`);return(0,r.jsx)(`div`,{className:`flex flex-col gap-1.5 max-w-xs`,children:e.map(e=>(0,r.jsxs)(a,{selected:t===e.id,onClick:()=>n(e.id),children:[(0,r.jsxs)(`div`,{children:[(0,r.jsx)(`p`,{className:`text-sm font-medium text-white/95`,children:e.label}),(0,r.jsx)(`p`,{className:`text-xs mt-0.5 text-white/65`,children:e.description})]}),t===e.id&&(0,r.jsx)(`span`,{className:`text-sm ml-2 text-white/65`,children:`✓`})]},e.id))})}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    selected: false,
    children: <div>
        <p className="text-sm font-medium text-white/95">Option label</p>
        <p className="text-xs mt-0.5 text-white/65">Description text</p>
      </div>
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    selected: true,
    children: <div className="flex items-center justify-between w-full">
        <div>
          <p className="text-sm font-medium text-white/95">A440 Standard</p>
          <p className="text-xs mt-0.5 text-white/65">Most common modern tuning</p>
        </div>
        <span className="text-sm ml-2 text-white/65">{"\\u2713"}</span>
      </div>
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => {
    const options = [{
      id: "432",
      label: "A432 Verdi",
      description: "Warmer, softer tone"
    }, {
      id: "440",
      label: "A440 Standard",
      description: "Most common modern tuning"
    }, {
      id: "444",
      label: "A444 Bright",
      description: "Slightly brighter resonance"
    }];
    const [selected, setSelected] = useState("440");
    return <div className="flex flex-col gap-1.5 max-w-xs">
        {options.map(opt => <SelectableCard key={opt.id} selected={selected === opt.id} onClick={() => setSelected(opt.id)}>
            <div>
              <p className="text-sm font-medium text-white/95">{opt.label}</p>
              <p className="text-xs mt-0.5 text-white/65">{opt.description}</p>
            </div>
            {selected === opt.id && <span className="text-sm ml-2 text-white/65">{"\\u2713"}</span>}
          </SelectableCard>)}
      </div>;
  }
}`,...l.parameters?.docs?.source}}};var u=[`Default`,`Selected`,`TuningSelector`];export{s as Default,c as Selected,l as TuningSelector,u as __namedExportsOrder,o as default};