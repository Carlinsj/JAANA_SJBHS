import { FormEvent, useEffect, useMemo, useState } from "react";
import { defaultSiteContent, normalizeSiteContent } from "../siteContent";
import {
  AlbumFolder,
  CauseCard,
  DonationInfoId,
  DonationRouteAction,
  EventAlbum,
  GalleryImage,
  InquiryForm,
  SiteContent,
  TabConfig,
  TabId
} from "../types";
import { CausesPage } from "./CausesPage";
import { CauseDialog } from "./CauseDialog";
import { ContactPage } from "./ContactPage";
import { ConnectPage } from "./ConnectPage";
import { DonatePage } from "./DonatePage";
import { HomePage } from "./HomePage";
import { initialForm } from "../content";
import { ZeffyDonateDialog } from "./ZeffyDonateDialog";
import { handleRovingTabKeyDown } from "../accessibility";

type InquiryEntry = {
  id: string;
  name: string;
  email: string;
  organization: string;
  interest: string;
  phone?: string;
  notes: string;
  createdAt: string;
  replyStatus: "pending" | "complete";
  completedAt?: string;
};

type InquiryResponse = {
  total?: number;
  filteredTotal?: number;
  inquiries?: InquiryEntry[];
  error?: string;
};

const inquiryStatusOptions = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "complete", label: "Complete" }
] as const;

type AdminSiteContentPageProps = {
  details: TabConfig;
  onContentSaved?: (content: SiteContent) => void;
};

async function readJson(response: Response) {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createId(prefix: string, value: string) {
  const slug = slugify(value) || "item";
  return `${prefix}-${slug}-${Date.now().toString(36)}`;
}

function albumFallback(): EventAlbum {
  return {
    id: createId("album", "new album"),
    title: "New album",
    category: "new",
    label: "New",
    summary: "Describe the album here.",
    cover: {
      src: "/assets/jaana-wordmark.png",
      alt: "Album cover",
      caption: "Album cover"
    },
    photos: []
  };
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Unable to read the selected file."));
    };
    reader.onerror = () => reject(new Error("Unable to read the selected file."));
    reader.readAsDataURL(file);
  });
}

function escapeCsvCell(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, "\"\"")}"`;
  }

  return value;
}

function formatInquiryTimestamp(value: string) {
  return new Date(value).toLocaleString();
}

function buildInquiryCsv(inquiries: InquiryEntry[]) {
  const headers = ["Submitted At", "Status", "Completed At", "Name", "Email", "Phone", "Interest", "Batch / City / Organization", "Notes"];
  const rows = inquiries.map((inquiry) =>
    [
      formatInquiryTimestamp(inquiry.createdAt),
      inquiry.replyStatus === "complete" ? "Complete" : "Pending",
      inquiry.completedAt ? formatInquiryTimestamp(inquiry.completedAt) : "",
      inquiry.name,
      inquiry.email,
      inquiry.phone || "",
      inquiry.interest,
      inquiry.organization || "",
      inquiry.notes || ""
    ]
      .map((cell) => escapeCsvCell(cell))
      .join(",")
  );

  return `\uFEFF${[headers.join(","), ...rows].join("\n")}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildInquiryExcelDocument(inquiries: InquiryEntry[]) {
  const rows = inquiries
    .map(
      (inquiry) => `
        <tr>
          <td>${escapeHtml(formatInquiryTimestamp(inquiry.createdAt))}</td>
          <td>${escapeHtml(inquiry.replyStatus === "complete" ? "Complete" : "Pending")}</td>
          <td>${escapeHtml(inquiry.completedAt ? formatInquiryTimestamp(inquiry.completedAt) : "")}</td>
          <td>${escapeHtml(inquiry.name)}</td>
          <td>${escapeHtml(inquiry.email)}</td>
          <td>${escapeHtml(inquiry.phone || "")}</td>
          <td>${escapeHtml(inquiry.interest)}</td>
          <td>${escapeHtml(inquiry.organization || "")}</td>
          <td>${escapeHtml(inquiry.notes || "")}</td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #cfd8ea; padding: 8px; text-align: left; vertical-align: top; }
      th { background: #eef3ff; font-weight: 700; }
    </style>
  </head>
  <body>
    <table>
      <thead>
        <tr>
          <th>Submitted At</th>
          <th>Status</th>
          <th>Completed At</th>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Interest</th>
          <th>Batch / City / Organization</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </body>
</html>`;
}

function downloadTextFile(contents: string, filename: string, mimeType: string) {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function buildInquiryExportFilename(extension: "csv" | "xls", from: string, to: string) {
  const suffix =
    from && to ? `${from}_to_${to}` : from ? `from_${from}` : to ? `through_${to}` : "all_time";

  return `jaana_inquiries_${suffix}.${extension}`;
}

function toggleMultiFilter(current: string[], option: string) {
  if (option === "all") {
    return ["all"];
  }

  const withoutAll = current.filter((value) => value !== "all");

  if (withoutAll.includes(option)) {
    const next = withoutAll.filter((value) => value !== option);
    return next.length ? next : ["all"];
  }

  return [...withoutAll, option];
}

function formatFilterSummary(values: string[], allLabel: string) {
  if (!values.length || values.includes("all")) {
    return allLabel;
  }

  return values.join(", ");
}

export function AdminSiteContentPage({ details, onContentSaved }: AdminSiteContentPageProps) {
  const [authState, setAuthState] = useState<"loading" | "signedOut" | "signedIn">("loading");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState("Sign in to edit the site content.");
  const [configuredAdminEmail, setConfiguredAdminEmail] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [editableContent, setEditableContent] = useState<SiteContent>(defaultSiteContent);
  const [savedContent, setSavedContent] = useState<SiteContent>(defaultSiteContent);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>(defaultSiteContent.tabs[0]?.id ?? "home");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [selectedCause, setSelectedCause] = useState<CauseCard | null>(null);
  const [selectedCauseIndex, setSelectedCauseIndex] = useState<number | null>(null);
  const [donateDialogOpen, setDonateDialogOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState<"idle" | "success" | "error">("idle");
  const [editorStatus, setEditorStatus] = useState("Saved content stays on the public site.");
  const [inquiryTotal, setInquiryTotal] = useState(0);
  const [inquiryFilteredTotal, setInquiryFilteredTotal] = useState(0);
  const [recentInquiries, setRecentInquiries] = useState<InquiryEntry[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [inquiriesStatus, setInquiriesStatus] = useState("Latest inquiries appear here once loaded.");
  const [inquiryDateFrom, setInquiryDateFrom] = useState("");
  const [inquiryDateTo, setInquiryDateTo] = useState("");
  const [selectedInquiryStatuses, setSelectedInquiryStatuses] = useState<string[]>(["all"]);
  const [selectedInquiryCategories, setSelectedInquiryCategories] = useState<string[]>(["all"]);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [draftInquiryDateFrom, setDraftInquiryDateFrom] = useState("");
  const [draftInquiryDateTo, setDraftInquiryDateTo] = useState("");
  const [draftInquiryStatuses, setDraftInquiryStatuses] = useState<string[]>(["all"]);
  const [draftInquiryCategories, setDraftInquiryCategories] = useState<string[]>(["all"]);
  const [inquiryExportingFormat, setInquiryExportingFormat] = useState<"idle" | "csv" | "excel">("idle");
  const [activeInquiryActionId, setActiveInquiryActionId] = useState("");
  const [editorView, setEditorView] = useState<"content" | "media" | "inquiries">("content");
  const [mediaReturnView, setMediaReturnView] = useState<"content" | "inquiries">("content");
  const [jsonDraft, setJsonDraft] = useState(JSON.stringify(defaultSiteContent, null, 2));
  const [jsonError, setJsonError] = useState("");
  const [jsonDirty, setJsonDirty] = useState(false);
  const [newFolderTitle, setNewFolderTitle] = useState("");
  const [newAlbumTitle, setNewAlbumTitle] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [selectedAlbumId, setSelectedAlbumId] = useState("");
  const [selectedImageCaption, setSelectedImageCaption] = useState("");
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [imageInputKey, setImageInputKey] = useState(0);
  const [folderFormOpen, setFolderFormOpen] = useState(false);
  const [albumFormOpen, setAlbumFormOpen] = useState(false);
  const [imageFormOpen, setImageFormOpen] = useState(false);
  const [causeFormOpen, setCauseFormOpen] = useState(false);
  const [newCauseTitle, setNewCauseTitle] = useState("");
  const [donationRouteFormOpen, setDonationRouteFormOpen] = useState(false);
  const [newDonationRouteTitle, setNewDonationRouteTitle] = useState("");
  const [newDonationRouteAction, setNewDonationRouteAction] = useState<DonationRouteAction>("smallGift");
  const [newDonationRouteCustomLabel, setNewDonationRouteCustomLabel] = useState("Donate Today");

  const currentFolders = editableContent.groupedEventAlbums;
  const selectedFolder = useMemo(
    () => (selectedFolderId ? currentFolders.find((folder) => folder.id === selectedFolderId) ?? null : null),
    [currentFolders, selectedFolderId]
  );
  const selectedAlbum = useMemo(
    () => (selectedFolder && selectedAlbumId ? selectedFolder.albums.find((album) => album.id === selectedAlbumId) ?? null : null),
    [selectedAlbumId, selectedFolder]
  );
  const inquiryCategoryOptions = useMemo(() => ["all", ...editableContent.inquiryTopics], [editableContent.inquiryTopics]);
  const appliedInquiryStatusLabel = useMemo(
    () =>
      formatFilterSummary(
        selectedInquiryStatuses.map((value) => inquiryStatusOptions.find((option) => option.value === value)?.label ?? value),
        "All"
      ),
    [selectedInquiryStatuses]
  );
  const appliedInquiryCategoryLabel = useMemo(
    () => formatFilterSummary(selectedInquiryCategories.map((value) => (value === "all" ? "All" : value)), "All"),
    [selectedInquiryCategories]
  );
  const mediaLevel = selectedAlbum ? "images" : selectedFolder ? "subfolders" : "folders";

  const syncJsonDraft = (content: SiteContent) => {
    setJsonDraft(JSON.stringify(content, null, 2));
    setJsonError("");
    setJsonDirty(false);
  };

  const updateContent = (updater: (current: SiteContent) => SiteContent) => {
    setEditableContent((current) => updater(current));
  };

  const updateNestedContent = <K extends keyof SiteContent>(key: K, updater: (value: SiteContent[K]) => SiteContent[K]) => {
    updateContent((current) => ({
      ...current,
      [key]: updater(current[key])
    }));
  };

  const loadEditorContent = async () => {
    const response = await fetch("/api/site-content", {
      credentials: "include"
    });

    if (response.status === 401) {
      setAuthState("signedOut");
      setLoginStatus("Sign in to edit the site content.");
      setEditorStatus("Sign in to edit the site content.");
      return false;
    }

    const payload = (await readJson(response)) as Partial<SiteContent> & { error?: string };

    if (!response.ok) {
      setEditorStatus(payload.error ?? "Unable to load the site content.");
      return false;
    }

    const content = normalizeSiteContent(payload);

    setEditableContent(content);
    setSavedContent(content);
    syncJsonDraft(content);
    setIsEditing(false);
    setEditorStatus("Loaded the site content.");
    return true;
  };

  const loadInquiryInbox = async ({
    from = inquiryDateFrom,
    to = inquiryDateTo,
    statuses = selectedInquiryStatuses,
    categories = selectedInquiryCategories,
    limit = 100,
    silent = false
  }: {
    from?: string;
    to?: string;
    statuses?: string[];
    categories?: string[];
    limit?: number | "all";
    silent?: boolean;
  } = {}) => {
    setInquiriesLoading(true);
    if (!silent) {
      setInquiriesStatus("Loading inquiries...");
    }

    try {
      const searchParams = new URLSearchParams();
      searchParams.set("limit", String(limit));
      if (from) {
        searchParams.set("from", from);
      }
      if (to) {
        searchParams.set("to", to);
      }
      if (statuses.length && !statuses.includes("all")) {
        searchParams.set("statuses", statuses.join(","));
      }
      if (categories.length && !categories.includes("all")) {
        searchParams.set("categories", categories.join(","));
      }

      const response = await fetch(`/api/admin/inquiries?${searchParams.toString()}`, {
        credentials: "include"
      });

      if (response.status === 401) {
        setAuthState("signedOut");
        setLoginStatus("Sign in to edit the site content.");
        setInquiriesStatus("Sign in to view inquiries.");
        return false;
      }

      const payload = (await readJson(response)) as InquiryResponse;

      if (!response.ok) {
        setInquiriesStatus(payload.error ?? "Unable to load inquiries.");
        return false;
      }

      setInquiryTotal(typeof payload.total === "number" ? payload.total : 0);
      setInquiryFilteredTotal(typeof payload.filteredTotal === "number" ? payload.filteredTotal : 0);
      setRecentInquiries(Array.isArray(payload.inquiries) ? payload.inquiries : []);
      setInquiriesStatus(limit === "all" ? "Loaded inquiries for export." : "Loaded latest inquiries.");
      return true;
    } catch {
      setInquiriesStatus("Unable to load inquiries.");
      return false;
    } finally {
      setInquiriesLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadSession = async () => {
      try {
        const response = await fetch("/api/admin/session", {
          credentials: "include"
        });

        const payload = (await readJson(response)) as { authenticated?: boolean; adminEmail?: string; error?: string };

        if (cancelled) {
          return;
        }

        if (typeof payload.adminEmail === "string") {
          setConfiguredAdminEmail(payload.adminEmail);
        }

        if (!response.ok || !payload.authenticated) {
          setAuthState("signedOut");
          setLoginStatus("Sign in to edit the site content.");
          return;
        }

        setAuthState("signedIn");
        await loadEditorContent();
        await loadInquiryInbox();
      } catch {
        if (!cancelled) {
          setAuthState("signedOut");
          setLoginStatus("Sign in to edit the site content.");
        }
      }
    };

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

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
          setBackendOnline(payload.status === "ok");
        }
      } catch {
        if (!cancelled) {
          setBackendOnline(false);
        }
      }
    };

    void loadHealth();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!jsonDirty) {
      syncJsonDraft(editableContent);
    }
  }, [editableContent, jsonDirty]);

  useEffect(() => {
    setSelectedFolderId((current) => {
      if (currentFolders.some((folder) => folder.id === current)) {
        return current;
      }

      return "";
    });
  }, [currentFolders]);

  useEffect(() => {
    if (!selectedFolder) {
      setSelectedAlbumId("");
      return;
    }

    setSelectedAlbumId((current) => {
      if (selectedFolder.albums.some((album) => album.id === current)) {
        return current;
      }

      return "";
    });
  }, [selectedFolder]);

  useEffect(() => {
    setSelectedInquiryCategories((current) => {
      if (current.includes("all")) {
        return ["all"];
      }

      const next = current.filter((value) => inquiryCategoryOptions.includes(value));
      return next.length ? next : ["all"];
    });
  }, [inquiryCategoryOptions]);

  useEffect(() => {
    setDraftInquiryCategories((current) => {
      if (current.includes("all")) {
        return ["all"];
      }

      const next = current.filter((value) => inquiryCategoryOptions.includes(value));
      return next.length ? next : ["all"];
    });
  }, [inquiryCategoryOptions]);

  useEffect(() => {
    setActiveTab((current) => {
      if (editableContent.tabs.some((tab) => tab.id === current)) {
        return current;
      }

      return editableContent.tabs[0]?.id ?? "home";
    });
  }, [editableContent.tabs]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [activeTab]);

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(editableContent) !== JSON.stringify(savedContent),
    [editableContent, savedContent]
  );

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoggingIn(true);
    setLoginStatus("Checking credentials...");
    const emailToSubmit = loginEmail.trim();

    try {
      if (!emailToSubmit) {
        throw new Error("Enter the admin email.");
      }

      const response = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: emailToSubmit,
          password: loginPassword
        })
      });

      const payload = (await readJson(response)) as { authenticated?: boolean; email?: string; error?: string };

      if (!response.ok || !payload.authenticated) {
        throw new Error(payload.error ?? "Unable to sign in.");
      }

      if (typeof payload.email === "string") {
        setConfiguredAdminEmail(payload.email);
      }

      setAuthState("signedIn");
      setIsEditing(false);
      setLoginEmail("");
      setLoginPassword("");
      setLoginStatus("Signed in.");
      await loadEditorContent();
      await loadInquiryInbox();
    } catch (error) {
      setLoginStatus(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
      setStatusMessage(payload.message ?? "Thanks for reaching out.");
    } catch (error) {
      setStatusTone("error");
      setStatusMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormFieldChange = <K extends keyof typeof initialForm>(field: K, value: (typeof initialForm)[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include"
      });
    } finally {
      setAuthState("signedOut");
      setLoginStatus("Sign in to edit the site content.");
      setLoginPassword("");
      setIsEditing(false);
      setEditorView("content");
      setEditorStatus("Sign in to edit the site content.");
      setInquiryTotal(0);
      setInquiryFilteredTotal(0);
      setRecentInquiries([]);
      setInquiriesStatus("Sign in to view inquiries.");
    }
  };

  const openContentView = () => {
    setEditorView("content");
    setEditorStatus(isEditing ? "Text on the page is editable in place." : "Open edit mode to change visible copy.");
  };

  const openMediaView = () => {
    setMediaReturnView(editorView === "inquiries" ? "inquiries" : "content");
    openMediaRoot();
  };

  const openInquiriesView = async () => {
    setEditorView("inquiries");
    setEditorStatus("Review and export incoming inquiries.");
    await loadInquiryInbox({ limit: 100 });
  };

  const openInquiryFilters = () => {
    setDraftInquiryDateFrom(inquiryDateFrom);
    setDraftInquiryDateTo(inquiryDateTo);
    setDraftInquiryStatuses(selectedInquiryStatuses);
    setDraftInquiryCategories(selectedInquiryCategories);
    setFilterDialogOpen(true);
  };

  const closeInquiryFilters = () => {
    setFilterDialogOpen(false);
  };

  const handleApplyInquiryFilters = async () => {
    setInquiryDateFrom(draftInquiryDateFrom);
    setInquiryDateTo(draftInquiryDateTo);
    setSelectedInquiryStatuses(draftInquiryStatuses);
    setSelectedInquiryCategories(draftInquiryCategories);
    setFilterDialogOpen(false);
    await loadInquiryInbox({
      from: draftInquiryDateFrom,
      to: draftInquiryDateTo,
      statuses: draftInquiryStatuses,
      categories: draftInquiryCategories,
      limit: 100
    });
  };

  const handleClearInquiryFilters = async () => {
    setInquiryDateFrom("");
    setInquiryDateTo("");
    setSelectedInquiryStatuses(["all"]);
    setSelectedInquiryCategories(["all"]);
    setDraftInquiryDateFrom("");
    setDraftInquiryDateTo("");
    setDraftInquiryStatuses(["all"]);
    setDraftInquiryCategories(["all"]);
    await loadInquiryInbox({ from: "", to: "", statuses: ["all"], categories: ["all"], limit: 100 });
  };

  const exportInquiries = async (format: "csv" | "excel") => {
    setInquiryExportingFormat(format);
    setInquiriesStatus(`Preparing ${format === "csv" ? "CSV" : "Excel"} export...`);

    try {
      const searchParams = new URLSearchParams();
      searchParams.set("limit", "all");
      if (inquiryDateFrom) {
        searchParams.set("from", inquiryDateFrom);
      }
      if (inquiryDateTo) {
        searchParams.set("to", inquiryDateTo);
      }
      if (!selectedInquiryStatuses.includes("all")) {
        searchParams.set("statuses", selectedInquiryStatuses.join(","));
      }
      if (!selectedInquiryCategories.includes("all")) {
        searchParams.set("categories", selectedInquiryCategories.join(","));
      }

      const response = await fetch(`/api/admin/inquiries?${searchParams.toString()}`, {
        credentials: "include"
      });
      const payload = (await readJson(response)) as InquiryResponse;

      if (response.status === 401) {
        setAuthState("signedOut");
        setLoginStatus("Sign in to edit the site content.");
        throw new Error("Your admin session expired. Sign in again.");
      }

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to export inquiries.");
      }

      const inquiries = Array.isArray(payload.inquiries) ? payload.inquiries : [];

      if (!inquiries.length) {
        throw new Error("No inquiries match the selected time frame.");
      }

      if (format === "csv") {
        downloadTextFile(buildInquiryCsv(inquiries), buildInquiryExportFilename("csv", inquiryDateFrom, inquiryDateTo), "text/csv;charset=utf-8");
      } else {
        downloadTextFile(
          buildInquiryExcelDocument(inquiries),
          buildInquiryExportFilename("xls", inquiryDateFrom, inquiryDateTo),
          "application/vnd.ms-excel;charset=utf-8"
        );
      }

      setInquiriesStatus(`Downloaded ${inquiries.length} inquiries.`);
    } catch (error) {
      setInquiriesStatus(error instanceof Error ? error.message : "Unable to export inquiries.");
    } finally {
      setInquiryExportingFormat("idle");
    }
  };

  const handleCompleteInquiry = async (id: string) => {
    setActiveInquiryActionId(id);
    setInquiriesStatus("Marking inquiry complete...");

    try {
      const response = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          replyStatus: "complete"
        })
      });
      const payload = (await readJson(response)) as { message?: string; error?: string };

      if (response.status === 401) {
        setAuthState("signedOut");
        setLoginStatus("Sign in to edit the site content.");
        throw new Error("Your admin session expired. Sign in again.");
      }

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to update the inquiry.");
      }

      setRecentInquiries((current) =>
        current.map((inquiry) =>
          inquiry.id === id
            ? {
                ...inquiry,
                replyStatus: "complete",
                completedAt: new Date().toISOString()
              }
            : inquiry
        )
      );
      setInquiriesStatus(payload.message ?? "Inquiry marked complete.");
    } catch (error) {
      setInquiriesStatus(error instanceof Error ? error.message : "Unable to update the inquiry.");
    } finally {
      setActiveInquiryActionId("");
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    const target = recentInquiries.find((inquiry) => inquiry.id === id);

    if (!target || !window.confirm(`Delete the inquiry from ${target.name}? This cannot be undone.`)) {
      return;
    }

    setActiveInquiryActionId(id);
    setInquiriesStatus("Deleting inquiry...");

    try {
      const response = await fetch(`/api/admin/inquiries/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      const payload = (await readJson(response)) as { message?: string; error?: string };

      if (response.status === 401) {
        setAuthState("signedOut");
        setLoginStatus("Sign in to edit the site content.");
        throw new Error("Your admin session expired. Sign in again.");
      }

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to delete the inquiry.");
      }

      setRecentInquiries((current) => current.filter((inquiry) => inquiry.id !== id));
      setInquiryTotal((current) => Math.max(0, current - 1));
      setInquiryFilteredTotal((current) => Math.max(0, current - 1));
      setInquiriesStatus(payload.message ?? "Inquiry deleted.");
    } catch (error) {
      setInquiriesStatus(error instanceof Error ? error.message : "Unable to delete the inquiry.");
    } finally {
      setActiveInquiryActionId("");
    }
  };

  const handleToggleInquiryStatus = (option: string) => {
    setDraftInquiryStatuses((current) => toggleMultiFilter(current, option));
  };

  const handleToggleInquiryCategory = (option: string) => {
    setDraftInquiryCategories((current) => toggleMultiFilter(current, option));
  };

  const applyJsonDraft = () => {
    try {
      const parsed = JSON.parse(jsonDraft) as Partial<SiteContent>;
      const content = normalizeSiteContent(parsed);

      setEditableContent(content);
      setJsonError("");
      setJsonDirty(false);
      setEditorStatus("Applied the JSON draft.");
      return true;
    } catch {
      setJsonError("The JSON draft is invalid. Fix it before saving.");
      setEditorStatus("Fix the JSON draft before saving.");
      return false;
    }
  };

  const handleSave = async () => {
    if (jsonDirty && !applyJsonDraft()) {
      return;
    }

    setIsSaving(true);
    setEditorStatus("Saving changes...");

    try {
      const response = await fetch("/api/site-content", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editableContent)
      });

      const payload = (await readJson(response)) as { content?: SiteContent; error?: string };

      if (response.status === 401) {
        setAuthState("signedOut");
        setLoginStatus("Sign in to edit the site content.");
        throw new Error("Your admin session expired. Sign in again.");
      }

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save site content.");
      }

      const saved = payload.content ?? editableContent;
      setEditableContent(saved);
      setSavedContent(saved);
      syncJsonDraft(saved);
      onContentSaved?.(saved);
      setEditorStatus("Saved to the site.");
    } catch (error) {
      setEditorStatus(error instanceof Error ? error.message : "Unable to save site content.");
    } finally {
      setIsSaving(false);
    }
  };

  const undoChanges = () => {
    setEditableContent(savedContent);
    syncJsonDraft(savedContent);
    setEditorStatus("Reverted to the last saved version.");
  };

  const addFolder = () => {
    if (!newFolderTitle.trim()) {
      setEditorStatus("Enter a folder title first.");
      return;
    }

    const folderTitle = newFolderTitle.trim();
    const nextFolder: AlbumFolder = {
      id: createId("folder", folderTitle),
      title: folderTitle,
      description: `${folderTitle} photo collections and event memories.`,
      albums: []
    };

    updateContent((current) => ({
      ...current,
      groupedEventAlbums: [...current.groupedEventAlbums, nextFolder]
    }));

    setSelectedFolderId(nextFolder.id);
    setSelectedAlbumId("");
    setNewFolderTitle("");
    setFolderFormOpen(false);
    setAlbumFormOpen(false);
    setEditorStatus(`Added folder ${nextFolder.title}.`);
  };

  const addAlbum = () => {
    const folderIndex = currentFolders.findIndex((folder) => folder.id === selectedFolderId);

    if (folderIndex < 0) {
      setEditorStatus("Choose a folder first.");
      return;
    }

    if (!newAlbumTitle.trim()) {
      setEditorStatus("Enter an album title first.");
      return;
    }

    const albumTitle = newAlbumTitle.trim();
    const fallbackAlbum = albumFallback();
    const nextAlbum: EventAlbum = {
      ...fallbackAlbum,
      id: createId("album", albumTitle),
      title: albumTitle,
      category: currentFolders[folderIndex].id,
      label: "Album",
      summary: `${albumTitle} photo collection.`,
      cover: {
        ...fallbackAlbum.cover,
        alt: `${albumTitle} cover`,
        caption: `${albumTitle} cover`
      },
      photos: []
    };

    updateContent((current) => {
      const nextFolders = current.groupedEventAlbums.map((folder, index) =>
        index === folderIndex ? { ...folder, albums: [...folder.albums, nextAlbum] } : folder
      );

      return {
        ...current,
        groupedEventAlbums: nextFolders
      };
    });

    setSelectedAlbumId(nextAlbum.id ?? "");
    setNewAlbumTitle("");
    setAlbumFormOpen(false);
    setImageFormOpen(false);
    setEditorStatus(`Added subfolder ${nextAlbum.title}.`);
  };

  const addImage = async () => {
    const folderIndex = currentFolders.findIndex((folder) => folder.id === selectedFolderId);
    const albumIndex = selectedFolder?.albums.findIndex((album) => album.id === selectedAlbumId) ?? -1;

    if (folderIndex < 0 || albumIndex < 0) {
      setEditorStatus("Choose a folder and subfolder first.");
      return;
    }

    if (!pendingImageFile) {
      setEditorStatus("Choose an image file first.");
      return;
    }

    if (!selectedImageCaption.trim()) {
      setEditorStatus("Enter an image caption first.");
      return;
    }

    const imageCaption = selectedImageCaption.trim();
    const src = await readFileAsDataUrl(pendingImageFile);
    const nextImage: GalleryImage = {
      src,
      alt: imageCaption,
      caption: imageCaption
    };

    updateContent((current) => {
      const nextFolders = current.groupedEventAlbums.map((folder, currentFolderIndex) => {
        if (currentFolderIndex !== folderIndex) {
          return folder;
        }

        return {
          ...folder,
          albums: folder.albums.map((album, currentAlbumIndex) => {
            if (currentAlbumIndex !== albumIndex) {
              return album;
            }

            return {
              ...album,
              photos: [...album.photos, nextImage],
              cover: album.photos[0] ?? nextImage ?? album.cover
            };
          })
        };
      });

      return {
        ...current,
        groupedEventAlbums: nextFolders
      };
    });

    setEditorStatus(`Added image to ${selectedAlbum?.title ?? "the subfolder"}.`);
    setSelectedImageCaption("");
    setPendingImageFile(null);
    setImageInputKey((current) => current + 1);
    setImageFormOpen(false);
  };

  const deleteFolder = (folderId: string) => {
    const folder = currentFolders.find((item) => item.id === folderId);

    if (!folder || !window.confirm(`Delete the folder "${folder.title}" and all subfolders/photos inside it?`)) {
      return;
    }

    updateNestedContent("groupedEventAlbums", (folders) => folders.filter((item) => item.id !== folderId));

    if (selectedFolderId === folderId) {
      setSelectedFolderId("");
      setSelectedAlbumId("");
    }

    setEditorStatus(`Deleted folder ${folder.title}. Save changes to publish.`);
  };

  const deleteAlbum = (albumId: string) => {
    if (!selectedFolder) {
      setEditorStatus("Choose a folder first.");
      return;
    }

    const album = selectedFolder.albums.find((item) => item.id === albumId);

    if (!album || !window.confirm(`Delete the subfolder "${album.title}" and all photos inside it?`)) {
      return;
    }

    updateNestedContent("groupedEventAlbums", (folders) =>
      folders.map((folder) =>
        folder.id === selectedFolder.id
          ? {
              ...folder,
              albums: folder.albums.filter((item) => item.id !== albumId)
            }
          : folder
      )
    );

    if (selectedAlbumId === albumId) {
      setSelectedAlbumId("");
    }

    setEditorStatus(`Deleted subfolder ${album.title}. Save changes to publish.`);
  };

  const deleteImage = (photoIndex: number) => {
    const folderIndex = currentFolders.findIndex((folder) => folder.id === selectedFolderId);
    const albumIndex = selectedFolder?.albums.findIndex((album) => album.id === selectedAlbumId) ?? -1;

    if (folderIndex < 0 || albumIndex < 0 || !selectedAlbum) {
      setEditorStatus("Choose a folder and subfolder first.");
      return;
    }

    const photo = selectedAlbum.photos[photoIndex];

    if (!photo || !window.confirm(`Delete the photo "${photo.caption}"?`)) {
      return;
    }

    updateContent((current) => ({
      ...current,
      groupedEventAlbums: current.groupedEventAlbums.map((folder, currentFolderIndex) => {
        if (currentFolderIndex !== folderIndex) {
          return folder;
        }

        return {
          ...folder,
          albums: folder.albums.map((album, currentAlbumIndex) => {
            if (currentAlbumIndex !== albumIndex) {
              return album;
            }

            const nextPhotos = album.photos.filter((_, index) => index !== photoIndex);

            return {
              ...album,
              photos: nextPhotos,
              cover: nextPhotos[0] ?? album.cover
            };
          })
        };
      })
    }));

    setEditorStatus(`Deleted photo ${photo.caption}. Save changes to publish.`);
  };

  const contentSummary = useMemo(
    () => [
      `${editableContent.tabs.length} tabs`,
      `${editableContent.causeCards.length} causes`,
      `${editableContent.groupedEventAlbums.length} folders`,
      `${editableContent.contactChannels.length} contacts`
    ],
    [editableContent]
  );

  const activeTabDetails = editableContent.tabs.find((tab) => tab.id === activeTab) ?? editableContent.tabs[0] ?? defaultSiteContent.tabs[0];

  const updateActiveTab = <K extends keyof TabConfig>(key: K, value: TabConfig[K]) => {
    updateNestedContent("tabs", (tabs) =>
      tabs.map((tab) => (tab.id === activeTabDetails.id ? { ...tab, [key]: value } : tab))
    );
  };

  const updateCauseCard = (
    index: number,
    key: "title" | "summary" | "minimum" | "purpose" | "goal" | "impact",
    value: string
  ) => {
    updateNestedContent("causeCards", (cards) =>
      cards.map((card, cardIndex) => (cardIndex === index ? { ...card, [key]: value } : card))
    );
  };

  const updateCauseList = (index: number, key: "support" | "donationWays", value: string) => {
    updateNestedContent("causeCards", (cards) =>
      cards.map((card, cardIndex) =>
        cardIndex === index
          ? {
              ...card,
              [key]: value
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean)
            }
          : card
      )
    );
  };

  const addCause = () => {
    if (!newCauseTitle.trim()) {
      setEditorStatus("Enter a cause title first.");
      return;
    }

    const title = newCauseTitle.trim();
    const nextCause: CauseCard = {
      title,
      summary: "Describe this cause.",
      minimum: "From $6",
      purpose: "Describe the purpose of this cause.",
      goal: "Add the fundraising goal.",
      impact: "Add the expected impact.",
      support: ["Add support options for this cause."],
      donationWays: ["Add donation routes for this cause."]
    };

    updateNestedContent("causeCards", (cards) => [...cards, nextCause]);
    setNewCauseTitle("");
    setCauseFormOpen(false);
    setEditorStatus(`Added cause ${title}. Save changes to publish.`);
  };

  const deleteCause = (index: number) => {
    const cause = editableContent.causeCards[index];

    if (!cause || !window.confirm(`Delete the cause "${cause.title}"?`)) {
      return;
    }

    updateNestedContent("causeCards", (cards) => cards.filter((_, cardIndex) => cardIndex !== index));
    setSelectedCauseIndex((current) => (current === index ? null : current !== null && current > index ? current - 1 : current));
    setEditorStatus(`Deleted cause ${cause.title}. Save changes to publish.`);
  };

  const openCauseDetails = (cause: CauseCard, index: number) => {
    setSelectedCause(cause);
    setSelectedCauseIndex(index);
  };

  const closeCauseDetails = () => {
    setSelectedCause(null);
    setSelectedCauseIndex(null);
  };

  const updateSelectedCause = <K extends "title" | "purpose" | "minimum" | "goal" | "impact">(
    key: K,
    value: CauseCard[K]
  ) => {
    if (selectedCauseIndex === null) {
      return;
    }

    updateCauseCard(selectedCauseIndex, key, value);
  };

  const updateSelectedCauseSupportItem = (supportIndex: number, value: string) => {
    if (selectedCauseIndex === null) {
      return;
    }

    updateNestedContent("causeCards", (cards) =>
      cards.map((card, cardIndex) =>
        cardIndex === selectedCauseIndex
          ? {
              ...card,
              support: card.support.map((item, itemIndex) => (itemIndex === supportIndex ? value : item))
            }
          : card
      )
    );
  };

  const addSelectedCauseSupportItem = () => {
    if (selectedCauseIndex === null) {
      return;
    }

    updateNestedContent("causeCards", (cards) =>
      cards.map((card, cardIndex) =>
        cardIndex === selectedCauseIndex
          ? {
              ...card,
              support: [...card.support, "Add support details."]
            }
          : card
      )
    );
  };

  const deleteSelectedCauseSupportItem = (supportIndex: number) => {
    if (selectedCauseIndex === null) {
      return;
    }

    updateNestedContent("causeCards", (cards) =>
      cards.map((card, cardIndex) =>
        cardIndex === selectedCauseIndex
          ? {
              ...card,
              support: card.support.filter((_, itemIndex) => itemIndex !== supportIndex)
            }
          : card
      )
    );
  };

  const updateDonationRoute = (
    index: number,
    key: "title" | "minimum" | "body" | "action" | "customActionLabel",
    value: string
  ) => {
    updateNestedContent("donationRoutes", (routes) =>
      routes.map((route, routeIndex) => {
        if (routeIndex !== index) {
          return route;
        }

        const updatedRoute = { ...route, [key]: value };

        if (key === "action" && value === "custom" && !updatedRoute.customActionLabel?.trim()) {
          updatedRoute.customActionLabel = "Donate Today";
        }

        return updatedRoute;
      })
    );
  };

  const addDonationRoute = () => {
    if (!newDonationRouteTitle.trim()) {
      setEditorStatus("Enter a donation route title first.");
      return;
    }

    const title = newDonationRouteTitle.trim();

    updateNestedContent("donationRoutes", (routes) => [
      ...routes,
      {
        id: createId("donation-route", title),
        title,
        minimum: "Min: $1",
        body: "Describe this donation route.",
        action: newDonationRouteAction,
        customActionLabel:
          newDonationRouteAction === "custom" ? newDonationRouteCustomLabel.trim() || "Donate Today" : undefined
      }
    ]);

    setNewDonationRouteTitle("");
    setNewDonationRouteAction("smallGift");
    setNewDonationRouteCustomLabel("Donate Today");
    setDonationRouteFormOpen(false);
    setEditorStatus(`Added donation route ${title}. Save changes to publish.`);
  };

  const deleteDonationRoute = (index: number) => {
    const route = editableContent.donationRoutes[index];

    if (!route || !window.confirm(`Delete the donation route "${route.title}"?`)) {
      return;
    }

    updateNestedContent("donationRoutes", (routes) => routes.filter((_, routeIndex) => routeIndex !== index));
    setEditorStatus(`Deleted donation route ${route.title}. Save changes to publish.`);
  };

  const updateDonationInfo = (id: DonationInfoId, key: "label" | "title" | "summary", value: string) => {
    updateNestedContent("donationInfo", (items) =>
      items.map((item) => (item.id === id ? { ...item, [key]: value } : item))
    );
  };

  const updateDonationInfoSection = (id: DonationInfoId, sectionIndex: number, value: string) => {
    updateNestedContent("donationInfo", (items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              sections: item.sections.map((section, index) =>
                index === sectionIndex ? { ...section, title: value } : section
              )
            }
          : item
      )
    );
  };

  const updateDonationInfoItem = (id: DonationInfoId, sectionIndex: number, itemIndex: number, value: string) => {
    updateNestedContent("donationInfo", (items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              sections: item.sections.map((section, index) =>
                index === sectionIndex
                  ? {
                      ...section,
                      items: section.items.map((detail, detailIndex) => (detailIndex === itemIndex ? value : detail))
                    }
                  : section
              )
            }
          : item
      )
    );
  };

  const addDonationInfoSection = (id: DonationInfoId) => {
    updateNestedContent("donationInfo", (items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              sections: [...item.sections, { title: "New section", items: ["Add detail."] }]
            }
          : item
      )
    );
  };

  const deleteDonationInfoSection = (id: DonationInfoId, sectionIndex: number) => {
    updateNestedContent("donationInfo", (items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              sections: item.sections.filter((_, index) => index !== sectionIndex)
            }
          : item
      )
    );
  };

  const addDonationInfoItem = (id: DonationInfoId, sectionIndex: number) => {
    updateNestedContent("donationInfo", (items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              sections: item.sections.map((section, index) =>
                index === sectionIndex ? { ...section, items: [...section.items, "Add detail."] } : section
              )
            }
          : item
      )
    );
  };

  const deleteDonationInfoItem = (id: DonationInfoId, sectionIndex: number, itemIndex: number) => {
    updateNestedContent("donationInfo", (items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              sections: item.sections.map((section, index) =>
                index === sectionIndex
                  ? { ...section, items: section.items.filter((_, detailIndex) => detailIndex !== itemIndex) }
                  : section
              )
            }
          : item
      )
    );
  };

  const updateContactChannel = (index: number, key: "label" | "value" | "href", value: string) => {
    updateNestedContent("contactChannels", (channels) =>
      channels.map((channel, channelIndex) => (channelIndex === index ? { ...channel, [key]: value } : channel))
    );
  };

  const updateInquiryTopics = (topics: string[]) => {
    updateNestedContent("inquiryTopics", () => topics);
  };

  const handleActivateTab = (tabId: TabId) => {
    setActiveTab(tabId);
    setMobileNavOpen(false);
    setEditorStatus(`Viewing ${tabId} page.`);
  };

  const closeMediaManager = () => {
    setEditorView(mediaReturnView);
    setEditorStatus(mediaReturnView === "inquiries" ? "Review and export incoming inquiries." : "Open edit mode to change visible copy.");
    setSelectedFolderId("");
    setSelectedAlbumId("");
    setFolderFormOpen(false);
    setAlbumFormOpen(false);
    setImageFormOpen(false);
    setNewFolderTitle("");
    setNewAlbumTitle("");
    setSelectedImageCaption("");
    setPendingImageFile(null);
    setImageInputKey((current) => current + 1);
  };

  const openMediaRoot = () => {
    setEditorView("media");
    setSelectedFolderId("");
    setSelectedAlbumId("");
    setFolderFormOpen(false);
    setAlbumFormOpen(false);
    setImageFormOpen(false);
    setNewFolderTitle("");
    setNewAlbumTitle("");
    setSelectedImageCaption("");
    setPendingImageFile(null);
    setImageInputKey((current) => current + 1);
    setEditorStatus("Viewing media folders.");
  };

  const openFolder = (folderId: string) => {
    const folder = currentFolders.find((item) => item.id === folderId);
    setSelectedFolderId(folderId);
    setSelectedAlbumId("");
    setFolderFormOpen(false);
    setAlbumFormOpen(false);
    setImageFormOpen(false);
    setSelectedImageCaption("");
    setPendingImageFile(null);
    setImageInputKey((current) => current + 1);
    setEditorStatus(`Viewing subfolders in ${folder?.title ?? "the folder"}.`);
  };

  const openAlbum = (albumId: string) => {
    const album = selectedFolder?.albums.find((item) => item.id === albumId);
    setSelectedAlbumId(albumId);
    setAlbumFormOpen(false);
    setImageFormOpen(false);
    setSelectedImageCaption("");
    setPendingImageFile(null);
    setImageInputKey((current) => current + 1);
    setEditorStatus(`Viewing images in ${album?.title ?? "the subfolder"}.`);
  };

  const goBackInMedia = () => {
    if (selectedAlbum) {
      setSelectedAlbumId("");
      setImageFormOpen(false);
      setSelectedImageCaption("");
      setPendingImageFile(null);
      setImageInputKey((current) => current + 1);
      setEditorStatus(`Viewing subfolders in ${selectedFolder?.title ?? "the folder"}.`);
      return;
    }

    if (selectedFolder) {
      setSelectedFolderId("");
      setAlbumFormOpen(false);
      setEditorStatus("Viewing media folders.");
      return;
    }

    closeMediaManager();
  };

  const adminPanelTitle =
    editorView === "media"
      ? "Media manager"
      : editorView === "inquiries"
        ? "Inquiry inbox"
        : isEditing
          ? "Editing mode"
          : "Preview mode";
  const mediaTitle =
    mediaLevel === "folders" ? "Folders" : mediaLevel === "subfolders" ? selectedFolder?.title ?? "Subfolders" : selectedAlbum?.title ?? "Images";
  const mediaDescription =
    mediaLevel === "folders"
      ? "Start by choosing a folder or create a new one."
      : mediaLevel === "subfolders"
        ? "Open a subfolder or add a new one inside this folder."
        : "Add images with captions only to this subfolder.";

  const authCard =
    authState === "loading" ? (
      <div className="admin-auth-card">
        <span className="section-kicker">Admin login</span>
        <h3>Checking admin session...</h3>
        <p>Loading the hidden editor.</p>
      </div>
    ) : authState === "signedIn" ? (
      <div className="admin-auth-card">
        <span className="section-kicker">Admin access</span>
        <h3>Signed in.</h3>
        <p>Only the admin account can edit the site content. The public site remains open.</p>
        <div className="admin-auth-actions">
          <button className="secondary-button" type="button" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </div>
    ) : (
      <div className="admin-auth-card">
        <span className="section-kicker">Admin login</span>
        <h3>Sign in to edit the site.</h3>
        <p>The public site stays open. Only the hidden admin route can change the content.</p>

        <form className="admin-auth-form" onSubmit={handleLogin}>
          <label className="admin-auth-field">
            <span>Email</span>
            <input
              className="connect-edit-input"
              type="email"
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="admin-auth-field">
            <span>Password</span>
            <input
              className="connect-edit-input"
              type="password"
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          <div className="admin-auth-actions">
            <button className="primary-button" type="submit" disabled={isLoggingIn}>
              {isLoggingIn ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        {loginStatus ? (
          <p className="admin-auth-status" aria-live="polite">
            {loginStatus}
          </p>
        ) : null}
      </div>
    );

  if (authState !== "signedIn") {
    return (
      <div className="site-shell admin-site-shell">
        <a className="skip-link" href="#admin-main-content">
          Skip to main content
        </a>
        <header className="site-header">
          <div className="site-header-inner admin-header-inner">
            <a className="brand-lockup" href="/" aria-label="Go to public site">
              <img src="/assets/jaana-logo-blue.png" alt="JAANA logo" />
            </a>

            <div className="house-shields header-shields" aria-label="SJBHS house shields">
              {editableContent.houseShields.map((shield) => (
                <div className="house-shield" key={shield.src}>
                  <img src={shield.src} alt={shield.alt} />
                </div>
              ))}
            </div>

            <div className="header-actions">
              <span className="section-kicker admin-route-badge">Admin</span>
            </div>
          </div>
        </header>

        <main id="admin-main-content" tabIndex={-1} className="main-subpage">
          <section id="admin-panel" className="subpage-shell donate-shell" aria-label="Admin site editor">
            <div className="donation-page-header">
              <div className="donation-page-copy">
                <span className="section-kicker">Admin</span>
                <h2>Manage JAANA site content.</h2>
                <p>Sign in to edit public page copy, review incoming inquiries, and manage gallery media.</p>
              </div>
            </div>

            <div className="contact-panel">
              <article className="contact-card">
                <h3>Private editor</h3>
                <p>Use the admin account to access the content editor. The public site stays live while changes are reviewed here.</p>
              </article>

              <aside className="contact-card admin-auth-sidebar">{authCard}</aside>
            </div>
          </section>
        </main>

        <footer className="site-footer">
          <div className="footer-brand">
            <strong>JAANA</strong>
            <span>The Josephite Alumni Association of North America.</span>
          </div>
          <div className="footer-contacts">
            {editableContent.contactChannels.map((channel) => (
              <a
                key={channel.label}
                href={channel.href}
                target={channel.href.startsWith("http") ? "_blank" : undefined}
                rel={channel.href.startsWith("http") ? "noreferrer" : undefined}
              >
                <span className="contact-label">{channel.label}</span>
                <span className="contact-value">{channel.value}</span>
              </a>
            ))}
          </div>
        </footer>
      </div>
    );
  }

  const isContentView = editorView === "content";
  const isMediaView = editorView === "media";
  const isInquiryView = editorView === "inquiries";

  const isOverviewTab = activeTab === "home";
  const activeSelectedCause =
    selectedCauseIndex !== null ? editableContent.causeCards[selectedCauseIndex] ?? null : selectedCause;

  return (
    <div className={`site-shell admin-site-shell ${activeTab === "connect" ? "is-connect-view" : ""}`}>
      <a className="skip-link" href="#admin-main-content">
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
              aria-controls="admin-site-nav"
              onClick={() => setMobileNavOpen((current) => !current)}
            >
              <span className="mobile-nav-icon" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span className="mobile-nav-label">Menu</span>
            </button>

            <div id="admin-site-nav" className={mobileNavOpen ? "mobile-site-nav is-open" : "mobile-site-nav"} hidden={!mobileNavOpen}>
              <nav className="site-nav mobile-site-nav-list" aria-label="Site pages" role="tablist">
                {editableContent.tabs.map((tab) => (
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

          <button
            className="brand-lockup"
            onClick={() => handleActivateTab("home")}
            type="button"
            aria-label="Go to home"
          >
            <img src="/assets/jaana-logo-blue.png" alt="JAANA logo" />
          </button>

          <div className="house-shields header-shields" aria-label="SJBHS house shields">
            {editableContent.houseShields.map((shield) => (
              <div className="house-shield" key={shield.src}>
                <img src={shield.src} alt={shield.alt} />
              </div>
            ))}
          </div>

          <div className="header-actions">
            <nav className="site-nav" aria-label="Site pages" role="tablist">
              {editableContent.tabs.map((tab) => (
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
          <button className="secondary-button admin-header-signout" type="button" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>

      <section className="admin-controls-section" aria-label="Admin controls">
        <div className="admin-controls-bar">
          <div className="admin-controls-copy">
            <span className="section-kicker">Admin tools</span>
            <h3>{adminPanelTitle}</h3>
          </div>

          <div className="admin-controls-actions">
            <button
              className={isMediaView ? "secondary-button is-active" : "secondary-button"}
              type="button"
              aria-pressed={isMediaView}
              onClick={openMediaView}
            >
              Media
            </button>
            <button
              className={isInquiryView ? "secondary-button is-active" : "secondary-button"}
              type="button"
              aria-pressed={isInquiryView}
              onClick={() => {
                if (isInquiryView) {
                  openContentView();
                  return;
                }

                void openInquiriesView();
              }}
            >
              {isInquiryView ? "Content" : "Inquiries"}
            </button>
            {isContentView ? (
              <>
                <button
                  className={isEditing ? "secondary-button is-active" : "secondary-button"}
                  type="button"
                  aria-pressed={isEditing}
                  onClick={() => setIsEditing((current) => !current)}
                >
                  {isEditing ? "Done editing" : "Edit texts"}
                </button>
                <button className="primary-button" type="button" onClick={handleSave} disabled={isSaving || !hasUnsavedChanges}>
                  {isSaving ? "Saving..." : "Save changes"}
                </button>
                <button className="secondary-button" type="button" onClick={undoChanges} disabled={!hasUnsavedChanges || isSaving}>
                  Undo
                </button>
              </>
            ) : null}
          </div>
        </div>
      </section>

      <main id="admin-main-content" tabIndex={-1} className={!isInquiryView && isOverviewTab ? "main-overview" : "main-subpage"}>
        {isInquiryView ? (
          <section className="section-block admin-inquiry-section" aria-label="Inquiry inbox">
            <div className="featured-heading admin-inquiry-head">
              <div>
                <h3>Inquiry inbox</h3>
                <p>Review the latest donation and sponsor requests coming in from the public site.</p>
              </div>
            </div>

            <div className="admin-inquiry-toolbar">
              <div className="admin-inquiry-applied-filters">
                <article className="admin-inquiry-filter-pill">
                  <span>Status</span>
                  <strong>{appliedInquiryStatusLabel}</strong>
                </article>
                <article className="admin-inquiry-filter-pill">
                  <span>Category</span>
                  <strong>{appliedInquiryCategoryLabel}</strong>
                </article>
                <article className="admin-inquiry-filter-pill">
                  <span>Dates</span>
                  <strong>
                    {inquiryDateFrom || inquiryDateTo
                      ? `${inquiryDateFrom || "Any time"} - ${inquiryDateTo || "Now"}`
                      : "All time"}
                  </strong>
                </article>
              </div>

              <div className="admin-inquiry-actions">
                <button className="secondary-button" type="button" onClick={openInquiryFilters} disabled={inquiriesLoading}>
                  Apply filters
                </button>
                <button className="secondary-button" type="button" onClick={() => void handleClearInquiryFilters()} disabled={inquiriesLoading}>
                  Clear
                </button>
                <button className="secondary-button" type="button" onClick={() => void loadInquiryInbox({ limit: 100 })} disabled={inquiriesLoading}>
                  Refresh inbox
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => void exportInquiries("csv")}
                  disabled={inquiryExportingFormat !== "idle"}
                >
                  {inquiryExportingFormat === "csv" ? "Exporting CSV..." : "Download CSV"}
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => void exportInquiries("excel")}
                  disabled={inquiryExportingFormat !== "idle"}
                >
                  {inquiryExportingFormat === "excel" ? "Exporting Excel..." : "Download Excel"}
                </button>
              </div>
            </div>

            <div className="admin-inquiry-summary">
              <article>
                <span>Total inquiries</span>
                <strong>{inquiryTotal}</strong>
              </article>
              <article>
                <span>Matching time frame</span>
                <strong>{inquiryFilteredTotal}</strong>
              </article>
              <article>
                <span>Loaded now</span>
                <strong>{recentInquiries.length}</strong>
              </article>
            </div>

            {inquiriesStatus ? (
              <p className="admin-auth-status" aria-live="polite">
                {inquiriesStatus}
              </p>
            ) : null}

            <div className="admin-inquiry-list">
              {recentInquiries.length ? (
                recentInquiries.map((inquiry) => (
                  <article key={inquiry.id} className={`admin-inquiry-card ${inquiry.replyStatus === "complete" ? "is-complete" : ""}`}>
                    <div className="admin-inquiry-card-head">
                      <div>
                        <strong>{inquiry.name}</strong>
                        <span>{inquiry.interest}</span>
                      </div>
                      <div className="admin-inquiry-card-head-side">
                        <span className={`admin-inquiry-badge ${inquiry.replyStatus === "complete" ? "is-complete" : "is-pending"}`}>
                          {inquiry.replyStatus === "complete" ? "Complete" : "Pending"}
                        </span>
                        <time dateTime={inquiry.createdAt}>{new Date(inquiry.createdAt).toLocaleString()}</time>
                      </div>
                    </div>
                    <dl className="admin-inquiry-meta">
                      <div>
                        <dt>Email</dt>
                        <dd>
                          <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
                        </dd>
                      </div>
                      <div>
                        <dt>Phone</dt>
                        <dd>{inquiry.phone || "Not provided"}</dd>
                      </div>
                      <div>
                        <dt>Batch / City / Organization</dt>
                        <dd>{inquiry.organization || "Not provided"}</dd>
                      </div>
                    </dl>
                    {inquiry.completedAt ? (
                      <p className="admin-inquiry-completed-at">Completed on {formatInquiryTimestamp(inquiry.completedAt)}</p>
                    ) : null}
                    <p>{inquiry.notes || "No notes provided."}</p>
                    <div className="admin-inquiry-card-actions">
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => void handleCompleteInquiry(inquiry.id)}
                        disabled={activeInquiryActionId === inquiry.id || inquiry.replyStatus === "complete"}
                      >
                        {activeInquiryActionId === inquiry.id && inquiry.replyStatus !== "complete"
                          ? "Saving..."
                          : inquiry.replyStatus === "complete"
                            ? "Completed"
                            : "Mark complete"}
                      </button>
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => void handleDeleteInquiry(inquiry.id)}
                        disabled={activeInquiryActionId === inquiry.id}
                      >
                        {activeInquiryActionId === inquiry.id ? "Working..." : "Delete"}
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <p className="admin-inquiry-empty">No inquiries match the current filter.</p>
              )}
            </div>
          </section>
        ) : null}

        {!isInquiryView && activeTab === "home" ? (
          <HomePage
            connectMoments={editableContent.connectMoments}
            homeCopy={editableContent.homeCopy}
            editable={isEditing}
            onChangeHomeCopy={(key, value) =>
              updateNestedContent("homeCopy", (homeCopy) => ({
                ...homeCopy,
                [key]: value
              }))
            }
            onActivateTab={handleActivateTab}
            onOpenPastEventsDialog={() => setEditorStatus("Past events live in the public view.")}
            onOpenLightboxImage={() => setEditorStatus("Media opens in the public view.")}
          />
        ) : null}

        {!isInquiryView && activeTab === "causes" ? (
          <CausesPage
            details={activeTabDetails}
            causeCards={editableContent.causeCards}
            causesCopy={editableContent.causesCopy}
            editable={isEditing}
            onChangeDetails={updateActiveTab}
            onChangeCausesCopy={(key, value) =>
              updateNestedContent("causesCopy", (causesCopy) => ({
                ...causesCopy,
                [key]: value
              }))
            }
            onChangeCauseCard={updateCauseCard}
            onDeleteCause={deleteCause}
            onSelectCause={openCauseDetails}
            causeFormOpen={causeFormOpen}
            newCauseTitle={newCauseTitle}
            onToggleCauseForm={() => setCauseFormOpen((current) => !current)}
            onChangeNewCauseTitle={setNewCauseTitle}
            onAddCause={addCause}
            onCancelCause={() => setCauseFormOpen(false)}
          />
        ) : null}

        {!isInquiryView && activeTab === "donate" ? (
          <DonatePage
            details={activeTabDetails}
            donateCopy={editableContent.donateCopy}
            donationRoutes={editableContent.donationRoutes}
            donationInfo={editableContent.donationInfo}
            editable={isEditing}
            onDonateClick={() => setDonateDialogOpen(true)}
            onChangeDetails={updateActiveTab}
            onChangeDonateCopy={(key, value) =>
              updateNestedContent("donateCopy", (donateCopy) => ({
                ...donateCopy,
                [key]: value
              }))
            }
            onChangeDonationRoute={updateDonationRoute}
            onDeleteDonationRoute={deleteDonationRoute}
            donationRouteFormOpen={donationRouteFormOpen}
            newDonationRouteTitle={newDonationRouteTitle}
            newDonationRouteAction={newDonationRouteAction}
            newDonationRouteCustomLabel={newDonationRouteCustomLabel}
            onToggleDonationRouteForm={() => setDonationRouteFormOpen((current) => !current)}
            onChangeNewDonationRouteTitle={setNewDonationRouteTitle}
            onChangeNewDonationRouteAction={setNewDonationRouteAction}
            onChangeNewDonationRouteCustomLabel={setNewDonationRouteCustomLabel}
            onAddDonationRoute={addDonationRoute}
            onCancelDonationRoute={() => setDonationRouteFormOpen(false)}
            onChangeDonationInfo={updateDonationInfo}
            onChangeDonationInfoSection={updateDonationInfoSection}
            onChangeDonationInfoItem={updateDonationInfoItem}
            onAddDonationInfoSection={addDonationInfoSection}
            onDeleteDonationInfoSection={deleteDonationInfoSection}
            onAddDonationInfoItem={addDonationInfoItem}
            onDeleteDonationInfoItem={deleteDonationInfoItem}
          />
        ) : null}

        {!isInquiryView && activeTab === "contact" ? (
          <ContactPage
            form={form}
            isSubmitting={isSubmitting}
            statusMessage={statusMessage}
            statusTone={statusTone}
            onSubmit={handleSubmit}
            onFieldChange={handleFormFieldChange}
          />
        ) : null}

        {!isInquiryView && activeTab === "connect" ? (
          <ConnectPage
            details={activeTabDetails}
            connectContent={editableContent.connectPage}
            connectCopy={editableContent.connectCopy}
            editable={isEditing}
            onChangeDetails={updateActiveTab}
            onChangeConnectCopy={(key, value) =>
              updateNestedContent("connectCopy", (connectCopy) => ({
                ...connectCopy,
                [key]: value
              }))
            }
            onChangeConnectContent={(key, value) =>
              updateNestedContent("connectPage", (connectPage) => ({
                ...connectPage,
                [key]: value
              }))
            }
          />
        ) : null}

        {filterDialogOpen ? (
          <div className="admin-filter-dialog-overlay" onClick={closeInquiryFilters}>
            <div
              className="admin-filter-dialog-shell"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  closeInquiryFilters();
                }
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="inquiry-filter-dialog-title"
              aria-describedby="inquiry-filter-dialog-description"
              tabIndex={-1}
              autoFocus
            >
              <div className="admin-filter-dialog-head">
                <div className="admin-filter-dialog-copy">
                  <span className="section-kicker">Inquiry filters</span>
                  <h3 id="inquiry-filter-dialog-title">Refine the inbox</h3>
                  <p id="inquiry-filter-dialog-description">Choose the status, category, and date range you want to review, then apply the filter set in one pass.</p>
                </div>
                <button className="secondary-button" type="button" onClick={closeInquiryFilters}>
                  Cancel
                </button>
              </div>

              <div className="admin-filter-dialog-grid">
                <section className="admin-filter-dialog-panel admin-filter-dialog-panel--filters">
                  <div className="admin-filter-dialog-section admin-filter-dialog-section--status">
                    <div className="admin-filter-dialog-section-head">
                      <span>Status</span>
                      <strong>{formatFilterSummary(draftInquiryStatuses.map((value) => inquiryStatusOptions.find((option) => option.value === value)?.label ?? value), "All")}</strong>
                    </div>
                    <div className="admin-filter-chip-group">
                      {inquiryStatusOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={draftInquiryStatuses.includes(option.value) ? "admin-filter-chip is-active" : "admin-filter-chip"}
                          aria-pressed={draftInquiryStatuses.includes(option.value)}
                          onClick={() => handleToggleInquiryStatus(option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="admin-filter-dialog-section">
                    <div className="admin-filter-dialog-section-head">
                      <span>Category</span>
                      <strong>{formatFilterSummary(draftInquiryCategories.map((value) => (value === "all" ? "All" : value)), "All")}</strong>
                    </div>
                    <div className="admin-filter-chip-group">
                      {inquiryCategoryOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          className={draftInquiryCategories.includes(option) ? "admin-filter-chip is-active" : "admin-filter-chip"}
                          aria-pressed={draftInquiryCategories.includes(option)}
                          onClick={() => handleToggleInquiryCategory(option)}
                        >
                          {option === "all" ? "All" : option}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                <aside className="admin-filter-dialog-panel admin-filter-dialog-panel--summary">
                  <div className="admin-filter-dialog-section">
                    <div className="admin-filter-dialog-section-head">
                      <span>Date range</span>
                      <strong>{draftInquiryDateFrom || draftInquiryDateTo ? "Custom" : "All time"}</strong>
                    </div>
                    <div className="admin-filter-date-grid">
                      <label className="admin-auth-field">
                        <span>From</span>
                        <input
                          className="connect-edit-input"
                          type="date"
                          value={draftInquiryDateFrom}
                          onChange={(event) => setDraftInquiryDateFrom(event.target.value)}
                        />
                      </label>
                      <label className="admin-auth-field">
                        <span>To</span>
                        <input
                          className="connect-edit-input"
                          type="date"
                          value={draftInquiryDateTo}
                          onChange={(event) => setDraftInquiryDateTo(event.target.value)}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="admin-filter-preview-card">
                    <span className="section-kicker">Preview</span>
                    <dl className="admin-filter-preview-list">
                      <div>
                        <dt>Status</dt>
                        <dd>{formatFilterSummary(draftInquiryStatuses.map((value) => inquiryStatusOptions.find((option) => option.value === value)?.label ?? value), "All")}</dd>
                      </div>
                      <div>
                        <dt>Category</dt>
                        <dd>{formatFilterSummary(draftInquiryCategories.map((value) => (value === "all" ? "All" : value)), "All")}</dd>
                      </div>
                      <div>
                        <dt>Dates</dt>
                        <dd>{draftInquiryDateFrom || draftInquiryDateTo ? `${draftInquiryDateFrom || "Any time"} - ${draftInquiryDateTo || "Now"}` : "All time"}</dd>
                      </div>
                    </dl>
                  </div>
                </aside>
              </div>

              <div className="admin-filter-dialog-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    setDraftInquiryDateFrom("");
                    setDraftInquiryDateTo("");
                    setDraftInquiryStatuses(["all"]);
                    setDraftInquiryCategories(["all"]);
                  }}
                >
                  Reset draft
                </button>
                <button className="primary-button" type="button" onClick={() => void handleApplyInquiryFilters()} disabled={inquiriesLoading}>
                  {inquiriesLoading ? "Applying..." : "Apply filters"}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {editorView === "media" ? (
          <div className="admin-media-overlay" onClick={closeMediaManager}>
            <div
              className="admin-media-drawer"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  closeMediaManager();
                }
              }}
              role="dialog"
              aria-modal="true"
              aria-label="Media folders editor"
              tabIndex={-1}
              autoFocus
            >
              <div className="admin-media-drawer-head">
                <div className="admin-media-drawer-copy">
                  <span className="section-kicker">Media folders</span>
                  <h3>{mediaTitle}</h3>
                  <p>{mediaDescription}</p>
                </div>
                <div className="admin-media-drawer-actions">
                  {mediaLevel !== "folders" ? (
                    <button className="secondary-button" type="button" onClick={goBackInMedia}>
                      Back
                    </button>
                  ) : null}
                  <button className="secondary-button" type="button" onClick={closeMediaManager}>
                    Close
                  </button>
                </div>
              </div>

              <nav className="admin-media-breadcrumbs" aria-label="Media navigation">
                <button
                  type="button"
                  className={mediaLevel === "folders" ? "admin-media-breadcrumb is-current" : "admin-media-breadcrumb"}
                  onClick={openMediaRoot}
                >
                  Folders
                </button>
                {selectedFolder ? (
                  <>
                    <span className="admin-media-breadcrumb-separator" aria-hidden="true">
                      /
                    </span>
                    <button
                      type="button"
                      className={mediaLevel === "subfolders" ? "admin-media-breadcrumb is-current" : "admin-media-breadcrumb"}
                      onClick={() => {
                        setSelectedAlbumId("");
                        setAlbumFormOpen(false);
                        setImageFormOpen(false);
                        setSelectedImageCaption("");
                        setPendingImageFile(null);
                        setImageInputKey((current) => current + 1);
                        setEditorStatus(`Viewing subfolders in ${selectedFolder.title}.`);
                      }}
                    >
                      {selectedFolder.title}
                    </button>
                  </>
                ) : null}
                {selectedAlbum ? (
                  <>
                    <span className="admin-media-breadcrumb-separator" aria-hidden="true">
                      /
                    </span>
                    <span className="admin-media-breadcrumb is-current">{selectedAlbum.title}</span>
                  </>
                ) : null}
              </nav>

              <div className="admin-media-stage">
                {mediaLevel === "folders" ? (
                  <>
                    <div className="folder-grid admin-media-stage-grid" aria-label="Media folders">
                      {currentFolders.map((folder) => (
                        <article key={folder.id} className="folder-card admin-folder-card">
                          <button type="button" className="folder-card-main" onClick={() => openFolder(folder.id)}>
                            <div className="folder-card-thumb">
                              <img src={folder.albums[0]?.cover.src ?? "/assets/jaana-wordmark.png"} alt={folder.title} />
                            </div>
                            <div className="folder-card-copy">
                              <span>{folder.albums.length} subfolders</span>
                              <h3>{folder.title}</h3>
                              <p>Open folder</p>
                            </div>
                          </button>
                          <button className="admin-danger-button admin-media-delete-button" type="button" onClick={() => deleteFolder(folder.id)}>
                            Delete
                          </button>
                        </article>
                      ))}

                      <button
                        type="button"
                        className="folder-card folder-card-add"
                        onClick={() => {
                          setFolderFormOpen((current) => !current);
                          setAlbumFormOpen(false);
                          setImageFormOpen(false);
                        }}
                      >
                        <div className="folder-card-thumb folder-card-add-thumb">
                          <span aria-hidden="true">+</span>
                        </div>
                        <div className="folder-card-copy">
                          <span>Add folder</span>
                          <h3>New folder</h3>
                          <p>Create a top-level folder.</p>
                        </div>
                      </button>
                    </div>

                    {folderFormOpen ? (
                      <div className="admin-inline-form-card admin-media-form">
                        <label>
                          <span>Folder name</span>
                          <input className="connect-edit-input" value={newFolderTitle} onChange={(event) => setNewFolderTitle(event.target.value)} />
                        </label>
                        <div className="admin-media-form-actions">
                          <button className="primary-button" type="button" onClick={addFolder}>
                            Create folder
                          </button>
                          <button className="secondary-button" type="button" onClick={() => setFolderFormOpen(false)}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : null}

                {mediaLevel === "subfolders" && selectedFolder ? (
                  <>
                    <div className="folder-grid admin-media-stage-grid" aria-label={`${selectedFolder.title} subfolders`}>
                      {selectedFolder.albums.map((album) => (
                        <article key={album.id ?? album.title} className="folder-card admin-folder-card">
                          <button type="button" className="folder-card-main" onClick={() => openAlbum(album.id ?? "")}>
                            <div className="folder-card-thumb">
                              <img src={album.cover.src} alt={album.cover.alt} />
                            </div>
                            <div className="folder-card-copy">
                              <span>{album.photos.length} images</span>
                              <h3>{album.title}</h3>
                              <p>Open subfolder</p>
                            </div>
                          </button>
                          <button className="admin-danger-button admin-media-delete-button" type="button" onClick={() => deleteAlbum(album.id ?? "")}>
                            Delete
                          </button>
                        </article>
                      ))}

                      <button
                        type="button"
                        className="folder-card folder-card-add"
                        onClick={() => {
                          setAlbumFormOpen((current) => !current);
                          setImageFormOpen(false);
                        }}
                      >
                        <div className="folder-card-thumb folder-card-add-thumb">
                          <span aria-hidden="true">+</span>
                        </div>
                        <div className="folder-card-copy">
                          <span>Add subfolder</span>
                          <h3>New subfolder</h3>
                          <p>Create a subfolder in this folder.</p>
                        </div>
                      </button>
                    </div>

                    {albumFormOpen ? (
                      <div className="admin-inline-form-card admin-media-form">
                        <label>
                          <span>Subfolder name</span>
                          <input className="connect-edit-input" value={newAlbumTitle} onChange={(event) => setNewAlbumTitle(event.target.value)} />
                        </label>
                        <div className="admin-media-form-actions">
                          <button className="primary-button" type="button" onClick={addAlbum}>
                            Create subfolder
                          </button>
                          <button className="secondary-button" type="button" onClick={() => setAlbumFormOpen(false)}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {!selectedFolder.albums.length && !albumFormOpen ? (
                      <div className="admin-media-empty">
                        <p>No subfolders yet. Add the first subfolder for {selectedFolder.title}.</p>
                      </div>
                    ) : null}
                  </>
                ) : null}

                {mediaLevel === "images" && selectedFolder && selectedAlbum ? (
                  <>
                    <div className="folder-photo-grid admin-media-image-grid" aria-label={`${selectedAlbum.title} images`}>
                      {selectedAlbum.photos.map((photo, index) => (
                        <article key={`${photo.src}-${index}`} className="folder-photo admin-media-image-card">
                          <img src={photo.src} alt={photo.alt} />
                          <span>{photo.caption}</span>
                          <button className="admin-danger-button admin-media-delete-button" type="button" onClick={() => deleteImage(index)}>
                            Delete
                          </button>
                        </article>
                      ))}

                      <button
                        type="button"
                        className="folder-photo folder-photo-add"
                        onClick={() => setImageFormOpen((current) => !current)}
                      >
                        <div className="folder-photo-add-icon">+</div>
                        <span>Add image</span>
                      </button>
                    </div>

                    {imageFormOpen ? (
                      <div className="admin-inline-form-card admin-media-form">
                        <label>
                          <span>Caption</span>
                          <input
                            className="connect-edit-input"
                            value={selectedImageCaption}
                            onChange={(event) => setSelectedImageCaption(event.target.value)}
                          />
                        </label>
                        <label className="full-width">
                          <span>Image file</span>
                          <input
                            key={imageInputKey}
                            className="connect-edit-input admin-file-input"
                            type="file"
                            accept="image/*"
                            onChange={(event) => setPendingImageFile(event.target.files?.[0] ?? null)}
                          />
                        </label>
                        <p className="admin-auth-status">
                          Uploads go only to <strong>{selectedFolder.title}</strong> / <strong>{selectedAlbum.title}</strong>.
                        </p>
                        <div className="admin-media-form-actions">
                          <button className="primary-button" type="button" onClick={() => void addImage()}>
                            Upload image
                          </button>
                          <button
                            className="secondary-button"
                            type="button"
                            onClick={() => {
                              setImageFormOpen(false);
                              setSelectedImageCaption("");
                              setPendingImageFile(null);
                              setImageInputKey((current) => current + 1);
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {!selectedAlbum.photos.length && !imageFormOpen ? (
                      <div className="admin-media-empty">
                        <p>No images yet. Add the first image to {selectedAlbum.title}.</p>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <strong>JAANA</strong>
          <span>The Josephite Alumni Association of North America.</span>
        </div>
        <div className="footer-contacts">
          {editableContent.contactChannels.map((channel) => (
            <a
              key={channel.label}
              href={channel.href}
              target={channel.href.startsWith("http") ? "_blank" : undefined}
              rel={channel.href.startsWith("http") ? "noreferrer" : undefined}
            >
              <span className="contact-label">{channel.label}</span>
              <span className="contact-value">{channel.value}</span>
            </a>
          ))}
        </div>
      </footer>

      {activeSelectedCause ? (
        <CauseDialog
          cause={activeSelectedCause}
          onClose={closeCauseDetails}
          onDonateClick={() => setDonateDialogOpen(true)}
          disableEscape={donateDialogOpen}
          editable={isEditing}
          onChangeCause={updateSelectedCause}
          onChangeSupportItem={updateSelectedCauseSupportItem}
          onAddSupportItem={addSelectedCauseSupportItem}
          onDeleteSupportItem={deleteSelectedCauseSupportItem}
        />
      ) : null}

      <ZeffyDonateDialog open={donateDialogOpen} onClose={() => setDonateDialogOpen(false)} />
    </div>
  );
}
