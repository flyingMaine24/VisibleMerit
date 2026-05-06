import type { EvidenceWarning, QualityRubric } from "@/lib/types";

type Props = {
  rubric: QualityRubric;
  warnings?: EvidenceWarning[];
};

export function VisibleMeritCheck({ rubric, warnings = [] }: Props) {
  return (
    <aside className="check-panel" aria-labelledby="visible-merit-check-title">
      <h3 id="visible-merit-check-title">Visible Merit Check</h3>
      <div className="check-row">
        <span>Plain language</span>
        <strong className={rubric.plainLanguage === "Needs detail" ? "status-warn" : "status-good"}>
          {rubric.plainLanguage}
        </strong>
      </div>
      <div className="check-row">
        <span>Credible</span>
        <strong className={rubric.credible === "Needs detail" ? "status-warn" : "status-good"}>{rubric.credible}</strong>
      </div>
      <div className="check-row">
        <span>Specific</span>
        <strong className={rubric.specific === "Needs detail" ? "status-warn" : "status-good"}>{rubric.specific}</strong>
      </div>
      <div className="check-row">
        <span>Evidence supported</span>
        <strong className={rubric.evidenceSupported === "Needs detail" ? "status-warn" : "status-good"}>
          {rubric.evidenceSupported}
        </strong>
      </div>
      {warnings.length > 0 && (
        <div className="notice" role="note">
          <strong>Evidence warning</strong>
          <p>{warnings[0].message}</p>
        </div>
      )}
    </aside>
  );
}
