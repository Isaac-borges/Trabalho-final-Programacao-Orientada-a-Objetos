class UnsuccessfulAttack extends Error {
    constructor(message: string) {
        super(message);
    }
}

class CharacterNotFound extends Error {
    constructor(message: string) {
        super(message);
    }
}

export { UnsuccessfulAttack, CharacterNotFound };
