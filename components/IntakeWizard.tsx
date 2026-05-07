"use client";

import { useMemo, useState } from "react";

type IntakeFormValues = {
  email: string;
  currentRole: string;
  industry: string;
  normalDay: string;
  problemsSolved: string;
  toolsUsed: string;
  communicatesWith: string;
  proofMoment: string;
  targetRoles: string;
  avoidWork: string;
};

type IntakeField = {
  name: keyof IntakeFormValues;
  label: string;
  example?: string;
  kind?: "input" | "textarea" | "email";
  required?: boolean;
};

type IntakeStep = {
  title: string;
  note: string;
  fields: IntakeField[];
};

const initialValues: IntakeFormValues = {
  email: "demo@visiblemerit.local",
  currentRole: "Ramp agent",
  industry: "airport operations",
  normalDay: "Loaded bags, supported turnarounds, helped recover delays, and coordinated with gate agents.",
  problemsSolved: "Delay recovery, baggage issues, handoffs, and keeping aircraft turns moving.",
  toolsUsed: "Radio, baggage systems, handheld scanners, airline operations tools",
  communicatesWith: "Ramp agents, gate agents, supervisors, operations control",
  proofMoment: "Trained new agents and helped organize work during repeated delay recovery periods.",
  targetRoles: "Operations Coordinator, Product Operations Associate",
  avoidWork: "I do not want another role that is only physical labor."
};

const roleDirectionChoices = [
  {
    label: "Coordinating moving parts",
    value: "Operations Coordinator",
    detail: "Schedules, handoffs, service recovery, process follow-through."
  },
  {
    label: "Helping teams use tools",
    value: "Implementation Specialist",
    detail: "Training, rollout support, troubleshooting, frontline systems."
  },
  {
    label: "Improving how work gets done",
    value: "Process Improvement Associate",
    detail: "Bottlenecks, standards, documentation, repeatable fixes."
  },
  {
    label: "Solving customer or service issues",
    value: "Customer Operations Associate",
    detail: "Escalations, recovery, communication, customer-impact work."
  },
  {
    label: "Leading frontline teams",
    value: "Team Lead or Supervisor",
    detail: "Training, coaching, shift coordination, daily execution."
  },
  {
    label: "I am not sure yet",
    value: "Not sure",
    detail: "Recommend role lanes based on my answers."
  }
];

const steps: IntakeStep[] = [
  {
    title: "Your work",
    note: "Start with the role and the daily work. Plain language is better than polish.",
    fields: [
      { name: "email", label: "Email", example: "Used to save your pack and return later.", kind: "email", required: true },
      { name: "currentRole", label: "Current or most recent role", example: "Ramp agent, gate agent, warehouse associate.", required: true },
      { name: "industry", label: "Industry", example: "Where did the work happen?", required: true },
      { name: "normalDay", label: "What does a normal day look like?", example: "What do you actually do?", kind: "textarea", required: true }
    ]
  },
  {
    title: "What you handle",
    note: "This is where handoffs, tools, service recovery, pressure, and coordination become visible.",
    fields: [
      { name: "problemsSolved", label: "What problems do you solve most often?", kind: "textarea", required: true },
      { name: "toolsUsed", label: "What tools or systems do you use?", kind: "textarea" },
      { name: "communicatesWith", label: "Who do you communicate with?", kind: "textarea", required: true }
    ]
  },
  {
    title: "Proof moments",
    note: "Training, escalation, process improvement, metric, or one moment you are proud of.",
    fields: [{ name: "proofMoment", label: "Proof moment", kind: "textarea", required: true }]
  },
  {
    title: "Where you want to go",
    note: "You do not need to know job titles. Choose the kind of work you want more of, or add a role only if you already have one in mind.",
    fields: [{ name: "avoidWork", label: "What kind of work do you want to avoid?", kind: "textarea" }]
  },
  {
    title: "Review answers",
    note: "Check the evidence before generating. Visible Merit only translates what these answers can support.",
    fields: []
  }
];

const reviewOrder: Array<keyof IntakeFormValues> = [
  "email",
  "currentRole",
  "industry",
  "normalDay",
  "problemsSolved",
  "toolsUsed",
  "communicatesWith",
  "proofMoment",
  "targetRoles",
  "avoidWork"
];

const labels: Record<keyof IntakeFormValues, string> = {
  email: "Email",
  currentRole: "Current role",
  industry: "Industry",
  normalDay: "Normal day",
  problemsSolved: "Problems solved",
  toolsUsed: "Tools and systems",
  communicatesWith: "Communicates with",
  proofMoment: "Proof moment",
  targetRoles: "Target roles",
  avoidWork: "Work to avoid"
};

function stepForField(name: keyof IntakeFormValues): number {
  if (["email", "currentRole", "industry", "normalDay"].includes(name)) return 0;
  if (["problemsSolved", "toolsUsed", "communicatesWith"].includes(name)) return 1;
  if (name === "proofMoment") return 2;
  return 3;
}

type Props = {
  action: (formData: FormData) => void | Promise<void>;
};

export function IntakeWizard({ action }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<IntakeFormValues>(initialValues);
  const [selectedDirections, setSelectedDirections] = useState<string[]>([]);
  const [customRole, setCustomRole] = useState("");
  const currentStep = steps[stepIndex];
  const isReview = currentStep.fields.length === 0;
  const isDirectionStep = stepIndex === 3;

  const missingRequired = useMemo(
    () => currentStep.fields.some((field) => field.required && !values[field.name].trim()),
    [currentStep.fields, values]
  );

  const targetRoles = useMemo(() => {
    const custom = customRole.trim();
    return [...selectedDirections, ...(custom ? [custom] : [])].join(", ");
  }, [customRole, selectedDirections]);

  function updateValue(name: keyof IntakeFormValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function toggleDirection(value: string) {
    setSelectedDirections((current) => {
      if (value === "Not sure") return current.includes(value) ? [] : [value];
      const withoutNotSure = current.filter((item) => item !== "Not sure");
      return withoutNotSure.includes(value) ? withoutNotSure.filter((item) => item !== value) : [...withoutNotSure, value];
    });
  }

  return (
    <form action={action} className="form-panel intake-wizard">
      {reviewOrder.map((name) => (
        <input key={name} type="hidden" name={name} value={name === "targetRoles" ? targetRoles : values[name]} />
      ))}

      <div className="form-section-title">
        <span>Step {stepIndex + 1} of {steps.length}</span>
        <strong>{currentStep.title}</strong>
      </div>

      <div className="step-meter" aria-label={`Step ${stepIndex + 1} of ${steps.length}`}>
        {steps.map((step, index) => (
          <button
            aria-current={index === stepIndex ? "step" : undefined}
            className={index === stepIndex ? "active" : ""}
            key={step.title}
            onClick={() => setStepIndex(index)}
            type="button"
          >
            <span>{index + 1}</span>
            {step.title}
          </button>
        ))}
      </div>

      <p className="step-note">{currentStep.note}</p>

      {isReview ? (
        <div className="review-list">
          {reviewOrder.map((name) => (
            <section className="review-row" key={name}>
              <div>
                <span>{labels[name]}</span>
                <p>{name === "targetRoles" ? targetRoles || "Not sure yet" : values[name] || "Not answered"}</p>
              </div>
              <button className="ghost" onClick={() => setStepIndex(stepForField(name))} type="button">
                Edit
              </button>
            </section>
          ))}
        </div>
      ) : (
        <div className="field-stack">
          {isDirectionStep && (
            <section className="direction-selector" aria-labelledby="role-direction-title">
              <h2 id="role-direction-title">What kind of work do you want more of?</h2>
              <div className="direction-grid">
                {roleDirectionChoices.map((choice) => (
                  <button
                    aria-pressed={selectedDirections.includes(choice.value)}
                    className={selectedDirections.includes(choice.value) ? "selected" : ""}
                    key={choice.value}
                    onClick={() => toggleDirection(choice.value)}
                    type="button"
                  >
                    <em>{selectedDirections.includes(choice.value) ? "Selected" : "Choose"}</em>
                    <strong>{choice.label}</strong>
                    <span>{choice.detail}</span>
                  </button>
                ))}
              </div>
              <label>
                I already have a role name in mind
                <span>Optional. Example: Operations Analyst, Dispatcher, Customer Success Associate.</span>
                <input
                  name="customRole-draft"
                  onChange={(event) => setCustomRole(event.target.value)}
                  type="text"
                  value={customRole}
                />
              </label>
            </section>
          )}
          {currentStep.fields.map((field) => (
            <label key={field.name}>
              {field.label}
              {field.example && <span>{field.example}</span>}
              {field.kind === "textarea" ? (
                <textarea
                  name={`${field.name}-draft`}
                  onChange={(event) => updateValue(field.name, event.target.value)}
                  required={field.required}
                  value={values[field.name]}
                />
              ) : (
                <input
                  name={`${field.name}-draft`}
                  onChange={(event) => updateValue(field.name, event.target.value)}
                  required={field.required}
                  type={field.kind === "email" ? "email" : "text"}
                  value={values[field.name]}
                />
              )}
            </label>
          ))}
        </div>
      )}

      <div className="wizard-actions">
        <button className="ghost" disabled={stepIndex === 0} onClick={() => setStepIndex((current) => Math.max(0, current - 1))} type="button">
          Back
        </button>
        {isReview ? (
          <button type="submit">Generate free preview</button>
        ) : (
          <button disabled={missingRequired} onClick={() => setStepIndex((current) => Math.min(steps.length - 1, current + 1))} type="button">
            Continue
          </button>
        )}
      </div>
    </form>
  );
}
