// Elementos da interface
const telaInicial = document.getElementById("tela-inicial");
const telaPergunta = document.getElementById("tela-pergunta");
const telaFinal = document.getElementById("tela-final");
const textoPergunta = document.getElementById("texto-pergunta");
const botoesAlternativas = document.getElementById("botoes-alternativas");
const progresso = document.getElementById("progresso");
const timerDisplay = document.getElementById("timer");
const textoResultado = document.getElementById("texto-resultado");

// Botões
const btnIniciar = document.getElementById("btn-iniciar");
const btnPular = document.getElementById("btn-pular");
const btnEliminar = document.getElementById("btn-eliminar");
const btnParar = document.getElementById("btn-parar");
const btnReiniciar = document.getElementById("botao-reiniciar");

// Ranking de valores
const rankingValores = [
    "R$ 1.000", "R$ 2.000", "R$ 5.000", "R$ 10.000", "R$ 20.000",
    "R$ 50.000", "R$ 100.000", "R$ 250.000", "R$ 500.000", "R$ 1.000.000"
];

// Variáveis de controle
let perguntas = []; // será preenchido com JSON externo
let nomeJogador = "";
let perguntaAtual = 0;
let timer;
let tempoRestante = 15;
let pulosDisponiveis = 2;
let eliminacoesDisponiveis = 2;

// Funções principais

function iniciarJogo() {
    const inputNome = document.getElementById("nome-jogador");
    nomeJogador = inputNome.value.trim();
    if (nomeJogador === "") {
        alert("Por favor, digite seu nome.");
        return;
    }

    // Troca de telas
    telaInicial.classList.remove("ativa");
    telaPergunta.classList.add("ativa");

    // Reseta variáveis de ajuda e pergunta
    perguntaAtual = 0;
    pulosDisponiveis = 2;
    eliminacoesDisponiveis = 2;

    // Busca JSON externo
    fetch('/perguntas.json')
        .then(response => response.json())
        .then(data => {
            perguntas = data;
            carregarPergunta();
        })
        .catch(error => {
            alert("Erro ao carregar perguntas.");
            console.error(error);
        });
}

function carregarPergunta() {
    resetarEstado();
    const pergunta = perguntas[perguntaAtual];
    textoPergunta.textContent = pergunta.pergunta;
    progresso.textContent = `Pergunta ${perguntaAtual + 1} de ${perguntas.length}`;
    timerDisplay.textContent = "15s";
    tempoRestante = 15;
    iniciarTimer();

    pergunta.alternativas.forEach((texto, index) => {
        const botao = document.createElement("button");
        botao.textContent = texto;
        botao.classList.add("alternativa");
        botao.onclick = () => verificarResposta(index, botao);
        botoesAlternativas.appendChild(botao);
    });
}

function resetarEstado() {
    clearInterval(timer);
    botoesAlternativas.innerHTML = "";
}

function iniciarTimer() {
    timer = setInterval(() => {
        tempoRestante--;
        timerDisplay.textContent = `${tempoRestante}s`;
        if (tempoRestante <= 0) {
            clearInterval(timer);
            encerrarJogo(false, "Tempo esgotado! 😓");
        }
    }, 1000);
}

function verificarResposta(indice, botaoSelecionado) {
    clearInterval(timer);
    const pergunta = perguntas[perguntaAtual];
    const todasAlternativas = document.querySelectorAll(".alternativa");

    if (indice === pergunta.correta) {
        botaoSelecionado.classList.add("correta");
        setTimeout(() => {
            perguntaAtual++;
            if (perguntaAtual < perguntas.length) {
                carregarPergunta();
            } else {
                encerrarJogo(true);
            }
        }, 1500);
    } else {
        botaoSelecionado.classList.add("errada");
        todasAlternativas[pergunta.correta].classList.add("correta");
        setTimeout(() => {
            encerrarJogo(false, "Você errou! 😓");
        }, 1500);
    }
}

function encerrarJogo(venceu, mensagemExtra = "") {
    telaPergunta.classList.remove("ativa");
    telaFinal.classList.add("ativa");

    if (venceu) {
        textoResultado.innerHTML = `🎉 Parabéns, ${nomeJogador}! Você venceu e ganhou <strong>${rankingValores[perguntaAtual - 1]}</strong>!`;
    } else {
        textoResultado.innerHTML = `${mensagemExtra}<br><br>${nomeJogador}, você ganhou <strong>${rankingValores[perguntaAtual - 1] || "nada"}</strong>.`;
    }
}

function pararJogo() {
    clearInterval(timer);
    encerrarJogo(true, "Você decidiu parar. 👏");
}

function reiniciarJogo() {
    clearInterval(timer); // Cancela o timer, caso esteja ativo
    perguntaAtual = 0;
    nomeJogador = "";
    pulosDisponiveis = 2;
    eliminacoesDisponiveis = 2;
    perguntas = []; // limpa perguntas para forçar novo carregamento

    // Limpa possíveis estados antigos da interface
    resetarEstado();

    // Volta para a tela inicial, independentemente da tela atual
    telaPergunta.classList.remove("ativa");
    telaFinal.classList.remove("ativa");
    telaInicial.classList.add("ativa");

    // Limpa o campo de nome do jogador
    const inputNome = document.getElementById("nome-jogador");
    if (inputNome) inputNome.value = "";
}


// Ajuda: Pular pergunta
function usarPulo() {
    if (pulosDisponiveis > 0) {
        pulosDisponiveis--;
        perguntaAtual++;
        if (perguntaAtual < perguntas.length) {
            carregarPergunta();
        } else {
            encerrarJogo(true);
        }
    } else {
        alert("Você já usou todos os seus pulos!");
    }
}

// Ajuda: Eliminar duas alternativas incorretas
function eliminarAlternativas() {
    if (eliminacoesDisponiveis <= 0) {
        alert("Você já usou todas as eliminações disponíveis!");
        return;
    }

    const pergunta = perguntas[perguntaAtual];
    const alternativas = document.querySelectorAll(".alternativa");

    const incorretas = [];
    alternativas.forEach((botao, index) => {
        if (index !== pergunta.correta) {
            incorretas.push(botao);
        }
    });

    embaralharArray(incorretas);

    for (let i = 0; i < 2 && i < incorretas.length; i++) {
        incorretas[i].disabled = true;
        incorretas[i].style.opacity = 0.5;
    }

    eliminacoesDisponiveis--;
}

function embaralharArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Event listeners para os botões
btnIniciar.addEventListener("click", iniciarJogo);
btnPular.addEventListener("click", usarPulo);
btnEliminar.addEventListener("click", eliminarAlternativas);
btnParar.addEventListener("click", pararJogo);
btnReiniciar.addEventListener("click", reiniciarJogo);
