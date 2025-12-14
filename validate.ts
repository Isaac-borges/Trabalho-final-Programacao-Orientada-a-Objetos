import { ValueIsNotValid } from "./exceptions";

class Validate {
    validarValor(valor: number, min: number, max: number): void {
        if (valor < min || valor > max) {
            throw new ValueIsNotValid("VALOR INVÁLIDO!");
        }
    }

    validarTamanhoNome(nome: string, tamanho_min: number, tamanho_max: number) {
        if (nome.length < tamanho_min || nome.length > tamanho_max) {
            throw new ValueIsNotValid("TAMANHO DO NOME INVÁLIDO");
        }
    }
}

export { Validate };
