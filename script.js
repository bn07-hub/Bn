// Banco de dados com 2 candidatos por cargo e caminhos para imagens locais
const CANDIDATOS = {
    "Deputado Federal": {
        "1515": { 
            nome: "YURY DO PAREDÃO", 
            partido: "MDB", 
            foto: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdJO4yx8ByBbQF3RHbq2t4_8qn1ke4weD9RuRpP__85Q&s=10" 
        },
        "2222": { 
            nome: "ANDRÉ FERNANDES", 
            partido: "PL", 
            foto: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8V82UUcXSrXDd_1_vST2tyYdT0pJigTLBEG518PdfHQ&s" 
        }
    },
    "Deputado Estadual": {
        "15222": { 
            nome: "DAVI DE RAIMUNDÂO", 
            partido: "MDB", 
            foto: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdR8tGvOXA-phewwEyNst3Z8EOJX8cyN4OXZQ4ZZyI-Q&s=10" 
        },
        "22222": { 
            nome: "TANCREDO DOS SANTOS", 
            partido: "PL", 
            foto: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOmqsdp7OqigG0wb3oCNosL6lAwfEg1JPq35zErEDtJfWUIDOh1FMuxxU&s=10" 
        }
    },
    "Primeiro Senador": {
        "180": { 
            nome: "LUIZIANE", 
            partido: "PSDB", 
            foto: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzYLpGKHzmEAAc5s3CqcSe-xTj912QmQaZS0PVMdzw_w&s=10" 
        },
        "445": { 
            nome: "CAPITAO VAGNER", 
            partido: "UNB", 
            foto: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRb_CH26AE0lzeepACS8W75xAd0QPgWXujg8dhscMYH6g&s"
        }
    },
    "Segundo Senador": {
        "222": { 
            nome: "ALCIDES FERNANDES", 
            partido: "PL", 
            foto: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlx1okK3mDHL8Wso_FvKl1r0bUv7VDOs-ITGHxgGKwrw&s=10" 
        },
        "400": { 
            nome: "CID GOMES", 
            partido: "UNIAO", 
            foto: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOEohLJuRqfdpqDGoymNhH1F_yqAHlhIm7xojYNAd6tw&s" 
        }
    },
    "Governador": {
        "13": { 
            nome: "ELMANO FREITAS", 
            partido: "PT", 
            foto: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2vjun19XEvKGG6ssW4FOSerf_kjeCfdf5jkPWCLPxOQ&s=10",  
        },
        "45": { 
            nome: "CIRO GOMES", 
            partido: "PSDB", 
            foto: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbedFKRen_oTcDhAbatQQs0HSAwgGzrf175OCPdGwdTQ&s=10"
             
        }
    },
    "Presidente": {
        "13": { 
            nome: "LUIZ INACIO LULA DA SILVA", 
            partido: "PT", 
            foto: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIbBKvE7Ccfh2r7JfV_HRFD-wyIS0RYIOhFxBE4Eg-nQ&s", 
            
        },
        "22": { 
            nome: "FLAVIO BOLSONARO", 
            partido: "PL", 
            foto: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAyzX4KgqFCIz5pUII2wf_vxEWd_3Niwdo0U3ItdzEKw&s", 
            
        }
    }
};


const ETAPAS = [
    { cargo: "Deputado Federal", digitos: 4 },
    { cargo: "Deputado Estadual", digitos: 5 },
    { cargo: "Primeiro Senador", digitos: 3 },
    { cargo: "Segundo Senador", digitos: 3 },
    { cargo: "Governador", digitos: 2 },
    { cargo: "Presidente", digitos: 2 }
];

let etapaAtual = 0;
let numeroDigitado = "";
let votoBrancoAtivo = false;
let primeiroSenadorVoto = ""; 
let historicoVotos = [];

const somUrna = {
    ctx: null,
    init() {
        if(!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    },
    beep(freq, duration) {
        this.init();
        let osc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },
    tocarTecla() { this.beep(440, 0.1); },
    tocarFim() {
        this.init();
        this.beep(1250, 0.4);
        setTimeout(() => this.beep(1400, 0.6), 150);
    }
};

function inicializarEtapa() {
    if (etapaAtual >= ETAPAS.length) {
        finalizarVotacao();
        return;
    }

    let etapa = ETAPAS[etapaAtual];
    numeroDigitado = "";
    votoBrancoAtivo = false;

    document.getElementById("instrucao-voto").style.display = "block";
    document.getElementById("cargo-nome").innerText = etapa.cargo;
    document.getElementById("detalhes").innerHTML = "";
    document.getElementById("fotos-area").innerHTML = ""; // Limpa fotos da rodada anterior
    document.getElementById("rodape").style.opacity = "0";

    let areaDigitos = document.getElementById("digitos-area");
    areaDigitos.innerHTML = "";
    for (let i = 0; i < etapa.digitos; i++) {
        let box = document.createElement("div");
        box.classList.add("digito-box");
        if (i === 0) box.classList.add("pisca");
        areaDigitos.appendChild(box);
    }
}

function inserir(num) {
    if (votoBrancoAtivo || etapaAtual >= ETAPAS.length) return;
    
    let etapa = ETAPAS[etapaAtual];
    if (numeroDigitado.length < etapa.digitos) {
        somUrna.tocarTecla();
        numeroDigitado += num;
        atualizarInterfaceDigitos();
    }
}

function atualizarInterfaceDigitos() {
    let etapa = ETAPAS[etapaAtual];
    let boxes = document.querySelectorAll(".digito-box");

    for (let i = 0; i < boxes.length; i++) {
        boxes[i].classList.remove("pisca");
        if (numeroDigitado[i] !== undefined) {
            boxes[i].innerText = numeroDigitado[i];
        } else {
            boxes[i].innerText = "";
            if (i === numeroDigitado.length) {
                boxes[i].classList.add("pisca");
            }
        }
    }

    if (numeroDigitado.length === etapa.digitos) {
        buscarCandidato(etapa.cargo);
    }
}

function buscarCandidato(cargo) {
    let listaCandidatos = CANDIDATOS[cargo];
    let detalhes = document.getElementById("detalhes");
    let fotosArea = document.getElementById("fotos-area");
    document.getElementById("rodape").style.opacity = "1";

    if (listaCandidatos && listaCandidatos[numeroDigitado]) {
        let cand = listaCandidatos[numeroDigitado];
        
        if (cargo === "Segundo Senador" && numeroDigitado === primeiroSenadorVoto) {
            detalhes.innerHTML = `<br><div class="aviso-grande">VOTO NULO</div><small style="color:red">Candidato já escolhido como 1º Senador</small>`;
            return;
        }

        // Renderiza detalhes em texto do candidato
        let txtDetalhes = `Nome: <b>${cand.nome}</b><br>Partido: ${cand.partido}`;
        if(cand.vice) {
            txtDetalhes += `<br><small>Vice: ${cand.vice}</small>`;
        }
        detalhes.innerHTML = txtDetalhes;

        // Renderiza Foto Principal do Candidato
        let htmlFotos = `<div class="container-foto"><img src="${cand.foto}"><span>Candidato</span></div>`;
        
        // Se for Executivo (Governador/Presidente), adiciona um espaço menor para o vice abaixo
        if (cand.vice) {
            htmlFotos += `<div class="container-foto pequeno"><img src="https://unsplash.com"><span>Vice</span></div>`;
        }
        
        fotosArea.innerHTML = htmlFotos;
    } else {
        detalhes.innerHTML = `<br><div class="aviso-grande">VOTO NULO</div><small>Número não correspondente a nenhum candidato</small>`;
    }
}

function votarBranco() {
    if (etapaAtual >= ETAPAS.length) return;
    
    somUrna.tocarTecla();
    votoBrancoAtivo = true;
    numeroDigitado = "";
    
    document.getElementById("digitos-area").innerHTML = "";
    document.getElementById("fotos-area").innerHTML = "";
    document.getElementById("detalhes").innerHTML = `<br><div class="aviso-grande" style="color: green;">VOTO EM BRANCO</div>`;
    document.getElementById("rodape").style.opacity = "1";
}

function corrigir() {
    if (etapaAtual >= ETAPAS.length) return;
    somUrna.tocarTecla();
    inicializarEtapa();
}

function confirmar() {
    if (etapaAtual >= ETAPAS.length) return;

    let etapa = ETAPAS[etapaAtual];
    let votoComputado = "";

    if (votoBrancoAtivo) {
        votoComputado = "BRANCO";
    } else if (numeroDigitado.length === etapa.digitos) {
        votoComputado = numeroDigitado;
    } else {
        return;
    }

    if (etapa.cargo === "Primeiro Senador") {
        primeiroSenadorVoto = votoComputado;
    }

    historicoVotos.push({ cargo: etapa.cargo, voto: votoComputado });

    somUrna.tocarTecla();
    etapaAtual++;
    inicializarEtapa();
}

function finalizarVotacao() {
    somUrna.tocarFim();
    document.getElementById("tela").innerHTML = `<div class="tela-fim">FIM</div>`;
    console.log("=== VOTOS GRAVADOS NA URNA ===");
    console.table(historicoVotos);
}

window.onload = () => {
    inicializarEtapa();
};
