import Offer from "../models/Offer.js";
import Application from "../models/Application.js";

// GET /api/dashboard/recruiter
export const recruiterDashboard = async (req, res, next) => {
  try {
    const offers = await Offer.find({ recruiter: req.user._id });
    const offerIds = offers.map((o) => o._id);

    const [
      totalOffers,
      activeOffers,
      totalApplications,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
      totalViews,
      recentApplications,
      applicationsByStatus,
      topOffers,
      applicationsByMonth,
    ] = await Promise.all([
      Offer.countDocuments({ recruiter: req.user._id }),
      Offer.countDocuments({ recruiter: req.user._id, status: "active" }),
      Application.countDocuments({ recruiter: req.user._id }),
      Application.countDocuments({ recruiter: req.user._id, status: "pending" }),
      Application.countDocuments({ recruiter: req.user._id, status: "accepted" }),
      Application.countDocuments({ recruiter: req.user._id, status: "rejected" }),
      offers.reduce((sum, o) => sum + (o.views || 0), 0),
      Application.find({ recruiter: req.user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("candidate", "firstName lastName avatarUrl title")
        .populate("offer", "title"),
      Application.aggregate([
        { $match: { recruiter: req.user._id } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Application.aggregate([
        { $match: { recruiter: req.user._id } },
        { $group: { _id: "$offer", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: "offers", localField: "_id", foreignField: "_id", as: "offer" } },
        { $unwind: "$offer" },
        { $project: { "offer.title": 1, "offer.company": 1, count: 1 } },
      ]),
      // Candidatures reçues par mois (12 derniers points) — pour les graphiques
      Application.aggregate([
        { $match: { recruiter: req.user._id } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 12 },
      ]),
    ]);

    // Vues par offre (les 6 offres les plus vues) — calculé à partir des offres déjà chargées
    const viewsByOffer = [...offers]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 6)
      .map((o) => ({
        _id: o._id,
        title: o.title,
        views: o.views || 0,
        status: o.status,
      }));

    res.json({
      stats: {
        totalOffers,
        activeOffers,
        totalApplications,
        pendingApplications,
        acceptedApplications,
        rejectedApplications,
        totalViews,
      },
      recentApplications,
      applicationsByStatus: applicationsByStatus.reduce((acc, s) => {
        acc[s._id] = s.count;
        return acc;
      }, {}),
      topOffers,
      applicationsByMonth,
      viewsByOffer,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/jobseeker
export const jobseekerDashboard = async (req, res, next) => {
  try {
    const [
      totalApplications,
      pending,
      reviewed,
      accepted,
      rejected,
      recentApplications,
      applicationsByStatus,
      applicationsByMonth,
    ] = await Promise.all([
      Application.countDocuments({ candidate: req.user._id }),
      Application.countDocuments({ candidate: req.user._id, status: "pending" }),
      Application.countDocuments({ candidate: req.user._id, status: "reviewed" }),
      Application.countDocuments({ candidate: req.user._id, status: "accepted" }),
      Application.countDocuments({ candidate: req.user._id, status: "rejected" }),
      Application.find({ candidate: req.user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("offer", "title company location type"),
      Application.aggregate([
        { $match: { candidate: req.user._id } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Application.aggregate([
        { $match: { candidate: req.user._id } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 12 },
      ]),
    ]);

    res.json({
      stats: {
        totalApplications,
        pending,
        reviewed,
        accepted,
        rejected,
      },
      recentApplications,
      applicationsByStatus: applicationsByStatus.reduce((acc, s) => {
        acc[s._id] = s.count;
        return acc;
      }, {}),
      applicationsByMonth,
    });
  } catch (err) {
    next(err);
  }
};
