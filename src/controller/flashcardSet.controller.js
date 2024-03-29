import { createNewCard, deleteCardByCardId, deleteManyCardsById, updateCardInfo } from "../model/flashcard.model.js";
import { createNewSet, findPublicSets, deleteCardFromSet, getSetBySetId, getSetsByUserId, updateSetBySetId, getSetByCardId, deleteSet, findPublicSetsExcludeUser } from "../model/flashcardSet.model.js";
import { getSessionById } from "../model/learnSession.model.js";


export async function postNewCard(req, res, next) {
    try {
        const set = req.set;

        const entry = await createNewCard(req.body);
        set.flashcards = set.flashcards.concat(entry._id);
        const result = await set.save();
        if (set.session) {
            const session = await getSessionById(set.session);
            session.toLearn = session.toLearn.concat(entry._id);
            await session.save();
        }
        res.status(201).send(result);

    } catch (error) {
        console.error(error.message);
        next(error.message);
    };
};

export async function deleteCard(req, res, next) {
    const { cardId } = req.params;
    try {
        const set = await deleteCardFromSet(cardId);
        await deleteCardByCardId(cardId);
        res.status(200).send(set);
    } catch (error) {
        console.error(error);
        next(error);
    };
};

export async function updateCard(req, res, next) {
    const { cardId } = req.params;
    try {
        const newCard = await updateCardInfo(cardId, req.body);
        res.status(200).send(newCard);
    } catch (error) {
        console.error(error);
        next(error);
    };
};

export async function postNewSet(req, res, next) {
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
        next(error);
    };
};

export async function postNewSetFromPublicSet(req, res, next) {
    try {
        const { setId } = req.params;
        const userId = req.user.id;

        const copySet = await getSetBySetId(setId);

        const copiedCards = await Promise.all(copySet.flashcards.map(async flashcard => {
            const newCard = {
                question: flashcard.question,
                answer: flashcard.answer,
                createdBy: userId
            };

            return await createNewCard(newCard);

        }));

        const newEntry = {
            title: copySet.title,
            description: copySet.description,
            flashcards: copiedCards,
            createdBy: userId,
            isPublic: false
        };

        const entry = await createNewSet(newEntry);

        res.status(201).send(entry);

    } catch (error) {
        console.error(error);
        next(error);
    }
}

export async function deleteSetAndCards(req, res, next) {
    const { setId } = req.params;
    const set = req.set;
    try {
        await deleteManyCardsById(set.flashcards);
        const response = await deleteSet(setId);
        res.status(200).send(response);
    } catch (error) {
        console.error(error);
        next(error);
    };
};

export async function getSetsByUser(req, res, next) {
    const userId = req.user.id;

    try {
        const userSets = await getSetsByUserId(userId);
        res.status(200).send(userSets);
    } catch (error) {
        console.error(error);
        next(error);
    };
};

export async function getOneSetBySetId(req, res, next) {
    const { setId } = req.params;

    try {
        const set = await getSetBySetId(setId);
        res.status(200).send(set);
    } catch (error) {
        console.error(error);
        next(error);
    };
};

export async function updateSetInfo(req, res, next) {
    const { setId } = req.params;
    const data = req.body;

    try {
        const updatedSet = await updateSetBySetId(setId, data);
        res.status(200).send(updatedSet);
    } catch (error) {
        console.error(error);
        next(error);
    };
};

export async function getRandomPublicSets(req, res, next) {
    try {
        const publicSets = await findPublicSets();
        res.status(200).send(publicSets);
    } catch (error) {
        console.error(error);
        next(error);
    };
};

export async function getRandomPublicSetsExcludeUser(req, res, next) {
    try {
        const userId = req.user.id;
        const publicSets = await findPublicSetsExcludeUser(userId);
        res.status(200).send(publicSets);
    } catch (error) {
        console.error(error);
        next(error);
    };
};