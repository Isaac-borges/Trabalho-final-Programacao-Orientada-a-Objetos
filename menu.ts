class InterfaceUsuario {
    static MenuInicial(): void {
        console.log("-------------------------------------");
        console.log("1 - NOVA BATALHA");
        console.log("2 - CONTINUAR BATALHA");
        console.log("3 - CONSULTAS");
        console.log("0 - SAIR");
        console.log("-------------------------------------");
    }

    static MenuBatalha(nomeVez?: string): void {
        console.log("-------------------------------------");
        if (nomeVez) console.log(`VEZ DE: ${nomeVez}`);
        console.log("1 - ATACAR (obrigatório)");
        console.log("2 - LISTAR PERSONAGENS");
        console.log("3 - VER VENCEDOR");
        console.log("0 - SAIR DA BATALHA");
        console.log("-------------------------------------");
    }

    static MenuConsultas(): void {
        console.log("-------------------------------------");
        console.log("1 - LISTAR TODAS AS BATALHAS");
        console.log("2 - LISTAR PERSONAGENS DA BATALHA ATUAL");
        console.log("3 - MOSTRAR HISTÓRICO DE UM PERSONAGEM");
        console.log("0 - VOLTAR");
        console.log("-------------------------------------");
    }

    static MenuCriarPersonagem(): void {
        console.log("-------------------------------------");
        console.log("TIPO DE PERSONAGEM");
        console.log("1 - GUERREIRO");
        console.log("2 - MAGO");
        console.log("3 - ARQUEIRO");
        console.log("4 - PATRULHEIRO");
        console.log("0 - CANCELAR");
        console.log("-------------------------------------");
    }
}

export { InterfaceUsuario };
