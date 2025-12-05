import { Personagem } from "./personagem";

class Acao {
    private _id: number;
    private _origem: Personagem;
    private _alvo: Personagem;
    private _descricao: string;
    private _valor_dano: number;
    private _data_hora: Date;

    constructor(
        id: number,
        origem: Personagem,
        alvo: Personagem,
        descricao: string,
        valor_dano: number,
        data_hora: Date,
    ) {
        this._id = id;
        this._origem = origem;
        this._alvo = alvo;
        this._descricao = descricao;
        this._valor_dano = valor_dano;
        this._data_hora = data_hora;
    }
}

export { Acao };
