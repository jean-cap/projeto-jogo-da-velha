class JogadorHumano {
    constructor(simbolo) {
        this.simbolo = simbolo;
        this.humano = true;
    }
}

class JogadorAleatorio {
    constructor(simbolo) {
        this.simbolo = simbolo;
        this.humano = false;
    }

    jogar(tabuleiro) {
        let linha = this.#aleatorio(1, tabuleiro.length);
        let coluna = this.#aleatorio(1, tabuleiro.length);
        return new Jogada(linha, coluna);
    }

    #aleatorio(min, max) {
        let valor = Math.random() * (max - min) + min;
        return Math.round(valor);
    }
}

class Jogada {
    constructor(linha, coluna) {
        this.linha = linha;
        this.coluna = coluna;
    }

    valida() {
        return this.linha > 0 && this.coluna > 0;
    }
}

class JogoDaVelha {
    constructor(jogador1 = new JogadorHumano('X'), jogador2 = new JogadorHumano('O'), tamanho = 3) {
        this.jogador1 = jogador1;
        this.jogador2 = jogador2;
        this.tamanho = tamanho;
        this.zerar();
    }

    #iniciarTabuleiro() {
        return Array(this.tamanho).fill(0).map(() => Array(this.tamanho).fill(null));
    }

    #trocarJogador() {
        this.jogadorAtual = this.jogadorAtual.simbolo === this.jogador1.simbolo ? this.jogador2 : this.jogador1;
    }

    #adicionar(jogada) {
        let {linha, coluna} = jogada;
        this.tabuleiro[linha - 1][coluna - 1] = this.jogadorAtual.simbolo;
    }

    #jogadaValida(jogada) {
        if (!jogada.valida()) {
            return false;
        }

        let {linha, coluna} = jogada;

        if (linha > this.tamanho || coluna > this.tamanho) {
            return false;
        }

        if (this.#ocupado(jogada)) {
            return false;
        }

        if (this.vencedor) {
            return false;
        }

        return true;
    }

    #ocupado(jogada) {
        let {linha, coluna} = jogada;
        return this.#campo(linha, coluna) !== null;
    }

    #campo(linha, coluna) {
        return this.tabuleiro[linha - 1][coluna - 1];
    }

    #finalizouComEmpate() {
        let espacosVazios = this.tabuleiro
            .flat()
            .filter(campo => campo === null);
        return espacosVazios.length === 0;
    }

    #conquistouVitoriaComJogada(jogada) {
        let {linha, coluna} = jogada;
        let {tabuleiro, jogadorAtual} = this;
        let tamanho = tabuleiro.length;
        let indices = Array(tamanho).fill(0).map((_, index) => index + 1);

        let ganhouEmLinha = indices.every(indice => {
            return this.#campo(linha, indice) === jogadorAtual.simbolo;
        });

        let ganhouEmColuna = indices.every(indice => {
            return this.#campo(indice, coluna) === jogadorAtual.simbolo;
        });

        let ganhouEmDiag1 = indices.every(indice => {
            return this.#campo(indice, indice) === jogadorAtual.simbolo;
        });

        let ganhouEmDiag2 = indices.every(indice => {
            return this.#campo(tamanho - indice, indice) === jogadorAtual.simbolo;
        });

        return ganhouEmLinha || ganhouEmColuna || ganhouEmDiag1 || ganhouEmDiag2;
    }

    #processarJogada(jogada) {
        if (!this.#jogadaValida(jogada)) {
            return;
        }
        this.#adicionar(jogada);
        if (this.#conquistouVitoriaComJogada(jogada)) {
            this.vencedor = this.jogadorAtual.simbolo;
        } else if (this.#finalizouComEmpate()) {
            this.vencedor = '-';
        }
        this.#trocarJogador();
    }

    jogar(jogada) {
        if (this.jogadorAtual.humano) {
            this.#processarJogada(jogada);
        }

        while (!this.vencedor && !this.jogadorAtual.humano) {
            let jogada = this.jogadorAtual.jogar(this.tabuleiro);
            this.#processarJogada(jogada);
        }
    }

    zerar() {
        this.tabuleiro = this.#iniciarTabuleiro();
        this.jogadorAtual = this.jogador1;
        this.vencedor = null;
    }

    status() {
        if (this.vencedor === '-') {
            return 'Empate!!!';
        } else if (this.vencedor) {
            return `${this.vencedor} venceu!!!`;
        } else {
            return `É a vez de ${this.jogadorAtual.simbolo} jogar.`;
        }
    }

    toString() {
        let matriz = this.tabuleiro
            .map(linha => linha.map(pos => pos ?? '-').join(' ')).join('\n');
        let quemVenceu = this.vencedor ? ` Vencedor: ${this.vencedor}` : '';

        return `${matriz} \n ${quemVenceu}`;
    }
}

// const jogo = new JogoDaVelha(new JogadorHumano('X'), new JogadorAleatorio('O'));
// jogo.jogar(new Jogada(1, 1));
// jogo.jogar(new Jogada(2, 2));
// jogo.jogar(new Jogada(1, 3));
// jogo.jogar(new Jogada(1, 2));
// jogo.jogar(new Jogada(3, 1));
// jogo.jogar(new Jogada(3, 2));
// console.log(jogo.toString());

class JogoDaVelhaDOM {
    constructor(tabuleiro, informacoes) {
        this.tabuleiro = tabuleiro;
        this.informacoes = informacoes;
    }

    inicializar(jogo) {
        this.jogo = jogo;
        this.#deixarTabuleiroJogavel();
    }

    zerar() {
        this.jogo.zerar();
        let posicoes = document.getElementsByClassName('posicao');
        [...posicoes].forEach(posicao => {
            posicao.innerText = '';
        });
        this.informacoes.innerText = this.jogo.status();
    }

    #deixarTabuleiroJogavel() {
        const posicoes = this.tabuleiro.getElementsByClassName('posicao');
        for (let posicao of posicoes) {
            posicao.addEventListener('click', e => {
                if (this.jogo.vencedor) {
                    return;
                }
                let posicaoSelecionada = e.target.attributes;
                let linha = +posicaoSelecionada.linha.value;
                let coluna = +posicaoSelecionada.coluna.value;
                console.log(`Cliquei em ${linha} ${coluna}`);
                this.jogo.jogar(new Jogada(linha, coluna));
                this.informacoes.innerText = this.jogo.status();
                console.log(this.jogo.toString());
                this.#imprimirSimbolos();
            });
        }
    }

    #imprimirSimbolos() {
        let {tabuleiro} = this.jogo;
        let qtdLinhas = tabuleiro.length;
        let qtdColuna = tabuleiro[0].length;
        let posicoes = this.tabuleiro.getElementsByClassName('posicao');

        for (let linha = 0; linha < qtdLinhas; linha++) {
            for (let coluna = 0; coluna < qtdColuna; coluna++) {
                let indiceDaInterface = linha * qtdLinhas + coluna;
                posicoes[indiceDaInterface].innerText = tabuleiro[linha][coluna];
            }
        }
    }
}

(function () {
    const botaoIniciar = document.getElementById('iniciar');
    const informacoes = document.getElementById('informacoes');
    const tabuleiro = document.getElementById('tabuleiro');

    const jogo = new JogoDaVelha();
    const jogoDOM = new JogoDaVelhaDOM(tabuleiro, informacoes);
    jogoDOM.inicializar(jogo);

    botaoIniciar.addEventListener('click', e => {
        jogoDOM.zerar();
    });
})()