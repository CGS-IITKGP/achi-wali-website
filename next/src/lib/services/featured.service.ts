import featuredRepository from "../database/repos/featured.repo";
import {
    ESECs,
    ServiceSignature,
    EUserRole,
    SDOut,
    SDIn,
    APIControl,
    EFeaturedType,
    IRecentFeaturedContent,
} from "@/lib/types/index.types";
import AppError from "../utils/error";
import projectRepository from "../database/repos/project.repo";
import blogRepository from "../database/repos/blog.repo";
import { Types } from "mongoose";

const get: ServiceSignature<
    SDIn.Featured.Get,
    SDOut.Featured.Get,
    false
> = async (data, session) => {
    if (data.target === APIControl.Featured.Get.Target.RECENT) {
        return await getRecent({}, null);
    }

    const featured = await featuredRepository.findAll({
        contentType: data.target.toUpperCase()
    });

    const contentIds = featured.map(featured => featured.contentId);

    if (data.target === APIControl.Featured.Get.Target.BLOG) {
        const featuredBlogs = await blogRepository.findAllOfListExportable({
            _id: {
                $in: contentIds
            }
        });

        return {
            success: true,
            data: featuredBlogs.map(blog => {
                return {
                    ...blog,
                    _id: blog._id.toHexString(),
                    authors: blog.authors.map(author => {
                        return {
                            ...author,
                            _id: author._id.toHexString(),
                        }
                    })
                }
            })
        };
    }
    else if (data.target === APIControl.Featured.Get.Target.GAME ||
        data.target === APIControl.Featured.Get.Target.GRAPHICS ||
        data.target === APIControl.Featured.Get.Target.RND
    ) {
        const featuredProject = await projectRepository.findAllExportable({
            _id: {
                $in: featured.map(featured => featured.contentId)
            }
        });

        return {
            success: true,
            data: featuredProject.map(project => {
                return {
                    ...project,
                    _id: project._id.toHexString(),
                    authors: project.authors.map(author => {
                        return {
                            ...author,
                            _id: author._id.toHexString(),
                        }
                    })
                }
            }),
        };
    }

    throw new AppError(
        "APIControl.Featured.Get.TARGET is something other than BLOG, GAME, GRAPHICS, AND RND",
        { data, session }
    );
};

const getRecent: ServiceSignature<
    SDIn.Featured.GetRecent,
    SDOut.Featured.GetRecent,
    false
> = async (_data, _session) => {
    const recentFeatured = await featuredRepository.findRecent(5);

    const featuredBlogsId: Types.ObjectId[] = [];
    const featuredProjectsId: Types.ObjectId[] = [];

    recentFeatured.map(content => {
        content.contentType === EFeaturedType.BLOG
            ? featuredBlogsId.push(content.contentId)
            : featuredProjectsId.push(content.contentId);
    });

    const recentFeaturedContent: IRecentFeaturedContent[] = [];

    const featuredBlogs = await blogRepository.findAllOfListExportable({
        _id: {
            $in: featuredBlogsId
        }
    });

    featuredBlogs.forEach(blog => {
        recentFeaturedContent.push({
            _id: blog._id,
            type: "BLOG",
            title: blog.title,
            tags: blog.tags,
            coverImgMediaKey: blog.coverImgMediaKey,
            readUrl: "/blog/" + blog.slug
        });
    });

    const featuredProject = await projectRepository.findAll({
        _id: {
            $in: featuredProjectsId
        }
    });

    featuredProject.forEach(project => {
        const githubLink = project.links?.find(link => link.text.toLowerCase() === "github");
        const liveDemoLink = project.links?.find(link => link.text.toLowerCase() === "live-demo");

        recentFeaturedContent.push({
            _id: project._id,
            type: project.portfolio,
            title: project.title,
            tags: project.tags,
            coverImgMediaKey: project.coverImgMediaKey,
            githubLink: githubLink ? githubLink.url : null,
            liveDemoLink: liveDemoLink ? liveDemoLink.url : null
        });
    });

    return {
        success: true,
        data: recentFeaturedContent.map(content => {
            return {
                ...content,
                _id: content._id.toHexString()
            }
        })
    }
};

const create: ServiceSignature<
    SDIn.Featured.Create,
    SDOut.Featured.Create,
    true
> = async (data, session) => {
    if (!session.userRoles.includes(EUserRole.ADMIN)) {
        return {
            success: false,
            errorCode: ESECs.FORBIDDEN,
            errorMessage: "Only admin can add a featured content."
        }
    }

    const existingFeatured = await featuredRepository.findOne({
        contentId: data.contentId
    });
    if (existingFeatured) {
        return {
            success: false,
            errorCode: ESECs.ALREADY_FEATURED,
            errorMessage: "This content is already featured"
        }
    }

    await featuredRepository.insert({
        contentType: data.contentType,
        contentId: data.contentId,
    });

    return {
        success: true,
        data: {},
    };
};

const remove: ServiceSignature<
    SDIn.Featured.Remove,
    SDOut.Featured.Remove,
    true
> = async (data, session) => {
    const featured = await featuredRepository.findById(data._id);
    if (!featured) {
        return {
            success: false,
            errorCode: ESECs.FEATURED_NOT_FOUND,
            errorMessage: "Featured content not found.",
        };
    }

    if (!session.userRoles.includes(EUserRole.ADMIN)) {
        return {
            success: false,
            errorCode: ESECs.FORBIDDEN,
            errorMessage: "Only admin remove a featured content."
        }
    }

    await featuredRepository.removeById(data._id);

    return {
        success: true,
        data: {},
    };
};


const featuredServices = {
    get,
    create,
    remove
};


export default featuredServices;
