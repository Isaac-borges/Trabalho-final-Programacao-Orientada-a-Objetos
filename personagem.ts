import { Acao } from "./acao";
import { UnsuccessfulAttack } from "./exceptions";

class Personagem {
    private _id: number;
    private _nome: string;
    private _vida: number;
    private _vida_maxima: number;
    private _ataque: number;
    private _historico: Acao[] = [];
    private _id_acao: number = 0;

    constructor(id: number, nome: string, vida: number, ataque: number) {
        this._id = id;
        this._nome = nome;
        this._vida = vida;
        this._vida_maxima = vida;
        this._ataque = ataque;
    }

    atacar(alvo: Personagem): Acao {
        let acao_ataque: Acao;
        let dano_base: number = this.calcularDano();
        let descricao_ataque: string;

        if (!alvo.estaVivo()) {
            throw new UnsuccessfulAttack("O ALVO ESTÁ MORTO!");
        }

        if (!this.estaVivo()) {
            throw new UnsuccessfulAttack("ATACANTE JÁ ESTÁ MORTO!");
        }

        if (this.nome == alvo.nome) {
            throw new UnsuccessfulAttack("NÃO PODE ATACAR A SI MESMO!");
        }

        let dano_final = this.causarDano(alvo, dano_base);

        descricao_ataque = this.gerarDescricaoAtaque(alvo, dano_final);

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
        alvo.receberDano(dano);
        return dano;
    }

    calcularDano(): number {
        return this._ataque;
    }

    receberDano(valor: number): void {
        this._vida = this._vida - valor;
        if (this._vida < 0) this._vida = 0;
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

    gerarDescricaoAtaque(alvo: Personagem, dano: number): string {
        let descricao_ataque: string = `${this.nome_pad} ATACOU ${alvo.nome_pad} E TIROU ${dano} DE VIDA!`;

        if (this instanceof Guerreiro) {
            if (this.vida <= Math.floor(this.vida_maxima * 0.3)) {
                descricao_ataque = `${this.nome_pad} FEZ UM ATAQUE FURIOSO EM ${alvo.nome_pad}!`;
            }
        } else if (this instanceof Mago) {
            descricao_ataque = `${this.nome_pad} LANÇOU UMA MAGIA EM ${alvo.nome_pad}!\n`;

            if (alvo instanceof Guerreiro) {
                descricao_ataque =
                    descricao_ataque + `A DEFESA DO ALVO FOI IGNORADA!\n`;
            } else if (alvo instanceof Arqueiro) {
                descricao_ataque =
                    descricao_ataque + `E O ALVO SOFREU DANO DOBRADO!\n`;
            }

            descricao_ataque = descricao_ataque + `A MAGIA CUSTOU 10 DE VIDA.`;
        } else if (this instanceof Arqueiro) {
            descricao_ataque = `${this.nome_pad} ATIROU UMA FLECHA EM ${alvo.nome_pad} E CAUSOU ${dano} DE DANO!`;

            if (this.sorteio_multiplo) {
                descricao_ataque = `${this.nome_pad} ATIROU ${this.ataque_multiplo} FLECHAS EM ${alvo.nome_pad} E CAUSOU ${dano} DE DANO!`;
            }
        }

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

    receberDano(valor: number): void {
        if (valor < this._defesa) {
            throw new UnsuccessfulAttack(`${this.nome} BLOQUEOU O ATAQUE!`);
        }

        super.receberDano(valor - this._defesa);
    }

    calcularDano(): number {
        let dano: number = this.ataque;

        if (this.vida <= Math.floor(this.vida_maxima * 0.3)) {
            dano = Math.floor(dano * 1.3);
        }

        return dano;
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
}

function printarVidas(personagens: Personagem[]): void {
    for (let personagem of personagens) {
        console.log("VIDA DO " + personagem.nome + ": " + personagem.vida);
    }
}

function printarAcoes(personagens: Personagem[]): void {
    for (let personagem of personagens) {
        for (let acao of personagem.acoes) {
            console.log(acao.descricao);
        }
    }
}

function main(): void {
    let guerreiro: Guerreiro = new Guerreiro(1, "THORFINN", 100, 20, 21);
    let mago: Mago = new Mago(2, "VEIGAR", 80, 20);
    let arqueiro: Arqueiro = new Arqueiro(3, "LINK", 100, 10, 3);

    try {
        guerreiro.atacar(arqueiro);
        mago.atacar(guerreiro);
        guerreiro.atacar(mago);
        arqueiro.atacar(guerreiro);
        mago.atacar(guerreiro);
        mago.atacar(guerreiro);
        mago.atacar(guerreiro);
        mago.atacar(guerreiro);
    } catch (error: any) {
        if (error instanceof UnsuccessfulAttack) {
            console.log("Erro!");
        } else {
            console.log("Sem erro!");
        }
    }

    printarVidas([guerreiro, mago, arqueiro]);
    printarAcoes([guerreiro, mago, arqueiro]);
}

main();

export { Personagem, Guerreiro, Mago, Arqueiro };
