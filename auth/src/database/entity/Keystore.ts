interface IKeystore {
    project_id?: string;
    key?: Buffer;
}

export class Keystore implements IKeystore {

    project_id: string | undefined;
    key: Buffer | undefined;

    constructor(data: IKeystore) {
        this.project_id = data.project_id;
        this.key = data.key;
    }
}