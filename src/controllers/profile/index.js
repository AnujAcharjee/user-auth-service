import { getProfile } from "./get.controller.js";
import { updateProfile } from "./update.controller.js";
import { deleteProfile } from "./delete.controller.js";
import { search } from "./search.controller.js";
import { getBasicProfile } from "./getBasic.controller.js";
import { getFNG } from "./getFNG.controller.js"

export {
    getProfile, getBasicProfile, getFNG,
    updateProfile,
    deleteProfile,
    search
};