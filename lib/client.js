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

    function SessionIdChip(props) {
      var sessionId = props && props.sessionId
      var copiedState = react.useState(false)
      var copied = copiedState[0]
      var setCopied = copiedState[1]
      if (typeof sessionId !== 'string' || sessionId === '') return null
      var short = sessionId.length > 26
        ? sessionId.slice(0, 14) + '…' + sessionId.slice(-8)
        : sessionId
      function onCopy(e) {
        e.stopPropagation()
        if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(sessionId).then(function () {
            setCopied(true)
            setTimeout(function () { setCopied(false) }, 1200)
          }, function () {})
        }
      }
      return react.createElement('button', {
        type: 'button',
        title: sessionId,
        onClick: onCopy,
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          height: '22px',
          padding: '0 8px',
          border: '1px solid var(--dsw-alias-border-l2, rgba(128,128,128,0.4))',
          borderRadius: '6px',
          background: 'transparent',
          color: 'var(--dsw-alias-label-secondary, #888)',
          fontSize: '11px',
          lineHeight: '1',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          fontFamily: 'inherit',
        },
      }, copied ? '已复制' : ('ID ' + short))
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
