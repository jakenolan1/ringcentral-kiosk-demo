// All copy, products, and recommendation rules live here, so content changes never touch app logic.
// Copy marked PLACEHOLDER is not in the Figma file yet and should be confirmed.
window.CONTENT = {
  intake: {
    eyebrow: "Product demo questionnaire",
    intro: "With a few questions we can recommend products to best fit your specific needs.",
    continue: "Continue",
    questions: [
      {
        id: "interests",
        label: "My company is interested in",
        hint: "Select all that apply. At least one selection required",
        multi: true,
        options: [
          { id: "phone", label: "Phone" },
          { id: "video", label: "Video meetings" },
          { id: "messaging", label: "Messaging" },
          { id: "webinar", label: "Webinar" },
          { id: "contact-center", label: "Contact Center" },
          { id: "sales", label: "Sales" },
          { id: "ai", label: "AI Powered Products" },
          { id: "custom", label: "Custom Offerings" },
        ],
      },
      {
        id: "team",
        label: "for a team of",
        hint: "Select one", // PLACEHOLDER
        multi: false,
        options: [ // PLACEHOLDER: team size ranges are not in Figma yet
          { id: "xs", label: "1–20" },
          { id: "sm", label: "21–100" },
          { id: "md", label: "101–500" },
          { id: "lg", label: "501–1,000" },
          { id: "xl", label: "1,000+" },
        ],
      },
    ],
  },

  recommendations: {
    eyebrow: "Product demos",
    title: "Your Recommendations",
    subtitle: "Based off your selections, we’ve recommended {count} product demos for you.",
    count: 3, // how many products to recommend
    learnMore: ["Learn", "more"],
    edit: "Edit",
    share: "Share",
  },

  detail: {
    launchTour: "Launch tour",
    meetExpert: "Meet with an expert",
    topFeatures: "Top features",
    viewAll: "View all features",
    planEyebrow: "Featured plan from",
    tryFree: "Try free",
    buyNow: "Buy now",
    ctaTitle: "Still have questions? Schedule a call with an expert.",
    scheduleNow: "Schedule now",
    callNow: "Call now",
  },

  // Shown when a visitor taps an action that needs a person (tour, schedule, buy...). PLACEHOLDER
  handoff: {
    title: "Let’s talk",
    body: "Wave down anyone in a RingCentral shirt and we’ll walk you through it right here at the booth.",
    close: "Sounds good",
  },
  shareSheet: {
    title: "Take these demos with you",
    body: "Ask a RingCentral team member and we’ll send your recommendations straight to your inbox.",
    close: "Got it",
  },

  idle: {
    title: "Still exploring?",
    body: "This demo will restart in",
    stay: "I’m still here",
    seconds: 15,
    timeoutSeconds: 90,
  },

  nav: {
    phoneLabel: "Sales:",
    phone: "(877) 768-4369",
    utility: ["Join a meeting", "Download app", "Support"],
    login: "Login",
    links: [
      { label: "Products", dropdown: true },
      { label: "Solutions", dropdown: true },
      { label: "Plans and Pricing" },
      { label: "Partners", dropdown: true },
      { label: "Resources", dropdown: true },
    ],
    myDemos: "My demos",
  },

  footer: {
    columns: [
      { title: "Products", links: ["Intelligent Phone Systems", "Intelligent Meetings", "Contact Center Solutions", "AI Solutions", "Developers"] },
      { title: "Partners", links: ["Global service providers", "Channel partners", "ISV partners", "Hardware partners", "Connectivity partners", "Affiliate partners"] },
      { title: "Open Ecosystem", links: ["Developer platform", "APIs", "Integrated apps", "App gallery", "Developer support", "Developer community", "Games and rewards"] },
      { title: "Resources", links: ["What’s new", "Resource center", "Blog", "Customer stories", "Newsroom", "Product demos", "Product accessibility", "Events"] },
      { title: "About Us", links: ["Our Company", "Leadership", "Awards", "Investor relations", "Ventures", "Trust Center", "Corporate Responsibility", "Diversity and inclusion"] },
      { title: "Quick Links", links: ["App Download", "Join a meeting", "App login", "Admin Portal Login", "Careers", "Support", "Contact Sales"] },
    ],
    legal: ["Legal", "Privacy Policy", "Sitemap", "Accessibility", "Contact Us", "Cookie Notice", "Cookie Preferences"],
    copyright: "© 2023 RingCentral, Inc. All rights reserved",
    region: "United States",
  },

  // Feature icons available: mic, device, grid, wave, headset
  // score: points each intake answer adds to this product; the top scorers are recommended.
  products: [
    {
      id: "mvp",
      name: "RingCentral MVP",
      tagline: "The complete cloud communication solution",
      card: "assets/img/mvp.jpg",
      hero: "assets/img/mvp.jpg",
      description: "One communication platform to do your best work reimagined with powerful intelligence, workflow automation, video, messaging, and more.",
      tags: ["Cloud phone system", "Video meetings", "Team messaging"],
      features: [
        { icon: "mic", text: "Unlimited domestic calling*" },
        { icon: "device", text: "SMS and MMS" },
        { icon: "grid", text: "IVR (Interactive Voice Response)" },
        { icon: "wave", text: "Google, Microsoft apps, and access to APIs" },
        { icon: "headset", text: "Single sign-on" },
      ],
      plans: [
        { name: "RingCentral+ Core", price: "$20", was: "$30", unit: "/user/month* paid annually", body: "A reliable, core phone system to get your business up and running" },
        { name: "RingCentral+ Advanced", price: "$25", was: "$35", unit: "/user/month* paid annually", body: "Advanced call handling and integrations for growing teams" }, // PLACEHOLDER
        { name: "RingCentral+ Ultra", price: "$35", was: "$45", unit: "/user/month* paid annually", body: "Unlimited storage and analytics for the most demanding teams" }, // PLACEHOLDER
      ],
      score: { phone: 3, messaging: 2, video: 1, sales: 1, custom: 1, xs: 1, sm: 1 },
    },
    {
      id: "ringcx",
      name: "RingCentral RingCX",
      tagline: "Elevating customer experiences with AI",
      card: "assets/img/ringcx.jpg",
      hero: "assets/img/workspace.jpg",
      description: "An AI-first contact center that is simple to set up, easy to use, and built to resolve every customer conversation faster.", // PLACEHOLDER
      tags: ["Omnichannel", "AI agent assist", "Analytics"], // PLACEHOLDER
      features: [ // PLACEHOLDER
        { icon: "headset", text: "Voice, chat, email, and social in one queue" },
        { icon: "mic", text: "Real-time AI agent assist" },
        { icon: "grid", text: "Skills-based routing and IVR" },
        { icon: "wave", text: "Live supervisor dashboards" },
        { icon: "device", text: "CRM integrations" },
      ],
      plans: [ // PLACEHOLDER
        { name: "RingCX", price: "$65", was: "$75", unit: "/agent/month* paid annually", body: "AI-powered omnichannel contact center for teams of any size" },
      ],
      score: { "contact-center": 3, sales: 2, ai: 2, custom: 1, md: 1, lg: 1, xl: 1 },
    },
    {
      id: "video",
      name: "RingCentral Video Meetings",
      tagline: "Meet smarter with built-in AI", // PLACEHOLDER (Figma repeats the RingCX line)
      card: "assets/img/video.jpg",
      hero: "assets/img/video.jpg",
      description: "Browser-based video meetings with AI summaries, whiteboards, and breakout rooms, so teams can meet from anywhere without downloads.", // PLACEHOLDER
      tags: ["Video meetings", "AI summaries", "Whiteboards"], // PLACEHOLDER
      features: [ // PLACEHOLDER
        { icon: "device", text: "Join from any browser or device" },
        { icon: "mic", text: "AI meeting notes and summaries" },
        { icon: "grid", text: "Breakout rooms and whiteboards" },
        { icon: "wave", text: "Noise reduction" },
        { icon: "headset", text: "Dial-in from any phone" },
      ],
      plans: [ // PLACEHOLDER
        { name: "RingCentral Video Pro+", price: "$10", was: "$15", unit: "/user/month* paid annually", body: "Unlimited meetings with up to 200 participants" },
      ],
      score: { video: 3, messaging: 1, webinar: 1, ai: 1, xs: 1, sm: 1 },
    },
    {
      id: "webinar",
      name: "RingCentral Webinar",
      tagline: "Engaging virtual events at scale", // PLACEHOLDER
      card: "assets/img/workspace.jpg",
      hero: "assets/img/workspace.jpg",
      description: "Host webinars for thousands with registration, live Q&A, polls, and analytics, all from the same app your team already uses.", // PLACEHOLDER
      tags: ["Webinars", "Live Q&A", "Event analytics"], // PLACEHOLDER
      features: [ // PLACEHOLDER
        { icon: "device", text: "Branded registration pages" },
        { icon: "mic", text: "Live polls and Q&A" },
        { icon: "grid", text: "Practice sessions and backstage" },
        { icon: "wave", text: "Attendee engagement analytics" },
        { icon: "headset", text: "Up to 10,000 attendees" },
      ],
      plans: [ // PLACEHOLDER
        { name: "RingCentral Webinar", price: "$59", was: "$79", unit: "/host/month* paid annually", body: "Webinars for up to 10,000 attendees" },
      ],
      score: { webinar: 3, video: 1, sales: 1, lg: 1, xl: 1 },
    },
  ],
};
