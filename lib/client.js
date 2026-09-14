/**
 * dsh-session-id — 客户端 bundle。
 * 注入 `conversation.session.header.utilities` 槽（scope: session），框架自动把
 * `sessionId` 作为 prop 传入；组件渲染会话 ID，点击复制到剪贴板。
 *
 * 双轨制：本文件 `exports.inject` 写 Cordis 服务名（slots），不是 NPM 包名。
 */
window.__ModuleLoader__.load({
  id: 'dsh-session-id',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
    var react = require('react')

    var COPY_MESSAGES = {
      en: {
        copied: 'Copied',
        failed: 'Copy failed',
        copyAction: 'Copy Session ID',
      },
      es: {
        copied: 'Copiado',
        failed: 'Error al copiar',
        copyAction: 'Copiar ID de sesión',
      },
      pt: {
        copied: 'Copiado',
        failed: 'Falha ao copiar',
        copyAction: 'Copiar ID da sessão',
      },
      zh: {
        copied: '已复制',
        failed: '复制失败',
        copyAction: '复制会话 ID',
      },
    }

    function messagesForBrowserLocale() {
      var locale = typeof navigator === 'undefined'
        ? ''
        : (navigator.language || (navigator.languages && navigator.languages[0]) || '')
      locale = String(locale).toLowerCase()
      if (locale.indexOf('pt') === 0) return COPY_MESSAGES.pt
      if (locale.indexOf('es') === 0) return COPY_MESSAGES.es
      if (locale.indexOf('zh') === 0) return COPY_MESSAGES.zh
      return COPY_MESSAGES.en
    }

    function fallbackCopy(text) {
      if (typeof document === 'undefined' || !document.body || typeof document.execCommand !== 'function') return false
      var textarea = document.createElement('textarea')
      var activeElement = document.activeElement
      textarea.value = text
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      textarea.style.pointerEvents = 'none'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      textarea.setSelectionRange(0, textarea.value.length)
      var copied = false
      try {
        copied = document.execCommand('copy')
      } catch (_) {}
      document.body.removeChild(textarea)
      if (activeElement && typeof activeElement.focus === 'function') activeElement.focus()
      return copied
    }

    function SessionIdChip(props) {
      var sessionId = props && props.sessionId
      var statusState = react.useState('idle')
      var status = statusState[0]
      var setStatus = statusState[1]
      if (typeof sessionId !== 'string' || sessionId === '') return null
      var messages = messagesForBrowserLocale()
      var short = sessionId.length > 26
        ? sessionId.slice(0, 14) + '…' + sessionId.slice(-8)
        : sessionId
      function flash(next) {
        setStatus(next)
        setTimeout(function () { setStatus('idle') }, 1200)
      }
      function onCopy(e) {
        e.stopPropagation()
        function fallback() {
          flash(fallbackCopy(sessionId) ? 'copied' : 'failed')
        }
        if (typeof navigator === 'undefined' || !navigator.clipboard || !navigator.clipboard.writeText) {
          fallback()
          return
        }
        navigator.clipboard.writeText(sessionId).then(
          function () { flash('copied') },
          fallback
        )
      }
      return react.createElement('button', {
        type: 'button',
        title: messages.copyAction + ': ' + sessionId,
        'aria-label': messages.copyAction + ': ' + sessionId,
        onClick: onCopy,
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          height: '22px',
          padding: '0 8px',
          border: '1px solid var(--dsw-alias-border-l2, rgba(128,128,128,0.4))',
          borderRadius: '6px',
          background: 'transparent',
          color: status === 'failed' ? 'var(--dsw-alias-state-error-primary, #e5484d)' : 'var(--dsw-alias-label-secondary, #888)',
          fontSize: '11px',
          lineHeight: '1',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          fontFamily: 'inherit',
        },
      }, status === 'copied' ? messages.copied : status === 'failed' ? messages.failed : ('ID ' + short))
    }

    // 只声明本 bundle 实际使用的 Cordis 服务（服务名，非包名）。
    var inject = ['slots']

    function apply(ctx) {
      ctx.slots.inject('conversation.session.header.utilities', function () {
        return ctx.slots.register({
          name: 'conversation.session.header.utilities',
          id: 'dsh-session-id',
          order: 100,
        }, function (props) { return react.createElement(SessionIdChip, props) })
      })
    }

    exports.inject = inject
    exports.apply = apply
    return module.exports
  },
})
