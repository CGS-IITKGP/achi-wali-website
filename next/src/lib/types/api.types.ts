/* eslint-disable @typescript-eslint/no-namespace */

export namespace APIControl {
    export namespace Auth {
        export namespace SignUp {
            export enum Target {
                REQUEST = 'request',
                RESEND_OTP = 'resend_otp',
                VERIFY = "verify",
            }
        }
    }

    export namespace Team {
        export namespace Get {
            export enum Target {
                ONE = "one",
                ALL = "all",
            }
        }

        export namespace EditMembers {
            export enum Target {
                ADD = "add",
                REMOVE = "remove"
            }
        }
    }

    export namespace User {
        export namespace Get {
            export enum Target {
                RESTRICTED = "restricted",
                UNRESTRICTED = "unrestricted",
                ALL = "all",
            }
        }
    }

    export namespace Project {
        export namespace Get {
            export enum Target {
                ALL = "all",
                ALL_AS_LIST = "all_as_list",
                MY = "my",
            }

            export enum Portfolio {
                ANY = "any",
                GAME = "game",
                GRAPHICS = "graphics",
                RND = "rnd",
            }
        }
    }

    export namespace Blog {
        export namespace Get {
            export enum Target {
                ALL = "all",
                ALL_AS_LIST = "all_as_list",
                MY = "my",
                BY_SLUG = "by_slug"
            }
        }
    }

    export namespace Featured {
        export namespace Get {
            export enum Target {
                HIGHLIGHT = "highlight",
                ALL_AS_LIST = "all_as_list",
                BLOG = "blog",
                GAME = "game",
                GRAPHICS = "graphics",
                RND = "rnd"
            }
        }
    }
}

/* eslint-enable @typescript-eslint/no-namespace */
