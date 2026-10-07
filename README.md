# pace

A Claude Code mod that shows your rate limits in the status line under the prompt:

```
Session ██░░┃░░░░░ 17% → 14:20   Week ████░┃░░░░ 42% → Mon 00:00
```

- **Session**: the 5-hour window. The `┃` marks an even pace across those five hours.
- **Week**: the 7-day window. The `┃` marks an even pace across **Monday to Friday only**; weekends add nothing to the target.
- Ahead of pace when the filled bar reaches past the `┃`.

Readings come from Claude Code's own rate-limit figures, so the line shows only on a Pro or Max subscription, after the first reply of a session.

## Install

```
/plugin install pace --marketplace <owner>/<repo>
```

Answer `y` to add the marketplace, then pick a scope.

## Develop

```
claude plugin validate .
claude plugin test .
```
