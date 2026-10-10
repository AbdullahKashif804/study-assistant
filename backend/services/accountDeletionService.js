const userModel = require("../models/Users");
const pendingSignupModel = require("../models/PendingSignup");
const ownedModels = [
  require("../models/Notes"),
  require("../models/Assignments"),
  require("../models/Projects"),
  require("../models/Courses"),
  require("../models/Quizzes"),
  require("../models/DailyTasks"),
  require("../models/todoTask"),
];
const { deleteFromCloudinary } = require("../utils/cloudinaryDelete");

function resourceKey(resource) {
  return JSON.stringify([resource.resourceType, resource.publicId]);
}

async function collectResources(user, session) {
  const resources = new Map();
  const add = (resource, fallback) => {
    if (!resource) return;
    if (!resource.publicId) {
      throw new Error("An uploaded file is missing its Cloudinary identifier");
    }
    if (!resource.resourceType && !fallback) {
      throw new Error("An uploaded file is missing its Cloudinary resource type");
    }
    const entry = {
      publicId: resource.publicId,
      resourceType: resource.resourceType || fallback,
    };
    resources.set(resourceKey(entry), entry);
  };

  add(user.profileImage, "image");
  // Keep queries sequential: parallel operations within a transaction are unsupported.
  for (const model of ownedModels) {
    let query = model.find({ user: user._id }).select("attachment");
    if (session) query = query.session(session);
    const records = await query;
    for (const record of records) add(record.attachment);
  }
  return resources;
}

async function deleteAccount(userId) {
  let user;
  // This first transaction verifies deployment support before any external deletion.
  // The durable flag preserves retryability and blocks fresh protected requests.
  await userModel.db.transaction(async (session) => {
    user = await userModel.findByIdAndUpdate(
      userId,
      { $set: { accountDeletionPending: true } },
      { new: true, session },
    );
    if (!user) throw new Error("User not found");
  });

  const resources = await collectResources(user);
  for (const resource of resources.values()) {
    const result = await deleteFromCloudinary(resource.publicId, resource.resourceType);
    // Already absent is safe on retries after a partial external cleanup.
    if (result?.result !== "ok" && result?.result !== "not found") {
      throw new Error("Cloudinary did not confirm file deletion");
    }
  }

  await userModel.db.transaction(async (session) => {
    const currentUser = await userModel.findById(userId).session(session);
    if (!currentUser) throw new Error("User not found");
    const currentResources = await collectResources(currentUser, session);
    for (const key of currentResources.keys()) {
      if (!resources.has(key)) {
        throw new Error("An upload changed during deletion; retry cleanup");
      }
    }

    for (const model of ownedModels) {
      await model.deleteMany({ user: userId }, { session });
    }
    // Pending signup has no user reference; use the authenticated account's stored email.
    await pendingSignupModel.deleteMany({ email: currentUser.email }, { session });
    await userModel.deleteOne({ _id: userId }, { session });
  });
}

module.exports = { deleteAccount };
