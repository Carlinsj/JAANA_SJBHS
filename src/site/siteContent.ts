import type {
  AlbumFolder,
  ConnectPageCopy,
  ConnectPageContent,
  ConnectMerchandiseContent,
  ConnectPricingGroup,
  ConnectScheduleItem,
  ConnectSponsorEntry,
  ConnectSponsorPageTier,
  ConnectStayContent,
  ConnectTravelContent,
  ContactChannel,
  CauseCard,
  CausesPageCopy,
  DonatePageCopy,
  DonationInfoContent,
  DonationRoute,
  EventAlbum,
  EventHighlight,
  GalleryImage,
  HomePageCopy,
  HouseShield,
  PriorityCard,
  SecondaryPage,
  SiteContent,
  SponsorTier,
  TabConfig
} from "./types.js";
import {
  causeCards,
  connectMoments,
  defaultConnectPageContent,
  groupedEventAlbums,
  houseShields,
  impactStats,
  inquiryTopics,
  priorityCards,
  sponsorHighlights,
  sponsorMaterials,
  sponsorTiers,
  secondaryPages,
  tabs,
  contactChannels,
  donationInfo,
  donationRoutes
} from "./content.js";

export const defaultHomeCopy: HomePageCopy = {
  heroMotto: "Fide et Labore.",
  heroLead:
    "JAANA supports St. Joseph's Boys' High School through alumni-led service, giving, and community events across North America.",
  aboutTitle: "About JAANA",
  aboutBody:
    "The Josephite Alumni Association of North America brings together SJBHS alumni and families to support scholarships, teacher welfare, student programmes, and school development through trusted giving and active fellowship.",
  quickLinksTitle: "Quick links",
  causesCardTitle: "Causes",
  causesCardBody: "Review the active school causes and decide where you want your support to go.",
  donateCardTitle: "Donate",
  donateCardBody: "Review giving routes on the Donate page, then use Contact Us if you need help with a gift.",
  connectCardTitle: "North America Connect 2026",
  connectCardBody: "Register, sponsor, or review the full September 2026 reunion weekend details.",
  eventsTitle: "Upcoming JAANA events | Past JAANA events",
  upcomingEventsTitle: "Upcoming JAANA events",
  upcomingEventsBody: "North America Connect 2026 | September 19-20, 2026 | Northern Virginia and the Washington, D.C. metro area.",
  pastEventsTitle: "Past JAANA events",
  pastEventsBody: "Browse past OBA and Connect event albums in a dialog view."
};

export const defaultCausesCopy: CausesPageCopy = {
  sectionHeading: "Choose where your support goes"
};

export const defaultDonateCopy: DonatePageCopy = {
  onlineGivingHeading: "Ways to donate",
  onlineGivingBody: "",
  contactHeading: "Contacts",
  contactBody: "Use the details below or send a note through the inquiry form.",
  formHeading: "Inquiry form",
  formBody: "Use this form for donations, sponsorship inquiries, or alumni questions."
};

export const defaultConnectCopy: ConnectPageCopy = {
  posterLabel: "Save the Date",
  posterTitle: "North America Connect 2026",
  posterBody: "Washington, D.C. metro area | Saturday Dinner | Sunday Picnic Lunch | September 19-20, 2026",
  sponsorHeading: "Sponsor North America Connect 2026",
  sponsorBody:
    "We are seeking sponsors for our North America Connect reunion. Your brand or business will have the opportunity to reach hundreds of successful Josephites and their families. Proceeds from the event will fund the OBA Teachers Insurance Program. Individual and batch benefactors are also warmly welcome.",
  scheduleHeading: "Register Today for the North America Connect 2026 Reunion",
  scheduleBody: "Find pricing, schedule, travel, stay, Josephite merchandise, and local attraction details below."
};

const makeAlbumKey = (album: Partial<EventAlbum> | undefined, folderId: string, index: number) => {
  const explicitId = typeof album?.id === "string" && album.id.trim() ? album.id.trim() : "";
  const title = typeof album?.title === "string" && album.title.trim() ? album.title.trim() : "album";

  return explicitId || `${folderId}-${index}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
};

function normalizeImage(image: Partial<GalleryImage> | undefined, fallback: GalleryImage): GalleryImage {
  return {
    src: typeof image?.src === "string" && image.src.trim() ? image.src.trim() : fallback.src,
    alt: typeof image?.alt === "string" && image.alt.trim() ? image.alt.trim() : fallback.alt,
    caption:
      typeof image?.caption === "string" && image.caption.trim() ? image.caption.trim() : fallback.caption
  };
}

function normalizeTab(tab: Partial<TabConfig> | undefined, fallback: TabConfig): TabConfig {
  return {
    id: typeof tab?.id === "string" && tab.id.trim() ? (tab.id.trim() as TabConfig["id"]) : fallback.id,
    label: typeof tab?.label === "string" && tab.label.trim() ? tab.label.trim() : fallback.label,
    kicker: typeof tab?.kicker === "string" && tab.kicker.trim() ? tab.kicker.trim() : fallback.kicker,
    title: typeof tab?.title === "string" && tab.title.trim() ? tab.title.trim() : fallback.title,
    copy: typeof tab?.copy === "string" && tab.copy.trim() ? tab.copy.trim() : fallback.copy
  };
}

function normalizeCause(cause: Partial<CauseCard> | undefined, fallback: CauseCard): CauseCard {
  return {
    title: typeof cause?.title === "string" && cause.title.trim() ? cause.title.trim() : fallback.title,
    summary: typeof cause?.summary === "string" && cause.summary.trim() ? cause.summary.trim() : fallback.summary,
    minimum: typeof cause?.minimum === "string" && cause.minimum.trim() ? cause.minimum.trim() : fallback.minimum,
    purpose: typeof cause?.purpose === "string" && cause.purpose.trim() ? cause.purpose.trim() : fallback.purpose,
    goal: typeof cause?.goal === "string" && cause.goal.trim() ? cause.goal.trim() : fallback.goal,
    impact: typeof cause?.impact === "string" && cause.impact.trim() ? cause.impact.trim() : fallback.impact,
    support: Array.isArray(cause?.support) && cause.support.length ? cause.support.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim()) : fallback.support,
    donationWays:
      Array.isArray(cause?.donationWays) && cause.donationWays.length
        ? cause.donationWays.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim())
        : fallback.donationWays
  };
}

function normalizeDonationRoute(route: Partial<DonationRoute> | undefined, fallback: DonationRoute): DonationRoute {
  const action = route?.action;
  const customActionLabel =
    typeof route?.customActionLabel === "string" && route.customActionLabel.trim()
      ? route.customActionLabel.trim()
      : fallback.customActionLabel ?? "Donate Today";

  return {
    id: typeof route?.id === "string" && route.id.trim() ? route.id.trim() : fallback.id,
    title: typeof route?.title === "string" && route.title.trim() ? route.title.trim() : fallback.title,
    minimum: typeof route?.minimum === "string" && route.minimum.trim() ? route.minimum.trim() : fallback.minimum,
    body: typeof route?.body === "string" && route.body.trim() ? route.body.trim() : fallback.body,
    action:
      action === "endowment" || action === "grant" || action === "smallGift" || action === "matching" || action === "custom"
        ? action
        : fallback.action,
    customActionLabel
  };
}

function normalizeDonationInfo(info: Partial<DonationInfoContent> | undefined, fallback: DonationInfoContent): DonationInfoContent {
  const fallbackSections = fallback.sections;
  const sectionCount = Math.max(info?.sections?.length ?? 0, fallbackSections.length);

  return {
    id:
      info?.id === "endowment" || info?.id === "grant" || info?.id === "smallGift"
        ? info.id
        : fallback.id,
    label: typeof info?.label === "string" && info.label.trim() ? info.label.trim() : fallback.label,
    title: typeof info?.title === "string" && info.title.trim() ? info.title.trim() : fallback.title,
    summary: typeof info?.summary === "string" && info.summary.trim() ? info.summary.trim() : fallback.summary,
    sections: Array.from({ length: sectionCount }, (_, sectionIndex) => {
      const section = info?.sections?.[sectionIndex];
      const fallbackSection = fallbackSections[sectionIndex] ?? {
        title: "Details",
        items: ["Add detail."]
      };

      return {
        title:
          typeof section?.title === "string" && section.title.trim()
            ? section.title.trim()
            : fallbackSection.title,
        items:
          Array.isArray(section?.items) && section.items.length
            ? section.items.filter((item): item is string => typeof item === "string" && Boolean(item.trim())).map((item) => item.trim())
            : fallbackSection.items
      };
    })
  };
}

function normalizePriorityCard(card: Partial<PriorityCard> | undefined, fallback: PriorityCard): PriorityCard {
  return {
    title: typeof card?.title === "string" && card.title.trim() ? card.title.trim() : fallback.title,
    body: typeof card?.body === "string" && card.body.trim() ? card.body.trim() : fallback.body,
    points:
      Array.isArray(card?.points) && card.points.length
        ? card.points.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim())
        : fallback.points,
    cta: typeof card?.cta === "string" && card.cta.trim() ? card.cta.trim() : fallback.cta,
    tab: typeof card?.tab === "string" ? (card.tab as PriorityCard["tab"]) : fallback.tab
  };
}

function normalizeHighlight(highlight: Partial<EventHighlight> | undefined, fallback: EventHighlight): EventHighlight {
  return {
    title: typeof highlight?.title === "string" && highlight.title.trim() ? highlight.title.trim() : fallback.title,
    body: typeof highlight?.body === "string" && highlight.body.trim() ? highlight.body.trim() : fallback.body
  };
}

function normalizeTier(tier: Partial<SponsorTier> | undefined, fallback: SponsorTier): SponsorTier {
  return {
    title: typeof tier?.title === "string" && tier.title.trim() ? tier.title.trim() : fallback.title,
    amount: typeof tier?.amount === "string" && tier.amount.trim() ? tier.amount.trim() : fallback.amount,
    benefits:
      Array.isArray(tier?.benefits) && tier.benefits.length
        ? tier.benefits.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim())
        : fallback.benefits
  };
}

function normalizeSecondaryPage(page: Partial<SecondaryPage> | undefined, fallback: SecondaryPage): SecondaryPage {
  return {
    title: typeof page?.title === "string" && page.title.trim() ? page.title.trim() : fallback.title,
    body: typeof page?.body === "string" && page.body.trim() ? page.body.trim() : fallback.body
  };
}

function normalizeHouseShield(shield: Partial<HouseShield> | undefined, fallback: HouseShield): HouseShield {
  return {
    src: typeof shield?.src === "string" && shield.src.trim() ? shield.src.trim() : fallback.src,
    alt: typeof shield?.alt === "string" && shield.alt.trim() ? shield.alt.trim() : fallback.alt
  };
}

function normalizeChannel(channel: Partial<ContactChannel> | undefined, fallback: ContactChannel): ContactChannel {
  return {
    label: typeof channel?.label === "string" && channel.label.trim() ? channel.label.trim() : fallback.label,
    value: typeof channel?.value === "string" && channel.value.trim() ? channel.value.trim() : fallback.value,
    href: typeof channel?.href === "string" && channel.href.trim() ? channel.href.trim() : fallback.href
  };
}

function normalizeAlbum(
  album: Partial<EventAlbum> | undefined,
  fallback: EventAlbum | undefined,
  folderId: string,
  index: number
): EventAlbum {
  const fallbackAlbum =
    fallback ??
    ({
      id: `${folderId}-${index}`,
      title: "New album",
      category: folderId,
      label: "Album",
      summary: "",
      cover: {
        src: "/assets/jaana-wordmark.png",
        alt: "Album cover",
        caption: "Album cover"
      },
      photos: []
    } satisfies EventAlbum);
  const normalizedPhotos = Array.isArray(album?.photos)
    ? album.photos.map((photo, photoIndex) => normalizeImage(photo, fallbackAlbum.photos[photoIndex] ?? fallbackAlbum.cover))
    : fallbackAlbum.photos;

  return {
    id: makeAlbumKey(album, folderId, index),
    title: typeof album?.title === "string" && album.title.trim() ? album.title.trim() : fallbackAlbum.title,
    category: folderId,
    label: typeof album?.label === "string" && album.label.trim() ? album.label.trim() : fallbackAlbum.label,
    summary: typeof album?.summary === "string" && album.summary.trim() ? album.summary.trim() : fallbackAlbum.summary,
    cover: normalizeImage(album?.cover, normalizedPhotos[0] ?? fallbackAlbum.cover),
    photos: normalizedPhotos
  };
}

function normalizeFolder(folder: Partial<AlbumFolder> | undefined, fallback: AlbumFolder): AlbumFolder {
  const folderId = typeof folder?.id === "string" && folder.id.trim() ? folder.id.trim() : fallback.id;

  return {
    id: folderId,
    title: typeof folder?.title === "string" && folder.title.trim() ? folder.title.trim() : fallback.title,
    description:
      typeof folder?.description === "string" && folder.description.trim()
        ? folder.description.trim()
        : fallback.description,
    albums: Array.isArray(folder?.albums)
      ? folder.albums.map((album, index) => normalizeAlbum(album, fallback.albums[index], folderId, index))
      : fallback.albums.map((album, index) => normalizeAlbum(album, album, folderId, index))
  };
}

function normalizeConnectCopy(copy: Partial<ConnectPageCopy> | undefined): ConnectPageCopy {
  return {
    posterLabel:
      typeof copy?.posterLabel === "string" && copy.posterLabel.trim() ? copy.posterLabel.trim() : defaultConnectCopy.posterLabel,
    posterTitle:
      typeof copy?.posterTitle === "string" && copy.posterTitle.trim() ? copy.posterTitle.trim() : defaultConnectCopy.posterTitle,
    posterBody:
      typeof copy?.posterBody === "string" && copy.posterBody.trim() ? copy.posterBody.trim() : defaultConnectCopy.posterBody,
    sponsorHeading:
      typeof copy?.sponsorHeading === "string" && copy.sponsorHeading.trim()
        ? copy.sponsorHeading.trim()
        : defaultConnectCopy.sponsorHeading,
    sponsorBody:
      typeof copy?.sponsorBody === "string" && copy.sponsorBody.trim() ? copy.sponsorBody.trim() : defaultConnectCopy.sponsorBody,
    scheduleHeading:
      typeof copy?.scheduleHeading === "string" && copy.scheduleHeading.trim()
        ? copy.scheduleHeading.trim()
        : defaultConnectCopy.scheduleHeading,
    scheduleBody:
      typeof copy?.scheduleBody === "string" && copy.scheduleBody.trim() ? copy.scheduleBody.trim() : defaultConnectCopy.scheduleBody
  };
}

function normalizeStringArray(value: unknown, fallback: string[]): string[] {
  const values = Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())).map((item) => item.trim())
    : [];

  return values.length ? values : fallback;
}

function normalizePricingGroup(
  group: Partial<ConnectPricingGroup> | undefined,
  fallback: ConnectPricingGroup
): ConnectPricingGroup {
  return {
    title: typeof group?.title === "string" && group.title.trim() ? group.title.trim() : fallback.title,
    period: typeof group?.period === "string" && group.period.trim() ? group.period.trim() : fallback.period,
    options: normalizeStringArray(group?.options, fallback.options)
  };
}

function normalizeTravelContent(
  travel: Partial<ConnectTravelContent> | undefined,
  fallback: ConnectTravelContent
): ConnectTravelContent {
  return {
    recommendedAirport:
      typeof travel?.recommendedAirport === "string" && travel.recommendedAirport.trim()
        ? travel.recommendedAirport.trim()
        : fallback.recommendedAirport,
    discountLabel:
      typeof travel?.discountLabel === "string" && travel.discountLabel.trim()
        ? travel.discountLabel.trim()
        : fallback.discountLabel,
    discountHref: typeof travel?.discountHref === "string" ? travel.discountHref.trim() : fallback.discountHref,
    otherAirports: normalizeStringArray(travel?.otherAirports, fallback.otherAirports)
  };
}

function normalizeStayContent(stay: Partial<ConnectStayContent> | undefined, fallback: ConnectStayContent): ConnectStayContent {
  return {
    hotelBlockLabel:
      typeof stay?.hotelBlockLabel === "string" && stay.hotelBlockLabel.trim()
        ? stay.hotelBlockLabel.trim()
        : fallback.hotelBlockLabel,
    hotelBlockHref: typeof stay?.hotelBlockHref === "string" ? stay.hotelBlockHref.trim() : fallback.hotelBlockHref,
    hotelName: typeof stay?.hotelName === "string" && stay.hotelName.trim() ? stay.hotelName.trim() : fallback.hotelName,
    address: typeof stay?.address === "string" && stay.address.trim() ? stay.address.trim() : fallback.address,
    contact: typeof stay?.contact === "string" && stay.contact.trim() ? stay.contact.trim() : fallback.contact,
    courtesyBlock:
      typeof stay?.courtesyBlock === "string" && stay.courtesyBlock.trim()
        ? stay.courtesyBlock.trim()
        : fallback.courtesyBlock,
    shuttle: typeof stay?.shuttle === "string" && stay.shuttle.trim() ? stay.shuttle.trim() : fallback.shuttle
  };
}

function normalizeScheduleItem(
  item: Partial<ConnectScheduleItem> | undefined,
  fallback: ConnectScheduleItem
): ConnectScheduleItem {
  return {
    title: typeof item?.title === "string" && item.title.trim() ? item.title.trim() : fallback.title,
    dateTime: typeof item?.dateTime === "string" && item.dateTime.trim() ? item.dateTime.trim() : fallback.dateTime,
    venue: typeof item?.venue === "string" && item.venue.trim() ? item.venue.trim() : fallback.venue,
    address: typeof item?.address === "string" && item.address.trim() ? item.address.trim() : fallback.address,
    mapHref: typeof item?.mapHref === "string" && item.mapHref.trim() ? item.mapHref.trim() : fallback.mapHref,
    highlights: normalizeStringArray(item?.highlights, fallback.highlights)
  };
}

function normalizeMerchandiseContent(
  merchandise: Partial<ConnectMerchandiseContent> | undefined,
  fallback: ConnectMerchandiseContent
): ConnectMerchandiseContent {
  return {
    body: typeof merchandise?.body === "string" && merchandise.body.trim() ? merchandise.body.trim() : fallback.body,
    preorder:
      typeof merchandise?.preorder === "string" && merchandise.preorder.trim()
        ? merchandise.preorder.trim()
        : fallback.preorder
  };
}

function normalizeSponsorPageTier(
  tier: Partial<ConnectSponsorPageTier> | undefined,
  fallback: ConnectSponsorPageTier
): ConnectSponsorPageTier {
  return {
    title: typeof tier?.title === "string" && tier.title.trim() ? tier.title.trim() : fallback.title,
    amount: typeof tier?.amount === "string" && tier.amount.trim() ? tier.amount.trim() : fallback.amount
  };
}

function normalizeSponsorEntry(
  sponsor: Partial<ConnectSponsorEntry> | undefined,
  fallback: ConnectSponsorEntry
): ConnectSponsorEntry {
  return {
    name: typeof sponsor?.name === "string" && sponsor.name.trim() ? sponsor.name.trim() : fallback.name,
    website: typeof sponsor?.website === "string" ? sponsor.website.trim() : fallback.website,
    logoSrc: typeof sponsor?.logoSrc === "string" && sponsor.logoSrc.trim() ? sponsor.logoSrc.trim() : fallback.logoSrc,
    logoAlt: typeof sponsor?.logoAlt === "string" && sponsor.logoAlt.trim() ? sponsor.logoAlt.trim() : fallback.logoAlt
  };
}

function normalizeConnectPageContent(content: Partial<ConnectPageContent> | undefined): ConnectPageContent {
  const fallback = defaultConnectPageContent;
  const placeholderCount = Math.max(content?.placeholders?.length ?? 0, fallback.placeholders.length);
  const pricingCount = Math.max(content?.pricing?.length ?? 0, fallback.pricing.length);
  const scheduleCount = Math.max(content?.schedule?.length ?? 0, fallback.schedule.length);
  const sponsorTierCount = Math.max(content?.sponsorTiers?.length ?? 0, fallback.sponsorTiers.length);
  const sponsorCount = Math.max(content?.sponsors?.length ?? 0, fallback.sponsors.length);

  return {
    sponsorMessage:
      typeof content?.sponsorMessage === "string" && content.sponsorMessage.trim()
        ? content.sponsorMessage.trim()
        : fallback.sponsorMessage,
    detailLinks: normalizeStringArray(content?.detailLinks, fallback.detailLinks),
    pricing: Array.from({ length: pricingCount }, (_, index) =>
      normalizePricingGroup(content?.pricing?.[index], fallback.pricing[index] ?? fallback.pricing[0])
    ),
    complimentaryTickets: normalizeStringArray(content?.complimentaryTickets, fallback.complimentaryTickets),
    travel: normalizeTravelContent(content?.travel, fallback.travel),
    stay: normalizeStayContent(content?.stay, fallback.stay),
    schedule: Array.from({ length: scheduleCount }, (_, index) =>
      normalizeScheduleItem(content?.schedule?.[index], fallback.schedule[index] ?? fallback.schedule[0])
    ),
    merchandise: normalizeMerchandiseContent(content?.merchandise, fallback.merchandise),
    attractions: normalizeStringArray(content?.attractions, fallback.attractions),
    sponsorDetails: normalizeStringArray(content?.sponsorDetails, fallback.sponsorDetails),
    sponsorTiers: Array.from({ length: sponsorTierCount }, (_, index) =>
      normalizeSponsorPageTier(content?.sponsorTiers?.[index], fallback.sponsorTiers[index] ?? fallback.sponsorTiers[0])
    ),
    sponsors: Array.from({ length: sponsorCount }, (_, index) =>
      normalizeSponsorEntry(content?.sponsors?.[index], fallback.sponsors[index] ?? fallback.sponsors[0])
    ),
    placeholders: Array.from({ length: placeholderCount }, (_, index) => {
      const item = content?.placeholders?.[index];

      return {
        title:
          typeof item?.title === "string" && item.title.trim()
            ? item.title.trim()
            : fallback.placeholders[index]?.title ?? "Details",
        body:
          typeof item?.body === "string" && item.body.trim()
            ? item.body.trim()
            : fallback.placeholders[index]?.body ?? "Details coming soon."
      };
    })
  };
}

function normalizeHomeCopy(copy: Partial<HomePageCopy> | undefined): HomePageCopy {
  return {
    heroMotto: typeof copy?.heroMotto === "string" && copy.heroMotto.trim() ? copy.heroMotto.trim() : defaultHomeCopy.heroMotto,
    heroLead: typeof copy?.heroLead === "string" && copy.heroLead.trim() ? copy.heroLead.trim() : defaultHomeCopy.heroLead,
    aboutTitle: typeof copy?.aboutTitle === "string" && copy.aboutTitle.trim() ? copy.aboutTitle.trim() : defaultHomeCopy.aboutTitle,
    aboutBody: typeof copy?.aboutBody === "string" && copy.aboutBody.trim() ? copy.aboutBody.trim() : defaultHomeCopy.aboutBody,
    quickLinksTitle:
      typeof copy?.quickLinksTitle === "string" && copy.quickLinksTitle.trim()
        ? copy.quickLinksTitle.trim()
        : defaultHomeCopy.quickLinksTitle,
    causesCardTitle:
      typeof copy?.causesCardTitle === "string" && copy.causesCardTitle.trim()
        ? copy.causesCardTitle.trim()
        : defaultHomeCopy.causesCardTitle,
    causesCardBody:
      typeof copy?.causesCardBody === "string" && copy.causesCardBody.trim()
        ? copy.causesCardBody.trim()
        : defaultHomeCopy.causesCardBody,
    donateCardTitle:
      typeof copy?.donateCardTitle === "string" && copy.donateCardTitle.trim()
        ? copy.donateCardTitle.trim()
        : defaultHomeCopy.donateCardTitle,
    donateCardBody:
      typeof copy?.donateCardBody === "string" && copy.donateCardBody.trim()
        ? copy.donateCardBody.trim()
        : defaultHomeCopy.donateCardBody,
    connectCardTitle:
      typeof copy?.connectCardTitle === "string" && copy.connectCardTitle.trim()
        ? copy.connectCardTitle.trim()
        : defaultHomeCopy.connectCardTitle,
    connectCardBody:
      typeof copy?.connectCardBody === "string" && copy.connectCardBody.trim()
        ? copy.connectCardBody.trim()
        : defaultHomeCopy.connectCardBody,
    eventsTitle: typeof copy?.eventsTitle === "string" && copy.eventsTitle.trim() ? copy.eventsTitle.trim() : defaultHomeCopy.eventsTitle,
    upcomingEventsTitle:
      typeof copy?.upcomingEventsTitle === "string" && copy.upcomingEventsTitle.trim()
        ? copy.upcomingEventsTitle.trim()
        : defaultHomeCopy.upcomingEventsTitle,
    upcomingEventsBody:
      typeof copy?.upcomingEventsBody === "string" && copy.upcomingEventsBody.trim()
        ? copy.upcomingEventsBody.trim()
        : defaultHomeCopy.upcomingEventsBody,
    pastEventsTitle:
      typeof copy?.pastEventsTitle === "string" && copy.pastEventsTitle.trim()
        ? copy.pastEventsTitle.trim()
        : defaultHomeCopy.pastEventsTitle,
    pastEventsBody:
      typeof copy?.pastEventsBody === "string" && copy.pastEventsBody.trim()
        ? copy.pastEventsBody.trim()
        : defaultHomeCopy.pastEventsBody
  };
}

function normalizeDonateCopy(copy: Partial<DonatePageCopy> | undefined): DonatePageCopy {
  return {
    onlineGivingHeading:
      typeof copy?.onlineGivingHeading === "string" && copy.onlineGivingHeading.trim()
        ? copy.onlineGivingHeading.trim()
        : defaultDonateCopy.onlineGivingHeading,
    onlineGivingBody:
      typeof copy?.onlineGivingBody === "string" && copy.onlineGivingBody.trim()
        ? copy.onlineGivingBody.trim()
        : defaultDonateCopy.onlineGivingBody,
    contactHeading:
      typeof copy?.contactHeading === "string" && copy.contactHeading.trim()
        ? copy.contactHeading.trim()
        : defaultDonateCopy.contactHeading,
    contactBody:
      typeof copy?.contactBody === "string" && copy.contactBody.trim() ? copy.contactBody.trim() : defaultDonateCopy.contactBody,
    formHeading:
      typeof copy?.formHeading === "string" && copy.formHeading.trim() ? copy.formHeading.trim() : defaultDonateCopy.formHeading,
    formBody: typeof copy?.formBody === "string" && copy.formBody.trim() ? copy.formBody.trim() : defaultDonateCopy.formBody
  };
}

function normalizeCausesCopy(copy: Partial<CausesPageCopy> | undefined): CausesPageCopy {
  return {
    sectionHeading:
      typeof copy?.sectionHeading === "string" && copy.sectionHeading.trim()
        ? copy.sectionHeading.trim()
        : defaultCausesCopy.sectionHeading
  };
}

export const defaultSiteContent: SiteContent = {
  tabs,
  impactStats,
  priorityCards,
  causeCards,
  donationRoutes,
  donationInfo,
  sponsorHighlights,
  sponsorTiers,
  connectMoments,
  groupedEventAlbums,
  sponsorMaterials,
  connectPage: defaultConnectPageContent,
  secondaryPages,
  houseShields,
  contactChannels,
  inquiryTopics,
  homeCopy: defaultHomeCopy,
  causesCopy: defaultCausesCopy,
  donateCopy: defaultDonateCopy,
  connectCopy: defaultConnectCopy
};

export function normalizeSiteContent(value: Partial<SiteContent>): SiteContent {
  const fallback = defaultSiteContent;
  const connectMomentCount = Math.max(value.connectMoments?.length ?? 0, fallback.connectMoments.length);
  const folderCount = Array.isArray(value.groupedEventAlbums)
    ? value.groupedEventAlbums.length
    : fallback.groupedEventAlbums.length;
  const sponsorMaterialCount = Math.max(value.sponsorMaterials?.length ?? 0, fallback.sponsorMaterials.length);
  const tabsById = Array.isArray(value.tabs)
    ? new Map(
        value.tabs
          .filter((tab) => typeof tab?.id === "string" && tab.id.trim().length > 0)
          .map((tab) => [tab.id as TabConfig["id"], tab])
      )
    : null;

  return {
    tabs: Array.isArray(value.tabs) ? fallback.tabs.map((tab) => normalizeTab(tabsById?.get(tab.id), tab)) : fallback.tabs,
    impactStats:
      Array.isArray(value.impactStats) && value.impactStats.length
        ? value.impactStats.map((item, index) => ({
            value:
              typeof item?.value === "string" && item.value.trim()
                ? item.value.trim()
                : fallback.impactStats[index]?.value ?? "",
            label:
              typeof item?.label === "string" && item.label.trim()
                ? item.label.trim()
                : fallback.impactStats[index]?.label ?? ""
          }))
        : fallback.impactStats,
    priorityCards: Array.isArray(value.priorityCards)
      ? value.priorityCards.map((item, index) => normalizePriorityCard(item, fallback.priorityCards[index] ?? fallback.priorityCards[0]))
      : fallback.priorityCards,
    causeCards: Array.isArray(value.causeCards)
      ? value.causeCards.map((item, index) => normalizeCause(item, fallback.causeCards[index] ?? fallback.causeCards[0]))
      : fallback.causeCards,
    donationRoutes: Array.isArray(value.donationRoutes)
      ? value.donationRoutes.map((item, index) =>
          normalizeDonationRoute(item, fallback.donationRoutes[index] ?? fallback.donationRoutes[0])
        )
      : fallback.donationRoutes,
    donationInfo: Array.isArray(value.donationInfo)
      ? fallback.donationInfo.map((item) => {
          const incoming = value.donationInfo?.find((info) => info?.id === item.id);

          return normalizeDonationInfo(incoming, item);
        })
      : fallback.donationInfo,
    sponsorHighlights: Array.isArray(value.sponsorHighlights)
      ? value.sponsorHighlights.map((item, index) => normalizeHighlight(item, fallback.sponsorHighlights[index] ?? fallback.sponsorHighlights[0]))
      : fallback.sponsorHighlights,
    sponsorTiers: Array.isArray(value.sponsorTiers)
      ? value.sponsorTiers.map((item, index) => normalizeTier(item, fallback.sponsorTiers[index] ?? fallback.sponsorTiers[0]))
      : fallback.sponsorTiers,
    connectMoments: Array.isArray(value.connectMoments)
      ? Array.from({ length: connectMomentCount }, (_, index) =>
          normalizeImage(value.connectMoments?.[index], fallback.connectMoments[index] ?? fallback.connectMoments[0])
        )
      : fallback.connectMoments,
    groupedEventAlbums: Array.isArray(value.groupedEventAlbums)
      ? Array.from({ length: folderCount }, (_, index) =>
          normalizeFolder(value.groupedEventAlbums?.[index], fallback.groupedEventAlbums[index] ?? fallback.groupedEventAlbums[0])
        )
      : fallback.groupedEventAlbums,
    sponsorMaterials: Array.isArray(value.sponsorMaterials)
      ? Array.from({ length: sponsorMaterialCount }, (_, index) =>
          normalizeImage(value.sponsorMaterials?.[index], fallback.sponsorMaterials[index] ?? fallback.sponsorMaterials[0])
        )
      : fallback.sponsorMaterials,
    connectPage: normalizeConnectPageContent(value.connectPage),
    secondaryPages: Array.isArray(value.secondaryPages)
      ? value.secondaryPages.map((item, index) => normalizeSecondaryPage(item, fallback.secondaryPages[index] ?? fallback.secondaryPages[0]))
      : fallback.secondaryPages,
    houseShields: Array.isArray(value.houseShields)
      ? value.houseShields.map((item, index) => normalizeHouseShield(item, fallback.houseShields[index] ?? fallback.houseShields[0]))
      : fallback.houseShields,
    contactChannels: Array.isArray(value.contactChannels)
      ? value.contactChannels.map((item, index) => normalizeChannel(item, fallback.contactChannels[index] ?? fallback.contactChannels[0]))
      : fallback.contactChannels,
    inquiryTopics:
      Array.isArray(value.inquiryTopics) && value.inquiryTopics.length
        ? value.inquiryTopics.filter((item): item is string => typeof item === "string" && Boolean(item.trim())).map((item) => item.trim())
        : fallback.inquiryTopics,
    homeCopy: normalizeHomeCopy(value.homeCopy),
    causesCopy: normalizeCausesCopy(value.causesCopy),
    donateCopy: normalizeDonateCopy(value.donateCopy),
    connectCopy: normalizeConnectCopy(value.connectCopy)
  };
}
