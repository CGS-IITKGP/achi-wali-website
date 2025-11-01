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
    return key ? "https://res.cloudinary.com/dexgzhyzp/image/upload/" + key : "/default-fallback-image.png"
}

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
