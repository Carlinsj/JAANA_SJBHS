import { useEffect } from "react";
import { CauseCard } from "../types";
import { InlineEditableText } from "./InlineEditableText";
import { PlaceholderDonateButton } from "./PlaceholderDonateButton";

type CauseDialogProps = {
  cause: CauseCard;
  onClose: () => void;
  onDonateClick: () => void;
  disableEscape?: boolean;
  editable?: boolean;
  onChangeCause?: <K extends "title" | "purpose" | "minimum" | "goal" | "impact">(key: K, value: CauseCard[K]) => void;
  onChangeSupportItem?: (index: number, value: string) => void;
  onAddSupportItem?: () => void;
  onDeleteSupportItem?: (index: number) => void;
};

export function CauseDialog({
  cause,
  onClose,
  onDonateClick,
  disableEscape = false,
  editable = false,
  onChangeCause,
  onChangeSupportItem,
  onAddSupportItem,
  onDeleteSupportItem
}: CauseDialogProps) {
  const goal = cause.goal.replace(/^Goal:\s*/, "");
  const impact = cause.impact.replace(/^Impact:\s*/, "");
  const targetClassName = goal.includes("$")
    ? "cause-dialog-target-value is-currency"
    : "cause-dialog-target-value";

  useEffect(() => {
    if (disableEscape) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [disableEscape, onClose]);

  return (
    <div
      className="cause-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cause-dialog-title"
      aria-describedby="cause-dialog-description"
      onClick={onClose}
    >
      <div className="cause-dialog-shell" onClick={(event) => event.stopPropagation()} tabIndex={-1} autoFocus>
        <button className="cause-dialog-close" type="button" onClick={onClose} aria-label="Close dialog">
          ×
        </button>

        <header className="cause-dialog-header">
          <h3 id="cause-dialog-title">
            <InlineEditableText
              editable={editable}
              value={cause.title}
              onChange={(value) => onChangeCause?.("title", value)}
              className="section-title-edit"
            />
          </h3>
          <div id="cause-dialog-description" className="body-copy">
            <InlineEditableText
              editable={editable}
              value={cause.purpose}
              onChange={(value) => onChangeCause?.("purpose", value)}
              multiline
              richText
              className="body-copy-edit"
            />
          </div>
        </header>

        <div className="cause-dialog-grid">
          <aside className="cause-dialog-panel cause-dialog-summary-panel" aria-label="Funding details">
            <dl className="cause-dialog-summary-metrics">
              <div>
                <dt>Target</dt>
                <dd className={targetClassName}>
                  <InlineEditableText
                    editable={editable}
                    value={editable ? cause.goal : goal}
                    onChange={(value) => onChangeCause?.("goal", value)}
                    multiline={editable}
                    className="body-copy-edit"
                  />
                </dd>
              </div>
            </dl>
          </aside>

          <article className="cause-dialog-panel cause-dialog-content-panel">
            <div className="cause-dialog-section">
              <h4>Impact</h4>
              <div className="body-copy">
                <InlineEditableText
                  editable={editable}
                  value={editable ? cause.impact : impact}
                  onChange={(value) => onChangeCause?.("impact", value)}
                  multiline
                  richText
                  className="body-copy-edit"
                />
              </div>
            </div>

            <div className="cause-dialog-section">
              <h4>Unit cost and support options</h4>
              <ul className="detail-list">
                {cause.support.map((item, index) => (
                  <li key={`support-${index}`} className={editable ? "detail-list-edit-item" : undefined}>
                    <InlineEditableText
                      editable={editable}
                      value={item}
                      onChange={(value) => onChangeSupportItem?.(index, value)}
                      multiline
                      richText
                      className="body-copy-edit"
                    />
                    {editable ? (
                      <button className="admin-danger-button" type="button" onClick={() => onDeleteSupportItem?.(index)}>
                        Remove
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
              {editable ? (
                <button className="secondary-button cause-dialog-add-line" type="button" onClick={onAddSupportItem}>
                  Add support line
                </button>
              ) : null}
            </div>
          </article>
        </div>

        <footer className="cause-dialog-actions">
          <PlaceholderDonateButton buttonClassName="primary-button" onClick={onDonateClick} />
        </footer>
      </div>
    </div>
  );
}
