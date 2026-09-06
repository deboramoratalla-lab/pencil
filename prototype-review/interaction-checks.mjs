import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from '/Users/dmoratalla/Documents/debora-labs/portfolio-preview/node_modules/typescript/lib/typescript.js';

// Exercise component event handlers and state transitions without a browser.
// Text measurement is approximate here; these checks do not validate visual fit.
let slots=[],index=0,timers=[];
const hooks={
  useState(initial){const i=index++;if(!(i in slots))slots[i]=initial;return[slots[i],v=>{slots[i]=typeof v==='function'?v(slots[i]):v;}];},
  useRef(initial){const i=index++;if(!(i in slots))slots[i]={current:initial};return slots[i];},
  useMemo(fn){return fn();},useCallback(fn){return fn;},useEffect(){},
};
const React={...hooks,createElement:(type,props,...children)=>({type,props:{...props,children:children.flat(Infinity)}})};
const source=fs.readFileSync(new URL('./pencil-canvas-v8.jsx',import.meta.url),'utf8')
  .replace(/^import React[^;]+;/m,'const {useState,useRef,useCallback,useMemo,useEffect}=React;')
  .replace('export default function PencilCanvas','function PencilCanvas');
const result=ts.transpileModule(source,{compilerOptions:{jsx:ts.JsxEmit.React,target:ts.ScriptTarget.ES2020},reportDiagnostics:true});
assert.equal(result.diagnostics.length,0,'JSX must compile');
const context=vm.createContext({React,document:{createElement:()=>({getContext:()=>({font:'',measureText(t){return{width:String(t).length*parseFloat(this.font)*.5};}})})},setTimeout:fn=>{timers.push(fn);return timers.length;},clearTimeout:id=>{timers[id-1]=()=>{};}});
vm.runInContext(result.outputText+'\nthis.renderApp=PencilCanvas;',context);
let tree;
const render=()=>{index=0;tree=context.renderApp();return tree;};
const walk=node=>node&&typeof node==='object'?[node,...(node.props?.children||[]).flatMap(walk)]:[];
const all=()=>walk(tree);
const text=node=>typeof node==='string'||typeof node==='number'?String(node):(node?.props?.children||[]).map(text).join('');
const button=label=>all().find(n=>n.type==='button'&&(text(n)===label||n.props.title===label||n.props['aria-label']===label));
const click=label=>{const b=button(label);assert.ok(b,`Missing button: ${label}`);assert.ok(!b.props.disabled,`${label} disabled`);b.props.onClick({stopPropagation(){}});render();};
const ad=id=>all().find(n=>n.type?.name==='Ad'&&n.props.fmt.id===id);
const pick=(id,element='headline')=>{ad(id).props.onPick(element,{stopPropagation(){},shiftKey:false});render();};
const edit=value=>{all().find(n=>n.type==='input'&&n.props['aria-label']?.startsWith('Edit ')).props.onChange({target:{value}});render();};
const pause=()=>{const pending=timers;timers=[];pending.forEach(fn=>fn());render();};
const value=(id,el='headline')=>ad(id).props.valIn(el,id);
render();
assert.equal(all().filter(n=>n.type?.name==='Ad').length,18);
pick('tt-top');click('Unlink this format');edit('TikTok local');
pick('yt-disc');edit('Shared headline');
assert.equal(value('tt-top'),'TikTok local','Shared edit must preserve local copy');
assert.equal(value('fb-right'),'Shared headline','Linked formats propagate');
pick('tt-top');assert.equal(all().find(n=>n.type==='input'&&n.props['aria-label']).props.value,'TikTok local');
click('Relink all');assert.equal(value('tt-top'),'Shared headline');
click('Undo');assert.equal(value('tt-top'),'TikTok local');
click('Redo');assert.equal(value('tt-top'),'Shared headline');
console.log('PASS shared propagation, unlink, local selection, relink, undo, redo');
pick('yt-disc');edit('Discover beautiful shiny hair powered by nourishing argan oil');
assert.ok(!all().some(n=>n.type==='button'&&/^Adapt \d/.test(text(n))),'AI stays quiet while typing');
pause();
const adaptButton=all().find(n=>n.type==='button'&&text(n).includes('Improve'));assert.ok(adaptButton);
adaptButton.props.onClick();render();
const approve=all().find(n=>n.type==='button'&&/^Approve \d/.test(text(n)));assert.ok(approve,'Fitting adaptation offers approval: '+text(tree).slice(-1400));
approve.props.onClick();render();
assert.ok(!all().some(n=>n.type==='button'&&text(n)==='Unreviewed'));
console.log('PASS delayed suggestion, adaptation, explicit approval');
pick('yt-disc');edit('W'.repeat(1000));pause();
all().find(n=>n.type==='button'&&text(n).includes('Improve')).props.onClick();render();
assert.ok(!all().some(n=>n.type==='button'&&/^Approve \d/.test(text(n))),'Unresolved overflow cannot be approved as adapted');
assert.ok(text(tree).includes('too large'));
console.log('PASS unsolvable overflow remains unresolved with a recovery explanation');
// Start fresh for format management and audit counts.
slots=[];render();
const consistency=all().find(n=>n.type==='div'&&n.props.onClick&&text(n).startsWith('Consistency'));
consistency.props.onClick();render();
assert.ok(text(tree).includes('CTA · 13 linked · 5 excluded'));
click('Add formats');click('TikTok1 added');
click('Add TikTok In-Feed');
assert.equal(all().filter(n=>n.type?.name==='Ad').length,19);
click('Close add formats');
assert.ok(text(tree).includes('3 changes to review'),'Absent CTA must not create a fourth review');
click('Add formats');
click('Add TikTok In-Feed');
assert.equal(all().filter(n=>n.type?.name==='Ad').length,20);
const duplicates=all().filter(n=>n.type?.name==='Ad'&&n.props.fmt.templateId==='tt-feed');
assert.equal(new Set(duplicates.map(n=>n.props.fmt.id)).size,2,'Instances need distinct identities');
click('Remove TikTok In-Feed · 2');
assert.equal(all().filter(n=>n.type?.name==='Ad').length,19,'Remove only one instance');
click('Remove TikTok In-Feed');
assert.equal(all().filter(n=>n.type?.name==='Ad').length,18);
click('Close add formats');assert.ok(!text(tree).includes('changes to review'));
console.log('PASS audit exclusions, format addition, absent-element reviews, removal cleanup');
