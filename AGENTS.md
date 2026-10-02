# Repository guide

- This repository manages the `ship-contact-form-7-add-confirm` WordPress plugin fork.
- Keep the plugin folder slug and GitHub repository name aligned: `ship-contact-form-7-add-confirm`.
- Keep the plugin header version, `WPCF7C_VERSION`, `readme.txt` stable tag, changelog, Git tag, and GitHub Release version aligned.
- Use the public repository `https://github.com/ship-git-admin/ship-contact-form-7-add-confirm` for update metadata. Never commit tokens or server credentials.
- Keep the bundled `lib/plugin-update-checker/` library unmodified; update it only from an official upstream release and preserve its license.
- Ordinary front-end requests must not load the update checker or receive plugin-added no-cache headers. Confirmation AJAX steps `step1` and `step2` must retain no-cache headers.
- Before changing a connected WordPress site, present the exact diff and impact, preserve the current plugin package, and wait for explicit approval.
