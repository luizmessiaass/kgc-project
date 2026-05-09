'use client'

import { useState, useEffect, Fragment } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ExploreBar from '../components/ExploreBar'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  size?: string
  color?: string
  image?: string
}

const STATES = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']

function generateOrderId() {
  const now = new Date()
  return `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`
}

const STEP_LABELS = ['DADOS', 'ENTREGA', 'PAGTO']

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState({
    nome: '', telefone: '', email: '',
    cep: '', endereco: '', complemento: '', cidade: '', estado: '',
    pagamento: 'PIX', observacoes: '',
  })
  const [cepLoading, setCepLoading] = useState(false)
  const [errors, setErrors] = useState<string | null>(null)

  useEffect(() => {
    try { setCart(JSON.parse(localStorage.getItem('cart') || '[]')) } catch { setCart([]) }
  }, [])

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0)

  function maskPhone(v: string) {
    v = v.replace(/\D/g, '').substring(0, 11)
    if (v.length > 10) return v.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    if (v.length > 5) return v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
    if (v.length > 2) return v.replace(/^(\d{2})(\d{0,5})/, '($1) $2')
    return v
  }

  function maskCep(v: string) {
    v = v.replace(/\D/g, '')
    if (v.length > 5) return v.replace(/^(\d{5})(\d)/, '$1-$2')
    return v
  }

  async function handleCepBlur() {
    const cep = form.cep.replace(/\D/g, '')
    if (cep.length !== 8) return
    setCepLoading(true)
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setForm(f => ({ ...f, endereco: data.street || '', cidade: data.city || '', estado: data.state || '' }))
    } catch {
      setForm(f => ({ ...f, endereco: '' }))
    } finally {
      setCepLoading(false)
    }
  }

  function nextStep() {
    setErrors(null)
    if (step === 1) {
      if (!form.nome.trim() || !form.telefone.trim() || !form.email.trim()) {
        setErrors('Preencha todos os campos antes de continuar.')
        return
      }
    } else if (step === 2) {
      if (!form.cep.trim() || !form.endereco.trim() || !form.complemento.trim() || !form.cidade.trim() || !form.estado) {
        setErrors('Preencha todos os campos de entrega.')
        return
      }
    }
    setStep(s => (s + 1) as 1 | 2 | 3)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function prevStep() {
    setErrors(null)
    setStep(s => (s - 1) as 1 | 2 | 3)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function finalize(e: React.FormEvent) {
    e.preventDefault()
    if (cart.length === 0) { alert('Seu carrinho está vazio!'); return }

    const orderId = generateOrderId()
    let produtosTexto = ''
    cart.forEach(item => {
      const detalhes = []
      if (item.size && item.size !== 'Único') detalhes.push(item.size)
      if (item.color && item.color !== 'Padrão') detalhes.push(item.color)
      produtosTexto += `- (${item.quantity}x) ${item.name}${detalhes.length ? ` [${detalhes.join(' / ')}]` : ''}\n`
    })

    const linhas = [
      `*PEDIDO #${orderId}*`, ``,
      `*DADOS DO CLIENTE*`,
      `Nome: ${form.nome}`, `Tel: ${form.telefone}`, `Email: ${form.email}`, ``,
      `*ENDERECO DE ENTREGA*`,
      `${form.endereco}, ${form.complemento}`,
      `${form.cidade} - ${form.estado}`, `CEP: ${form.cep}`, ``,
      `*RESUMO DO PEDIDO*`, produtosTexto,
      `-----------------------------------`,
      `*TOTAL A PAGAR: R$ ${total.toFixed(2)}*`,
      `Pagamento: ${form.pagamento}`,
      `Obs: ${form.observacoes || 'Nenhuma'}`, ``,
      `_Enviado pelo Site KGC_`
    ]

    window.location.href = `https://wa.me/5511945352659?text=${encodeURIComponent(linhas.join('\n'))}`
  }

  const backBtnStyle: React.CSSProperties = {
    flex: 1, background: '#1a1a1a', color: '#f5c542',
    border: '2px solid #f5c542', borderRadius: 4,
    fontFamily: "'Press Start 2P', monospace", fontSize: '0.6rem',
    cursor: 'pointer', minHeight: 56, marginTop: 0, padding: '10px 8px',
    textTransform: 'uppercase' as const,
    touchAction: 'manipulation',
  }

  return (
    <div className="layout-page">
      <div style={{ textAlign: 'center', marginBottom: 16, paddingTop: 4 }}>
        <Link href="/#menu">
          <img
            src="/assets/logo.gif"
            alt="KGC"
            style={{ width: 'clamp(90px, 28vw, 140px)', height: 'auto', display: 'block', margin: '0 auto' }}
          />
        </Link>
      </div>

      <h1 style={{ textAlign: 'center', marginBottom: 20, fontSize: 'clamp(0.75rem, 4vw, 1.4rem)' }}>Finalizar Pedido</h1>

      {/* Step indicator */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        maxWidth: 400, margin: '0 auto 28px', padding: '0 16px',
      }}>
        {([1, 2, 3] as const).map((s, i) => (
          <Fragment key={s}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: step === s ? '#f5c542' : '#111',
                border: `2px solid ${step >= s ? '#f5c542' : '#444'}`,
                color: step === s ? '#111' : step > s ? '#f5c542' : '#555',
                fontFamily: "'Press Start 2P', monospace",
                fontSize: step > s ? '1rem' : '0.7rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s',
              }}>
                {step > s ? '✓' : s}
              </div>
              <span style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '0.42rem',
                color: step >= s ? '#f5c542' : '#555',
                whiteSpace: 'nowrap',
              }}>
                {STEP_LABELS[i]}
              </span>
            </div>
            {i < 2 && (
              <div style={{
                flex: 1, height: 2,
                background: step > s ? '#f5c542' : '#333',
                marginTop: 17, marginLeft: 6, marginRight: 6,
                transition: 'background 0.3s',
              }} />
            )}
          </Fragment>
        ))}
      </div>

      {/* Order summary */}
      <div id="order-summary">
        {cart.length === 0 ? (
          <p style={{ textAlign: 'center' }}>Seu carrinho está vazio.</p>
        ) : (
          <>
            {cart.map(item => {
              const detalhes = []
              if (item.size && item.size !== 'Único') detalhes.push(item.size)
              if (item.color && item.color !== 'Padrão') detalhes.push(item.color)
              return (
                <div key={item.id} className="summary-item">
                  <div style={{ flex: 1 }}>
                    <strong>{item.name}</strong>
                    {detalhes.length > 0 && <span style={{ color: '#888', fontSize: '0.8rem' }}> ({detalhes.join('/')})</span>}
                    <br /><small style={{ color: '#aaa' }}>{item.quantity}x R$ {item.price.toFixed(2)}</small>
                  </div>
                  <div style={{ fontFamily: "'Press Start 2P'", fontSize: '0.7rem' }}>
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              )
            })}
            <div className="summary-total">TOTAL: R$ {total.toFixed(2)}</div>
          </>
        )}
      </div>

      {errors && (
        <p style={{
          maxWidth: 450, margin: '0 auto 12px', textAlign: 'center',
          fontFamily: "'Press Start 2P', monospace", fontSize: '0.6rem',
          color: '#ff5555', padding: '10px 16px',
          border: '1px solid #ff5555', borderRadius: 6,
        }}>
          {errors}
        </p>
      )}

      <form className="checkout-form-container" onSubmit={finalize}>
        {/* STEP 1: Dados pessoais */}
        {step === 1 && (
          <>
            <label className="label-retro">DADOS PESSOAIS</label>
            <input className="input-retro" type="text" placeholder="Nome completo" value={form.nome}
              onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
            <input className="input-retro" type="tel" placeholder="WhatsApp (com DDD)" maxLength={15} value={form.telefone}
              onChange={e => setForm(f => ({ ...f, telefone: maskPhone(e.target.value) }))} />
            <input className="input-retro" type="email" placeholder="E-mail" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <button type="button" className="btn-submit" onClick={nextStep}>
              Próximo: Entrega →
            </button>
          </>
        )}

        {/* STEP 2: Entrega */}
        {step === 2 && (
          <>
            <label className="label-retro">ENTREGA</label>
            <input className="input-retro" type="text" placeholder="CEP (00000-000)" maxLength={9} value={form.cep}
              onChange={e => setForm(f => ({ ...f, cep: maskCep(e.target.value) }))}
              onBlur={handleCepBlur} />
            <input className="input-retro" type="text"
              placeholder={cepLoading ? 'Buscando...' : 'Endereço (Rua/Av)'}
              value={form.endereco}
              onChange={e => setForm(f => ({ ...f, endereco: e.target.value }))} />
            <div className="row-input">
              <input className="input-retro" type="text" placeholder="Número / Compl." value={form.complemento}
                onChange={e => setForm(f => ({ ...f, complemento: e.target.value }))} style={{ flex: 1 }} />
              <input className="input-retro" type="text" placeholder="Cidade" value={form.cidade}
                onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))} style={{ flex: 1 }} />
            </div>
            <select className="input-retro" value={form.estado}
              onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}>
              <option value="">Estado (UF)</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="row-input" style={{ marginTop: 8 }}>
              <button type="button" onClick={prevStep} style={backBtnStyle}>← Voltar</button>
              <button type="button" className="btn-submit" onClick={nextStep} style={{ flex: 2, marginTop: 0, minHeight: 56 }}>
                Próximo →
              </button>
            </div>
          </>
        )}

        {/* STEP 3: Pagamento */}
        {step === 3 && (
          <>
            <label className="label-retro">PAGAMENTO</label>
            <select className="input-retro" value={form.pagamento}
              onChange={e => setForm(f => ({ ...f, pagamento: e.target.value }))}>
              <option value="PIX">PIX (Aprovação Imediata)</option>
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="Boleto">Boleto Bancário</option>
            </select>
            <label className="label-retro">OBSERVAÇÕES (OPCIONAL)</label>
            <textarea className="input-retro" placeholder="Ex: Deixar na portaria..." rows={4}
              value={form.observacoes}
              onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} />
            <div className="row-input" style={{ marginTop: 8 }}>
              <button type="button" onClick={prevStep} style={backBtnStyle}>← Voltar</button>
              <button type="submit" className="btn-submit" style={{ flex: 2, marginTop: 0, minHeight: 56 }}>
                ENVIAR NO ZAP
              </button>
            </div>
          </>
        )}
      </form>

      <div className="voltar-container">
        <Link href="/loja" className="link-voltar">← Voltar à Loja</Link>
      </div>

      <ExploreBar pageId="checkout" />
    </div>
  )
}
