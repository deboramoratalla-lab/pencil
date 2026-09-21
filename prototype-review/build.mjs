import fs from "node:fs";
import ts from "/Users/dmoratalla/Documents/debora-labs/portfolio-preview/node_modules/typescript/lib/typescript.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = new URL("./pencil-canvas-v8.jsx", import.meta.url);
const reactPath = "/Users/dmoratalla/Documents/debora-labs/astrogenealogia-app/node_modules/react/umd/react.production.min.js";
const reactDomPath = "/Users/dmoratalla/Documents/debora-labs/astrogenealogia-app/node_modules/react-dom/umd/react-dom.production.min.js";
const analyticsPath = path.join(__dirname, "../node_modules/@vercel/analytics/dist/index.mjs");

let source = fs.readFileSync(sourcePath, "utf8")
  .replace(/^import React[^;]+;\s*/m, "const {useState,useRef,useCallback,useMemo,useEffect}=React;\n")
  .replace("export default function PencilCanvas", "function PencilCanvas");

const compiled = ts.transpileModule(source, {
  compilerOptions: {
    jsx: ts.JsxEmit.React,
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.None,
  },
}).outputText;

// Wrap the analytics module to make inject available globally
const analyticsCode = fs.readFileSync(analyticsPath, "utf8");
const wrappedAnalytics = `(function(){${analyticsCode.replace(/^export\s*\{[^}]+\};?\s*$/m, '').replace(/export \{[^}]+\};?/g, '')}; window.VercelAnalytics={inject,track,pageview,computeRoute};})();`;

const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Pencil canvas v8</title></head><body><div id="root"></div><script>${fs.readFileSync(reactPath,"utf8")}</script><script>${fs.readFileSync(reactDomPath,"utf8")}</script><script>${wrappedAnalytics}</script><script>${compiled}\nReactDOM.createRoot(document.getElementById("root")).render(React.createElement(PencilCanvas));\nif(window.VercelAnalytics && window.VercelAnalytics.inject){window.VercelAnalytics.inject();}</script></body></html>`;

fs.writeFileSync(new URL("./pencil-canvas-v8.html", import.meta.url), html);
