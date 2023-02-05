import NodeRSA from "node-rsa";
import db from "../../database/DatabaseGateway.js";
import path from 'path';
import fs from 'fs';

enum Format {
    privateDer = 'pkcs8-private-der',
    privatePem = 'pkcs8-private-pem',
    publicDer  = 'pkcs8-public-der',
    publicPem  = 'pkcs8-public-pem',
}

class RSA {

    private readonly key = new NodeRSA();
    private readonly path = `${path.resolve()}/keystore`;

    public readonly project_id: string;

    constructor(project_id: string) {
        this.project_id = project_id;
    }

    // NEVER EXPOSE
    getPrivateKey() {
        return this.key.exportKey(Format.privatePem);
    }

    getPublicKey() {
        return this.key.exportKey(Format.publicPem);
    }

    generate() {
        if (!this.key.isEmpty()) return;
        const start = Date.now();
        this.key.generateKeyPair();
        const duration = (Date.now() - start) / 1000
        console.log('Generated new RSA key in', duration, 'seconds');
    }

    loadKeys() {
        let key;
        try {
            key = fs.readFileSync(`${this.path}/${this.project_id}.pem`)
        } catch (err) {
            return;
        }

        this.key.importKey(key, Format.privatePem);
    }

    save() {
        if (this.key.isEmpty()) {
            console.error("Cannot save empty key");
            return;
        }

        // create /keystore directory if it doesn't exist
        if (!fs.existsSync(`${path.resolve()}/keystore`)) {
            fs.mkdirSync(`${path.resolve()}/keystore`);
        }

        fs.writeFileSync(`${this.path}/${this.project_id}.pem`, this.getPrivateKey());
    }

    deleteKey() { 
        try {
            fs.rmSync(`${this.path}/${this.project_id}.pem`);
        } catch (err) {}
    }
}

export default RSA;