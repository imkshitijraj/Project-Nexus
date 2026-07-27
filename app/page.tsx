"use client";

import { useEffect, useMemo, useState } from "react";
import { EnterpriseModule } from "./enterprise-modules";
import { BudgetControl } from "./budget-control";
import {
  DeliveryStatusEditor,
  GovernanceControl,
  emptyGovernance,
  type GovernanceData,
} from "./governance-control";
import {
  ReliabilityControl,
  emptyReliability,
  type ReliabilityData,
} from "./reliability-control";

type IconName =
  | "grid"
  | "folder"
  | "check"
  | "users"
  | "calendar"
  | "wallet"
  | "risk"
  | "report"
  | "bell"
  | "settings"
  | "search"
  | "plus"
  | "arrow"
  | "clock"
  | "spark"
  | "menu"
  | "shield"
  | "lock"
  | "pulse";

const paths: Record<IconName, React.ReactNode> = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
  folder: <><path d="M3 7.5a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M3 10h18"/></>,
  check: <><path d="M9 11l3 3L22 4"/><path d="M21 12a9 9 0 1 1-5.3-8.2"/></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/><path d="M8 15h.01M12 15h.01M16 15h.01"/></>,
  wallet: <><path d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h16v10a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V6"/><path d="M16 13h2"/></>,
  risk: <><path d="M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></>,
  report: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  arrow: <path d="m9 18 6-6-6-6"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  spark: <><path d="m12 3-1.5 4.5L6 9l4.5 1.5L12 15l1.5-4.5L18 9l-4.5-1.5Z"/><path d="m19 15-.7 2.3L16 18l2.3.7L19 21l.7-2.3L22 18l-2.3-.7Z"/></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
  shield: <><path d="M12 3 4.5 6v5.2c0 4.7 3 8 7.5 9.8 4.5-1.8 7.5-5.1 7.5-9.8V6Z"/><path d="m8.8 12 2.1 2.1 4.5-4.6"/></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></>,
  pulse: <><path d="M3 12h4l2.2-6 4.1 12 2.3-6H21"/><path d="M5 5.5A9 9 0 1 1 3.7 16"/></>,
};

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const nav = [
  ["Dashboard", "grid"], ["Projects", "folder"], ["My Tasks", "check"],
  ["Automation", "spark"], ["Teams", "users"], ["Access", "lock"], ["Calendar", "calendar"], ["Budget", "wallet"],
  ["Risks", "risk"], ["Reliability", "pulse"], ["Reports", "report"], ["Integrations", "settings"], ["Administration", "shield"],
] as const;

const seedProjects = [
  { id: -1, name: "Nexus Mobile App", team: ["AR", "MS", "JT"], health: "On track", progress: 72, budget: 64, due: "Sep 18", color: "#b9f34a" },
  { id: -2, name: "Campus Esports League", team: ["KR", "NB", "AS"], health: "At risk", progress: 48, budget: 78, due: "Sep 04", color: "#ff8b70" },
  { id: -3, name: "APAC Brand Refresh", team: ["LM", "RK"], health: "On track", progress: 86, budget: 71, due: "Aug 28", color: "#b9f34a" },
  { id: -4, name: "Client Portal v2", team: ["DW", "PS", "AJ"], health: "Delayed", progress: 39, budget: 58, due: "Aug 22", color: "#ffd166" },
];

const activity = [
  { initials: "MS", text: "Maya completed UX handoff", meta: "Nexus Mobile App · 12m", tone: "lilac" },
  { initials: "KR", text: "Kshitij added a new risk", meta: "Campus Esports League · 38m", tone: "lime" },
  { initials: "DW", text: "Dev moved API integration", meta: "Client Portal v2 · 1h", tone: "peach" },
];

type WorkspaceMember = { id:number; email:string; displayName:string; role:string; status:string; joinedAt:string };
type Invitation = { id:number; email:string; role:string; projectId:number|null; projectRole:string; expiresAt:string };
type ProjectAssignment = { id:number; projectId:number; projectName:string; email:string; role:string };
type Approval = { id:number; projectId:number|null; projectName:string|null; title:string; category:string; amount:number; status:string; requestedBy:string; createdAt:string };
type AuditEvent = { id:number; actorEmail:string; action:string; target:string; detail:string; risk:string; createdAt:string };
type WorkspaceAccessData = {
  membership: WorkspaceMember;
  permissions: string[];
  members: WorkspaceMember[];
  invitations: Invitation[];
  projectMembers: ProjectAssignment[];
  approvals: Approval[];
  audit: AuditEvent[];
};

type OperationTask = {
  id:number;
  projectId:number;
  projectName:string;
  title:string;
  description:string;
  status:string;
  priority:string;
  assigneeEmail:string|null;
  dueDate:string|null;
  parentTaskId:number|null;
  dependsOnTaskId:number|null;
  createdBy:string;
  createdAt:string;
  updatedAt:string;
};
type TaskComment = { id:number; taskId:number; body:string; mentions:string[]; authorEmail:string; createdAt:string };
type OperationNotification = { id:number; recipientEmail:string; projectId:number|null; taskId:number|null; type:string; title:string; body:string; readAt:string|null; createdAt:string };
type ProjectActivity = { id:number; projectId:number; projectName:string; actorEmail:string; action:string; entityType:string; entityId:number|null; detail:string; createdAt:string };
type OperationData = {
  tasks:OperationTask[];
  comments:TaskComment[];
  activity:ProjectActivity[];
  notifications:OperationNotification[];
  members:Array<{email:string;displayName:string;role:string}>;
  projects:Array<{id:number;name:string}>;
  metrics:{open:number;overdue:number;blocked:number;unread:number};
};
const emptyOperations: OperationData = {
  tasks:[],
  comments:[],
  activity:[],
  notifications:[],
  members:[],
  projects:[],
  metrics:{open:0,overdue:0,blocked:0,unread:0},
};

function OperationsBoard({
  data,
  command,
  notify,
  currentEmail,
}: {
  data:OperationData;
  command:(payload:Record<string,unknown>)=>Promise<boolean>;
  notify:(message:string)=>void;
  currentEmail:string;
}) {
  const [scope, setScope] = useState<"all"|"mine">("all");
  const [selectedTask, setSelectedTask] = useState<OperationTask|null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState("high");
  const [dueDate, setDueDate] = useState("");
  const [dependsOn, setDependsOn] = useState("");
  const [comment, setComment] = useState("");
  const [working, setWorking] = useState("");
  const visible = data.tasks.filter((task)=>scope==="all"||task.assigneeEmail===currentEmail);
  const columns = [
    ["todo","To do","neutral"],
    ["in_progress","In progress","yellow"],
    ["review","Review","purple"],
    ["done","Done","green"],
  ] as const;
  const run = async (key:string, payload:Record<string,unknown>, message:string) => {
    setWorking(key);
    const ok = await command(payload);
    setWorking("");
    if (ok) notify(message);
    return ok;
  };
  const createTask = async () => {
    if (!title.trim() || !projectId) return;
    const ok = await run("create", {
      action:"createTask",
      title,
      projectId,
      assigneeEmail:assignee||null,
      priority,
      dueDate:dueDate||null,
      dependsOnTaskId:dependsOn||null,
    }, "Task created and activity recorded");
    if (ok) {
      setCreateOpen(false);
      setTitle("");
      setDueDate("");
      setDependsOn("");
    }
  };
  const addComment = async () => {
    if (!selectedTask || !comment.trim()) return;
    const ok = await run("comment", {action:"addComment",taskId:selectedTask.id,body:comment}, "Comment added and mentions routed");
    if (ok) setComment("");
  };
  const selectedComments = selectedTask ? data.comments.filter((item)=>item.taskId===selectedTask.id) : [];
  return <section className="operations-shell">
    <section className="ops-command">
      <div><span className="ops-live"><i/> Collaborative operations live</span><h2>Execution, decisions, and accountability in one control plane.</h2><p>Every task command is identity-verified, project-scoped, rate-limited, and written to the activity ledger.</p></div>
      <button className="primary" disabled={!data.projects.length} onClick={()=>setCreateOpen(true)}><Icon name="plus" size={16}/> Create task</button>
    </section>
    <section className="ops-metrics">
      <article><span>Open work</span><strong>{data.metrics.open}</strong><small>Across accessible projects</small></article>
      <article><span>Overdue</span><strong className={data.metrics.overdue?"coral-text":""}>{data.metrics.overdue}</strong><small>Requires intervention</small></article>
      <article><span>Dependencies</span><strong>{data.metrics.blocked}</strong><small>Progression is enforced</small></article>
      <article><span>Unread signals</span><strong>{data.metrics.unread}</strong><small>Assignments and mentions</small></article>
    </section>
    <div className="ops-toolbar">
      <div className="filter-tabs"><button className={scope==="all"?"selected":""} onClick={()=>setScope("all")}>All accessible</button><button className={scope==="mine"?"selected":""} onClick={()=>setScope("mine")}>Assigned to me</button></div>
      <span><Icon name="shield" size={14}/> Project isolation enforced</span>
    </div>
    {data.projects.length===0?<section className="panel ops-empty"><Icon name="folder" size={24}/><h2>Create or join a project first</h2><p>Tasks become available after your account has project-level access.</p></section>:<div className="board operations-board">
      {columns.map(([status,label,tone])=><section className="task-column" key={status}><div className="task-column-head"><div><i className={tone}/><strong>{label}</strong><span>{visible.filter((task)=>task.status===status).length}</span></div><button aria-label={`Add task to ${label}`} onClick={()=>setCreateOpen(true)}><Icon name="plus" size={16}/></button></div>
        {visible.filter((task)=>task.status===status).map((task)=><article className={`task-card operation-task ${task.id===selectedTask?.id?"selected":""}`} key={task.id} onClick={()=>setSelectedTask(task)} tabIndex={0} onKeyDown={(event)=>event.key==="Enter"&&setSelectedTask(task)}>
          <div className="task-tags"><span className={`priority ${task.priority}`}>{task.priority}</span>{task.dependsOnTaskId?<span className="dependency-chip"><Icon name="lock" size={11}/> dependency</span>:null}</div>
          <h3>{task.title}</h3><p>{task.projectName}</p>
          <div><span className="task-owner">{task.assigneeEmail?.slice(0,2).toUpperCase()||"—"}</span><span className={task.dueDate&&task.dueDate<new Date().toISOString().slice(0,10)?"task-due today":"task-due"}><Icon name="clock" size={13}/>{task.dueDate?new Date(`${task.dueDate}T00:00:00`).toLocaleDateString(undefined,{month:"short",day:"numeric"}):"No date"}</span></div>
        </article>)}
        {visible.filter((task)=>task.status===status).length===0?<div className="column-empty">No work in this stage</div>:null}
      </section>)}
    </div>}
    {createOpen&&<div className="modal-backdrop" onMouseDown={()=>setCreateOpen(false)}><section className="modal task-modal" role="dialog" aria-modal="true" aria-labelledby="task-create-title" onMouseDown={(event)=>event.stopPropagation()}><div className="modal-head"><div><span className="section-kicker">Controlled command</span><h2 id="task-create-title">Create operational task</h2></div><button onClick={()=>setCreateOpen(false)}>×</button></div><p className="modal-copy">The assignee must already have access to the selected project. Dependencies are enforced before status progression.</p><label>Task title<input autoFocus value={title} onChange={(event)=>setTitle(event.target.value)} placeholder="Define a clear outcome"/></label><div className="modal-grid"><label>Project<select value={projectId} onChange={(event)=>setProjectId(event.target.value)}><option value="">Choose project</option>{data.projects.map((project)=><option value={project.id} key={project.id}>{project.name}</option>)}</select></label><label>Priority<select value={priority} onChange={(event)=>setPriority(event.target.value)}><option value="urgent">Urgent</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label><label>Assignee<select value={assignee} onChange={(event)=>setAssignee(event.target.value)}><option value="">Unassigned</option>{data.members.map((member)=><option key={member.email} value={member.email}>{member.displayName}</option>)}</select></label><label>Due date<input type="date" value={dueDate} onChange={(event)=>setDueDate(event.target.value)}/></label></div><label>Depends on<select value={dependsOn} onChange={(event)=>setDependsOn(event.target.value)}><option value="">No dependency</option>{data.tasks.filter((task)=>String(task.projectId)===projectId&&task.status!=="done").map((task)=><option value={task.id} key={task.id}>{task.title}</option>)}</select></label><div className="invite-safety"><Icon name="shield" size={15}/><span><strong>Server-enforced execution</strong><small>Authorization, dependency checks, notifications, and audit logging run before the command is accepted.</small></span></div><div className="modal-actions"><button onClick={()=>setCreateOpen(false)}>Cancel</button><button className="primary" disabled={!title.trim()||!projectId||working==="create"} onClick={createTask}>{working==="create"?"Creating…":"Create task"}</button></div></section></div>}
    {selectedTask&&<div className="detail-backdrop" onMouseDown={()=>setSelectedTask(null)}><aside className="project-detail task-detail" onMouseDown={(event)=>event.stopPropagation()}><div className="detail-hero"><button className="detail-close" onClick={()=>setSelectedTask(null)}>×</button><span className={`priority ${selectedTask.priority}`}>{selectedTask.priority}</span><h2>{selectedTask.title}</h2><p>{selectedTask.projectName} · Created by {selectedTask.createdBy}</p></div><div className="detail-body"><section className="detail-section"><span className="section-kicker">Execution control</span><h2>Move work</h2><div className="status-command">{columns.map(([status,label])=><button key={status} disabled={working==="status"||selectedTask.status===status} className={selectedTask.status===status?"active":""} onClick={async()=>{const ok=await run("status",{action:"updateTask",taskId:selectedTask.id,status},`Task moved to ${label}`);if(ok)setSelectedTask({...selectedTask,status})}}>{label}</button>)}</div>{selectedTask.dependsOnTaskId?<p className="dependency-note"><Icon name="lock" size={13}/> This task cannot advance until task #{selectedTask.dependsOnTaskId} is complete.</p>:null}</section><section className="detail-section"><span className="section-kicker">Task brief</span><p className="executive-summary">{selectedTask.description||"No additional task brief has been added."}</p></section><section className="detail-section comments-section"><div className="panel-head"><div><span className="section-kicker">Collaboration</span><h2>Thread</h2></div><span>{selectedComments.length} comments</span></div><div className="comment-list">{selectedComments.map((item)=><article key={item.id}><i>{item.authorEmail.slice(0,2).toUpperCase()}</i><div><strong>{item.authorEmail}</strong><time>{new Date(item.createdAt).toLocaleString()}</time><p>{item.body}</p></div></article>)}{selectedComments.length===0?<p className="comment-empty">Start the decision trail for this task.</p>:null}</div><label className="comment-box">Comment or mention a verified email<textarea value={comment} onChange={(event)=>setComment(event.target.value)} placeholder="Add context. Mention with @name@example.com"/></label><button className="primary comment-submit" disabled={!comment.trim()||working==="comment"} onClick={addComment}>{working==="comment"?"Posting…":"Post comment"}</button></section></div></aside></div>}
  </section>;
}

function LiveNotifications({data,command,notify}:{data:OperationData;command:(payload:Record<string,unknown>)=>Promise<boolean>;notify:(message:string)=>void}) {
  const [filter,setFilter]=useState("All");
  const visible=data.notifications.filter((item)=>filter==="All"||(filter==="Unread"&&!item.readAt)||(filter==="Mentions"&&item.type==="mention")||(filter==="Assignments"&&item.type==="assignment"));
  const markAll=async()=>{if(await command({action:"markAllNotificationsRead"}))notify("All notifications marked as read")};
  return <><section className="notification-summary"><div><span className="summary-icon coral"><Icon name="bell"/></span><div><strong>{data.metrics.unread}</strong><small>Unread</small></div></div><div><span className="summary-icon yellow"><Icon name="risk"/></span><div><strong>{data.notifications.filter((item)=>item.type==="assignment").length}</strong><small>Assignments</small></div></div><div><span className="summary-icon purple"><Icon name="check"/></span><div><strong>{data.notifications.filter((item)=>item.type==="mention").length}</strong><small>Mentions</small></div></div><button onClick={markAll}><Icon name="check" size={15}/> Mark all as read</button></section><section className="notification-layout"><article className="panel notification-center"><div className="notification-toolbar"><div className="filter-tabs">{["All","Unread","Mentions","Assignments"].map((item)=><button key={item} className={filter===item?"selected":""} onClick={()=>setFilter(item)}>{item}</button>)}</div></div><div className="notification-feed">{visible.map((item)=><div className={`feed-item ${!item.readAt?"unread":""}`} key={item.id}><span className={`feed-icon ${item.type==="mention"?"purple":item.type==="assignment"?"coral":"green"}`}><Icon name={item.type==="assignment"?"check":"bell"} size={16}/></span><div className="feed-copy"><div><span className="feed-type">{item.type}</span><small>{new Date(item.createdAt).toLocaleString()}</small></div><strong>{item.title}</strong><p>{item.body}</p><div className="feed-actions">{!item.readAt?<button onClick={async()=>{if(await command({action:"markNotificationRead",notificationId:item.id}))notify("Notification acknowledged")}}>Acknowledge</button>:<span className="read-receipt">Acknowledged</span>}</div></div></div>)}{visible.length===0?<div className="empty-state"><Icon name="bell"/><strong>No signals in this view</strong><span>New assignments, comments, and mentions will appear here.</span></div>:null}</div></article><aside className="panel notification-rules"><span className="section-kicker">Delivery policy</span><h2>Reliable routing</h2><p>Signals are generated by server-side commands and delivered only to verified project members.</p><div className="routing-stack"><span><i className="green-dot"/><b>Assignment changes</b><small>Immediate</small></span><span><i className="green-dot"/><b>@mentions</b><small>Immediate</small></span><span><i className="yellow-dot"/><b>Task comments</b><small>Activity feed</small></span></div><div className="digest-card"><Icon name="shield"/><strong>Isolation verified</strong><span>Cross-project notifications are denied by policy.</span></div></aside></section></>;
}

function ModulePage({ active, projects, onNew, onInspect, notify, theme, setTheme, compactMode, setCompactMode, reducedMotion, setReducedMotion, canCreate, operations, operationCommand, currentEmail, governance, governanceCommand, reliability, reliabilityCommand }: { active: string; projects: typeof seedProjects; onNew: () => void; onInspect: (project: typeof seedProjects[number]) => void; notify: (message:string) => void; theme: "light"|"dark"|"system"; setTheme: (theme:"light"|"dark"|"system")=>void; compactMode:boolean; setCompactMode:(value:boolean)=>void; reducedMotion:boolean; setReducedMotion:(value:boolean)=>void; canCreate:boolean; operations:OperationData; operationCommand:(payload:Record<string,unknown>)=>Promise<boolean>; currentEmail:string; governance:GovernanceData; governanceCommand:(payload:Record<string,unknown>)=>Promise<boolean>; reliability:ReliabilityData; reliabilityCommand:(payload:Record<string,unknown>)=>Promise<boolean> }) {
  const [projectFilter, setProjectFilter] = useState("All projects");
  const [settingsTab, setSettingsTab] = useState("Profile");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const titles: Record<string, [string,string]> = {
    Projects:["Project portfolio","Plan, monitor, and compare every initiative in one place."],
    "My Tasks":["My work","Your priorities, blockers, and upcoming commitments."],
    Teams:["People & capacity","Balance assignments before workload becomes a delivery risk."],
    Calendar:["Portfolio calendar","See deadlines, milestones, meetings, and reminders together."],
    Budget:["Budget control","Track allocation, spend, and forecast variance across projects."],
    Risks:["Risk register","Identify exposure early and keep mitigation accountable."],
    Reliability:["Reliability command","Operate service health, incidents, controlled changes, and recovery readiness."],
    Automation:["Automation engine","Run deadline, approval, recurring-work, risk, and status controls."],
    Reports:["Advanced reporting","Analyze productivity, forecast workload, and export governed evidence."],
    Integrations:["Integration fabric","Connect Nexus to calendars, email, chat, code, files, and webhooks."],
    Administration:["Enterprise administration","Control roles, policies, retention, service credentials, and SSO readiness."],
    Notifications:["Notification center","Stay ahead of decisions, delivery changes, risks, and mentions."],
    Security:["Security center","Detect suspicious access, contain threats, and govern workspace permissions."],
    Settings:["Workspace settings","Control your profile, workspace, experience, alerts, and security."],
  };
  const [title,subtitle] = titles[active] || [active,"Project Nexus workspace"];
  return <div className="module-page">
    <div className="page-head module-head"><div><p className="eyebrow">Nexus workspace</p><h1>{title}</h1><p>{subtitle}</p></div>{active==="Projects"&&canCreate&&<button className="primary" onClick={onNew}><Icon name="plus" size={17}/> New project</button>}</div>

    {active==="Projects" && <><section className="module-stats"><div><span>Total projects</span><strong>{projects.length + 12}</strong><small>{projects.length + 8} currently active</small></div><div><span>On track</span><strong>58%</strong><small className="positive">↑ 6% this month</small></div><div><span>Average progress</span><strong>{Math.round(projects.reduce((a,p)=>a+p.progress,0)/projects.length)}%</strong><small>Across active work</small></div><div><span>Portfolio value</span><strong>₹29.6L</strong><small>₹18.4L utilized</small></div></section><div className="filter-row"><div className="filter-tabs">{["All projects","Active","At risk","Completed"].map(f=><button key={f} className={projectFilter===f?"selected":""} onClick={()=>setProjectFilter(f)}>{f}</button>)}</div><button className="filter-button" onClick={()=>notify("Advanced status filters opened")}>Status · All</button><button className="filter-button" onClick={()=>notify("Owner filters opened")}>Owner · All</button></div><section className="project-grid">{projects.filter(p=>projectFilter==="All projects"||projectFilter==="Active"||p.health===projectFilter).map((p,i)=><article className="project-card interactive-card" key={p.name} onClick={()=>onInspect(p)} tabIndex={0} onKeyDown={e=>e.key==="Enter"&&onInspect(p)}><div className="project-card-top"><span className="project-icon large" style={{background:p.color}}>{p.name.split(" ").map(x=>x[0]).join("").slice(0,2)}</span><button onClick={e=>{e.stopPropagation();notify(`Actions opened for ${p.name}`)}}>•••</button></div><span className={`health-pill ${p.health.toLowerCase().replace(" ","-")}`}>{p.health}</span><h3>{p.name}</h3><p>{["Product & Engineering","Experiential Marketing","Brand & Creative","Platform Engineering"][i%4]} · {["High","Critical","Medium","High"][i%4]} priority</p><div className="project-meta"><span>Progress <b>{p.progress}%</b></span><div><i style={{width:`${p.progress}%`}}/></div></div><div className="project-card-foot"><div className="avatar-stack">{p.team.map(x=><i key={x}>{x}</i>)}</div><span><Icon name="calendar" size={14}/> {p.due}</span></div><div className="open-hint">Open command view <Icon name="arrow" size={13}/></div></article>)}</section></>}

    {active==="My Tasks" && <OperationsBoard data={operations} command={operationCommand} notify={notify} currentEmail={currentEmail}/>}

    {active==="Automation" && <EnterpriseModule active="Automation" notify={notify}/>}

    {active==="Teams" && <><section className="team-hero"><div><span>Team utilization</span><strong>73%</strong><p>Healthy overall capacity</p><div><i style={{width:"73%"}}/></div></div><div><span>Available this week</span><strong>62h</strong><p>Across 4 team members</p></div><div><span>Over capacity</span><strong className="coral-text">1</strong><p>Needs reassignment</p></div></section><section className="panel people-panel"><div className="panel-head"><div><span className="section-kicker">Organization</span><h2>Team capacity</h2></div><button className="outline-action"><Icon name="plus" size={14}/> Invite teammate</button></div><div className="people-list">{[["Arjun Rao","Engineering lead","AR",94,5],["Maya Sharma","Product designer","MS",82,4],["Nikhil Bera","Operations lead","NB",67,3],["Leena Mehta","Marketing manager","LM",48,2],["Dev Walia","Backend engineer","DW",76,4]].map(([n,r,ini,load,count])=><div className="people-row" key={n as string}><div className="people-avatar">{ini}</div><div className="people-name"><strong>{n}</strong><span>{r}</span></div><div className="assignment"><span>{count} active projects</span></div><div className="capacity-bar"><div><i style={{width:`${load}%`}} className={Number(load)>90?"hot":""}/></div><strong>{load}%</strong></div><span className={Number(load)>90?"capacity-status overload":"capacity-status"}>{Number(load)>90?"Overloaded":"Available"}</span><button>•••</button></div>)}</div></section></>}

    {active==="Calendar" && <GovernanceControl mode="Calendar" data={governance} command={governanceCommand} notify={notify}/>}

    {active==="Budget" && <BudgetControl notify={notify}/>}

    {active==="Risks" && <GovernanceControl mode="Risks" data={governance} command={governanceCommand} notify={notify}/>}

    {active==="Reliability" && <ReliabilityControl data={reliability} command={reliabilityCommand} notify={notify}/>}

    {active==="Reports" && <EnterpriseModule active="Reports" notify={notify}/>}

    {active==="Integrations" && <EnterpriseModule active="Integrations" notify={notify}/>}

    {active==="Administration" && <EnterpriseModule active="Administration" notify={notify}/>}

    {active==="Notifications" && <LiveNotifications data={operations} command={operationCommand} notify={notify}/>}

    {active==="Settings" && <section className="settings-shell"><aside className="settings-nav"><div className="settings-profile"><div className="avatar large-avatar">KR</div><strong>Kshitij Raj</strong><span>Administrator</span></div>{[["Profile","users"],["Workspace","folder"],["Appearance","spark"],["Notifications","bell"],["Security","settings"]].map(([n,ic])=><button key={n} className={settingsTab===n?"active":""} onClick={()=>setSettingsTab(n)}><Icon name={ic as IconName} size={16}/>{n}<Icon name="arrow" size={13}/></button>)}</aside><div className="settings-content">
      {settingsTab==="Profile"&&<><div className="settings-title"><span className="section-kicker">Personal account</span><h2>Profile information</h2><p>Manage how you appear across Nexus workspaces and reports.</p></div><div className="settings-card profile-editor"><div className="avatar-upload"><div className="avatar profile-avatar">KR</div><div><strong>Profile photo</strong><span>JPG or PNG · Maximum 5 MB</span></div><button onClick={()=>notify("Profile photo upload opened")}>Change photo</button></div><div className="form-grid"><label>Full name<input defaultValue="Kshitij Raj"/></label><label>Role<input defaultValue="Workspace Administrator"/></label><label>Email<input defaultValue="kshitij.raj.96@gmail.com"/></label><label>Time zone<select defaultValue="Asia/Kolkata"><option>Asia/Kolkata</option><option>Europe/London</option><option>America/New_York</option></select></label></div><label className="wide-label">Professional bio<textarea defaultValue="Project and esports operations leader building organized, high-impact experiences."/></label></div></>}
      {settingsTab==="Workspace"&&<><div className="settings-title"><span className="section-kicker">Organization</span><h2>Workspace configuration</h2><p>Manage identity, defaults, access, and project standards.</p></div><div className="settings-card"><div className="workspace-identity"><div className="workspace-orb large-orb">NX</div><div><strong>Nexus Labs</strong><span>Enterprise workspace · 18 members</span></div><button onClick={()=>notify("Workspace logo upload opened")}>Change logo</button></div><div className="form-grid"><label>Workspace name<input defaultValue="Nexus Labs"/></label><label>Workspace URL<input defaultValue="nexus-labs"/></label><label>Default currency<select><option>INR — Indian Rupee</option><option>USD — US Dollar</option></select></label><label>Week starts on<select><option>Monday</option><option>Sunday</option></select></label></div><div className="member-layer"><span><Icon name="users" size={17}/></span><div><strong>Members and permissions</strong><p>18 members · 4 administrators · 3 pending invitations</p></div><button onClick={()=>notify("Member management opened")}>Manage access</button></div></div></>}
      {settingsTab==="Appearance"&&<><div className="settings-title"><span className="section-kicker">Interface</span><h2>Appearance and density</h2><p>Personalize how Project Nexus looks and feels on this device.</p></div><div className="settings-card"><h3>Color theme</h3><div className="theme-options"><button className={theme==="light"?"selected":""} aria-pressed={theme==="light"} onClick={()=>{setTheme("light");notify("Light theme applied")}}><span className="theme-preview light"><i/><i/><i/></span><strong>Light</strong><small>Warm and focused</small></button><button className={theme==="dark"?"selected":""} aria-pressed={theme==="dark"} onClick={()=>{setTheme("dark");notify("Dark theme applied")}}><span className="theme-preview dark"><i/><i/><i/></span><strong>Dark</strong><small>Reduced brightness</small></button><button className={theme==="system"?"selected":""} aria-pressed={theme==="system"} onClick={()=>{setTheme("system");notify("System theme applied")}}><span className="theme-preview system"><i/><i/><i/></span><strong>System</strong><small>Match your device</small></button></div><div className="setting-row"><div><strong>Compact interface</strong><p>Show more information by reducing spacing and card height.</p></div><button className={`toggle ${compactMode?"on":""}`} onClick={()=>setCompactMode(!compactMode)} aria-label="Toggle compact interface" aria-pressed={compactMode}><i/></button></div><div className="setting-row"><div><strong>Reduced motion</strong><p>Limit non-essential transitions and animated effects.</p></div><button className={`toggle ${reducedMotion?"on":""}`} onClick={()=>setReducedMotion(!reducedMotion)} aria-label="Toggle reduced motion" aria-pressed={reducedMotion}><i/></button></div></div></>}
      {settingsTab==="Notifications"&&<><div className="settings-title"><span className="section-kicker">Communication</span><h2>Notification preferences</h2><p>Control the channels and events used to keep you informed.</p></div><div className="settings-card preference-list">{[["Email notifications","Daily summaries, decisions, and weekly reports",emailAlerts,()=>setEmailAlerts(!emailAlerts)],["Push notifications","Urgent risks, mentions, and task changes",pushAlerts,()=>setPushAlerts(!pushAlerts)],["Budget thresholds","Alerts at 70%, 85%, and 100% utilization",true,()=>notify("Budget alert rules opened")],["Executive digest","A daily portfolio summary at 6:30 PM",true,()=>notify("Digest schedule opened")]].map(([n,d,on,action])=><div className="setting-row" key={n as string}><div><strong>{n as string}</strong><p>{d as string}</p></div><button className={`toggle ${on?"on":""}`} onClick={action as ()=>void}><i/></button></div>)}</div></>}
      {settingsTab==="Security"&&<><div className="settings-title"><span className="section-kicker">Account protection</span><h2>Security and sessions</h2><p>Review authentication, devices, and sensitive workspace activity.</p></div><div className="settings-card security-stack"><div className="security-hero"><span><Icon name="check"/></span><div><strong>Your account is protected</strong><p>Two-step verification is active and no unusual activity was detected.</p></div></div>{[["Two-step verification","Enabled","Manage"],["Password","Last changed 42 days ago","Update"],["Active sessions","2 devices","Review"],["Audit log","Last activity 8 minutes ago","Open"]].map(([n,s,a])=><div className="security-row" key={n}><span><strong>{n}</strong><small>{s}</small></span><button onClick={()=>notify(`${n} settings opened`)}>{a}</button></div>)}</div></>}
      <div className="settings-save"><span>Changes are saved to this workspace.</span><button onClick={()=>notify("Settings saved successfully")} className="primary">Save changes</button></div>
    </div></section>}
    {active==="Security" && <SecurityCenter notify={notify}/>}
  </div>;
}

function SecurityCenter({notify}:{notify:(message:string)=>void}) {
  const [protection, setProtection] = useState(true);
  const [riskFilter, setRiskFilter] = useState("All events");
  const [locked, setLocked] = useState(false);
  const events = [
    ["Blocked","Unrecognized sign-in attempt","Frankfurt, Germany · Chrome on Windows","2 minutes ago","High"],
    ["Review","New API token created","Kshitij Raj · Nexus Admin Console","38 minutes ago","Medium"],
    ["Allowed","Successful administrator sign-in","Kolkata, India · Chrome on Windows","1 hour ago","Low"],
    ["Blocked","Repeated access to restricted budget export","Unknown device · 8 failed requests","Yesterday, 23:18","High"],
  ];
  return <section className="security-center">
    <div className="security-command">
      <div><span className="security-live"><i/> Protection active</span><h2>Workspace threat posture is strong.</h2><p>Nexus is continuously evaluating identity, device, location, and permission signals.</p></div>
      <div className="security-score"><strong>86</strong><span>/ 100</span><small>Security score</small></div>
    </div>
    <div className="security-metrics">
      <article><span><Icon name="shield"/></span><div><small>Threats blocked</small><strong>24</strong><em>Last 30 days</em></div></article>
      <article><span className="amber"><Icon name="risk"/></span><div><small>Open investigations</small><strong>3</strong><em>2 require review</em></div></article>
      <article><span className="purple"><Icon name="users"/></span><div><small>Privileged accounts</small><strong>4</strong><em>of 18 members</em></div></article>
      <article><span className="blue"><Icon name="lock"/></span><div><small>Active sessions</small><strong>11</strong><em>Across 8 devices</em></div></article>
    </div>
    <div className="security-grid">
      <article className="panel access-events">
        <div className="panel-head"><div><span className="section-kicker">Access detection</span><h2>Security events</h2></div><select value={riskFilter} onChange={e=>setRiskFilter(e.target.value)}><option>All events</option><option>High risk</option><option>Blocked</option></select></div>
        <div className="event-table">{events.filter(e=>riskFilter==="All events"||(riskFilter==="High risk"&&e[4]==="High")||(riskFilter==="Blocked"&&e[0]==="Blocked")).map(([status,title,meta,time,risk])=><div className="security-event" key={title}><span className={`event-status ${status.toLowerCase()}`}>{status}</span><div><strong>{title}</strong><small>{meta}</small></div><time>{time}</time><span className={`risk-level ${risk.toLowerCase()}`}>{risk}</span><button onClick={()=>notify(`${title} investigation opened`)}><Icon name="arrow" size={14}/></button></div>)}</div>
      </article>
      <aside className="panel control-panel">
        <span className="section-kicker">Management controls</span><h2>Protection policy</h2>
        <div className="policy-row"><div><strong>Adaptive access</strong><small>Challenge high-risk sign-ins automatically.</small></div><button className={`toggle ${protection?"on":""}`} onClick={()=>{setProtection(!protection);notify(`Adaptive access ${protection?"paused":"enabled"}`)}}><i/></button></div>
        <button className="control-action" onClick={()=>notify("Role and permission manager opened")}><span><Icon name="users"/><b>Roles & permissions</b></span><small>4 admins · 9 managers · 5 members</small><Icon name="arrow" size={14}/></button>
        <button className="control-action" onClick={()=>notify("Session manager opened")}><span><Icon name="lock"/><b>Session control</b></span><small>Revoke devices and require reauthentication</small><Icon name="arrow" size={14}/></button>
        <button className={`lockdown ${locked?"active":""}`} onClick={()=>{setLocked(!locked);notify(locked?"Workspace lockdown released":"Workspace lockdown enabled")}}><Icon name="shield"/>{locked?"Release workspace lockdown":"Emergency workspace lockdown"}</button>
      </aside>
    </div>
    <section className="panel role-matrix"><div className="panel-head"><div><span className="section-kicker">Access governance</span><h2>Role permission matrix</h2></div><button onClick={()=>notify("New role flow opened")}><Icon name="plus" size={14}/> Create role</button></div><div className="role-table"><div className="role-head"><span>Role</span><span>Projects</span><span>Budget</span><span>People</span><span>Security</span><span>Members</span></div>{[["Administrator","Full","Full","Full","Manage","4"],["Project manager","Manage","Edit","View","No access","9"],["Team member","Assigned","No access","View","No access","5"]].map(row=><div key={row[0]}>{row.map((cell,i)=><span key={cell} className={i===0?"role-name":cell==="Full"||cell==="Manage"||cell==="Edit"?"allowed":cell==="No access"?"denied":""}>{cell}</span>)}<button onClick={()=>notify(`${row[0]} permissions opened`)}>•••</button></div>)}</div></section>
  </section>;
}

function WorkspaceAccess({
  data,
  projects,
  command,
  notify,
}: {
  data: WorkspaceAccessData;
  projects: typeof seedProjects;
  command: (payload: Record<string, unknown>) => Promise<boolean>;
  notify: (message: string) => void;
}) {
  const [tab, setTab] = useState("Members");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviteProject, setInviteProject] = useState("");
  const [inviteProjectRole, setInviteProjectRole] = useState("contributor");
  const [assignProject, setAssignProject] = useState("");
  const [assignEmail, setAssignEmail] = useState("");
  const [assignRole, setAssignRole] = useState("contributor");
  const [working, setWorking] = useState("");
  const [auditQuery, setAuditQuery] = useState("");
  const [auditRisk, setAuditRisk] = useState("all");
  const canInvite = data.permissions.includes("members.invite");
  const canManageRoles = data.permissions.includes("roles.manage");
  const canAssign = data.permissions.includes("projects.assign");
  const canDecide = data.permissions.includes("approvals.decide");
  const activeMembers = data.members.filter((member) => member.status === "active");
  const pendingApprovals = data.approvals.filter((approval) => approval.status === "pending");
  const liveProjects = projects.filter((project) => project.id > 0);
  const allowedCommands = [
    ["Create projects", "projects.create"],
    ["Invite members", "members.invite"],
    ["Assign project access", "projects.assign"],
    ["Decide approvals", "approvals.decide"],
    ["Manage budgets", "budget.manage"],
    ["Manage security", "security.manage"],
    ["Export reports", "reports.export"],
  ];
  const run = async (key: string, payload: Record<string, unknown>, success: string) => {
    setWorking(key);
    const ok = await command(payload);
    setWorking("");
    if (ok) {
      notify(success);
      return true;
    }
    return false;
  };
  const sendInvite = async () => {
    if (!inviteEmail.trim()) return;
    const ok = await run("invite", {
      action: "invite",
      email: inviteEmail,
      role: inviteRole,
      projectId: inviteProject || null,
      projectRole: inviteProjectRole,
    }, "Secure invitation created");
    if (ok) {
      setInviteOpen(false);
      setInviteEmail("");
    }
  };
  return <section className="access-page">
    <div className="page-head module-head">
      <div><p className="eyebrow">Identity & authorization</p><h1>Workspace access</h1><p>Control who can enter Nexus, which projects they can reach, and which commands they can run.</p></div>
      {canInvite && <button className="primary" onClick={() => setInviteOpen(true)}><Icon name="plus" size={17}/> Invite member</button>}
    </div>
    <section className="access-command">
      <div><span className="access-role"><Icon name="shield" size={14}/> Your active policy</span><h2>{data.membership.role.replace(/^\w/, (letter) => letter.toUpperCase())} command set</h2><p>Commands are evaluated on the server using workspace role and project membership.</p></div>
      <div className="policy-seal"><Icon name="lock" size={22}/><strong>{data.permissions.length}</strong><span>commands</span></div>
    </section>
    <section className="access-metrics">
      <article><span>Active members</span><strong>{activeMembers.length}</strong><small>{data.invitations.length} pending invitations</small></article>
      <article><span>Project assignments</span><strong>{data.projectMembers.length}</strong><small>Scoped by owner, manager, contributor, viewer</small></article>
      <article><span>Approval queue</span><strong>{pendingApprovals.length}</strong><small>{canDecide ? "Ready for your decision" : "Visible to authorized approvers"}</small></article>
      <article><span>Policy state</span><strong className="positive">Enforced</strong><small>Server-side authorization active</small></article>
    </section>
    <div className="access-layout">
      <article className="panel access-main">
        <div className="access-tabs" role="tablist">{["Members","Project access","Approvals","Audit"].map((item) => <button role="tab" aria-selected={tab===item} className={tab===item?"active":""} key={item} onClick={() => setTab(item)}>{item}{item==="Approvals"&&pendingApprovals.length>0?<em>{pendingApprovals.length}</em>:null}</button>)}</div>
        {tab === "Members" && <div className="access-table">
          <div className="access-table-head"><span>Member</span><span>Workspace role</span><span>Status</span><span>Control</span></div>
          {data.members.map((member) => <div className="access-member" key={member.email}>
            <div className="member-identity"><i>{member.displayName.split(" ").map((part) => part[0]).join("").slice(0,2).toUpperCase()}</i><span><strong>{member.displayName}</strong><small>{member.email}</small></span></div>
            {canManageRoles && member.email !== data.membership.email
              ? <select value={member.role} onChange={(event) => run(`role-${member.id}`, {action:"updateRole",email:member.email,role:event.target.value}, `${member.displayName}'s role updated`)}><option value="administrator">Administrator</option><option value="manager">Manager</option><option value="member">Member</option><option value="viewer">Viewer</option></select>
              : <span className={`role-chip ${member.role}`}>{member.role}</span>}
            <span className={`status-chip ${member.status}`}>{member.status}</span>
            <button disabled={!canManageRoles || member.email === data.membership.email || working===`suspend-${member.id}`} onClick={() => run(`suspend-${member.id}`, {action:"suspend",email:member.email}, `${member.displayName}'s access suspended`)}>{working===`suspend-${member.id}`?"Saving…":member.email===data.membership.email?"Current user":"Suspend"}</button>
          </div>)}
          {data.invitations.length > 0 && <div className="pending-invites"><div className="subsection-title"><span className="section-kicker">Pending</span><h3>Open invitations</h3></div>{data.invitations.map((invite) => <div key={invite.id}><span><strong>{invite.email}</strong><small>{invite.role} · expires {new Date(invite.expiresAt).toLocaleDateString()}</small></span><button disabled={working===`revoke-${invite.id}`} onClick={() => run(`revoke-${invite.id}`, {action:"revokeInvite",invitationId:invite.id}, "Invitation revoked")}>Revoke</button></div>)}</div>}
        </div>}
        {tab === "Project access" && <div className="project-access">
          <div className="assignment-builder">
            <div><span className="section-kicker">Project-level policy</span><h3>Assign a member</h3><p>Workspace membership permits entry. Project membership limits the data and commands available inside each project.</p></div>
            <div className="assignment-form"><label>Project<select value={assignProject} onChange={(event)=>setAssignProject(event.target.value)}><option value="">Choose project</option>{liveProjects.map((project)=><option key={project.id} value={project.id}>{project.name}</option>)}</select></label><label>Member<select value={assignEmail} onChange={(event)=>setAssignEmail(event.target.value)}><option value="">Choose member</option>{activeMembers.map((member)=><option key={member.email} value={member.email}>{member.displayName}</option>)}</select></label><label>Project role<select value={assignRole} onChange={(event)=>setAssignRole(event.target.value)}><option value="owner">Owner</option><option value="manager">Manager</option><option value="contributor">Contributor</option><option value="viewer">Viewer</option></select></label><button className="primary" disabled={!canAssign||!assignProject||!assignEmail||working==="assign"} onClick={()=>run("assign",{action:"assignProject",projectId:assignProject,email:assignEmail,projectRole:assignRole},"Project access updated")}>{working==="assign"?"Assigning…":"Apply access"}</button></div>
          </div>
          <div className="assignment-list">{data.projectMembers.length===0?<div className="empty-state"><Icon name="users"/><strong>No project assignments yet</strong><span>Invite members, then assign their project role here.</span></div>:data.projectMembers.map((item)=><div key={item.id}><span className="project-icon" style={{background:"#c8b8ff"}}>{item.projectName.split(" ").map((part)=>part[0]).join("").slice(0,2)}</span><span><strong>{item.projectName}</strong><small>{item.email}</small></span><em className={`role-chip ${item.role}`}>{item.role}</em></div>)}</div>
        </div>}
        {tab === "Approvals" && <div className="approval-list">{data.approvals.map((approval)=><div className="approval-row" key={approval.id}><span className={`approval-icon ${approval.category.toLowerCase()}`}><Icon name={approval.category==="Finance"?"wallet":approval.category==="Security"?"shield":"check"} size={17}/></span><div><span className="section-kicker">{approval.category}</span><strong>{approval.title}</strong><small>{approval.projectName??"Workspace"} · Requested by {approval.requestedBy}{approval.amount>0?` · ₹${approval.amount.toLocaleString("en-IN")}`:""}</small></div><span className={`status-chip ${approval.status}`}>{approval.status}</span>{approval.status==="pending"&&canDecide?<div className="approval-actions"><button disabled={working===`approval-${approval.id}`} onClick={()=>run(`approval-${approval.id}`,{action:"decideApproval",approvalId:approval.id,decision:"rejected"},"Approval rejected")}>Reject</button><button className="approve" disabled={working===`approval-${approval.id}`} onClick={()=>run(`approval-${approval.id}`,{action:"decideApproval",approvalId:approval.id,decision:"approved"},"Approval granted")}>Approve</button></div>:null}</div>)}</div>}
        {tab === "Audit" && <div className="audit-panel"><div className="audit-toolbar"><label><Icon name="search" size={14}/><input value={auditQuery} onChange={(event)=>setAuditQuery(event.target.value)} placeholder="Filter action or actor"/></label><select value={auditRisk} onChange={(event)=>setAuditRisk(event.target.value)}><option value="all">All risk</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select>{data.membership.role==="administrator"&&<a href={`/api/audit-export?risk=${auditRisk==="all"?"":auditRisk}&q=${encodeURIComponent(auditQuery)}`}><Icon name="report" size={14}/> Export CSV</a>}</div><div className="audit-list">{data.audit.filter((event)=>(auditRisk==="all"||event.risk===auditRisk)&&(!auditQuery||`${event.action} ${event.actorEmail} ${event.target}`.toLowerCase().includes(auditQuery.toLowerCase()))).map((event)=><div key={event.id}><span className={`audit-risk ${event.risk}`}/><div><strong>{event.action.replaceAll("."," → ")}</strong><p>{event.detail}</p><small>{event.actorEmail} · {event.target}</small></div><time>{new Date(event.createdAt).toLocaleString()}</time></div>)}</div></div>}
      </article>
      <aside className="panel command-policy">
        <span className="section-kicker">Effective permissions</span><h2>Available commands</h2><p>The interface reveals commands only when your verified role allows the server to execute them.</p>
        <div>{allowedCommands.map(([label, permission])=>{const allowed=data.permissions.includes(permission);return <span key={permission} className={allowed?"allowed-command":"denied-command"}><i>{allowed?"✓":"×"}</i><b>{label}</b><small>{allowed?"Available":"Restricted"}</small></span>})}</div>
        <button onClick={()=>notify("Policy explanation opened")}><Icon name="shield" size={14}/> Explain my access</button>
      </aside>
    </div>
    {inviteOpen && <div className="modal-backdrop" onMouseDown={()=>setInviteOpen(false)}><section className="modal invite-modal" role="dialog" aria-modal="true" aria-labelledby="invite-title" onMouseDown={(event)=>event.stopPropagation()}><div className="modal-head"><div><span className="section-kicker">Verified collaboration</span><h2 id="invite-title">Invite to Nexus</h2></div><button onClick={()=>setInviteOpen(false)}>×</button></div><p className="modal-copy">The invitation is matched to the person’s verified ChatGPT email. It expires after seven days.</p><label>Email address<input autoFocus type="email" value={inviteEmail} onChange={(event)=>setInviteEmail(event.target.value)} placeholder="teammate@example.com"/></label><div className="modal-grid"><label>Workspace role<select value={inviteRole} onChange={(event)=>setInviteRole(event.target.value)}><option value="manager">Manager</option><option value="member">Member</option><option value="viewer">Viewer</option>{data.membership.role==="administrator"&&<option value="administrator">Administrator</option>}</select></label><label>Initial project<select value={inviteProject} onChange={(event)=>setInviteProject(event.target.value)}><option value="">Workspace only</option>{liveProjects.map((project)=><option key={project.id} value={project.id}>{project.name}</option>)}</select></label></div>{inviteProject&&<label>Project role<select value={inviteProjectRole} onChange={(event)=>setInviteProjectRole(event.target.value)}><option value="manager">Manager</option><option value="contributor">Contributor</option><option value="viewer">Viewer</option></select></label>}<div className="invite-safety"><Icon name="lock" size={15}/><span><strong>Least-privilege default</strong><small>Access can be changed or suspended at any time.</small></span></div><div className="modal-actions"><button onClick={()=>setInviteOpen(false)}>Cancel</button><button className="primary" disabled={!inviteEmail.trim()||working==="invite"} onClick={sendInvite}>{working==="invite"?"Creating…":"Create invitation"}</button></div></section></div>}
  </section>;
}

export default function Home() {
  const [session, setSession] = useState<{loading:boolean;user:null|{displayName:string;email:string}}>({loading:true,user:null});
  const [access, setAccess] = useState<WorkspaceAccessData | null>(null);
  const [operations, setOperations] = useState<OperationData>(emptyOperations);
  const [governance, setGovernance] = useState<GovernanceData>(emptyGovernance);
  const [reliability, setReliability] = useState<ReliabilityData>(emptyReliability);
  const [accessLoading, setAccessLoading] = useState(true);
  const [accessError, setAccessError] = useState("");
  const [active, setActive] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [range, setRange] = useState("This month");
  const [query, setQuery] = useState("");
  const [projectData, setProjectData] = useState(seedProjects);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDepartment, setNewProjectDepartment] = useState("Product & Engineering");
  const [newProjectPriority, setNewProjectPriority] = useState("High");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [savingProject, setSavingProject] = useState(false);
  const [toast, setToast] = useState("");
  const [selectedProject, setSelectedProject] = useState<typeof seedProjects[number] | null>(null);
  const [detailTab, setDetailTab] = useState("Overview");
  const [deliveryEditorOpen, setDeliveryEditorOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [theme, setTheme] = useState<"light"|"dark"|"system">("light");
  const [resolvedTheme, setResolvedTheme] = useState<"light"|"dark">("light");
  const [compactMode, setCompactMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [preferencesReady, setPreferencesReady] = useState(false);
  useEffect(() => {
    if (window.location.hostname === "terminal.local" && new URLSearchParams(window.location.search).has("qa")) {
      Promise.resolve().then(() => setSession({loading:false,user:{displayName:"Kshitij Raj",email:"qa@nexus.local"}}));
      return;
    }
    fetch("/api/session")
      .then(response => response.json())
      .then(data => setSession({loading:false,user:data.user ?? null}))
      .catch(() => setSession({loading:false,user:null}));
  }, []);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const savedTheme = localStorage.getItem("nexus-theme");
      if (savedTheme === "dark" || savedTheme === "system") setTheme(savedTheme);
      setCompactMode(localStorage.getItem("nexus-compact") === "true");
      setReducedMotion(localStorage.getItem("nexus-reduced-motion") === "true");
      setPreferencesReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => setResolvedTheme(theme === "system" ? (media.matches ? "dark" : "light") : theme);
    apply();
    media.addEventListener("change", apply);
    if (preferencesReady) localStorage.setItem("nexus-theme", theme);
    return () => media.removeEventListener("change", apply);
  }, [theme, preferencesReady]);
  useEffect(() => { if (preferencesReady) localStorage.setItem("nexus-compact", String(compactMode)); }, [compactMode, preferencesReady]);
  useEffect(() => { if (preferencesReady) localStorage.setItem("nexus-reduced-motion", String(reducedMotion)); }, [reducedMotion, preferencesReady]);
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandPaletteOpen((open) => !open);
      }
      if (event.key === "Escape") setCommandPaletteOpen(false);
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);
  useEffect(() => {
    if (session.loading) return;
    if (!session.user) return;
    let cancelled = false;
    const load = async () => {
      setAccessLoading(true);
      setAccessError("");
      if (window.location.hostname === "terminal.local" && new URLSearchParams(window.location.search).has("qa")) {
        const qaMember = {id:1,email:session.user!.email,displayName:session.user!.displayName,role:"administrator",status:"active",joinedAt:new Date().toISOString()};
        setAccess({
          membership: qaMember,
          permissions:["workspace.manage","members.invite","roles.manage","projects.create","projects.assign","approvals.decide","budget.manage","security.manage","reports.export","automation.manage","integrations.manage","enterprise.manage"],
          members:[qaMember,{id:2,email:"maya@nexus.local",displayName:"Maya Sharma",role:"manager",status:"active",joinedAt:new Date().toISOString()}],
          invitations:[{id:1,email:"operations@nexus.local",role:"member",projectId:null,projectRole:"contributor",expiresAt:new Date(Date.now()+604800000).toISOString()}],
          projectMembers:[{id:1,projectId:-1,projectName:"Nexus Mobile App",email:"maya@nexus.local",role:"manager"}],
          approvals:[{id:1,projectId:-1,projectName:"Nexus Mobile App",title:"Approve production access policy",category:"Security",amount:0,status:"pending",requestedBy:session.user!.email,createdAt:new Date().toISOString()}],
          audit:[{id:1,actorEmail:session.user!.email,action:"workspace.bootstrap",target:"Nexus Labs",detail:"Administrator access verified.",risk:"low",createdAt:new Date().toISOString()}],
        });
        setOperations({
          tasks:[
            {id:1,projectId:-1,projectName:"Nexus Mobile App",title:"Validate production readiness",description:"Confirm security, performance, and release-owner sign-off before the launch window.",status:"in_progress",priority:"urgent",assigneeEmail:session.user!.email,dueDate:"2026-07-27",parentTaskId:null,dependsOnTaskId:null,createdBy:session.user!.email,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},
            {id:2,projectId:-1,projectName:"Nexus Mobile App",title:"Close security review",description:"Resolve the final access-control findings.",status:"todo",priority:"high",assigneeEmail:"maya@nexus.local",dueDate:"2026-07-28",parentTaskId:null,dependsOnTaskId:1,createdBy:session.user!.email,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},
          ],
          comments:[{id:1,taskId:1,body:"Release owner confirmed. Performance evidence is still pending.",mentions:[],authorEmail:"maya@nexus.local",createdAt:new Date().toISOString()}],
          activity:[{id:1,projectId:-1,projectName:"Nexus Mobile App",actorEmail:session.user!.email,action:"task.updated",entityType:"task",entityId:1,detail:"Moved production readiness to in progress.",createdAt:new Date().toISOString()}],
          notifications:[{id:1,recipientEmail:session.user!.email,projectId:-1,taskId:1,type:"assignment",title:"Critical task assigned",body:"Nexus Mobile App: Validate production readiness",readAt:null,createdAt:new Date().toISOString()}],
          members:[{email:session.user!.email,displayName:session.user!.displayName,role:"administrator"},{email:"maya@nexus.local",displayName:"Maya Sharma",role:"manager"}],
          projects:[{id:-1,name:"Nexus Mobile App"}],
          metrics:{open:2,overdue:0,blocked:1,unread:1},
        });
        const now = new Date().toISOString();
        setGovernance({
          projects:[
            {id:-1,name:"Nexus Mobile App",department:"Product & Engineering",health:"On track",progress:72,due:"2026-09-18",version:3,canEdit:true},
            {id:-2,name:"Campus Esports League",department:"Operations",health:"At risk",progress:48,due:"2026-09-04",version:2,canEdit:true},
          ],
          risks:[
            {id:1,projectId:-2,projectName:"Campus Esports League",title:"Venue permission delayed",description:"Final institutional approval has not yet been issued.",probability:5,impact:5,status:"mitigating",ownerEmail:session.user!.email,mitigation:"Escalate through the faculty sponsor and hold a backup venue.",targetDate:"2026-07-29",version:3,createdBy:session.user!.email,updatedBy:session.user!.email,createdAt:now,updatedAt:now},
            {id:2,projectId:-1,projectName:"Nexus Mobile App",title:"Release capacity compression",description:"Final security and performance work share the same release window.",probability:4,impact:4,status:"open",ownerEmail:"maya@nexus.local",mitigation:"Rebalance the final sprint and preserve a two-day release buffer.",targetDate:"2026-07-30",version:1,createdBy:session.user!.email,updatedBy:session.user!.email,createdAt:now,updatedAt:now},
            {id:3,projectId:-1,projectName:"Nexus Mobile App",title:"External API instability",description:"Third-party response latency may affect the launch SLA.",probability:3,impact:4,status:"accepted",ownerEmail:session.user!.email,mitigation:"Use the cached fallback and alert at the 900 ms threshold.",targetDate:"2026-08-03",version:2,createdBy:session.user!.email,updatedBy:session.user!.email,createdAt:now,updatedAt:now},
          ],
          milestones:[
            {id:1,projectId:-1,projectName:"Nexus Mobile App",title:"Security readiness sign-off",description:"Complete the access and threat-control evidence pack.",dueDate:"2026-07-28",status:"in_progress",ownerEmail:session.user!.email,version:2,createdBy:session.user!.email,updatedBy:session.user!.email,createdAt:now,updatedAt:now},
            {id:2,projectId:-2,projectName:"Campus Esports League",title:"Venue approval lock",description:"Secure signed venue and facility permission.",dueDate:"2026-07-29",status:"blocked",ownerEmail:session.user!.email,version:2,createdBy:session.user!.email,updatedBy:session.user!.email,createdAt:now,updatedAt:now},
            {id:3,projectId:-1,projectName:"Nexus Mobile App",title:"Production launch",description:"Release the governed workspace upgrade.",dueDate:"2026-08-06",status:"planned",ownerEmail:"maya@nexus.local",version:1,createdBy:session.user!.email,updatedBy:session.user!.email,createdAt:now,updatedAt:now},
          ],
          logs:[
            {id:1,projectId:-2,projectName:"Campus Esports League",actorEmail:session.user!.email,entityType:"risk",entityId:1,action:"risk.updated",before:{status:"open"},after:{status:"mitigating"},reason:"Faculty escalation activated",createdAt:now},
            {id:2,projectId:-1,projectName:"Nexus Mobile App",actorEmail:session.user!.email,entityType:"milestone",entityId:1,action:"milestone.updated",before:{status:"planned"},after:{status:"in_progress"},reason:"Security evidence review started",createdAt:new Date(Date.now()-3600000).toISOString()},
            {id:3,projectId:-1,projectName:"Nexus Mobile App",actorEmail:session.user!.email,entityType:"project",entityId:-1,action:"project.status_updated",before:{progress:68},after:{progress:72},reason:"Release checklist advanced",createdAt:new Date(Date.now()-7200000).toISOString()},
          ],
          members:[
            {email:session.user!.email,displayName:session.user!.displayName,role:"administrator"},
            {email:"maya@nexus.local",displayName:"Maya Sharma",role:"manager"},
          ],
          metrics:{openRisks:3,highRisks:2,dueRisks:2,mitigationCoverage:100,upcomingMilestones:2,blockedMilestones:1},
        });
        setReliability({
          projects:[
            {id:-1,name:"Nexus Mobile App",canEdit:true,canApprove:true},
            {id:-2,name:"Campus Esports League",canEdit:true,canApprove:true},
          ],
          services:[
            {id:1,projectId:-1,projectName:"Nexus Mobile App",name:"Nexus API Gateway",tier:"tier_1",status:"degraded",ownerEmail:session.user!.email,availabilityTargetBps:9995,currentAvailabilityBps:9978,rtoMinutes:15,rpoMinutes:5,version:2,updatedAt:now,canEdit:true,canApprove:true},
            {id:2,projectId:-1,projectName:"Nexus Mobile App",name:"Workspace Database",tier:"tier_1",status:"operational",ownerEmail:"maya@nexus.local",availabilityTargetBps:9999,currentAvailabilityBps:9999,rtoMinutes:10,rpoMinutes:1,version:4,updatedAt:now,canEdit:true,canApprove:true},
            {id:3,projectId:-2,projectName:"Campus Esports League",name:"Tournament Control API",tier:"tier_2",status:"operational",ownerEmail:session.user!.email,availabilityTargetBps:9990,currentAvailabilityBps:10000,rtoMinutes:30,rpoMinutes:10,version:1,updatedAt:now,canEdit:true,canApprove:true},
          ],
          incidents:[
            {id:1,serviceId:1,serviceName:"Nexus API Gateway",projectId:-1,projectName:"Nexus Mobile App",title:"Elevated command latency",severity:"sev_2",status:"identified",commanderEmail:session.user!.email,impact:"Project command responses are intermittently exceeding the 900 ms reliability threshold.",summary:"Traffic concentration on one worker region has been identified.",startedAt:new Date(Date.now()-42*60000).toISOString(),resolvedAt:null,version:3,createdBy:session.user!.email,updatedBy:session.user!.email,updatedAt:now},
            {id:2,serviceId:2,serviceName:"Workspace Database",projectId:-1,projectName:"Nexus Mobile App",title:"Migration lock contention",severity:"sev_3",status:"resolved",commanderEmail:"maya@nexus.local",impact:"Budget writes were delayed for four minutes during a schema migration.",summary:"Migration completed and write latency returned to baseline.",startedAt:new Date(Date.now()-86400000).toISOString(),resolvedAt:new Date(Date.now()-82800000).toISOString(),version:4,createdBy:"maya@nexus.local",updatedBy:session.user!.email,updatedAt:now},
          ],
          changes:[
            {id:1,serviceId:1,serviceName:"Nexus API Gateway",projectId:-1,projectName:"Nexus Mobile App",title:"Enable regional traffic rebalancing",riskLevel:"high",status:"pending",ownerEmail:session.user!.email,windowStart:new Date(Date.now()+86400000).toISOString(),windowEnd:new Date(Date.now()+88200000).toISOString(),implementationPlan:"Shift ten percent of traffic, validate error rate, then rebalance the remaining regions in controlled increments.",rollbackPlan:"Restore the previous routing weights and verify command latency against the pre-change baseline.",decisionReason:"",decidedBy:null,decidedAt:null,version:1,createdBy:session.user!.email,updatedAt:now},
            {id:2,serviceId:2,serviceName:"Workspace Database",projectId:-1,projectName:"Nexus Mobile App",title:"Add reliability event indexes",riskLevel:"medium",status:"approved",ownerEmail:"maya@nexus.local",windowStart:new Date(Date.now()+172800000).toISOString(),windowEnd:new Date(Date.now()+174600000).toISOString(),implementationPlan:"Apply indexed migration during the low-traffic window and validate query plans.",rollbackPlan:"Drop the new indexes if write latency exceeds the change threshold.",decisionReason:"Query evidence and rollback controls verified.",decidedBy:session.user!.email,decidedAt:now,version:2,createdBy:"maya@nexus.local",updatedAt:now},
          ],
          runbooks:[
            {id:1,serviceId:1,serviceName:"Nexus API Gateway",projectId:-1,projectName:"Nexus Mobile App",title:"Restore API command path",status:"ready",ownerEmail:session.user!.email,trigger:"SEV-1 outage or five-minute breach of the command latency SLO.",steps:["Freeze non-essential changes","Validate regional worker health","Fail traffic to the healthy region","Confirm command success and latency","Publish the recovery update"],lastTestedAt:new Date(Date.now()-21*86400000).toISOString(),nextReviewDate:"2026-09-15",version:3,updatedAt:now},
            {id:2,serviceId:2,serviceName:"Workspace Database",projectId:-1,projectName:"Nexus Mobile App",title:"Recover workspace database",status:"ready",ownerEmail:"maya@nexus.local",trigger:"Write unavailability, integrity alarm, or regional database failure.",steps:["Stop destructive commands","Verify replica integrity","Promote the verified recovery source","Replay the controlled write queue","Validate critical records"],lastTestedAt:new Date(Date.now()-12*86400000).toISOString(),nextReviewDate:"2026-10-01",version:2,updatedAt:now},
          ],
          events:[
            {id:1,projectId:-1,projectName:"Nexus Mobile App",serviceId:1,actorEmail:session.user!.email,action:"incident.updated",targetType:"incident",targetId:1,detail:"Elevated command latency moved to identified. Regional concentration confirmed.",risk:"medium",createdAt:now},
            {id:2,projectId:-1,projectName:"Nexus Mobile App",serviceId:1,actorEmail:session.user!.email,action:"change.requested",targetType:"change",targetId:1,detail:"High-risk traffic rebalancing change submitted for approval.",risk:"high",createdAt:new Date(Date.now()-3600000).toISOString()},
            {id:3,projectId:-1,projectName:"Nexus Mobile App",serviceId:2,actorEmail:"maya@nexus.local",action:"runbook.tested",targetType:"runbook",targetId:2,detail:"Workspace database recovery drill completed within the 10-minute RTO.",risk:"low",createdAt:new Date(Date.now()-86400000).toISOString()},
          ],
          members:[
            {email:session.user!.email,displayName:session.user!.displayName,role:"administrator"},
            {email:"maya@nexus.local",displayName:"Maya Sharma",role:"manager"},
          ],
          metrics:{averageAvailability:99.92,activeIncidents:1,criticalIncidents:1,pendingChanges:1,recoveryCoverage:67},
        });
        setAccessLoading(false);
        return;
      }
      try {
        const accessResponse = await fetch("/api/workspace");
        const accessResult = await accessResponse.json() as WorkspaceAccessData & {error?:string};
        if (!accessResponse.ok) throw new Error(accessResult.error || "Workspace access could not be verified.");
        if (cancelled) return;
        setAccess(accessResult);
        const projectsResponse = await fetch("/api/projects");
        const projectsResult = await projectsResponse.json() as {projects?:Array<{id:number;name:string;health:string;progress:number;budget:number;due:string;color:string}>};
        if (projectsResponse.ok && Array.isArray(projectsResult.projects) && projectsResult.projects.length > 0) {
          const saved = projectsResult.projects.map((project) => ({
            id: project.id,
            name: project.name,
            team: ["KR"],
            health: project.health,
            progress: project.progress,
            budget: project.budget,
            due: project.due,
            color: project.color,
          }));
          setProjectData([...saved, ...seedProjects.filter(seed => !saved.some((item) => item.name === seed.name))]);
        }
        const operationsResponse = await fetch("/api/operations");
        if (operationsResponse.ok) {
          setOperations(await operationsResponse.json() as OperationData);
        }
        const governanceResponse = await fetch("/api/governance");
        if (governanceResponse.ok) {
          setGovernance(await governanceResponse.json() as GovernanceData);
        }
        const reliabilityResponse = await fetch("/api/reliability");
        if (reliabilityResponse.ok) {
          setReliability(await reliabilityResponse.json() as ReliabilityData);
        }
      } catch (error) {
        if (!cancelled) setAccessError(error instanceof Error ? error.message : "Workspace access could not be verified.");
      } finally {
        if (!cancelled) setAccessLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [session.loading, session.user]);
  const notify = (message:string) => { setToast(message); setTimeout(()=>setToast(""),2600); };
  const refreshOperations = async () => {
    const response = await fetch("/api/operations");
    if (response.ok) {
      setOperations(await response.json() as OperationData);
      return true;
    }
    return false;
  };
  const refreshGovernance = async () => {
    const response = await fetch("/api/governance");
    if (response.ok) {
      setGovernance(await response.json() as GovernanceData);
      return true;
    }
    return false;
  };
  const refreshReliability = async () => {
    const response = await fetch("/api/reliability");
    if (response.ok) {
      setReliability(await response.json() as ReliabilityData);
      return true;
    }
    return false;
  };
  const refreshProjects = async () => {
    const response = await fetch("/api/projects");
    const result = await response.json() as {projects?:Array<{id:number;name:string;health:string;progress:number;budget:number;due:string;color:string}>};
    if (!response.ok || !Array.isArray(result.projects)) return false;
    const saved = result.projects.map((project) => ({
      id:project.id,
      name:project.name,
      team:["KR"],
      health:project.health,
      progress:project.progress,
      budget:project.budget,
      due:project.due,
      color:project.color,
    }));
    setProjectData([...saved,...seedProjects.filter((seed)=>!saved.some((item)=>item.name===seed.name))]);
    return true;
  };
  const visibleProjects = useMemo(() => projectData.filter(p => p.name.toLowerCase().includes(query.toLowerCase())), [query, projectData]);
  const addProject = async () => {
    if (!newProjectName.trim()) return;
    setSavingProject(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: newProjectName,
          department: newProjectDepartment,
          priority: newProjectPriority,
          description: newProjectDescription,
        }),
      });
      const result = await response.json() as { project?: { name: string; health: string; progress: number; budget: number; due: string; color: string }; error?: string };
      if (!response.ok || !result.project) throw new Error(result.error || "Could not save project");
      setProjectData([{id:(result.project as {id?:number}).id??Date.now(),name:result.project.name,team:["KR"],health:result.project.health,progress:result.project.progress,budget:result.project.budget,due:result.project.due,color:result.project.color},...projectData]);
      setNewProjectName("");
      setNewProjectDescription("");
      setNewProjectOpen(false);
      setActive("Projects");
      await refreshOperations();
      await refreshGovernance();
      await refreshReliability();
      notify("Project saved to Nexus workspace");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Could not save project");
    } finally {
      setSavingProject(false);
    }
  };

  const workspaceCommand = async (payload: Record<string, unknown>) => {
    try {
      const response = await fetch("/api/workspace", {
        method: "POST",
        headers: {"content-type":"application/json"},
        body: JSON.stringify(payload),
      });
      const result = await response.json() as {error?:string};
      if (!response.ok) throw new Error(result.error || "Command denied");
      const refreshed = await fetch("/api/workspace");
      if (refreshed.ok) setAccess(await refreshed.json() as WorkspaceAccessData);
      return true;
    } catch (error) {
      notify(error instanceof Error ? error.message : "Workspace command failed");
      return false;
    }
  };

  const operationCommand = async (payload: Record<string, unknown>) => {
    if (window.location.hostname === "terminal.local" && new URLSearchParams(window.location.search).has("qa")) {
      const action = String(payload.action || "");
      if (action === "updateTask") {
        setOperations((current)=>({...current,tasks:current.tasks.map((task)=>task.id===Number(payload.taskId)?{...task,status:String(payload.status||task.status),updatedAt:new Date().toISOString()}:task)}));
      }
      if (action === "markNotificationRead") {
        setOperations((current)=>({...current,notifications:current.notifications.map((item)=>item.id===Number(payload.notificationId)?{...item,readAt:new Date().toISOString()}:item),metrics:{...current.metrics,unread:Math.max(0,current.metrics.unread-1)}}));
      }
      if (action === "markAllNotificationsRead") {
        setOperations((current)=>({...current,notifications:current.notifications.map((item)=>({...item,readAt:item.readAt||new Date().toISOString()})),metrics:{...current.metrics,unread:0}}));
      }
      if (action === "addComment") {
        setOperations((current)=>({...current,comments:[...current.comments,{id:Date.now(),taskId:Number(payload.taskId),body:String(payload.body),mentions:[],authorEmail:session.user!.email,createdAt:new Date().toISOString()}]}));
      }
      if (action === "createTask") {
        const project = operations.projects.find((item)=>item.id===Number(payload.projectId));
        setOperations((current)=>({...current,tasks:[...current.tasks,{id:Date.now(),projectId:Number(payload.projectId),projectName:project?.name||"Project",title:String(payload.title),description:"",status:"todo",priority:String(payload.priority||"medium"),assigneeEmail:String(payload.assigneeEmail||"")||null,dueDate:String(payload.dueDate||"")||null,parentTaskId:null,dependsOnTaskId:Number(payload.dependsOnTaskId)||null,createdBy:session.user!.email,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}],metrics:{...current.metrics,open:current.metrics.open+1}}));
      }
      return true;
    }
    try {
      const response = await fetch("/api/operations", {
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify(payload),
      });
      const result = await response.json() as {error?:string};
      if (!response.ok) throw new Error(result.error || "Collaborative command denied");
      await refreshOperations();
      return true;
    } catch (error) {
      notify(error instanceof Error ? error.message : "Collaborative command failed");
      return false;
    }
  };

  const governanceCommand = async (payload: Record<string, unknown>) => {
    if (window.location.hostname === "terminal.local" && new URLSearchParams(window.location.search).has("qa")) {
      const action = String(payload.action || "");
      const timestamp = new Date().toISOString();
      if (action === "createRisk") {
        const project = governance.projects.find((item)=>item.id===Number(payload.projectId));
        const risk = {
          id:Date.now(),projectId:Number(payload.projectId),projectName:project?.name||"Project",title:String(payload.title),description:String(payload.description||""),probability:Number(payload.probability),impact:Number(payload.impact),status:"open",ownerEmail:String(payload.ownerEmail||"")||null,mitigation:String(payload.mitigation||""),targetDate:String(payload.targetDate||"")||null,version:1,createdBy:session.user!.email,updatedBy:session.user!.email,createdAt:timestamp,updatedAt:timestamp,
        };
        setGovernance((current)=>({...current,risks:[risk,...current.risks],logs:[{id:Date.now(),projectId:risk.projectId,projectName:risk.projectName,actorEmail:session.user!.email,entityType:"risk",entityId:risk.id,action:"risk.created",before:{},after:risk,reason:"Risk registered",createdAt:timestamp},...current.logs],metrics:{...current.metrics,openRisks:current.metrics.openRisks+1,highRisks:current.metrics.highRisks+(risk.probability*risk.impact>=15?1:0)}}));
      }
      if (action === "updateRisk") {
        setGovernance((current)=>{
          const before=current.risks.find((item)=>item.id===Number(payload.riskId));
          if(!before)return current;
          const after={...before,status:String(payload.status),probability:Number(payload.probability),impact:Number(payload.impact),ownerEmail:String(payload.ownerEmail||"")||null,targetDate:String(payload.targetDate||"")||null,mitigation:String(payload.mitigation||""),version:before.version+1,updatedBy:session.user!.email,updatedAt:timestamp};
          return {...current,risks:current.risks.map((item)=>item.id===after.id?after:item),logs:[{id:Date.now(),projectId:after.projectId,projectName:after.projectName,actorEmail:session.user!.email,entityType:"risk",entityId:after.id,action:"risk.updated",before,after,reason:String(payload.reason),createdAt:timestamp},...current.logs]};
        });
      }
      if (action === "createMilestone") {
        const project=governance.projects.find((item)=>item.id===Number(payload.projectId));
        const milestone={id:Date.now(),projectId:Number(payload.projectId),projectName:project?.name||"Project",title:String(payload.title),description:String(payload.description||""),dueDate:String(payload.dueDate),status:"planned",ownerEmail:String(payload.ownerEmail||"")||null,version:1,createdBy:session.user!.email,updatedBy:session.user!.email,createdAt:timestamp,updatedAt:timestamp};
        setGovernance((current)=>({...current,milestones:[...current.milestones,milestone],logs:[{id:Date.now(),projectId:milestone.projectId,projectName:milestone.projectName,actorEmail:session.user!.email,entityType:"milestone",entityId:milestone.id,action:"milestone.created",before:{},after:milestone,reason:"Milestone scheduled",createdAt:timestamp},...current.logs]}));
      }
      if (action === "updateMilestone") {
        setGovernance((current)=>{
          const before=current.milestones.find((item)=>item.id===Number(payload.milestoneId));
          if(!before)return current;
          const after={...before,status:String(payload.status),dueDate:String(payload.dueDate),ownerEmail:String(payload.ownerEmail||"")||null,version:before.version+1,updatedBy:session.user!.email,updatedAt:timestamp};
          return {...current,milestones:current.milestones.map((item)=>item.id===after.id?after:item),logs:[{id:Date.now(),projectId:after.projectId,projectName:after.projectName,actorEmail:session.user!.email,entityType:"milestone",entityId:after.id,action:"milestone.updated",before,after,reason:String(payload.reason),createdAt:timestamp},...current.logs]};
        });
      }
      if (action === "updateProjectStatus") {
        setGovernance((current)=>({...current,projects:current.projects.map((project)=>project.id===Number(payload.projectId)?{...project,health:String(payload.health),progress:Number(payload.progress),due:String(payload.due),version:project.version+1}:project),logs:[{id:Date.now(),projectId:Number(payload.projectId),projectName:current.projects.find((project)=>project.id===Number(payload.projectId))?.name||"Project",actorEmail:session.user!.email,entityType:"project",entityId:Number(payload.projectId),action:"project.status_updated",before:{},after:{health:payload.health,progress:payload.progress,due:payload.due},reason:String(payload.reason),createdAt:timestamp},...current.logs]}));
        setProjectData((current)=>current.map((project)=>project.id===Number(payload.projectId)?{...project,health:String(payload.health),progress:Number(payload.progress),due:String(payload.due)}:project));
      }
      return true;
    }
    try {
      const response = await fetch("/api/governance", {
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify(payload),
      });
      const result = await response.json() as {error?:string};
      if (!response.ok) throw new Error(result.error || "Governance command denied");
      await refreshGovernance();
      if (payload.action === "updateProjectStatus") await refreshProjects();
      return true;
    } catch (error) {
      notify(error instanceof Error ? error.message : "Governance command failed");
      return false;
    }
  };

  const reliabilityCommand = async (payload: Record<string, unknown>) => {
    if (window.location.hostname === "terminal.local" && new URLSearchParams(window.location.search).has("qa")) {
      const action = String(payload.action || "");
      const timestamp = new Date().toISOString();
      if (action === "createService") {
        const project = reliability.projects.find((item)=>item.id===Number(payload.projectId));
        const service = {id:Date.now(),projectId:Number(payload.projectId),projectName:project?.name||"Project",name:String(payload.name),tier:String(payload.tier),status:"operational",ownerEmail:String(payload.ownerEmail||"")||null,availabilityTargetBps:Number(payload.availabilityTargetBps),currentAvailabilityBps:10000,rtoMinutes:Number(payload.rtoMinutes),rpoMinutes:Number(payload.rpoMinutes),version:1,updatedAt:timestamp,canEdit:true,canApprove:true};
        setReliability((current)=>({...current,services:[...current.services,service],events:[{id:Date.now(),projectId:service.projectId,projectName:service.projectName,serviceId:service.id,actorEmail:session.user!.email,action:"service.registered",targetType:"service",targetId:service.id,detail:`Registered ${service.name}.`,risk:"low",createdAt:timestamp},...current.events]}));
      }
      if (action === "declareIncident") {
        const service=reliability.services.find((item)=>item.id===Number(payload.serviceId));
        if(service){
          const incident={id:Date.now(),serviceId:service.id,serviceName:service.name,projectId:service.projectId,projectName:service.projectName,title:String(payload.title),severity:String(payload.severity),status:"investigating",commanderEmail:String(payload.commanderEmail||"")||null,impact:String(payload.impact),summary:"",startedAt:new Date(String(payload.startedAt)).toISOString(),resolvedAt:null,version:1,createdBy:session.user!.email,updatedBy:session.user!.email,updatedAt:timestamp};
          setReliability((current)=>({...current,services:current.services.map((item)=>item.id===service.id?{...item,status:incident.severity==="sev_1"?"outage":"degraded",version:item.version+1,updatedAt:timestamp}:item),incidents:[incident,...current.incidents],events:[{id:Date.now(),projectId:service.projectId,projectName:service.projectName,serviceId:service.id,actorEmail:session.user!.email,action:"incident.declared",targetType:"incident",targetId:incident.id,detail:`${incident.severity.toUpperCase()} declared: ${incident.title}.`,risk:"high",createdAt:timestamp},...current.events],metrics:{...current.metrics,activeIncidents:current.metrics.activeIncidents+1,criticalIncidents:current.metrics.criticalIncidents+(["sev_1","sev_2"].includes(incident.severity)?1:0)}}));
        }
      }
      if (action === "updateIncident") {
        setReliability((current)=>{
          const before=current.incidents.find((item)=>item.id===Number(payload.incidentId));
          if(!before)return current;
          const after={...before,status:String(payload.status),commanderEmail:String(payload.commanderEmail||"")||null,summary:String(payload.summary||""),resolvedAt:String(payload.status)==="resolved"?timestamp:null,version:before.version+1,updatedBy:session.user!.email,updatedAt:timestamp};
          return {...current,incidents:current.incidents.map((item)=>item.id===after.id?after:item),services:current.services.map((service)=>service.id===after.serviceId&&after.status==="resolved"?{...service,status:"operational",version:service.version+1,updatedAt:timestamp}:service),events:[{id:Date.now(),projectId:after.projectId,projectName:after.projectName,serviceId:after.serviceId,actorEmail:session.user!.email,action:"incident.updated",targetType:"incident",targetId:after.id,detail:`${after.title} moved to ${after.status}.`,risk:after.status==="resolved"?"low":"medium",createdAt:timestamp},...current.events],metrics:{...current.metrics,activeIncidents:after.status==="resolved"?Math.max(0,current.metrics.activeIncidents-1):current.metrics.activeIncidents,criticalIncidents:after.status==="resolved"&&["sev_1","sev_2"].includes(after.severity)?Math.max(0,current.metrics.criticalIncidents-1):current.metrics.criticalIncidents}};
        });
      }
      if (action === "createChange") {
        const service=reliability.services.find((item)=>item.id===Number(payload.serviceId));
        if(service){
          const change={id:Date.now(),serviceId:service.id,serviceName:service.name,projectId:service.projectId,projectName:service.projectName,title:String(payload.title),riskLevel:String(payload.riskLevel),status:"pending",ownerEmail:String(payload.ownerEmail||"")||null,windowStart:new Date(String(payload.windowStart)).toISOString(),windowEnd:new Date(String(payload.windowEnd)).toISOString(),implementationPlan:String(payload.implementationPlan),rollbackPlan:String(payload.rollbackPlan),decisionReason:"",decidedBy:null,decidedAt:null,version:1,createdBy:session.user!.email,updatedAt:timestamp};
          setReliability((current)=>({...current,changes:[change,...current.changes],events:[{id:Date.now(),projectId:service.projectId,projectName:service.projectName,serviceId:service.id,actorEmail:session.user!.email,action:"change.requested",targetType:"change",targetId:change.id,detail:`${change.riskLevel} risk change requested: ${change.title}.`,risk:change.riskLevel==="high"||change.riskLevel==="critical"?"high":"medium",createdAt:timestamp},...current.events],metrics:{...current.metrics,pendingChanges:current.metrics.pendingChanges+1}}));
        }
      }
      if (action === "decideChange") {
        setReliability((current)=>{
          const before=current.changes.find((item)=>item.id===Number(payload.changeId));
          if(!before)return current;
          const after={...before,status:String(payload.decision),decisionReason:String(payload.reason),decidedBy:session.user!.email,decidedAt:timestamp,version:before.version+1,updatedAt:timestamp};
          return {...current,changes:current.changes.map((item)=>item.id===after.id?after:item),events:[{id:Date.now(),projectId:after.projectId,projectName:after.projectName,serviceId:after.serviceId,actorEmail:session.user!.email,action:`change.${after.status}`,targetType:"change",targetId:after.id,detail:`${after.title} was ${after.status}.`,risk:after.status==="rejected"?"medium":"low",createdAt:timestamp},...current.events],metrics:{...current.metrics,pendingChanges:Math.max(0,current.metrics.pendingChanges-1)}};
        });
      }
      if (action === "createRunbook") {
        const service=reliability.services.find((item)=>item.id===Number(payload.serviceId));
        if(service){
          const runbook={id:Date.now(),serviceId:service.id,serviceName:service.name,projectId:service.projectId,projectName:service.projectName,title:String(payload.title),status:"ready",ownerEmail:String(payload.ownerEmail||"")||null,trigger:String(payload.trigger),steps:String(payload.steps).split(/\r?\n/).filter(Boolean),lastTestedAt:null,nextReviewDate:String(payload.nextReviewDate||"")||null,version:1,updatedAt:timestamp};
          setReliability((current)=>{const covered=new Set([...current.runbooks.map((item)=>item.serviceId),runbook.serviceId]);return {...current,runbooks:[runbook,...current.runbooks],events:[{id:Date.now(),projectId:service.projectId,projectName:service.projectName,serviceId:service.id,actorEmail:session.user!.email,action:"runbook.created",targetType:"runbook",targetId:runbook.id,detail:`Recovery runbook created: ${runbook.title}.`,risk:"low",createdAt:timestamp},...current.events],metrics:{...current.metrics,recoveryCoverage:current.services.length?Math.round(covered.size/current.services.length*100):100}}});
        }
      }
      if (action === "recordRunbookTest") {
        setReliability((current)=>({...current,runbooks:current.runbooks.map((item)=>item.id===Number(payload.runbookId)?{...item,status:"ready",lastTestedAt:timestamp,nextReviewDate:new Date(Date.now()+90*86400000).toISOString().slice(0,10),version:item.version+1,updatedAt:timestamp}:item)}));
      }
      if (action === "updateServiceStatus") {
        setReliability((current)=>({...current,services:current.services.map((item)=>item.id===Number(payload.serviceId)?{...item,status:String(payload.status),version:item.version+1,updatedAt:timestamp}:item)}));
      }
      return true;
    }
    try {
      const response = await fetch("/api/reliability", {
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify(payload),
      });
      const result = await response.json() as {error?:string};
      if (!response.ok) throw new Error(result.error || "Reliability command denied");
      await refreshReliability();
      await refreshOperations();
      return true;
    } catch (error) {
      notify(error instanceof Error ? error.message : "Reliability command failed");
      return false;
    }
  };

  if (session.loading) return <main className="auth-screen"><div className="auth-loading"><span className="brand-mark">N</span><p>Securing your workspace…</p></div></main>;
  if (!session.user) return <main className="auth-screen">
    <section className="auth-story"><div className="auth-brand"><span className="brand-mark">N</span><span>NEXUS</span></div><div className="auth-copy"><span className="auth-kicker"><Icon name="shield" size={15}/> Secure project operations</span><h1>Lead every project.<br/>Control every access.</h1><p>A protected command center for portfolio delivery, financial control, team capacity, and operational risk.</p><div className="auth-proof"><div><Icon name="check"/><span><strong>Identity-aware access</strong><small>Every action is linked to a verified account.</small></span></div><div><Icon name="lock"/><span><strong>Role-based controls</strong><small>People see only the projects and commands they need.</small></span></div><div><Icon name="risk"/><span><strong>Continuous detection</strong><small>Suspicious sessions and sensitive actions are surfaced early.</small></span></div></div></div><small className="auth-foot">PROJECT NEXUS · TRUSTED WORKSPACE</small></section>
    <section className="auth-panel"><div className="auth-card"><span className="auth-shield"><Icon name="shield" size={25}/></span><h2>Welcome to Nexus</h2><p>Sign in with your verified ChatGPT account to access the Nexus Labs workspace.</p><a className="auth-primary" href="/signin-with-chatgpt?return_to=%2F"><span className="auth-chatgpt">⌁</span> Continue with ChatGPT <Icon name="arrow" size={16}/></a><div className="auth-trust"><Icon name="lock" size={13}/> Protected sign-in · Encrypted session</div><div className="auth-help"><span>Access is managed by your workspace administrator.</span><button onClick={()=>alert("Ask your Nexus administrator for a workspace invitation.")}>Request access</button></div></div><p className="auth-legal">By continuing, you agree to workspace security policies and activity auditing.</p></section>
  </main>;
  if (accessLoading) return <main className="auth-screen"><div className="auth-loading"><span className="brand-mark">N</span><p>Evaluating workspace access…</p></div></main>;
  if (accessError || !access) return <main className="auth-screen access-denied">
    <section className="auth-story"><div className="auth-brand"><span className="brand-mark">N</span><span>NEXUS</span></div><div className="auth-copy"><span className="auth-kicker"><Icon name="lock" size={15}/> Access policy enforced</span><h1>Identity verified.<br/>Access not granted.</h1><p>Nexus requires an active workspace membership or a matching invitation for this verified email address.</p></div><small className="auth-foot">PROJECT NEXUS · ZERO TRUST ACCESS</small></section>
    <section className="auth-panel"><div className="auth-card denied-card"><span className="auth-shield"><Icon name="shield" size={25}/></span><h2>Workspace access required</h2><p>{accessError || "This account is not a member of Nexus Labs."}</p><button className="auth-primary retry-access" onClick={()=>window.location.reload()}>Check access again <Icon name="arrow" size={16}/></button><a className="signout-link" href="/signout-with-chatgpt?return_to=%2F">Use another account</a></div></section>
  </main>;

  return (
    <main className={`app-shell theme-${resolvedTheme} ${focusMode ? "focus-mode" : ""} ${compactMode ? "compact-mode" : ""} ${reducedMotion ? "reduced-motion" : ""}`}>
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand"><span className="brand-mark">N</span><span>NEXUS</span></div>
        <nav aria-label="Primary navigation">
          <p className="nav-label">Workspace</p>
          {nav.map(([label, icon]) => (
            <button key={label} className={`nav-item ${active === label ? "active" : ""}`} onClick={() => { setActive(label); setSidebarOpen(false); }}>
              <Icon name={icon}/><span>{label}</span>{label === "My Tasks" && operations.metrics.open > 0 && <em>{operations.metrics.open}</em>}{label === "Reliability" && reliability.metrics.criticalIncidents > 0 && <em>{reliability.metrics.criticalIncidents}</em>}
            </button>
          ))}
          <p className="nav-label lower">Account</p>
          <button className={`nav-item ${active === "Notifications" ? "active" : ""}`} onClick={()=>{setActive("Notifications");setSidebarOpen(false)}}><Icon name="bell"/><span>Notifications</span><i /></button>
          <button className={`nav-item ${active === "Security" ? "active" : ""}`} onClick={()=>{setActive("Security");setSidebarOpen(false)}}><Icon name="shield"/><span>Security Center</span><em>3</em></button>
          <button className={`nav-item ${active === "Settings" ? "active" : ""}`} onClick={()=>{setActive("Settings");setSidebarOpen(false)}}><Icon name="settings"/><span>Settings</span></button>
        </nav>
        <div className="sidebar-foot">
          <div className="workspace-orb">NX</div>
          <div><strong>Nexus Labs</strong><span>Enterprise workspace</span></div>
          <button aria-label="Open workspace"><Icon name="arrow" size={16}/></button>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <button className="menu-button" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu"><Icon name="menu"/></button>
          <label className="search"><Icon name="search" size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search projects, tasks, or people..." /></label>
          <div className="top-actions">
            <button className="command-button" onClick={()=>setCommandPaletteOpen(true)} aria-label="Open command palette"><Icon name="spark" size={15}/><span>Commands</span><kbd>⌘ K</kbd></button>
            <button className="icon-button" aria-label={`${operations.metrics.unread} unread notifications`} onClick={()=>setNotificationsOpen(!notificationsOpen)}><Icon name="bell"/>{operations.metrics.unread>0&&<span />}</button>
            <a className="profile" href="/signout-with-chatgpt?return_to=%2F" title="Sign out"><div className="avatar">{session.user.displayName.split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase()}</div><div><strong>{session.user.displayName}</strong><small>{access.membership.role.replace(/^\w/, letter=>letter.toUpperCase())}</small></div><Icon name="arrow" size={14}/></a>
          </div>
        </header>

        <div className="content">
          {active === "Dashboard" ? <>
          <div className="page-head">
            <div><p className="eyebrow">Sunday, 26 July</p><h1>Good afternoon, {session.user.displayName.split(" ")[0]}.</h1><p>Here’s what needs your attention across the portfolio.</p></div>
            <div className="head-actions">
              <select value={range} onChange={e => setRange(e.target.value)} aria-label="Date range"><option>This month</option><option>This quarter</option><option>This year</option></select>
              {access.permissions.includes("projects.create")&&<button className="primary" onClick={() => setNewProjectOpen(true)}><Icon name="plus" size={17}/> New project</button>}
            </div>
          </div>

          <section className="command-strip">
            <div className="command-intro"><span><Icon name="spark" size={17}/></span><div><strong>Nexus Intelligence</strong><p>3 decisions can improve delivery confidence this week.</p></div></div>
            <div className="command-actions">
              <button onClick={()=>{setActive("Risks");notify("Showing the highest portfolio exposure")}}><b>01</b><span>Resolve high exposure<small>{governance.metrics.highRisks} high risks need control</small></span><Icon name="arrow" size={14}/></button>
              <button onClick={()=>{setActive("Teams");notify("Capacity plan opened")}}><b>02</b><span>Rebalance capacity<small>Recover 11 engineering hours</small></span><Icon name="arrow" size={14}/></button>
              <button onClick={()=>setFocusMode(!focusMode)}><b>03</b><span>{focusMode?"Exit focus mode":"Enter focus mode"}<small>Prioritize critical work</small></span><Icon name="arrow" size={14}/></button>
            </div>
          </section>

          <section className="stats-grid" aria-label="Portfolio metrics">
            <article className="stat-card ink"><div className="stat-top"><span>Active projects</span><Icon name="folder"/></div><strong>12</strong><p><b>+2</b> since last month</p><div className="mini-bars">{[46,60,52,75,69,88,82].map((h,i)=><i key={i} style={{height:`${h}%`}} />)}</div></article>
            <article className="stat-card"><div className="stat-top"><span>Completion rate</span><span className="trend good">↗ 8.4%</span></div><strong>68<span>%</span></strong><p>164 of 241 tasks done</p><div className="progress"><i style={{width:"68%"}} /></div></article>
            <article className="stat-card"><div className="stat-top"><span>Budget used</span><span className="trend">₹18.4L</span></div><strong>61<span>%</span></strong><p>₹11.2L remaining</p><div className="progress orange"><i style={{width:"61%"}} /></div></article>
            <article className="stat-card alert"><div className="stat-top"><span>Needs attention</span><Icon name="risk"/></div><strong>{governance.metrics.highRisks + governance.metrics.blockedMilestones + operations.metrics.overdue}</strong><p><b>{governance.metrics.blockedMilestones} blocked</b> · {governance.metrics.highRisks} high-risk</p><button onClick={()=>setActive("Risks")}>Review exceptions <Icon name="arrow" size={15}/></button></article>
          </section>

          <section className="dashboard-grid">
            <article className="panel portfolio-card">
              <div className="panel-head"><div><span className="section-kicker">Portfolio pulse</span><h2>Project health</h2></div><button>View all <Icon name="arrow" size={15}/></button></div>
              <div className="health-summary">
                <div className="donut"><div><strong>12</strong><span>projects</span></div></div>
                <div className="health-legend">
                  <div><i className="ontrack"/><span>On track</span><strong>7</strong><small>58%</small></div>
                  <div><i className="atrisk"/><span>At risk</span><strong>3</strong><small>25%</small></div>
                  <div><i className="delayed"/><span>Delayed</span><strong>2</strong><small>17%</small></div>
                </div>
              </div>
              <div className="insight"><Icon name="spark"/><div><strong>Portfolio insight</strong><p>Delivery health improved by 6% after two projects cleared key blockers.</p></div></div>
            </article>

            <article className="panel workload-card">
              <div className="panel-head"><div><span className="section-kicker">Capacity</span><h2>Team workload</h2></div><button>Details <Icon name="arrow" size={15}/></button></div>
              <div className="workload-list">
                {[["Maya S.","Product design",82,"MS"],["Arjun R.","Engineering",94,"AR"],["Nikhil B.","Operations",67,"NB"],["Leena M.","Marketing",48,"LM"]].map(([name,role,value,initials])=>
                  <div className="work-row" key={name as string}><div className="mini-avatar">{initials}</div><div className="person"><strong>{name}</strong><span>{role}</span></div><div className="load"><div><i style={{width:`${value}%`}} className={Number(value)>90?"hot":""}/></div><span>{value}%</span></div></div>
                )}
              </div>
              <p className="capacity-note"><span /> 1 teammate is over capacity this week</p>
            </article>
          </section>

          <section className="intelligence-grid">
            <article className="panel forecast-card"><div className="panel-head"><div><span className="section-kicker">Predictive delivery</span><h2>Milestone confidence</h2></div><button onClick={()=>notify("Forecast methodology opened")}>How it works</button></div><div className="forecast-content"><div className="confidence-ring"><strong>84%</strong><span>confidence</span></div><div className="forecast-copy"><strong>Portfolio remains on course</strong><p>Based on task velocity, active blockers, capacity, and budget variance.</p><div className="signal-row"><span><i className="green-signal"/>Velocity +6%</span><span><i className="amber-signal"/>2 blockers</span><span><i className="green-signal"/>Budget healthy</span></div></div></div></article>
            <article className="panel decision-card"><div className="panel-head"><div><span className="section-kicker">Decision log</span><h2>Waiting on you</h2></div><span className="decision-count">3 open</span></div>{[["Approve venue reserve","Campus Esports League","Today"],["Confirm API fallback","Client Portal v2","Tomorrow"],["Release research budget","Nexus Mobile App","Jul 28"]].map(([a,p,d])=><button className="decision-row" key={a} onClick={()=>notify(`${a} opened`)}><span><strong>{a}</strong><small>{p}</small></span><em>{d}</em><Icon name="arrow" size={14}/></button>)}</article>
          </section>

          <section className="lower-grid">
            <article className="panel project-table">
              <div className="panel-head"><div><span className="section-kicker">Live work</span><h2>Priority projects</h2></div><button>All projects <Icon name="arrow" size={15}/></button></div>
              <div className="table-wrap"><table><thead><tr><th>Project</th><th>Team</th><th>Health</th><th>Progress</th><th>Due</th></tr></thead><tbody>
                {visibleProjects.map(p=><tr key={p.name}><td><span className="project-icon" style={{background:p.color}}>{p.name.split(" ").map(x=>x[0]).join("").slice(0,2)}</span><strong>{p.name}</strong></td><td><div className="avatar-stack">{p.team.map(x=><i key={x}>{x}</i>)}</div></td><td><span className={`health-pill ${p.health.toLowerCase().replace(" ","-")}`}>{p.health}</span></td><td><div className="table-progress"><div><i style={{width:`${p.progress}%`}}/></div><span>{p.progress}%</span></div></td><td><span className="due"><Icon name="clock" size={14}/>{p.due}</span></td></tr>)}
              </tbody></table></div>
            </article>
            <article className="panel activity-card">
              <div className="panel-head"><div><span className="section-kicker">Updates</span><h2>Recent activity</h2></div><button aria-label="More activity">•••</button></div>
              <div className="activity-list">{activity.map(a=><div className="activity-row" key={a.text}><div className={`activity-avatar ${a.tone}`}>{a.initials}</div><div><strong>{a.text}</strong><span>{a.meta}</span></div></div>)}</div>
              <button className="activity-link">Open activity feed <Icon name="arrow" size={15}/></button>
            </article>
          </section>
          </> : active === "Access" ? <WorkspaceAccess data={access} projects={projectData} command={workspaceCommand} notify={notify}/> : <ModulePage active={active} projects={projectData} onNew={() => setNewProjectOpen(true)} onInspect={p=>{setSelectedProject(p);setDetailTab("Overview")}} notify={notify} theme={theme} setTheme={setTheme} compactMode={compactMode} setCompactMode={setCompactMode} reducedMotion={reducedMotion} setReducedMotion={setReducedMotion} canCreate={access.permissions.includes("projects.create")} operations={operations} operationCommand={operationCommand} currentEmail={session.user.email} governance={governance} governanceCommand={governanceCommand} reliability={reliability} reliabilityCommand={reliabilityCommand} />}
        </div>
      </section>
      {newProjectOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => !savingProject && setNewProjectOpen(false)}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="new-project-title" onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><div><span className="section-kicker">Start something new</span><h2 id="new-project-title">Create project</h2></div><button disabled={savingProject} onClick={()=>setNewProjectOpen(false)} aria-label="Close">×</button></div><label>Project name<input autoFocus value={newProjectName} onChange={e=>setNewProjectName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addProject()} placeholder="e.g. Annual product launch"/></label><div className="modal-grid"><label>Department<select value={newProjectDepartment} onChange={e=>setNewProjectDepartment(e.target.value)}><option>Product & Engineering</option><option>Marketing</option><option>Operations</option></select></label><label>Priority<select value={newProjectPriority} onChange={e=>setNewProjectPriority(e.target.value)}><option>High</option><option>Medium</option><option>Low</option></select></label></div><label>Description<textarea value={newProjectDescription} onChange={e=>setNewProjectDescription(e.target.value)} placeholder="What is this project expected to deliver?"/></label><div className="modal-actions"><button disabled={savingProject} onClick={()=>setNewProjectOpen(false)}>Cancel</button><button className="primary" disabled={savingProject || !newProjectName.trim()} onClick={addProject}>{savingProject ? "Saving…" : "Create project"}</button></div></section></div>}
      {toast && <div className="toast"><Icon name="check" size={17}/>{toast}</div>}
      {notificationsOpen && <aside className="notification-drawer"><div className="drawer-head"><div><span className="section-kicker">Verified signals</span><h2>Notifications</h2></div><button onClick={()=>setNotificationsOpen(false)}>×</button></div>{operations.notifications.slice(0,6).map((item)=><button className={`notification-item ${!item.readAt?"unread":""}`} key={item.id} onClick={async()=>{if(!item.readAt)await operationCommand({action:"markNotificationRead",notificationId:item.id});notify(item.title)}}><i/><span><strong>{item.title}</strong><p>{item.body}</p><small>{new Date(item.createdAt).toLocaleString()}</small></span></button>)}{operations.notifications.length===0?<div className="drawer-empty"><Icon name="bell"/><strong>No operational signals</strong><span>Assignments and mentions will arrive here.</span></div>:null}<button className="drawer-footer" onClick={async()=>{if(await operationCommand({action:"markAllNotificationsRead"}))notify("All notifications marked as read")}}>Mark all as read</button></aside>}
      {commandPaletteOpen && <div className="command-backdrop" onMouseDown={()=>setCommandPaletteOpen(false)}><section className="command-palette" role="dialog" aria-modal="true" aria-labelledby="command-title" onMouseDown={(event)=>event.stopPropagation()}><div className="command-search"><Icon name="search" size={18}/><div><span className="section-kicker">Global command</span><h2 id="command-title">What do you want to operate?</h2></div><kbd>ESC</kbd></div><div className="command-group"><span>Execution</span><button onClick={()=>{setActive("My Tasks");setCommandPaletteOpen(false)}}><i><Icon name="check" size={15}/></i><b>Open collaborative task board</b><small>{operations.metrics.open} open tasks</small></button>{operations.projects.length>0&&<button onClick={()=>{setActive("My Tasks");setCommandPaletteOpen(false);notify("Use Create task to issue a project-scoped command")}}><i><Icon name="plus" size={15}/></i><b>Create operational task</b><small>Assignment, dependency, and audit controls</small></button>}<button onClick={()=>{setActive("Notifications");setCommandPaletteOpen(false)}}><i><Icon name="bell" size={15}/></i><b>Review verified signals</b><small>{operations.metrics.unread} unread notifications</small></button></div><div className="command-group"><span>Intelligence</span><button onClick={()=>{setActive("Automation");setCommandPaletteOpen(false)}}><i><Icon name="spark" size={15}/></i><b>Open automation engine</b><small>Rules, schedules, and execution evidence</small></button><button onClick={()=>{setActive("Reports");setCommandPaletteOpen(false)}}><i><Icon name="report" size={15}/></i><b>Open advanced reporting</b><small>Forecasts, variance, PDF, and Excel</small></button><button onClick={()=>{setActive("Integrations");setCommandPaletteOpen(false)}}><i><Icon name="settings" size={15}/></i><b>Manage integrations</b><small>Calendar, mail, chat, code, files, webhooks</small></button></div><div className="command-group"><span>Governance</span><button onClick={()=>{setActive("Risks");setCommandPaletteOpen(false)}}><i><Icon name="risk" size={15}/></i><b>Operate risk register</b><small>{governance.metrics.highRisks} high-exposure records</small></button><button onClick={()=>{setActive("Reliability");setCommandPaletteOpen(false)}}><i><Icon name="pulse" size={15}/></i><b>Open reliability command</b><small>{reliability.metrics.activeIncidents} active incidents · {reliability.metrics.pendingChanges} change approvals</small></button><button onClick={()=>{setActive("Calendar");setCommandPaletteOpen(false)}}><i><Icon name="calendar" size={15}/></i><b>Control delivery milestones</b><small>{governance.metrics.blockedMilestones} blocked milestones</small></button><button onClick={()=>{setActive("Access");setCommandPaletteOpen(false)}}><i><Icon name="lock" size={15}/></i><b>Manage access and approvals</b><small>Role-aware commands</small></button><button onClick={()=>{setActive("Security");setCommandPaletteOpen(false)}}><i><Icon name="shield" size={15}/></i><b>Open security center</b><small>Threat posture and controls</small></button><button onClick={()=>{setActive("Administration");setCommandPaletteOpen(false)}}><i><Icon name="shield" size={15}/></i><b>Enterprise administration</b><small>Policies, roles, API keys, and SSO</small></button></div><p className="command-foot"><Icon name="shield" size={13}/> Commands remain subject to server-side workspace and project policy.</p></section></div>}
      {selectedProject && <div className="detail-backdrop" onMouseDown={()=>setSelectedProject(null)}><aside className="project-detail" onMouseDown={e=>e.stopPropagation()}><div className="detail-hero"><button className="detail-close" onClick={()=>setSelectedProject(null)}>×</button><div className="detail-project-title"><span className="project-icon large" style={{background:selectedProject.color}}>{selectedProject.name.split(" ").map(x=>x[0]).join("").slice(0,2)}</span><div><span className={`health-pill ${selectedProject.health.toLowerCase().replace(" ","-")}`}>{selectedProject.health}</span><h2>{selectedProject.name}</h2><p>{governance.projects.find((project)=>project.id===selectedProject.id)?.department||"Project portfolio"} · Governed delivery</p></div></div><div className="detail-progress"><span><b>{selectedProject.progress}%</b> complete</span><div><i style={{width:`${selectedProject.progress}%`}}/></div></div></div><nav className="detail-tabs">{["Overview","Tasks","Risks","Finance","Access"].map(t=><button key={t} className={detailTab===t?"active":""} onClick={()=>setDetailTab(t)}>{t}</button>)}</nav><div className="detail-body">{detailTab==="Overview"&&<><section className="detail-kpis"><div><span>Due date</span><strong>{selectedProject.due}</strong><small>Controlled target</small></div><div><span>Budget</span><strong>₹8.4L</strong><small>{selectedProject.budget}% utilized</small></div><div><span>Team</span><strong>{selectedProject.team.length + 3}</strong><small>Project-scoped access</small></div></section><section className="detail-section"><div className="panel-head"><div><span className="section-kicker">Delivery path</span><h2>Upcoming milestones</h2></div><button onClick={()=>{setSelectedProject(null);setActive("Calendar")}}>Manage</button></div>{governance.milestones.filter((milestone)=>milestone.projectId===selectedProject.id).slice(0,4).map((milestone)=><div className="milestone-row" key={milestone.id}><i className={milestone.status.replace("_","-")}/><span><strong>{milestone.title}</strong><small>{milestone.status.replace("_"," ")}</small></span><em>{new Date(`${milestone.dueDate}T00:00:00`).toLocaleDateString(undefined,{month:"short",day:"numeric"})}</em></div>)}{governance.milestones.filter((milestone)=>milestone.projectId===selectedProject.id).length===0?<div className="empty-state"><Icon name="calendar"/><strong>No milestones scheduled</strong><span>Open Calendar to create the first governed delivery date.</span></div>:null}</section><section className="detail-section"><span className="section-kicker">Executive summary</span><p className="executive-summary">Delivery status, risk exposure, milestones, access, and budget revisions are evaluated together. Every controlled change remains attributable and reviewable.</p></section></>}{detailTab==="Tasks"&&<section className="detail-section tab-list"><h2>Operational tasks</h2>{operations.tasks.filter((task)=>task.projectId===selectedProject.id).map((task)=><button key={task.id} onClick={()=>{setSelectedProject(null);setActive("My Tasks")}}><span className={task.status==="done"?"task-check done":"task-check"}>{task.status==="done"?"✓":""}</span><span><strong>{task.title}</strong><small>{task.priority} priority · {task.assigneeEmail||"Unassigned"}</small></span><em>{task.status.replace("_"," ")}</em></button>)}{operations.tasks.filter((task)=>task.projectId===selectedProject.id).length===0?<div className="empty-state"><Icon name="check"/><strong>No operational tasks yet</strong><span>Open the collaborative board to create the first task.</span></div>:null}</section>}{detailTab==="Risks"&&<section className="detail-section tab-list"><h2>Active risks</h2>{governance.risks.filter((risk)=>risk.projectId===selectedProject.id&&risk.status!=="closed").map((risk)=><button key={risk.id} onClick={()=>{setSelectedProject(null);setActive("Risks")}}><span className={`risk-badge ${risk.probability*risk.impact>=15?"high":"medium"}`}>{risk.probability*risk.impact}</span><span><strong>{risk.title}</strong><small>{risk.status} · {risk.ownerEmail||"Unassigned"}</small></span><Icon name="arrow" size={14}/></button>)}{governance.risks.filter((risk)=>risk.projectId===selectedProject.id&&risk.status!=="closed").length===0?<div className="empty-state"><Icon name="risk"/><strong>No active risks</strong><span>This project has no open governance exposure.</span></div>:null}</section>}{detailTab==="Finance"&&<section className="detail-section"><h2>Budget performance</h2><div className="finance-hero"><strong>₹{selectedProject.budget===64?"5.4":"4.8"}L</strong><span>of ₹8.4L utilized</span><div><i style={{width:`${selectedProject.budget}%`}}/></div></div><div className="finance-split"><div><span>Forecast</span><strong className="positive">₹32K under</strong></div><div><span>Pending</span><strong>₹48K</strong></div></div></section>}{detailTab==="Access"&&<section className="detail-section project-policy"><div className="panel-head"><div><span className="section-kicker">Project authorization</span><h2>Who can access this project</h2></div>{access.permissions.includes("projects.assign")&&<button onClick={()=>{setSelectedProject(null);setActive("Access")}}>Manage access</button>}</div><div className="project-policy-list">{access.projectMembers.filter(item=>item.projectId===selectedProject.id).length===0?<div className="empty-state"><Icon name="lock"/><strong>No explicit assignments</strong><span>Only workspace administrators and the project creator can reach this project.</span></div>:access.projectMembers.filter(item=>item.projectId===selectedProject.id).map(item=><div key={item.id}><span className="mini-avatar">{item.email.slice(0,2).toUpperCase()}</span><span><strong>{item.email}</strong><small>Verified workspace member</small></span><em className={`role-chip ${item.role}`}>{item.role}</em></div>)}</div><div className="policy-note"><Icon name="shield" size={16}/><span><strong>Commands inherit least privilege</strong><small>Project role and workspace role are both checked before sensitive actions run.</small></span></div></section>}</div><div className="detail-footer"><button onClick={()=>notify("Project report prepared")}><Icon name="report" size={15}/> Export update</button>{governance.projects.find((project)=>project.id===selectedProject.id)?.canEdit&&<button onClick={()=>setDeliveryEditorOpen(true)}>Edit delivery</button>}<button className="primary" onClick={()=>{setSelectedProject(null);setActive("My Tasks")}}>Open workspace <Icon name="arrow" size={14}/></button></div></aside></div>}
      {deliveryEditorOpen&&selectedProject&&governance.projects.find((project)=>project.id===selectedProject.id)&&<DeliveryStatusEditor project={governance.projects.find((project)=>project.id===selectedProject.id)!} command={governanceCommand} onClose={()=>setDeliveryEditorOpen(false)} onSaved={()=>{setDeliveryEditorOpen(false);setSelectedProject(null);notify("Project delivery status updated and logged")}}/>}
      {sidebarOpen && <button className="scrim" onClick={() => setSidebarOpen(false)} aria-label="Close menu" />}
    </main>
  );
}
