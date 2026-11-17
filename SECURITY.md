# Security policy

## Supported versions

The latest minor release receives security fixes. This is a client-side UI library; it does not
store or transmit documents by itself.

## Reporting a vulnerability

Please do not open a public issue for a security problem. Email **marcel@heers.it** with:

- the affected version,
- a description of the issue and its impact,
- a minimal reproduction if possible.

You can expect an acknowledgement within a few days. Once a fix is available, the issue will be
disclosed in the changelog with credit unless you prefer to remain anonymous.

## Scope

Relevant reports include unsafe HTML injection, unintended network requests, signature or document
data leaking outside the browser, and dependency vulnerabilities that affect the published build.
