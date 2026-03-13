import"./react-B-EOhADM.js";import{n as e}from"./iframe-B-evtYGe.js";import{t}from"./Button-4W5y-ora.js";import{t as n}from"./CloseButton-CYKWNOJJ.js";import{t as r}from"./Text-C5zA_72T.js";var i=e();function a({children:e,onBackdropClick:t,className:n=``,panelClassName:r=``,style:a,panelStyle:o}){return(0,i.jsx)(`div`,{className:`fixed inset-0 z-30 flex items-end sm:items-center justify-center p-4 ${n}`,style:{background:`rgba(0,0,0,0.75)`,backdropFilter:`blur(8px)`,...a},onClick:t,children:(0,i.jsx)(`div`,{className:`w-full max-w-md rounded-2xl overflow-hidden flex flex-col ${r}`,style:{background:`#0f0f1a`,border:`1px solid rgba(255,255,255,0.1)`,boxShadow:`0 24px 80px rgba(0,0,0,0.6)`,maxHeight:`90vh`,...o},onClick:e=>e.stopPropagation(),children:e})})}var{fn:o}=__STORYBOOK_MODULE_TEST__,s={title:`UI/Modal`,component:a,args:{onBackdropClick:o()},parameters:{layout:`fullscreen`}},c={args:{children:(0,i.jsxs)(i.Fragment,{children:[(0,i.jsxs)(`div`,{className:`flex items-center justify-between px-5 py-4 border-b border-white/[0.06]`,children:[(0,i.jsx)(r,{variant:`heading-sm`,children:`Modal Title`}),(0,i.jsx)(n,{onClick:()=>{}})]}),(0,i.jsx)(`div`,{className:`px-5 py-5`,children:(0,i.jsx)(r,{variant:`body-sm`,children:`This is the modal content area. It can contain any content.`})}),(0,i.jsx)(`div`,{className:`px-5 py-4 border-t border-white/[0.06] flex justify-end`,children:(0,i.jsx)(t,{children:`Got it`})})]})}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    children: <>
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
  }
}`,...c.parameters?.docs?.source}}};var l=[`Default`];export{c as Default,l as __namedExportsOrder,s as default};