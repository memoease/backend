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
      for (const memberEmail of members) {
        // Email options
        const mailOptions = {
          email: memberEmail,
          subject: `You have been invited to join a Memoease-Group by ${currentUser.email}`,
          message: `${currentUser.email} would like to share a Memoease-Set with you and has invited you to the Group ${name}. Click on the link: ${link} and register or log in to access the set.`,
        };
        // Send the confirmation email to the member
        await sendEmail(mailOptions);
      }
    }

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
