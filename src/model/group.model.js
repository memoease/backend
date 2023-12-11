import { Schema, model } from "mongoose";

// Group model for creating groups to share content privately.
const groupSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  admin: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  flashcardSet: {
    type: Schema.Types.ObjectId,
    ref: "FlashcardSet",
    requrired: true,
  },
});

const Group = model("Group", groupSchema);

export default Group;

// Database communication separate from business logic, which is defined in controllers.

// Group
// Create Group
export async function createGroup(groupData) {
  const newGroup = new Group(groupData);
  return newGroup.save();
};

// Create Group with Members
export async function createGroupWithMemberIds(groupData, memberIds) {
  const newGroup = new Group(groupData);
  newGroup.members = memberIds;
  return newGroup.save();
};

// Get Group by Group-Id
export async function getGroupById(groupId) {
  return Group.findById(groupId);
};

// Get All Groups by User
export async function getUserGroups(userId) {
  return Group.find({ $or: [{ admin: userId }, { members: userId }] });
};

// Update Group
export async function updateGroupById(groupId, updatedGroupData) {
  const updatedGroup = await Group.findByIdAndUpdate(
    groupId,
    updatedGroupData,
    { new: true }
  );
  return updatedGroup;
};

// Delete Group
export async function deleteGroupById(groupId) {
  return Group.findByIdAndDelete(groupId);
};
