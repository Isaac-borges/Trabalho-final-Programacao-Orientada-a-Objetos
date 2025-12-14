import { Acao } from "./acao";
import { Personagem } from "./personagem";
import {
    CharacterNotFound,
    CharacterNameIsEqual,
    NoManStanding,
} from "./exceptions";

class Batalha {
    private _personagens: Personagem[] = [];
    private _acoes: Acao[] = [];
    private _iniciada: boolean = false;
    private _indexVez: number = 0;

    adicionarPersonagem(novo_personagem: Personagem): void {
        if (this._iniciada) {
            throw new Error(
                "\nNÃO É POSSIVEL ADICIONAR PERSONAGENS DEPOIS DO INÍCIO DA BATALHA.",
            );
        }

        for (let personagem of this._personagens) {
            if (personagem.nome === novo_personagem.nome) {
                throw new CharacterNameIsEqual(
                    "PERSONAGEM TEM NOME IGUAL À OUTRO",
                );
            }
        }

        this._personagens.push(novo_personagem);
        novo_personagem.id_acao = this._personagens.length * 1000;
    }

    consultarPersonagem(nome: string): Personagem {
        for (let personagem of this._personagens) {
            if (personagem.nome === nome.toUpperCase()) return personagem;
        }
        throw new CharacterNotFound("PERSONAGEM NÃO ENCONTRADO!");
    }

    consultarPersonagemPorID(id: number): Personagem {
        for (let p of this._personagens) {
            if (p.id === id) return p;
        }
        throw new CharacterNotFound("PERSONAGEM NÃO ENCONTRADO!");
    }

    listarPersonagens(): Personagem[] {
        return this._personagens;
    }

    listarAcoes(): Acao[] {
        return this._acoes;
    }

    iniciar(): void {
        this._iniciada = true;
        this._indexVez = this.encontrarProximoVivoIndex(-1);
    }

    personagemDaVez(): Personagem {
        const index = this._indexVez;
        if (this._personagens.length === 0)
            throw new NoManStanding("NENHUM PERSONAGEM NA BATALHA!");

        const personagem = this._personagens[index];

        if (!personagem || !personagem.estaVivo()) {
            const prox = this.encontrarProximoVivoIndex(index);
            if (prox === -1) throw new NoManStanding("NENHUM PERSONAGEM VIVO!");

            this._indexVez = prox;
            return this._personagens[this._indexVez]!;
        }
        return personagem;
    }

    // Retorna array de {id, nome_pad} dos inimigos vivos (exclui o atacante)
    listarInimigosVivosDo(
        atacante: Personagem,
    ): { id: number; nome_pad: string }[] {
        return this._personagens
            .filter((p) => p.estaVivo() && p.id !== atacante.id)
            .map((p) => ({ id: p.id, nome_pad: p.nome_pad }));
    }

    // Executa o ataque do atacante contra defensor, registra todas as ações geradas e avança a vez.
    // Retorna as ações geradas neste "sub-turno" (pode ser 1 ou mais).
    executarAtaque(atacanteId: number, defensorId?: number): Acao[] {
        // Marca inicia se ainda não iniciado (primeiro ataque inicializa a batalha)
        if (!this._iniciada) this.iniciar();

        const atacante = this.consultarPersonagemPorID(atacanteId);
        const defensor = this.consultarPersonagemPorID(defensorId!);

        // valida: atacante deve ser o personagem da vez
        const pVez = this.personagemDaVez();
        if (atacante.id !== pVez.id) {
            throw new Error("Não é a vez desse personagem.");
        }

        // guarda tamanho do histórico do atacante
        const tamanhoAntes = atacante.historicoLength();

        // realiza ataque (pode lançar exceções)
        const acaoPrincipal = atacante.atacar(defensor);

        // coletar todas as ações novas do atacante (inclui custo do mago etc.)
        const novas = atacante.getAcoesDesde(tamanhoAntes);

        // registrar globalmente
        this._acoes.push(...novas);

        // avançar a vez para o próximo vivo
        this.avancarVez();

        // após o ataque, verifica se acabou a batalha
        const vivos = this._personagens.filter((p) => p.estaVivo());
        if (vivos.length === 1) {
            return novas; // vencedor único — App lidará com encerramento
        } else if (vivos.length === 0) {
            // todos mortos — lançar NoManStanding
            throw new NoManStanding("NENHUM JOGADOR VIVO!");
        }

        return novas;
    }

    // encontra próximo índice de personagem vivo, procurando circularmente. -1 se nenhum vivo.
    private encontrarProximoVivoIndex(fromIndex: number): number {
        const n = this._personagens.length;
        if (n === 0) return -1;
        for (let offset = 1; offset <= n; offset++) {
            const idx = (fromIndex + offset + n) % n;
            const p = this._personagens[idx];
            if (p && p.estaVivo()) return idx;
        }
        return -1;
    }

    // Avança this._indexVez para o próximo vivo
    private avancarVez(): void {
        const prox = this.encontrarProximoVivoIndex(this._indexVez);
        if (prox === -1) {
            // nenhum vivo
            this._indexVez = 0;
        } else {
            this._indexVez = prox;
        }
    }

    // retorna true se batalha já foi iniciada (ou se já ocorreu algum turno)
    isIniciada(): boolean {
        return this._iniciada;
    }

    // retorna o vencedor ou lança NoManStanding se nenhum, ou null se mais de 1 vivo
    verificarVencedor(): Personagem | null {
        const vivos = this._personagens.filter((p) => p.estaVivo());
        if (vivos.length === 1) return vivos[0]!;
        if (vivos.length === 0) throw new NoManStanding("NENHUM JOGADOR VIVO!");
        return null;
    }
}

export { Batalha };
