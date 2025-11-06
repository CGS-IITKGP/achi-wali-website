import { EUserRole } from "../types/domain.types";

const prettyDate = (input: string | Date): string => {
    const date = new Date(input);
    if (isNaN(date.getTime())) return 'Invalid date';

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

const prettyShortName = (input: string) => {
    return input.split(" ").map(n => n[0]).join(".") + ".";
}

const prettyDescription = (text: string, max = 60): string => {
    return text.length > max ? text.slice(0, max) + "..." : text;
}

const prettySafeImage = (key: string | null): string => {
    if (!key) return "/default-fallback-image.png";
    const isUrl = /^https?:\/\//i.test(key);
    return isUrl ? key :
        `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${key}`;
};

const prettyRolePriority = [
    EUserRole.ROOT,
    EUserRole.ADMIN,
    EUserRole.MEMBER,
    EUserRole.GUEST
];

const prettyHighestRole = (roles: EUserRole[]): EUserRole => {
    return roles.sort(
        (a, b) => prettyRolePriority.indexOf(a) - prettyRolePriority.indexOf(b)
    )[0];
};

export {
    prettyDate,
    prettyShortName,
    prettyDescription,
    prettySafeImage,
    prettyHighestRole
};
