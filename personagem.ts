import { Acao } from "./acao";

class Personagem {
    private _id: number;
    private _nome: string;
    private _vida: number;
    private _ataque: number;
    private _historico: Acao[] = [];

    constructor(id: number, nome: string, vida: number, ataque: number) {
        this._id = id;
        this._nome = nome;
        this._vida = vida;
        this._ataque = ataque;
    }

    atacar(alvo: Personagem) {
        alvo.receberDano(this._ataque);
    }

    receberDano(valor: number) {
        this._vida = this._vida - valor;
    }

    estaVivo(): boolean {
        return this._vida > 0;
    }

    registrarAcao(acao: Acao): void {
        this._historico.push(acao);
    }
}

export { Personagem };
