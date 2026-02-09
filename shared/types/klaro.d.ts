// types/klaro.d.ts

declare module "klaro/dist/klaro-no-css" {
    const klaro: {
        setup: (config: unknown) => void;
        show?: () => void;
        hide?: () => void;
    };
    export default klaro;
}