# Kong trusted-proxy requirement for Codestra lead intake

The lead route uses `limit_by: ip`. Kong must recover the original browser IP only from the authoritative Caddy private address. Without this configuration, every visitor may be counted as the Caddy proxy; with an overly broad trusted range, an attacker may spoof `X-Forwarded-For`.

## Required Kong data-plane settings

Set these through the authoritative Kong deployment configuration, not through the public website repository alone:

```ini
trusted_ips = <exact Caddy private IP or tightly scoped private CIDR>
real_ip_header = X-Forwarded-For
real_ip_recursive = on
```

Do not use `0.0.0.0/0`, `::/0`, or a broad network that contains untrusted workloads. The Kong proxy listener for this route must remain private and reachable only from the approved Caddy edge and required operators/health checks.

Caddy automatically appends the connected client address to `X-Forwarded-For` when proxying. Kong should accept that chain only because the immediate peer is the allowlisted Caddy address.

## Validation before activation

1. Confirm a direct request to the private Kong listener from an untrusted host is denied by the network/firewall.
2. Send two canary requests through Caddy from one client and verify the rate-limit counters identify that client, not the Caddy address.
3. Send a canary from a second client and verify it receives an independent counter.
4. Attempt to supply a forged `X-Forwarded-For` through an untrusted path and verify Kong ignores it.
5. Confirm `X-Correlation-ID` is preserved independently of the client-IP value.
6. If multiple Kong data planes serve the route, replace `policy: local` with the approved shared/distributed rate-limit policy before production traffic.

Record the exact trusted IP/CIDR, Kong configuration revision, firewall evidence, and canary results in the production change ticket.
