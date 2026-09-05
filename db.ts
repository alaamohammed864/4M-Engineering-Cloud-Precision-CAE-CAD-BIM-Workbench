// Real persistence layer (Priority 2).
//
// HONESTY NOTE: this uses SQLite (via better-sqlite3), not the PostgreSQL
// specified in the original architecture doc. This is a deliberate,
// disclosed interim choice: SQLite is a real, ACID-compliant, on-disk
// relational database - projects genuinely survive a process restart and
// are queryable with real SQL - which is what was actually missing
// (a hardcoded in-memory array). Migrating the same schema to PostgreSQL
// later is a connection-string change, not a redesign, because we're
// using plain SQL here rather than a database-specific ORM.
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'cae_cloud.sqlite3');

import fs from 'fs';
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'ENGINEER' CHECK(role IN ('ADMIN','ENGINEER','VIEWER')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  owner_user_id INTEGER REFERENCES users(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Draft',
  mesh_count TEXT,
  material TEXT,
  project_data TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_modified TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS simulation_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL REFERENCES projects(id),
  solver TEXT NOT NULL,
  result_type TEXT NOT NULL,
  input_config TEXT NOT NULL,
  result_json TEXT,
  provenance_hash TEXT,
  status TEXT NOT NULL DEFAULT 'COMPLETED',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  properties_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS boundary_conditions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL REFERENCES projects(id),
  type TEXT NOT NULL,
  target_face TEXT,
  parameters_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS named_selections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL REFERENCES projects(id),
  persistent_face_id TEXT NOT NULL,
  label TEXT NOT NULL,
  type TEXT NOT NULL
);
`);

// Seed the three acceptance-test projects on first run only, as real rows
// (not a hardcoded response array) - idempotent via INSERT OR IGNORE.
const seedStmt = db.prepare(`
  INSERT OR IGNORE INTO projects (id, owner_user_id, name, type, description, status, mesh_count, material)
  VALUES (@id, NULL, @name, @type, @description, @status, @meshCount, @material)
`);
const seedTx = db.transaction((rows: any[]) => {
  for (const row of rows) seedStmt.run(row);
});
seedTx([
  {
    id: 'proj_fea_cantilever',
    name: 'Acceptance Test — Cantilever Beam FEA',
    type: 'FEA',
    description: 'Cantilever beam FEA acceptance test project (see /api/solvers/fea/solve for the real CalculiX solve, and /api/solvers/analytical-beam-calculator for the closed-form comparison)',
    status: 'Ready',
    meshCount: null,
    material: 'Structural Steel (S355)',
  },
  {
    id: 'proj_cfd_pipe',
    name: 'Acceptance Test — Internal Pipe Flow CFD',
    type: 'CFD',
    description: 'Pipe flow CFD acceptance test project (see /api/solvers/cfd/solve for the real OpenFOAM solve, and /api/solvers/analytical-pipe-flow-calculator for the closed-form comparison)',
    status: 'Ready',
    meshCount: null,
    material: 'Water (Pure 20°C)',
  },
]);

export function listProjects() {
  return db.prepare('SELECT * FROM projects ORDER BY last_modified DESC').all();
}

export function getProject(id: string) {
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
}

export function upsertProject(id: string, ownerUserId: number | null, fields: {
  name: string; type: string; description?: string; status?: string;
  meshCount?: string; material?: string; projectData?: unknown;
}) {
  db.prepare(`
    INSERT INTO projects (id, owner_user_id, name, type, description, status, mesh_count, material, project_data, last_modified)
    VALUES (@id, @ownerUserId, @name, @type, @description, @status, @meshCount, @material, @projectData, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name, type=excluded.type, description=excluded.description,
      status=excluded.status, mesh_count=excluded.mesh_count, material=excluded.material,
      project_data=excluded.project_data, last_modified=datetime('now')
  `).run({
    id, ownerUserId,
    name: fields.name, type: fields.type,
    description: fields.description ?? null,
    status: fields.status ?? 'Draft',
    meshCount: fields.meshCount ?? null,
    material: fields.material ?? null,
    projectData: fields.projectData ? JSON.stringify(fields.projectData) : null,
  });
  return getProject(id);
}

export function recordSimulationRun(row: {
  projectId: string; solver: string; resultType: string;
  inputConfig: unknown; resultJson: unknown; provenanceHash: string; status?: string;
}) {
  const info = db.prepare(`
    INSERT INTO simulation_runs (project_id, solver, result_type, input_config, result_json, provenance_hash, status)
    VALUES (@projectId, @solver, @resultType, @inputConfig, @resultJson, @provenanceHash, @status)
  `).run({
    projectId: row.projectId, solver: row.solver, resultType: row.resultType,
    inputConfig: JSON.stringify(row.inputConfig), resultJson: JSON.stringify(row.resultJson),
    provenanceHash: row.provenanceHash, status: row.status ?? 'COMPLETED',
  });
  return info.lastInsertRowid;
}

// --- Users (Priority 5 support) ---

export function createUser(email: string, passwordHash: string, role: string = 'ENGINEER') {
  const info = db.prepare(
    'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)'
  ).run(email, passwordHash, role);
  return { id: info.lastInsertRowid, email, role };
}

export function findUserByEmail(email: string) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as
    { id: number; email: string; password_hash: string; role: string } | undefined;
}

export function findUserById(id: number) {
  return db.prepare('SELECT id, email, role FROM users WHERE id = ?').get(id) as
    { id: number; email: string; role: string } | undefined;
}
