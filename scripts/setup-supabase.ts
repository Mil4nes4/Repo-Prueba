import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    throw new Error(".env.local not found");
  }

  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...valueParts] = trimmed.split("=");
    const value = valueParts.join("=").trim();
    if (key && value) {
      process.env[key] = value;
    }
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local"
  );
}

const supabase = createClient(url, secretKey);

async function tableExists(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("tasks")
      .select("id", { head: true })
      .limit(1);

    if (error) {
      const message = error.message.toLowerCase();
      if (
        message.includes("relation") ||
        message.includes("does not exist") ||
        message.includes("could not find")
      ) {
        return false;
      }
      // Any other error (e.g. RLS) means the table exists.
      return true;
    }

    return true;
  } catch (err) {
    console.error("Unexpected error:", err);
    return false;
  }
}

async function listColumns() {
  try {
    const { data, error } = await supabase
      .schema("information_schema")
      .from("columns")
      .select("column_name, data_type")
      .eq("table_schema", "public")
      .eq("table_name", "tasks");

    if (error) {
      console.error("Could not read columns:", error.message);
      return;
    }

    console.log("Columns in tasks table:");
    for (const col of data || []) {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    }
  } catch (err) {
    console.error("Unexpected error listing columns:", err);
  }
}

async function main() {
  console.log("Checking Supabase connection...");

  const exists = await tableExists();

  if (exists) {
    console.log("✅ Table 'tasks' exists.");
    await listColumns();
  } else {
    console.log("❌ Table 'tasks' does not exist.");
    console.log("Please create it manually in the Supabase dashboard:");
    console.log("  1. Go to Table Editor");
    console.log("  2. Click 'New table'");
    console.log("  3. Name it 'tasks' and add these columns:");
    console.log(`
      id            text        Primary key
      title         text        Not null
      description   text        Nullable
      completed     boolean     Not null  Default: false
      created_at    timestamptz Not null  Default: now()
    `);
    console.log("Or run this SQL in the SQL Editor:");
    console.log(`
CREATE TABLE public.tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
    `);
    process.exit(1);
  }
}

main();
