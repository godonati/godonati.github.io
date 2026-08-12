import {
    OrbitLogo
} from "./orbit-logo.js";


document
    .querySelectorAll(
        "[data-orbit-logo]"
    )
    .forEach(
        element => {

            new OrbitLogo(
                element
            );

        }
    );