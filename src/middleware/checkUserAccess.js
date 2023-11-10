// check if user id from token is equal to user id from cardset
import { getSetBySetId } from "../model/flashcardSet.model.js";

export async function checkUserAccess(req, res, next) {
    const { setId } = req.params;
    const id = req.user.id;
    try {
        const set = await getSetBySetId(setId);
        req.set = set;
        if (id !== set.createdBy.toString()) {
            res.status(403).end();
        };

        next();
    } catch (error) {
        console.error(error);
        res.status(500).end();
    };
};