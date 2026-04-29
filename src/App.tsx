import { FormEvent, startTransition, useEffect, useRef, useState } from "react";
import { initialForm } from "./site/content";
import { AlbumDialog } from "./site/components/AlbumDialog";
import { AdminSiteContentPage } from "./site/components/AdminSiteContentPage";
import { CausesPage } from "./site/components/CausesPage";
import { CauseDialog } from "./site/components/CauseDialog";
import { ContactPage } from "./site/components/ContactPage";
import { ConnectPage } from "./site/components/ConnectPage";
import { DonatePage } from "./site/components/DonatePage";
import { HomePage } from "./site/components/HomePage";
import { LightboxDialog } from "./site/components/LightboxDialog";
import { PastEventsDialog } from "./site/components/PastEventsDialog";
import { ZeffyDonateDialog } from "./site/components/ZeffyDonateDialog";
import {
  AlbumFolder,
  CauseCard,
  EventAlbum,
  GalleryImage,
  InquiryForm,
  SiteContent,
  TabId
} from "./site/types";
import { defaultSiteContent, normalizeSiteContent } from "./site/siteContent";
import { handleRovingTabKeyDown } from "./site/accessibility";

const siteContentUpdatedStorageKey = "jaana-site-content-updated-at";
const connectRegistrationHashes = new Set(["register", "connect-register"]);

function App() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [connectRegistrationRequest, setConnectRegistrationRequest] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [selectedCause, setSelectedCause] = useState<CauseCard | null>(null);
  const [selectedAlbumFolder, setSelectedAlbumFolder] = useState<AlbumFolder | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<EventAlbum | null>(null);
  const [pastEventsDialogOpen, setPastEventsDialogOpen] = useState(false);
  const [donateDialogOpen, setDonateDialogOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);
  const [lightboxZoomed, setLightboxZoomed] = useState(false);
  const [lightboxScale, setLightboxScale] = useState(1);
  const [lightboxBaseSize, setLightboxBaseSize] = useState<{ width: number; height: number } | null>(null);
  const [lightboxPan, setLightboxPan] = useState({ x: 0, y: 0 });
  const [lightboxDragging, setLightboxDragging] = useState(false);
  const [lightboxPinching, setLightboxPinching] = useState(false);
  const [lightboxWheeling, setLightboxWheeling] = useState(false);
  const [form, setForm] = useState<InquiryForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState<"idle" | "success" | "error">("idle");
  const [siteContent, setSiteContent] = useState<SiteContent>(defaultSiteContent);
  const [, forceLocationRender] = useState(0);
  const pinchDistanceRef = useRef<number | null>(null);
  const pinchScaleRef = useRef(1);
  const pinchMovedRef = useRef(false);
  const lightboxScaleRef = useRef(1);
  const pinchFrameRef = useRef<number | null>(null);
  const pinchPendingScaleRef = useRef<number | null>(null);
  const pinchPendingAnchorRef = useRef<{ clientX: number; clientY: number } | null>(null);
  const wheelFrameRef = useRef<number | null>(null);
  const wheelPendingScaleRef = useRef<number | null>(null);
  const wheelPendingAnchorRef = useRef<{ clientX: number; clientY: number } | null>(null);
  const wheelStopTimeoutRef = useRef<number | null>(null);
  const lightboxPanRef = useRef({ x: 0, y: 0 });
  const dragMovedRef = useRef(false);
  const lightboxDragRef = useRef<{
    active: boolean;
    pointerId: number | null;
    startX: number;
    startY: number;
    startPanX: number;
    startPanY: number;
  }>({
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0
  });
  const lightboxMediaRef = useRef<HTMLDivElement | null>(null);
  const lightboxFrameRef = useRef<HTMLDivElement | null>(null);
  const lightboxImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const syncTabWithHash = () => {
      if (window.location.pathname.startsWith("/admin")) {
        return;
      }

      const hashTab = window.location.hash.replace("#", "");

      if (connectRegistrationHashes.has(hashTab)) {
        startTransition(() => {
          setActiveTab("connect");
          setConnectRegistrationRequest((current) => current + 1);
        });
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
        return;
      }

      const nextTab =
        hashTab === "overview"
          ? "home"
          : hashTab === "give"
            ? "donate"
            : hashTab === "contact"
              ? "contact"
            : hashTab;

      if (tabs.some((tab) => tab.id === nextTab)) {
        startTransition(() => {
          setActiveTab(nextTab as TabId);
        });

        if (nextTab !== hashTab) {
          window.history.replaceState(null, "", `#${nextTab}`);
        }
      }
    };

    syncTabWithHash();
    window.addEventListener("hashchange", syncTabWithHash);

    return () => window.removeEventListener("hashchange", syncTabWithHash);
  }, []);

  useEffect(() => {
    const syncLocation = () => {
      forceLocationRender((current) => current + 1);
    };

    window.addEventListener("popstate", syncLocation);

    return () => window.removeEventListener("popstate", syncLocation);
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [activeTab]);

  useEffect(() => {
    if (!lightboxImage && !selectedCause && !selectedAlbumFolder && !pastEventsDialogOpen && !donateDialogOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (donateDialogOpen) {
          setDonateDialogOpen(false);
          return;
        }

        setLightboxImage(null);
        setLightboxZoomed(false);
        setLightboxScale(1);
        setLightboxBaseSize(null);
        setLightboxPan({ x: 0, y: 0 });
        resetLightboxInteractionState();
        setSelectedCause(null);
        setSelectedAlbumFolder(null);
        setSelectedAlbum(null);
        setPastEventsDialogOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [lightboxImage, selectedCause, selectedAlbumFolder, selectedAlbum, pastEventsDialogOpen, donateDialogOpen]);

  useEffect(() => {
    if (!mobileNavOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileNavOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [mobileNavOpen]);

  const loadSiteContent = async () => {
    try {
      const response = await fetch("/api/site-content");

      if (!response.ok) {
        throw new Error("Unable to load the site content.");
      }

      const payload = (await response.json()) as Partial<SiteContent>;

      if (payload && typeof payload === "object") {
        setSiteContent(normalizeSiteContent(payload));
      }
    } catch {
      setSiteContent(defaultSiteContent);
    }
  };

  useEffect(() => {
    void loadSiteContent();
  }, []);

  useEffect(() => {
    const refreshSiteContentFromStorage = (event: StorageEvent) => {
      if (event.key !== siteContentUpdatedStorageKey) {
        return;
      }

      void loadSiteContent();
    };
    const refreshSiteContentOnFocus = () => {
      void loadSiteContent();
    };

    window.addEventListener("storage", refreshSiteContentFromStorage);
    window.addEventListener("focus", refreshSiteContentOnFocus);

    return () => {
      window.removeEventListener("storage", refreshSiteContentFromStorage);
      window.removeEventListener("focus", refreshSiteContentOnFocus);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (pinchFrameRef.current !== null) {
        window.cancelAnimationFrame(pinchFrameRef.current);
      }

      if (wheelFrameRef.current !== null) {
        window.cancelAnimationFrame(wheelFrameRef.current);
      }

      if (wheelStopTimeoutRef.current !== null) {
        window.clearTimeout(wheelStopTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!lightboxImage || !lightboxMediaRef.current) {
      return;
    }

    const media = lightboxMediaRef.current;
    const preventBrowserZoom = (event: WheelEvent) => {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    };

    media.addEventListener("wheel", preventBrowserZoom, { passive: false });

    return () => {
      media.removeEventListener("wheel", preventBrowserZoom);
    };
  }, [lightboxImage]);

  const clampLightboxScale = (value: number) => Math.min(4, Math.max(1, value));

  const clampLightboxPan = (
    nextPan: { x: number; y: number },
    scale = lightboxScaleRef.current,
    baseSize = lightboxBaseSize
  ) => {
    if (!baseSize) {
      return { x: 0, y: 0 };
    }

    const minX = Math.min(0, baseSize.width - baseSize.width * scale);
    const minY = Math.min(0, baseSize.height - baseSize.height * scale);

    return {
      x: Math.min(0, Math.max(minX, nextPan.x)),
      y: Math.min(0, Math.max(minY, nextPan.y))
    };
  };

  const setLightboxPanState = (
    nextPan: { x: number; y: number },
    scale = lightboxScaleRef.current,
    baseSize = lightboxBaseSize
  ) => {
    const clamped = clampLightboxPan(nextPan, scale, baseSize);
    lightboxPanRef.current = clamped;
    setLightboxPan(clamped);
    return clamped;
  };

  const resetLightboxInteractionState = () => {
    setLightboxDragging(false);
    setLightboxPinching(false);
    setLightboxWheeling(false);
    lightboxScaleRef.current = 1;
    lightboxPanRef.current = { x: 0, y: 0 };
    pinchDistanceRef.current = null;
    pinchScaleRef.current = 1;
    pinchMovedRef.current = false;
    pinchPendingScaleRef.current = null;
    pinchPendingAnchorRef.current = null;

    if (pinchFrameRef.current !== null) {
      window.cancelAnimationFrame(pinchFrameRef.current);
      pinchFrameRef.current = null;
    }

    wheelPendingScaleRef.current = null;
    wheelPendingAnchorRef.current = null;

    if (wheelFrameRef.current !== null) {
      window.cancelAnimationFrame(wheelFrameRef.current);
      wheelFrameRef.current = null;
    }

    if (wheelStopTimeoutRef.current !== null) {
      window.clearTimeout(wheelStopTimeoutRef.current);
      wheelStopTimeoutRef.current = null;
    }

    dragMovedRef.current = false;
    lightboxDragRef.current = {
      active: false,
      pointerId: null,
      startX: 0,
      startY: 0,
      startPanX: 0,
      startPanY: 0
    };
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    setLightboxZoomed(false);
    setLightboxScale(1);
    setLightboxBaseSize(null);
    setLightboxPan({ x: 0, y: 0 });
    resetLightboxInteractionState();
  };

  const openLightboxImage = (image: GalleryImage) => {
    setLightboxZoomed(false);
    setLightboxScale(1);
    setLightboxBaseSize(null);
    setLightboxPan({ x: 0, y: 0 });
    resetLightboxInteractionState();
    setLightboxImage(image);
  };

  const getLightboxAnchor = (anchor?: { clientX: number; clientY: number }) => {
    if (!lightboxBaseSize) {
      return { x: 0, y: 0 };
    }

    if (!anchor || !lightboxFrameRef.current) {
      return {
        x: lightboxBaseSize.width / 2,
        y: lightboxBaseSize.height / 2
      };
    }

    const frameRect = lightboxFrameRef.current.getBoundingClientRect();

    return {
      x: Math.min(Math.max(anchor.clientX - frameRect.left, 0), frameRect.width),
      y: Math.min(Math.max(anchor.clientY - frameRect.top, 0), frameRect.height)
    };
  };

  const syncLightboxViewport = (
    nextScale: number,
    anchor?: { clientX: number; clientY: number },
    currentScale = lightboxScaleRef.current
  ) => {
    if (!lightboxBaseSize) {
      return;
    }

    if (nextScale <= 1.01) {
      setLightboxPanState({ x: 0, y: 0 }, 1);
      return;
    }

    const currentPan = lightboxPanRef.current;
    const anchorPoint = getLightboxAnchor(anchor);
    const imageX = (anchorPoint.x - currentPan.x) / currentScale;
    const imageY = (anchorPoint.y - currentPan.y) / currentScale;

    setLightboxPanState(
      {
        x: anchorPoint.x - imageX * nextScale,
        y: anchorPoint.y - imageY * nextScale
      },
      nextScale
    );
  };

  const toggleLightboxZoom = (anchor?: { clientX: number; clientY: number }) => {
    if (lightboxZoomed) {
      const previousScale = lightboxScaleRef.current;
      setLightboxZoomed(false);
      setLightboxScale(1);
      lightboxScaleRef.current = 1;
      syncLightboxViewport(1, anchor, previousScale);
      setLightboxDragging(false);
      setLightboxPinching(false);
      setLightboxWheeling(false);
      pinchDistanceRef.current = null;
      pinchScaleRef.current = 1;
      pinchMovedRef.current = false;
      pinchPendingScaleRef.current = null;
      pinchPendingAnchorRef.current = null;
      dragMovedRef.current = false;
      return;
    }

    const previousScale = lightboxScaleRef.current;
    setLightboxZoomed(true);
    setLightboxScale(1.35);
    lightboxScaleRef.current = 1.35;
    syncLightboxViewport(1.35, anchor, previousScale);
    pinchScaleRef.current = 1.35;
    pinchMovedRef.current = false;
    dragMovedRef.current = false;
  };

  const adjustLightboxScale = (nextScale: number, anchor?: { clientX: number; clientY: number }) => {
    const clamped = clampLightboxScale(nextScale);
    const previousScale = lightboxScaleRef.current;
    setLightboxScale(clamped);
    lightboxScaleRef.current = clamped;
    pinchScaleRef.current = clamped;

    if (clamped <= 1.01) {
      setLightboxZoomed(false);
      setLightboxScale(1);
      lightboxScaleRef.current = 1;
      syncLightboxViewport(1, anchor, previousScale);
      setLightboxDragging(false);
      setLightboxPinching(false);
      pinchScaleRef.current = 1;
      pinchMovedRef.current = false;
      dragMovedRef.current = false;
      return;
    }

    setLightboxZoomed(true);
    syncLightboxViewport(clamped, anchor, previousScale);
  };

  const stopLightboxDrag = () => {
    if (!lightboxDragRef.current.active) {
      return;
    }

    lightboxDragRef.current.active = false;
    lightboxDragRef.current.pointerId = null;
    setLightboxDragging(false);

    if (dragMovedRef.current) {
      window.setTimeout(() => {
        dragMovedRef.current = false;
      }, 160);
    }
  };

  const schedulePinchScale = (nextScale: number, anchor: { clientX: number; clientY: number }) => {
    pinchPendingScaleRef.current = nextScale;
    pinchPendingAnchorRef.current = anchor;

    if (pinchFrameRef.current !== null) {
      return;
    }

    pinchFrameRef.current = window.requestAnimationFrame(() => {
      pinchFrameRef.current = null;

      if (pinchPendingScaleRef.current === null) {
        return;
      }

      const pendingScale = pinchPendingScaleRef.current;
      const pendingAnchor = pinchPendingAnchorRef.current ?? undefined;
      pinchPendingScaleRef.current = null;
      pinchPendingAnchorRef.current = null;
      adjustLightboxScale(pendingScale, pendingAnchor);
    });
  };

  const scheduleWheelScale = (nextScale: number, anchor: { clientX: number; clientY: number }) => {
    wheelPendingScaleRef.current = nextScale;
    wheelPendingAnchorRef.current = anchor;

    if (wheelFrameRef.current !== null) {
      return;
    }

    wheelFrameRef.current = window.requestAnimationFrame(() => {
      wheelFrameRef.current = null;

      if (wheelPendingScaleRef.current === null) {
        return;
      }

      const pendingScale = wheelPendingScaleRef.current;
      const pendingAnchor = wheelPendingAnchorRef.current ?? undefined;
      wheelPendingScaleRef.current = null;
      wheelPendingAnchorRef.current = null;
      adjustLightboxScale(pendingScale, pendingAnchor);
    });
  };

  const updateLightboxBaseSize = (image: HTMLImageElement) => {
    const maxWidth = Math.min(window.innerWidth * 0.96, 1800);
    const maxHeight = Math.max(window.innerHeight - 144, 240);
    const widthRatio = maxWidth / image.naturalWidth;
    const heightRatio = maxHeight / image.naturalHeight;
    const fitRatio = Math.min(widthRatio, heightRatio, 1);

    const nextBaseSize = {
      width: Math.round(image.naturalWidth * fitRatio),
      height: Math.round(image.naturalHeight * fitRatio)
    };

    setLightboxBaseSize(nextBaseSize);

    if (lightboxScaleRef.current <= 1.01) {
      setLightboxPanState({ x: 0, y: 0 }, 1, nextBaseSize);
      return;
    }

    setLightboxPanState(lightboxPanRef.current, lightboxScaleRef.current, nextBaseSize);
  };

  useEffect(() => {
    if (!lightboxImage || !lightboxImageRef.current) {
      return;
    }

    const handleResize = () => {
      if (!lightboxImageRef.current?.complete) {
        return;
      }

      updateLightboxBaseSize(lightboxImageRef.current);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [lightboxImage]);

  useEffect(() => {
    let cancelled = false;

    const loadHealth = async () => {
      try {
        const response = await fetch("/api/health");

        if (!response.ok) {
          throw new Error("Unable to reach the inquiry service.");
        }

        const payload = (await response.json()) as { status: string };

        if (!cancelled) {
          startTransition(() => {
            setBackendOnline(payload.status === "ok");
          });
        }
      } catch {
        if (!cancelled) {
          startTransition(() => {
            setBackendOnline(false);
          });
        }
      }
    };

    void loadHealth();

    return () => {
      cancelled = true;
    };
  }, []);

  const activateTab = (tabId: TabId) => {
    setSelectedCause(null);
    setSelectedAlbumFolder(null);
    setSelectedAlbum(null);
    setLightboxImage(null);
    setLightboxZoomed(false);
    setLightboxScale(1);
    setLightboxBaseSize(null);
    setLightboxPan({ x: 0, y: 0 });
    resetLightboxInteractionState();

    startTransition(() => {
      setActiveTab(tabId);
    });

    window.history.replaceState(null, "", `#${tabId}`);
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) {
      return;
    }
    setIsSubmitting(true);
    setStatusMessage("");
    setStatusTone("idle");

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...form,
          recipientGroup: "general"
        })
      });

      const payload = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Something went wrong.");
      }

      setForm(initialForm);
      setStatusTone("success");
      setStatusMessage(payload.message ?? "Form submitted successfully.");
    } catch (error) {
      setStatusTone("error");
      setStatusMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormFieldChange = <K extends keyof InquiryForm>(field: K, value: InquiryForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleActivateTab = (tabId: TabId) => {
    activateTab(tabId);
    setMobileNavOpen(false);
  };

  const handleOpenDonateDialog = () => {
    setDonateDialogOpen(true);
  };

  const {
    tabs,
    contactChannels,
    houseShields,
    connectMoments,
    groupedEventAlbums,
    causeCards,
    inquiryTopics,
    connectPage,
    homeCopy,
    causesCopy,
    donateCopy,
    donationRoutes,
    donationInfo,
    connectCopy
  } = siteContent;
  const isAdminRoute = window.location.pathname.startsWith("/admin");
  const connectTabDetails = tabs.find((tab) => tab.id === "connect") ?? tabs[0];
  const activeTabDetails = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const isOverviewTab = activeTab === "home";

  if (isAdminRoute) {
    return (
        <AdminSiteContentPage
          details={connectTabDetails}
          onContentSaved={(content) => {
            setSiteContent(normalizeSiteContent(content));
            window.localStorage.setItem(siteContentUpdatedStorageKey, String(Date.now()));
          }}
        />
    );
  }

  return (
    <div className={`site-shell ${activeTab === "connect" ? "is-connect-view" : ""}`}>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="site-header">
        <div className="site-header-inner">
          <div className="mobile-nav-shell">
            <button
              className={mobileNavOpen ? "mobile-nav-toggle is-open" : "mobile-nav-toggle"}
              type="button"
              aria-label={mobileNavOpen ? "Close site navigation" : "Open site navigation"}
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-site-nav"
              onClick={() => setMobileNavOpen((current) => !current)}
            >
              <span className="mobile-nav-icon" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span className="mobile-nav-label">Menu</span>
            </button>

            <div id="mobile-site-nav" className={mobileNavOpen ? "mobile-site-nav is-open" : "mobile-site-nav"} hidden={!mobileNavOpen}>
              <nav className="site-nav mobile-site-nav-list" aria-label="Site pages" role="tablist">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`${tab.id}-panel`}
                    tabIndex={activeTab === tab.id ? 0 : -1}
                    className={activeTab === tab.id ? "site-tab is-active" : "site-tab"}
                    onClick={() => handleActivateTab(tab.id)}
                    onKeyDown={handleRovingTabKeyDown}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <button className="brand-lockup" onClick={() => handleActivateTab("home")} type="button" aria-label="Go to home">
            <img src="/assets/jaana-logo-blue.png" alt="JAANA logo" />
          </button>

          <div className="house-shields header-shields" aria-label="SJBHS house shields">
            {houseShields.map((shield) => (
              <div className="house-shield" key={shield.src}>
                <img src={shield.src} alt={shield.alt} />
              </div>
            ))}
          </div>

          <div className="header-actions">
            <nav className="site-nav" aria-label="Site pages" role="tablist">
              {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`${tab.id}-panel`}
                    tabIndex={activeTab === tab.id ? 0 : -1}
                    className={activeTab === tab.id ? "site-tab is-active" : "site-tab"}
                    onClick={() => activateTab(tab.id)}
                    onKeyDown={handleRovingTabKeyDown}
                  >
                    {tab.label}
                  </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className={isOverviewTab ? "main-overview" : "main-subpage"}>
        {isOverviewTab ? (
          <HomePage
            connectMoments={connectMoments}
            homeCopy={homeCopy}
            onActivateTab={activateTab}
            onOpenPastEventsDialog={() => setPastEventsDialogOpen(true)}
            onOpenLightboxImage={openLightboxImage}
          />
        ) : null}

        {activeTab === "causes" ? (
          <CausesPage
            details={activeTabDetails}
            causeCards={causeCards}
            causesCopy={causesCopy}
            onSelectCause={(cause) => setSelectedCause(cause)}
          />
        ) : null}

        {activeTab === "donate" ? (
          <DonatePage
            details={activeTabDetails}
            donateCopy={donateCopy}
            donationRoutes={donationRoutes}
            donationInfo={donationInfo}
            onDonateClick={handleOpenDonateDialog}
          />
        ) : null}

        {activeTab === "contact" ? (
          <ContactPage
            form={form}
            isSubmitting={isSubmitting}
            statusMessage={statusMessage}
            statusTone={statusTone}
            onSubmit={handleSubmit}
            onFieldChange={handleFormFieldChange}
          />
        ) : null}

        {activeTab === "connect" ? (
          <ConnectPage
            details={activeTabDetails}
            connectContent={connectPage}
            connectCopy={connectCopy}
            registrationOpenRequest={connectRegistrationRequest}
          />
        ) : null}
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <strong>JAANA</strong>
          <span>The Josephite Alumni Association of North America.</span>
        </div>
        <div className="footer-contacts">
          {contactChannels.map((channel) => (
            <a key={channel.label} href={channel.href} target={channel.href.startsWith("http") ? "_blank" : undefined} rel={channel.href.startsWith("http") ? "noreferrer" : undefined}>
              <span className="contact-label">{channel.label}</span>
              <span className="contact-value">{channel.value}</span>
            </a>
          ))}
        </div>
      </footer>

      {selectedCause ? (
        <CauseDialog
          cause={selectedCause}
          onClose={() => setSelectedCause(null)}
          onDonateClick={handleOpenDonateDialog}
          disableEscape={donateDialogOpen}
        />
      ) : null}

      {selectedAlbumFolder ? (
        <AlbumDialog
          folder={selectedAlbumFolder}
          selectedAlbum={selectedAlbum}
          onClose={() => {
            setSelectedAlbum(null);
            setSelectedAlbumFolder(null);
          }}
          onBack={() => setSelectedAlbum(null)}
          onSelectAlbum={setSelectedAlbum}
          onOpenLightboxImage={openLightboxImage}
        />
      ) : null}

      {pastEventsDialogOpen ? (
        <PastEventsDialog
          folders={groupedEventAlbums}
          onClose={() => setPastEventsDialogOpen(false)}
          onOpenLightboxImage={openLightboxImage}
        />
      ) : null}

      {lightboxImage ? (
        <LightboxDialog
          image={lightboxImage}
          zoomed={lightboxZoomed}
          dragging={lightboxDragging}
          pinching={lightboxPinching}
          wheeling={lightboxWheeling}
          scale={lightboxScale}
          pan={lightboxPan}
          baseSize={lightboxBaseSize}
          lightboxScaleRef={lightboxScaleRef}
          lightboxPanRef={lightboxPanRef}
          wheelStopTimeoutRef={wheelStopTimeoutRef}
          pinchDistanceRef={pinchDistanceRef}
          pinchScaleRef={pinchScaleRef}
          pinchMovedRef={pinchMovedRef}
          pinchFrameRef={pinchFrameRef}
          pinchPendingScaleRef={pinchPendingScaleRef}
          pinchPendingAnchorRef={pinchPendingAnchorRef}
          dragMovedRef={dragMovedRef}
          lightboxDragRef={lightboxDragRef}
          lightboxMediaRef={lightboxMediaRef}
          lightboxFrameRef={lightboxFrameRef}
          lightboxImageRef={lightboxImageRef}
          onClose={closeLightbox}
          onToggleZoom={toggleLightboxZoom}
          onSetWheeling={setLightboxWheeling}
          onSetPinching={setLightboxPinching}
          onSetDragging={setLightboxDragging}
          onSetPanState={setLightboxPanState}
          onScheduleWheelScale={scheduleWheelScale}
          onSchedulePinchScale={schedulePinchScale}
          onUpdateBaseSize={updateLightboxBaseSize}
          onStopDrag={stopLightboxDrag}
        />
      ) : null}

      <ZeffyDonateDialog open={donateDialogOpen} onClose={() => setDonateDialogOpen(false)} />
    </div>
  );
}

export default App;
