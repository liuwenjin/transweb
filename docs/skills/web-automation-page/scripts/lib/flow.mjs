/**
 * lib/flow.mjs — 通用自动化流程的解析、归一化与静态校验
 *
 * 被 generate.mjs / validate.mjs / selftest.mjs 共用。
 */

export const ACTIONS = new Set([
  "goto",
  "click",
  "fill",
  "press",
  "select",
  "check",
  "hover",
  "scroll",
  "wait",
  "waitFor",
  "assert",
  "extract",
  "eval",
  "screenshot",
  "upload",
  "frame",
  "log",
  "setVar",
]);

export const PLAYWRIGHT_ONLY_ACTIONS = new Set(["screenshot", "upload"]);

export const MODES = new Set(["auto", "inpage", "playwright", "both"]);

const NAME_RE = /^[A-Za-z][A-Za-z0-9_-]*$/;
const SECRET_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;
const ABSOLUTE_URL_RE = /^https?:\/\//i;
const PLACEHOLDER_RE = /\{\{\s*([^}]+?)\s*\}\}/g;

export function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function normalizeTitle(flow, errors) {
  const t = flow.title;
  if (typeof t === "string" && t.trim()) {
    return { zh: t.trim(), en: t.trim() };
  }
  if (isPlainObject(t)) {
    const zh = typeof t.zh === "string" ? t.zh.trim() : "";
    const en = typeof t.en === "string" ? t.en.trim() : "";
    if (!zh && !en) errors.push("title 至少提供 zh 或 en 之一");
    return { zh: zh || en, en: en || zh };
  }
  errors.push("title 必填，字符串或 { zh, en }");
  return { zh: "", en: "" };
}

export function normalizeFlow(flow) {
  const next = JSON.parse(JSON.stringify(flow));
  next.version = next.version || 2;
  next.mode = next.mode || "auto";
  next.vars = isPlainObject(next.vars) ? next.vars : {};
  next.secrets = Array.isArray(next.secrets) ? next.secrets.slice() : [];
  next.steps = Array.isArray(next.steps) ? next.steps.slice() : [];

  let pages = Array.isArray(next.pages) ? next.pages.slice() : [];
  if (!pages.length) {
    pages = [{ id: "main", url: next.baseUrl || "/" }];
  }
  next.pages = pages.map((page, index) => ({
    id: (page && page.id) || (index === 0 ? "main" : "page" + (index + 1)),
    url: (page && page.url) || "",
    title: (page && page.title) || "",
  }));

  return next;
}

export function resolveMode(flow) {
  if (flow.mode && flow.mode !== "auto") return flow.mode;

  const pages = Array.isArray(flow.pages) ? flow.pages : [];
  const steps = Array.isArray(flow.steps) ? flow.steps : [];
  const hasPageSwitch = steps.some((step) => step && step.page && step.page !== "main");
  const hasAbsoluteUrl = pages.some((page) => page && ABSOLUTE_URL_RE.test(String(page.url || ""))) ||
    steps.some((step) => step && step.url && ABSOLUTE_URL_RE.test(String(step.url)));

  if (hasPageSwitch) return "playwright";
  if (hasAbsoluteUrl) return "playwright";
  return "inpage";
}

export function originOf(url, base) {
  try {
    return new URL(String(url), base || "http://localhost/").origin;
  } catch (e) {
    return "";
  }
}

export function resolveUrl(url, base) {
  try {
    return new URL(String(url), base || "http://localhost/").href;
  } catch (e) {
    return String(url);
  }
}

export function validateFlow(input) {
  const errors = [];
  const warnings = [];
  const flow = normalizeFlow(input);

  if (flow.version !== 2) errors.push("version 目前只支持 2");

  if (typeof flow.name !== "string" || !NAME_RE.test(flow.name)) {
    errors.push("name 必填，且只能包含字母/数字/_/-，并以字母开头");
  }

  const title = normalizeTitle(flow, errors);

  if (flow.mode && !MODES.has(flow.mode)) {
    errors.push("mode 只能是 auto / inpage / playwright / both");
  }

  if (flow.baseUrl !== undefined) {
    if (typeof flow.baseUrl !== "string" || !flow.baseUrl.trim()) {
      errors.push("baseUrl 必须是非空字符串");
    } else if (/^\s*javascript:/i.test(flow.baseUrl)) {
      errors.push("baseUrl 不允许 javascript: 协议");
    } else if (!ABSOLUTE_URL_RE.test(flow.baseUrl) && !flow.baseUrl.startsWith("/")) {
      warnings.push("baseUrl 既不是绝对 URL 也不以 / 开头，请确认相对解析符合预期");
    }
  }

  if (!isPlainObject(flow.vars)) {
    errors.push("vars 必须是对象");
  }
  Object.keys(flow.vars || {}).forEach((key) => {
    if (!SECRET_RE.test(key)) warnings.push("vars 的键名建议使用标识符：" + key);
  });

  const secretNames = new Set();
  flow.secrets.forEach((name, index) => {
    if (typeof name !== "string" || !SECRET_RE.test(name)) {
      errors.push("secrets[" + index + "] 必须是合法标识符");
    } else {
      secretNames.add(name);
    }
  });

  const pageIds = new Set();
  flow.pages.forEach((page, index) => {
    if (!page.id || !NAME_RE.test(page.id)) {
      errors.push("pages[" + index + "].id 必须是合法标识符");
    }
    if (pageIds.has(page.id)) errors.push("pages 的 id 重复：" + page.id);
    pageIds.add(page.id);
    if (page.url && /^\s*javascript:/i.test(page.url)) {
      errors.push("pages[" + index + "].url 不允许 javascript: 协议");
    } else if (page.url && !ABSOLUTE_URL_RE.test(page.url) && !String(page.url).startsWith("/")) {
      warnings.push("pages[" + index + "].url 是相对路径但不以 / 开头，请确认");
    }
  });

  if (!Array.isArray(flow.steps) || flow.steps.length === 0) {
    errors.push("steps 必须是非空数组");
  } else {
    flow.steps.forEach((step, index) => {
      validateStep(step, index, {
        errors,
        warnings,
        pageIds,
        secretNames,
        mode: flow.mode,
      });
    });
  }

  const mode = resolveMode(flow);
  if (mode === "inpage" || mode === "both") {
    validateInpageConstraints(flow, errors, warnings);
  }
  if (mode === "playwright" || mode === "both") {
    const base = flow.baseUrl || (flow.pages[0] && flow.pages[0].url) || "";
    if (!ABSOLUTE_URL_RE.test(base)) {
      errors.push("Playwright 模式需要绝对 baseUrl 或 pages[0].url（当前：" + (base || "空") + "）");
    }
  }

  return { flow, title, mode, errors, warnings };
}

function validateStep(step, index, ctx) {
  const where = "steps[" + index + "]";
  const { errors, warnings, pageIds, secretNames, mode } = ctx;

  if (!isPlainObject(step)) {
    errors.push(where + " 必须是对象");
    return;
  }
  if (typeof step.action !== "string" || !ACTIONS.has(step.action)) {
    errors.push(where + ".action 不支持：" + String(step.action));
    return;
  }
  if (step.description !== undefined && typeof step.description !== "string") {
    errors.push(where + ".description 必须是字符串");
  }
  if (step.timeout !== undefined &&
    (typeof step.timeout !== "number" || !(step.timeout > 0))) {
    errors.push(where + ".timeout 必须是正数毫秒");
  }
  if (step.onError !== undefined && !["stop", "continue"].includes(step.onError)) {
    errors.push(where + ".onError 只能是 stop / continue");
  }
  if (step.retry !== undefined) {
    if (!isPlainObject(step.retry)) errors.push(where + ".retry 必须是对象");
    else {
      if (step.retry.count !== undefined &&
        (!Number.isInteger(step.retry.count) || step.retry.count < 0)) {
        errors.push(where + ".retry.count 必须是 >= 0 的整数");
      }
      if (step.retry.interval !== undefined &&
        (typeof step.retry.interval !== "number" || step.retry.interval < 0)) {
        errors.push(where + ".retry.interval 必须是 >= 0 的毫秒数");
      }
    }
  }
  if (step.page !== undefined) {
    if (typeof step.page !== "string" || !pageIds.has(step.page)) {
      errors.push(where + ".page 引用了不存在的页面：" + step.page);
    }
  }

  if (step.selector !== undefined) {
    if (typeof step.selector !== "string" || !step.selector.trim()) {
      errors.push(where + ".selector 必须是非空字符串");
    } else {
      validateSelector(step.selector, where, warnings);
    }
  }
  if (step.index !== undefined && (!Number.isInteger(step.index) || step.index < 1)) {
    errors.push(where + ".index 必须是 >= 1 的整数");
  }

  switch (step.action) {
    case "goto":
      if (typeof step.url !== "string" || !step.url.trim()) errors.push(where + ".url 必填（goto）");
      if (step.url && /^\s*javascript:/i.test(step.url)) errors.push(where + ".url 不允许 javascript: 协议");
      break;
    case "click":
      requireSelector(step, where, errors);
      optionalBool(step, "force", where, errors);
      if (step.button !== undefined && !["left", "middle", "right"].includes(step.button)) {
        errors.push(where + ".button 只能是 left / middle / right");
      }
      if (step.clickCount !== undefined &&
        (!Number.isInteger(step.clickCount) || step.clickCount < 1)) {
        errors.push(where + ".clickCount 必须是 >= 1 的整数");
      }
      if (step.modifiers !== undefined && !Array.isArray(step.modifiers)) {
        errors.push(where + ".modifiers 必须是数组");
      }
      break;
    case "fill":
      requireSelector(step, where, errors);
      optionalBool(step, "clear", where, errors);
      optionalBool(step, "blur", where, errors);
      if (typeof step.value !== "string" && typeof step.value !== "number") {
        errors.push(where + ".value 必填（string / number）");
      }
      if (step.typingDelay !== undefined &&
        (typeof step.typingDelay !== "number" || step.typingDelay < 0)) {
        errors.push(where + ".typingDelay 必须是 >= 0 的毫秒数");
      }
      lintSensitive(step.value, where + ".value", errors, warnings);
      break;
    case "press":
      optionalBool(step, "submit", where, errors);
      if (typeof step.key !== "string" || !step.key) errors.push(where + ".key 必填（press）");
      if (step.selector !== undefined && typeof step.selector !== "string") {
        errors.push(where + ".selector 必须是字符串");
      }
      break;
    case "select":
      requireSelector(step, where, errors);
      if (step.value === undefined && step.values === undefined) {
        errors.push(where + ".value 或 .values 必填（select）");
      }
      if (step.values !== undefined && !Array.isArray(step.values)) {
        errors.push(where + ".values 必须是数组");
      }
      if (step.value !== undefined && !["string", "number"].includes(typeof step.value)) {
        errors.push(where + ".value 必须是 string / number");
      }
      break;
    case "check":
      requireSelector(step, where, errors);
      if (step.checked !== undefined && typeof step.checked !== "boolean") {
        errors.push(where + ".checked 必须是布尔值");
      }
      break;
    case "hover":
      requireSelector(step, where, errors);
      break;
    case "scroll":
      if (step.selector === undefined &&
        (typeof step.x !== "number" || typeof step.y !== "number")) {
        errors.push(where + " 需要 selector，或同时提供数字 x / y");
      }
      break;
    case "wait":
      if (typeof step.ms !== "number" || step.ms < 0) errors.push(where + ".ms 必须是 >= 0 的数字");
      if (step.ms > 3000) warnings.push(where + " 使用 " + step.ms + "ms 固定等待，慢网/快网都不稳，优先 waitFor");
      break;
    case "waitFor": {
      const targets = ["selector", "text", "url"].filter((key) => step[key] !== undefined);
      if (targets.length !== 1) errors.push(where + " 需要 selector / text / url 中恰好一个");
      if (step.state !== undefined && !["visible", "attached", "hidden", "detached"].includes(step.state)) {
        errors.push(where + ".state 只能是 visible / attached / hidden / detached");
      }
      break;
    }
    case "assert": {
      const targets = ["selector", "text", "url"].filter((key) => step[key] !== undefined);
      if (targets.length !== 1) errors.push(where + " 需要 selector / text / url 中恰好一个");
      const checks = ["equals", "contains", "matches"].filter((key) => step[key] !== undefined);
      if (checks.length !== 1) errors.push(where + " 需要 equals / contains / matches 中恰好一个");
      if (step.matches !== undefined) {
        try { new RegExp(step.matches); } catch (e) { errors.push(where + ".matches 不是合法正则"); }
      }
      if (step.attr !== undefined && typeof step.attr !== "string") {
        errors.push(where + ".attr 必须是字符串");
      }
      break;
    }
    case "extract":
      requireSelector(step, where, errors);
      if (typeof step.as !== "string" || !SECRET_RE.test(step.as)) {
        errors.push(where + ".as 必须是合法变量名");
      }
      if (step.attr !== undefined && typeof step.attr !== "string") {
        errors.push(where + ".attr 必须是字符串");
      }
      optionalBool(step, "multiple", where, errors);
      optionalBool(step, "html", where, errors);
      optionalBool(step, "value", where, errors);
      if (step.prop !== undefined && typeof step.prop !== "string") {
        errors.push(where + ".prop 必须是字符串");
      }
      break;
    case "eval":
      if (typeof step.script !== "string" || !step.script.trim()) errors.push(where + ".script 必填");
      if (step.as !== undefined && (typeof step.as !== "string" || !SECRET_RE.test(step.as))) {
        errors.push(where + ".as 必须是合法变量名");
      }
      warnings.push(where + " 使用 eval：只允许在可信流程中运行");
      break;
    case "screenshot":
      optionalBool(step, "fullPage", where, errors);
      if (step.path !== undefined && typeof step.path !== "string") {
        errors.push(where + ".path 必须是字符串");
      }
      break;
    case "upload":
      requireSelector(step, where, errors);
      if (typeof step.path !== "string" || !step.path) errors.push(where + ".path 必填（upload）");
      break;
    case "frame":
      if (step.selector !== undefined && step.selector !== null && typeof step.selector !== "string") {
        errors.push(where + ".selector 必须是字符串或 null");
      }
      break;
    case "log":
      if (typeof step.message !== "string") errors.push(where + ".message 必须是字符串");
      break;
    case "setVar":
      if (typeof step.name !== "string" || !SECRET_RE.test(step.name)) {
        errors.push(where + ".name 必须是合法变量名");
      }
      if (step.value === undefined) errors.push(where + ".value 必填");
      break;
    default:
      break;
  }

  // 模板变量检查：{{secret.X}} 必须在 secrets 中声明
  const text = JSON.stringify(step);
  let match;
  PLACEHOLDER_RE.lastIndex = 0;
  while ((match = PLACEHOLDER_RE.exec(text))) {
    const expr = match[1];
    if (expr.indexOf("secret.") === 0) {
      const name = expr.slice(7);
      if (!secretNames.has(name)) {
        warnings.push(where + " 引用了未在 secrets 声明的 {{secret." + name + "}}");
      }
    }
  }

  if (PLAYWRIGHT_ONLY_ACTIONS.has(step.action) && (mode === "inpage" || mode === "auto")) {
    warnings.push(where + " 的 " + step.action + " 仅 Playwright 支持；inpage 模式会报错");
  }
}

function optionalBool(step, key, where, errors) {
  if (step[key] !== undefined && typeof step[key] !== "boolean") {
    errors.push(where + "." + key + " 必须是布尔值");
  }
}

function requireSelector(step, where, errors) {
  if (typeof step.selector !== "string" || !step.selector.trim()) {
    errors.push(where + ".selector 必填（" + step.action + "）");
  }
}

function validateSelector(selector, where, warnings) {
  const value = String(selector);
  if (/\b(:r[0-9a-z]+|el-id-\d+|react-select-\d+|nth-child\(\d+\))/i.test(value)) {
    warnings.push(where + " 的选择器可能包含动态 id / 深链：" + value);
  }
  if (value.length > 300) warnings.push(where + " 的选择器过长，建议改用稳定属性");
}

function lintSensitive(value, where, errors, warnings) {
  if (value === undefined) return;
  const text = String(value);
  if (/(password|passwd|secret|token|apiKey|apiSecret)\s*[:=]\s*["'][^"']{3,}["']/i.test(text)) {
    warnings.push(where + " 疑似硬编码凭据；改用 {{secret.NAME}}");
  }
  if (/<[A-Z][A-Z0-9_]*>/.test(text)) {
    warnings.push(where + " 仍有 <PLACEHOLDER> 占位符");
  }
}

function validateInpageConstraints(flow, errors, warnings) {
  if (flow.pages.length > 1) {
    warnings.push("inpage 只会初始加载 pages[0]；其余同源页面请用 goto 顺序导航，不要用步骤上的 page 切页");
  }
  if (flow.steps.some((step) => step && step.page && step.page !== "main")) {
    errors.push("inpage 模式不支持步骤切换 page，请用 playwright");
  }
  flow.steps.forEach((step, index) => {
    if (!step) return;
    if (PLAYWRIGHT_ONLY_ACTIONS.has(step.action)) {
      errors.push("steps[" + index + "] " + step.action + " 仅 Playwright 支持");
    }
    if (step.url && ABSOLUTE_URL_RE.test(step.url) && flow.baseUrl && ABSOLUTE_URL_RE.test(flow.baseUrl)) {
      if (originOf(step.url, flow.baseUrl) !== originOf(flow.baseUrl)) {
        errors.push("steps[" + index + "] 的 URL 与 baseUrl 不同源（" + step.url + "），inpage 无法访问");
      }
    } else if (step.url && ABSOLUTE_URL_RE.test(step.url) && !flow.baseUrl) {
      warnings.push("steps[" + index + "] 使用绝对 URL；请确认与承载页同源，否则用 playwright");
    }
  });
  flow.pages.forEach((page, index) => {
    if (page.url && ABSOLUTE_URL_RE.test(page.url) && flow.baseUrl && ABSOLUTE_URL_RE.test(flow.baseUrl)) {
      if (originOf(page.url, flow.baseUrl) !== originOf(flow.baseUrl)) {
        errors.push("pages[" + index + "] 与 baseUrl 不同源，inpage 无法访问");
      }
    }
  });
}

export function readJsonFile(fs, file) {
  const raw = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}
