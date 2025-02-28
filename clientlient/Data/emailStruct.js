const emailStruct = [
  {
    emailType: "signIn-otp",
    Subject: "Sign in code",
    Header: "Finishing signing",
    Title: "here is your verification code",
    Time_limit: 10,
    Time_type: "Minutes",
    Time_limit_content: "Verification code expires after",
    sendInBlueId: 20,
  },
  {
    emailType: "signUp-otp",
    Subject: "Sign Up code",
    Header: "Finishing sign up",
    Title: "here is your verification code",
    Time_limit: 10,
    Time_type: "Minutes",
    Time_limit_content: "Verification code expires after",
    sendInBlueId: 20,
  },
  {
    emailType: "resend-otp",
    Subject: "Sign up code",
    Header: "Finishing signup",
    Title: "here is your verification code",
    Time_limit: 10,
    Time_type: "Minutes",
    Time_limit_content: "Verification code expires after",
    sendInBlueId: 19,
  },
  {
    emailType: "beta-trial",
    Subject: "Beta Trials",
    Greetings: "welcome!",
    Header: "You are all set to get our free trial!",
    Tip: "You can add multiple trials!",
    Guidelines: "Remember we are here for help.",
    Support_Email: "support@gmail.com",
    sendInBlueId: 15,
  },
  {
    emailType: "trial-started",
    Subject: "Your 14-day trial has started! 🚨",
    Email_body:
      "You’re all set. Enjoy your 14-day trial starting today. The trial ends on August 30, 2024.",
    Tip: "You can add multiple student accounts and let your kids learn for free during the trial.",
    Guidelines:
      "Remember, we’re always here to support you. If you have any questions, don’t hesitate to reach out at",
    Support_Email: "support@gmail.com",
    sendInBlueId: 14,
  },
  {
    emailType: "inactive-user",
    Subject: "I noticed you ...👀",
    Greetings: "hey",
    Email_body:
      "Amelia here from Edbition! I noticed you've hopped on board, and I wanted to check in. How's it going so far?",
    Guidelines:
      "If you have any questions, I'm here to help! You can reply here or send me a message at",
    Salutations: "Happy exploring! :)",
    sendInBlueId: 13,
  },
  {
    emailType: "trial-expire",
    Subject: "Your 14-Day Free Trial Expired — Extend it for FREE! 🚀",
    Title: "Your 14-day trial has ended.",
    Email_body:
      "Need more time to decide? Simply invite friends and score an extra month FREE. ",
    List_title: "Your invite will ...",
    Offers_list_first:"✅ … help other kids learn high-demand skills",
    Offers_list_second:"✅ … give parents some well-deserved ‘me time’",
    Offers_list_third:"✅ ... get you and your friend free access for 1 month",
    Email_about:
      "To make that happen, all you have to do is send an invite before and it takes less than 30 seconds",
    sendInBlueId: 11,
  },
  {
    emailType: "last-three-day-offer",
    Subject: "Alert - This offer is so good ...😱",
    Title: "This exclusive offer is yours.",
    Email_body:
      "We noticed your free will end in 3 days. As an early adopter of our platform, we have something for you.",
    Privileges: "Save per year",
    Offer_title: "Early adopter limited offer:",
    Offers_list_title: "Plus, you get access:",
    Offers_list_first:"New courses : Fun and exciting courses added regularly",
    Offers_list_second:"VIP support : Enjoy priority access to top-notch learning advisors and dedicated customer support",
    Offers_list_third:"Exclusive perks : Be the first to experience our latest  features",
    sendInBlueId: 12,
  },
  {
    emailType: "trial-complete-expired",
    Subject: "Your 14-Day Free Trial Expired — Extend it for FREE! 🚀",
    Title: "Your 14-day trial has ended.",
    Email_body:
      "Need more time to decide? Simply invite friends and score an extra month FREE. ",
    Offers_list_title: "Your invite will ...",
    Offers_list_first:"✅ … help other kids learn high-demand skills",
    Offers_list_second:"✅ … give parents some well-deserved ‘me time’",
    Offers_list_third:"✅ ... get you and your friend free access for 1 month",
    Email_about:
      "To make that happen, all you have to do is send an invite before [3 days after trial expired] and it takes less than 30 seconds",
    sendInBlueId: 11,
  },
  {
    emailType: "for-feedback-after-trial",
    Subject: "You’re a gold nugget and here’s why... 👀",
    Title: "Your feedback is a golden nugget.",
    Header: " We’re sad you didn’t stay, helps us make Edbition better. ",
    Offers_list_title: "Your feedback will help us...",
    Offers_list_first:"✅ … serve you better",
    Offers_list_second:"✅ ... make content kids will like",
    Offers_list_third:"✅ ... improve the platform",
    Email_about:
      "To make that happen, all you have to do is answer a few questions and this takes less than 60 seconds.",
    sendInBlueId: 10,
  },
  {
    emailType: "for-feedback",
    Subject: "💎 You’re words worth a diamond and here’s why",
    Title: "Your review is a diamond waiting to be found.",
    Email_body:
      "To make that happen, all you have to do is leave a Trustpilot review, and this takes less than 60 seconds.",
    Offers_list_title: "Your review will help ...",
    Offers_list_first:"✅ ... one more parent feel confident in choosing us",
    Offers_list_second:"✅ … one more child gain valuable skills",
    Offers_list_third:"✅ ... one more family discover quality education",
    sendInBlueId: 8,
  },
  {
    emailType: "for-feedback-subscribed",
    Subject: "You’re a gold nugget and here’s why...",
    Title: "You hold the secret sauce ",
    Email_body:
      " We’re on a mission to deliver the awesome learning experience for kids, and your feedback is the secret ingredient.",
    Offers_list_title: "Here’s how you can help:",
    Offers_list_first:"✅ Share Your Thoughts : Tell us what’s working and what could be better",
    Offers_list_second:"✅ Shape the Future : Your input directly impacts how we enhance our platform",
    Guidelines:
      "As a token of appreciation, we’ll send you a $10 gift card from Amazon, Starbucks, etc. - you pick!",
    sendInBlueId: 7,
  },
  {
    emailType: "cancel-subscription",
    Subject: "Your special pricing awaits if you decide to return 😉",
    Title: "We get it ... you changed your mind",
    Offers_list_title: "Now, you won’t have access to:",
    Offers_list_first:"✅ Top-tier courses (added on a monthly basis)",
    Offers_list_second:"✅ Custom learning experience for your child",
    Offers_list_third:"✅ Activities, events, reports and more",
    Offers_list_fourth:"✅ Activities, events, reports and more",
    Guidelines:
      "Just so you’re aware our pricing has increased. If you decide to return and keep your existing pricing, your rate is reserved for the next 30 days.",
    sendInBlueId: 6,
  },
  {
    emailType: "advisor-feedback",
    Subject: "Learning advisor - ",
    Greetings: "Hey",
    Email_body: "Ipsum lorem text...",
    sendInBlueId: 16,
  },
  {
    emailType: "customer-support",
    Subject: "Customer support - Request",
    Greetings: "Hey",
    Email_body: "Ipsum lorem text from the customer support. ",
    sendInBlueId: 17,
  },
  {
    emailType: "invited-to-company",
    Subject: "Company Invite",
    Greetings: "Hey",
    Title: " invited you to join Edbition!",
    Email_body:
      "Give your child the freedom to learn high-demand skills and have fun with it. While you get some ‘me time’. ",
    Guidelines:
      "We charge $99/month per student, but your company is paying. So you get to join for free!",
    sendInBlueId: 18,
  },
  {
    emailType: "subscription-purchased",
    Subject: "Subscription paid",
    Greetings: "Happy learning",
    Title: "You’re officially part of the club!",
    Guidelines:
      "Thank you for supporting us! We’re a growing team that believes in the freedom and power of education. People like you help us make this platform better.",
    sendInBlueId: 9,
  },
  {
    emailType: "student-created",
    Subject: "Welcome on board!",
    Title: "You’re invited to join Edbition!",
    Email_body:
      "Learn practical skills and have fun! Earn badges, trophies and enter competitions.",
    sendInBlueId: 5,
  },
  {
    emailType: "parent-created",
    Subject: "Welcome on board!",
    Title: "You’re invited to join Edbition!",
    Email_body: "Here’s your login information.",
    sendInBlueId: 4,
  },
  {
    emailType: "staff-created",
    Subject: "Welcome on board!",
    Title: "You’re invited to join Edbition!",
    Email_body: "Here’s your login information.",
    sendInBlueId: 4,
  },
  {
    emailType: "two-months-free",
    Subject: "Unlock 2 Months Free – Just for Your Feedback 💰",
    Greetings: "Hi",
    Email_body: `We appreciate your support and can’t wait to share what’s next!
        Some highlights:
        Beta version will run until October 30, 2024.
        We’re officially launching on November 3, 2024
    `,
    Guidelines:
      " We’re asking for just 5 minutes of your time to complete a quick survey. In return, we’ll give you 2 months free access after we launch—worth $200 per student.",
    Salutations:"Thanks for your support,",
    sendInBlueId: 2,
  },
];

module.exports = emailStruct;
