import { PrismaClient, Project } from "@prisma/client";
import Snowflake from "../../util/Snowflake.js";

class ProjectRepo {
    private readonly db;

    constructor(db: PrismaClient) {
        this.db = db;
    }

    /**
     * findById
     */
    public async findById(id: string): Promise<Project | null> {
        return await this.db.project.findUnique({
            where: {
                id
            },
            include: {
                keystore: {
                    select: { api_key: true }
                }
            }

        });
    }

    /**
     * findByOrgId
     */
    public async findByAccountId(id: string): Promise<Project[] | null> {
        return await this.db.project.findMany({
            where: {
                account_id: id
            }
        });
    }

    /**
     * findByAPIKey
     */
    public async findByAPIKey(api_key: string) {
        return await this.db.project.findFirst({
            where: {
                keystore: { api_key }
            }
        });
    }

    /**
     * create
     */
    public async create(name: string, account_id: string): Promise<Project | { error: string }> {
        
        // FIXME: generate jwt keys
        const jwt_pub_key = "-----BEGIN PUBLIC KEY-----\n"; 
        const jwt_prv_key = "-----BEGIN PRIVATE KEY-----\n";

        return await this.db.project.create({
            data: {
                id: Snowflake.nextHexId(),
                name,
                account_id,
                keystore: {
                    create: {
                        jwt_pub_key,
                        jwt_prv_key,
                    } as any // TypeScript doesn't know 'api_key' has a default value >_<
                }
            }
        });
    }

    /**
     * update
     */
    public async update(project: Project): Promise<Project | null> {
        return await this.db.project.update({
            where: {
                id: project.id
            },
            data: {
                name: project.name
            }
        });
    }

    /**
     * delete
     */
    public async delete(project: Project): Promise<Project> {
        return await this.db.project.delete({
            where: {
                id: project.id
            }
        });
    }

}

export default ProjectRepo;
