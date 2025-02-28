// const jwt = require('jsonwebtoken');
const db = require("../models/index");
const Sequelize = require("sequelize");
const stripe = require("stripe")(process.env.Secretkey);
const cryptoJS = require("crypto-js");
const { Op } = require("sequelize");

const GetProduct = async (req, res) => {
  try {
    const product = await stripe.products.retrieve("prod_QJZ6rZmOja9UCw");
    if (product.default_price) {
      const priceDetails = await stripe.prices.retrieve(product.default_price);
      product.price_details = priceDetails;
    }
    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to Get By ID Subscription",
      error: error.message,
    });
  }
};

const GetProductCompany = async (req, res) => {
  try {
    const product = await stripe.products.retrieve("prod_Qa7HyyCR45dTwu");
    if (product.default_price) {
      const priceDetails = await stripe.prices.retrieve(product.default_price);
      product.price_details = priceDetails;
    }
    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to Get By ID Subscription",
      error: error.message,
    });
  }
};

//2 ---------------Get Subscription By ID--------------------//
const GetProductByID = async (req, res) => {
  try {
    const product = await stripe.products.retrieve(req.params.id);
    if (product.default_price) {
      const priceDetails = await stripe.prices.retrieve(product.default_price);
      product.price_details = priceDetails;
    }
    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to Get By ID Subscription",
      error: error.message,
    });
  }
};

//3 ---------------Create Customer--------------------//
const CreateCustomerRetrieve = async (req, res) => {
  try {
    const CustRetrieve = await stripe.customers.create({
      name: req.body.name,
      email: req.body.email,
      description: req.body.description,
    });

    const customer = await stripe.customers.retrieve(CustRetrieve.id);
    return res.status(200).json(customer);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to retrieve customer", error: error.message });
  }
};

const GetCustomer = async (req, res) => {
  try {
    const customers = await stripe.customers.list({});
    return res.status(200).json(customers);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to Get By ID Subscription",
      error: error.message,
    });
  }
};

//4 ---------------Create Payment Method--------------------//
const CreatePaymetMethod = async (req, res) => {
  const { products } = req.body;
  const StaticProduct = [
    {
      id: "prod_QL22I8u8BtDWdy",
      productname: "Starter",
      /*1 Product Image */
      imgdata:
        "https://b.zmtcdn.com/data/pictures/9/18857339/8f53919f1175c08cf0f0371b73704f9b_o2_featured_v2.jpg?output-format=webp",

      /*2 Adress */
      address: "North Indian, Biryani, Mughlai",

      /*3 Logo Image */
      //delimg: 'https://b.zmtcdn.com/data/o2_assets/0b07ef18234c6fdf9365ad1c274ae0631612687510.png?output-format=webp',

      /*4 Extra Data*/
      somedata: " 1175 + order placed from here recently",

      /*5 Price */
      price: 350,
      rating: "3.8",
      //arrimg: 'https://b.zmtcdn.com/data/o2_assets/4bf016f32f05d26242cea342f30d47a31595763089.png?output-format=webp',
      qnty: 1,
    },
  ];

  const lineItems = StaticProduct.map((product) => ({
    price_data: {
      currency: "inr",
      product_data: {
        name: product.productname,
        images: [product.imgdata],
      },
      unit_amount: product.price * 100,
    },
    quantity: product.qnty,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: "http://localhost:3001/sucess",
    cancel_url: "http://localhost:3001/cancel",
  });
  return res.json({ id: session.id });
};

const CreateSubscription = async (req, res) => {
  const { AccDetails } = req;
  var Cid = null;

  const bytesEmail = await cryptoJS.AES.decrypt(
    AccDetails.Email,
    process.env.SECRET
  );
  const DecryptedEmailID = await bytesEmail.toString(cryptoJS.enc.Utf8);

  const payment_method_token = req.body.payment_method_token;
  const PaymentMethodGet = req.body.payment_method_key;
  const Product_id = req.body.Product_id;

  var Student_id = req.body.Student_id;
  if (Student_id == 0) {
    Student_id = AccDetails.UserID;
  }

  const product = await stripe.products.retrieve(Product_id);
  if (product.default_price) {
    const priceDetails = await stripe.prices.retrieve(product.default_price);
    product.price_details = priceDetails;
  }

  // Payment End Date
  const today = new Date();

  const nextYear = new Date(today);
  nextYear.setFullYear(today.getFullYear() + 1);
  const formatDateYear = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);
  const formatDateMonth = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() returns 0-11, so add 1
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  var SubscriptionEnddate = "";
  if (product.price_details.recurring.interval == "month") {
    SubscriptionEnddate = formatDateMonth(nextMonth);
  } else if (product.price_details.recurring.interval == "year") {
    SubscriptionEnddate = formatDateYear(nextYear);
  }

  try {
    const StripeCustomerExist = await db.StripeCustomer.findOne({
      where: {
        SubscriptionStatus: 1,
        [Op.or]: [{ ParentID: Student_id }, { UserID: Student_id }],
      },
    });

    if (!StripeCustomerExist) {
      const StudentDetails = await db.user.findOne({
        where: { UserID: Student_id },
      });

      const bytesEmail = await cryptoJS.AES.decrypt(
        StudentDetails.Email,
        process.env.SECRET
      );
      const DecryptedEmailID = await bytesEmail.toString(cryptoJS.enc.Utf8);

      const CustRetrieve = await stripe.customers.create({
        name: StudentDetails.FirstName,
        email: DecryptedEmailID,
        //description: req.body.description
      });

      Cid = CustRetrieve.id;

      // console.log(CustRetrieve);

      if (AccDetails.AccountType == 2) {
        const StripeUser = await db.StripeCustomer.create({
          CreatedBy: req.AccDetails.FirstName + " " + req.AccDetails.LastName,
          StripeCustomerID: CustRetrieve.id,
          UserID: req.AccDetails.UserID,
          SubscriptionStatus: 1,
        });
      } else {
        const StripeUser = await db.StripeCustomer.create({
          StudentID: Student_id,
          CreatedBy: req.AccDetails.FirstName + " " + req.AccDetails.LastName,
          StripeCustomerID: CustRetrieve.id,
          ParentID: req.AccDetails.UserID,
          SubscriptionStatus: 1,
        });
      }

      // 1: Student, 2: Company, 3: Parent
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0"); // getMonth() returns 0-11, so add 1
      const day = String(today.getDate()).padStart(2, "0");

      const PlanStartDate = `${year}-${month}-${day}`;
      if (req.AccDetails.AccountType == 2) {
        const subscriptionCountForCompany = await db.user.findAll({
          where: { AccountType: "3", CompanyID: req.AccDetails.UserID },
        });

        await db.Subscription.create({
          StudentID: 0,
          CreatedBy: req.AccDetails.FirstName + " " + req.AccDetails.LastName,
          LastModifiedBy:
            req.AccDetails.FirstName + " " + req.AccDetails.LastName,
          StripeCustomerID: CustRetrieve.id,
          ParentID: 0, //This is UserID AS Parent
          // UserID:userData.UserID,
          SubscriptionStatus: 1,
          CompanyID: req.AccDetails.UserID, //This company added
          PlanID: Product_id,
          Plan: product.name,
          Amount: product.price_details.unit_amount / 100,
          PlanStartDate: PlanStartDate,
          PlanEndDate: SubscriptionEnddate,
          SubscriptionCount: subscriptionCountForCompany.length,
        });
      } else {
        const newUser = await db.Subscription.create({
          CreatedBy: req.AccDetails.FirstName + " " + req.AccDetails.LastName,
          LastModifiedBy:
            req.AccDetails.FirstName + " " + req.AccDetails.LastName,
          StripeCustomerID: CustRetrieve.id,
          ParentID: req.AccDetails.UserID,
          SubscriptionStatus: 1,
          CompanyID: 0,
          PlanID: Product_id,
          Plan: product.name,
          Amount: product.price_details.unit_amount / 100,
          PlanStartDate: PlanStartDate,
          PlanEndDate: SubscriptionEnddate,
        });
      }

      const customer = await stripe.customers.retrieve(CustRetrieve.id);
    }

    // 3 already exist then get student only
    let stripeId = null;

    if (AccDetails.AccountType == 2) {
      const StripeCustomer = await db.StripeCustomer.findOne({
        where: { UserID: Student_id },
      });

      stripeId = StripeCustomer.StripeCustomerID;
    } else {
      const StripeCustomer = await db.StripeCustomer.findOne({
        where: { StudentID: Student_id },
      });

      stripeId = StripeCustomer.StripeCustomerID;
    }

    var StripeCusID = stripeId;
    // Retrieve the existing customer
    const existingCustomer = await stripe.customers.retrieve(StripeCusID);

    let defaultPaymentMethod =
      existingCustomer.invoice_settings.default_payment_method;

    // If no default payment method, attach the provided payment method
    if (!defaultPaymentMethod && PaymentMethodGet) {
      const paymentMethod = await stripe.paymentMethods.attach(
        PaymentMethodGet,
        {
          customer: StripeCusID,
        }
      );

      // Set the newly added payment method as the default
      await stripe.customers.update(StripeCusID, {
        invoice_settings: {
          default_payment_method: paymentMethod.id,
        },
      });

      defaultPaymentMethod = paymentMethod.id;
    }

    if (!defaultPaymentMethod) {
      return res.status(400).json({
        message: "Customer has no default payment method attached",
        error: "Please add a default payment method to the customer",
      });
    }

    // Now create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: StripeCusID,
      items: [
        {
          price: product.default_price, // Replace with your price ID
        },
      ],
      payment_behavior: "default_incomplete",
      payment_settings: {
        payment_method_types: ["card"],
        payment_method_options: {
          card: {
            request_three_d_secure: "automatic",
          },
        },
      },
      default_payment_method: defaultPaymentMethod,
    });

    if (Cid !== null) {
      await db.StripeCustomer.update(
        { SubscriptionIDStripe: subscription.id },
        { where: { StripeCustomerID: Cid } }
      );
      await db.Subscription.update(
        { SubscriptionIDStripe: subscription.id },
        { where: { StripeCustomerID: Cid } }
      );
    }
    // Confirm the first invoice to finalize the subscription
    const invoice = await stripe.invoices.retrieve(subscription.latest_invoice);

    if (invoice.status === "open") {
      const paymentIntent = await stripe.paymentIntents.confirm(
        invoice.payment_intent,
        {
          return_url: "https://your-website.com/payment-return", // Replace with your return URL
        }
      );

      if (
        paymentIntent.status === "requires_action" ||
        paymentIntent.status === "requires_confirmation"
      ) {
        return res.status(200).json({
          message: "Payment requires additional actions",
          paymentIntent,
        });
      } else if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({
          message: "Payment failed",
          paymentIntent,
        });
      }
    }

    const updatedSubscription = await stripe.subscriptions.retrieve(
      subscription.id
    );

    return res.status(200).json(updatedSubscription);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add subscription",
      error: error.message,
    });
  }
};

//6--------------------Create Invoce --------------//
const CreateBilling = async (req, res) => {
  try {
    const StripeCustomer = await db.StripeCustomer.findOne({
      where: { StudentID: req.AccDetails.UserID },
    });
    if (StripeCustomer == null || StripeCustomer == "") {
      return res.status(400).json({ message: "Not Subscribed" });
    }

    var StripeCusID = StripeCustomer.StripeCustomerID;
    const invoice = await stripe.invoices.list({ customer: StripeCusID });
    return res.status(200).json(invoice);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to Get Billing", error: error.message });
  }
};

//7--------------------Create Invoce --------------//
const CreateInvoice = async (req, res) => {
  try {
    const { AccDetails } = req;
    if (!AccDetails || !AccDetails.UserID || !AccDetails.AccountType) {
      return res.status(400).json({
        message: "Invalid Token! Login Again",
      });
    }

    if (AccDetails.AccountType == 2) {
      const StripeCustomer = await db.Subscription.findOne({
        where: { CompanyID: AccDetails.UserID },
      });
      if (!StripeCustomer) {
        return res.status(400).json({ message: "Not Invoice found" });
      }
      var StripeCusID = StripeCustomer.StripeCustomerID;
      const invoice = await stripe.invoices.list({ customer: StripeCusID });
      return res.status(200).json(invoice);
    }

    const StripeCustomer = await db.Subscription.findOne({
      where: { ParentID: AccDetails.UserID },
    });
    if (!StripeCustomer) {
      return res.status(400).json({ message: "Not Invoice found" });
    }
    var StripeCusID = StripeCustomer.StripeCustomerID;
    const invoice = await stripe.invoices.list({ customer: StripeCusID });
    return res.status(200).json(invoice);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to Get Invoce", error: error.message });
  }
};

//8--------------------Update Qty--------------//
const UpdateQty = async (req, res) => {
  try {
    async function updateSubscriptionItemQuantity(
      subscriptionItemId,
      newQuantity
    ) {
      try {
        // Update the subscription item with the new quantity
        const updatedSubscriptionItem = await stripe.subscriptionItems.update(
          subscriptionItemId,
          {
            quantity: newQuantity,
          }
        );
        console.log(
          "Subscription item updated successfully:",
          updatedSubscriptionItem
        );
        return updatedSubscriptionItem;
      } catch (error) {
        console.error("Error updating subscription item:", error);
        throw error;
      }
    }

    // Example usage
    const subscriptionItemId = req.body.subscriptionItemId; // Replace with your subscription item ID
    const newQuantity = req.body.qty; // Replace with the new quantity you want to set

    updateSubscriptionItemQuantity(subscriptionItemId, newQuantity)
      .then((updatedItem) => {
        console.log("Updated subscription item:", updatedItem);
        return res.status(200).json({ message: "Updated subscription unit" });
      })
      .catch((error) => {
        console.error("Failed to update subscription item:", error);
        return res.status(500).json({
          message: "Failed to update subscription item",
          error: error.message,
        });
      });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to Get Invoce", error: error.message });
  }
};

//8--------------------Update Qty--------------//
const PauseSubscription = async (req, res) => {
  const subscriptionId = req.body.sub_subscriptionid; // Replace with your subscription ID
  const pay_collection = req.body.pay_collection;

  if (pay_collection == 0) {
    try {
      async function pauseSubscription(subscriptionId) {
        try {
          // Update the subscription to pause it
          const updatedSubscription = await stripe.subscriptions.update(
            subscriptionId,
            {
              pause_collection: {
                behavior: "keep_as_draft", // Options: 'keep_as_draft', 'mark_uncollectible', 'void'
              },
            }
          );

          console.log("Subscription paused successfully:", updatedSubscription);
          return updatedSubscription;
        } catch (error) {
          if (error.type === "StripeInvalidRequestError") {
            console.error("Invalid request error:", error.message);
            return res
              .status(500)
              .json({ message: "Invalid request error:", error });
          } else {
            console.error("Error pausing subscription:", error);
            res
              .status(500)
              .json({ message: "Error pausing subscription:", error });
          }
          throw error;
        }
      }

      // Example usage
      const subscriptionId = req.body.sub_subscriptionid; // Replace with your subscription ID

      pauseSubscription(subscriptionId)
        .then((updatedSubscription) => {
          console.log("Paused subscription:", updatedSubscription);
          return res.status(200).json({ message: "Paused subscription" });
        })
        .catch((error) => {
          console.error("Failed to pause subscription:", error);
          return res
            .status(500)
            .json({ message: "Failed to pause subscription:", error });
        });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Failed to Get Invoce", error: error.message });
    }
  } else {
    async function resumePaymentCollection(subscriptionId) {
      try {
        const subscription = await stripe.subscriptions.update(subscriptionId, {
          pause_collection: null, // Unpause the subscription
        });

        console.log("Payment collection resumed:", subscription);
        return res.status(500).json({ message: "update payment collection" });
      } catch (error) {
        console.error("Error resuming payment collection:", error);
        throw error;
      }
    }
    resumePaymentCollection(subscriptionId);
  }
};

const Subscriptionlist = async (req, res) => {
  try {
    const StripeCustomer = await db.StripeCustomer.findOne({
      where: { StudentID: req.AccDetails.UserID },
    });
    if (StripeCustomer == null || StripeCustomer == "") {
      return res.status(400).json({ message: "Not Subscribed" });
    }
    var StripeCusID = StripeCustomer.StripeCustomerID;

    const subscriptions = await stripe.subscriptions.list({
      customer: StripeCusID,
    });
    return res.status(200).json(subscriptions);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return res
      .status(500)
      .json({ message: "Failed to Get Subscriptions", error: error.message });
  }
};

const ActiveSubscriptionlist = async (req, res) => {
  try {
    const StripeCustomer = await db.StripeCustomer.findOne({
      where: { StudentID: req.AccDetails.UserID },
    });
    if (StripeCustomer == null || StripeCustomer == "") {
      return res.status(400).json({ message: "Not Subscribed" });
    }
    const StripeCusID = StripeCustomer.StripeCustomerID;

    const subscriptions = await stripe.subscriptions.list({
      customer: StripeCusID,
    });

    if (subscriptions.data.length === 0) {
      return res.status(200).json({ message: "No subscriptions found" });
    }

    // Sort subscriptions by creation date in descending order (most recent first)
    const sortedSubscriptions = subscriptions.data.sort(
      (a, b) => b.created - a.created
    );

    // Get the most recent subscription
    const lastSubscription = sortedSubscriptions[0];

    return res.status(200).json(lastSubscription);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return res
      .status(500)
      .json({ message: "Failed to Get Subscriptions", error: error.message });
  }
};

const StudentActiveSubscription = async (req, res) => {
  try {
    const StripeCustomer = await db.StripeCustomer.findOne({
      where: { StudentID: req.params.id },
    });

    if (StripeCustomer == null || StripeCustomer == "") {
      return res.status(400).json({ message: "Not Subscribed" });
    }

    const StripeCusID = StripeCustomer.StripeCustomerID;
    const subscriptions = await stripe.subscriptions.list({
      customer: StripeCusID,
    });
    if (subscriptions.data.length === 0) {
      return res.status(200).json({ message: "No subscriptions found" });
    }

    // Sort subscriptions by creation date in descending order (most recent first)
    const sortedSubscriptions = subscriptions.data.sort(
      (a, b) => b.created - a.created
    );

    // Get the most recent subscription
    const lastSubscription = sortedSubscriptions[0];

    return res.status(200).json(lastSubscription);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return res
      .status(500)
      .json({ message: "Failed to Get Subscriptions", error: error.message });
  }
};

//8--------------------Update Qty--------------//
const SubscriptionCancel = async (req, res, next) => {
  const subscriptionId = req.body.sub_subscriptionid;
  const cancel_type = req.body.cancel_type;

  if (cancel_type == 0) {
    if (req.AccDetails.AccountType == 2) {
      const Subscription = await db.Subscription.findOne({
        where: { CompanyID: req.AccDetails.UserID, SubscriptionStatus: 1 },
      });

      if (!Subscription) {
        return res
          .status(200)
          .json({ message: "Subscription Already Canceled" });
      } else {
        var data = {
          SubscriptionStatus: 0,
        };

        await db.Subscription.update(data, {
          where: { CompanyID: req.AccDetails.UserID },
        });
        await db.StripeCustomer.update(data, {
          where: { UserID: req.AccDetails.UserID },
        });
        const subscription = await stripe.subscriptions.cancel(subscriptionId);

        // Notification body -->>
        const notificationBody = {};
        notificationBody.emailType = "cancel-subscription";
        notificationBody.userEmailReq = Subscription.SubEmail;
        notificationBody.userName = Subscription.CreatedBy;

        req.visualNotificationBody = notificationBody;
        //  Notification body -->>
        next();
        return res.status(200).json({
          message: "Subscription canceled immediately",
          SubscriptionData: subscription,
        });
      }
    }
    if (req.AccDetails.AccountType == 3) {
      const Subscription = await db.Subscription.findOne({
        where: { ParentID: req.AccDetails.UserID, SubscriptionStatus: 1 },
      });

      if (!Subscription) {
        return res
          .status(400)
          .json({ message: "Subscription Already Canceled" });
      } else {
        var data = {
          SubscriptionStatus: 0,
        };

        await db.Subscription.update(data, {
          where: { ParentID: req.AccDetails.UserID },
        });
        await db.StripeCustomer.update(data, {
          where: { ParentID: req.AccDetails.UserID },
        });
        const subscription = await stripe.subscriptions.cancel(subscriptionId);

        // Notification body -->>
        const notificationBody = {};
        notificationBody.emailType = "cancel-subscription";
        notificationBody.userEmailReq = Subscription.SubEmail;
        notificationBody.userName = Subscription.CreatedBy;
        notificationBody.userId = Subscription.CompanyID
          ? Subscription.CompanyID
          : Subscription.ParentID;

        req.visualNotificationBody = notificationBody;
        //  Notification body -->>
        next();
        return res.status(200).json({
          message: "Subscription canceled immediately",
          SubscriptionData: subscription,
        });
      }
    }
  } else {
    async function cancelSubscriptionAtPeriodEnd(subscriptionId) {
      try {
        const subscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
        console.log("Subscription set to cancel at period end:", subscription);
        return res
          .status(200)
          .json({ message: "Subscription set to cancel at period end" });
      } catch (error) {
        console.error(
          "Error setting subscription to cancel at period end:",
          error
        );
      }
    }
    cancelSubscriptionAtPeriodEnd(subscriptionId);
  }
};

async function checkOutWithDiscount(req, res) {
  try {
    const { AccDetails } = req;
    if (!AccDetails || !AccDetails.UserID || !AccDetails.AccountType) {
      return res.status(400).json({
        message: "Invalid token login again",
      });
    }

    const { product, success_url, cancel_url, paymentMode, forStudent } = req.body; // product should be price id.

    if (!success_url || !cancel_url || !product || !paymentMode || !forStudent) {
      return res.status(400).json({
        message: "Invalid request",
      });
    }

    const metaData = {};

    // if (AccDetails.AccountType == 3) {
    //   metaData.ParentID = AccDetails.UserID;
    // }
    if (AccDetails.AccountType == 3) {
      metaData.ParentID = Number(forStudent);
    }
    if (AccDetails.AccountType == 2) {
      metaData.CompanyID = AccDetails.UserID;
    }

    // console.log(metaData);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: product,
          quantity: 1,
        },
      ],
      mode: paymentMode,
      success_url: success_url,
      cancel_url: cancel_url,
      // discounts: [{coupon: "tApFP8C0"}],
      allow_promotion_codes: true,
      metadata: metaData,
    });

    // console.log("session", session)

    return res.status(200).json({
      id: session.id,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was a server-side error",
    });
  }
}

async function stripeWebhook(req, res, next) {
  const bufVal = Buffer.isBuffer(req.body);
  try {
    // const stripe = require("stripe")("sk_test_51Otc07EFuOGljmni3SPGMK97rDisnfrkG1VW8vtEWIw897WyZtWTVAdO5stre2e5SnWcjBNyKb8kXAqAFanampaJ00pWF0uTbt");
    const sig = req.headers["stripe-signature"];
    const endpointSecret = "whsec_BzUceXGS39s8fZJSmmLgh8yUOtyChJHM";
    const event = await stripe.webhooks.constructEvent(
      req.body,
      sig,
      endpointSecret
    );

    if (event.type === "checkout.session.completed") {
      const notificationBody = await createSubscriptionOnPayment(event);
      if (!notificationBody) {
        return res.status(400).json({
          message: "There was an error while completing process"
        })
      }
      req.visualNotificationBody = notificationBody;
      next();
    }

    return res.status(200).json({
      message: "Ok",
      wasBuffer: bufVal,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was a server-side error",
      wasBuffer: bufVal,
    });
  }
}

async function createSubscriptionOnPayment(event) {
  try {
    let toStoreId = {};
    const type = event?.data?.object?.metadata;

    if (type?.ParentID) {
      toStoreId["ParentID"] = type.ParentID;
    }

    if (type?.CompanyID) {
      toStoreId["CompanyID"] = type.CompanyID;
    }

    const session = event.data.object;

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 1,
    });



    if (!lineItems.data || !lineItems.data.length) {
      return 0;
    }

    if (session.mode === 'subscription' && session.subscription) {
      // Handle subscription-specific flow
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      const startDate = new Date(subscription.start_date * 1000);
      const endDate = new Date(subscription.current_period_end * 1000);

      // const customer = await stripe.customers.retrieve(session.customer);

      toStoreId["StripeCustomerID"] = session.customer;
      toStoreId["SubscriptionIDStripe"] = session.subscription;
      toStoreId["PlanID"] = lineItems.data[0].price.id;
      toStoreId["Plan"] = lineItems?.data[0].description;
      toStoreId["Amount"] = lineItems?.data[0].amount_total;
      toStoreId["SubscriptionCount"] = lineItems?.data[0].quantity;
      toStoreId["PlanStartDate"] = startDate;
      toStoreId["PlanEndDate"] = endDate;
      toStoreId["SubEmail"] = session.customer_details.email;
      toStoreId["CreatedBy"] = session.customer_details.name;
      toStoreId["SubscriptionStatus"] = 1;

    } else if (session.mode === 'payment' && session.payment_intent) {
      // Handle payment-specific flow
      const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);

      // const customer = await stripe.customers.retrieve(session.customer);

      toStoreId["StripeCustomerID"] = session.customer;
      toStoreId["PaymentIntentIDStripe"] = session.payment_intent;
      toStoreId["PlanID"] = lineItems.data[0].price.id;
      toStoreId["Plan"] = lineItems.data[0].description;
      toStoreId["Amount"] = lineItems.data[0].amount_total;
      toStoreId["SubscriptionCount"] = lineItems.data[0].quantity;
      toStoreId["SubEmail"] = session.customer_details.email;
      toStoreId["CreatedBy"] = session.customer_details.name;
      toStoreId["SubscriptionStatus"] = 1; // Not a subscription


    } else {
      return 0;
    }

    await db.Subscription.create(toStoreId);

    // Notification Body >>
    const notificationBody = {};
    notificationBody.emailType = "subscription-purchased";
    notificationBody.userEmailReq = session.customer_details.email;
    notificationBody.userName = session.customer_details.name;
    notificationBody.userId = toStoreId.ParentID
      ? toStoreId.ParentID
      : toStoreId.CompanyID;
    return notificationBody;
    // Notification Body <<
  } catch (error) {
    console.log(error);
    return 0;
  }
}

async function generateInvoice(req, res) {
  try {
    const { subId } = req.query;
    if (!subId) {
      return res.status(404).json({
        message: "Invalid subscription",
      });
    }
    const invoices = await stripe.invoices.list({
      subscription: subId,
    });

    const dataToSend = invoices?.data[0]?.invoice_pdf;

    return res.status(200).json({
      invoicePdfUrl: dataToSend,
    });
  } catch (error) {
    const statusHandle = error?.raw?.statusCode;

    if (statusHandle == 404) {
      return res.status(404).json({
        message: "Subscription not found",
      });
    }
    return res.status(500).json({
      message: "Sorry! There was a server-side error",
      status: statusHandle,
    });
  }
}

async function getAllStripeSubscriptions(req, res) {
  try {
    // Adding a default value two considering the first two subscriptions are Yearly and Monthly based
    const stripeAllProducts = await stripe.products.list({
      limit: 2,
    });
    if (stripeAllProducts?.data) {

      for (let i = 0; i < stripeAllProducts.data.length; i++) {
        const price = await stripe.prices.retrieve(stripeAllProducts.data[i].default_price);
        // console.log(price);
        stripeAllProducts.data[i]["priceNumber"] = price;
      }
    }

    return res.status(200).json({
      stripeProduct: stripeAllProducts,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was a server-side error",
    });
  }
}

async function getSubscriptionStatusStudent(req, res) {
  try {
    const { AccDetails } = req;
    if (!AccDetails || !AccDetails.UserID || !AccDetails.AccountType) {
      return res.status(400).json({
        message: "Invalid token login again",
      });
    }

    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({
        message: "User not found"
      })
    }
    const whereCondition = {};
    AccDetails.AccountType == 3 ? whereCondition["ParentID"] = userId : whereCondition["CompanyID"] = userId;

    const userSubscriptionDB = await db.Subscription.findOne({ where: whereCondition });
    if (!userSubscriptionDB) {
      return res.status(200).json({
        status: 0
      })
    }
    const subscription = await stripe.subscriptions.retrieve(userSubscriptionDB?.SubscriptionIDStripe);
    // console.log(subscription);

    let status = subscription.status;
    if (status == "active") {
      if (subscription?.cancel_at_period_end) {
        return res.status(200).json({
          status: 3,
          priceId: userSubscriptionDB?.PlanID,
          userSubscriptionData: userSubscriptionDB
        });
      }

      return res.status(200).json({
        status: 1,
        priceId: userSubscriptionDB?.PlanID
      });
    } else {
      return res.status(200).json({
        status: 0,
        // priceId : subscription?.PlanID
      });
    }


  } catch (error) {
    console.error("Error retrieving subscription:", error);
    return res.status(500).json({
      message: "Sorry! There was an server-side error"
    })
  }
}

async function getPlanByPlanID(req, res) {
  try {
    const { planId } = req.query;
    if (!planId) {
      return res.status(400).json({
        message: "Plan donot exist"
      })
    }
    const price = await stripe.prices.retrieve(planId);
    // console.log(price)

    if (!price?.product) {
      return res.status(400).json({
        message: "Plan donot exist"
      })
    }

    const product = await stripe.products.retrieve(price.product);
    // console.log(product)
    product['priceNumber'] = price;
    return res.status(200).json({
      stripeProduct: product,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Sorry! There was an server-side error'
    });
  }
}

async function cancelSubscriptionStudent(req, res) {
  try {
    const { studentId } = req.query;
    if (!studentId) {
      return res.status(400).json({
        message: "Student not found"
      })
    }
    const subscriptionDataDb = await db.Subscription.findOne({
      where: { ParentID: studentId, SubscriptionStatus: 1 }
    });
    if (!subscriptionDataDb) {
      return res.status(400).json({
        message: "Subscription not found!"
      })
    }

    const canceledSubscription = await stripe.subscriptions.update(subscriptionDataDb?.SubscriptionIDStripe, {
      cancel_at_period_end: true,
    });
    // console.log(canceledSubscription);
    return res.status(200).json({
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Sorry! There was an server-side error'
    });
  }
}


module.exports = {
  GetProduct,
  GetProductByID,
  CreatePaymetMethod,
  GetCustomer,
  CreateCustomerRetrieve,
  CreateSubscription,
  CreateInvoice,
  CreateBilling,

  UpdateQty,
  PauseSubscription,
  Subscriptionlist,
  ActiveSubscriptionlist,
  StudentActiveSubscription,
  SubscriptionCancel,
  GetProductCompany,
  // Above are the old versions ^^^^^
  // New versioning
  checkOutWithDiscount,
  stripeWebhook,
  generateInvoice,
  getAllStripeSubscriptions,
  getSubscriptionStatusStudent,
  getPlanByPlanID,
  cancelSubscriptionStudent
};
