import path from "node:path"

const [tag, assetsDirectory] = Bun.argv.slice(2)
const version = tag?.match(/^v((?:[2-9]|[1-9][0-9]+)\.(?:0|[1-9][0-9]*))\.(0|[1-9][0-9]*)-tr\.([1-9][0-9]{0,2})$/)
if (!version || !assetsDirectory) throw new Error("Usage: bun packages/cli/registry/build.ts v2.3.2-tr.1 <assets>")

// The ACP registry requires X.Y.Z. Reserve 1–999 for revisions within each upstream patch.
const patch = BigInt(version[2]) * 1000n + BigInt(version[3])
const repository = "https://github.com/Weekendsuperhero-io/opencode"
const download = `${repository}/releases/download/${tag}`
const icon = "opencode-trustedrouter.svg"
const platformAssets = {
  "darwin-aarch64": "darwin-arm64.tar.gz",
  "darwin-x86_64": "darwin-x64-baseline.tar.gz",
  "linux-aarch64": "linux-arm64.tar.gz",
  "linux-aarch64-musl": "linux-arm64-musl.tar.gz",
  "linux-x86_64": "linux-x64-baseline.tar.gz",
  "linux-x86_64-musl": "linux-x64-baseline-musl.tar.gz",
  "windows-aarch64": "windows-arm64.zip",
  "windows-x86_64": "windows-x64-baseline.zip",
}

const sums = new Map<string, string>()
for (const line of (await Bun.file(path.join(assetsDirectory, "SHA256SUMS")).text()).trim().split("\n")) {
  const entry = line.match(/^([a-f0-9]{64}) [ *]\.\/([^/]+)$/)
  if (!entry || sums.has(entry[2])) throw new Error(`Invalid SHA256SUMS entry: ${line}`)
  sums.set(entry[2], entry[1])
}

const binary = Object.fromEntries(
  await Promise.all(
    Object.entries(platformAssets).map(async ([platform, asset]) => {
      const file = `opencode-trustedrouter-${asset}`
      const sha256 = sums.get(file)
      if (!sha256 || !(await Bun.file(path.join(assetsDirectory, file)).exists()))
        throw new Error(`Missing archive or checksum for ${file}`)
      return [
        platform,
        {
          archive: `${download}/${file}`,
          sha256,
          cmd: asset.endsWith(".zip") ? "./opencode.exe" : "./opencode",
          args: ["acp"],
        },
      ]
    }),
  ),
)

const registry = {
  version: "1.0.0",
  agents: [
    {
      id: "opencode-trustedrouter",
      name: "OpenCode for TrustedRouter",
      version: `${version[1]}.${patch}`,
      description: "The OpenCode coding agent with TrustedRouter as its only model provider.",
      repository,
      license: "MIT",
      license_url: `${repository}/blob/${tag}/LICENSE`,
      icon: `${download}/${icon}`,
      distribution: { binary },
    },
  ],
}

await Bun.write(path.join(assetsDirectory, icon), Bun.file(path.join(import.meta.dir, "icon.svg")))
await Bun.write(path.join(assetsDirectory, "registry.json"), JSON.stringify(registry, null, 2) + "\n")
