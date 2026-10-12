<template>
  <div class="chatbox-bg tw-flex tw-flex-col tw-w-full tw-h-full" ref="rootComponentContainer" data-edit-id="1">
    <!-- ======================= 导航栏 ======================= -->
    <header v-if="(isSolo || content.isSolo) && dataEditable" class="chatbox-navbar" data-edit-id="2">
      <div class="navbar-inner" data-edit-id="3">
        <div class="navbar-left" data-edit-id="4">
          <div class="navbar-logo" :style="{ background: 'var(--muse-primary)' }" data-edit-id="5">
            <svg class="navbar-logo-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-edit-id="136">
              <path d="M12 2l2.4 7 7 2.4-7 2.4-2.4 7-2.4-7-7-2.4 7-2.4z" data-edit-id="137" />
            </svg>
          </div>
          <div class="navbar-title" data-edit-id="7">
            <span class="navbar-title-text" data-edit-id="8">{{ title }}</span>
          </div>
        </div>
        <div class="tw-flex tw-items-center" data-edit-id="103">
          <button v-if="messages.length" type="button" class="navbar-text-btn" style="margin-right: 8px" title="清空当前对话" @click="newChat" data-edit-id="142">
            <i class="bi bi-trash" data-edit-id="143"></i>
            <span data-edit-id="144">清空对话</span>
          </button>
          <div v-if="isOwnerLogged" ref="configMenuWrap" class="config-menu-wrap" style="margin-right: 8px" data-edit-id="147">
            <button type="button" class="skill-config-btn" :class="{ 'is-open': configMenuVisible }" title="配置菜单" aria-haspopup="menu" :aria-expanded="configMenuVisible ? 'true' : 'false'" @click.stop="toggleConfigMenu" data-edit-id="167">
              <i class="bi bi-sliders" data-edit-id="148"></i>
              <span data-edit-id="149">配置</span>
              <i class="bi bi-chevron-down config-menu-caret" data-edit-id="170"></i>
            </button>
            <transition name="config-menu" data-edit-id="171">
              <ul v-if="configMenuVisible" class="config-menu" role="menu" data-edit-id="117">
                <li class="config-menu-item" role="menuitem" data-edit-id="129" @click="openInfoConfig">
                  <i class="bi bi-pencil-square" data-edit-id="174"></i>
                  <span data-edit-id="175">基础信息</span>
                </li>
                <li class="config-menu-item" role="menuitem" data-edit-id="130" @click="openSkillConfig">
                  <i class="bi bi-sliders" data-edit-id="177"></i>
                  <span data-edit-id="178">Skill 配置</span>
                </li>
                <li class="config-menu-divider" data-edit-id="179"></li>
                <li class="config-menu-item" role="menuitem" @click="openPersonaPrompt" data-edit-id="180">
                  <i class="bi bi-person-gear" data-edit-id="181"></i>
                  <span data-edit-id="182">人设提示词</span>
                </li>
                <li class="config-menu-item" role="menuitem" @click="openKnowledgeBase" data-edit-id="183">
                  <i class="bi bi-database" data-edit-id="184"></i>
                  <span data-edit-id="185">知识库配置</span>
                </li>
              </ul>
            </transition>
          </div>
          <button type="button" class="icon-btn" style="margin-right: 8px" :title="
              resolvedTheme === 'dark' ? '切换到浅色模式' : '切换到深色模式'
            " @click="toggleTheme" data-edit-id="145">
            <i :class="
                resolvedTheme === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars'
              " data-edit-id="146"></i>
          </button>
          <div appName="loginRegItem" component="CardItem" class="tw-opacity-100 refined-user-card" :style="{
              width: '135px',
              marginLeft: '5px',
              height: '30px',
              borderLeft: 'solid 1px #ddd',
            }" data-edit-id="104" :documentId="query ? query.documentId : ''"></div>
        </div>
      </div>
    </header>

    <!-- ======================= 消息区 ======================= -->
    <main class="chatbox-main" ref="scrollContainer" @scroll="onScroll" data-edit-id="14">
      <!-- 空状态 -->
      <div v-if="messages.length === 0" class="chatbox-empty" data-edit-id="15">
        <div class="empty-rune" data-edit-id="16">
          <div class="empty-ring" data-edit-id="17"></div>
          <i class="bi bi-stars empty-icon" data-edit-id="18"></i>
        </div>
        <h2 class="empty-title" data-edit-id="19">
          {{ title || "你好，我是你的助手" }}
        </h2>
        <p class="empty-subtitle" data-edit-id="20">{{ subtitle }}</p>
        <p class="empty-slogan" data-edit-id="186">
          {{ introduce || "求真而不妄断 · 求善而不说教 · 求美而不矫饰" }}
        </p>

        <div class="empty-chips" v-if="exampleList && exampleList.length" data-edit-id="21">
          <button v-for="(d, i) in exampleList.slice(0, 3)" :key="i" class="empty-chip" @click="useExample(d)" data-edit-id="22">
            <span class="chip-body" data-edit-id="187">
              <span data-edit-id="23">{{ d.icon || "✦" }}</span>
              <span data-edit-id="188">{{
                d.title || d.name
              }}</span>
            </span>
          </button>
        </div>
      </div>

      <!-- 消息列表 -->
      <div v-else class="message-list" data-edit-id="25">
        <article v-for="m in messages" :key="m.id" class="message-row" :class="
            m.role === 'user' ? 'message-row--user' : 'message-row--assistant'
          " data-edit-id="26">
          <div class="message-body" data-edit-id="29">
            <div class="bubble" :class="m.role === 'user' ? 'bubble--user' : 'bubble--assistant'" data-edit-id="33">
              <!-- 流式中的光标 -->
              <template v-if="m.role === 'assistant' && !m.content && m.streaming">
                <span class="typing-dots"> <i></i><i></i><i></i> </span>
              </template>
              <!-- 已渲染内容 -->
              <div v-else class="bubble-content" v-html="renderMarkdown(m.content)"></div>
              <span v-if="m.role === 'assistant' && m.streaming && m.content" class="stream-cursor"></span>
            </div>

            <!-- 助手消息操作：可配置的动态按钮列表 / 下拉菜单 / 组合输入框 -->
            <div v-if="
                m.role === 'assistant' &&
                m.content &&
                effectiveMessageActions.length
              " class="message-actions">
              <div v-for="(item, idx) in effectiveMessageActions" :key="idx">
                <!-- 分隔线 -->
                <span v-if="item.type === 'divider'" class="action-divider"></span>

                <!-- 组合输入框 + 按钮 -->
                <div v-else-if="isComboItem(item)" class="action-input-group">
                  <input class="action-input" :type="item.inputType || 'text'" :placeholder="item.placeholder || '输入内容…'" :maxlength="item.maxLength || undefined" :disabled="!!item.disabled" :title="item.tooltip" :data-key="item.key || ''" @input="onActionInput(m, item, $event)" @keydown.enter.stop.prevent="submitCombo(m, item, $event)" clearable />
                  <button type="button" class="mini-btn mini-btn--combo" :disabled="!!item.disabled" :title="item.buttonTooltip || item.tooltip" @click="submitCombo(m, item, $event)">
                    <i class="bi bi-chevron-right"></i>
                  </button>
                </div>

                <!-- 下拉菜单 -->
                <div v-else-if="item.type === 'dropdown'" class="action-dropdown" :class="{ open: isMenuOpen(m, item) }">
                  <button type="button" class="mini-btn" :disabled="!!item.disabled" :title="item.tooltip" @click.stop="toggleActionMenu(m, item)">
                    <i v-if="item.icon" :class="item.icon"></i>
                    <span>{{ item.label || "更多" }}</span>
                    <i class="bi bi-chevron-down action-arrow"></i>
                  </button>
                  <transition name="action-menu">
                    <div v-if="isMenuOpen(m, item)" class="action-menu">
                      <button v-for="child in item.children || []" :key="child.id || child.key || child.label" type="button" class="action-menu-item" :disabled="!!child.disabled" :title="child.tooltip" @click.stop="selectActionChild(m, item, child)">
                        <i v-if="child.icon" :class="child.icon"></i>
                        <span class="action-menu-label">{{ child.label }}</span>
                      </button>
                    </div>
                  </transition>
                </div>

                <!-- 普通按钮（默认类型） -->
                <button v-else type="button" class="mini-btn" :class="{ 'mini-btn--active': !!item.active }" :disabled="!!item.disabled" :title="item.tooltip" :data-key="item.key || ''" @click="
                    dispatchMessageAction({
                      type: 'click',
                      key: item.key,
                      value: item.value,
                      item: item,
                      message: m,
                    })
                  ">
                  <i v-if="item.icon" :class="item.icon"></i>
                  <span>{{ item.label || "操作" }}</span>
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- 回到底部 -->
      <transition name="fade-up">
        <button v-if="showScrollHint" class="scroll-bottom-btn" @click="scrollToBottom(true)">
          <i class="bi bi-arrow-down"></i>
        </button>
      </transition>
    </main>

    <!-- ======================= 子窗口层（同源内嵌 / 支持最小化 / 索引导航 / 可收起） ======================= -->
    <transition name="child-win">
      <section v-if="childWindows.length" v-show="childPanelVisible" class="child-window-layer" data-edit-id="subwin" style="
          position: absolute;
          right: 20px;
          bottom: 168px;
          width: min(740px, 64vw);
          height: min(62vh, 620px);
          min-height: 240px;
          z-index: 50;
          overflow: hidden;
        ">
        <!-- 索引导航（标签栏）：仅展示当前激活窗口，其余窗口自动最小化 -->
        <div class="child-window-nav" data-edit-id="subwin-nav" style="
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 42px;
            box-sizing: border-box;
          ">
          <span class="child-nav-count" title="当前子窗口任务数">
            <i class="bi bi-window-stack"></i>
            <span>{{ childWindows.length }}</span>
          </span>
          <div class="child-nav-tabs">
            <button v-for="(win, idx) in childWindows" :key="win.id" type="button" class="child-nav-tab" :class="{
                active: win.id === activeChildId && !win.minimized,
                minimized: win.minimized,
              }" :title="(win.minimized ? '（已最小化）' : '') + win.title" @click="activateChildWindow(win.id)">
              <span class="child-nav-index">{{ idx + 1 }}</span>
              <span class="child-nav-title">{{ win.title }}</span>
              <i v-if="win.minimized" class="bi bi-window-stack child-nav-mini"></i>
              <span class="child-nav-close" title="关闭该窗口" @click.stop="closeChildWindow(win.id)">×</span>
            </button>
          </div>
          <div class="child-nav-actions">
            <button type="button" class="child-nav-btn" title="收起面板（保留任务，按钮恢复显示）" @click="toggleChildPanel">
              <i class="bi bi-chevron-down"></i>
            </button>
            <button type="button" class="child-nav-btn child-nav-btn--danger" title="关闭当前窗口" :disabled="!activeChildWindow" @click="closeChildWindow(activeChildId)">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>

        <!-- 子窗口内容：同一时刻仅激活且未最小化的窗口可见，其余保持挂载以保留状态 -->
        <div v-for="win in childWindows" v-show="win.id === activeChildId && !win.minimized" :key="win.id" class="child-window-body" style="
            position: absolute !important;
            top: 42px !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            overflow: hidden !important;
            background: #fff !important;
          ">
          <iframe :src="win.url" class="child-window-frame" style="
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              right: 0 !important;
              bottom: 0 !important;
              width: 100% !important;
              height: 100% !important;
              border: none !important;
              background: #fff !important;
            " frameborder="0" allowfullscreen referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"></iframe>
        </div>

        <!-- 全部最小化时的占位提示 -->
        <div v-if="!activeChildWindow || activeChildWindow.minimized" class="child-window-collapsed" style="position: absolute; top: 42px; left: 0; right: 0; bottom: 0">
          <i class="bi bi-window-stack child-collapsed-icon"></i>
          <span>所有子窗口已最小化，点击上方索引恢复</span>
        </div>
      </section>
    </transition>

    <!-- ======================= 输入区 ======================= -->
    <footer class="chatbox-composer" :class="{ 'is-welcome': messages.length === 0 }">
      <div class="composer-inner">
        <!-- 子窗口控制按钮：固定在输入框右上方，常显任务数量，点击显示 / 隐藏浮窗 -->
        <button v-if="childWindows.length" type="button" class="child-trigger-btn" :class="{ 'child-trigger-btn--hidden': !childPanelVisible }" :title="
            childPanelVisible
              ? '收起子窗口面板（' + childWindows.length + ' 个任务）'
              : '显示子窗口面板（' + childWindows.length + ' 个任务）'
          " @click="toggleChildPanel">
          <i class="bi bi-window-stack"></i>
          <span class="child-trigger-text">子窗口</span>
          <span class="child-trigger-count">{{ childWindows.length }}</span>
        </button>
        <textarea ref="textarea" v-model="draft" class="composer-input" :placeholder="inputPlaceholder" rows="1" @input="autoResize" @keydown="onKeydown"></textarea>

        <div class="composer-footer">
          <div class="composer-hint">
            <span v-if="isStreaming" class="streaming-hint">
              <span class="hint-dot"></span>
              {{ loadingText }}
            </span>
            <template v-else>
              <span class="model-hint">
                <i class="bi bi-command"></i>
                {{ documentMeta.model }}/{{ documentMeta.apiName }}
              </span>
            </template>
          </div>

          <div class="composer-actions">
            <button v-if="draft" type="button" class="icon-btn" title="清空输入内容" @click="clearDraft">
              <i class="bi bi-x-lg"></i>
            </button>
            <button v-if="isStreaming" class="send-btn send-btn--stop" @click="stopStreaming">
              <i class="bi bi-stop-fill"></i>
              <span>停止</span>
            </button>
            <button v-else class="send-btn" :disabled="!canSend" title="发送" @click="send">
              <i class="bi bi-arrow-up"></i>
            </button>
          </div>
        </div>
      </div>
    </footer>

    <!-- ======================= Skill 配置弹层 ======================= -->
    <transition name="skill-config">
      <div v-if="skillConfigVisible" class="skill-config-mask" @click.self="skillConfigVisible = false">
        <div class="skill-config-panel">
          <div class="skill-config-head">
            <span class="skill-config-title"><i class="bi bi-sliders"></i> 配置 Skill 操作</span>
            <button type="button" class="skill-config-close" title="关闭" @click="skillConfigVisible = false">
              ×
            </button>
          </div>

          <div class="skill-config-section-title">
            已有 Skill（可修改名称 / ID）
          </div>
          <div v-if="skillActionItems.length" class="skill-config-list">
            <div v-for="(item, idx) in skillActionItems" :key="idx" class="skill-config-item">
              <i class="bi bi-stars skill-config-item-icon"></i>
              <div class="skill-config-item-fields">
                <input v-model="item.label" class="skill-config-edit" placeholder="Skill 名称" title="名称" />
                <input v-model="item.id" class="skill-config-edit skill-config-edit--id" placeholder="Skill ID" title="ID" />
              </div>
              <button type="button" class="skill-config-item-del" title="删除该 Skill" @click="removeSkill(item)">
                ×
              </button>
            </div>
          </div>
          <div v-else class="skill-config-empty">
            <i class="bi bi-inbox"></i>
            <span>暂无 Skill 操作，请在下方新增</span>
          </div>

          <div class="skill-config-section-title">新增 Skill</div>
          <div class="skill-config-add">
            <label class="skill-config-field">
              <span>名称</span>
              <input v-model="skillDraft.name" placeholder="如：生成 PPT" @keydown.enter.prevent="addSkill" />
            </label>
            <label class="skill-config-field">
              <span>ID</span>
              <input v-model="skillDraft.id" placeholder="Skill ID" @keydown.enter.prevent="addSkill" />
            </label>
            <button type="button" class="skill-config-add-btn" :disabled="!canAddSkill" @click="addSkill">
              <i class="bi bi-plus-lg"></i> 新增
            </button>
          </div>

          <div class="skill-config-footer">
            <button type="button" class="skill-config-cancel-btn" @click="skillConfigVisible = false">
              取消
            </button>
            <button type="button" class="skill-config-confirm-btn" @click="confirmSkillConfig">
              确认
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ======================= 基础信息配置弹层 ======================= -->
    <transition name="skill-config">
      <div v-if="infoConfigVisible" class="skill-config-mask" @click.self="infoConfigVisible = false">
        <div class="skill-config-panel">
          <div class="skill-config-head">
            <span class="skill-config-title"><i class="bi bi-pencil-square"></i> 配置基础信息</span>
            <button type="button" class="skill-config-close" title="关闭" @click="infoConfigVisible = false">
              ×
            </button>
          </div>

          <div class="skill-config-section-title">标题</div>
          <div class="skill-config-add">
            <label class="skill-config-field">
              <input v-model="infoDraft.title" placeholder="如：知衡" />
            </label>
          </div>

          <div class="skill-config-section-title">副标题</div>
          <div class="skill-config-add">
            <label class="skill-config-field">
              <input v-model="infoDraft.subtitle" placeholder="如：把事实理清，把问题想明白。" />
            </label>
          </div>

          <div class="skill-config-section-title">一句话介绍</div>
          <div class="skill-config-add">
            <label class="skill-config-field">
              <input v-model="infoDraft.introduce" placeholder="如：懂你所问，答你所想" />
            </label>
          </div>

          <div class="skill-config-section-title">示例列表</div>
          <div v-if="exampleList.length" class="skill-config-list">
            <div v-for="(d, idx) in exampleList" :key="idx" class="skill-config-item skill-config-item--example">
              <div class="skill-config-item-fields">
                <div class="skill-config-item-row">
                  <input v-model="d.icon" class="skill-config-edit skill-config-edit--icon" placeholder="图标" title="图标（Emoji）" />
                  <input v-model="d.title" class="skill-config-edit" placeholder="标题" title="标题" />
                </div>
                <textarea v-model="d.desc" class="skill-config-edit skill-config-edit--area" placeholder="示例内容" title="示例内容" rows="2"></textarea>
              </div>
              <button type="button" class="skill-config-item-del" title="删除该示例" @click="removeExample(d)">
                ×
              </button>
            </div>
          </div>
          <div v-else class="skill-config-empty">
            <i class="bi bi-inbox"></i>
            <span>暂无示例，请在下方新增</span>
          </div>

          <div class="skill-config-section-title">新增示例</div>
          <div class="skill-config-add">
            <div class="skill-config-add-row">
              <label class="skill-config-field skill-config-field--icon">
                <span>图标</span>
                <input v-model="infoDraft.exampleIcon" placeholder="如：💡" />
              </label>
              <label class="skill-config-field skill-config-field--grow">
                <span>标题</span>
                <input v-model="infoDraft.exampleTitle" placeholder="如：在困惑中找到方向" @keydown.enter.prevent="addExample" />
              </label>
            </div>
            <label class="skill-config-field">
              <span>内容</span>
              <textarea v-model="infoDraft.exampleDesc" class="skill-config-textarea" placeholder="如：帮我构思一个活动方案" rows="2"></textarea>
            </label>
            <button type="button" class="skill-config-add-btn" :disabled="!canAddExample" @click="addExample">
              <i class="bi bi-plus-lg"></i> 新增
            </button>
          </div>

          <div class="skill-config-footer">
            <button type="button" class="skill-config-cancel-btn" @click="infoConfigVisible = false">
              取消
            </button>
            <button type="button" class="skill-config-confirm-btn" @click="confirmInfoConfig">
              确认
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
  /* ============================================
   DESIGN TOKENS — Muse · 极简 · 精致
   ============================================ */
  .chatbox-bg {
    /* ===== 颜色（主题相关，暗色块覆盖） ===== */
    --muse-primary: #007aff;
    --muse-primary-hover: #0066d6;
    --muse-primary-active: #0058c4;
    --muse-primary-soft: rgba(0, 122, 255, 0.08);
    --muse-primary-ring: rgba(0, 122, 255, 0.16);

    --muse-bg: #f7fafa;
    --muse-card: #ffffff;
    --muse-surface: #ffffff;

    --muse-text: #1d1d1f;
    --muse-text-secondary: #6e7480;
    --muse-text-tertiary: #9aa1ac;

    --muse-border: rgba(0, 0, 0, 0.08);
    --muse-border-strong: rgba(0, 0, 0, 0.14);
    --muse-hover: rgba(0, 0, 0, 0.06);

    --glass-bg: rgba(255, 255, 255, 0.78);
    --glass-shadow: 0 1px 2px rgba(0, 0, 0, 0.03), 0 8px 24px rgba(0, 0, 0, 0.04);
    --glass-shadow-hover: 0 2px 4px rgba(0, 0, 0, 0.04),
      0 12px 32px rgba(0, 0, 0, 0.06);

    /* ===== 字号阶梯（主题无关） ===== */
    --font-size-2xs: 11px;
    --font-size-xs: 12px;
    --font-size-sm: 13px;
    --font-size-base: 14px;
    --font-size-md: 16px;
    --font-size-lg: 20px;
    --font-size-xl: 22px;
    --font-size-2xl: 30px;

    /* ===== 行高（主题无关） ===== */
    --line-height-none: 1;
    --line-height-tight: 1.4;
    --line-height-base: 1.6;
    --line-height-relaxed: 1.7;

    /* ===== 字重（主题无关） ===== */
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;

    /* ===== 间距（4px 基准，主题无关） ===== */
    --space-0: 0;
    --space-0.5: 2px;
    --space-1: 4px;
    --space-1.5: 6px;
    --space-2: 8px;
    --space-2.5: 10px;
    --space-3: 12px;
    --space-3.5: 14px;
    --space-4: 16px;
    --space-4.5: 18px;
    --space-5: 20px;
    --space-6: 24px;
    --space-8: 32px;
    --space-10: 40px;
    --space-15: 60px;

    /* ===== 布局（主题无关） ===== */
    --layout-max: 820px;
    --layout-gutter: 20px;

    /* ===== 圆角阶梯（主题无关） ===== */
    --radius-xs: 4px;
    --radius-sm: 6px;
    --radius-md: 8px;
    --radius-lg: 10px;
    --radius-xl: 12px;
    --radius-2xl: 14px;
    --radius-3xl: 16px;
    --radius-card: 18px;
    --radius-full: 999px;

    /* ===== 动效（主题无关） ===== */
    --duration-fast: 0.12s;
    --duration-base: 0.18s;
    --duration-slow: 0.28s;
    --ease-out: cubic-bezier(0.22, 1, 0.36, 1);

    /* ===== 字体族（主题无关） ===== */
    --font-system: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
      "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
  }

  .chatbox-bg[data-theme="dark"] {
    /* 暗色主题 */
    --muse-primary: #0a84ff;
    --muse-primary-hover: #409cff;
    --muse-primary-active: #0067cc;
    --muse-primary-soft: rgba(10, 132, 255, 0.16);
    --muse-primary-ring: rgba(10, 132, 255, 0.28);

    --muse-bg: #0b0f14;
    --muse-card: #111419;
    --muse-surface: #1c1c1e;

    --muse-text: #f5f5f7;
    --muse-text-secondary: #a1a1a6;
    --muse-text-tertiary: #6e6e73;

    --muse-border: rgba(245, 245, 247, 0.08);
    --muse-border-strong: rgba(245, 245, 247, 0.16);
    --muse-hover: rgba(245, 245, 247, 0.1);

    --glass-bg: rgba(28, 28, 30, 0.72);
    --glass-shadow: 0 1px 2px rgba(0, 0, 0, 0.5), 0 8px 24px rgba(0, 0, 0, 0.5);
    --glass-shadow-hover: 0 2px 4px rgba(0, 0, 0, 0.55),
      0 12px 32px rgba(0, 0, 0, 0.55);
  }

  /* ============================================
   全局背景 — 冰川灰 + 点阵纹理
   ============================================ */
  .chatbox-bg {
    position: relative;
    font-family: var(--font-system);
    color: var(--muse-text);
    background-color: var(--muse-bg);
    background-image: radial-gradient(ellipse 70% 55% at 15% 0%,
        rgba(0, 122, 255, 0.05) 0%,
        transparent 55%),
      radial-gradient(ellipse 55% 45% at 100% 100%,
        rgba(0, 122, 255, 0.04) 0%,
        transparent 55%),
      radial-gradient(circle at 1px 1px,
        rgba(148, 163, 184, 0.06) 1px,
        transparent 0);
    background-size: auto, auto, 48px 48px;
    overflow: hidden;
  }

  .chatbox-bg::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: linear-gradient(to right,
        rgba(0, 122, 255, 0.035) 1px,
        transparent 1px),
      linear-gradient(to bottom, rgba(0, 122, 255, 0.035) 1px, transparent 1px);
    background-size: 56px 56px;
    pointer-events: none;
    z-index: 0;
  }

  /* ============================================
   导航栏
   ============================================ */
  .chatbox-navbar {
    position: relative;
    z-index: 10;
    height: 72px;
    padding: 0 var(--layout-gutter);
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .navbar-inner {
    width: 100%;
    max-width: var(--layout-max);
    height: 100%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .navbar-left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .navbar-logo {
    width: 44px;
    height: 44px;
    border-radius: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    box-shadow: 0 1px 3px rgba(0, 122, 255, 0.28),
      inset 0 1px 0 rgba(255, 255, 255, 0.18);
    flex-shrink: 0;
  }

  .navbar-logo-icon {
    width: 22px;
    height: 22px;
    color: #fff;
    display: block;
    flex-shrink: 0;
  }

  .navbar-title {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .navbar-title-text {
    font-size: 17px;
    font-weight: 600;
    color: var(--muse-text);
    letter-spacing: 0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ============================================
   消息区
   ============================================ */
  .chatbox-main {
    position: relative;
    z-index: 1;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 12px var(--layout-gutter) 20px;
    scroll-behavior: smooth;
  }

  .chatbox-main::-webkit-scrollbar {
    width: 6px;
  }

  .chatbox-main::-webkit-scrollbar-track {
    background: transparent;
  }

  .chatbox-main::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.14);
    border-radius: var(--radius-sm);
  }

  .chatbox-main::-webkit-scrollbar-thumb:hover {
    background: var(--muse-primary);
  }

  /* 空状态 */
  .chatbox-empty {
    max-width: var(--layout-max);
    margin: 0 auto;
    padding: 48px 0 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .empty-rune {
    position: relative;
    width: 72px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 22px;
  }

  .empty-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 1px solid var(--muse-primary-ring);
    background: radial-gradient(circle at 50% 38%,
        rgba(0, 122, 255, 0.08) 0%,
        rgba(0, 122, 255, 0) 70%);
    box-shadow: 0 0 28px rgba(0, 122, 255, 0.1);
  }

  .empty-icon {
    font-size: 26px;
    color: var(--muse-primary);
  }

  .empty-title {
    font-size: 40px;
    font-weight: 600;
    color: var(--muse-text);
    margin: 0 0 10px;
    letter-spacing: -0.025em;
    line-height: 1.1;
  }

  .empty-subtitle {
    font-size: 18px;
    font-weight: 500;
    color: var(--muse-text-secondary);
    margin: 0 0 8px;
    letter-spacing: 0.01em;
  }

  .empty-slogan {
    font-size: 13px;
    color: var(--muse-text-tertiary);
    margin: 0 0 36px;
    letter-spacing: 0.02em;
  }

  .empty-chips {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    width: 100%;
  }

  .empty-chip {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    text-align: left;
    padding: 16px;
    background: var(--glass-bg);
    border: 1px solid var(--muse-border);
    color: var(--muse-text-secondary);
    border-radius: var(--radius-3xl);
    font-family: var(--font-system);
    cursor: pointer;
    backdrop-filter: blur(8px);
    transition: border-color var(--duration-base) ease,
      transform var(--duration-base) ease, box-shadow var(--duration-base) ease;
  }

  .empty-chip:hover {
    background: var(--muse-surface);
    border-color: rgba(0, 122, 255, 0.32);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
    transform: translateY(-1px);
  }

  .chip-icon {
    font-size: 18px;
    line-height: 1;
    filter: grayscale(20%);
    transition: filter var(--duration-base) ease;
  }

  .empty-chip:hover .chip-icon {
    filter: grayscale(0%);
  }

  .chip-body {
    display: flex;
    gap: 5px;
  }

  .chip-title {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: var(--muse-text);
  }

  .chip-desc {
    font-size: var(--font-size-xs);
    color: var(--muse-text-tertiary);
    line-height: var(--line-height-tight);
  }

  /* 消息列表 */
  .message-list {
    max-width: var(--layout-max);
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .message-row {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .message-row--user {
    flex-direction: row-reverse;
  }

  .message-body {
    max-width: calc(100% - 60px);
    display: flex;
    flex-direction: column;
  }

  .message-row--user .message-body {
    align-items: flex-end;
  }

  .bubble {
    position: relative;
    padding: 12px 16px;
    font-size: var(--font-size-base);
    line-height: var(--line-height-relaxed);
    word-break: break-word;
  }

  .bubble--assistant {
    background: var(--glass-bg);
    border: 1px solid var(--muse-border);
    border-radius: var(--radius-xs) var(--radius-card) var(--radius-card) var(--radius-card);
    box-shadow: var(--glass-shadow);
    backdrop-filter: saturate(160%) blur(14px);
    -webkit-backdrop-filter: saturate(160%) blur(14px);
    color: var(--muse-text);
  }

  .bubble--user {
    background: var(--muse-primary);
    color: #fff;
    border-radius: var(--radius-card) var(--radius-xs) var(--radius-card) var(--radius-card);
    box-shadow: 0 2px 8px rgba(0, 122, 255, 0.28);
  }

  .bubble-content {
    overflow-wrap: anywhere;
  }

  /* 流式光标 */
  .stream-cursor {
    display: inline-block;
    width: 2px;
    height: 15px;
    margin-left: 2px;
    vertical-align: text-bottom;
    background: var(--muse-primary);
    animation: blink 0.9s steps(2) infinite;
  }

  @keyframes blink {
    50% {
      opacity: 0;
    }
  }

  /* 打字点 */
  .typing-dots {
    display: inline-flex;
    gap: 5px;
    padding: 4px 2px;
  }

  .typing-dots i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--muse-primary);
    animation: bounce 1.2s ease-in-out infinite;
    opacity: 0.4;
  }

  .typing-dots i:nth-child(2) {
    animation-delay: 0.18s;
  }

  .typing-dots i:nth-child(3) {
    animation-delay: 0.36s;
  }

  @keyframes bounce {

    0%,
    80%,
    100% {
      transform: translateY(0);
      opacity: 0.35;
    }

    40% {
      transform: translateY(-7px);
      opacity: 1;
    }
  }

  /* ============================================
   消息操作 — 可配置动作区
   （按钮 / 下拉菜单 / 组合输入框 / 分隔线）
   ============================================ */
  .message-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 5px;
    padding: 0 2px;
    opacity: 0;
    transition: opacity var(--duration-base) ease;
  }

  .message-row:hover .message-actions,
  .message-row:focus-within .message-actions {
    opacity: 1;
  }

  @media (hover: none) {
    .message-actions {
      opacity: 1;
    }
  }

  .mini-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: transparent;
    border: none;
    color: var(--muse-text-tertiary);
    font-size: var(--font-size-xs);
    vertical-align: middle;
    font-family: var(--font-system);
    cursor: pointer;
    padding: 3px 8px;
    border-radius: var(--radius-sm);
    line-height: var(--line-height-none);
    transition: all var(--duration-fast) ease;
  }

  .mini-btn:hover:not(:disabled) {
    color: var(--muse-primary);
    background: var(--muse-primary-soft);
  }

  .mini-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .mini-btn--active {
    color: var(--muse-primary);
    background: var(--muse-primary-soft);
  }

  .mini-btn--combo {
    border-left: 1px solid var(--muse-border);
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    background: var(--muse-primary-soft);
    color: var(--muse-primary);
    font-weight: 500;
    white-space: nowrap;
  }

  .mini-btn--combo:hover:not(:disabled) {
    background: var(--muse-primary);
    color: #fff;
  }

  /* 分隔线 */
  .action-divider {
    width: 1px;
    height: 14px;
    margin: auto 2px;
    background: var(--muse-border-strong);
    flex: 0 0 auto;
  }

  /* 下拉菜单 */
  .action-dropdown {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  .action-arrow {
    font-size: var(--font-size-2xs);
    opacity: 0.6;
    transition: transform var(--duration-fast) ease;
  }

  .action-dropdown.open .action-arrow {
    transform: rotate(180deg);
  }

  .action-menu {
    position: absolute;
    left: 0;
    top: calc(100% + 4px);
    z-index: 30;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 150px;
    max-height: 260px;
    overflow-y: auto;
    padding: 5px;
    background: var(--muse-surface);
    border: 1px solid var(--muse-border-strong);
    border-radius: var(--radius-lg);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14);
  }

  .action-menu-item {
    display: flex;
    align-items: center;
    gap: 7px;
    width: 100%;
    padding: 7px 10px;
    border: none;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--muse-text-secondary);
    font-size: var(--font-size-xs);
    font-family: var(--font-system);
    text-align: left;
    white-space: nowrap;
    cursor: pointer;
    transition: background var(--duration-fast) ease,
      color var(--duration-fast) ease;
  }

  .action-menu-item:hover:not(:disabled) {
    background: var(--muse-primary-soft);
    color: var(--muse-primary);
  }

  .action-menu-item:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .action-menu-label {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* 组合输入框 + 按钮 */
  .action-input-group {
    display: inline-flex;
    align-items: stretch;
    height: 26px;
    background: var(--muse-surface);
    border: 1px solid var(--muse-border-strong);
    border-radius: var(--radius-sm);
    overflow: hidden;
    transition: border-color var(--duration-fast) ease,
      box-shadow var(--duration-fast) ease;
  }

  .action-input-group:focus-within {
    border-color: var(--muse-primary);
    box-shadow: 0 0 0 2px var(--muse-primary-ring);
  }

  .action-input {
    width: 110px;
    min-width: 60px;
    height: 100%;
    padding: 0 8px;
    border: none;
    outline: none;
    background: transparent;
    color: var(--muse-text);
    font-size: var(--font-size-xs);
    font-family: var(--font-system);
  }

  .action-input::placeholder {
    color: var(--muse-text-tertiary);
  }

  .action-input:disabled {
    opacity: 0.45;
  }

  /* 菜单过渡（兼容 Vue 2 / Vue 3 过渡类名） */
  .action-menu-enter-active,
  .action-menu-leave-active {
    transition: opacity var(--duration-fast) ease,
      transform var(--duration-fast) ease;
  }

  .action-menu-enter,
  .action-menu-enter-from,
  .action-menu-leave-to {
    opacity: 0;
    transform: translateY(-4px);
  }

  /* 回到底部 */
  .scroll-bottom-btn {
    position: sticky;
    bottom: 14px;
    left: 50%;
    transform: translateX(-50%);
    display: block;
    margin: 0 auto;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 1px solid var(--muse-border-strong);
    background: var(--muse-surface);
    color: var(--muse-text-secondary);
    font-size: var(--font-size-md);
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
    transition: all var(--duration-base) ease;
  }

  .scroll-bottom-btn:hover {
    color: var(--muse-primary);
    border-color: var(--muse-primary);
    transform: translateX(-50%) translateY(-1px);
  }

  .fade-up-enter-active,
  .fade-up-leave-active {
    transition: all var(--duration-slow) ease;
  }

  .fade-up-enter-from,
  .fade-up-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(8px);
  }

  /* ============================================
   Markdown 渲染样式
   ============================================ */
  .bubble-content p {
    margin: 0 0 8px;
  }

  .bubble-content p:last-child {
    margin-bottom: 0;
  }

  .bubble-content h1,
  .bubble-content h2,
  .bubble-content h3,
  .bubble-content h4 {
    font-size: var(--font-size-md);
    font-weight: 700;
    margin: 14px 0 6px;
    color: var(--muse-text);
  }

  .bubble-content ul,
  .bubble-content ol {
    margin: 6px 0;
    padding-left: 20px;
  }

  .bubble-content li {
    margin: 3px 0;
  }

  .bubble-content code.md-inline {
    background: rgba(0, 122, 255, 0.09);
    color: var(--muse-primary-active);
    border-radius: var(--radius-xs);
    padding: 1px 6px;
    font-size: var(--font-size-sm);
    font-family: "JetBrains Mono", "Fira Code", Menlo, Consolas, monospace;
  }

  .bubble-content pre.md-code {
    background: #1d1d1f;
    color: #f5f5f7;
    border-radius: var(--radius-lg);
    padding: 14px 16px;
    overflow-x: auto;
    margin: 10px 0;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-base);
  }

  .bubble-content pre.md-code code {
    font-family: "JetBrains Mono", "Fira Code", Menlo, Consolas, monospace;
    background: transparent;
    color: inherit;
  }

  .bubble-content blockquote {
    border-left: 3px solid var(--muse-primary);
    margin: 8px 0;
    padding: 2px 0 2px 12px;
    color: var(--muse-text-secondary);
  }

  .bubble-content a {
    color: var(--muse-primary);
    text-decoration: none;
    border-bottom: 1px solid rgba(0, 122, 255, 0.3);
  }

  .bubble-content a:hover {
    color: var(--muse-primary-hover);
  }

  .bubble--user .bubble-content code.md-inline {
    background: rgba(255, 255, 255, 0.18);
    color: #fff;
  }

  .bubble--user .bubble-content pre.md-code {
    background: rgba(0, 0, 0, 0.25);
  }

  /* ============================================
   输入区
   ============================================ */
  .chatbox-composer {
    position: relative;
    z-index: 10;
    padding: 12px var(--layout-gutter) 20px;
  }

  .composer-inner {
    position: relative;
    max-width: var(--layout-max);
    margin: 0 auto;
    background: var(--glass-bg);
    border: 1px solid var(--muse-border);
    border-radius: 24px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
    backdrop-filter: saturate(160%) blur(16px);
    -webkit-backdrop-filter: saturate(160%) blur(16px);
    padding: 14px 16px 12px;
    transition: box-shadow var(--duration-slow) ease,
      border-color var(--duration-slow) ease;
  }

  .composer-inner:focus-within {
    border-color: var(--muse-primary);
    box-shadow: 0 0 0 3px var(--muse-primary-ring), 0 8px 30px rgba(0, 0, 0, 0.05);
  }

  .composer-input {
    width: 100%;
    border: none;
    outline: none;
    resize: none;
    background: transparent;
    font-family: var(--font-system);
    font-size: var(--font-size-md);
    line-height: var(--line-height-base);
    color: var(--muse-text);
    max-height: 180px;
    padding: 2px 2px 6px;
  }

  /* 欢迎态：输入框成为页面的视觉锚点 */
  .chatbox-composer.is-welcome .composer-inner {
    min-height: 132px;
  }

  .chatbox-composer.is-welcome .composer-input {
    min-height: 64px;
  }

  .composer-input::placeholder {
    color: var(--muse-text-tertiary);
  }

  .composer-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 2px;
  }

  .composer-hint {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 26px;
    min-width: 0;
  }

  .model-hint {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: var(--font-size-xs);
    color: var(--muse-text-tertiary);
    letter-spacing: 0.01em;
  }

  .streaming-hint {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: var(--font-size-xs);
    color: var(--muse-primary);
    font-weight: 500;
  }

  .hint-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--muse-primary);
    animation: pulse 1.2s ease-in-out infinite;
  }

  @keyframes pulse {

    0%,
    100% {
      opacity: 0.35;
      transform: scale(0.9);
    }

    50% {
      opacity: 1;
      transform: scale(1.1);
    }
  }

  .composer-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .send-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: var(--muse-primary);
    border: none;
    color: #fff;
    border-radius: 50%;
    font-size: var(--font-size-md);
    font-family: var(--font-system);
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
    transition: background var(--duration-base) ease,
      transform var(--duration-base) ease, box-shadow var(--duration-base) ease;
  }

  .send-btn:hover:not(:disabled) {
    background: var(--muse-primary-hover);
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0, 122, 255, 0.34);
  }

  .send-btn:active:not(:disabled) {
    transform: translateY(0) scale(0.97);
    background: var(--muse-primary-active);
  }

  .message-body p {
    margin: 0;
  }

  .send-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    box-shadow: none;
  }

  .send-btn--stop {
    width: auto;
    height: 40px;
    padding: 0 16px;
    gap: 6px;
    border-radius: 20px;
    background: var(--muse-surface);
    border: 1px solid var(--muse-border-strong);
    color: var(--muse-text-secondary);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .send-btn--stop:hover {
    background: var(--muse-surface);
    border-color: #dc2626;
    color: #dc2626;
    box-shadow: 0 3px 10px rgba(220, 38, 38, 0.16);
  }

  /* ============================================
   子窗口层 — 同源内嵌 / 最小化 / 索引导航 / 可收起
   ============================================ */
  .child-trigger-btn {
    position: absolute;
    top: -40px;
    right: 6px;
    z-index: 55;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px 6px 12px;
    border: 1px solid var(--muse-border-strong);
    border-radius: var(--radius-full);
    background: var(--glass-bg);
    backdrop-filter: saturate(160%) blur(16px);
    -webkit-backdrop-filter: saturate(160%) blur(16px);
    box-shadow: var(--glass-shadow);
    color: var(--muse-text-secondary);
    font-family: var(--font-system);
    font-size: var(--font-size-xs);
    line-height: var(--line-height-none);
    cursor: pointer;
    transition: all var(--duration-base) ease;
  }

  .child-trigger-btn:hover {
    color: var(--muse-primary);
    border-color: rgba(0, 122, 255, 0.35);
    box-shadow: var(--glass-shadow-hover);
    transform: translateY(-1px);
  }

  .child-trigger-btn--hidden {
    opacity: 0.8;
    border-style: dashed;
  }

  .child-trigger-count {
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-lg);
    background: var(--muse-primary);
    color: #fff;
    font-size: var(--font-size-2xs);
    font-weight: 700;
  }

  .child-window-layer {
    position: absolute;
    right: 20px;
    bottom: 168px;
    width: min(840px, 64vw);
    height: min(62vh, 620px);
    min-height: 240px;
    z-index: 50;
    overflow: hidden;
    background: var(--glass-bg);
    border: 1px solid var(--muse-border-strong);
    border-radius: var(--radius-card);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2), var(--glass-shadow-hover);
    backdrop-filter: saturate(160%) blur(18px);
    -webkit-backdrop-filter: saturate(160%) blur(18px);
  }

  .child-window-nav {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 42px;
    box-sizing: border-box;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 10px;
    border-bottom: 1px solid var(--muse-border);
    background: var(--glass-bg);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  }

  .child-nav-count {
    flex: 0 0 auto;
    height: 22px;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 0 9px;
    border-radius: var(--radius-full);
    background: var(--muse-primary-soft);
    color: var(--muse-primary-active);
    font-size: var(--font-size-xs);
    font-weight: 600;
  }

  .child-nav-count i {
    font-size: var(--font-size-sm);
  }

  .child-nav-tabs {
    flex: 1 1 auto;
    min-width: 0;
    height: 100%;
    display: flex;
    align-items: center;
    gap: 6px;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .child-nav-tabs::-webkit-scrollbar {
    display: none;
  }

  .child-nav-tab {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    max-width: 180px;
    height: 28px;
    box-sizing: border-box;
    padding: 0 8px 0 6px;
    border: 1px solid transparent;
    border-radius: var(--radius-lg);
    background: transparent;
    color: var(--muse-text-secondary);
    font-family: var(--font-system);
    font-size: var(--font-size-xs);
    cursor: pointer;
    transition: all var(--duration-base) ease;
  }

  .child-nav-tab:hover {
    background: var(--muse-primary-soft);
    color: var(--muse-text);
  }

  .child-nav-tab.active {
    background: var(--muse-primary-soft);
    border-color: rgba(0, 122, 255, 0.28);
    color: var(--muse-primary-active);
    font-weight: 600;
  }

  .child-nav-tab.minimized {
    opacity: 0.55;
  }

  .child-nav-index {
    flex: 0 0 auto;
    width: 18px;
    height: 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(0, 122, 255, 0.1);
    color: var(--muse-primary);
    font-size: var(--font-size-2xs);
    font-weight: 700;
  }

  .child-nav-tab.active .child-nav-index {
    background: var(--muse-primary);
    color: #fff;
  }

  .child-nav-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .child-nav-mini {
    flex: 0 0 auto;
    color: var(--muse-text-tertiary);
    font-size: var(--font-size-xs);
  }

  .child-nav-close {
    flex: 0 0 auto;
    width: 18px;
    height: 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: var(--muse-text-tertiary);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-none);
    cursor: pointer;
    transition: all var(--duration-fast) ease;
  }

  .child-nav-close:hover {
    background: rgba(220, 38, 38, 0.12);
    color: #dc2626;
  }

  .child-nav-actions {
    flex: 0 0 auto;
    height: 100%;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .child-nav-btn {
    width: 26px;
    height: 26px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--muse-text-secondary);
    font-size: var(--font-size-sm);
    cursor: pointer;
    transition: all var(--duration-fast) ease;
  }

  .child-nav-btn:hover:not(:disabled) {
    background: var(--muse-hover);
    color: var(--muse-text);
  }

  .child-nav-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .child-nav-btn--danger:hover:not(:disabled) {
    background: rgba(220, 38, 38, 0.1);
    color: #dc2626;
  }

  .child-window-body {
    position: absolute;
    top: 42px;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    background: var(--muse-surface);
  }

  .child-window-frame {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: none;
    background: var(--muse-surface);
  }

  .child-window-collapsed {
    position: absolute;
    top: 42px;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: var(--muse-text-tertiary);
    font-size: var(--font-size-sm);
  }

  .child-collapsed-icon {
    font-size: var(--font-size-2xl);
    opacity: 0.5;
  }

  .child-win-enter-active,
  .child-win-leave-active {
    transition: all var(--duration-slow) cubic-bezier(0.34, 1.2, 0.64, 1);
  }

  .child-win-enter-from,
  .child-win-leave-to {
    opacity: 0;
    transform: translateY(14px) scale(0.97);
  }

  /* ============================================
   Skill 配置 — 右上角入口按钮 + 弹层
   ============================================ */
  .icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: var(--radius-2xl);
    background: transparent;
    color: var(--muse-text-secondary);
    font-size: var(--font-size-md);
    line-height: var(--line-height-none);
    cursor: pointer;
    transition: background var(--duration-base) ease,
      color var(--duration-base) ease;
    flex: 0 0 auto;
  }

  .icon-btn:hover {
    background: var(--muse-hover);
    color: var(--muse-primary);
  }

  .navbar-text-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 36px;
    padding: 0 12px;
    border: none;
    border-radius: var(--radius-2xl);
    background: transparent;
    color: var(--muse-text-secondary);
    font-size: var(--font-size-sm);
    font-weight: 500;
    font-family: var(--font-system);
    line-height: var(--line-height-none);
    cursor: pointer;
    white-space: nowrap;
    transition: background var(--duration-base) ease,
      color var(--duration-base) ease;
  }

  .navbar-text-btn:hover {
    background: var(--muse-hover);
    color: var(--muse-primary);
  }

  .skill-config-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 36px;
    padding: 0 12px;
    border: none;
    border-radius: var(--radius-2xl);
    background: transparent;
    color: var(--muse-text-secondary);
    font-size: var(--font-size-sm);
    font-weight: 500;
    font-family: var(--font-system);
    line-height: var(--line-height-none);
    cursor: pointer;
    white-space: nowrap;
    transition: background var(--duration-base) ease,
      color var(--duration-base) ease;
  }

  .skill-config-btn:hover {
    background: var(--muse-hover);
    color: var(--muse-primary);
  }

  .skill-config-btn i {
    font-size: var(--font-size-sm);
  }

  /* ============================================
   右上角配置下拉菜单
   ============================================ */
  .config-menu-wrap {
    position: relative;
    display: inline-flex;
    flex: 0 0 auto;
  }

  .config-menu-caret {
    font-size: 10px;
    margin-left: 2px;
    transition: transform var(--duration-base) ease;
  }

  .config-menu-wrap .skill-config-btn.is-open .config-menu-caret {
    transform: rotate(180deg);
  }

  .config-menu {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    z-index: 120;
    min-width: 168px;
    margin: 0;
    padding: 6px;
    list-style: none;
    background: var(--muse-surface);
    border: 1px solid var(--muse-border-strong);
    border-radius: var(--radius-3xl);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.16);
  }

  .config-menu-item {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 8px 10px;
    border-radius: var(--radius-md);
    color: var(--muse-text-secondary);
    font-size: var(--font-size-sm);
    font-weight: 500;
    font-family: var(--font-system);
    cursor: pointer;
    white-space: nowrap;
    transition: all var(--duration-base) ease;
  }

  .config-menu-item i {
    font-size: var(--font-size-base);
    color: var(--muse-text-tertiary);
    transition: color var(--duration-base) ease;
  }

  .config-menu-item:hover {
    background: var(--muse-hover);
    color: var(--muse-primary);
  }

  .config-menu-item:hover i {
    color: var(--muse-primary);
  }

  .config-menu-divider {
    height: 1px;
    margin: 6px 4px;
    background: var(--muse-border);
  }

  .config-menu-enter-active,
  .config-menu-leave-active {
    transition: opacity var(--duration-base) ease,
      transform var(--duration-base) ease;
    transform-origin: top right;
  }

  .config-menu-enter-from,
  .config-menu-leave-to {
    opacity: 0;
    transform: translateY(-6px) scale(0.98);
  }

  .skill-config-mask {
    position: absolute;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(0, 0, 0, 0.32);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
  }

  .skill-config-panel {
    width: 440px;
    max-width: 100%;
    max-height: 100%;
    overflow-y: auto;
    background: var(--muse-surface);
    border-radius: var(--radius-3xl);
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.24);
    padding: 18px 20px 20px;
  }

  .skill-config-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .skill-config-title {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: var(--font-size-md);
    font-weight: 600;
    color: var(--muse-text);
  }

  .skill-config-title i {
    color: var(--muse-primary);
    font-size: var(--font-size-md);
  }

  .skill-config-close {
    width: 26px;
    height: 26px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--muse-text-tertiary);
    font-size: var(--font-size-lg);
    line-height: var(--line-height-none);
    cursor: pointer;
    transition: all var(--duration-fast) ease;
  }

  .skill-config-close:hover {
    background: var(--muse-hover);
    color: var(--muse-text);
  }

  .skill-config-section-title {
    font-size: var(--font-size-xs);
    font-weight: 600;
    color: var(--muse-text-tertiary);
    letter-spacing: 0.02em;
    margin: 4px 0 8px;
  }

  .skill-config-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
  }

  .skill-config-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border: 1px solid var(--muse-border);
    border-radius: var(--radius-lg);
    background: var(--muse-card);
  }

  .skill-config-item-icon {
    flex: 0 0 auto;
    color: var(--muse-primary);
    font-size: var(--font-size-base);
  }

  .skill-config-name {
    flex: 1;
    min-width: 0;
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--muse-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .skill-config-id {
    flex: 0 0 auto;
    max-width: 180px;
    font-family: "JetBrains Mono", "Fira Code", Menlo, Consolas, monospace;
    font-size: var(--font-size-2xs);
    color: var(--muse-text-tertiary);
    background: var(--muse-hover);
    border-radius: var(--radius-sm);
    padding: 1px 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .skill-config-item-fields {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .skill-config-item--example {
    align-items: flex-start;
  }

  .skill-config-item-row {
    display: flex;
    gap: 6px;
  }

  .skill-config-edit {
    width: 100%;
    height: 28px;
    padding: 0 8px;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    background: var(--muse-surface);
    font-size: var(--font-size-xs);
    font-family: var(--font-system);
    color: var(--muse-text);
    outline: none;
    transition: border-color var(--duration-fast) ease,
      box-shadow var(--duration-fast) ease;
  }

  .skill-config-edit--id {
    font-family: "JetBrains Mono", "Fira Code", Menlo, Consolas, monospace;
    font-size: var(--font-size-2xs);
    color: var(--muse-text-secondary);
  }

  .skill-config-edit--icon {
    flex: 0 0 auto;
    width: 58px;
    text-align: center;
  }

  .skill-config-edit--area {
    height: auto;
    min-height: 52px;
    padding: 6px 8px;
    line-height: 1.5;
    resize: vertical;
  }

  .skill-config-edit:hover {
    border-color: var(--muse-border-strong);
  }

  .skill-config-edit:focus {
    border-color: var(--muse-primary);
    box-shadow: 0 0 0 3px var(--muse-primary-ring);
  }

  .skill-config-item-del {
    flex: 0 0 auto;
    width: 22px;
    height: 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--muse-text-tertiary);
    font-size: var(--font-size-md);
    line-height: var(--line-height-none);
    cursor: pointer;
    transition: all var(--duration-fast) ease;
  }

  .skill-config-item-del:hover {
    background: rgba(220, 38, 38, 0.12);
    color: #dc2626;
  }

  .skill-config-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 20px 12px;
    margin-bottom: 16px;
    color: var(--muse-text-tertiary);
    font-size: var(--font-size-sm);
  }

  .skill-config-empty i {
    font-size: var(--font-size-xl);
    opacity: 0.6;
  }

  .skill-config-add {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .skill-config-field {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .skill-config-field>span {
    font-size: var(--font-size-xs);
    color: var(--muse-text-secondary);
  }

  .skill-config-field input {
    height: 34px;
    padding: 0 10px;
    border: 1px solid var(--muse-border-strong);
    border-radius: var(--radius-lg);
    background: var(--muse-surface);
    font-size: var(--font-size-sm);
    font-family: var(--font-system);
    color: var(--muse-text);
    outline: none;
    transition: border-color var(--duration-fast) ease,
      box-shadow var(--duration-fast) ease;
  }

  .skill-config-field input::placeholder {
    color: var(--muse-text-tertiary);
  }

  .skill-config-field input:focus {
    border-color: var(--muse-primary);
    box-shadow: 0 0 0 3px var(--muse-primary-ring);
  }

  .skill-config-add-row {
    display: flex;
    gap: 10px;
  }

  .skill-config-field--icon {
    flex: 0 0 auto;
    width: 76px;
  }

  .skill-config-field--grow {
    flex: 1;
    min-width: 0;
  }

  .skill-config-textarea {
    width: 100%;
    min-height: 60px;
    padding: 8px 10px;
    border: 1px solid var(--muse-border-strong);
    border-radius: var(--radius-lg);
    background: var(--muse-surface);
    font-size: var(--font-size-sm);
    font-family: var(--font-system);
    color: var(--muse-text);
    line-height: 1.5;
    outline: none;
    resize: vertical;
    transition: border-color var(--duration-fast) ease,
      box-shadow var(--duration-fast) ease;
  }

  .skill-config-textarea::placeholder {
    color: var(--muse-text-tertiary);
  }

  .skill-config-textarea:focus {
    border-color: var(--muse-primary);
    box-shadow: 0 0 0 3px var(--muse-primary-ring);
  }

  .skill-config-add-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 34px;
    border: none;
    border-radius: var(--radius-lg);
    background: var(--muse-primary);
    color: #fff;
    font-size: var(--font-size-sm);
    font-weight: 600;
    font-family: var(--font-system);
    cursor: pointer;
    transition: all var(--duration-base) ease;
  }

  .skill-config-add-btn:hover:not(:disabled) {
    background: var(--muse-primary-hover);
  }

  .skill-config-add-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .skill-config-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 18px;
    padding-top: 14px;
    border-top: 1px solid var(--muse-border);
    /* 取消 / 确认按钮始终可见：吸附在弹层底部，不随内容滚动 */
    position: sticky;
    bottom: -20px;
    margin-bottom: -20px;
    padding-bottom: 20px;
    background: var(--muse-surface);
  }

  .skill-config-cancel-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 34px;
    padding: 0 16px;
    border: 1px solid var(--muse-border-strong);
    border-radius: var(--radius-lg);
    background: var(--muse-surface);
    color: var(--muse-text-secondary);
    font-size: var(--font-size-sm);
    font-weight: 500;
    font-family: var(--font-system);
    cursor: pointer;
    transition: all var(--duration-base) ease;
  }

  .skill-config-cancel-btn:hover {
    border-color: var(--muse-primary);
    color: var(--muse-primary);
  }

  .skill-config-confirm-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 34px;
    padding: 0 18px;
    border: none;
    border-radius: var(--radius-lg);
    background: var(--muse-primary);
    color: #fff;
    font-size: var(--font-size-sm);
    font-weight: 600;
    font-family: var(--font-system);
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 122, 255, 0.32);
    transition: all var(--duration-base) ease;
  }

  .skill-config-confirm-btn:hover {
    background: var(--muse-primary-hover);
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0, 122, 255, 0.36);
  }

  .skill-config-enter-active,
  .skill-config-leave-active {
    transition: opacity var(--duration-base) ease;
  }

  .skill-config-enter,
  .skill-config-enter-from,
  .skill-config-leave-to {
    opacity: 0;
  }

  /* ============================================
   响应式
   ============================================ */
  @media (max-width: 640px) {
    .chatbox-bg {
      --layout-gutter: 12px;
    }

    .chatbox-navbar {
      height: 60px;
    }

    .chatbox-main {
      padding: 10px var(--layout-gutter) 14px;
    }

    .chatbox-composer {
      padding: 8px var(--layout-gutter) 12px;
    }

    .empty-title {
      font-size: 30px;
    }

    .empty-subtitle {
      font-size: 16px;
    }

    .empty-chips {
      grid-template-columns: 1fr;
    }

    /* 标题区域占据剩余空间，避免被右侧操作挤压/遮挡 */
    .navbar-left {
      flex: 1;
      min-width: 0;
    }

    .navbar-title {
      flex: 1;
      min-width: 0;
    }

    /* 右侧操作区不收缩，避免按钮变形溢出 */
    .navbar-inner>div:last-child {
      flex-shrink: 0;
    }

    /* Skill 配置按钮移动端隐藏 */
    .skill-config-btn {
      display: none;
    }

    /* 清空对话按钮只保留图标，缩小占位 */
    .navbar-text-btn {
      width: 30px;
      min-width: 30px;
      padding: 0;
      justify-content: center;
      gap: 0;
    }

    .navbar-text-btn span {
      display: none;
    }

    /* 登录项间距收紧 */
    .refined-user-card {
      margin-left: 8px !important;
    }

    .message-body {
      max-width: calc(100% - 50px);
    }

    .child-window-layer {
      left: 12px;
      right: 12px;
      bottom: 120px;
      width: auto;
      height: min(68vh, 600px);
    }

    .child-nav-title {
      max-width: 96px;
    }

    .child-trigger-btn {
      top: -36px;
      right: 8px;
      padding: 5px 9px 5px 10px;
      font-size: var(--font-size-xs);
    }

    .child-trigger-text {
      display: none;
    }
  }
</style>

<script>
  export default {
    "name": "ChatBox",
    "data": function() {
      return {
        loading: false,
        loadingText: "正在思考…",
        inputPlaceholder: "输入你的问题，Enter 发送，Shift+Enter 换行",
        isStreaming: false,
        abortController: null,
        messageActions: [{
            type: "button",
            key: "copy",
            label: "复制",
            icon: "bi bi-copy",
          },
          {
            type: "button",
            key: "skill",
            id: webCpu.appConfig.pptDocument,
            label: "生成 PPT",
            icon: "bi bi-copy",
          },
          {
            type: "button",
            key: "skill",
            id: webCpu.appConfig.text2chart,
            label: "生成图表",
            icon: "bi bi-copy",
          },
          {
            type: "divider",
          },
          {
            type: "dropdown",
            key: "more",
            label: "更多",
            children: [{
              key: "regen",
              label: "重新生成",
              icon: "bi bi-arrow-repeat",
            }, ],
          },
          {
            type: "input-button",
            key: "skill",
            placeholder: "输入 AI Skill ID",
            buttonText: ">",
          },
        ],
        draft: "",
        openMenuId: "",
        showScrollHint: false,
        messages: [],
        title: "同行助手",
        subtitle: "与你同行，在真理与恩典中寻找答案。",
        introduce: "求真而不妄断，求善而不说教，求美而不矫饰。",
        documentMeta: webCpu.documentMeta,
        icon: "聊",
        exampleList: [{
            icon: "🌿",
            title: "在困惑中找到方向",
            desc: "最近我对未来很迷茫，工作、生活和信仰好像都没有方向。我不知道自己到底该追求什么，你能不能陪我一起梳理一下？",
          },
          {
            icon: "🧭",
            title: "分辨一个重要选择",
            desc: "我现在面临一个重要的人生选择，两边都有道理，我也不知道哪一个更符合上帝的心意。能不能从圣经的原则、我的动机和现实情况几个方面陪我一起分辨？",
          },
          {
            icon: "💛",
            title: "面对自己的挣扎",
            desc: "我明明知道有些事情不对，却总是一再重复，之后又很自责，甚至觉得自己是不是根本改变不了。你能不能陪我看看，我到底被什么困住了，以及可以怎样回到上帝面前重新开始？",
          },
        ],
        query: {
          "documentId": "49f774c4c3ccbf42d7dac0f89fe412c4"
        },
        content: {
          outputText: "",
        },
        isSolo: WebTool.urlQuery(location.href, "solo"),
        dataEditable: true,
        // 子窗口管理：当前窗口内打开的同源子页面（iframe），支持最小化与索引导航
        childWindows: [],
        activeChildId: "",
        // 子窗口浮窗面板显示/隐藏（隐藏后仅保留输入框右上方的控制按钮）
        childPanelVisible: true,
        // Skill 配置弹层：登录态下用于查看 / 新增 messageActions 中的 skill 元素
        skillConfigVisible: false,
        skillDraft: {
          name: "",
          id: "",
        },
        // 基础信息配置弹层：标题 / 一句话介绍 / 示例列表
        infoConfigVisible: false,
        infoDraft: {
          title: "",
          subtitle: "",
          introduce: "",
          exampleIcon: "",
          exampleTitle: "",
          exampleDesc: "",
        },
        // 右上角配置下拉菜单（基础信息 / Skill 配置 / 人设提示词 / 知识库配置）
        configMenuVisible: false,
        // Markdown 渲染：按需加载 markdown-it + DOMPurify，就绪后用于渲染与消毒
        mdLib: null,
        mdReady: false,
        mdLoading: false,
        // 会话持久化：按文档隔离的历史存储键
        storageKey: "",
        // 主题：auto（跟随系统）/ light / dark
        theme: "auto",
        defaultTemplate: ""
      };
    },
    "computed": {
      "resolvedTheme": function() {
        if (this.theme !== "auto") {
          return this.theme;
        }
        const sysDark =
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;
        return sysDark ? "dark" : "light";
      },
      "canSend": function() {
        return !!(this.draft && this.draft.trim()) && !this.isStreaming;
      },
      "documentId": function() {
        let documentId = this.query.documentId;
        if (
          !documentId &&
          webCpu.currentCard &&
          webCpu.currentCard.task &&
          webCpu.currentCard.task.vueItem &&
          webCpu.currentCard.task.vueItem.documentMeta
        ) {
          documentId = webCpu.currentCard.task.vueItem.documentMeta.documentId;
        }
        return documentId;
      },
      "effectiveMessageActions": function() {
        // 动作区配置优先级：props.messageActions > content.messageActions > 默认复制按钮
        if (Array.isArray(this.messageActions) && this.messageActions.length) {
          return this.messageActions;
        }
        if (
          this.content &&
          Array.isArray(this.content.messageActions) &&
          this.content.messageActions.length
        ) {
          return this.content.messageActions;
        }
        return this.defaultMessageActions();
      },
      "activeChildWindow": function() {
        return this.childWindows.find((w) => w.id === this.activeChildId) || null;
      },
      "isOwnerLogged": function() {
        // 登录态判断：localStorage 中的 token / userInfo
        if (localStorage.folderName === webCpu.documentMeta.folderName) {
          return true;
        } else {
          return false;
        }
      },
      "skillActionItems": function() {
        // 收集所有 key 为 skill 且带 id 的元素（含一级菜单项与"更多"子菜单项）
        var list = this.effectiveMessageActions || [];
        var result = [];
        var collect = function(arr) {
          if (!Array.isArray(arr)) {
            return;
          }
          arr.forEach(function(item) {
            if (!item) {
              return;
            }
            if (item.key === "skill" && item.id) {
              result.push(item);
            }
            if (Array.isArray(item.children)) {
              collect(item.children);
            }
          });
        };
        collect(list);
        return result;
      },
      "canAddSkill": function() {
        return (
          !!(this.skillDraft.name && this.skillDraft.name.trim()) &&
          !!(this.skillDraft.id && this.skillDraft.id.trim())
        );
      },
      "canAddExample": function() {
        return !!(
          this.infoDraft.exampleTitle && this.infoDraft.exampleTitle.trim()
        );
      }
    },
    "methods": {
      "__openChatboxDB": function() {
        if (!this.__chatboxDBPromise) {
          this.__chatboxDBPromise = new Promise(function(resolve, reject) {
            if (!window.indexedDB) {
              reject(new Error("indexedDB not supported"));
              return;
            }
            var req = window.indexedDB.open("chatbox_db", 1);
            req.onupgradeneeded = function(e) {
              var db = e.target.result;
              if (!db.objectStoreNames.contains("histories")) {
                db.createObjectStore("histories", {
                  keyPath: "key",
                });
              }
            };
            req.onsuccess = function(e) {
              resolve(e.target.result);
            };
            req.onerror = function(e) {
              reject(e.target.error);
            };
          });
        }
        return this.__chatboxDBPromise;
      },
      "__chatboxDBPut": function(key, value) {
        return this.__openChatboxDB().then(function(db) {
          return new Promise(function(resolve, reject) {
            var tx = db.transaction("histories", "readwrite");
            var store = tx.objectStore("histories");
            store.put({
              key: key,
              value: value,
              updatedAt: Date.now(),
            });
            tx.oncomplete = function() {
              resolve();
            };
            tx.onerror = function() {
              reject(tx.error);
            };
          });
        });
      },
      "__chatboxDBGet": function(key) {
        return this.__openChatboxDB().then(function(db) {
          return new Promise(function(resolve, reject) {
            var tx = db.transaction("histories", "readonly");
            var store = tx.objectStore("histories");
            var req = store.get(key);
            req.onsuccess = function() {
              resolve(req.result ? req.result.value : null);
            };
            req.onerror = function() {
              reject(req.error);
            };
          });
        });
      },
      "__chatboxDBDelete": function(key) {
        return this.__openChatboxDB().then(function(db) {
          return new Promise(function(resolve, reject) {
            var tx = db.transaction("histories", "readwrite");
            var store = tx.objectStore("histories");
            store.delete(key);
            tx.oncomplete = function() {
              resolve();
            };
            tx.onerror = function() {
              reject(tx.error);
            };
          });
        });
      },
      "confirmMessageActions": function() {
        webCpu.mitt.emit("setDataMap", {
          messageActions: this.messageActions,
        });
      },
      "actionHandler": function(value) {
        // 消息动作接管处理：
        // - skill：不再新开浏览器标签页，而是在当前窗口内打开同源子页面（inner iframe），
        //   并纳入子窗口管理器：支持最小化；打开多个时仅展示当前激活窗口，
        //   其余自动最小化，顶部“索引导航”可随时切换 / 恢复 / 关闭。
        let item = (value && value.item) || value || {};

        if (item.key === "skill") {
          const url = this.buildChildWindowUrl(item, value);
          if (url) {
            this.openChildWindow({
              url: url,
              title: item.label || item.name || "子窗口",
            });
            localStorage.agentInput = value.message.content;
            // 返回 false 表示已接管该动作，跳过默认行为
            return false;
          }
        }
        return undefined;
      },
      "buildChildWindowUrl": function(item, value) {
        // 优先取按钮配置的 id，其次取组合输入框提交的 Skill ID（value 可能为字符串）
        const id =
          (item && item.id) ||
          (value && typeof value === "object" && value.value) ||
          (typeof value === "string" && value) ||
          "";
        if (!id) {
          return "";
        }
        try {
          // 以当前地址为基座，仅替换查询参数，保持同源开子页
          const url = new URL(location.href.split("#")[0]);
          url.searchParams.set("id", String(id));
          url.searchParams.set("solo", "true");
          url.searchParams.set("auto", "true");
          return url.href;
        } catch (e) {
          return `${location.origin}?id=${encodeURIComponent(
          id
        )}&solo=true&auto=true`;
        }
      },
      "openChildWindow": function(opts) {
        opts = opts || {};
        const win = {
          id: "cw_" +
            Date.now().toString(36) +
            Math.random().toString(36).slice(2, 8),
          title: opts.title || "子窗口",
          url: opts.url || "",
          minimized: false,
          createdAt: Date.now(),
        };
        // 保证同时只显示一个子窗口：新窗口激活，其余全部最小化
        this.childWindows.forEach((w) => {
          w.minimized = true;
        });
        this.childWindows.push(win);
        this.activeChildId = win.id;
        // 新开任务时自动展开面板，确保用户能看到新窗口
        this.childPanelVisible = true;
        return win;
      },
      "toggleChildPanel": function() {
        if (!this.childWindows.length) {
          return;
        }
        this.childPanelVisible = !this.childPanelVisible;
      },
      "activateChildWindow": function(id) {
        const win = this.childWindows.find((w) => w.id === id);
        if (!win) {
          return;
        }
        // 激活目标窗口，其余自动最小化
        this.childWindows.forEach((w) => {
          w.minimized = w.id !== id;
        });
        this.activeChildId = id;
      },
      "closeChildWindow": function(id) {
        var langKey = "zh";
        if (webCpu && webCpu.lang) {
          langKey = webCpu.lang;
        } else if (webCpu && webCpu.language) {
          langKey = webCpu.language;
        }
        var confirmDict = {};
        if (webCpu && webCpu.messages) {
          confirmDict =
            webCpu.messages[langKey] ||
            webCpu.messages.zh ||
            webCpu.messages.en || {};
        }
        this.$confirm(
          "关闭后无法重新打开，确认要关闭该窗口吗？",
          confirmDict.confirmDialogTitle || "提示", {
            confirmButtonText: confirmDict.confirmYes || "确定",
            cancelButtonText: confirmDict.confirmNo || "取消",
            type: "warning",
          }
        ).then(() => {
          const idx = this.childWindows.findIndex((w) => w.id === id);
          if (idx === -1) {
            return;
          }
          this.childWindows.splice(idx, 1);
          if (this.activeChildId === id) {
            // 关闭激活窗口后，自动激活最近一个窗口，否则清空激活状态
            const next = this.childWindows
              .slice()
              .reverse()
              .find((w) => !w.minimized);
            const fallback = this.childWindows[this.childWindows.length - 1];
            const target = next || fallback;
            if (target) {
              target.minimized = false;
              this.activeChildId = target.id;
            } else {
              this.activeChildId = "";
            }
          }
        });
      },
      "send": async function() {
        const text = (this.draft || "").trim();
        if (!text || this.isStreaming) {
          return false;
        }

        this.pushMessage("user", text);
        this.draft = "";
        this.autoResize();
        this.showScrollHint = false;

        // 助手占位
        const assistant = this.pushMessage("assistant", "", true);

        this.startStream(assistant.id);
      },
      "startStream": function(assistantId) {
        this.isStreaming = true;
        this.loading = true;

        const query = Object.assign({}, this.query);
        query.documentId = this.documentId;

        query.context = this.buildContext();

        // 流式渲染节流：合并高频 onMessage，降低 Markdown 重渲染与滚动频率
        let renderTimer = null;
        let latestContent = "";
        const flushRender = () => {
          renderTimer = null;
          this.updateMessage(assistantId, {
            content: latestContent,
          });
          this.scrollToBottom();
        };

        this.abortController = aigcInterface.streamRequest(query, {
          immediateFinish: false,
          onMessage: (accumulated) => {
            latestContent = accumulated || "";
            if (renderTimer === null) {
              renderTimer = setTimeout(flushRender, 50);
            }
          },
          onStreamFinished: (result) => {
            if (renderTimer !== null) {
              clearTimeout(renderTimer);
              renderTimer = null;
            }
            this.updateMessage(assistantId, {
              content: result || "",
              streaming: false,
            });
            this.content.outputText = result || "";
            this.finishStream();
          },
          onError: () => {
            if (renderTimer !== null) {
              clearTimeout(renderTimer);
              renderTimer = null;
            }
            const msg = this.getMessage(assistantId);
            if (msg && !msg.content) {
              this.updateMessage(assistantId, {
                content: "请求出现异常，请稍后重试。",
              });
            }
            this.updateMessage(assistantId, {
              streaming: false,
            });
            this.finishStream();
          },
          onAction: (action) => {
            if (renderTimer !== null) {
              clearTimeout(renderTimer);
              renderTimer = null;
            }
            this.updateMessage(assistantId, {
              streaming: false,
            });
            this.finishStream();
            if (action === "LOGIN") {
              aigcInterface.openLoginDialog(document.body, () => {
                this.retryStream(assistantId);
              });
            } else if (action === "RECHARGE") {
              aigcInterface.renderRechargeDialog(document.body);
            }
          },
        });
      },
      "retryStream": function(assistantId) {
        this.updateMessage(assistantId, {
          content: "",
          streaming: true,
        });
        this.startStream(assistantId);
      },
      "regenerate": function() {
        // 正在输出时先停止当前流，再重新生成
        if (this.isStreaming) {
          this.stopStreaming();
        }
        const assistant = this.lastAssistant();
        if (!assistant) {
          return false;
        }
        const idx = this.messages.findIndex((m) => m.id === assistant.id);
        if (idx === -1) {
          return false;
        }
        // 移除最后一条助手回复（连同未完成的半截内容），
        // 上下文里仍保留触发它的用户提问，随后对新占位消息重新发起请求
        this.messages.splice(idx, 1);
        this.content.outputText = "";
        const newAssistant = this.pushMessage("assistant", "", true);
        this.showScrollHint = false;
        this.startStream(newAssistant.id);
        return true;
      },
      "finishStream": function() {
        this.isStreaming = false;
        this.loading = false;
        this.abortController = null;
        this.scrollToBottom();
        // 一轮对话结束：持久化当前会话
        this.persistMessages();
      },
      "stopStreaming": function() {
        if (
          this.abortController &&
          typeof this.abortController.abort === "function"
        ) {
          this.abortController.abort();
        }
        const assistant = this.lastAssistant();
        if (assistant) {
          this.updateMessage(assistant.id, {
            streaming: false,
          });
        }
        this.finishStream();
      },
      "pushMessage": function(role, content, streaming) {
        const msg = {
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
          role: role,
          content: content || "",
          time: Date.now(),
          streaming: !!streaming,
        };
        this.messages.push(msg);
        this.$nextTick(() => this.scrollToBottom());
        // 持久化（流式中的占位消息会被过滤，仅保留已完成内容）
        this.persistMessages();
        // 返回响应式代理，确保后续流式更新能触发渲染
        return this.messages[this.messages.length - 1];
      },
      "getMessage": function(id) {
        return this.messages.find((m) => m.id === id) || null;
      },
      "updateMessage": function(id, patch) {
        const idx = this.messages.findIndex((m) => m.id === id);
        if (idx !== -1) {
          Object.assign(this.messages[idx], patch);
        }
      },
      "lastAssistant": function() {
        for (let i = this.messages.length - 1; i >= 0; i--) {
          if (this.messages[i].role === "assistant") {
            return this.messages[i];
          }
        }
        return null;
      },
      "buildContext": function() {
        const history = this.messages
          .filter((m) => m.content && String(m.content).trim())
          .slice(-24);
        return history
          .map((m) => {
            const who = m.role === "user" ? "用户" : "助手";
            return `${who}：${m.content}`;
          })
          .join("\n");
      },
      "persistMessages": function() {
        // 只持久化已完成的对话（过滤流式中的占位消息）
        if (!this.storageKey) {
          return;
        }
        try {
          // 归一化为普通对象，避免把 Vue 响应式代理（含 __ob__/getter）写入 indexedDB
          const toSave = this.messages
            .filter((m) => !m.streaming)
            .map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              time: m.time,
              streaming: false,
            }));
          this.__chatboxDBPut(this.storageKey, toSave).catch(function(err) {
            console.error("[chatbox] persistMessages failed:", err);
          });
        } catch (e) {
          console.error("[chatbox] persistMessages error:", e);
        }
      },
      "restoreMessages": function() {
        const self = this;
        this.__chatboxDBGet(this.storageKey)
          .then(function(list) {
            if (Array.isArray(list) && list.length) {
              self.applyRestored(list);
            } else {
              // indexedDB 无数据：尝试从旧版 localStorage 迁移
              self.migrateFromLocalStorage();
            }
          })
          .catch(function(err) {
            // indexedDB 不可用：兜底读取 localStorage
            console.error("[chatbox] restoreMessages failed:", err);
            self.migrateFromLocalStorage();
          });
      },
      "applyRestored": function(list) {
        if (!Array.isArray(list) || this.messages.length !== 0) {
          return;
        }
        this.messages = list.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content || "",
          time: m.time || Date.now(),
          streaming: false,
        }));
        this.$nextTick(() => this.scrollToBottom(true));
      },
      "migrateFromLocalStorage": function() {
        try {
          const raw = localStorage.getItem(this.storageKey);
          if (!raw) {
            return;
          }
          const list = JSON.parse(raw);
          if (!Array.isArray(list)) {
            return;
          }
          this.applyRestored(list);
          // 迁移到 indexedDB 后清理旧 localStorage
          this.__chatboxDBPut(this.storageKey, list).catch(function() {
            // 迁移写入失败时保留 localStorage 旧数据
          });
          try {
            localStorage.removeItem(this.storageKey);
          } catch (e) {
            // 忽略清理失败
          }
        } catch (e) {
          // 解析失败时忽略
        }
      },
      "newChat": function() {
        if (!this.messages.length) {
          return;
        }
        const self = this;
        this.$confirm("清空后将删除当前会话的全部消息，且无法恢复。", "提示", {
            confirmButtonText: "清空",
            cancelButtonText: "取消",
            type: "warning",
          })
          .then(function() {
            if (self.isStreaming) {
              self.stopStreaming();
            }
            self.messages = [];
            self.content.outputText = "";
            self.openMenuId = "";
            self.__chatboxDBDelete(self.storageKey).catch(function() {
              // 忽略清理失败
            });
            self.scrollToBottom(true);
          })
          .catch(function() {
            // 用户取消，不做任何操作
          });
      },
      "initStorage": function() {
        this.storageKey = "chatbox_history_" + (this.documentId || "default");
        this.restoreMessages();
      },
      "initTheme": function() {
        try {
          const saved = localStorage.getItem("chatbox_theme");
          if (saved === "light" || saved === "dark" || saved === "auto") {
            this.theme = saved;
          }
        } catch (e) {
          // 忽略读取失败，保持默认 auto
        }
        this.applyTheme();
      },
      "applyTheme": function() {
        const el = this.$refs.rootComponentContainer;
        if (!el) {
          return;
        }
        let resolved = this.theme;
        if (resolved === "auto") {
          const sysDark =
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches;
          resolved = sysDark ? "dark" : "light";
        }
        el.setAttribute("data-theme", resolved);
      },
      "toggleTheme": function() {
        // auto → 基于当前系统偏好取反；light ↔ dark 循环
        if (this.theme === "auto") {
          const sysDark =
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches;
          this.theme = sysDark ? "light" : "dark";
        } else if (this.theme === "light") {
          this.theme = "dark";
        } else {
          this.theme = "light";
        }
        this.applyTheme();
        try {
          localStorage.setItem("chatbox_theme", this.theme);
        } catch (e) {
          // 忽略保存失败
        }
      },
      "useExample": function(d) {
        this.draft = d.desc || d.title || "";
        this.$nextTick(() => {
          this.autoResize();
          if (this.$refs.textarea) {
            this.$refs.textarea.focus();
          }
        });
      },
      "clearDraft": function() {
        this.draft = "";
        this.autoResize();
        if (this.$refs.textarea) {
          this.$refs.textarea.focus();
        }
      },
      "defaultMessageActions": function() {
        return [{
          type: "button",
          key: "copy",
          label: "复制",
          icon: "bi bi-copy",
          tooltip: "复制到剪贴板",
        }, ];
      },
      "isComboItem": function(item) {
        if (!item || typeof item !== "object") {
          return false;
        }
        return (
          item.type === "input-button" ||
          item.type === "inputButton" ||
          item.type === "input" ||
          item.type === "combo"
        );
      },
      "menuKey": function(m, item) {
        return m.id + "::" + item.key;
      },
      "isMenuOpen": function(m, item) {
        return this.openMenuId === this.menuKey(m, item);
      },
      "toggleActionMenu": function(m, item) {
        const key = this.menuKey(m, item);
        const wasOpen = this.openMenuId === key;
        this.openMenuId = wasOpen ? "" : key;
        this.dispatchMessageAction({
          type: wasOpen ? "close" : "open",
          key: item.key,
          item: item,
          message: m,
        });
      },
      "selectActionChild": function(m, parent, child) {
        this.openMenuId = "";
        this.dispatchMessageAction({
          type: "select",
          key: child.key,
          parentKey: parent.key,
          value: child.value !== undefined ? child.value : undefined,
          item: child,
          parent: parent,
          message: m,
        });
      },
      "onActionInput": function(m, item, event) {
        item.value = event.target.value;
      },
      "submitCombo": function(m, item, event) {
        if (item.disabled) {
          return;
        }
        const group =
          event && event.target && event.target.closest ?
          event.target.closest(".action-input-group") :
          null;
        const input = group ? group.querySelector("input") : null;
        this.dispatchMessageAction({
          type: "submit",
          key: item.key,
          value: input ? input.value : "",
          item: item,
          message: m,
        });
      },
      "dispatchMessageAction": function(action) {
        // 外部自定义处理：返回 false 表示已接管，跳过默认行为
        const handled = this.actionHandler ?
          this.actionHandler(action) :
          undefined;
        if (handled === false) {
          return;
        }
        this.$emit("action", action);
        this.applyDefaultAction(action);
      },
      "applyDefaultAction": function(action) {
        // 命中“点击 / 下拉选择”的内置默认动作
        const isDefaultAction = (keys) =>
          (action.type === "click" || action.type === "select") &&
          keys.indexOf(action.key) !== -1;
        // copy → 复制消息内容
        if (isDefaultAction(["copy"])) {
          this.copyText(action.message && action.message.content);
        }
        // regen / regenerate / 重新生成 → 重新生成最后一条助手回复
        else if (isDefaultAction(["regen", "regenerate", "重新生成"])) {
          this.regenerate();
        }
      },
      "copyText": function(text) {
        if (WebTool && WebTool.copyString) {
          WebTool.copyString(text);
          this.$message({
            type: "success",
            message: "已复制到剪贴板。",
          });
        }
      },
      "onKeydown": function(e) {
        if (
          e.key === "Enter" &&
          !e.shiftKey &&
          !e.isComposing &&
          !e.altKey &&
          !e.ctrlKey &&
          !e.metaKey
        ) {
          e.preventDefault();
          this.send();
        }
      },
      "autoResize": function() {
        this.$nextTick(() => {
          const el = this.$refs.textarea;
          if (!el) {
            return;
          }
          el.style.height = "auto";
          el.style.height = Math.min(el.scrollHeight, 180) + "px";
        });
      },
      "onScroll": function() {
        const el = this.$refs.scrollContainer;
        if (!el) {
          return;
        }
        const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
        this.showScrollHint = distance > 120;
      },
      "scrollToBottom": function(smooth) {
        this.$nextTick(() => {
          const el = this.$refs.scrollContainer;
          if (!el) {
            return;
          }
          el.scrollTo({
            top: el.scrollHeight,
            behavior: smooth ? "smooth" : "auto",
          });
        });
      },
      "renderMarkdown": function(text) {
        if (!text) {
          return "";
        }
        // 库就绪：markdown-it 渲染 + DOMPurify 消毒
        if (this.mdReady && this.mdLib && window.DOMPurify) {
          try {
            var html = this.mdLib.render(String(text));
            return window.DOMPurify.sanitize(html, {
              ADD_ATTR: ["target", "rel"],
            });
          } catch (e) {
            // 渲染异常时回退到内置解析器
          }
        }
        // 兜底：内置轻量解析器（已做 HTML 转义）；DOMPurify 可用时再消毒一层
        var fallbackHtml = this.renderMarkdownFallback(text);
        if (window.DOMPurify) {
          try {
            return window.DOMPurify.sanitize(fallbackHtml, {
              ADD_ATTR: ["target", "rel"],
            });
          } catch (e) {
            // 消毒异常时返回已转义的原内容
          }
        }
        return fallbackHtml;
      },
      "renderMarkdownFallback": function(text) {
        if (!text) {
          return "";
        }
        const escapeHtml = (s) =>
          String(s)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

        const inline = (s) =>
          escapeHtml(s)
          .replace(/`([^`\n]+)`/g, '<code class="md-inline">$1</code>')
          .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
          .replace(
            /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
            '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
          );

        const lines = String(text).split("\n");
        const out = [];
        let codeBuf = null;
        let listType = null;

        const flushList = () => {
          if (listType) {
            out.push(`</${listType}>`);
            listType = null;
          }
        };

        for (let raw of lines) {
          const line = raw.replace(/\r$/, "");

          // 代码块
          if (/^```/.test(line.trim())) {
            if (codeBuf === null) {
              flushList();
              codeBuf = [];
            } else {
              out.push(
                `<pre class="md-code"><code>${escapeHtml(
                codeBuf.join("\n")
              )}</code></pre>`
              );
              codeBuf = null;
            }
            continue;
          }
          if (codeBuf !== null) {
            codeBuf.push(line);
            continue;
          }

          const t = line.trim();
          if (!t) {
            flushList();
            continue;
          }

          // 标题
          let m = t.match(/^(#{1,4})\s+(.*)$/);
          if (m) {
            flushList();
            out.push(`<h4>${inline(m[2])}</h4>`);
            continue;
          }

          // 引用
          if (t.startsWith(">")) {
            flushList();
            out.push(
              `<blockquote>${inline(t.replace(/^>\s?/, ""))}</blockquote>`
            );
            continue;
          }

          // 无序列表
          m = t.match(/^[-*+]\s+(.*)$/);
          if (m) {
            if (listType !== "ul") {
              flushList();
              out.push('<ul class="md-list">');
              listType = "ul";
            }
            out.push(`<li>${inline(m[1])}</li>`);
            continue;
          }

          // 有序列表
          m = t.match(/^\d+[.)]\s+(.*)$/);
          if (m) {
            if (listType !== "ol") {
              flushList();
              out.push('<ol class="md-list">');
              listType = "ol";
            }
            out.push(`<li>${inline(m[1])}</li>`);
            continue;
          }

          // 普通段落
          flushList();
          out.push(`<p>${inline(t)}</p>`);
        }

        if (codeBuf !== null) {
          out.push(
            `<pre class="md-code"><code>${escapeHtml(
            codeBuf.join("\n")
          )}</code></pre>`
          );
        }
        flushList();

        return out.join("");
      },
      "loadScript": function(src) {
        var self = this;
        return new Promise(function(resolve, reject) {
          if (!src) {
            reject(new Error("empty script src"));
            return;
          }
          var existing = document.querySelector('script[src="' + src + '"]');
          if (existing) {
            if (existing.dataset && existing.dataset.loaded === "1") {
              resolve();
              return;
            }
            existing.addEventListener("load", resolve, {
              once: true,
            });
            existing.addEventListener(
              "error",
              function() {
                reject(new Error("script load error"));
              }, {
                once: true,
              }
            );
            return;
          }
          var s = document.createElement("script");
          s.src = src;
          s.async = true;
          s.onload = function() {
            s.dataset.loaded = "1";
            resolve();
          };
          s.onerror = function() {
            reject(new Error("script load error: " + src));
          };
          (document.head || document.documentElement).appendChild(s);
        });
      },
      "initMarkdownLibs": function() {
        if (this.mdReady || this.mdLoading) {
          return;
        }
        this.mdLoading = true;
        var self = this;
        var mdUrl =
          "https://cdn.jsdelivr.net/npm/markdown-it@14/dist/markdown-it.min.js";
        var purifyUrl =
          "https://cdn.jsdelivr.net/npm/dompurify@3/dist/purify.min.js";
        var tasks = [];
        if (!window.markdownit) {
          tasks.push(this.loadScript(mdUrl));
        }
        if (!window.DOMPurify) {
          tasks.push(this.loadScript(purifyUrl));
        }
        var finish = function() {
          var mdFactory = window.markdownit;
          if (!mdFactory || !window.DOMPurify) {
            self.mdLoading = false;
            return;
          }
          try {
            var md = mdFactory({
              html: false,
              linkify: true,
            });
            // 代码块 / 内联代码：保持与现有样式类兼容
            md.renderer.rules.fence = function(tokens, idx) {
              var token = tokens[idx];
              var info = token.info ? token.info.trim() : "";
              var lang = info ? info.split(/\s+/)[0] : "";
              var content = md.utils.escapeHtml(token.content);
              var langAttr = lang ?
                ' class="language-' + md.utils.escapeHtml(lang) + '"' :
                "";
              return (
                '<pre class="md-code"><code' +
                langAttr +
                ">" +
                content +
                "</code></pre>\n"
              );
            };
            md.renderer.rules.code_inline = function(tokens, idx) {
              var token = tokens[idx];
              return (
                '<code class="md-inline">' +
                md.utils.escapeHtml(token.content) +
                "</code>"
              );
            };
            // 链接在新窗口打开并携带安全属性
            var defaultLinkOpen =
              md.renderer.rules.link_open ||
              function(tokens2, idx2, options2, env2, renderer2) {
                return renderer2.renderToken(tokens2, idx2, options2);
              };
            md.renderer.rules.link_open = function(
              tokens,
              idx,
              options,
              env,
              renderer
            ) {
              tokens[idx].attrSet("target", "_blank");
              tokens[idx].attrSet("rel", "noopener noreferrer");
              return defaultLinkOpen(tokens, idx, options, env, renderer);
            };
            self.mdLib = md;
            self.mdReady = true;
            self.mdLoading = false;
          } catch (e) {
            self.mdLib = null;
            self.mdReady = false;
            self.mdLoading = false;
          }
        };
        if (tasks.length) {
          Promise.all(tasks)
            .then(finish)
            .catch(function() {
              self.mdLoading = false;
            });
        } else {
          finish();
        }
      },
      "toggleConfigMenu": function() {
        this.configMenuVisible = !this.configMenuVisible;
      },
      "openPersonaPrompt": function() {
        this.configMenuVisible = false;
        webCpu.mitt.emit("persona-prompt", {
          documentId: this.documentId,
          title: this.title,
        });
      },
      "openKnowledgeBase": function() {
        this.configMenuVisible = false;
        webCpu.mitt.emit("knowledge-base", {
          documentId: this.documentId,
          title: this.title,
        });
      },
      "onConfigMenuDocClick": function(e) {
        if (!this.configMenuVisible) {
          return;
        }
        const wrap = this.$refs.configMenuWrap;
        if (wrap && e.target && wrap.contains(e.target)) {
          return;
        }
        this.configMenuVisible = false;
      },
      "openSkillConfig": function() {
        this.configMenuVisible = false;
        this.skillDraft = {
          name: "",
          id: "",
        };
        this.skillConfigVisible = true;
      },
      "confirmSkillConfig": function() {
        this.confirmMessageActions();
        this.skillConfigVisible = false;
        this.$message({
          type: "success",
          message: "Skill 操作配置已保存。",
        });
      },
      "addSkill": function() {
        var name = (this.skillDraft.name || "").trim();
        var id = (this.skillDraft.id || "").trim();
        if (!name || !id) {
          this.$message({
            type: "warning",
            message: "请填写 Skill 名称和 ID。",
          });
          return;
        }
        // 去重：覆盖一级菜单项与"更多"子菜单中的 skill 项
        var exists = this.skillActionItems.some(function(item) {
          return item.id === id;
        });
        if (exists) {
          this.$message({
            type: "warning",
            message: "该 Skill ID 已存在。",
          });
          return;
        }
        if (!Array.isArray(this.messageActions)) {
          this.messageActions = [];
        }
        var list = this.messageActions;

        // 一级菜单项最多保留 2 个 skill；第 3 个起放入"更多"下拉（原数据第 5 个元素）的 children
        var topLevelSkills = list.filter(function(it) {
          return it && it.key === "skill" && it.id;
        });

        if (topLevelSkills.length < 2) {
          var item = {
            type: "button",
            key: "skill",
            id: id,
            label: name,
            icon: "bi bi-copy",
          };
          var dividerIdx = list.findIndex(function(it) {
            return it && it.type === "divider";
          });
          if (dividerIdx !== -1) {
            list.splice(dividerIdx, 0, item);
          } else {
            list.push(item);
          }
        } else {
          // 原数据第 5 个元素（索引 4）即"更多"下拉菜单
          var dropdown = list[4];
          if (!dropdown || dropdown.type !== "dropdown") {
            dropdown =
              list.find(function(it) {
                return it && it.type === "dropdown" && it.key === "more";
              }) || null;
          }
          if (!dropdown) {
            // 兜底：不存在"更多"下拉时，仍作为一级菜单项追加
            list.push({
              type: "button",
              key: "skill",
              id: id,
              label: name,
              icon: "bi bi-copy",
            });
          } else {
            if (!Array.isArray(dropdown.children)) {
              dropdown.children = [];
            }
            dropdown.children.push({
              key: "skill",
              id: id,
              label: name,
              icon: "bi bi-copy",
            });
          }
        }

        this.skillDraft = {
          name: "",
          id: "",
        };
        this.$message({
          type: "success",
          message: "已新增 Skill：" + name,
        });
      },
      "removeSkill": function(item) {
        if (!Array.isArray(this.messageActions)) {
          return;
        }
        var list = this.messageActions;
        // 先在一级菜单项中按引用查找
        var idx = list.indexOf(item);
        if (idx !== -1) {
          list.splice(idx, 1);
          this.$message({
            type: "success",
            message: "已删除该 Skill。",
          });
          return;
        }
        // 再在"更多"下拉等子项数组中查找
        for (var i = 0; i < list.length; i++) {
          var it = list[i];
          if (it && Array.isArray(it.children)) {
            var cIdx = it.children.indexOf(item);
            if (cIdx !== -1) {
              it.children.splice(cIdx, 1);
              this.$message({
                type: "success",
                message: "已删除该 Skill。",
              });
              return;
            }
          }
        }
      },
      "openInfoConfig": function() {
        this.configMenuVisible = false;
        this.infoDraft = {
          title: this.title || "",
          subtitle: this.subtitle || "",
          introduce: this.introduce || "",
          exampleIcon: "",
          exampleTitle: "",
          exampleDesc: "",
        };
        this.infoConfigVisible = true;
      },
      "confirmInfoConfig": function() {
        var title = (this.infoDraft.title || "").trim();
        var subtitle = (this.infoDraft.subtitle || "").trim();
        var introduce = (this.infoDraft.introduce || "").trim();
        if (!title) {
          this.$message({
            type: "warning",
            message: "标题不能为空。",
          });
          return;
        }
        this.title = title;
        this.subtitle = subtitle;
        this.introduce = introduce;
        this.confirmBasicInfo();
        this.infoConfigVisible = false;
        this.$message({
          type: "success",
          message: "基础信息已保存。",
        });
      },
      "confirmBasicInfo": function() {
        webCpu.mitt.emit("setDataMap", {
          title: this.title,
          subtitle: this.subtitle,
          introduce: this.introduce,
          exampleList: this.exampleList,
        });
      },
      "addExample": function() {
        var title = (this.infoDraft.exampleTitle || "").trim();
        var desc = (this.infoDraft.exampleDesc || "").trim();
        if (!title) {
          this.$message({
            type: "warning",
            message: "请填写示例标题。",
          });
          return;
        }
        if (!Array.isArray(this.exampleList)) {
          this.exampleList = [];
        }
        this.exampleList.push({
          icon: (this.infoDraft.exampleIcon || "").trim() || "✦",
          title: title,
          desc: desc || title,
        });
        this.infoDraft.exampleIcon = "";
        this.infoDraft.exampleTitle = "";
        this.infoDraft.exampleDesc = "";
        this.$message({
          type: "success",
          message: "已新增示例。",
        });
      },
      "removeExample": function(item) {
        if (!Array.isArray(this.exampleList)) {
          return;
        }
        var idx = this.exampleList.indexOf(item);
        if (idx !== -1) {
          this.exampleList.splice(idx, 1);
          this.$message({
            type: "success",
            message: "已删除该示例。",
          });
        }
      },
      "onGlobalKeydown": function(e) {
        if (!e || e.key !== "Escape") {
          return;
        }
        if (this.skillConfigVisible) {
          this.skillConfigVisible = false;
        }
        if (this.infoConfigVisible) {
          this.infoConfigVisible = false;
        }
        if (this.configMenuVisible) {
          this.configMenuVisible = false;
        }
        if (this.openMenuId) {
          this.openMenuId = "";
        }
      }
    },
    "mounted": async function() {
      this.content = this.content || {};

      // 按需加载 Markdown 渲染库（markdown-it）+ DOMPurify
      this.initMarkdownLibs();

      // 恢复主题（跟随系统 / 手动选择）
      this.initTheme();

      // 恢复会话历史（按文档隔离）
      this.initStorage();

      // Esc 关闭各类弹层
      document.addEventListener("keydown", this.onGlobalKeydown);

      // 点击下拉菜单外部时收起
      document.addEventListener("click", this.onConfigMenuDocClick);

      // 平台传入的初始指令
      if (aigcInterface && typeof aigcInterface.handleAgentInput === "function") {
        aigcInterface.handleAgentInput(location.href, (str) => {
          if (str) {
            this.draft = str;
            this.autoResize();
            const auto = WebTool.urlQuery(location.href, "auto");
            if (auto) {
              this.send();
            }
          }
        });
      }
    },
    "beforeUnmount": function() {
      document.removeEventListener("keydown", this.onGlobalKeydown);
      document.removeEventListener("click", this.onConfigMenuDocClick);
    },
    "appMap": {
      "loginRegItem": {
        "url": "/mainApp/app/loginRegItem.js",
        "key": "transweb_loginRegItem",
        "cardName": "loginRegCard",
        "dsl": {
          "data": {
            "position": "top",
            "loginedMenu": [{
              "label": "⏱️ 历史记录",
              "action": function(d, callback) {
                dialogMap.openDocumentApp(
                  webCpu.appConfig.aigcHistory, {
                    data: {
                      content: {
                        isSolo: true,
                      },
                      query: {
                        documentId: d.documentId ||
                          webCpu.currentVueItem.query.documentId,
                      },
                    },
                  }, {
                    title: "⏱️ 历史记录",
                    callback: callback,
                  }, {
                    width: "100%",
                    height: "100%",
                  }
                );
              }
            }]
          }
        }
      }
    }
  };
</script>