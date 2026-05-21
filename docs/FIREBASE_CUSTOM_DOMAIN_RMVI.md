# RMVI Firebase Custom Domain Setup

GCOS is deployed to Firebase Hosting and Google Cloud Run.

## Current live URLs

- Firebase Hosting: `https://rmvi-gcos.web.app`
- Firebase alternate: `https://rmvi-gcos.firebaseapp.com`
- Intended production domain: `https://rmvi.org`

## Current status

Firebase Hosting has accepted `rmvi.org` as a custom domain for the `rmvi-gcos` site, but the domain is still marked `Needs setup` in Firebase.

`rmvi.org` currently resolves to:

```txt
34.111.179.208
```

That IP serves some GCOS routes, but it is not the clean Firebase Hosting target for this site. The Firebase default domain passes the full runtime smoke test, while `rmvi.org` fails the object-storage smoke route because the DNS is still reaching an older Google route.

## DNS change needed

In the domain/DNS manager for `rmvi.org`, update the apex/root domain:

```txt
Type: A
Name: @
Value: 199.36.158.100
TTL: automatic or 3600
```

Remove the old apex A record:

```txt
Type: A
Name: @
Value: 34.111.179.208
```

If `www.rmvi.org` should also work, add it in Firebase Hosting as a second custom domain, then follow the DNS value Firebase gives for that subdomain.

## Verification after DNS propagation

Run:

```bash
npm run launch:verify:firebase
```

The launch is fully verified when the report ends with:

```txt
Launch verification status: live-verified
```

## Known non-blocking follow-up

`GCOS_MANAGED_RESTORE_DRILL=0` is expected until a real managed restore drill is performed. Production readiness is currently 96% without that drill.
