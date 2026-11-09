#!/usr/bin/env node
/**
 * 从带 data-i18n* 标注的页面里抽取中文文案，生成 i18n/<page>.zh.json
 * ------------------------------------------------------------------
 *   node scripts/i18n-extract.js static/skillHub.html
 *   node scripts/i18n-extract.js static/workflow.html
 *
 * 页面里的中文就是中文词典的唯一来源：改完文案后重跑一次，避免 HTML 与
 * i18n/<page>.zh.json 漂移。英文词典 i18n/<page>.en.json 需要人工维护。
 *
 * 抽取规则：
 *   data-i18n             → textContent
 *   data-i18n-html        → innerHTML（词条里含 <span>/<b> 等行内标签时）
 *   data-i18n-aria        → aria-label
 *   data-i18n-alt         → alt
 *   data-i18n-title       → title
 *   data-i18n-placeholder → placeholder
 *
 * 词条按在页面中首次出现的顺序写入，方便与页面逐段对照。
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const ATTRS = [
  ["data-i18n", "text"],
  ["data-i18n-html", "html"],
  ["data-i18n-aria", "aria-label"],
  ["data-i18n-alt", "alt"],
  ["data-i18n-title", "title"],
  ["data-i18n-placeholder", "placeholder"]
];

function normalize(value) {
  return String(value == null ? "" : value).replace(/\s+/g, " ").trim();
}

function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("用法: node scripts/i18n-extract.js <page.html>");
    process.exit(1);
  }

  const html = fs.readFileSync(file, "utf8");
  const { window } = new JSDOM(html);
  const document = window.document;

  const dict = {};
  const duplicates = [];

  // 标题与社交卡片元信息：引擎用固定 key 同步 <title> / meta
  const metaContent = (selector) => {
    const el = document.querySelector(selector);
    return el ? normalize(el.getAttribute("content")) : "";
  };
  const headDict = {
    title: normalize(document.title),
    description: metaContent('meta[name="description"]'),
    ogTitle: metaContent('meta[property="og:title"]'),
    ogDescription: metaContent('meta[property="og:description"]')
  };
  Object.keys(headDict).forEach((key) => {
    if (headDict[key]) dict[key] = headDict[key];
  });

  document.querySelectorAll("*").forEach((el) => {
    ATTRS.forEach(([attr, kind]) => {
      if (!el.hasAttribute(attr)) return;

      const key = el.getAttribute(attr);
      if (!key) return;

      let value;
      if (kind === "text") value = normalize(el.textContent);
      else if (kind === "html") value = normalize(el.innerHTML);
      else value = normalize(el.getAttribute(kind));

      if (!value) return;

      if (dict[key] !== undefined) {
        if (dict[key] !== value) duplicates.push({ key, first: dict[key], next: value });
        return;
      }
      dict[key] = value;
    });
  });

  if (duplicates.length) {
    console.warn("⚠ 同一个 key 出现了不同文案，已保留首次出现的值：");
    duplicates.forEach((item) => {
      console.warn(`  ${item.key}\n    首次: ${item.first}\n    再次: ${item.next}`);
    });
  }

  const page = path.basename(file, path.extname(file));
  const outFile = path.join(path.dirname(file), "i18n", `${page}.zh.json`);
  fs.writeFileSync(outFile, JSON.stringify(dict, null, 2) + "\n", "utf8");

  console.log(`${outFile} ← ${Object.keys(dict).length} 条`);
}

main();
