import * as GroupModel from "../model/group.model.js";
import { getUserById } from "../model/user.model.js";

// Create Group (set creator as admin and add members if provided)
export async function createGroup(req, res, next) {
  const { name, members } = req.body;
  const userId = req.user.id;

  try {
    const currentUser = await getUserById(userId);

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const groupData = {
      name,
      admin: userId,
    };

    if (members && Array.isArray(members) && members.length > 0) {
      // member validation
      const validMembers = [];
      for (const memberId of members) {
        const member = await getUserById(memberId);
        if (member) {
          validMembers.push(memberId);
        }
      }

      if (validMembers.length !== members.length) {
        return res
          .status(400)
          .json({ error: "One or more members are invalid users." });
      }

      const memberIds = validMembers.map((memberId) => {
        return Types.ObjectId(memberId);
      });

      groupData.members = memberIds;
    }

    const newGroup = await GroupModel.createGroup(groupData);

    res.status(201).json(newGroup);
  } catch (error) {
    next(error);
  }
}

// Get all User Groups
export async function getGroupsByUser(req, res, next) {
  const userId = req.user.id;

  try {
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userGroups = await GroupModel.getUserGroups(userId);

    res.status(200).json(userGroups);
  } catch (error) {
    next(error);
  }
}

// Update group (admins only)
export async function updateGroup(req, res, next) {
  const groupId = req.params.id;
  const updates = req.body;
  const userId = req.user.id;

  try {
    const currentGroup = await GroupModel.getGroupById(groupId);

    if (!currentGroup) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (currentGroup.admin.includes(userId)) {
      // Check if the current user is an admin of the group
      if (updates.name) {
        currentGroup.name = updates.name;
      }
      if (updates.members) {
        currentGroup.members = updates.members;
      }

      const updatedGroup = await GroupModel.updateGroupById(
        groupId,
        currentGroup
      );
      res.status(200).json(updatedGroup);
    } else {
      // If the current user is not an admin, respond with a 403 error
      return res.status(403).json({ error: "Permission denied" });
    }
  } catch (error) {
    next(error);
  }
}

// Delete Group (admins only)
export async function deleteGroup(req, res, next) {
  const groupId = req.params.id;
  const userId = req.user.id;

  try {
    const currentGroup = await GroupModel.getGroupById(groupId);

    if (!currentGroup) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (currentGroup.admin.includes(userId)) {
      // Check if the current user is an admin of the group
      const deletedGroup = await GroupModel.deleteGroupById(groupId);

      if (!deletedGroup) {
        return res.status(404).json({ error: "Group not found" });
      }

      res.status(204).send();
    } else {
      // If the current user is not an admin, respond with a 403 error
      return res.status(403).json({ error: "Permission denied" });
    }
  } catch (error) {
    next(error);
  }
}
