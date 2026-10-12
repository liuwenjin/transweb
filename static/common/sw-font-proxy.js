/* =========================================================
 * sw-font-proxy.js  (FINAL · DO NOT TOUCH)
 *
 * 字体同源代理 Service Worker
 * ========================================================= */

/**
 * 统一的字体代理前缀
 * ⚠️ 必须与 transformImage 中生成的 proxyPath 对齐
 *
 * 示例请求：
 *   /__font_proxy__/Ma Shan Zheng/400-normal.woff2
 */
const FONT_PROXY_PREFIX = "/__font_proxy__/";

/**
 * 内存态字体映射表
 *
 * key   : decode 后的 pathname
 * value : 真实跨域字体文件 URL
 *
 * {
 *   "/__font_proxy__/Ma Shan Zheng/400-normal.woff2":
 *     "https://fonts.gstatic.com/s/mashanzheng/v14/....woff2"
 * }
 */
const fontProxyMap = Object.create(null);

/* ---------------------------------------------------------
 * 接收主线程注入的字体映射
 * --------------------------------------------------------- */
self.addEventListener("message", (event) => {
  const data = event.data || {};

  if (data.type !== "SET_FONT_PROXY_MAP") return;
  if (!data.payload || typeof data.payload !== "object") return;

  // 合并映射（支持多次导出、多字体）
  Object.assign(fontProxyMap, data.payload);

  // debug（必要时可打开）
  // console.log("[sw-font-proxy] map updated", fontProxyMap);
});

/* ---------------------------------------------------------
 * 拦截字体请求
 * --------------------------------------------------------- */
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 只处理字体代理路径，其余请求一律放行
  if (!url.pathname.startsWith(FONT_PROXY_PREFIX)) return;

  // ⚠️ 关键：统一使用 decode 后的 pathname 作为 key
  const pathname = decodeURIComponent(url.pathname);
  const realUrl = fontProxyMap[pathname];

  if (!realUrl) {
    event.respondWith(
      new Response("Font proxy not found", {
        status: 404,
        headers: {
          "Content-Type": "text/plain"
        }
      })
    );
    return;
  }

  event.respondWith(
    fetch(realUrl, {
      mode: "cors",
      credentials: "omit",
      cache: "force-cache"
    })
  );
});
