import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const code = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')

function renderChip({ locale = 'en-US', clipboard, execCommand = () => true } = {}) {
  let captured = null
  let registered = null
  const document = {
    activeElement: { focus() {} },
    body: { appendChild() {}, removeChild() {} },
    createElement() {
      return {
        style: {},
        setAttribute() {},
        focus() {},
        select() {},
        setSelectionRange() {},
      }
    },
    execCommand,
  }
  const sandbox = {
    window: {
      __ModuleLoader__: {
        load({ factory }) {
          captured = factory((name) => ({ name }))
        },
      },
    },
    document,
    navigator: { language: locale, clipboard },
    setTimeout() {},
  }
  vm.createContext(sandbox)
  vm.runInContext(code, sandbox)
  captured.apply({
    slots: {
      inject(_name, register) { register() },
      register(_metadata, component) { registered = component },
    },
  })
  const react = {
    useState(initial) { return [initial, () => {}] },
    createElement(type, props, children) { return { type, props, children } },
  }
  // The bundle captured a lightweight React placeholder. Replace the require return
  // with a real-enough renderer by evaluating it in a fresh sandbox.
  sandbox.window.__ModuleLoader__.load = ({ factory }) => {
    captured = factory((name) => name === 'react' ? react : { name })
  }
  vm.runInContext(code, sandbox)
  captured.apply({
    slots: {
      inject(_name, register) { register() },
      register(_metadata, component) { registered = component },
    },
  })
  const slotElement = registered({ sessionId: 'session-1234567890' })
  return { chip: slotElement.type(slotElement.props), document }
}

const expectedTitles = [
  ['en-US', 'Copy Session ID: session-1234567890'],
  ['es-ES', 'Copiar ID de sesión: session-1234567890'],
  ['pt-BR', 'Copiar ID da sessão: session-1234567890'],
]
for (const [locale, title] of expectedTitles) {
  const { chip } = renderChip({ locale })
  if (chip.props.title !== title) throw new Error(`${locale} title mismatch: ${chip.props.title}`)
  if (chip.props['aria-label'] !== title) throw new Error(`${locale} aria-label mismatch`)
}

let fallbackCalls = 0
const { chip } = renderChip({
  locale: 'pt-BR',
  execCommand(command) {
    if (command !== 'copy') throw new Error(`unexpected command: ${command}`)
    fallbackCalls += 1
    return true
  },
})
chip.props.onClick({ stopPropagation() {} })
if (fallbackCalls !== 1) throw new Error(`expected HTTP/LAN fallback once, got ${fallbackCalls}`)

console.log('client-copy-i18n OK: locales and HTTP/LAN fallback')
