import { useEffect, useState } from 'react'
import {
  categories,
  faqs,
  highlights,
  products,
  testimonials,
  workflowSteps
} from './data/products'
import {
  clearSession,
  getStoredSessionUser,
  loginUser,
  registerUser
} from './lib/auth'

const initialContactFormState = {
  nome: '',
  email: '',
  interesse: 'encomenda',
  retirada: '',
  mensagem: '',
  termos: false
}

const initialAuthFormState = {
  nome: '',
  email: '',
  senha: '',
  confirmarSenha: ''
}

function getInitialCart() {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const savedCart = window.localStorage.getItem('madre-argilla-cart')
    return savedCart ? JSON.parse(savedCart) : {}
  } catch {
    return {}
  }
}

function formatPrice(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium'
  }).format(new Date(value))
}

function App() {
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [showInStockOnly, setShowInStockOnly] = useState(false)
  const [sortBy, setSortBy] = useState('destaque')
  const [cart, setCart] = useState(getInitialCart)
  const [activeFaq, setActiveFaq] = useState('faq-entrega')
  const [currentUser, setCurrentUser] = useState(getStoredSessionUser)
  const [formData, setFormData] = useState(initialContactFormState)
  const [formErrors, setFormErrors] = useState({})
  const [formStatus, setFormStatus] = useState('')
  const [formStatusType, setFormStatusType] = useState('idle')
  const [authMode, setAuthMode] = useState('register')
  const [authFormData, setAuthFormData] = useState(initialAuthFormState)
  const [authErrors, setAuthErrors] = useState({})
  const [authStatus, setAuthStatus] = useState('')
  const [authStatusType, setAuthStatusType] = useState('idle')
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false)

  useEffect(() => {
    window.localStorage.setItem('madre-argilla-cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    if (!currentUser) {
      return
    }

    setFormData((currentData) => ({
      ...currentData,
      nome: currentData.nome.trim() ? currentData.nome : currentUser.name,
      email: currentData.email.trim() ? currentData.email : currentUser.email
    }))
  }, [currentUser])

  const filteredProducts = [...products]
    .filter((product) => {
      const matchesCategory =
        selectedCategory === 'todos' || product.category === selectedCategory
      const matchesSearch =
        searchTerm.trim().length === 0 ||
        `${product.name} ${product.description}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      const matchesStock = !showInStockOnly || product.stock > 0

      return matchesCategory && matchesSearch && matchesStock
    })
    .sort((left, right) => {
      if (sortBy === 'preco-menor') {
        return left.price - right.price
      }

      if (sortBy === 'preco-maior') {
        return right.price - left.price
      }

      if (sortBy === 'nome') {
        return left.name.localeCompare(right.name, 'pt-BR')
      }

      return products.findIndex((product) => product.id === left.id) -
        products.findIndex((product) => product.id === right.id)
    })

  const cartEntries = Object.entries(cart).filter(([, quantity]) => quantity > 0)
  const cartCount = cartEntries.reduce((total, [, quantity]) => total + quantity, 0)
  const cartItems = cartEntries
    .map(([productId, quantity]) => {
      const product = products.find((item) => item.id === productId)
      return product ? { ...product, quantity } : null
    })
    .filter(Boolean)
  const cartTotal = cartItems.reduce(
    (total, product) => total + product.price * product.quantity,
    0
  )

  function handleAddToCart(productId) {
    setCart((currentCart) => ({
      ...currentCart,
      [productId]: (currentCart[productId] || 0) + 1
    }))
  }

  function handleRemoveFromCart(productId) {
    setCart((currentCart) => {
      const nextQuantity = Math.max((currentCart[productId] || 0) - 1, 0)

      return {
        ...currentCart,
        [productId]: nextQuantity
      }
    })
  }

  function handleClearCart() {
    setCart({})
  }

  function handleInputChange(event) {
    const { name, type, checked, value } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  function handleAuthInputChange(event) {
    const { name, value } = event.target

    setAuthFormData((currentData) => ({
      ...currentData,
      [name]: value
    }))
  }

  function validateContactForm() {
    const errors = {}

    if (!formData.nome.trim()) {
      errors.nome = 'Informe seu nome.'
    }

    if (!formData.email.trim()) {
      errors.email = 'Informe seu e-mail.'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Digite um e-mail válido.'
    }

    if (!formData.retirada) {
      errors.retirada = 'Selecione uma data de retirada.'
    }

    if (formData.mensagem.trim().length < 12) {
      errors.mensagem = 'Escreva uma mensagem com pelo menos 12 caracteres.'
    }

    if (!formData.termos) {
      errors.termos = 'Você precisa aceitar os termos para continuar.'
    }

    return errors
  }

  function validateAuthForm() {
    const errors = {}

    if (authMode === 'register' && !authFormData.nome.trim()) {
      errors.nome = 'Informe seu nome para criar a conta.'
    }

    if (!authFormData.email.trim()) {
      errors.email = 'Informe seu e-mail.'
    } else if (!/\S+@\S+\.\S+/.test(authFormData.email)) {
      errors.email = 'Digite um e-mail válido.'
    }

    if (!authFormData.senha) {
      errors.senha = 'Informe uma senha.'
    } else if (authFormData.senha.length < 6) {
      errors.senha = 'A senha precisa ter pelo menos 6 caracteres.'
    }

    if (authMode === 'register' && authFormData.confirmarSenha !== authFormData.senha) {
      errors.confirmarSenha = 'As senhas precisam ser iguais.'
    }

    return errors
  }

  function handleAuthModeChange(mode) {
    setAuthMode(mode)
    setAuthErrors({})
    setAuthStatus('')
    setAuthStatusType('idle')
    setAuthFormData((currentData) => ({
      ...initialAuthFormState,
      email: currentData.email
    }))
  }

  async function handleAuthSubmit(event) {
    event.preventDefault()

    const errors = validateAuthForm()
    setAuthErrors(errors)

    if (Object.keys(errors).length > 0) {
      setAuthStatusType('error')
      setAuthStatus('Revise os campos destacados e tente novamente.')
      return
    }

    setIsAuthSubmitting(true)

    try {
      const payload = {
        name: authFormData.nome,
        email: authFormData.email,
        password: authFormData.senha
      }

      const user = authMode === 'register'
        ? await registerUser(payload)
        : await loginUser(payload)

      setCurrentUser(user)
      setAuthErrors({})
      setAuthStatusType('success')
      setAuthStatus(
        authMode === 'register'
          ? 'Conta criada com sucesso. Você já entrou na loja.'
          : 'Login realizado com sucesso.'
      )
      setAuthFormData(initialAuthFormState)
    } catch (error) {
      setAuthStatusType('error')
      setAuthStatus(
        error instanceof Error
          ? error.message
          : 'Não foi possível concluir a autenticação agora.'
      )
    } finally {
      setIsAuthSubmitting(false)
    }
  }

  function handleLogout() {
    const lastEmail = currentUser?.email || ''

    clearSession()
    setCurrentUser(null)
    setAuthMode('login')
    setAuthErrors({})
    setAuthStatusType('success')
    setAuthStatus('Sessão encerrada. Faça login novamente quando quiser.')
    setAuthFormData({
      ...initialAuthFormState,
      email: lastEmail
    })
  }

  function handleSubmit(event) {
    event.preventDefault()

    const errors = validateContactForm()
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      setFormStatusType('error')
      setFormStatus('Revise os campos destacados e tente novamente.')
      return
    }

    setFormStatusType('success')
    setFormStatus('Mensagem enviada com sucesso. Em breve a Madre Argilla entra em contato.')
    setFormErrors({})
    setFormData({
      ...initialContactFormState,
      nome: currentUser?.name || '',
      email: currentUser?.email || ''
    })
  }

  return (
    <div className="page-shell" data-testid="page-shell">
      <header className="topbar" data-testid="header">
        <div className="brand-block">
          <span className="eyebrow">Atelier de argila e cerâmica</span>
          <a className="brand-mark" href="#inicio" data-testid="brand-link">
            Madre Argilla
          </a>
        </div>

        <nav className="main-nav" aria-label="Navegação principal" data-testid="main-nav">
          <a href="#colecao" data-testid="nav-colecao">Coleção</a>
          <a href="#processo" data-testid="nav-processo">Processo</a>
          <a href="#faq" data-testid="nav-faq">FAQ</a>
          <a href="#conta" data-testid="nav-conta">Conta</a>
          <a href="#contato" data-testid="nav-contato">Contato</a>
        </nav>

        <div className="header-actions">
          {currentUser ? (
            <div className="account-chip" aria-live="polite" data-testid="account-badge">
              <span>{currentUser.name}</span>
              <strong>Conta ativa</strong>
            </div>
          ) : (
            <a
              className="account-chip account-link"
              href="#conta"
              data-testid="account-link"
            >
              <span>Entrar</span>
              <strong>ou cadastrar</strong>
            </a>
          )}

          <div className="cart-chip" aria-live="polite" data-testid="cart-badge">
            <span>Carrinho</span>
            <strong>{cartCount}</strong>
          </div>
        </div>
      </header>

      <main>
        <section className="hero-section" id="inicio" data-testid="hero-section">
          <div className="hero-copy">
            <span className="eyebrow">Peças moldadas com calma e calor</span>
            <h1>Texturas que contam histórias em barro, esmalte e fogo.</h1>
            <p>
              A Madre Argilla apresenta uma vitrine acolhedora para treinar automação
              com filtros, sessão de usuário, carrinho local e conteúdos fáceis de localizar.
            </p>

            <div className="hero-actions">
              <a className="primary-button" href="#colecao" data-testid="cta-explorar">
                Explorar coleção
              </a>
              <a className="secondary-button" href="#conta" data-testid="cta-conta">
                Criar conta
              </a>
            </div>
          </div>

          <aside className="hero-panel" data-testid="hero-panel">
            <div className="panel-card spotlight-card">
              <span className="panel-label">Coleção da semana</span>
              <strong>Argila Terracota Premium</strong>
              <p>Maciez equilibrada para estudos, oficinas e produção artesanal de pequenos lotes.</p>
              <span className="price-tag">{formatPrice(48)}</span>
            </div>

            <div className="stats-grid">
              <article className="panel-card" data-testid="stat-card-catalogo">
                <strong>6 itens</strong>
                <span>no catálogo inicial</span>
              </article>
              <article className="panel-card" data-testid="stat-card-categorias">
                <strong>3 categorias</strong>
                <span>com filtros previsíveis</span>
              </article>
              <article className="panel-card" data-testid="stat-card-auth">
                <strong>1 acesso</strong>
                <span>com cadastro e login local</span>
              </article>
            </div>
          </aside>
        </section>

        <section className="auth-section" id="conta" data-testid="auth-section">
          <div className="section-heading">
            <span className="eyebrow">Conta da cliente</span>
            <h2>Cadastre-se ou entre para continuar seus testes com uma sessão persistida no navegador.</h2>
          </div>

          <div className="auth-layout">
            <article className="auth-card auth-copy" data-testid="auth-copy">
              <span className="panel-label">Acesso local</span>
              <h3>Fluxo simples para estudo e demonstração.</h3>
              <p>
                As contas ficam salvas no navegador deste dispositivo, sem depender de backend.
                Depois do login, nome e e-mail podem ser reaproveitados no formulário de contato.
              </p>
              <ul className="auth-benefits">
                <li>Cadastro com nome, e-mail e senha</li>
                <li>Login persistido mesmo após recarregar a página</li>
                <li>Saída manual da conta com um clique</li>
              </ul>
            </article>

            <div className="auth-card auth-panel" data-testid="auth-panel">
              {currentUser ? (
                <>
                  <span className="panel-label">Sessão iniciada</span>
                  <h3>Olá, {currentUser.name.split(' ')[0]}.</h3>
                  <p>
                    Sua conta está ativa neste navegador. Use o formulário abaixo com seus
                    dados já preenchidos ou saia para testar o login novamente.
                  </p>

                  <dl className="account-details" data-testid="account-details">
                    <div>
                      <dt>Nome</dt>
                      <dd>{currentUser.name}</dd>
                    </div>
                    <div>
                      <dt>E-mail</dt>
                      <dd>{currentUser.email}</dd>
                    </div>
                    <div>
                      <dt>Criada em</dt>
                      <dd>{formatDate(currentUser.createdAt)}</dd>
                    </div>
                  </dl>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={handleLogout}
                    data-testid="logout-button"
                  >
                    Sair da conta
                  </button>
                </>
              ) : (
                <>
                  <div
                    className="auth-toggle"
                    role="tablist"
                    aria-label="Escolha entre cadastro e login"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={authMode === 'register'}
                      className={authMode === 'register' ? 'auth-tab active' : 'auth-tab'}
                      onClick={() => handleAuthModeChange('register')}
                      data-testid="auth-tab-register"
                    >
                      Criar conta
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={authMode === 'login'}
                      className={authMode === 'login' ? 'auth-tab active' : 'auth-tab'}
                      onClick={() => handleAuthModeChange('login')}
                      data-testid="auth-tab-login"
                    >
                      Entrar
                    </button>
                  </div>

                  <form className="auth-form" onSubmit={handleAuthSubmit} noValidate data-testid="auth-form">
                    {authMode === 'register' ? (
                      <label className="field-group" htmlFor="auth-nome">
                        <span>Nome</span>
                        <input
                          id="auth-nome"
                          name="nome"
                          type="text"
                          value={authFormData.nome}
                          onChange={handleAuthInputChange}
                          autoComplete="name"
                          aria-invalid={Boolean(authErrors.nome)}
                          aria-describedby={authErrors.nome ? 'erro-auth-nome' : undefined}
                          data-testid="auth-input-nome"
                        />
                        {authErrors.nome ? <small id="erro-auth-nome">{authErrors.nome}</small> : null}
                      </label>
                    ) : null}

                    <label className="field-group" htmlFor="auth-email">
                      <span>E-mail</span>
                      <input
                        id="auth-email"
                        name="email"
                        type="email"
                        value={authFormData.email}
                        onChange={handleAuthInputChange}
                        autoComplete="email"
                        aria-invalid={Boolean(authErrors.email)}
                        aria-describedby={authErrors.email ? 'erro-auth-email' : undefined}
                        data-testid="auth-input-email"
                      />
                      {authErrors.email ? <small id="erro-auth-email">{authErrors.email}</small> : null}
                    </label>

                    <label className="field-group" htmlFor="auth-senha">
                      <span>Senha</span>
                      <input
                        id="auth-senha"
                        name="senha"
                        type="password"
                        value={authFormData.senha}
                        onChange={handleAuthInputChange}
                        autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                        aria-invalid={Boolean(authErrors.senha)}
                        aria-describedby={authErrors.senha ? 'erro-auth-senha' : undefined}
                        data-testid="auth-input-senha"
                      />
                      {authErrors.senha ? <small id="erro-auth-senha">{authErrors.senha}</small> : null}
                    </label>

                    {authMode === 'register' ? (
                      <label className="field-group" htmlFor="auth-confirmar-senha">
                        <span>Confirmar senha</span>
                        <input
                          id="auth-confirmar-senha"
                          name="confirmarSenha"
                          type="password"
                          value={authFormData.confirmarSenha}
                          onChange={handleAuthInputChange}
                          autoComplete="new-password"
                          aria-invalid={Boolean(authErrors.confirmarSenha)}
                          aria-describedby={authErrors.confirmarSenha ? 'erro-auth-confirmar-senha' : undefined}
                          data-testid="auth-input-confirmar-senha"
                        />
                        {authErrors.confirmarSenha ? (
                          <small id="erro-auth-confirmar-senha">{authErrors.confirmarSenha}</small>
                        ) : null}
                      </label>
                    ) : null}

                    <button
                      type="submit"
                      className="primary-button full-width"
                      disabled={isAuthSubmitting}
                      data-testid="auth-submit"
                    >
                      {isAuthSubmitting
                        ? 'Enviando...'
                        : authMode === 'register'
                          ? 'Criar conta'
                          : 'Entrar na conta'}
                    </button>

                    <p
                      className={`form-status ${authStatusType}`}
                      role="status"
                      aria-live="polite"
                      data-testid="auth-status"
                    >
                      {authStatus}
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="highlights-section" aria-label="Diferenciais da loja">
          {highlights.map((item) => (
            <article
              className="highlight-card"
              key={item.id}
              data-testid={`highlight-${item.id}`}
            >
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </article>
          ))}
        </section>

        <section className="catalog-section" id="colecao" data-testid="catalog-section">
          <div className="section-heading">
            <span className="eyebrow">Coleção Madre Argilla</span>
            <h2>Catálogo simples para praticar buscas, filtros e fluxos de carrinho.</h2>
          </div>

          <div className="catalog-layout">
            <div className="catalog-area">
              <div className="catalog-controls" data-testid="catalog-controls">
                <div className="category-buttons" role="group" aria-label="Filtrar por categoria">
                  {categories.map((category) => (
                    <button
                      type="button"
                      key={category.id}
                      id={`filtro-${category.id}`}
                      className={selectedCategory === category.id ? 'filter-button active' : 'filter-button'}
                      aria-pressed={selectedCategory === category.id}
                      data-testid={`filter-${category.id}`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>

                <div className="search-row">
                  <label className="field-group" htmlFor="busca-produtos">
                    <span>Buscar no catálogo</span>
                    <input
                      id="busca-produtos"
                      name="busca"
                      type="search"
                      placeholder="Ex.: xícaras, kit, terracota"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      data-testid="search-input"
                    />
                  </label>

                  <label className="field-group" htmlFor="ordenacao-produtos">
                    <span>Ordenar por</span>
                    <select
                      id="ordenacao-produtos"
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value)}
                      data-testid="sort-select"
                    >
                      <option value="destaque">Destaque</option>
                      <option value="preco-menor">Menor preço</option>
                      <option value="preco-maior">Maior preço</option>
                      <option value="nome">Nome</option>
                    </select>
                  </label>
                </div>

                <label className="stock-toggle" htmlFor="apenas-estoque">
                  <input
                    id="apenas-estoque"
                    type="checkbox"
                    checked={showInStockOnly}
                    onChange={(event) => setShowInStockOnly(event.target.checked)}
                    data-testid="stock-checkbox"
                  />
                  <span>Exibir apenas itens em estoque</span>
                </label>
              </div>

              <div className="catalog-summary" aria-live="polite" data-testid="catalog-summary">
                <span>{filteredProducts.length} item(ns) encontrado(s)</span>
                <span>{showInStockOnly ? 'Somente itens disponíveis' : 'Mostrando todo o catálogo'}</span>
              </div>

              <div className="product-grid" data-testid="product-grid">
                {filteredProducts.map((product) => {
                  const quantityInCart = cart[product.id] || 0

                  return (
                    <article
                      className="product-card"
                      key={product.id}
                      data-testid={`product-card-${product.id}`}
                    >
                      <span className="product-badge">{product.badge}</span>
                      <div className="product-meta">
                        <span>{product.categoryLabel}</span>
                        <span>{product.stock > 0 ? `${product.stock} em estoque` : 'Sem estoque'}</span>
                      </div>
                      <h3>{product.name}</h3>
                      <p>{product.description}</p>
                      <div className="product-footer">
                        <strong>{formatPrice(product.price)}</strong>
                        <div className="product-actions">
                          <button
                            type="button"
                            className="small-button"
                            onClick={() => handleAddToCart(product.id)}
                            disabled={product.stock === 0}
                            data-testid={`add-${product.id}`}
                          >
                            Adicionar
                          </button>
                          <span
                            className="quantity-pill"
                            aria-label={`Quantidade do item ${product.name} no carrinho`}
                            data-testid={`quantity-${product.id}`}
                          >
                            {quantityInCart}
                          </span>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>

            <aside
              className="cart-panel"
              data-testid="cart-panel"
              data-state={cartItems.length > 0 ? 'filled' : 'empty'}
            >
              <div className="section-heading compact">
                <span className="eyebrow">Carrinho local</span>
                <h2>Resumo para testes de estado</h2>
              </div>

              {cartItems.length > 0 ? (
                <>
                  <ul className="cart-list" data-testid="cart-list">
                    {cartItems.map((item) => (
                      <li key={item.id} className="cart-item" data-testid={`cart-item-${item.id}`}>
                        <div>
                          <strong>{item.name}</strong>
                          <span>{item.quantity} unidade(s)</span>
                        </div>
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => handleRemoveFromCart(item.id)}
                          data-testid={`remove-${item.id}`}
                        >
                          Remover 1
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="cart-total" data-testid="cart-total">
                    <span>Total estimado</span>
                    <strong>{formatPrice(cartTotal)}</strong>
                  </div>

                  <button
                    type="button"
                    className="secondary-button full-width"
                    onClick={handleClearCart}
                    data-testid="clear-cart"
                  >
                    Limpar carrinho
                  </button>
                </>
              ) : (
                <p className="empty-state" data-testid="empty-cart">
                  Seu carrinho está vazio. Adicione peças ao lado para testar interações.
                </p>
              )}
            </aside>
          </div>
        </section>

        <section className="process-section" id="processo" data-testid="process-section">
          <div className="section-heading">
            <span className="eyebrow">Fluxo artesanal</span>
            <h2>Um percurso curto, útil e previsível para estudar automação ponta a ponta.</h2>
          </div>

          <div className="workflow-grid">
            {workflowSteps.map((step, index) => (
              <article className="workflow-card" key={step.id} data-testid={`workflow-${step.id}`}>
                <span className="workflow-index">0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>

          <div className="testimonial-grid">
            {testimonials.map((item) => (
              <blockquote
                className="testimonial-card"
                key={item.id}
                data-testid={`testimonial-${item.id}`}
              >
                <p>{item.text}</p>
                <footer>{item.name}</footer>
              </blockquote>
            ))}
          </div>
        </section>

        <section className="faq-section" id="faq" data-testid="faq-section">
          <div className="section-heading">
            <span className="eyebrow">Perguntas frequentes</span>
            <h2>Estados de expansão claros, bons para cliques e validação de conteúdo.</h2>
          </div>

          <div className="faq-list">
            {faqs.map((item) => {
              const isOpen = activeFaq === item.id

              return (
                <article className="faq-card" key={item.id} data-testid={`faq-${item.id}`}>
                  <button
                    type="button"
                    className="faq-trigger"
                    aria-expanded={isOpen}
                    aria-controls={`conteudo-${item.id}`}
                    onClick={() => setActiveFaq(isOpen ? '' : item.id)}
                    data-testid={`faq-trigger-${item.id}`}
                  >
                    <span>{item.question}</span>
                    <span>{isOpen ? '−' : '+'}</span>
                  </button>
                  <div
                    id={`conteudo-${item.id}`}
                    className={isOpen ? 'faq-content open' : 'faq-content'}
                    hidden={!isOpen}
                  >
                    <p>{item.answer}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="contact-section" id="contato" data-testid="contact-section">
          <div className="section-heading">
            <span className="eyebrow">Contato e retirada</span>
            <h2>Formulário validado no cliente para praticar entradas, erros e sucesso.</h2>
          </div>

          <div className="contact-layout">
            <form className="contact-form" onSubmit={handleSubmit} noValidate data-testid="contact-form">
              <label className="field-group" htmlFor="nome">
                <span>Nome</span>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  value={formData.nome}
                  onChange={handleInputChange}
                  autoComplete="name"
                  aria-invalid={Boolean(formErrors.nome)}
                  aria-describedby={formErrors.nome ? 'erro-nome' : undefined}
                  data-testid="input-nome"
                />
                {formErrors.nome ? <small id="erro-nome">{formErrors.nome}</small> : null}
              </label>

              <label className="field-group" htmlFor="email">
                <span>E-mail</span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  autoComplete="email"
                  aria-invalid={Boolean(formErrors.email)}
                  aria-describedby={formErrors.email ? 'erro-email' : undefined}
                  data-testid="input-email"
                />
                {formErrors.email ? <small id="erro-email">{formErrors.email}</small> : null}
              </label>

              <label className="field-group" htmlFor="interesse">
                <span>Seu interesse</span>
                <select
                  id="interesse"
                  name="interesse"
                  value={formData.interesse}
                  onChange={handleInputChange}
                  data-testid="select-interesse"
                >
                  <option value="encomenda">Encomenda personalizada</option>
                  <option value="oficina">Inscrição em oficina</option>
                  <option value="retirada">Retirada de pedido</option>
                </select>
              </label>

              <label className="field-group" htmlFor="retirada">
                <span>Data desejada para retirada</span>
                <input
                  id="retirada"
                  name="retirada"
                  type="date"
                  value={formData.retirada}
                  onChange={handleInputChange}
                  aria-invalid={Boolean(formErrors.retirada)}
                  aria-describedby={formErrors.retirada ? 'erro-retirada' : undefined}
                  data-testid="input-retirada"
                />
                {formErrors.retirada ? <small id="erro-retirada">{formErrors.retirada}</small> : null}
              </label>

              <label className="field-group" htmlFor="mensagem">
                <span>Mensagem</span>
                <textarea
                  id="mensagem"
                  name="mensagem"
                  rows="5"
                  value={formData.mensagem}
                  onChange={handleInputChange}
                  aria-invalid={Boolean(formErrors.mensagem)}
                  aria-describedby={formErrors.mensagem ? 'erro-mensagem' : undefined}
                  data-testid="input-mensagem"
                />
                {formErrors.mensagem ? <small id="erro-mensagem">{formErrors.mensagem}</small> : null}
              </label>

              <label className="checkbox-row" htmlFor="termos">
                <input
                  id="termos"
                  name="termos"
                  type="checkbox"
                  checked={formData.termos}
                  onChange={handleInputChange}
                  aria-invalid={Boolean(formErrors.termos)}
                  aria-describedby={formErrors.termos ? 'erro-termos' : undefined}
                  data-testid="input-termos"
                />
                <span>Concordo com o uso dos dados para retorno sobre meu pedido.</span>
              </label>
              {formErrors.termos ? <small id="erro-termos">{formErrors.termos}</small> : null}

              <button type="submit" className="primary-button full-width" data-testid="submit-form">
                Enviar mensagem
              </button>

              <p
                className={`form-status ${formStatusType}`}
                role="status"
                aria-live="polite"
                data-testid="form-status"
                data-status={formStatusType}
              >
                {formStatus}
              </p>
            </form>

            <aside className="contact-card" data-testid="contact-card">
              <h3>Visite o atelier</h3>
              <p>
                Rua das Oficinas, 128
                <br />
                Perdizes, São Paulo
              </p>
              <p>
                Terça a sábado
                <br />
                10h às 18h
              </p>
              <div className="contact-note">
                <strong>{currentUser ? 'Conta conectada' : 'Dica para estudos'}</strong>
                <p>
                  {currentUser
                    ? 'Seu nome e e-mail podem ser reaproveitados aqui para acelerar o fluxo de contato.'
                    : 'Os componentes usam IDs, textos fixos e atributos data-testid para simplificar seletores em Cypress e Robot Framework.'}
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
