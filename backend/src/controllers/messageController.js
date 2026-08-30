import { body, validationResult } from "express-validator";
import { Conversation, Message } from "../models/Message.js";
import Application from "../models/Application.js";

const PARTICIPANT_FIELDS = "firstName lastName role company title avatarUrl";

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
};

export const messageRules = [
  body("content").trim().notEmpty().isLength({ max: 2000 }),
];

// GET /api/messages/conversations
export const myConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .sort({ lastMessageAt: -1 })
      .populate("participants", PARTICIPANT_FIELDS)
      .populate("relatedApplication", "offer status");
    // Pour chaque conversation, récupérer dernier message + unread count
    const result = await Promise.all(
      conversations.map(async (c) => {
        const lastMsg = await Message.findOne({ conversation: c._id })
          .sort({ createdAt: -1 })
          .select("content sender createdAt");
        const unread = await Message.countDocuments({
          conversation: c._id,
          sender: { $ne: req.user._id },
          read: false,
        });
        return { ...c.toObject(), lastMessage: lastMsg, unreadCount: unread };
      })
    );
    res.json({ conversations: result });
  } catch (err) {
    next(err);
  }
};

// GET /api/messages/unread-count - total de messages non lus (badge navbar)
export const unreadCount = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id }).select("_id");
    const count = await Message.countDocuments({
      conversation: { $in: conversations.map((c) => c._id) },
      sender: { $ne: req.user._id },
      read: false,
    });
    res.json({ count });
  } catch (err) {
    next(err);
  }
};

// POST /api/messages/conversations - démarre ou récupère une conversation
export const startConversationRules = [
  body("participantId").notEmpty(),
];

export const startConversation = async (req, res, next) => {
  try {
    if (validate(req, res)) return;
    const { participantId, applicationId } = req.body;
    if (participantId === req.user._id.toString()) {
      return res.status(400).json({ message: "Impossible de discuter avec soi-même" });
    }
    let relatedApplication = null;
    if (applicationId) {
      const app = await Application.findById(applicationId);
      if (!app) return res.status(404).json({ message: "Candidature introuvable" });
      relatedApplication = app._id;
    }
    // Cherche conversation existante entre ces 2 users (+application éventuelle)
    let conv = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId], $size: 2 },
      ...(relatedApplication ? { relatedApplication } : { relatedApplication: null }),
    });
    if (!conv) {
      conv = await Conversation.create({
        participants: [req.user._id, participantId],
        relatedApplication,
      });
    }
    await conv.populate("participants", PARTICIPANT_FIELDS);
    res.status(201).json({ conversation: conv });
  } catch (err) {
    next(err);
  }
};

// GET /api/messages/conversations/:id
// ?since=<ISO date> permet de ne récupérer que les nouveaux messages (polling)
export const getMessages = async (req, res, next) => {
  try {
    const conv = await Conversation.findById(req.params.id)
      .populate("participants", PARTICIPANT_FIELDS)
      .populate("relatedApplication", "offer status");
    if (!conv) return res.status(404).json({ message: "Conversation introuvable" });
    if (!conv.participants.some((p) => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    const filter = { conversation: conv._id };
    if (req.query.since) {
      const since = new Date(req.query.since);
      if (!Number.isNaN(since.getTime())) filter.createdAt = { $gt: since };
    }

    const messages = await Message.find(filter)
      .sort({ createdAt: 1 })
      .populate("sender", "firstName lastName avatarUrl");

    // Marquer comme lus les messages reçus
    await Message.updateMany(
      { conversation: conv._id, sender: { $ne: req.user._id }, read: false },
      { $set: { read: true } }
    );

    res.json({ conversation: conv, messages });
  } catch (err) {
    next(err);
  }
};

// POST /api/messages/conversations/:id
export const sendMessage = async (req, res, next) => {
  try {
    if (validate(req, res)) return;
    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ message: "Conversation introuvable" });
    if (!conv.participants.some((p) => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: "Non autorisé" });
    }
    const message = await Message.create({
      conversation: conv._id,
      sender: req.user._id,
      content: req.body.content,
    });
    conv.lastMessageAt = new Date();
    await conv.save();
    await message.populate("sender", "firstName lastName avatarUrl");
    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
};
