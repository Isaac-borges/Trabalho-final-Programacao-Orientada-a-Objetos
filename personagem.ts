import { Acao } from "./acao";
import {
    UnsuccessfulAttack,
    AplicacaoException,
    CharacterNotFound,
    DeadCantAttack,
    DeadCantBeAttacked,
    CantAttackItself,
    ValueIsNotValid,
} from "./exceptions";

import { Validate } from "./validate";

class Personagem extends Validate {
    private _id: number;
    private _nome: string;
    private _vida: number;
    private _vida_maxima: number;
    private _ataque: number;
    private _historico: Acao[] = [];
    private _id_acao: number = 0;

    constructor(id: number, nome: string, vida: number, ataque: number) {
        super();
        this._id = id;
        this.validarTamanhoNome(nome, 1, 9);
        this._nome = nome;
        this.validarValor(vida, 1, 100);
        this._vida = vida;
        this._vida_maxima = vida;
        this._ataque = ataque;
    }

    atacar(alvo: Personagem): Acao {
        let acao_ataque: Acao;
        let dano_base: number = this.calcularDano();
        let descricao_ataque: string;

        if (!alvo.estaVivo()) {
            throw new DeadCantBeAttacked("O ALVO ESTÁ MORTO!");
        }

        if (!this.estaVivo()) {
            throw new DeadCantAttack("ATACANTE JÁ ESTÁ MORTO!");
        }

        if (this.nome == alvo.nome) {
            throw new CantAttackItself("NÃO PODE ATACAR A SI MESMO!");
        }

        let dano_final = this.causarDano(alvo, dano_base);

        descricao_ataque = this.gerarDescricaoAtaque(alvo, dano_final);

        if (dano_final === 0) {
            descricao_ataque = `\nO ATAQUE DE ${this.nome_pad} FOI APARADO POR ${alvo.nome_pad}!\n`;

            alvo.registrarAcao(
                new Acao(
                    ++alvo.id_acao,
                    alvo,
                    this,
                    `\n${alvo.nome_pad} DEFENDEU UM ATAQUE DE ${this.nome_pad}!`,
                    0,
                    new Date(),
                ),
            );
        }

        acao_ataque = new Acao(
            ++this._id_acao,
            this,
            alvo,
            descricao_ataque,
            dano_final,
            new Date(),
        );

        this.registrarAcao(acao_ataque);
        return acao_ataque;
    }

    causarDano(alvo: Personagem, dano: number): number {
        return alvo.receberDano(dano);
    }

    calcularDano(): number {
        return this._ataque;
    }

    receberDano(valor: number): number {
        this._vida -= valor;
        if (this._vida < 0) this._vida = 0;
        return valor;
    }

    receberDanoVerdadeiro(valor: number): void {
        this._vida = this._vida - valor;
        if (this._vida < 0) this._vida = 0;
    }

    estaVivo(): boolean {
        return this.vida > 0;
    }

    registrarAcao(acao: Acao): void {
        this._historico.push(acao);
    }

    historicoLength(): number {
        return this._historico.length;
    }

    getAcoesDesde(inicio: number): Acao[] {
        return this._historico.slice(inicio);
    }

    gerarDescricaoAtaque(alvo: Personagem, dano: number): string {
        let descricao_ataque: string = `\n${this.nome_pad} ATACOU ${alvo.nome_pad} E TIROU ${dano} DE VIDA!`;

        return descricao_ataque;
    }

    get nome(): string {
        return this._nome.toUpperCase();
    }

    get nome_pad(): string {
        let nome = this._nome;
        nome = nome.toUpperCase();
        while (nome.length < 9) {
            nome = nome + " ";
        }

        return nome;
    }

    get id(): number {
        return this._id;
    }

    set id_acao(id_acao: number) {
        this._id_acao = id_acao;
    }

    get id_acao(): number {
        return this._id_acao;
    }

    get ataque(): number {
        return this._ataque;
    }

    get vida(): number {
        return this._vida;
    }

    set vida(valor_novo: number) {
        this._vida = valor_novo;
    }

    get vida_maxima(): number {
        return this._vida_maxima;
    }

    get acoes(): Acao[] {
        return this._historico;
    }
}

class Guerreiro extends Personagem {
    private _defesa: number;

    constructor(
        id: number,
        nome: string,
        vida: number,
        ataque: number,
        defesa: number,
    ) {
        super(id, nome, vida, ataque);
        this._defesa = defesa;
    }

    receberDano(valor: number): number {
        if (valor <= this._defesa) {
            return 0;
        }

        const dano_real = valor - this._defesa;
        super.receberDano(dano_real);
        return dano_real;
    }

    calcularDano(): number {
        let dano: number = this.ataque;

        if (this.vida <= Math.floor(this.vida_maxima * 0.3)) {
            dano = Math.floor(dano * 1.3);
        }

        return dano;
    }

    gerarDescricaoAtaque(alvo: Personagem, dano: number): string {
        if (this.vida <= Math.floor(this.vida_maxima * 0.3)) {
            return `${this.nome_pad} FEZ UM ATAQUE FURIOSO EM ${alvo.nome_pad} E CAUSOU ${dano} DE DANO!`;
        }

        return `${this.nome_pad} ATACOU ${alvo.nome_pad} E TIROU ${dano} DE VIDA!`;
    }

    get defesa(): number {
        return this._defesa;
    }
}

class Mago extends Personagem {
    causarDano(alvo: Personagem, dano_base: number): number {
        let dano_final: number = dano_base;
        if (alvo instanceof Arqueiro) {
            dano_final = dano_final * 2;
        }

        alvo.receberDanoVerdadeiro(dano_final);

        this.receberDanoVerdadeiro(10);
        this.registrarAcao(
            new Acao(
                ++this.id_acao,
                this,
                this,
                `${this.nome_pad} GASTOU 10 DE VIDA PARA USAR MAGIA!`,
                10,
                new Date(),
            ),
        );

        this.estaVivo();
        return dano_final;
    }

    gerarDescricaoAtaque(alvo: Personagem, dano: number): string {
        let texto = `\n${this.nome_pad} LANÇOU UMA MAGIA EM ${alvo.nome_pad}!\n`;

        if (alvo instanceof Guerreiro) {
            texto += `A DEFESA DO ALVO FOI IGNORADA!\n`;
        }

        if (alvo instanceof Arqueiro) {
            texto += `E O ALVO SOFREU DANO DOBRADO!\n`;
        }

        texto += `CAUSOU ${dano} DE DANO!\n`;

        return texto;
    }
}

class Arqueiro extends Personagem {
    private _ataque_multiplo: number;
    private _sorteio_multiplo: boolean = false;

    constructor(
        id: number,
        nome: string,
        vida: number,
        ataque: number,
        ataque_multiplo: number,
    ) {
        super(id, nome, vida, ataque);
        this._ataque_multiplo = ataque_multiplo;
    }

    causarDano(alvo: Personagem, dano_base: number): number {
        this._sorteio_multiplo = false;
        const chance_critico: number = Math.random();
        let dano_ataque_multiplo: number = dano_base;

        if (chance_critico >= 0.5) {
            dano_ataque_multiplo = dano_ataque_multiplo * this._ataque_multiplo;
            this._sorteio_multiplo = true;
        }

        alvo.receberDano(dano_ataque_multiplo);
        return dano_ataque_multiplo;
    }

    get ataque_multiplo(): number {
        return this._ataque_multiplo;
    }

    get sorteio_multiplo(): boolean {
        return this._sorteio_multiplo;
    }

    gerarDescricaoAtaque(alvo: Personagem, dano: number): string {
        if (this.sorteio_multiplo) {
            return `${this.nome_pad} ATIROU ${this.ataque_multiplo} FLECHAS EM ${alvo.nome_pad} E CAUSOU ${dano} DE DANO!`;
        }

        return `${this.nome_pad} ATIROU UMA FLECHA EM ${alvo.nome_pad} E CAUSOU ${dano} DE DANO!`;
    }
}

class Patrulheiro extends Personagem {
    private _companheiro_animal_vida_max: number;
    private _companheiro_animal_vida_atual: number;

    constructor(id: number, nome: string, vida: number, ataque: number) {
        super(id, nome, vida, ataque);

        this._companheiro_animal_vida_max = Math.floor(this.vida_maxima * 0.25);
        this._companheiro_animal_vida_atual = this._companheiro_animal_vida_max;
    }

    companheiroAnimalEstaVivo(): boolean {
        return this._companheiro_animal_vida_atual > 0;
    }

    causarDano(alvo: Personagem, dano_base: number): number {
        let dano_final = dano_base;

        if (this.companheiroAnimalEstaVivo()) {
            dano_final = Math.floor(dano_final * 1.75);
        }

        alvo.receberDano(dano_final);

        return dano_final;
    }

    receberDano(valor: number): number {
        let resto = valor;

        if (this.companheiroAnimalEstaVivo()) {
            const absorvido = Math.min(
                resto,
                this._companheiro_animal_vida_atual,
            );
            this._companheiro_animal_vida_atual =
                this._companheiro_animal_vida_atual - absorvido;
            resto -= absorvido;
        }

        if (resto > 0) {
            this.vida -= resto;
            if (this.vida < 0) this.vida = 0;
        }

        return valor;
    }

    gerarDescricaoAtaque(alvo: Personagem, dano: number): string {
        if (this.companheiroAnimalEstaVivo()) {
            return `\n${this.nome_pad} E SEU COMPANHEIRO ANIMAL ATACARAM ${alvo.nome_pad}! ${alvo.nome_pad} SOFREU ${dano} DE DANO!`;
        }

        return `\n${this.nome_pad} ATACOU ${alvo.nome_pad}! ${alvo.nome_pad} SOFREU ${dano} DE DANO!`;
    }

    get vida_companheiro_max(): number {
        return this._companheiro_animal_vida_max;
    }

    get vida_companheiro_atual(): number {
        return this._companheiro_animal_vida_atual;
    }
}

export { Personagem, Guerreiro, Mago, Arqueiro, Patrulheiro };
