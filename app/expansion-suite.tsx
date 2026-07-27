"use client";

import { useEffect, useMemo, useState } from "react";

type Project = {
  id: number;
  name: string;
  health: string;
  progress: number;
  budget: number;
  due: string;
};

type Task = {
  id: number;
  projectId: number;
  projectName: string;
  title: string;
  status: string;
  priority: string;
  assigneeEmail: string | null;
  dueDate: string | null;
  dependsOnTaskId: number | null;
};

type Doc = {
  id: number;
  title: string;
  category: string;
  body: string;
  version: number;
  updatedAt: string;
};

const defaultDocs: Doc[] = [
  {
    id: 1,
    title: "Project launch playbook",
    category: "Template",
    body: "Purpose\nDefine the measurable outcome and accountable owner.\n\nLaunch gates\n1. Scope approved\n2. Budget baseline recorded\n3. Risks assigned\n4. Rollback plan verified",
    version: 4,
    updatedAt: "2026-07-28T08:30:00.000Z",
  },
  {
    id: 2,
    title: "Incident communication standard",
    category: "Knowledge base",
    body: "Use SEV-based updates. State customer impact, current owner, next update time, and recovery evidence. Never publish unverified causes.",
    version: 2,
    updatedAt: "2026-07-27T16:10:00.000Z",
  },
  {
    id: 3,
    title: "Weekly executive review",
    category: "Wiki",
    body: "Review delivery confidence, budget variance, resource pressure, overdue decisions, top risks, and next-week commitments.",
    version: 7,
    updatedAt: "2026-07-26T11:45:00.000Z",
  },
];

const people = [
  { name: "Arjun Rao", role: "Engineering", load: 94, hours: 43, skills: ["React", "APIs", "Cloud"] },
  { name: "Maya Sharma", role: "Design", load: 82, hours: 37, skills: ["Figma", "Research", "Systems"] },
  { name: "Nikhil Bera", role: "Operations", load: 67, hours: 31, skills: ["Events", "SLA", "Vendors"] },
  { name: "Leena Mehta", role: "Marketing", load: 48, hours: 24, skills: ["Brand", "Content", "Analytics"] },
  { name: "Dev Walia", role: "Engineering", load: 76, hours: 35, skills: ["Backend", "SQL", "Security"] },
];

function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored) queueMicrotask(() => setValue(JSON.parse(stored) as T));
    } catch {
      // Device storage is an enhancement; the workspace stays usable without it.
    }
  }, [key]);
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore unavailable browser storage.
    }
  }, [key, value]);
  return [value, setValue] as const;
}

function Hero({
  eyebrow,
  title,
  copy,
  action,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="suite-hero">
      <div>
        <span><i />{eyebrow}</span>
        <h2>{title}</h2>
        <p>{copy}</p>
      </div>
      {action}
    </section>
  );
}

function AiCommand({
  projects,
  tasks,
  notify,
}: {
  projects: Project[];
  tasks: Task[];
  notify: (message: string) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Portfolio scan complete. I found delivery, capacity, budget, and dependency signals ready for review.",
    },
  ]);
  const overdue = tasks.filter(
    (task) =>
      task.status !== "done" &&
      task.dueDate &&
      task.dueDate < new Date().toISOString().slice(0, 10),
  );
  const atRisk = projects.filter((project) => project.health !== "On track");
  const budgetPressure = projects.filter((project) => project.budget >= 75);
  const suggestions = [
    {
      label: "Task generator",
      title: `Create recovery brief for ${atRisk[0]?.name ?? "highest-risk project"}`,
      detail: "Owner, deadline, dependency check, and escalation path included.",
    },
    {
      label: "Risk prediction",
      title: `${Math.max(1, atRisk.length)} initiatives need early intervention`,
      detail: `${overdue.length} overdue commitments and ${budgetPressure.length} budget-pressure signals detected.`,
    },
    {
      label: "Resource planning",
      title: "Move one high-priority task from Arjun to Dev",
      detail: "Projected engineering load changes from 94% / 76% to 84% / 86%.",
    },
  ];
  const ask = () => {
    if (!prompt.trim()) return;
    const question = prompt.trim();
    const lower = question.toLowerCase();
    let answer = `Current portfolio confidence is ${Math.max(48, 92 - overdue.length * 4 - atRisk.length * 3)}%. `;
    if (lower.includes("budget")) {
      answer += `${budgetPressure.length} projects are above 75% utilization. Review committed spend before approving new scope.`;
    } else if (lower.includes("risk")) {
      answer += `${atRisk.length} projects are outside the healthy state. Prioritize owner assignment and a dated mitigation plan.`;
    } else if (lower.includes("resource") || lower.includes("team")) {
      answer += "Arjun is the only person above the 90% capacity guardrail. Rebalance one high-priority engineering task.";
    } else {
      answer += `${overdue.length} overdue tasks and ${atRisk.length} delivery exceptions currently drive the recommendation.`;
    }
    setMessages((current) => [
      ...current,
      { role: "user", text: question },
      { role: "assistant", text: answer },
    ]);
    setPrompt("");
  };
  return (
    <div className="suite-page">
      <Hero
        eyebrow="NEXUS INTELLIGENCE"
        title="A decision copilot grounded in your operating data."
        copy="Project management, task generation, risk sensing, budget analysis, executive reporting, and resource planning share one explainable workspace."
        action={<button className="suite-primary" onClick={() => notify("Executive brief prepared")}>Generate executive brief</button>}
      />
      <section className="suite-metrics">
        <article><span>Portfolio confidence</span><strong>{Math.max(48, 92 - overdue.length * 4 - atRisk.length * 3)}%</strong><small>Evidence-based score</small></article>
        <article><span>Predicted risks</span><strong>{Math.max(1, atRisk.length + overdue.length)}</strong><small>Next 14 days</small></article>
        <article><span>Budget pressure</span><strong>{budgetPressure.length}</strong><small>Above 75% utilized</small></article>
        <article><span>Actions proposed</span><strong>6</strong><small>Human approval required</small></article>
      </section>
      <section className="ai-layout">
        <article className="suite-panel ai-feed">
          <div className="suite-panel-head"><div><span>AI PROJECT MANAGER</span><h3>Ask Nexus</h3></div><em>Explainable mode</em></div>
          <div className="ai-messages">
            {messages.map((message, index) => (
              <div className={message.role} key={`${message.role}-${index}`}>
                <b>{message.role === "assistant" ? "NX" : "You"}</b>
                <p>{message.text}</p>
              </div>
            ))}
          </div>
          <div className="ai-compose">
            <input
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && ask()}
              placeholder="Ask about delivery, budget, resources, or risk…"
            />
            <button onClick={ask}>Send</button>
          </div>
        </article>
        <aside className="suite-panel ai-recommendations">
          <div className="suite-panel-head"><div><span>RECOMMENDED ACTIONS</span><h3>Human-controlled proposals</h3></div></div>
          {suggestions.map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
              <button onClick={() => notify(`${item.label} proposal opened`)}>Review proposal</button>
            </article>
          ))}
        </aside>
      </section>
    </div>
  );
}

function KnowledgeHub({ notify }: { notify: (message: string) => void }) {
  const [docs, setDocs] = useStored("nexus.knowledge.v1", defaultDocs);
  const [selectedId, setSelectedId] = useState(1);
  const selected = docs.find((doc) => doc.id === selectedId) ?? docs[0];
  const [draftTitle, setDraftTitle] = useState(selected?.title ?? "");
  const [draftBody, setDraftBody] = useState(selected?.body ?? "");
  const selectDoc = (doc: Doc) => {
    setSelectedId(doc.id);
    setDraftTitle(doc.title);
    setDraftBody(doc.body);
  };
  const save = () => {
    if (!selected || !draftTitle.trim()) return;
    setDocs((current) =>
      current.map((doc) =>
        doc.id === selected.id
          ? {
              ...doc,
              title: draftTitle.trim(),
              body: draftBody,
              version: doc.version + 1,
              updatedAt: new Date().toISOString(),
            }
          : doc,
      ),
    );
    notify("Knowledge page saved as a new version");
  };
  const createFromTemplate = () => {
    const doc: Doc = {
      id: Date.now(),
      title: "Untitled operating page",
      category: "Wiki",
      body: "Purpose\n\nOwner\n\nDecision log\n\nNext review",
      version: 1,
      updatedAt: new Date().toISOString(),
    };
    setDocs((current) => [doc, ...current]);
    setSelectedId(doc.id);
    setDraftTitle(doc.title);
    setDraftBody(doc.body);
  };
  return (
    <div className="suite-page">
      <Hero
        eyebrow="KNOWLEDGE OPERATING SYSTEM"
        title="Turn decisions into reusable organizational memory."
        copy="Wiki pages, governed knowledge, templates, rich editing, and visible version history live beside execution."
        action={<button className="suite-primary" onClick={createFromTemplate}>New page</button>}
      />
      <section className="knowledge-layout">
        <aside className="suite-panel knowledge-index">
          <div className="suite-panel-head"><div><span>LIBRARY</span><h3>Workspace knowledge</h3></div><em>{docs.length} pages</em></div>
          <input className="suite-search" placeholder="Search knowledge…" />
          {docs.map((doc) => (
            <button className={doc.id === selected?.id ? "active" : ""} onClick={() => selectDoc(doc)} key={doc.id}>
              <i>{doc.category.slice(0, 1)}</i>
              <span><strong>{doc.title}</strong><small>{doc.category} · v{doc.version}</small></span>
            </button>
          ))}
          <div className="template-strip">
            <span>Quick templates</span>
            <button onClick={createFromTemplate}>Project brief</button>
            <button onClick={createFromTemplate}>Meeting notes</button>
            <button onClick={createFromTemplate}>Runbook</button>
          </div>
        </aside>
        <article className="suite-panel knowledge-editor">
          <div className="editor-toolbar">
            <button aria-label="Bold">B</button><button aria-label="Italic"><i>I</i></button><button>H1</button><button>List</button><button>Link</button>
            <span />
            <em>Autosaved on this device</em>
          </div>
          <input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} className="editor-title" />
          <textarea value={draftBody} onChange={(event) => setDraftBody(event.target.value)} />
          <div className="editor-foot">
            <span>Version {selected?.version ?? 1} · Updated {selected ? new Date(selected.updatedAt).toLocaleString() : "now"}</span>
            <div><button onClick={() => notify("Version history opened")}>Version history</button><button className="suite-primary" onClick={save}>Save version</button></div>
          </div>
        </article>
      </section>
    </div>
  );
}

function ResourceCenter({ notify }: { notify: (message: string) => void }) {
  const [tab, setTab] = useState("Capacity");
  const [leave, setLeave] = useStored("nexus.leave.v1", [
    { id: 1, person: "Maya Sharma", dates: "Aug 12–14", type: "Annual leave", status: "pending" },
    { id: 2, person: "Nikhil Bera", dates: "Aug 22", type: "Personal", status: "approved" },
  ]);
  const [hours, setHours] = useStored("nexus.timesheet.v1", 36);
  return (
    <div className="suite-page">
      <Hero
        eyebrow="RESOURCE COMMAND"
        title="Match demand, capacity, availability, and skills before work slips."
        copy="Capacity planning, timesheets, leave management, workload balancing, and a searchable skills matrix."
        action={<button className="suite-primary" onClick={() => notify("Capacity plan exported")}>Export capacity plan</button>}
      />
      <nav className="suite-tabs">
        {["Capacity", "Timesheets", "Leave", "Skills matrix"].map((item) => (
          <button className={tab === item ? "active" : ""} onClick={() => setTab(item)} key={item}>{item}</button>
        ))}
      </nav>
      {tab === "Capacity" && (
        <>
          <section className="suite-metrics">
            <article><span>Team utilization</span><strong>73%</strong><small>Healthy range</small></article>
            <article><span>Available capacity</span><strong>62h</strong><small>Next 7 days</small></article>
            <article><span>Overloaded</span><strong className="suite-danger">1</strong><small>Action required</small></article>
            <article><span>Coverage gaps</span><strong>2</strong><small>Cloud and finance</small></article>
          </section>
          <section className="suite-panel capacity-board">
            <div className="suite-panel-head"><div><span>WORKLOAD BALANCING</span><h3>Weekly capacity plan</h3></div><em>40h baseline</em></div>
            {people.map((person) => (
              <article key={person.name}>
                <i>{person.name.split(" ").map((part) => part[0]).join("")}</i>
                <div><strong>{person.name}</strong><small>{person.role} · {person.hours}h planned</small><span><b className={person.load > 90 ? "hot" : ""} style={{ width: `${Math.min(person.load, 100)}%` }} /></span></div>
                <em className={person.load > 90 ? "hot" : ""}>{person.load}%</em>
                <button onClick={() => notify(`Rebalance options opened for ${person.name}`)}>Balance</button>
              </article>
            ))}
          </section>
        </>
      )}
      {tab === "Timesheets" && (
        <section className="suite-split">
          <article className="suite-panel timesheet-card">
            <div className="suite-panel-head"><div><span>THIS WEEK</span><h3>My timesheet</h3></div><em>{hours}/40h</em></div>
            <div className="week-hours">
              {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, index) => <label key={day}><span>{day}</span><input type="number" min="0" max="16" defaultValue={index < 4 ? 8 : Math.max(0, hours - 32)} /></label>)}
            </div>
            <div className="timesheet-progress"><i style={{ width: `${Math.min(100, hours / 40 * 100)}%` }} /></div>
            <div className="editor-foot"><span>Draft · Project allocation required</span><button className="suite-primary" onClick={() => { setHours(40); notify("Timesheet submitted for approval"); }}>Submit 40 hours</button></div>
          </article>
          <aside className="suite-panel compliance-card"><span>TIME COMPLIANCE</span><strong>92%</strong><p>17 of 18 members submitted on time. One reminder is scheduled for 5:00 PM.</p><button onClick={() => notify("Timesheet reminder queued")}>Send reminder</button></aside>
        </section>
      )}
      {tab === "Leave" && (
        <section className="suite-panel leave-table">
          <div className="suite-panel-head"><div><span>AVAILABILITY</span><h3>Leave requests</h3></div><button onClick={() => notify("New leave request opened")}>Request leave</button></div>
          {leave.map((item) => (
            <article key={item.id}><i>{item.person.slice(0, 2).toUpperCase()}</i><div><strong>{item.person}</strong><small>{item.type}</small></div><span>{item.dates}</span><em className={item.status}>{item.status}</em>{item.status === "pending" ? <button onClick={() => setLeave((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "approved" } : entry))}>Approve</button> : <button onClick={() => notify("Leave coverage plan opened")}>Coverage</button>}</article>
          ))}
        </section>
      )}
      {tab === "Skills matrix" && (
        <section className="suite-panel skills-matrix">
          <div className="suite-panel-head"><div><span>CAPABILITY MAP</span><h3>Skills and coverage</h3></div><input className="suite-search" placeholder="Filter skills…" /></div>
          {people.map((person) => <article key={person.name}><div><i>{person.name.slice(0, 2).toUpperCase()}</i><span><strong>{person.name}</strong><small>{person.role}</small></span></div><p>{person.skills.map((skill) => <span key={skill}>{skill}</span>)}</p><em>{person.skills.length >= 3 ? "Strong coverage" : "Developing"}</em></article>)}
        </section>
      )}
    </div>
  );
}

function FinanceHub({ projects, notify }: { projects: Project[]; notify: (message: string) => void }) {
  const [tab, setTab] = useState("Expenses");
  const [expenses, setExpenses] = useStored("nexus.expenses.v1", [
    { id: 1, vendor: "Cloudflare", category: "Infrastructure", amount: 28600, status: "approved" },
    { id: 2, vendor: "ArenaWorks", category: "Venue", amount: 74000, status: "pending" },
    { id: 3, vendor: "Figma", category: "Software", amount: 12300, status: "paid" },
  ]);
  const total = expenses.reduce((sum, item) => sum + item.amount, 0);
  return (
    <div className="suite-page">
      <Hero
        eyebrow="FINANCIAL OPERATIONS"
        title="Control spend from request to return."
        copy="Expense tracking, invoices, vendors, forecasting, budget variance, and ROI in one auditable financial workspace."
        action={<button className="suite-primary" onClick={() => notify("Financial close report exported")}>Export close report</button>}
      />
      <section className="suite-metrics">
        <article><span>Tracked expenses</span><strong>₹{Math.round(total / 1000)}K</strong><small>This month</small></article>
        <article><span>Pending invoices</span><strong>3</strong><small>₹1.18L outstanding</small></article>
        <article><span>Forecast variance</span><strong className="suite-positive">-4.8%</strong><small>Under plan</small></article>
        <article><span>Portfolio ROI</span><strong>2.7×</strong><small>Forecast return</small></article>
      </section>
      <nav className="suite-tabs">
        {["Expenses", "Invoices", "Vendors", "Forecast & ROI"].map((item) => <button className={tab === item ? "active" : ""} onClick={() => setTab(item)} key={item}>{item}</button>)}
      </nav>
      {tab === "Expenses" && <section className="suite-panel finance-table"><div className="suite-panel-head"><div><span>EXPENSE REGISTER</span><h3>Controlled spend</h3></div><button onClick={() => setExpenses((current) => [{ id: Date.now(), vendor: "New expense", category: "Uncategorized", amount: 0, status: "draft" }, ...current])}>Add expense</button></div>{expenses.map((item) => <article key={item.id}><div><strong>{item.vendor}</strong><small>{item.category}</small></div><span>₹{item.amount.toLocaleString("en-IN")}</span><em className={item.status}>{item.status}</em><button onClick={() => notify(`${item.vendor} expense opened`)}>Review</button></article>)}</section>}
      {tab === "Invoices" && <section className="suite-panel finance-table"><div className="suite-panel-head"><div><span>ACCOUNTS PAYABLE</span><h3>Invoice control</h3></div><button onClick={() => notify("Invoice capture opened")}>Upload invoice</button></div>{[["INV-2048","ArenaWorks","₹74,000","Due Aug 05","pending"],["INV-2042","Cloudflare","₹28,600","Paid Jul 26","paid"],["INV-2039","PixelCraft","₹44,000","Due Aug 11","review"]].map((row) => <article key={row[0]}><div><strong>{row[0]}</strong><small>{row[1]}</small></div><span>{row[2]}</span><small>{row[3]}</small><em className={row[4]}>{row[4]}</em><button onClick={() => notify(`${row[0]} opened`)}>Open</button></article>)}</section>}
      {tab === "Vendors" && <section className="vendor-grid">{[["Cloudflare","Infrastructure","98","Active"],["ArenaWorks","Events","83","Review"],["PixelCraft","Creative","91","Active"],["Figma","Software","96","Active"]].map((row) => <article className="suite-panel" key={row[0]}><span>{row[1]}</span><h3>{row[0]}</h3><strong>{row[2]}</strong><small>Vendor score</small><em>{row[3]}</em><button onClick={() => notify(`${row[0]} vendor record opened`)}>View profile</button></article>)}</section>}
      {tab === "Forecast & ROI" && <section className="suite-split"><article className="suite-panel forecast-chart"><div className="suite-panel-head"><div><span>12-MONTH FORECAST</span><h3>Plan vs expected spend</h3></div><em>₹29.6L portfolio</em></div><div>{[62,66,71,68,74,79,83,78,86,89,92,88].map((value,index) => <i style={{height:`${value}%`}} key={index}><span /></i>)}</div><p>Forecast remains ₹1.42L under the approved portfolio baseline.</p></article><aside className="suite-panel roi-list"><div className="suite-panel-head"><div><span>RETURN MODEL</span><h3>ROI by project</h3></div></div>{projects.slice(0,4).map((project,index) => <article key={project.id}><div><strong>{project.name}</strong><small>{project.progress}% delivered</small></div><em>{(3.2-index*.35).toFixed(1)}×</em></article>)}</aside></section>}
    </div>
  );
}

function ProductivityViews({ projects, tasks }: { projects: Project[]; tasks: Task[] }) {
  const [view, setView] = useState("Timeline");
  const visibleProjects = projects.slice(0, 4);
  return (
    <div className="suite-page">
      <Hero eyebrow="PRODUCTIVITY VIEWS" title="See the same work from every useful angle." copy="Improved Kanban, timeline, portfolio, mind map, and dependency graph views share one source of truth." />
      <nav className="suite-tabs">
        {["Timeline", "Portfolio", "Mind map", "Dependencies"].map((item) => <button className={view === item ? "active" : ""} onClick={() => setView(item)} key={item}>{item}</button>)}
      </nav>
      {view === "Timeline" && <section className="suite-panel timeline-view"><div className="timeline-head"><span>Initiative</span>{["Jul 28","Aug 04","Aug 11","Aug 18","Aug 25","Sep 01"].map((date) => <small key={date}>{date}</small>)}</div>{visibleProjects.map((project,index) => <article key={project.id}><strong>{project.name}</strong><div><i style={{left:`${index*7+4}%`,width:`${46-index*3}%`}}><span>{project.progress}%</span></i></div></article>)}</section>}
      {view === "Portfolio" && <section className="portfolio-view">{visibleProjects.map((project) => <article className="suite-panel" key={project.id}><span className={project.health === "On track" ? "healthy" : "risk"}>{project.health}</span><h3>{project.name}</h3><div><i style={{width:`${project.progress}%`}} /></div><p><b>{project.progress}%</b> delivered <em>{project.budget}% budget</em></p></article>)}</section>}
      {view === "Mind map" && <section className="suite-panel mindmap"><div className="mind-center">Nexus<br/>Portfolio</div><div className="mind-branch one"><i />Delivery<span>{projects.length} projects</span></div><div className="mind-branch two"><i />People<span>5 skill groups</span></div><div className="mind-branch three"><i />Finance<span>₹29.6L</span></div><div className="mind-branch four"><i />Risk<span>{projects.filter((p) => p.health !== "On track").length} exceptions</span></div></section>}
      {view === "Dependencies" && <section className="suite-panel dependency-view"><div className="dependency-root"><strong>Launch readiness</strong><span>Portfolio gate</span></div><i /><div className="dependency-level">{tasks.slice(0,3).map((task,index) => <article key={task.id || index}><span className={task.status === "done" ? "done" : ""}>{task.status === "done" ? "✓" : index+1}</span><strong>{task.title}</strong><small>{task.projectName}</small></article>)}</div><p>Critical path highlights blocked tasks before dates or approvals are missed.</p></section>}
    </div>
  );
}

function SearchCenter({
  projects,
  tasks,
  initialQuery,
  notify,
}: {
  projects: Project[];
  tasks: Task[];
  initialQuery: string;
  notify: (message: string) => void;
}) {
  const [docs] = useStored("nexus.knowledge.v1", defaultDocs);
  const [query, setQuery] = useState(initialQuery);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return [
      ...projects.filter((item) => item.name.toLowerCase().includes(q)).map((item) => ({ type: "Project", title: item.name, meta: `${item.progress}% complete · ${item.health}` })),
      ...tasks.filter((item) => `${item.title} ${item.projectName}`.toLowerCase().includes(q)).map((item) => ({ type: "Task", title: item.title, meta: `${item.projectName} · ${item.status.replace("_", " ")}` })),
      ...docs.filter((item) => `${item.title} ${item.body}`.toLowerCase().includes(q)).map((item) => ({ type: "Knowledge", title: item.title, meta: `${item.category} · version ${item.version}` })),
    ];
  }, [docs, projects, query, tasks]);
  return (
    <div className="suite-page">
      <Hero eyebrow="UNIVERSAL DISCOVERY" title="Search every layer of work from one place." copy="Global, file, knowledge, and AI-assisted search use access-aware result groups. OCR ingestion is ready for connected file storage." />
      <section className="suite-panel search-command">
        <span>⌕</span><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects, tasks, people, files, wiki pages, and decisions…" /><kbd>⌘ K</kbd>
      </section>
      <div className="search-filters"><button className="active">Everything</button><button>Projects</button><button>Tasks</button><button>Files</button><button>Knowledge</button><button onClick={() => notify("AI semantic search enabled for this query")}>AI search</button><button onClick={() => notify("OCR requires a connected file source")}>OCR</button></div>
      <section className="suite-panel search-results">
        {!query.trim() ? <div className="suite-empty"><span>⌕</span><strong>Search the whole workspace</strong><p>Try a project name, task, owner, decision, or document phrase.</p></div> : results.length ? results.map((result, index) => <button key={`${result.type}-${index}`} onClick={() => notify(`${result.type} result opened`)}><i>{result.type.slice(0,1)}</i><span><em>{result.type}</em><strong>{result.title}</strong><small>{result.meta}</small></span><b>→</b></button>) : <div className="suite-empty"><span>0</span><strong>No accessible results</strong><p>Check the spelling or connect a file source for broader discovery.</p></div>}
      </section>
    </div>
  );
}

export function ExpansionSuite({
  active,
  projects,
  tasks,
  initialQuery,
  notify,
}: {
  active: string;
  projects: Project[];
  tasks: Task[];
  initialQuery: string;
  notify: (message: string) => void;
}) {
  if (active === "AI Command") return <AiCommand projects={projects} tasks={tasks} notify={notify} />;
  if (active === "Knowledge") return <KnowledgeHub notify={notify} />;
  if (active === "Resources") return <ResourceCenter notify={notify} />;
  if (active === "Finance") return <FinanceHub projects={projects} notify={notify} />;
  if (active === "Views") return <ProductivityViews projects={projects} tasks={tasks} />;
  return <SearchCenter projects={projects} tasks={tasks} initialQuery={initialQuery} notify={notify} />;
}
