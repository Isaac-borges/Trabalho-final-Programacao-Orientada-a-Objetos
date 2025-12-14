import { Acao } from "./acao";
import {
    Personagem,
    Guerreiro,
    Mago,
    Arqueiro,
    Patrulheiro,
} from "./personagem";
import { Batalha } from "./batalha";
import {
    AplicacaoException,
    NoManStanding,
    CharacterNotFound,
    CharacterNameIsEqual,
} from "./exceptions";
import { InterfaceUsuario } from "./menu";

const prompt = require("prompt-sync")();

class App {
    private _batalhas: Batalha[] = [];
    private _batalha_atual: Batalha | null = null;

    iniciarApp(): void {
        let opcao: number = -1;
        do {
            console.clear();
            InterfaceUsuario.MenuInicial();
            opcao = Number(prompt("ESCOLHA UMA OPÇÃO: "));

            console.clear();
            switch (opcao) {
                case 1:
                    this.novaBatalha();
                    break;
                case 2:
                    if (this._batalha_atual != null) {
                        this.continuarBatalha();
                    } else {
                        console.log("NENHUMA BATALHA ATIVA!");
                    }

                    break;
                case 3:
                    this.menuConsultas();
                    break;
                case 0:
                    console.log("ENCERRANDO...");
                    break;
                default:
                    console.log("OPÇÃO INVÁLIDA!");
            }
            prompt("INSIRA <ENTER> PARA CONTINUAR...");
            console.clear();
        } while (opcao !== 0);
    }

    novaBatalha(): void {
        this._batalha_atual = new Batalha();
        this._batalhas.push(this._batalha_atual);
        console.log(
            "NOVA BATALHA CRIADA. ADICIONE OS PERSONAGENS ANTES DE INICIAR.",
        );

        this.continuarBatalha();
    }

    continuarBatalha(): void {
        let opcao: number = -1;
        do {
            console.clear();
            let nomeVez: string | undefined = undefined;
            if (this._batalha_atual?.isIniciada()) {
                try {
                    nomeVez = this._batalha_atual.personagemDaVez().nome;
                } catch (e) {
                    nomeVez = undefined;
                }
            }

            InterfaceUsuario.MenuBatalha(nomeVez);
            opcao = Number(prompt("Escolha uma opção: "));

            switch (opcao) {
                case 1:
                    if (!this._batalha_atual) break;
                    if (!this._batalha_atual.isIniciada()) {
                        if (
                            this._batalha_atual.listarPersonagens().length < 2
                        ) {
                            console.log(
                                "ADICIONE PELO MENOS 2 PERSONAGENS ANTES DE COMEÇAR.",
                            );
                            break;
                        }

                        this._batalha_atual.iniciar();
                    }
                    this.opcaoAtacar();

                    try {
                        const vencedor =
                            this._batalha_atual.verificarVencedor();
                        if (vencedor) {
                            console.log("PARABÉNS!");
                            console.log(`GANHADOR: ${vencedor.nome_pad}`);
                            console.log(
                                `VIDA: ${vencedor.vida}/${vencedor.vida_maxima}`,
                            );

                            this._batalha_atual = null;
                            opcao = 0;
                        }
                    } catch (err: any) {
                        if (err instanceof NoManStanding) {
                            console.log(err.message);
                            this._batalha_atual = null;
                            opcao = 0;
                        } else {
                            throw err;
                        }
                    }
                    break;

                case 2:
                    console.clear();
                    for (let personagem of this._batalha_atual?.listarPersonagens()!) {
                        console.log(
                            `NOME :${personagem.nome_pad}\nVIDA: ${personagem.vida}/${personagem.vida_maxima}\nATAQUE: ${personagem.ataque}`,
                        );
                        if (personagem instanceof Guerreiro) {
                            console.log(`DEFESA: ${personagem.defesa}`);
                        } else if (personagem instanceof Arqueiro) {
                            console.log(
                                `ATAQUE MULTIPLO: ${personagem.ataque_multiplo}`,
                            );
                        } else if (personagem instanceof Patrulheiro) {
                            console.log(
                                `VIDA DO COMPANHEIRO ANIMAL: ${personagem.vida_companheiro_atual}/${personagem.vida_companheiro_max}`,
                            );
                        }
                    }

                    if (!this._batalha_atual?.isIniciada()) {
                        const resp = prompt(
                            "\nDESEJA ADICIONAR PERSONAGEM? (s/n): ",
                        );
                        console.clear();
                        if (resp.toLowerCase() === "s") this.criarPersonagem();
                    } else {
                        console.log(
                            "\nBATALHA JÁ INICIADA, NÃO É PERMITIDO ADICIONAR PERSONAGENS.",
                        );
                    }
                    break;

                case 3:
                    try {
                        console.clear();
                        if (this._batalha_atual) {
                            const v = this._batalha_atual.verificarVencedor();
                            if (v) console.log("VENCEDOR:", v.nome_pad);
                        }
                        break;
                    } catch (error: any) {
                        if (error instanceof NoManStanding) {
                            console.log(error.message);
                        }
                        break;
                    }

                case 0:
                    console.log("Saindo da batalha.");
                    break;

                default:
                    console.log("OPÇÃO INVÁLIDA!");
            }
            prompt("INSIRA <ENTER> PARA CONTINUAR...");
        } while (opcao !== 0);
    }

    criarPersonagem(): void {
        if (!this._batalha_atual) return;

        InterfaceUsuario.MenuCriarPersonagem();
        const tipo = Number(prompt("Tipo: "));
        if (tipo === 0) return;

        const nome = String(prompt("Nome (1 a 9 chars): ")).toUpperCase();
        const vida = Number(prompt("Vida (1 a 100): "));
        const ataque = Number(prompt("Ataque: "));

        try {
            let personagem: Personagem;
            if (tipo === 1) {
                const defesa = Number(prompt("Defesa: "));
                personagem = new Guerreiro(
                    this.gerarID(),
                    nome,
                    vida,
                    ataque,
                    defesa,
                );
            } else if (tipo === 2) {
                personagem = new Mago(this.gerarID(), nome, vida, ataque);
            } else if (tipo === 3) {
                const mult = Number(prompt("Multiplicador: "));
                personagem = new Arqueiro(
                    this.gerarID(),
                    nome,
                    vida,
                    ataque,
                    mult,
                );
            } else if (tipo === 4) {
                personagem = new Patrulheiro(
                    this.gerarID(),
                    nome,
                    vida,
                    ataque,
                );
            } else {
                console.log("TIPO INVÁLIDO!");
                return;
            }

            this._batalha_atual.adicionarPersonagem(personagem);
            console.log("PERSONAGEM ADICIONADO!");
        } catch (error: any) {
            this.tratarErro(error);
        }
    }

    opcaoAtacar(): void {
        if (!this._batalha_atual) return;

        try {
            const atacante: Personagem = this._batalha_atual.personagemDaVez();
            const inimigos =
                this._batalha_atual.listarInimigosVivosDo(atacante);

            if (inimigos.length === 0) {
                console.log("Nenhum inimigo disponível.");
                return;
            }

            console.log("Escolha o alvo:");
            for (let i = 0; i < inimigos.length; i++) {
                console.log(
                    `${i + 1} - ${inimigos[i]?.nome_pad} (ID: ${inimigos[i]?.id})`,
                );
            }

            let escolha = Number(prompt("Digite a opção: "));
            if (
                Number.isNaN(escolha) ||
                escolha < 1 ||
                escolha > inimigos.length
            ) {
                console.log("Opção inválida.");
                return;
            }

            const defensorId: number = inimigos[escolha - 1]?.id!;
            const acoes: Acao[] = this._batalha_atual.executarAtaque(
                atacante.id,
                defensorId,
            );

            for (let acao of acoes) {
                console.log(acao.descricao);
            }
        } catch (error: any) {
            this.tratarErro(error);
        }
    }

    menuConsultas(): void {
        let opcao: number = -1;
        do {
            InterfaceUsuario.MenuConsultas();
            opcao = Number(prompt("Escolha: "));

            switch (opcao) {
                case 1:
                    for (let i: number = 0; i < this._batalhas.length; i++) {
                        console.log(`\nBATALHA ${i + 1}:`);
                        console.log(
                            `NUMERO DE JOGADORES: ${this._batalhas[i]?.listarPersonagens().length}`,
                        );
                        console.log(
                            `NUMERO DE AÇÕES: ${this._batalhas[i]?.listarAcoes().length}`,
                        );
                    }

                    break;
                case 2:
                    if (!this._batalha_atual) {
                        console.log("NENHUMA BATALHA ATIVA.");
                    } else {
                        console.log(this._batalha_atual.listarPersonagens());
                    }
                    break;
                case 3:
                    this.consultarAcoesDePersonagem();
                    break;
                case 0:
                    break;
                default:
                    console.log("OPÇÃO INVÁLIDA!");
            }
        } while (opcao !== 0);
    }

    consultarAcoesDePersonagem(): void {
        if (!this._batalha_atual) return;
        try {
            const nome: string = prompt("Nome do personagem: ").toUpperCase();
            const personagem: Personagem =
                this._batalha_atual.consultarPersonagem(nome);
            for (let acao of personagem.acoes) console.log(acao.descricao);
        } catch (e: any) {
            this.tratarErro(e);
        }
    }

    tratarErro(error: any): void {
        if (error instanceof AplicacaoException) {
            console.log("ERRO:", error.message);
        } else {
            console.log("ERRO DESCONHECIDO:", error);
        }
    }

    gerarID(): number {
        return Math.floor(Math.random() * 1000000) + 1;
    }
}

function main(): void {
    let app: App = new App();
    app.iniciarApp();
}

main();

export { App };
