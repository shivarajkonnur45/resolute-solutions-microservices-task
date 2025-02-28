const db = require("../models/index");

async function getSubscriptionStatus(req, res) {
  try {
    const { AccDetails } = req;
    if (!AccDetails || !AccDetails.UserID) {
      return res.status(400).json({
        message: "Invalid Token! Login Again"
      })
    }

    const subscriptionData = await db.Subscription.findOne({
      where: { SubscriptionStatus: 1, CompanyID: AccDetails.UserID },
      attributes: ['SubscriptionIDStripe', 'SubscriptionID', 'CompanyID', 'Plan', 'Amount', 'PlanStartDate', 'PlanEndDate', 'SubscriptionStatus', 'PlanID', 'StripeCustomerID']
    });

    if (!subscriptionData) {
      const parentToCompany = await db.Subscription.findOne({
        where: { ParentID: AccDetails.UserID, SubscriptionStatus: 1 }
      });

      if (!parentToCompany) {
        return res.status(400).json({
          message: "You do not have valid subscription"
        })
      }

      return res.status(200).json({
        message: "Subscription status",
        subscribeTo: parentToCompany,
      });
    }

    return res.status(200).json({
      message: "Subscription status",
      subscribeTo: subscriptionData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was an server-side error",
    });
  }
}

async function getSubHttp(req, res) {
  try {
    const { parentId, studentId } = req.query;

    if (!parentId || !studentId) {
      return res.status(404).json({
        message: "Missing Queries",
      });
    }

    const isSub = await db.Subscription.findOne({
      where: { StudentID: studentId, ParentID: parentId },
    });

    if (!isSub) {
      return res.status(200).json({
        subStat: 0,
      });
    }

    return res.status(200).json({
      subId: isSub.SubscriptionID,
      subStat: 1,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was an server-side error",
    });
  }
}

// free trial subscription api

async function createFreeTrialHttp(req, res) {
  try {
    const { parentId } = req.query;

    await db.FreeTrail.create({
      UserID: parentId,
      LastModifiedBy: userName,
    });

    return res.status(200).json({
      message: "You have claimed your free trail!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was an server-side error",
    });
  }
}

//------->

async function plannerAddSubscriptionStatus(req, res) {
  try {
    const { AccDetails } = req;
    const { studentId } = req.query;

    if (!AccDetails || !AccDetails.UserID || !studentId) {
      return res.status(401).json({
        message: "Invalid Token! Login Again"
      })
    }

    const isFreeze = await db.freezeSub.findOne({
      where: { userId: AccDetails.UserID }
    });

    if (isFreeze) {
      return res.status(200).json({
        message: "You are currently under freeze! Wait until you are added.",
        SubscriptionStatus: 0,
        freezeStatus: 1
      })
    }

    const isSub = await db.Subscription.findOne({
      where: { ParentID: studentId, SubscriptionStatus: 1 } // Here i need to add op or
    });

    if (!isSub) {
      const isFree = await db.FreeTrail.findOne({
        where: {
          UserID: AccDetails.UserID,
          freeTrialLeft: {
            [db.Sequelize.Op.gt]: 0
          }
        }
      })

      if (!isFree) {
        return res.status(400).json({
          message: "You do not have any valid plans",
        })
      }

      return res.status(200).json({
        SubscriptionStatus: 1
      })

    }
    return res.status(200).json({
      SubscriptionStatus: 1
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was a server-side error",
    });
  }
}



module.exports = { getSubscriptionStatus, getSubHttp, createFreeTrialHttp, plannerAddSubscriptionStatus };
