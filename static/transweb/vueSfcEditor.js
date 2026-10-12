(function () {
  "use strict";
  // ============================================================
  // Helpers
  // ============================================================
  function escapeReg(s) { return String(s).replace(/[.*+?^\${}()|[\]\\]/g, "\\$&"); }
  function trimSpaces(s) { return String(s).replace(/\s+/g, " ").trim(); }
  function escapeHtml(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function scanToTagEnd(str, startLt) {
    let i = startLt, inS = false, inD = false;
    while (i < str.length) {
      const c = str[i];
      if (inS) { if (c === "\\") { i += 2; continue; } if (c === "'") inS = false; i++; continue; }
      if (inD) { if (c === "\\") { i += 2; continue; } if (c === '"') inD = false; i++; continue; }
      if (c === "'") { inS = true; i++; continue; }
      if (c === '"') { inD = true; i++; continue; }
      if (c === ">") return i;
      i++;
    }
    return -1;
  }

  function indexOfTagOpen(code, lower, from) {
    const needle = "<" + lower;
    let i = Math.max(0, from);
    while (i < code.length) {
      const idx = code.toLowerCase().indexOf(needle, i);
      if (idx === -1) return -1;
      const next = code[idx + needle.length];
      if (next && /[A-Za-z0-9_-]/.test(next)) { i = idx + needle.length; continue; }
      return idx;
    }
    return -1;
  }

  function findBlock(code, tagName) {
    if (!code || !tagName) return null;
    const lowerTag = tagName.toLowerCase();

    /**
     * 使用正则匹配起始标签，捕获标签名和属性结束位置
     * [1] 匹配起始标签名
     * [2] 匹配标签内的属性部分
     */
    const startTagRegex = new RegExp(`(<${lowerTag}(\\s[^>]*)?>)`, 'gi');
    const endTagText = `</${lowerTag}>`;

    let match;
    while ((match = startTagRegex.exec(code)) !== null) {
      const fullStartTag = match[0];
      const openIdx = match.index;
      const innerStart = openIdx + fullStartTag.length;

      // 检查是否是自闭合标签 (例如 <script src="..." />)
      if (fullStartTag.endsWith('/>')) {
        return {
          start: innerStart,
          end: innerStart,
          inner: "",
          fullStart: openIdx,
          fullEnd: innerStart
        };
      }

      /**
       * 关键改进：针对 Vue SFC 顶层块，通常不建议处理深度嵌套
       * 因为 Vue 规范中顶级标签（template/script/style）是不允许嵌套同名顶级标签的。
       * 我们直接寻找下一个对应的闭合标签，但要跳过字符串干扰。
       */
      const closeIdx = code.indexOf(endTagText, innerStart);

      if (closeIdx !== -1) {
        const inner = code.slice(innerStart, closeIdx);
        return {
          start: innerStart,
          end: closeIdx,
          inner: inner,
          fullStart: openIdx,
          fullEnd: closeIdx + endTagText.length
        };
      }
    }

    return null;
  }

  function isPlainObject(x) {
    return !!x && typeof x === "object" && !Array.isArray(x);
  }

  function toNumId(x) {
    if (typeof x === "number" && isFinite(x)) return x;
    if (typeof x === "string" && /^\d+$/.test(x)) return parseInt(x, 10);
    return null;
  }

  // ============================================================
  // Overlay Preset v1 (visual fallback spec)
  // - Used ONLY for high-risk tpl.insert (inside) to prevent layout breakage.
  // - Does NOT change IR schema; purely internal safeguard.
  // ============================================================
  const OVERLAY_PRESET_V1 = {
    base: {
      class: [
        "tw-absolute",
        "tw-top-2",
        "tw-left-2",
        "tw-z-30",
        "tw-bg-white55",
        "tw-backdrop-blur-sm",
        "tw-rounded-xl",
        "tw-px-4",
        "tw-py-2",
        "tw-pointer-events-none"
      ]
    },
    variants: {
      label: { class: ["tw-text-sm", "tw-font-medium", "tw-text-1B1D2A"] },
      badge: { class: ["tw-text-xs", "tw-font-semibold", "tw-text-1B1D2A", "tw-rounded-full", "tw-px-3", "tw-py-1"] },
      hint: { class: ["tw-text-xs", "tw-text-6B7280", "tw-max-w-4/5"] }
    }
  };

  function _overlayInferVariantFromHtml(html) {
    const text = String(html || "").replace(/<[^>]+>/g, "").trim();
    if (text.length <= 6) return "badge";
    if (text.length <= 20) return "label";
    return "hint";
  }

  function _overlayRewriteHtmlV1(html) {
    const src = String(html || "");
    // Respect user-provided absolute positioning
    if (/\btw-absolute\b/.test(src) || /\bposition\s*:\s*absolute\b/.test(src)) return src;

    const variant = _overlayInferVariantFromHtml(src);
    const base = (OVERLAY_PRESET_V1.base && OVERLAY_PRESET_V1.base.class) ? OVERLAY_PRESET_V1.base.class : [];
    const v = (OVERLAY_PRESET_V1.variants && OVERLAY_PRESET_V1.variants[variant] && OVERLAY_PRESET_V1.variants[variant].class) ? OVERLAY_PRESET_V1.variants[variant].class : [];
    const overlayClass = trimSpaces(base.concat(v).join(" "));

    return src.replace(/^<\s*([^\s>]+)([^>]*)>/, function (_, tag, attrs) {
      let nextAttrs = attrs || "";
      if (/\bclass\s*=/.test(nextAttrs)) {
        nextAttrs = nextAttrs.replace(/\bclass\s*=\s*"([^"]*)"/, function (_m, cls) {
          return 'class="' + trimSpaces(String(cls || "") + " " + overlayClass) + '"';
        });
      } else {
        nextAttrs += ' class="' + overlayClass + '"';
      }
      return "<" + tag + nextAttrs + ">";
    });
  }

  function _overlayIsHighRiskInsertTarget(openTagHtml) {
    const openTag = String(openTagHtml || "");
    // Vue/ElementPlus components typically contain "-" (e.g. el-input, el-tabs)
    const m = openTag.match(/^<\s*([^\s/>]+)/);
    if (m && m[1] && m[1].indexOf("-") !== -1) return true;

    // Heuristic: containers likely to be layout-sensitive
    if (/\b(tw-sticky|tw-top-0|tw-top-nav|app-bg|layout|container|header|nav)\b/.test(openTag)) return true;

    return false;
  }

  function _extractFullComponent(fn) {
    if (typeof fn !== "function") return { args: [], body: "" };

    const fnStr = fn.toString();

    // 1. 匹配括号内的参数部分
    // 正则解析：找第一对 () 之间的内容
    const argsMatch = fnStr.match(/\(([^)]*)\)/);
    const argsStr = argsMatch ? argsMatch[1] : '';

    // 将参数字符串转为数组，并过滤掉空格和空值
    const argsArray = argsStr.split(',').map(s => s.trim()).filter(Boolean);

    // 2. 提取 Body
    const body = fnStr.substring(fnStr.indexOf('{') + 1, fnStr.lastIndexOf('}')).trim();

    return {
      args: argsArray,
      body: body
    };
  }

  function _overlayEnsureParentRelative(tpl, lt, gt, openTagHtml) {
    const openTag = String(openTagHtml || "");
    if (/\btw-relative\b/.test(openTag) || /\brelative\b/.test(openTag)) return { tpl, changed: false };

    // If already has inline position style, respect it
    if (/\bstyle\s*=\s*"[^"]*position\s*:\s*relative[^"]*"/.test(openTag)) return { tpl, changed: false };

    const hasClass = /\bclass\s*=\s*"/.test(openTag);
    let nextOpenTag = openTag;

    if (hasClass) {
      nextOpenTag = openTag.replace(/\bclass\s*=\s*"([^"]*)"/, function (_m, cls) {
        const next = trimSpaces(String(cls || "") + " tw-relative");
        return 'class="' + next + '"';
      });
    } else {
      // insert class before closing ">" or "/>"
      nextOpenTag = openTag.replace(/\s*\/?>(\s*)$/, function (m0, tailWs) {
        const isSelf = /\/\s*>/.test(m0);
        return ' class="tw-relative"' + (isSelf ? " />" : ">") + (tailWs || "");
      });
      // Fallback if regex didn't match
      if (nextOpenTag === openTag) {
        nextOpenTag = openTag.replace(/>$/, ' class="tw-relative">');
      }
    }

    if (nextOpenTag === openTag) return { tpl, changed: false };
    const nextTpl = tpl.slice(0, lt) + nextOpenTag + tpl.slice(gt + 1);
    return { tpl: nextTpl, changed: true };
  }

  // ============================================================
  // Plugin Core (Converged Build)
  // - Supports ALL previously supported tpl/sc/semantic ops.
  // - js.* / css.* are parsed but ignored (adapter no-op), per your rule.
  // - replaceNode/insert: allows data-edit-id inside html (no rejection).
  //   If html has NO data-edit-id, we will auto-instrument to add ids.
  // ============================================================
  const Plugin = {
    name: "VueSfcEditor",
    version: "VueSfcEditorPlugin_full_ops_v3.8_1b",

    // expose helpers for compatibility
    _helpers: { escapeReg, trimSpaces, escapeHtml, scanToTagEnd, indexOfTagOpen, findBlock, isPlainObject, toNumId },

    apply(sfcCode, operations) {
      return Plugin.applyWithResult(sfcCode, operations || {}).code;
    },

    applyWithResult(sfcCode, operations) {
      const ctx = { changed: false, reasons: [], summary: [] };
      let code0 = String(sfcCode || "");

      if (!operations || !Array.isArray(operations.ops)) {
        return { changed: false, reasons: ["invalid input: expected { ops: [...] }"], summary: [], code: code0 };
      }

      // 1) atomic semantic ops first (they operate on current code directly)
      const sem1 = Plugin.semanticPlanners.semanticLayout.applyOpsV3ToCode(code0, operations.ops, ctx);
      if (sem1.aborted) return { changed: false, reasons: ctx.reasons.slice(), summary: ctx.summary.slice(), code: code0 };
      code0 = sem1.code;

      const sem2 = Plugin.semanticPlanners.moveSemantic.applyOpsV3ToCode(code0, sem1.ops, ctx);
      if (sem2.aborted) return { changed: false, reasons: ctx.reasons.slice(), summary: ctx.summary.slice(), code: code0 };
      code0 = sem2.code;

      // 2) adapter: v3 IR -> internal template patches
      const adapted = Plugin.adapterOpsV3.adapt({ ops: sem2.ops }, code0, ctx);
      if (!adapted || !adapted.ok || !adapted.v2) {
        if (!ctx.reasons.length) ctx.reasons.push("adapter failed");
        return { changed: false, reasons: ctx.reasons.slice(), summary: ctx.summary.slice(), code: code0 };
      }

      const v2 = adapted.v2;

      // 3) apply selector scope migrate then template patches
      if (v2.selectorScope) code0 = Plugin.selectorScope.apply(code0, v2.selectorScope, ctx);
      if (v2.template) code0 = Plugin.template.apply(code0, v2.template, ctx);

      // 4) apply script/style patches (AST-like safe editor)
      if (v2.script) code0 = Plugin.script.apply(code0, v2.script, ctx);
      if (v2.style) code0 = Plugin.style.apply(code0, v2.style, ctx);

      return { changed: !!ctx.changed, reasons: ctx.reasons.slice(), summary: ctx.summary.slice(), code: code0 };
    },

    _mark(ctx, reason, summary) {
      if (!ctx) return;
      ctx.changed = true;
      if (reason) ctx.reasons.push(String(reason));
      if (summary) ctx.summary.push(String(summary));
    },

    // ============================================================
    // Semantic planners (atomic, direct-to-template)
    // ============================================================
    semanticPlanners: {
      semanticLayout: {
        applyOpsV3ToCode(sfcCode, opsList, ctx) {
          if (!Array.isArray(opsList) || opsList.length === 0) return { code: sfcCode, ops: opsList, aborted: false };
          let code0 = String(sfcCode || "");
          const nextOps = [];
          for (const op of opsList) {
            if (!op || typeof op !== "object" || op.op !== "tpl.semanticLayout") { nextOps.push(op); continue; }
            const next = Plugin.template.semanticLayoutWrapByEditIds(code0, op, ctx);
            if (!next || next === code0) { ctx && ctx.reasons.push("semanticLayout: failed"); return { code: sfcCode, ops: opsList, aborted: true }; }
            code0 = next;
          }
          return { code: code0, ops: nextOps, aborted: false };
        }
      },
      moveSemantic: {
        applyOpsV3ToCode(sfcCode, opsList, ctx) {

          if (!Array.isArray(opsList) || opsList.length === 0) return { code: sfcCode, ops: opsList, aborted: false };

          // normalize common swap intent expressed as 2x moveSemantic into a single atomic swapSemantic
          const normalized = [];
          for (let i = 0; i < opsList.length; i++) {
            const a = opsList[i];
            const b = opsList[i + 1];

            const isMove = (x) => x && typeof x === "object" && x.op === "tpl.moveSemantic";
            if (isMove(a) && isMove(b)) {
              const aFrom = toNumId(a.fromId);
              const aTo = toNumId(a.toId);
              const bFrom = toNumId(b.fromId);
              const bTo = toNumId(b.toId);
              const aWhere = String(a.where || "").trim();
              const bWhere = String(b.where || "").trim();

              const aIsBefore = (aWhere === "before" || aWhere === "left");
              const aIsAfter = (aWhere === "after" || aWhere === "right");
              const bIsBefore = (bWhere === "before" || bWhere === "left");
              const bIsAfter = (bWhere === "after" || bWhere === "right");

              if (
                aFrom != null && aTo != null && bFrom != null && bTo != null &&
                aFrom === bTo && aTo === bFrom &&
                ((aIsBefore && bIsAfter) || (aIsAfter && bIsBefore))
              ) {
                normalized.push({ op: "tpl.swapSemantic", idA: aFrom, idB: aTo });
                i++; // consume b
                continue;
              }
            }

            normalized.push(a);
          }

          let code0 = String(sfcCode || "");
          const nextOps = [];

          for (const op of normalized) {
            if (!op || typeof op !== "object") { nextOps.push(op); continue; }

            if (op.op === "tpl.swapSemantic") {
              const idA = toNumId(op.idA);
              const idB = toNumId(op.idB);
              if (idA == null || idB == null) { ctx && ctx.reasons.push("tpl.swapSemantic: invalid ids"); return { code: sfcCode, ops: opsList, aborted: true }; }
              const next = Plugin.template.swapSemanticByEditId(code0, idA, idB, ctx);
              if (!next || next === code0) { ctx && ctx.reasons.push("tpl.swapSemantic: swap failed"); return { code: sfcCode, ops: opsList, aborted: true }; }
              code0 = next;
              continue;
            }

            if (op.op !== "tpl.moveSemantic") { nextOps.push(op); continue; }

            const fromId = toNumId(op.fromId);
            const toId = toNumId(op.toId);
            const where = String(op.where || "").trim();
            if (fromId == null || toId == null) { ctx && ctx.reasons.push("tpl.moveSemantic: invalid ids"); return { code: sfcCode, ops: opsList, aborted: true }; }
            if (!/^(left|right|before|after|inside-start|inside-end|replace)$/.test(where)) { ctx && ctx.reasons.push("tpl.moveSemantic: invalid where"); return { code: sfcCode, ops: opsList, aborted: true }; }
            const next = Plugin.template.moveSemanticByEditId(code0, fromId, toId, where, ctx);
            if (!next || next === code0) { ctx && ctx.reasons.push("tpl.moveSemantic: move failed"); return { code: sfcCode, ops: opsList, aborted: true }; }
            code0 = next;
          }

          return { code: code0, ops: nextOps, aborted: false };

        }
      }
    },

    // ============================================================
    // Adapter: ops v3.* -> internal v2-like operations
    // - Enforces mutual exclusivity per editId:
    //   removeNode | insert | setText | replaceNode  cannot coexist, and cannot mix with attr patches.
    // - Allows data-edit-id in replaceNode/insert html (no rejection).
    // ============================================================
    adapterOpsV3: {
      adapt(opsV3, sfcCode, ctx) {
        try {
          const list = opsV3 && Array.isArray(opsV3.ops) ? opsV3.ops : null;
          if (!list) { ctx && ctx.reasons.push("adapter: ops must be array"); return { ok: false }; }

          const v2 = {};
          let selectorScope = null;

          const tplById = new Map();
          function getTplPatch(id) {
            const k = String(id);
            if (!tplById.has(k)) tplById.set(k, {});
            return tplById.get(k);
          }
          function ensureNoExclusiveConflict(id, kind) {
            const p = getTplPatch(id);
            const hasRemoveNode = p.removeNode === true;
            const hasInsert = !!p.insert;
            const hasSetText = typeof p.setText === "string";
            const hasReplaceNode = typeof p.replaceNode === "string";
            const hasAttr = !!(p.set || p.remove || p.mergeClass || p.removeClass);

            if (kind === "removeNode") return !(hasInsert || hasSetText || hasReplaceNode || hasAttr);
            if (kind === "insert") return !(hasRemoveNode || hasSetText || hasReplaceNode || hasAttr);
            if (kind === "setText") return !(hasRemoveNode || hasInsert || hasReplaceNode || hasAttr);
            if (kind === "replaceNode") return !(hasRemoveNode || hasInsert || hasSetText || hasAttr);
            if (kind === "attr") return !(hasRemoveNode || hasInsert || hasSetText || hasReplaceNode);
            return false;
          }

          function validateHtml(html) {
            const h = String(html || "");
            if (!h || h[0] !== "<") return false;
            return true;
          }

          for (const item of list) {
            if (!isPlainObject(item)) { ctx && ctx.reasons.push("adapter: op item not object"); return { ok: false }; }
            const op = String(item.op || "");
            if (!op) { ctx && ctx.reasons.push("adapter: missing op"); return { ok: false }; }

            if (op === "sc.migrate") {
              if (selectorScope) { ctx && ctx.reasons.push("adapter: multiple sc.migrate"); return { ok: false }; }
              const selector = item.selector;
              const fromId = toNumId(item.fromId);
              const toId = toNumId(item.toId);
              if (typeof selector !== "string" || !selector.trim()) { ctx && ctx.reasons.push("adapter: sc.migrate selector invalid"); return { ok: false }; }
              if (fromId == null || toId == null) { ctx && ctx.reasons.push("adapter: sc.migrate fromId/toId invalid"); return { ok: false }; }
              selectorScope = { mode: "migrate", source: { selector: selector }, fromEditId: fromId, toEditId: toId, marker: item.marker };
              continue;
            }

            // template ops
            if (op === "tpl.removeNode") {
              const id = toNumId(item.id);
              if (id == null) { ctx && ctx.reasons.push("adapter: tpl.removeNode id invalid"); return { ok: false }; }
              if (!ensureNoExclusiveConflict(id, "removeNode")) { ctx && ctx.reasons.push("adapter: tpl.removeNode conflict id=" + id); return { ok: false }; }
              getTplPatch(id).removeNode = true;
              continue;
            }

            if (op === "tpl.setText") {
              const id = toNumId(item.id);
              if (id == null || typeof item.text !== "string") { ctx && ctx.reasons.push("adapter: tpl.setText invalid"); return { ok: false }; }
              if (!ensureNoExclusiveConflict(id, "setText")) { ctx && ctx.reasons.push("adapter: tpl.setText conflict id=" + id); return { ok: false }; }
              getTplPatch(id).setText = String(item.text);
              continue;
            }

            if (op === "tpl.replaceNode") {
              const id = toNumId(item.id);
              const html = String(item.html || item.node || "");
              if (id == null || !validateHtml(html)) { ctx && ctx.reasons.push("adapter: tpl.replaceNode invalid"); return { ok: false }; }
              if (!ensureNoExclusiveConflict(id, "replaceNode")) { ctx && ctx.reasons.push("adapter: tpl.replaceNode conflict id=" + id); return { ok: false }; }
              getTplPatch(id).replaceNode = html;
              continue;
            }

            if (op === "tpl.insert") {
              const id = toNumId(item.id);
              const position = String(item.position || "");
              const html = String(item.html || "");
              const mode = item.mode ? String(item.mode) : undefined;
              if (id == null || !/^(before|after|inside-start|inside-end)$/.test(position) || !validateHtml(html)) { ctx && ctx.reasons.push("adapter: tpl.insert invalid"); return { ok: false }; }
              if (mode && !/^(anchor|node)$/.test(mode)) { ctx && ctx.reasons.push("adapter: tpl.insert mode invalid"); return { ok: false }; }
              if (!ensureNoExclusiveConflict(id, "insert")) { ctx && ctx.reasons.push("adapter: tpl.insert conflict id=" + id); return { ok: false }; }
              getTplPatch(id).insert = { position, html, mode };
              continue;
            }

            if (op === "tpl.setAttr") {
              const id = toNumId(item.id);
              const key = item.key;
              const value = item.value;
              if (id == null || typeof key !== "string" || !key || typeof value !== "string") { ctx && ctx.reasons.push("adapter: tpl.setAttr invalid"); return { ok: false }; }
              if (!ensureNoExclusiveConflict(id, "attr")) { ctx && ctx.reasons.push("adapter: tpl.setAttr conflict id=" + id); return { ok: false }; }
              const p = getTplPatch(id);
              if (!p.set) p.set = {};
              p.set[key] = value;
              continue;
            }

            if (op === "tpl.removeAttr") {
              const id = toNumId(item.id);
              const key = item.key;
              if (id == null || typeof key !== "string" || !key) { ctx && ctx.reasons.push("adapter: tpl.removeAttr invalid"); return { ok: false }; }
              if (!ensureNoExclusiveConflict(id, "attr")) { ctx && ctx.reasons.push("adapter: tpl.removeAttr conflict id=" + id); return { ok: false }; }
              const p = getTplPatch(id);
              if (!p.remove) p.remove = [];
              p.remove.push(key);
              continue;
            }

            if (op === "tpl.mergeClass") {
              const id = toNumId(item.id);
              const klass = item.class;
              if (id == null || typeof klass !== "string" || !klass.trim()) { ctx && ctx.reasons.push("adapter: tpl.mergeClass invalid"); return { ok: false }; }
              if (!ensureNoExclusiveConflict(id, "attr")) { ctx && ctx.reasons.push("adapter: tpl.mergeClass conflict id=" + id); return { ok: false }; }
              const p = getTplPatch(id);
              p.mergeClass = trimSpaces((p.mergeClass ? p.mergeClass + " " : "") + klass);
              continue;
            }

            if (op === "tpl.removeClass") {
              const id = toNumId(item.id);
              const klass = item.class;
              if (id == null || typeof klass !== "string" || !klass.trim()) { ctx && ctx.reasons.push("adapter: tpl.removeClass invalid"); return { ok: false }; }
              if (!ensureNoExclusiveConflict(id, "attr")) { ctx && ctx.reasons.push("adapter: tpl.removeClass conflict id=" + id); return { ok: false }; }
              const p = getTplPatch(id);
              p.removeClass = trimSpaces((p.removeClass ? p.removeClass + " " : "") + klass);
              continue;
            }

            // semantic ops should have been consumed already
            if (op === "tpl.semanticLayout" || op === "tpl.moveSemantic") continue;

            // js ops
            if (/^js\./.test(op)) {
              if (!v2.script) v2.script = { ops: [] };
              v2.script.ops.push(JSON.parse(JSON.stringify(item)));
              continue;
            }

            // css ops
            if (/^css\./.test(op)) {
              if (!v2.style) v2.style = { ops: [] };
              v2.style.ops.push(JSON.parse(JSON.stringify(item)));
              continue;
            }

            ctx && ctx.reasons.push("adapter: unsupported op=" + op);
            return { ok: false };
          }

          if (selectorScope) v2.selectorScope = selectorScope;

          const tplItems = [];
          tplById.forEach((patch, idStr) => {
            tplItems.push({ editId: parseInt(idStr, 10), patch });
          });
          if (tplItems.length) v2.template = { byEditId: tplItems };

          if (!Object.keys(v2).length) { ctx && ctx.reasons.push("adapter: empty operations"); return { ok: false }; }
          return { ok: true, v2 };
        } catch (e) {
          ctx && ctx.reasons.push("adapter: exception " + (e && e.message ? e.message : String(e)));
          return { ok: false };
        }
      }
    },

    // ============================================================
    // selectorScope.migrate: move marker for an existing selector from one node to another
    // ============================================================
    selectorScope: {
      apply(sfcCode, scope, ctx) {
        if (!scope || scope.mode !== "migrate") return sfcCode;

        const tplBlock = findBlock(sfcCode, "template");
        const scrBlock = findBlock(sfcCode, "script"); // optional; used only to validate selector presence
        if (!tplBlock) { ctx && ctx.reasons.push("selectorScope: template block not found"); return sfcCode; }

        const selector = scope.source && typeof scope.source.selector === "string" ? scope.source.selector : "";
        if (!selector.trim()) { ctx && ctx.reasons.push("selectorScope: selector empty"); return sfcCode; }
        if (scrBlock && scrBlock.inner.indexOf(selector) === -1) { ctx && ctx.reasons.push("selectorScope: selector not found in script"); return sfcCode; }

        const fromId = scope.fromEditId, toId = scope.toEditId;
        if (typeof fromId !== "number" || typeof toId !== "number") { ctx && ctx.reasons.push("selectorScope: invalid ids"); return sfcCode; }

        const marker = Plugin.selectorScope._resolveMarker(selector, scope.marker);
        if (!marker) { ctx && ctx.reasons.push("selectorScope: unable to resolve marker"); return sfcCode; }

        let tpl = tplBlock.inner;
        const src = Plugin.template._locateOpenTagByEditId(tpl, fromId);
        const dst = Plugin.template._locateOpenTagByEditId(tpl, toId);
        if (!src || !dst) { ctx && ctx.reasons.push("selectorScope: from/to editId not found"); return sfcCode; }

        const srcRes = Plugin.selectorScope._removeMarkerFromOpenTag(src.openTag, marker);
        const dstRes = Plugin.selectorScope._addMarkerToOpenTag(dst.openTag, marker);
        if (!srcRes.changed && !dstRes.changed) { ctx && ctx.reasons.push("selectorScope: noop"); return sfcCode; }

        const reps = [
          { lt: src.lt, gt: src.gt, next: srcRes.openTag },
          { lt: dst.lt, gt: dst.gt, next: dstRes.openTag }
        ].sort((a, b) => b.lt - a.lt);

        for (const r of reps) {
          tpl = tpl.slice(0, r.lt) + r.next + tpl.slice(r.gt + 1);
        }

        Plugin._mark(ctx, "selectorScope.migrate", "迁移选择器标记");
        return sfcCode.slice(0, tplBlock.start) + tpl + sfcCode.slice(tplBlock.end);
      },

      _resolveMarker(selector, markerObj) {
        if (markerObj && typeof markerObj === "object") {
          const type = String(markerObj.type || "");
          const name = String(markerObj.name || "");
          if (type === "id") return { kind: "attr", key: "id", value: name || selector.replace(/^#/, "") };
          if (type === "ref") return { kind: "attr", key: "ref", value: name };
          if (type === "class") return { kind: "class", key: "class", value: name || selector.replace(/^\./, "") };
          if (type === "attr") return { kind: "attr", key: name, value: markerObj.value };
        }
        if (selector[0] === "#") return { kind: "attr", key: "id", value: selector.slice(1).trim() };
        if (selector[0] === ".") return { kind: "class", key: "class", value: selector.slice(1).trim() };
        const m = selector.match(/^\[\s*([^\]=\s]+)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\]\s]+)))?\s*\]$/);
        if (m) return { kind: "attr", key: m[1], value: (m[2] || m[3] || m[4]) };
        return null;
      },

      _parseOpenTag(openTag) {
        const m = String(openTag).match(/^<\s*([^\s/>]+)/);
        if (!m) return null;
        const tagName = m[1];
        let attrsText = openTag.slice(m[0].length, openTag.length - 1);
        let selfClose = false;
        if (/\/\s*$/.test(attrsText)) { selfClose = true; attrsText = attrsText.replace(/\/\s*$/, ""); }
        const leading = (/^\s*/.exec(attrsText) || [""])[0];
        const attrs = attrsText.trim();
        return { tagName, attrs, leading, selfClose };
      },

      _removeAttr(attrsStr, key) {
        const re = new RegExp("(?:^|\\s)" + escapeReg(key) + "(?:\\s*=\\s*(?:\"[^\"]*\"|'[^']*'|[^\\s\"'>]+))?", "g");
        return String(attrsStr).replace(re, " ").replace(/\s+/g, " ").trim();
      },

      _setAttr(attrsStr, key, val) {
        let out = Plugin.selectorScope._removeAttr(attrsStr, key).trim();
        out = (out ? out + " " : "") + key + "=\"" + String(val) + "\"";
        return out.trim();
      },

      _removeMarkerFromOpenTag(openTag, marker) {
        const p = Plugin.selectorScope._parseOpenTag(openTag);
        if (!p) return { changed: false, openTag };
        let { tagName, attrs, leading, selfClose } = p;
        const before = attrs;

        if (marker.kind === "attr") {
          attrs = Plugin.selectorScope._removeAttr(attrs, marker.key);
        } else if (marker.kind === "class") {
          const cm = attrs.match(/\bclass\s*=\s*"([^"]*)"/);
          if (cm) {
            const tokens = trimSpaces(cm[1]).split(" ").filter(Boolean);
            const next = tokens.filter((t) => t !== marker.value);
            if (next.length) attrs = attrs.replace(/\bclass\s*=\s*"[^"]*"/, 'class="' + trimSpaces(next.join(" ")) + '"');
            else attrs = Plugin.selectorScope._removeAttr(attrs, "class");
          }
        }

        if (attrs === before) return { changed: false, openTag };
        const rebuilt = "<" + tagName + (attrs ? (leading || " ") + attrs : "") + (selfClose ? " />" : ">");
        return { changed: true, openTag: rebuilt };
      },

      _addMarkerToOpenTag(openTag, marker) {
        const p = Plugin.selectorScope._parseOpenTag(openTag);
        if (!p) return { changed: false, openTag };
        let { tagName, attrs, leading, selfClose } = p;
        const before = attrs;

        if (marker.kind === "attr") {
          if (marker.value === undefined) return { changed: false, openTag };
          attrs = Plugin.selectorScope._setAttr(attrs, marker.key, marker.value);
        } else if (marker.kind === "class") {
          const cm = attrs.match(/\bclass\s*=\s*"([^"]*)"/);
          if (cm) {
            const tokens = trimSpaces(cm[1]).split(" ").filter(Boolean);
            if (tokens.indexOf(marker.value) === -1) tokens.push(marker.value);
            attrs = attrs.replace(/\bclass\s*=\s*"[^"]*"/, 'class="' + trimSpaces(tokens.join(" ")) + '"');
          } else {
            attrs = (attrs ? attrs + " " : "") + 'class="' + marker.value + '"';
          }
        }

        if (attrs === before) return { changed: false, openTag };
        const rebuilt = "<" + tagName + (attrs ? (leading || " ") + attrs : "") + (selfClose ? " />" : ">");
        return { changed: true, openTag: rebuilt };
      }
    },

    // ============================================================
    // template
    // ============================================================
    template: {
      apply(sfcCode, ops, ctx) {
        if (!ops || !Array.isArray(ops.byEditId) || ops.byEditId.length === 0) return sfcCode;
        let code0 = String(sfcCode || "");

        const seen = new Set();
        for (const it of ops.byEditId) {
          if (it && typeof it.editId === "number") {
            if (seen.has(it.editId)) { ctx && ctx.reasons.push("template: duplicate editId=" + it.editId); return sfcCode; }
            seen.add(it.editId);
          }
        }

        for (const it of ops.byEditId) {
          if (!it || typeof it.editId !== "number" || !it.patch) continue;
          code0 = Plugin.template.updateByEditId(code0, it.editId, it.patch, ctx);
        }
        return code0;
      },

      _getMaxEditIdFromTemplate(tpl) {
        let maxId = 0;
        String(tpl || "").replace(/data\s*[-–—]edit\s*[-–—]id\s*=\s*["'](\d+)["']/g, (_, n) => {
          const v = parseInt(n, 10);
          if (!isNaN(v) && v > maxId) maxId = v;
        });
        return maxId;
      },

      _htmlHasEditId(html) {
        return /data\s*[-–—]edit\s*[-–—]id\s*=/.test(String(html || ""));
      },

      instrumentTemplateFragment(raw, startId) {
        const src = String(raw || "");
        const len = src.length;
        let i = 0;
        let id = Math.max(1, parseInt(startId, 10) || 1);
        const out = [];

        function safeAttrBlock(rawAttrs) {
          if (rawAttrs === "" || rawAttrs.startsWith(" ")) return rawAttrs;
          return " " + rawAttrs;
        }

        while (i < len) {
          const ch = src[i];
          if (ch !== "<") { out.push(ch); i++; continue; }

          let j = i + 1;

          // comment
          if (src.startsWith("!--", j)) {
            const end = src.indexOf("-->", j + 3);
            if (end !== -1) { out.push(src.slice(i, end + 3)); i = end + 3; continue; }
            out.push("<"); i++; continue;
          }

          // closing tag
          if (src[j] === "/") {
            j++;
            while (j < len && src[j] !== ">") j++;
            if (j < len) { out.push(src.slice(i, j + 1)); i = j + 1; continue; }
            out.push("<"); i++; continue;
          }

          while (j < len && /\s/.test(src[j])) j++;
          const nameStart = j;
          while (j < len && /[A-Za-z0-9\-_]/.test(src[j])) j++;
          const tagName = src.slice(nameStart, j);
          if (!tagName) { out.push("<"); i++; continue; }

          const lower = tagName.toLowerCase();
          if (lower === "script" || lower === "style") {
            let startClose = j;
            while (startClose < len && src[startClose] !== ">") startClose++;
            if (startClose >= len) { out.push(src.slice(i)); break; }
            const endTag = "</" + lower + ">";
            const endIndex = src.toLowerCase().indexOf(endTag, startClose);
            if (endIndex !== -1) { out.push(src.slice(i, endIndex + endTag.length)); i = endIndex + endTag.length; continue; }
            out.push(src.slice(i)); break;
          }

          while (j < len && /\s/.test(src[j])) j++;
          const attrStart = j;

          let k = j;
          let inS = false, inD = false, braceDepth = 0;
          while (k < len) {
            const c = src[k];
            if (inS) { if (c === "'") inS = false; k++; continue; }
            if (inD) { if (c === '"') inD = false; k++; continue; }
            if (c === "'") { inS = true; k++; continue; }
            if (c === '"') { inD = true; k++; continue; }
            if (src.startsWith("{{", k)) { braceDepth++; k += 2; continue; }
            if (src.startsWith("}}", k)) { braceDepth = Math.max(0, braceDepth - 1); k += 2; continue; }
            if (!inS && !inD && braceDepth === 0) {
              if (c === ">") break;
              if (c === "/" && src[k + 1] === ">") { k++; break; }
            }
            k++;
          }

          const isSelfClose = src[k] === "/" && src[k + 1] === ">";
          const rawAttrs = src.slice(attrStart, k);
          const safeAttrs = safeAttrBlock(rawAttrs);
          const hasEdit = /data\s*[-–—]edit\s*[-–—]id\s*=/.test(src.slice(i, k + 1));

          if (isSelfClose) {
            if (hasEdit) out.push("<" + tagName + safeAttrs + " />");
            else out.push("<" + tagName + safeAttrs + ' data-edit-id="' + (id++) + '" />');
            i = k + 2;
            continue;
          }

          if (hasEdit) out.push("<" + tagName + safeAttrs + ">");
          else out.push("<" + tagName + safeAttrs + ' data-edit-id="' + (id++) + '">');
          i = k + 1;
        }

        return { html: out.join(""), nextId: id };
      },

      _locateOpenTagByEditId(tpl, editId) {
        const anchorRe = new RegExp("data\\s*[-–—]edit\\s*[-–—]id\\s*=\\s*[\"']" + editId + "[\"']");
        const m = anchorRe.exec(String(tpl || ""));
        if (!m) return null;
        const idx = m.index;
        let lt = idx;
        while (lt >= 0 && tpl[lt] !== "<") lt--;
        if (lt < 0) return null;
        const gt = scanToTagEnd(tpl, lt);
        if (gt === -1) return null;
        return { lt, gt, openTag: tpl.slice(lt, gt + 1) };
      },

      _locateAnchorByEditId(tpl, editId) {
        const re = new RegExp("data\\s*[-–—]edit\\s*[-–—]id\\s*=\\s*[\"']" + editId + "[\"']");
        const m = re.exec(String(tpl || ""));
        if (!m) return null;
        let lt = m.index;
        while (lt >= 0 && tpl[lt] !== "<") lt--;
        if (lt < 0) return null;
        const gt = scanToTagEnd(tpl, lt);
        if (gt === -1) return null;
        return { lt, gt };
      },

      _findNodeRange(tpl, lt, gt, openTag) {
        const selfClose = /\/>\s*$/.test(openTag);
        if (selfClose) return { lt, openEnd: gt, selfClose: true, closeStart: gt + 1, endIndex: gt + 1 };

        const m = openTag.match(/^<\s*([^\s/>]+)/);
        if (!m) return null;
        const tagName = m[1];
        const closeNeedle = "</" + tagName + ">";

        let depth = 1;
        let i = gt + 1;

        while (i < tpl.length) {
          const nextOpen = tpl.indexOf("<" + tagName, i);
          const nextClose = tpl.indexOf(closeNeedle, i);
          if (nextClose === -1) return null;

          let validOpen = -1;
          if (nextOpen !== -1 && tpl[nextOpen + 1] !== "/") validOpen = nextOpen;

          if (validOpen !== -1 && validOpen < nextClose) {
            const openEnd = scanToTagEnd(tpl, validOpen);
            if (openEnd === -1) return null;
            const openText = tpl.slice(validOpen, openEnd + 1);
            const isSelf = /\/>\s*$/.test(openText);
            if (!isSelf) depth++;
            i = openEnd + 1;
            continue;
          }

          depth--;
          if (depth === 0) {
            const closeStart = nextClose;
            const endIndex = nextClose + closeNeedle.length;
            return { lt, openEnd: gt, selfClose: false, closeStart, endIndex };
          }
          i = nextClose + closeNeedle.length;
        }
        return null;
      },

      updateByEditId(sfcCode, editId, patch, ctx) {
        const block = findBlock(sfcCode, "template");
        if (!block) {
          ctx && ctx.reasons.push("template: block not found");
          return sfcCode;
        }

        let tpl = block.inner;

        const loc = Plugin.template._locateOpenTagByEditId(tpl, editId);
        if (!loc) {
          ctx && ctx.reasons.push("template: editId=" + editId + " not found");
          return sfcCode;
        }

        let { lt, gt, openTag } = loc;

        const hasRemoveNode = patch && patch.removeNode === true;
        const hasInsert = patch && !!patch.insert;
        const hasSetText = patch && typeof patch.setText === "string";
        const hasReplaceNode = patch && typeof patch.replaceNode === "string";
        const hasAnyAttrPatch =
          !!(patch && patch.set && typeof patch.set === "object" && Object.keys(patch.set).length) ||
          !!(patch && Array.isArray(patch.remove) && patch.remove.length) ||
          !!(patch && patch.mergeClass) ||
          !!(patch && patch.removeClass);

        const exclCount = [hasRemoveNode, hasInsert, hasSetText, hasReplaceNode].filter(Boolean).length;
        if (exclCount > 1 || (exclCount === 1 && hasAnyAttrPatch)) {
          ctx && ctx.reasons.push("template: invalid patch conflict editId=" + editId);
          return sfcCode;
        }

        /* ================= replaceNode ================= */
        if (hasReplaceNode) {
          let html = String(patch.replaceNode || "");
          if (!html || html[0] !== "<") {
            ctx && ctx.reasons.push("template: invalid replaceNode.html");
            return sfcCode;
          }

          const range = Plugin.template._findNodeRange(tpl, lt, gt, openTag);
          if (!range) {
            ctx && ctx.reasons.push("template: replaceNode range fail editId=" + editId);
            return sfcCode;
          }

          if (!Plugin.template._htmlHasEditId(html)) {
            const maxId = Plugin.template._getMaxEditIdFromTemplate(tpl);
            html = Plugin.template.instrumentTemplateFragment(html, maxId + 1).html;
          }

          tpl = tpl.slice(0, range.lt) + html + tpl.slice(range.endIndex);
          Plugin._mark(ctx, "template.replaceNode", "替换节点 editId=" + editId);

          return sfcCode.slice(0, block.start) + tpl + sfcCode.slice(block.end);
        }

        /* ================= removeNode ================= */
        if (hasRemoveNode) {
          const range = Plugin.template._findNodeRange(tpl, lt, gt, openTag);
          if (!range) return sfcCode;

          tpl = tpl.slice(0, range.lt) + tpl.slice(range.endIndex);
          Plugin._mark(ctx, "template.removeNode", "删除节点 editId=" + editId);

          return sfcCode.slice(0, block.start) + tpl + sfcCode.slice(block.end);
        }

        /* ================= insert ================= */
        if (hasInsert) {
          const pos = String(patch.insert.position || "");
          let html = String(patch.insert.html || "");
          const mode = String(patch.insert.mode || "node");

          if (!/^(before|after|inside-start|inside-end)$/.test(pos)) {
            ctx && ctx.reasons.push("template: invalid insert.position");
            return sfcCode;
          }
          if (!html || html[0] !== "<") {
            ctx && ctx.reasons.push("template: invalid insert.html");
            return sfcCode;
          }

          const isInsideInsert =
            (pos === "inside-start" || pos === "inside-end") && mode !== "anchor";

          if (isInsideInsert) {
            const highRisk = _overlayIsHighRiskInsertTarget(openTag);
            if (highRisk) {
              const rel = _overlayEnsureParentRelative(tpl, lt, gt, openTag);
              if (rel.changed) {
                tpl = rel.tpl;
                Plugin._mark(ctx, "template.overlayParentRelative", "Overlay插入：父容器设为relative editId=" + editId);

                const loc2 = Plugin.template._locateOpenTagByEditId(tpl, editId);
                if (!loc2) {
                  ctx && ctx.reasons.push("template: editId=" + editId + " not found after relative patch");
                  return sfcCode;
                }
                ({ lt, gt, openTag } = loc2);
              }
              html = _overlayRewriteHtmlV1(html);
            }
          }

          if (!Plugin.template._htmlHasEditId(html)) {
            const maxId = Plugin.template._getMaxEditIdFromTemplate(tpl);
            html = Plugin.template.instrumentTemplateFragment(html, maxId + 1).html;
          }

          if (mode === "anchor") {
            if (pos === "inside-start" || pos === "inside-end") {
              ctx && ctx.reasons.push("template: insert inside not allowed for anchor mode");
              return sfcCode;
            }
            const anch = Plugin.template._locateAnchorByEditId(tpl, editId);
            if (!anch) {
              ctx && ctx.reasons.push("template: anchor not found editId=" + editId);
              return sfcCode;
            }
            const insertAt = pos === "before" ? anch.lt : anch.gt + 1;
            tpl = tpl.slice(0, insertAt) + html + tpl.slice(insertAt);
            Plugin._mark(ctx, "template.insert", "插入节点(anchor) editId=" + editId);

            return sfcCode.slice(0, block.start) + tpl + sfcCode.slice(block.end);
          }

          const nodeRange = Plugin.template._findNodeRange(tpl, lt, gt, openTag);
          if (!nodeRange) return sfcCode;

          let insertAt;
          if (pos === "before") insertAt = nodeRange.lt;
          else if (pos === "after") insertAt = nodeRange.endIndex;
          else {
            if (nodeRange.selfClose) {
              ctx && ctx.reasons.push("template: insert.inside on self-closing");
              return sfcCode;
            }
            insertAt =
              pos === "inside-start"
                ? nodeRange.openEnd + 1
                : nodeRange.closeStart;
          }

          tpl = tpl.slice(0, insertAt) + html + tpl.slice(insertAt);
          Plugin._mark(ctx, "template.insert", "插入节点 editId=" + editId);

          return sfcCode.slice(0, block.start) + tpl + sfcCode.slice(block.end);
        }

        /* ================= setText ================= */
        if (hasSetText) {
          const nodeRange = Plugin.template._findNodeRange(tpl, lt, gt, openTag);
          if (!nodeRange || nodeRange.selfClose) {
            ctx && ctx.reasons.push("template: setText invalid");
            return sfcCode;
          }
          const newInner = escapeHtml(patch.setText);
          tpl =
            tpl.slice(0, nodeRange.openEnd + 1) +
            newInner +
            tpl.slice(nodeRange.closeStart);
          Plugin._mark(ctx, "template.setText", "设置文本 editId=" + editId);

          return sfcCode.slice(0, block.start) + tpl + sfcCode.slice(block.end);
        }

        /* ================= attr patches ================= */
        const tagNameMatch = openTag.match(/^<\s*([^\s/>]+)/);
        if (!tagNameMatch) return sfcCode;

        const tagName = tagNameMatch[1];
        let attrsText = openTag.slice(tagNameMatch[0].length, openTag.length - 1);
        let selfClose = false;
        if (/\/\s*$/.test(attrsText)) {
          selfClose = true;
          attrsText = attrsText.replace(/\/\s*$/, "");
        }

        const leading = (/^\s*/.exec(attrsText) || [""])[0];
        let attrs = attrsText.trim();
        const beforeAttrs = attrs;

        function removeAttr(str, key) {
          const re = new RegExp("(?:^|\\s)" + escapeReg(key) + "(?:\\s*=\\s*(?:\"[^\"]*\"|'[^']*'|[^\\s\"'>]+))?", "g");
          return str.replace(re, " ").replace(/\s+/g, " ").trim();
        }

        function setAttr(str, key, val) {
          return (removeAttr(str, key) + " " + key + '="' + val + '"').trim();
        }

        function getClassTokens(str) {
          const m = str.match(/\bclass\s*=\s*"([^"]*)"/);
          return m ? m[1].trim().split(/\s+/).filter(Boolean) : null;
        }

        function setClassTokens(str, tokens) {
          const next = tokens.join(" ");
          if (!next) return removeAttr(str, "class");
          if (/\bclass\s*=/.test(str))
            return str.replace(/\bclass\s*=\s*"[^"]*"/, 'class="' + next + '"');
          return (str + ' class="' + next + '"').trim();
        }

        if (patch.remove) for (const k of patch.remove) attrs = removeAttr(attrs, k);
        if (patch.set) for (const k in patch.set) attrs = setAttr(attrs, k, patch.set[k]);
        if (patch.mergeClass) {
          const tokens = getClassTokens(attrs) || [];
          for (const t of patch.mergeClass.split(/\s+/)) if (!tokens.includes(t)) tokens.push(t);
          attrs = setClassTokens(attrs, tokens);
        }
        if (patch.removeClass) {
          const tokens = getClassTokens(attrs);
          if (tokens)
            attrs = setClassTokens(
              attrs,
              tokens.filter(t => !patch.removeClass.split(/\s+/).includes(t))
            );
        }

        if (attrs === beforeAttrs) {
          ctx && ctx.reasons.push("template: noop editId=" + editId);
          return sfcCode;
        }

        const rebuilt =
          "<" +
          tagName +
          (attrs ? (leading || " ") + attrs : "") +
          (selfClose ? " />" : ">");

        tpl = tpl.slice(0, lt) + rebuilt + tpl.slice(gt + 1);
        Plugin._mark(ctx, "template.attr", "更新属性 editId=" + editId);

        return sfcCode.slice(0, block.start) + tpl + sfcCode.slice(block.end);
      },

      // move a node relative to another by editId (semantic)
      moveSemanticByEditId(sfcCode, fromEditId, toEditId, where, ctx) {
        const block = findBlock(sfcCode, "template");
        if (!block) return sfcCode;
        let tpl = block.inner;

        const fromLoc = Plugin.template._locateOpenTagByEditId(tpl, fromEditId);
        const toLoc = Plugin.template._locateOpenTagByEditId(tpl, toEditId);
        if (!fromLoc || !toLoc) return sfcCode;

        const fromRange = Plugin.template._findNodeRange(tpl, fromLoc.lt, fromLoc.gt, fromLoc.openTag);
        if (!fromRange) return sfcCode;

        const fromHtml = tpl.slice(fromRange.lt, fromRange.endIndex);
        let without = tpl.slice(0, fromRange.lt) + tpl.slice(fromRange.endIndex);

        const toLoc2 = Plugin.template._locateOpenTagByEditId(without, toEditId);
        if (!toLoc2) return sfcCode;

        const toRange = Plugin.template._findNodeRange(without, toLoc2.lt, toLoc2.gt, toLoc2.openTag);
        if (!toRange) return sfcCode;

        let insertAt = null;
        const w = String(where || "");
        if (w === "left" || w === "before") insertAt = toRange.lt;
        else if (w === "right" || w === "after") insertAt = toRange.endIndex;
        else if (w === "inside-start") {
          if (toRange.selfClose) return sfcCode;
          insertAt = toRange.openEnd + 1;
        } else if (w === "inside-end") {
          if (toRange.selfClose) return sfcCode;
          insertAt = toRange.closeStart;
        } else if (w === "replace") {
          without = without.slice(0, toRange.lt) + without.slice(toRange.endIndex);
          insertAt = toRange.lt;
        } else {
          return sfcCode;
        }

        const nextTpl = without.slice(0, insertAt) + fromHtml + without.slice(insertAt);
        if (nextTpl === tpl) return sfcCode;

        Plugin._mark(ctx, "template.moveSemantic", "移动节点(语义) " + w);
        return sfcCode.slice(0, block.start) + nextTpl + sfcCode.slice(block.end);
      },

      // get immediate parent open-tag start index for a given node open-tag position (best-effort stack scan)
      _getImmediateParentLtAt(tpl, nodeLt) {
        const s = String(tpl || "");
        const target = Math.max(0, Math.min(s.length, Number(nodeLt || 0)));
        const stack = [];

        let i = 0;
        while (i < target) {
          const lt = s.indexOf("<", i);
          if (lt < 0 || lt >= target) break;

          // Skip comments
          if (s.startsWith("<!--", lt)) {
            const endC = s.indexOf("-->", lt + 4);
            if (endC < 0) break;
            i = endC + 3;
            continue;
          }

          const gt = scanToTagEnd(s, lt);
          if (gt < 0) break;

          const raw = s.slice(lt, gt + 1);
          // Skip doctype / declarations
          if (/^<\s*!/i.test(raw) || /^<\s*\?/i.test(raw)) { i = gt + 1; continue; }

          // Close tag
          const cm = raw.match(/^<\s*\/\s*([^\s>]+)\s*>/);
          if (cm) {
            const name = cm[1];
            // pop until matching
            for (let k = stack.length - 1; k >= 0; k--) {
              if (stack[k].tagName === name) { stack.length = k; break; }
            }
            i = gt + 1;
            continue;
          }

          const p = Plugin.selectorScope._parseOpenTag(raw);
          if (!p) { i = gt + 1; continue; }

          const tagName = p.tagName;
          const selfClose = !!p.selfClose;

          // Treat common void tags as selfClose to keep stack sane
          const voidTag = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i.test(tagName);

          if (!selfClose && !voidTag) {
            stack.push({ tagName, lt, gt, openTag: raw });
          }

          i = gt + 1;
        }

        if (!stack.length) return null;
        return stack[stack.length - 1].lt;
      },

      // swap two sibling nodes under the same immediate parent by editId (atomic semantic op)
      swapSemanticByEditId(sfcCode, idA, idB, ctx) {
        const block = findBlock(sfcCode, "template");
        if (!block) return sfcCode;
        const tpl = block.inner;

        const aLoc = Plugin.template._locateOpenTagByEditId(tpl, idA);
        const bLoc = Plugin.template._locateOpenTagByEditId(tpl, idB);
        if (!aLoc || !bLoc) return sfcCode;

        // best-effort: enforce same immediate parent to prevent cross-tree swap
        const aParentLt = Plugin.template._getImmediateParentLtAt(tpl, aLoc.lt);
        const bParentLt = Plugin.template._getImmediateParentLtAt(tpl, bLoc.lt);
        if (aParentLt == null || bParentLt == null || aParentLt !== bParentLt) return sfcCode;

        const aRange = Plugin.template._findNodeRange(tpl, aLoc.lt, aLoc.gt, aLoc.openTag);
        const bRange = Plugin.template._findNodeRange(tpl, bLoc.lt, bLoc.gt, bLoc.openTag);
        if (!aRange || !bRange) return sfcCode;

        // disallow overlap / nesting
        const a0 = aRange.lt, a1 = aRange.endIndex;
        const b0 = bRange.lt, b1 = bRange.endIndex;
        if (!(a1 <= b0 || b1 <= a0)) return sfcCode;

        let nextTpl = tpl;

        if (a0 < b0) {
          const segA = tpl.slice(a0, a1);
          const segB = tpl.slice(b0, b1);
          nextTpl =
            tpl.slice(0, a0) +
            segB +
            tpl.slice(a1, b0) +
            segA +
            tpl.slice(b1);
        } else {
          const segB = tpl.slice(b0, b1);
          const segA = tpl.slice(a0, a1);
          nextTpl =
            tpl.slice(0, b0) +
            segA +
            tpl.slice(b1, a0) +
            segB +
            tpl.slice(a1);
        }

        if (nextTpl === tpl) return sfcCode;
        Plugin._mark(ctx, "template.swapSemantic", "交换节点(语义) " + idA + " <-> " + idB);
        return sfcCode.slice(0, block.start) + nextTpl + sfcCode.slice(block.end);
      },

      // wrap several sibling nodes with a layout wrapper
      semanticLayoutWrapByEditIds(sfcCode, op, ctx) {
        const layout = String(op && (op.clayout || op.layout) || "").trim();
        const nodes0 = (op && Array.isArray(op.nodes)) ? op.nodes : [];
        const nodes = nodes0.map((x) => (typeof x === "number" ? x : (typeof x === "string" && /^\d+$/.test(x) ? parseInt(x, 10) : null))).filter((n) => n != null);

        if (!layout || nodes.length < 2) return sfcCode;

        const block = findBlock(sfcCode, "template");
        if (!block) return sfcCode;
        let tpl = block.inner;

        const ranges = [];
        for (const id of nodes) {
          const loc = Plugin.template._locateOpenTagByEditId(tpl, id);
          if (!loc) return sfcCode;
          const rng = Plugin.template._findNodeRange(tpl, loc.lt, loc.gt, loc.openTag);
          if (!rng) return sfcCode;
          ranges.push({ id, lt: rng.lt, end: rng.endIndex });
        }

        ranges.sort((a, b) => a.lt - b.lt);
        for (let i = 1; i < ranges.length; i++) {
          if (ranges[i].lt < ranges[i - 1].end) return sfcCode; // overlap or ancestor
        }

        const gapClass = String((op && op.gapClass) || "tw-gap-3").trim();
        const extra = String((op && op.wrapperClass) || "").trim();

        let wrapperClass = "";
        if (layout === "group") wrapperClass = trimSpaces("tw-flex tw-items-center " + gapClass + (extra ? " " + extra : ""));
        else if (layout === "stack") wrapperClass = trimSpaces("tw-flex tw-flex-col " + gapClass + (extra ? " " + extra : ""));
        else if (layout === "grid") {
          const cols = (op && typeof op.cols === "number" && isFinite(op.cols) && op.cols > 0) ? Math.floor(op.cols) : ranges.length;
          wrapperClass = trimSpaces("tw-grid tw-grid-cols-" + cols + " " + gapClass + (extra ? " " + extra : ""));
        } else return sfcCode;

        const wrapperId = Plugin.template._getMaxEditIdFromTemplate(tpl) + 1;
        const open = '<div class="' + wrapperClass + '" data-edit-id="' + wrapperId + '">';
        const close = "</div>";

        const chunks = [];
        for (let i = ranges.length - 1; i >= 0; i--) {
          const r = ranges[i];
          chunks.unshift(tpl.slice(r.lt, r.end));
          tpl = tpl.slice(0, r.lt) + tpl.slice(r.end);
        }

        const insertAt = ranges[0].lt;
        tpl = tpl.slice(0, insertAt) + (open + chunks.join("") + close) + tpl.slice(insertAt);

        Plugin._mark(ctx, "template.semanticLayout", "布局语义包装 " + layout);
        return sfcCode.slice(0, block.start) + tpl + sfcCode.slice(block.end);
      }
    },

    // ============================================================
    // script (AST-like safe editor for export default object)
    // Supports:
    // - js.data.add / js.data.update / js.data.remove
    // - js.methods.add / js.methods.update / js.methods.remove
    // - js.computed.add / js.computed.update / js.computed.remove
    // - js.watch.add / js.watch.update / js.watch.remove
    //
    // NOTE:
    // - data values MUST be JSON-serializable (no functions).
    // - methods/computed/watch bodies are raw JS statement strings.
    // - This is a conservative "AST-like" editor: it uses brace-matching and
    //   top-level object parsing rather than a full JS parser, to stay dependency-free.
    // ============================================================
    script: {
      /* ============================================================
       * Apply script operations (add, update, delete) to the DSL
       * ============================================================ */
      apply(sfcCode, scriptOps, ctx) {
        if (!scriptOps || !Array.isArray(scriptOps.ops) || scriptOps.ops.length === 0) return sfcCode;

        const block = findBlock(sfcCode, "script");

        // Parse the SFC code into a DSL object
        let dsl = webCpu.getDslObj(sfcCode);

        let changed = false;

        for (const op of scriptOps.ops) {
          if (!isPlainObject(op) || typeof op.op !== "string") {
            ctx && ctx.reasons.push("script: invalid op item");
            continue;
          }
          const name = op.op;

          // Handle data operations
          if (name.startsWith("js.data.") || name.startsWith("js.root.")) {
            const path = op.path?.trim();
            if (!path) {
              ctx && ctx.reasons.push("script: data path invalid");
              continue;
            }
            if (name.startsWith("js.root.")) {
              const rootKey = path.split(".")[0];
              const ok = this._opRootProp(dsl, name, rootKey, op, ctx);
              if (ok) changed = true;
              else ctx && ctx.reasons.push("[script.root] failed: " + rootKey);
            }
            else {
              const ok = this._opData(dsl, name, path, op, ctx);
              if (ok) changed = true;
              else ctx && ctx.reasons.push("[script.data] failed: " + path);
            }

            continue;
          }

          // Handle method operations
          if (name.startsWith("js.methods.")) {
            const mname = op.name?.trim();
            if (!mname) {
              ctx && ctx.reasons.push("script: methods name invalid");
              continue;
            }
            const ok = this._opMethods(dsl, name, mname, op, ctx);
            if (ok) changed = true;
            else ctx && ctx.reasons.push("[script.methods] failed: " + mname);
            continue;
          }

          // Handle computed properties operations
          if (name.startsWith("js.computed.")) {
            const cname = op.name?.trim();
            if (!cname) {
              ctx && ctx.reasons.push("script: computed name invalid");
              continue;
            }
            const ok = this._opComputed(dsl, name, cname, op, ctx);
            if (ok) changed = true;
            else ctx && ctx.reasons.push("[script.computed] failed: " + cname);
            continue;
          }

          // Handle watcher operations
          if (name.startsWith("js.watch.")) {
            const wpath = op.path?.trim();
            if (!wpath) {
              ctx && ctx.reasons.push("script: watch path invalid");
              continue;
            }
            const ok = this._opWatch(dsl, name, wpath, op, ctx);
            if (ok) changed = true;
            else ctx && ctx.reasons.push("[script.watch] failed: " + wpath);
            continue;
          }

          // Unsupported operation
          ctx && ctx.reasons.push("script: unsupported op=" + name);
        }

        if (!changed) {
          ctx && ctx.reasons.push("script: noop");
          return sfcCode;
        }

        // Convert the modified DSL object back to exportable Vue code
        const nextScr = this._stringifyExportDefaultFromObj(dsl, ctx);
        if (!nextScr) {
          ctx && ctx.reasons.push("script: stringify failed");
          return sfcCode;
        }

        Plugin._mark(ctx, "script.apply", "更新 script");
        return sfcCode.slice(0, block.start) + nextScr + sfcCode.slice(block.end);
      },

      // Helper to stringify the modified DSL object back into exportable code
      _stringifyExportDefaultFromObj(dsl, ctx) {
        try {
          const exportStr = `export default 
          ${WebTool.objectToString(dsl)};`;
          return exportStr.trim();
        } catch (error) {
          ctx && ctx.reasons.push("script.stringifyExportDefaultFromObj: " + error.message);
          return null;
        }
      },

      /**
     * 执行 data 函数修改指令
     * @param {string} dataFuncStr data函数的完整函数体字符串 (包含最外层的 { ... })
     * @param {string} name 指令名称 (js.data.add / js.data.update / js.data.remove)
     * @param {string} path 属性名 (key)
     * @param {object} op 指令对象 (包含 value, raw)
     */
      _runDataOp(dataFuncStr, name, path, op) {
        // 1. 定位 return 语句及其后的对象起始位置
        // 匹配 return { 或 return{，忽略空白
        const returnMatch = dataFuncStr.match(/return\s*\{/);
        if (!returnMatch) return dataFuncStr; // 没找到 return 语句，原样返回

        // 计算 return 对象左大括号在整个字符串中的索引
        const startIdx = returnMatch.index + returnMatch[0].indexOf('{');

        // 2. 寻找匹配的右大括号 (处理嵌套结构)
        let braceCount = 0;
        let endIdx = -1;
        for (let i = startIdx; i < dataFuncStr.length; i++) {
          if (dataFuncStr[i] === '{') braceCount++;
          else if (dataFuncStr[i] === '}') braceCount--;

          if (braceCount === 0) {
            endIdx = i;
            break;
          }
        }
        if (endIdx === -1) return dataFuncStr; // 结构不完整

        // 3. 提取 return 对象内部的原始内容字符串
        const content = dataFuncStr.substring(startIdx + 1, endIdx);

        // 4. 解析现有键值对 (核心扫描器)
        const kvMap = new Map();

        let currentKey = "";
        let currentValue = "";
        let mode = "key"; // 当前正在解析 'key' 还是 'value'
        let depth = 0;    // 括号深度 () [] {}
        let inString = null; // 字符串状态: null, ', ", `

        for (let i = 0; i < content.length; i++) {
          const char = content[i];
          const prevChar = i > 0 ? content[i - 1] : null;

          // --- A. 字符串状态处理 ---
          // 如果遇到引号，且不在字符串中 -> 进入字符串模式
          if (!inString && (char === '"' || char === "'" || char === '`')) {
            inString = char;
            if (mode === "key") currentKey += char;
            else currentValue += char;
            continue;
          }
          // 如果在字符串中
          if (inString) {
            if (mode === "key") currentKey += char;
            else currentValue += char;
            // 检查是否闭合引号 (且未转义)
            if (char === inString && prevChar !== '\\') {
              inString = null;
            }
            continue; // 字符串内部忽略所有分隔符
          }

          // --- B. 结构字符处理 (仅在非字符串模式下) ---
          if (['{', '[', '('].includes(char)) depth++;
          if (['}', ']', ')'].includes(char)) depth--;

          // 当不在嵌套结构中时，才识别分隔符
          if (depth === 0) {
            // 冒号：键值分隔
            if (char === ':' && mode === "key") {
              mode = "value";
              continue;
            }
            // 逗号：属性分隔
            else if (char === ',' || i === content.length - 1) {
              // 补全最后一个字符
              if (i === content.length - 1 && char !== ',') currentValue += char;

              const k = currentKey.trim();
              if (k) {
                kvMap.set(k, currentValue.trim());
              }
              // 重置状态
              currentKey = "";
              currentValue = "";
              mode = "key";
              continue;
            }
          }

          // --- C. 普通字符累加 ---
          if (mode === "key") currentKey += char;
          else currentValue += char;
        }

        // 5. 执行指令修改逻辑
        if (name === 'js.data.remove') {
          kvMap.delete(path);
        } else {
          // js.data.add 或 js.data.update
          let finalValue = op.value;

          // 处理 raw 标识
          if (!op.raw && typeof finalValue === 'string') {
            // 如果不是 raw 模式，且是字符串，需要加引号转义
            finalValue = JSON.stringify(finalValue);
          } else {
            // raw 模式，或者是数字/布尔值，直接转字符串使用
            finalValue = String(finalValue);
          }

          kvMap.set(path, finalValue);
        }

        // 6. 重新组装代码
        // 使用 \n    缩进格式化，保持代码整洁
        const newInner = Array.from(kvMap.entries())
          .map(([k, v]) => `\n      ${k}: ${v}`)
          .join(',');

        // 拼接：前段代码 + { 新内容 } + 后段代码
        return dataFuncStr.substring(0, startIdx) +
          `{${newInner}\n    }` +
          dataFuncStr.substring(endIdx + 1);
      },

      // Functions to handle operations on data, methods, computed, watch, and root properties
      _opData(dsl, name, path, op, ctx) {

        // 获取 `data()` 函数返回的对象内容
        let dataFuncStr = _extractFullComponent(dsl.data).body;
        let dataObj = null;

        try {
          // 通过 `new Function` 动态评估 `data()` 函数中的对象
          dataObj = dsl.data();
        } catch (error) {
          ctx && ctx.reasons.push("script.data: 评估 data 函数失败");
          return false;
        }
        dataFuncStr = this._runDataOp(dataFuncStr, name, path, op);
        dsl.data = new Function(dataFuncStr);
        return true;
      },

      _opMethods(dsl, name, mname, op, ctx) {
        switch (name) {
          case "js.methods.add":
            if (dsl.methods[mname]) {
              ctx && ctx.reasons.push("script.methods.add: method already exists");
              return false;
            }
            dsl.methods[mname] = new Function(op.body);
            break;
          case "js.methods.update":
            dsl.methods[mname] = new Function(op.body);
            break;
          case "js.methods.remove":
            if (!dsl.methods[mname]) {
              ctx && ctx.reasons.push("script.methods.remove: method not found");
              return false;
            }
            delete dsl.methods[mname];
            break;
          default:
            ctx && ctx.reasons.push("script.methods: unsupported operation " + name);
            return false;
        }

        return true;
      },

      _opComputed(dsl, name, cname, op, ctx) {
        switch (name) {
          case "js.computed.add":
            if (dsl.computed[cname]) {
              ctx && ctx.reasons.push("script.computed.add: computed property already exists");
              return false;
            }
            dsl.computed[cname] = new Function(op.body);
            break;
          case "js.computed.update":
            if (!dsl.computed[cname]) {
              ctx && ctx.reasons.push("script.computed.update: computed property not found");
              return false;
            }
            dsl.computed[cname] = new Function(op.body);
            break;
          case "js.computed.remove":
            if (!dsl.computed[cname]) {
              ctx && ctx.reasons.push("script.computed.remove: computed property not found");
              return false;
            }
            delete dsl.computed[cname];
            break;
          default:
            ctx && ctx.reasons.push("script.computed: unsupported operation " + name);
            return false;
        }

        return true;
      },

      _opWatch(dsl, name, wpath, op, ctx) {
        switch (name) {
          case "js.watch.add":
            if (dsl.watch[wpath]) {
              ctx && ctx.reasons.push("script.watch.add: watcher already exists");
              return false;
            }
            dsl.watch[wpath] = op.handler;
            break;
          case "js.watch.update":
            dsl.watch[wpath] = op.handler;
            break;
          case "js.watch.remove":
            if (!dsl.watch[wpath]) {
              ctx && ctx.reasons.push("script.watch.remove: watcher not found");
              return false;
            }
            delete dsl.watch[wpath];
            break;
          default:
            ctx && ctx.reasons.push("script.watch: unsupported operation " + name);
            return false;
        }

        return true;
      },

      _opRootProp(dsl, name, rootKey, op, ctx) {
        switch (name) {
          case "js.root.add":
            if (op.body) {
              if (dsl[rootKey].hasOwnProperty(op.path)) {
                ctx && ctx.reasons.push("script.root.add: key already exists");
                return false;
              }
              dsl[op.path] = new Function(op.body);
            }
            else {
              if (dsl[rootKey].hasOwnProperty(op.path)) {
                ctx && ctx.reasons.push("script.root.add: key already exists");
                return false;
              }
              // 如果 raw 为 true，直接存储表达式并在运行时动态计算
              dsl[op.path] = op.raw ? this._evaluateExpression(op.value, ctx) : op.value;
            }
            break;
          case "js.root.update":
            if (op.body) {
              dsl[op.path] = new Function(op.body);
            }
            else {
              // 如果 raw 为 true，直接存储表达式并在运行时动态计算
              dsl[op.path] = op.raw ? this._evaluateExpression(op.value, ctx) : op.value;
            }
            break;
          case "js.root.remove":
            if (!dsl.hasOwnProperty(op.path)) {
              ctx && ctx.reasons.push("script.root.remove: key not found");
              return false;
            }
            delete dsl[op.path];
            break;
          default:
            ctx && ctx.reasons.push("script.root: unsupported operation " + name);
            return false;
        }

        return true;
      },

      // 评估表达式并返回动态计算的结果
      _evaluateExpression(value, ctx) {
        if (typeof value !== "string") {
          return value;
        }
        try {
          // 使用 new Function 评估表达式，确保动态计算
          const computedValue = new Function("return " + value)();
          return computedValue;
        } catch (error) {
          ctx && ctx.reasons.push("script.root: 表达式评估失败 " + value);
          return undefined;
        }
      }
    },

    // ============================================================
    // style
    // Supports:
    // - css.add     {op:"css.add", selector:string, body:string}
    // - css.update  {op:"css.update", selector:string, body:string}
    // - css.remove  {op:"css.remove", selector:string}
    //
    // Implementation: scoped <style> text block editor, selector-level replacement.
    // ============================================================
    style: {
      apply(sfcCode, styleOps, ctx) {
        if (!styleOps || !Array.isArray(styleOps.ops) || styleOps.ops.length === 0) return sfcCode;

        const block = findBlock(sfcCode, "style");
        if (!block) { ctx && ctx.reasons.push("style: block not found"); return sfcCode; }

        let css = block.inner;

        for (const op of styleOps.ops) {
          if (!isPlainObject(op) || typeof op.op !== "string") { ctx && ctx.reasons.push("style: invalid op item"); return sfcCode; }
          const name = op.op;

          if (name === "css.add" || name === "css.update") {
            const selector = (typeof op.selector === "string") ? op.selector.trim() : "";
            const body = (typeof op.body === "string") ? op.body : "";
            if (!selector) { ctx && ctx.reasons.push("style: selector invalid"); return sfcCode; }

            const next = Plugin.style._upsertRule(css, selector, body, name === "css.add", ctx);
            if (next == null) return sfcCode;
            css = next;
            Plugin._mark(ctx, name, (name === "css.add" ? "新增" : "更新") + " 样式: " + selector);
            continue;
          }

          if (name === "css.remove") {
            const selector = (typeof op.selector === "string") ? op.selector.trim() : "";
            if (!selector) { ctx && ctx.reasons.push("style: selector invalid"); return sfcCode; }
            const next = Plugin.style._removeRule(css, selector);
            if (next == null) return sfcCode;
            css = next;
            Plugin._mark(ctx, name, "删除样式: " + selector);
            continue;
          }

          ctx && ctx.reasons.push("style: unsupported op=" + name);
          return sfcCode;
        }

        return sfcCode.slice(0, block.start) + css + sfcCode.slice(block.end);
      },

      _escapeSelector(selector) {
        // very small escape: spaces and special chars are left as-is, we wrap in a regex by escaping braces and slashes
        return String(selector || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      },

      _findRule(cssText, selector) {
        const esc = Plugin.style._escapeSelector(selector);
        // best-effort: match "selector { ... }" with brace-matching
        const re = new RegExp("(^|\n)\s*" + esc + "\s*\{", "m");
        const m = re.exec(cssText);
        if (!m) return null;
        const brace = cssText.indexOf("{", m.index);
        const end = Plugin.script._matchBrace(cssText, brace);
        if (end === -1) return null;
        return { start: m.index, braceStart: brace, end: end };
      },

      _upsertRule(cssText, selector, body, mustAdd, ctx) {
        const found = Plugin.style._findRule(cssText, selector);
        const rule = selector + " {\n  " + String(body || "").trim().replace(/\n/g, "\n  ") + "\n}\n";
        if (!found) {
          if (!mustAdd && ctx) ctx.reasons.push("style: update missing selector=" + selector);
          if (!mustAdd) return null;
          return (cssText.trim() ? cssText.replace(/\s*$/, "\n\n") : "") + rule;
        }
        if (mustAdd && ctx) { ctx.reasons.push("style: add exists selector=" + selector); return null; }

        // replace whole rule block
        const endIdx = found.end + 1;
        return cssText.slice(0, found.start) + rule + cssText.slice(endIdx);
      },

      _removeRule(cssText, selector) {
        const found = Plugin.style._findRule(cssText, selector);
        if (!found) return null;
        const endIdx = found.end + 1;
        return (cssText.slice(0, found.start) + cssText.slice(endIdx)).replace(/\n\n\n+/g, "\n\n");
      }
    }
  };
  // Attach plugin to window
  window.VueSfcEditorPlugin = Plugin;
})();

/* ================= COMMAND-ONLY SHIM =================
 * Ensures Plugin.apply returns {changed,reasons,summary,code} for callers expecting result object.
 */
(function () {
  if (typeof window === "undefined" || !window.VueSfcEditorPlugin) return;
  const Plugin = window.VueSfcEditorPlugin;
  const _applyWithResult = Plugin.applyWithResult;

  // Keep apply() backward-compatible: return the updated SFC code STRING.
  // Use applyWithResult() when diagnostics are needed.
  Plugin.apply = function (code, operations) {
    if (!operations || !Array.isArray(operations.ops)) return String(code || "");
    const r = _applyWithResult.call(Plugin, code, operations || {});
    return r && typeof r.code === "string" ? r.code : String(code || "");
  };
})();
