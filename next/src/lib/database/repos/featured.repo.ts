import GenericRepository from "./generic.repo";
import FeaturedModel from "../models/featured.model";
import { EmptyObject, IFeatured } from "@/lib/types/index.types";


class FeaturedRepository extends GenericRepository<
    IFeatured,
    Pick<IFeatured, "contentId" | "contentType">,
    EmptyObject
> {
    constructor() {
        super(FeaturedModel);
    }

}

const featuredRepository = new FeaturedRepository();

export default featuredRepository;
