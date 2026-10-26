// Optional workaround for networks that block DNS SRV/TXT queries.
async function resolveMongoUri(uri, { fetchDns = fetch } = {}) {
  if (!uri.startsWith("mongodb+srv://")) return uri;
  const parsed = new URL(uri);
  const hostname = parsed.hostname;
  async function query(name, type) {
    const url = new URL("https://dns.google/resolve");
    url.searchParams.set("name", name);
    url.searchParams.set("type", type);
    const response = await fetchDns(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`MongoDB DNS HTTPS: HTTP ${response.status}`);
    const result = await response.json();
    if (result.Status !== 0) throw new Error(`MongoDB DNS HTTPS: DNS status ${result.Status}`);
    return result.Answer || [];
  }
  const [srv, txt] = await Promise.all([
    query(`_mongodb._tcp.${hostname}`, "SRV"), query(hostname, "TXT")
  ]);
  const parentDomain = hostname.slice(hostname.indexOf(".") + 1);
  const hosts = srv.filter(record => record.type === 33).map(record => {
    const [priority, weight, port, target] = record.data.trim().split(/\s+/);
    const host = target?.replace(/\.$/, "");
    if (!host?.endsWith(`.${parentDomain}`) || !/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535) {
      throw new Error("MongoDB DNS HTTPS: invalid SRV target");
    }
    return `${host}:${port}`;
  });
  if (!hosts.length) throw new Error("MongoDB DNS HTTPS: no SRV hosts found");
  const options = new URLSearchParams();
  for (const record of txt.filter(record => record.type === 16)) {
    const value = record.data.replace(/^"|"$/g, "").replace(/"\s+"/g, "");
    for (const [key, valuePart] of new URLSearchParams(value)) {
      if (!["authSource", "replicaSet", "loadBalanced"].includes(key)) {
        throw new Error("MongoDB DNS HTTPS: unsupported TXT option");
      }
      options.set(key, valuePart);
    }
  }
  options.set("tls", "true");
  for (const [key, value] of parsed.searchParams) options.set(key, value);
  if (options.has("srvMaxHosts") || options.has("srvServiceName")) {
    throw new Error("MongoDB DNS HTTPS does not support srvMaxHosts or srvServiceName");
  }
  const credentials = parsed.username ? `${parsed.username}${parsed.password ? `:${parsed.password}` : ""}@` : "";
  return `mongodb://${credentials}${hosts.join(",")}${parsed.pathname || "/"}?${options}`;
}

module.exports = { resolveMongoUri };
