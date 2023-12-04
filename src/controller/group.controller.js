import * as GroupModel from "../model/group.model.js";
import * as UserModel from "../model/user.model.js";
import nodemailer from "nodemailer";

// Send Email
export async function sendEmail(options) {
  // Create a transporter object
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Define email options
  const mailOptions = {
    from: `"memoease" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // Send email
  await transporter.sendMail(mailOptions);
}

// Create Group (set creator as admin and add members if provided)
export async function createGroup(req, res, next) {
  const { name, members } = req.body;
  const userId = req.user.id;
  const flashcardSetId = req.params.flashcardSetId;

  try {
    // Check if the current user exists
    const currentUser = await UserModel.getUserById(userId);

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create group information
    const groupData = {
      name,
      admin: userId,
      flashcardSet: flashcardSetId,
    };

    // Create the group in the database
    const newGroup = await GroupModel.createGroup(groupData);

    // Generate the link
    const link = `${process.env.HOMEPAGE_URL}/group/${newGroup._id}/set/${flashcardSetId}`;

    // Send emails to members (if provided)
    if (members && Array.isArray(members) && members.length > 0) {
      // member validation
      const validMembers = [];
      for (const memberId of members) {
        const member = await getUserById(memberId);
        if (member) {
          validMembers.push(memberId);
        }
      };

      if (validMembers.length !== members.length) {
        return res
          .status(400)
          .json({ error: "One or more members are invalid users." });
      };

      // Respond with the link
      res.status(201).json({
        newGroup,
        link,
      });
    } catch (error) {
      // Pass the error to the next middleware
      next(error);
    }
  }

// Function to add the user to the group
export async function pushUserToGroup(req, res, next) {
    const { groupId } = req.body;
    const userId = req.user.id; // Assumption: The user is logged in through authentication

    try {
      // Retrieve group information from the database
      const currentGroup = await GroupModel.getGroupById(groupId);

      if (!currentGroup) {
        return res.status(404).json({ error: "Group not found" });
      }

      groupData.members = memberIds;
    };

    // Save the updated group to the database
    const updatedGroup = await GroupModel.updateGroupById(
      groupId,
      currentGroup
    );

    // Optional: Send a confirmation email to the user
    const user = await UserModel.getUserById(userId);
    if (user) {
      const mailOptions = {
        email: user.email,
        subject: `You have been added to a Memoease-Group`,
        message: `You have been added to the group ${currentGroup.name}.`,
      };
      await sendEmail(mailOptions);
    }

    // Send a confirmation back
    res.status(200).json({ message: "User added to the group successfully" });
  } catch (error) {
    // Error handling
    next(error);
  };
};

// Get all User Groups
export async function getGroupsByUser(req, res, next) {
  const userId = req.user.id;

  try {
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    };

    const userGroups = await GroupModel.getUserGroups(userId);

    res.status(200).json(userGroups);
  } catch (error) {
    next(error);
  };
};

// Update group (admins only)
export async function updateGroup(req, res, next) {
  const groupId = req.params.id;
  const updates = req.body;
  const userId = req.user.id;

  try {
    const currentGroup = await GroupModel.getGroupById(groupId);

    if (!currentGroup) {
      return res.status(404).json({ error: "Group not found" });
    };

    if (currentGroup.admin.includes(userId)) {
      // Check if the current user is an admin of the group
      if (updates.name) {
        currentGroup.name = updates.name;
      };
      if (updates.members) {
        currentGroup.members = updates.members;
      };

      const updatedGroup = await GroupModel.updateGroupById(
        groupId,
        currentGroup
      );
      res.status(200).json(updatedGroup);
    } else {
      // If the current user is not an admin, respond with a 403 error
      return res.status(403).json({ error: "Permission denied" });
    };
  } catch (error) {
    next(error);
  };
};

// Delete Group (admins only)
export async function deleteGroup(req, res, next) {
  const groupId = req.params.id;
  const userId = req.user.id;

  try {
    const currentGroup = await GroupModel.getGroupById(groupId);

    if (!currentGroup) {
      return res.status(404).json({ error: "Group not found" });
    };

    if (currentGroup.admin.includes(userId)) {
      // Check if the current user is an admin of the group
      const deletedGroup = await GroupModel.deleteGroupById(groupId);

      if (!deletedGroup) {
        return res.status(404).json({ error: "Group not found" });
      };

      res.status(204).send();
    } else {
      // If the current user is not an admin, respond with a 403 error
      return res.status(403).json({ error: "Permission denied" });
    };
  } catch (error) {
    next(error);
  };
};
