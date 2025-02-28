const { client } = require("./subscription");
const db = require("../models/index");

async function checkUserSubscription(studentId, userId) {
  //userId = parent id
  try {
    if (userId && studentId) {
      // console.log(`Student ID -> ${studentId}`);
      // console.log(`Parent ID -> ${userId}`);
      const strStudentId = studentId.toString();
      const isFreeTrail = await db.FreeTrail.findOne({
        where: {
          UserID: userId,
          freeTrialLeft: {
            [db.Sequelize.Op.gt]: 0,
          },
        },
      });
      // console.log(isFreeTrail);

      if (isFreeTrail) {
        await client.set(strStudentId, "1", {
          EX: 86400, // For a day 86400 sec
          NX: true,
        });
      } else {
        const isSubscribedParent = await db.Subscription.findOne({
          where: {
            ParentID: userId,
            SubscriptionStatus: 1,
          },
        });
        // console.log(isSubscribedParent);
        if (isSubscribedParent) {
          await client.set(strStudentId, "1", {
            EX: 86400, // For a day 86400 sec
            NX: true,
          });
        } else {
          const parentExist = await db.user.findByPk(userId);
          if (parentExist && parentExist.CompanyID != 0) {
            const isSubscribedCompany = await db.Subscription.findOne({
              where: {
                CompanyID: parentExist.CompanyID,
                SubscriptionStatus: 1,
              },
            });
            // console.log(isSubscribedCompany);
            if (isSubscribedCompany) {
              await client.set(strStudentId, "1", {
                EX: 86400, // For a day 86400 sec
                NX: true,
              });
            }
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = checkUserSubscription;
