import GenericRepository from "./generic.repo";
import MediaModel from "@/lib/database/models/media.model";
import { EmptyObject, IMedia } from "@/lib/types/index.types";


class MediaRepository extends GenericRepository<
    IMedia,
    Pick<IMedia, "key" | "url" | "uploadedBy">,
    EmptyObject
> {
    constructor() {
        super(MediaModel);
    }
}

const mediaRepository = new MediaRepository();

export default mediaRepository;
