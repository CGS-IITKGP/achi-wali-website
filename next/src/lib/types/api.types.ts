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
                MY = "my",
                BY_SLUG = "by_slug"
            }
        }
    }

    export namespace Featured {
        export namespace Get {
            export enum Target {
                RECENT = "recent",
                BLOG = "blog",
                GAME = "game",
                GRAPHICS = "graphics",
                RND = "rnd"
            }
        }
    }
}

/* eslint-enable @typescript-eslint/no-namespace */
