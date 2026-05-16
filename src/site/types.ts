export type TabId = "home" | "causes" | "donate" | "contact" | "connect";

export type InquiryForm = {
  name: string;
  email: string;
  organization: string;
  interest: string;
  notes: string;
  recipientGroup: "general" | "finance";
};

export type TabConfig = {
  id: TabId;
  label: string;
  kicker: string;
  title: string;
  copy: string;
};

export type HomePageCopy = {
  heroMotto: string;
  heroLead: string;
  aboutTitle: string;
  aboutBody: string;
  quickLinksTitle: string;
  causesCardTitle: string;
  causesCardBody: string;
  donateCardTitle: string;
  donateCardBody: string;
  connectCardTitle: string;
  connectCardBody: string;
  eventsTitle: string;
  upcomingEventsTitle: string;
  upcomingEventsBody: string;
  pastEventsTitle: string;
  pastEventsBody: string;
};

export type CausesPageCopy = {
  sectionHeading: string;
};

export type DonatePageCopy = {
  onlineGivingHeading: string;
  onlineGivingBody: string;
  contactHeading: string;
  contactBody: string;
  formHeading: string;
  formBody: string;
};

export type DonationRouteAction = "endowment" | "grant" | "smallGift" | "matching" | "custom";

export type DonationRoute = {
  id: string;
  title: string;
  minimum: string;
  body: string;
  action: DonationRouteAction;
  customActionLabel?: string;
};

export type DonationInfoId = "endowment" | "grant" | "smallGift";

export type DonationInfoSection = {
  title: string;
  items: string[];
};

export type DonationInfoContent = {
  id: DonationInfoId;
  label: string;
  title: string;
  summary: string;
  sections: DonationInfoSection[];
};

export type ConnectPageCopy = {
  posterLabel: string;
  posterTitle: string;
  posterBody: string;
  sponsorHeading: string;
  sponsorBody: string;
  scheduleHeading: string;
  scheduleBody: string;
};

export type PriorityCard = {
  title: string;
  body: string;
  points: string[];
  cta: string;
  tab: TabId;
};

export type CauseCard = {
  title: string;
  summary: string;
  minimum: string;
  purpose: string;
  goal: string;
  impact: string;
  support: string[];
  donationWays: string[];
};

export type ContactChannel = {
  label: string;
  value: string;
  href: string;
};

export type SponsorTier = {
  title: string;
  amount: string;
  benefits: string[];
};

export type EventHighlight = {
  title: string;
  body: string;
};

export type SecondaryPage = {
  title: string;
  body: string;
};

export type ConnectPricingGroup = {
  title: string;
  period: string;
  options: string[];
};

export type ConnectTravelContent = {
  recommendedAirport: string;
  discountLabel: string;
  discountHref: string;
  otherAirports: string[];
};

export type ConnectStayContent = {
  hotelBlockLabel: string;
  hotelBlockHref: string;
  hotelName: string;
  address: string;
  hotelImageSrc: string;
  hotelImageAlt: string;
  contact: string;
  courtesyBlock: string;
  shuttle: string;
};

export type ConnectScheduleItem = {
  title: string;
  dateTime: string;
  venue: string;
  address: string;
  mapHref?: string;
  highlights: string[];
};

export type ConnectMerchandiseContent = {
  body: string;
  preorder: string;
};

export type ConnectSponsorPageTier = {
  title: string;
  amount: string;
};

export type ConnectSponsorEntry = {
  name: string;
  website: string;
  logoSrc: string;
  logoAlt: string;
};

export type ConnectPageContent = {
  sponsorMessage: string;
  detailLinks: string[];
  pricing: ConnectPricingGroup[];
  complimentaryTickets: string[];
  travel: ConnectTravelContent;
  stay: ConnectStayContent;
  schedule: ConnectScheduleItem[];
  merchandise: ConnectMerchandiseContent;
  attractions: string[];
  sponsorDetails: string[];
  sponsorTiers: ConnectSponsorPageTier[];
  sponsors: ConnectSponsorEntry[];
  placeholders: SecondaryPage[];
};

export type GalleryImage = {
  src: string;
  alt: string;
  caption: string;
};

export type AlbumCategoryId = string;

export type EventAlbum = {
  id?: string;
  title: string;
  category: AlbumCategoryId;
  label: string;
  summary: string;
  cover: GalleryImage;
  photos: GalleryImage[];
};

export type AlbumFolder = {
  id: AlbumCategoryId;
  title: string;
  description: string;
  albums: EventAlbum[];
};

export type HouseShield = {
  src: string;
  alt: string;
};

export type SiteContent = {
  tabs: TabConfig[];
  impactStats: { value: string; label: string }[];
  priorityCards: PriorityCard[];
  causeCards: CauseCard[];
  donationRoutes: DonationRoute[];
  donationInfo: DonationInfoContent[];
  sponsorHighlights: EventHighlight[];
  sponsorTiers: SponsorTier[];
  connectMoments: GalleryImage[];
  groupedEventAlbums: AlbumFolder[];
  sponsorMaterials: GalleryImage[];
  connectPage: ConnectPageContent;
  secondaryPages: SecondaryPage[];
  houseShields: HouseShield[];
  contactChannels: ContactChannel[];
  inquiryTopics: string[];
  homeCopy: HomePageCopy;
  causesCopy: CausesPageCopy;
  donateCopy: DonatePageCopy;
  connectCopy: ConnectPageCopy;
};
