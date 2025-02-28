const db = require("../models/index");
const cron = require("node-cron");


//Cron job to handle subscription days
async function decreaseTheSubscriptions() {
  try {
    await db.FreeTrail.update(
      {
        freeTrialLeft: db.sequelize.literal("freeTrialLeft - 1"),
      },
      {
        where: {
          freeTrialLeft: {
            [db.Sequelize.Op.gt]: 0
          },
        },
      }
    );

    console.log(`Trial dates renewed!`);
  } catch (error) {
    console.log(`Subscription Cron Job warning! Issue type -> *** Major ***`);
    console.log(error);
  }
}

// Cron job to remove email invite cool down
async function removeUserFromEmailInvite() {
  try {
    await db.freezeInvite.destroy({
      truncate: true
    });

  } catch (error) {
    console.log(error);
  }
}

//If any other cron job needed write the logic below and add it to motherCronFunction pipe line


// Mother function for calling all cron job
async function motherCronFunction() {
  await decreaseTheSubscriptions(); 
  await removeUserFromEmailInvite();
}
// ----->

// Calling all the cron jobs on 22 hours ie 10 pm
cron.schedule("0 22 * * *", motherCronFunction);

// //Calling cron job on 10 min
// cron.schedule('*/10 * * * *', removeUserFromEmailInvite);
