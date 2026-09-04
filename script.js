/* ============================================================
   BATALHA NAVAL
   SISTEMA PRINCIPAL
============================================================ */


/* ============================================================
   CONFIGURAÇÃO
============================================================ */

const TAMANHO = 10;

const CONFIG = {
    vidas: {
        facil: 8,
        medio: 6,
        dificil: 5
    },

    pontuacao: {
        submarino: 100,
        fragata: 150,
        cruzador: 200
    },

    navios: [
        {
            id: "submarino",
            nome: "SUBMARINO",
            tamanho: 2
        },
        {
            id: "fragata",
            nome: "FRAGATA",
            tamanho: 3
        },
        {
            id: "cruzador",
            nome: "CRUZADOR",
            tamanho: 4
        }
    ]
};


/* ============================================================
   ESTADO DO JOGO
============================================================ */

let estado = {
    tela: "menu",

    nomeJogador: "",
    nomeAmigo: "",

    modo: "cpu",
    nivel: "medio",

    jogadorAtual: 1,

    vidas: 6,
    pontos: 0,
    disparos: 0,
    acertos: 0,

    tabuleiroJogador: [],
    tabuleiroInimigo: [],

    naviosJogador: [],
    naviosInimigo: [],

    tirosJogador: new Set(),
    tirosInimigo: new Set(),

    somAtivo: true,

    jogoFinalizado: false
};


/* ============================================================
   ELEMENTOS DO DOM
============================================================ */

const telas = {
    menu: document.getElementById("tela-menu"),
    jogo: document.getElementById("tela-jogo"),
    final: document.getElementById("tela-final")
};

const formJogo = document.getElementById("form-jogo");

const inputNome = document.getElementById("nome-jogador");
const inputAmigo = document.getElementById("nome-amigo");

const selectModo = document.getElementById("modo-jogo");
const selectNivel = document.getElementById("nivel-jogo");

const campoAmigo = document.getElementById("campo-amigo");

const boardPlayer = document.getElementById("board-player");

const placarElement = document.getElementById("placar");
const vidasElement = document.getElementById("vidas");
const disparosElement = document.getElementById("disparos");

const nomeDisplay = document.getElementById("nome-display");
const modoDisplay = document.getElementById("modo-display");

const messageArea = document.getElementById("message-area");

const fleetList = document.getElementById("fleet-list");
const naviosRestantes = document.getElementById("navios-restantes");

const boardLabel = document.getElementById("board-label");
const turnLabel = document.getElementById("turn-label");

const resultadoTitulo = document.getElementById("resultado-titulo");
const resultadoSubtitulo = document.getElementById("resultado-subtitulo");

const resultadoNome = document.getElementById("resultado-nome");
const resultadoPontos = document.getElementById("resultado-pontos");
const resultadoDisparos = document.getElementById("resultado-disparos");
const resultadoAcertos = document.getElementById("resultado-acertos");
const resultadoPrecisao = document.getElementById("resultado-precisao");

const rankingList = document.getElementById("ranking-list");

const modalComoJogar = document.getElementById("modal-como-jogar");
const modalTroca = document.getElementById("modal-troca");

const trocaTitulo = document.getElementById("troca-titulo");
const trocaTexto = document.getElementById("troca-texto");


/* ============================================================
   SISTEMA DE ÁUDIO
   Tudo é criado pelo navegador.
============================================================ */

let audioContext = null;
let masterGain = null;

function iniciarAudio() {

    if (!estado.somAtivo) {
        return;
    }

    if (!audioContext) {

        audioContext = new (
            window.AudioContext ||
            window.webkitAudioContext
        )();

        masterGain = audioContext.createGain();

        masterGain.gain.value = 0.16;

        masterGain.connect(audioContext.destination);
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }
}


/* ------------------------------------------------------------
   Som básico
------------------------------------------------------------ */

function tocarTom(
    frequencia,
    duracao,
    tipo = "sine",
    volume = 0.2,
    atraso = 0
) {

    if (!estado.somAtivo) {
        return;
    }

    iniciarAudio();

    if (!audioContext) {
        return;
    }

    const agora = audioContext.currentTime + atraso;

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = tipo;
    oscillator.frequency.setValueAtTime(
        frequencia,
        agora
    );

    gain.gain.setValueAtTime(
        0.0001,
        agora
    );

    gain.gain.exponentialRampToValueAtTime(
        volume,
        agora + 0.015
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        agora + duracao
    );

    oscillator.connect(gain);
    gain.connect(masterGain);

    oscillator.start(agora);
    oscillator.stop(agora + duracao + 0.03);
}


/* ------------------------------------------------------------
   Clique
------------------------------------------------------------ */

function somClique() {

    tocarTom(
        280,
        0.06,
        "square",
        0.08
    );
}


/* ------------------------------------------------------------
   Som de canhão
------------------------------------------------------------ */

function somCanhao() {

    if (!estado.somAtivo) {
        return;
    }

    iniciarAudio();

    if (!audioContext) {
        return;
    }

    const agora = audioContext.currentTime;

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sawtooth";

    oscillator.frequency.setValueAtTime(
        105,
        agora
    );

    oscillator.frequency.exponentialRampToValueAtTime(
        38,
        agora + 0.28
    );

    gain.gain.setValueAtTime(
        0.0001,
        agora
    );

    gain.gain.exponentialRampToValueAtTime(
        0.5,
        agora + 0.015
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        agora + 0.34
    );

    oscillator.connect(gain);
    gain.connect(masterGain);

    oscillator.start(agora);
    oscillator.stop(agora + 0.36);

    /* segundo impacto */

    tocarTom(
        55,
        0.18,
        "triangle",
        0.35,
        0.02
    );
}


/* ------------------------------------------------------------
   Água
------------------------------------------------------------ */

function somAgua() {

    tocarTom(
        600,
        0.09,
        "sine",
        0.08
    );

    tocarTom(
        820,
        0.13,
        "sine",
        0.06,
        0.07
    );
}


/* ------------------------------------------------------------
   Acerto
------------------------------------------------------------ */

function somImpacto() {

    tocarTom(
        120,
        0.25,
        "sawtooth",
        0.25
    );

    tocarTom(
        70,
        0.35,
        "triangle",
        0.2,
        0.04
    );
}


/* ------------------------------------------------------------
   Afundou navio
------------------------------------------------------------ */

function somAfundou() {

    tocarTom(
        110,
        0.18,
        "square",
        0.2
    );

    tocarTom(
        75,
        0.35,
        "sawtooth",
        0.18,
        0.08
    );

    tocarTom(
        48,
        0.5,
        "triangle",
        0.14,
        0.16
    );
}


/* ------------------------------------------------------------
   Vitória
------------------------------------------------------------ */

function somVitoria() {

    tocarTom(
        392,
        0.18,
        "triangle",
        0.13
    );

    tocarTom(
        494,
        0.18,
        "triangle",
        0.13,
        0.13
    );

    tocarTom(
        587,
        0.28,
        "triangle",
        0.15,
        0.26
    );

    tocarTom(
        784,
        0.5,
        "sine",
        0.12,
        0.42
    );
}


/* ------------------------------------------------------------
   Derrota
------------------------------------------------------------ */

function somDerrota() {

    tocarTom(
        220,
        0.28,
        "sawtooth",
        0.12
    );

    tocarTom(
        165,
        0.35,
        "sawtooth",
        0.11,
        0.2
    );

    tocarTom(
        110,
        0.5,
        "triangle",
        0.1,
        0.4
    );
}


/* ------------------------------------------------------------
   Som ambiente do menu
   Simulação simples de mar + gaivotas.
------------------------------------------------------------ */

let ambienteMenu = null;

function iniciarAmbienteMenu() {

    if (!estado.somAtivo || ambienteMenu) {
        return;
    }

    iniciarAudio();

    if (!audioContext) {
        return;
    }

    const ganho = audioContext.createGain();

    ganho.gain.value = 0.025;

    const oscilador = audioContext.createOscillator();

    oscilador.type = "sine";
    oscilador.frequency.value = 52;

    oscilador.connect(ganho);
    ganho.connect(masterGain);

    oscilador.start();

    ambienteMenu = {
        oscilador,
        ganho
    };

    /* gaivotas ocasionais */

    setTimeout(() => {
        if (
            estado.somAtivo &&
            estado.tela === "menu"
        ) {
            somGaivota();
        }
    }, 1800);
}


function somGaivota() {

    if (!estado.somAtivo) {
        return;
    }

    tocarTom(
        1000,
        0.13,
        "sine",
        0.025
    );

    tocarTom(
        1350,
        0.11,
        "sine",
        0.025,
        0.13
    );

    tocarTom(
        1100,
        0.16,
        "sine",
        0.025,
        0.25
    );
}


/* ============================================================
   NAVEGAÇÃO
============================================================ */

function mostrarTela(nome) {

    Object.values(telas).forEach(tela => {
        tela.classList.remove("ativa");
    });

    telas[nome].classList.add("ativa");

    estado.tela = nome;
}


/* ============================================================
   MOSTRAR / ESCONDER MODO AMIGO
============================================================ */

selectModo.addEventListener("change", () => {

    somClique();

    if (selectModo.value === "amigo") {

        campoAmigo.classList.remove("hidden");

        setTimeout(() => {
            inputAmigo.focus();
        }, 100);

    } else {

        campoAmigo.classList.add("hidden");

        inputAmigo.value = "";
    }
});


/* ============================================================
   CRIA TABULEIRO VAZIO
============================================================ */

function criarTabuleiroVazio() {

    return Array.from(
        { length: TAMANHO },
        () =>
            Array.from(
                { length: TAMANHO },
                () => null
            )
    );
}


/* ============================================================
   VERIFICA POSIÇÃO
============================================================ */

function posicaoValida(
    tabuleiro,
    linha,
    coluna,
    tamanho,
    horizontal
) {

    for (let i = 0; i < tamanho; i++) {

        const l = horizontal
            ? linha
            : linha + i;

        const c = horizontal
            ? coluna + i
            : coluna;

        if (
            l < 0 ||
            l >= TAMANHO ||
            c < 0 ||
            c >= TAMANHO
        ) {
            return false;
        }

        if (tabuleiro[l][c] !== null) {
            return false;
        }
    }

    return true;
}


/* ============================================================
   COLOCA NAVIO
============================================================ */

function colocarNavio(
    tabuleiro,
    navio
) {

    let tentativas = 0;

    while (tentativas < 500) {

        tentativas++;

        const horizontal = Math.random() > 0.5;

        const linha = Math.floor(
            Math.random() * TAMANHO
        );

        const coluna = Math.floor(
            Math.random() * TAMANHO
        );

        if (
            !posicaoValida(
                tabuleiro,
                linha,
                coluna,
                navio.tamanho,
                horizontal
            )
        ) {
            continue;
        }

        const posicoes = [];

        for (let i = 0; i < navio.tamanho; i++) {

            const l = horizontal
                ? linha
                : linha + i;

            const c = horizontal
                ? coluna + i
                : coluna;

            tabuleiro[l][c] = navio.id;

            posicoes.push({
                linha: l,
                coluna: c,
                atingida: false
            });
        }

        return {
            ...navio,
            horizontal,
            posicoes,
            afundado: false
        };
    }

    return null;
}


/* ============================================================
   CRIA FROTA
============================================================ */

function criarFrota() {

    const tabuleiro = criarTabuleiroVazio();

    const frota = [];

    CONFIG.navios.forEach(navioConfig => {

        const navio = colocarNavio(
            tabuleiro,
            navioConfig
        );

        if (navio) {
            frota.push(navio);
        }
    });

    return {
        tabuleiro,
        frota
    };
}


/* ============================================================
   LOCALIZA NAVIO
============================================================ */

function encontrarNavio(
    frota,
    linha,
    coluna
) {

    return frota.find(navio =>
        navio.posicoes.some(
            pos =>
                pos.linha === linha &&
                pos.coluna === coluna
        )
    );
}


/* ============================================================
   VERIFICA SE TODA FROTA FOI DESTRUÍDA
============================================================ */

function frotaDestruida(frota) {

    return frota.every(
        navio => navio.afundado
    );
}


/* ============================================================
   PROCESSA ACERTO
============================================================ */

function processarTiro(
    tabuleiro,
    frota,
    linha,
    coluna
) {

    const conteudo =
        tabuleiro[linha][coluna];

    if (conteudo === "agua") {
        return {
            resultado: "agua"
        };
    }

    const navio = encontrarNavio(
        frota,
        linha,
        coluna
    );

    if (!navio) {
        return {
            resultado: "agua"
        };
    }

    const posicao =
        navio.posicoes.find(
            pos =>
                pos.linha === linha &&
                pos.coluna === coluna
        );

    if (posicao.atingida) {
        return {
            resultado: "repetido"
        };
    }

    posicao.atingida = true;

    const todasAtingidas =
        navio.posicoes.every(
            pos => pos.atingida
        );

    if (todasAtingidas) {
        navio.afundado = true;

        return {
            resultado: "afundado",
            navio
        };
    }

    return {
        resultado: "acerto",
        navio
    };
}


/* ============================================================
   TRANSFORMA CÉLULAS NÃO OCUPADAS EM ÁGUA
============================================================ */

function finalizarTabuleiro(tabuleiro) {

    for (let linha = 0; linha < TAMANHO; linha++) {

        for (let coluna = 0; coluna < TAMANHO; coluna++) {

            if (tabuleiro[linha][coluna] === null) {
                tabuleiro[linha][coluna] = "agua";
            }
        }
    }
}


/* ============================================================
   IMAGENS DOS NAVIOS
   Geradas em JavaScript.
============================================================ */

const imagensNavios = {

    submarino: `
        <svg xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 100 60">
            <rect x="20" y="29" width="60" height="16" rx="8"
                  fill="#9eafb0"/>
            <rect x="42" y="21" width="17" height="10"
                  fill="#9eafb0"/>
            <rect x="48" y="15" width="3" height="7"
                  fill="#9eafb0"/>
            <circle cx="27" cy="37" r="3"
                    fill="#29484e"/>
            <path d="M14 46 L86 46 L75 52 L25 52 Z"
                  fill="#73888a"/>
        </svg>
    `,

    fragata: `
        <svg xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 100 60">
            <path d="M14 39 L86 39 L76 50 L25 50 Z"
                  fill="#9eafb0"/>
            <rect x="35" y="25" width="28" height="14"
                  fill="#9eafb0"/>
            <rect x="48" y="15" width="4" height="11"
                  fill="#9eafb0"/>
            <rect x="43" y="18" width="15" height="3"
                  fill="#9eafb0"/>
            <path d="M65 29 L80 29 L84 38 L65 38 Z"
                  fill="#73888a"/>
        </svg>
    `,

    cruzador: `
        <svg xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 100 60">
            <path d="M9 38 L91 38 L79 51 L22 51 Z"
                  fill="#9eafb0"/>
            <rect x="29" y="24" width="35" height="14"
                  fill="#9eafb0"/>
            <rect x="42" y="13" width="7" height="12"
                  fill="#9eafb0"/>
            <rect x="51" y="17" width="5" height="8"
                  fill="#9eafb0"/>
            <rect x="39" y="18" width="25" height="3"
                  fill="#73888a"/>
            <rect x="66" y="28" width="14" height="5"
                  fill="#73888a"/>
        </svg>
    `
};


function imagemNavio(id) {

    return "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(
            imagensNavios[id]
        );
}


/* ============================================================
   RENDERIZA TABULEIRO
============================================================ */

function renderizarTabuleiro() {

    boardPlayer.innerHTML = "";

    const tabuleiro =
        obterTabuleiroVisivel();

    for (let linha = 0; linha < TAMANHO; linha++) {

        for (let coluna = 0; coluna < TAMANHO; coluna++) {

            const celula =
                document.createElement("button");

            celula.type = "button";

            celula.className = "cell";

            celula.dataset.linha = linha;
            celula.dataset.coluna = coluna;

            const valor =
                tabuleiro[linha][coluna];

            if (valor === "agua") {

                celula.classList.add("water");

            } else if (valor === "navio") {

                celula.classList.add(
                    "ship-visible"
                );

            } else if (valor === "acerto") {

                celula.classList.add("hit");

            }

            celula.addEventListener(
                "click",
                cliqueCelula
            );

            boardPlayer.appendChild(celula);
        }
    }
}


/* ============================================================
   TABULEIRO VISÍVEL
============================================================ */

function obterTabuleiroVisivel() {

    const resultado =
        criarTabuleiroVazio();

    const inimigo =
        estado.tabuleiroInimigo;

    const tiros =
        estado.tirosJogador;

    for (let linha = 0; linha < TAMANHO; linha++) {

        for (let coluna = 0; coluna < TAMANHO; coluna++) {

            const chave =
                `${linha}-${coluna}`;

            if (tiros.has(chave)) {

                const valor =
                    inimigo[linha][coluna];

                if (valor === "agua") {
                    resultado[linha][coluna] = "agua";
                } else {
                    resultado[linha][coluna] = "acerto";
                }
            }
        }
    }

    return resultado;
}


/* ============================================================
   CLIQUE NO TABULEIRO
============================================================ */

function cliqueCelula(event) {

    if (estado.jogoFinalizado) {
        return;
    }

    if (estado.modo === "amigo") {

        if (estado.jogadorAtual !== 1) {
            return;
        }

    }

    const linha =
        Number(event.currentTarget.dataset.linha);

    const coluna =
        Number(event.currentTarget.dataset.coluna);

    const chave =
        `${linha}-${coluna}`;

    if (estado.tirosJogador.has(chave)) {

        mostrarMensagem(
            "Essa posição já foi investigada."
        );

        tocarTom(
            130,
            0.08,
            "square",
            0.05
        );

        return;
    }

    estado.tirosJogador.add(chave);

    executarDisparo(
        linha,
        coluna
    );
}


/* ============================================================
   EXECUTA DISPARO
============================================================ */

function executarDisparo(
    linha,
    coluna
) {

    estado.disparos++;

    somCanhao();

    const resultado =
        processarTiro(
            estado.tabuleiroInimigo,
            estado.naviosInimigo,
            linha,
            coluna
        );

    if (resultado.resultado === "agua") {

        estado.vidas--;

        somAgua();

        mostrarMensagem(
            "ÁGUA. O disparo não encontrou nenhuma embarcação."
        );

    } else if (resultado.resultado === "acerto") {

        estado.acertos++;

        estado.pontos +=
            CONFIG.pontuacao[
                resultado.navio.id
            ];

        somImpacto();

        mostrarMensagem(
            `ACERTO. ${resultado.navio.nome} localizado. +${CONFIG.pontuacao[resultado.navio.id]} pontos.`
        );

    } else if (resultado.resultado === "afundado") {

        estado.acertos++;

        estado.pontos +=
            CONFIG.pontuacao[
                resultado.navio.id
            ] + 100;

        somAfundou();

        mostrarMensagem(
            `${resultado.navio.nome} AFUNDADO. Bônus de 100 pontos.`
        );
    }

    atualizarInterface();

    renderizarTabuleiro();

    if (
        frotaDestruida(
            estado.naviosInimigo
        )
    ) {

        finalizarJogo(true);

        return;
    }

    if (estado.vidas <= 0) {

        finalizarJogo(false);

        return;
    }

    if (estado.modo === "amigo") {

        alternarTurnoAmigo();

        return;
    }

    setTimeout(
        jogarCPU,
        650
    );
}


/* ============================================================
   CPU
============================================================ */

function jogarCPU() {

    if (estado.jogoFinalizado) {
        return;
    }

    mostrarMensagem(
        "A CPU está analisando o seu setor..."
    );

    setTimeout(() => {

        let linha;
        let coluna;
        let chave;

        do {

            linha =
                Math.floor(
                    Math.random() * TAMANHO
                );

            coluna =
                Math.floor(
                    Math.random() * TAMANHO
                );

            chave =
                `${linha}-${coluna}`;

        } while (
            estado.tirosInimigo.has(chave)
        );

        estado.tirosInimigo.add(chave);

        somCanhao();

        const resultado =
            processarTiro(
                estado.tabuleiroJogador,
                estado.naviosJogador,
                linha,
                coluna
            );

        if (resultado.resultado === "agua") {

            somAgua();

            mostrarMensagem(
                `CPU disparou em ${coordenada(linha, coluna)}: água.`
            );

        } else if (
            resultado.resultado === "acerto"
        ) {

            somImpacto();

            mostrarMensagem(
                `CPU acertou sua ${resultado.navio.nome}.`
            );

        } else if (
            resultado.resultado === "afundado"
        ) {

            somAfundou();

            mostrarMensagem(
                `CPU afundou seu ${resultado.navio.nome}.`
            );
        }

        if (
            frotaDestruida(
                estado.naviosJogador
            )
        ) {

            finalizarJogoCPU(false);

            return;
        }

        atualizarInterface();

        setTimeout(() => {

            mostrarMensagem(
                "Sua vez. Selecione um alvo."
            );

        }, 500);

    }, 700);
}


/* ============================================================
   CPU ATACA O TABULEIRO DO JOGADOR
============================================================ */

function finalizarJogoCPU(vitoria) {

    if (vitoria) {
        finalizarJogo(true);
    } else {
        finalizarJogo(false);
    }
}


/* ============================================================
   MODO AMIGO
============================================================ */

function alternarTurnoAmigo() {

    estado.jogadorAtual =
        estado.jogadorAtual === 1
            ? 2
            : 1;

    const nomeAtual =
        estado.jogadorAtual === 1
            ? estado.nomeJogador
            : estado.nomeAmigo;

    const nomeAnterior =
        estado.jogadorAtual === 1
            ? estado.nomeAmigo
            : estado.nomeJogador;

    mostrarModalTroca(
        nomeAtual,
        nomeAnterior
    );
}


function mostrarModalTroca(
    novoJogador,
    jogadorAnterior
) {

    trocaTitulo.textContent =
        `Vez de ${novoJogador}`;

    trocaTexto.textContent =
        `Passe o controle para ${novoJogador}. O campo adversário será mantido oculto.`;

    modalTroca.classList.remove("hidden");

    /* O segundo jogador começa com o tabuleiro do primeiro */

    atualizarTabuleiroDoTurno();
}


function atualizarTabuleiroDoTurno() {

    if (estado.jogadorAtual === 1) {

        estado.tabuleiroInimigo =
            estado.tabuleiroJogador;

        estado.naviosInimigo =
            estado.naviosJogador;

    } else {

        estado.tabuleiroInimigo =
            estado.tabuleiroDoAmigo;

        estado.naviosInimigo =
            estado.naviosDoAmigo;
    }
}


/* ============================================================
   MODO AMIGO - JOGO COMPLETO
============================================================ */

function prepararJogoAmigo() {

    const frota1 =
        criarFrota();

    const frota2 =
        criarFrota();

    estado.tabuleiroJogador =
        frota1.tabuleiro;

    estado.naviosJogador =
        frota1.frota;

    estado.tabuleiroDoAmigo =
        frota2.tabuleiro;

    estado.naviosDoAmigo =
        frota2.frota;

    finalizarTabuleiro(
        estado.tabuleiroJogador
    );

    finalizarTabuleiro(
        estado.tabuleiroDoAmigo
    );

    estado.jogadorAtual = 1;

    estado.tabuleiroInimigo =
        estado.tabuleiroDoAmigo;

    estado.naviosInimigo =
        estado.naviosDoAmigo;
}


/* ============================================================
   COORDENADAS
============================================================ */

function coordenada(
    linha,
    coluna
) {

    const letras =
        "ABCDEFGHIJ";

    return (
        letras[coluna] +
        (linha + 1)
    );
}


/* ============================================================
   ATUALIZA INTERFACE
============================================================ */

function atualizarInterface() {

    placarElement.textContent =
        String(
            estado.pontos
        ).padStart(3, "0");

    vidasElement.textContent =
        String(
            estado.vidas
        ).padStart(2, "0");

    disparosElement.textContent =
        String(
            estado.disparos
        ).padStart(2, "0");

    nomeDisplay.textContent =
        estado.jogadorAtual === 1
            ? estado.nomeJogador
            : estado.nomeAmigo;

    if (estado.modo === "cpu") {

        modoDisplay.textContent =
            `CPU — ${nivelNome(estado.nivel)}`;

    } else {

        modoDisplay.textContent =
            "DOIS COMANDANTES";
    }

    if (estado.modo === "amigo") {

        boardLabel.textContent =
            estado.jogadorAtual === 1
                ? "CAMPO DO COMANDANTE 2"
                : "CAMPO DO COMANDANTE 1";

        turnLabel.textContent =
            "SEU DISPARO";
    }

    atualizarFrota();

    atualizarBotoesTabuleiro();
}


function atualizarBotoesTabuleiro() {

    const botoes =
        boardPlayer.querySelectorAll(".cell");

    botoes.forEach(botao => {

        if (estado.jogoFinalizado) {
            botao.classList.add("disabled");
        }
    });
}


/* ============================================================
   ATUALIZA FROTA
============================================================ */

function atualizarFrota() {

    const frota =
        estado.naviosInimigo;

    fleetList.innerHTML = "";

    frota.forEach(navio => {

        const item =
            document.createElement("div");

        item.className =
            "fleet-item";

        if (navio.afundado) {
            item.classList.add(
                "destroyed"
            );
        }

        const img =
            document.createElement("img");

        img.className =
            "fleet-icon";

        img.alt =
            navio.nome;

        img.src =
            imagemNavio(navio.id);

        const info =
            document.createElement("div");

        info.className =
            "fleet-info";

        info.innerHTML = `
            <strong>${navio.nome}</strong>
            <small>${navio.tamanho} posições</small>
        `;

        const estadoNavio =
            document.createElement("span");

        estadoNavio.className =
            "fleet-state";

        estadoNavio.textContent =
            navio.afundado
                ? "AFUNDADO"
                : "ATIVO";

        item.appendChild(img);
        item.appendChild(info);
        item.appendChild(estadoNavio);

        fleetList.appendChild(item);
    });

    const restantes =
        frota.filter(
            navio => !navio.afundado
        ).length;

    naviosRestantes.textContent =
        restantes;
}


/* ============================================================
   NÍVEL
============================================================ */

function nivelNome(nivel) {

    const nomes = {
        facil: "PATRULHA",
        medio: "COMBATE",
        dificil: "ALMIRANTE"
    };

    return nomes[nivel] || "COMBATE";
}


/* ============================================================
   MENSAGEM
============================================================ */

function mostrarMensagem(texto) {

    messageArea.textContent =
        texto;
}


/* ============================================================
   INICIAR JOGO
============================================================ */

function iniciarJogo() {

    const nome =
        inputNome.value.trim();

    const modo =
        selectModo.value;

    const nivel =
        selectNivel.value;

    if (!nome) {

        inputNome.focus();

        return;
    }

    if (
        modo === "amigo" &&
        !inputAmigo.value.trim()
    ) {

        inputAmigo.focus();

        return;
    }

    estado.nomeJogador =
        nome;

    estado.nomeAmigo =
        inputAmigo.value.trim();

    estado.modo =
        modo;

    estado.nivel =
        nivel;

    estado.vidas =
        CONFIG.vidas[nivel];

    estado.pontos = 0;
    estado.disparos = 0;
    estado.acertos = 0;

    estado.jogoFinalizado = false;

    estado.tirosJogador =
        new Set();

    estado.tirosInimigo =
        new Set();


    if (modo === "cpu") {

        const jogador =
            criarFrota();

        const inimigo =
            criarFrota();

        estado.tabuleiroJogador =
            jogador.tabuleiro;

        estado.naviosJogador =
            jogador.frota;

        estado.tabuleiroInimigo =
            inimigo.tabuleiro;

        estado.naviosInimigo =
            inimigo.frota;

        finalizarTabuleiro(
            estado.tabuleiroJogador
        );

        finalizarTabuleiro(
            estado.tabuleiroInimigo
        );

    } else {

        prepararJogoAmigo();
    }


    /* salva dados temporários */

    localStorage.setItem(
        "batalhaNavalJogador",
        JSON.stringify({
            nome: estado.nomeJogador,
            modo: estado.modo,
            nivel: estado.nivel
        })
    );


    nomeDisplay.textContent =
        estado.nomeJogador;

    mostrarTela("jogo");

    renderizarTabuleiro();

    atualizarInterface();

    mostrarMensagem(
        "Operação iniciada. Selecione uma posição para disparar."
    );

    iniciarAudio();

    somClique();
}


/* ============================================================
   FINALIZAÇÃO
============================================================ */

function finalizarJogo(vitoria) {

    if (estado.jogoFinalizado) {
        return;
    }

    estado.jogoFinalizado = true;

    if (vitoria) {

        somVitoria();

        resultadoTitulo.textContent =
            "MISSÃO CONCLUÍDA";

        resultadoSubtitulo.textContent =
            "Toda a frota inimiga foi neutralizada.";

    } else {

        somDerrota();

        resultadoTitulo.textContent =
            "MISSÃO PERDIDA";

        resultadoSubtitulo.textContent =
            "Suas vidas chegaram ao fim antes da conclusão da operação.";
    }


    resultadoNome.textContent =
        estado.nomeJogador;

    resultadoPontos.textContent =
        String(
            estado.pontos
        ).padStart(3, "0");

    resultadoDisparos.textContent =
        String(
            estado.disparos
        ).padStart(2, "0");

    resultadoAcertos.textContent =
        String(
            estado.acertos
        ).padStart(2, "0");


    const precisao =
        estado.disparos > 0
            ? Math.round(
                (estado.acertos /
                    estado.disparos) * 100
            )
            : 0;

    resultadoPrecisao.textContent =
        `${precisao}%`;


    salvarRanking(
        estado.nomeJogador,
        estado.pontos
    );

    mostrarRanking();

    setTimeout(() => {
        mostrarTela("final");
    }, 700);
}


/* ============================================================
   RANKING
============================================================ */

function obterRanking() {

    try {

        const dados =
            localStorage.getItem(
                "batalhaNavalRanking"
            );

        if (!dados) {
            return [];
        }

        const ranking =
            JSON.parse(dados);

        if (!Array.isArray(ranking)) {
            return [];
        }

        return ranking;

    } catch (erro) {

        console.error(
            "Erro ao ler ranking:",
            erro
        );

        return [];
    }
}


function salvarRanking(
    nome,
    pontos
) {

    const ranking =
        obterRanking();

    ranking.push({
        nome,
        pontos,
        data: new Date().toISOString()
    });

    ranking.sort(
        (a, b) =>
            b.pontos - a.pontos
    );

    const top10 =
        ranking.slice(0, 10);

    localStorage.setItem(
        "batalhaNavalRanking",
        JSON.stringify(top10)
    );
}


function mostrarRanking() {

    const ranking =
        obterRanking();

    rankingList.innerHTML = "";

    if (ranking.length === 0) {

        rankingList.innerHTML = `
            <div class="ranking-empty">
                Nenhum comandante registrado ainda.
            </div>
        `;

        return;
    }

    ranking.forEach(
        (jogador, indice) => {

            const row =
                document.createElement("div");

            row.className =
                "ranking-row";

            row.innerHTML = `
                <span class="rank-number">
                    ${String(indice + 1).padStart(2, "0")}
                </span>

                <span class="rank-name">
                    ${escaparHTML(jogador.nome)}
                </span>

                <span class="rank-score">
                    ${String(jogador.pontos).padStart(3, "0")}
                </span>
            `;

            rankingList.appendChild(row);
        }
    );
}


/* ============================================================
   SEGURANÇA DO TEXTO DO RANKING
============================================================ */

function escaparHTML(texto) {

    const div =
        document.createElement("div");

    div.textContent =
        texto;

    return div.innerHTML;
}


/* ============================================================
   BOTÃO RANKING MENU
============================================================ */

document
    .getElementById("btn-ranking-menu")
    .addEventListener(
        "click",
        () => {

            somClique();

            mostrarRanking();

            /* mostra tela final como ranking */

            resultadoTitulo.textContent =
                "CENTRO DE RANKING";

            resultadoSubtitulo.textContent =
                "Registro dos melhores resultados da operação.";

            resultadoNome.textContent =
                "—";

            resultadoPontos.textContent =
                "—";

            resultadoDisparos.textContent =
                "—";

            resultadoAcertos.textContent =
                "—";

            resultadoPrecisao.textContent =
                "—";

            mostrarTela("final");
        }
    );


/* ============================================================
   COMO JOGAR
============================================================ */

document
    .getElementById("btn-como-jogar")
    .addEventListener(
        "click",
        () => {

            somClique();

            modalComoJogar.classList.remove(
                "hidden"
            );
        }
    );


document
    .getElementById("btn-fechar-modal")
    .addEventListener(
        "click",
        () => {

            somClique();

            modalComoJogar.classList.add(
                "hidden"
            );
        }
    );


modalComoJogar.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            modalComoJogar
        ) {
            modalComoJogar.classList.add(
                "hidden"
            );
        }
    }
);


/* ============================================================
   SOM MENU
============================================================ */

function atualizarTextoSom() {

    const texto =
        estado.somAtivo
            ? "SOM ON"
            : "SOM OFF";

    document
        .getElementById("btn-som-menu")
        .textContent = texto;

    document
        .getElementById("btn-som-jogo")
        .textContent =
            `SOM: ${estado.somAtivo ? "ON" : "OFF"}`;
}


document
    .getElementById("btn-som-menu")
    .addEventListener(
        "click",
        () => {

            estado.somAtivo =
                !estado.somAtivo;

            atualizarTextoSom();

            if (estado.somAtivo) {

                iniciarAudio();

                somClique();

                iniciarAmbienteMenu();
            }
        }
    );


document
    .getElementById("btn-som-jogo")
    .addEventListener(
        "click",
        () => {

            estado.somAtivo =
                !estado.somAtivo;

            atualizarTextoSom();

            if (estado.somAtivo) {
                iniciarAudio();
                somClique();
            }
        }
    );


/* ============================================================
   ABANDONAR
============================================================ */

document
    .getElementById("btn-abandonar")
    .addEventListener(
        "click",
        () => {

            if (
                !confirm(
                    "Deseja realmente abandonar a operação?"
                )
            ) {
                return;
            }

            somClique();

            mostrarTela("menu");
        }
    );


/* ============================================================
   JOGAR NOVAMENTE
============================================================ */

document
    .getElementById("btn-jogar-novamente")
    .addEventListener(
        "click",
        () => {

            somClique();

            iniciarJogo();
        }
    );


/* ============================================================
   VOLTAR AO MENU
============================================================ */

document
    .getElementById("btn-voltar-menu")
    .addEventListener(
        "click",
        () => {

            somClique();

            mostrarTela("menu");
        }
    );


/* ============================================================
   CONFIRMAR TROCA DE JOGADOR
============================================================ */

document
    .getElementById("btn-confirmar-troca")
    .addEventListener(
        "click",
        () => {

            somClique();

            modalTroca.classList.add(
                "hidden"
            );

            atualizarTabuleiroDoTurno();

            renderizarTabuleiro();

            atualizarInterface();

            mostrarMensagem(
                `Sua vez, ${estado.jogadorAtual === 1
                    ? estado.nomeJogador
                    : estado.nomeAmigo
                }. Escolha uma posição.`
            );
        }
    );


/* ============================================================
   FORMULÁRIO
============================================================ */

formJogo.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        iniciarJogo();
    }
);


/* ============================================================
   INICIALIZAÇÃO
============================================================ */

function inicializar() {

    const jogadorSalvo =
        localStorage.getItem(
            "batalhaNavalJogador"
        );

    if (jogadorSalvo) {

        try {

            const dados =
                JSON.parse(jogadorSalvo);

            if (dados.nome) {
                inputNome.value =
                    dados.nome;
            }

            if (dados.nivel) {
                selectNivel.value =
                    dados.nivel;
            }

        } catch (erro) {

            console.warn(
                "Não foi possível recuperar jogador salvo."
            );
        }
    }

    atualizarTextoSom();

    mostrarRanking();

    /*
       O navegador normalmente exige uma interação do usuário
       antes de liberar áudio.
    */

    document.addEventListener(
        "click",
        () => {

            if (
                estado.somAtivo &&
                estado.tela === "menu"
            ) {
                iniciarAudio();
                iniciarAmbienteMenu();
            }

        },
        {
            once: true
        }
    );
}


inicializar();