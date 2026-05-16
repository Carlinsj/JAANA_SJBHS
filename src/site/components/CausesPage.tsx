import { CauseCard, CausesPageCopy, TabConfig } from "../types";
import { InlineEditableText } from "./InlineEditableText";

type CausesPageProps = {
  details: TabConfig;
  causeCards: CauseCard[];
  causesCopy: CausesPageCopy;
  onSelectCause: (cause: CauseCard, index: number) => void;
  editable?: boolean;
  onChangeDetails?: <K extends keyof TabConfig>(key: K, value: TabConfig[K]) => void;
  onChangeCausesCopy?: <K extends keyof CausesPageCopy>(key: K, value: CausesPageCopy[K]) => void;
  onChangeCauseCard?: (index: number, key: "title" | "summary" | "goal", value: string) => void;
  onDeleteCause?: (index: number) => void;
  causeFormOpen?: boolean;
  newCauseTitle?: string;
  onToggleCauseForm?: () => void;
  onChangeNewCauseTitle?: (value: string) => void;
  onAddCause?: () => void;
  onCancelCause?: () => void;
};

export function CausesPage({
  details,
  causeCards,
  causesCopy,
  onSelectCause,
  editable = false,
  onChangeDetails,
  onChangeCausesCopy,
  onChangeCauseCard,
  onDeleteCause,
  causeFormOpen = false,
  newCauseTitle = "",
  onToggleCauseForm,
  onChangeNewCauseTitle,
  onAddCause,
  onCancelCause
}: CausesPageProps) {
  return (
    <section id="causes-panel" className="subpage-shell donate-shell" role="tabpanel" aria-label="Causes">
      <div className="donation-page-header">
        <div className="donation-page-copy">
          <h2>
            <InlineEditableText
              editable={editable}
              value={details.title}
              onChange={(value) => onChangeDetails?.("title", value)}
              className="section-title-edit"
            />
          </h2>
          {details.copy || editable ? (
            <div className="body-copy causes-page-intro">
              <InlineEditableText
                editable={editable}
                value={details.copy}
                onChange={(value) => onChangeDetails?.("copy", value)}
                multiline
                richText
                className="body-copy-edit"
                placeholder="Add page introduction."
              />
            </div>
          ) : null}
        </div>
      </div>

      <section className="give-section">
        <div className="cause-list" aria-label="Cause list">
          {causeCards.map((cause, index) => (
            editable ? (
              <article className="cause-list-item is-editing" key={`cause-${index}`}>
                <div className="cause-list-copy">
                  <h3>
                    <InlineEditableText
                      editable={editable}
                      value={cause.title}
                      onChange={(value) => onChangeCauseCard?.(index, "title", value)}
                      className="section-title-edit"
                    />
                  </h3>
                  <div className="body-copy">
                    <InlineEditableText
                      editable={editable}
                      value={cause.summary}
                      onChange={(value) => onChangeCauseCard?.(index, "summary", value)}
                      multiline
                      richText
                      className="body-copy-edit"
                    />
                  </div>
                </div>

                <div className="cause-list-meta">
                  <span>Goal</span>
                  <strong>
                    <InlineEditableText
                      editable={editable}
                      value={cause.goal}
                      onChange={(value) => onChangeCauseCard?.(index, "goal", value)}
                      className="cause-minimum-edit"
                    />
                  </strong>
                  <div className="cause-admin-actions">
                    <button className="secondary-button" type="button" onClick={() => onSelectCause(cause, index)}>
                      Edit details
                    </button>
                    <button className="admin-danger-button" type="button" onClick={() => onDeleteCause?.(index)}>
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ) : (
              <button className="cause-list-item" key={`cause-${index}`} type="button" onClick={() => onSelectCause(cause, index)}>
                <div className="cause-list-copy">
                  <h3>{cause.title}</h3>
                  <div className="body-copy">
                    <InlineEditableText editable={false} value={cause.summary} onChange={() => undefined} richText />
                  </div>
                </div>

                <div className="cause-list-meta">
                  <span>Goal</span>
                  <strong>{cause.goal.replace(/^Goal:\s*/, "")}</strong>
                </div>
              </button>
            )
          ))}
          {onToggleCauseForm ? (
            causeFormOpen ? (
              <article className="cause-list-item cause-create-card">
                <div className="cause-list-copy cause-create-copy">
                  <span className="section-kicker">New cause</span>
                  <h3>Add cause</h3>
                  <p>Create a new cause row, then edit its card text and details after it is added.</p>
                  <label className="cause-create-field">
                    <span>Cause title</span>
                    <input
                      className="connect-edit-input"
                      value={newCauseTitle}
                      onChange={(event) => onChangeNewCauseTitle?.(event.target.value)}
                      autoFocus
                    />
                  </label>
                </div>
                <div className="cause-list-meta cause-create-actions">
                  <button className="primary-button" type="button" onClick={onAddCause}>
                    Create cause
                  </button>
                  <button className="secondary-button" type="button" onClick={onCancelCause}>
                    Cancel
                  </button>
                </div>
              </article>
            ) : (
              <button className="cause-list-item cause-list-add-item" type="button" onClick={onToggleCauseForm}>
                <span className="cause-add-icon" aria-hidden="true">
                  +
                </span>
                <span className="cause-list-copy cause-add-copy">
                  <strong>Add cause</strong>
                  <small>Create another public cause row in this section.</small>
                </span>
              </button>
            )
          ) : null}
        </div>
      </section>
    </section>
  );
}
