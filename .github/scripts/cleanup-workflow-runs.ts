#!/usr/bin/env -S deno -q run --unstable --allow-net --allow-env

const headers = {
  Accept: "application/vnd.github.v3+json",
  Authorization: `Bearer ${Deno.env.get("GITHUB_TOKEN")}`,
};

async function getRuns() {
  const data: any = await fetch(
    "https://api.github.com/repos/bbs-io/synchronet-docker/actions/runs?per_page=100",
    {
      headers,
    }
  ).then((r) => r.json());

  console.log(`Retrieved ${data.workflow_runs.length} of ${data.total_count}`);

  let { workflow_runs: runs } = data;

  runs = runs.map((r) => ({
    url: r.url,
    updated: new Date(r.updated_at),
    conclusion: r.conclusion,
    status: r.status,
  }));

  // data = data.map((l) => l.ref.split("/").pop());

  return runs;
}

const deleteRun = (url) => fetch(url, { method: "DELETE", headers });

const now = new Date();
const expired = new Date(now);
// expired.setDate(now.getDate() - 3);
expired.setMonth(now.getMonth() - 1);

const runs = await getRuns();

const old = runs.filter((r) => r.updated < expired);

await Promise.all(old.map((r) => deleteRun(r.url)));

console.log(`Deleted ${old.length}`);
