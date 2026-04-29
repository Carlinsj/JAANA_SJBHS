import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  ConnectPageContent,
  ConnectPageCopy,
  ConnectScheduleItem,
  ConnectSponsorEntry,
  TabConfig
} from "../types";
import { InlineEditableText } from "./InlineEditableText";
import { handleRovingTabKeyDown } from "../accessibility";

type ConnectPageProps = {
  details: TabConfig;
  connectContent: ConnectPageContent;
  connectCopy: ConnectPageCopy;
  editable?: boolean;
  onChangeDetails?: <K extends keyof TabConfig>(key: K, value: TabConfig[K]) => void;
  onChangeConnectCopy?: <K extends keyof ConnectPageCopy>(key: K, value: ConnectPageCopy[K]) => void;
  onChangeConnectContent?: <K extends keyof ConnectPageContent>(key: K, value: ConnectPageContent[K]) => void;
};

type ConnectDialogType = "registration" | "sponsor";

const registrationFormUrl = "/embed/ticketing/jaana-north-america-connect--2026";
const registrationIframeUrl = "https://www.zeffy.com/embed/ticketing/jaana-north-america-connect--2026";
const sponsorFormUrl = "/embed/donation-form/north-america-connect-sponsorship";
const sponsorIframeUrl = "https://www.zeffy.com/embed/donation-form/north-america-connect-sponsorship";
const sponsorThermometerUrl = "https://www.zeffy.com/embed/thermometer/north-america-connect-sponsorship";

const sectionAnchors: Record<string, string> = {
  pricing: "connect-pricing",
  schedule: "connect-schedule",
  travel: "connect-travel",
  stay: "connect-stay",
  "josephite-merchandise": "connect-merchandise",
  "local-attractions": "connect-attractions"
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function sectionAnchorFor(label: string) {
  const slug = slugify(label);
  return sectionAnchors[slug] ?? `connect-${slug || "details"}`;
}

function updateArrayItem<T>(items: T[], index: number, updater: (item: T) => T) {
  return items.map((item, itemIndex) => (itemIndex === index ? updater(item) : item));
}

function updateStringItem(items: string[], index: number, value: string) {
  return updateArrayItem(items, index, () => value);
}

function resolveHref(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  if (/^(https?:|mailto:|tel:)/i.test(trimmedValue)) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
}

function promoCodeFromLabel(value: string) {
  return value.match(/\b[A-Z0-9]{6,}\b/)?.[0] ?? value;
}

function ConnectZeffyDialog({
  type,
  connectContent,
  onClose
}: {
  type: ConnectDialogType | null;
  connectContent: ConnectPageContent;
  onClose: () => void;
}) {
  const isSponsor = type === "sponsor";
  const title = isSponsor ? "Become a Sponsor" : "Register Today";
  const iframeUrl = isSponsor ? sponsorIframeUrl : registrationIframeUrl;
  const formUrl = isSponsor ? sponsorFormUrl : registrationFormUrl;

  useEffect(() => {
    if (!type) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose, type]);

  if (!type) {
    return null;
  }

  return createPortal(
    <div className="zeffy-dialog connect-zeffy-dialog" role="dialog" aria-modal="true" aria-labelledby="connect-zeffy-title" onClick={onClose}>
      <div
        className={`zeffy-dialog-shell connect-zeffy-shell ${isSponsor ? "is-sponsor" : "is-registration"}`}
        onClick={(event) => event.stopPropagation()}
        tabIndex={-1}
        autoFocus
      >
        <header className="zeffy-dialog-header connect-zeffy-header">
          <button className="zeffy-dialog-close" type="button" onClick={onClose} aria-label={`Close ${title} form`}>
            ×
          </button>
          <p className="support-note">Secure form powered by Zeffy</p>
          <h3 id="connect-zeffy-title">{title}</h3>
          {isSponsor ? (
            <>
              <p>
                The Josephite Alumni Association of North America (JAANA), in partnership with Learn For Life Foundation
                (LFL), invites you to sponsor North America Connect, a two-day event hosted in the Washington D.C. metro
                area on September 19th and 20th, 2026.
              </p>
              <div className="connect-dialog-tier-strip" aria-label="Sponsorship tiers">
                {connectContent.sponsorTiers.map((tier) => (
                  <span key={`${tier.title}-${tier.amount}`}>
                    <strong>{tier.title.replace(" Sponsors", " Tier")}</strong>
                    {tier.amount}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p>
              Register for the Saturday gala, Sunday picnic, or the full North America Connect 2026 reunion weekend.
            </p>
          )}
        </header>

        {isSponsor ? (
          <div className="connect-dialog-sponsor-context">
            <ul>
              {connectContent.sponsorDetails.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="connect-thermometer-frame">
              <iframe
                title="North America Connect sponsorship thermometer powered by Zeffy"
                src={sponsorThermometerUrl}
              />
            </div>
          </div>
        ) : null}

        <div className="zeffy-dialog-embed connect-zeffy-embed" data-form-url={formUrl}>
          <iframe
            className="connect-zeffy-frame"
            title={`${title} form powered by Zeffy`}
            src={iframeUrl}
            allow="payment"
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

function ScheduleCard({
  item,
  index,
  editable,
  onChange
}: {
  item: ConnectScheduleItem;
  index: number;
  editable: boolean;
  onChange: (value: ConnectScheduleItem) => void;
}) {
  return (
    <article className="connect-schedule-card">
      <span className="connect-card-number">{String(index + 1).padStart(2, "0")}</span>
      <h4>
        <InlineEditableText
          editable={editable}
          value={item.title}
          onChange={(value) => onChange({ ...item, title: value })}
          className="section-title-edit"
          ariaLabel={`Schedule item ${index + 1} title`}
        />
      </h4>
      <p className="connect-card-time">
        <InlineEditableText
          editable={editable}
          value={item.dateTime}
          onChange={(value) => onChange({ ...item, dateTime: value })}
          className="body-copy-edit"
          ariaLabel={`Schedule item ${index + 1} time`}
        />
      </p>
      <p>
        <strong>
          <InlineEditableText
            editable={editable}
            value={item.venue}
            onChange={(value) => onChange({ ...item, venue: value })}
            className="body-copy-edit"
            ariaLabel={`Schedule item ${index + 1} venue`}
          />
        </strong>
      </p>
      <p>
        <InlineEditableText
          editable={editable}
          value={item.address}
          onChange={(value) => onChange({ ...item, address: value })}
          className="body-copy-edit"
          ariaLabel={`Schedule item ${index + 1} address`}
        />
      </p>
      <div className="connect-chip-list" aria-label={`${item.title} highlights`}>
        {item.highlights.map((highlight, highlightIndex) => (
          <span key={`${highlight}-${highlightIndex}`}>
            <InlineEditableText
              editable={editable}
              value={highlight}
              onChange={(value) => onChange({ ...item, highlights: updateStringItem(item.highlights, highlightIndex, value) })}
              className="body-copy-edit"
              ariaLabel={`Schedule item ${index + 1} highlight ${highlightIndex + 1}`}
            />
          </span>
        ))}
      </div>
    </article>
  );
}

function SponsorCard({
  sponsor,
  editable,
  onChange
}: {
  sponsor: ConnectSponsorEntry;
  editable: boolean;
  onChange: (value: ConnectSponsorEntry) => void;
}) {
  const sponsorHref = resolveHref(sponsor.website);
  const sponsorName = (
    <InlineEditableText
      editable={editable}
      value={sponsor.name}
      onChange={(value) => onChange({ ...sponsor, name: value })}
      className="section-title-edit"
      ariaLabel="Sponsor name"
    />
  );

  return (
    <article className="connect-sponsor-card">
      <div className="connect-sponsor-logo">
        <img src={sponsor.logoSrc} alt={sponsor.logoAlt} />
      </div>
      <div>
        <h5>{sponsorHref && !editable ? <a href={sponsorHref} target="_blank" rel="noreferrer">{sponsorName}</a> : sponsorName}</h5>
        {editable ? (
          <div className="connect-admin-field-stack">
            <InlineEditableText
              editable
              value={sponsor.website}
              onChange={(value) => onChange({ ...sponsor, website: value })}
              className="body-copy-edit"
              placeholder="Sponsor website URL"
              ariaLabel="Sponsor website URL"
            />
            <InlineEditableText
              editable
              value={sponsor.logoSrc}
              onChange={(value) => onChange({ ...sponsor, logoSrc: value })}
              className="body-copy-edit"
              placeholder="Sponsor logo path"
              ariaLabel="Sponsor logo path"
            />
            <InlineEditableText
              editable
              value={sponsor.logoAlt}
              onChange={(value) => onChange({ ...sponsor, logoAlt: value })}
              className="body-copy-edit"
              placeholder="Sponsor logo alt text"
              ariaLabel="Sponsor logo alt text"
            />
          </div>
        ) : sponsorHref ? (
          <a className="inline-link" href={sponsorHref} target="_blank" rel="noreferrer">
            Website
          </a>
        ) : (
          <span className="connect-coming-soon">Website coming soon</span>
        )}
      </div>
    </article>
  );
}

export function ConnectPage({
  details,
  connectContent,
  connectCopy,
  editable = false,
  onChangeDetails,
  onChangeConnectCopy,
  onChangeConnectContent
}: ConnectPageProps) {
  const [dialogType, setDialogType] = useState<ConnectDialogType | null>(null);
  const [activeSponsorTier, setActiveSponsorTier] = useState(0);

  useEffect(() => {
    setActiveSponsorTier((current) => Math.min(current, Math.max(connectContent.sponsorTiers.length - 1, 0)));
  }, [connectContent.sponsorTiers.length]);

  const activeTier = connectContent.sponsorTiers[activeSponsorTier] ?? connectContent.sponsorTiers[0];
  const unitedDiscountHref = resolveHref(connectContent.travel.discountHref);
  const unitedPromoCode = promoCodeFromLabel(connectContent.travel.discountLabel);
  const hotelBlockHref = resolveHref(connectContent.stay.hotelBlockHref);

  return (
    <section id="connect-panel" className="subpage-shell" role="tabpanel" aria-label="North America Connect 2026">
      <div className="connect-hero">
        <div className="connect-hero-copy">
          <h2>
            <InlineEditableText
              editable={editable}
              value={details.title}
              onChange={(value) => onChangeDetails?.("title", value)}
              className="section-title-edit"
            />
          </h2>
          <div className="body-copy connect-hero-body">
            <InlineEditableText
              editable={editable}
              value={details.copy}
              onChange={(value) => onChangeDetails?.("copy", value)}
              multiline
              richText
              className="body-copy-edit"
            />
          </div>
          <div className="connect-hero-actions">
            <a className="primary-button connect-pdf-button" href="/docs/north-america-connect-2026-details.pdf" target="_blank" rel="noreferrer">
              Download event details PDF
            </a>
          </div>
        </div>

        <aside className="connect-event-panel">
          <div className="connect-event-photo">
            <img src="/assets/connect-group-steps.jpg" alt="Josephite alumni and families gathered on steps at a Connect event" />
          </div>
          <div className="connect-date-panel">
            <img src="/assets/oba-connect-mark.png" alt="SJBHS OBA Connect mark" />
            <strong>
              <InlineEditableText
                editable={editable}
                value={connectCopy.posterLabel}
                onChange={(value) => onChangeConnectCopy?.("posterLabel", value)}
                className="section-title-edit"
              />
            </strong>
            <p>
              <InlineEditableText
                editable={editable}
                value={connectCopy.posterTitle}
                onChange={(value) => onChangeConnectCopy?.("posterTitle", value)}
                className="section-title-edit"
              />
            </p>
            <div className="connect-date-meta">
              {editable ? (
                <InlineEditableText
                  editable
                  value={connectCopy.posterBody}
                  onChange={(value) => onChangeConnectCopy?.("posterBody", value)}
                  className="body-copy-edit"
                />
              ) : (
                connectCopy.posterBody.split("|").map((item) => <span key={item.trim()}>{item.trim()}</span>)
              )}
            </div>
          </div>
        </aside>
      </div>

      <nav className="connect-detail-nav" aria-label="North America Connect details">
        <span>Find all details here:</span>
        <div>
          {connectContent.detailLinks.map((linkLabel, index) => (
            <a key={`${linkLabel}-${index}`} href={`#${sectionAnchorFor(linkLabel)}`}>
              {editable ? (
                <InlineEditableText
                  editable
                  value={linkLabel}
                  onChange={(value) => onChangeConnectContent?.("detailLinks", updateStringItem(connectContent.detailLinks, index, value))}
                  className="body-copy-edit"
                  ariaLabel={`Detail link ${index + 1}`}
                />
              ) : (
                linkLabel
              )}
            </a>
          ))}
        </div>
      </nav>

      <section id="connect-pricing" className="connect-section connect-pricing-section" aria-labelledby="connect-pricing-title">
        <div className="featured-heading">
          <div>
            <h3 id="connect-pricing-title">Pricing</h3>
          </div>
          <button className="primary-button" type="button" onClick={() => setDialogType("registration")}>
            Register Today
          </button>
        </div>
        <div className="connect-pricing-grid">
          {connectContent.pricing.map((pricingGroup, groupIndex) => (
            <article className="connect-pricing-card" key={`${pricingGroup.title}-${groupIndex}`}>
              <p className="connect-price-period">
                <InlineEditableText
                  editable={editable}
                  value={pricingGroup.period}
                  onChange={(value) =>
                    onChangeConnectContent?.(
                      "pricing",
                      updateArrayItem(connectContent.pricing, groupIndex, (item) => ({ ...item, period: value }))
                    )
                  }
                  className="body-copy-edit"
                  ariaLabel={`Pricing period ${groupIndex + 1}`}
                />
              </p>
              <h4>
                <InlineEditableText
                  editable={editable}
                  value={pricingGroup.title}
                  onChange={(value) =>
                    onChangeConnectContent?.(
                      "pricing",
                      updateArrayItem(connectContent.pricing, groupIndex, (item) => ({ ...item, title: value }))
                    )
                  }
                  className="section-title-edit"
                  ariaLabel={`Pricing title ${groupIndex + 1}`}
                />
              </h4>
              <ul>
                {pricingGroup.options.map((option, optionIndex) => (
                  <li key={`${option}-${optionIndex}`}>
                    <InlineEditableText
                      editable={editable}
                      value={option}
                      onChange={(value) =>
                        onChangeConnectContent?.(
                          "pricing",
                          updateArrayItem(connectContent.pricing, groupIndex, (item) => ({
                            ...item,
                            options: updateStringItem(item.options, optionIndex, value)
                          }))
                        )
                      }
                      className="body-copy-edit"
                      ariaLabel={`Pricing option ${optionIndex + 1}`}
                    />
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="connect-free-grid">
          {connectContent.complimentaryTickets.map((ticket, index) => (
            <p key={`${ticket}-${index}`}>
              <InlineEditableText
                editable={editable}
                value={ticket}
                onChange={(value) => onChangeConnectContent?.("complimentaryTickets", updateStringItem(connectContent.complimentaryTickets, index, value))}
                className="body-copy-edit"
                ariaLabel={`Complimentary ticket ${index + 1}`}
              />
            </p>
          ))}
        </div>
      </section>

      <section id="connect-schedule" className="connect-section" aria-labelledby="connect-schedule-title">
        <div className="featured-heading">
          <div>
            <h3 id="connect-schedule-title">
              <InlineEditableText
                editable={editable}
                value={connectCopy.scheduleHeading}
                onChange={(value) => onChangeConnectCopy?.("scheduleHeading", value)}
                className="section-title-edit"
              />
            </h3>
            <div className="body-copy">
              <InlineEditableText
                editable={editable}
                value={connectCopy.scheduleBody}
                onChange={(value) => onChangeConnectCopy?.("scheduleBody", value)}
                multiline
                richText
                className="body-copy-edit"
              />
            </div>
          </div>
        </div>
        <div className="connect-schedule-grid">
          {connectContent.schedule.map((scheduleItem, scheduleIndex) => (
            <ScheduleCard
              key={`${scheduleItem.title}-${scheduleIndex}`}
              item={scheduleItem}
              index={scheduleIndex}
              editable={editable}
              onChange={(value) =>
                onChangeConnectContent?.("schedule", updateArrayItem(connectContent.schedule, scheduleIndex, () => value))
              }
            />
          ))}
        </div>
      </section>

      <section className="connect-section connect-logistics" aria-label="Travel and stay details">
        <article id="connect-travel" className="connect-info-panel connect-travel-panel">
          <h3>Travel</h3>
          <div className="connect-travel-layout">
            <div className="connect-airport-summary">
              <span>Recommended airport</span>
              <strong>
                <InlineEditableText
                  editable={editable}
                  value={connectContent.travel.recommendedAirport}
                  onChange={(value) => onChangeConnectContent?.("travel", { ...connectContent.travel, recommendedAirport: value })}
                  className="body-copy-edit"
                  ariaLabel="Recommended airport"
                />
              </strong>
              <p>Best arrival point for the Washington, D.C. metro area events.</p>
            </div>

            <div className="connect-travel-secondary">
              <div className="connect-promo-card">
                <span>United Airlines discount</span>
                {unitedDiscountHref && !editable ? (
                  <a className="connect-promo-link" href={unitedDiscountHref} target="_blank" rel="noreferrer">
                    <strong>{unitedPromoCode}</strong>
                    <small>Applicable for travel to/from IAD between 9/18-9/21</small>
                  </a>
                ) : (
                  <div className="connect-promo-edit-stack">
                    <InlineEditableText
                      editable={editable}
                      value={connectContent.travel.discountLabel}
                      onChange={(value) => onChangeConnectContent?.("travel", { ...connectContent.travel, discountLabel: value })}
                      className="body-copy-edit"
                      ariaLabel="United discount label"
                    />
                    {!editable ? <span className="connect-coming-soon">Link coming soon</span> : null}
                  </div>
                )}
                {editable ? (
                  <InlineEditableText
                    editable
                    value={connectContent.travel.discountHref}
                    onChange={(value) => onChangeConnectContent?.("travel", { ...connectContent.travel, discountHref: value })}
                    className="body-copy-edit"
                    placeholder="United discount URL"
                    ariaLabel="United discount URL"
                  />
                ) : null}
              </div>

              <div className="connect-airport-options">
                <span>Other airports</span>
                <div className="connect-inline-list">
                {connectContent.travel.otherAirports.map((airport, airportIndex) => (
                  <span key={`${airport}-${airportIndex}`}>
                    <InlineEditableText
                      editable={editable}
                      value={airport}
                      onChange={(value) =>
                        onChangeConnectContent?.("travel", {
                          ...connectContent.travel,
                          otherAirports: updateStringItem(connectContent.travel.otherAirports, airportIndex, value)
                        })
                      }
                      className="body-copy-edit"
                      ariaLabel={`Other airport ${airportIndex + 1}`}
                    />
                  </span>
                ))}
                </div>
              </div>
            </div>
          </div>
        </article>

        <article id="connect-stay" className="connect-info-panel connect-stay-panel">
          <h3>Stay</h3>
          <dl className="connect-detail-list">
            <div>
              <dt>Hotel Block</dt>
              <dd>
                {hotelBlockHref && !editable ? (
                  <a className="inline-link" href={hotelBlockHref} target="_blank" rel="noreferrer">
                    {connectContent.stay.hotelBlockLabel}
                  </a>
                ) : (
                  <>
                    <InlineEditableText
                      editable={editable}
                      value={connectContent.stay.hotelBlockLabel}
                      onChange={(value) => onChangeConnectContent?.("stay", { ...connectContent.stay, hotelBlockLabel: value })}
                      className="body-copy-edit"
                      ariaLabel="Hotel block label"
                    />
                    {!editable ? <span className="connect-coming-soon">Link coming soon</span> : null}
                  </>
                )}
                {editable ? (
                  <InlineEditableText
                    editable
                    value={connectContent.stay.hotelBlockHref}
                    onChange={(value) => onChangeConnectContent?.("stay", { ...connectContent.stay, hotelBlockHref: value })}
                    className="body-copy-edit"
                    placeholder="Hotel block URL"
                    ariaLabel="Hotel block URL"
                  />
                ) : null}
              </dd>
            </div>
            {(["hotelName", "address", "contact", "courtesyBlock", "shuttle"] as const).map((field) => (
              <div key={field}>
                <dt>{field === "hotelName" ? "Hotel" : field === "courtesyBlock" ? "Courtesy Block" : field.charAt(0).toUpperCase() + field.slice(1)}</dt>
                <dd>
                  <InlineEditableText
                    editable={editable}
                    value={connectContent.stay[field]}
                    onChange={(value) => onChangeConnectContent?.("stay", { ...connectContent.stay, [field]: value })}
                    className="body-copy-edit"
                    ariaLabel={`Stay ${field}`}
                  />
                </dd>
              </div>
            ))}
          </dl>
        </article>
      </section>

      <section className="connect-section connect-extras" aria-label="Merchandise and local attractions">
        <article id="connect-merchandise" className="connect-info-panel connect-merchandise-panel">
          <h3>Josephite Merchandise</h3>
          <p>
            <InlineEditableText
              editable={editable}
              value={connectContent.merchandise.body}
              onChange={(value) => onChangeConnectContent?.("merchandise", { ...connectContent.merchandise, body: value })}
              className="body-copy-edit"
              ariaLabel="Merchandise body"
            />
          </p>
          <p>
            <InlineEditableText
              editable={editable}
              value={connectContent.merchandise.preorder}
              onChange={(value) => onChangeConnectContent?.("merchandise", { ...connectContent.merchandise, preorder: value })}
              className="body-copy-edit"
              ariaLabel="Merchandise preorder details"
            />
          </p>
        </article>

        <article id="connect-attractions" className="connect-info-panel connect-attractions-panel">
          <h3>Local Attractions</h3>
          <div className="connect-attraction-grid">
            {connectContent.attractions.map((attraction, index) => (
              <span key={`${attraction}-${index}`}>
                <InlineEditableText
                  editable={editable}
                  value={attraction}
                  onChange={(value) => onChangeConnectContent?.("attractions", updateStringItem(connectContent.attractions, index, value))}
                  className="body-copy-edit"
                  ariaLabel={`Local attraction ${index + 1}`}
                />
              </span>
            ))}
          </div>
        </article>
      </section>

      <section className="connect-section connect-sponsor-section" aria-labelledby="connect-sponsors-title">
        <div className="connect-sponsor-copy">
          <h3 id="connect-sponsors-title">
            <InlineEditableText
              editable={editable}
              value={connectCopy.sponsorHeading}
              onChange={(value) => onChangeConnectCopy?.("sponsorHeading", value)}
              className="section-title-edit"
            />
          </h3>
          <div className="body-copy">
            <InlineEditableText
              editable={editable}
              value={connectContent.sponsorMessage || connectCopy.sponsorBody}
              onChange={(value) => onChangeConnectContent?.("sponsorMessage", value)}
              multiline
              richText
              className="body-copy-edit"
            />
          </div>
          <div className="connect-sponsor-actions">
            <button className="primary-button" type="button" onClick={() => setDialogType("sponsor")}>
              Become a Sponsor
            </button>
            <a className="secondary-button" href="/docs/north-america-connect-2026-call-for-sponsors.pdf" target="_blank" rel="noreferrer">
              View sponsor packet
            </a>
          </div>
        </div>

        <div className="connect-tier-panel">
          <div className="connect-tier-tabs" role="tablist" aria-label="Sponsor tiers">
            {connectContent.sponsorTiers.map((tier, index) => (
              <button
                key={`${tier.title}-${index}`}
                type="button"
                id={`connect-sponsor-tier-tab-${index}`}
                role="tab"
                aria-selected={activeSponsorTier === index}
                aria-controls={`connect-sponsor-tier-panel-${index}`}
                tabIndex={activeSponsorTier === index ? 0 : -1}
                className={`connect-schedule-tab ${activeSponsorTier === index ? "is-active" : ""}`}
                onClick={() => setActiveSponsorTier(index)}
                onKeyDown={handleRovingTabKeyDown}
              >
                {tier.title}
              </button>
            ))}
          </div>

          {activeTier ? (
            <div
              id={`connect-sponsor-tier-panel-${activeSponsorTier}`}
              className="connect-tier-detail"
              role="tabpanel"
              aria-labelledby={`connect-sponsor-tier-tab-${activeSponsorTier}`}
              tabIndex={0}
            >
              <h4>
                <InlineEditableText
                  editable={editable}
                  value={activeTier.title}
                  onChange={(value) =>
                    onChangeConnectContent?.(
                      "sponsorTiers",
                      updateArrayItem(connectContent.sponsorTiers, activeSponsorTier, (tier) => ({ ...tier, title: value }))
                    )
                  }
                  className="section-title-edit"
                  ariaLabel="Active sponsor tier title"
                />
              </h4>
              <p>
                <InlineEditableText
                  editable={editable}
                  value={activeTier.amount}
                  onChange={(value) =>
                    onChangeConnectContent?.(
                      "sponsorTiers",
                      updateArrayItem(connectContent.sponsorTiers, activeSponsorTier, (tier) => ({ ...tier, amount: value }))
                    )
                  }
                  className="body-copy-edit"
                  ariaLabel="Active sponsor tier amount"
                />
              </p>
            </div>
          ) : null}

          <div className="connect-sponsor-list" aria-label={activeTier?.title ?? "Sponsors"}>
            <h4>Our {activeTier?.title ?? "Sponsors"}</h4>
            {connectContent.sponsors.map((sponsor, sponsorIndex) => (
              <SponsorCard
                key={`${sponsor.name}-${sponsorIndex}`}
                sponsor={sponsor}
                editable={editable}
                onChange={(value) =>
                  onChangeConnectContent?.("sponsors", updateArrayItem(connectContent.sponsors, sponsorIndex, () => value))
                }
              />
            ))}
          </div>
        </div>
      </section>

      <ConnectZeffyDialog type={dialogType} connectContent={connectContent} onClose={() => setDialogType(null)} />
    </section>
  );
}
