import {
    Model,
    Types,
    FilterQuery,
    UpdateQuery,
    ClientSession,
} from "mongoose";
import AppError from "@/lib/utils/error";
import connectToDatabase from "@/lib/database/db";

class GenericRepository<FullT, CreateT, UpdateT> {
    // TODO: Fix this linting issue.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(protected readonly model: Model<any>) { }

    protected async ensureDbConnection() {
        await connectToDatabase();
    }

    async count(
        filter: FilterQuery<FullT>,
        session?: ClientSession
    ): Promise<number> {
        await this.ensureDbConnection();

        try {
            return await this.model
                .countDocuments(filter)
                .session(session || null)
                .exec();
        } catch (error) {
            throw new AppError("Failed to count documents.", {
                filter,
                error,
            });
        }
    }

    async insert(data: CreateT, session?: ClientSession): Promise<FullT> {
        await this.ensureDbConnection();

        try {
            const result = await this.model.create(
                [data],
                session ? { session } : {}
            );
            return result[0].toObject() as FullT;
        } catch (error) {
            throw new AppError("Failed to create a document.", {
                data,
                error,
            });
        }
    }

    async insertMany(data: CreateT[], session?: ClientSession): Promise<FullT[]> {
        await this.ensureDbConnection();

        try {
            const docs = await this.model.insertMany(data, { session: session });
            return docs.map((doc) => doc.toObject() as FullT);
        } catch (error) {
            throw new AppError("Failed to insert multiple documents.", {
                data,
                error,
            });
        }
    }

    async findById(
        id: Types.ObjectId,
        session?: ClientSession
    ): Promise<FullT | null> {
        await this.ensureDbConnection();

        try {
            return await this.model
                .findById(id)
                .session(session || null)
                .lean<FullT>()
                .exec();
        } catch (error) {
            throw new AppError("Failed to find document by Id.", {
                id,
                error,
            });
        }
    }

    async findOne(
        filter: FilterQuery<FullT>,
        session?: ClientSession
    ): Promise<FullT | null> {
        await this.ensureDbConnection();

        try {
            return await this.model
                .findOne(filter)
                .session(session || null)
                .lean<FullT>()
                .exec();
        } catch (error) {
            throw new AppError("Failed to find one document.", {
                filter,
                error,
            });
        }
    }

    async findAll(
        filter: FilterQuery<FullT> = {},
        session?: ClientSession
    ): Promise<FullT[]> {
        await this.ensureDbConnection();

        try {
            return await this.model
                .find(filter)
                .session(session || null)
                .lean<FullT[]>()
                .exec();
        } catch (error) {
            throw new AppError("Failed to find all documents.", {
                filter,
                error,
            });
        }
    }

    async updateById(
        id: Types.ObjectId,
        update: UpdateQuery<UpdateT>,
        session?: ClientSession
    ): Promise<FullT | null> {
        await this.ensureDbConnection();

        try {
            const doc = await this.model
                .findByIdAndUpdate(id, update, { session, new: true })
                .exec();
            return doc ? (doc.toObject() as FullT) : null;
        } catch (error) {
            throw new AppError("Failed to update document.", {
                id,
                update,
                error,
            });
        }
    }

    async updateMany(
        filter: FilterQuery<FullT>,
        update: UpdateQuery<FullT>,
        session?: ClientSession
    ): Promise<void> {
        await this.ensureDbConnection();

        try {
            await this.model.updateMany(filter, update, { session }).exec();
        } catch (error) {
            throw new AppError("Failed to update document(s).", {
                filter,
                update,
                error,
            });
        }
    }

    async removeById(
        id: Types.ObjectId,
        session?: ClientSession
    ): Promise<boolean> {
        await this.ensureDbConnection();

        try {
            const doc = await this.model.findByIdAndDelete(id, { session }).exec();
            return !!doc;
        } catch (error) {
            throw new AppError("Failed to remove a document.", {
                id,
                error,
            });
        }
    }
}

export default GenericRepository;
