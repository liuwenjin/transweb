// custom/CrossOrigin.js —— 跨站请求许可（CORS），由 interface/config/common.js 配置驱动
//
// common.js 中的配置：
//   crossOrigin: {
//     allow: true,         // 是否允许其他站点跨站调用本站接口（默认允许）
//     origin: "*",         // 允许的来源：* 或 "https://a.com" / ["https://a.com", ...]
//     credentials: false   // 是否允许跨站携带 Cookie（origin 为 * 时会改为回显来源）
//   }
// 也兼容简写：crossOrigin: true / false
//
// 行为：
//   allow = true（默认）：返回 Access-Control-Allow-*，预检 OPTIONS 直接 204；
//                         配置了 origin 白名单时，白名单外的来源返回 403；
//   allow = false        ：不返回任何 CORS 头；带外部 Origin 的跨站请求直接 403，
//                         同源请求与无 Origin 的请求（curl、服务端调用）不受影响。
//
// 同一份策略也供 webServer.js 的 CSRF 校验使用（isSameOrigin / allowsOrigin），
// 保证「允许跨站」与「CSRF 防护」始终一致；也避免把 8080 端口的同源请求误判为跨站。
//
// 开关命令：transweb cors on / transweb cors off
//
// 说明：CORS 是浏览器侧机制，服务端之间的调用通常不带 Origin 头，因此始终放行。

const DEFAULT_METHODS = "GET,POST,PUT,PATCH,DELETE,OPTIONS";
const DEFAULT_HEADERS = "Content-Type,Authorization,X-Api-Key,X-Requested-With,transweb-token";

function normalizeConfig(raw) {
  if (typeof raw === "boolean") {
    return { allow: raw, origin: "*", credentials: false };
  }
  const cfg = raw && typeof raw === "object" ? raw : {};
  // 未配置该项（undefined / null）或没写 allow 时默认放行，保持与旧版本一致的跨站行为
  const allow =
    cfg.allow === undefined && cfg.enabled === undefined
      ? true
      : cfg.allow === true || cfg.enabled === true;
  return {
    allow,
    origin: cfg.origin === undefined || cfg.origin === null ? "*" : cfg.origin,
    credentials: cfg.credentials === true
  };
}

function originList(value) {
  const list = Array.isArray(value) ? value : String(value || "").split(",");
  return list
    .map((item) => String(item).trim().replace(/\/$/, ""))
    .filter(Boolean);
}

// Host 归一化：统一小写并去掉默认端口，避免 Host 带 :80/:443 时误判为跨站
function normalizeHost(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/:(80|443)$/, "");
}

// 取出 URL 的 host（含非默认端口），失败返回空串
function hostOf(value) {
  try {
    return normalizeHost(new URL(String(value)).host);
  } catch (e) {
    return "";
  }
}

// 规范化为 scheme://host，用于和 origin 白名单比较（Referer 会带路径）
function toOrigin(value) {
  try {
    return new URL(String(value)).origin.toLowerCase();
  } catch (e) {
    return "";
  }
}

// 同源判定：比较来源与 Host 的主机名 + 端口；无来源（GET 导航、curl）视为同源。
// 必须带端口比较：Express 的 req.hostname 不含端口，直接比较会把 :8080 的同源请求误判为跨站。
function isSameOrigin(req, value) {
  const origin = value === undefined ? req.headers.origin : value;
  if (!origin) return true;
  if (String(origin).toLowerCase() === "null") return false;
  const originHost = hostOf(origin);
  if (!originHost) return false;
  return originHost === normalizeHost(req.headers.host || req.hostname || "");
}

function create(rawConfig) {
  const config = normalizeConfig(rawConfig);
  const list = originList(config.origin);
  const allowAll = !list.length || list.indexOf("*") !== -1;
  // origin 为 * 时浏览器不允许携带 Cookie，需要改写为回显来源
  const echoOrigin = !allowAll || config.credentials;

  // 来源是否在允许范围内（CORS 响应头与 CSRF 校验共用这套判断）
  function allowsOrigin(value) {
    if (!config.allow) return false;
    if (value === undefined || value === null || value === "") return true;
    const origin = String(value);
    if (origin.toLowerCase() === "null") return false;
    const normalized = toOrigin(origin);
    if (!normalized) return false;
    if (allowAll) return true;
    return list.some((item) => item.toLowerCase() === normalized);
  }

  function corsAllowedOrigin(req) {
    const origin = req.headers.origin;
    if (allowAll) return echoOrigin ? origin : "*";
    return allowsOrigin(origin) ? origin : "";
  }

  function applyHeaders(req, res, allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    if (allowedOrigin !== "*") res.vary("Origin");
    res.setHeader("Access-Control-Allow-Methods", DEFAULT_METHODS);
    res.setHeader(
      "Access-Control-Allow-Headers",
      req.headers["access-control-request-headers"] || DEFAULT_HEADERS
    );
    res.setHeader("Access-Control-Max-Age", "600");
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition, Content-Length");
    if (config.credentials && allowedOrigin !== "*") {
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }
  }

  function middleware(req, res, next) {
    const origin = req.headers.origin;
    const preflight =
      req.method === "OPTIONS" && Boolean(req.headers["access-control-request-method"]);

    // 关闭跨站：同源与无 Origin 的请求照常放行，其余直接拒绝
    if (!config.allow) {
      if (origin && !isSameOrigin(req)) {
        res.status(403).json({ ret: 1, message: "跨站请求已被禁用（common.js crossOrigin.allow = false）" });
        return;
      }
      next();
      return;
    }

    // 已开启：只对跨站请求加 CORS 头，同源请求不加，避免缓存混淆
    if (!origin || isSameOrigin(req)) {
      next();
      return;
    }

    const allowedOrigin = corsAllowedOrigin(req);
    if (!allowedOrigin) {
      res.status(403).json({ ret: 1, message: "来源未在 common.js crossOrigin.origin 白名单中" });
      return;
    }

    applyHeaders(req, res, allowedOrigin);

    if (preflight) {
      res.status(204).end();
      return;
    }
    next();
  }

  return { config, middleware, allowAll, origins: list, isSameOrigin, allowsOrigin };
}

module.exports = { create, normalizeConfig, isSameOrigin, DEFAULT_METHODS, DEFAULT_HEADERS };
