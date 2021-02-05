import { Octokit } from "@octokit/rest";
import * as config from "./config";

let _gh: Octokit | undefined = undefined;

function gh(): Octokit {
  if (_gh === undefined) {
    _gh = new Octokit({
      auth: config.get("github", "token"),
    });
  }

  return _gh;
}

export async function getRepo(owner: string, repo: string) {
  const res = await gh().repos.get({
    owner,
    repo
  });

  return res.data;
}

export async function getDefaultBranch(
  owner: string,
  repo: string
): Promise<string> {
  const res = await gh().repos.get({
    owner,
    repo
  });

  return res.data.default_branch;
}

export async function getFileContent(
  owner: string,
  repo: string,
  branch: string,
  path: string
): Promise<string> {
  const res = await gh().repos.getContent({
    owner,
    repo,
    path,
    ref: branch,
  });

  if (Array.isArray(res.data)) {
    throw new Error(
      `Can't get content of a directory: ${JSON.stringify(res.data)}`
    );
  }

  if (res.data.type !== "file") {
    throw new Error(
      `Invalid type ${res.data.type}: ${JSON.stringify(res.data)}`
    );
  }

  // See: https://github.com/octokit/rest.js/issues/1971
  const buffer = Buffer.from(
    (res.data as any).content,
    (res.data as any).encoding
  );
  return buffer.toString("utf-8");
}
