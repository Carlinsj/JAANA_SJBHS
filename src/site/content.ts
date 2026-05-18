import type {
  AlbumFolder,
  CauseCard,
  ContactChannel,
  ConnectPageContent,
  DonationInfoContent,
  DonationRoute,
  EventAlbum,
  EventHighlight,
  GalleryImage,
  HouseShield,
  InquiryForm,
  PriorityCard,
  SecondaryPage,
  SponsorTier,
  TabConfig
} from "./types.js";

const albumAssetVersion = "2026-04-15-1";
const defaultConnectSponsorMessage =
  "We are seeking sponsors for our North America Connect reunion. Your brand or business will have the opportunity to reach hundreds of successful Josephites and their families. Proceeds from the event will fund the OBA Teachers Insurance Program. Individual and batch benefactors are also warmly welcome.";

const withAlbumAssetVersion = (image: GalleryImage): GalleryImage =>
  image.src.startsWith("/assets/albums/")
    ? {
        ...image,
        src: `${image.src}?v=${albumAssetVersion}`
      }
    : image;

export const tabs: TabConfig[] = [
  {
    id: "home",
    label: "Home",
    kicker: "JAANA",
    title: "Support the school, strengthen the alumni network, and help shape North America Connect 2026.",
    copy:
      "This site brings together the most important ways to stay involved: give from the United States, support or attend North America Connect 2026, and reach the team directly."
  },
  {
    id: "causes",
    label: "Causes",
    kicker: "Causes",
    title: "Causes We Support",
    copy:
      "The Josephite Alumni Association of North America (JAANA), in partnership with The Old Boys' Association (OBA) of St. Joseph's Boys' High School, remains steadfast in its commitment to supporting students, teachers, and the School through structured, transparent, and high-impact initiatives."
  },
  {
    id: "donate",
    label: "Donate",
    kicker: "Donate",
    title: "Donate to JAANA, SJBHS-OBA, BJES",
    copy: "Support JAANA, SJBHS-OBA, and BJES through the donation routes on this page."
  },
  {
    id: "connect",
    label: "North America Connect 2026",
    kicker: "North America Connect 2026",
    title: "North America Connect 2026",
    copy:
      "Dust off your school spirit and get ready for a weekend of pure nostalgia. Join us this September 19th and 20th for a spectacular gathering of Josephites from across North America. From a high-energy gala night to a classic school-style picnic, we are bringing the best of St Joseph's to Northern Virginia.\n\nEven better? Every ticket helps us give back. Proceeds from the event will support the SJBHS OBA Teachers Insurance Program, ensuring we take care of the mentors who shaped us."
  },
  {
    id: "contact",
    label: "Contact Us",
    kicker: "Contact Us",
    title: "Contact JAANA",
    copy: "Use this page for donation questions, sponsorship inquiries, alumni coordination, and general outreach."
  }
];

export const impactStats = [
  { value: "6", label: "priority causes open for support" },
  { value: "Live", label: "Zeffy donation form opens in a pop-up" },
  { value: "Sept 19-20, 2026", label: "North America Connect weekend near Washington, D.C." }
];

export const priorityCards: PriorityCard[] = [
  {
    title: "Causes",
    body:
      "Review the school causes currently open for support, compare their scope, and choose the impact area that matters most to you.",
    points: [
      "Student Scholarships",
      "Teachers Insurance Program",
      "Mid-Day Meal Program",
      "Student Awards Program",
      "School Infrastructure Development",
      "Other Jesuit causes"
    ],
    cta: "Open Causes page",
    tab: "causes"
  },
  {
    title: "Donate",
    body: "Open the Donate page to review giving routes and launch the secure Zeffy donation flow.",
    points: [
      "Endowment, grant, matching, and small-gift routes",
      "Cause-based donation support",
      "Secure Zeffy checkout for supported routes",
      "A separate Contact Us page for inquiries"
    ],
    cta: "Open Donate page",
    tab: "donate"
  },
  {
    title: "North America Connect 2026",
    body:
      "North America Connect 2026 brings Josephites across North America to Northern Virginia for a Saturday gala night and Sunday picnic weekend.",
    points: [
      "Washington, D.C. metro area",
      "Saturday dinner and dancing",
      "Sunday picnic lunch and games",
      "Tickets and sponsorship both support the SJBHS OBA Teachers Insurance Program"
    ],
    cta: "Open North America Connect 2026",
    tab: "connect"
  }
];

export const causeCards: CauseCard[] = [
  {
    title: "Student Scholarships",
    summary: "Enable students requiring financial aid to pursue their education goals at SJBHS.",
    minimum: "",
    purpose: "Enable students requiring financial aid to pursue their education goals at SJBHS with dignity, stability, and continuity.",
    goal: "Goal: $120,000 / year",
    impact: "Impact: 114 students supported.",
    support: [
      "Grant: $800 supports one student for one school year.",
      "Endowment: $16,000 supports a student on a recurring basis."
    ],
    donationWays: [
      "Make a one-time grant to support students immediately.",
      "Create longer-term recurring impact through an endowment commitment.",
      "Direct a gift to scholarships through the standard donation route."
    ]
  },
  {
    title: "Teachers Insurance Program",
    summary: "Protect teaching staff, support staff, retired staff, and eligible families through insurance coverage.",
    minimum: "",
    purpose:
      "Provide teaching staff, support staff, retired staff, and their families with comprehensive health and personal accident insurance cover.",
    goal: "Goal: $35,000 / year",
    impact:
      "Impact: health insurance coverage for 540 staff and family members, plus personal accident insurance coverage for 180 teaching staff.",
    support: [
      "Grant: $200 supports one staff member, spouse, and dependents for one year.",
      "Endowment: $4,000 provides recurring annual support."
    ],
    donationWays: [
      "Fund the current insurance cycle through a one-time grant.",
      "Build recurring support through an endowment contribution.",
      "Direct a gift to teacher welfare through the standard donation process."
    ]
  },
  {
    title: "Mid-Day Meal Program",
    summary: "Provide students requiring financial aid with nourishing meals at school.",
    minimum: "",
    purpose: "Provide students requiring financial aid with nourishing meals at school so they can learn and grow well.",
    goal: "Goal: $25,000 / year",
    impact: "Impact: 3,000 meals provided annually.",
    support: [
      "Grant: $150 provides meals to one student for one year.",
      "Endowment: $3,000 provides recurring annual support."
    ],
    donationWays: [
      "Make a one-time grant to fund meals now.",
      "Use an endowment route to create recurring annual support.",
      "Direct a gift to the meal program through the standard donation route."
    ]
  },
  {
    title: "Student Awards Program",
    summary: "Recognize and reward students excelling in academics, sports, and the arts.",
    minimum: "",
    purpose: "Recognize and reward students excelling in academics, sports, and the arts.",
    goal: "Goal: an awards system that drives excellence.",
    impact:
      "Impact: students receive awards in strategic classes and levels, boosting morale and confidence at the right time.",
    support: [
      "Awards typically range between $300 and $500 per award annually.",
      "Endowment funds can be set up for recurring support.",
      "Named donor-backed prizes work especially well for this program."
    ],
    donationWays: [
      "Endowment support is the primary route for recurring annual awards.",
      "This cause suits donors who want visible, long-term recognition tied to student excellence."
    ]
  },
  {
    title: "School Infrastructure Development",
    summary: "Support classrooms, laboratories, sports facilities, and other campus development needs.",
    minimum: "",
    purpose: "Support development of school infrastructure such as classrooms, a sports complex, laboratories, and other campus needs.",
    goal: "Goal: $3,000,000",
    impact:
      "Impact: legacy-led contributions can fund named learning spaces and long-term improvements across the school campus.",
    support: [
      "Name a classroom: $30,000, payable over 3 years.",
      "Plaque on a pillar or pavilion: $6,000."
    ],
    donationWays: [
      "Make a one-time grant for immediate capital support.",
      "Use named giving opportunities for classrooms, pillars, and pavilions.",
      "General contributions can still be directed toward broader infrastructure needs."
    ]
  },
  {
    title: "Other Jesuit causes",
    summary: "Support other BJES education causes, including St. Joseph's Panditahalli and allied schools.",
    minimum: "",
    purpose:
      "Support other BJES causes in the field of education, including initiatives for St. Joseph's Panditahalli and other allied schools.",
    goal: "Goal: donor-directed support for allied Jesuit education causes.",
    impact:
      "Impact: donors can extend support beyond the core OBA priorities to allied schools and education initiatives.",
    support: [
      "Directed gifts can support St. Joseph's Panditahalli and allied schools.",
      "Use the donation agreement to specify the intended end use clearly.",
      "Suitable for individual, family, or batch-led contributions supporting allied Jesuit work."
    ],
    donationWays: [
      "Use the donation agreement to state the exact Jesuit or BJES cause you want supported.",
      "One-time grants work well for directed needs requiring current deployment.",
      "Endowment and general donation routes can still be used when a recurring or pooled structure is more appropriate."
    ]
  }
];

export const donationRoutes: DonationRoute[] = [
  {
    id: "endowment",
    title: "Endowment",
    minimum: "Min: $12,000 over 3 years",
    body: "An invested corpus created with JAANA US. At least 5% is distributed yearly to the donor's chosen cause.",
    action: "endowment"
  },
  {
    id: "grant",
    title: "Grant",
    minimum: "Min: $1,000",
    body: "A grant of $1,000 or more to a donor-selected JAANA/OBA cause.",
    action: "grant"
  },
  {
    id: "smallGift",
    title: "Small gifts",
    minimum: "Min: $1",
    body: "Donations of less than $1,000 are used by JAANA and the SJBHS OBA where needed most.",
    action: "smallGift"
  },
  {
    id: "matching",
    title: "Employer Matching",
    minimum: "Employer matching",
    body: "Check whether your employer can match your donation.",
    action: "matching"
  }
];

const sharedGrantReasons = [
  "Tax deductions: To obtain a US tax deduction, donors need to donate to a 501(c)(3) non-profit. JAANA has established a partnership with Learn For Life Foundation - LFL, a US registered 501(c)(3) public charity established by Thomas Thekkethala, SJBHS '77.",
  "Compliance: Foreign donations to SJBHS, BJES, and the OBA should comply with India's FCRA rules. JAANA works with LFL and BJES to ensure statutory requirements are met.",
  "Employer matching: As a 501(c)(3) organization, LFL is eligible for several employer matching programs. Please check with your employer or reach out with your employer's name to check eligibility.",
  "Low administrative costs: JAANA is entirely volunteer run. Administrative costs are less than $500 annually, helping ensure donations go to recipients."
];

export const donationInfo: DonationInfoContent[] = [
  {
    id: "endowment",
    label: "Endowment",
    title: "Endowment details",
    summary:
      "Endowments can be created by individuals, batches, or corporations, and may be named in honor of someone.",
    sections: [
      {
        title: "How it works",
        items: [
          "The amount donated is held in JAANA's US-based Fidelity account.",
          "Donors may choose from index funds available through Fidelity, or choose other investments in consultation with their tax advisors.",
          "Donors may opt for access to the Fidelity discount.",
          "A minimum of 5% of the endowment account balance, or a higher donor-selected percentage, is distributed annually to the SJBHS OBA via the BJES FCRA account.",
          "Donors may specify the causes supported by their endowment."
        ]
      },
      {
        title: "Why use JAANA?",
        items: [
          "US market access gives donors several investment options.",
          "Long-term invested giving can compound annual distributions.",
          ...sharedGrantReasons
        ]
      }
    ]
  },
  {
    id: "grant",
    label: "Grant",
    title: "Grant details",
    summary: "Grants of $1,000 or more can be directed to a donor-selected JAANA/OBA cause.",
    sections: [
      {
        title: "How it works",
        items: [
          "Minimum grant amount is $1,000.",
          "The entire amount donated is transferred to the SJBHS OBA during JAANA's periodic distribution wire transfers to the BJES FCRA account.",
          "Donors may specify the causes supported by their grant.",
          "Donors receive a tax receipt automatically."
        ]
      },
      {
        title: "Why use JAANA?",
        items: sharedGrantReasons
      }
    ]
  },
  {
    id: "smallGift",
    label: "Small gifts",
    title: "Small gifts details",
    summary: "Every donation makes an impact for the school, students, and teachers.",
    sections: [
      {
        title: "How it works",
        items: [
          "Small gifts under $1,000 are held in JAANA's US-based Fidelity account.",
          "JAANA, in consultation with the SJBHS OBA, deploys these funds annually based on the programs with the greatest need.",
          "All donations are welcome."
        ]
      },
      {
        title: "Why use JAANA?",
        items: sharedGrantReasons
      }
    ]
  }
];

export const sponsorHighlights: EventHighlight[] = [
  {
    title: "Save the date",
    body:
      "North America Connect is planned for September 19 and 20, 2026 in the Washington, D.C. metro area, with a Saturday Dinner and Sunday Picnic Lunch."
  },
  {
    title: "Audience and reach",
    body:
      "The sponsor packet projects 100+ in-person attendees across alumni and families, plus 300+ additional members reached through JAANA social channels."
  },
  {
    title: "Charitable impact",
    body:
      "Event proceeds are intended to support the SJBHS OBA Teachers Insurance fund covering teaching staff, support staff, retired staff, and eligible families."
  },
  {
    title: "Why sponsors fit here",
    body:
      "Sponsors are speaking to a high-trust alumni audience that values relationships, referrals, and services across real estate, finance, tax, wealth planning, senior care, insurance, banking, and legal work."
  }
];

export const sponsorTiers: SponsorTier[] = [
  {
    title: "Bronze",
    amount: "$500-$999",
    benefits: [
      "Text listing in the brochure and digital brochure.",
      "Rolling presentation listing at the venue.",
      "Tagged in thank-you and recap communications."
    ]
  },
  {
    title: "Silver",
    amount: "$1,000-$1,499",
    benefits: [
      "Half-page ad in the brochure and digital brochure.",
      "Logo in the rolling presentation plus banner placement.",
      "Individual social post and 1 included ticket."
    ]
  },
  {
    title: "Gold",
    amount: "$1,500+",
    benefits: [
      "Full-page brochure ad, QR option, and hyperlinks in the digital brochure.",
      "Feature-story or video treatment on social media.",
      "Individual table or sponsor-zone visibility, podium recognition, and 2 included tickets."
    ]
  }
];

export const connectMoments: GalleryImage[] = [
  {
    src: "/assets/us-reunion-tent-2018.jpg",
    alt: "Josephite alumni and families gathered outdoors in front of a striped reunion tent.",
    caption: "A past US reunion picnic shows the scale, warmth, and community spirit that Connect gatherings bring together."
  },
  {
    src: "/assets/us-reunion-pavilion-2016.jpg",
    alt: "A younger group of Josephite alumni gathered at a US reunion pavilion.",
    caption: "US reunions have always brought younger Josephites into the fold alongside the wider alumni community."
  },
  {
    src: "/assets/us-reunion-banquet-2019.jpg",
    alt: "A large Josephite alumni group posing together at an indoor US reunion evening event.",
    caption: "Evening reunion events keep the school connection alive across generations and geographies."
  },
  {
    src: "/assets/connect-uk-table.jpg",
    alt: "Alumni seated together at a long table during an OBA gathering.",
    caption: "Shared meals and conversation remain a defining part of alumni events."
  }
];

const albumCategories = [
  {
    id: "oba" as const,
    title: "OBA Events",
    description: "Association-wide gatherings, formal milestones, and signature OBA evenings."
  },
  {
    id: "christmas" as const,
    title: "Christmas",
    description: "Christmas-season gatherings, festive dinners, and year-end fellowship."
  },
  {
    id: "connect" as const,
    title: "Connect",
    description: "Regional Connects and chapter reunions across India and abroad."
  },
  {
    id: "sports" as const,
    title: "Sports",
    description: "Football, golf, cricket, and other competitive alumni events."
  },
  {
    id: "school" as const,
    title: "School",
    description: "School-facing events and student engagement programmes captured in the Calling."
  }
];

const rawEventAlbums: EventAlbum[] = [
  {
    title: "OBA Day 2025",
    category: "oba",
    label: "August 2025",
    summary: "Commemorative moments from OBA Day, including the house-wise assembly and formal floral tribute.",
    cover: {
      src: "/assets/albums/oba-day-2025-house-assembly.jpg",
      alt: "Old Boys assembled house-wise on the school grounds during OBA Day 2025.",
      caption: "Old Boys assembled house-wise for the commemorative gathering."
    },
    photos: [
      {
        src: "/assets/albums/oba-day-2025-house-assembly.jpg",
        alt: "Old Boys assembled house-wise on the school grounds during OBA Day 2025.",
        caption: "Old Boys assembled house-wise for the commemorative gathering."
      },
      {
        src: "/assets/albums/oba-day-2025-floral-tribute.jpg",
        alt: "Cadets and OBA members participating in a formal floral tribute during OBA Day 2025.",
        caption: "OBA members paying homage through a formal floral tribute."
      }
    ]
  },
  {
    title: "Annual General Meeting 2025",
    category: "oba",
    label: "AGM",
    summary: "A formal look at the Annual General Meeting, from the committee presentation to the meeting in session.",
    cover: {
      src: "/assets/albums/agm-2025-in-session.jpg",
      alt: "Annual General Meeting 2025 in progress with attendees seated in the hall.",
      caption: "Annual General Meeting (AGM) in progress."
    },
    photos: [
      {
        src: "/assets/albums/agm-2025-managing-committee.jpg",
        alt: "The President introducing the newly elected managing committee on stage.",
        caption: "The President introducing the newly elected Managing Committee."
      },
      {
        src: "/assets/albums/agm-2025-in-session.jpg",
        alt: "Annual General Meeting 2025 in progress with attendees seated in the hall.",
        caption: "Annual General Meeting (AGM) in progress."
      }
    ]
  },
  {
    title: "Blue & White Ball 2025",
    category: "oba",
    label: "September 2025",
    summary: "An evening album from the Blue & White Ball, capturing both the crowd energy and the event atmosphere.",
    cover: {
      src: "/assets/albums/blue-white-2025-camaraderie.jpg",
      alt: "Guests gathered together on the dance floor at the Blue and White Ball 2025.",
      caption: "An evening of camaraderie as Josephites came together at the Blue & White Ball."
    },
    photos: [
      {
        src: "/assets/albums/blue-white-2025-camaraderie.jpg",
        alt: "Guests gathered together on the dance floor at the Blue and White Ball 2025.",
        caption: "An evening of camaraderie as Josephites came together at the Blue & White Ball."
      },
      {
        src: "/assets/albums/blue-white-2025-stage-ambience.jpg",
        alt: "Stage and lighting setup prepared for the Blue and White Ball celebrations.",
        caption: "Stage and ambience prepared for the Blue & White Ball celebrations."
      }
    ]
  },
  {
    title: "OBA Christmas Dinner 2025",
    category: "christmas",
    label: "December 2025",
    summary: "A festive album of Christmas Dinner moments, from carols and Santa to dinner and fellowship.",
    cover: {
      src: "/assets/albums/christmas-dinner-2025-santa.jpg",
      alt: "Santa interacting with children and families at the OBA Christmas Dinner 2025.",
      caption: "Santa giving out candies."
    },
    photos: [
      {
        src: "/assets/albums/christmas-dinner-2025-santa.jpg",
        alt: "Santa interacting with children and families at the OBA Christmas Dinner 2025.",
        caption: "Santa giving out candies."
      },
      {
        src: "/assets/albums/christmas-dinner-2025-carol-singing.jpg",
        alt: "Participants singing carols at the OBA Christmas Dinner 2025.",
        caption: "Carol Singing."
      },
      {
        src: "/assets/albums/christmas-dinner-2025-dinner.jpg",
        alt: "Participants enjoying dinner together at the OBA Christmas Dinner 2025.",
        caption: "Delicious dinner enjoyed by the participants."
      },
      {
        src: "/assets/albums/christmas-dinner-2025-office-bearers.jpg",
        alt: "OBA office bearers pictured with the Father Principal at the Christmas Dinner 2025.",
        caption: "Office Bearers of the OBA with Father Principal."
      }
    ]
  },
  {
    title: "Josephite Run 2026",
    category: "sports",
    label: "January 2026",
    summary: "Photos from the Josephite Run, covering turnout, flag-off, the starting line, and younger participants.",
    cover: {
      src: "/assets/albums/josephite-run-2026-crowd.jpg",
      alt: "A large crowd of participants gathered on campus for Josephite Run 2026.",
      caption: "Over 3,000 participants gather at SJBHS grounds."
    },
    photos: [
      {
        src: "/assets/albums/josephite-run-2026-crowd.jpg",
        alt: "A large crowd of participants gathered on campus for Josephite Run 2026.",
        caption: "Over 3,000 participants gather at SJBHS grounds."
      },
      {
        src: "/assets/albums/josephite-run-2026-flag-off.jpg",
        alt: "Ceremonial flag-off at Josephite Run 2026.",
        caption: "Ceremonial flag-off of Josephite Run 2026."
      },
      {
        src: "/assets/albums/josephite-run-2026-start-line.jpg",
        alt: "Participants assembled at the starting line of Josephite Run 2026.",
        caption: "Participants at the starting line of Josephite Run 2026."
      },
      {
        src: "/assets/albums/josephite-run-2026-young-participants.jpg",
        alt: "Young participants in costume at Josephite Run 2026.",
        caption: "Young participants in vibrant costumes at Josephite Run 2026."
      }
    ]
  },
  {
    title: "Inter-Batch Football Tournament 10.0",
    category: "sports",
    label: "October 2025",
    summary: "A compact match-day album from the Century Inter-Batch Football Tournament 10.0.",
    cover: {
      src: "/assets/albums/football-10-kickoff.jpg",
      alt: "Players and officials preparing for kickoff at the Inter-Batch Football Tournament 10.0.",
      caption: "Players and officials preparing for the commencement of the match."
    },
    photos: [
      {
        src: "/assets/albums/football-10-kickoff.jpg",
        alt: "Players and officials preparing for kickoff at the Inter-Batch Football Tournament 10.0.",
        caption: "Players and officials preparing for the commencement of the match."
      },
      {
        src: "/assets/albums/football-10-lineup.jpg",
        alt: "Josephites lined up ahead of the Inter-Batch Football Tournament 10.0 match.",
        caption: "Mr. Shivaprakash H engaging with Josephites ahead of the match."
      }
    ]
  },
  {
    title: "Prestige–SJBHS OBA Golf Tournament 9.0",
    category: "sports",
    label: "Golf Tournament",
    summary: "A golf-day album with both the turnout shot and on-course play at Prestige Golfshire.",
    cover: {
      src: "/assets/albums/golf-9-group-photo.jpg",
      alt: "A large group of Josephites posing together at the Prestige–SJBHS OBA Golf Tournament 9.0.",
      caption: "A strong turnout of Josephites at the Prestige SJBHS OBA Golf Tournament."
    },
    photos: [
      {
        src: "/assets/albums/golf-9-group-photo.jpg",
        alt: "A large group of Josephites posing together at the Prestige–SJBHS OBA Golf Tournament 9.0.",
        caption: "A strong turnout of Josephites at the Prestige SJBHS OBA Golf Tournament."
      },
      {
        src: "/assets/albums/golf-9-putting.jpg",
        alt: "Focused play on the golf course during the OBA Golf Tournament.",
        caption: "Focused play and sportsmanship on display at the OBA Golf Tournament."
      }
    ]
  },
  {
    title: "Jimmy Anklesaria Cricket Tournament 2025",
    category: "sports",
    label: "November 2025",
    summary: "Tournament-day scenes from the Jimmy Anklesaria Cricket Tournament, including the opening prayer and invited-team group photo.",
    cover: {
      src: "/assets/albums/cricket-2025-opening-prayer.jpg",
      alt: "Players and officials gathered in prayer during the opening ceremony of the cricket tournament.",
      caption: "Players and officials observing a moment of prayer during the opening ceremony."
    },
    photos: [
      {
        src: "/assets/albums/cricket-2025-opening-prayer.jpg",
        alt: "Players and officials gathered in prayer during the opening ceremony of the cricket tournament.",
        caption: "Players and officials observing a moment of prayer during the opening ceremony."
      },
      {
        src: "/assets/albums/cricket-2025-pandithahalli-group.jpg",
        alt: "St. Joseph's Pandithahalli pictured with members of the OBA Managing Committee.",
        caption: "St. Joseph's Pandithahalli with the members of the OBA MC."
      }
    ]
  },
  {
    title: "Chennai Connect 2025",
    category: "connect",
    label: "Chapter meet",
    summary: "A Chennai chapter album capturing the full group at the Madras Club gathering.",
    cover: {
      src: "/assets/albums/chennai-connect-2025-group.jpg",
      alt: "Group photo from Chennai Connect 2025 outside the venue.",
      caption: "Chennai Connect 2025."
    },
    photos: [
      {
        src: "/assets/albums/chennai-connect-2025-group.jpg",
        alt: "Group photo from Chennai Connect 2025 outside the venue.",
        caption: "Chennai Connect 2025."
      }
    ]
  },
  {
    title: "UK Connect 2025",
    category: "connect",
    label: "London meet",
    summary: "A London chapter album showing the pre-Christmas UK alumni gathering.",
    cover: {
      src: "/assets/albums/uk-connect-2025-london-meet.jpg",
      alt: "UK alumni gathered together around a table in London during UK Connect 2025.",
      caption: "UK Alumni Meet in London."
    },
    photos: [
      {
        src: "/assets/albums/uk-connect-2025-london-meet.jpg",
        alt: "UK alumni gathered together around a table in London during UK Connect 2025.",
        caption: "UK Alumni Meet in London."
      }
    ]
  },
  {
    title: "Coorg Chapter 2025",
    category: "connect",
    label: "Coorg chapter",
    summary: "Photos from the Coorg chapter annual meet, covering both the formal proceedings and the gathered families.",
    cover: {
      src: "/assets/albums/coorg-chapter-2025-families.jpg",
      alt: "Josephites and their families standing together during the Coorg chapter annual meet.",
      caption: "Josephites and their families in attendance for the connect."
    },
    photos: [
      {
        src: "/assets/albums/coorg-chapter-2025-office-bearers.jpg",
        alt: "Office bearers of the Coorg Connect and the OBA Managing Committee at the event.",
        caption: "Office Bearers of the Coorg Connect and the OBA MC at the event."
      },
      {
        src: "/assets/albums/coorg-chapter-2025-families.jpg",
        alt: "Josephites and their families standing together during the Coorg chapter annual meet.",
        caption: "Josephites and their families in attendance for the connect."
      }
    ]
  },
  {
    title: "Kerala Christmas Meet 2025",
    category: "christmas",
    label: "Kerala chapter",
    summary: "A Kerala chapter group portrait from the Christmas meet in Kochi with the OBA Bikers.",
    cover: {
      src: "/assets/albums/kerala-christmas-meet-2025-group.jpg",
      alt: "Kerala Connect and the OBA Bikers gathered together for the Kerala Christmas Meet 2025.",
      caption: "Christmas cheer in Kochi as Kerala Connect and the OBA Bikers came together in true Josephite spirit."
    },
    photos: [
      {
        src: "/assets/albums/kerala-christmas-meet-2025-group.jpg",
        alt: "Kerala Connect and the OBA Bikers gathered together for the Kerala Christmas Meet 2025.",
        caption: "Christmas cheer in Kochi as Kerala Connect and the OBA Bikers came together in true Josephite spirit."
      }
    ]
  },
  {
    title: "Delhi Connect 2026",
    category: "connect",
    label: "February 2026",
    summary: "A fuller chapter album from Delhi Connect, including the group photo, Metro Museum visit, and candid fellowship moment.",
    cover: {
      src: "/assets/albums/delhi-connect-2026-group-photo.jpg",
      alt: "Group photo from Delhi Connect 2026 with Josephites and families together outdoors.",
      caption: "Josephites united in fellowship at Delhi Connect 2026."
    },
    photos: [
      {
        src: "/assets/albums/delhi-connect-2026-group-photo.jpg",
        alt: "Group photo from Delhi Connect 2026 with Josephites and families together outdoors.",
        caption: "Josephites united in fellowship at Delhi Connect 2026."
      },
      {
        src: "/assets/albums/delhi-connect-2026-metro-museum.jpg",
        alt: "Participants visiting the Delhi Metro Museum during Delhi Connect 2026.",
        caption: "A visit to the Delhi Metro Museum."
      },
      {
        src: "/assets/albums/delhi-connect-2026-fellowship.jpg",
        alt: "Participants in conversation during Delhi Connect 2026.",
        caption: "Fellowship at the Connect."
      }
    ]
  },
  {
    title: "Welcome to the OBA & Josexcel Awards 2026",
    category: "school",
    label: "Student induction",
    summary: "Group-event moments from the student induction and awards programme, focused on the gathering rather than the individual award portraits.",
    cover: {
      src: "/assets/albums/welcome-to-oba-2026-auditorium.jpg",
      alt: "Students and guests gathered in the auditorium during Welcome to the OBA and Josexcel Awards 2026.",
      caption: "Students of Classes 10 and 12 welcomed into the OBA community."
    },
    photos: [
      {
        src: "/assets/albums/welcome-to-oba-2026-auditorium.jpg",
        alt: "Students and guests gathered in the auditorium during Welcome to the OBA and Josexcel Awards 2026.",
        caption: "Students of Classes 10 and 12 welcomed into the OBA community."
      },
      {
        src: "/assets/albums/welcome-to-oba-2026-student-gathering.jpg",
        alt: "The auditorium filled with students and guests during Welcome to the OBA and Josexcel Awards 2026.",
        caption: "Auditorium gathering during Welcome to the OBA and Josexcel Awards 2026."
      }
    ]
  },
  {
    title: "Women Who Lead - Jayna Kothari Session",
    category: "school",
    label: "Talk initiative",
    summary: "Group-event moments from the first Women Who Lead session, including student interaction, Q&A, and the closing group photograph.",
    cover: {
      src: "/assets/albums/women-who-lead-2026-student-qna.jpg",
      alt: "A student speaking during the Women Who Lead session with Jayna Kothari.",
      caption: "An engaging Women Who Lead session."
    },
    photos: [
      {
        src: "/assets/albums/women-who-lead-2026-corridor-conversation.jpg",
        alt: "Jayna Kothari in conversation with students on campus.",
        caption: "Interaction with students on campus."
      },
      {
        src: "/assets/albums/women-who-lead-2026-student-qna.jpg",
        alt: "A student speaking during the Women Who Lead session with Jayna Kothari.",
        caption: "An engaging Women Who Lead session."
      },
      {
        src: "/assets/albums/women-who-lead-2026-group-photo.jpg",
        alt: "Group photo after the Women Who Lead session with Jayna Kothari.",
        caption: "Group photo following the Women Who Lead session."
      }
    ]
  }
];

const eventAlbums: EventAlbum[] = rawEventAlbums.map((album) => ({
  ...album,
  cover: withAlbumAssetVersion(album.cover),
  photos: album.photos.map(withAlbumAssetVersion)
}));

export const groupedEventAlbums: AlbumFolder[] = albumCategories.map((category) => ({
  ...category,
  albums: eventAlbums.filter((album) => album.category === category.id)
}));

export const sponsorMaterials: GalleryImage[] = [
  {
    src: "/assets/call-for-sponsors-1.png",
    alt: "First page of the North America Connect 2026 call for sponsors packet.",
    caption: "Call for Sponsors: overview page"
  },
  {
    src: "/assets/call-for-sponsors-2.png",
    alt: "Second page of the North America Connect 2026 call for sponsors packet detailing sponsor tiers.",
    caption: "Call for Sponsors: sponsorship tiers"
  }
];

export const connectPlaceholders: SecondaryPage[] = [
  {
    title: "Pricing",
    body:
      "Early Bird Pricing (through June 15th 2026): Full Event $80; Dinner Only $60; Picnic Only $30. Regular Pricing (June 15th - Aug 31st 2026): Full Event $100; Dinner Only $70; Picnic Only $40. Full Time University Students (SJBHS Alumni) and kids 12 and under are free with registration."
  },
  {
    title: "Schedule",
    body:
      "Cocktails, Dinner and Dancing: Saturday, September 19th 2026, 6:30pm - 2am at All Go Rhythms Bar & Restaurant. Picnic Lunch and Games: Sunday, September 20th 2026, 11am - 4pm at Lake Fairfax Park, Canopy G."
  },
  {
    title: "Travel and Stay",
    body:
      "Recommended airport: IAD. United promo code ZSJE201804 is applicable for travel to/from IAD between 9/18-9/21. The hotel room block is at Hyatt Regency Dulles with group code G-SJ18 and is available on a first come basis through Aug 21 2026."
  },
  {
    title: "Josephite Merchandise",
    body: "Josephite merchandise details will be available soon. Pre-orders open after Aug 1st, with event pickup during the reunion."
  },
  {
    title: "Local Attractions",
    body:
      "Local attraction previews link to official visitor guides and local planning sources for monuments, Smithsonian museums, Old Town Alexandria, Georgetown, National Harbor, restaurants, wineries, breweries, historic sites, trails, nature centers, and nightlife."
  }
];

export const defaultConnectPageContent: ConnectPageContent = {
  sponsorMessage: defaultConnectSponsorMessage,
  detailLinks: ["Pricing", "Schedule", "Travel & Stay", "Josephite Merchandise", "Local Attractions", "Sponsor"],
  pricing: [
    {
      title: "Early Bird Pricing",
      period: "Through June 15th 2026",
      options: ["Full Event: $80", "Dinner Only: $60", "Picnic Only: $30"]
    },
    {
      title: "Regular Pricing",
      period: "June 15th - Aug 31st 2026",
      options: ["Full Event: $100", "Dinner Only: $70", "Picnic Only: $40"]
    }
  ],
  complimentaryTickets: [
    "Full Time University Students (SJBHS Alumni): Free (Registration Required)",
    "Kids (12 and under): Free (Registration Required)"
  ],
  travel: {
    recommendedAirport: "IAD",
    airportImageSrc: "/assets/dulles-airport-terminal.jpg",
    airportImageAlt: "Main terminal of Washington Dulles International Airport",
    discountLabel: "Promo Code: ZSJE201804 (valid for travel to/from IAD between 9/18-9/21)",
    discountHref: "https://www.united.com/en/us/book-flight/united-reservations?txtPromoCode=ZSJE201804",
    otherAirports: ["DCA", "BWI"]
  },
  stay: {
    hotelBlockLabel: "Group Code: G-SJ18",
    hotelBlockHref: "https://www.hyatt.com/events/en-US/group-booking/DULLE/G-SJ18",
    hotelName: "Hyatt Regency Dulles",
    address: "2300 Dulles Corner Blvd., Herndon, VA 20171",
    hotelImageSrc: "/assets/hyatt-regency-dulles-exterior.jpg",
    hotelImageAlt: "Exterior of Hyatt Regency Dulles",
    contact: "Book through the Hyatt group link.",
    courtesyBlock: "Hotel room block available on a first come basis through Aug 21 2026.",
    shuttle: "Complimentary shuttle service is provided between IAD and Hyatt Regency Dulles."
  },
  schedule: [
    {
      title: "Cocktails, Dinner and Dancing",
      dateTime: "Saturday, September 19th 2026, 6:30pm - 2am",
      venue: "All Go Rhythms Bar & Restaurant",
      address: "21035 Dulles Town Cir, Sterling, VA 20166",
      mapHref: "https://maps.app.goo.gl/GGzvULv1g1pSUoYg7?g_st=aw",
      highlights: ["Dancefloor", "DJ", "Photobooth", "Buffet and Live Counters", "Cash Bar", "Josephite Merchandise"]
    },
    {
      title: "Picnic Lunch and Games",
      dateTime: "Sunday, September 20th 2026, 11am - 4pm",
      venue: "Lake Fairfax Park, Canopy G",
      address: "Reston, VA 20190",
      mapHref: "https://maps.app.goo.gl/hMqWhjRLvm8n3Hhy7?g_st=aw",
      highlights: ["Soccer", "Tug of War", "Games for Adults and Kids", "More"]
    }
  ],
  merchandise: {
    body: "Merchandise details will be available soon.",
    preorder:
      "Visit here after Aug 1st to pre-order your merchandise before the event and pick up during the reunion. Limited supplies."
  },
  attractions: [
    "Monuments & Memorials",
    "Smithsonian Museums",
    "Old Town Alexandria",
    "Georgetown",
    "National Harbor",
    "Michelin Star Restaurants",
    "Loudoun Wineries",
    "LoCo Ale Trail",
    "Historic Districts",
    "Trails & Nature Centers",
    "DC Nightlife"
  ],
  sponsorDetails: [
    "Corporate Sponsorship: Perfect for promoting your brand/business to hundreds of Josephites.",
    "Individual Sponsorship: A great way to contribute in your personal capacity.",
    "Batch Sponsorship: Team up with classmates to sponsor as a group, such as The Class of '08.",
    "Additional advertising add-ons are available for DJ/Music sponsors, Swag Bag Sponsor, Cocktail Bar sponsor, Photobooth sponsor, and more.",
    "Whether you choose to advertise a business or simply give back to our teachers, your support makes a massive difference."
  ],
  sponsorTiers: [
    { title: "Gold Sponsors", amount: "$1500+" },
    { title: "Silver Sponsors", amount: "$1000 - $1499" },
    { title: "Bronze Sponsors", amount: "$500 - $999" }
  ],
  sponsors: [
    {
      name: "Sponsor name coming soon",
      website: "",
      logoSrc: "/assets/oba-connect-mark.png",
      logoAlt: "North America Connect sponsor placeholder"
    }
  ],
  placeholders: connectPlaceholders
};

export const secondaryPages: SecondaryPage[] = [
  {
    title: "About Us",
    body: "A concise introduction to JAANA, the school, and the wider mission can expand here over time."
  },
  {
    title: "Gallery and previous reunions",
    body: "Past reunions and photo archives can continue to support the story of the community without competing with current priorities."
  },
  {
    title: "Mentor, Volunteer, Statements, and External Sites",
    body: "These areas can be developed next as the giving experience and North America Connect 2026 campaign continue to mature."
  }
];

export const houseShields: HouseShield[] = [
  {
    src: "/assets/house-pins/house-andrew-pin.png",
    alt: "St. Andrew house shield"
  },
  {
    src: "/assets/house-pins/house-david-pin.png",
    alt: "St. David house shield"
  },
  {
    src: "/assets/house-pins/house-george-pin.png",
    alt: "St. George house shield"
  },
  {
    src: "/assets/house-pins/house-patrick-pin.png",
    alt: "St. Patrick house shield"
  }
];

export const contactChannels: ContactChannel[] = [
  {
    label: "Email",
    value: "jaanagroup@gmail.com",
    href: "mailto:jaanagroup@gmail.com"
  },
  {
    label: "Finance Team",
    value: "jaanafinance@gmail.com",
    href: "mailto:jaanafinance@gmail.com"
  },
  {
    label: "WhatsApp",
    value: "WhatsApp Group",
    href: "https://chat.whatsapp.com/C7vOhDVI2sw4HIMC5W2n9P"
  },
  {
    label: "LinkedIn",
    value: "JAANA Group",
    href: "https://www.linkedin.com/groups/8288101/"
  }
];

export const inquiryTopics = [
  "Support a cause",
  "Donate from the USA",
  "Create a named endowment",
  "Corporate matching eligibility",
  "Sponsor North America Connect 2026",
  "General alumni question"
];

export const initialForm: InquiryForm = {
  name: "",
  email: "",
  organization: "",
  interest: "",
  notes: "",
  recipientGroup: "general"
};
