export const categories = [
  { id: 'todos', label: 'Todos os itens' },
  { id: 'argilas', label: 'Argilas' },
  { id: 'ceramicas', label: 'Cerâmicas' },
  { id: 'kits', label: 'Kits criativos' }
]

export const products = [
  {
    id: 'argila-terracota',
    name: 'Argila Terracota Premium',
    category: 'argilas',
    categoryLabel: 'Argilas',
    price: 48,
    stock: 12,
    badge: 'Mais vendida',
    description: 'Textura macia para modelagem manual e queima uniforme em peças decorativas.'
  },
  {
    id: 'argila-escura',
    name: 'Argila Chocolate Escura',
    category: 'argilas',
    categoryLabel: 'Argilas',
    price: 54,
    stock: 7,
    badge: 'Nova safra',
    description: 'Ideal para vasos robustos, esculturas pequenas e acabamento de tom profundo.'
  },
  {
    id: 'xicaras-organicas',
    name: 'Conjunto de Xícaras Orgânicas',
    category: 'ceramicas',
    categoryLabel: 'Cerâmicas',
    price: 139,
    stock: 5,
    badge: 'Feito à mão',
    description: 'Duas xícaras com esmaltação fosca, borda irregular e pegada aconchegante.'
  },
  {
    id: 'vaso-lua',
    name: 'Vaso Lua Queimada',
    category: 'ceramicas',
    categoryLabel: 'Cerâmicas',
    price: 179,
    stock: 0,
    badge: 'Sob encomenda',
    description: 'Peça escultórica para arranjos secos, com textura marcada pelo torno.'
  },
  {
    id: 'kit-iniciante',
    name: 'Kit Iniciante de Modelagem',
    category: 'kits',
    categoryLabel: 'Kits criativos',
    price: 96,
    stock: 9,
    badge: 'Estudo prático',
    description: 'Argila, estecas, guia de formas básicas e suporte para secagem doméstica.'
  },
  {
    id: 'kit-presente',
    name: 'Kit Presente Atelier',
    category: 'kits',
    categoryLabel: 'Kits criativos',
    price: 120,
    stock: 4,
    badge: 'Favorito para presente',
    description: 'Seleção curada com mini bowl, plaquinha personalizada e convite para oficina.'
  }
]

export const highlights = [
  {
    id: 'manual',
    title: 'Acabamento manual',
    text: 'Cada peça nasce com pequenas variações para valorizar o processo artesanal.'
  },
  {
    id: 'envio',
    title: 'Retirada agendada',
    text: 'Perfeito para criar cenários de teste com confirmação de pedido e coleta local.'
  },
  {
    id: 'colecao',
    title: 'Coleções sazonais',
    text: 'Catálogo enxuto com categorias claras e filtros previsíveis para automação.'
  }
]

export const workflowSteps = [
  {
    id: 'selecionar',
    title: 'Escolha sua peça',
    text: 'Explore o catálogo, filtre por categoria e compare materiais.'
  },
  {
    id: 'reservar',
    title: 'Monte sua reserva',
    text: 'Adicione itens ao carrinho local para ensaiar fluxos de compra sem backend.'
  },
  {
    id: 'confirmar',
    title: 'Envie sua mensagem',
    text: 'Use o formulário para solicitar oficina, encomenda ou retirada.'
  }
]

export const testimonials = [
  {
    id: 'cliente-1',
    name: 'Bruna, São Paulo',
    text: 'A paleta terrosa e a organização do catálogo deixam a navegação muito gostosa.'
  },
  {
    id: 'cliente-2',
    name: 'Marcos, Campinas',
    text: 'Usei o site para praticar automação e adorei os estados claros do formulário e do carrinho.'
  }
]

export const faqs = [
  {
    id: 'faq-entrega',
    question: 'Vocês fazem entrega para todo o Brasil?',
    answer: 'Sim. Para estudo, o fluxo principal está focado em retirada agendada, mas o catálogo também comunica envios nacionais.'
  },
  {
    id: 'faq-oficinas',
    question: 'Há oficinas para iniciantes?',
    answer: 'Há oficinas introdutórias com turmas pequenas. O formulário permite selecionar esse interesse com mensagens validadas no cliente.'
  },
  {
    id: 'faq-personalizacao',
    question: 'Posso encomendar peças personalizadas?',
    answer: 'Sim. Informe a ideia, prazo desejado e volume no formulário para simular um pedido sob medida.'
  }
]
