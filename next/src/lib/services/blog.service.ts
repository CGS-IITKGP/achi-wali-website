import blogRepository from "../database/repos/blog.repo";
import {
    ESECs,
    ServiceSignature,
    EUserRole,
    SDOut,
    SDIn,
    APIControl,
    IBlogOfListExportable,
} from "@/lib/types/index.types";
import AppError from "../utils/error";

const get: ServiceSignature<
    SDIn.Blog.Get,
    SDOut.Blog.Get,
    false
> = async (data, session) => {
    if (data.target === APIControl.Blog.Get.Target.ALL_AS_LIST) {
        return await getAsList({}, null);
    }

    if (data.target === APIControl.Blog.Get.Target.BY_SLUG) {
        const blog = await blogRepository.findExportable({ slug: data.slug });
        if (!blog) {
            return {
                success: false,
                errorCode: ESECs.SLUG_NOT_FOUND,
                errorMessage: "Couldn't find this slug."
            }
        }

        return {
            success: true,
            data: {
                ...blog,
                _id: blog._id.toHexString(),
                author: {
                    ...blog.author,
                    _id: blog.author._id.toHexString(),
                },
                collaborators: blog.collaborators.map(collaborator => {
                    return {
                        ...collaborator,
                        _id: collaborator._id.toHexString(),
                    }
                })
            }
        }
    }

    let blogs: IBlogOfListExportable[];

    if (data.target === APIControl.Blog.Get.Target.MY) {
        if (session === null) {
            return {
                success: false,
                errorCode: ESECs.UNAUTHORIZED,
                errorMessage: "Must be signed-in to see your projects."
            }
        }

        blogs = await blogRepository.findAllOfListExportable({
            author: session.userId
        });
    }
    else if (data.target === APIControl.Blog.Get.Target.ALL) {
        blogs = await blogRepository.findAllOfListExportable();
    }
    else {
        throw new AppError(
            "APIControl.Blog.Get is something other than MY, ALL, and BY_SLUG",
            { data, session }
        );
    }

    return {
        success: true,
        data: blogs.map(blog => {
            return {
                ...blog,
                _id: blog._id.toHexString(),
                author: {
                    ...blog.author,
                    _id: blog.author._id.toHexString(),
                },
                collaborators: blog.collaborators.map(collaborator => {
                    return {
                        ...collaborator,
                        _id: collaborator._id.toHexString(),
                    }
                })
            }
        })
    }
};

const getAsList: ServiceSignature<
    SDIn.Blog.GetAsList,
    SDOut.Blog.GetAsList,
    false
> = async (_data, _session) => {
    const blogs = await blogRepository.findAllExportable();

    return {
        success: true,
        data: blogs.map((blog) => {
            return {
                _id: blog._id.toHexString(),
                title: blog.title
            };
        }),
    };
};


const create: ServiceSignature<
    SDIn.Blog.Create,
    SDOut.Blog.Create,
    true
> = async (data, session) => {
    if (!session.userRoles.includes(EUserRole.MEMBER)) {
        return {
            success: false,
            errorCode: ESECs.FORBIDDEN,
            errorMessage: "Only members can create a new blog."
        }
    }

    const existingBlog = await blogRepository.findOne({ slug: data.slug });
    if (existingBlog) {
        return {
            success: false,
            errorCode: ESECs.SLUG_ALREADY_IN_USE,
            errorMessage: "Blog with the same slug already exists. Use another slug."
        }
    }

    await blogRepository.insert({
        title: data.title,
        slug: data.slug,
        content: data.content,
        tags: data.tags,
        author: session.userId,
        coverImgMediaKey: null,
    });

    return {
        success: true,
        data: {},
    };
};

const update: ServiceSignature<
    SDIn.Blog.Update,
    SDOut.Blog.Update,
    true
> = async (data, session) => {
    const blog = await blogRepository.findById(data._id);
    if (!blog) {
        return {
            success: false,
            errorCode: ESECs.PROJECT_NOT_FOUND,
            errorMessage: "Project not found;",
        };
    }

    if (!session.userRoles.includes(EUserRole.ADMIN) &&
        !(blog.author._id.toHexString() === session.userId.toHexString())) {
        return {
            success: false,
            errorCode: ESECs.FORBIDDEN,
            errorMessage: "Only admin or author can remove a blog."
        }
    }

    const { _id, ...updateDoc } = data;

    await blogRepository.updateById(data._id, updateDoc);

    return {
        success: true,
        data: {},
    };
};

const remove: ServiceSignature<
    SDIn.Blog.Remove,
    SDOut.Blog.Remove,
    true
> = async (data, session) => {
    const blog = await blogRepository.findById(data._id);
    if (!blog) {
        return {
            success: false,
            errorCode: ESECs.BLOG_NOT_FOUND,
            errorMessage: "Blog not found.",
        };
    }

    if (!session.userRoles.includes(EUserRole.ADMIN) &&
        !(blog.author._id.toHexString() === session.userId.toHexString())) {
        return {
            success: false,
            errorCode: ESECs.FORBIDDEN,
            errorMessage: "Only admin or author can remove a blog."
        }
    }

    await blogRepository.removeById(data._id);

    return {
        success: true,
        data: {},
    };
};


const blogServices = {
    get,
    create,
    update,
    remove
};


export default blogServices;
