import { createNewCard, deleteCardByCardId } from "../model/flashcard.model.js";
import { createNewSet, findPublicSets, deleteCardFromSet, getSetBySetId, getSetsByUserId, updateSetBySetId } from "../model/flashcardSet.model.js";


export async function postNewSet(req, res) {
    try {
        const userId = req.user.id;
        const newEntry = {
            ...req.body,
            createdBy: userId,
        };

        const entry = await createNewSet(newEntry);

        res.status(201).send(entry);

    } catch (error) {
        console.error(error);
        res.status(500).end();
    };
};

export async function postNewCard(req, res) {
    try {
        const { setId } = req.params;
        const id = req.user.id;

        const set = await getSetBySetId(setId);

        if (id === set.createdBy.toString()) {
            const entry = await createNewCard(req.body);
            set.flashcards = set.flashcards.concat(entry._id);
            const result = await set.save();
            res.status(201).send(result);
        } else {
            throw new Error("Unauthorized")
        }
    } catch (error) {
        console.error(error);
        res.status(400).end()
    };
};

export async function deleteCard(req, res) {
    const { cardId } = req.params;
    try {
        const set = await deleteCardFromSet(cardId);
        await deleteCardByCardId(cardId);
        res.status(200).send(set);
    } catch (error) {
        console.error(error);
        res.status(500).end();
    };
};

export async function getSetsByUser(req, res) {
    const userId = req.user.id;

    try {
        const userSets = await getSetsByUserId(userId);
        res.status(200).send(userSets);
    } catch (error) {
        console.error(error);
        res.status(500).end();
    };
};

export async function getOneSetBySetId(req, res) {
    const { setId } = req.params;

    try {
        const set = await getSetBySetId(setId);
        res.status(200).send(set);
    } catch (error) {
        console.error(error);
        res.status(500).end();
    };
};

export async function updateSetInfo(req, res) {
    const { setId } = req.params;
    const data = req.body;

    try {
        const updatedSet = await updateSetBySetId(setId, data);
        res.status(200).send(updatedSet);
    } catch (error) {
        console.error(error);
        res.status(500).end();
    };
};

export async function getRandomPublicSets(req, res) {
    try {
        const publicSets = await findPublicSets();
        res.status(200).send(publicSets);
    } catch (error) {
        console.error(error);
        res.status(500).end();
    };
};