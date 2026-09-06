import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";

/* ------------------------------------------------------------------ *
 *  Multi-format canvas · Pencil
 *  Model:   shared content, local composition.
 *  Signals: one per decision, never one per format.
 *           1. silent   — anything clean is never marked
 *           2. ambient  — a 5px dot for "unreviewed", no text
 *           3. explicit — amber outline only while a decision is open,
 *                         with the count in exactly one place
 * ------------------------------------------------------------------ */

const FAM = {
  landscape:{ label:"16:9", pad:6, head:.095, bottom:9,  max:37, lines:2, fine:true  },
  square:   { label:"1:1",  pad:7, head:.105, bottom:8,  max:34, lines:2, fine:true  },
  vertical: { label:"4:5",  pad:7, head:.110, bottom:8,  max:32, lines:3, fine:true  },
  tall:     { label:"2:3",  pad:8, head:.110, bottom:7,  max:32, lines:3, fine:true  },
  portrait: { label:"9:16", pad:8, head:.120, bottom:17, max:29, lines:3, fine:false },
};

const BASE = [
  { id:"yt-disc", platform:"YouTube",  name:"Video Discovery", w:1280,h:720, fam:"landscape" },
  { id:"x-single",platform:"X",        name:"Single Image",    w:1200,h:675, fam:"landscape" },
  { id:"gd-lead", platform:"Google",   name:"Leaderboard",     w:1200,h:628, fam:"landscape" },
  { id:"li-sing", platform:"LinkedIn", name:"Single Image",    w:1200,h:627, fam:"landscape" },
  { id:"yt-mast", platform:"YouTube",  name:"Masthead",        w:1920,h:1080,fam:"landscape" },
  { id:"fb-right",platform:"Facebook", name:"Right Column",    w:1200,h:1200,fam:"square" },
  { id:"ig-feed", platform:"Instagram",name:"Feed Post",       w:1080,h:1080,fam:"square" },
  { id:"ig-carou",platform:"Instagram",name:"Carousel",        w:1080,h:1080,fam:"square" },
  { id:"li-sq",   platform:"LinkedIn", name:"Square",          w:1080,h:1080,fam:"square" },
  { id:"fb-feed", platform:"Facebook", name:"Feed",            w:1080,h:1350,fam:"vertical" },
  { id:"ig-port", platform:"Instagram",name:"Portrait",        w:1080,h:1350,fam:"vertical" },
  { id:"pin-std", platform:"Pinterest",name:"Standard",        w:1000,h:1500,fam:"tall" },
  { id:"pin-idea",platform:"Pinterest",name:"Idea Pin",        w:1000,h:1500,fam:"tall" },
  { id:"tt-top",  platform:"TikTok",   name:"TopView",         w:1080,h:1920,fam:"portrait", noCta:true },
  { id:"ig-story",platform:"Instagram",name:"Story",           w:1080,h:1920,fam:"portrait", noCta:true },
  { id:"ig-reel", platform:"Instagram",name:"Reel",            w:1080,h:1920,fam:"portrait", noCta:true },
  { id:"sc-story",platform:"Snapchat", name:"Story",           w:1080,h:1920,fam:"portrait", noCta:true },
  { id:"yt-short",platform:"YouTube",  name:"Shorts",          w:1080,h:1920,fam:"portrait", noCta:true },
];
const ADDABLE = [
  { id:"tt-feed", platform:"TikTok",   name:"In-Feed",  w:1080,h:1920,fam:"portrait", noCta:true },
  { id:"ig-expl", platform:"Instagram",name:"Explore",  w:1080,h:1080,fam:"square" },
  { id:"x-vert",  platform:"X",        name:"Vertical", w:1080,h:1350,fam:"vertical" },
];

const LABEL={logo:"Logo",headline:"Headline",subhead:"Sub-headline",cta:"CTA",fineprint:"Fineprint"};
const AREA=42000, GAP=42, FGAP=96, ORDER=["landscape","square","vertical","tall","portrait"];
const RAIL=48, PANEL=308, TOP=56;
/* Pencil is Inter everywhere in-product. Numeric metadata uses tabular figures
   so live counts do not jitter as they change. */
const FONT='Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", sans-serif';
const PHOTO = ""; // ← paste an image URL here to use a real photo instead of the embedded scene
/* Exact native Pencil header render from the supplied Figma component.
   Small crops are used as an icon sprite so the prototype does not depend on
   Figma's short-lived asset URLs. */
const HEADER_SPRITE="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABaAAAAA4CAYAAAALrV9BAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAOdEVYdFNvZnR3YXJlAEZpZ21hnrGWYwAAKghJREFUeAHt3Qlc1HX+P/A3llmmgm3bIQqZ/ndLAbcLU1HLMsEj01qPNCuzdMGD1NSwbNXUNE0tdTUNj8RjM4/1wCP9JV5J26Gg1W6HINplBWSWa+X/+/p8/QzfGWZgBuYCXs8e08B8vzPfYcDv8fq+v+9PyHmDEBERERERERERERF5WTUhIiIiIiIiIiIiIvIBBtBERERERERERERE5BMMoImIiIiIiIiIiIjIJxhAExEREREREREREZFPMIAmIiIiIiIiIiIiIp9gAE1EREREREREREREPsEAmoiIiIiIiIiIiIh8ggE0EREREREREREREfkEA2giIiIiIiIiIiIi8gkG0ERERERERERERETkEwygiYiIiIiIiIiIiMgnLhYiIiIioiro/Pnz8uuvv8pvv/0mv//+uxB500UXXSQXX3yxuicioqoH+xjfffed/O9///P5fka1atXk0ksvlbp166ptjyf8+T79oTyfRW7uMRk0sL8cPnxYCgp+kKokNLSutG7dRqZOmykREZHibSHnsedNPpeXd1zd16/fQIiIiIgosM6dO6duRL6GALp69erqgJiIqCIqKMiXnJwcdR8T08wIqsKESoZQ98svv5TatWtLrVq1PA5CPYXg+PTp08bvqECuvfZat5fn7/fpD2X9LBA+t2xxa5ULnh2FhobK/gMfeD2EZgDtY1u3bpFnn31GTpzIsz3Wo0dPmTDhealTJ1R85ciRbOP/IdK0aVPbY82b3yItWrSSWbNeFiIiIqKqChU+OOAC3OPGCmjnQkJCVHB6ySWXqK+pbPDZ1ahRgyE0kR+9kr1N1h17V0789L1UFHeHR0nKzfdJeM0rJBjs2bNbpkwer+6tWrduK4lJw6Rz565Czn377bdqvV+nTh3xp/z8fDl79qxcffXVbs0fqPfpD55+Fr17d5dNGzcIicQZ/8bT03eJNzGA9qF//nOVJCcPNULflvL44wNV4Lxt2xZZuPBV6dAhQRYvXiq+cv/99wkC6DffXGd7DMtFBXZCQoIQERERVUUImxFAwy+//KKq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";
/* Two colours carry meaning, and they mean different kinds of attention:
     amber  — a machine acted, or something may be broken. A human owes it a look.
     violet — a human deliberately unlinked it. Nothing is wrong; it is just not shared.
   Linked is the norm, so it is never coloured — only counted. */
const C={ linked:"#d3cfc7", warn:"#e0921b", unrev:"#e0921b", unlinked:"#7C5CFC", na:"#efece6" };
const REV={ dot:"#e0921b", bg:"#fdf6e9", fg:"#8a5a12", line:"#f0ddbb" };

/* Measures the headline as it will actually render, so overflow is decided by
   geometry rather than by a character count per ratio family. */
let _mc=null;
function textW(t,px){
  if(!_mc){ const c=document.createElement("canvas"); _mc=c.getContext("2d"); }
  _mc.font=`${px}px Georgia, serif`;
  return _mc.measureText(t).width;
}

function headlineFits(text,px,width,maxLines){
  let lines=1,line="";
  for(const word of String(text||"").split(/\s+/)){
    if(textW(word,px)>width) return false;
    const next=line?`${line} ${word}`:word;
    if(line&&textW(next,px)>width){lines++;line=word;}else line=next;
  }
  return lines<=maxLines;
}
function headlineCollidesWithLogo(text,px,width,fam){
  if(fam!=="landscape"&&fam!=="square") return false;
  let lines=1,line="";
  for(const word of String(text||"").split(/\s+/)){
    const next=line?`${line} ${word}`:word;
    if(line&&textW(next,px)>width){lines++;line=word;}else line=next;
  }
  return lines>=3;
}
function subheadCollidesWithCta(text,px,width,fam){
  if(fam!=="landscape"&&fam!=="square") return false;
  let lines=1,line="";
  for(const word of String(text||"").split(/\s+/)){
    const next=line?`${line} ${word}`:word;
    if(line&&textW(next,px)>width){lines++;line=word;}else line=next;
  }
  return lines>=3;
}
function headlineScale(text,f){
  const F=FAM[f.fam],width=f.dw*(1-2*F.pad/100);
  for(let percent=100;percent>=50;percent--){
    if(headlineFits(text,f.dw*F.head*percent/100,width,F.lines))return percent/100;
  }
  return .5;
}

function build(formats){
  let y=0,totalW=0; const placed=[],bands=[];
  ORDER.forEach(fam=>{
    const items=formats.filter(f=>f.fam===fam); if(!items.length) return;
    let x=0,rowH=0;
    items.forEach(f=>{
      const s=Math.sqrt(AREA/(f.w*f.h)), dw=Math.round(f.w*s);
      const dh=Math.round(f.h*s);
      placed.push({...f,x,y,dw,dh}); x+=dw+GAP; rowH=Math.max(rowH,dh);
    });
    const rowW=Math.max(0,x-GAP);
    bands.push({fam,x:0,y,w:rowW});
    totalW=Math.max(totalW,rowW); y+=rowH+FGAP;
  });
  return {placed,bands,totalW,maxH:Math.max(1,y-FGAP)};
}

const I=({d,size=17})=>(
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
/* Real icon geometry, lifted from the Pencil component library in Figma. */
const LEFT_NAV = [
  {n:"Chat",x:2,y:1.47,r:"nonzero",d:"M 10.28 3.26 C 10.63 3.26 10.91 3.54 10.91 3.9 L 10.9 4.02 C 10.85 4.27 10.66 4.46 10.41 4.51 L 10.28 4.53 L 3 4.53 L 2.82 4.54 C 1.95 4.63 1.26 5.37 1.26 6.27 L 1.26 14.62 L 1.27 14.79 C 1.36 15.61 2.01 16.26 2.82 16.34 L 3 16.35 L 5.93 16.35 C 6.11 16.35 6.27 16.42 6.39 16.54 C 6.5 16.67 6.56 16.84 6.56 17 L 6.5 18.78 L 6.49 19.05 L 6.5 19.12 C 6.52 19.18 6.57 19.21 6.6 19.24 C 6.65 19.26 6.74 19.29 6.83 19.22 L 10.48 16.48 C 10.56 16.41 10.66 16.38 10.76 16.36 L 10.86 16.35 L 15.08 16.35 L 15.26 16.34 C 16.07 16.26 16.72 15.61 16.8 14.79 L 16.81 14.62 L 16.81 10.32 C 16.81 9.97 17.09 9.68 17.45 9.68 C 17.8 9.68 18.08 9.97 18.08 10.32 L 18.08 14.62 L 18.07 14.77 C 18 16.3 16.76 17.53 15.23 17.61 L 15.08 17.61 L 11.07 17.61 L 7.59 20.23 L 7.48 20.3 C 7.24 20.45 6.97 20.53 6.7 20.53 L 6.53 20.52 C 6.41 20.5 6.3 20.47 6.19 20.43 L 6.02 20.36 C 5.58 20.13 5.29 19.7 5.24 19.21 L 5.23 19 L 5.28 17.61 L 3 17.61 L 2.84 17.61 C 1.32 17.53 0.08 16.3 0 14.77 L 0 14.62 L 0 6.27 C 0 4.66 1.26 3.35 2.84 3.27 L 3 3.26 L 10.28 3.26 Z M 9.39 11.4 C 9.74 11.4 10.02 11.68 10.02 12.04 L 10.01 12.16 C 9.95 12.45 9.7 12.67 9.39 12.67 L 5.71 12.67 L 5.58 12.65 C 5.29 12.59 5.07 12.34 5.07 12.04 C 5.07 11.73 5.29 11.47 5.58 11.42 L 5.71 11.4 L 9.39 11.4 Z M 11.73 8.21 C 12.08 8.21 12.36 8.49 12.36 8.84 L 12.35 8.97 C 12.29 9.26 12.04 9.47 11.73 9.47 L 5.71 9.47 L 5.58 9.46 C 5.29 9.4 5.07 9.15 5.07 8.84 C 5.07 8.54 5.29 8.28 5.58 8.22 L 5.71 8.21 L 11.73 8.21 Z M 16.5 0 C 16.7 0 16.89 0.12 16.98 0.3 L 17.94 2.35 L 20.08 2.68 L 20.15 2.7 C 20.31 2.74 20.44 2.87 20.5 3.03 C 20.56 3.22 20.51 3.43 20.38 3.57 L 18.81 5.17 L 19.18 7.44 C 19.22 7.64 19.13 7.84 18.97 7.96 C 18.8 8.07 18.59 8.08 18.41 7.99 L 16.5 6.93 L 14.59 7.99 C 14.42 8.08 14.2 8.07 14.03 7.96 C 13.87 7.84 13.79 7.64 13.82 7.44 L 14.19 5.17 L 12.62 3.57 C 12.49 3.43 12.44 3.22 12.5 3.03 C 12.56 2.85 12.73 2.71 12.92 2.68 L 15.06 2.35 L 16.02 0.3 L 16.06 0.24 C 16.16 0.09 16.32 0 16.5 0 Z M 15.89 3.05 C 15.82 3.21 15.67 3.32 15.5 3.35 L 14.09 3.57 L 15.13 4.63 C 15.24 4.75 15.3 4.91 15.27 5.08 L 15.03 6.54 L 16.25 5.87 L 16.31 5.84 C 16.45 5.78 16.62 5.79 16.75 5.87 L 17.97 6.54 L 17.73 5.08 C 17.7 4.91 17.76 4.75 17.87 4.63 L 18.91 3.57 L 17.5 3.35 C 17.33 3.32 17.18 3.21 17.1 3.05 L 16.5 1.76 L 15.89 3.05 Z"},
  {n:"Image",x:4,y:4,r:"evenodd",d:"M 5.48 3.47 C 6.4 3.56 7.13 4.34 7.13 5.29 C 7.13 6.3 6.3 7.12 5.29 7.12 C 4.34 7.12 3.56 6.4 3.47 5.48 L 3.46 5.29 L 3.47 5.1 C 3.56 4.18 4.34 3.46 5.29 3.46 L 5.48 3.47 Z M 13.62 0 C 14.93 0 16 1.07 16 2.38 L 16 13.62 C 16 14.93 14.93 16 13.62 16 L 2.38 16 C 1.07 16 0 14.93 0 13.62 L 0 2.38 C 0 1.07 1.07 0 2.38 0 L 13.62 0 Z M 4.4 14.45 L 13.62 14.45 C 14.08 14.45 14.45 14.08 14.45 13.62 L 14.45 10.61 L 11.28 7.31 L 4.4 14.45 Z M 2.38 1.55 C 1.92 1.55 1.55 1.92 1.55 2.38 L 1.55 13.62 C 1.55 14.04 1.86 14.38 2.26 14.44 L 10.72 5.66 C 10.86 5.51 11.07 5.42 11.28 5.42 C 11.49 5.42 11.69 5.51 11.83 5.66 L 14.45 8.38 L 14.45 2.38 C 14.45 1.92 14.08 1.55 13.62 1.55 L 2.38 1.55 Z"},
  {n:"Video",x:3.37,y:6.3,r:"evenodd",d:"M 9.93 0 C 11.33 0 12.47 1.13 12.47 2.53 L 12.47 3.3 L 15.16 0.63 L 15.23 0.56 C 16.06 -0.14 17.4 0.42 17.4 1.56 L 17.4 10.83 C 17.4 12.01 15.98 12.58 15.16 11.76 L 12.47 9.1 L 12.47 9.87 C 12.47 11.27 11.33 12.4 9.93 12.4 L 2.54 12.4 C 1.14 12.4 0 11.27 0 9.87 L 0 2.53 C 0 1.13 1.14 0 2.54 0 L 9.93 0 Z M 2.54 1.4 C 1.91 1.4 1.4 1.91 1.4 2.53 L 1.4 9.87 C 1.4 10.49 1.91 11 2.54 11 L 9.93 11 C 10.57 11 11.08 10.49 11.08 9.87 L 11.08 2.53 C 11.08 1.91 10.57 1.4 9.93 1.4 L 2.54 1.4 Z M 12.47 5.27 L 12.47 7.13 L 16 10.63 L 16 1.76 L 12.47 5.27 Z"},
  {n:"Text",x:4,y:4,r:"nonzero",d:"M 15.38 0 C 15.73 0.04 16 0.33 16 0.69 L 16 3.43 C 16 3.81 15.69 4.11 15.31 4.11 C 14.94 4.11 14.63 3.81 14.63 3.43 L 14.63 1.37 L 8.69 1.37 L 8.69 14.63 L 10.74 14.63 C 11.12 14.63 11.43 14.94 11.43 15.31 C 11.43 15.69 11.12 16 10.74 16 L 5.26 16 C 4.88 16 4.57 15.69 4.57 15.31 C 4.57 14.94 4.88 14.63 5.26 14.63 L 7.31 14.63 L 7.31 1.37 L 1.37 1.37 L 1.37 3.43 C 1.37 3.81 1.06 4.11 0.69 4.11 C 0.31 4.11 0 3.81 0 3.43 L 0 0.69 L 0 0.62 C 0.04 0.27 0.33 0 0.69 0 L 15.31 0 L 15.38 0 Z"},
  {n:"Musics",x:4.25,y:2.83,r:"evenodd",d:"M 12.06 0.17 C 12.7 -0.02 13.62 -0.13 14.15 0.27 C 14.68 0.67 14.75 1.53 14.75 2.19 L 14.75 10.56 C 14.75 10.57 14.75 10.58 14.75 10.58 C 14.75 10.62 14.75 10.66 14.75 10.7 C 14.75 12.44 13.33 13.86 11.59 13.86 C 9.85 13.86 8.43 12.44 8.43 10.7 C 8.43 8.95 9.85 7.54 11.59 7.54 C 12.24 7.54 12.84 7.73 13.35 8.07 L 13.35 2.19 C 13.35 1.97 13.36 1.65 13.18 1.52 C 13 1.38 12.66 1.46 12.45 1.52 L 6.83 3.12 C 6.53 3.21 6.32 3.48 6.32 3.8 L 6.32 14.79 C 6.32 14.82 6.32 14.86 6.31 14.89 C 6.32 14.97 6.32 15.05 6.32 15.14 C 6.32 16.88 4.9 18.3 3.16 18.3 C 1.42 18.3 0 16.88 0 15.14 C 0 13.39 1.42 11.98 3.16 11.98 C 3.81 11.98 4.41 12.17 4.92 12.51 L 4.92 3.55 C 4.92 2.61 5.54 2.03 6.45 1.77 L 12.06 0.17 Z M 3.16 13.38 C 2.19 13.38 1.4 14.17 1.4 15.14 C 1.4 16.11 2.19 16.89 3.16 16.89 C 4.13 16.89 4.92 16.11 4.92 15.14 C 4.92 14.17 4.13 13.38 3.16 13.38 Z M 11.59 8.94 C 10.62 8.94 9.83 9.73 9.83 10.7 C 9.83 11.67 10.62 12.45 11.59 12.45 C 12.56 12.45 13.35 11.67 13.35 10.7 C 13.35 9.73 12.56 8.94 11.59 8.94 Z M 11.01 3.46 C 11.39 3.36 11.78 3.57 11.88 3.94 C 11.99 4.32 11.77 4.71 11.4 4.81 L 8.65 5.6 C 8.28 5.7 7.89 5.49 7.78 5.12 C 7.68 4.74 7.89 4.35 8.27 4.25 L 11.01 3.46 Z"},
  {n:"Audio",x:3,y:2,r:"nonzero",d:"M 4 16 L 6 16 L 6 4 L 4 4 L 4 16 Z M 8 20 L 10 20 L 10 0 L 8 0 L 8 20 Z M 0 12 L 2 12 L 2 8 L 0 8 L 0 12 Z M 12 16 L 14 16 L 14 4 L 12 4 L 12 16 Z M 16 8 L 16 12 L 18 12 L 18 8 L 16 8 Z"},
  {n:"Elements",x:3,y:3,r:"evenodd",d:"M 14.46 9.27 C 16.81 9.27 18.71 11.17 18.71 13.52 C 18.71 15.87 16.81 17.77 14.46 17.77 C 12.11 17.77 10.21 15.87 10.21 13.52 C 10.21 11.17 12.11 9.27 14.46 9.27 Z M 14.46 10.77 C 12.94 10.77 11.71 12 11.71 13.52 C 11.71 15.04 12.94 16.27 14.46 16.27 C 15.98 16.27 17.21 15.04 17.21 13.52 C 17.21 12 15.98 10.77 14.46 10.77 Z M 7.53 10.06 C 7.91 10.1 8.21 10.42 8.21 10.8 L 8.21 16.89 C 8.21 17.3 7.87 17.64 7.46 17.64 L 1.37 17.64 C 0.95 17.64 0.62 17.3 0.62 16.89 L 0.62 10.8 L 0.62 10.73 C 0.66 10.35 0.98 10.05 1.37 10.05 L 7.46 10.05 L 7.53 10.06 Z M 2.12 16.14 L 6.71 16.14 L 6.71 11.55 L 2.12 11.55 L 2.12 16.14 Z M 3.8 0.17 C 4.1 -0.07 4.53 -0.05 4.81 0.22 L 8.33 3.75 C 8.63 4.04 8.63 4.51 8.33 4.81 L 4.81 8.34 C 4.51 8.63 4.04 8.63 3.75 8.34 L 0.22 4.81 L 0.17 4.75 C -0.07 4.46 -0.05 4.02 0.22 3.75 L 3.75 0.22 L 3.8 0.17 Z M 1.81 4.28 L 4.28 6.74 L 6.74 4.28 L 4.28 1.81 L 1.81 4.28 Z M 14.28 0.13 C 14.55 0.13 14.8 0.28 14.93 0.51 L 18.32 6.38 C 18.45 6.61 18.45 6.9 18.32 7.13 C 18.19 7.36 17.94 7.5 17.67 7.5 L 10.89 7.5 C 10.63 7.5 10.38 7.36 10.24 7.13 C 10.11 6.9 10.11 6.61 10.24 6.38 L 13.63 0.51 L 13.69 0.43 C 13.83 0.24 14.05 0.13 14.28 0.13 Z M 12.19 6 L 16.37 6 L 14.28 2.38 L 12.19 6 Z"},
  {n:"Brand library",x:3.25,y:3.25,r:"evenodd",d:"M 8.75 8.25 C 8.94 8.25 9.12 8.36 9.2 8.54 L 9.71 9.61 L 10.83 9.78 C 11.01 9.81 11.17 9.94 11.22 10.12 C 11.28 10.3 11.24 10.49 11.11 10.63 L 10.28 11.47 L 10.48 12.67 C 10.51 12.86 10.43 13.05 10.27 13.16 C 10.12 13.27 9.91 13.28 9.74 13.19 L 8.75 12.64 L 7.76 13.19 C 7.59 13.28 7.38 13.27 7.23 13.16 C 7.07 13.05 6.99 12.86 7.02 12.67 L 7.22 11.47 L 6.39 10.63 C 6.26 10.49 6.22 10.3 6.28 10.12 C 6.33 9.94 6.49 9.81 6.67 9.78 L 7.79 9.61 L 8.3 8.54 L 8.33 8.47 C 8.42 8.34 8.58 8.25 8.75 8.25 Z M 8.58 10.28 C 8.51 10.43 8.37 10.54 8.21 10.56 L 7.79 10.63 L 8.11 10.95 C 8.22 11.07 8.27 11.23 8.24 11.38 L 8.17 11.81 L 8.51 11.63 L 8.57 11.6 C 8.7 11.55 8.86 11.56 8.99 11.63 L 9.33 11.81 L 9.26 11.38 C 9.23 11.23 9.28 11.07 9.39 10.95 L 9.71 10.63 L 9.29 10.56 C 9.13 10.54 8.99 10.43 8.92 10.28 L 8.75 9.93 L 8.58 10.28 Z M 15.5 0 C 16.6 0 17.5 0.9 17.5 2 L 17.5 15.5 C 17.5 16.6 16.6 17.5 15.5 17.5 L 2 17.5 C 0.9 17.5 0 16.6 0 15.5 L 0 2 C 0 0.9 0.9 0 2 0 L 15.5 0 Z M 2 1.5 C 1.72 1.5 1.5 1.72 1.5 2 L 1.5 15.5 C 1.5 15.78 1.72 16 2 16 L 15.5 16 C 15.78 16 16 15.78 16 15.5 L 16 2 C 16 1.72 15.78 1.5 15.5 1.5 L 12.5 1.5 L 12.5 6.75 C 12.5 7.06 12.31 7.33 12.03 7.45 C 11.75 7.56 11.42 7.49 11.21 7.27 L 8.7 4.65 L 6.3 7.26 C 6.09 7.49 5.77 7.56 5.48 7.45 C 5.19 7.34 5 7.06 5 6.75 L 5 1.5 L 2 1.5 Z M 6.5 4.83 L 8.14 3.04 L 8.2 2.99 C 8.33 2.87 8.5 2.8 8.69 2.8 C 8.89 2.8 9.09 2.88 9.23 3.03 L 11 4.88 L 11 1.5 L 6.5 1.5 L 6.5 4.83 Z"}
];
const RIGHT_NAV = [
  {n:"Work",x:2.32,y:2.36,r:"evenodd",d:"M 7.83 0.76 C 8.03 0.24 8.57 -0.07 9.12 0.01 L 9.24 0.04 L 18.49 2.52 L 18.6 2.56 C 19.16 2.77 19.48 3.37 19.32 3.96 L 15.95 16.57 C 15.78 17.19 15.13 17.57 14.5 17.4 L 13.56 17.15 L 4.34 19.24 C 3.71 19.38 3.07 18.99 2.92 18.34 L 0.03 5.63 C -0.1 5.03 0.24 4.43 0.81 4.24 L 0.93 4.21 L 7.29 2.76 L 7.79 0.88 L 7.83 0.76 Z M 1.56 5.6 L 4.32 17.71 L 10.44 16.32 L 5.26 14.93 C 4.64 14.77 4.22 14.1 4.43 13.45 L 6.85 4.4 L 1.56 5.6 Z M 8.94 2.38 L 8.73 3.2 L 8.63 3.58 L 5.95 13.56 L 13.73 15.65 L 14.58 15.87 L 17.79 3.88 L 9.16 1.57 L 8.94 2.38 Z"},
  {n:"Formats",x:2.95,y:2.94,r:"nonzero",d:"M 6.57 5.83 C 6.99 5.83 7.32 6.17 7.32 6.58 C 7.32 7 6.99 7.33 6.57 7.33 C 6.16 7.33 5.82 7 5.82 6.58 C 5.82 6.17 6.16 5.83 6.57 5.83 Z M 10.6 9.85 C 11.01 9.85 11.35 10.18 11.35 10.6 C 11.35 11.01 11.01 11.35 10.6 11.35 C 10.18 11.35 9.85 11.01 9.85 10.6 C 9.85 10.18 10.18 9.85 10.6 9.85 Z M 2.88 2.14 C 3.3 2.14 3.63 2.48 3.63 2.89 C 3.63 3.31 3.3 3.64 2.88 3.64 C 2.47 3.64 2.13 3.31 2.13 2.89 C 2.13 2.48 2.47 2.14 2.88 2.14 Z M 15.91 0 C 17.13 0 18.11 0.98 18.11 2.2 L 18.11 15.92 C 18.11 17.13 17.13 18.12 15.91 18.12 L 3.84 18.12 L 3.84 18.11 L 2.2 18.11 C 0.98 18.11 0 17.12 0 15.91 L 0 2.2 C 0 0.98 0.98 0 2.2 0 L 15.91 0 Z M 5.9 5.23 C 5.58 5.3 5.35 5.58 5.35 5.92 L 5.35 16.62 L 7.81 16.62 L 7.81 9.96 C 7.81 9.2 8.2 8.53 8.78 8.13 C 8.9 8.05 9.02 7.99 9.16 7.93 C 9.42 7.82 9.71 7.76 10.01 7.76 L 16.61 7.76 L 16.61 5.22 L 6.05 5.22 L 5.9 5.23 Z M 9.87 9.27 C 9.55 9.34 9.31 9.62 9.31 9.96 L 9.31 16.62 L 15.91 16.62 C 16.3 16.62 16.61 16.31 16.61 15.92 L 16.61 9.26 L 10.01 9.26 L 9.87 9.27 Z M 2.2 1.5 C 1.81 1.5 1.5 1.81 1.5 2.2 L 1.5 15.91 C 1.5 16.3 1.81 16.61 2.2 16.61 L 3.84 16.61 L 3.84 5.92 C 3.84 4.7 4.82 3.72 6.04 3.72 L 16.61 3.72 L 16.61 2.2 C 16.61 1.81 16.3 1.5 15.91 1.5 L 2.2 1.5 Z"},
  {n:"Configuration",x:1.25,y:1.75,r:"evenodd",d:"M 12.53 0.11 C 13.88 -0.14 15.28 0.03 16.53 0.6 L 16.61 0.64 C 16.79 0.75 16.92 0.94 16.96 1.15 C 17 1.39 16.92 1.64 16.75 1.81 L 12.98 5.58 C 12.94 5.63 12.91 5.69 12.91 5.75 C 12.91 5.82 12.94 5.88 12.98 5.93 L 14.57 7.52 L 14.61 7.55 C 14.65 7.57 14.7 7.59 14.75 7.59 C 14.81 7.59 14.87 7.56 14.92 7.52 L 18.69 3.75 L 18.75 3.69 C 18.92 3.56 19.14 3.51 19.35 3.54 C 19.59 3.59 19.8 3.75 19.9 3.97 C 20.46 5.22 20.64 6.62 20.39 7.97 C 20.14 9.31 19.49 10.56 18.52 11.53 C 17.55 12.5 16.31 13.15 14.96 13.39 C 13.78 13.61 12.58 13.51 11.46 13.1 L 4.9 19.66 C 4.43 20.13 3.81 20.42 3.15 20.49 L 2.87 20.5 C 2.11 20.5 1.38 20.2 0.84 19.66 C 0.3 19.12 0 18.39 0 17.63 C 0 16.87 0.3 16.14 0.84 15.6 L 7.4 9.04 C 6.99 7.92 6.89 6.71 7.11 5.54 C 7.35 4.19 8 2.95 8.97 1.98 C 9.94 1.01 11.18 0.36 12.53 0.11 Z M 14.83 1.61 C 14.16 1.47 13.48 1.46 12.8 1.58 C 11.75 1.78 10.79 2.28 10.03 3.04 C 9.28 3.79 8.77 4.76 8.58 5.81 C 8.39 6.86 8.52 7.94 8.96 8.91 C 9.09 9.2 9.03 9.53 8.81 9.75 L 1.9 16.66 C 1.64 16.92 1.5 17.27 1.5 17.63 C 1.5 17.99 1.64 18.34 1.9 18.6 C 2.16 18.86 2.51 19 2.87 19 L 3.01 18.99 C 3.32 18.96 3.61 18.82 3.84 18.6 L 10.75 11.69 L 10.84 11.62 C 11.05 11.46 11.34 11.42 11.59 11.54 C 12.56 11.98 13.64 12.11 14.69 11.92 C 15.74 11.73 16.71 11.22 17.46 10.47 C 18.22 9.71 18.72 8.75 18.92 7.7 C 19.04 7.02 19.02 6.34 18.88 5.67 L 15.97 8.59 C 15.65 8.91 15.21 9.09 14.75 9.09 C 14.29 9.09 13.85 8.91 13.52 8.59 L 11.91 6.98 C 11.59 6.65 11.41 6.21 11.41 5.75 C 11.41 5.29 11.59 4.85 11.91 4.53 L 14.83 1.61 Z"},
  {n:"Animation",x:2.91,y:2.92,r:"nonzero",d:"M 4.28 6.95 C 4.28 6.27 4.39 5.65 4.55 5.06 L 4.63 4.79 C 5.54 2.01 8.15 0 11.23 0 C 15.07 0 18.19 3.11 18.19 6.96 C 18.19 10.14 16.04 12.81 13.13 13.64 C 12.53 13.8 11.9 13.9 11.23 13.9 C 7.39 13.9 4.28 10.79 4.28 6.95 Z M 5.78 6.95 C 5.78 9.96 8.22 12.4 11.23 12.4 C 11.74 12.4 12.24 12.33 12.72 12.19 L 12.93 12.13 C 15.11 11.41 16.69 9.37 16.69 6.96 C 16.69 3.94 14.25 1.5 11.23 1.5 C 8.74 1.5 6.64 3.18 5.99 5.46 C 5.86 5.95 5.78 6.44 5.78 6.95 Z M 5.01 17.16 C 5.09 16.75 5.48 16.48 5.89 16.56 C 6.23 16.63 6.59 16.67 6.96 16.67 C 7.26 16.67 7.55 16.64 7.83 16.6 L 7.91 16.59 C 8.29 16.57 8.63 16.84 8.7 17.22 C 8.76 17.63 8.48 18.01 8.08 18.08 L 7.8 18.12 C 7.52 18.15 7.24 18.17 6.96 18.17 C 6.49 18.17 6.04 18.12 5.6 18.04 C 5.19 17.96 4.93 17.56 5.01 17.16 Z M 10.9 14.98 C 11.18 14.68 11.66 14.67 11.96 14.95 C 12.26 15.24 12.27 15.71 11.98 16.01 C 11.47 16.55 10.87 17.01 10.2 17.36 L 10.13 17.4 C 9.78 17.54 9.37 17.4 9.19 17.05 C 8.99 16.69 9.13 16.23 9.5 16.04 L 9.69 15.93 C 10.14 15.67 10.54 15.35 10.9 14.98 Z M 2.42 14.24 C 2.82 14.84 3.33 15.35 3.92 15.75 L 3.99 15.8 C 4.28 16.04 4.35 16.47 4.13 16.79 C 3.9 17.14 3.43 17.23 3.09 17 L 2.81 16.8 C 2.17 16.32 1.61 15.74 1.17 15.08 L 2.42 14.24 Z M 1.38 14.04 C 1.72 13.81 2.19 13.9 2.42 14.24 L 1.17 15.08 C 0.94 14.73 1.03 14.27 1.38 14.04 Z M 12.19 12.7 C 12.3 12.3 12.72 12.07 13.12 12.18 C 13.52 12.3 13.75 12.71 13.64 13.11 C 13.53 13.47 13.4 13.83 13.25 14.16 L 13.21 14.23 C 13.01 14.56 12.6 14.69 12.25 14.52 C 11.87 14.35 11.71 13.9 11.89 13.53 L 11.97 13.33 C 12.06 13.12 12.13 12.92 12.19 12.7 Z M 0 11.21 C 0 10.83 0.03 10.46 0.09 10.09 C 0.16 9.69 0.54 9.41 0.95 9.47 C 1.36 9.54 1.64 9.93 1.57 10.33 C 1.52 10.62 1.5 10.91 1.5 11.21 C 1.5 11.49 1.52 11.76 1.56 12.02 L 1.6 12.28 L 1.62 12.35 C 1.65 12.73 1.39 13.09 1.01 13.16 C 0.63 13.24 0.26 13.01 0.15 12.64 L 0.13 12.57 L 0.08 12.24 C 0.03 11.9 0 11.56 0 11.21 Z M 2.13 8.67 C 1.94 9.04 1.48 9.18 1.12 8.98 C 0.75 8.79 0.61 8.34 0.8 7.97 L 2.13 8.67 Z M 2.22 6.14 C 2.52 5.91 2.95 5.93 3.22 6.22 C 3.51 6.52 3.49 6.99 3.19 7.28 L 3.04 7.43 C 2.68 7.8 2.37 8.22 2.13 8.67 L 1.47 8.32 L 0.8 7.97 C 1.16 7.3 1.62 6.7 2.16 6.19 L 2.22 6.14 Z M 5.13 4.52 C 5.51 4.45 5.88 4.68 5.98 5.05 C 6.1 5.45 5.87 5.86 5.47 5.98 L 5.26 6.04 C 5.05 6.11 4.84 6.19 4.64 6.28 C 4.27 6.46 3.82 6.3 3.65 5.92 C 3.47 5.55 3.63 5.1 4.01 4.93 C 4.34 4.77 4.69 4.64 5.06 4.53 L 5.13 4.52 Z"},
  {n:"Transitions",x:2.0,y:4.86,r:"nonzero",d:"M 8.57 9.29 C 8.38 9.29 8.2 9.36 8.07 9.49 C 7.93 9.63 7.86 9.81 7.86 10 L 7.86 12.86 L 1.43 12.86 L 1.43 1.43 L 7.86 1.43 L 7.86 4.29 C 7.86 4.48 7.93 4.66 8.07 4.79 C 8.2 4.92 8.38 5 8.57 5 C 8.76 5 8.94 4.92 9.08 4.79 C 9.21 4.66 9.29 4.48 9.29 4.29 L 9.29 0.71 C 9.29 0.52 9.21 0.34 9.08 0.21 C 8.94 0.08 8.76 0 8.57 0 L 0.71 0 C 0.52 0 0.34 0.08 0.21 0.21 C 0.08 0.34 0 0.52 0 0.71 L 0 13.57 C 0 13.76 0.08 13.94 0.21 14.08 C 0.34 14.21 0.52 14.29 0.71 14.29 L 8.57 14.29 C 8.76 14.29 8.94 14.21 9.08 14.08 C 9.21 13.94 9.29 13.76 9.29 13.57 L 9.29 10 C 9.29 9.81 9.21 9.63 9.08 9.49 C 8.94 9.36 8.76 9.29 8.57 9.29 Z M 19.29 0 L 11.43 0 C 11.24 0 11.06 0.08 10.93 0.21 C 10.79 0.34 10.72 0.52 10.72 0.71 L 10.72 4.29 C 10.72 4.48 10.79 4.66 10.93 4.79 C 11.06 4.92 11.24 5 11.43 5 C 11.62 5 11.8 4.92 11.94 4.79 C 12.07 4.66 12.15 4.48 12.15 4.29 L 12.15 1.43 L 18.57 1.43 L 18.57 12.86 L 12.15 12.86 L 12.15 10 C 12.15 9.81 12.07 9.63 11.94 9.49 C 11.8 9.36 11.62 9.29 11.43 9.29 C 11.24 9.29 11.06 9.36 10.93 9.49 C 10.79 9.63 10.72 9.81 10.72 10 L 10.72 13.57 C 10.72 13.76 10.79 13.94 10.93 14.08 C 11.06 14.21 11.24 14.29 11.43 14.29 L 19.29 14.29 C 19.48 14.29 19.66 14.21 19.79 14.08 C 19.93 13.94 20 13.76 20 13.57 L 20 0.71 C 20 0.52 19.93 0.34 19.79 0.21 C 19.66 0.08 19.48 0 19.29 0 Z M 12.54 3.89 C 12.76 3.67 13.1 3.67 13.32 3.89 L 16.34 6.91 C 16.55 7.12 16.55 7.47 16.34 7.69 L 13.32 10.71 C 13.1 10.92 12.76 10.92 12.54 10.71 C 12.33 10.49 12.33 10.15 12.54 9.93 L 14.63 7.84 L 6.01 7.81 C 5.7 7.81 5.46 7.57 5.46 7.26 C 5.46 6.96 5.7 6.72 6.01 6.72 L 14.63 6.75 L 12.54 4.66 C 12.33 4.45 12.33 4.1 12.54 3.89 Z"},
  {n:"layers",x:2.25,y:2.25,r:"nonzero",d:"M 17.99 13.18 C 18.34 13.04 18.75 13.2 18.93 13.54 C 19.11 13.91 18.96 14.36 18.59 14.55 L 9.84 18.93 C 9.65 19.02 9.44 19.03 9.25 18.96 L 9.17 18.93 L 0.42 14.55 L 0.35 14.51 C 0.03 14.31 -0.09 13.89 0.08 13.54 C 0.25 13.2 0.66 13.04 1.01 13.18 L 1.09 13.21 L 9.5 17.42 L 17.92 13.21 L 17.99 13.18 Z M 17.99 8.8 C 18.34 8.67 18.75 8.82 18.93 9.17 C 19.11 9.54 18.96 9.99 18.59 10.17 L 9.84 14.55 C 9.65 14.64 9.44 14.65 9.25 14.59 L 9.17 14.55 L 0.42 10.17 L 0.35 10.14 C 0.03 9.93 -0.09 9.52 0.08 9.17 C 0.25 8.82 0.66 8.67 1.01 8.8 L 1.09 8.83 L 9.5 13.04 L 17.92 8.83 L 17.99 8.8 Z M 9.25 0.04 C 9.44 -0.02 9.65 -0.01 9.84 0.08 L 18.59 4.45 C 18.84 4.58 19 4.84 19 5.13 C 19 5.41 18.84 5.67 18.59 5.8 L 9.84 10.17 C 9.63 10.28 9.38 10.28 9.17 10.17 L 0.42 5.8 C 0.16 5.67 0 5.41 0 5.13 C 0 4.84 0.16 4.58 0.42 4.45 L 9.17 0.08 L 9.25 0.04 Z M 2.43 5.13 L 9.5 8.66 L 16.58 5.13 L 9.5 1.59 L 2.43 5.13 Z"}
];
const TIMELINE_NAV = {n:"Timeline",x:2,y:3,r:"nonzero",d:"M 1 0 C 0.45 0 0 0.45 0 1 L 0 17 C 0 17.55 0.45 18 1 18 L 19 18 C 19.55 18 20 17.55 20 17 L 20 1 C 20 0.45 19.55 0 19 0 L 1 0 Z M 2 16 L 2 2 L 18 2 L 18 16 L 2 16 Z M 12 4 L 4 4 L 4 6 L 12 6 L 12 4 Z M 16 12 L 16 14 L 8 14 L 8 12 L 16 12 Z M 14 8 L 6 8 L 6 10 L 14 10 L 14 8 Z"};

function NavIcon({ico,size=24}){
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{display:"block"}}>
      <g transform={`translate(${ico.x},${ico.y})`}>
        <path d={ico.d} fill="currentColor" fillRule={ico.r} clipRule={ico.r}/>
      </g>
    </svg>
  );
}

function NativeHeaderIcon({x,y,w=24,h=24}){
  return <span aria-hidden="true" style={{display:"block",width:w,height:h,flexShrink:0,
    backgroundImage:`url(${HEADER_SPRITE})`,backgroundRepeat:"no-repeat",backgroundSize:"1440px 56px",
    backgroundPosition:`-${x}px -${y}px`}}/>;
}

const IcUndo=<I size={16} d={<path d="M3 10h11a5 5 0 0 1 0 10h-3M3 10l4-4M3 10l4 4"/>}/>;
const IcRedo=<I size={16} d={<path d="M21 10H10a5 5 0 0 0 0 10h3M21 10l-4-4M21 10l-4 4"/>}/>;
const IcPlay=<I size={15} d={<path d="M5 3l14 9-14 9V3z"/>}/>;
const IcTag=<I size={15} d={<><path d="M20 12l-8 8-9-9V3h8l9 9z"/><circle cx="7.5" cy="7.5" r="1.3"/></>}/>;
const IcHist=<I size={15} d={<><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></>}/>;
const IcChevD=<I size={14} d={<path d="M6 9l6 6 6-6"/>}/>;
const IcPlus=<I size={15} d={<path d="M12 5v14M5 12h14"/>}/>;
const IcClose=<I size={14} d={<path d="M18 6L6 18M6 6l12 12"/>}/>;
const IcMore=<I size={16} d={<><circle cx="5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="19" cy="12" r="1.4" fill="currentColor"/></>}/>;
/* mingcute:ai-line — the icon Pencil actually uses, from the MingCute set.
   Stroked, not filled, and it inherits the surrounding text colour. */
const AiIcon=({size=16})=>(
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinejoin="round" style={{display:"block"}}>
    <path d="M11.1 4.6c.28-.83 1.46-.83 1.74 0l.74 2.17a4.6 4.6 0 0 0 2.87 2.87l2.17.74c.83.28.83 1.46 0 1.74l-2.17.74a4.6 4.6 0 0 0-2.87 2.87l-.74 2.17c-.28.83-1.46.83-1.74 0l-.74-2.17a4.6 4.6 0 0 0-2.87-2.87l-2.17-.74c-.83-.28-.83-1.46 0-1.74l2.17-.74a4.6 4.6 0 0 0 2.87-2.87z"/>
    <path d="M19.4 2.4l.47 1.37 1.37.47-1.37.47-.47 1.37-.47-1.37L17.56 4.24l1.37-.47z"/>
    <path d="M5.2 17.9l.47 1.37 1.37.47-1.37.47-.47 1.37-.47-1.37L3.33 19.74l1.37-.47z"/>
  </svg>
);
const IcSparkle=<AiIcon size={16}/>;


/* The creative asset. Rendered as one square scene and *sliced* by each
   format's aspect ratio — the same thing object-fit:cover does to a photo,
   but with zero network dependency so a live demo can't break. */
function Scene(){
  return (
    <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice"
      style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}>
      <defs>
        <linearGradient id="pg-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#241a0d"/>
          <stop offset="42%" stopColor="#6d4a18"/>
          <stop offset="76%" stopColor="#c79a3f"/>
          <stop offset="100%" stopColor="#f0dfae"/>
        </linearGradient>
        <radialGradient id="pg-glow" cx="72%" cy="24%" r="52%">
          <stop offset="0%" stopColor="#fff6d8" stopOpacity=".85"/>
          <stop offset="100%" stopColor="#fff6d8" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="pg-silk" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#f6d98f" stopOpacity=".0"/>
          <stop offset="55%" stopColor="#f8e3a8" stopOpacity=".55"/>
          <stop offset="100%" stopColor="#fffaf0" stopOpacity=".0"/>
        </linearGradient>
        <linearGradient id="pg-glass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2c1d09" stopOpacity=".55"/>
          <stop offset="26%" stopColor="#e8b95f"/>
          <stop offset="58%" stopColor="#f7dfa4"/>
          <stop offset="100%" stopColor="#8a5f1d"/>
        </linearGradient>
      </defs>

      <rect width="1000" height="1000" fill="url(#pg-bg)"/>
      <rect width="1000" height="1000" fill="url(#pg-glow)"/>

      {/* silk ribbons */}
      <path d="M-40 690 C 250 560, 430 780, 720 610 S 1010 470, 1080 520 L 1080 1040 L -40 1040 Z"
        fill="url(#pg-silk)" opacity=".8"/>
      <path d="M-40 800 C 220 700, 470 880, 760 740 S 1020 640, 1080 690 L 1080 1040 L -40 1040 Z"
        fill="#f3d791" opacity=".22"/>

      {/* bokeh */}
      {[[150,180,26],[262,116,14],[402,208,10],[812,150,20],[706,258,12],[905,330,16],[78,330,11],[560,120,9]]
        .map(([cx,cy,r],i)=>(
          <circle key={i} cx={cx} cy={cy} r={r} fill="#fff3cf" opacity={.10+(i%3)*.05}/>
      ))}

      {/* bottle */}
      <g transform="translate(596,300)">
        <rect x="34" y="-58" width="56" height="58" rx="9" fill="#2a1c0a" opacity=".92"/>
        <rect x="52" y="-92" width="20" height="38" rx="6" fill="#241705" opacity=".95"/>
        <rect x="0" y="0" width="124" height="352" rx="26" fill="url(#pg-glass)"/>
        <rect x="12" y="18" width="26" height="312" rx="14" fill="#fff6dc" opacity=".22"/>
        <rect x="20" y="120" width="86" height="116" rx="8" fill="#fdf7e6" opacity=".93"/>
        <circle cx="63" cy="160" r="21" fill="none" stroke="#6b4a18" strokeWidth="2.4"/>
        {[0,45,90,135].map(a=>(
          <line key={a} x1="63" y1="160" x2={63+21*Math.cos(a*Math.PI/180)} y2={160+21*Math.sin(a*Math.PI/180)}
            stroke="#6b4a18" strokeWidth="1.6" transform={`rotate(${a} 63 160)`}/>
        ))}
        <rect x="30" y="192" width="66" height="4" rx="2" fill="#6b4a18" opacity=".65"/>
        <rect x="38" y="203" width="50" height="3" rx="1.5" fill="#6b4a18" opacity=".45"/>
        <ellipse cx="62" cy="358" rx="96" ry="16" fill="#1d1206" opacity=".45"/>
      </g>
    </svg>
  );
}

export default function PencilCanvas(){
  const [formats,setFormats]=useState(BASE);
  const [content,setContent]=useState({logo:"BRAND",headline:"Mirror-Shine Hair",subhead:"Powered by Argan Oil",cta:"SHOP NOW"});
  const [hasFine,setHasFine]=useState(false);
  const [ov,setOv]=useState({}); const [unrev,setUnrev]=useState({});
  const [sel,setSel]=useState(null); const [subset,setSubset]=useState([]);
  const [approved,setApproved]=useState({});
  const [adapted,setAdapted]=useState(false);
  const [adaptedCount,setAdaptedCount]=useState(0);
  const [adaptedIds,setAdaptedIds]=useState([]);
  const [fmtAdapted,setFmtAdapted]=useState({});   // per-format headline scale, calculated to fit
  const [fmtSubAdapted,setFmtSubAdapted]=useState({});
  const [fmtCtaAdapted,setFmtCtaAdapted]=useState({});
  const [anchor,setAnchor]=useState(null);         // the format the user actually clicked
  const [demo,setDemo]=useState(false);            // opening auto-ring
  const [pin,setPin]=useState(false);              // a spotlight the user chose to keep
  const [pulse,setPulse]=useState(false);          // consistency button, when work lands out of sight
  const [typing,setTyping]=useState(false);        // keep AI quiet until the user pauses
  const [notice,setNotice]=useState(null);         // brief confirmation; resolved work leaves no badge
  const [stateHint,setStateHint]=useState(null);   // one contextual explanation when attention first appears
  const typingTimer=useRef(null), noticeTimer=useRef(null), walkTimer=useRef(null);
  const previousPending=useRef(0);

  /* When an action has consequences the user cannot see, take them there rather
     than opening a panel over the thing they were looking at. */
  const announce=useCallback(ids=>{
    if(!ids.length) return;
    setFocus(ids); setPin(true);
    setPulse(true); setTimeout(()=>setPulse(false),2000);
  },[]);
  const [focus,setFocus]=useState(null);        // spotlight a set of formats
  const [audit,setAudit]=useState(false);
  const [copyOpen,setCopyOpen]=useState(false);
  const [fmtMenu,setFmtMenu]=useState(false);
  const [panelMenu,setPanelMenu]=useState(false);
  const [addAuto,setAddAuto]=useState(true);
  const [openPlatform,setOpenPlatform]=useState("LinkedIn");
  const [view,setView]=useState({x:60,y:120,k:1});
  const [zoomMenu,setZoomMenu]=useState(false);
  const [historyOpen,setHistoryOpen]=useState(false);
  const [historyLog,setHistoryLog]=useState([]);
  const instanceCounter=useRef(0);
  const history=useRef({past:[],future:[]});
  const [,renderHistory]=useState(0);
  const snapshot=()=>({formats,content,hasFine,ov,unrev,approved,fmtAdapted,fmtSubAdapted,fmtCtaAdapted});
  const checkpoint=(label="Change")=>{history.current.past.push(snapshot());history.current.future=[];setHistoryLog(l=>[...l,{label,time:new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}].slice(-20));renderHistory(v=>v+1);};
  const loadSnapshot=s=>{setFormats(s.formats);setContent(s.content);setHasFine(s.hasFine);setOv(s.ov);setUnrev(s.unrev);setApproved(s.approved||{});setFmtAdapted(s.fmtAdapted);setFmtSubAdapted(s.fmtSubAdapted||{});setFmtCtaAdapted(s.fmtCtaAdapted||{});setSel(null);setSubset([]);setAdapted(false);setFocus(null);setPin(false);};
  const undo=()=>{const h=history.current;if(!h.past.length)return;h.future.push(snapshot());loadSnapshot(h.past.pop());renderHistory(v=>v+1);};
  const redo=()=>{const h=history.current;if(!h.future.length)return;h.past.push(snapshot());loadSnapshot(h.future.pop());renderHistory(v=>v+1);};

  const {placed,bands,totalW,maxH}=useMemo(()=>build(formats),[formats]);
  const wrap=useRef(null), drag=useRef(null), moved=useRef(false);

  const els=useMemo(()=>["logo","headline","subhead","cta"].concat(hasFine?["fineprint"]:[]),[hasFine]);
  const valIn=useCallback((el,fid)=>(ov[el]&&ov[el][fid]!==undefined?ov[el][fid]:content[el]),[ov,content]);
  const carries=useCallback((f,el)=> el==="cta"?!f.noCta : el==="fineprint"?FAM[f.fam].fine : true,[]);
  const overflows=useCallback((el,f)=>{
    if(el==="cta"){
      if(!carries(f,el))return false;
      const scale=fmtCtaAdapted[f.id]||1, pad=f.dw*FAM[f.fam].pad/100;
      return textW(valIn(el,f.id),f.dw*.042*scale)+pad*2 > f.dw*(1-2*FAM[f.fam].pad/100);
    }
    if(el==="subhead"){
      const F=FAM[f.fam], W=f.dw, px=W*.042*(fmtSubAdapted[f.id]||1), avail=W*(1-2*F.pad/100);
      return !headlineFits(valIn(el,f.id),px,avail,Math.max(2,F.lines));
    }
    if(el!=="headline") return false;
    const F=FAM[f.fam], W=f.dw;
    const px=W*F.head*(fmtAdapted[f.id]||1);
    const avail=W*(1-2*F.pad/100);
    return !headlineFits(valIn(el,f.id),px,avail,F.lines);
  },[valIn,fmtAdapted,fmtSubAdapted,fmtCtaAdapted,carries]);
  const elementScale=(el,f)=>el==="cta"?(fmtCtaAdapted[f.id]||1):(fmtAdapted[f.id]||1);

  /* Hover shows a spotlight while the pointer is there. A click keeps it until
     the user says otherwise. Previously the leave handler undid the click. */
  const preview=ids=>{ if(!pin) setFocus(ids); };
  const endPreview=()=>{ if(!pin) setFocus(null); };
  const togglePin=ids=>{
    if(pin){ setPin(false); setFocus(null); }
    else   { setPin(true);  setFocus(ids);  }
  };
  const clearSpot=()=>{ setPin(false); setFocus(null); };

  const pick=(el,fid,shift)=>{
    setDemo(false); setPin(false);
    if(shift&&sel===el){setSubset(s=>s.includes(fid)?s.filter(i=>i!==fid):s.concat(fid));return;}
    setSel(el);setAnchor(fid);setSubset(ov[el]?.[fid]!==undefined?[fid]:[]);setAdapted(false);setFocus(null);setAudit(false);setFmtMenu(false);
  };
  const runWalkthrough=()=>{
    clearTimeout(walkTimer.current);
    setDemo(true);setSel(null);setSubset([]);setPin(false);setFocus(null);setAudit(false);setFmtMenu(false);setPanelMenu(false);setZoomMenu(false);
    setNotice("Select any element to edit across formats");
    walkTimer.current=setTimeout(()=>{
      setDemo(false);setSel("headline");setAnchor(placed[0]?.id||null);setSubset([]);setFocus(null);
      setNotice("Headline selected · shared across formats");
      walkTimer.current=setTimeout(()=>setNotice("Edit once · formats update together"),1800);
    },1400);
  };
  const scope=subset.length?placed.filter(f=>subset.includes(f.id)):placed;
  const targets=sel?scope.filter(f=>carries(f,sel)&&(subset.length||ov[sel]?.[f.id]===undefined)):[];
  const absent=sel?placed.filter(f=>!carries(f,sel)):[];
  const selReviewIds=sel?placed.filter(f=>carries(f,sel)&&unrev[`${f.id}:${sel}`]).map(f=>f.id):[];
  const broken=sel?targets.filter(f=>overflows(sel,f)):[];
  const divIn=sel&&ov[sel]?Object.keys(ov[sel]):[];

  /* one number, everywhere: how much is waiting on a human */
  const reviewCount=useMemo(()=>Object.keys(unrev).length,[unrev]);
  const layoutIssueIds=useMemo(()=>placed.filter(f=>overflows("headline",f)).map(f=>f.id),[placed,overflows]);
  const layoutIssueCount=layoutIssueIds.length;
  const pendingCount=reviewCount+layoutIssueCount;
  useEffect(()=>{
    if(pendingCount>0&&previousPending.current===0){
      setStateHint(pendingCount===1?"1 format needs attention":`${pendingCount} formats need attention`);
    }
    previousPending.current=pendingCount;
  },[pendingCount]);

  const edit=v=>{
    if(!v.trim()){
      setNotice("Add some copy before applying the change");clearTimeout(noticeTimer.current);noticeTimer.current=setTimeout(()=>setNotice(null),2200);return;
    }
    checkpoint();
    setApproved({});
    setAdapted(false);
    setFmtAdapted({});setFmtSubAdapted({});setFmtCtaAdapted({});
    setTyping(true);
    clearTimeout(typingTimer.current);
    typingTimer.current=setTimeout(()=>setTyping(false),650);
    if(subset.length) setOv(o=>{const c={...(o[sel]||{})};subset.forEach(i=>{c[i]=v;});return{...o,[sel]:c};});
    else setContent(c=>({...c,[sel]:v}));
  };
  const diverge=fid=>{checkpoint();setOv(o=>({...o,[sel]:{...(o[sel]||{}),[fid]:valIn(sel,fid)}}));setSubset([fid]);};
  const restore=()=>{checkpoint();setOv(o=>{const n={...o};delete n[sel];return n;});setSubset([]);};
  const adapt=()=>{
    checkpoint();
    const ids=broken.map(f=>f.id);
    setAdapted(true);setAdaptedCount(ids.length);setAdaptedIds(ids);
    showFormats(ids);
    if(sel==="cta") setFmtCtaAdapted(m=>{const n={...m};broken.forEach(f=>{const F=FAM[f.fam],pad=f.dw*F.pad/100;const raw=textW(valIn("cta",f.id),f.dw*.042);n[f.id]=Math.max(.5,Math.min(1,((f.dw*(1-2*F.pad/100)-pad*2)/raw)*.82));});return n;});
    else if(sel==="subhead") setFmtSubAdapted(m=>{const n={...m};broken.forEach(f=>{const F=FAM[f.fam],raw=textW(valIn("subhead",f.id),f.dw*.042),cap=f.dw*(1-2*F.pad/100);n[f.id]=Math.max(.5,Math.min(1,(cap/raw)*.9));});return n;});
    else setFmtAdapted(m=>{const n={...m};broken.forEach(f=>{n[f.id]=headlineScale(valIn("headline",f.id),f);});return n;});
    setUnrev(u=>{const n={...u};broken.forEach(f=>{n[`${f.id}:${sel}`]=true;});return n;});};
  /* the per-format retry that ships today, two steps deep — surfaced on the row */
  const retryFormat=fid=>{
    const f=placed.find(p=>p.id===fid); if(!f)return;
    checkpoint();
    const F=FAM[f.fam],natural=textW(valIn("headline",f.id),f.dw*F.head);
    const capacity=f.dw*(1-2*F.pad/100)*F.lines;
    if(sel==="cta") setFmtCtaAdapted(m=>({...m,[fid]:.78}));
    else setFmtAdapted(m=>({...m,[fid]:headlineScale(valIn("headline",fid),f)}));
    setUnrev(u=>({...u,[`${fid}:headline`]:true}));
    pick("headline",fid,false);goTo(f);
  };
  const retryAll=()=>{
    checkpoint();
    const ids=placed.map(f=>f.id);
    setFmtAdapted(m=>{const n={...m};placed.forEach(f=>{
      const F=FAM[f.fam],natural=textW(valIn("headline",f.id),f.dw*F.head);
      const capacity=f.dw*(1-2*F.pad/100)*F.lines;
      n[f.id]=headlineScale(valIn("headline",f.id),f);
    });return n;});
    setUnrev(u=>{const n={...u};ids.forEach(fid=>{n[`${fid}:headline`]=true;});return n;});
    setPanelMenu(false);announce(ids);
  };
  const approveFormat=fid=>setUnrev(u=>{
    const n={...u}; Object.keys(n).forEach(k=>{ if(k.startsWith(fid+":")){const f=placed.find(p=>p.id===fid);if(f&&!overflows(k.split(":")[1],f))delete n[k];} }); return n;});
  const approveElement=el=>{
    setApproved(a=>{const n={...a};placed.forEach(f=>{if(unrev[`${f.id}:${el}`]&&!overflows(el,f))n[`${f.id}:${el}`]=true;});return n;});
    setUnrev(u=>{const n={...u}; Object.keys(n).forEach(k=>{ if(k.endsWith(":"+el)){const f=placed.find(p=>p.id===k.split(":")[0]);if(f&&!overflows(el,f))delete n[k];} }); return n;});
  };
  const confirmAdaptations=()=>{
    if(adaptedIds.some(fid=>{const f=placed.find(p=>p.id===fid);return f&&overflows(sel||"headline",f);}))return;
    checkpoint("Approve adaptations");
    setApproved(a=>{const n={...a};adaptedIds.forEach(fid=>{n[`${fid}:headline`]=true;});return n;});
    setUnrev(u=>{const n={...u};adaptedIds.forEach(fid=>delete n[`${fid}:headline`]);return n;});
    clearSpot();setAdapted(false);setSubset([]);
    setNotice(`${adaptedCount} adaptations approved`);
    clearTimeout(noticeTimer.current);noticeTimer.current=setTimeout(()=>setNotice(null),2200);
  };

  const addFine=()=>{
    checkpoint("Add fineprint");
    setHasFine(true);setContent(c=>({...c,fineprint:"Terms apply. See site for details."}));
    const touched=placed.filter(f=>FAM[f.fam].fine).map(f=>f.id);
    setUnrev(u=>{const n={...u};touched.forEach(id=>{n[`${id}:fineprint`]=true;});return n;});
    announce(touched);
    setSel("fineprint");setCopyOpen(false);
  };
  const addFormat=f=>{
    const templateId=f.templateId||f.id;
    const siblings=formats.filter(item=>(item.templateId||item.id)===templateId);
    const instanceNumber=Math.max(0,...siblings.map(item=>item.instanceNumber||1))+1;
    f={...f,id:`${templateId}-instance-${++instanceCounter.current}`,templateId,instanceNumber,
      name:instanceNumber>1?`${f.name} · ${instanceNumber}`:f.name};
    checkpoint(`Add ${f.platform} ${f.name}`);
    setFormats(l=>l.concat(f));
    setUnrev(u=>{const n={...u};els.filter(e=>carries(f,e)).forEach(e=>{n[`${f.id}:${e}`]=true;});return n;});
    if(addAuto){
      const s=Math.sqrt(AREA/(f.w*f.h)),dw=Math.round(f.w*s),F=FAM[f.fam];
      const natural=textW(content.headline,dw*F.head),capacity=dw*(1-2*F.pad/100)*F.lines;
      setFmtAdapted(m=>({...m,[f.id]:headlineScale(content.headline,{...f,dw})}));
    }
    announce([f.id]);
  };
  const removeFormat=fid=>{
    if(formats.length<=1)return;
    checkpoint();
    setFormats(l=>l.filter(f=>f.id!==fid));
    setUnrev(u=>{const n={...u};Object.keys(n).forEach(k=>{if(k.startsWith(fid+":"))delete n[k];});return n;});
    setFmtAdapted(m=>{const n={...m};delete n[fid];return n;});
    setFmtCtaAdapted(m=>{const n={...m};delete n[fid];return n;});
    setOv(o=>{const n={};Object.entries(o).forEach(([el,byFormat])=>{const c={...byFormat};delete c[fid];n[el]=c;});return n;});
    if(anchor===fid){setSel(null);setAnchor(null);} clearSpot();
  };
  const formatCatalog=useMemo(()=>BASE.concat(ADDABLE),[]);
  const platformOrder=["Facebook","Instagram","LinkedIn","Google","TikTok","X","YouTube","Pinterest","Snapchat"];

  /* Which formats sit in which state — so a number can become a destination. */
  const idsFor=useCallback((el,state)=>placed.filter(f=>{
    if(!carries(f,el))                                  return state==="na";
    if(unrev[`${f.id}:${el}`])                          return state==="ur";
    if(ov[el]&&ov[el][f.id]!==undefined)                return state==="d";
    return state==="linked";
  }).map(f=>f.id),[placed,ov,unrev,carries]);

  const rollup=useMemo(()=>els.map(el=>{
    let linked=0,d=0,ur=0,na=0;
    placed.forEach(f=>{
      if(!carries(f,el)){na++;return;}
      if(unrev[`${f.id}:${el}`])ur++;
      else if(ov[el]&&ov[el][f.id]!==undefined)d++; else linked++;
    });
    return{el,linked,d,ur,na};
  }),[els,placed,ov,unrev,carries]);

  const clean=rollup.filter(r=>!r.d&&!r.ur);
  const exceptions=rollup.filter(r=>r.d||r.ur);
  const totUnlinked=rollup.reduce((n,r)=>n+r.d,0);
  const allUnrevIds=useMemo(()=>[...new Set(Object.keys(unrev).map(k=>k.split(":")[0]))],[unrev]);

  const onWheel=e=>{
    e.preventDefault();
    if(!e.ctrlKey&&!e.metaKey){setView(v=>({...v,x:v.x-e.deltaX,y:v.y-e.deltaY}));return;}
    const r=wrap.current.getBoundingClientRect();
    const mx=e.clientX-r.left,my=e.clientY-r.top;
    setView(v=>{const k=Math.min(3,Math.max(.18,v.k*(e.deltaY<0?1.1:.9)));const t=k/v.k;
      return{k,x:mx-(mx-v.x)*t,y:my-(my-v.y)*t};});
  };
  /* The panel is a table of contents: clicking a row takes you to that placement
     instead of asking you to hunt for it across eighteen canvases. */
  const goTo=useCallback(f=>{
    const el=wrap.current; if(!el) return;
    const k=Math.min(2.2,Math.max(.5,Math.min((el.clientWidth-160)/f.dw,(el.clientHeight-180)/f.dh)));
    setView({k, x:(el.clientWidth/2)-(f.x+f.dw/2)*k, y:(el.clientHeight/2)-(f.y+f.dh/2)*k});
    setFocus([f.id]); setPin(true);
    setAudit(false);
  },[]);

  const showFormats=(ids,element=null)=>{
    const matches=placed.filter(f=>ids.includes(f.id)),el=wrap.current;
    if(!matches.length||!el)return;
    const left=Math.min(...matches.map(f=>f.x)),top=Math.min(...matches.map(f=>f.y));
    const width=Math.max(...matches.map(f=>f.x+f.dw))-left;
    const height=Math.max(...matches.map(f=>f.y+f.dh))-top;
    const k=Math.max(.05,Math.min(2,(el.clientWidth-60)/width,(el.clientHeight-80)/height));
    setView({k,x:(el.clientWidth-width*k)/2-left*k,y:(el.clientHeight-height*k)/2-top*k});
    setFocus(ids);setPin(true);setAudit(false);
    if(element){setSel(element);setAnchor(ids[0]);setSubset(ids.length===1&&ov[element]?.[ids[0]]!==undefined?ids:[]);setAdapted(false);}
  };

  const fit=useCallback(()=>{
    const el=wrap.current;if(!el)return;
    const k=Math.max(.05,Math.min((el.clientWidth-60)/totalW,(el.clientHeight-80)/maxH,1.4));
    setView({k,x:(el.clientWidth-totalW*k)/2,y:(el.clientHeight-maxH*k)/2+10});
  },[totalW,maxH]);
  useEffect(()=>{fit();},[fit]);
  useEffect(()=>{const el=wrap.current;if(!el)return;const observer=new ResizeObserver(fit);observer.observe(el);return()=>observer.disconnect();},[fit]);
  useEffect(()=>()=>{clearTimeout(typingTimer.current);clearTimeout(noticeTimer.current);clearTimeout(walkTimer.current);},[]);
  useEffect(()=>{
    const handle=e=>{
      if(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)return;
      if(e.key==="Escape"){setSel(null);setSubset([]);setFmtMenu(false);setZoomMenu(false);clearSpot();}
      if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="z"){e.preventDefault();e.shiftKey?redo():undo();}
    };
    window.addEventListener("keydown",handle);return()=>window.removeEventListener("keydown",handle);
  });
  const approveAll=()=>{
    checkpoint("Approve all reviewed changes");
    const count=reviewCount;
    setApproved(a=>{const n={...a};Object.keys(unrev).forEach(k=>{n[k]=true;});return n;});
    setUnrev({});setAdapted(false);setAdaptedIds([]);setSel(null);setSubset([]);clearSpot();
    setNotice(`${count} changes approved`);clearTimeout(noticeTimer.current);noticeTimer.current=setTimeout(()=>setNotice(null),2200);
  };

  // The canvas stays quiet until the user selects an element.

  /* real order, straight from the component library */

  const spotlight = focus ?? (subset.length?subset:null);

  return (
    <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",background:"#fff",
      color:"#191915",overflow:"hidden",fontFamily:FONT}}>
      <style>{`
        @media (max-width: 900px) {
          .native-header { gap: 8px !important; }
          .creative-area { width: 58px !important; flex-shrink: 0 !important; }
          .creative-name-copy { display: none !important; }
          .toolbar-save { display: none !important; }
          .work-status-copy { display: none !important; }
        }
      `}</style>

      {/* ---------------- top bar ---------------- */}
      <div className="native-header" style={{height:TOP,flexShrink:0,display:"flex",alignItems:"center",gap:12,padding:"0 12px 0 8px",
        borderBottom:"1px solid #ececea",zIndex:30}}>
        <div className="creative-area" style={{width:"clamp(220px,22vw,310px)",flexShrink:1,display:"flex",alignItems:"center",gap:8,minWidth:0}}>
          <button title="Close editor" style={{...bare,width:32,height:32,padding:4,display:"flex",alignItems:"center",
            justifyContent:"center",color:"#5d5a54"}}>{IcClose}</button>
          <span aria-hidden="true" style={{width:20,height:26,border:"1.5px solid #7b4cff",borderRadius:3,
            color:"#7b4cff",fontSize:8,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>Ad</span>
          <div className="creative-name-copy" style={{minWidth:0}}>
            <div style={{fontSize:13,fontWeight:600,lineHeight:1.2,whiteSpace:"nowrap",overflow:"hidden",
              textOverflow:"ellipsis"}}>Mirror-Shine Hair · Q3</div>
            <div style={{fontSize:10.5,color:"#93908a",lineHeight:1.2}}>Ad</div>
          </div>
        </div>
        <div style={{display:"flex",gap:2,color:"#191915",alignItems:"center"}}>
          <button title="Undo" onClick={undo} disabled={!history.current.past.length} style={{...bare,opacity:history.current.past.length?1:.35,width:32,height:32,display:"grid",placeItems:"center"}}>{IcUndo}</button>
          <button title="Redo" onClick={redo} disabled={!history.current.future.length} style={{...bare,opacity:history.current.future.length?1:.35,width:32,height:32,display:"grid",placeItems:"center"}}>{IcRedo}</button>
        </div>
        <span style={{height:20,width:1,background:"#ececea",display:"block",margin:"0 2px"}}/>
        <div style={{position:"relative"}}>
          <button onClick={()=>setZoomMenu(v=>!v)} title="Zoom" style={{...bare,display:"flex",alignItems:"center",gap:3,whiteSpace:"nowrap"}}>{Math.round(view.k*100)}% {IcChevD}</button>
          {zoomMenu&&<div style={{position:"absolute",top:32,left:0,background:"#fff",padding:5,border:"1px solid #e6e3dd",borderRadius:8,minWidth:135}}>
            <button onClick={()=>{fit();clearSpot();setZoomMenu(false);}} style={{...ghost,width:"100%"}}>Fit all formats</button>
            {[.25,.5,1,1.5,2].map(k=><button key={k} onClick={()=>{const el=wrap.current;if(el)setView(v=>({k,x:el.clientWidth/2-(el.clientWidth/2-v.x)*k/v.k,y:el.clientHeight/2-(el.clientHeight/2-v.y)*k/v.k}));setZoomMenu(false);}} style={{...bare,display:"block",width:"100%",textAlign:"left",padding:8}}>{k*100}%</button>)}
          </div>}
        </div>
        <div style={{flex:1}}/>
        <button onClick={runWalkthrough} title="Play walkthrough" style={{...ghost,fontSize:11.5,padding:"6px 9px",whiteSpace:"nowrap"}}>Play walkthrough</button>
        <div style={{display:"flex",background:"#f4f3f0",borderRadius:8,padding:2}}>
          <div style={{...seg,background:"#fff",boxShadow:"0 1px 2px rgba(0,0,0,.08)",display:"flex",alignItems:"center",gap:6}}>
            <NavIcon ico={RIGHT_NAV[1]} size={16}/>Design</div>
          <div style={{...seg,color:"#707070",display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:15,lineHeight:1}}>▦</span>Feeds</div>
        </div>
        <div style={{flex:1}}/>
        <div style={{height:32,border:"1px solid #9abff7",background:"#eef5ff",color:"#3973bf",borderRadius:8,
          padding:"0 10px",display:"flex",alignItems:"center",gap:6,fontSize:12.5,whiteSpace:"nowrap"}}>
          <span style={{width:7,height:7,borderRadius:10,background:"#4b8df8"}}/>
          <span className="work-status-copy">Work in progress</span>
        </div>
        <button disabled title="Tags — outside this prototype" style={{...bare,opacity:.45,width:34,height:34,display:"grid",placeItems:"center"}}>{IcTag}</button>
        <button title="Change history" onClick={()=>setHistoryOpen(v=>!v)} style={{...bare,opacity:1,width:34,height:34,display:"grid",placeItems:"center"}}>{IcHist}</button>
        <button disabled title="More — outside this prototype" style={{...bare,opacity:.45,width:34,height:34,display:"grid",placeItems:"center"}}>{IcMore}</button>
        <button disabled title="Saving — outside this prototype" className="toolbar-save" style={{...bare,color:"#b3b0a9"}}>Save</button>
        <button disabled title="Export — outside this prototype" style={{border:"none",background:"#0C0B02",opacity:.45,color:"#fff",borderRadius:8,padding:"7px 15px",
          fontSize:12.5,fontWeight:600,cursor:"pointer"}}>Export</button>
      </div>

      {historyOpen&&(
        <div style={{position:"absolute",top:56,right:76,width:290,maxHeight:360,overflowY:"auto",background:"#fff",
          border:"1px solid #e6e3dd",borderRadius:10,boxShadow:"0 10px 30px rgba(0,0,0,.14)",zIndex:60,padding:12}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <div style={{fontWeight:700,fontSize:14}}>Change history</div>
            <button onClick={()=>setHistoryOpen(false)} style={{...bare,padding:3}}>{IcClose}</button>
          </div>
          {historyLog.length===0?<div style={{fontSize:12,color:"#93908a",padding:"10px 0"}}>No changes yet.</div>:
            [...historyLog].reverse().map((entry,i)=><div key={`${entry.time}-${i}`} style={{padding:"9px 0",borderTop:"1px solid #f0eee9",fontSize:12}}>
              <div style={{display:"flex",justifyContent:"space-between",gap:8}}><span>{entry.label}</span><span style={{color:"#93908a",fontSize:10}}>{entry.time}</span></div>
              {i===0&&<button onClick={()=>{undo();setHistoryOpen(false);}} style={{...ghost,fontSize:11,padding:"3px 8px",marginTop:6}}>Undo this change</button>}
            </div>)}
        </div>
      )}

      <div style={{flex:1,display:"flex",minHeight:0}}>
        {/* ---------------- left rail ---------------- */}
        <div style={{width:RAIL,flexShrink:0,borderRight:"1px solid #ececea",display:"flex",
          flexDirection:"column",alignItems:"center",paddingTop:10,gap:4,zIndex:20}}>
          {LEFT_NAV.map((ico,i)=>{
            const isT=ico.n==="Text", on=isT&&copyOpen;
            return (
              <div key={ico.n} title={ico.n} onClick={()=>{if(isT)setCopyOpen(o=>!o);}}
                style={{width:46,height:40,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",
                  color:on?"#6a4fe8":"#4a4840",background:on?"#f2eefe":"transparent",
                  cursor:isT?"pointer":"default"}}>
                <NavIcon ico={ico}/>
              </div>
            );
          })}
        </div>

        {copyOpen&&(
          <div style={{width:230,flexShrink:0,borderRight:"1px solid #ececea",padding:"16px 14px",zIndex:19}}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:12}}>Copy</div>
            <div style={{display:"flex",gap:16,borderBottom:"1px solid #ececea",marginBottom:12,fontSize:12.5}}>
              <div style={{paddingBottom:7,borderBottom:"2px solid #191915",fontWeight:600}}>Scene copy</div>
              <div style={{paddingBottom:7,color:"#93908a"}}>Caption copy</div>
            </div>
            {["Add Headline","Add Sub Headline","Add Body Copy","Add Benefits","Add Labels","Add Fineprint","Add Offer","Add CTA"].map(l=>{
              const active=l==="Add Fineprint"&&!hasFine;
              return <div key={l} onClick={()=>{if(active)addFine();}}
                style={{border:`1px solid ${active?"#6a4fe8":"#e6e3dd"}`,borderRadius:8,padding:"9px 0",
                  textAlign:"center",fontSize:12.5,fontWeight:600,marginBottom:8,cursor:active?"pointer":"default",
                  background:active?"#f7f5ff":"#fff",color:l==="Add Fineprint"&&hasFine?"#b3b0a9":"#191915"}}>{l}</div>;
            })}
          </div>
        )}

        {/* ---------------- canvas ---------------- */}
        <div ref={wrap} onWheel={onWheel}
          onMouseDown={e=>{moved.current=false;drag.current={sx:e.clientX,sy:e.clientY,ox:view.x,oy:view.y};}}
          onMouseMove={e=>{const d=drag.current;if(d){if(Math.hypot(e.clientX-d.sx,e.clientY-d.sy)>4)moved.current=true;setView(v=>({...v,x:d.ox+e.clientX-d.sx,y:d.oy+e.clientY-d.sy}));}}}
          onMouseUp={()=>{drag.current=null;}} onMouseLeave={()=>{drag.current=null;}}
          onClick={()=>{if(moved.current)return;setSel(null);setSubset([]);setFmtMenu(false);setPanelMenu(false);setZoomMenu(false);clearSpot();}}
          onDoubleClick={fit}
          style={{flex:1,position:"relative",overflow:"hidden",cursor:"grab",background:"#f7f6f4"}}>

          <div style={{position:"absolute",transformOrigin:"0 0",transform:`translate(${view.x}px,${view.y}px) scale(${view.k})`}}>
            {bands.map(b=>(
              <div key={b.fam} style={{position:"absolute",left:b.x,top:b.y-30,fontSize:10,
                fontVariantNumeric:"tabular-nums",color:"#a5a29b",letterSpacing:".1em"}}>{FAM[b.fam].label}</div>
            ))}
            {placed.map(f=>{
              const isAbs=sel&&!carries(f,sel);
              /* Selecting an element is what licenses showing its state everywhere.
                 Nothing is painted until the user asks about that element. */
              const elState = (!sel||isAbs) ? null
                : (ov[sel]&&ov[sel][f.id]!==undefined) ? "unlinked"
                : unrev[`${f.id}:${sel}`]              ? "review"
                : approved[`${f.id}:${sel}`]            ? "approved"
                : "linked";
              const isBrk=sel&&!isAbs&&overflows(sel,f);
              const isDiv=sel&&ov[sel]&&ov[sel][f.id]!==undefined;
              const hasUnrev=!!(sel&&unrev[`${f.id}:${sel}`]);
              const hasApproved=!!(sel&&approved[`${f.id}:${sel}`]);
              const hasAdaptedPending=!!(sel&&adapted&&adaptedIds.includes(f.id));
              const hasLayoutIssue=els.some(el=>overflows(el,f));
              const dim=spotlight&&!spotlight.includes(f.id);
              return (
                <div key={f.id} style={{position:"absolute",left:f.x,top:f.y,
                  opacity:dim?.3:(isAbs?.42:1),transition:"opacity .16s"}}>
                  <div style={{position:"absolute",top:-15,left:0,fontSize:8.5,color:"#8a877f",
                    whiteSpace:"nowrap",fontVariantNumeric:"tabular-nums"}}>{f.platform} · {f.name}</div>

                  <Ad fmt={f} els={els} valIn={valIn} carries={carries} sel={sel} isAbs={isAbs}
                    isBrk={isBrk} isDiv={isDiv} adapted={fmtAdapted[f.id]||1} subAdapted={fmtSubAdapted[f.id]||1} ctaAdapted={fmtCtaAdapted[f.id]||1}
                    elState={elState} isAnchor={f.id===anchor}
                    demoRing={demo&&!sel?"headline":null}
                    showRing={true}
                    onPick={(el,e)=>{e.stopPropagation();if(!moved.current)pick(el,f.id,e.shiftKey);}}/>

                  {/* tier 2 — ambient. a dot. no text, ever. */}
                  {(hasUnrev||hasLayoutIssue||hasApproved||hasAdaptedPending)&&(
                    <button aria-label={hasApproved&&!hasUnrev&&!hasLayoutIssue?"Approved":hasAdaptedPending?"Adaptation pending":"Review this format"}
                      onMouseDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();if(hasApproved&&!hasUnrev&&!hasLayoutIssue){pick(els.find(el=>approved[`${f.id}:${el}`])||"headline",f.id,false);}else showFormats([f.id],hasLayoutIssue?(els.find(el=>overflows(el,f))||"headline"):sel);}}
                      title={hasApproved&&!hasUnrev&&!hasLayoutIssue?"Approved":hasAdaptedPending?"Adaptation pending":hasLayoutIssue?"Text needs attention":"Review this format"}
                      style={{position:"absolute",top:f.dh+7,left:2,width:9,height:9,border:0,borderRadius:99,
                        background:hasApproved&&!hasUnrev&&!hasLayoutIssue?"#41a66a":hasAdaptedPending?"#7c5cff":hasLayoutIssue?C.warn:REV.bg,cursor:"pointer",padding:0,boxShadow:"0 0 0 2px rgba(255,255,255,.82)"}}/>
                  )}
                </div>
              );
            })}
          </div>

          {demo&&(
            <div style={{position:"absolute",left:"50%",bottom:20,transform:"translateX(-50%)",
              background:"#0C0B02",color:"#fff",fontSize:12.5,padding:"9px 16px",borderRadius:100,
              opacity:.93,pointerEvents:"none",display:"flex",alignItems:"center",gap:8}}>
              <span style={{width:6,height:6,borderRadius:9,background:"#7C5CFC"}}/>
              One headline · {formats.length} formats
            </div>
          )}

          {notice&&(
            <div style={{position:"absolute",left:"50%",bottom:20,transform:"translateX(-50%)",
              background:"#0C0B02",color:"#fff",fontSize:12.5,padding:"9px 16px",borderRadius:100,
              opacity:.96,pointerEvents:"none",display:"flex",alignItems:"center",gap:8}}>
              <span style={{width:6,height:6,borderRadius:9,background:"#64c78e"}}/>{notice}
            </div>
          )}

          {!sel&&!demo&&!notice&&(
            <button onClick={()=>pick("headline",placed[0]?.id,false)} style={{position:"absolute",left:"50%",bottom:20,transform:"translateX(-50%)",
              background:"#fff",color:"#4a4840",fontSize:12.5,padding:"9px 14px",borderRadius:9,border:"1px solid #dedbd4",
              boxShadow:"0 3px 12px rgba(20,18,10,.08)",cursor:"pointer",zIndex:7}}>Select any element to edit across formats</button>
          )}

        </div>

        {/* ---------------- right panel ---------------- */}
        <div style={{width:PANEL,flexShrink:0,borderLeft:"1px solid #ececea",overflowY:"auto",zIndex:20}}
          onClick={e=>e.stopPropagation()}>
          {fmtMenu?(
            <>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 15px",
                borderBottom:"1px solid #f2f0eb"}}>
                <div style={{fontWeight:700,fontSize:15}}>Add formats</div>
                <button title="Close add formats" onClick={()=>setFmtMenu(false)}
                  style={{...ghost,padding:"4px 7px",display:"flex",alignItems:"center"}}>{IcClose}</button>
              </div>
              <div style={{padding:"12px 15px",borderBottom:"1px solid #f2f0eb"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,fontSize:13,fontWeight:600}}>
                    AI Auto-Resize <AiIcon size={14}/>
                  </div>
                  <button role="switch" aria-checked={addAuto} onClick={()=>setAddAuto(v=>!v)}
                    style={{width:34,height:19,border:"none",borderRadius:100,padding:0,
                      background:addAuto?"#0C0B02":"#dcd9d2",position:"relative",cursor:"pointer"}}>
                    <span style={{position:"absolute",top:2,left:addAuto?17:2,width:15,height:15,
                      borderRadius:100,background:"#fff",transition:"left .15s"}}/>
                  </button>
                </div>
                <div style={{fontSize:11,color:"#93908a",marginTop:5,lineHeight:1.4}}>
                  AI Adjusts your design to fit the formats you choose.
                </div>
              </div>
              <div style={{padding:"6px 0"}}>
                {platformOrder.map(platform=>{
                  const items=formatCatalog.filter(f=>f.platform===platform);
                  const open=openPlatform===platform;
                  const label=platform==="Google"?"Google Ads":platform;
                  return (
                    <div key={platform}>
                      <button onClick={()=>setOpenPlatform(open?null:platform)}
                        style={{width:"100%",border:"none",background:"transparent",padding:"8px 15px",
                          display:"flex",alignItems:"center",gap:7,cursor:"pointer",fontFamily:"inherit",
                          fontSize:12.5,color:"#191915",textAlign:"left"}}>
                        <span style={{display:"flex",transform:open?"rotate(180deg)":"rotate(-90deg)",
                          transition:"transform .15s",color:"#6b6960"}}>{IcChevD}</span>
                        <span style={{fontWeight:600}}>{label}</span>
                        {items.length>0&&<span style={{marginLeft:"auto",fontSize:10.5,color:"#a5a29b"}}>
                          {formats.filter(f=>f.platform===platform).length} added
                        </span>}
                      </button>
                      {open&&items.map(f=>{
                        const instances=formats.filter(x=>(x.templateId||x.id)===f.id);
                        return (
                          <div key={f.id} style={{padding:"7px 15px 7px 34px",background:instances.length?"#faf9f7":"transparent"}}>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <span style={{minWidth:0,flex:1}}>
                              <span style={{display:"block",fontSize:12,color:"#191915"}}>{f.name}</span>
                              <span style={{display:"block",fontSize:10.5,color:"#93908a",marginTop:2}}>
                                {f.w} × {f.h} px · {FAM[f.fam].label}
                              </span>
                            </span>
                            <button aria-label={`Add ${f.platform} ${f.name}`} onClick={()=>addFormat(f)} style={{...ghost,padding:"4px 9px",display:"flex",fontSize:11.5}}>Add</button>
                            </div>
                            {instances.map(instance=><div key={instance.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6,marginTop:5,fontSize:10.5,color:"#77746d"}}>
                              <span>{instances.length>1?`Instance ${instance.instanceNumber||1}`:"Added"}</span>
                              <button aria-label={`Remove ${f.platform} ${instance.name}`} disabled={formats.length<=1} onClick={()=>removeFormat(instance.id)} style={{...bare,fontSize:10.5,padding:3}}>Remove</button>
                            </div>)}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </>
          ):!sel?(
            <>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 15px",
                borderBottom:"1px solid #f2f0eb",position:"relative"}}>
                <div style={{fontWeight:700,fontSize:15}}>Formats</div>
                <div style={{display:"flex",gap:5}}>
                  <button title="More format actions" onClick={()=>{setPanelMenu(m=>!m);setFmtMenu(false);}}
                    style={{width:29,height:29,borderRadius:8,border:"1px solid #e6e3dd",background:"#fff",
                      cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#6b6960"}}>
                    {IcMore}
                  </button>
                  <button title="Add formats" onClick={()=>{setFmtMenu(true);setPanelMenu(false);}} style={{width:29,height:29,borderRadius:8,
                    border:"1px solid #e6e3dd",background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",
                    justifyContent:"center",color:"#191915"}}>{IcPlus}</button>
                </div>
                {panelMenu&&(
                  <div style={{position:"absolute",top:46,right:46,background:"#fff",border:"1px solid #e6e3dd",
                    borderRadius:10,boxShadow:"0 6px 20px rgba(0,0,0,.12)",padding:5,minWidth:218,zIndex:40}}>
                    <button onClick={retryAll} style={{width:"100%",border:"none",background:"transparent",padding:"8px 9px",
                      borderRadius:6,cursor:"pointer",textAlign:"left",fontFamily:"inherit",color:"#191915"}}>
                      <span style={{display:"flex",alignItems:"center",gap:7,fontSize:12.5,fontWeight:600}}>
                        <AiIcon size={14}/> Retry AI Auto-Resize for all
                      </span>
                      <span style={{display:"block",fontSize:10.5,color:"#93908a",lineHeight:1.35,marginTop:3,paddingLeft:21}}>
                        Recalculate every format, then review the results.
                      </span>
                    </button>
                  </div>
                )}
              </div>
              {/* The button answers the question, so most of the time it need not be opened. */}
              <div onClick={()=>setAudit(a=>!a)} style={{padding:"11px 15px",
                borderBottom:audit?"none":"1px solid #f2f0eb",cursor:"pointer",
                background:audit?"#faf9f7":(pulse?REV.bg:"transparent"),
                boxShadow:pulse?`inset 3px 0 0 ${REV.dot}`:"none",
                transition:"background .45s ease, box-shadow .45s ease"}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <span style={{width:7,height:7,borderRadius:9,flexShrink:0,
                    background:(reviewCount||layoutIssueCount)?C.unrev:(totUnlinked?C.unlinked:C.linked)}}/>
                  <div style={{fontSize:13.5,fontWeight:600}}>Consistency</div>
                  <span style={{marginLeft:"auto",color:"#93908a",display:"flex",
                    transform:audit?"rotate(180deg)":"none",transition:"transform .15s"}}>{IcChevD}</span>
                </div>
                <div style={{fontSize:11.5,color:"#93908a",marginTop:3,fontVariantNumeric:"tabular-nums"}}>
                  {reviewCount||totUnlinked||layoutIssueCount
                    ? [totUnlinked?`${totUnlinked} unlinked`:null,reviewCount?`${reviewCount} changes to review`:null,
                        layoutIssueCount?`${layoutIssueCount} need attention`:null]
                        .filter(Boolean).join(" \u00b7 ")
                    : `all linked \u00b7 ${placed.length} formats`}
                </div>
              </div>

              {audit&&(
                <div style={{borderBottom:"1px solid #f2f0eb",padding:"4px 15px 13px",background:"#faf9f7"}}>

                  {layoutIssueCount>0&&(
                    <button onClick={()=>showFormats(layoutIssueIds,"headline")}
                      style={{...ghost,width:"100%",margin:"7px 0 4px",fontSize:11.5,borderColor:REV.line,
                        background:REV.bg,color:REV.fg}}>
                      Show {layoutIssueCount} layout {layoutIssueCount===1?"issue":"issues"} on canvas
                    </button>
                  )}


                  {/* Everything settled collapses to one line. The view shortens as work lands. */}
                  {clean.length>0&&(
                    <div style={{display:"flex",gap:7,alignItems:"flex-start",padding:"9px 0",
                      borderTop:"1px solid #efece6"}}>
                      <span style={{width:7,height:7,borderRadius:9,background:C.linked,marginTop:4,flexShrink:0}}/>
                      <div style={{fontSize:11.5,color:"#6b6960",lineHeight:1.45}}>
                        {clean.map(r=><div key={r.el}>{LABEL[r.el]} · {r.linked} linked{r.na>0?` · ${r.na} excluded`:""}</div>)}
                      </div>
                    </div>
                  )}

                  {/* Only what needs a decision earns a row of its own. */}
                  {exceptions.map(r=>{
                    const chip=(n,state,color,label)=>n>0&&(
                      <button
                        onMouseEnter={()=>preview(idsFor(r.el,state))}
                        onMouseLeave={endPreview}
                        onClick={()=>showFormats(idsFor(r.el,state),r.el)}
                        style={{border:"none",background:"transparent",padding:0,cursor:"pointer",
                          fontVariantNumeric:"tabular-nums",fontSize:10.5,color,
                          textDecoration:"underline",textUnderlineOffset:2}}>
                        {n} {label}
                      </button>
                    );
                    return (
                      <div key={r.el} style={{padding:"9px 0",borderTop:"1px solid #efece6"}}>
                        <div style={{display:"flex",alignItems:"center",gap:7}}>
                          <div style={{fontSize:12.5,fontWeight:600}}>{LABEL[r.el]}</div>
                          {r.ur>0&&(
                            <button onClick={()=>showFormats(idsFor(r.el,"ur"),r.el)}
                              style={{marginLeft:"auto",border:`1px solid ${REV.line}`,background:REV.bg,
                                color:REV.fg,borderRadius:100,padding:"2px 8px",fontSize:10,
                                cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>Review {r.ur}</button>
                          )}
                        </div>
                        <div style={{display:"flex",height:5,borderRadius:4,overflow:"hidden",
                          background:"#eeebe5",margin:"6px 0 5px"}}>
                          {r.linked>0&&<div title={`${r.linked} linked`} style={{flex:r.linked,background:C.linked}}/>}
                          {r.ur>0&&<div title={`${r.ur} waiting on a human`} style={{flex:r.ur,background:C.unrev}}/>}
                          {r.d>0&&<div title={`${r.d} deliberately unlinked`} style={{flex:r.d,background:C.unlinked}}/>}
                          {r.na>0&&<div title={`${r.na} not present in this format`} style={{flex:r.na,background:C.na}}/>}
                        </div>
                        <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
                          <span style={{fontVariantNumeric:"tabular-nums",fontSize:10.5,color:"#6b6960"}}>
                            {r.linked} linked
                          </span>
                          {chip(r.ur,"ur",C.unrev,"to review")}
                          {chip(r.d,"d",C.unlinked,"unlinked")}
                          {r.na>0&&<span style={{fontVariantNumeric:"tabular-nums",fontSize:10.5,
                            color:"#a5a29b"}}>{r.na} n/a</span>}
                        </div>
                      </div>
                    );
                  })}

                  {/* Review the set, then resolve it as one coherent change. */}
                  {reviewCount>0&&(
                    <div style={{display:"flex",gap:7,marginTop:11}}>
                      <button onClick={()=>showFormats(allUnrevIds)} style={{...ghost,flex:1,fontSize:12}}>
                        Review {allUnrevIds.length}
                      </button>
                      <button onClick={approveAll} style={{...primary,flex:1,fontSize:12,padding:"5px 8px"}}>
                        Approve all {reviewCount}
                      </button>
                    </div>
                  )}
                </div>
              )}
              <div style={{padding:"6px 0"}}>
                {placed.map(f=>{
                  const n=els.filter(e=>unrev[`${f.id}:${e}`]).length;
                  return (
                    <div key={f.id} onClick={()=>goTo(f)} title={`Go to ${f.platform} ${f.name}`}
                      onMouseEnter={e=>{e.currentTarget.style.background="#f7f6f4";}}
                      onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}
                      style={{display:"flex",alignItems:"center",gap:10,padding:"8px 15px",
                        cursor:"pointer",transition:"background .12s",
                        boxShadow:focus&&focus.length===1&&focus[0]===f.id?`inset 3px 0 0 ${C.unlinked}`:"none"}}>
                      <Thumb f={f} els={els} valIn={valIn} carries={carries} adapted={fmtAdapted[f.id]||1} flagged={n>0}/>
                      <div style={{minWidth:0,flex:1}}>
                        <div style={{fontSize:11.5,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                          {f.platform} {f.name}</div>
                        <div style={{fontSize:10,color:"#93908a",fontVariantNumeric:"tabular-nums"}}>
                          {f.w}×{f.h} · {FAM[f.fam].label}</div>
                      </div>
                      <button onClick={e=>{e.stopPropagation();retryFormat(f.id);}} title="Retry AI Auto-Resize for this format"
                        style={{border:"1px solid #e6e3dd",background:"#fff",color:"#191915",
                          borderRadius:100,width:24,height:24,cursor:"pointer",display:"flex",
                          alignItems:"center",justifyContent:"center",flexShrink:0,padding:0}}>
                        {IcSparkle}
                      </button>
                      {n>0&&(
                        <button onClick={e=>{e.stopPropagation();showFormats([f.id],els.find(el=>unrev[`${f.id}:${el}`]));}} title={`Review ${n} placement(s)`}
                          style={{border:`1px solid ${REV.line}`,background:REV.bg,color:REV.fg,
                            borderRadius:100,padding:"2px 8px",fontSize:10,cursor:"pointer",
                            fontFamily:"inherit",fontWeight:600,flexShrink:0}}>
                          Review
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ):(
            <>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 15px",borderBottom:"1px solid #f2f0eb"}}>
                <div style={{fontWeight:700,fontSize:15}}>{LABEL[sel]}</div>
                <button onClick={()=>{setSel(null);setSubset([]);clearSpot();}} style={{...ghost,padding:"4px 7px",display:"flex",alignItems:"center"}}>{IcClose}</button>
              </div>
              <div style={{padding:"14px 15px"}}>
                <div style={{fontSize:11.5,color:"#93908a",fontVariantNumeric:"tabular-nums",marginBottom:9}}>
                  {subset.length?`Editing ${subset.length} of ${placed.length}`:`Shared across ${targets.length} formats`}
                  {absent.length>0&&` · absent in ${absent.length}`}
                </div>
                {anchor&&placed.find(f=>f.id===anchor)&&(
                  <div style={{fontSize:11,color:divIn.includes(anchor)?"#6a4fe8":"#6f6c63",marginBottom:9}}>
                    {placed.find(f=>f.id===anchor).platform} · {divIn.includes(anchor)?"Local override":"Shared source"}
                  </div>
                )}
                <div style={{fontSize:10.5,color:"#9a968d",marginBottom:10}}>Native editing tools available per format</div>
                {sel&&anchor&&approved[`${anchor}:${sel}`]&&(
                  <div style={{fontSize:11.5,color:"#2f8a54",background:"#edf8f0",border:"1px solid #bfe5c9",borderRadius:8,padding:"7px 9px",marginBottom:10}}>
                    <span style={{display:"inline-block",width:7,height:7,borderRadius:9,background:"#41a66a",marginRight:7}}/>
                    Approved · change applied
                  </div>
                )}
                {(
                  <input aria-label={`Edit ${LABEL[sel]}`} value={subset.length===1?valIn(sel,subset[0]):content[sel]} onChange={e=>edit(e.target.value)}
                    style={{width:"100%",border:"1px solid #e0dcd4",borderRadius:9,padding:"9px 11px",
                      fontSize:13.5,boxSizing:"border-box",fontFamily:"inherit",background:"#fcfbf9"}}/>
                )}
                {anchor&&!divIn.includes(anchor)&&(
                  <button onClick={()=>diverge(anchor)} style={{...ghost,marginTop:9,width:"100%"}}>Unlink this format</button>
                )}
                {divIn.length>0&&(
                  <div style={{marginTop:10,background:"#f7f5ff",border:"1px solid #e9e4ff",borderRadius:10,
                    padding:"9px 11px",display:"flex",alignItems:"center",gap:8}}>
                    <span style={{width:12,height:0,borderTop:`2px dashed ${C.unlinked}`}}/>
                    <span style={{fontSize:12}}>Unlinked in {divIn.length}</span>
                    <button onClick={restore} style={{...ghost,fontSize:11,padding:"2px 8px",marginLeft:"auto"}}>Relink all</button>
                  </div>
                )}

                {/* the count lives here and nowhere else */}
                {(sel==="headline"||sel==="subhead"||sel==="cta")&&broken.length>0&&(
                  <div style={{marginTop:13,display:"flex",alignItems:"center",gap:8,fontSize:12.5}}>
                    <span style={{width:7,height:7,borderRadius:9,background:C.warn,flexShrink:0}}/>
                    <span style={{color:"#3d3b35"}}>{broken.length} of {targets.length} {sel==="cta"?"CTA buttons overflow":sel==="subhead"?"sub-headlines overflow":"headlines overflow"}</span>
                    <button onMouseEnter={()=>preview(broken.map(f=>f.id))} onMouseLeave={endPreview}
                      onClick={()=>showFormats(broken.map(f=>f.id),sel)}
                      style={{...ghost,fontSize:11,padding:"1px 7px",marginLeft:"auto",
                        background:pin?"#f4f2ff":"#fff",borderColor:pin?"#ddd5ff":"#e6e3dd"}}>
                      {pin?"showing":"find them"}
                    </button>
                  </div>
                )}

                {sel==="fineprint"&&(
                  <div style={{marginTop:13,fontSize:12.5,color:"#6b6960",lineHeight:1.5}}>
                    Placed in {targets.length}. Excluded by {absent.length} native layouts.
                    {reviewCount>0&&(
                      <div style={{marginTop:11,paddingTop:10,borderTop:"1px solid #ece8e1"}}>
                        <div style={{color:"#3d3b35",marginBottom:8}}>Added to {targets.length} formats. Review the set once, then approve together.</div>
                        <div style={{display:"flex",gap:7}}>
                          <button onClick={()=>showFormats(idsFor("fineprint","ur"),"fineprint")} style={{...ghost,flex:1,fontSize:11.5}}>Review {idsFor("fineprint","ur").length}</button>
                          <button onClick={()=>{approveElement("fineprint");setNotice(`Fineprint approved in ${targets.length}`);clearTimeout(noticeTimer.current);noticeTimer.current=setTimeout(()=>setNotice(null),2200);}} style={{...primary,flex:1,fontSize:11.5,padding:"5px 7px"}}>Approve all</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {sel&&sel!=="fineprint"&&broken.length>0&&sel!=="headline"&&sel!=="subhead"&&sel!=="cta"&&(
                  <div style={{marginTop:13,background:"#fff8e8",border:"1px solid #e8c578",borderRadius:10,padding:11}}>
                    <div style={{fontSize:10,fontWeight:700,color:"#8a641b",marginBottom:5,letterSpacing:".05em"}}>NEEDS REVIEW</div>
                    <div style={{fontSize:12,color:"#5d4b27",lineHeight:1.45}}>
                      {LABEL[sel]} overflows in {broken.length} {broken.length===1?"format":"formats"}. Review the affected composition before continuing.
                    </div>
                    <button onClick={()=>showFormats(broken.map(f=>f.id),sel)} style={{...ghost,marginTop:10,fontSize:11.5}}>Review {broken.length}</button>
                  </div>
                )}

                {(sel==="headline"||sel==="subhead"||sel==="cta")&&broken.length>0&&!typing&&(
                  <div style={{marginTop:13,background:"#f7f5ff",border:"1px solid #e9e4ff",borderRadius:10,padding:11}}>
                    <div style={{fontSize:10,fontWeight:700,color:"#191915",marginBottom:5,letterSpacing:".05em",
                      display:"flex",alignItems:"center",gap:5}}><AiIcon size={13}/> PENCIL AI</div>
                    <div style={{fontSize:12,color:"#4a4840",lineHeight:1.45}}>
                      {`The ${LABEL[sel].toLowerCase()} is too large and conflicts with the local composition in ${broken.length} formats. I can adapt the layout there and leave the shared copy unchanged.`}
                    </div>
                    <div style={{display:"flex",gap:7,marginTop:10}}>
                      <button onClick={adapt} style={primary} title="Apply recommended layout adaptation"><AiIcon size={13}/> Improve {broken.length}</button>
                      <button onClick={()=>{setSel(null);clearSpot();}} style={ghost}>Edit manually</button>
                    </div>
                  </div>
                )}
                {adapted&&broken.length===0&&(
                  <div style={{marginTop:12,background:"#f5f1ff",border:"1px solid #d9ccff",
                    borderRadius:10,padding:11}}>
                    <div style={{fontSize:12,color:"#5c43b6",lineHeight:1.45}}>
                      <strong>Layout adapted in {adaptedCount}</strong> · shared copy preserved. Review the highlighted formats before approving.
                    </div>
                    <div style={{display:"flex",gap:7,marginTop:9,alignItems:"center"}}>
                      <button onClick={confirmAdaptations}
                        style={primary}>Approve {adaptedCount}</button>
                      <button onMouseEnter={()=>preview(adaptedIds)} onMouseLeave={endPreview}
                        onClick={()=>showFormats(adaptedIds)} style={{...ghost,fontSize:11,padding:"4px 9px"}}>
                        {pin?"showing":"show me"}
                      </button>
                    </div>
                  </div>
                )}
                {sel&&sel!=="fineprint"&&!adapted&&selReviewIds.length>0&&(
                  <div style={{marginTop:14,paddingTop:11,borderTop:"1px solid #ece8e1",fontSize:12,color:"#6b6960",lineHeight:1.5}}>
                    <div style={{color:"#3d3b35",marginBottom:8}}>Updated {selReviewIds.length} formats. Review the set once, then approve together.</div>
                    <div style={{display:"flex",gap:7}}>
                      <button onClick={()=>showFormats(selReviewIds,sel)} style={{...ghost,flex:1,fontSize:11.5}}>Review {selReviewIds.length}</button>
                      <button onClick={()=>{approveElement(sel);setNotice(`${LABEL[sel]} approved in ${selReviewIds.length}`);clearTimeout(noticeTimer.current);noticeTimer.current=setTimeout(()=>setNotice(null),2200);}} style={{...primary,flex:1,fontSize:11.5,padding:"5px 7px"}}>Approve all</button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div style={{width:RAIL,flexShrink:0,borderLeft:"1px solid #ececea",display:"flex",
          flexDirection:"column",alignItems:"center",paddingTop:10,gap:4,zIndex:20}}>
          {RIGHT_NAV.map((ico)=>{
            const on = ico.n==="Formats";
            return (
              <div key={ico.n} title={ico.n}
                style={{width:46,height:40,borderRadius:8,display:"flex",alignItems:"center",
                  justifyContent:"center",color:on?"#191915":"#6b6960",
                  background:on?"#f2f0eb":"transparent"}}>
                <NavIcon ico={ico}/>
              </div>
            );
          })}
          <div style={{flex:1}}/>
          <div title="Timeline" style={{width:46,height:40,borderRadius:8,display:"flex",
            alignItems:"center",justifyContent:"center",color:"#6b6960",marginBottom:8}}>
            <NavIcon ico={TIMELINE_NAV}/>
          </div>
        </div>
      </div>
    </div>
  );
}

/* The panel thumbnail is the canvas render at 1/n scale, not a placeholder.
   It inherits copy, crop, overflow and any per-format adaptation for free. */
/* The mark on a placement the engine touched. The icon names the cause,
   the amber ring carries the state. A dot alone said neither. */
function AiMark({size=14}){
  return (
    <div style={{width:size,height:size,borderRadius:size,background:"#fff",
      boxShadow:`0 0 0 1.5px ${REV.dot}, 0 1px 3px rgba(0,0,0,.22)`,color:"#191915",
      display:"flex",alignItems:"center",justifyContent:"center"}}>
      <AiIcon size={Math.round(size*.66)}/>
    </div>
  );
}

function Thumb({f,els,valIn,carries,adapted,flagged,box=38}){
  const k=Math.min(box/f.dw,box/f.dh);
  return (
    <div style={{width:box,height:box,flexShrink:0,borderRadius:5,position:"relative",
      background:"#efece6",display:"flex",alignItems:"center",justifyContent:"center"}}>
      {flagged&&(
        <div style={{position:"absolute",top:-3,right:-3,zIndex:2}}><AiMark size={12}/></div>
      )}
      <div style={{width:Math.round(f.dw*k),height:Math.round(f.dh*k),overflow:"hidden",borderRadius:4}}>
        <div style={{width:f.dw,height:f.dh,transform:`scale(${k})`,transformOrigin:"0 0"}}>
          <Ad fmt={f} els={els} valIn={valIn} carries={carries} sel={null}
            isAbs={false} isBrk={false} isDiv={false} adapted={adapted} ctaAdapted={1}
            showRing={false} onPick={()=>{}}/>
        </div>
      </div>
    </div>
  );
}

function Ad({fmt,els,valIn,carries,sel,isAbs,isBrk,isDiv,adapted,subAdapted=1,ctaAdapted=1,elState,isAnchor,demoRing,showRing=true,onPick}){
  const F=FAM[fmt.fam], W=fmt.dw;
  /* One ring, four readings:
       thick solid violet — the placement you are actually editing
       thin  solid violet — the same shared object, living here too
       dashed     violet — deliberately unlinked from the shared object
       solid       amber — the engine touched this one and nobody has looked */
  const ring=k=>{
    /* The opening flourish: a quiet ring, no selection, no panel, no decision. */
    if(demoRing===k&&!sel)
      return {outline:`${Math.max(1,W*.0045)}px solid ${C.unlinked}`,
              outlineOffset:W*.006,borderRadius:W*.008,opacity:.85};
    if(sel!==k||isAbs||!showRing) return {};
    const st = (elState==="unlinked"||isDiv) ? "unlinked" : elState==="review" ? "review" : elState==="approved" ? "approved" : "linked";
    const w  = Math.max(1.1, W*(isAnchor?.007:.0045));
    return {
      outline:`${w}px ${st==="unlinked"?"dashed":"solid"} ${st==="review"?C.warn:st==="approved"?"#41a66a":C.unlinked}`,
      outlineOffset:W*.006, borderRadius:W*.008
    };
  };
  const head=W*F.head*(adapted||1);
  const showFine=els.includes("fineprint")&&carries(fmt,"fineprint");

  return (
    <div style={{width:fmt.dw,height:fmt.dh,borderRadius:5,overflow:"hidden",position:"relative",
      /* gradient stays as the fallback if the photo can't load */
      background:"linear-gradient(140deg,#2b2011 0%,#6b4a1c 38%,#c9a04e 72%,#e8d9a8 100%)",
      /* tier 3 — the only loud signal, and only while a decision is open */
      boxShadow:isBrk?`0 0 0 2px ${C.warn}`:"0 1px 3px rgba(0,0,0,.16)",
      userSelect:"none",transition:"box-shadow .15s"}}>

      {/* one source asset, cropped by each ratio — this is the scaling story.
          Scene renders always; a real photo layers over it when PHOTO is set. */}
      <Scene/>
      {PHOTO && (
        <img src={PHOTO} alt="" draggable={false}
          style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",
            objectPosition:"52% 45%",pointerEvents:"none"}}
          onError={e=>{e.currentTarget.style.display="none";}}/>
      )}

      {/* scrim so copy stays legible over any photograph */}
      <div style={{position:"absolute",inset:0,pointerEvents:"none",
        background:`linear-gradient(to top, rgba(20,14,6,.82) 0%, rgba(20,14,6,.45) ${F.bottom+22}%, rgba(20,14,6,0) 62%)`}}/>

      <div onClick={e=>onPick("logo",e)} style={{position:"absolute",left:`${F.pad}%`,top:`${F.pad*.9}%`,
        color:"#fff",fontFamily:"Georgia, serif",fontSize:W*.058,fontWeight:700,letterSpacing:".12em",
        textShadow:"0 1px 2px rgba(0,0,0,.35)",cursor:"pointer",...ring("logo")}}>
        {valIn("logo",fmt.id)}
      </div>

      <div style={{position:"absolute",left:`${F.pad}%`,right:`${F.pad}%`,bottom:`${F.bottom}%`,
        display:"flex",flexDirection:"column",alignItems:"flex-start",gap:W*.022}}>
        <div onClick={e=>onPick("headline",e)} style={{color:"#fff",fontFamily:"Georgia, serif",
          fontSize:head,lineHeight:1.08,textShadow:"0 1px 3px rgba(0,0,0,.35)",cursor:"pointer",
          maxWidth:"100%",...ring("headline")}}>
          {valIn("headline",fmt.id)}
        </div>
        <div onClick={e=>onPick("subhead",e)} style={{color:"#f5e6c4",fontFamily:"Georgia, serif",
          fontSize:W*.052*(subAdapted||1),lineHeight:1.2,textShadow:"0 1px 2px rgba(0,0,0,.3)",cursor:"pointer",
          maxWidth:"100%",...ring("subhead")}}>
          {valIn("subhead",fmt.id)}
        </div>
        {!fmt.noCta&&(
          <div onClick={e=>onPick("cta",e)} style={{background:"#e3b23c",color:"#2b2011",fontWeight:700,
            fontSize:W*.042*ctaAdapted,letterSpacing:".05em",padding:`${W*.022*ctaAdapted}px ${W*.05*ctaAdapted}px`,borderRadius:W*.008,
            marginTop:W*.012,cursor:"pointer",...ring("cta")}}>
            {valIn("cta",fmt.id)}
          </div>
        )}
        {showFine&&(
          <div onClick={e=>onPick("fineprint",e)} style={{color:"rgba(255,255,255,.8)",fontSize:W*.026,
            lineHeight:1.25,marginTop:W*.014,cursor:"pointer",maxWidth:"100%",...ring("fineprint")}}>
            {valIn("fineprint",fmt.id)}
          </div>
        )}
      </div>

      {fmt.fam==="portrait"&&(
        <div style={{position:"absolute",left:0,right:0,bottom:0,height:"13%",
          background:"linear-gradient(to top,rgba(0,0,0,.5),transparent)",pointerEvents:"none"}}/>
      )}
    </div>
  );
}

const ghost={border:"1px solid #e6e3dd",background:"#fff",borderRadius:8,padding:"5px 11px",
  fontSize:12.5,cursor:"pointer",color:"#3d3b35",fontFamily:"inherit",transition:"background .12s, border-color .12s"};
const primary={border:"none",background:"#0C0B02",color:"#fff",borderRadius:8,padding:"7px 13px",
  fontSize:12.5,cursor:"pointer",fontWeight:600,fontFamily:"inherit",display:"inline-flex",alignItems:"center",
  justifyContent:"center",gap:6,whiteSpace:"nowrap",flexShrink:0};
const bare={border:"none",background:"transparent",fontSize:12.5,cursor:"pointer",color:"#191915",fontFamily:"inherit"};
const seg={padding:"5px 13px",borderRadius:7,fontSize:12.5,fontWeight:600,cursor:"pointer"};
