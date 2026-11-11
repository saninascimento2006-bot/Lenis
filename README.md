# IKHÔR — Mitologia Grega Fantástica
> **Site narrativo e Scrollytelling imersivo sobre a geração esquecida de semideuses na Grécia Antiga.**

Projeto desenvolvido integralmente a partir das especificações do [`briefing.md`](file:///c:/Users/Victor.alunos/Desktop/Lenis/briefing.md).

---

## 🏛️ Visão Geral

- **Tema:** Grécia Antiga fantástica e sombria.
- **Conceito Central:** A existência e a luta diária de semideuses marginalizados, rejeitados pelo Olimpo, temidos pelos mortais e caçados por uma ciência predatória alcoólica e inquisitorial.
- **Mensagem do Universo:**  
  *“Os deuses nos deram o sangue. Os mortais nos deram o medo. E o mundo nos deixou apenas a escolha de sobreviver.”*
- **Tecnologia de Rolagem:** **Lenis Smooth Scroll** integrado com **GSAP** e **ScrollTrigger**.

---

## 📜 Estrutura Narrativa dos Sete Capítulos

1. **01. Prólogo: O Mundo Antigo (`#prologo`)**
   - Abertura cinematográfica com atmosfera escura e épica.
   - Apresentação da premissa fundamental: *"Nascer de um deus não significa pertencer ao Olimpo."*
   - Indicador de jornada e botões de travessia rápida.

2. **02. O Olimpo: Os Deuses Indiferentes (`#olimpo`)**
   - Apresentação do panteão tradicional grego (Zeus, Poseidon, Hades, Atena, Apolo, Ártemis, Ares, Deméter).
   - O contraste entre a imponência divina e sua completa frieza perante os descendentes mortais.
   - **Painel Interativo do Panteão:** Métricas de indiferença, hostilidade e citações dos deuses.

3. **03. Os Descendentes: Sangue Divino & Sistema de Epítetos (`#epitetos`)**
   - Explicação detalhada da mecânica dos poderes baseados nos **Epítetos Divinos** (Seção 3.4 do briefing):
     - *Apolo:* Sminthaios (pragas), Phoibos (luz solar) e Paian (cura empática).
     - *Poseidon:* Enosichthon (terremotos) e Pelagios (mar abissal).
     - *Atena:* Polias (barreiras civis) e Promachos (combate preditivo).
     - *Ártemis:* Agrotera (mimetismo predial) e Lochia (percepção vital).
     - *Hades:* Plouton (metais profundos) e Nekrodektes (espíritos das sombras).
   - **Grimório Interativo de Epítetos:** Explorador dinâmico de ramificações mágicas.
   - **Dossiê de Sobreviventes:** Histórias e fichas de três semideuses vivos no mundo (*Nikos de Corinto*, *Thaleia da Tessália*, *Kassian de Creta*).

4. **04. A Humanidade: A Inquisição de Bronze (`#sociedade`)**
   - A sociedade mortal e a analogia com minorias perseguidas (inspiração X-Men).
   - A Ordem dos Magistrados de Chumbo (o metal que anula o icor).
   - **A Ciência Predatória:** Dissecação e destilação clandestina do sangue dos semideuses.
   - **Tratado Anatômico Clandestino:** Diagrama esquemático em SVG com anotações de laboratório antigo.

5. **05. O Bosque Selvagem: O Refúgio (`#refugio`)**
   - O lado misterioso e ancestral da natureza grega (o Monte Helicão e o Vale de Citerão).
   - Santuários camuflados onde comunidades de fugitivos constroem cabanas ocultas.
   - **Mapeador de Santuários:** O Carvalho das Sombras, A Ravina da Água Morta e O Templo Devorado.

6. **06. As Ameaças: O Cerco Constante (`#ameacas`)**
   - Triptych de perigos:
     - *Ameaça I:* Monstros mitológicos atraídos pelo cheiro do icor.
     - *Ameaça II:* Caçadores de cabeças e patrulhas cívicas armadas.
     - *Ameaça III:* **O Fardo do Icor** (o sangue divino que queima a carne mortal, reduzindo a expectativa de vida para menos de 26 anos).

7. **07. Epílogo: Sobreviver é Resistir (`#epilogo`)**
   - Conclusão poética: a sobrevivência como a vitória máxima dos renegados.
   - **Oráculo de Delfos Clandestino (Interativo):** Questionário em 3 passos no qual o visitante responde sobre seus dilemas e descobre qual Epíteto ancestral desperta em seu sangue, recebendo um pergaminho sagrado com seus dons e seu fardo.

---

## ⚡ Tecnologias e Funcionalidades

- **Experiência 3D Interativa (estilo Lando Norris):**
  - Renderização 3D em tempo real com **Three.js** a partir do arquivo [`modelo.fbx`](file:///c:/Users/Victor.alunos/Desktop/Lenis/modelo.fbx).
  - **Rotação livre 360° com arrasto e inércia física** (momentum/damping suave ao soltar).
  - **Paralaxe e inclinação sutil orientada pela posição do mouse** (efeito de profundidade dinâmica).
  - **Coreografia sincronizada à rolagem:** o modelo rotaciona dinamicamente conforme os capítulos da narrativa avançam.
  - **Seletor de acabamentos/materiais PBR em tempo real:**
    - ⚜️ *Ouro do Olimpo* (metal dourado brilhante com reflexos especulares)
    - ⚔️ *Bronze Arcaico* (bronze espartano oxidado)
    - 🌑 *Obsidiana Vulcânica* (vidro vulcânico negro com alto brilho)
    - 🩸 *Icor Escarlate* (acabamento metálico rubi-sangue)
  - Pedestal místico com anel rúnico grego em rotação contínua e luz de rebote das brasas.
- **Burning Embers no Background:**
  - Simulação física de brasas, faíscas e cinzas em convecção térmica ascendente com turbulência e resfriamento gradativo.
- **Lenis 1.1.x:** Rolagem suave vertical com aceleração exponencial física, suporte a touch mobile e prevenção de saltos de ancoragem.
- **GSAP 3.12 + ScrollTrigger:** Animações orquestradas e sincronizadas à rolagem.
- **Web Audio API:** Sintetizador procedural em tempo real (drone sub-grave místico, vento modulado e sinos em escala grega pentatônica) com controle liga/desliga no topo.
- **Ambient Canvas:** Partículas sutis de névoa, fuligem e poeira dourada (icor) flutuando de forma orgânica.
- **Tocha Dinâmica:** Efeito de iluminação suave que acompanha o cursor do mouse.
- **Side Scrolly Tracker:** Barra vertical com numerais romanos (`I` ao `VII`) e progresso sincronizado.
- **Acessibilidade:** Suporte completo a `@media (prefers-reduced-motion: reduce)`, teclado e contrastes WCAG.

---

## 🚀 Como Executar

### Opção 1: Diretamente no Navegador
Basta abrir o arquivo [`index.html`](file:///c:/Users/Victor.alunos/Desktop/Lenis/index.html) em qualquer navegador moderno (Chrome, Edge, Firefox, Safari).

### Opção 2: Via Servidor Local Node / npx
```bash
npx serve . -l 3000
```
Acesse em: `http://localhost:3000`

### Opção 3: Via Python
```bash
python -m http.server 8000
```
Acesse em: `http://localhost:8000`
